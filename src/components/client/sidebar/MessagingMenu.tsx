
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarMenuSub, 
  SidebarMenuSubItem, 
  SidebarMenuSubButton 
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MessageSquare, ChevronRight, Crown, LucideIcon } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  icon: string;
  route: string;
  is_premium: boolean;
}

interface MessagingMenuProps {
  services: Service[];
  isActive: (path: string) => boolean;
  getIcon: (iconName: string) => LucideIcon;
}

export function MessagingMenu({ services, isActive, getIcon }: MessagingMenuProps) {
  if (services.length === 0) return null;

  return (
    <SidebarMenu className="space-y-2">
      <SidebarMenuItem>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="w-full group hover:bg-white/80 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center space-x-3 p-3 rounded-xl w-full">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">Messaging</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </div>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub className="ml-4 mt-2 space-y-1">
              {services.map((service) => {
                const IconComponent = getIcon(service.icon);
                return (
                  <SidebarMenuSubItem key={service.id}>
                    <SidebarMenuSubButton asChild isActive={isActive(service.route)}>
                      <Link to={service.route} className="flex items-center space-x-2 px-3 py-2 rounded-lg">
                        <IconComponent className="w-4 h-4" />
                        <span>{service.name}</span>
                        {service.is_premium && <Crown className="w-3 h-3 text-yellow-600" />}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
