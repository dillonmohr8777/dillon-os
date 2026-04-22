"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const faqs = [
  {
    q: "How is Mohr Media different from an agency?",
    a: "We do not sell hours or vague retainers. Every engagement has a fixed scope, clear deliverables, and measurable outcomes. We build systems designed to compound, not campaigns designed to keep you paying monthly.",
  },
  {
    q: "Do you work with small businesses?",
    a: "Yes. Our entry points start at $47. Strategy calls start at $497. Full system engagements scale from there. You pick the stage that matches your situation.",
  },
  {
    q: "What does AI-powered actually mean?",
    a: "Custom AI workflows for content production, lead scoring, research, reporting, and campaign optimization. Real tools running inside your stack, not a marketing buzzword.",
  },
  {
    q: "Who actually does the work?",
    a: "Dillon Mohr leads every engagement. No account handoffs. No junior team shuffling decks. The person designing the system is the person shipping the work.",
  },
  {
    q: "How fast do I see results?",
    a: "The first 30 days are diagnostic and build. Most engagements show meaningful lift by day 60 and compound from there.",
  },
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="relative bg-fog py-24 sm:py-32">
      <div className="container-pad grid grid-cols-1 gap-16 lg:grid-cols-5">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="lg:col-span-2"
        >
          <motion.div variants={fadeUp} className="eyebrow">
            FAQ
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="headline mt-6 text-4xl sm:text-5xl"
          >
            The questions that come up first.
          </motion.h2>
          <motion.p variants={fadeUp} className="subtle mt-5 text-lg">
            If your question is not here, a strategy call is the fastest way to
            get a direct answer.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="lg:col-span-3"
        >
          <div className="divide-y divide-navy/5 overflow-hidden rounded-2xl border border-navy/5 bg-white">
            {faqs.map((f, i) => {
              const open = openIdx === i;
              return (
                <motion.div key={f.q} variants={fadeUp}>
                  <button
                    onClick={() => setOpenIdx(open ? null : i)}
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors hover:bg-fog"
                  >
                    <span className="text-base font-semibold text-navy">
                      {f.q}
                    </span>
                    <motion.span
                      animate={{ rotate: open ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-navy/10 text-navy"
                    >
                      <Plus className="h-4 w-4" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-sm leading-relaxed text-ink/70">
                          {f.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
