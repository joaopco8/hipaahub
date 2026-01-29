import { createClient } from '@/utils/supabase/server';
import { getUser, getActionItems } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, Info, FileText, Shield, Users, Lock } from 'lucide-react';
import Link from 'next/link';
import { ActionItemsClient } from './action-items-client';

export default async function ActionItemsPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  // Fetch real action items from database
  const actionItems = await getActionItems(supabase, user.id);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'medium':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Policies':
        return <FileText className="h-5 w-5" />;
      case 'Security':
        return <Shield className="h-5 w-5" />;
      case 'Training':
        return <Users className="h-5 w-5" />;
      case 'Contracts':
        return <FileText className="h-5 w-5" />;
      case 'Administrative':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  // Group items by status
  const pendingItems = actionItems.filter(item => item.status === 'pending');
  const inProgressItems = actionItems.filter(item => item.status === 'in-progress');
  const completedItems = actionItems.filter(item => item.status === 'completed');

  return (
    <div className="flex w-full flex-col gap-6 page-transition-premium">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Action Items</h1>
        <p className="text-zinc-600">
          Clear, actionable steps to achieve HIPAA compliance
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-200 card-premium-enter stagger-item">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-zinc-900">{pendingItems.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 card-premium-enter stagger-item" style={{ animationDelay: '50ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-zinc-900">{inProgressItems.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 card-premium-enter stagger-item" style={{ animationDelay: '100ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-zinc-900">{completedItems.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items List */}
      <div className="grid gap-4">
        {actionItems.length === 0 ? (
          <Card className="border-zinc-200 card-premium-enter stagger-item" style={{ animationDelay: '150ms' }}>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle className="mb-2 text-zinc-900">All caught up!</CardTitle>
              <CardDescription className="text-zinc-600">You have no pending action items.</CardDescription>
            </CardContent>
          </Card>
        ) : (
          <ActionItemsClient initialItems={actionItems} />
        )}
      </div>
    </div>
  );
}

