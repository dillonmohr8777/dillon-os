"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { Flame, Snowflake, Minus, Plus } from "lucide-react";

const ThermostatScene = dynamic(() => import("./three/ThermostatScene"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <div className="h-32 w-32 animate-pulse-glow rounded-full bg-gradient-to-br from-ice/30 to-ember/30 blur-2xl" />
    </div>
  ),
});

const MIN = 60;
const MAX = 85;

export function ThermostatDial() {
  const [temp, setTemp] = useState(72);
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startAngle: number; startTemp: number } | null>(null);

  const mode = temp >= 74 ? "heat" : temp <= 68 ? "cool" : "auto";

  const angleFrom = useCallback((clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return Math.atan2(clientY - (r.top + r.height / 2), clientX - (r.left + r.width / 2));
  }, []);

  const onDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { startAngle: angleFrom(e.clientX, e.clientY), startTemp: temp };
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const a = angleFrom(e.clientX, e.clientY);
    let d = a - drag.current.startAngle;
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    const next = drag.current.startTemp + (d / (Math.PI * 1.5)) * (MAX - MIN);
    setTemp(Math.max(MIN, Math.min(MAX, Math.round(next))));
  };

  const onUp = () => {
    drag.current = null;
  };

  const nudge = (n: number) => setTemp((t) => Math.max(MIN, Math.min(MAX, t + n)));

  const tint =
    mode === "heat"
      ? "text-ember-light"
      : mode === "cool"
        ? "text-ice-light"
        : "text-gold";

  return (
    <div className="card p-6 sm:p-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Live Demo
          </p>
          <h3 className="heading text-xl text-white">Set Your Comfort Zone</h3>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-xs font-bold uppercase ${tint}`}
        >
          {mode === "heat" ? (
            <Flame className="h-3.5 w-3.5" />
          ) : mode === "cool" ? (
            <Snowflake className="h-3.5 w-3.5" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-gold" />
          )}
          {mode}
        </span>
      </div>

      <div
        ref={ref}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        className="relative mx-auto aspect-square w-full max-w-sm cursor-grab touch-none select-none active:cursor-grabbing"
      >
        <ThermostatScene temp={temp} />
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <span className={`heading text-6xl leading-none ${tint}`}>{temp}°</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={() => nudge(-1)}
          aria-label="Lower temperature"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-ice-light transition-colors hover:bg-ice/10"
        >
          <Minus className="h-5 w-5" />
        </button>
        <p className="text-center text-xs text-slate-500">Drag the dial or tap ±</p>
        <button
          onClick={() => nudge(1)}
          aria-label="Raise temperature"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-ember-light transition-colors hover:bg-ember/10"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
