"use client";

import { report } from "@/lib/report-data";
import { RevealPop, TickLine } from "./motion-primitives";

export function MetricsTables() {
  return (
    <section id="metrics" className="px-5 py-20 sm:px-8">
      <div className="mx-auto grid max-w-5xl gap-16 lg:grid-cols-2">
        <RevealPop>
          <TickLine />
          <h2 className="mt-4 font-display text-2xl font-bold text-white">
            {report.linkedin.title}
          </h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4">Author</th>
                  <th className="pb-3 pr-4">Posts</th>
                  <th className="pb-3 pr-4">Impressions</th>
                  <th className="pb-3">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {report.linkedin.rows.map((row) => (
                  <tr key={row.author} className="border-b border-white/5">
                    <td className="py-3 pr-4 font-medium text-white">{row.author}</td>
                    <td className="py-3 pr-4 text-slate-300">{row.posts}</td>
                    <td className="py-3 pr-4 text-slate-300">
                      {row.impressions.toLocaleString()}
                    </td>
                    <td className="py-3 text-align-teal">{row.engagement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </RevealPop>

        <RevealPop delay={0.15}>
          <TickLine delay={0.1} />
          <h2 className="mt-4 font-display text-2xl font-bold text-white">
            {report.seo.title}
          </h2>
          <ul className="mt-6 space-y-4">
            {report.seo.rows.map((row) => (
              <li
                key={row.title}
                className="flex items-start justify-between gap-4 border-b border-white/5 pb-4"
              >
                <span className="text-sm text-slate-200">{row.title}</span>
                <span className="shrink-0 text-right">
                  <span className="block font-display text-lg font-semibold text-white">
                    {row.views.toLocaleString()}
                  </span>
                  <span className="text-xs text-align-teal">{row.delta}</span>
                </span>
              </li>
            ))}
          </ul>
        </RevealPop>
      </div>
    </section>
  );
}

export function NextSteps() {
  return (
    <section className="px-5 pb-24 pt-8 sm:px-8">
      <RevealPop>
        <div className="mx-auto max-w-5xl rounded-2xl border border-align-orange/30 bg-gradient-to-br from-align-orange/10 to-transparent p-8">
          <h2 className="font-display text-2xl font-bold text-white">Next steps</h2>
          <ul className="mt-6 space-y-3">
            {report.nextSteps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-300">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-align-orange/20 text-xs font-bold text-align-orange">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-xs text-slate-500">
            Prepared by {report.preparedBy} · {report.client} · {report.period}
          </p>
        </div>
      </RevealPop>
    </section>
  );
}
