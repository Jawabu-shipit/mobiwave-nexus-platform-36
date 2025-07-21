
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ = () => {
  const faqs = [
    {
      question: "How quickly are messages delivered?",
      answer: "Messages are typically delivered within seconds. Our global infrastructure ensures rapid delivery across all supported countries with 99.9% uptime."
    },
    {
      question: "Do you support international messaging?",
      answer: "Yes, we support messaging to over 200 countries worldwide with local carrier connections for optimal delivery rates and competitive pricing."
    },
    {
      question: "Is there an API available?",
      answer: "Absolutely! We provide comprehensive REST APIs with detailed documentation, SDKs for popular programming languages, and webhook support for real-time updates."
    },
    {
      question: "How do you ensure message security?",
      answer: "We use enterprise-grade encryption, comply with GDPR and HIPAA requirements, and maintain SOC 2 certification. All data is encrypted in transit and at rest."
    },
    {
      question: "What's included in the free trial?",
      answer: "The free trial includes 100 SMS credits, access to all features, API access, and full customer support. No credit card required to get started."
    },
    {
      question: "Can I schedule messages in advance?",
      answer: "Yes, you can schedule messages for any future date and time. Our system supports timezone-aware scheduling and bulk scheduling for campaigns."
    },
    {
      question: "Do you provide delivery analytics?",
      answer: "We provide comprehensive analytics including delivery rates, click-through rates, open rates (for supported channels), and detailed reporting dashboards."
    },
    {
      question: "How does pricing work?",
      answer: "We offer transparent, pay-as-you-go pricing with no hidden fees. Volume discounts are available for high-usage accounts. Check our pricing page for detailed rates."
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about Mobiwave's messaging platform
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-3 sm:px-6">
                <AccordionTrigger className="text-left text-base sm:text-lg font-semibold py-4 sm:py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-4 sm:pb-6 text-sm sm:text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <div className="text-center mt-8 sm:mt-12">
          <p className="text-gray-600 mb-3 sm:mb-4">Still have questions?</p>
          <a 
            href="/contact" 
            className="text-blue-600 hover:text-blue-700 font-semibold underline"
          >
            Contact our support team
          </a>
        </div>
      </div>
    </section>
  );
};
