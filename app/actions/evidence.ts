'use server';

import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';

export interface EvidenceDocument {
  id: string;
  question_id: string;
  question_text?: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  storage_path: string;
  download_url: string;
  uploaded_at: string;
  uploaded_by?: string;
  evidence_type: 'document' | 'screenshot' | 'log';
  category?: string;
}

/**
 * Load all evidence documents for the current user
 */
export async function getAllEvidenceDocuments(): Promise<EvidenceDocument[]> {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return [];
  }

  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!organization) {
    return [];
  }

  // Get all risk assessment IDs for this user
  // Note: onboarding_risk_assessments table exists but may not be in TypeScript types yet
  const { data: assessments } = await (supabase as any)
    .from('onboarding_risk_assessments')
    .select('id')
    .eq('user_id', user.id);

  if (!assessments || assessments.length === 0) {
    return [];
  }

  const assessmentIds = assessments?.map((a: any) => a.id) || [];

  // Load all evidence records
  // Note: risk_assessment_evidence table exists but may not be in TypeScript types yet
  const { data: evidenceRecords, error } = await (supabase as any)
    .from('risk_assessment_evidence')
    .select('id, question_id, evidence_data, uploaded_at, uploaded_by, evidence_type')
    .eq('organization_id', organization.id)
    .in('risk_assessment_id', assessmentIds)
    .order('uploaded_at', { ascending: false });

  if (error || !evidenceRecords) {
    console.error('Error loading evidence records:', error);
    return [];
  }

  const documents: EvidenceDocument[] = [];

  // Process each evidence record
  for (const record of evidenceRecords) {
    const evidence = record.evidence_data as any;

    // Extract documents
    if (evidence?.documents && Array.isArray(evidence.documents)) {
      for (const doc of evidence.documents) {
        const storagePath = doc.storage_path || doc.file_id || '';
        if (!storagePath) continue;

        // Generate signed URL for download (valid for 1 hour)
        let downloadUrl = '';
        try {
          const { data: urlData, error: urlError } = await supabase.storage
            .from('evidence')
            .createSignedUrl(storagePath, 3600);
          
          if (!urlError && urlData?.signedUrl) {
            downloadUrl = urlData.signedUrl;
          }
        } catch (error) {
          console.warn('Failed to generate signed URL for', storagePath, error);
        }

        documents.push({
          id: `${record.id}-doc-${doc.file_id || Date.now()}`,
          question_id: record.question_id,
          file_name: doc.file_name || doc.name || 'Document',
          file_type: doc.file_type || 'application/pdf',
          file_size: doc.file_size,
          storage_path: storagePath,
          download_url: downloadUrl,
          uploaded_at: doc.uploaded_at || record.uploaded_at || new Date().toISOString(),
          uploaded_by: record.uploaded_by || user.id,
          evidence_type: 'document',
          category: getCategoryFromQuestionId(record.question_id)
        });
      }
    }

    // Extract screenshots
    if (evidence?.screenshots && Array.isArray(evidence.screenshots)) {
      for (const screenshot of evidence.screenshots) {
        const storagePath = screenshot.storage_path || screenshot.file_id || '';
        if (!storagePath) continue;

        let downloadUrl = '';
        try {
          const { data: urlData, error: urlError } = await supabase.storage
            .from('evidence')
            .createSignedUrl(storagePath, 3600);
          
          if (!urlError && urlData?.signedUrl) {
            downloadUrl = urlData.signedUrl;
          }
        } catch (error) {
          console.warn('Failed to generate signed URL for', storagePath, error);
        }

        documents.push({
          id: `${record.id}-screenshot-${screenshot.file_id || Date.now()}`,
          question_id: record.question_id,
          file_name: screenshot.file_name || screenshot.name || 'Screenshot',
          file_type: screenshot.file_type || 'image/png',
          file_size: screenshot.file_size,
          storage_path: storagePath,
          download_url: downloadUrl,
          uploaded_at: screenshot.uploaded_at || record.uploaded_at || new Date().toISOString(),
          uploaded_by: record.uploaded_by || user.id,
          evidence_type: 'screenshot',
          category: getCategoryFromQuestionId(record.question_id)
        });
      }
    }

    // Extract logs
    if (evidence?.logs && Array.isArray(evidence.logs)) {
      for (const log of evidence.logs) {
        documents.push({
          id: `${record.id}-log-${Date.now()}`,
          question_id: record.question_id,
          file_name: `Log - ${log.log_type || 'Export'}`,
          file_type: `text/${log.log_format || 'txt'}`,
          file_size: log.log_content?.length || 0,
          storage_path: '',
          download_url: '',
          uploaded_at: log.exported_at || record.uploaded_at || new Date().toISOString(),
          uploaded_by: log.exported_by || record.uploaded_by || user.id,
          evidence_type: 'log',
          category: getCategoryFromQuestionId(record.question_id)
        });
      }
    }
  }

  return documents.sort((a, b) => 
    new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
  );
}

/**
 * Get category from question ID prefix
 */
function getCategoryFromQuestionId(questionId: string): string {
  if (questionId.startsWith('ADM-')) return 'Administrative';
  if (questionId.startsWith('PHYS-')) return 'Physical';
  if (questionId.startsWith('TECH-')) return 'Technical';
  if (questionId.startsWith('VENDOR-')) return 'Vendor';
  if (questionId.startsWith('TRAIN-')) return 'Training';
  if (questionId.startsWith('INCIDENT-')) return 'Incident';
  return 'Other';
}

