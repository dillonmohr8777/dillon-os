import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { CTABand } from "@/components/CTABand";
import { blogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "HVAC Advice",
  description: "Practical heating, cooling, and indoor air quality advice from Shadow Heating and Cooling in Hampshire, Illinois.",
};

export default function BlogPage() {
  return (
    <>
      <PageHeader
        crumb="Advice"
        eyebrow="The Comfort Playbook"
        title={<>Straight answers for a <span className="text-gradient-heat">stronger home</span></>}
        sub="Useful guidance from local technicians who work on real systems across Hampshire and Kane County."
      />
      <Section className="!pt-16">
        <div className="grid gap-7 lg:grid-cols-3">
          {blogPosts.map((post, index) => (
            <Reveal key={post.slug} delay={index * 0.08}>
              <Link href={`/blog/${post.slug}`} className="liquid-frame group block h-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.image} alt={post.imageAlt} className="h-64 w-full object-cover" />
                <div className="relative p-6">
                  <div className="mb-3 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-ember-light">
                    <span>{post.category}</span>
                    <span className="flex items-center gap-1.5 text-slate-500"><Clock3 className="h-3.5 w-3.5" /> {post.readTime}</span>
                  </div>
                  <h2 className="heading text-2xl leading-tight text-white">{post.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{post.excerpt}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white">
                    Read The Guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
      <CTABand />
    </>
  );
}
