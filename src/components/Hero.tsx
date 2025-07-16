
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, Users } from 'lucide-react';
import { useAuth } from './auth/AuthProvider';

export const Hero = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-3 sm:px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Powerful Messaging
            <span className="text-blue-600"> Platform</span>
          </h1>
          <p className="text-base xs:text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Send SMS, emails, and push notifications at scale. Reach your audience instantly with our reliable messaging infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12">
            <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6">
              <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
                {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6">
              <Link to="/services">
                Learn More
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-8 mt-8 sm:mt-16 md:grid-cols-3">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
              <span className="text-base sm:text-lg font-semibold">SMS Messaging</span>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <Send className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
              <span className="text-base sm:text-lg font-semibold">Email Campaigns</span>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <Users className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
              <span className="text-base sm:text-lg font-semibold">Bulk Messaging</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
