
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Zap, X } from 'lucide-react';

interface BulkOperationsPanelProps {
  selectedUsers: string[];
  selectedService: string;
  allServices: any[];
  isUpdating: boolean;
  onServiceChange: (serviceId: string) => void;
  onBulkOperation: (operation: 'activate' | 'deactivate') => Promise<void>;
  onClearSelection: () => void;
}

export function BulkOperationsPanel({
  selectedUsers,
  selectedService,
  allServices,
  isUpdating,
  onServiceChange,
  onBulkOperation,
  onClearSelection
}: BulkOperationsPanelProps) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Bulk Operations
          </div>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="text-sm">Selected users:</span>
          <Badge variant="outline">{selectedUsers.length}</Badge>
        </div>
        
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium">Select Service</label>
            <Select value={selectedService} onValueChange={onServiceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a service..." />
              </SelectTrigger>
              <SelectContent>
                {allServices.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.service_name} ({service.service_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onBulkOperation('activate')}
              disabled={!selectedService || selectedUsers.length === 0 || isUpdating}
              className="bg-green-600 hover:bg-green-700"
            >
              Activate
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onBulkOperation('deactivate')}
              disabled={!selectedService || selectedUsers.length === 0 || isUpdating}
            >
              Deactivate
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
