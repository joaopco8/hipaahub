'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  generatePatientNotificationLetter,
  generateHHSOCRNotificationLetter,
  generateMediaNotificationLetter,
  type BreachDetails,
} from '@/lib/document-templates/breach-notification-letters';
import type { OrganizationData } from '@/lib/document-generator';
import { BreachNavigation } from '@/components/breach-notifications/breach-navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

// ─── Constants ───────────────────────────────────────────────────────────────

const PHI_LABELS: { key: keyof BreachDetails; label: string }[] = [
  { key: 'phiNameIncluded',      label: 'Full name' },
  { key: 'phiSsnIncluded',       label: 'Social Security Number' },
  { key: 'phiDobIncluded',       label: 'Date of birth' },
  { key: 'phiMrnIncluded',       label: 'Medical record number' },
  { key: 'phiInsuranceIncluded', label: 'Insurance information' },
  { key: 'phiDiagnosisIncluded', label: 'Diagnosis / treatment info' },
  { key: 'phiMedicationIncluded',label: 'Medication info' },
  { key: 'phiLabImagingIncluded',label: 'Lab / imaging results' },
  { key: 'phiBillingIncluded',   label: 'Billing / financial info' },
  { key: 'phiProviderIncluded',  label: 'Provider information' },
  { key: 'phiClaimsIncluded',    label: 'Claims data' },
  { key: 'phiOtherIncluded',     label: 'Other PHI' },
];

const BREACH_TYPES = [
  'Hacking / Malware',
  'Lost Device',
  'Stolen Device',
  'Unauthorized Employee Access',
  'Phishing',
  'Ransomware',
  'Misconfiguration',
  'Business Associate Breach',
] as const;

