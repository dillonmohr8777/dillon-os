extends RefCounted

## Real Philadelphia for the Grand Theft Bureaucracy engine.
##
## Drop-in alternative to `res://scripts/world_builder.gd`. The hub profile
## already selects a builder by path, so nothing else has to change:
##     hub_profile["builder"] = "res://scripts/philadelphia_world_builder.gd"
##
## It exposes the same public surface the rest of the game calls into -
## build(), landmark(), road_coords(), road_half(), world_half(), blackspots()
## and block_bounds() - so mission_director, traffic_system, minimap and hud
## keep working untouched.
##
## Where the shipped builder invents a district, this one reads one: 449 real
## building footprints at their LiDAR-measured heights, 12 sourced crown tiers
## restoring the towers the survey cannot see, and 216 real street
## centrelines, exported from the City of Philadelphia survey by
## philly-3d/tools/export_godot.py.
##
## The district is pre-rotated by Penn's 9.21 degree grid bearing on export, so
## Market and Chestnut run along X and the numbered streets along Z. That is
## what lets the untilted road constants, lane maths and window punching work
## on a real city: 94% of the exported footprints land within 5 degrees of an
## axis, median offset 0.39 degrees.
##
## Preload rather than relying on a global class name, matching district.gd:
## `godot/.godot/` is not committed, so headless validation must work without
## an editor import pass.

const CivicKit := preload("res://scripts/civic_kit.gd")

const DISTRICT_PATH := "res://data/philadelphia_district.json"
const BUILDINGS_PATH := "res://data/philadelphia_buildings.json"

# Height bands, metres. Philadelphia reads as brick below the cornice line,
# stone through the pre-war midrise, and curtain wall above it.
const ROWHOUSE_MAX := 12.0
const MIDRISE_MAX := 45.0

var kit: CivicKit
var rng := RandomNumberGenerator.new()

var _district: Dictionary = {}
var _buildings: Array = []
var _landmarks: Dictionary = {}
var _road_lines: Array = []
var _road_coords: Array[float] = []
var _building_rects: Array[Rect2] = []
var _world_half := 420.0
var _loaded := false


func _init(seed_value: int = 20260906) -> void:
	rng.seed = seed_value
	kit = CivicKit.new(seed_value)


# ---------------------------------------------------------------- loading ---

func _load() -> bool:
	if _loaded:
		return true
	var district_text := _read(DISTRICT_PATH)
	var buildings_text := _read(BUILDINGS_PATH)
	if district_text == "" or buildings_text == "":
		push_error("philadelphia_world_builder: district data missing. Run "
			+ "philly-3d/tools/export_godot.py and copy dist/godot/*.json to res://data/")
		return false

	var district = JSON.parse_string(district_text)
	var buildings = JSON.parse_string(buildings_text)
	if typeof(district) != TYPE_DICTIONARY or typeof(buildings) != TYPE_DICTIONARY:
		push_error("philadelphia_world_builder: district data did not parse as JSON objects")
		return false

	_district = district
	_buildings = buildings.get("buildings", [])
	_landmarks = _district.get("landmarks", {})
	_road_lines = _district.get("roads", [])
	_world_half = float(_district.get("world_half", 420.0))
	_road_coords = _derive_road_coords()
	_loaded = true
	return true


func _read(path: String) -> String:
	if not FileAccess.file_exists(path):
		return ""
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return ""
	var text := file.get_as_text()
	file.close()
	return text


## Road centres on the Z axis, for the systems that still expect the shipped
## district's "a few parallel roads" model. Taken from the real centrelines
## that run predominantly east-west, deduplicated to 20 m so two carriageways
## of the same street do not read as two streets.
func _derive_road_coords() -> Array[float]:
	var found: Array[float] = []
	for road in _road_lines:
		var pts: Array = road.get("points", [])
		if pts.size() < 2:
			continue
		var first: Array = pts[0]
		var last: Array = pts[pts.size() - 1]
		var dx: float = float(last[0]) - float(first[0])
		var dz: float = float(last[2]) - float(first[2])
		if absf(dx) < absf(dz):
			continue                                    # this one runs north-south
		var z := 0.0
		for p in pts:
			z += float(p[2])
		z /= float(pts.size())
		var duplicate := false
		for existing in found:
			if absf(existing - z) < 20.0:
				duplicate = true
				break
		if not duplicate:
			found.append(z)
	found.sort()
	return found


# ------------------------------------------------------------------ build ---

func build(root: Node3D) -> void:
	if not _load():
		return
	_build_terrain(root)
	_build_roads(root)
	_build_buildings(root)
	_build_landmarks(root)
	var flushed := kit.flush(root)
	print("philadelphia_world_builder: %d buildings, %d roads, %d batched instances"
		% [_buildings.size(), _road_lines.size(), flushed])


