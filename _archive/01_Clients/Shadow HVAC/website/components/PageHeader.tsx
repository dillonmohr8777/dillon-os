import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Reveal } from "./Reveal";

export function PageHeader({
  eyebrow,
  title,
  sub,
  crumb,
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  crumb: string;
}) {
  return (
    <header className="relative overflow-hidden border-b border-white/10 pt-32 pb-16 sm:pt-40 sm:pb-20">
      <div className="field-lines absolute inset-0 opacity-40" aria-hidden />
      <div
        className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-ember/20 blur-[120px]"
        aria-hidden
      />
      <div
        className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-ice/20 blur-[120px]"
        aria-hidden
      />
      <div className="container-px relative">
        <Reveal>
          <nav className="mb-5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-ember-light">{crumb}</span>
          </nav>
          {eyebrow && <span className="eyebrow mb-4">{eyebrow}</span>}
          <h1 className="heading max-w-4xl text-4xl leading-[1.03] text-white sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {sub && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {sub}
            </p>
          )}
        </Reveal>
      </div>
    </header>
  );
}
