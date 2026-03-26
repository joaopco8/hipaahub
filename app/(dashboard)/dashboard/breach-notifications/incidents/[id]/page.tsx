'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  AlertCircle,
  FileText,
  Users,
  CheckCircle2,
  XCircle,
  Mail,
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';
import { BreachNavigation } from '@/components/breach-notifications/breach-navigation';
import { IncidentTimelineCard } from '@/components/breach-notifications/incident-timeline-card';
import { OCRLetterModal } from '@/components/breach-notifications/ocr-letter-modal';
import { PatientLetterModal } from '@/components/breach-notifications/patient-letter-modal';
import { ActionGate } from '@/components/action-gate';
import { useSubscription } from '@/contexts/subscription-context';

interface Incident {
  id: string;
  incident_title: string;
  description: string;
  date_occurred: string;
  date_discovered: string;
  discovered_by: string;
  phi_involved: boolean;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'under_review' | 'closed';
  estimated_individuals_affected: number;
  breach_confirmed: boolean;
  breach_notification_id: string | null;
  // Timeline milestones
  timeline_breach_occurred: string | null;
  timeline_breach_discovered: string | null;
  timeline_investigation_began: string | null;
  timeline_ocr_notified: string | null;
  timeline_patients_notified: string | null;
  timeline_incident_resolved: string | null;
  created_at: string;
  updated_at: string;
}

interface OrgData {
  id: string;
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

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'low':    return 'bg-green-50 text-green-600 border-green-200';
    case 'medium': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
    case 'high':   return 'bg-red-50 text-red-600 border-red-200';
    default:       return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'open':         return 'bg-red-50 text-red-600 border-red-200';
    case 'under_review': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
    case 'closed':       return 'bg-green-50 text-green-600 border-green-200';
    default:             return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

export default function IncidentDetailPage() {
  const router   = useRouter();
  const params   = useParams();
  const incidentId = params.id as string;

  const { isLocked } = useSubscription();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [org, setOrg]           = useState<OrgData | null>(null);
  const [loading, setLoading]   = useState(true);

  const [showOCRModal,     setShowOCRModal]     = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);

  useEffect(() => { loadData(); }, [incidentId]);

