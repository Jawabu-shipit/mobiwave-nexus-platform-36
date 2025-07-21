
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const recentActivity = [
  {
    id: 1,
    type: "SMS Campaign",
    title: "Holiday Promotion Launch",
    status: "Completed",
    time: "2 hours ago",
    count: "45,230 messages",
    color: "bg-green-500"
  },
  {
    id: 2,
    type: "Email Campaign", 
    title: "Customer Survey",
    status: "In Progress",
    time: "4 hours ago",
    count: "12,450 emails",
    color: "bg-blue-500"
  },
  {
    id: 3,
    type: "WhatsApp Broadcast",
    title: "Service Update",
    status: "Scheduled",
    time: "6 hours ago",
    count: "8,730 contacts",
    color: "bg-emerald-500"
  },
  {
    id: 4,
    type: "USSD Service",
    title: "Balance Inquiry",
    status: "Active",
    time: "8 hours ago",
    count: "234,567 requests",
    color: "bg-orange-500"
  },
  {
    id: 5,
    type: "M-Pesa Transaction",
    title: "Payment Processing",
    status: "Completed",
    time: "12 hours ago", 
    count: "1,234 transactions",
    color: "bg-yellow-500"
  }
];

export function RecentActivity() {
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">Recent Activity</CardTitle>
            <CardDescription className="text-gray-600">
              Latest campaigns and service updates across all channels
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Live Updates
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {recentActivity.map((activity, index) => (
            <div 
              key={activity.id} 
              className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors duration-200 group"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className={`w-3 h-3 ${activity.color} rounded-full shadow-sm group-hover:shadow-md transition-shadow`} />
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <Badge 
                      variant="outline" 
                      className="text-xs font-medium bg-gray-50 text-gray-700 border-gray-200"
                    >
                      {activity.type}
                    </Badge>
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {activity.title}
                    </h4>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                      {activity.time}
                    </span>
                    <span className="flex items-center">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                      {activity.count}
                    </span>
                  </div>
                </div>
              </div>
              
              <Badge 
                variant={
                  activity.status === 'Completed' ? 'default' :
                  activity.status === 'In Progress' ? 'secondary' :
                  activity.status === 'Active' ? 'default' :
                  'outline'
                }
                className={`ml-4 ${
                  activity.status === 'Completed' ? 'bg-green-500 hover:bg-green-600' :
                  activity.status === 'In Progress' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                  activity.status === 'Active' ? 'bg-emerald-500 hover:bg-emerald-600' :
                  'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                }`}
              >
                {activity.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
