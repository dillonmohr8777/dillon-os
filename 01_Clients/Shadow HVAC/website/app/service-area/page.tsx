import type { Metadata } from "next";
import { MapPin, Clock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { ServiceAreaMap } from "@/components/ServiceAreaMap";
import { CTABand } from "@/components/CTABand";
import { ProjectProof } from "@/components/ProjectProof";
import { serviceAreas, business } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Service Area",
  description:
    "Shadow Heating & Cooling proudly serves Hampshire, IL and surrounding Kane County communities including Huntley, Pingree Grove, Gilberts, Burlington, and Elgin.",
  path: "/service-area",
});

export default function ServiceAreaPage() {
  return (
    <>
      <PageHeader
        crumb="Service Area"
        eyebrow="Where We Work"
        title={
          <>
            Serving Hampshire &amp; <span className="text-gradient-cool">Kane County</span>
          </>
        }
        sub="Based in Hampshire, IL with 24/7 emergency dispatch across the surrounding communities. If you're on the map, we've got you covered."
      />

      <Section className="!pt-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <ServiceAreaMap />
          </Reveal>

          <Reveal delay={0.12}>
            <span className="eyebrow mb-5">Coverage</span>
            <h2 className="heading text-3xl text-white sm:text-4xl">
              Fast response, <span className="text-gradient-heat">local roots</span>
            </h2>
            <p className="mt-4 text-slate-400">
              Our HQ sits right in Hampshire, so we're never far when you need us. We dispatch
              emergency service around the clock across our full coverage area.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {serviceAreas.map((a) => (
                <div
                  key={a.name}
                  className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-shadow-800/50 px-4 py-3"
                >
                  <MapPin
                    className={`h-4 w-4 ${a.primary ? "text-ember" : "text-ice"}`}
                  />
                  <span className="text-sm font-medium text-white">{a.name}</span>
                  {a.note && (
                    <span className="ml-auto text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">
                      {a.note}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-ember/20 bg-ember/5 p-5">
              <Clock className="h-6 w-6 shrink-0 text-ember" />
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-white">24/7 Emergency Dispatch.</span> Don't
                see your town? Call {business.phone}. If you are near Hampshire, we can likely
                help.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      <ProjectProof variant="local" />

      <CTABand />
    </>
  );
}
