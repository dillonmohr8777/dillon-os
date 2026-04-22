import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import MethodSection from "@/components/MethodSection";
import ServicesGrid from "@/components/ServicesGrid";
import ResultsSection from "@/components/ResultsSection";
import ProductsSection from "@/components/ProductsSection";
import AboutPreview from "@/components/AboutPreview";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <Navbar />
      <Hero />
      <TrustBar />
      <ProblemSection />
      <SolutionSection />
      <MethodSection />
      <ServicesGrid />
      <ResultsSection />
      <ProductsSection />
      <AboutPreview />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
