'use client';

import { useState } from 'react';
import { type AuditExportData } from '@/app/actions/audit-export';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Download,
  FolderOpen,
  FileText,
  ShieldAlert,
  Users,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  Lock,
  Archive,
  Loader2,
  XCircle
} from 'lucide-react';

interface AuditExportClientProps {
  auditData: AuditExportData;
}

interface PackageSection {
  folder: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  fileCount: number;
  reason?: string;
}

export function AuditExportClient({ auditData }: AuditExportClientProps) {
  const [modalState, setModalState] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState('');
  const [showModal, setShowModal] = useState(false);

  const org = auditData.organization;
  const exportDate = new Date().toISOString().split('T')[0];
  const orgSlug = org.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');

  const sections: PackageSection[] = [
    {
      folder: '01_Executive_Summary',
      label: 'Executive Summary',
      description: 'Compliance overview, organization info, and overall status report',
      icon: <FileText className="h-4 w-4" />,
      available: true,
      fileCount: 1
    },
    {
      folder: '02_Risk_Assessment',
      label: 'Risk Assessment',
      description: 'Security Risk Analysis report, risk matrix, and mitigation status',
      icon: <ShieldAlert className="h-4 w-4" />,
      available: auditData.riskAssessment.exists,
      fileCount: auditData.riskAssessment.exists ? 1 : 0,
      reason: !auditData.riskAssessment.exists ? 'No risk assessment completed yet' : undefined
    },
    {
      folder: '03_Policies',
      label: 'Policies & Documents',
      description: 'HIPAA policy documentation index and status for all required policies',
      icon: <FileText className="h-4 w-4" />,
      available: auditData.policies.some((p) => p.hasDocument),
      fileCount: auditData.policies.some((p) => p.hasDocument) ? 1 : 0,
      reason: !auditData.policies.some((p) => p.hasDocument) ? 'No policies documented yet' : undefined
    },
    {
      folder: '04_Vendor_Management',
      label: 'Vendor Management',
      description: 'Business associate list, BAA status, expiration tracking',
      icon: <Building2 className="h-4 w-4" />,
      available: auditData.vendors.length > 0,
      fileCount: auditData.vendors.length > 0 ? 1 : 0,
      reason: auditData.vendors.length === 0 ? 'No vendors registered yet' : undefined
    },
    {
      folder: '05_Training',
      label: 'Training Records',
      description: 'Employee training log, completion status, and renewal tracking',
      icon: <Users className="h-4 w-4" />,
      available: auditData.trainingRecords.length > 0,
      fileCount: auditData.trainingRecords.length > 0 ? 1 : 0,
      reason: auditData.trainingRecords.length === 0 ? 'No training records found' : undefined
    },
    {
      folder: '06_Incidents',
      label: 'Incidents & Breaches',
      description: 'Incident log and breach notification documentation',
      icon: <AlertTriangle className="h-4 w-4" />,
      available: auditData.incidents.length > 0 || auditData.breachNotifications.length > 0,
      fileCount: (auditData.incidents.length > 0 ? 1 : 0) + (auditData.breachNotifications.length > 0 ? 1 : 0),
      reason:
        auditData.incidents.length === 0 && auditData.breachNotifications.length === 0
          ? 'No incidents or breaches logged'
          : undefined
    },
    {
      folder: '07_Audit_Checklist',
      label: 'Audit Checklist',
      description: 'HIPAA compliance checklist with status for all required elements',
      icon: <CheckCircle2 className="h-4 w-4" />,
      available: true,
      fileCount: 1
    }
  ];

  const availableSections = sections.filter((s) => s.available);
  const totalFiles = sections.reduce((sum, s) => sum + s.fileCount, 0);

  const policiesActive = auditData.policies.filter((p) => p.hasDocument).length;
  const trainedEmployees = auditData.trainingRecords.filter((t) => t.completion_status === 'completed').length;

  const readinessLabel =
    auditData.complianceScore >= 80
      ? 'Audit Ready'
      : auditData.complianceScore >= 50
        ? 'Partially Compliant'
        : 'Needs Attention';

  const readinessColor =
    auditData.complianceScore >= 80
      ? 'text-[#00bceb]'
      : auditData.complianceScore >= 50
        ? 'text-yellow-600'
        : 'text-red-600';

  async function handleExport() {
    setShowModal(true);
    setModalState('generating');
    setProgress(0);
    setErrorMessage('');
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    const steps = [
      { pct: 15, label: 'Gathering organization data...' },
      { pct: 30, label: 'Building Executive Summary...' },
      { pct: 45, label: 'Compiling Risk Assessment...' },
      { pct: 60, label: 'Formatting Policy Documentation...' },
      { pct: 72, label: 'Processing Vendor Records...' },
      { pct: 83, label: 'Assembling Training Logs...' },
      { pct: 92, label: 'Packaging Incident Reports...' },
      { pct: 97, label: 'Generating ZIP archive...' }
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setProgress(steps[stepIndex].pct);
        stepIndex++;
      }
    }, 400);

    try {
      const res = await fetch('/api/audit-export', { method: 'POST' });

      clearInterval(interval);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Export failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const filename = `HIPAA_Hub_Audit_Package_${orgSlug}_${exportDate}.zip`;

      setDownloadUrl(url);
      setDownloadFilename(filename);
      setProgress(100);
      setModalState('ready');
    } catch (err: any) {
      clearInterval(interval);
      setModalState('error');
      setErrorMessage(err.message || 'Failed to generate audit package');
    }
  }

  function handleDownload() {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleCloseModal() {
    setShowModal(false);
    setModalState('idle');
    setProgress(0);
  }

  return (
    <div className="flex w-full flex-col gap-8">
      {/* Page Header - Clean, minimal */}
      <div className="mb-4">
        <h2 className="text-3xl font-light text-[#0c0b1d] mb-2">Export Audit Package</h2>
        <p className="text-sm text-[#565656] font-light leading-relaxed max-w-3xl">
          Generate a structured, audit-ready ZIP archive with all your HIPAA compliance documentation. 
          Only sections with actual data are included automatically.
        </p>
      </div>

      {/* Compliance Status Row - Clean cards, no heavy borders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-6 hover:border-[#00bceb]/30 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs text-[#565656] mb-2 font-light uppercase tracking-wide">Compliance Score</p>
              <p className="text-3xl font-light text-[#0c0b1d] mb-3">{auditData.complianceScore}%</p>
              <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${readinessColor.replace('text-', 'bg-')}`} />
                <span className={`text-xs font-light ${readinessColor}`}>{readinessLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-6 hover:border-[#00bceb]/30 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-[#565656] mb-2 font-light uppercase tracking-wide">Policies Documented</p>
              <p className="text-3xl font-light text-[#0c0b1d]">
                {policiesActive}<span className="text-base text-[#565656] font-light"> / {auditData.policies.length}</span>
              </p>
            </div>
            <FileText className="h-5 w-5 text-[#565656] opacity-40" />
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-6 hover:border-[#00bceb]/30 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-[#565656] mb-2 font-light uppercase tracking-wide">Employees Trained</p>
              <p className="text-3xl font-light text-[#0c0b1d]">
                {trainedEmployees}<span className="text-base text-[#565656] font-light"> / {auditData.trainingRecords.length}</span>
              </p>
            </div>
            <Users className="h-5 w-5 text-[#565656] opacity-40" />
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-6 hover:border-[#00bceb]/30 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-[#565656] mb-2 font-light uppercase tracking-wide">Files in Package</p>
              <p className="text-3xl font-light text-[#0c0b1d]">{totalFiles}</p>
            </div>
            <Archive className="h-5 w-5 text-[#565656] opacity-40" />
          </div>
        </div>
      </div>

      {/* Package Structure Preview - Clean layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Structure */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <FolderOpen className="h-4 w-4 text-[#00bceb]" />
                <h3 className="text-base font-light text-[#0c0b1d]">Package Contents</h3>
              </div>
              <p className="text-xs text-[#565656] font-light mt-1">
                Only sections with actual data are included. Empty sections are skipped automatically.
              </p>
            </div>
            <div className="p-0">
              {/* ZIP root label */}
              <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-50 bg-gray-50/50">
                <Package className="h-4 w-4 text-[#0c0b1d] opacity-60" />
                <span className="text-sm font-light text-[#0c0b1d] font-mono">
                  HIPAA_Hub_Audit_Package_{orgSlug}_{exportDate}.zip
                </span>
              </div>

              <div className="divide-y divide-gray-50">
                {sections.map((section) => (
                  <div
                    key={section.folder}
                    className={`flex items-start gap-4 px-6 py-4 hover:bg-gray-50/30 transition-colors ${!section.available ? 'opacity-50' : ''}`}
                  >
                    {/* Tree line */}
                    <div className="flex flex-col items-center pt-1 shrink-0">
                      <div className="h-2 w-px bg-gray-200" />
                      <div className="h-px w-3 bg-gray-200" />
                    </div>

                    {/* Icon + Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FolderOpen className={`h-4 w-4 shrink-0 ${section.available ? 'text-[#0c0b1d]' : 'text-gray-300'}`} />
                        <span className={`text-sm font-light font-mono ${section.available ? 'text-[#0c0b1d]' : 'text-gray-400'}`}>
                          {section.folder}/
                        </span>
                        {section.available ? (
                          <span className="text-xs text-[#00bceb] font-light px-2 py-0.5 bg-[#00bceb]/5 border border-[#00bceb]/20">
                            {section.fileCount} file{section.fileCount !== 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-light px-2 py-0.5 bg-gray-50 border border-gray-100">
                            skipped
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-light mt-1 ml-6 ${section.available ? 'text-[#565656]' : 'text-gray-400'}`}>
                        {section.available ? section.description : section.reason}
                      </p>
                    </div>

                    {/* Status icon */}
                    <div className="shrink-0 pt-1">
                      {section.available ? (
                        <CheckCircle2 className="h-4 w-4 text-[#00bceb]" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-300" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary + Info */}
        <div className="flex flex-col gap-4">
          {/* Organization summary */}
          <div className="bg-white border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#565656] opacity-60" />
                <h3 className="text-sm font-light text-[#0c0b1d]">Organization</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-[#565656] font-light mb-1">Organization Name</p>
                <p className="text-sm text-[#0c0b1d] font-light">{org.name}</p>
              </div>
              {org.practice_type && (
                <div>
                  <p className="text-xs text-[#565656] font-light mb-1">Practice Type</p>
                  <p className="text-sm text-[#0c0b1d] font-light">{org.practice_type}</p>
                </div>
              )}
              {org.privacy_officer_name && (
                <div>
                  <p className="text-xs text-[#565656] font-light mb-1">Privacy Officer</p>
                  <p className="text-sm text-[#0c0b1d] font-light">{org.privacy_officer_name}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-[#565656] font-light mb-1">Export Date</p>
                <p className="text-sm text-[#0c0b1d] font-light">
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* What's included */}
          <div className="bg-white border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#565656] opacity-60" />
                <h3 className="text-sm font-light text-[#0c0b1d]">What You Get</h3>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3 text-xs font-light text-[#565656]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#00bceb] mt-0.5 shrink-0" />
                  <span>Structured folder hierarchy (audit-standard)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#00bceb] mt-0.5 shrink-0" />
                  <span>Professional PDFs with headers, tables, and signatures</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#00bceb] mt-0.5 shrink-0" />
                  <span>Only sections with real data included</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#00bceb] mt-0.5 shrink-0" />
                  <span>HIPAA audit checklist with current status</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#00bceb] mt-0.5 shrink-0" />
                  <span>Executive summary for OCR auditors</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-gray-50/50 border border-gray-100 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-[#565656] mt-0.5 shrink-0 opacity-60" />
              <p className="text-xs text-[#565656] font-light leading-relaxed">
                This package is a compliance support tool, not a substitute for legal advice. Consult a qualified HIPAA consultant or attorney for regulatory guidance.
              </p>
            </div>
          </div>

          {/* Export button */}
          <Button
            onClick={handleExport}
            className="bg-[#0c0b1d] text-white hover:bg-[#0c0b1d]/90 rounded-none font-light h-11 w-full flex items-center justify-center gap-2 transition-all"
          >
            <Download className="h-4 w-4" />
            Export Audit Package
          </Button>
        </div>
      </div>

      {/* ─── GENERATION MODAL ────────────────────────────────────────── */}
      <Dialog open={showModal} onOpenChange={(open) => { if (!open) handleCloseModal(); }}>
        <DialogContent className="max-w-md bg-white rounded-none p-0 overflow-hidden">
          {/* Header strip */}
          <div className="bg-[#0c0b1d] px-6 py-5">
            <DialogHeader>
              <DialogTitle className="text-white font-light text-lg flex items-center gap-2">
                {modalState === 'generating' && <Loader2 className="h-5 w-5 animate-spin text-[#00bceb]" />}
                {modalState === 'ready' && <CheckCircle2 className="h-5 w-5 text-[#00bceb]" />}
                {modalState === 'error' && <XCircle className="h-5 w-5 text-red-400" />}
                {modalState === 'generating' && 'Generating Audit Package'}
                {modalState === 'ready' && 'Package Ready'}
                {modalState === 'error' && 'Generation Failed'}
              </DialogTitle>
              <DialogDescription className="text-gray-400 font-light text-sm mt-1">
                {modalState === 'generating' && 'Building your structured compliance documentation...'}
                {modalState === 'ready' && `${totalFiles} files compiled into a structured ZIP archive`}
                {modalState === 'error' && 'An error occurred while generating your audit package'}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-5">
            {/* Progress bar */}
            {(modalState === 'generating' || modalState === 'ready') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#565656] font-light">
                    {modalState === 'generating' ? 'Building package...' : 'Complete'}
                  </span>
                  <span className="text-xs text-[#0c0b1d] font-light">{progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00bceb] transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Sections list (visible during generation and on ready) */}
            {modalState !== 'error' && (
              <div className="space-y-1.5">
                {sections.map((section, i) => {
                  const sectionProgress = (i + 1) * (100 / sections.length);
                  const isComplete = progress >= sectionProgress;
                  const isCurrent = progress < sectionProgress && progress >= (i * (100 / sections.length));

                  return (
                    <div key={section.folder} className="flex items-center gap-3 py-1">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        {!section.available ? (
                          <div className="h-4 w-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">–</span>
                          </div>
                        ) : isComplete || modalState === 'ready' ? (
                          <CheckCircle2 className="h-4 w-4 text-[#00bceb]" />
                        ) : isCurrent ? (
                          <Loader2 className="h-4 w-4 text-[#00bceb] animate-spin" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-light ${section.available ? 'text-[#0c0b1d]' : 'text-gray-400'}`}>
                          {section.folder}/
                        </span>
                      </div>
                      {!section.available && (
                        <span className="text-xs text-gray-400 font-light">skipped</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Error state */}
            {modalState === 'error' && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-none">
                <p className="text-sm text-red-700 font-light">{errorMessage}</p>
                <p className="text-xs text-red-500 font-light mt-1">
                  Please try again. If the issue persists, contact support.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {modalState === 'ready' && (
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-[#0c0b1d] text-white hover:bg-[#0c0b1d]/90 rounded-none font-light h-10 flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download ZIP
                </Button>
              )}
              {modalState === 'error' && (
                <Button
                  onClick={handleExport}
                  className="flex-1 bg-[#0c0b1d] text-white hover:bg-[#0c0b1d]/90 rounded-none font-light h-10"
                >
                  Try Again
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleCloseModal}
                disabled={modalState === 'generating'}
                className="rounded-none border-gray-200 text-[#0c0b1d] font-light h-10 px-4 hover:bg-gray-50"
              >
                {modalState === 'ready' ? 'Close' : 'Cancel'}
              </Button>
            </div>

            {/* File info after ready */}
            {modalState === 'ready' && (
              <div className="bg-gray-50/50 border border-gray-100 p-3 rounded-none">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#565656] opacity-60" />
                  <span className="text-xs text-[#565656] font-light font-mono truncate">{downloadFilename}</span>
                </div>
                <p className="text-xs text-[#565656] font-light mt-1 ml-6">
                  {availableSections.length} folders · {totalFiles} PDF files
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
