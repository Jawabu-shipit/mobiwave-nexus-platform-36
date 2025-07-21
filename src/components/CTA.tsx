
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from './auth/AuthProvider';

export const CTA = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Ready to get started?
          </h2>
          <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using Mobiwave to power their messaging campaigns. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6">
              <Link to={isAuthenticated ? "/dashboard" : "/auth"} className="flex items-center gap-2">
                {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6">
              <Link to="/contact">
                Contact Sales
              </Link>
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};
