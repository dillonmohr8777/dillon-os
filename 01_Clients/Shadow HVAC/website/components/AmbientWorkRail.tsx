"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Camera } from "lucide-react";

const work = [
  {
    src: "/img/shadow-service-truck.jpg",
    alt: "Shadow Heating and Cooling service truck ready for a local call",
    label: "Local response",
  },
  {
    src: "/img/installation-brazing-in-progress.jpg",
    alt: "Shadow technician completing a copper connection during installation",
    label: "Skilled installation",
  },
  {
    src: "/img/carrier-furnace-install.jpg",
    alt: "Carrier furnace installed by Shadow Heating and Cooling",
    label: "Proven equipment",
  },
  {
    src: "/img/recent-installation-condenser.jpg",
    alt: "New outdoor cooling condenser on a dedicated equipment pad",
    label: "Clean finish",
  },
  {
    src: "/img/recent-installation-furnace.jpg",
    alt: "New furnace and whole home humidifier installation",
    label: "Complete comfort",
  },
  {
    src: "/img/furnace-coil-service-open.jpg",
    alt: "Furnace opened for a detailed system inspection",
    label: "Thorough service",
  },
];

export function AmbientWorkRail() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-y border-white/10 py-20">
      <div className="ambient-orb ambient-orb-ember left-[8%] top-1/2" aria-hidden />
      <div className="container-px relative">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 48, filter: "blur(18px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
        >
          <div>
            <span className="eyebrow mb-4"><Camera className="h-3.5 w-3.5" /> From The Field</span>
            <h2 className="heading max-w-2xl text-3xl text-white sm:text-4xl">
              Real work. <span className="text-gradient-heat">Real comfort.</span>
            </h2>
          </div>
          <Link href="/contact" className="btn-ghost w-fit">
            Start Your Project <ArrowUpRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="work-rail">
          {work.map((item, index) => (
            <motion.figure
              key={item.src}
              initial={reduce ? false : { opacity: 0, y: 54, rotateY: index % 2 ? 8 : -8 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.65, delay: index * 0.05 }}
              className="liquid-frame group min-w-[78vw] snap-center overflow-hidden sm:min-w-[22rem] lg:min-w-[24rem]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.src} alt={item.alt} className="h-72 w-full object-cover sm:h-80" />
              <figcaption className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/15 bg-shadow-950/65 px-4 py-3 text-sm font-semibold text-white backdrop-blur-xl">
                {item.label}
              </figcaption>
            </motion.figure>
          ))}
        </div>
        <p className="mt-5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:hidden">
          Swipe to see more work
        </p>
      </div>
    </section>
  );
}
