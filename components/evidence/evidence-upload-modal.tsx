'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/utils/cn';
import { 
  Upload, 
  X, 
  FileText, 
  ShieldCheck, 
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { createComplianceEvidence, type EvidenceType, type HIPAACategory } from '@/app/actions/compliance-evidence';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EVIDENCE_CATALOG, type EvidenceCaptureType, type EvidenceFrequency } from '@/lib/evidence-catalog';
import { EVIDENCE_FIELDS, type EvidenceFieldConfig } from '@/lib/evidence-fields-config';

// Policy Documents with Full Names
const POLICY_DOCUMENTS_FULL = {
  'MST-001': 'HIPAA Security & Privacy Master Policy',
  'POL-002': 'Security Risk Analysis (SRA) Policy',
  'POL-003': 'Risk Management Plan',
  'POL-004': 'Access Control Policy',
  'POL-005': 'Workforce Training Policy',
  'POL-006': 'Sanction Policy',
  'POL-007': 'Incident Response & Breach Notification',
  'POL-008': 'Business Associate Management',
  'POL-009': 'Audit Logs & Documentation Retention',
};

const FILE_FORMATS: { value: EvidenceCaptureType; label: string }[] = [
  { value: 'document_upload', label: 'PDF Document / Word Doc' },
  { value: 'screenshot', label: 'Screenshot / Image' },
  { value: 'attestation', label: 'Signed Attestation' },
  { value: 'external_link', label: 'External Link (Portal/System)' },
  { value: 'system_generated', label: 'System-Generated Report' },
];

// EvidenceFieldConfig already imported above

interface EvidenceUploadModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  fieldConfig?: EvidenceFieldConfig;
}

