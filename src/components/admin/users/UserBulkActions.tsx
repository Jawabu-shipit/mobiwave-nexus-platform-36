
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Mail, 
  Ban, 
  CheckCircle, 
  Trash2, 
  X 
} from 'lucide-react';

interface UserBulkActionsProps {
  selectedUsers: string[];
  onClearSelection: () => void;
}

export function UserBulkActions({ selectedUsers, onClearSelection }: UserBulkActionsProps) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
            </span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Bulk Actions Available
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-blue-600 border-blue-300">
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
            <Button size="sm" variant="outline" className="text-green-600 border-green-300">
              <CheckCircle className="w-4 h-4 mr-2" />
              Activate
            </Button>
            <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">
              <Ban className="w-4 h-4 mr-2" />
              Suspend
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-300">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onClearSelection}
              className="text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
