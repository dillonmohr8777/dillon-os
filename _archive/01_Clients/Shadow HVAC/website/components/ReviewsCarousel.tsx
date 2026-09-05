"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import type { Review } from "@/lib/site";

export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (n: number) => {
    setDir(n);
    setI((prev) => (prev + n + reviews.length) % reviews.length);
  };

  const r = reviews[i];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-white/10 bg-shadow-800/60 p-8 sm:min-h-[280px] sm:p-12">
        <Quote className="absolute right-8 top-8 h-16 w-16 text-white/5" />
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={i}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-4 flex gap-1">
              {Array.from({ length: r.stars }).map((_, s) => (
                <Star key={s} className="h-5 w-5 fill-gold text-gold" />
              ))}
            </div>
            <blockquote className="font-display text-xl leading-relaxed text-white sm:text-2xl">
              “{r.quote}”
            </blockquote>
            <div className="mt-6">
              <p className="font-semibold text-white">{r.name}</p>
              <p className="text-sm text-slate-400">{r.location}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={() => go(-1)}
          aria-label="Previous review"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-2">
          {reviews.map((_, d) => (
            <button
              key={d}
              onClick={() => {
                setDir(d > i ? 1 : -1);
                setI(d);
              }}
              aria-label={`Go to review ${d + 1}`}
              className={`h-2 rounded-full transition-all ${
                d === i ? "w-6 bg-ember" : "w-2 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => go(1)}
          aria-label="Next review"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/10"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
