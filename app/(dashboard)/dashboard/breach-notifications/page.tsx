'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { validateOrganizationData } from '@/lib/validate-organization-data';
import type { OrganizationData } from '@/lib/document-generator';
import { 
  generatePatientNotificationLetter, 
  generateHHSOCRNotificationLetter, 
  generateMediaNotificationLetter,
  type BreachDetails
} from '@/lib/document-templates/breach-notification-letters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { classifyBreachLegalStatus, isBreachNotificationRequired, getLegalDefenseStatement } from '@/lib/breach-classification';
import { generatePatientNotificationPDF, downloadPDF } from '@/lib/pdf-generator';

export default function BreachNotificationsPage() {
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [letters, setLetters] = useState<{
    patient: string | null;
    hhs: string | null;
    media: string | null;
  }>({
    patient: null,
    hhs: null,
    media: null,
  });

  // Breach details form
  const [breachDetails, setBreachDetails] = useState<BreachDetails>({
    discoveryDate: '',
    incidentDate: '',
    description: '',
    detailedNarrative: '',
    discoveryMethod: '',
    typesOfInfo: '',
    numberOfIndividuals: 0,
    stateOrJurisdiction: '',
    stepsTaken: '',
    stepsForPatient: '',
    // Security & Breach Classification
    encryptionAtRest: 'Unknown',
    encryptionInTransit: 'Unknown',
    mfaEnabled: 'Unknown',
    incidentType: 'Hacking / Malware',
    // Business Associate
    businessAssociateInvolved: false,
    businessAssociateName: '',
    // Governance & Legal Chain of Custody
    discoveredByName: '',
    discoveredByRole: '',
    investigationLeadName: '',
    investigationLeadRole: '',
    authorizedBy: 'Privacy Officer',
    // Law Enforcement
    lawEnforcementNotified: false,
    lawEnforcementDelay: false,
    // Jurisdiction
    statesAffected: [],
    // PHI Categories (defaults to true for common ones)
    phiNameIncluded: true,
    phiSsnIncluded: false,
    phiDobIncluded: true,
    phiMrnIncluded: true,
    phiInsuranceIncluded: false,
    phiDiagnosisIncluded: false,
    phiMedicationIncluded: false,
    phiLabImagingIncluded: false,
    phiBillingIncluded: false,
    phiProviderIncluded: false,
    phiClaimsIncluded: false,
    phiOtherIncluded: false,
    phiOtherDescription: '',
    // System Information
    systemName: '',
    systemType: '',
    dataLocation: '',
    encryptionStatus: '',
    authenticationControls: '',
    technicalDetails: '',
    // Response Actions
    containmentActions: '',
    forensicInvestigator: '',
    lawEnforcementNotificationStatus: '',
    haveNotifiedOrWillNotify: '',
    securityEnhancements: '',
    // Credit Monitoring
    creditMonitoringOffered: false,
    creditMonitoringDuration: 12,
    creditMonitoringProvider: '',
    creditMonitoringEnrollmentUrl: '',
    creditMonitoringPhoneNumber: '',
    enrollmentCode: '',
    identityTheftInsuranceAmount: '',
    enrollmentDeadlineDays: 60,
    // Additional Information
    investigationFindings: '',
    rootCauseAnalysis: '',
    correctiveActionsSummary: '',
    breachId: '',
    breachLegalStatus: 'Under Investigation',
  });

  useEffect(() => {
    async function loadOrganization() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: orgData, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error loading organization:', error);
          setLoading(false);
          return;
        }

        if (orgData) {
          setOrganization(orgData as OrganizationData);
          const validation = validateOrganizationData(orgData as OrganizationData);
          if (!validation.isValid) {
            setValidationError('Please complete your organization profile with all required fields before generating breach notification letters.');
          }
        }
      } catch (error) {
        console.error('Error loading organization:', error);
      } finally {
        setLoading(false);
      }
    }
    loadOrganization();
  }, []);

  const handleGenerate = () => {
    if (!organization) return;

    // Validate all required fields before generation
    const missingFields: string[] = [];
    
    if (!breachDetails.discoveryDate.trim()) missingFields.push('Discovery Date');
    if (!breachDetails.incidentDate.trim()) missingFields.push('Incident Date');
    if (!breachDetails.numberOfIndividuals || breachDetails.numberOfIndividuals === 0) missingFields.push('Number of Individuals Affected');
    if (!breachDetails.description.trim()) missingFields.push('Description of the Breach');
    if (!breachDetails.typesOfInfo.trim()) missingFields.push('Types of Information Involved');
    if (!breachDetails.stepsTaken.trim()) missingFields.push('Steps Taken to Investigate and Address the Breach');
    if (!breachDetails.stepsForPatient.trim()) missingFields.push('Steps for Patients to Protect Themselves');

    const numIndividuals = breachDetails.numberOfIndividuals || 0;
    const requiresMedia = numIndividuals >= 500;

    // If media notification required, validate state/jurisdiction
    if (requiresMedia && !breachDetails.stateOrJurisdiction?.trim()) {
      missingFields.push('State or Jurisdiction (required for 500+ individuals)');
    }

    // Block generation if any required field is missing
    if (missingFields.length > 0) {
      alert(
        `Cannot generate notification letters. Please fill in all required fields:\n\n` +
        missingFields.map(field => `• ${field}`).join('\n')
      );
      return;
    }

    // Calculate legal status
    const legalStatus = classifyBreachLegalStatus(breachDetails);

    // Build complete BreachDetails object with defaults
    const completeBreachDetails: BreachDetails = {
      discoveryDate: breachDetails.discoveryDate,
      incidentDate: breachDetails.incidentDate,
      description: breachDetails.description,
      detailedNarrative: breachDetails.detailedNarrative || breachDetails.description,
      discoveryMethod: breachDetails.discoveryMethod || 'our security monitoring systems',
      typesOfInfo: breachDetails.typesOfInfo,
      stepsTaken: breachDetails.stepsTaken,
      stepsForPatient: breachDetails.stepsForPatient,
      numberOfIndividuals: numIndividuals,
      stateOrJurisdiction: breachDetails.stateOrJurisdiction,
      additionalScopeInformation: breachDetails.additionalScopeInformation,
      // Security & Breach Classification
      encryptionAtRest: breachDetails.encryptionAtRest || 'Unknown',
      encryptionInTransit: breachDetails.encryptionInTransit || 'Unknown',
      mfaEnabled: breachDetails.mfaEnabled || 'Unknown',
      incidentType: breachDetails.incidentType || 'Hacking / Malware',
      // Business Associate
      businessAssociateInvolved: breachDetails.businessAssociateInvolved || false,
      businessAssociateName: breachDetails.businessAssociateName,
      // Governance & Legal Chain of Custody
      discoveredByName: breachDetails.discoveredByName || 'Not Specified',
      discoveredByRole: breachDetails.discoveredByRole || 'Not Specified',
      investigationLeadName: breachDetails.investigationLeadName || 'Not Specified',
      investigationLeadRole: breachDetails.investigationLeadRole || 'Not Specified',
      authorizedBy: breachDetails.authorizedBy || 'Privacy Officer',
      // Law Enforcement
      lawEnforcementNotified: breachDetails.lawEnforcementNotified || false,
      lawEnforcementDelay: breachDetails.lawEnforcementDelay || false,
      // Jurisdiction
      statesAffected: breachDetails.statesAffected || [],
      // PHI Categories
      phiNameIncluded: breachDetails.phiNameIncluded,
      phiSsnIncluded: breachDetails.phiSsnIncluded,
      phiDobIncluded: breachDetails.phiDobIncluded,
      phiMrnIncluded: breachDetails.phiMrnIncluded,
      phiInsuranceIncluded: breachDetails.phiInsuranceIncluded,
      phiDiagnosisIncluded: breachDetails.phiDiagnosisIncluded,
      phiMedicationIncluded: breachDetails.phiMedicationIncluded,
      phiLabImagingIncluded: breachDetails.phiLabImagingIncluded,
      phiBillingIncluded: breachDetails.phiBillingIncluded,
      phiProviderIncluded: breachDetails.phiProviderIncluded,
      phiClaimsIncluded: breachDetails.phiClaimsIncluded,
      phiOtherIncluded: breachDetails.phiOtherIncluded,
      phiOtherDescription: breachDetails.phiOtherDescription,
      // System Information
      systemName: breachDetails.systemName || 'Not Specified',
      systemType: breachDetails.systemType || 'Not Specified',
      dataLocation: breachDetails.dataLocation || 'Not Specified',
      encryptionStatus: breachDetails.encryptionStatus || 'Not Specified',
      authenticationControls: breachDetails.authenticationControls || 'Not Specified',
      technicalDetails: breachDetails.technicalDetails || breachDetails.description,
      // Response Actions
      containmentActions: breachDetails.containmentActions || 'isolating affected systems and revoking unauthorized access',
      forensicInvestigator: breachDetails.forensicInvestigator || 'qualified security professionals',
      lawEnforcementNotificationStatus: breachDetails.lawEnforcementNotificationStatus || 'We have notified',
      haveNotifiedOrWillNotify: breachDetails.haveNotifiedOrWillNotify || 'have notified',
      securityEnhancements: breachDetails.securityEnhancements || breachDetails.stepsTaken,
      // Credit Monitoring
      creditMonitoringOffered: breachDetails.creditMonitoringOffered,
      creditMonitoringDuration: breachDetails.creditMonitoringDuration,
      creditMonitoringProvider: breachDetails.creditMonitoringProvider,
      creditMonitoringEnrollmentUrl: breachDetails.creditMonitoringEnrollmentUrl,
      creditMonitoringPhoneNumber: breachDetails.creditMonitoringPhoneNumber,
      enrollmentCode: breachDetails.enrollmentCode,
      identityTheftInsuranceAmount: breachDetails.identityTheftInsuranceAmount,
      enrollmentDeadlineDays: breachDetails.enrollmentDeadlineDays,
      // Additional Information
      investigationFindings: breachDetails.investigationFindings,
      rootCauseAnalysis: breachDetails.rootCauseAnalysis,
      correctiveActionsSummary: breachDetails.correctiveActionsSummary,
      breachId: breachDetails.breachId || `BREACH-${Date.now()}`,
      // Legal Classification
      breachLegalStatus: legalStatus,
    };

    // Generate Patient Notification Letter (always required)
    const patientLetter = generatePatientNotificationLetter(organization, completeBreachDetails);

    // Generate HHS OCR Notification Letter (required for 500+ individuals)
    const hhsLetter = numIndividuals >= 500
      ? generateHHSOCRNotificationLetter(organization, completeBreachDetails)
      : null;

    // Generate Media Notification Letter (required for 500+ residents of a state)
    const mediaLetter = requiresMedia && breachDetails.stateOrJurisdiction
      ? generateMediaNotificationLetter(organization, completeBreachDetails)
      : null;

    setLetters({
      patient: patientLetter,
      hhs: hhsLetter,
      media: mediaLetter,
    });
  };

  const downloadLetter = async (content: string, filename: string, letterType: 'patient' | 'hhs' | 'media' = 'patient') => {
    // For Patient Notification Letter, generate professional PDF
    if (letterType === 'patient' && organization) {
      try {
        console.log('Generating PDF for Patient Notification Letter...');
        console.log('Organization:', organization);
        console.log('Content length:', content.length);
        
        const pdfBlob = await generatePatientNotificationPDF({
          organizationName: organization.legal_name || organization.name || 'Organization',
          documentTitle: 'HIPAA Breach Notification Letter',
          content: content,
          recipientName: breachDetails.discoveredByName || 'Patient',
          breachId: breachDetails.breachId || undefined
        });
        
        console.log('PDF generated successfully, size:', pdfBlob.size);
        
        if (!pdfBlob || pdfBlob.size === 0) {
          throw new Error('PDF blob is empty');
        }
        
        const pdfFilename = filename.replace('.txt', '.pdf').replace('.pdf', '.pdf'); // Ensure .pdf extension
        console.log('Downloading PDF with filename:', pdfFilename);
        downloadPDF(pdfBlob, pdfFilename);
        return;
      } catch (error) {
        console.error('Error generating PDF:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : String(error));
        // Fall through to text download if PDF generation fails
        alert(`Error generating PDF: ${error instanceof Error ? error.message : String(error)}. Downloading as text file instead.`);
      }
    }
    
    // Fallback to text download for other letter types or if PDF generation fails
    console.log('Downloading as text file...');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col gap-6 max-w-[1600px] mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex min-h-screen w-full flex-col gap-6 max-w-[1600px] mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Organization data not found. Please complete your organization profile first.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="flex min-h-screen w-full flex-col gap-6 max-w-[1600px] mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const numIndividuals =
    typeof breachDetails.numberOfIndividuals === 'string'
      ? parseInt(breachDetails.numberOfIndividuals, 10) || 0
      : breachDetails.numberOfIndividuals || 0;
  const requiresMedia = numIndividuals >= 500;

  // Check if all required fields are filled
  const isFormComplete = 
    breachDetails.discoveryDate.trim() !== '' &&
    breachDetails.incidentDate.trim() !== '' &&
    breachDetails.numberOfIndividuals > 0 &&
    breachDetails.description.trim() !== '' &&
    breachDetails.typesOfInfo.trim() !== '' &&
    breachDetails.stepsTaken.trim() !== '' &&
    breachDetails.stepsForPatient.trim() !== '' &&
    (!requiresMedia || breachDetails.stateOrJurisdiction?.trim() !== '');

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          HIPAA Breach Notification Letters
        </h1>
        <p className="text-zinc-600 text-base">
          Generate compliant breach notification letters for patients, HHS OCR, and media
        </p>
      </div>

      {/* Breach Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Breach Information</CardTitle>
          <CardDescription>
            Enter the details of the breach to generate notification letters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discoveryDate" className="text-zinc-900">Discovery Date *</Label>
              <Input
                id="discoveryDate"
                type="date"
                value={breachDetails.discoveryDate}
                onChange={(e) => setBreachDetails({ ...breachDetails, discoveryDate: e.target.value })}
                className="text-zinc-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="incidentDate" className="text-zinc-900">Incident Date *</Label>
              <Input
                id="incidentDate"
                type="date"
                value={breachDetails.incidentDate}
                onChange={(e) => setBreachDetails({ ...breachDetails, incidentDate: e.target.value })}
                className="text-zinc-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfIndividuals" className="text-zinc-900">Number of Individuals Affected *</Label>
            <Input
              id="numberOfIndividuals"
              type="number"
              value={breachDetails.numberOfIndividuals || ''}
              onChange={(e) => setBreachDetails({ ...breachDetails, numberOfIndividuals: parseInt(e.target.value) || 0 })}
              placeholder="e.g., 500"
              className="text-zinc-900"
            />
            {numIndividuals >= 500 && (
              <p className="text-sm text-amber-700 mt-2 font-medium">
                Media notification required for breaches affecting 500+ individuals
              </p>
            )}
          </div>

          {requiresMedia && (
            <div className="space-y-2">
              <Label htmlFor="stateOrJurisdiction" className="text-zinc-900">State or Jurisdiction *</Label>
              <Input
                id="stateOrJurisdiction"
                value={breachDetails.stateOrJurisdiction}
                onChange={(e) => setBreachDetails({ ...breachDetails, stateOrJurisdiction: e.target.value })}
                placeholder="e.g., California"
                className="text-zinc-900"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description" className="text-zinc-900">Description of the Breach *</Label>
            <Textarea
              id="description"
              value={breachDetails.description}
              onChange={(e) => setBreachDetails({ ...breachDetails, description: e.target.value })}
              placeholder="Describe what happened, how the breach occurred, and what information was involved..."
              rows={4}
              className="text-zinc-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="detailedNarrative" className="text-zinc-900">Detailed Incident Narrative (Optional)</Label>
            <Textarea
              id="detailedNarrative"
              value={breachDetails.detailedNarrative}
              onChange={(e) => setBreachDetails({ ...breachDetails, detailedNarrative: e.target.value })}
              placeholder="Detailed description of how the unauthorized access or disclosure occurred (will use description if not provided)..."
              rows={3}
              className="text-zinc-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discoveryMethod" className="text-zinc-900">Discovery Method</Label>
            <Input
              id="discoveryMethod"
              value={breachDetails.discoveryMethod}
              onChange={(e) => setBreachDetails({ ...breachDetails, discoveryMethod: e.target.value })}
              placeholder="e.g., security monitoring systems, employee report, audit review"
              className="text-zinc-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="typesOfInfo" className="text-zinc-900">Types of Information Involved *</Label>
            <Textarea
              id="typesOfInfo"
              value={breachDetails.typesOfInfo}
              onChange={(e) => setBreachDetails({ ...breachDetails, typesOfInfo: e.target.value })}
              placeholder="e.g., Names, dates of birth, Social Security numbers, medical record numbers, diagnoses, treatment information..."
              rows={3}
              className="text-zinc-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stepsTaken" className="text-zinc-900">Steps Taken to Investigate and Address the Breach *</Label>
            <Textarea
              id="stepsTaken"
              value={breachDetails.stepsTaken}
              onChange={(e) => setBreachDetails({ ...breachDetails, stepsTaken: e.target.value })}
              placeholder="Describe the investigation, containment, remediation, and preventive measures taken..."
              rows={4}
              className="text-zinc-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stepsForPatient" className="text-zinc-900">Steps for Patients to Protect Themselves *</Label>
            <Textarea
              id="stepsForPatient"
              value={breachDetails.stepsForPatient}
              onChange={(e) => setBreachDetails({ ...breachDetails, stepsForPatient: e.target.value })}
              placeholder="e.g., Monitor credit reports, review medical records, report suspicious activity..."
              rows={3}
              className="text-zinc-900"
            />
          </div>

          {/* Security & Breach Classification Section (45 CFR §164.402) */}
          <div className="border-t border-zinc-200 pt-6">
            <Label className="text-base font-semibold text-zinc-900 mb-4 block">Security & Breach Classification *</Label>
            <p className="text-sm text-zinc-600 mb-4">
              These fields determine whether the breach is reportable under 45 CFR §164.402. If PHI was encrypted at rest AND in transit, it is NOT a reportable breach.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="encryptionAtRest" className="text-zinc-900">Was PHI Encrypted at Rest? *</Label>
                <Select
                  value={breachDetails.encryptionAtRest || 'Unknown'}
                  onValueChange={(value: 'Yes' | 'No' | 'Unknown') => setBreachDetails({ ...breachDetails, encryptionAtRest: value })}
                >
                  <SelectTrigger className="text-zinc-900">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="encryptionInTransit" className="text-zinc-900">Was PHI Encrypted in Transit? *</Label>
                <Select
                  value={breachDetails.encryptionInTransit || 'Unknown'}
                  onValueChange={(value: 'Yes' | 'No' | 'Unknown') => setBreachDetails({ ...breachDetails, encryptionInTransit: value })}
                >
                  <SelectTrigger className="text-zinc-900">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mfaEnabled" className="text-zinc-900">Was MFA Enabled? *</Label>
                <Select
                  value={breachDetails.mfaEnabled || 'Unknown'}
                  onValueChange={(value: 'Yes' | 'No' | 'Unknown') => setBreachDetails({ ...breachDetails, mfaEnabled: value })}
                >
                  <SelectTrigger className="text-zinc-900">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="incidentType" className="text-zinc-900">Type of Incident *</Label>
              <Select
                value={breachDetails.incidentType || 'Hacking / Malware'}
                onValueChange={(value) => setBreachDetails({ ...breachDetails, incidentType: value as any })}
              >
                <SelectTrigger className="text-zinc-900">
                  <SelectValue placeholder="Select incident type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hacking / Malware">Hacking / Malware</SelectItem>
                  <SelectItem value="Lost Device">Lost Device</SelectItem>
                  <SelectItem value="Stolen Device">Stolen Device</SelectItem>
                  <SelectItem value="Unauthorized Employee Access">Unauthorized Employee Access</SelectItem>
                  <SelectItem value="Phishing">Phishing</SelectItem>
                  <SelectItem value="Ransomware">Ransomware</SelectItem>
                  <SelectItem value="Misconfiguration">Misconfiguration</SelectItem>
                  <SelectItem value="Business Associate Breach">Business Associate Breach</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Legal Status Display */}
            {breachDetails.encryptionAtRest && breachDetails.encryptionInTransit && (
              <div className="mt-4 p-4 rounded-lg border-2 bg-zinc-50 border-zinc-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-zinc-900">
                      Breach Legal Status: {classifyBreachLegalStatus(breachDetails)}
                    </p>
                    {getLegalDefenseStatement(breachDetails) && (
                      <p className="text-sm text-zinc-700 mt-1">
                        {getLegalDefenseStatement(breachDetails)}
                      </p>
                    )}
                    {!isBreachNotificationRequired(breachDetails) && (
                      <p className="text-sm text-amber-700 mt-2 font-medium">
                        ⚠️ Notification letters may not be required. Consult with legal counsel before proceeding.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Business Associate Section */}
          <div className="border-t border-zinc-200 pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="businessAssociateInvolved"
                checked={breachDetails.businessAssociateInvolved || false}
                onCheckedChange={(checked) => setBreachDetails({ ...breachDetails, businessAssociateInvolved: checked === true })}
              />
              <Label htmlFor="businessAssociateInvolved" className="text-base font-semibold text-zinc-900">Was a Business Associate Involved?</Label>
            </div>
            {breachDetails.businessAssociateInvolved && (
              <div className="space-y-2">
                <Label htmlFor="businessAssociateName" className="text-zinc-900">Business Associate Name *</Label>
                <Input
                  id="businessAssociateName"
                  value={breachDetails.businessAssociateName || ''}
                  onChange={(e) => setBreachDetails({ ...breachDetails, businessAssociateName: e.target.value })}
                  placeholder="e.g., ABC Cloud Services, Inc."
                  className="text-zinc-900"
                />
              </div>
            )}
          </div>

          {/* Governance & Legal Chain of Custody Section */}
          <div className="border-t border-zinc-200 pt-6">
            <Label className="text-base font-semibold text-zinc-900 mb-4 block">Governance & Legal Chain of Custody *</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discoveredByName" className="text-zinc-900">Discovered By (Name) *</Label>
                <Input
                  id="discoveredByName"
                  value={breachDetails.discoveredByName || ''}
                  onChange={(e) => setBreachDetails({ ...breachDetails, discoveredByName: e.target.value })}
                  placeholder="e.g., John Smith"
                  className="text-zinc-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discoveredByRole" className="text-zinc-900">Discovered By (Role) *</Label>
                <Input
                  id="discoveredByRole"
                  value={breachDetails.discoveredByRole || ''}
                  onChange={(e) => setBreachDetails({ ...breachDetails, discoveredByRole: e.target.value })}
                  placeholder="e.g., IT Security Manager"
                  className="text-zinc-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="investigationLeadName" className="text-zinc-900">Investigation Lead (Name) *</Label>
                <Input
                  id="investigationLeadName"
                  value={breachDetails.investigationLeadName || ''}
                  onChange={(e) => setBreachDetails({ ...breachDetails, investigationLeadName: e.target.value })}
                  placeholder="e.g., Jane Doe"
                  className="text-zinc-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="investigationLeadRole" className="text-zinc-900">Investigation Lead (Role) *</Label>
                <Input
                  id="investigationLeadRole"
                  value={breachDetails.investigationLeadRole || ''}
                  onChange={(e) => setBreachDetails({ ...breachDetails, investigationLeadRole: e.target.value })}
                  placeholder="e.g., Security Officer"
                  className="text-zinc-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorizedBy" className="text-zinc-900">Authorized By *</Label>
                <Select
                  value={breachDetails.authorizedBy || 'Privacy Officer'}
                  onValueChange={(value: 'Privacy Officer' | 'Security Officer' | 'CEO') => setBreachDetails({ ...breachDetails, authorizedBy: value })}
                >
                  <SelectTrigger className="text-zinc-900">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Privacy Officer">Privacy Officer</SelectItem>
                    <SelectItem value="Security Officer">Security Officer</SelectItem>
                    <SelectItem value="CEO">CEO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Law Enforcement Section */}
          <div className="border-t border-zinc-200 pt-6">
            <Label className="text-base font-semibold text-zinc-900 mb-4 block">Law Enforcement</Label>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lawEnforcementNotified"
                  checked={breachDetails.lawEnforcementNotified || false}
                  onCheckedChange={(checked) => setBreachDetails({ ...breachDetails, lawEnforcementNotified: checked === true })}
                />
                <Label htmlFor="lawEnforcementNotified" className="text-zinc-900">Law Enforcement Notified?</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lawEnforcementDelay"
                  checked={breachDetails.lawEnforcementDelay || false}
                  onCheckedChange={(checked) => setBreachDetails({ ...breachDetails, lawEnforcementDelay: checked === true })}
                />
                <Label htmlFor="lawEnforcementDelay" className="text-zinc-900">Law Enforcement Delay Requested?</Label>
              </div>
            </div>
          </div>

          {/* Jurisdiction Section */}
          <div className="border-t border-zinc-200 pt-6">
            <Label className="text-base font-semibold text-zinc-900 mb-4 block">Jurisdiction *</Label>
            <p className="text-sm text-zinc-600 mb-4">
              Select all US states where affected individuals reside. This determines Attorney General notification requirements.
            </p>
            <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto p-4 border border-zinc-200 rounded-lg">
              {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'].map((state) => (
                <div key={state} className="flex items-center space-x-2">
                  <Checkbox
                    id={`state-${state}`}
                    checked={(breachDetails.statesAffected || []).includes(state)}
                    onCheckedChange={(checked) => {
                      const currentStates = breachDetails.statesAffected || [];
                      if (checked) {
                        setBreachDetails({ ...breachDetails, statesAffected: [...currentStates, state] });
                      } else {
                        setBreachDetails({ ...breachDetails, statesAffected: currentStates.filter(s => s !== state) });
                      }
                    }}
                  />
                  <Label htmlFor={`state-${state}`} className="text-sm font-normal text-zinc-900">{state}</Label>
                </div>
              ))}
            </div>
            {breachDetails.statesAffected && breachDetails.statesAffected.length > 0 && (
              <p className="text-sm text-zinc-600 mt-2">
                Selected: {breachDetails.statesAffected.join(', ')}
              </p>
            )}
          </div>

          {/* PHI Categories Section */}
          <div className="border-t border-zinc-200 pt-6">
            <Label className="text-base font-semibold text-zinc-900 mb-4 block">PHI Categories Involved</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="phiName"
                  checked={breachDetails.phiNameIncluded}
                  onCheckedChange={(checked) => setBreachDetails({ ...breachDetails, phiNameIncluded: checked === true })}
                />
                <Label htmlFor="phiName" className="font-normal">Name</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="phiSsn"
                  checked={breachDetails.phiSsnIncluded}
                  onCheckedChange={(checked) => setBreachDetails({ ...breachDetails, phiSsnIncluded: checked === true })}
                />
                <Label htmlFor="phiSsn" className="font-normal">Social Security Number</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="phiDob"
                  checked={breachDetails.phiDobIncluded}
                  onCheckedChange={(checked) => setBreachDetails({ ...breachDetails, phiDobIncluded: checked === true })}
                />
                <Label htmlFor="phiDob" className="font-normal">Date of Birth</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="phiMrn"
                  checked={breachDetails.phiMrnIncluded}
                  onCheckedChange={(checked) => setBreachDetails({ ...breachDetails, phiMrnIncluded: checked === true })}
                />
                <Label htmlFor="phiMrn" className="font-normal">Medical Record Number</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="phiInsurance"
                  checked={breachDetails.phiInsuranceIncluded}
                  onCheckedChange={(checked) => setBreachDetails({ ...breachDetails, phiInsuranceIncluded: checked === true })}
                />
                <Label htmlFor="phiInsurance" className="font-normal">Health Insurance Information</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="phiDiagnosis"
                  checked={breachDetails.phiDiagnosisIncluded}
                  onCheckedChange={(checked) => setBreachDetails({ ...breachDetails, phiDiagnosisIncluded: checked === true })}
                />
                <Label htmlFor="phiDiagnosis" className="font-normal">Diagnosis and Treatment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="phiMedication"
                  checked={breachDetails.phiMedicationIncluded}
                  onCheckedChange={(checked) => setBreachDetails({ ...breachDetails, phiMedicationIncluded: checked === true })}
                />
                <Label htmlFor="phiMedication" className="font-normal">Medication Information</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="phiLabImaging"
                  checked={breachDetails.phiLabImagingIncluded}
                  onCheckedChange={(checked) => setBreachDetails({ ...breachDetails, phiLabImagingIncluded: checked === true })}
                />
                <Label htmlFor="phiLabImaging" className="font-normal">Laboratory and Imaging Results</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="phiBilling"
                  checked={breachDetails.phiBillingIncluded}
                  onCheckedChange={(checked) => setBreachDetails({ ...breachDetails, phiBillingIncluded: checked === true })}
                />
                <Label htmlFor="phiBilling" className="font-normal">Billing and Payment Information</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="phiProvider"
                  checked={breachDetails.phiProviderIncluded}
                  onCheckedChange={(checked) => setBreachDetails({ ...breachDetails, phiProviderIncluded: checked === true })}
                />
                <Label htmlFor="phiProvider" className="font-normal">Provider Information</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="phiClaims"
                  checked={breachDetails.phiClaimsIncluded}
                  onCheckedChange={(checked) => setBreachDetails({ ...breachDetails, phiClaimsIncluded: checked === true })}
                />
                <Label htmlFor="phiClaims" className="font-normal">Insurance Claims Information</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="phiOther"
                  checked={breachDetails.phiOtherIncluded}
                  onCheckedChange={(checked) => setBreachDetails({ ...breachDetails, phiOtherIncluded: checked === true })}
                />
                <Label htmlFor="phiOther" className="font-normal">Other Sensitive Information</Label>
              </div>
            </div>
            {breachDetails.phiOtherIncluded && (
              <div className="mt-3 space-y-2">
                <Label htmlFor="phiOtherDescription" className="text-zinc-900">Other Information Description</Label>
                <Input
                  id="phiOtherDescription"
                  value={breachDetails.phiOtherDescription}
                  onChange={(e) => setBreachDetails({ ...breachDetails, phiOtherDescription: e.target.value })}
                  placeholder="Describe other types of information involved..."
                  className="text-zinc-900"
                />
              </div>
            )}
          </div>

          {/* System Information Section */}
          <div className="border-t border-zinc-200 pt-6">
            <Label className="text-base font-semibold text-zinc-900 mb-4 block">System Information (Optional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="systemName" className="text-zinc-900">System Name</Label>
                <Input
                  id="systemName"
                  value={breachDetails.systemName}
                  onChange={(e) => setBreachDetails({ ...breachDetails, systemName: e.target.value })}
                  placeholder="e.g., Epic EHR System"
                  className="text-zinc-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemType" className="text-zinc-900">System Type</Label>
                <Input
                  id="systemType"
                  value={breachDetails.systemType}
                  onChange={(e) => setBreachDetails({ ...breachDetails, systemType: e.target.value })}
                  placeholder="e.g., Electronic Health Record"
                  className="text-zinc-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataLocation" className="text-zinc-900">Data Location</Label>
                <Input
                  id="dataLocation"
                  value={breachDetails.dataLocation}
                  onChange={(e) => setBreachDetails({ ...breachDetails, dataLocation: e.target.value })}
                  placeholder="e.g., Cloud-based service"
                  className="text-zinc-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="encryptionStatus" className="text-zinc-900">Encryption Status</Label>
                <Input
                  id="encryptionStatus"
                  value={breachDetails.encryptionStatus}
                  onChange={(e) => setBreachDetails({ ...breachDetails, encryptionStatus: e.target.value })}
                  placeholder="e.g., Encrypted, Unencrypted"
                  className="text-zinc-900"
                />
              </div>
            </div>
          </div>

          {/* Credit Monitoring Section */}
          <div className="border-t border-zinc-200 pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="creditMonitoring"
                checked={breachDetails.creditMonitoringOffered}
                onCheckedChange={(checked) => setBreachDetails({ ...breachDetails, creditMonitoringOffered: checked === true })}
              />
              <Label htmlFor="creditMonitoring" className="text-base font-semibold text-zinc-900">Offer Credit Monitoring Services</Label>
            </div>
            {breachDetails.creditMonitoringOffered && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creditMonitoringProvider" className="text-zinc-900">Credit Monitoring Provider</Label>
                  <Input
                    id="creditMonitoringProvider"
                    value={breachDetails.creditMonitoringProvider}
                    onChange={(e) => setBreachDetails({ ...breachDetails, creditMonitoringProvider: e.target.value })}
                    placeholder="e.g., Experian, LifeLock"
                    className="text-zinc-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditMonitoringDuration" className="text-zinc-900">Duration (months)</Label>
                  <Input
                    id="creditMonitoringDuration"
                    type="number"
                    value={breachDetails.creditMonitoringDuration}
                    onChange={(e) => setBreachDetails({ ...breachDetails, creditMonitoringDuration: parseInt(e.target.value) || 12 })}
                    placeholder="12"
                    className="text-zinc-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enrollmentCode" className="text-zinc-900">Enrollment Code</Label>
                  <Input
                    id="enrollmentCode"
                    value={breachDetails.enrollmentCode}
                    onChange={(e) => setBreachDetails({ ...breachDetails, enrollmentCode: e.target.value })}
                    placeholder="Enrollment code for patients"
                    className="text-zinc-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditMonitoringEnrollmentUrl" className="text-zinc-900">Enrollment URL</Label>
                  <Input
                    id="creditMonitoringEnrollmentUrl"
                    value={breachDetails.creditMonitoringEnrollmentUrl}
                    onChange={(e) => setBreachDetails({ ...breachDetails, creditMonitoringEnrollmentUrl: e.target.value })}
                    placeholder="https://..."
                    className="text-zinc-900"
                  />
                </div>
              </div>
            )}
          </div>

          {!isFormComplete && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Required fields missing:</strong> Please fill in all fields marked with * before generating notification letters. 
                {requiresMedia && !breachDetails.stateOrJurisdiction?.trim() && (
                  <span className="block mt-1">
                    • State/Jurisdiction is required for breaches affecting 500+ individuals
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleGenerate} 
            disabled={!isFormComplete}
            className="w-full bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed" 
            size="lg"
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Notification Letters
          </Button>
        </CardContent>
      </Card>

      {/* Generated Letters */}
      {letters.patient && (
        <div className="space-y-6">
          {/* Patient Notification Letter */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Patient Notification Letter</CardTitle>
                  <CardDescription>
                    Required for all breaches (45 CFR §164.404)
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => downloadLetter(letters.patient!, 'patient-notification-letter.pdf', 'patient')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </CardHeader>
              <CardContent>
                <div className="bg-white p-6 rounded-lg border border-zinc-200">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-900 leading-relaxed">
                    {letters.patient}
                  </pre>
                </div>
              </CardContent>
            </Card>

          {/* HHS OCR Notification Letter */}
          {letters.hhs && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">HHS OCR Notification Letter</CardTitle>
                    <CardDescription>
                      Required for breaches affecting 500+ individuals (45 CFR §164.406)
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => downloadLetter(letters.hhs!, 'hhs-ocr-notification-letter.txt')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-6 rounded-lg border border-zinc-200">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-900 leading-relaxed">
                    {letters.hhs}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Media Notification Letter */}
          {letters.media && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Media Notification Letter</CardTitle>
                    <CardDescription>
                      Required for breaches affecting 500+ residents of a state (45 CFR §164.408)
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => downloadLetter(letters.media!, 'media-notification-letter.txt')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-6 rounded-lg border border-zinc-200">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-900 leading-relaxed">
                    {letters.media}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Compliance Notice */}
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          <strong>Compliance Notice:</strong> These letters are generated in accordance with HIPAA Breach Notification Rules (45 CFR 164.404, 164.406, 164.408). 
          Patient notifications must be sent within 60 days of discovery. HHS and media notifications are required for breaches affecting 500+ individuals.
        </AlertDescription>
      </Alert>
    </div>
  );
}
