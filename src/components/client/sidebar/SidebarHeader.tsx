
import React from 'react';
import { Button } from "@/components/ui/button";
import { Send, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SidebarHeader() {
  return (
    <div className="p-3 sm:p-4 border-b border-gray-200">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <Send className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold text-gray-900 text-sm sm:text-base truncate">MobiWave Innovations</h2>
          <p className="text-xs text-gray-500 truncate">Communication Hub</p>
        </div>
      </div>
      <Link to="/bulk-sms?tab=compose" className="block">
        <Button className="w-full flex items-center justify-center px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white whitespace-nowrap">
          <Plus className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="truncate">Quick SMS</span>
        </Button>
      </Link>
    </div>
  );
}
