"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

const MIN = 60;
const MAX = 85;
const SEGMENTS = 44;

function lerpColor(t: number) {
  // t 0 -> ice blue, 1 -> ember orange
  const cold = new THREE.Color("#38bdf8");
  const hot = new THREE.Color("#ff5a1f");
  return cold.clone().lerp(hot, t);
}

function Dial({ temp }: { temp: number }) {
  const group = useRef<THREE.Group>(null);
  const knob = useRef<THREE.Mesh>(null);
  const frac = (temp - MIN) / (MAX - MIN);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.15;
    if (knob.current) {
      const target = -frac * Math.PI * 1.5 + Math.PI * 0.75;
      knob.current.rotation.z = THREE.MathUtils.lerp(knob.current.rotation.z, target, 0.15);
    }
  });

  const segs = useMemo(() => Array.from({ length: SEGMENTS }, (_, i) => i), []);
  const activeColor = lerpColor(frac);

  return (
    <group ref={group}>
      {/* housing */}
      <mesh>
        <cylinderGeometry args={[1.9, 1.9, 0.35, 64]} />
        <meshStandardMaterial color="#0e131d" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[1.55, 1.55, 0.12, 64]} />
        <meshStandardMaterial color="#121826" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* segment ring */}
      <group position={[0, 0.32, 0]}>
        {segs.map((i) => {
          const a = (i / SEGMENTS) * Math.PI * 1.5 + Math.PI * 0.75;
          const r = 1.72;
          const on = i / SEGMENTS <= frac;
          const c = on ? lerpColor(i / SEGMENTS) : new THREE.Color("#26314a");
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * r, 0, Math.sin(a) * r]}
              rotation={[0, -a, 0]}
            >
              <boxGeometry args={[0.05, 0.06, 0.22]} />
              <meshStandardMaterial
                color={c}
                emissive={c}
                emissiveIntensity={on ? 1.6 : 0.05}
              />
            </mesh>
          );
        })}
      </group>

      {/* rotating indicator */}
      <mesh ref={knob} position={[0, 0.4, 0]}>
        <boxGeometry args={[0.08, 0.06, 1.35]} />
        <meshStandardMaterial
          color={activeColor}
          emissive={activeColor}
          emissiveIntensity={2}
        />
      </mesh>

      {/* glowing hub */}
      <mesh position={[0, 0.42, 0]}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial
          color={activeColor}
          emissive={activeColor}
          emissiveIntensity={1.4}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

export default function ThermostatScene({ temp }: { temp: number }) {
  const frac = (temp - MIN) / (MAX - MIN);
  const light = lerpColor(frac);
  return (
    <Canvas dpr={[1, 1.8]} camera={{ position: [0, 2.6, 3.6], fov: 42 }} gl={{ alpha: true }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 4, 3]} intensity={40} color={`#${light.getHexString()}`} />
      <pointLight position={[-3, 2, -2]} intensity={25} color="#7dd3fc" />
      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.4}>
        <Dial temp={temp} />
      </Float>
    </Canvas>
  );
}
