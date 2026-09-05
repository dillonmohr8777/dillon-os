import Link from "next/link";
import { Phone } from "lucide-react";
import { business } from "@/lib/site";
import { Reveal } from "./Reveal";

export function CTABand() {
  return (
    <section className="container-px py-20">
      <Reveal className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-shadow-800 to-shadow-900 px-6 py-14 text-center sm:px-12 sm:py-20">
        <div
          className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-ember/25 blur-[100px]"
          aria-hidden
        />
        <div
          className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-ice/25 blur-[100px]"
          aria-hidden
        />
        <div className="relative">
          <span className="eyebrow mb-5">Fast Response. No Fumbles.</span>
          <h2 className="heading mx-auto max-w-2xl text-3xl leading-tight text-white sm:text-4xl md:text-5xl">
            Ready to <span className="text-gradient-heat">defend your comfort zone?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Book online in under a minute, or call now for 24/7 emergency service in
            Hampshire and Kane County.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/book-a-service" className="btn-ember w-full sm:w-auto">
              Book Service
            </Link>
            <a href={business.phoneHref} className="btn-ghost w-full sm:w-auto">
              <Phone className="h-4 w-4" /> Call {business.phone}
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
