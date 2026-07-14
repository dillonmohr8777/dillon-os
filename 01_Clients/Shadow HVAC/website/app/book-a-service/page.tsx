import type { Metadata } from "next";
import { Phone, Mail, Clock, Zap, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { BookingForm } from "@/components/BookingForm";
import { ProjectProof } from "@/components/ProjectProof";
import { business } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Book A Service",
  description:
    "Book your HVAC service with Shadow Heating & Cooling. Choose the best plan for you and schedule online, or call 24/7 for emergency service in Hampshire, IL.",
  path: "/book-a-service",
});

export default function BookPage() {
  return (
    <>
      <PageHeader
        crumb="Book A Service"
        eyebrow="Book Your Service"
        title={
          <>
            Choose the best HVAC <span className="text-gradient-heat">plan for you</span>
          </>
        }
        sub="Providing reliable and efficient HVAC solutions for year round comfort and peace of mind. Request service in three quick steps."
      />

      <Section className="!pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr,1fr]">
          <Reveal>
            <BookingForm />
          </Reveal>

          <Reveal delay={0.1} className="space-y-5">
            <div className="card p-6">
              <div className="flex items-center gap-2 text-ember-light">
                <Zap className="h-5 w-5" />
                <h3 className="heading text-lg text-white">Need it now?</h3>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Heat or AC down? Don't wait on a form. Call our 24/7 line and a technician will
                be dispatched right away.
              </p>
              <a href={business.phoneHref} className="btn-ember mt-5 w-full">
                <Phone className="h-4 w-4" /> {business.phone}
              </a>
            </div>

            <div className="card p-6">
              <h3 className="heading text-lg text-white">Prefer to book instantly?</h3>
              <p className="mt-2 text-sm text-slate-400">
                Use our online scheduler to pick your own date and time.
              </p>
              <a
                href={business.bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-ice mt-5 w-full"
              >
                Online Scheduler <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <div className="card p-6">
              <h3 className="heading text-lg text-white">Contact</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-ember" />
                  <a href={business.phoneHref} className="hover:text-white">
                    {business.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-ice" />
                  <a href={business.emailHref} className="hover:text-white">
                    {business.email}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gold" /> {business.hours}
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      <ProjectProof variant="ready" />
    </>
  );
}
