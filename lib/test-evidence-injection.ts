/**
 * Test Script for Evidence Injection System
 * 
 * Demonstrates how to use the evidence injection system for policy generation.
 * 
 * Usage:
 *   npx tsx lib/test-evidence-injection.ts
 */

import {
  generatePolicyWithEvidence,
  getPolicyEvidenceRequirements,
  checkAllPoliciesEvidenceStatus,
  batchGenerateAllPoliciesWithEvidence
} from './evidence-document-integrator';
import {
  getEvidenceInjectionPointsForPolicy,
  checkPolicyEvidenceCompleteness
} from './policy-evidence-mapping';

// ================================
// TEST 1: Inspect Policy Mapping
// ================================

async function testPolicyMapping() {
  console.log('\n=== TEST 1: Policy Mapping Inspection ===\n');

  const policyId = 'MST-001';
  const mapping = getEvidenceInjectionPointsForPolicy(policyId);

  if (!mapping) {
    console.error(`❌ No mapping found for ${policyId}`);
    return;
  }

  console.log(`Policy: ${mapping.policy_name} (${mapping.policy_id})`);
  console.log(`Total Sections: ${mapping.sections.length}`);
  console.log('');

  for (const section of mapping.sections) {
    console.log(`Section ${section.section_id}: ${section.section_title}`);
    console.log(`  Evidence Injection Points: ${section.evidence_injections.length}`);
    
    for (const injection of section.evidence_injections) {
      const priorityEmoji = injection.priority === 'high' ? '🔴' : injection.priority === 'medium' ? '🟡' : '🟢';
      console.log(`    ${priorityEmoji} ${injection.evidence_name} (${injection.priority})`);
      console.log(`       Type: ${injection.injection_type}`);
      console.log(`       Position: ${injection.position}`);
    }
    console.log('');
  }

  console.log('✅ Policy mapping inspection complete\n');
}

// ================================
// TEST 2: Check Evidence Completeness
// ================================

async function testEvidenceCompleteness() {
  console.log('\n=== TEST 2: Evidence Completeness Check ===\n');

  // Simulate available evidence (replace with real data in production)
  const availableEvidenceIds = [
    'security_officer_designation',
    'privacy_officer_designation',
    'sra_report',
    'risk_management_plan',
    'workforce_training_policy',
    'training_completion_logs',
    'incident_response_plan',
    'audit_logs_sample'
  ];

  const policyId = 'MST-001';
  const completeness = checkPolicyEvidenceCompleteness(policyId, availableEvidenceIds);

  console.log(`Policy: ${policyId}`);
  console.log(`Complete: ${completeness.complete ? '✅ YES' : '❌ NO'}`);
  console.log(`Coverage: ${completeness.coverage_percent}%`);
  console.log('');

  if (completeness.missing.length > 0) {
    console.log('Missing Evidence:');
    for (const missing of completeness.missing) {
      console.log(`  ⚠️  ${missing}`);
    }
  } else {
    console.log('✅ All required evidence present!');
  }

  console.log('');
}

// ================================
// TEST 3: Get Evidence Requirements
// ================================

async function testEvidenceRequirements() {
  console.log('\n=== TEST 3: Evidence Requirements ===\n');

  const policyId = 'MST-001';
  const organizationId = 'test-org-id'; // Replace with real org ID

  try {
    const requirements = await getPolicyEvidenceRequirements(policyId, organizationId);

    console.log(`Policy: ${policyId}`);
    console.log('');
    console.log('Summary:');
    console.log(`  Total Required: ${requirements.summary.total}`);
    console.log(`  High Priority: ${requirements.summary.high_priority}`);
    console.log(`  Medium Priority: ${requirements.summary.medium_priority}`);
    console.log(`  Low Priority: ${requirements.summary.low_priority}`);
    console.log(`  Available: ${requirements.summary.available}`);
    console.log(`  Missing: ${requirements.summary.missing}`);
    console.log(`  Coverage: ${requirements.summary.coverage_percent}%`);
    console.log('');

    console.log('Required Evidence:');
    for (const req of requirements.required) {
      const statusEmoji = req.available ? '✅' : '❌';
      const priorityEmoji = req.priority === 'high' ? '🔴' : req.priority === 'medium' ? '🟡' : '🟢';
      console.log(`  ${statusEmoji} ${priorityEmoji} ${req.evidence_name}`);
      if (req.description) {
        console.log(`     ${req.description}`);
      }
    }

    console.log('');
  } catch (error) {
    console.error('❌ Error getting requirements:', error);
  }
}

// ================================
// TEST 4: Check All Policies Status
// ================================

async function testAllPoliciesStatus() {
  console.log('\n=== TEST 4: All Policies Status ===\n');

  const organizationId = 'test-org-id'; // Replace with real org ID

  try {
    const status = await checkAllPoliciesEvidenceStatus(organizationId);

    console.log(`Overall Status: ${status.overall_status.toUpperCase()}`);
    console.log(`Overall Coverage: ${status.overall_coverage_percent}%`);
    console.log('');

    console.log('Individual Policies:');
    for (const policy of status.policies) {
      const statusEmoji = 
        policy.status === 'ready' ? '✅' : 
        policy.status === 'partial' ? '⚠️' : '❌';
      
      console.log(`${statusEmoji} ${policy.policyId} - ${policy.coveragePercent}% coverage`);
      
      if (policy.missingHighPriority.length > 0) {
        console.log(`   Missing High Priority:`);
        for (const missing of policy.missingHighPriority) {
          console.log(`     ⚠️  ${missing}`);
        }
      }
    }

    console.log('');
  } catch (error) {
    console.error('❌ Error checking status:', error);
  }
}

