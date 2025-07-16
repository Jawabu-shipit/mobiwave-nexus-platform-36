
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Zap, Shield, BarChart3, Globe, Clock } from 'lucide-react';

export const Features = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Multi-Channel Messaging",
      description: "Send SMS, emails, and push notifications from one unified platform."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Messages delivered instantly with our high-performance infrastructure."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track delivery rates, engagement, and campaign performance in real-time."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Send messages worldwide with local carrier connections."
    },
    {
      icon: Clock,
      title: "Scheduled Sending",
      description: "Schedule messages for optimal delivery times across time zones."
    }
  ];

  return (
    <section id="features" className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Everything you need to connect
          </h2>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help you reach your audience effectively and efficiently.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <feature.icon className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-sm sm:text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
