"use client";

const nav = {
  Services: ["Lead Generation", "SEO & Content", "Google Ads", "AI Marketing", "Website Conversion"],
  Company: ["About", "The Mohr Method", "Results", "Contact"],
  Resources: ["Blog", "Products", "Courses", "Audit Kit"],
};

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy text-white">
      <div className="absolute inset-0 bg-grid-pattern [background-size:56px_56px] opacity-[0.08]" />
      <div className="container-pad relative py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <span className="absolute inset-0 rounded-lg bg-electric/40 blur-md" />
                <span className="relative text-sm font-bold text-white">M</span>
              </span>
              <span className="text-base font-semibold tracking-tight">
                Mohr Media
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-mist/70">
              AI-powered marketing systems that generate leads, drive revenue,
              and actually compound. Built by an operator who runs the work
              every day.
            </p>
          </div>

          {Object.entries(nav).map(([group, items]) => (
            <div key={group}>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-mist/50">
                {group}
              </div>
              <ul className="mt-5 space-y-3">
                {items.map((i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-sm text-mist/80 transition-colors hover:text-electric"
                    >
                      {i}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <div className="text-xs text-mist/50">
            © {new Date().getFullYear()} Mohr Media. All rights reserved.
          </div>
          <div className="flex gap-6 text-xs text-mist/60">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
