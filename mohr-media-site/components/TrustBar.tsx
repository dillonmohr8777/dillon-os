"use client";

import { motion } from "framer-motion";
import { fadeIn, viewportOnce } from "@/lib/motion";

const logos = [
  "Shadow HVAC",
  "Onsite Concrete",
  "Omega Landscaping",
  "Kimberly James Bridal",
  "Bar Crawl USA",
  "Hardwood Artisan",
  "NKCDC",
  "Link Eze",
];

export default function TrustBar() {
  return (
    <section className="border-y border-navy/5 bg-white py-10">
      <div className="container-pad">
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeIn}
          className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-ink/50"
        >
          Trusted by operators across 9 industries
        </motion.p>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeIn}
          className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 lg:grid-cols-8"
        >
          {logos.map((l) => (
            <div
              key={l}
              className="flex items-center justify-center text-center text-sm font-medium text-ink/60 transition-colors hover:text-navy"
            >
              {l}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
