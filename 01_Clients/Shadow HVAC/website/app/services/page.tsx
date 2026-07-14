import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { ServiceIcon } from "@/components/ServiceIcon";
import { CTABand } from "@/components/CTABand";
import { ProjectProof } from "@/components/ProjectProof";
import { services } from "@/lib/site";

export const metadata: Metadata = {
  title: "HVAC Services",
  description:
    "Heating, cooling, indoor air quality, maintenance plans, emergency HVAC, and smart thermostat installation in Hampshire, IL and Kane County.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        crumb="Services"
        eyebrow="What We Do"
        title={
          <>
            Expert heating &amp; cooling <span className="text-gradient-heat">solutions</span>
          </>
        }
        sub="Whatever the season throws at your home, Shadow has a play for it. Explore the full lineup of residential HVAC services below."
      />

      <Section className="!pt-16">
        <div className="space-y-6">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 2) * 0.06}>
              <div id={s.slug} className="card scroll-mt-28 overflow-hidden">
                {s.img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.img}
                    alt={`${s.name} — Shadow Heating & Cooling`}
                    className="h-56 w-full object-cover sm:h-72"
                  />
                )}
                <div className="grid gap-8 p-8 md:grid-cols-[auto,1fr] md:items-start">
                <div
                  className={`grid h-16 w-16 place-items-center rounded-2xl border ${
                    s.tone === "ember"
                      ? "border-ember/30 bg-ember/10 text-ember-light"
                      : s.tone === "ice"
                        ? "border-ice/30 bg-ice/10 text-ice-light"
                        : "border-gold/30 bg-gold/10 text-gold"
                  }`}
                >
                  <ServiceIcon icon={s.icon} className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="heading text-2xl text-white sm:text-3xl">{s.name}</h2>
                  <p className="mt-2 max-w-2xl text-slate-400">{s.body}</p>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <Check
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            s.tone === "ember"
                              ? "text-ember-light"
                              : s.tone === "ice"
                                ? "text-ice"
                                : "text-gold"
                          }`}
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/book-a-service"
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-white hover:text-ember-light"
                  >
                    Book this service <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <ProjectProof variant="craft" />

      <CTABand />
    </>
  );
}
