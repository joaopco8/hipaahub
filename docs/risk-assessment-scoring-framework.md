# HIPAA Risk Assessment Scoring Framework
## Version 2.0 - Compliance-Focused Model

---

## EXECUTIVE SUMMARY

This framework replaces the simple percentage-based scoring with a weighted, rule-based system that:
- **Prioritizes critical HIPAA failures** that auditors focus on
- **Prevents misleading "Low Risk" results** when critical safeguards are missing
- **Uses category weighting** (Administrative > Technical > Physical) aligned with OCR enforcement priorities
- **Applies logical overrides** for critical failures that force minimum risk levels

---

## QUESTION CLASSIFICATION

### 🔴 CRITICAL Questions (Force Minimum Risk Level if Failed)

These represent **fundamental HIPAA violations** that auditors prioritize:

1. **`security-officer`** (No Security Officer) → **Force Medium Risk minimum**
2. **`risk-assessment-conducted`** (No Risk Assessment) → **Force Medium Risk minimum**
3. **`incident-response`** (No Incident Response Plan) → **Force Medium Risk minimum**
4. **`privacy-policy`** (No Privacy Policy) → **Force Medium Risk minimum**
5. **`breach-history`** (Unreported breach) → **Force High Risk regardless of score**
6. **`encryption-at-rest`** (No encryption) → **Force Medium Risk minimum**
7. **`encryption-in-transit`** (No encryption) → **Force Medium Risk minimum**
8. **`business-associates`** (No BAAs) → **Force Medium Risk minimum**

**Rule**: If ANY CRITICAL question has the highest risk answer → **minimum result is Medium Risk**
**Rule**: If `breach-history` = "yes-unreported" → **force High Risk**

### 🟡 IMPORTANT Questions (Weighted 2x)

These are **significant compliance gaps** but not automatic violations:

1. **`security-policy`** (No written policy)
2. **`workforce-training`** (No training)
3. **`access-management`** (No access procedures)
4. **`access-review`** (No access review)
5. **`contingency-plan`** (No contingency plan)
6. **`audit-logs`** (No audit logs)
7. **`cloud-baa`** (No cloud BAAs)
8. **`email-security`** (No email encryption)

**Weight**: 2x multiplier on risk score

### ⚪ SUPPORTING Questions (Standard Weight)

All other questions maintain standard 1x weight.

---

## CATEGORY WEIGHTING

Based on OCR enforcement priorities and real-world audit focus:

- **Administrative Safeguards**: **Weight 1.5x** (Most critical - governance, policies, training)
- **Technical Safeguards**: **Weight 1.2x** (Critical - encryption, access controls)
- **Physical Safeguards**: **Weight 1.0x** (Important but less frequently cited)

**Rationale**: OCR citations show Administrative failures are most common and severe.

---

## SCORING LOGIC

### Step 1: Calculate Base Scores

```typescript
// For each question:
const baseScore = selectedOption.riskScore;
const questionWeight = getQuestionWeight(questionId); // 1x, 2x, or category weight
const categoryWeight = getCategoryWeight(question.category); // 1.0x, 1.2x, 1.5x

const weightedScore = baseScore * questionWeight * categoryWeight;
```

### Step 2: Calculate Total Risk Percentage

```typescript
totalRiskScore = sum(all weightedScores);
maxPossibleScore = sum(all max(option.riskScore) * questionWeight * categoryWeight);

riskPercentage = (totalRiskScore / maxPossibleScore) * 100;
```

### Step 3: Apply Initial Classification

```typescript
if (riskPercentage < 20) {
  initialLevel = 'low';
} else if (riskPercentage < 50) {
  initialLevel = 'medium';
} else {
  initialLevel = 'high';
}
```

### Step 4: Apply Critical Overrides

```typescript
// Check for unreported breach (highest priority override)
if (answers['breach-history'] === 'yes-unreported') {
  finalLevel = 'high';
  return; // Stop here - this is a critical violation
}

// Check for any CRITICAL question with highest risk answer
const criticalFailures = checkCriticalFailures(answers);

if (criticalFailures.length >= 2) {
  // Multiple critical failures = High Risk
  finalLevel = 'high';
} else if (criticalFailures.length === 1) {
  // Single critical failure = minimum Medium Risk
  finalLevel = Math.max(initialLevel, 'medium');
} else {
  // No critical failures - use calculated level
  finalLevel = initialLevel;
}
```

---

## QUESTION WEIGHTS TABLE

