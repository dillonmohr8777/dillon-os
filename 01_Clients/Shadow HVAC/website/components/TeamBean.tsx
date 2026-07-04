import { Section, SectionHeading } from "./Section";
import { Reveal } from "./Reveal";

/* Meet the Team: the Shadow Bear mascot + Bean, the office cat / Chief Comfort Officer. */
export function TeamBean() {
  return (
    <Section id="team">
      <SectionHeading
        eyebrow="Meet The Team"
        title={
          <>
            Your comfort&apos;s <span className="text-gradient-heat">first line of defense</span>
          </>
        }
        sub="Every job, we bring the same energy: fast response, honest work, and a little Hampshire heart."
      />
      <div className="mt-14 grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <Reveal>
          <div className="card h-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/mascot.jpg"
              alt="The Shadow Bear mascot guarding a home's AC unit"
              className="h-72 w-full object-cover object-[center_22%] sm:h-96"
            />
            <div className="p-7 sm:p-8">
              <h3 className="heading text-2xl text-white">The Shadow Bear</h3>
              <p className="mt-2 text-slate-400">
                Our mascot stands guard over every comfort zone in Hampshire — suited up,
                locked in, and ready to blitz back the moment your heat or AC fumbles. Fast
                response. No fumbles.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="card flex h-full flex-col items-center justify-center p-8 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/bean.jpg"
              alt="Bean the cat, Chief Comfort Officer"
              className="h-40 w-40 rounded-full object-cover shadow-card ring-4 ring-white/10"
            />
            <h3 className="heading mt-5 text-2xl text-white">Bean</h3>
            <span className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-ember-light">
              Chief Comfort Officer
            </span>
            <p className="mt-3 max-w-xs text-sm text-slate-400">
              The real boss around the shop. Bean personally inspects every warm blanket and
              cool breeze, and won&apos;t sign off on a comfort zone until it&apos;s
              nap-approved. Gold chain non-negotiable.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