const DISCOVERY_METHODS = [
  'Internal audit',
  'Employee report',
  'Patient complaint',
  'Vendor notification',
  'Security monitoring',
  'Other',
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type BreachTypeVal = typeof BREACH_TYPES[number];
type DiscoveryMethodVal = typeof DISCOVERY_METHODS[number];

interface FormState {
  // Section 1 – Incident basics
  breachDiscoveryDate: string;
  breachOccurredDate: string;
  discoveryMethod: DiscoveryMethodVal;
  breachType: BreachTypeVal;
  description: string;
  detailedNarrative: string;
  // Section 2 – PHI involved
  phiNameIncluded: boolean;
  phiSsnIncluded: boolean;
  phiDobIncluded: boolean;
  phiMrnIncluded: boolean;
  phiInsuranceIncluded: boolean;
  phiDiagnosisIncluded: boolean;
  phiMedicationIncluded: boolean;
  phiLabImagingIncluded: boolean;
  phiBillingIncluded: boolean;
  phiProviderIncluded: boolean;
  phiClaimsIncluded: boolean;
  phiOtherIncluded: boolean;
  phiOtherDescription: string;
  // Section 3 – Scale
  numberOfIndividuals: number;
  multipleStatesAffected: boolean;
  statesAffected: string;
  // Section 4 – Technical
  encryptionAtRest: 'Yes' | 'No' | 'Unknown';
  encryptionInTransit: 'Yes' | 'No' | 'Unknown';
  systemName: string;
  systemType: string;
  dataLocation: string;
  technicalDetails: string;
  // Section 5 – Response
  containmentActions: string;
  securityEnhancements: string;
  lawEnforcementNotified: boolean;
  lawEnforcementDelay: boolean;
  forensicInvestigator: string;
  // Section 6 – Contact & notification
  contactPersonName: string;
  contactPersonPhone: string;
  contactPersonEmail: string;
  notificationSendDate: string;
  notificationWithoutDelay: boolean;
  creditMonitoringOffered: boolean;
  creditMonitoringDuration: number;
  creditMonitoringProvider: string;
}

type GeneratedLetters = {
  patient: string;
  hhs: string;
  media: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function defaultForm(org?: OrganizationData | null): FormState {
  return {
    breachDiscoveryDate: '',
    breachOccurredDate: '',
    discoveryMethod: 'Internal audit',
    breachType: 'Hacking / Malware',
    description: '',
    detailedNarrative: '',
    phiNameIncluded: false,
    phiSsnIncluded: false,
    phiDobIncluded: false,
    phiMrnIncluded: false,
    phiInsuranceIncluded: false,
    phiDiagnosisIncluded: false,
    phiMedicationIncluded: false,
    phiLabImagingIncluded: false,
    phiBillingIncluded: false,
    phiProviderIncluded: false,
    phiClaimsIncluded: false,
    phiOtherIncluded: false,
    phiOtherDescription: '',
    numberOfIndividuals: 0,
    multipleStatesAffected: false,
    statesAffected: org?.state || '',
    encryptionAtRest: 'Unknown',
    encryptionInTransit: 'Unknown',
    systemName: '',
    systemType: '',
    dataLocation: '',
    technicalDetails: '',
    containmentActions: '',
    securityEnhancements: '',
    lawEnforcementNotified: false,
    lawEnforcementDelay: false,
    forensicInvestigator: '',
    contactPersonName: (org as any)?.privacy_officer_name || (org as any)?.security_officer_name || '',
    contactPersonPhone: (org as any)?.phone_number || '',
    contactPersonEmail: (org as any)?.privacy_officer_email || (org as any)?.email_address || '',
    notificationSendDate: '',
    notificationWithoutDelay: true,
    creditMonitoringOffered: false,
    creditMonitoringDuration: 12,
    creditMonitoringProvider: '',
  };
}

function buildBreachDetails(form: FormState): BreachDetails {
  const phiList = PHI_LABELS
    .filter(p => form[p.key as keyof FormState])
    .map(p => p.label)
    .join(', ');

  return {
    discoveryDate: form.breachDiscoveryDate,
    incidentDate: form.breachOccurredDate || form.breachDiscoveryDate,
    description: form.description,
    detailedNarrative: form.detailedNarrative || form.description,
    discoveryMethod: form.discoveryMethod,
    typesOfInfo: phiList || 'Protected Health Information',
    stepsTaken: form.containmentActions,
    stepsForPatient: 'Please review your medical statements and explanation of benefits for any services you did not receive. Consider placing a fraud alert on your credit file.',
    numberOfIndividuals: form.numberOfIndividuals,
    stateOrJurisdiction: form.statesAffected,
    encryptionAtRest: form.encryptionAtRest,
    encryptionInTransit: form.encryptionInTransit,
    incidentType: form.breachType as BreachDetails['incidentType'],
    lawEnforcementNotified: form.lawEnforcementNotified,
    lawEnforcementDelay: form.lawEnforcementDelay,
    statesAffected: form.statesAffected ? [form.statesAffected] : [],
    phiNameIncluded: form.phiNameIncluded,
    phiSsnIncluded: form.phiSsnIncluded,
    phiDobIncluded: form.phiDobIncluded,
    phiMrnIncluded: form.phiMrnIncluded,
    phiInsuranceIncluded: form.phiInsuranceIncluded,
    phiDiagnosisIncluded: form.phiDiagnosisIncluded,
    phiMedicationIncluded: form.phiMedicationIncluded,
    phiLabImagingIncluded: form.phiLabImagingIncluded,
    phiBillingIncluded: form.phiBillingIncluded,
    phiProviderIncluded: form.phiProviderIncluded,
    phiClaimsIncluded: form.phiClaimsIncluded,
    phiOtherIncluded: form.phiOtherIncluded,
    phiOtherDescription: form.phiOtherDescription,
    systemName: form.systemName || 'Electronic Health Record System',
    systemType: form.systemType || 'Healthcare Information System',
    dataLocation: form.dataLocation || 'Internal servers',
    encryptionStatus: `At Rest: ${form.encryptionAtRest}, In Transit: ${form.encryptionInTransit}`,
    authenticationControls: 'Access controls and authentication in place',
    technicalDetails: form.technicalDetails || form.description,
    containmentActions: form.containmentActions,
    forensicInvestigator: form.forensicInvestigator || 'Internal IT Security Team',
    lawEnforcementNotificationStatus: form.lawEnforcementNotified ? 'Notified' : 'Not applicable',
    haveNotifiedOrWillNotify: 'Will notify all affected individuals within the required timeframe',
    securityEnhancements: form.securityEnhancements || 'Enhanced security measures implemented',
    creditMonitoringOffered: form.creditMonitoringOffered,
    creditMonitoringDuration: form.creditMonitoringDuration,
    creditMonitoringProvider: form.creditMonitoringProvider || undefined,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BreachNotificationsPage() {
  const [org, setOrg] = useState<OrganizationData | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgQueryDone, setOrgQueryDone] = useState(false);
  const [orgTimedOut, setOrgTimedOut] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm());
  const [letters, setLetters] = useState<GeneratedLetters | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'patient' | 'hhs' | 'media'>('patient');

  // Load org data – only the fields needed for letter generation
  useEffect(() => {
    let active = true;

    // Safety net: if auth/db takes >6s, unblock the UI and show a retry state
    const timeoutId = setTimeout(() => {
      if (active) {
        setOrgTimedOut(true);
        setOrgLoading(false);
      }
    }, 6000);

    async function load() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user || !active) return;

        const { data, error: qErr } = await supabase
          .from('organizations')
          .select(
            'id, name, legal_name, dba, state, address_street, address_city, address_state, address_zip,' +
            'privacy_officer_name, privacy_officer_email, privacy_officer_role,' +
            'security_officer_name, security_officer_email, security_officer_role,' +
            'ceo_name, ceo_title, authorized_representative_name, authorized_representative_title,' +
            'phone_number, email_address, ein, npi, state_license_number'
          )
          .eq('user_id', session.user.id)
          .single();

        if (!active) return;
        if (qErr) { console.error('Org load error:', qErr); return; }
        if (data) {
          setOrg(data as unknown as OrganizationData);
          setForm(defaultForm(data as unknown as OrganizationData));
        }
      } finally {
        clearTimeout(timeoutId);
        if (active) {
          setOrgQueryDone(true);
          setOrgLoading(false);
        }
      }
    }
    load();
    return () => { active = false; clearTimeout(timeoutId); };
  }, []);

  // Generic setter
  const set = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: val }));
  }, []);

  // ── Validate ──
  function validate(): string[] {
    const missing: string[] = [];
    if (!form.breachDiscoveryDate)               missing.push('Breach Discovery Date');
    if (!form.description.trim())                missing.push('Breach Description');
    if (!PHI_LABELS.some(p => form[p.key as keyof FormState])) missing.push('At least one PHI type');
    if (!form.numberOfIndividuals || form.numberOfIndividuals < 1) missing.push('Number of Individuals Affected');
    if (!form.containmentActions.trim())         missing.push('Response / Containment Actions');
    if (!form.contactPersonName.trim())          missing.push('Contact Person Name');
    if (!form.contactPersonPhone.trim())         missing.push('Contact Person Phone');
    if (!form.contactPersonEmail.trim())         missing.push('Contact Person Email');
    if (!form.notificationSendDate)              missing.push('Notification Send Date');
    return missing;
  }

  // ── Generate & Save ──
  async function handleGenerate() {
    if (!org) return;
    setError(null);

    const missing = validate();
    if (missing.length > 0) {
      setError('Required fields missing: ' + missing.join(', '));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setGenerating(true);
    try {
      const details = buildBreachDetails(form);
      const needs500 = form.numberOfIndividuals >= 500;
      const needsMedia = needs500 && form.multipleStatesAffected;

      const patient = generatePatientNotificationLetter(org, details);
      const hhs     = needs500  ? generateHHSOCRNotificationLetter(org, details)  : '';
      const media   = needsMedia ? generateMediaNotificationLetter(org, details) : '';

      setLetters({ patient, hhs, media });
      setActiveTab('patient');

      // Save to DB
      await persist({ patient, hhs, media });
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to generate letters. Please check your data and try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function persist(gen: GeneratedLetters) {
    if (!org) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const now = new Date().toISOString();
      const breachYear = form.breachDiscoveryDate
        ? new Date(form.breachDiscoveryDate).getFullYear()
        : new Date().getFullYear();

      const phiTypeList = PHI_LABELS
        .filter(p => form[p.key as keyof FormState])
        .map(p => p.label);

      const record = {
        organization_id:          (org as any).id,
        user_id:                  session.user.id,
        organization_name:        (org as any).legal_name || (org as any).name,
        breach_discovery_date:    form.breachDiscoveryDate,
        breach_occurred_date:     form.breachOccurredDate || null,
        breach_discovery_method:  form.discoveryMethod,
        breach_description:       form.description,
        phi_types:                phiTypeList,
        ssn_exposed:              form.phiSsnIncluded,
        financial_info_exposed:   form.phiBillingIncluded,
        individuals_affected:     form.numberOfIndividuals,
        multiple_states_affected: form.multipleStatesAffected,
        exceeds_500_individuals:  form.numberOfIndividuals >= 500,
        breach_type:              form.breachType,
        data_encrypted:           form.encryptionAtRest === 'Yes' && form.encryptionInTransit === 'Yes',
        mitigation_actions:       form.containmentActions,
        law_enforcement_notified: form.lawEnforcementNotified ? 'yes' : 'no',
        contact_person_name:      form.contactPersonName,
        contact_person_phone:     form.contactPersonPhone,
        contact_person_email:     form.contactPersonEmail,
        credit_monitoring_offered:form.creditMonitoringOffered,
        credit_monitoring_duration: form.creditMonitoringOffered ? form.creditMonitoringDuration : null,
        notification_without_delay: form.notificationWithoutDelay,
        notification_send_date:   form.notificationSendDate,
        patient_letter_content:   gen.patient || null,
        hhs_letter_content:       gen.hhs || null,
        media_letter_content:     gen.media || null,
        status:                   'generated',
        updated_at:               now,
      };

      const db = supabase as any;
      if (savedId) {
        await db
          .from('breach_notifications')
          .update(record)
          .eq('id', savedId);
      } else {
        const breachId = `BREACH-${breachYear}-${String(Date.now()).slice(-5)}`;
        const { data } = await db
          .from('breach_notifications')
          .insert({ ...record, breach_id: breachId, created_at: now, created_by: session.user.id })
          .select('id')
          .single();
        if (data) setSavedId(data.id);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  }

  function download(content: string, name: string) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    a.download = name;
    a.click();
  }

  // ─── Render states ─────────────────────────────────────────────────────────

  // Still loading (query in progress, timeout not yet fired)
  if (orgLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-[#0e274e]" />
        <span className="text-[#565656] font-light">Loading...</span>
      </div>
    );
  }

  // Timeout fired but query never completed — show retry
  if (orgTimedOut && !org) {
    return (
      <div className="flex w-full flex-col gap-6">
        <h2 className="text-2xl font-light text-[#0e274e]">Breach Notifications</h2>
        <BreachNavigation />
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-light">
            Connection is taking too long.{' '}
            <button onClick={() => window.location.reload()} className="underline font-medium">
              Click here to reload
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Query completed but no org record found
  if (orgQueryDone && !org) {
    return (
      <div className="flex w-full flex-col gap-6">
        <h2 className="text-2xl font-light text-[#0e274e]">Breach Notifications</h2>
        <BreachNavigation />
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-light">
            Organization profile not found.{' '}
            <Link href="/dashboard/settings" className="underline font-medium">
              Complete your profile
            </Link>{' '}
            to use breach notifications.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Still waiting for query (shouldn't reach here, but guard anyway)
  if (!org) {
    return (
      <div className="flex items-center justify-center py-24 gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-[#0e274e]" />
        <span className="text-[#565656] font-light">Loading...</span>
      </div>
    );
  }

  const needs500  = form.numberOfIndividuals >= 500;
  const needsMedia = needs500 && form.multipleStatesAffected;
  const orgName   = (org as any).legal_name || (org as any).name || 'Your Organization';

  // ─── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="flex w-full flex-col gap-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-light text-[#0e274e]">Breach Notifications</h2>
        <p className="text-sm text-gray-400 font-light">
          Generate HIPAA-compliant notification letters — 45 CFR §164.400–414
        </p>
      </div>

      <BreachNavigation />

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-light">{error}</AlertDescription>
        </Alert>
      )}

      {savedId && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 font-light">
            {saving ? 'Saving...' : 'Saved to history.'}{' '}
            <Link href="/dashboard/breach-notifications/history" className="underline">
              View history →
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* ── Section 1: Incident Basics ── */}
      <Card className="rounded-lg border border-gray-200 shadow-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-medium text-[#0e274e] uppercase tracking-wide">
            1 — Incident Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-light text-gray-600">Discovery Date *</Label>
            <Input
              type="date"
              value={form.breachDiscoveryDate}
              onChange={e => set('breachDiscoveryDate', e.target.value)}
              className="mt-1 font-light"
            />
          </div>
          <div>
            <Label className="text-sm font-light text-gray-600">Date Breach Occurred</Label>
            <Input
              type="date"
              value={form.breachOccurredDate}
              onChange={e => set('breachOccurredDate', e.target.value)}
              className="mt-1 font-light"
            />
          </div>
          <div>
            <Label className="text-sm font-light text-gray-600">Discovery Method *</Label>
            <Select value={form.discoveryMethod} onValueChange={v => set('discoveryMethod', v as DiscoveryMethodVal)}>
              <SelectTrigger className="mt-1 font-light"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DISCOVERY_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-light text-gray-600">Breach Type *</Label>
            <Select value={form.breachType} onValueChange={v => set('breachType', v as BreachTypeVal)}>
              <SelectTrigger className="mt-1 font-light"><SelectValue /></SelectTrigger>
              <SelectContent>
                {BREACH_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-sm font-light text-gray-600">Brief Description *</Label>
            <Textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Summarize what happened (1–2 sentences)"
              className="mt-1 font-light min-h-[72px]"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-sm font-light text-gray-600">Detailed Narrative (for letters)</Label>
            <Textarea
              value={form.detailedNarrative}
              onChange={e => set('detailedNarrative', e.target.value)}
              placeholder="Full narrative for the patient letter — what happened, when, how it was discovered..."
              className="mt-1 font-light min-h-[96px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: PHI Involved ── */}
      <Card className="rounded-lg border border-gray-200 shadow-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-medium text-[#0e274e] uppercase tracking-wide">
            2 — PHI Compromised *
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PHI_LABELS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  id={key}
                  checked={!!form[key as keyof FormState]}
                  onCheckedChange={v => set(key as keyof FormState, v as any)}
                />
                <label htmlFor={key} className="text-sm font-light cursor-pointer">{label}</label>
              </div>
            ))}
          </div>
          {form.phiOtherIncluded && (
            <div className="mt-3">
              <Label className="text-sm font-light text-gray-600">Describe other PHI</Label>
              <Input
                value={form.phiOtherDescription}
                onChange={e => set('phiOtherDescription', e.target.value)}
                className="mt-1 font-light"
                placeholder="Describe the other PHI involved"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section 3: Scale & Classification ── */}
      <Card className="rounded-lg border border-gray-200 shadow-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-medium text-[#0e274e] uppercase tracking-wide">
            3 — Scale &amp; Classification
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-light text-gray-600">Individuals Affected *</Label>
            <Input
              type="number"
              min="1"
              value={form.numberOfIndividuals || ''}
              onChange={e => set('numberOfIndividuals', parseInt(e.target.value) || 0)}
              className="mt-1 font-light"
            />
            {needs500 && (
              <p className="text-xs text-amber-600 mt-1">
                ≥500 affected: HHS OCR notification letter will be generated
              </p>
            )}
          </div>
          <div>
            <Label className="text-sm font-light text-gray-600">State(s) Affected</Label>
            <Input
              value={form.statesAffected}
              onChange={e => set('statesAffected', e.target.value)}
              placeholder="e.g. FL, TX"
              className="mt-1 font-light"
            />
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="multi-state"
              checked={form.multipleStatesAffected}
              onCheckedChange={v => set('multipleStatesAffected', v as boolean)}
            />
            <label htmlFor="multi-state" className="text-sm font-light cursor-pointer">
              Multiple states affected
              {needsMedia && <span className="text-amber-600 ml-1">— media letter required</span>}
            </label>
          </div>
          <div>
            <Label className="text-sm font-light text-gray-600">Encryption at Rest</Label>
            <Select value={form.encryptionAtRest} onValueChange={v => set('encryptionAtRest', v as 'Yes' | 'No' | 'Unknown')}>
              <SelectTrigger className="mt-1 font-light"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-light text-gray-600">Encryption in Transit</Label>
            <Select value={form.encryptionInTransit} onValueChange={v => set('encryptionInTransit', v as 'Yes' | 'No' | 'Unknown')}>
              <SelectTrigger className="mt-1 font-light"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.encryptionAtRest === 'Yes' && form.encryptionInTransit === 'Yes' && (
            <div className="sm:col-span-2">
              <Alert className="border-green-200 bg-green-50 py-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-xs font-light">
                  Data was encrypted end-to-end. Under 45 CFR §164.402 this breach may not require notification — verify with legal counsel.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section 4: Technical Details ── */}
      <Card className="rounded-lg border border-gray-200 shadow-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-medium text-[#0e274e] uppercase tracking-wide">
            4 — Technical Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-light text-gray-600">Affected System Name</Label>
            <Input
              value={form.systemName}
              onChange={e => set('systemName', e.target.value)}
              placeholder="e.g. EHR System, Patient Portal"
              className="mt-1 font-light"
            />
          </div>
          <div>
            <Label className="text-sm font-light text-gray-600">System Type</Label>
            <Input
              value={form.systemType}
              onChange={e => set('systemType', e.target.value)}
              placeholder="e.g. Cloud-based EHR, On-premises server"
              className="mt-1 font-light"
            />
          </div>
          <div>
            <Label className="text-sm font-light text-gray-600">Data Location</Label>
            <Input
              value={form.dataLocation}
              onChange={e => set('dataLocation', e.target.value)}
              placeholder="e.g. AWS us-east-1, Internal server room"
              className="mt-1 font-light"
            />
          </div>
          <div>
            <Label className="text-sm font-light text-gray-600">Forensic Investigator</Label>
            <Input
              value={form.forensicInvestigator}
              onChange={e => set('forensicInvestigator', e.target.value)}
              placeholder="e.g. Internal IT, Third-party firm"
              className="mt-1 font-light"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-sm font-light text-gray-600">Technical Details (optional)</Label>
            <Textarea
              value={form.technicalDetails}
              onChange={e => set('technicalDetails', e.target.value)}
              placeholder="Any additional technical context for the record..."
              className="mt-1 font-light min-h-[72px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Section 5: Response Actions ── */}
      <Card className="rounded-lg border border-gray-200 shadow-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-medium text-[#0e274e] uppercase tracking-wide">
            5 — Response Actions *
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label className="text-sm font-light text-gray-600">Containment &amp; Mitigation Actions *</Label>
            <Textarea
              value={form.containmentActions}
              onChange={e => set('containmentActions', e.target.value)}
              placeholder="Describe actions taken to contain and mitigate the breach..."
              className="mt-1 font-light min-h-[80px]"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-sm font-light text-gray-600">Security Enhancements Implemented</Label>
            <Textarea
              value={form.securityEnhancements}
              onChange={e => set('securityEnhancements', e.target.value)}
              placeholder="Describe security improvements made to prevent future incidents..."
              className="mt-1 font-light min-h-[72px]"
            />
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="law-enforcement"
              checked={form.lawEnforcementNotified}
              onCheckedChange={v => set('lawEnforcementNotified', v as boolean)}
            />
            <label htmlFor="law-enforcement" className="text-sm font-light cursor-pointer">
              Law enforcement notified
            </label>
          </div>
          {form.lawEnforcementNotified && (
            <div className="flex items-center gap-3">
              <Checkbox
                id="law-delay"
                checked={form.lawEnforcementDelay}
                onCheckedChange={v => set('lawEnforcementDelay', v as boolean)}
              />
              <label htmlFor="law-delay" className="text-sm font-light cursor-pointer">
                Notification delayed at law enforcement request
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section 6: Contact & Notification ── */}
      <Card className="rounded-lg border border-gray-200 shadow-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-medium text-[#0e274e] uppercase tracking-wide">
            6 — Contact &amp; Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-light text-gray-600">Contact Person Name *</Label>
            <Input
              value={form.contactPersonName}
              onChange={e => set('contactPersonName', e.target.value)}
              className="mt-1 font-light"
            />
          </div>
          <div>
            <Label className="text-sm font-light text-gray-600">Contact Phone *</Label>
            <Input
              value={form.contactPersonPhone}
              onChange={e => set('contactPersonPhone', e.target.value)}
              className="mt-1 font-light"
            />
          </div>
          <div>
            <Label className="text-sm font-light text-gray-600">Contact Email *</Label>
            <Input
              type="email"
              value={form.contactPersonEmail}
              onChange={e => set('contactPersonEmail', e.target.value)}
              className="mt-1 font-light"
            />
          </div>
          <div>
            <Label className="text-sm font-light text-gray-600">Notification Send Date *</Label>
            <Input
              type="date"
              value={form.notificationSendDate}
              onChange={e => set('notificationSendDate', e.target.value)}
              className="mt-1 font-light"
            />
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="no-delay"
              checked={form.notificationWithoutDelay}
              onCheckedChange={v => set('notificationWithoutDelay', v as boolean)}
            />
            <label htmlFor="no-delay" className="text-sm font-light cursor-pointer">
              Notification sent without unreasonable delay
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="credit-monitoring"
              checked={form.creditMonitoringOffered}
              onCheckedChange={v => set('creditMonitoringOffered', v as boolean)}
            />
            <label htmlFor="credit-monitoring" className="text-sm font-light cursor-pointer">
              Offer credit monitoring to affected individuals
            </label>
          </div>
          {form.creditMonitoringOffered && (
            <>
              <div>
                <Label className="text-sm font-light text-gray-600">Duration (months)</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.creditMonitoringDuration}
                  onChange={e => set('creditMonitoringDuration', parseInt(e.target.value) || 12)}
                  className="mt-1 font-light"
                />
              </div>
              <div>
                <Label className="text-sm font-light text-gray-600">Provider Name</Label>
                <Input
                  value={form.creditMonitoringProvider}
                  onChange={e => set('creditMonitoringProvider', e.target.value)}
                  placeholder="e.g. Experian IdentityWorks"
                  className="mt-1 font-light"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Generate button ── */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleGenerate}
          disabled={generating || saving}
          className="bg-[#0e274e] hover:bg-[#1a3a6e] text-white font-light px-6"
        >
          {generating ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
          ) : (
            <><FileText className="h-4 w-4 mr-2" />Generate Notification Letters</>
          )}
        </Button>
        {saving && (
          <span className="text-sm text-gray-400 font-light flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />Saving...
          </span>
        )}
      </div>

      {/* ── Generated Letters ── */}
      {letters && (
        <div className="flex flex-col gap-4">
          <div className="border-b pb-2 flex items-center justify-between">
            <h3 className="text-lg font-light text-[#0e274e]">Generated Letters</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-light">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              {savedId ? 'Saved to history' : saving ? 'Saving...' : ''}
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex border-b">
            {(['patient', 'hhs', 'media'] as const).map(tab => {
              const labels = { patient: 'Patient Letter', hhs: 'HHS OCR Letter', media: 'Media Letter' };
              const available = { patient: !!letters.patient, hhs: !!letters.hhs, media: !!letters.media };
              const required  = { patient: true, hhs: needs500, media: needsMedia };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  disabled={!available[tab]}
                  className={[
                    'px-4 py-2 text-sm font-light border-b-2 transition-colors',
                    activeTab === tab
                      ? 'border-[#0e274e] text-[#0e274e]'
                      : available[tab]
                        ? 'border-transparent text-gray-400 hover:text-gray-600'
                        : 'border-transparent text-gray-200 cursor-not-allowed',
                  ].join(' ')}
                >
                  {labels[tab]}
                  {!required[tab] && (
                    <span className="ml-1 text-xs text-gray-300">(N/A)</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Letter preview */}
          {(['patient', 'hhs', 'media'] as const).map(tab => {
            if (activeTab !== tab) return null;
            const content = letters[tab];
            const filenames = {
              patient: `patient-notification-${form.breachDiscoveryDate || 'draft'}.txt`,
              hhs:     `hhs-ocr-notification-${form.breachDiscoveryDate || 'draft'}.txt`,
              media:   `media-notification-${form.breachDiscoveryDate || 'draft'}.txt`,
            };
            if (!content) {
              return (
                <div key={tab} className="text-sm text-gray-400 font-light py-4 text-center">
                  {tab === 'hhs'   && 'HHS OCR letter not required — fewer than 500 individuals affected.'}
                  {tab === 'media' && 'Media notification not required — fewer than 500 affected or single state.'}
                </div>
              );
            }
            return (
              <Card key={tab} className="rounded-lg border border-gray-200 shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {tab === 'patient' ? 'Patient Notification Letter — 45 CFR §164.404' :
                       tab === 'hhs'     ? 'HHS OCR Notification — 45 CFR §164.406' :
                                          'Media Notification — 45 CFR §164.408'}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-light text-xs"
                    onClick={() => download(content, filenames[tab])}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download .txt
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs text-gray-600 font-light whitespace-pre-wrap bg-gray-50 rounded p-4 max-h-72 overflow-y-auto leading-relaxed">
                    {content}
                  </pre>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
