"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation, Sparkles } from "lucide-react";
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
    <div className="map-stage mx-auto w-full max-w-2xl py-7">
      <motion.div
        initial={{ opacity: 0, y: 60, rotateX: 14 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="map-glass liquid-frame overflow-hidden p-2 sm:p-3"
      >
        <div className="relative min-h-[31rem] overflow-hidden rounded-[1.25rem] bg-shadow-900 sm:min-h-[36rem]">
          <iframe
            title="Google Maps service area around Hampshire Illinois"
            src="https://www.google.com/maps?q=Shadow+Heating+and+Cooling+334+E+Grove+Hampshire+IL+60140&z=10&output=embed"
            className="absolute inset-0 h-full w-full border-0 saturate-[.8] contrast-[1.08]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-shadow-950/80 via-transparent to-ember/10" />
          <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/20 bg-shadow-950/70 px-4 py-3 backdrop-blur-2xl sm:left-6 sm:top-6">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-ember-light"><Sparkles className="h-3.5 w-3.5" /> Live Service Map</p>
            <p className="mt-1 text-sm font-semibold text-white">Hampshire and nearby communities</p>
          </div>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Shadow+Heating+and+Cooling+334+E+Grove+Hampshire+IL+60140"
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-shadow-950/80 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-xl transition hover:border-ember/50 hover:bg-ember/20"
          >
            <Navigation className="h-4 w-4 text-ember-light" /> Open Google Maps
          </a>
        </div>
      </motion.div>
      <div className="mx-auto mt-2 flex max-w-xl flex-wrap justify-center gap-2">
        {dots.map((dot, index) => (
          <motion.span
            key={dot.name}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ delay: index * 0.05 }}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-xl"
          >
            {dot.hq && <MapPin className="mr-1 inline h-3 w-3 text-ember" />}{dot.name}
          </motion.span>
        ))}
      </div>
      <span className="sr-only">Service areas: {serviceAreas.map((s) => s.name).join(", ")}</span>
    </div>
  );
}
