/**
 * Question Answer Converter
 * Converts onboarding risk assessment answers to QuestionAnswer format
 * for document generation engine
 */

import { QuestionAnswer, ComplianceStatus, RiskLevel } from './question-document-binding';
import { getComplianceStatusFromAnswer, getRiskLevel } from './document-generation-engine';
import { QUESTIONS, type Question } from '@/app/(onboarding)/onboarding/risk-assessment/questions';

export interface OnboardingAnswer {
  question_id: string;
  selected_option: string;
  evidence_files?: Array<{
    file_id: string;
    file_name: string;
    uploaded_at: string;
    storage_path?: string;
    download_url?: string;
  }>;
  attestation_signed?: boolean;
  timestamp?: string;
  ip_address?: string;
}

/**
 * Convert onboarding answers to QuestionAnswer format
 */
export function convertToQuestionAnswers(
  answers: Record<string, string>,
  evidenceData?: Record<string, {
    files: Array<{ 
      file_id: string; 
      file_name: string; 
      uploaded_at: string;
      storage_path?: string;
      download_url?: string;
    }>;
    attestation_signed: boolean;
    timestamp: string;
    ip_address: string;
  }>
): QuestionAnswer[] {
  const questionAnswers: QuestionAnswer[] = [];
  
  for (const [questionId, selectedOption] of Object.entries(answers)) {
    // Find question to get risk score
    const question = QUESTIONS.find(q => q.id === questionId);
    if (!question) continue;
    
    // Find selected option to get risk score
    const option = question.options.find(opt => opt.value === selectedOption);
    if (!option) continue;
    
    // Get compliance status
    const complianceStatus = getComplianceStatusFromAnswer(questionId, selectedOption);
    
    // Get risk level
    const riskLevel = getRiskLevel(complianceStatus, option.riskScore);
    
    // Get evidence and attestation data
    const evidence = evidenceData?.[questionId];
    
    if (evidence && evidence.files && evidence.files.length > 0) {
      console.log(`📎 Found evidence for question ${questionId}:`, {
        filesCount: evidence.files.length,
        fileNames: evidence.files.map((f: any) => f.file_name)
      });
    }
    
    const questionAnswer: QuestionAnswer = {
      question_id: questionId,
      selected_option: selectedOption,
      compliance_status: complianceStatus,
      risk_level: riskLevel,
      evidence_files: evidence?.files || [],
      attestation_signed: evidence?.attestation_signed || false,
      timestamp: evidence?.timestamp || new Date().toISOString(),
      ip_address: evidence?.ip_address || 'unknown'
    };
    
    questionAnswers.push(questionAnswer);
  }
  
  return questionAnswers;
}

/**
 * Get risk score for an answer option
 */
export function getRiskScoreForAnswer(questionId: string, selectedOption: string): number {
  const question = QUESTIONS.find(q => q.id === questionId);
  if (!question) return 5; // Default to high risk if question not found
  
  const option = question.options.find(opt => opt.value === selectedOption);
  return option?.riskScore || 5;
}
