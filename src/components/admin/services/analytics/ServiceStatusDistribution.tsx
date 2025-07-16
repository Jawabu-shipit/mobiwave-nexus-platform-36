
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface StatusDataPoint {
  status: string;
  count: number;
}

interface ServiceStatusDistributionProps {
  data: StatusDataPoint[];
}

export function ServiceStatusDistribution({ data }: ServiceStatusDistributionProps) {
  const colors = {
    active: '#10b981',
    pending: '#f59e0b',
    suspended: '#ef4444',
    inactive: '#6b7280'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[entry.status as keyof typeof colors] || '#8884d8'} 
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
