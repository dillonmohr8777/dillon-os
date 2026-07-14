import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, ShieldCheck, Zap, Percent, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { CTABand } from "@/components/CTABand";
import { ProjectProof } from "@/components/ProjectProof";
import { financing } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Financing",
  description:
    "Flexible HVAC financing through GoodLeap and warranty protection through JB Warranties. Affordable monthly payments on new installations in Hampshire, IL.",
  path: "/financing",
});

const icons = [CreditCard, Zap, Percent, ShieldCheck];

export default function FinancingPage() {
  return (
    <>
      <PageHeader
        crumb="Financing"
        eyebrow="Comfort Now, Pay Over Time"
        title={
          <>
            Flexible <span className="text-gradient-heat">financing options</span>
          </>
        }
        sub="A new comfort system shouldn't break the bank. We offer flexible financing so you can upgrade today and pay in affordable monthly installments."
      />

      <Section className="!pt-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {financing.points.map((p, i) => {
            const Icon = icons[i % icons.length];
            return (
              <Reveal key={p.title} delay={(i % 2) * 0.08}>
                <div className="card h-full p-7">
                  <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl border border-ember/30 bg-ember/10 text-ember-light">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="heading text-lg text-white">{p.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{p.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-14 rounded-3xl border border-white/10 bg-shadow-800/50 p-8 text-center sm:p-12">
          <h2 className="heading text-2xl text-white">Our financing partners</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate-400">
            We work with trusted partners to make your upgrade affordable and protected.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {financing.partners.map((name) => (
              <div
                key={name}
                className="rounded-2xl border border-white/10 bg-shadow-900 px-8 py-5 font-display text-xl font-bold uppercase tracking-wide text-white"
              >
                {name}
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/book-a-service" className="btn-ember">
              Get a Free Estimate <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </Section>

      <ProjectProof variant="investment" />

      <CTABand />
    </>
  );
}
