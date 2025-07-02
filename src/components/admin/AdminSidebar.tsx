
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  Monitor,
  Wrench,
  UserPlus,
  DollarSign,
  Database,
  FileText,
  Briefcase,
  Activity,
  TrendingUp,
  Eye,
  Bell,
  Server,
  CheckCircle2,
  AlertTriangle,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
  },
  {
    title: 'User Management',
    icon: Users,
    children: [
      { title: 'Comprehensive Users', href: '/admin/users', icon: Users },
      { title: 'Create User', href: '/admin/users/create', icon: UserPlus },
    ]
  },
  {
    title: 'Services',
    href: '/admin/services',
    icon: Wrench,
  },
  {
    title: 'Analytics',
    icon: TrendingUp,
    children: [
      { title: 'Basic Analytics', href: '/admin/analytics', icon: BarChart3 },
      { title: 'Enhanced Analytics', href: '/admin/analytics/enhanced', icon: TrendingUp },
      { title: 'Advanced Analytics', href: '/admin/analytics/advanced', icon: Activity },
    ]
  },
  {
    title: 'Monitoring',
    icon: Monitor,
    children: [
      { title: 'Basic Monitoring', href: '/admin/monitoring', icon: Monitor },
      { title: 'Real-time Monitoring', href: '/admin/monitoring/realtime', icon: Activity },
    ]
  },
  {
    title: 'Security',
    icon: Shield,
    children: [
      { title: 'Basic Security', href: '/admin/security', icon: Shield },
      { title: 'Advanced Security', href: '/admin/security/advanced', icon: AlertTriangle },
    ]
  },
  {
    title: 'System',
    icon: Server,
    children: [
      { title: 'System Settings', href: '/admin/settings', icon: Settings },
      { title: 'System Health', href: '/admin/system/health', icon: Activity },
      { title: 'System Diagnostics', href: '/admin/system/diagnostics', icon: Eye },
      { title: 'System Integrity', href: '/admin/system/integrity', icon: CheckCircle2 },
      { title: 'Database Admin', href: '/admin/database', icon: Database },
      { title: 'System Logs', href: '/admin/logs', icon: FileText },
    ]
  },
  {
    title: 'API Management',
    href: '/admin/api',
    icon: Globe,
  },
  {
    title: 'Revenue Reports',
    href: '/admin/revenue',
    icon: DollarSign,
  },
  {
    title: 'Project Progress',
    href: '/admin/project',
    icon: Briefcase,
  },
  {
    title: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const [openGroups, setOpenGroups] = React.useState<string[]>([]);

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => 
      prev.includes(title) 
        ? prev.filter(group => group !== title)
        : [...prev, title]
    );
  };

  const renderSidebarItem = (item: any) => {
    if (item.children) {
      const isOpen = openGroups.includes(item.title);
      const hasActiveChild = item.children.some((child: any) => location.pathname === child.href);
      
      return (
        <div key={item.title} className="space-y-1">
          <button
            onClick={() => toggleGroup(item.title)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-gray-100",
              (isOpen || hasActiveChild) && "bg-gray-100 text-gray-900"
            )}
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-4 w-4" />
              {item.title}
            </div>
            <svg
              className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {isOpen && (
            <div className="ml-6 space-y-1">
              {item.children.map((child: any) => (
                <Link
                  key={child.href}
                  to={child.href}
                  className={cn(
                    "block px-3 py-2 text-sm rounded-md transition-colors hover:bg-gray-100",
                    location.pathname === child.href ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-600"
                  )}
                >
                  <div className="flex items-center">
                    <child.icon className="mr-2 h-3 w-3" />
                    {child.title}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-gray-100",
          location.pathname === item.href ? "bg-blue-100 text-blue-700" : "text-gray-600"
        )}
      >
        <item.icon className="mr-3 h-4 w-4" />
        {item.title}
      </Link>
    );
  };

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
      </div>
      <nav className="px-4 pb-4 space-y-1">
        {sidebarItems.map(renderSidebarItem)}
      </nav>
    </div>
  );
}
