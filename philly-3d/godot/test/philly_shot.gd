extends SceneTree
## Render the Philadelphia district from inside the game engine.
const Builder := preload("res://scripts/philadelphia_world_builder.gd")

var frames := 0
var shot := 0
var cam: Camera3D
var shots := []

func _initialize() -> void:
	var b = Builder.new()
	var root := Node3D.new()
	get_root().add_child(root)
	b.build(root)

	var ch = b.landmark("city_hall")
	var centre := (ch if ch is Vector3 else Vector3.ZERO) as Vector3

	# 28 August 2026, 19:14 EDT: sun 3.921 deg elevation, 279.195 deg azimuth,
	# from tools/solar.py. Godot is Y-up with -Z north, so a compass azimuth A
	# measured from north becomes a Y rotation of -A and the elevation tips it
	# down from the horizon.
	var sun := DirectionalLight3D.new()
	var elev := float(OS.get_environment("SUN_ELEV"))
	var azim := float(OS.get_environment("SUN_AZ"))
	sun.rotation = Vector3(deg_to_rad(-elev), deg_to_rad(-azim + 180.0), 0.0)
	sun.light_energy = 2.2
	sun.light_color = Color(1.0, 0.83, 0.62)
	sun.shadow_enabled = true
	root.add_child(sun)

	var env := WorldEnvironment.new()
	var e := Environment.new()
	e.background_mode = Environment.BG_SKY
	var sky := Sky.new()
	var mat := ProceduralSkyMaterial.new()
	mat.sky_top_color = Color(0.24, 0.38, 0.62)
	mat.sky_horizon_color = Color(0.72, 0.63, 0.55)
	mat.ground_bottom_color = Color(0.16, 0.15, 0.14)
	mat.ground_horizon_color = Color(0.34, 0.31, 0.28)
	mat.sun_angle_max = 6.0
	sky.sky_material = mat
	e.sky = sky
	e.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	e.ambient_light_energy = 0.9
	e.fog_enabled = true
	e.fog_density = 0.0012
	e.fog_light_color = Color(0.62, 0.58, 0.60)
	env.environment = e
	root.add_child(env)

	cam = Camera3D.new()
	cam.fov = 62.0
	# A 0.05 near plane against a 4000 far plane is a ratio of 80,000, which
	# destroys a 24 bit depth buffer: the first attempt z-fought the pavement
	# apart at street level. Both planes are set per shot instead.
	cam.near = float(OS.get_environment("CAM_NEAR"))
	cam.far = float(OS.get_environment("CAM_FAR"))
	root.add_child(cam)

	var tag := OS.get_environment("TAG")
	# Aim at the district centre, which is Godot's origin here, not at City Hall.
	shots = [
		{ "name": "godot-01-district" + tag, "pos": Vector3(-430, 250, 430),
		  "look": Vector3(30, 45, -30) },
		{ "name": "godot-02-street" + tag,   "pos": Vector3(210, 1.7, 40),
		  "look": Vector3(-260, 55, -20) },
		{ "name": "godot-03-aerial" + tag,   "pos": Vector3(60, 620, 420),
		  "look": Vector3(-20, 0, -40) },
	]
	_aim()

func _aim() -> void:
	var s: Dictionary = shots[shot]
	cam.position = s["pos"]
	cam.look_at(s["look"], Vector3.UP)

func _process(_d: float) -> bool:
	frames += 1
	if frames < 12:
		return false
	var img := get_root().get_texture().get_image()
	var name: String = str(shots[shot]["name"])
	var path: String = OS.get_environment("SHOT_DIR") + "/" + name + ".png"
	var err := img.save_png(path)
	print("SHOT ", name, " -> ", path, "  ", img.get_width(), "x", img.get_height(),
		"  err=", err)
	shot += 1
	if shot >= shots.size():
		return true
	frames = 0
	_aim()
	return false
