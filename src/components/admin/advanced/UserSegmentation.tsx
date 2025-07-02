
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Target, Filter } from 'lucide-react';

interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: any;
  userCount: number;
  created_at: string;
}

export function UserSegmentation() {
  const [segments, setSegments] = useState<UserSegment[]>([
    {
      id: '1',
      name: 'Premium Users',
      description: 'Users with premium service subscriptions',
      criteria: { service_type: 'premium', status: 'active' },
      userCount: 45,
      created_at: '2024-06-01'
    },
    {
      id: '2',
      name: 'High Usage',
      description: 'Users with high message volume',
      criteria: { monthly_messages: { gte: 1000 } },
      userCount: 23,
      created_at: '2024-06-05'
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newSegment, setNewSegment] = useState({
    name: '',
    description: '',
    criteria: {}
  });

  const createSegment = () => {
    if (!newSegment.name) return;

    const segment: UserSegment = {
      id: Date.now().toString(),
      ...newSegment,
      userCount: Math.floor(Math.random() * 100) + 1,
      created_at: new Date().toISOString().split('T')[0]
    };

    setSegments(prev => [...prev, segment]);
    setNewSegment({ name: '', description: '', criteria: {} });
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">User Segmentation</h3>
          <p className="text-gray-600">Create and manage user segments for targeted campaigns</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Segment
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Segment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="segment-name">Segment Name</Label>
              <Input
                id="segment-name"
                value={newSegment.name}
                onChange={(e) => setNewSegment(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter segment name"
              />
            </div>
            <div>
              <Label htmlFor="segment-description">Description</Label>
              <Input
                id="segment-description"
                value={newSegment.description}
                onChange={(e) => setNewSegment(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this segment"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createSegment}>Create</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {segments.map((segment) => (
          <Card key={segment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {segment.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{segment.description}</p>
                </div>
                <Badge variant="secondary">
                  <Users className="w-3 h-3 mr-1" />
                  {segment.userCount} users
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Created: {segment.created_at}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
