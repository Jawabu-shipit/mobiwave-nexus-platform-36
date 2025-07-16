
import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Mail,
  Phone,
  Settings,
  HelpCircle,
  Users,
  BarChart3,
  Smartphone,
  Hash,
  CreditCard,
  HeadphonesIcon,
  Gift,
  Zap,
  Crown,
  Database
} from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  color: string; // Made required to ensure all items have colors
}

export interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
}

export const ACTIVATION_REQUIRED_SERVICE_TYPES = [
  'email',
  'whatsapp', 
  'servicedesk',
  'ussd',
  'shortcode',
  'mpesa'
];

export const sidebarSections: SidebarSection[] = [
  {
    id: 'main',
    title: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: React.createElement(LayoutDashboard, { className: "w-4 h-4" }),
        href: '/dashboard',
        color: 'bg-blue-500'
      },
      {
        id: 'plan-management',
        label: 'Plan Management',
        icon: React.createElement(Crown, { className: "w-4 h-4" }),
        href: '/plan-management',
        color: 'bg-purple-500'
      }
    ]
  },
  {
    id: 'services',
    title: 'Services',
    items: [
      {
        id: 'sms',
        label: 'SMS Campaigns',
        icon: React.createElement(MessageSquare, { className: "w-4 h-4" }),
        href: '/bulk-sms',
        color: 'bg-green-500'
      },
      {
        id: 'email',
        label: 'Email Campaigns', 
        icon: React.createElement(Mail, { className: "w-4 h-4" }),
        href: '/email',
        color: 'bg-red-500'
      },
      {
        id: 'whatsapp',
        label: 'WhatsApp',
        icon: React.createElement(Phone, { className: "w-4 h-4" }),
        href: '/whatsapp',
        color: 'bg-emerald-500'
      },
      {
        id: 'servicedesk',
        label: 'Service Desk',
        icon: React.createElement(HeadphonesIcon, { className: "w-4 h-4" }),
        href: '/service-desk',
        color: 'bg-indigo-500'
      },
      {
        id: 'ussd',
        label: 'USSD Applications',
        icon: React.createElement(Smartphone, { className: "w-4 h-4" }),
        href: '/ussd',
        color: 'bg-teal-500'
      },
      {
        id: 'shortcode',
        label: 'Shortcode',
        icon: React.createElement(Hash, { className: "w-4 h-4" }),
        href: '/shortcode',
        color: 'bg-orange-500'
      },
      {
        id: 'mpesa',
        label: 'M-Pesa Integration',
        icon: React.createElement(CreditCard, { className: "w-4 h-4" }),
        href: '/mpesa',
        color: 'bg-yellow-500'
      }
    ]
  },
  {
    id: 'management',
    title: 'Management',
    items: [
      {
        id: 'data-hub',
        label: 'Data Hub',
        icon: React.createElement(Database, { className: "w-4 h-4" }),
        href: '/data-hub',
        color: 'bg-teal-500'
      },
      {
        id: 'contacts',
        label: 'Contacts',
        icon: React.createElement(Users, { className: "w-4 h-4" }),
        href: '/contacts',
        color: 'bg-pink-500'
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: React.createElement(BarChart3, { className: "w-4 h-4" }),
        href: '/analytics',
        color: 'bg-violet-500'
      },
      {
        id: 'my-services',
        label: 'My Services',
        icon: React.createElement(Settings, { className: "w-4 h-4" }),
        href: '/my-services',
        color: 'bg-slate-500'
      },
      {
        id: 'service-requests',
        label: 'Service Requests',
        icon: React.createElement(Zap, { className: "w-4 h-4" }),
        href: '/service-requests',
        color: 'bg-cyan-500'
      }
    ]
  },
  {
    id: 'support',
    title: 'Support',
    items: [
      {
        id: 'help',
        label: 'Help & Support',
        icon: React.createElement(HelpCircle, { className: "w-4 h-4" }),
        href: '/help',
        color: 'bg-amber-500'
      },
      {
        id: 'billing',
        label: 'Billing',
        icon: React.createElement(CreditCard, { className: "w-4 h-4" }),
        href: '/billing',
        color: 'bg-yellow-600'
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: React.createElement(Settings, { className: "w-4 h-4" }),
        href: '/settings',
        color: 'bg-slate-500'
      }
    ]
  }
];
