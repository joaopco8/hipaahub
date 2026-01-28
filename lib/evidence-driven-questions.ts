/**
 * Evidence-Driven Compliance Questions
 * 
 * This file contains the complete mapping of all 112 questions
 * with their evidence requirements. This is the "system of record"
 * for determining what evidence must be collected for each answer.
 * 
 * Generated from: HIPAA_Evidence_Driven_System.json
 */

import { EvidenceQuestionMetadata, EvidenceType } from '@/types/evidence';

// Import the JSON data (you'll need to place the JSON file in the public folder or import it)
// For now, we'll create a function that loads it dynamically

export async function getEvidenceQuestionMetadata(questionId: string): Promise<EvidenceQuestionMetadata | null> {
  // In production, this would load from the JSON file or database
  // For now, we'll create a lookup map from the JSON structure
  
  // This is a placeholder - you'll need to import the actual JSON
  const evidenceQuestions = await import('@/data/evidence-driven-questions.json');
  
  const question = evidenceQuestions.default.questions.find(
    (q: EvidenceQuestionMetadata) => q.question_id === questionId
  );
  
  return question || null;
}

export async function getAllEvidenceQuestions(): Promise<EvidenceQuestionMetadata[]> {
  if (!evidenceQuestionsCache) {
    try {
      const evidenceQuestions = await import('@/data/evidence-driven-questions.json');
      evidenceQuestionsCache = evidenceQuestions.default.questions || [];
    } catch (error) {
      console.error('Error loading evidence questions:', error);
      return [];
    }
  }
  return evidenceQuestionsCache;
}

/**
 * Check if evidence is required for a given answer
 */
export function isEvidenceRequired(
  questionId: string,
  answer: string,
  metadata: EvidenceQuestionMetadata
): boolean {
  if (!metadata.evidence_required) {
    return false;
  }
  
  // Check required_if condition
  if (metadata.backend_field_definition.required_if) {
    const condition = metadata.backend_field_definition.required_if;
    
    // Simple condition parsing (e.g., "answer == 'yes' or answer == 'partially compliant'")
    if (condition.includes('answer ==')) {
      const matches = condition.match(/answer == ['"]([^'"]+)['"]/g);
      if (matches) {
        const requiredAnswers = matches.map(m => 
          m.replace(/answer == ['"]/, '').replace(/['"]$/, '')
        );
        return requiredAnswers.includes(answer);
      }
    }
  }
  
  // Default: if evidence_required is true, always require it
  return metadata.evidence_required;
}

/**
 * Get evidence types required for a question
 */
export function getRequiredEvidenceTypes(metadata: EvidenceQuestionMetadata): EvidenceType[] {
  return metadata.evidence_type || [];
}

/**
 * Get user-friendly instructions for evidence collection
 */
export function getEvidenceInstructions(metadata: EvidenceQuestionMetadata): string {
  return metadata.evidence_instructions_for_user || 'No evidence required.';
}
