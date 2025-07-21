
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Clock, Users, BarChart, Activity, TrendingUp, Wand2, Layers } from 'lucide-react';

export function TabNavigation() {
  return (
    <div className="w-full">
      {/* Tab Categories */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">Quick Actions</div>
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 gap-1 bg-white/50 backdrop-blur-sm mb-4">
          <TabsTrigger value="compose" className="flex items-center gap-2 px-4 py-3">
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Quick SMS</span>
            <span className="sm:hidden">Quick</span>
          </TabsTrigger>
          <TabsTrigger value="bulk-ops" className="flex items-center gap-2 px-4 py-3">
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Campaigns</span>
            <span className="sm:hidden">Bulk</span>
          </TabsTrigger>
          <TabsTrigger value="personalize" className="flex items-center gap-2 px-4 py-3">
            <Wand2 className="w-4 h-4" />
            <span className="hidden sm:inline">Personalize</span>
            <span className="sm:hidden">Custom</span>
          </TabsTrigger>
          <TabsTrigger value="recipients" className="flex items-center gap-2 px-4 py-3">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Recipients</span>
            <span className="sm:hidden">Contacts</span>
          </TabsTrigger>
        </TabsList>

        <div className="text-sm text-gray-600 mb-2">Campaign Management</div>
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 gap-1 bg-white/50 backdrop-blur-sm">
          <TabsTrigger value="schedule" className="flex items-center gap-2 px-4 py-3">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule</span>
            <span className="sm:hidden">Time</span>
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2 px-4 py-3">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Live Tracking</span>
            <span className="sm:hidden">Track</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 px-4 py-3">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 px-4 py-3">
            <BarChart className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
            <span className="sm:hidden">Past</span>
          </TabsTrigger>
        </TabsList>
      </div>
    </div>
  );
}
