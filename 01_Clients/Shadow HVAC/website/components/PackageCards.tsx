"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { packages } from "@/lib/site";

export function PackageCards() {
  const [annual, setAnnual] = useState(false);
  const factor = annual ? 10 : 1; // 2 months free annually
  const cadence = annual ? "/yr" : "/mo";

  return (
    <div>
      <div className="mb-10 flex items-center justify-center gap-4">
        <span className={`text-sm font-semibold ${!annual ? "text-white" : "text-slate-500"}`}>
          Monthly
        </span>
        <button
          onClick={() => setAnnual((v) => !v)}
          className="relative h-8 w-16 rounded-full border border-white/15 bg-white/5"
          aria-label="Toggle billing period"
        >
          <motion.span
            className="absolute top-1 h-6 w-6 rounded-full bg-gradient-to-br from-ember to-ember-dark"
            animate={{ left: annual ? "2.25rem" : "0.25rem" }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
        <span className={`text-sm font-semibold ${annual ? "text-white" : "text-slate-500"}`}>
          Annual <span className="text-ember-light">(2 mo free)</span>
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {packages.map((p, idx) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
            className={`relative flex flex-col rounded-2xl border p-6 ${
              p.featured
                ? "border-ember/50 bg-gradient-to-b from-ember/10 to-shadow-800 shadow-ember"
                : "border-white/10 bg-shadow-800/60"
            }`}
          >
            {p.featured && (
              <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gradient-to-r from-ember to-ember-dark px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white">
                <Crown className="h-3 w-3" /> Most Popular
              </span>
            )}
            <h3 className="heading text-lg text-white">{p.name}</h3>
            <p className="mt-1 min-h-[2.5rem] text-sm text-slate-400">{p.blurb}</p>
            <div className="mt-4 flex items-end gap-1">
              <span className="heading text-4xl text-white">${p.price * factor}</span>
              <span className="mb-1 text-sm text-slate-400">{cadence}</span>
            </div>
            <ul className="mt-6 flex-1 space-y-3">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <Check
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      p.featured ? "text-ember-light" : "text-ice"
                    }`}
                  />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/book-a-service"
              className={`mt-8 ${p.featured ? "btn-ember" : "btn-ghost"} w-full`}
            >
              Choose {p.name}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
