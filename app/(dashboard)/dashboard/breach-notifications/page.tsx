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
import { FileText, Download, AlertTriangle, CheckCircle2, History, ArrowRight, AlertCircle } from 'lucide-react';
import { BreachNavigation } from '@/components/breach-notifications/breach-navigation';
import { classifyBreachLegalStatus } from '@/lib/breach-classification';
import { generatePatientNotificationPDF, downloadPDF } from '@/lib/pdf-generator';
import { useRouter } from 'next/navigation';

interface BreachNotificationFormData {
  // Block 1: Basic Incident Information
  organizationName: string;
  breachDiscoveryDate: string;
  breachOccurredDate: string;
  breachDiscoveryMethod: 'Internal audit' | 'Employee report' | 'Patient complaint' | 'Vendor notification' | 'Other';
  breachDescription: string;
  
  // Block 2: Type of Information Compromised
  phiTypes: string[];
  ssnExposed: boolean;
  financialInfoExposed: boolean;
  
  // Block 3: Incident Scale
  individualsAffected: number;
  multipleStatesAffected: boolean;
  exceeds500Individuals: boolean;
  
  // Block 4: Cause of Incident
  breachType: 'Lost device' | 'Stolen device' | 'Hacking/IT incident' | 'Email misdelivery' | 'Unauthorized internal access' | 'Vendor breach' | 'Physical file exposure' | 'Other';
  dataEncrypted: boolean | null;
  deviceRecovered: 'yes' | 'no' | 'N/A' | null;
  
  // Block 5: Corrective Actions
  mitigationActions: string;
  additionalSafeguardsImplemented: boolean;
  additionalSafeguardsDescription: string;
  lawEnforcementNotified: 'yes' | 'no' | 'N/A';
  vendorContacted: string;
  
  // Block 6: Communication
  contactPersonName: string;
  contactPersonPhone: string;
  contactPersonEmail: string;
  creditMonitoringOffered: boolean;
  creditMonitoringDuration: number;
  
  // Block 7: Required Statements
  notificationWithoutDelay: boolean;
  notificationSendDate: string;
}

const PHI_TYPES = [
  'Full name',
  'Address',
  'Date of birth',
  'Social Security Number',
  'Driver\'s license',
  'Medical record number',
  'Diagnosis/treatment info',
  'Insurance information',
  'Financial information',
  'Email address',
  'Other'
];

