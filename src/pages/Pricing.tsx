
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const smsRates = [
    { volume: "1 – 50,000", price: "0.60" },
    { volume: "50,001 – 500,000", price: "0.40" },
    { volume: "500,001 – 2,000,000", price: "0.35" },
    { volume: "Above 2,000,000", price: "0.30" },
  ];

  const emailRates = [
    { volume: "1 – 30,000", price: "0.50" },
    { volume: "40,001 – 80,000", price: "0.40" },
    { volume: "80,001 – 300,000", price: "0.30" },
    { volume: "300,001 – 500,000", price: "0.20" },
    { volume: "Above 500,000", price: "0.15" },
  ];

  const services = [
    {
      title: "USSD Services",
      plans: [
        {
          name: "Shared USSD",
          setupFee: "15,000",
          monthlyFee: "8,000",
          description: "Cost-effective solution for smaller businesses"
        },
        {
          name: "Test-Bed",
          setupFee: "32,000",
          monthlyFee: "—",
          description: "30-day trial for testing your USSD application"
        },
        {
          name: "Dedicated USSD",
          setupFee: "110,000",
          monthlyFee: "40,000",
          description: "Premium solution with dedicated resources"
        }
      ]
    },
    {
      title: "Short Codes",
      plans: [
        {
          name: "Shared Short Code",
          setupFee: "2,500 per network",
          monthlyFee: "15,000",
          description: "Shared short code across multiple clients"
        },
        {
          name: "Dedicated Short Code",
          setupFee: "15,000 per network",
          monthlyFee: "15,000",
          description: "Your own dedicated short code"
        }
      ]
    }
  ];

  const additionalServices = [
    {
      title: "M-Pesa Integration",
      pricing: [
        "Below KES 3,000: 5% per transaction",
        "Above KES 3,000: KES 50 per transaction"
      ],
      note: "Charges are billed monthly"
    },
    {
      title: "Survey Services",
      pricing: [
        "Setup Fee: KES 25,000 + VAT",
        "Monthly Fee: KES 8,000 (up to 2,000 responses)"
      ],
      note: "Requires authorization and 2-week setup"
    },
    {
      title: "Service Desk",
      pricing: [
        "KES 6,000 + VAT per user/month",
        "Free 1-month trial available"
      ],
      note: "Multi-user support included"
    },
    {
      title: "Airtime & Data Rewards",
      pricing: [
        "Custom pricing based on volume",
        "Flexible reward criteria"
      ],
      note: "Contact sales for detailed pricing"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Transparent Pricing</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Volume-based pricing designed for Kenyan businesses. Pay only for what you use with no hidden fees.
          </p>
        </div>
      </section>

      {/* Volume-Based Pricing Tables */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* SMS Pricing */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  📱 Bulk SMS Pricing
                </CardTitle>
                <p className="text-gray-600">Per SMS (KES)</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Monthly Volume</th>
                        <th className="px-4 py-3 text-right font-semibold">Price (KES)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {smsRates.map((rate, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{rate.volume}</td>
                          <td className="px-4 py-3 text-right font-mono">{rate.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Email Pricing */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  📧 Bulk Email Pricing
                </CardTitle>
                <p className="text-gray-600">Per Email (KES)</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Email Volume</th>
                        <th className="px-4 py-3 text-right font-semibold">Price (KES)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {emailRates.map((rate, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{rate.volume}</td>
                          <td className="px-4 py-3 text-right font-mono">{rate.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service-Based Pricing */}
          <h2 className="text-3xl font-bold text-center mb-12">Service Plans</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {services.map((service, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {service.plans.map((plan, planIndex) => (
                      <div key={planIndex} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-lg mb-2">{plan.name}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Setup Fee:</span>
                            <span className="font-mono">KES {plan.setupFee} + VAT</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Monthly Fee:</span>
                            <span className="font-mono">
                              {plan.monthlyFee === "—" ? "—" : `KES ${plan.monthlyFee} + VAT`}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-xs mt-2">{plan.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Services */}
          <h2 className="text-3xl font-bold text-center mb-12">Additional Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {additionalServices.map((service, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {service.pricing.map((price, priceIndex) => (
                      <li key={priceIndex} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{price}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500 italic">{service.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Notes */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Important Notes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">💰 Payment Terms</h3>
                  <ul className="text-sm space-y-2">
                    <li>• All prices are in Kenyan Shillings (KES)</li>
                    <li>• VAT applies where indicated</li>
                    <li>• Volume discounts available for enterprise clients</li>
                    <li>• Monthly billing for most services</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">🚀 Getting Started</h3>
                  <ul className="text-sm space-y-2">
                    <li>• Free trials available for select services</li>
                    <li>• Setup assistance included</li>
                    <li>• 24/7 technical support</li>
                    <li>• Custom enterprise solutions available</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Contact our team for a custom quote or start with our affordable starter plans.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/auth">Get Started Today</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Request Custom Quote</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