  async function loadData() {
    try {
      const supabase = createClient();

      const [incidentRes, userRes] = await Promise.all([
        (supabase as any).from('incident_logs').select('*').eq('id', incidentId).single(),
        supabase.auth.getUser(),
      ]);

      if (incidentRes.error) throw incidentRes.error;
      setIncident(incidentRes.data);

      if (userRes.data?.user) {
        const { data: orgData } = await (supabase as any)
          .from('organizations')
          .select('*')
          .eq('user_id', userRes.data.user.id)
          .maybeSingle();
        if (orgData) setOrg(orgData);
      }
    } catch (err) {
      console.error('Error loading incident:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex w-full flex-col gap-6">
        <p className="text-sm text-gray-400 font-light">Loading...</p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex w-full flex-col gap-6">
        <h2 className="text-2xl font-light text-[#0e274e]">Incident Not Found</h2>
        <p className="text-sm text-gray-400 font-light">The incident you're looking for doesn't exist.</p>
        <Button
          onClick={() => router.push('/dashboard/breach-notifications/incidents')}
          className="w-fit rounded-none"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Incidents
        </Button>
      </div>
    );
  }

  const milestones = {
    timeline_breach_occurred:     incident.timeline_breach_occurred,
    timeline_breach_discovered:   incident.timeline_breach_discovered,
    timeline_investigation_began: incident.timeline_investigation_began,
    timeline_ocr_notified:        incident.timeline_ocr_notified,
    timeline_patients_notified:   incident.timeline_patients_notified,
    timeline_incident_resolved:   incident.timeline_incident_resolved,
  };

  const defaultOrg: OrgData = org || {
    id: '',
    name: 'Your Organization',
    privacy_officer_name: '',
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Module Header */}
      <div className="mb-2">
        <h2 className="text-2xl font-light text-[#0e274e]">Breach Notifications</h2>
        <p className="text-sm text-gray-400 font-light">
          Manage breach notifications, incident logs, and compliance documentation
        </p>
      </div>

      <BreachNavigation />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/breach-notifications/incidents')}
            className="rounded-none"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h3 className="text-xl font-light text-[#0e274e]">{incident.incident_title}</h3>
            <p className="text-sm text-gray-400 font-light">
              Incident Details, Timeline &amp; Notification Letters
            </p>
          </div>
        </div>
      </div>

      {/* ── Overview + PHI Impact ──────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-base font-light text-[#0e274e] flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#00bceb]" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-[#0e274e] whitespace-pre-wrap">{incident.description}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Severity</p>
              <Badge className={`${getSeverityColor(incident.severity)} rounded-none capitalize`}>
                {incident.severity}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <Badge className={`${getStatusColor(incident.status)} rounded-none capitalize`}>
                {incident.status.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Discovered By</p>
              <p className="text-sm text-[#0e274e]">{incident.discovered_by}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-base font-light text-[#0e274e] flex items-center gap-2">
              <Users className="h-5 w-5 text-[#00bceb]" />
              PHI Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">PHI Involved</p>
              <Badge className={`${incident.phi_involved ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'} rounded-none`}>
                {incident.phi_involved ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Estimated Individuals Affected</p>
              <p className="text-sm text-[#0e274e]">
                {incident.estimated_individuals_affected?.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Breach Confirmed</p>
              <Badge className={`${incident.breach_confirmed ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'} rounded-none`}>
                {incident.breach_confirmed ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Date Occurred</p>
                <p className="text-sm text-[#0e274e]">
                  {format(new Date(incident.date_occurred), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Date Discovered</p>
                <p className="text-sm text-[#0e274e]">
                  {format(new Date(incident.date_discovered), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Incident Timeline ────────────────────────────────────────────── */}
      <IncidentTimelineCard
        incidentId={incidentId}
        initialMilestones={milestones}
        discoveryDate={incident.date_discovered}
      />

      {/* ── Notification Letters ─────────────────────────────────────────── */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-light text-[#0e274e] flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#00bceb]" />
            Notification Letters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* OCR Letter */}
            <div className="border border-gray-100 p-5 flex flex-col gap-3 hover:border-[#0e274e]/20 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#0e274e]/5 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-[#0e274e]" />
                </div>
                <div>
                  <p className="text-sm font-light text-[#0e274e]">OCR / HHS Notification Letter</p>
                  <p className="text-xs text-gray-400 font-light mt-0.5">
                    45 CFR § 164.408 — Notification to HHS Office for Civil Rights
                  </p>
                </div>
              </div>
              <ul className="text-xs text-gray-500 font-light space-y-1 ml-11">
                <li>• Organization &amp; contact information</li>
                <li>• Breach dates and description</li>
                <li>• PHI types &amp; individuals affected</li>
                <li>• Investigation &amp; prevention steps</li>
              </ul>
              <ActionGate isLocked={isLocked} documentType="OCR notification letter">
                <Button
                  variant="outline"
                  onClick={() => setShowOCRModal(true)}
                  className="rounded-none border-[#0e274e]/20 text-[#0e274e] font-light h-9 text-xs mt-1 hover:bg-[#0e274e]/5"
                >
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  Open OCR Letter Generator
                </Button>
              </ActionGate>
            </div>

            {/* Patient Letter */}
            <div className="border border-gray-100 p-5 flex flex-col gap-3 hover:border-[#00bceb]/20 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#00bceb]/5 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-[#00bceb]" />
                </div>
                <div>
                  <p className="text-sm font-light text-[#0e274e]">Patient Notification Letter</p>
                  <p className="text-xs text-gray-400 font-light mt-0.5">
                    45 CFR § 164.404 — Notification to Affected Individuals
                  </p>
                </div>
              </div>
              <ul className="text-xs text-gray-500 font-light space-y-1 ml-11">
                <li>• What happened</li>
                <li>• What information was involved</li>
                <li>• What we are doing</li>
                <li>• What you can do</li>
                <li>• For more information (contact)</li>
              </ul>
              <ActionGate isLocked={isLocked} documentType="patient notification letter">
                <Button
                  variant="outline"
                  onClick={() => setShowPatientModal(true)}
                  className="rounded-none border-[#00bceb]/20 text-[#00bceb] font-light h-9 text-xs mt-1 hover:bg-[#00bceb]/5"
                >
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                  Open Patient Letter Generator
                </Button>
              </ActionGate>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Breach Status ────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-light text-[#0e274e] flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-[#00bceb]" />
            Breach Status
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Breach Confirmed</p>
            {incident.breach_confirmed ? (
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-600 font-light">Breach Confirmed</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-600 font-light">Not Confirmed as Breach</span>
              </div>
            )}
          </div>
          {incident.breach_notification_id && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Linked Breach Notification</p>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/breach-notifications/history')}
                className="rounded-none border-gray-200 text-gray-600 hover:text-[#00bceb]"
              >
                View Notification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {showOCRModal && (
        <OCRLetterModal
          open={showOCRModal}
          onClose={() => setShowOCRModal(false)}
          incident={incident}
          org={defaultOrg}
        />
      )}

      {showPatientModal && (
        <PatientLetterModal
          open={showPatientModal}
          onClose={() => setShowPatientModal(false)}
          incident={incident}
          org={defaultOrg}
        />
      )}
    </div>
  );
}
