"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { serviceAreas } from "@/lib/site";

// Decorative radar-style coverage map centered on the Hampshire HQ.
const dots = [
  { name: "Hampshire", x: 50, y: 50, hq: true },
  { name: "Burlington", x: 30, y: 34 },
  { name: "Huntley", x: 72, y: 40 },
  { name: "Pingree Grove", x: 66, y: 62 },
  { name: "Gilberts", x: 78, y: 68 },
  { name: "Elgin", x: 82, y: 52 },
  { name: "Elburn", x: 38, y: 74 },
  { name: "Kane County", x: 24, y: 58 },
];

export function ServiceAreaMap() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-shadow-900/70">
      <div className="field-lines absolute inset-0 opacity-50" aria-hidden />
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        {[18, 30, 42].map((r) => (
          <circle
            key={r}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="rgba(56,189,248,0.16)"
            strokeWidth="0.3"
          />
        ))}
        {dots
          .filter((d) => !d.hq)
          .map((d) => (
            <line
              key={d.name}
              x1="50"
              y1="50"
              x2={d.x}
              y2={d.y}
              stroke="rgba(255,90,31,0.18)"
              strokeWidth="0.25"
              strokeDasharray="1 1.5"
            />
          ))}
      </svg>

      {dots.map((d, i) => (
        <motion.div
          key={d.name}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 300 }}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${d.x}%`, top: `${d.y}%` }}
        >
          <div className="group relative flex flex-col items-center">
            {d.hq && (
              <span className="absolute h-8 w-8 animate-ping rounded-full bg-ember/40" />
            )}
            <span
              className={`relative grid place-items-center rounded-full ${
                d.hq
                  ? "h-6 w-6 bg-gradient-to-br from-ember to-ember-dark shadow-ember"
                  : "h-3 w-3 bg-ice"
              }`}
            >
              {d.hq && <MapPin className="h-3.5 w-3.5 text-white" />}
            </span>
            <span
              className={`mt-1.5 whitespace-nowrap rounded-full px-1.5 text-[0.6rem] font-semibold ${
                d.hq ? "text-ember-light" : "text-slate-300"
              }`}
            >
              {d.name}
            </span>
          </div>
        </motion.div>
      ))}

      <div className="absolute bottom-4 left-4 flex flex-wrap gap-x-4 gap-y-1 text-[0.65rem] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ember" /> HQ
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ice" /> Service area
        </span>
      </div>
      <span className="sr-only">
        Service areas: {serviceAreas.map((s) => s.name).join(", ")}
      </span>
    </div>
  );
}
