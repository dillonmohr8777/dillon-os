import Link from "next/link";
import { Phone, ArrowRight, ShieldCheck, Clock, Star, MapPin } from "lucide-react";
import { Hero3D } from "@/components/Hero3D";
import { Section, SectionHeading } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { Marquee } from "@/components/Marquee";
import { StatCounter } from "@/components/StatCounter";
import { ServiceIcon } from "@/components/ServiceIcon";
import { ThermostatDial } from "@/components/ThermostatDial";
import { ReviewsCarousel } from "@/components/ReviewsCarousel";
import { TeamBean } from "@/components/TeamBean";
import { CTABand } from "@/components/CTABand";
import {
  business,
  stats,
  valueProps,
  services,
  playbook,
  process,
  reviews,
} from "@/lib/site";

export default function HomePage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-20">
        <Hero3D />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-shadow-950 via-shadow-950/40 to-transparent" />
        <div className="container-px relative z-10 py-20">
          <Reveal>
            <span className="eyebrow mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-ember" />
              {business.subTagline}
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="heading max-w-4xl text-5xl leading-[0.95] text-white sm:text-6xl md:text-7xl lg:text-8xl">
              Heating &amp; cooling built for{" "}
              <span className="text-gradient-heat">every season</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              Residential HVAC service for Hampshire and the surrounding areas.
              Locally owned, 24/7 ready, and relentless about your comfort.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/book-a-service" className="btn-ember">
                Book Service <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={business.phoneHref} className="btn-ghost">
                <Phone className="h-4 w-4" /> Call Now
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.32}>
            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-ember" /> 24/7 Emergency
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-ice" /> 100% Guarantee
              </span>
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4 text-gold" /> 5-Star Local Reviews
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-ember-light" /> Hampshire, IL
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <Marquee />

      {/* ===== STATS ===== */}
      <Section className="!py-16">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="card p-6 text-center">
                <div className="heading text-4xl text-gradient-heat sm:text-5xl">
                  <StatCounter value={s.value} suffix={s.suffix} />
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ===== VALUE PROPS ===== */}
      <Section id="why" className="!pt-4">
        <SectionHeading
          eyebrow="Why Shadow"
          title={
            <>
              Comfort you can <span className="text-gradient-cool">count on</span>
            </>
          }
          sub="Trusted residential heating & cooling experts in the Hampshire area — experienced, local, and honest about pricing."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08}>
              <div className="card h-full p-6">
                <div
                  className={`mb-4 h-1 w-10 rounded-full ${
                    v.tone === "ember"
                      ? "bg-ember"
                      : v.tone === "ice"
                        ? "bg-ice"
                        : "bg-gold"
                  }`}
                />
                <h3 className="heading text-lg text-white">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ===== SERVICES ===== */}
      <Section id="services">
        <SectionHeading
          eyebrow="Our Services"
          title={
            <>
              Expert solutions for <span className="text-gradient-heat">you</span>
            </>
          }
          sub="From emergency repairs to full system installs, we do it all — and we do it right the first time."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 3) * 0.08}>
              <Link
                href={`/services#${s.slug}`}
                className="group card block h-full overflow-hidden transition-all hover:-translate-y-1 hover:border-white/20"
              >
                {s.img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.img}
                    alt={s.name}
                    className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="p-7">
                <div
                  className={`mb-5 ${s.img ? "hidden " : ""}grid h-14 w-14 place-items-center rounded-2xl border ${
                    s.tone === "ember"
                      ? "border-ember/30 bg-ember/10 text-ember-light"
                      : s.tone === "ice"
                        ? "border-ice/30 bg-ice/10 text-ice-light"
                        : "border-gold/30 bg-gold/10 text-gold"
                  }`}
                >
                  <ServiceIcon icon={s.icon} className="h-7 w-7" />
                </div>
                <h3 className="heading text-xl text-white">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.short}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white opacity-70 transition-opacity group-hover:opacity-100">
                  Learn more{" "}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ===== RECENT INSTALLATION ===== */}
      <Section id="recent-installation" className="field-lines">
        <div className="max-w-3xl">
          <h2 className="heading text-4xl leading-tight text-white sm:text-5xl">
            Real equipment. <span className="text-gradient-cool">Clean installation.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            A closer look at a recent residential heating and cooling system,
            from the outdoor condenser to the indoor furnace and whole-home humidifier.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 md:items-start">
          <Reveal>
            <figure className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/recent-installation-condenser.jpg"
                alt="Ameristar outdoor air conditioning condenser installed beside a home"
                width="1200"
                height="1600"
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover"
              />
              <figcaption className="p-6">
                <h3 className="heading text-xl text-white">Outdoor cooling system</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Ameristar condenser set level on a dedicated equipment pad.
                </p>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.1}>
            <figure className="card overflow-hidden md:mt-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/recent-installation-furnace.jpg"
                alt="American Standard furnace with Aprilaire whole-home humidifier"
                width="1200"
                height="1600"
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover"
              />
              <figcaption className="p-6">
                <h3 className="heading text-xl text-white">Heating and air quality</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  American Standard furnace paired with Aprilaire whole-home humidification.
                </p>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal>
            <figure className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/installation-brazing-in-progress.jpg"
                alt="Shadow technician brazing copper refrigerant lines during a residential HVAC installation"
                width="1200"
                height="1600"
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover"
              />
              <figcaption className="p-6">
                <h3 className="heading text-xl text-white">Installation in progress</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Copper refrigerant connections made carefully on site by a Shadow technician.
                </p>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.1}>
            <figure className="card overflow-hidden md:mt-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/furnace-coil-service-open.jpg"
                alt="Open furnace cabinet showing the evaporator coil, controls, and service tools"
                width="1200"
                height="1600"
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover"
              />
              <figcaption className="p-6">
                <h3 className="heading text-xl text-white">Inside the system</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Coil, controls, and airflow components checked before the final panels go on.
                </p>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </Section>

      {/* ===== CHAMPIONSHIP PLAYBOOK + THERMOSTAT ===== */}
      <Section id="playbook" className="field-lines">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="The Championship Playbook"
              title={
                <>
                  Our game plan for <span className="text-gradient-heat">total comfort</span>
                </>
              }
              sub="Four downs, every job. This is how Shadow defends your comfort zone from the first call to the final tune-up."
            />
            <div className="mt-10 space-y-4">
              {playbook.map((p, i) => (
                <Reveal key={p.num} delay={i * 0.08}>
                  <div className="flex gap-5 rounded-2xl border border-white/[0.06] bg-shadow-800/40 p-5">
                    <span className="heading text-3xl text-gradient-cool">{p.num}</span>
                    <div>
                      <h3 className="heading text-lg text-white">{p.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">{p.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={0.15}>
            <ThermostatDial />
          </Reveal>
        </div>
      </Section>

      {/* ===== PROCESS ===== */}
      <Section id="process">
        <SectionHeading
          eyebrow="How It Works"
          title="Simple, from first call to comfort"
          sub="Three steps to defended comfort: select your service, choose a time, and we restore your comfort."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {process.map((p, i) => (
            <Reveal key={p.step} delay={i * 0.08}>
              <div className="relative card h-full p-6">
                <span className="heading text-5xl text-white/[0.07]">{p.step}</span>
                <h3 className="heading mt-2 text-lg text-white">{p.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ===== REVIEWS ===== */}
      <Section id="reviews" className="field-lines">
        <SectionHeading
          eyebrow="5-Star Local Reviews"
          title={
            <>
              What Hampshire <span className="text-gradient-cool">neighbors say</span>
            </>
          }
        />
        <div className="mt-14">
          <ReviewsCarousel reviews={reviews} />
        </div>
      </Section>

      <TeamBean />

      <CTABand />
    </>
  );
}
