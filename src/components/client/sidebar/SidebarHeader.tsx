
import React from 'react';
import { Button } from "@/components/ui/button";
import { Send, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SidebarHeader() {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <Send className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">MobiWave</h2>
          <p className="text-xs text-gray-500">Communication Hub</p>
        </div>
      </div>
      
      <Link to="/bulk-sms?tab=compose">
        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Quick SMS
        </Button>
      </Link>
    </div>
  );
}
