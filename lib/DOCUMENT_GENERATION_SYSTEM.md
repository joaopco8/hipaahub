# Dynamic HIPAA Document Generation System

## Overview

This system generates legally defensible, OCR-ready HIPAA compliance documents based on onboarding risk assessment answers. Every document is personalized based on the organization's actual compliance posture.

## Architecture

### Core Components

1. **Question-to-Document Binding** (`question-document-binding.ts`)
   - Maps each question to specific document fields
   - Defines legal statements for each compliance status
   - Declares which documents are affected by each question

2. **Document Generation Engine** (`document-generation-engine.ts`)
   - Converts question answers to document field values
   - Resolves conflicts when multiple questions affect the same field
   - Generates remediation actions
   - Injects evidence and attestations

3. **Question Answer Converter** (`question-answer-converter.ts`)
   - Converts onboarding answers to QuestionAnswer format
   - Calculates compliance status and risk levels

## Data Model

### QuestionAnswer
```typescript
{
  question_id: string;
  selected_option: string;
  compliance_status: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT';
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evidence_files: Array<{ file_id, file_name, uploaded_at }>;
  attestation_signed: boolean;
  timestamp: string;
  ip_address: string;
}
```

### Document Fields
Each document has injection points (placeholders) that are replaced with dynamic content:
- `{{SRA_STATEMENT}}` - Security Risk Analysis statement
- `{{RISK_MGMT_ACTIONS}}` - Risk management actions
- `{{SECURITY_POSTURE}}` - Overall security posture
- `{{ACCESS_CONTROL_STATUS}}` - Access control status
- `{{TRAINING_STATUS}}` - Training program status
- `{{INCIDENT_PROCEDURES}}` - Incident response procedures
- `{{BREACH_NOTIFICATION_STATUS}}` - Breach notification status
- `{{VENDOR_RISK}}` - Business associate risk
- `{{AUDIT_EVIDENCE_LIST}}` - Audit evidence list
- And more...

## How It Works

### Step 1: Question Binding
Each question declares which document fields it affects:

```typescript
{
  question_id: 'risk-assessment-conducted',
  affects: [
    { document_name: 'MasterPolicy', field_name: 'SRA_STATEMENT', priority: 1 },
    { document_name: 'SRAPolicy', field_name: 'SRA_FREQUENCY', priority: 1 },
    // ...
  ],
  legal_statements: {
    COMPLIANT: 'The organization conducts...',
    PARTIAL: 'The organization conducts SRAs, however...',
    NON_COMPLIANT: 'The organization has identified...'
  }
}
```

### Step 2: Answer Processing
Answers are converted to QuestionAnswer format with compliance status and risk level.

### Step 3: Document Field Generation
For each document field:
1. Collect all questions that affect it
2. Generate legal statements based on compliance status
3. Resolve conflicts (worst status wins)
4. Merge statements if multiple questions affect same field
5. Add evidence files and attestations

### Step 4: Conflict Resolution
When multiple questions affect the same field:
- **NON_COMPLIANT** always wins
- **PARTIAL** wins over COMPLIANT
- Statements are merged intelligently

### Step 5: Template Injection
Document templates contain placeholders like `{{SRA_STATEMENT}}` that are replaced with generated content.

## Usage Example

```typescript
import { convertToQuestionAnswers } from './question-answer-converter';
import { generateDocumentFields, injectDocumentFields } from './document-generation-engine';
import { SECURITY_RISK_ANALYSIS_POLICY_TEMPLATE } from './document-templates/security-risk-analysis-policy';

// 1. Convert onboarding answers
const questionAnswers = convertToQuestionAnswers(
  answers, // Record<string, string>
  evidenceData // Optional evidence and attestations
);

// 2. Generate document fields
const documents = generateDocumentFields(questionAnswers);

// 3. Get document data for SRA Policy
const sraDocument = documents.get('SRAPolicy');

// 4. Inject into template
const finalDocument = injectDocumentFields(
  SECURITY_RISK_ANALYSIS_POLICY_TEMPLATE,
  sraDocument
);
```

## Compliance Status Logic

### COMPLIANT
- Answer indicates full compliance
- Risk score = 0
- Generates affirmative legal language
- Example: "The organization conducts a comprehensive Security Risk Analysis at least annually..."

### PARTIAL
- Answer indicates partial compliance or gaps
- Risk score = 1-2
- Generates conditional language + remediation obligation
- Example: "The organization conducts Security Risk Analyses, however frequency or documentation gaps have been identified..."

### NON_COMPLIANT
- Answer indicates non-compliance
- Risk score = 3-5
- Generates mandatory disclosure + corrective action
- Example: "The organization has identified the absence of a current Security Risk Analysis and has formally committed to remediation..."

## Evidence and Attestations

### Evidence Files
When evidence files are uploaded:
- Automatically added to `AUDIT_EVIDENCE_LIST`
- Included in SRA Policy
- Included in Risk Management Plan
- Format: "Evidence on file: • filename.pdf (uploaded on date)"

### Attestations
When attestation is signed:
- Added to Master Policy
- Added to Audit Policy
- Format: "This statement is supported by a legally binding attestation recorded on [date] from IP address [ip]."

## Remediation Actions

Automatically generated for PARTIAL and NON_COMPLIANT answers:

```typescript
{
  finding: "Compliance gap identified in: question-id",
  required_action: "Legal statement with commitment",
  severity: "MEDIUM" | "HIGH" | "CRITICAL",
  due_date: "ISO timestamp (30/60/90 days based on severity)",
  question_id: "question-id"
}
```

## Document Templates

Templates must include placeholders for dynamic fields:
- `{{SRA_STATEMENT}}`
- `{{RISK_MGMT_ACTIONS}}`
- `{{SECURITY_POSTURE}}`
- etc.

## Current Status

✅ **Implemented:**
- Core data model
- Question-to-document binding (23 questions mapped)
- Document generation engine
- Conflict resolution
- Evidence and attestation integration
- Remediation action generation

⚠️ **In Progress:**
- Complete mapping for all 150 questions (currently 23/150)
- Integration with document templates
- API endpoints for document generation

## Next Steps

1. Complete question binding for remaining 127 questions
2. Update document templates with all injection points
3. Create API endpoint for document generation
4. Add document preview functionality
5. Add document export (PDF, Word)
