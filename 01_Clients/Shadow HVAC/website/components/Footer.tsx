import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { business, nav, services } from "@/lib/site";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-shadow-950">
      <div className="field-lines absolute inset-0 opacity-40" aria-hidden />
      <div className="container-px relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/logo.png"
              alt={business.name}
              className="h-12 w-auto rounded-lg bg-white px-2.5 py-1.5"
            />
          </Link>
          <p className="mt-4 max-w-xs text-sm text-slate-400">
            {business.tagline}. Providing reliable and efficient HVAC solutions for
            year-round comfort and peace of mind in Hampshire, IL.
          </p>
          <div className="mt-5 flex gap-3">
            {[
              { Icon: Facebook, href: business.social.facebook, label: "Facebook" },
              { Icon: Instagram, href: business.social.instagram, label: "Instagram" },
              { Icon: Twitter, href: business.social.twitter, label: "Twitter" },
              { Icon: Youtube, href: business.social.youtube, label: "YouTube" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-slate-400 transition-colors hover:border-ember/50 hover:text-ember-light"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="heading text-sm text-white">Quick Links</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-slate-400 transition-colors hover:text-ember-light"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="heading text-sm text-white">Services</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {services.slice(0, 6).map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services#${s.slug}`}
                  className="text-slate-400 transition-colors hover:text-ice-light"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="heading text-sm text-white">Get In Touch</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li>
              <a href={business.phoneHref} className="flex items-center gap-2.5 hover:text-white">
                <Phone className="h-4 w-4 text-ember" /> {business.phone}
              </a>
            </li>
            <li>
              <a href={business.emailHref} className="flex items-center gap-2.5 hover:text-white">
                <Mail className="h-4 w-4 text-ice" /> {business.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-gold" /> {business.address.full}
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-ember-light" /> {business.hours}
            </li>
          </ul>
          <div className="mt-5">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-px flex flex-col items-center justify-between gap-3 py-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {business.name}. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 animate-pulse-glow rounded-full bg-ember" />
            {business.subTagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
