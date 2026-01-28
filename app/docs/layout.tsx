import Link from 'next/link';
import { Shield, Book, FileText, Zap, AlertTriangle, CheckCircle2, Users, Download, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';

const docsNav = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/docs', icon: Book },
      { title: 'Getting Started', href: '/docs/getting-started', icon: Zap },
    ]
  },
  {
    title: 'Core Features',
    items: [
      { title: 'Dashboard Overview', href: '/docs/dashboard', icon: Shield },
      { title: 'Risk Assessment', href: '/docs/risk-assessment', icon: AlertTriangle },
      { title: 'Generate Policies', href: '/docs/policies', icon: FileText },
      { title: 'Upload Evidence', href: '/docs/evidence', icon: CheckCircle2 },
      { title: 'Employee Training', href: '/docs/training', icon: Users },
      { title: 'Action Items', href: '/docs/action-items', icon: ListTodo },
      { title: 'Export Audit Package', href: '/docs/audit-export', icon: Download },
    ]
  }
];

export default function DocsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f3f5f9]">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/docs" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0c0b1d] rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#1ad07a]" />
              </div>
              <span className="font-medium text-[#0c0b1d]">HIPAA Hub Docs</span>
            </Link>
            <Link 
              href="/"
              className="text-sm text-zinc-600 hover:text-[#0c0b1d] transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-6">
              {docsNav.map((section) => (
                <div key={section.title}>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                    {section.title}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                              "text-zinc-700 hover:bg-white hover:text-[#0c0b1d]"
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-8 md:p-12">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
