"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";

const links = [
  { label: "Services", href: "#services" },
  { label: "Method", href: "#method" },
  { label: "Results", href: "#results" },
  { label: "Products", href: "#products" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-navy/5 bg-white/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="container-pad flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-navy">
            <span className="absolute inset-0 rounded-lg bg-electric/50 blur-md" />
            <span className="relative text-xs font-bold text-white">M</span>
          </span>
          <span className="text-sm font-semibold tracking-tight text-navy">
            Mohr Media
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink/70 transition-colors hover:text-navy"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="#cta" className="btn-primary hidden md:inline-flex">
            Book a Strategy Call
            <ArrowRight className="h-4 w-4" />
          </a>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden rounded-lg border border-navy/10 p-2 text-navy"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-navy/5 bg-white md:hidden"
        >
          <div className="container-pad flex flex-col gap-4 py-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-ink"
              >
                {l.label}
              </a>
            ))}
            <a href="#cta" className="btn-primary w-full">
              Book a Strategy Call
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
