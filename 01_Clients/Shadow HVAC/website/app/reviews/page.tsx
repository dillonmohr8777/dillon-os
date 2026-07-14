import type { Metadata } from "next";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { ReviewsCarousel } from "@/components/ReviewsCarousel";
import { CTABand } from "@/components/CTABand";
import { ProjectProof } from "@/components/ProjectProof";
import { reviews } from "@/lib/site";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "Read five star reviews from Hampshire, IL homeowners who trust Shadow Heating & Cooling for fast, honest, professional HVAC service.",
};

export default function ReviewsPage() {
  return (
    <>
      <PageHeader
        crumb="Reviews"
        eyebrow="Five Star Local Reviews"
        title={
          <>
            Trusted by <span className="text-gradient-heat">Hampshire neighbors</span>
          </>
        }
        sub="Fast response, honest pricing, and work that lasts. Here is what our customers have to say."
      />

      <Section className="!pt-16">
        <Reveal className="mx-auto mb-14 flex max-w-md items-center justify-center gap-6 rounded-2xl border border-white/10 bg-shadow-800/50 p-6 text-center">
          <div>
            <div className="heading text-5xl text-gold">5.0</div>
            <div className="mt-1 flex justify-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-gold text-gold" />
              ))}
            </div>
          </div>
          <div className="h-12 w-px bg-white/10" />
          <p className="text-left text-sm text-slate-400">
            Based on verified reviews from homeowners across Hampshire and Kane County.
          </p>
        </Reveal>

        <ReviewsCarousel reviews={reviews} />

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.name} delay={(i % 3) * 0.08}>
              <div className="card h-full p-6">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: r.stars }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-slate-300">“{r.quote}”</p>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="font-semibold text-white">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.location}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <ProjectProof variant="trust" />

      <CTABand />
    </>
  );
}
