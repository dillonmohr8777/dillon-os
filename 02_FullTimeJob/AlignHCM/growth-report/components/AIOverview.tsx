"use client";

import { useState } from "react";
import { report } from "@/lib/report-data";
import {
  RevealPop,
  TiltCard,
  ChromeNumeral,
  Lightbox,
} from "./motion-primitives";
import { motion } from "framer-motion";

export function AIOverview() {
  const [active, setActive] = useState<number | null>(null);
  const { aiOverview } = report;

  return (
    <section id="ai-overview" className="px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <RevealPop>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-align-teal">
            AEO / GEO
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            {aiOverview.title}
          </h2>
          <motion.p
            className="mt-2 font-mono text-sm text-slate-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            {aiOverview.status}
          </motion.p>
        </RevealPop>

        {/* Mobile: horizontal pan at 390px */}
        <div className="mt-10 -mx-5 overflow-x-auto px-5 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex w-max gap-4 sm:grid sm:w-full sm:grid-cols-3">
            {aiOverview.cards.map((card, i) => (
              <RevealPop key={card.title} delay={i * 0.1}>
                <TiltCard
                  className="group w-[280px] cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-5 sm:w-auto"
                  max={5}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => setActive(i)}
                  >
                    <ChromeNumeral className="text-4xl">{card.metric}</ChromeNumeral>
                    <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                      {card.detail}
                    </p>
                    <h3 className="mt-4 font-display text-lg font-semibold text-white">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {card.snippet}
                    </p>
                  </button>
                </TiltCard>
              </RevealPop>
            ))}
          </div>
        </div>
      </div>

      <Lightbox open={active !== null} onClose={() => setActive(null)}>
        {active !== null && (
          <div>
            <ChromeNumeral className="text-5xl">{aiOverview.cards[active].metric}</ChromeNumeral>
            <p className="mt-2 text-sm text-slate-400">{aiOverview.cards[active].detail}</p>
            <h3 className="mt-4 font-display text-2xl font-bold text-white">
              {aiOverview.cards[active].title}
            </h3>
            <p className="mt-3 text-slate-300">{aiOverview.cards[active].snippet}</p>
          </div>
        )}
      </Lightbox>
    </section>
  );
}
