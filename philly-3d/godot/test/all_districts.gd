extends SceneTree
## Build every exported district, not just the default one.
const Builder := preload("res://scripts/philadelphia_world_builder.gd")
func _initialize() -> void:
	var fails := 0
	for slug in ["philadelphia", "market_east", "south_philly", "fishtown"]:
		var b = Builder.new()
		b.district = slug
		var root := Node3D.new()
		get_root().add_child(root)
		var t0 := Time.get_ticks_msec()
		b.build(root)
		var ms := Time.get_ticks_msec() - t0
		var meshes := 0
		var stack: Array[Node] = [root]
		while stack.size() > 0:
			var n: Node = stack.pop_back()
			if n is MeshInstance3D:
				meshes += 1
			for c in n.get_children():
				stack.append(c)
		var ok: bool = meshes > 100 and b.world_half() > 100.0 and b.road_coords().size() > 4
		print("%s  %-14s %5d meshes  %4d ms  half %.0f m  %d axes" % [
			"ok   " if ok else "FAIL ", slug, meshes, ms, b.world_half(),
			b.road_coords().size()])
		if not ok:
			fails += 1
		root.queue_free()
	quit(1 if fails > 0 else 0)
