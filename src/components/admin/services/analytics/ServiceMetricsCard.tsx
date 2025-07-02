
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ServiceMetricsCardProps {
  title: string;
  value: number;
  format?: 'number' | 'currency' | 'percentage';
  previousValue?: number;
  icon?: React.ReactNode;
}

export function ServiceMetricsCard({ 
  title, 
  value, 
  format = 'number', 
  previousValue, 
  icon 
}: ServiceMetricsCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-KE', {
          style: 'currency',
          currency: 'KES'
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const calculateChange = () => {
    if (!previousValue) return null;
    const change = ((value - previousValue) / previousValue) * 100;
    return change.toFixed(1);
  };

  const change = calculateChange();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change && (
          <p className={`text-xs ${Number(change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Number(change) >= 0 ? '+' : ''}{change}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}
