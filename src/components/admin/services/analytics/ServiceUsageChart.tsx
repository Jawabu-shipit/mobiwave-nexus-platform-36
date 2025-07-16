
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface UsageDataPoint {
  date: string;
  usage: number;
  service_type: string;
}

interface ServiceUsageChartProps {
  data: UsageDataPoint[];
}

export function ServiceUsageChart({ data }: ServiceUsageChartProps) {
  // Transform data for chart
  const chartData = data.reduce((acc: any[], item) => {
    const existingDate = acc.find(d => d.date === item.date);
    if (existingDate) {
      existingDate[item.service_type] = item.usage;
    } else {
      acc.push({
        date: item.date,
        [item.service_type]: item.usage
      });
    }
    return acc;
  }, []);

  const colors = {
    sms: '#8884d8',
    ussd: '#82ca9d',
    mpesa: '#ffc658',
    whatsapp: '#ff7300',
    survey: '#0088fe'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Usage Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {Object.entries(colors).map(([service, color]) => (
              <Line
                key={service}
                type="monotone"
                dataKey={service}
                stroke={color}
                strokeWidth={2}
                name={service.toUpperCase()}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
