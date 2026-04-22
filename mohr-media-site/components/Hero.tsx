"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-navy pt-36 pb-28 text-white sm:pt-40 sm:pb-32"
    >
      <div className="absolute inset-0 -z-10 bg-grid-pattern [background-size:48px_48px] opacity-[0.12]" />
      <div className="absolute inset-x-0 -top-40 -z-10 h-[600px] bg-radial-glow" />
      <motion.div
        aria-hidden
        className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-electric/30 blur-3xl"
        animate={{ y: [0, 20, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-electric/20 blur-3xl"
        animate={{ y: [0, -16, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 9, repeat: Infinity }}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="container-pad relative flex flex-col items-center text-center"
      >
        <motion.div variants={fadeUp} className="eyebrow border-white/20 bg-white/5 text-mist">
          <Sparkles className="h-3.5 w-3.5" />
          AI-powered marketing infrastructure
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mt-8 max-w-4xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
        >
          Your Marketing Should Be a Machine.
          <br />
          <span className="bg-gradient-to-r from-electric via-[#6A95FF] to-mist bg-clip-text text-transparent">
            Not a Mess.
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-2xl text-lg text-mist/80 sm:text-xl"
        >
          We build AI-powered marketing systems that generate leads, drive
          revenue, and actually compound.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a href="#cta" className="btn-primary animate-pulse-glow">
            Book a Strategy Call
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#results"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5"
          >
            See Results
          </a>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium uppercase tracking-[0.2em] text-mist/60"
        >
          <span>25+ active client accounts</span>
          <span className="h-1 w-1 rounded-full bg-mist/30" />
          <span>9 industries</span>
          <span className="h-1 w-1 rounded-full bg-mist/30" />
          <span>Built by operators</span>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="container-pad relative mt-20"
      >
        <div className="relative mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur">
          <div className="rounded-2xl bg-gradient-to-br from-navy via-[#0F2A4D] to-navy p-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
              {[
                { k: "Ad spend optimized", v: "$2.4M+" },
                { k: "Campaigns managed", v: "140+" },
                { k: "Content shipped", v: "1,200+" },
                { k: "Avg lift", v: "3.2x" },
              ].map((stat) => (
                <div
                  key={stat.k}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="text-3xl font-semibold text-white">
                    {stat.v}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-mist/60">
                    {stat.k}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
