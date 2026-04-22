"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

export default function CTASection() {
  return (
    <section id="cta" className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="container-pad">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="relative overflow-hidden rounded-3xl bg-navy p-10 sm:p-16 text-white shadow-lift"
        >
          <div className="absolute inset-0 bg-grid-pattern [background-size:40px_40px] opacity-20" />
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-electric/40 blur-3xl" />
          <motion.div
            aria-hidden
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-electric/20 blur-3xl"
          />

          <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <motion.div
                variants={fadeUp}
                className="eyebrow border-white/15 bg-white/5 text-mist"
              >
                <Calendar className="h-3.5 w-3.5" />
                30-minute strategy call
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                Stop guessing. Start building.
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-5 max-w-xl text-lg text-mist/80"
              >
                One call. A clear diagnosis of what is leaking in your funnel
                and the exact system to fix it. If we are not the right fit, we
                will tell you.
              </motion.p>
            </div>
            <motion.div
              variants={fadeUp}
              className="flex flex-col items-start gap-4 lg:col-span-2 lg:items-end"
            >
              <a href="#" className="btn-primary animate-pulse-glow w-full justify-center lg:w-auto">
                Book a Strategy Call
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#results"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-all duration-300 hover:bg-white/10 lg:w-auto"
              >
                See Results
              </a>
              <div className="text-xs text-mist/60">
                No pitch decks. No upsell theater.
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
