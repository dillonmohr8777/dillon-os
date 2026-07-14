import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { FaqAccordion } from "@/components/FaqAccordion";
import { CTABand } from "@/components/CTABand";
import { ProjectProof } from "@/components/ProjectProof";
import { faqs } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "FAQ",
  description:
    "Answers to the most common questions about Shadow Heating & Cooling's HVAC services, scheduling, maintenance, financing, and warranties.",
  path: "/faq",
});

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PageHeader
        crumb="FAQ"
        eyebrow="Most Popular Questions"
        title={
          <>
            Questions? <span className="text-gradient-cool">We've got answers</span>
          </>
        }
        sub="Everything you need to know about working with Shadow Heating & Cooling. Still stuck? Give us a call. We are happy to help."
      />

      <Section className="!pt-16">
        <FaqAccordion items={faqs} />
      </Section>

      <ProjectProof variant="answers" />

      <CTABand />
    </>
  );
}
