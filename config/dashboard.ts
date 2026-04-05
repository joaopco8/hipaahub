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
  BookOpen,
  Download,
  Wrench,
  CalendarDays,
  Package as AssetIcon
} from 'lucide-react';

export interface NavItem {
  href: string;
  icon: keyof typeof iconComponents;
  label: string;
  group?: 'core' | 'compliance' | 'organization' | 'help';
  disabled?: boolean;
  /** Minimum plan required to unlock this section. Item stays clickable; sidebar shows 🔒 when user is below this tier. */
  requiresPlan?: 'practice' | 'clinic';
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
  BookOpen,
  Download,
  Wrench,
  CalendarDays,
};

export const navConfig = [
  { href: '/dashboard', icon: 'LayoutDashboard', label: 'Overview', group: 'core' },
  { href: '/dashboard/organization', icon: 'Building2', label: 'Organization', group: 'organization' },
  { href: '/dashboard/action-items', icon: 'ListChecks', label: 'Action Items', group: 'core' },
  { href: '/dashboard/mitigation', icon: 'Wrench', label: 'Mitigation', group: 'core', requiresPlan: 'practice' },
  { href: '/dashboard/policies', icon: 'FileText', label: 'Policies & Documents', group: 'compliance' },
  { href: '/dashboard/training', icon: 'Users', label: 'Training & Employees', group: 'compliance', requiresPlan: 'practice' },
  { href: '/dashboard/assets', icon: 'Package', label: 'Asset Inventory', group: 'compliance', requiresPlan: 'practice' },
  { href: '/dashboard/risk-assessment', icon: 'ShieldAlert', label: 'Risk Assessment', group: 'compliance' },
  { href: '/dashboard/breach-notifications', icon: 'Mail', label: 'Breach Notifications', group: 'compliance' },
  { href: '/dashboard/evidence', icon: 'Archive', label: 'Evidence Center', group: 'compliance' },
  { href: '/dashboard/audit-export', icon: 'Download', label: 'Export Audit', group: 'compliance' },
  { href: '/dashboard/reports', icon: 'BarChart3', label: 'Board Reports', group: 'compliance', requiresPlan: 'clinic' },
  { href: '/dashboard/calendar', icon: 'CalendarDays', label: 'Compliance Calendar', group: 'compliance', requiresPlan: 'clinic' },
  { href: '/dashboard/quarterly-review', icon: 'CheckCircle2', label: 'Quarterly Reviews', group: 'compliance', requiresPlan: 'clinic' },
];
