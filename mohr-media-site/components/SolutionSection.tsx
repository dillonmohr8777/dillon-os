"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const pillars = [
  "Diagnostic-first engagements",
  "Systems built on your real data",
  "AI-powered content and reporting",
  "Fixed scope, measurable outcomes",
  "Operator-built, not outsourced",
  "Infrastructure that compounds",
];

export default function SolutionSection() {
  return (
    <section className="relative bg-white py-24 sm:py-32">
      <div className="container-pad grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="eyebrow">
            The solution
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="headline mt-6 text-4xl sm:text-5xl"
          >
            A marketing system, not another retainer.
          </motion.h2>
          <motion.p variants={fadeUp} className="subtle mt-5 text-lg">
            Mohr Media designs and installs the infrastructure that turns
            scattered effort into predictable revenue. Landing pages, ad
            campaigns, content engines, CRM, reporting, and AI workflows.
            Connected. Instrumented. Owned.
          </motion.p>
          <motion.ul
            variants={stagger}
            className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {pillars.map((p) => (
              <motion.li
                key={p}
                variants={fadeUp}
                className="flex items-start gap-3 text-sm font-medium text-ink"
              >
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-electric/10 text-electric">
                  <Check className="h-3 w-3" />
                </span>
                {p}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute -inset-8 -z-10 rounded-[2rem] bg-gradient-to-br from-mist via-white to-mist blur-2xl opacity-70" />
          <div className="rounded-3xl border border-navy/5 bg-gradient-to-br from-navy to-[#0F2A4D] p-8 text-white shadow-lift">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-mist/60">
                System map
              </div>
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-white/20" />
                <span className="h-2 w-2 rounded-full bg-white/20" />
                <span className="h-2 w-2 rounded-full bg-electric" />
              </div>
            </div>
            <div className="mt-8 space-y-4">
              {[
                { label: "Acquisition", pct: 88, tone: "Google Ads + SEO" },
                { label: "Capture", pct: 72, tone: "Landing pages + forms" },
                { label: "Nurture", pct: 64, tone: "Email + CRM flows" },
                { label: "Close", pct: 91, tone: "Sales playbook + automation" },
              ].map((row, i) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={viewportOnce}
                  transition={{ delay: 0.1 * i, duration: 0.6 }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-white">{row.label}</span>
                    <span className="text-mist/60">{row.tone}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${row.pct}%` }}
                      viewport={viewportOnce}
                      transition={{ duration: 1.1, delay: 0.2 + 0.1 * i }}
                      className="h-full rounded-full bg-gradient-to-r from-electric to-mist"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-mist/60">
                  Connected ops
                </div>
                <div className="text-lg font-semibold text-white">
                  One system. Zero silos.
                </div>
              </div>
              <div className="rounded-full bg-electric px-3 py-1 text-xs font-semibold text-white">
                Live
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
