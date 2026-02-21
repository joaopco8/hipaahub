'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  ShieldCheck, 
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { createComplianceEvidence, type EvidenceType, type HIPAACategory } from '@/app/actions/compliance-evidence';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { type EvidenceCaptureType } from '@/lib/evidence-catalog';
import { type EvidenceFieldConfig } from '@/lib/evidence-fields-config';

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
  
  const selectedEvidenceType = fieldConfig || null;
  
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
    
    if (formData.capture_type === 'external_link' && !formData.external_link) {
      toast.error('External link URL is required');
      return;
    }

    if (formData.capture_type !== 'external_link' && formData.capture_type !== 'attestation' && !selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Uploading evidence...');

    try {
      if (!selectedEvidenceType) throw new Error('Invalid evidence type');

      let fileUrl = '';
      if (selectedFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', selectedFile);
        formDataUpload.append('evidence_type', selectedEvidenceType.id);

        const uploadResponse = await fetch('/api/compliance-evidence/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        if (!uploadResponse.ok) throw new Error('File upload failed');

        const uploadData = await uploadResponse.json();
        fileUrl = uploadData.file_url || '';
      }

      const storageBucket = 'evidence';

      const frequencyMap: Record<string, string> = {
        'on_event': 'annually', 'annually': 'annually', 'quarterly': 'quarterly', 'monthly': 'monthly',
        'continuously': 'continuously', 'on_hire': 'on_hire', 'on_termination': 'on_termination',
        'on_incident': 'on_incident', 'on_risk_identified': 'on_risk_identified', 'on_violation': 'on_violation', 'on_contract': 'on_contract',
      };

      // Mappings (omitted large map for brevity, logic preserved)
      const evidenceTypeMap: Record<string, EvidenceType> = {
        'sra_report': 'sra_report', 'incident_response_plan': 'incident_response_plan', 'access_control_policy': 'access_control_policy', 'training_logs': 'training_logs',
        'business_associate_agreements': 'business_associate_agreements', 'audit_logs': 'audit_logs', 'encryption_configuration': 'encryption_configuration', 'backup_recovery_test': 'backup_recovery_tests',
        'mfa_configuration': 'mfa_configuration', 'device_inventory': 'device_control_inventory', 'termination_checklist': 'employee_termination_checklist', 'breach_log': 'breach_log',
        'vulnerability_scan': 'vulnerability_scan_reports', 'penetration_test': 'penetration_test_report', 'cloud_security_configuration': 'cloud_security_configuration', 'vendor_soc2': 'vendor_soc2_report',
        'risk_remediation_plan': 'risk_remediation_plan', 'sanction_documentation': 'sanction_documentation', 'security_officer_designation': 'policy_procedure', 'privacy_officer_designation': 'policy_procedure',
        'risk_management_plan': 'policy_procedure', 'sanction_policy': 'policy_procedure', 'audit_logs_sample': 'audit_logs', 'workforce_training_policy': 'policy_procedure',
        'email_encryption': 'encryption_configuration', 'firewall_configuration': 'system_settings_screenshot', 'antivirus_configuration': 'system_settings_screenshot', 'patch_management_log': 'audit_log',
        'physical_access_control': 'policy_procedure', 'visitor_log': 'audit_log', 'data_destruction_policy': 'policy_procedure', 'workstation_security': 'system_settings_screenshot',
        'remote_access_policy': 'policy_procedure', 'rbac_configuration': 'system_settings_screenshot', 'access_review': 'policy_procedure', 'password_policy': 'system_settings_screenshot',
        'session_timeout': 'system_settings_screenshot', 'baa_executed': 'business_associate_agreements', 'vendor_security_assessment': 'vendor_security_attestation', 'vendor_compliance_monitoring': 'audit_log',
        'vendor_incident_agreement': 'policy_procedure', 'cloud_provider_info': 'policy_procedure', 'cloud_encryption': 'encryption_configuration', 'cloud_data_deletion': 'policy_procedure',
        'incident_detection': 'policy_procedure', 'ir_team_roster': 'policy_procedure', 'breach_notification_letter': 'incident_report', 'hhs_breach_notification': 'incident_report',
        'post_incident_review': 'incident_report', 'training_completion_logs': 'training_logs', 'privacy_notice': 'policy_procedure', 'authorization_consent': 'policy_procedure',
        'subcontractor_agreements': 'business_associate_agreements', 'ehr_access_logs': 'audit_logs', 'breach_response_timeline': 'incident_report',
      };

      const validEvidenceType = evidenceTypeMap[selectedEvidenceType.id] || 'other';

      const result = await createComplianceEvidence({
        title: formData.title, description: formData.description, evidence_type: validEvidenceType as EvidenceType, evidence_field_id: selectedEvidenceType.id,
        hipaa_category: [selectedEvidenceType.category] as HIPAACategory[], related_document_ids: formData.related_policies, related_question_ids: [],
        file_url: fileUrl, file_name: selectedFile?.name, file_type: selectedFile?.type, file_size: selectedFile?.size, storage_bucket: storageBucket,
        validity_period_days: 365, validity_start_date: new Date().toISOString().split('T')[0], tags: [selectedEvidenceType.name, selectedEvidenceType.category],
        notes: formData.notes, attestation_signed: formData.attestation_signed, catalog_id: selectedEvidenceType.id, capture_type: formData.capture_type,
        external_link: formData.capture_type === 'external_link' ? formData.external_link : undefined, frequency: frequencyMap[selectedEvidenceType.frequency || 'annually'] || 'annually',
      } as any);

      if (result.success) {
        toast.success('Evidence uploaded successfully!', { id: toastId });
        handleOpenChange(false);
        router.refresh();
        onSuccess?.();
        setFormData({
          evidence_type_id: fieldConfig?.id || '',
          related_policies: fieldConfig ? fieldConfig.related_policies.filter(p => Object.keys(POLICY_DOCUMENTS_FULL).includes(p)) : [],
          capture_type: fieldConfig ? (
            fieldConfig.evidence_type === 'document' ? 'document_upload' :
            fieldConfig.evidence_type === 'screenshot' ? 'screenshot' :
            fieldConfig.evidence_type === 'log' ? 'system_generated' :
            fieldConfig.evidence_type === 'link' ? 'external_link' : 'attestation'
          ) : 'document_upload',
          external_link: '', title: fieldConfig?.name || '', description: fieldConfig?.description || '', notes: '', attestation_signed: false,
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
        <Button onClick={() => setIsOpen(true)} className="bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-light">
          <Upload className="mr-2 h-4 w-4" />
          Upload Evidence
        </Button>
      )}
      <Dialog open={isOpen || open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-white p-0 border-0 shadow-lg rounded-none">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-6">
          <DialogHeader>
              <div className="flex items-center gap-3">
              <div className="bg-[#00bceb] p-2 rounded-none flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-light text-[#0e274e]">Upload Compliance Evidence</DialogTitle>
                <DialogDescription className="text-gray-400 text-sm mt-0.5 font-light">
                  Select evidence type to see only compatible policy documents
                </DialogDescription>
              </div>
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="absolute right-6 top-6 opacity-70 hover:opacity-100 hover:bg-gray-100 p-2 transition-all focus:outline-none"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-500 hover:text-[#0e274e]" />
              </button>
            </div>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-8 pt-6 pb-6 space-y-8">
          
          {selectedEvidenceType && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="bg-[#00bceb] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  i
                </div>
                <h3 className="text-base font-medium text-[#0e274e]">
                  Evidence: {selectedEvidenceType.name}
                </h3>
              </div>
              
              <div className="p-4 bg-[#f3f5f9] border-l-4 border-[#00bceb]">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-[#00bceb] mt-0.5 shrink-0" />
                  <div className="space-y-2 flex-1">
                    {selectedEvidenceType.ocr_guidance && (
                      <>
                        <p className="font-light text-[#0e274e] text-xs">OCR Expectation:</p>
                        <p className="text-[#565656] leading-relaxed text-sm font-light italic">"{selectedEvidenceType.ocr_guidance.what_ocr_expects}"</p>
                      </>
                    )}
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <p className="text-xs text-[#565656] font-light">
                        <span className="font-light text-[#0e274e]">Compatible Documents:</span> {availablePolicies.length} of 9 available
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedEvidenceType && availablePolicies.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="bg-[#0e274e] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h3 className="text-base font-medium text-[#0e274e]">
                  Select Policy Document(s) <span className="text-xs font-light text-gray-400">({availablePolicies.length} compatible)</span>
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  {availablePolicies.map((policyId) => {
                    const isSelected = formData.related_policies.includes(policyId);
                    return (
                      <button
                        type="button"
                        key={policyId}
                        className={cn(
                          "px-4 py-3 cursor-pointer transition-all text-xs border border-gray-200 flex items-center justify-between group hover:border-[#00bceb]",
                          isSelected
                            ? "bg-[#00bceb]/5 border-[#00bceb]"
                            : "bg-white"
                        )}
                        onClick={() => handlePolicyToggle(policyId)}
                      >
                        <div className="flex flex-col items-start text-left">
                          <span className={cn("font-medium text-sm", isSelected ? "text-[#00bceb]" : "text-[#0e274e]")}>{policyId}</span>
                          <span className="text-[10px] text-gray-500 mt-0.5 font-light">{POLICY_DOCUMENTS_FULL[policyId as keyof typeof POLICY_DOCUMENTS_FULL]}</span>
                        </div>
                        <div className={cn(
                          "w-5 h-5 border flex items-center justify-center transition-all rounded-none",
                          isSelected 
                            ? "bg-[#00bceb] border-[#00bceb]" 
                            : "border-gray-300 group-hover:border-[#00bceb]"
                        )}>
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {selectedEvidenceType && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="bg-[#0e274e] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <h3 className="text-base font-medium text-[#0e274e]">
                  Upload file or provide link
                </h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="file_format" className="text-[#0e274e] font-light text-sm">
                    Evidence Format <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.capture_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, capture_type: value as EvidenceCaptureType }))}
                    required
                  >
                    <SelectTrigger className="h-10 bg-white border border-gray-300 rounded-none focus:ring-1 focus:ring-[#00bceb] text-[#0e274e] font-light">
                      <SelectValue placeholder="Select format..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-none">
                      {FILE_FORMATS.filter(format => {
                        if (!selectedEvidenceType) return true;
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
                        <SelectItem key={format.value} value={format.value} className="font-light py-2">
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.capture_type === 'external_link' ? (
                  <div className="space-y-2">
                    <Label htmlFor="external_link" className="text-[#0e274e] font-light text-sm">
                      External Link URL <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="external_link"
                      type="url"
                      value={formData.external_link}
                      onChange={(e) => setFormData(prev => ({ ...prev, external_link: e.target.value }))}
                      placeholder="https://..."
                      required={formData.capture_type === 'external_link'}
                      className="h-10 bg-white border border-gray-300 rounded-none focus:border-[#00bceb] text-[#0e274e] font-light"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="file" className="text-[#0e274e] font-light text-sm">
                      Upload File <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="file"
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.csv,.json,.txt"
                        className="h-28 cursor-pointer opacity-0 absolute inset-0 z-10 w-full"
                      />
                      <div className={cn(
                        "h-28 border border-dashed flex flex-col items-center justify-center transition-all cursor-pointer rounded-none",
                        selectedFile 
                          ? "border-[#71bc48] bg-[#71bc48]/5" 
                          : "border-gray-300 bg-gray-50 hover:border-[#00bceb] hover:bg-white"
                      )}>
                        {selectedFile ? (
                          <div className="flex flex-col items-center">
                            <CheckCircle2 className="h-6 w-6 text-[#71bc48] mb-2" />
                            <span className="text-sm font-medium text-[#0e274e] max-w-[240px] truncate">{selectedFile.name}</span>
                            <span className="text-xs text-gray-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                              className="text-xs text-gray-500 hover:text-red-600 mt-2 flex items-center gap-1 font-light"
                            >
                              <X className="h-3 w-3" /> Remove file
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-gray-400 mb-2" />
                            <span className="text-sm font-medium text-[#0e274e]">Click or drag file to upload</span>
                            <span className="text-xs text-gray-400 mt-1 font-light">PDF, Word, Images, or Logs up to 50MB</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedEvidenceType && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="bg-[#0e274e] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <h3 className="text-base font-medium text-[#0e274e]">
                  Evidence details
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[#0e274e] font-light text-sm">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Document Name"
                    required
                    className="h-10 bg-white border border-gray-300 rounded-none focus:border-[#00bceb] text-[#0e274e] font-light"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[#0e274e] font-light text-sm">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Briefly explain what this evidence proves..."
                    rows={3}
                    className="bg-white border border-gray-300 rounded-none focus:border-[#00bceb] resize-none p-3 text-[#0e274e] text-sm font-light"
                  />
                </div>

                <div className="bg-[#f3f5f9] p-4 border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="attestation"
                      checked={formData.attestation_signed}
                      onChange={(e) => setFormData(prev => ({ ...prev, attestation_signed: e.target.checked }))}
                      className="h-4 w-4 rounded-none border border-gray-400 text-[#00bceb] focus:ring-[#00bceb] cursor-pointer mt-0.5"
                    />
                    <div className="flex flex-col flex-1">
                      <Label htmlFor="attestation" className="cursor-pointer text-[#0e274e] font-medium text-sm mb-0.5">
                        Legal Attestation Required
                      </Label>
                      <span className="text-xs text-gray-500 leading-relaxed font-light">Recorded with timestamp and IP address for legal defense</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white px-8 pt-4 pb-6 border-t border-gray-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-light">
            <AlertCircle className="h-3 w-3" />
            All fields marked with * are mandatory
          </div>
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              className="text-gray-600 hover:text-[#0e274e] hover:bg-gray-50 px-6 h-9 border border-gray-300 rounded-none font-light"
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
              className="bg-[#00bceb] text-white hover:bg-[#00bceb]/90 px-6 h-9 rounded-none transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                  <span>Uploading...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="h-3 w-3" />
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
