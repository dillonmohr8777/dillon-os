"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Clock, DollarSign, TrendingDown } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const pains = [
  {
    icon: DollarSign,
    title: "Ad spend without answers",
    copy: "You are running campaigns but cannot tell which dollar produced which lead.",
  },
  {
    icon: Clock,
    title: "Content that never ships",
    copy: "The strategy doc looks great. Nothing has gone live in six weeks.",
  },
  {
    icon: TrendingDown,
    title: "A CRM full of dead contacts",
    copy: "4,000 names. Zero follow-up. Every new lead gets the same silence.",
  },
  {
    icon: AlertTriangle,
    title: "Tools that do not talk",
    copy: "CRM, ads, email, analytics, and AI all running in separate tabs.",
  },
];

export default function ProblemSection() {
  return (
    <section className="relative bg-fog py-24 sm:py-32">
      <div className="container-pad">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={fadeUp} className="eyebrow">
            The problem
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="headline mt-6 text-4xl sm:text-5xl"
          >
            Marketing looks busy. Revenue looks flat.
          </motion.h2>
          <motion.p variants={fadeUp} className="subtle mt-5 text-lg">
            Most businesses do not have a marketing problem. They have a systems
            problem. The tools are stacked. The work is scattered. The results
            never compound.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {pains.map((p) => (
            <motion.div
              key={p.title}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="card hover:border-electric/30 hover:shadow-lift"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mist text-electric">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-navy">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">
                {p.copy}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
