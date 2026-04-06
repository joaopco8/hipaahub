'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, Loader2, FileText, AlertCircle } from 'lucide-react';

interface Incident {
  id: string;
  incident_title: string;
  description: string;
  date_occurred: string;
  date_discovered: string;
  estimated_individuals_affected: number;
  [key: string]: any;
}

interface OrgData {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  privacy_officer_name?: string;
  privacy_officer_email?: string;
  privacy_officer_phone?: string;
  [key: string]: any;
}

interface Props {
  open: boolean;
  onClose: () => void;
  incident: Incident;
  org: OrgData;
}

export function OCRLetterModal({ open, onClose, incident, org }: Props) {
  const fullAddress = [org.address, org.city, org.state, org.zip].filter(Boolean).join(', ');

  const [fields, setFields] = useState({
    orgName: org.name || '',
    orgAddress: fullAddress || '',
    contactName: org.privacy_officer_name || '',
    contactTitle: 'Privacy Officer',
    contactPhone: org.privacy_officer_phone || org.phone || '',
    contactEmail: org.privacy_officer_email || org.email || '',
    breachDiscoveredDate: incident.date_discovered
      ? new Date(incident.date_discovered).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '',
    breachOccurredDate: incident.date_occurred
      ? new Date(incident.date_occurred).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '',
    description: incident.description || '',
    phiTypes: '',
    individualsAffected: incident.estimated_individuals_affected || 0,
    investigationSteps:
      'Upon discovery of this breach, we immediately initiated a full investigation. Our security team isolated the affected systems, conducted a forensic analysis to determine the scope of the breach, and implemented additional security controls to prevent unauthorized access.',
    preventionSteps:
      'We have implemented the following measures to prevent future breaches: enhanced access controls and monitoring, additional security awareness training for all workforce members, review and update of relevant HIPAA security policies and procedures, and deployment of additional technical safeguards.',
  });

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // Sync when incident/org changes
  useEffect(() => {
    const fa = [org.address, org.city, org.state, org.zip].filter(Boolean).join(', ');
    setFields({
      orgName: org.name || '',
      orgAddress: fa || '',
      contactName: org.privacy_officer_name || '',
      contactTitle: 'Privacy Officer',
      contactPhone: org.privacy_officer_phone || org.phone || '',
      contactEmail: org.privacy_officer_email || org.email || '',
      breachDiscoveredDate: incident.date_discovered
        ? new Date(incident.date_discovered).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '',
      breachOccurredDate: incident.date_occurred
        ? new Date(incident.date_occurred).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '',
      description: incident.description || '',
      phiTypes: '',
      individualsAffected: incident.estimated_individuals_affected || 0,
      investigationSteps:
        'Upon discovery of this breach, we immediately initiated a full investigation. Our security team isolated the affected systems, conducted a forensic analysis to determine the scope of the breach, and implemented additional security controls to prevent unauthorized access.',
      preventionSteps:
        'We have implemented the following measures to prevent future breaches: enhanced access controls and monitoring, additional security awareness training for all workforce members, review and update of relevant HIPAA security policies and procedures, and deployment of additional technical safeguards.',
    });
  }, [incident.id, org.name]);

  function set(key: string, val: string | number) {
    setFields((prev) => ({ ...prev, [key]: val }));
  }

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/breach-notifications/ocr-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to generate PDF');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OCR_Notification_Letter_${fields.orgName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to generate letter');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl bg-white rounded-none p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#0e274e] px-6 py-5 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-white font-light text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#00bceb]" />
              OCR / HHS Notification Letter
            </DialogTitle>
            <DialogDescription className="text-gray-400 font-light text-sm mt-1">
              Pre-filled from incident data. Review and edit before generating the PDF.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable form */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Organization */}
          <div>
            <p className="text-xs font-medium text-[#0e274e] mb-3 pb-2 border-b border-gray-100">
              Covered Entity Information
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-xs font-light text-gray-500 mb-1 block">Organization Name</Label>
                <Input value={fields.orgName} onChange={(e) => set('orgName', e.target.value)} className="rounded-none border-gray-200 text-sm font-light h-9" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-light text-gray-500 mb-1 block">Address</Label>
                <Input value={fields.orgAddress} onChange={(e) => set('orgAddress', e.target.value)} className="rounded-none border-gray-200 text-sm font-light h-9" />
              </div>
              <div>
                <Label className="text-xs font-light text-gray-500 mb-1 block">Contact Person</Label>
                <Input value={fields.contactName} onChange={(e) => set('contactName', e.target.value)} className="rounded-none border-gray-200 text-sm font-light h-9" />
              </div>
              <div>
                <Label className="text-xs font-light text-gray-500 mb-1 block">Title</Label>
                <Input value={fields.contactTitle} onChange={(e) => set('contactTitle', e.target.value)} className="rounded-none border-gray-200 text-sm font-light h-9" />
              </div>
              <div>
                <Label className="text-xs font-light text-gray-500 mb-1 block">Phone</Label>
                <Input value={fields.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} className="rounded-none border-gray-200 text-sm font-light h-9" />
              </div>
              <div>
                <Label className="text-xs font-light text-gray-500 mb-1 block">Email</Label>
                <Input value={fields.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} className="rounded-none border-gray-200 text-sm font-light h-9" />
              </div>
            </div>
          </div>

          {/* Breach dates */}
          <div>
            <p className="text-xs font-medium text-[#0e274e] mb-3 pb-2 border-b border-gray-100">
              Breach Dates
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-light text-gray-500 mb-1 block">Date Breach Occurred</Label>
                <Input value={fields.breachOccurredDate} onChange={(e) => set('breachOccurredDate', e.target.value)} className="rounded-none border-gray-200 text-sm font-light h-9" placeholder="e.g. March 1, 2025" />
              </div>
              <div>
                <Label className="text-xs font-light text-gray-500 mb-1 block">Date Breach Discovered</Label>
                <Input value={fields.breachDiscoveredDate} onChange={(e) => set('breachDiscoveredDate', e.target.value)} className="rounded-none border-gray-200 text-sm font-light h-9" placeholder="e.g. March 5, 2025" />
              </div>
            </div>
          </div>

          {/* Breach details */}
          <div>
            <p className="text-xs font-medium text-[#0e274e] mb-3 pb-2 border-b border-gray-100">
              Breach Details
            </p>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-light text-gray-500 mb-1 block">Description of the Breach</Label>
                <Textarea
                  value={fields.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={4}
                  className="rounded-none border-gray-200 text-sm font-light resize-none"
                />
              </div>
              <div>
                <Label className="text-xs font-light text-gray-500 mb-1 block">Types of PHI Involved</Label>
                <Textarea
                  value={fields.phiTypes}
                  onChange={(e) => set('phiTypes', e.target.value)}
                  rows={3}
                  className="rounded-none border-gray-200 text-sm font-light resize-none"
                  placeholder="e.g. Names, dates of birth, Social Security numbers, medical record numbers, health insurance information, diagnosis information..."
                />
              </div>
              <div>
                <Label className="text-xs font-light text-gray-500 mb-1 block">Number of Individuals Affected</Label>
                <Input
                  type="number"
                  value={fields.individualsAffected}
                  onChange={(e) => set('individualsAffected', parseInt(e.target.value) || 0)}
                  className="rounded-none border-gray-200 text-sm font-light h-9 w-48"
                />
              </div>
            </div>
          </div>

          {/* Response */}
          <div>
            <p className="text-xs font-medium text-[#0e274e] mb-3 pb-2 border-b border-gray-100">
              Response & Prevention
            </p>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-light text-gray-500 mb-1 block">Investigation Steps Taken</Label>
                <Textarea
                  value={fields.investigationSteps}
                  onChange={(e) => set('investigationSteps', e.target.value)}
                  rows={4}
                  className="rounded-none border-gray-200 text-sm font-light resize-none"
                />
              </div>
              <div>
                <Label className="text-xs font-light text-gray-500 mb-1 block">Steps to Prevent Future Breaches</Label>
                <Textarea
                  value={fields.preventionSteps}
                  onChange={(e) => set('preventionSteps', e.target.value)}
                  rows={4}
                  className="rounded-none border-gray-200 text-sm font-light resize-none"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-gray-100 p-4 flex justify-between items-center shrink-0 bg-white">
          <p className="text-xs text-gray-400 font-light">
            Letter addressed to: Director, Office for Civil Rights, HHS
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-none border-gray-200 font-light h-9">
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="rounded-none bg-[#0e274e] text-white hover:bg-[#0e274e]/90 font-light h-9 flex items-center gap-2"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {generating ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
