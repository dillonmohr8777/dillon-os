"use client";

import { motion } from "framer-motion";
import {
  Target,
  LineChart,
  MousePointerClick,
  Bot,
  LayoutTemplate,
  ArrowUpRight,
} from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const services = [
  {
    icon: Target,
    title: "Lead Generation Systems",
    copy: "Landing pages, ads, email, CRM, and reporting wired into one revenue engine.",
  },
  {
    icon: LineChart,
    title: "SEO & Content Engine",
    copy: "AI-assisted content that ranks, compounds, and actually gets shipped.",
  },
  {
    icon: MousePointerClick,
    title: "Google Ads Management",
    copy: "Account structure, creative, targeting, and bid strategy built by an operator.",
  },
  {
    icon: Bot,
    title: "AI Marketing Infrastructure",
    copy: "Custom AI workflows for content, outreach, reporting, and research ops.",
  },
  {
    icon: LayoutTemplate,
    title: "Website Conversion Overhaul",
    copy: "Strategy, copy, and design focused on turning visitors into pipeline.",
  },
];

export default function ServicesGrid() {
  return (
    <section id="services" className="relative bg-white py-24 sm:py-32">
      <div className="container-pad">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
        >
          <div className="max-w-2xl">
            <motion.div variants={fadeUp} className="eyebrow">
              Services
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="headline mt-6 text-4xl sm:text-5xl"
            >
              Five systems. One compounding machine.
            </motion.h2>
          </div>
          <motion.a
            variants={fadeUp}
            href="#cta"
            className="inline-flex items-center gap-2 text-sm font-semibold text-electric hover:underline"
          >
            See all services
            <ArrowUpRight className="h-4 w-4" />
          </motion.a>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((s, i) => (
            <motion.a
              key={s.title}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              href="#cta"
              className={`group card relative overflow-hidden hover:border-electric/30 hover:shadow-lift ${
                i === 0 ? "lg:col-span-2 lg:row-span-1" : ""
              }`}
            >
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-mist opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mist text-electric">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-navy">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">
                  {s.copy}
                </p>
                <div className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-electric opacity-0 transition-all duration-300 group-hover:opacity-100">
                  Learn more <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