func _build_terrain(root: Node3D) -> void:
	var span := _world_half * 2.0 + 240.0
	kit.flat(root, "Ground", Vector3.ZERO, Vector3(span, 0.4, span), kit.mat("sidewalk"), true)


## Real street centrelines, laid as a ribbon per segment. Width comes from the
## city's own road class, which is what makes Broad Street read as Broad Street
## instead of one more side street.
func _build_roads(root: Node3D) -> void:
	for road in _road_lines:
		var pts: Array = road.get("points", [])
		var width := float(road.get("width", 8.0))
		for i in range(pts.size() - 1):
			var a: Array = pts[i]
			var b: Array = pts[i + 1]
			var ax := float(a[0])
			var az := float(a[2])
			var bx := float(b[0])
			var bz := float(b[2])
			var dx := bx - ax
			var dz := bz - az
			var length := sqrt(dx * dx + dz * dz)
			if length < 1.5:
				continue
			var centre := Vector3((ax + bx) * 0.5, 0.06, (az + bz) * 0.5)
			var yaw := atan2(dx, dz)
			kit.batch_box("roadway", Vector3(width, 0.12, length + width * 0.5),
				kit.mat("asphalt"), centre, yaw, false)


func _build_buildings(root: Node3D) -> void:
	_building_rects.clear()
	var index := 0
	for entry in _buildings:
		_build_one(root, entry, index)
		index += 1


func _build_one(root: Node3D, entry: Dictionary, index: int) -> void:
	var c: Array = entry.get("centre", [0.0, 0.0, 0.0])
	var s: Array = entry.get("size", [8.0, 8.0])
	var height := maxf(3.0, float(entry.get("height", 9.0)))
	var base := float(c[1])
	var yaw := float(entry.get("rot_y", 0.0))
	var is_crown: bool = bool(entry.get("crown", false))

	# A crown tier can legitimately be a 4 m mast; only real footprints get the
	# 4 m floor that keeps a collapsed survey polygon from vanishing.
	var floor_size := 1.0 if is_crown else 4.0
	var footprint := Vector2(maxf(floor_size, float(s[0])), maxf(floor_size, float(s[1])))
	var centre := Vector2(float(c[0]), float(c[2]))
	var position := Vector3(centre.x, base + height * 0.5, centre.y)

	if is_crown:
		_build_crown_tier(root, entry, centre, footprint, height, base, yaw, index)
		return

	var facade := _facade_for(height, index)
	kit.box(root, "Building", position, Vector3(footprint.x, height, footprint.y),
		kit.mat(facade), true, yaw)
	_building_rects.append(Rect2(centre - footprint * 0.5, footprint))

	var top := base + height
	kit.batch_box("parapet", Vector3(footprint.x + 0.5, 0.9, footprint.y + 0.5),
		kit.mat("concrete_dark"), Vector3(centre.x, top + 0.45, centre.y), yaw)
	if facade.begins_with("brick"):
		kit.batch_box("cornice", Vector3(footprint.x + 0.9, 0.5, footprint.y + 0.9),
			kit.mat("stone_pale"), Vector3(centre.x, top - 0.9, centre.y), yaw)
	if facade != "glass_tower" and facade != "glass_office":
		_punch_windows(centre, footprint, height, base, yaw, index)


## A crown tier: published architectural height stacked on the surveyed mass.
##
## The LiDAR survey measures the dominant roof mass, so a slender tower, spire
## or mast returns too few points to register and City Hall arrives as its
## 170 ft cornice. These rows come from philly-3d/data/philly-crowns.json and
## are drawn ABOVE the measured mass, never in place of it.
##
## Three things a tier must not inherit from the normal path: it is not a
## footprint, so it never enters _building_rects and never blocks a spawn or a
## pedestrian route at street level; its own height is small, so the height
## band would call a 24 m spire a rowhouse; and a spire with punched office
## windows looks wrong in a way a plain shaft does not.
func _build_crown_tier(root: Node3D, entry: Dictionary, centre: Vector2,
		footprint: Vector2, height: float, base: float, yaw: float, index: int) -> void:
	var solid: bool = bool(entry.get("solid", false))
	var facade := "stone_pale" if solid else _facade_for(_mass_height(entry, height), index)
	var position := Vector3(centre.x, base + height * 0.5, centre.y)
	kit.box(root, "Crown", position, Vector3(footprint.x, height, footprint.y),
		kit.mat(facade), true, yaw)
	if not solid and footprint.x > 6.0 and footprint.y > 6.0:
		_punch_windows(centre, footprint, height, base, yaw, index)


