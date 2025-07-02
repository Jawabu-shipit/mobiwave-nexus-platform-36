
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Edit, TestTube } from 'lucide-react';

interface USSDApplication {
  id: string;
  service_code: string;
  menu_structure: any[];
  callback_url: string;
  status: string;
}

interface USSDApplicationCardProps {
  application: USSDApplication;
  onEdit?: (application: USSDApplication) => void;
  onTest?: (application: USSDApplication) => void;
}

export function USSDApplicationCard({ application, onEdit, onTest }: USSDApplicationCardProps) {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(application);
    }
  };

  const handleTest = () => {
    if (onTest) {
      onTest(application);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            {application.service_code}
          </span>
          <Badge 
            variant={application.status === 'active' ? 'default' : 'secondary'}
            className={application.status === 'active' ? 'bg-green-100 text-green-800' : ''}
          >
            {application.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Callback URL:</p>
            <p className="text-sm font-mono bg-gray-50 p-2 rounded truncate">
              {application.callback_url}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Menu Nodes:</p>
            <p className="text-sm">{application.menu_structure.length} menus configured</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button size="sm" variant="outline" onClick={handleTest}>
              <TestTube className="w-4 h-4 mr-2" />
              Test
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
