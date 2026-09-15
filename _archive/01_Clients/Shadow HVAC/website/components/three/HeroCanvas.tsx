"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Icosahedron, TorusKnot, Stars } from "@react-three/drei";
import * as THREE from "three";

/* A stream of particles rising (heat) or falling (cool). */
function ParticleStream({
  count,
  color,
  direction,
  spread,
  origin,
}: {
  count: number;
  color: string;
  direction: 1 | -1;
  spread: number;
  origin: [number, number, number];
}) {
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = origin[0] + (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = origin[1] + (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = origin[2] + (Math.random() - 0.5) * spread;
      speeds[i] = 0.6 + Math.random() * 1.4;
    }
    return { positions, speeds };
  }, [count, spread, origin]);

  useFrame((_, delta) => {
    const pts = ref.current;
    if (!pts) return;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += direction * speeds[i] * delta;
      if (direction === 1 && arr[i * 3 + 1] > origin[1] + 3.2) arr[i * 3 + 1] = origin[1] - 3.2;
      if (direction === -1 && arr[i * 3 + 1] < origin[1] - 3.2) arr[i * 3 + 1] = origin[1] + 3.2;
    }
    pts.geometry.attributes.position.needsUpdate = true;
    pts.rotation.y += delta * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={color}
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function CoreCluster() {
  const group = useRef<THREE.Group>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame((state, delta) => {
    if (group.current) {
      // gentle mouse parallax
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        pointer.x * 0.4,
        0.05
      );
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        -pointer.y * 0.25,
        0.05
      );
    }
    if (ring1.current) ring1.current.rotation.z += delta * 0.4;
    if (ring2.current) {
      ring2.current.rotation.x += delta * 0.3;
      ring2.current.rotation.y -= delta * 0.2;
    }
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.4} floatIntensity={1.1}>
        {/* Energy core */}
        <Icosahedron args={[1.35, 1]}>
          <meshStandardMaterial
            color="#111826"
            metalness={0.9}
            roughness={0.25}
            emissive="#ff5a1f"
            emissiveIntensity={0.35}
            flatShading
          />
        </Icosahedron>
        {/* inner glow core */}
        <Icosahedron args={[0.9, 0]}>
          <meshBasicMaterial color="#ff8a3d" wireframe transparent opacity={0.35} />
        </Icosahedron>
      </Float>

      {/* Heat ring */}
      <mesh ref={ring1} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.4, 0.045, 16, 120]} />
        <meshStandardMaterial
          color="#ff5a1f"
          emissive="#ff5a1f"
          emissiveIntensity={1.4}
          roughness={0.4}
        />
      </mesh>

      {/* Cool ring */}
      <mesh ref={ring2} rotation={[Math.PI / 3, Math.PI / 5, 0]}>
        <torusGeometry args={[3, 0.035, 16, 120]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={1.3}
          roughness={0.4}
        />
      </mesh>

      {/* Orbiting knot accent */}
      <Float speed={3} floatIntensity={2} rotationIntensity={1}>
        <TorusKnot args={[0.28, 0.09, 128, 16]} position={[2.6, 1.3, -0.5]}>
          <meshStandardMaterial
            color="#f4b740"
            emissive="#f4b740"
            emissiveIntensity={0.8}
            metalness={0.6}
            roughness={0.3}
          />
        </TorusKnot>
      </Float>
    </group>
  );
}

export default function HeroCanvas() {
  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 0, 8], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[6, 4, 6]} intensity={120} color="#ff8a3d" />
      <pointLight position={[-6, -2, 4]} intensity={100} color="#38bdf8" />
      <directionalLight position={[0, 6, 3]} intensity={1.2} />

      <CoreCluster />

      <ParticleStream count={120} color="#ff8a3d" direction={1} spread={3} origin={[3.4, 0, 0]} />
      <ParticleStream count={120} color="#7dd3fc" direction={-1} spread={3} origin={[-3.4, 0, 0]} />

      <Stars radius={40} depth={30} count={900} factor={3} saturation={0} fade speed={1} />
    </Canvas>
  );
}
