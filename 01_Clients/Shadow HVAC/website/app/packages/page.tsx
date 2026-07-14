import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { PackageCards } from "@/components/PackageCards";
import { CTABand } from "@/components/CTABand";
import { ProjectProof } from "@/components/ProjectProof";

export const metadata: Metadata = {
  title: "Maintenance Packages",
  description:
    "Choose the best HVAC maintenance plan for you — Basic, Standard, Advanced, or Premium. Seasonal tune-ups, priority scheduling, and member savings.",
};

const perks = [
  "Priority scheduling — skip the seasonal wait list",
  "Discounted parts and labor on repairs",
  "Twice-yearly tune-ups that prevent breakdowns",
  "Longer equipment life and lower energy bills",
];

export default function PackagesPage() {
  return (
    <>
      <PageHeader
        crumb="Packages"
        eyebrow="Maintenance Plans"
        title={
          <>
            Choose the best HVAC <span className="text-gradient-heat">plan for you</span>
          </>
        }
        sub="Membership means priority service, reduced costs, and a system that's always ready. Defense wins championships."
      />

      <Section className="!pt-16">
        <PackageCards />

        <Reveal className="mx-auto mt-16 max-w-3xl rounded-3xl border border-white/10 bg-shadow-800/50 p-8 sm:p-10">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-gold" />
            <h2 className="heading text-xl text-white">Every plan includes</h2>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-slate-400">
            Not sure which plan fits? Call us at any time and we'll help you pick the right
            coverage for your home and budget — no pressure, ever.
          </p>
        </Reveal>
      </Section>

      <ProjectProof variant="maintenance" />

      <CTABand />
    </>
  );
}
