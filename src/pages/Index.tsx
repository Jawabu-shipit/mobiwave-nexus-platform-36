
import { Hero } from "@/components/Hero";
import { Header } from "@/components/Header";
import { Features } from "@/components/Features";
import { Stats } from "@/components/Stats";
import { ServicesSection } from "@/components/ServicesSection";
import { FAQ } from "@/components/FAQ";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import { AuthBanner } from "@/components/home/AuthBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Index = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        <Header />
        <AuthBanner />
        <Hero />
        <Features />
        <Stats />
        <ServicesSection />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default Index;
