import { createClient } from '@/utils/supabase/server';
import { getUser, getActionItems } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { ActionItemsClient } from './action-items-client';

export default async function ActionItemsPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  // Fetch real action items from database
  const actionItems = await getActionItems(supabase, user.id);

  // Group items by status
  const pendingItems = actionItems.filter(item => item.status === 'pending');
  const inProgressItems = actionItems.filter(item => item.status === 'in-progress');
  const completedItems = actionItems.filter(item => item.status === 'completed');

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Cisco Header */}
      <div className="mb-2">
        <h2 className="text-2xl font-light text-[#0e274e]">Action Items</h2>
        <p className="text-sm text-gray-400 font-light">
          Clear steps to achieve HIPAA compliance
        </p>
      </div>

      {/* Summary Stats - Cisco Style Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#565656] mb-1 font-light">Pending</p>
                <p className="text-3xl font-light text-[#0e274e]">{pendingItems.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full border-2 border-yellow-500 flex items-center justify-center">
                 <Clock className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#565656] mb-1 font-light">In Progress</p>
                <p className="text-3xl font-light text-[#0e274e]">{inProgressItems.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full border-2 border-[#00bceb] flex items-center justify-center">
                 <AlertCircle className="h-5 w-5 text-[#00bceb]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#565656] mb-1 font-light">Completed</p>
                <p className="text-3xl font-light text-[#0e274e]">{completedItems.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full border-2 border-[#71bc48] flex items-center justify-center">
                 <CheckCircle2 className="h-5 w-5 text-[#71bc48]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items List Container */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardContent className="p-0">
           {actionItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-[#71bc48] mb-4" />
                <CardTitle className="mb-2 text-[#0e274e] font-light">All caught up!</CardTitle>
                <CardDescription className="text-gray-400">You have no pending action items.</CardDescription>
              </div>
           ) : (
              <ActionItemsClient initialItems={actionItems} />
           )}
        </CardContent>
      </Card>
    </div>
  );
}
