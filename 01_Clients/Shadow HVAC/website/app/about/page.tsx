import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Section, SectionHeading } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { StatCounter } from "@/components/StatCounter";
import { CTABand } from "@/components/CTABand";
import { aboutValues, team, stats } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Shadow Heating & Cooling is a locally owned residential HVAC provider in Hampshire, IL, dedicated to reliable, honest, year round comfort.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        crumb="About"
        eyebrow="Who We Are"
        title={
          <>
            Trusted residential comfort experts in{" "}
            <span className="text-gradient-cool">Hampshire</span>
          </>
        }
        sub="Shadow Heating & Cooling delivers quality HVAC service with real expertise. Our technicians focus on reliability, honesty, and your satisfaction."
      />

      <Section className="!pt-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="eyebrow mb-5">Our Story</span>
            <h2 className="heading text-3xl text-white sm:text-4xl">
              Comfort is our <span className="text-gradient-heat">home field</span>
            </h2>
            <div className="mt-5 space-y-4 text-slate-400">
              <p>
                Shadow Heating & Cooling was built on a simple idea: your home should be
                comfortable in every season, and getting it that way shouldn't be complicated
                or full of surprises. We're a locally owned team serving Hampshire, IL and the
                surrounding Kane County communities.
              </p>
              <p>
                We position ourselves as your first line of defense. We are fast to respond, honest
                about pricing, and relentless about getting the job done right the first time.
                From emergency furnace calls in the dead of winter to full system upgrades, we
                treat every home like it's on our own block.
              </p>
              <p>
                Our promise is straightforward: reliable and efficient HVAC solutions for
                year round comfort and peace of mind, backed by transparency, professionalism,
                and a 100% satisfaction guarantee.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="card p-6 text-center">
                  <div className="heading text-4xl text-gradient-heat">
                    <StatCounter value={s.value} suffix={s.suffix} />
                  </div>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      <Section className="field-lines !pt-4">
        <SectionHeading
          eyebrow="What We Stand For"
          title="The values behind every call"
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {aboutValues.map((v, i) => (
            <Reveal key={v.title} delay={(i % 3) * 0.08}>
              <div className="card h-full p-6">
                <h3 className="heading text-lg text-white">{v.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="!pt-4">
        <SectionHeading eyebrow="Meet The Team" title="The people who show up" />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.08}>
              <div className="card p-6 text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-shadow-700 to-shadow-900 font-display text-2xl font-bold text-white ring-1 ring-white/10">
                  {m.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <h3 className="heading mt-4 text-base text-white">{m.name}</h3>
                <p className="mt-1 text-sm text-ember-light">{m.role}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <CTABand />
    </>
  );
}
