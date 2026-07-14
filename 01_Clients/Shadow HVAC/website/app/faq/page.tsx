import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { FaqAccordion } from "@/components/FaqAccordion";
import { CTABand } from "@/components/CTABand";
import { ProjectProof } from "@/components/ProjectProof";
import { faqs } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to the most common questions about Shadow Heating & Cooling's HVAC services, scheduling, maintenance, financing, and warranties.",
};

export default function FaqPage() {
  return (
    <>
      <PageHeader
        crumb="FAQ"
        eyebrow="Most Popular Questions"
        title={
          <>
            Questions? <span className="text-gradient-cool">We've got answers</span>
          </>
        }
        sub="Everything you need to know about working with Shadow Heating & Cooling. Still stuck? Give us a call — we're happy to help."
      />

      <Section className="!pt-16">
        <FaqAccordion items={faqs} />
      </Section>

      <ProjectProof variant="answers" />

      <CTABand />
    </>
  );
}