// ================================
// TEST 5: Generate Policy with Evidence
// ================================

async function testPolicyGeneration() {
  console.log('\n=== TEST 5: Policy Generation with Evidence ===\n');

  const policyId = 'MST-001';
  const organizationId = 'test-org-id'; // Replace with real org ID

  // Mock base policy content (replace with real template in production)
  const basePolicyContent = `
# HIPAA Security & Privacy Master Policy

## 1. Purpose and Scope

This policy establishes the framework for protecting Protected Health Information (PHI).

## 1.1 Document Control & Governance

[Evidence will be injected here]

## 2. Security Risk Analysis & Management

[Evidence will be injected here]

## 3. Sanctions & Discipline

[Evidence will be injected here]
`.trim();

  try {
    const result = await generatePolicyWithEvidence(
      policyId,
      basePolicyContent,
      organizationId,
      {
        includeEvidenceSummary: true,
        validateBeforeGeneration: true,
        requireHighPriorityEvidence: false // Set to true in production
      }
    );

    if (result.success) {
      console.log('✅ Policy generated successfully!');
      console.log('');
      console.log('Validation Results:');
      console.log(`  Can Generate: ${result.validation?.canGenerate ? 'YES' : 'NO'}`);
      console.log(`  Coverage: ${result.validation?.coveragePercent}%`);
      
      if (result.validation?.missingHighPriority && result.validation.missingHighPriority.length > 0) {
        console.log('  Missing High Priority:');
        for (const missing of result.validation.missingHighPriority) {
          console.log(`    ⚠️  ${missing}`);
        }
      }

      console.log('');
      console.log('Generated Document Preview (first 500 chars):');
      console.log('---');
      console.log(result.document?.substring(0, 500) + '...');
      console.log('---');
    } else {
      console.error('❌ Policy generation failed:', result.error);
    }

    console.log('');
  } catch (error) {
    console.error('❌ Error generating policy:', error);
  }
}

// ================================
// TEST 6: Batch Generate All Policies
// ================================

async function testBatchGeneration() {
  console.log('\n=== TEST 6: Batch Policy Generation ===\n');

  const organizationId = 'test-org-id'; // Replace with real org ID

  // Mock base contents for all policies (replace with real templates in production)
  const policyBaseContents: Record<string, string> = {
    'MST-001': '# HIPAA Security & Privacy Master Policy\n\n[Base content]',
    'POL-002': '# Security Risk Analysis Policy\n\n[Base content]',
    'POL-003': '# Risk Management Plan Policy\n\n[Base content]',
    'POL-004': '# Access Control Policy\n\n[Base content]',
    'POL-005': '# Workforce Training Policy\n\n[Base content]',
    'POL-006': '# Sanction Policy\n\n[Base content]',
    'POL-007': '# Incident Response & Breach Notification Policy\n\n[Base content]',
    'POL-008': '# Business Associate Management Policy\n\n[Base content]',
    'POL-009': '# Audit Logs & Documentation Retention Policy\n\n[Base content]'
  };

  try {
    const result = await batchGenerateAllPoliciesWithEvidence(
      organizationId,
      policyBaseContents,
      {
        includeEvidenceSummary: true,
        skipIfMissingHighPriority: false
      }
    );

    console.log('Batch Generation Results:');
    console.log(`  Total: ${result.summary.total}`);
    console.log(`  Generated: ${result.summary.generated} ✅`);
    console.log(`  Skipped: ${result.summary.skipped} ⚠️`);
    console.log(`  Failed: ${result.summary.failed} ❌`);
    console.log('');

    console.log('Individual Results:');
    for (const res of result.results) {
      const statusEmoji = res.success ? '✅' : '❌';
      console.log(`${statusEmoji} ${res.policyId} - ${res.coveragePercent}% coverage`);
      
      if (res.error) {
        console.log(`   Error: ${res.error}`);
      }
      
      if (res.missingHighPriority > 0) {
        console.log(`   Missing High Priority: ${res.missingHighPriority}`);
      }
    }

    console.log('');
  } catch (error) {
    console.error('❌ Error in batch generation:', error);
  }
}

// ================================
// RUN ALL TESTS
// ================================

async function runAllTests() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   HIPAA Evidence Injection System - Test Suite      ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  try {
    await testPolicyMapping();
    await testEvidenceCompleteness();
    await testEvidenceRequirements();
    await testAllPoliciesStatus();
    await testPolicyGeneration();
    await testBatchGeneration();

    console.log('\n✅ All tests completed!\n');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}

// Export for use in other files
export {
  testPolicyMapping,
  testEvidenceCompleteness,
  testEvidenceRequirements,
  testAllPoliciesStatus,
  testPolicyGeneration,
  testBatchGeneration,
  runAllTests
};
