'use client';

import { useMemo, useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/onboarding-context';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { generateRequiredDocuments } from '@/lib/generate-required-documents';
import { loadSavedRiskAssessmentAnswers } from '@/app/actions/onboarding';
import { formatDocumentForA4 } from '@/lib/document-formatter';

export default function DocumentsPage() {
  const { state, nextStep, markStepComplete } = useOnboarding();
  const router = useRouter();
  const { riskAssessment } = state;
  const [showAllDocuments, setShowAllDocuments] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string> | null>(null);
  
  // Load saved answers from database
  useEffect(() => {
    const loadAnswers = async () => {
      const saved = await loadSavedRiskAssessmentAnswers();
      if (saved?.answers) {
        setSavedAnswers(saved.answers);
      }
    };
    loadAnswers();
  }, []);

  // Generate documents based on risk assessment answers
  const requiredDocuments = useMemo(() => {
    if (!riskAssessment) return [];
    return generateRequiredDocuments(riskAssessment);
  }, [riskAssessment]);

  // Separate by severity
  const criticalDocuments = requiredDocuments.filter(doc => doc.severity === 'critical');
  const requiredDocumentsList = requiredDocuments.filter(doc => doc.severity === 'required');

  // Show first 2 critical documents initially
  const INITIAL_CRITICAL_COUNT = 2;
  const visibleCritical = showAllDocuments 
    ? criticalDocuments 
    : criticalDocuments.slice(0, INITIAL_CRITICAL_COUNT);
  const hiddenCriticalCount = Math.max(0, criticalDocuments.length - INITIAL_CRITICAL_COUNT);

  const handleGenerate = async (docId: string) => {
    setGenerating(docId);
    try {
      // Map document IDs to API document types
      const documentTypeMap: Record<string, string> = {
        'sra-policy': 'sra-policy',
        'master-policy': 'master-policy',
        'risk-management-plan': 'risk-management-plan',
        'access-control-policy': 'access-control-policy',
        'workforce-training-policy': 'workforce-training-policy',
        'sanction-policy': 'sanction-policy',
        'incident-response-policy': 'incident-response-policy',
        'business-associate-policy': 'business-associate-policy',
        'audit-logs-policy': 'audit-logs-policy',
      };

      const documentType = documentTypeMap[docId] || docId;

      // Get answers from saved database or context (prioritize saved)
      const answers = savedAnswers || riskAssessment || {};

      if (Object.keys(answers).length === 0) {
        alert('No risk assessment answers found. Please complete the risk assessment first.');
        return;
      }

      // Call document generation API
      // Evidence data will be loaded automatically by the API if not provided
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          answers,
          evidenceData: {}, // API will load evidence from database automatically
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate document');
      }

      const { document, formattedDocument } = await response.json();

      // Get document title and policy ID
      const documentTitles: Record<string, string> = {
        'sra-policy': 'Security Risk Analysis (SRA) Policy',
        'master-policy': 'HIPAA Security & Privacy Master Policy',
        'risk-management-plan': 'Risk Management Plan Policy',
        'access-control-policy': 'Access Control Policy',
        'workforce-training-policy': 'Workforce Training Policy',
        'sanction-policy': 'Sanction Policy',
        'incident-response-policy': 'Incident Response & Breach Notification Policy',
        'business-associate-policy': 'Business Associate Management Policy',
        'audit-logs-policy': 'Audit Logs & Documentation Retention Policy',
      };
      
      const policyIds: Record<string, string> = {
        'sra-policy': 'POL-002',
        'master-policy': 'MST-001',
        'risk-management-plan': 'POL-003',
        'access-control-policy': 'POL-004',
        'workforce-training-policy': 'POL-005',
        'sanction-policy': 'POL-006',
        'incident-response-policy': 'POL-007',
        'business-associate-policy': 'POL-008',
        'audit-logs-policy': 'POL-009',
      };

      const documentTitle = documentTitles[docId] || docId;
      const policyId = policyIds[docId];

      // Format document for professional A4 printing (prefer server formatted version)
      const formattedHtml = formattedDocument || formatDocumentForA4(document, documentTitle, policyId);

      // Open document in new window for preview/download
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(formattedHtml);
        newWindow.document.close();
        
        // Focus the new window
        newWindow.focus();
      }
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Failed to generate document. Please try again.');
    } finally {
      setGenerating(null);
    }
  };

  const handleContinue = () => {
    markStepComplete(6);
    nextStep();
    router.push('/onboarding/staff');
  };

  const handleBack = () => {
    router.push('/onboarding/action-plan');
  };

  return (
    <OnboardingLayout
      onNext={handleContinue}
      onBack={handleBack}
      nextButtonLabel="Continue"
      showBackButton={true}
    >
      <div className="space-y-6 max-w-[1600px] mx-auto w-full">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900">
            Required HIPAA Documents
          </h1>
          <p className="text-zinc-600">
            Compliance documentation required based on your risk assessment
          </p>
        </div>

        {/* Context Block - Always Visible */}
        <Card className="border-zinc-200 bg-zinc-50 card-premium-enter stagger-item">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-zinc-900">
              Why these documents are required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Based on your risk assessment, your organization is missing required HIPAA documentation under the Security and Privacy Rules.
              These documents are necessary to reduce legal exposure and demonstrate compliance if audited.
            </p>
          </CardContent>
        </Card>

        {/* Critical Documents - Audit Blockers */}
        {criticalDocuments.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 mb-1">
                🔴 Critical — Audit Blockers
              </h2>
              <p className="text-sm text-zinc-600">
                Missing these documents can result in penalties if audited.
              </p>
            </div>

            <div className="grid gap-4">
              {visibleCritical.map((doc, index) => (
                <Card
                  key={doc.id}
                  className="card-premium-enter stagger-item border-red-200 bg-red-50/50"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-2 rounded-lg bg-red-100 text-red-600 shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-zinc-900 text-lg">
                                {doc.name}
                              </h3>
                              <Badge className="bg-red-100 text-red-700 border-red-200">
                                Required
                              </Badge>
                            </div>
                            <p className="text-sm text-zinc-600 mb-3">
                              {doc.description}
                            </p>
                            
                            {/* Missing Reasons */}
                            <div className="mt-3 p-3 bg-white border border-red-200 rounded-lg">
                              <p className="text-xs font-semibold text-red-900 mb-2">
                                Missing due to:
                              </p>
                              <ul className="space-y-1">
                                {doc.missingReasons.map((reason, idx) => (
                                  <li key={idx} className="text-xs text-red-800 flex items-start gap-2">
                                    <span className="text-red-600 mt-0.5">•</span>
                                    <span>{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleGenerate(doc.id)}
                          disabled={generating === doc.id}
                          className="bg-[#1ad07a] text-[#0d1122] hover:bg-[#1ad07a]/90"
                        >
                          {generating === doc.id ? (
                            'Generating...'
                          ) : (
                            'Generate Compliant Policy'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Show More Button */}
            {hiddenCriticalCount > 0 && !showAllDocuments && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAllDocuments(true)}
                  className="border-zinc-300 hover:bg-zinc-50"
                >
                  <ChevronDown className="mr-2 h-4 w-4" />
                  View all required documents ({requiredDocuments.length})
                </Button>
              </div>
            )}

            {/* Collapse Button */}
            {showAllDocuments && hiddenCriticalCount > 0 && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAllDocuments(false)}
                  className="border-zinc-300 hover:bg-zinc-50"
                >
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Show less
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Required Documents - Compliance Requirements */}
        {requiredDocumentsList.length > 0 && (showAllDocuments || criticalDocuments.length <= INITIAL_CRITICAL_COUNT) && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 mb-1">
                🟡 Required for Compliance
              </h2>
            </div>

            <div className="grid gap-4">
              {requiredDocumentsList.map((doc, index) => (
                <Card
                  key={doc.id}
                  className="card-premium-enter stagger-item border-yellow-200 bg-yellow-50/50"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600 shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-zinc-900 text-lg">
                                {doc.name}
                              </h3>
                              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                                Required
                              </Badge>
                            </div>
                            <p className="text-sm text-zinc-600 mb-3">
                              {doc.description}
                            </p>
                            
                            {/* Missing Reasons */}
                            <div className="mt-3 p-3 bg-white border border-yellow-200 rounded-lg">
                              <p className="text-xs font-semibold text-yellow-900 mb-2">
                                Missing due to:
                              </p>
                              <ul className="space-y-1">
                                {doc.missingReasons.map((reason, idx) => (
                                  <li key={idx} className="text-xs text-yellow-800 flex items-start gap-2">
                                    <span className="text-yellow-600 mt-0.5">•</span>
                                    <span>{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleGenerate(doc.id)}
                          disabled={generating === doc.id}
                          className="bg-[#1ad07a] text-[#0d1122] hover:bg-[#1ad07a]/90"
                        >
                          {generating === doc.id ? (
                            'Generating...'
                          ) : (
                            'Generate Compliant Policy'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {requiredDocuments.length === 0 && (
          <Card className="card-premium-enter stagger-item border-green-200 bg-green-50">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                All required documents are in place
              </h3>
              <p className="text-zinc-600">
                Based on your risk assessment, you have the required documentation.
                You can always generate additional documents from the dashboard.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </OnboardingLayout>
  );
}
