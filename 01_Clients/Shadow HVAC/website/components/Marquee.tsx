const items = [
  "24/7 Emergency Service",
  "Fast Response. No Fumbles.",
  "Furnace Repair",
  "AC Installation",
  "Indoor Air Quality",
  "Same-Day Service",
  "Honest Pricing",
  "100% Satisfaction Guarantee",
  "Hampshire · Kane County",
  "Defend Your Comfort Zone",
];

export function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="relative flex overflow-hidden border-y border-white/10 bg-shadow-900/70 py-4">
      <div className="flex shrink-0 animate-marquee items-center gap-8 pr-8">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="whitespace-nowrap font-display text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
          </span>
        ))}
      </div>
      <div className="flex shrink-0 animate-marquee items-center gap-8 pr-8" aria-hidden>
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="whitespace-nowrap font-display text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
          </span>
        ))}
      </div>
    </div>
  );
}
