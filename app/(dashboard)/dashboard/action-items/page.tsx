import { createClient } from '@/utils/supabase/server';
import { getUser, getActionItems } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertCircle, EyeOff } from 'lucide-react';
import { ActionItemsClient } from './action-items-client';

export default async function ActionItemsPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  // Fetch action items with their comments
  const actionItems = await getActionItems(supabase, user.id);

  // Load comments for all items
  const itemIds = actionItems.map((i: any) => i.id);
  let commentsMap: Record<string, any[]> = {};
  if (itemIds.length > 0) {
    const { data: comments } = await (supabase as any)
      .from('action_item_comments')
      .select('id, action_item_id, content, created_at, user_id')
      .in('action_item_id', itemIds)
      .order('created_at', { ascending: true });
    if (comments) {
      for (const c of comments) {
        if (!commentsMap[c.action_item_id]) commentsMap[c.action_item_id] = [];
        commentsMap[c.action_item_id].push(c);
      }
    }
  }

  const itemsWithComments = actionItems.map((item: any) => ({
    ...item,
    comments: commentsMap[item.id] || [],
  }));

  const pendingItems    = itemsWithComments.filter((i: any) => i.status === 'pending');
  const inProgressItems = itemsWithComments.filter((i: any) => i.status === 'in-progress');
  const completedItems  = itemsWithComments.filter((i: any) => i.status === 'completed');
  const ignoredItems    = itemsWithComments.filter((i: any) => i.status === 'ignored');

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-2xl font-light text-[#0e274e]">Action Items</h2>
        <p className="text-sm text-gray-400 font-light">
          Clear steps to achieve HIPAA compliance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
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

        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#565656] mb-1 font-light">Ignored</p>
                <p className="text-3xl font-light text-[#0e274e]">{ignoredItems.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full border-2 border-gray-300 flex items-center justify-center">
                <EyeOff className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardContent className="p-0">
          {itemsWithComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-12 w-12 text-[#71bc48] mb-4" />
              <CardTitle className="mb-2 text-[#0e274e] font-light">All caught up!</CardTitle>
              <CardDescription className="text-gray-400">You have no pending action items.</CardDescription>
            </div>
          ) : (
            <ActionItemsClient initialItems={itemsWithComments} currentUserId={user.id} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
