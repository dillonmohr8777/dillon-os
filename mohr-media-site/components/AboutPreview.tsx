"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

export default function AboutPreview() {
  return (
    <section id="about" className="relative bg-white py-24 sm:py-32">
      <div className="container-pad grid grid-cols-1 gap-16 lg:grid-cols-5 lg:items-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="lg:col-span-3"
        >
          <motion.div variants={fadeUp} className="eyebrow">
            Who builds this
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="headline mt-6 text-4xl sm:text-5xl"
          >
            Built by an operator. Not a theorist.
          </motion.h2>
          <motion.p variants={fadeUp} className="subtle mt-5 text-lg">
            Dillon Mohr runs 25+ active client accounts across Google Ads, SEO,
            content, landing pages, CRM, and automation. He writes the posts,
            ships the campaigns, codes the landing pages, and builds the AI
            workflows. Mohr Media is what happens when that playbook gets
            packaged.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 grid grid-cols-3 gap-6">
            {[
              { k: "Active accounts", v: "25+" },
              { k: "Industries", v: "9" },
              { k: "Campaigns shipped", v: "140+" },
            ].map((s) => (
              <div key={s.k}>
                <div className="text-3xl font-semibold text-navy">{s.v}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-ink/50">
                  {s.k}
                </div>
              </div>
            ))}
          </motion.div>
          <motion.a
            variants={fadeUp}
            href="#cta"
            className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-electric hover:underline"
          >
            Read the full story
            <ArrowUpRight className="h-4 w-4" />
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative lg:col-span-2"
        >
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-mist via-white to-mist blur-2xl opacity-70" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-navy/5 bg-gradient-to-br from-navy via-[#0F2A4D] to-navy shadow-lift">
            <div className="absolute inset-0 bg-grid-pattern [background-size:40px_40px] opacity-20" />
            <div className="absolute inset-x-6 bottom-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-mist/60">
                Founder
              </div>
              <div className="mt-1 text-xl font-semibold text-white">
                Dillon Mohr
              </div>
              <div className="mt-1 text-sm text-mist/70">
                Operator, builder, systems designer
              </div>
            </div>
            <motion.div
              aria-hidden
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute right-6 top-6 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 backdrop-blur"
            >
              <div className="text-[10px] uppercase tracking-[0.2em] text-mist/60">
                Managing
              </div>
              <div className="text-sm font-semibold text-white">
                25+ accounts
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
