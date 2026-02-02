import Link from 'next/link';
import Image from 'next/image';
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
    <div className="min-h-screen bg-[#0c0b1d]">
      {/* Header */}
      <header className="bg-[#0c0b1d]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/docs" className="flex items-center gap-3 group">
              <div className="relative w-32 h-8 transition-transform group-hover:scale-105">
                <Image 
                  src="/logohipa.png" 
                  alt="HIPAA Hub" 
                  fill
                  priority
                  className="object-contain"
                />
              </div>
              <span className="font-medium text-white/80 text-sm">Docs</span>
            </Link>
            <Link 
              href="/"
              className="text-sm text-white/60 hover:text-[#1ad07a] transition-colors font-geologica font-light"
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
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
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
                              "text-white/70 hover:bg-white/10 hover:text-[#1ad07a]"
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
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 md:p-12">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
