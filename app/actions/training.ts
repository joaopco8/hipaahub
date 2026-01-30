'use server';

import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { revalidatePath } from 'next/cache';

export interface TrainingRecord {
  id: string;
  full_name: string;
  email: string;
  role_title: string;
  training_type: 'initial' | 'annual' | 'remedial';
  training_date: string;
  completion_status: 'completed' | 'pending' | 'expired';
  expiration_date: string;
  acknowledgement: boolean;
  acknowledgement_date: string | null;
  quiz_score: number | null;
  recorded_by: string;
  record_timestamp: string;
}

export async function getTrainingRecords() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: records, error } = await supabase
    .from('training_records' as any)
    .select('*')
    .eq('user_id', user.id)
    .order('training_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch training records: ${error.message}`);
  }

  return records as TrainingRecord[];
}

export async function getStaffMembers() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: staff, error } = await supabase
    .from('staff_members')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch staff members: ${error.message}`);
  }

  return staff;
}

export async function getTrainingStats() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: records, error } = await supabase
    .from('training_records' as any)
    .select('completion_status, expiration_date')
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to fetch training stats: ${error.message}`);
  }

  const now = new Date();
  const completed = records?.filter(r => r.completion_status === 'completed' && new Date(r.expiration_date) > now).length || 0;
  const expired = records?.filter(r => r.completion_status === 'expired' || new Date(r.expiration_date) <= now).length || 0;
  const pending = records?.filter(r => r.completion_status === 'pending').length || 0;

  return {
    completed,
    expired,
    pending,
    total: records?.length || 0
  };
}

export async function createTrainingRecord(data: {
  organization_id?: string | null;
  staff_member_id?: string | null;
  full_name: string;
  email: string;
  role_title: string;
  training_type: 'initial' | 'annual' | 'remedial';
  training_date: string;
  completion_status: 'completed' | 'pending' | 'expired';
  expiration_date: string;
  acknowledgement: boolean;
  acknowledgement_date: string;
  recorded_by: string;
  record_timestamp: string;
  training_content_version?: string;
  quiz_score?: number;
}) {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Use API route to bypass schema cache completely
  // This calls PostgREST directly via HTTP, bypassing the TypeScript client's schema validation
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/training/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organization_id: data.organization_id || null,
        staff_member_id: data.staff_member_id || null,
        full_name: data.full_name,
        email: data.email,
        role_title: data.role_title,
        training_type: data.training_type,
        training_date: data.training_date,
        completion_status: data.completion_status,
        expiration_date: data.expiration_date,
        acknowledgement: data.acknowledgement,
        acknowledgement_date: data.acknowledgement_date,
        recorded_by: data.recorded_by,
        record_timestamp: data.record_timestamp,
        training_content_version: data.training_content_version || '1.0',
        quiz_score: data.quiz_score || null
      })
    });

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        const errorText = await response.text();
        errorData = { error: errorText };
      }
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to create training record`);
    }

    const result = await response.json();
    return result.data;
  } catch (error: any) {
    // If API route fails, provide helpful error message
    if (error.message.includes('fetch')) {
      throw new Error(
        `Failed to connect to API. Please ensure:\n` +
        `1. The function exists in Supabase (run migration 20241220000013)\n` +
        `2. Your Next.js server is running\n` +
        `3. NEXT_PUBLIC_SITE_URL is set correctly in .env.local\n\n` +
        `Original error: ${error.message}`
      );
    }
    throw error;
  }
}

export async function exportTrainingReport() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: records, error } = await supabase
    .from('training_records' as any)
    .select('*')
    .eq('user_id', user.id)
    .order('training_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to export training report: ${error.message}`);
  }

  // Format data for CSV/PDF export
  const reportData = records?.map(record => ({
    'Full Name': record.full_name,
    'Email': record.email,
    'Role/Title': record.role_title,
    'Training Type': record.training_type,
    'Training Date': new Date(record.training_date).toLocaleDateString(),
    'Expiration Date': new Date(record.expiration_date).toLocaleDateString(),
    'Status': record.completion_status,
    'Quiz Score': record.quiz_score ? `${record.quiz_score}%` : 'N/A',
    'Acknowledged': record.acknowledgement ? 'Yes' : 'No',
    'Acknowledgment Date': record.acknowledgement_date ? new Date(record.acknowledgement_date).toLocaleDateString() : 'N/A',
    'Recorded By': record.recorded_by,
    'Record Timestamp': new Date(record.record_timestamp).toLocaleString()
  })) || [];

  return reportData;
}

