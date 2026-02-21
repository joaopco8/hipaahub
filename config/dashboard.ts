import {
  LayoutDashboard,
  Building2,
  ListChecks,
  FileText,
  Users,
  ShieldAlert,
  Mail,
  Archive,
  Settings,
  ShoppingCart,
  Users2,
  Inbox,
  Package,
  Package2,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Shield,
  Bell,
  ClipboardList,
  GraduationCap,
  AlertCircle,
  BarChart3,
  FolderOpen,
  BookOpen
} from 'lucide-react';

export interface NavItem {
  href: string;
  icon: keyof typeof iconComponents;
  label: string;
  group?: 'core' | 'compliance' | 'organization' | 'help';
  disabled?: boolean;
}

export const iconComponents = {
  LayoutDashboard,
  Building2,
  ListChecks,
  FileText,
  Users,
  ShieldAlert,
  Mail,
  Archive,
  Settings,
  Inbox,
  ShoppingCart,
  Package,
  Package2,
  Users2,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Shield,
  Bell,
  ClipboardList,
  GraduationCap,
  AlertCircle,
  BarChart3,
  FolderOpen,
  BookOpen
};

export const navConfig = [
  { href: '/dashboard', icon: 'LayoutDashboard', label: 'Overview', group: 'core' },
  { href: '/dashboard/organization', icon: 'Building2', label: 'Organization', group: 'organization' },
  { href: '/dashboard/action-items', icon: 'ListChecks', label: 'Action Items', group: 'core' },
  { href: '/dashboard/policies', icon: 'FileText', label: 'Policies & Documents', group: 'compliance' },
  { href: '/dashboard/training', icon: 'Users', label: 'Training & Employees', group: 'compliance' },
  { href: '/dashboard/risk-assessment', icon: 'ShieldAlert', label: 'Risk Assessment', group: 'compliance' },
  { href: '/dashboard/breach-notifications', icon: 'Mail', label: 'Breach Notifications', group: 'compliance' },
  { href: '/dashboard/evidence', icon: 'Archive', label: 'Evidence Center', group: 'compliance' }
];
