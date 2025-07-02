
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
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Complete Communication Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to connect with your customers across multiple channels
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {service.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
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
