
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MessageSquare, CreditCard, Users, BarChart, Headphones, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services = () => {
  const mainServices = [
    {
      icon: Phone,
      title: "Bulk SMS",
      description: "Send automated SMS messages to customers with reliable delivery and competitive pricing starting from KES 0.30 per SMS.",
      features: ["Volume-based pricing", "99% delivery rate", "Real-time tracking", "API integration"],
      color: "bg-blue-500"
    },
    {
      icon: MessageSquare,
      title: "USSD Services",
      description: "Offer quick service delivery via USSD codes with dedicated or shared options to suit your business needs.",
      features: ["Dedicated USSD codes", "Shared USSD options", "30-day trial available", "Custom menu development"],
      color: "bg-green-500"
    },
    {
      icon: Users,
      title: "Short Codes",
      description: "Reach clients through dedicated mobile short codes for marketing campaigns and customer engagement.",
      features: ["Dedicated short codes", "Shared options available", "Multi-network support", "Campaign management"],
      color: "bg-purple-500"
    },
    {
      icon: Mail,
      title: "Bulk Email",
      description: "Distribute marketing and notification emails in bulk with professional templates and analytics.",
      features: ["Volume discounts", "Template library", "Analytics tracking", "Delivery optimization"],
      color: "bg-emerald-500"
    },
    {
      icon: CreditCard,
      title: "M-Pesa Integration",
      description: "Automate payment processing through M-Pesa APIs with transparent pricing and reliable transactions.",
      features: ["Seamless integration", "Real-time processing", "Transaction tracking", "Secure payments"],
      color: "bg-orange-500"
    },
    {
      icon: BarChart,
      title: "Survey Tools",
      description: "Create and manage digital surveys for feedback collection with comprehensive reporting.",
      features: ["Custom survey design", "2,000 responses included", "Advanced analytics", "Export capabilities"],
      color: "bg-cyan-500"
    },
    {
      icon: Headphones,
      title: "Service Desk",
      description: "Provide dedicated customer service interfaces with multi-user support and free trial period.",
      features: ["Multi-user support", "Ticket management", "Free 1-month trial", "Custom workflows"],
      color: "bg-indigo-500"
    },
    {
      icon: Gift,
      title: "Airtime & Data Rewards",
      description: "Launch incentive programs via airtime and data rewards to boost customer engagement and loyalty.",
      features: ["Automated rewards", "Flexible criteria", "Real-time distribution", "Usage tracking"],
      color: "bg-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Comprehensive communication solutions designed for Kenyan businesses. 
            Enhance your digital engagement with our reliable and affordable services.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Complete Communication Suite</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mainServices.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <ul className="space-y-1 mb-4">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-xs">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full" size="sm">
                    <Link to="/pricing">View Pricing</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Mobiwave */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose Mobiwave?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold">Local Expertise</h3>
                    <p className="text-gray-600">Deep understanding of the Kenyan market with localized solutions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold">Competitive Pricing</h3>
                    <p className="text-gray-600">Transparent, volume-based pricing with no hidden fees.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold">Reliable Infrastructure</h3>
                    <p className="text-gray-600">99% uptime with robust systems and local network partnerships.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold">Easy Integration</h3>
                    <p className="text-gray-600">Simple APIs and comprehensive documentation for quick implementation.</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
                alt="Kenyan business technology"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of Kenyan businesses already using Mobiwave to enhance their customer communication.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/auth">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
