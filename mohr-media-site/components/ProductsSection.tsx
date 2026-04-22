"use client";

import { motion } from "framer-motion";
import { BookOpen, ClipboardCheck, Wrench, ArrowUpRight } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const products = [
  {
    icon: ClipboardCheck,
    badge: "Audit kit",
    price: "$47",
    title: "The Self-Audit Toolkit",
    copy: "A structured framework to audit your website, SEO, ads, content, email, and automation in one weekend.",
  },
  {
    icon: BookOpen,
    badge: "Playbook",
    price: "$97",
    title: "The Lead Generation Playbook",
    copy: "The exact systems behind every lead gen engagement at Mohr Media. Templates included.",
  },
  {
    icon: Wrench,
    badge: "Templates",
    price: "$67",
    title: "High-Converting Landing Page Pack",
    copy: "10 battle-tested landing page templates with copy frameworks and conversion specs.",
  },
];

export default function ProductsSection() {
  return (
    <section id="products" className="relative bg-fog py-24 sm:py-32">
      <div className="container-pad">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={fadeUp} className="eyebrow">
            Products
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="headline mt-6 text-4xl sm:text-5xl"
          >
            Not ready for a system? Start with a playbook.
          </motion.h2>
          <motion.p variants={fadeUp} className="subtle mt-5 text-lg">
            Self-serve frameworks, templates, and audit kits built from live
            client engagements.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {products.map((p) => (
            <motion.a
              key={p.title}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              href="#cta"
              className="group card relative overflow-hidden hover:border-electric/30 hover:shadow-lift"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-white">
                  <p.icon className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-electric/20 bg-mist px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-electric">
                  {p.badge}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-navy">
                {p.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
                {p.copy}
              </p>
              <div className="mt-8 flex items-center justify-between border-t border-navy/5 pt-5">
                <div className="text-2xl font-semibold text-navy">
                  {p.price}
                </div>
                <div className="inline-flex items-center gap-1 text-sm font-semibold text-electric transition-transform duration-300 group-hover:translate-x-1">
                  Get it <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
