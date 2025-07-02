
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RevenueDataPoint {
  month: string;
  revenue: number;
  subscriptions: number;
}

interface ServiceRevenueChartProps {
  data: RevenueDataPoint[];
}

export function ServiceRevenueChart({ data }: ServiceRevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue & Subscriptions</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip formatter={(value, name) => [
              name === 'revenue' ? `KES ${value.toLocaleString()}` : value,
              name === 'revenue' ? 'Revenue' : 'Subscriptions'
            ]} />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue (KES)" />
            <Bar yAxisId="right" dataKey="subscriptions" fill="#82ca9d" name="Subscriptions" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
