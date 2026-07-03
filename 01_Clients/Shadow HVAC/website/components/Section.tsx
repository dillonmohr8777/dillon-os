import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function Section({
  children,
  id,
  className = "",
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`container-px py-20 sm:py-28 ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
  accent = "heat",
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  align?: "center" | "left";
  accent?: "heat" | "cool";
}) {
  return (
    <Reveal
      className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : "text-left"}`}
    >
      {eyebrow && (
        <span className="eyebrow mb-5">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              accent === "heat" ? "bg-ember" : "bg-ice"
            }`}
          />
          {eyebrow}
        </span>
      )}
      <h2 className="heading text-3xl leading-[1.05] text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {sub && <p className="mt-5 text-base leading-relaxed text-slate-400 sm:text-lg">{sub}</p>}
    </Reveal>
  );
}
