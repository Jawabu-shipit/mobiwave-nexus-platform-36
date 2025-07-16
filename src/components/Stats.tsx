
import React from 'react';

export const Stats = () => {
  const stats = [
    {
      number: "10M+",
      label: "Messages Delivered",
      description: "Monthly message volume"
    },
    {
      number: "99.9%",
      label: "Uptime",
      description: "Reliable service guarantee"
    },
    {
      number: "50+",
      label: "Countries",
      description: "Global coverage"
    },
    {
      number: "24/7",
      label: "Support",
      description: "Always here to help"
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-blue-600">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
            Trusted by businesses worldwide
          </h2>
          <p className="text-base sm:text-xl text-blue-100 max-w-2xl mx-auto">
            Join thousands of companies using Mobiwave to power their communications.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-5 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2">
                {stat.number}
              </div>
              <div className="text-base sm:text-xl font-semibold text-blue-100 mb-0.5 sm:mb-1">
                {stat.label}
              </div>
              <div className="text-blue-200 text-xs sm:text-base">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
