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
import { Download, Loader2, Mail, AlertCircle } from 'lucide-react';

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

export function PatientLetterModal({ open, onClose, incident, org }: Props) {
  const fullAddress = [org.address, org.city, org.state, org.zip].filter(Boolean).join(', ');
  const discoveryDate = incident.date_discovered
    ? new Date(incident.date_discovered).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const [fields, setFields] = useState({
    orgName: org.name || '',
    orgAddress: fullAddress || '',
    contactName: org.privacy_officer_name || '',
    contactPhone: org.privacy_officer_phone || org.phone || '',
    contactEmail: org.privacy_officer_email || org.email || '',
    breachDiscoveredDate: discoveryDate,
    whatHappened:
      incident.description ||
      `On or about ${discoveryDate}, we discovered that ${incident.incident_title}. We immediately launched an investigation to determine the nature and scope of the incident.`,
    whatInfoInvolved:
      'The information involved in this incident may have included: names, dates of birth, addresses, medical record numbers, health insurance information, and/or other protected health information. We are still investigating the full scope of information affected.',
    whatWeAreDoing:
      `We took immediate action upon discovering the incident. We have: (1) secured the affected systems, (2) launched a thorough investigation, (3) notified law enforcement as appropriate, (4) implemented additional security safeguards, and (5) are reviewing our policies and procedures to prevent a similar incident from occurring in the future.`,
    whatYouCanDo:
      `We recommend you take the following steps to protect yourself:\n\n• Review the Explanation of Benefits (EOB) statements you receive from your health insurer for any services you did not receive.\n• Monitor your credit reports for any unauthorized activity. You are entitled to a free credit report from each of the three major credit bureaus once per year at www.annualcreditreport.com.\n• Place a fraud alert or credit freeze on your credit file by contacting the three major credit bureaus.\n• Be vigilant about phishing emails or phone calls asking for personal information.`,
    forMoreInfo:
      `If you have questions about this incident, please contact our Privacy Officer. We have established a dedicated response line to answer your questions.`,
  });

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fa = [org.address, org.city, org.state, org.zip].filter(Boolean).join(', ');
    const dd = incident.date_discovered
      ? new Date(incident.date_discovered).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '';
    setFields({
      orgName: org.name || '',
      orgAddress: fa || '',
      contactName: org.privacy_officer_name || '',
      contactPhone: org.privacy_officer_phone || org.phone || '',
      contactEmail: org.privacy_officer_email || org.email || '',
      breachDiscoveredDate: dd,
      whatHappened:
        incident.description ||
        `On or about ${dd}, we discovered that ${incident.incident_title}. We immediately launched an investigation to determine the nature and scope of the incident.`,
      whatInfoInvolved:
        'The information involved in this incident may have included: names, dates of birth, addresses, medical record numbers, health insurance information, and/or other protected health information. We are still investigating the full scope of information affected.',
      whatWeAreDoing:
        `We took immediate action upon discovering the incident. We have: (1) secured the affected systems, (2) launched a thorough investigation, (3) notified law enforcement as appropriate, (4) implemented additional security safeguards, and (5) are reviewing our policies and procedures to prevent a similar incident from occurring in the future.`,
      whatYouCanDo:
        `We recommend you take the following steps to protect yourself:\n\n• Review the Explanation of Benefits (EOB) statements you receive from your health insurer for any services you did not receive.\n• Monitor your credit reports for any unauthorized activity. You are entitled to a free credit report from each of the three major credit bureaus once per year at www.annualcreditreport.com.\n• Place a fraud alert or credit freeze on your credit file by contacting the three major credit bureaus.\n• Be vigilant about phishing emails or phone calls asking for personal information.`,
      forMoreInfo:
        `If you have questions about this incident, please contact our Privacy Officer. We have established a dedicated response line to answer your questions.`,
    });
  }, [incident.id, org.name]);

  function set(key: string, val: string) {
    setFields((prev) => ({ ...prev, [key]: val }));
  }

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/breach-notifications/patient-letter', {
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
      a.download = `Patient_Notification_Letter_${fields.orgName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
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

  const sectionLabel = (label: string, sub?: string) => (
    <div className="pb-2 border-b border-gray-100 mb-3">
      <p className="text-xs font-medium text-[#0e274e] uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs font-light text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl bg-white rounded-none p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#0e274e] px-6 py-5 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-white font-light text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#00bceb]" />
              Patient Notification Letter
            </DialogTitle>
            <DialogDescription className="text-gray-400 font-light text-sm mt-1">
              Pre-filled with five required HIPAA sections. Review and edit before generating the PDF.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable form */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Contact info */}
          <div>
            {sectionLabel('Organization & Contact')}
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
                <Label className="text-xs font-light text-gray-500 mb-1 block">Contact Name</Label>
                <Input value={fields.contactName} onChange={(e) => set('contactName', e.target.value)} className="rounded-none border-gray-200 text-sm font-light h-9" />
              </div>
              <div>
                <Label className="text-xs font-light text-gray-500 mb-1 block">Phone</Label>
                <Input value={fields.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} className="rounded-none border-gray-200 text-sm font-light h-9" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-light text-gray-500 mb-1 block">Email</Label>
                <Input value={fields.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} className="rounded-none border-gray-200 text-sm font-light h-9" />
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <div>
            {sectionLabel('1. What Happened', '45 CFR § 164.404(c)(1)')}
            <Textarea
              value={fields.whatHappened}
              onChange={(e) => set('whatHappened', e.target.value)}
              rows={5}
              className="rounded-none border-gray-200 text-sm font-light resize-none"
            />
          </div>

          {/* Section 2 */}
          <div>
            {sectionLabel('2. What Information Was Involved', '45 CFR § 164.404(c)(2)')}
            <Textarea
              value={fields.whatInfoInvolved}
              onChange={(e) => set('whatInfoInvolved', e.target.value)}
              rows={4}
              className="rounded-none border-gray-200 text-sm font-light resize-none"
            />
          </div>

          {/* Section 3 */}
          <div>
            {sectionLabel('3. What We Are Doing', '45 CFR § 164.404(c)(3)')}
            <Textarea
              value={fields.whatWeAreDoing}
              onChange={(e) => set('whatWeAreDoing', e.target.value)}
              rows={5}
              className="rounded-none border-gray-200 text-sm font-light resize-none"
            />
          </div>

          {/* Section 4 */}
          <div>
            {sectionLabel('4. What You Can Do', '45 CFR § 164.404(c)(4)')}
            <Textarea
              value={fields.whatYouCanDo}
              onChange={(e) => set('whatYouCanDo', e.target.value)}
              rows={6}
              className="rounded-none border-gray-200 text-sm font-light resize-none"
            />
          </div>

          {/* Section 5 */}
          <div>
            {sectionLabel('5. For More Information', '45 CFR § 164.404(c)(5)')}
            <Textarea
              value={fields.forMoreInfo}
              onChange={(e) => set('forMoreInfo', e.target.value)}
              rows={3}
              className="rounded-none border-gray-200 text-sm font-light resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 flex justify-between items-center shrink-0 bg-white">
          <p className="text-xs text-gray-400 font-light">
            Compliant with 45 CFR § 164.404 — Individual Notification Requirements
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
