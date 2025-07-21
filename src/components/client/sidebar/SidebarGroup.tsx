
import React from 'react';
import { MenuItem } from './MenuItem';
import { SidebarSection } from './SidebarData';

interface SidebarGroupProps {
  section: SidebarSection;
}

export function SidebarGroup({ section }: SidebarGroupProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
        {section.title}
      </h3>
      <div className="space-y-1">
        {section.items.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
