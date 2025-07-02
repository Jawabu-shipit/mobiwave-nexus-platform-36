
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { SidebarItem } from './SidebarData';

interface MenuItemProps {
  item: SidebarItem;
}

export function MenuItem({ item }: MenuItemProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname === item.href;

  return (
    <Button
      key={item.id}
      variant={isActive ? "default" : "ghost"}
      className={`w-full justify-start gap-3 h-11 ${
        isActive 
          ? "bg-blue-600 text-white hover:bg-blue-700" 
          : "text-gray-700 hover:bg-gray-100"
      }`}
      onClick={() => navigate(item.href)}
    >
      <div className={`p-1 rounded ${item.color || 'bg-gray-500'}`}>
        <div className="w-4 h-4 flex items-center justify-center">
          {item.icon}
        </div>
      </div>
      <span className="font-medium">{item.label}</span>
      {item.badge && (
        <span className="ml-auto text-xs bg-red-500 text-white px-2 py-1 rounded-full">
          {item.badge}
        </span>
      )}
    </Button>
  );
}
