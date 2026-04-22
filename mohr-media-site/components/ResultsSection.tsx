"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const cases = [
  {
    client: "Shadow HVAC",
    industry: "Home services",
    metric: "4.1x",
    label: "Qualified lead volume in 90 days",
    color: "from-electric/20 to-transparent",
  },
  {
    client: "Kimberly James Bridal",
    industry: "Retail",
    metric: "62%",
    label: "Lower cost per booked appointment",
    color: "from-mist/60 to-transparent",
  },
  {
    client: "Onsite Concrete",
    industry: "Contracting",
    metric: "$1.2M",
    label: "Pipeline generated from paid + SEO",
    color: "from-electric/30 to-transparent",
  },
];

export default function ResultsSection() {
  return (
    <section
      id="results"
      className="relative overflow-hidden bg-navy py-24 text-white sm:py-32"
    >
      <div className="absolute inset-x-0 top-0 -z-10 h-1/2 bg-radial-glow opacity-60" />
      <div className="container-pad">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
        >
          <div className="max-w-2xl">
            <motion.div variants={fadeUp} className="eyebrow border-white/15 bg-white/5 text-mist">
              Results
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl"
            >
              Operators. Real accounts. Real numbers.
            </motion.h2>
          </div>
          <motion.p variants={fadeUp} className="max-w-sm text-mist/70">
            A selection of engagements where the system replaced the scramble.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {cases.map((c) => (
            <motion.div
              key={c.client}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur transition-all duration-300 hover:border-electric/40 hover:bg-white/[0.06]`}
            >
              <div
                className={`absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br ${c.color} blur-2xl`}
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-mist/60">
                    {c.industry}
                  </div>
                  <TrendingUp className="h-4 w-4 text-electric" />
                </div>
                <div className="mt-10">
                  <div className="bg-gradient-to-r from-electric via-mist to-white bg-clip-text text-6xl font-semibold tracking-tight text-transparent">
                    {c.metric}
                  </div>
                  <div className="mt-3 text-sm text-mist/80">{c.label}</div>
                </div>
                <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6">
                  <div className="text-sm font-semibold text-white">
                    {c.client}
                  </div>
                  <div className="text-xs text-mist/60 transition-colors group-hover:text-electric">
                    View case study →
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
