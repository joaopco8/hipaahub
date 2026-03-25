'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Update action item status
 */
export async function updateActionItemStatus(
  itemId: string,
  status: 'pending' | 'in-progress' | 'completed' | 'ignored'
) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const updateData: {
    status: 'pending' | 'in-progress' | 'completed' | 'ignored';
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
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating action item:', error);
    throw new Error('Failed to update action item');
  }

  revalidatePath('/dashboard/action-items');
  revalidatePath('/dashboard');
}

/**
 * Add a comment to an action item
 */
export async function addActionItemComment(itemId: string, content: string) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await (supabase as any)
    .from('action_item_comments')
    .insert({ action_item_id: itemId, user_id: user.id, content });

  if (error) {
    console.error('Error adding comment:', error);
    throw new Error('Failed to add comment');
  }

  revalidatePath('/dashboard/action-items');
}

/**
 * Get comments for an action item
 */
export async function getActionItemComments(itemId: string) {
  const supabase = createClient();

  const { data, error } = await (supabase as any)
    .from('action_item_comments')
    .select('id, content, created_at, user_id')
    .eq('action_item_id', itemId)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data || [];
}

/**
 * Delete a comment (only the author)
 */
export async function deleteActionItemComment(commentId: string) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await (supabase as any)
    .from('action_item_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (error) throw new Error('Failed to delete comment');
  revalidatePath('/dashboard/action-items');
}








