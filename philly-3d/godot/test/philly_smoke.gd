extends SceneTree

## Headless smoke test for the Philadelphia world builder.
##
## The Node suite in ../test checks the exported JSON and greps the GDScript for
## helpers that exist. Neither of those executes anything. This does: it builds
## the district in a real Godot and asserts what came out.
##
## Run it from inside a Grand Theft Bureaucracy checkout that has this builder
## and its two data files copied in:
##
##     cp philly-3d/godot/scripts/philadelphia_world_builder.gd  gtb/godot/scripts/
##     cp philly-3d/godot/data/philadelphia_*.json               gtb/godot/data/
##     cp philly-3d/godot/test/philly_smoke.gd                   gtb/godot/
##     godot --headless --path gtb/godot --script philly_smoke.gd
##
## Expect a wall of "Parameter m is null" from mesh_get_surface_count. That is
## Godot's dummy renderer under --headless, one line per uniquely sized BoxMesh,
## and it is not this builder: 462 identically sized boxes through stock
## civic_kit.box produce one such line, 462 uniquely sized ones produce 462.
## Real footprints are all different sizes, so civic_kit's box_mesh cache never
## hits. Quantising the sizes does not help either, 461 distinct meshes only
## falls to 443 at a metre of rounding, so the cache is left alone.

const Builder := preload("res://scripts/philadelphia_world_builder.gd")

var failures: Array[String] = []


func check(label: String, ok: bool, detail: String = "") -> void:
	print(("ok    " if ok else "FAIL  ") + label + ("" if detail == "" else ": " + detail))
	if not ok:
		failures.append(label)


func _initialize() -> void:
	print("Godot ", Engine.get_version_info().string)
	var b = Builder.new()

	# the surface mission_director, traffic_system, minimap and hud call into
	for m in ["build", "landmark", "road_coords", "road_half", "world_half",
			"blackspots", "block_bounds", "landmark_site"]:
		check("exposes " + m + "()", b.has_method(m))

	var root := Node3D.new()
	get_root().add_child(root)
	var t0 := Time.get_ticks_msec()
	b.build(root)
	var ms := Time.get_ticks_msec() - t0

	var meshes := 0
	var bodies := 0
	var null_mesh := 0
	var stack: Array[Node] = [root]
	while stack.size() > 0:
		var n: Node = stack.pop_back()
		if n is MeshInstance3D:
			meshes += 1
			if n.mesh == null:
				null_mesh += 1
		if n is StaticBody3D:
			bodies += 1
		for c in n.get_children():
			stack.append(c)

	check("build() produced geometry", meshes > 400, "%d MeshInstance3D" % meshes)
	check("every mesh instance actually has a mesh", null_mesh == 0, "%d null" % null_mesh)
	check("build() produced colliders", bodies > 400, "%d StaticBody3D" % bodies)
	check("build() is fast enough to sit in a load screen", ms < 5000, "%d ms" % ms)

	check("world_half matches the exported district",
		absf(b.world_half() - 420.0) < 1.0, str(b.world_half()))

	# road_coords() is the axis-coordinate contract the shipped builder uses
	# (District.ROAD_COORDS), not the road polylines. An 840 m square of Penn's
	# grid at roughly 80 m block spacing holds about twenty street axes.
	var roads: Array = b.road_coords()
	check("road_coords() returns street axes", roads.size() > 8 and roads.size() < 80,
		"%d axes" % roads.size())
	var all_floats := true
	for v in roads:
		if typeof(v) != TYPE_FLOAT:
			all_floats = false
	check("road_coords() are coordinates, not polylines", all_floats)
	check("road_half() is positive", b.road_half() > 0.0, str(b.road_half()))

	var ch = b.landmark("city_hall")
	check("landmark('city_hall') resolves", ch is Vector3, str(ch))
	if ch is Vector3:
		# The district centre is the ENU point (-40, -20) and the survey puts
		# City Hall's footprint centre at (144.4, -17.5), so the building sits
		# 184.4 m off centre. This bound used to be 20 to 120 m, derived from
		# the assumption that City Hall IS the projection origin. It is not:
		# the origin is Penn Square, 145 m west of the building.
		var d: float = Vector3(ch.x, 0.0, ch.z).length()
		check("City Hall lands where the survey puts it",
			d > 150.0 and d < 220.0, "%.1f m off the district centre" % d)

	# Only the prospects that fall inside the 840 m window are exported, so this
	# checks whichever ones did rather than assuming a particular business.
	var sited := 0
	for key in ["good_dog_bar", "square_1682"]:
		var site = b.landmark_site(key)
		if site is String and site.ends_with("index.html"):
			sited += 1
	check("prospect landmarks carry their spec homepage", sited > 0,
		"%d of 2" % sited)
	check("an unknown landmark returns empty, not an error",
		b.landmark_site("not_a_real_place") == "")

	check("blackspots() answers", b.blackspots().size() > 0,
		"%d" % b.blackspots().size())

	print("")
	if failures.size() > 0:
		print("%d check(s) failed: %s" % [failures.size(), ", ".join(failures)])
		quit(1)
	print("all checks passed, %d meshes and %d colliders in %d ms" % [meshes, bodies, ms])
	quit(0)