export function EvidenceUploadModal({ open, onOpenChange, onSuccess, trigger, fieldConfig }: EvidenceUploadModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(open || false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Use fieldConfig if provided (evidence already selected)
  const selectedEvidenceType = fieldConfig || null;
  
  // Get available policies for selected evidence type (ONLY the 9 documents we can generate)
  const availablePolicies = selectedEvidenceType 
    ? selectedEvidenceType.related_policies.filter(policyId => 
        Object.keys(POLICY_DOCUMENTS_FULL).includes(policyId)
      )
    : [];
  
  const [formData, setFormData] = useState({
    evidence_type_id: fieldConfig?.id || '',
    related_policies: fieldConfig ? fieldConfig.related_policies.filter(p => 
      Object.keys(POLICY_DOCUMENTS_FULL).includes(p)
    ) : [] as string[],
    capture_type: fieldConfig ? (
      fieldConfig.evidence_type === 'document' ? 'document_upload' :
      fieldConfig.evidence_type === 'screenshot' ? 'screenshot' :
      fieldConfig.evidence_type === 'log' ? 'system_generated' :
      fieldConfig.evidence_type === 'link' ? 'external_link' :
      'attestation'
    ) : 'document_upload' as EvidenceCaptureType,
    external_link: '',
    title: fieldConfig?.name || '',
    description: fieldConfig?.description || '',
    notes: '',
    attestation_signed: false,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name }));
      }
    }
  };

  // No need for handleEvidenceTypeChange - evidence is already selected via fieldConfig

  const handlePolicyToggle = (policyId: string) => {
    setFormData(prev => ({
      ...prev,
      related_policies: prev.related_policies.includes(policyId)
        ? prev.related_policies.filter(id => id !== policyId)
        : [...prev.related_policies, policyId]
    }));
  };

  const handleOpenChange = (o: boolean) => {
    setIsOpen(o);
    onOpenChange?.(o);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEvidenceType) {
      toast.error('Evidence type is required');
      return;
    }

    if (formData.related_policies.length === 0) {
      toast.error('Please select at least one policy document');
      return;
    }

    if (!formData.title) {
      toast.error('Please provide a title for this evidence');
      return;
    }
    
    // Validate external link if needed
    if (formData.capture_type === 'external_link' && !formData.external_link) {
      toast.error('External link URL is required');
      return;
    }

    // Validate file upload if needed
    if (formData.capture_type !== 'external_link' && formData.capture_type !== 'attestation' && !selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Uploading evidence...');

    try {
      if (!selectedEvidenceType) {
        throw new Error('Invalid evidence type');
      }

      // Upload file if selected
      let fileUrl = '';
      if (selectedFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', selectedFile);
        formDataUpload.append('evidence_type', selectedEvidenceType.id);

        const uploadResponse = await fetch('/api/compliance-evidence/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        if (!uploadResponse.ok) {
          throw new Error('File upload failed');
        }

        const uploadData = await uploadResponse.json();
        fileUrl = uploadData.file_url || '';
      }

      // Storage bucket is always 'evidence' for compliance evidence
      const storageBucket = 'evidence';

      // Map frequency from evidence field to valid database frequency
      const frequencyMap: Record<string, string> = {
        'on_event': 'annually', // Default for on_event since it's not in DB constraint
        'annually': 'annually',
        'quarterly': 'quarterly',
        'monthly': 'monthly',
        'continuously': 'continuously',
        'on_hire': 'on_hire',
        'on_termination': 'on_termination',
        'on_incident': 'on_incident',
        'on_risk_identified': 'on_risk_identified',
        'on_violation': 'on_violation',
        'on_contract': 'on_contract',
      };

      // Map evidence field ID to valid evidence_type for database constraint
      const evidenceTypeMap: Record<string, EvidenceType> = {
        // Direct mappings
        'sra_report': 'sra_report',
        'incident_response_plan': 'incident_response_plan',
        'access_control_policy': 'access_control_policy',
        'training_logs': 'training_logs',
        'business_associate_agreements': 'business_associate_agreements',
        'audit_logs': 'audit_logs',
        'encryption_configuration': 'encryption_configuration',
        'backup_recovery_test': 'backup_recovery_tests',
        'mfa_configuration': 'mfa_configuration',
        'device_inventory': 'device_control_inventory',
        'termination_checklist': 'employee_termination_checklist',
        'breach_log': 'breach_log',
        'vulnerability_scan': 'vulnerability_scan_reports',
        'penetration_test': 'penetration_test_report',
        'cloud_security_configuration': 'cloud_security_configuration',
        'vendor_soc2': 'vendor_soc2_report',
        'risk_remediation_plan': 'risk_remediation_plan',
        'sanction_documentation': 'sanction_documentation',
        // Field ID to evidence type mappings
        'security_officer_designation': 'policy_procedure',
        'privacy_officer_designation': 'policy_procedure',
        'risk_management_plan': 'policy_procedure',
        'sanction_policy': 'policy_procedure',
        'audit_logs_sample': 'audit_logs',
        'workforce_training_policy': 'policy_procedure',
        'email_encryption': 'encryption_configuration',
        'firewall_configuration': 'system_settings_screenshot',
        'antivirus_configuration': 'system_settings_screenshot',
        'patch_management_log': 'audit_log',
        'physical_access_control': 'policy_procedure',
        'visitor_log': 'audit_log',
        'data_destruction_policy': 'policy_procedure',
        'workstation_security': 'system_settings_screenshot',
        'remote_access_policy': 'policy_procedure',
        'rbac_configuration': 'system_settings_screenshot',
        'access_review': 'policy_procedure',
        'password_policy': 'system_settings_screenshot',
        'session_timeout': 'system_settings_screenshot',
        'baa_executed': 'business_associate_agreements',
        'vendor_security_assessment': 'vendor_security_attestation',
        'vendor_compliance_monitoring': 'audit_log',
        'vendor_incident_agreement': 'policy_procedure',
        'cloud_provider_info': 'policy_procedure',
        'cloud_encryption': 'encryption_configuration',
        'cloud_data_deletion': 'policy_procedure',
        'incident_detection': 'policy_procedure',
        'ir_team_roster': 'policy_procedure',
        'breach_notification_letter': 'incident_report',
        'hhs_breach_notification': 'incident_report',
        'post_incident_review': 'incident_report',
        'training_completion_logs': 'training_logs',
        'privacy_notice': 'policy_procedure',
        'authorization_consent': 'policy_procedure',
        'subcontractor_agreements': 'business_associate_agreements',
        'ehr_access_logs': 'audit_logs',
        'breach_response_timeline': 'incident_report',
      };

      // Get valid evidence_type for database
      const validEvidenceType = evidenceTypeMap[selectedEvidenceType.id] || 'other';

      // Create evidence record
      const result = await createComplianceEvidence({
        title: formData.title,
        description: formData.description,
        evidence_type: validEvidenceType as EvidenceType,
        evidence_field_id: selectedEvidenceType.id, // Store original field ID here
        hipaa_category: [selectedEvidenceType.category] as HIPAACategory[],
        related_document_ids: formData.related_policies,
        related_question_ids: [],
        file_url: fileUrl,
        file_name: selectedFile?.name,
        file_type: selectedFile?.type,
        file_size: selectedFile?.size,
        storage_bucket: storageBucket,
        validity_period_days: 365, // Default 1 year
        validity_start_date: new Date().toISOString().split('T')[0],
        tags: [selectedEvidenceType.name, selectedEvidenceType.category],
        notes: formData.notes,
        attestation_signed: formData.attestation_signed,
        catalog_id: selectedEvidenceType.id,
        capture_type: formData.capture_type,
        external_link: formData.capture_type === 'external_link' ? formData.external_link : undefined,
        frequency: frequencyMap[selectedEvidenceType.frequency || 'annually'] || 'annually',
      } as any);

      if (result.success) {
        toast.success('Evidence uploaded successfully!', { id: toastId });
        handleOpenChange(false);
        router.refresh();
        onSuccess?.();
        // Reset form (but keep fieldConfig if provided)
        setFormData({
          evidence_type_id: fieldConfig?.id || '',
          related_policies: fieldConfig ? fieldConfig.related_policies.filter(p => 
            Object.keys(POLICY_DOCUMENTS_FULL).includes(p)
          ) : [],
          capture_type: fieldConfig ? (
            fieldConfig.evidence_type === 'document' ? 'document_upload' :
            fieldConfig.evidence_type === 'screenshot' ? 'screenshot' :
            fieldConfig.evidence_type === 'log' ? 'system_generated' :
            fieldConfig.evidence_type === 'link' ? 'external_link' :
            'attestation'
          ) : 'document_upload',
          external_link: '',
          title: fieldConfig?.name || '',
          description: fieldConfig?.description || '',
          notes: '',
          attestation_signed: false,
        });
        setSelectedFile(null);
      } else {
        toast.error(result.error || 'Failed to create evidence', { id: toastId });
      }
    } catch (error) {
      console.error('Error uploading evidence:', error);
      toast.error('Failed to upload evidence. Please try again.', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-[#1ad07a] text-[#0d1122] hover:bg-[#1ad07a]/90"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Evidence
        </Button>
      )}
      <Dialog open={isOpen || open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-white p-0 border-2 border-zinc-200 shadow-2xl rounded-2xl">
        <div className="sticky top-0 z-10 bg-gradient-to-b from-white to-zinc-50/50 border-b-2 border-zinc-200 px-8 py-6">
          <DialogHeader>
              <div className="flex items-center gap-3">
              <div className="bg-[#1ad07a] p-2.5 rounded-xl shadow-lg">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-light text-[#0c0b1d]">Upload Compliance Evidence</DialogTitle>
                <DialogDescription className="text-zinc-600 text-sm mt-0.5 font-light">
                  Select evidence type to see only compatible policy documents
                </DialogDescription>
              </div>
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="absolute right-6 top-6 rounded-full opacity-70 hover:opacity-100 hover:bg-zinc-100 p-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#1ad07a] focus:ring-offset-2 z-20"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-zinc-600 hover:text-zinc-900" />
              </button>
            </div>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-8 pt-6 pb-6 space-y-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-100 [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-zinc-400">
          
          {/* Step 1: Show Selected Evidence Info */}
          {selectedEvidenceType && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2.5 border-b-2 border-[#1ad07a]">
                <div className="bg-[#1ad07a] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                  ℹ
                </div>
                <h3 className="text-base font-light text-[#0c0b1d]">
                  Evidence: {selectedEvidenceType.name}
                </h3>
              </div>
              
              <div className="p-4 bg-blue-50/50 rounded-xl border-2 border-blue-200 text-sm animate-in fade-in duration-300">
                <div className="flex gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg h-fit">
                    <Info className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="space-y-2 flex-1">
                    {selectedEvidenceType.ocr_guidance && (
                      <>
                        <p className="font-semibold text-[#0c0b1d] text-xs uppercase tracking-wide">OCR Expectation:</p>
                        <p className="text-zinc-700 leading-relaxed text-xs font-light">"{selectedEvidenceType.ocr_guidance.what_ocr_expects}"</p>
                      </>
                    )}
                    {selectedEvidenceType.description && !selectedEvidenceType.ocr_guidance && (
                      <p className="text-zinc-700 leading-relaxed text-xs font-light">{selectedEvidenceType.description}</p>
                    )}
                    <div className="pt-2 border-t border-blue-200">
                      <p className="text-xs text-zinc-600 font-light">
                        <strong className="font-semibold text-[#0c0b1d]">Compatible Documents:</strong> {availablePolicies.length} of 9 available
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1 (or 2): Select Policy Documents (ONLY the 9 we can generate) */}
          {selectedEvidenceType && availablePolicies.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2.5 border-b-2 border-[#1ad07a]">
                <div className="bg-[#1ad07a] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                  1
                </div>
                <h3 className="text-base font-light text-[#0c0b1d]">
                  Select Policy Document(s) <span className="text-xs text-zinc-500">({availablePolicies.length} compatible with this evidence)</span>
                </h3>
              </div>
              
              <div className="space-y-3">
                <Label className="text-[#0c0b1d] font-light text-sm flex items-center gap-2">
                  Related Policy Documents <span className="text-red-600">*</span>
                  <span className="text-xs text-zinc-500 font-normal">({availablePolicies.length} compatible)</span>
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  {availablePolicies.map((policyId) => {
                    const isSelected = formData.related_policies.includes(policyId);
                    return (
                      <button
                        type="button"
                        key={policyId}
                        className={cn(
                          "px-4 py-3 cursor-pointer transition-all text-xs rounded-xl border-2 font-light flex items-center justify-between group",
                          isSelected
                            ? "bg-[#1ad07a] text-[#0c0b1d] border-[#1ad07a] shadow-md"
                            : "bg-white text-zinc-700 border-zinc-200 hover:border-[#1ad07a] hover:bg-green-50/50"
                        )}
                        onClick={() => handlePolicyToggle(policyId)}
                      >
                        <div className="flex flex-col items-start text-left">
                          <span className="font-bold text-sm">{policyId}</span>
                          <span className="text-[10px] opacity-80 mt-0.5">{POLICY_DOCUMENTS_FULL[policyId as keyof typeof POLICY_DOCUMENTS_FULL]}</span>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          isSelected 
                            ? "bg-white border-white" 
                            : "border-zinc-300 group-hover:border-[#1ad07a]"
                        )}>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-[#1ad07a]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: File Format & Upload */}
          {selectedEvidenceType && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2.5 border-b-2 border-[#1ad07a]">
                <div className="bg-[#1ad07a] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                  2
                </div>
                <h3 className="text-base font-light text-[#0c0b1d]">
                  Upload file or provide link
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file_format" className="text-[#0c0b1d] font-light text-sm">
                    Evidence Format <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.capture_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, capture_type: value as EvidenceCaptureType }))}
                    required
                  >
                    <SelectTrigger className="h-12 bg-white border-2 border-zinc-300 focus:border-[#1ad07a] text-[#0c0b1d] hover:border-zinc-400 transition-colors font-light rounded-xl">
                      <SelectValue placeholder="How is this evidence captured?" />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-xl border-2 border-zinc-200">
                      {FILE_FORMATS.filter(format => {
                        if (!selectedEvidenceType) return true;
                        // Map evidence type to capture types
                        const typeMap: Record<string, EvidenceCaptureType[]> = {
                          'document': ['document_upload', 'external_link'],
                          'screenshot': ['screenshot', 'document_upload'],
                          'log': ['system_generated', 'document_upload'],
                          'link': ['external_link'],
                          'attestation': ['attestation']
                        };
                        const allowedTypes = typeMap[selectedEvidenceType.evidence_type] || ['document_upload'];
                        return allowedTypes.includes(format.value);
                      }).map((format) => (
                        <SelectItem key={format.value} value={format.value} className="font-light py-3">
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.capture_type === 'external_link' ? (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label htmlFor="external_link" className="text-[#0c0b1d] font-light text-sm">
                      External Link URL <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="external_link"
                      type="url"
                      value={formData.external_link}
                      onChange={(e) => setFormData(prev => ({ ...prev, external_link: e.target.value }))}
                      placeholder="https://vendor-portal.example.com/report"
                      required={formData.capture_type === 'external_link'}
                      className="h-12 bg-white border-2 border-zinc-300 focus:border-[#1ad07a] focus:ring-[#1ad07a] text-[#0c0b1d] font-light rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="file" className="text-[#0c0b1d] font-light text-sm">
                      Upload File <span className="text-red-600">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="file"
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.csv,.json,.txt"
                        className="h-32 cursor-pointer opacity-0 absolute inset-0 z-10 w-full"
                      />
                      <div className={cn(
                        "h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer",
                        selectedFile 
                          ? "border-[#1ad07a] bg-green-50/50" 
                          : "border-zinc-300 bg-zinc-50 hover:border-[#1ad07a] hover:bg-green-50/30"
                      )}>
                        {selectedFile ? (
                          <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
                            <div className="bg-[#1ad07a] p-2 rounded-full mb-2">
                              <CheckCircle2 className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-sm font-medium text-[#0c0b1d] max-w-[240px] truncate">{selectedFile.name}</span>
                            <span className="text-xs text-zinc-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                              className="text-xs text-zinc-600 hover:text-red-600 mt-2 flex items-center gap-1 font-medium"
                            >
                              <X className="h-3 w-3" /> Remove file
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-zinc-400 mb-2" />
                            <span className="text-sm font-medium text-[#0c0b1d]">Click or drag file to upload</span>
                            <span className="text-xs text-zinc-500 mt-1 font-light">PDF, Word, Images, or Logs up to 50MB</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Evidence Details */}
          {selectedEvidenceType && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2.5 border-b-2 border-[#1ad07a]">
                <div className="bg-[#1ad07a] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                  3
                </div>
                <h3 className="text-base font-light text-[#0c0b1d]">
                  Evidence details
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[#0c0b1d] font-light text-sm">
                    Title <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., SRA Annual Report 2025"
                    required
                    className="h-12 bg-white border-2 border-zinc-300 focus:border-[#1ad07a] focus:ring-[#1ad07a] text-[#0c0b1d] font-light rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[#0c0b1d] font-light text-sm">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Briefly explain what this evidence proves..."
                    rows={3}
                    className="bg-white border-2 border-zinc-300 focus:border-[#1ad07a] focus:ring-[#1ad07a] resize-none p-3 text-[#0c0b1d] text-sm font-light rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-[#0c0b1d] font-light text-sm">Internal Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional context or notes..."
                    rows={2}
                    className="bg-white border-2 border-zinc-300 focus:border-[#1ad07a] focus:ring-[#1ad07a] resize-none p-3 text-[#0c0b1d] text-sm font-light rounded-xl"
                  />
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border-2 border-amber-300 mb-16">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="attestation"
                      checked={formData.attestation_signed}
                      onChange={(e) => setFormData(prev => ({ ...prev, attestation_signed: e.target.checked }))}
                      className="h-5 w-5 rounded-md border-2 border-amber-400 text-[#1ad07a] focus:ring-[#1ad07a] cursor-pointer mt-0.5"
                    />
                    <div className="flex flex-col flex-1">
                      <Label htmlFor="attestation" className="cursor-pointer text-[#0c0b1d] font-semibold text-sm mb-0.5">
                        Legal Attestation Required
                      </Label>
                      <span className="text-xs text-zinc-600 leading-relaxed font-light">Recorded with timestamp and IP address for legal defense</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-zinc-50/50 px-8 pt-6 pb-5 border-t-2 border-zinc-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-600 text-xs font-light">
            <AlertCircle className="h-4 w-4" />
            All fields marked with * are mandatory
          </div>
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              className="text-zinc-700 hover:text-[#0c0b1d] hover:bg-zinc-100 px-6 h-11 border-2 border-zinc-300 rounded-xl font-light"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                uploading || 
                !selectedEvidenceType || 
                formData.related_policies.length === 0 || 
                !formData.title || 
                (formData.capture_type === 'external_link' && !formData.external_link) ||
                (formData.capture_type !== 'external_link' && formData.capture_type !== 'attestation' && !selectedFile)
              } 
              className="bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90 px-8 h-11 rounded-xl transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-[#0c0b1d]/30 border-t-[#0c0b1d] animate-spin rounded-full" />
                  <span>Uploading...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload Evidence</span>
                </div>
              )}
            </Button>
          </div>
        </div>
        </form>
      </DialogContent>
      </Dialog>
    </>
  );
}
