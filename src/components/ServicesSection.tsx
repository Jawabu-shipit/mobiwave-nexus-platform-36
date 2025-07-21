
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquare, Users, Mail, CreditCard, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ServicesSection = () => {
  const services = [
    {
      icon: Phone,
      title: "Bulk SMS",
      description: "Send automated SMS messages with 99% delivery rate starting from KES 0.30 per SMS.",
      features: ["Volume-based pricing", "Real-time tracking", "API integration"]
    },
    {
      icon: MessageSquare,
      title: "USSD Services",
      description: "Quick service delivery via USSD codes with dedicated or shared options.",
      features: ["Dedicated codes", "30-day trial", "Custom menus"]
    },
    {
      icon: Users,
      title: "Short Codes",
      description: "Reach clients through dedicated mobile short codes for marketing campaigns.",
      features: ["Multi-network support", "Campaign management", "Analytics"]
    },
    {
      icon: Mail,
      title: "Bulk Email",
      description: "Professional email marketing with templates and comprehensive analytics.",
      features: ["Template library", "Analytics tracking", "Volume discounts"]
    },
    {
      icon: CreditCard,
      title: "M-Pesa Integration",
      description: "Seamless payment processing through M-Pesa APIs with real-time tracking.",
      features: ["Secure payments", "Transaction tracking", "Transparent pricing"]
    },
    {
      icon: BarChart,
      title: "Analytics & Reports",
      description: "Comprehensive reporting and analytics for all your communication campaigns.",
      features: ["Real-time insights", "Custom reports", "Performance metrics"]
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Complete Communication Solutions
          </h2>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to connect with your customers across multiple channels
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-5 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8 sm:mb-12">
          {services.map((service, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                  {service.description}
                </p>
                <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-xs sm:text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 sm:mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full">
                  <Link to="/services">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg">
            <Link to="/auth">Start Free Trial</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
