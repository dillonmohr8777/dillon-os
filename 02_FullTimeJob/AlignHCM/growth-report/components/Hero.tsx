"use client";

import { report } from "@/lib/report-data";
import {
  WordReveal,
  CountUp,
  TickLine,
  MagneticButton,
  TiltCard,
} from "./motion-primitives";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(232,131,42,0.18),transparent)]" />
      <div className="relative mx-auto max-w-5xl">
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-align-orange">
          {report.hero.eyebrow} · {report.period}
        </p>
        <WordReveal
          words={report.hero.headline}
          className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl"
        />
        <div className="mt-6">
          <TickLine delay={0.5} />
        </div>
        <p className="mt-6 max-w-2xl text-lg text-slate-300">{report.hero.subhead}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <MagneticButton
            href="#metrics"
            className="rounded-full bg-gradient-to-r from-align-orange to-align-orange-bright px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-align-orange/25"
          >
            View metrics
          </MagneticButton>
          <MagneticButton
            href="#ai-overview"
            className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white backdrop-blur-sm"
          >
            AI Overview
          </MagneticButton>
        </div>
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {report.kpis.map((kpi) => (
            <TiltCard
              key={kpi.label}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
              max={4}
            >
              <p className="text-xs uppercase tracking-wider text-slate-400">{kpi.label}</p>
              <p className="chrome-numeral mt-2 font-display text-3xl font-bold">
                <CountUp
                  value={kpi.value}
                  suffix={kpi.suffix}
                  decimals={"decimals" in kpi ? kpi.decimals : 0}
                />
              </p>
              <p className="mt-1 text-sm font-medium text-align-teal">{kpi.delta}</p>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