export default function BreachNotificationsPage() {
  const router = useRouter();
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [letters, setLetters] = useState<{
    patient: string | null;
    hhs: string | null;
    media: string | null;
  }>({
    patient: null,
    hhs: null,
    media: null,
  });
  const [savedNotificationId, setSavedNotificationId] = useState<string | null>(null);

  const [formData, setFormData] = useState<BreachNotificationFormData>({
    organizationName: '',
    breachDiscoveryDate: '',
    breachOccurredDate: '',
    breachDiscoveryMethod: 'Internal audit',
    breachDescription: '',
    phiTypes: [],
    ssnExposed: false,
    financialInfoExposed: false,
    individualsAffected: 0,
    multipleStatesAffected: false,
    exceeds500Individuals: false,
    breachType: 'Hacking/IT incident',
    dataEncrypted: null,
    deviceRecovered: null,
    mitigationActions: '',
    additionalSafeguardsImplemented: false,
    additionalSafeguardsDescription: '',
    lawEnforcementNotified: 'N/A',
    vendorContacted: '',
    contactPersonName: '',
    contactPersonPhone: '',
    contactPersonEmail: '',
    creditMonitoringOffered: false,
    creditMonitoringDuration: 12,
    notificationWithoutDelay: false,
    notificationSendDate: '',
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
          setFormData(prev => ({
            ...prev,
            organizationName: orgData.legal_name || orgData.name || '',
            contactPersonName: (orgData as any).privacy_officer_name || (orgData as any).security_officer_name || '',
            contactPersonPhone: (orgData as any).phone_number || '',
            contactPersonEmail: (orgData as any).privacy_officer_email || (orgData as any).email_address || '',
          }));
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

  const handlePHITypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      phiTypes: prev.phiTypes.includes(type)
        ? prev.phiTypes.filter(t => t !== type)
        : [...prev.phiTypes, type]
    }));
  };

  const handleGenerate = async () => {
    if (!organization) return;

    // Validation
    const missingFields: string[] = [];
    if (!formData.organizationName.trim()) missingFields.push('Organization Name');
    if (!formData.breachDiscoveryDate.trim()) missingFields.push('Breach Discovery Date');
    if (!formData.breachDescription.trim()) missingFields.push('Breach Description');
    if (formData.phiTypes.length === 0) missingFields.push('At least one PHI type');
    if (formData.individualsAffected === 0) missingFields.push('Number of Individuals Affected');
    if (!formData.mitigationActions.trim()) missingFields.push('Mitigation Actions');
    if (!formData.contactPersonName.trim()) missingFields.push('Contact Person Name');
    if (!formData.contactPersonPhone.trim()) missingFields.push('Contact Person Phone');
    if (!formData.contactPersonEmail.trim()) missingFields.push('Contact Person Email');
    if (!formData.notificationSendDate.trim()) missingFields.push('Notification Send Date');

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields:\n\n${missingFields.map(field => `• ${field}`).join('\n')}`);
      return;
    }

    setIsGenerating(true);

    try {
      // Convert form data to BreachDetails format
      const breachDetails: BreachDetails = {
        discoveryDate: formData.breachDiscoveryDate,
        incidentDate: formData.breachOccurredDate || formData.breachDiscoveryDate,
        description: formData.breachDescription,
        detailedNarrative: formData.breachDescription,
        discoveryMethod: formData.breachDiscoveryMethod,
        typesOfInfo: formData.phiTypes.join(', '),
        numberOfIndividuals: formData.individualsAffected,
        stateOrJurisdiction: formData.multipleStatesAffected ? 'Multiple States' : (organization.state || organization.address_state || ''),
        stepsTaken: formData.mitigationActions,
        stepsForPatient: formData.additionalSafeguardsDescription || 'Monitor your accounts and credit reports for suspicious activity.',
        encryptionAtRest: formData.dataEncrypted === true ? 'Yes' : formData.dataEncrypted === false ? 'No' : 'Unknown',
        encryptionInTransit: 'Unknown',
        mfaEnabled: 'Unknown',
        incidentType: formData.breachType === 'Hacking/IT incident' ? 'Hacking / Malware' : 
                     formData.breachType === 'Lost device' ? 'Lost Device' :
                     formData.breachType === 'Stolen device' ? 'Stolen Device' :
                     formData.breachType === 'Unauthorized internal access' ? 'Unauthorized Employee Access' :
                     formData.breachType === 'Vendor breach' ? 'Business Associate Breach' : 'Hacking / Malware',
        businessAssociateInvolved: formData.breachType === 'Vendor breach',
        businessAssociateName: formData.vendorContacted || '',
        discoveredByName: formData.contactPersonName,
        discoveredByRole: 'Privacy Officer',
        investigationLeadName: formData.contactPersonName,
        investigationLeadRole: 'Privacy Officer',
        authorizedBy: 'Privacy Officer',
        lawEnforcementNotified: formData.lawEnforcementNotified === 'yes',
        lawEnforcementDelay: false,
        statesAffected: formData.multipleStatesAffected ? [] : [],
        phiNameIncluded: formData.phiTypes.includes('Full name'),
        phiSsnIncluded: formData.phiTypes.includes('Social Security Number') || formData.ssnExposed,
        phiDobIncluded: formData.phiTypes.includes('Date of birth'),
        phiMrnIncluded: formData.phiTypes.includes('Medical record number'),
        phiInsuranceIncluded: formData.phiTypes.includes('Insurance information'),
        phiDiagnosisIncluded: formData.phiTypes.includes('Diagnosis/treatment info'),
        phiMedicationIncluded: false,
        phiLabImagingIncluded: false,
        phiBillingIncluded: formData.phiTypes.includes('Financial information') || formData.financialInfoExposed,
        phiProviderIncluded: false,
        phiClaimsIncluded: formData.phiTypes.includes('Insurance information'),
        phiOtherIncluded: formData.phiTypes.includes('Other'),
        phiOtherDescription: '',
        systemName: '',
        systemType: '',
        dataLocation: '',
        encryptionStatus: formData.dataEncrypted === true ? 'Encrypted' : formData.dataEncrypted === false ? 'Unencrypted' : 'Unknown',
        authenticationControls: '',
        technicalDetails: formData.breachDescription,
        containmentActions: formData.mitigationActions,
        forensicInvestigator: 'qualified security professionals',
        lawEnforcementNotificationStatus: formData.lawEnforcementNotified === 'yes' ? 'We have notified' : 'We have not notified',
        haveNotifiedOrWillNotify: formData.lawEnforcementNotified === 'yes' ? 'have notified' : 'have not notified',
        securityEnhancements: formData.additionalSafeguardsDescription || formData.mitigationActions,
        creditMonitoringOffered: formData.creditMonitoringOffered,
        creditMonitoringDuration: formData.creditMonitoringDuration,
        creditMonitoringProvider: '',
        creditMonitoringEnrollmentUrl: '',
        creditMonitoringPhoneNumber: '',
        enrollmentCode: '',
        identityTheftInsuranceAmount: '',
        enrollmentDeadlineDays: 60,
        breachId: `BREACH-${Date.now()}`,
        breachLegalStatus: 'Under Investigation',
      };

      const legalStatus = classifyBreachLegalStatus(breachDetails);
      breachDetails.breachLegalStatus = legalStatus;

      // Generate letters
      const patientLetter = generatePatientNotificationLetter(organization, breachDetails);
      const hhsLetter = formData.exceeds500Individuals ? generateHHSOCRNotificationLetter(organization, breachDetails) : null;
      const mediaLetter = formData.exceeds500Individuals && formData.multipleStatesAffected ? generateMediaNotificationLetter(organization, breachDetails) : null;

      setLetters({ patient: patientLetter, hhs: hhsLetter, media: mediaLetter });

      // Save to Supabase
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && organization) {
        setIsSaving(true);
        // Get organization ID from Supabase
        const { data: orgData } = await supabase
          .from('organizations')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!orgData) {
          setIsSaving(false);
          alert('Could not find organization. Please try again.');
          return;
        }

        const { data, error } = await supabase
          .from('breach_notifications' as any)
          .insert({
            organization_id: orgData.id,
            user_id: user.id,
            organization_name: formData.organizationName,
            breach_discovery_date: formData.breachDiscoveryDate,
            breach_occurred_date: formData.breachOccurredDate || null,
            breach_discovery_method: formData.breachDiscoveryMethod,
            breach_description: formData.breachDescription,
            phi_types: formData.phiTypes,
            ssn_exposed: formData.ssnExposed,
            financial_info_exposed: formData.financialInfoExposed,
            individuals_affected: formData.individualsAffected,
            multiple_states_affected: formData.multipleStatesAffected,
            exceeds_500_individuals: formData.exceeds500Individuals,
            breach_type: formData.breachType,
            data_encrypted: formData.dataEncrypted,
            device_recovered: formData.deviceRecovered || null,
            mitigation_actions: formData.mitigationActions,
            additional_safeguards_implemented: formData.additionalSafeguardsImplemented,
            additional_safeguards_description: formData.additionalSafeguardsDescription,
            law_enforcement_notified: formData.lawEnforcementNotified,
            vendor_contacted: formData.vendorContacted || null,
            contact_person_name: formData.contactPersonName,
            contact_person_phone: formData.contactPersonPhone,
            contact_person_email: formData.contactPersonEmail,
            credit_monitoring_offered: formData.creditMonitoringOffered,
            credit_monitoring_duration: formData.creditMonitoringDuration || null,
            notification_without_delay: formData.notificationWithoutDelay,
            notification_send_date: formData.notificationSendDate,
            patient_letter_content: patientLetter,
            hhs_letter_content: hhsLetter,
            media_letter_content: mediaLetter,
            breach_id: breachDetails.breachId,
            status: 'generated',
            created_by: user.id,
          })
          .select()
          .single();

        if (error) {
          console.error('Error saving breach notification:', error);
          alert('Letters generated successfully, but there was an error saving to database.');
        } else {
          setSavedNotificationId(String(data.id));
        }
        setIsSaving(false);
      }
    } catch (error) {
      console.error('Error generating letters:', error);
      alert('Error generating letters. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadLetter = async (content: string, filename: string, letterType: 'patient' | 'hhs' | 'media' = 'patient') => {
    if (letterType === 'patient' && organization) {
      try {
        const breachId = savedNotificationId ? `BREACH-${savedNotificationId.substring(0, 8)}` : `BREACH-${Date.now()}`;
        const pdfBlob = await generatePatientNotificationPDF({
          organizationName: organization.legal_name || organization.name || 'Organization',
          documentTitle: 'HIPAA Breach Notification Letter',
          content: content,
          recipientName: formData.contactPersonName || 'Patient',
          breachId: breachId,
          organization: {
            legal_name: organization.legal_name || undefined,
            dba: organization.dba || undefined,
            address_street: organization.address_street || undefined,
            address_city: organization.address_city || undefined,
            address_state: organization.address_state || undefined,
            address_zip: organization.address_zip || undefined,
            phone_number: organization.phone_number || undefined,
            email_address: organization.email_address || undefined,
            website: organization.website || undefined,
            ein: organization.ein || undefined,
            npi: organization.npi || undefined,
            state_license_number: organization.state_license_number || undefined,
            privacy_officer_name: organization.privacy_officer_name || undefined,
            privacy_officer_email: organization.privacy_officer_email || undefined,
            privacy_officer_phone: organization.phone_number || undefined,
            privacy_officer_role: organization.privacy_officer_role || undefined,
          },
          breachDetails: {
            discoveryDate: formData.breachDiscoveryDate,
            incidentDate: formData.breachOccurredDate || undefined,
            numberOfIndividuals: formData.individualsAffected,
            breachType: formData.breachType,
          }
        });
        
        if (!pdfBlob || pdfBlob.size === 0) throw new Error('PDF blob is empty');
        
        const pdfFilename = filename.replace('.txt', '.pdf').replace('.pdf', '.pdf');
        downloadPDF(pdfBlob, pdfFilename);
        return;
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert(`Error generating PDF: ${error instanceof Error ? error.message : String(error)}. Downloading as text file instead.`);
      }
    }
    
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

  if (loading) return <div className="text-center py-12 text-[#565656] font-light">Loading...</div>;

  if (!organization) {
    return (
      <div className="flex min-h-screen w-full flex-col gap-6 p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-light">Organization data not found. Please complete your profile.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="flex min-h-screen w-full flex-col gap-6 p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-light">{validationError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 max-w-[1600px] mx-auto p-6">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-2xl font-light text-[#0e274e]">Breach Notifications</h2>
        <p className="text-sm text-gray-400 font-light">
          Manage breach notifications, incident logs, and compliance documentation
        </p>
      </div>

      {/* Navigation Tabs */}
      <BreachNavigation />

      {/* Page Header */}
      <div className="mb-2">
        <h3 className="text-xl font-light text-[#0e274e]">Breach Notification Letters</h3>
        <p className="text-sm text-gray-400 font-light">
          Generate compliant notifications for patients, HHS, and media
        </p>
      </div>

      {/* Form Card */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardHeader className="border-b border-gray-100 py-4">
          <CardTitle className="text-lg font-light text-[#0e274e]">Breach Incident Details</CardTitle>
          <CardDescription className="text-xs text-gray-400">
            Complete all sections to generate professional breach notification letters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {/* Block 1: Basic Incident Information */}
          <div className="space-y-4 border-b border-gray-100 pb-6">
            <h3 className="text-base font-light text-[#0e274e] mb-4">Basic Incident Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizationName" className="text-[#0e274e] font-light">Organization Name *</Label>
                <Input
                  id="organizationName"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  className="rounded-none border-gray-200 focus:border-[#00bceb]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breachDiscoveryDate" className="text-[#0e274e] font-light">Date Breach Was Discovered *</Label>
                <Input
                  id="breachDiscoveryDate"
                  type="date"
                  value={formData.breachDiscoveryDate}
                  onChange={(e) => setFormData({ ...formData, breachDiscoveryDate: e.target.value })}
                  className="rounded-none border-gray-200 focus:border-[#00bceb]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="breachOccurredDate" className="text-[#0e274e] font-light">Date Breach Occurred (if known)</Label>
                <Input
                  id="breachOccurredDate"
                  type="date"
                  value={formData.breachOccurredDate}
                  onChange={(e) => setFormData({ ...formData, breachOccurredDate: e.target.value })}
                  className="rounded-none border-gray-200 focus:border-[#00bceb]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breachDiscoveryMethod" className="text-[#0e274e] font-light">How Was the Breach Discovered? *</Label>
                <Select
                  value={formData.breachDiscoveryMethod}
                  onValueChange={(value: any) => setFormData({ ...formData, breachDiscoveryMethod: value })}
                >
                  <SelectTrigger className="rounded-none border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Internal audit">Internal audit</SelectItem>
                    <SelectItem value="Employee report">Employee report</SelectItem>
                    <SelectItem value="Patient complaint">Patient complaint</SelectItem>
                    <SelectItem value="Vendor notification">Vendor notification</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="breachDescription" className="text-[#0e274e] font-light">Brief Description of What Happened *</Label>
              <Textarea
                id="breachDescription"
                value={formData.breachDescription}
                onChange={(e) => setFormData({ ...formData, breachDescription: e.target.value })}
                placeholder="Describe the incident in detail..."
                className="rounded-none border-gray-200 focus:border-[#00bceb] min-h-[100px]"
              />
            </div>
          </div>

          {/* Block 2: Type of Information Compromised */}
          <div className="space-y-4 border-b border-gray-100 pb-6">
            <h3 className="text-base font-light text-[#0e274e] mb-4">Type of Information Compromised</h3>
            <div className="space-y-2">
              <Label className="text-[#0e274e] font-light">What Types of PHI Were Involved? *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {PHI_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`phi-${type}`}
                      checked={formData.phiTypes.includes(type)}
                      onCheckedChange={() => handlePHITypeToggle(type)}
                      className="rounded-none"
                    />
                    <Label htmlFor={`phi-${type}`} className="text-sm font-light text-gray-700 cursor-pointer">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ssnExposed"
                  checked={formData.ssnExposed}
                  onCheckedChange={(checked) => setFormData({ ...formData, ssnExposed: checked === true })}
                  className="rounded-none"
                />
                <Label htmlFor="ssnExposed" className="text-sm font-light text-gray-700 cursor-pointer">
                  Was Social Security Number exposed?
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="financialInfoExposed"
                  checked={formData.financialInfoExposed}
                  onCheckedChange={(checked) => setFormData({ ...formData, financialInfoExposed: checked === true })}
                  className="rounded-none"
                />
                <Label htmlFor="financialInfoExposed" className="text-sm font-light text-gray-700 cursor-pointer">
                  Was financial information exposed?
                </Label>
              </div>
            </div>
          </div>

          {/* Block 3: Incident Scale */}
          <div className="space-y-4 border-b border-gray-100 pb-6">
            <h3 className="text-base font-light text-[#0e274e] mb-4">Incident Scale</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="individualsAffected" className="text-[#0e274e] font-light">Approximate Number of Individuals Affected *</Label>
                <Input
                  id="individualsAffected"
                  type="number"
                  value={formData.individualsAffected || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setFormData({ 
                      ...formData, 
                      individualsAffected: value,
                      exceeds500Individuals: value >= 500
                    });
                  }}
                  className="rounded-none border-gray-200 focus:border-[#00bceb]"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mt-6">
                  <Checkbox
                    id="multipleStatesAffected"
                    checked={formData.multipleStatesAffected}
                    onCheckedChange={(checked) => setFormData({ ...formData, multipleStatesAffected: checked === true })}
                    className="rounded-none"
                  />
                  <Label htmlFor="multipleStatesAffected" className="text-sm font-light text-gray-700 cursor-pointer">
                    Are residents of multiple states affected?
                  </Label>
                </div>
                {formData.exceeds500Individuals && (
                  <p className="text-xs text-amber-600 mt-2 font-light">
                    HHS notification required for breaches affecting 500+ individuals
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Block 4: Cause of Incident */}
          <div className="space-y-4 border-b border-gray-100 pb-6">
            <h3 className="text-base font-light text-[#0e274e] mb-4">Cause of Incident</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="breachType" className="text-[#0e274e] font-light">Type of Breach *</Label>
                <Select
                  value={formData.breachType}
                  onValueChange={(value: any) => setFormData({ ...formData, breachType: value })}
                >
                  <SelectTrigger className="rounded-none border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lost device">Lost device</SelectItem>
                    <SelectItem value="Stolen device">Stolen device</SelectItem>
                    <SelectItem value="Hacking/IT incident">Hacking/IT incident</SelectItem>
                    <SelectItem value="Email misdelivery">Email misdelivery</SelectItem>
                    <SelectItem value="Unauthorized internal access">Unauthorized internal access</SelectItem>
                    <SelectItem value="Vendor breach">Vendor breach</SelectItem>
                    <SelectItem value="Physical file exposure">Physical file exposure</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataEncrypted" className="text-[#0e274e] font-light">Was the Data Encrypted?</Label>
                <Select
                  value={formData.dataEncrypted === null ? 'unknown' : formData.dataEncrypted ? 'yes' : 'no'}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    dataEncrypted: value === 'yes' ? true : value === 'no' ? false : null 
                  })}
                >
                  <SelectTrigger className="rounded-none border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(formData.breachType === 'Lost device' || formData.breachType === 'Stolen device') && (
              <div className="space-y-2">
                <Label htmlFor="deviceRecovered" className="text-[#0e274e] font-light">Has the Device Been Recovered?</Label>
                <Select
                  value={formData.deviceRecovered || 'N/A'}
                  onValueChange={(value: any) => setFormData({ ...formData, deviceRecovered: value })}
                >
                  <SelectTrigger className="rounded-none border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="N/A">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Block 5: Corrective Actions */}
          <div className="space-y-4 border-b border-gray-100 pb-6">
            <h3 className="text-base font-light text-[#0e274e] mb-4">Corrective Actions</h3>
            <div className="space-y-2">
              <Label htmlFor="mitigationActions" className="text-[#0e274e] font-light">What Actions Have Been Taken to Mitigate the Incident? *</Label>
              <Textarea
                id="mitigationActions"
                value={formData.mitigationActions}
                onChange={(e) => setFormData({ ...formData, mitigationActions: e.target.value })}
                placeholder="Describe the actions taken..."
                className="rounded-none border-gray-200 focus:border-[#00bceb] min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="additionalSafeguardsImplemented"
                  checked={formData.additionalSafeguardsImplemented}
                  onCheckedChange={(checked) => setFormData({ ...formData, additionalSafeguardsImplemented: checked === true })}
                  className="rounded-none"
                />
                <Label htmlFor="additionalSafeguardsImplemented" className="text-sm font-light text-gray-700 cursor-pointer">
                  Have you implemented additional safeguards?
                </Label>
              </div>
              {formData.additionalSafeguardsImplemented && (
                <Textarea
                  id="additionalSafeguardsDescription"
                  value={formData.additionalSafeguardsDescription}
                  onChange={(e) => setFormData({ ...formData, additionalSafeguardsDescription: e.target.value })}
                  placeholder="Describe the additional safeguards..."
                  className="rounded-none border-gray-200 focus:border-[#00bceb] min-h-[80px] mt-2"
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lawEnforcementNotified" className="text-[#0e274e] font-light">Has Law Enforcement Been Notified?</Label>
                <Select
                  value={formData.lawEnforcementNotified}
                  onValueChange={(value: any) => setFormData({ ...formData, lawEnforcementNotified: value })}
                >
                  <SelectTrigger className="rounded-none border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="N/A">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.breachType === 'Vendor breach' && (
                <div className="space-y-2">
                  <Label htmlFor="vendorContacted" className="text-[#0e274e] font-light">Has the Vendor Been Contacted?</Label>
                  <Input
                    id="vendorContacted"
                    value={formData.vendorContacted}
                    onChange={(e) => setFormData({ ...formData, vendorContacted: e.target.value })}
                    placeholder="Vendor contact details..."
                    className="rounded-none border-gray-200 focus:border-[#00bceb]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Block 6: Communication */}
          <div className="space-y-4 border-b border-gray-100 pb-6">
            <h3 className="text-base font-light text-[#0e274e] mb-4">Communication</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPersonName" className="text-[#0e274e] font-light">Contact Person Name *</Label>
                <Input
                  id="contactPersonName"
                  value={formData.contactPersonName}
                  onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                  className="rounded-none border-gray-200 focus:border-[#00bceb]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPersonPhone" className="text-[#0e274e] font-light">Contact Phone *</Label>
                <Input
                  id="contactPersonPhone"
                  value={formData.contactPersonPhone}
                  onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
                  className="rounded-none border-gray-200 focus:border-[#00bceb]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPersonEmail" className="text-[#0e274e] font-light">Contact Email *</Label>
                <Input
                  id="contactPersonEmail"
                  type="email"
                  value={formData.contactPersonEmail}
                  onChange={(e) => setFormData({ ...formData, contactPersonEmail: e.target.value })}
                  className="rounded-none border-gray-200 focus:border-[#00bceb]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="creditMonitoringOffered"
                  checked={formData.creditMonitoringOffered}
                  onCheckedChange={(checked) => setFormData({ ...formData, creditMonitoringOffered: checked === true })}
                  className="rounded-none"
                />
                <Label htmlFor="creditMonitoringOffered" className="text-sm font-light text-gray-700 cursor-pointer">
                  Are you offering credit monitoring?
                </Label>
              </div>
              {formData.creditMonitoringOffered && (
                <div className="space-y-2">
                  <Label htmlFor="creditMonitoringDuration" className="text-[#0e274e] font-light">Duration of Credit Monitoring (months)</Label>
                  <Input
                    id="creditMonitoringDuration"
                    type="number"
                    value={formData.creditMonitoringDuration || ''}
                    onChange={(e) => setFormData({ ...formData, creditMonitoringDuration: parseInt(e.target.value) || 12 })}
                    className="rounded-none border-gray-200 focus:border-[#00bceb]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Block 7: Required Statements */}
          <div className="space-y-4 pb-6">
            <h3 className="text-base font-light text-[#0e274e] mb-4">Required Statements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notificationWithoutDelay"
                  checked={formData.notificationWithoutDelay}
                  onCheckedChange={(checked) => setFormData({ ...formData, notificationWithoutDelay: checked === true })}
                  className="rounded-none"
                />
                <Label htmlFor="notificationWithoutDelay" className="text-sm font-light text-gray-700 cursor-pointer">
                  Do you confirm this notification is being sent without unreasonable delay? *
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notificationSendDate" className="text-[#0e274e] font-light">Date This Notification Will Be Sent *</Label>
                <Input
                  id="notificationSendDate"
                  type="date"
                  value={formData.notificationSendDate}
                  onChange={(e) => setFormData({ ...formData, notificationSendDate: e.target.value })}
                  className="rounded-none border-gray-200 focus:border-[#00bceb]"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || isSaving}
            className="w-full bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-light h-12 mt-6" 
          >
            {isGenerating || isSaving ? (
              'Generating...'
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Notification Letters
              </>
            )}
          </Button>

          {savedNotificationId && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 font-light">
                Breach notification saved successfully. You can view it in the history page.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Generated Letters Display */}
      {letters.patient && (
        <div className="space-y-6">
          <Card className="border-0 shadow-sm bg-white rounded-none">
            <CardHeader className="border-b border-gray-100 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-light text-[#0e274e]">Patient Notification Letter</CardTitle>
                <CardDescription className="text-xs text-gray-400">PDF Format</CardDescription>
              </div>
              <Button
                variant="outline"
                className="rounded-none border-gray-200 text-gray-600 hover:text-[#00bceb]"
                onClick={() => downloadLetter(letters.patient!, 'patient-notification-letter.pdf', 'patient')}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </CardHeader>
            <CardContent className="p-6 bg-[#f9fafb]">
              <pre className="whitespace-pre-wrap text-xs font-mono text-gray-600 leading-relaxed">
                {letters.patient}
              </pre>
            </CardContent>
          </Card>

          {letters.hhs && (
            <Card className="border-0 shadow-sm bg-white rounded-none">
              <CardHeader className="border-b border-gray-100 py-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-light text-[#0e274e]">HHS OCR Notification Letter</CardTitle>
                  <CardDescription className="text-xs text-gray-400">Required for 500+ individuals</CardDescription>
                </div>
                <Button
                  variant="outline"
                  className="rounded-none border-gray-200 text-gray-600 hover:text-[#00bceb]"
                  onClick={() => downloadLetter(letters.hhs!, 'hhs-notification-letter.txt', 'hhs')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </CardHeader>
              <CardContent className="p-6 bg-[#f9fafb]">
                <pre className="whitespace-pre-wrap text-xs font-mono text-gray-600 leading-relaxed">
                  {letters.hhs}
                </pre>
              </CardContent>
            </Card>
          )}

          {letters.media && (
            <Card className="border-0 shadow-sm bg-white rounded-none">
              <CardHeader className="border-b border-gray-100 py-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-light text-[#0e274e]">Media Notification Letter</CardTitle>
                  <CardDescription className="text-xs text-gray-400">Required for 500+ individuals in a state</CardDescription>
                </div>
                <Button
                  variant="outline"
                  className="rounded-none border-gray-200 text-gray-600 hover:text-[#00bceb]"
                  onClick={() => downloadLetter(letters.media!, 'media-notification-letter.txt', 'media')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </CardHeader>
              <CardContent className="p-6 bg-[#f9fafb]">
                <pre className="whitespace-pre-wrap text-xs font-mono text-gray-600 leading-relaxed">
                  {letters.media}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