## Material for a framed crown tier comes from the building it sits on, not from
## the tier's own height: One Liberty's setback is curtain wall like the shaft
## below it, whatever its own 24 m would otherwise say.
func _mass_height(entry: Dictionary, fallback: float) -> float:
	var id: int = int(entry.get("id", -1))
	for other in _buildings:
		if int(other.get("id", -2)) == id and not bool(other.get("crown", false)):
			return float(other.get("height", fallback))
	return fallback


## Philadelphia is brick at rowhouse scale, stone through the pre-war midrise,
## and curtain wall above it. Height is the honest signal here: the survey gives
## one height per footprint and nothing about the facade, so anything more
## specific would be invention.
func _facade_for(height: float, index: int) -> String:
	if height <= ROWHOUSE_MAX:
		var brick := ["brick_red", "brick_brown", "brick_buff", "brick_red"]
		return brick[index % brick.size()]
	if height <= MIDRISE_MAX:
		return "stone_pale" if index % 3 == 0 else "stone"
	return "glass_tower" if height > 90.0 else "glass_office"


func _punch_windows(centre: Vector2, footprint: Vector2, height: float, base: float,
		yaw: float, index: int) -> void:
	var storey := 3.4
	var floors := clampi(int((height - 4.4) / storey), 1, 14)
	var window_size := Vector3(1.3, 1.85, 0.22)
	var forward := Vector2(sin(yaw), cos(yaw))
	var rightward := Vector2(cos(yaw), -sin(yaw))
	for axis in range(2):
		var span: float = footprint.x if axis == 0 else footprint.y
		var depth: float = footprint.y if axis == 0 else footprint.x
		var columns := clampi(int(span / 3.3), 1, 10)
		for side in [-1.0, 1.0]:
			for level in range(floors):
				var y := base + 4.6 + float(level) * storey
				if y > base + height - 1.3:
					continue
				for column in range(columns):
					var t := (float(column) + 0.5) / float(columns) - 0.5
					var lit := rng.randf() < 0.14
					var key := "window_lit" if lit else "window_dark"
					var along: Vector2 = rightward if axis == 0 else forward
					var out: Vector2 = forward if axis == 0 else rightward
					var offset: Vector2 = along * (t * span) + out * (side * (depth * 0.5 - 0.05))
					kit.batch_box("window_%s" % key, window_size, kit.mat(key),
						Vector3(centre.x + offset.x, y, centre.y + offset.y),
						yaw + (0.0 if axis == 0 else PI * 0.5), false)


## Every landmark is a real address. The prospect entries carry the spec
## homepage already built for that business, so a mission can open it.
func _build_landmarks(root: Node3D) -> void:
	for key in _landmarks.keys():
		var entry: Dictionary = _landmarks[key]
		var p: Array = entry.get("position", [0.0, 0.0, 0.0])
		var at := Vector3(float(p[0]), 0.0, float(p[2]))
		var label := str(entry.get("label", key))
		kit.sign_text(root, label.to_upper(), at + Vector3(0.0, 4.2, 0.0), 0.0, 0.34,
			Color("#f0e9d8"), 14.0)


# ----------------------------------------------------- public surface -------
# Matches scripts/world_builder.gd so the rest of the game does not change.

func landmark(key: String) -> Vector3:
	if not _load():
		return Vector3.ZERO
	if not _landmarks.has(key):
		return Vector3.ZERO
	var p: Array = _landmarks[key].get("position", [0.0, 0.0, 0.0])
	return Vector3(float(p[0]), float(p[1]), float(p[2]))


func landmark_keys() -> Array:
	if not _load():
		return []
	return _landmarks.keys()


## The spec homepage for a landmark, where one exists. Lets a mission reward
## open the real site built for that business.
func landmark_site(key: String) -> String:
	if not _load() or not _landmarks.has(key):
		return ""
	var site = _landmarks[key].get("site", null)
	return "" if site == null else str(site)


func road_coords() -> Array:
	if not _load():
		return []
	return _road_coords


func road_half() -> float:
	return 9.0


func world_half() -> float:
	if not _load():
		return 420.0
	return _world_half


func blackspots() -> Array:
	if not _load():
		return []
	return _building_rects


func block_bounds(x_index: int, z_index: int) -> Rect2:
	if not _load():
		return Rect2()
	var step := _world_half * 0.5
	return Rect2(Vector2(float(x_index) * step - step * 0.5,
		float(z_index) * step - step * 0.5), Vector2(step, step))


func building_rects() -> Array[Rect2]:
	return _building_rects


func spawn_point() -> Vector3:
	if not _load():
		return Vector3.ZERO
	var p: Array = _district.get("spawn", [0.0, 0.0, 0.0])
	return Vector3(float(p[0]), float(p[1]), float(p[2]))
