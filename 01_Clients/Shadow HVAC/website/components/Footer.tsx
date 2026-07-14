import Link from "next/link";
import { Phone, Mail, MapPin, Clock, ArrowUpRight } from "lucide-react";
import { business, nav, services } from "@/lib/site";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  const socialLinks = [
    {
      href: business.social.facebook,
      label: "Facebook",
      icon: "/icons/facebook.svg",
    },
    {
      href: business.social.nextdoor,
      label: "Nextdoor",
      icon: "/icons/nextdoor.svg",
    },
  ];

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
            className="h-20 w-auto rounded-xl bg-white px-3 py-2 shadow-[0_12px_45px_rgba(255,90,31,0.2)]"
            />
          </Link>
          <p className="mt-4 max-w-xs text-sm text-slate-400">
            {business.tagline}. Providing reliable and efficient HVAC solutions for
            year round comfort and peace of mind in Hampshire, IL.
          </p>
          <div className="mt-6">
            <p className="heading text-xs tracking-[0.14em] text-slate-300">Follow Shadow</p>
            <div className="mt-3 grid max-w-xs grid-cols-2 gap-2">
            {socialLinks.map(({ icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={`Follow ${business.name} on ${label}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative isolate flex min-h-20 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-ember/60 hover:bg-ember/10 hover:shadow-[0_16px_42px_rgba(255,90,31,0.24),inset_0_1px_0_rgba(255,255,255,0.18)] active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
              >
                <span className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(255,126,65,0.28),transparent_58%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none" aria-hidden />
                <span className="flex w-full flex-col justify-between gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={icon} alt="" className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none" />
                  <span className="flex items-end justify-between gap-1">
                    <span className="heading text-xs text-white">{label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-ember-light opacity-60 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden />
                  </span>
                </span>
              </a>
            ))}
            </div>
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
