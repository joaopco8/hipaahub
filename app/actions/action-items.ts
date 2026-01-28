'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Update action item status
 */
export async function updateActionItemStatus(
  itemId: string,
  status: 'pending' | 'in-progress' | 'completed'
) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const updateData: {
    status: 'pending' | 'in-progress' | 'completed';
    completed_at?: string | null;
  } = {
    status
  };

  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  } else {
    updateData.completed_at = null;
  }

  const { error } = await supabase
    .from('action_items')
    .update(updateData)
    .eq('id', itemId)
    .eq('user_id', user.id); // Ensure user can only update their own items

  if (error) {
    console.error('Error updating action item:', error);
    throw new Error('Failed to update action item');
  }

  revalidatePath('/dashboard/action-items');
  revalidatePath('/dashboard');
}








