
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Brain,
  Zap,
  Users,
  DollarSign
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function PredictiveAnalytics() {
  const [predictionModel, setPredictionModel] = useState('revenue');
  const [timeHorizon, setTimeHorizon] = useState('3m');

  const predictionData = [
    { month: 'Jan', actual: 45000, predicted: 44800, confidence: 92 },
    { month: 'Feb', actual: 52000, predicted: 51200, confidence: 89 },
    { month: 'Mar', actual: 48000, predicted: 49100, confidence: 94 },
    { month: 'Apr', actual: null, predicted: 53500, confidence: 87 },
    { month: 'May', actual: null, predicted: 56200, confidence: 85 },
    { month: 'Jun', actual: null, predicted: 58900, confidence: 82 }
  ];

  const insights = [
    {
      type: 'opportunity',
      title: 'Revenue Growth Opportunity',
      description: 'Model predicts 18% revenue increase with improved user retention',
      impact: 'High',
      confidence: 87,
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      type: 'risk',
      title: 'Churn Risk Alert',
      description: 'Increased churn probability detected for premium users',
      impact: 'Medium',
      confidence: 92,
      icon: <AlertTriangle className="w-4 h-4" />
    },
    {
      type: 'trend',
      title: 'Seasonal Pattern',
      description: 'Usage typically drops 15% in summer months',
      impact: 'Low',
      confidence: 95,
      icon: <Target className="w-4 h-4" />
    }
  ];

  const modelMetrics = [
    { name: 'Accuracy', value: 89, target: 85 },
    { name: 'Precision', value: 92, target: 90 },
    { name: 'Recall', value: 87, target: 85 },
    { name: 'F1-Score', value: 89, target: 88 }
  ];

  return (
    <div className="space-y-6">
      {/* Model Configuration */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">Prediction Model:</span>
          <Select value={predictionModel} onValueChange={setPredictionModel}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="users">User Growth</SelectItem>
              <SelectItem value="churn">Churn Rate</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">Time Horizon:</span>
          <Select value={timeHorizon} onValueChange={setTimeHorizon}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prediction Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Revenue Predictions vs Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      typeof value === 'number' ? `$${value.toLocaleString()}` : 'N/A',
                      name === 'actual' ? 'Actual' : 'Predicted'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    name="actual"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#dc2626" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="predicted"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Model Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Model Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {modelMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{metric.name}</span>
                  <span className="font-medium">{metric.value}%</span>
                </div>
                <Progress value={metric.value} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Target: {metric.target}%</span>
                  <Badge 
                    variant={metric.value >= metric.target ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {metric.value >= metric.target ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI-Generated Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <Card key={index} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      insight.type === 'opportunity' ? 'bg-green-100 text-green-600' :
                      insight.type === 'risk' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {insight.icon}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {insight.impact} Impact
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {insight.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Implement retention campaign for high-value users</span>
              </div>
              <Button size="sm" variant="outline">
                Execute
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Optimize onboarding flow to reduce early churn</span>
              </div>
              <Button size="sm" variant="outline">
                Review
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">Adjust pricing strategy for Q2 revenue goals</span>
              </div>
              <Button size="sm" variant="outline">
                Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
