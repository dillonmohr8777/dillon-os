"use client";

import { motion } from "framer-motion";
import { Compass, Gauge, Cpu, Rocket } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const steps = [
  {
    icon: Compass,
    tag: "01",
    title: "Map",
    copy: "We audit the full funnel. Acquisition, conversion, retention, ops. Nothing moves until we know where the leak is.",
  },
  {
    icon: Gauge,
    tag: "02",
    title: "Optimize",
    copy: "Tighten what already works. Page speed, copy, offers, targeting, tracking, and CRM flows get sharpened before new spend.",
  },
  {
    icon: Cpu,
    tag: "03",
    title: "Harness",
    copy: "Layer AI into the system. Automated content, lead scoring, reporting, and workflows that cut cost and accelerate output.",
  },
  {
    icon: Rocket,
    tag: "04",
    title: "Run",
    copy: "Launch, measure, compound. Every campaign feeds the next. Every insight sharpens the machine.",
  },
];

export default function MethodSection() {
  return (
    <section id="method" className="relative overflow-hidden bg-fog py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-grid-pattern [background-size:64px_64px] opacity-[0.4]" />
      <div className="container-pad">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={fadeUp} className="eyebrow">
            The Mohr Method
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="headline mt-6 text-4xl sm:text-5xl"
          >
            A four-stage system to turn marketing into infrastructure.
          </motion.h2>
          <motion.p variants={fadeUp} className="subtle mt-5 text-lg">
            The operating framework behind every Mohr Media engagement.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="relative mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <div className="absolute left-8 right-8 top-20 hidden h-px bg-gradient-to-r from-transparent via-electric/40 to-transparent lg:block" />
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              className="relative card hover:border-electric/30 hover:shadow-lift"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-white">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-electric">
                  {s.tag}
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-navy">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
                {s.copy}
              </p>
              {i < steps.length - 1 && (
                <div className="pointer-events-none absolute -right-3 top-14 hidden h-6 w-6 items-center justify-center rounded-full border border-electric/30 bg-white text-electric lg:flex">
                  →
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
