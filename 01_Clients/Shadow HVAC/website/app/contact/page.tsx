import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock, Navigation } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "@/components/ContactForm";
import { ProjectProof } from "@/components/ProjectProof";
import { business } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Shadow Heating & Cooling in Hampshire, IL. Call (847) 757 9450, email us, or send a message. 24/7 emergency service available.",
};

const cards = [
  {
    icon: Phone,
    label: "Call Us",
    value: business.phone,
    href: business.phoneHref,
    tone: "ember" as const,
  },
  {
    icon: Mail,
    label: "Email Us",
    value: business.email,
    href: business.emailHref,
    tone: "ice" as const,
  },
  {
    icon: MapPin,
    label: "Visit Us",
    value: business.address.full,
    href: "https://maps.google.com/?q=334+E+Grove+Hampshire+IL+60140",
    tone: "gold" as const,
  },
  {
    icon: Clock,
    label: "Hours",
    value: business.hours,
    tone: "ember" as const,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        crumb="Contact"
        eyebrow="Get In Touch"
        title={
          <>
            Let's defend your <span className="text-gradient-heat">comfort zone</span>
          </>
        }
        sub="Questions, quotes, or emergencies? Reach out any way you like. We answer 24/7 for heating and cooling emergencies."
      />

      <Section className="!pt-16">
        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => {
            const Icon = c.icon;
            const inner = (
              <div className="card h-full p-6">
                <div
                  className={`mb-4 grid h-11 w-11 place-items-center rounded-xl border ${
                    c.tone === "ember"
                      ? "border-ember/30 bg-ember/10 text-ember-light"
                      : c.tone === "ice"
                        ? "border-ice/30 bg-ice/10 text-ice-light"
                        : "border-gold/30 bg-gold/10 text-gold"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {c.label}
                </p>
                <p className="mt-1 text-sm font-medium text-white">{c.value}</p>
              </div>
            );
            return (
              <Reveal key={c.label} delay={i * 0.06}>
                {c.href ? (
                  <a href={c.href} target="_blank" rel="noreferrer" className="block h-full">
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </Reveal>
            );
          })}
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <ContactForm />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="card relative flex h-full min-h-[360px] flex-col justify-end overflow-hidden p-8">
              <div className="field-lines absolute inset-0 opacity-40" aria-hidden />
              <div
                className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-ember/20 blur-[90px]"
                aria-hidden
              />
              <div
                className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-ice/20 blur-[90px]"
                aria-hidden
              />
              <div className="relative">
                <MapPin className="h-8 w-8 text-ember" />
                <h3 className="heading mt-4 text-2xl text-white">Shadow HQ</h3>
                <p className="mt-2 text-slate-300">{business.address.full}</p>
                <p className="mt-1 text-sm text-slate-400">
                  Locally owned & operated · Serving Hampshire and Kane County
                </p>
                <a
                  href="https://maps.google.com/?q=334+E+Grove+Hampshire+IL+60140"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ice mt-6 w-fit"
                >
                  <Navigation className="h-4 w-4" /> Get Directions
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      <ProjectProof variant="local" />
    </>
  );
}
