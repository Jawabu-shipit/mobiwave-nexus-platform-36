

import React from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import { sidebarSections, ACTIVATION_REQUIRED_SERVICE_TYPES } from './sidebar/SidebarData';
import { SidebarGroup } from './sidebar/SidebarGroup';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { useUserCredits } from '@/hooks/useUserCredits';
import { useActivatedServiceTypes } from './sidebar/ServiceSidebarVisibility';
import { Sidebar, useSidebar } from '@/components/ui/sidebar';
import { Menu } from 'lucide-react';

export function ClientSidebar() {
  const location = useLocation();
  const { data: credits } = useUserCredits();
  const { activatedTypes, isLoading } = useActivatedServiceTypes();
  const { isMobile, openMobile, setOpenMobile } = useSidebar ? useSidebar() : { isMobile: false, openMobile: false, setOpenMobile: () => {} };

  // Only show service menu items in sidebar when the service is ACTIVATED
  function filterSidebarSections(sections: typeof sidebarSections) {
    if (isLoading) {
        // While loading, show non-service specific items but hide those that need activation status
        return sections.map(section => {
            if (section.id !== 'services') return section;
            return { 
              ...section, 
              items: section.items.filter((item) => !ACTIVATION_REQUIRED_SERVICE_TYPES.includes(item.id)) 
            };
        });
    }
    
    return sections.map(section => {
      if (section.id !== 'services') {
        return section;
      }
      return {
        ...section,
        items: section.items.filter((item) => {
          // If the item.id is not a service that needs activation, always show it.
          if (!ACTIVATION_REQUIRED_SERVICE_TYPES.includes(item.id)) {
            return true;
          }
          // Otherwise, only show if the user has activated this service type.
          return activatedTypes.has(item.id);
        })
      };
    });
  }

  const filteredSections = filterSidebarSections(sidebarSections);

  return (
    <>
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 bg-white rounded-full shadow p-2 md:hidden"
          onClick={() => setOpenMobile(true)}
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6 text-gray-900" />
        </button>
      )}
      <Sidebar>
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
          <SidebarHeader />
          <ScrollArea className="flex-1 px-2">
            <div className="py-4">
              {filteredSections.map((section) =>
                section.items.length > 0 ? (
                  <SidebarGroup
                    key={section.id}
                    section={section}
                  />
                ) : null
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Available Credits</div>
              <div className="text-lg font-bold text-green-600">
                ${credits?.credits_remaining?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
        </div>
      </Sidebar>
    </>
  );
}
