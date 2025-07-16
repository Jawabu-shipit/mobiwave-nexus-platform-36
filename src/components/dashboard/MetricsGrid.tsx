
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from 'lucide-react';

const metrics = [
  {
    title: "Total Messages Sent",
    value: "2,847,392",
    change: "+12.5%",
    trend: "up",
    description: "This month",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    title: "Delivery Rate",
    value: "98.7%",
    change: "+0.3%",
    trend: "up",
    description: "Last 24 hours",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    title: "Revenue",
    value: "$47,832",
    change: "+8.2%",
    trend: "up",
    description: "This month",
    gradient: "from-purple-500 to-violet-500"
  },
  {
    title: "Customer Engagement",
    value: "76.4%",
    change: "-2.1%",
    trend: "down",
    description: "Response rate",
    gradient: "from-orange-500 to-red-500"
  }
];

export function MetricsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 px-1 sm:px-0">
      {metrics.map((metric, index) => (
        <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm min-w-0">
          <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-5`} />
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${metric.gradient}`} />
          <CardHeader className="relative pb-2">
            <CardDescription className="text-xs sm:text-sm font-medium text-gray-600">
              {metric.title}
            </CardDescription>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
              {metric.value}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative pt-0">
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-1 ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-500'
              }`}>
                {metric.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-xs sm:text-sm font-semibold">{metric.change}</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {metric.description}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