| Question ID | Classification | Question Weight | Max Risk Score (Weighted) |
|------------|---------------|-----------------|--------------------------|
| security-officer | CRITICAL | 1.5x (Admin) | 7.5 |
| security-policy | IMPORTANT | 2x × 1.5x = 3x | 15 |
| privacy-policy | CRITICAL | 1.5x (Admin) | 7.5 |
| workforce-training | IMPORTANT | 2x × 1.5x = 3x | 15 |
| workforce-clearance | SUPPORTING | 1.5x (Admin) | 6 |
| access-management | IMPORTANT | 2x × 1.5x = 3x | 15 |
| access-review | IMPORTANT | 2x × 1.5x = 3x | 15 |
| contingency-plan | IMPORTANT | 2x × 1.5x = 3x | 15 |
| incident-response | CRITICAL | 1.5x (Admin) | 7.5 |
| breach-history | CRITICAL | 1.5x (Admin) | 7.5 |
| business-associates | CRITICAL | 1.5x (Admin) | 7.5 |
| baa-monitoring | SUPPORTING | 1.5x (Admin) | 4.5 |
| risk-assessment-conducted | CRITICAL | 1.5x (Admin) | 6 |
| facility-access | SUPPORTING | 1.0x (Physical) | 5 |
| workstation-security | SUPPORTING | 1.0x (Physical) | 5 |
| device-controls | SUPPORTING | 1.0x (Physical) | 4 |
| media-disposal | SUPPORTING | 1.0x (Physical) | 5 |
| access-control | SUPPORTING | 1.2x (Technical) | 6 |
| emergency-access | SUPPORTING | 1.2x (Technical) | 4.8 |
| automatic-logoff | SUPPORTING | 1.2x (Technical) | 4.8 |
| encryption-at-rest | CRITICAL | 1.2x (Technical) | 6 |
| encryption-in-transit | CRITICAL | 1.2x (Technical) | 6 |
| integrity-controls | SUPPORTING | 1.2x (Technical) | 4.8 |
| audit-logs | IMPORTANT | 2x × 1.2x = 2.4x | 12 |
| cloud-services | SUPPORTING | 1.2x (Technical) | 0 |
| cloud-baa | IMPORTANT | 2x × 1.2x = 2.4x | 12 |
| email-security | IMPORTANT | 2x × 1.2x = 2.4x | 12 |
| password-policy | SUPPORTING | 1.2x (Technical) | 4.8 |
| backup-verification | SUPPORTING | 1.2x (Technical) | 4.8 |

---

## CRITICAL FAILURE DETECTION

```typescript
const CRITICAL_QUESTIONS = [
  'security-officer',
  'risk-assessment-conducted',
  'incident-response',
  'privacy-policy',
  'breach-history',
  'encryption-at-rest',
  'encryption-in-transit',
  'business-associates'
];

function checkCriticalFailures(answers: Record<string, string>): string[] {
  const failures: string[] = [];
  
  CRITICAL_QUESTIONS.forEach(questionId => {
    const question = QUESTIONS.find(q => q.id === questionId);
    if (!question) return;
    
    const answer = answers[questionId];
    if (!answer) return;
    
    // Find the highest risk option for this question
    const highestRiskOption = question.options.reduce((max, opt) => 
      opt.riskScore > max.riskScore ? opt : max
    );
    
    // Check if user selected the highest risk option
    const selectedOption = question.options.find(opt => opt.value === answer);
    if (selectedOption && selectedOption.riskScore === highestRiskOption.riskScore) {
      failures.push(questionId);
    }
  });
  
  return failures;
}
```

---

## REVISED THRESHOLDS

Based on weighted scoring and override logic:

- **Low Risk**: < 20% AND no critical failures
- **Medium Risk**: 20-50% OR any single critical failure
- **High Risk**: > 50% OR multiple critical failures OR unreported breach

---

## LEGAL DEFENSIBILITY

This framework is defensible because:

1. **Aligns with OCR enforcement priorities** (Administrative > Technical > Physical)
2. **Maps to actual HIPAA citations** (Security Officer, Risk Assessment, BAAs are top citations)
3. **Prevents false negatives** (cannot be "Low Risk" with critical gaps)
4. **Uses transparent, explainable logic** (not a black box)
5. **Reflects real-world audit focus** (breach history, encryption, documentation)

---

## IMPLEMENTATION NOTES

- All scores are calculated server-side for security
- Override logic is applied after base calculation
- Results are stored with both base percentage and final level
- Audit trail includes which overrides were applied

---

## EXAMPLE SCENARIOS

### Scenario 1: Missing Security Officer
- Base score: 15% (would be "Low Risk")
- Critical failure: `security-officer` = "no"
- **Result: Medium Risk** (override applied)

### Scenario 2: Unreported Breach
- Base score: 30% (would be "Medium Risk")
- Critical failure: `breach-history` = "yes-unreported"
- **Result: High Risk** (highest priority override)

### Scenario 3: Multiple Critical Failures
- Base score: 35% (would be "Medium Risk")
- Critical failures: No Security Officer + No Encryption at Rest
- **Result: High Risk** (multiple failures override)

### Scenario 4: Strong Compliance
- Base score: 12% (would be "Low Risk")
- No critical failures
- **Result: Low Risk** (no overrides needed)








