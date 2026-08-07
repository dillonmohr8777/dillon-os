import { Hero } from "@/components/Hero";
import { AIOverview } from "@/components/AIOverview";
import { MetricsTables, NextSteps } from "@/components/MetricsSection";

export default function Home() {
  return (
    <>
      <header className="border-b border-white/5 px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-align-orange to-align-orange-bright font-display text-sm font-bold text-white">
              A
            </div>
            <div>
              <p className="font-display text-sm font-bold text-white">Align HCM</p>
              <p className="text-xs text-slate-500">Growth Report</p>
            </div>
          </div>
          <p className="hidden text-xs uppercase tracking-wider text-slate-500 sm:block">
            Confidential · Internal
          </p>
        </div>
      </header>
      <main>
        <Hero />
        <AIOverview />
        <MetricsTables />
        <NextSteps />
      </main>
    </>
  );
}
