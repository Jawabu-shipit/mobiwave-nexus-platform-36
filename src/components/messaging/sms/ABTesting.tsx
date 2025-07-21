
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, Play, Pause, BarChart3, Trophy, Target, Plus, Eye, Users } from 'lucide-react';
import { toast } from 'sonner';

interface ABTest {
  id: string;
  name: string;
  variantA: {
    name: string;
    content: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
  variantB: {
    name: string;
    content: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
  testMetric: 'open_rate' | 'click_rate' | 'delivery_rate';
  status: 'draft' | 'running' | 'completed' | 'paused';
  trafficSplit: number; // percentage for variant A
  startDate: Date;
  endDate?: Date;
  confidenceLevel: number;
  winner?: 'A' | 'B' | 'none';
}

export function ABTesting() {
  const [tests, setTests] = useState<ABTest[]>([
    {
      id: '1',
      name: 'Welcome Message Test',
      variantA: {
        name: 'Formal Tone',
        content: 'Welcome to our service. We are pleased to have you as a customer.',
        sent: 500,
        delivered: 490,
        opened: 245,
        clicked: 49
      },
      variantB: {
        name: 'Casual Tone',
        content: 'Hey there! Welcome to our awesome service. We\'re so excited to have you!',
        sent: 500,
        delivered: 485,
        opened: 267,
        clicked: 61
      },
      testMetric: 'open_rate',
      status: 'completed',
      trafficSplit: 50,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-07'),
      confidenceLevel: 95,
      winner: 'B'
    }
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    variantA: { name: 'Variant A', content: '' },
    variantB: { name: 'Variant B', content: '' },
    testMetric: 'open_rate' as const,
    trafficSplit: 50
  });

  const createTest = () => {
    if (!newTest.name || !newTest.variantA.content || !newTest.variantB.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    const test: ABTest = {
      id: `test-${Date.now()}`,
      ...newTest,
      variantA: { ...newTest.variantA, sent: 0, delivered: 0, opened: 0, clicked: 0 },
      variantB: { ...newTest.variantB, sent: 0, delivered: 0, opened: 0, clicked: 0 },
      status: 'draft',
      startDate: new Date(),
      confidenceLevel: 95
    };

    setTests(prev => [...prev, test]);
    setNewTest({
      name: '',
      variantA: { name: 'Variant A', content: '' },
      variantB: { name: 'Variant B', content: '' },
      testMetric: 'open_rate',
      trafficSplit: 50
    });
    setShowCreateDialog(false);
    toast.success('A/B test created successfully');
  };

  const startTest = (id: string) => {
    setTests(prev => prev.map(test => 
      test.id === id ? { ...test, status: 'running' as const, startDate: new Date() } : test
    ));
    toast.success('A/B test started');
  };

  const stopTest = (id: string) => {
    setTests(prev => prev.map(test => 
      test.id === id ? { ...test, status: 'completed' as const, endDate: new Date() } : test
    ));
    toast.success('A/B test stopped');
  };

  const calculateMetric = (variant: ABTest['variantA'], metric: ABTest['testMetric']) => {
    switch (metric) {
      case 'delivery_rate':
        return variant.sent > 0 ? (variant.delivered / variant.sent) * 100 : 0;
      case 'open_rate':
        return variant.delivered > 0 ? (variant.opened / variant.delivered) * 100 : 0;
      case 'click_rate':
        return variant.opened > 0 ? (variant.clicked / variant.opened) * 100 : 0;
      default:
        return 0;
    }
  };

  const determineWinner = (test: ABTest) => {
    const metricA = calculateMetric(test.variantA, test.testMetric);
    const metricB = calculateMetric(test.variantB, test.testMetric);
    
    const difference = Math.abs(metricA - metricB);
    const minSampleSize = 100; // Minimum sample size for significance
    
    if (test.variantA.sent < minSampleSize || test.variantB.sent < minSampleSize) {
      return { winner: 'none' as const, significant: false, difference };
    }
    
    // Simplified significance test
    const significant = difference > 2; // 2% difference threshold
    const winner = metricA > metricB ? 'A' as const : 'B' as const;
    
    return { winner: significant ? winner : 'none' as const, significant, difference };
  };

  const getStatusColor = (status: ABTest['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'running': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">A/B Testing</h2>
          <p className="text-gray-600">Optimize your campaigns with controlled experiments</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New A/B Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create A/B Test</DialogTitle>
              <DialogDescription>
                Set up a new experiment to test different message variations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="testName">Test Name</Label>
                <Input
                  id="testName"
                  value={newTest.name}
                  onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter test name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="variantAName">Variant A Name</Label>
                  <Input
                    id="variantAName"
                    value={newTest.variantA.name}
                    onChange={(e) => setNewTest(prev => ({ 
                      ...prev, 
                      variantA: { ...prev.variantA, name: e.target.value }
                    }))}
                    placeholder="e.g., Original"
                  />
                </div>
                <div>
                  <Label htmlFor="variantBName">Variant B Name</Label>
                  <Input
                    id="variantBName"
                    value={newTest.variantB.name}
                    onChange={(e) => setNewTest(prev => ({ 
                      ...prev, 
                      variantB: { ...prev.variantB, name: e.target.value }
                    }))}
                    placeholder="e.g., New Version"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="variantAContent">Variant A Content</Label>
                  <Textarea
                    id="variantAContent"
                    value={newTest.variantA.content}
                    onChange={(e) => setNewTest(prev => ({ 
                      ...prev, 
                      variantA: { ...prev.variantA, content: e.target.value }
                    }))}
                    placeholder="Enter message content for variant A"
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <Label htmlFor="variantBContent">Variant B Content</Label>
                  <Textarea
                    id="variantBContent"
                    value={newTest.variantB.content}
                    onChange={(e) => setNewTest(prev => ({ 
                      ...prev, 
                      variantB: { ...prev.variantB, content: e.target.value }
                    }))}
                    placeholder="Enter message content for variant B"
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testMetric">Test Metric</Label>
                  <Select 
                    value={newTest.testMetric} 
                    onValueChange={(value: any) => setNewTest(prev => ({ ...prev, testMetric: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delivery_rate">Delivery Rate</SelectItem>
                      <SelectItem value="open_rate">Open Rate</SelectItem>
                      <SelectItem value="click_rate">Click Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="trafficSplit">Traffic Split (%)</Label>
                  <Input
                    id="trafficSplit"
                    type="number"
                    min="10"
                    max="90"
                    value={newTest.trafficSplit}
                    onChange={(e) => setNewTest(prev => ({ ...prev, trafficSplit: parseInt(e.target.value) }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Variant A: {newTest.trafficSplit}%, Variant B: {100 - newTest.trafficSplit}%
                  </p>
                </div>
              </div>

              <Button onClick={createTest} className="w-full">
                Create A/B Test
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {tests.map(test => {
          const { winner, significant, difference } = determineWinner(test);
          const metricA = calculateMetric(test.variantA, test.testMetric);
          const metricB = calculateMetric(test.variantB, test.testMetric);

          return (
            <Card key={test.id} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FlaskConical className="w-5 h-5 text-purple-600" />
                      {test.name}
                    </CardTitle>
                    <CardDescription>
                      Testing {test.testMetric.replace('_', ' ')} • Started {test.startDate.toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(test.status)}>
                      {test.status}
                    </Badge>
                    {test.status === 'completed' && winner !== 'none' && (
                      <Badge className="bg-green-100 text-green-800">
                        <Trophy className="w-3 h-3 mr-1" />
                        Winner: Variant {winner}
                      </Badge>
                    )}
                    {test.status === 'draft' && (
                      <Button size="sm" onClick={() => startTest(test.id)}>
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                    {test.status === 'running' && (
                      <Button size="sm" variant="outline" onClick={() => stopTest(test.id)}>
                        <Pause className="w-4 h-4 mr-1" />
                        Stop
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Variant A */}
                  <Card className={`border-2 ${winner === 'A' && significant ? 'border-green-300 bg-green-50' : ''}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {test.variantA.name}
                        {winner === 'A' && significant && (
                          <Trophy className="w-5 h-5 text-green-600" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-4 p-3 bg-gray-50 rounded">
                        {test.variantA.content}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Sent</p>
                          <p className="font-semibold">{test.variantA.sent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Delivered</p>
                          <p className="font-semibold">{test.variantA.delivered.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Opened</p>
                          <p className="font-semibold">{test.variantA.opened.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Clicked</p>
                          <p className="font-semibold">{test.variantA.clicked.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 rounded">
                        <p className="text-sm font-medium text-blue-900">
                          {test.testMetric.replace('_', ' ').toUpperCase()}: {metricA.toFixed(1)}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Variant B */}
                  <Card className={`border-2 ${winner === 'B' && significant ? 'border-green-300 bg-green-50' : ''}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {test.variantB.name}
                        {winner === 'B' && significant && (
                          <Trophy className="w-5 h-5 text-green-600" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-4 p-3 bg-gray-50 rounded">
                        {test.variantB.content}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Sent</p>
                          <p className="font-semibold">{test.variantB.sent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Delivered</p>
                          <p className="font-semibold">{test.variantB.delivered.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Opened</p>
                          <p className="font-semibold">{test.variantB.opened.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Clicked</p>
                          <p className="font-semibold">{test.variantB.clicked.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 rounded">
                        <p className="text-sm font-medium text-blue-900">
                          {test.testMetric.replace('_', ' ').toUpperCase()}: {metricB.toFixed(1)}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Test Results Summary */}
                {test.status === 'completed' && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Test Results</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Performance Difference</p>
                        <p className="font-semibold">{difference.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Statistical Significance</p>
                        <p className="font-semibold">{significant ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Recommended Action</p>
                        <p className="font-semibold">
                          {winner !== 'none' && significant ? `Use Variant ${winner}` : 'Continue testing'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
