
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
import { SEO } from "@/components/common/SEO";

const Index = () => {
  // Define structured data for the homepage
  const homePageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Mobiwave Nexus Platform",
    "url": "https://mobiwave.io",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://mobiwave.io/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        {/* SEO Component */}
        <SEO 
          title="Mobile Communication Solutions for Africa"
          description="Mobiwave Nexus Platform offers comprehensive mobile communication solutions including SMS, WhatsApp, USSD, and M-Pesa integrations for businesses in Africa."
          keywords="mobile communication, SMS platform, WhatsApp business, USSD services, M-Pesa integration, bulk messaging, mobile payments, Africa tech"
          structuredData={homePageStructuredData}
        />
        
        <Header />
        <AuthBanner />
        <main>
          <Hero />
          <Features />
          <Stats />
          <ServicesSection />
          <FAQ />
          <CTA />
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default Index;
