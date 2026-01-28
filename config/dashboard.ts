import {
  LineChart,
  Package,
  Package2,
  Settings,
  ShoppingCart,
  Users2,
  Inbox,
  FileText,
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
  Building2,
  Mail,
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
  Inbox,
  ShoppingCart,
  FileText,
  Package,
  Users2,
  LineChart,
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
  Settings,
  Building2,
  Mail,
  BookOpen
};

export const navConfig = [
  { href: '/dashboard', icon: 'BarChart3', label: 'Overview', group: 'core' },
  { href: '/dashboard/organization', icon: 'Building2', label: 'Organization', group: 'organization' },
  { href: '/dashboard/action-items', icon: 'ClipboardList', label: 'Action Items', group: 'core' },
  { href: '/dashboard/policies', icon: 'FileCheck', label: 'Policies & Documents', group: 'compliance' },
  { href: '/dashboard/training', icon: 'GraduationCap', label: 'Training & Employees', group: 'compliance' },
  { href: '/dashboard/risk-assessment', icon: 'AlertTriangle', label: 'Risk Assessment', group: 'compliance' },
  { href: '/docs', icon: 'BookOpen', label: 'How HIPAA Hub Works', group: 'help' },
  { href: '/dashboard/breach-notifications', icon: 'Mail', label: 'Breach Notifications', group: 'compliance' },
  { href: '/dashboard/evidence', icon: 'FolderOpen', label: 'Evidence Center', group: 'compliance' }
];
