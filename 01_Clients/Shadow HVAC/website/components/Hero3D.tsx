"use client";

import dynamic from "next/dynamic";

const HeroCanvas = dynamic(() => import("./three/HeroCanvas"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <div className="h-40 w-40 animate-pulse-glow rounded-full bg-gradient-to-br from-ember/30 to-ice/30 blur-3xl" />
    </div>
  ),
});

export function Hero3D() {
  return (
    <div className="absolute inset-0 -z-0">
      <HeroCanvas />
    </div>
  );
}
