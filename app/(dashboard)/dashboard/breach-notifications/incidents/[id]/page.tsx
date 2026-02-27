'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertCircle, FileText, Calendar, Users, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { BreachNavigation } from '@/components/breach-notifications/breach-navigation';

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
  created_at: string;
  updated_at: string;
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'low':
      return 'bg-green-50 text-green-600 border-green-200';
    case 'medium':
      return 'bg-yellow-50 text-yellow-600 border-yellow-200';
    case 'high':
      return 'bg-red-50 text-red-600 border-red-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'open':
      return 'bg-red-50 text-red-600 border-red-200';
    case 'under_review':
      return 'bg-yellow-50 text-yellow-600 border-yellow-200';
    case 'closed':
      return 'bg-green-50 text-green-600 border-green-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

export default function IncidentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const incidentId = params.id as string;
  
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIncident();
  }, [incidentId]);

  async function loadIncident() {
    try {
      const supabase = createClient();
      const { data, error } = await (supabase as any)
        .from('incident_logs')
        .select('*')
        .eq('id', incidentId)
        .single();

      if (error) throw error;
      setIncident(data);
    } catch (error) {
      console.error('Error loading incident:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex w-full flex-col gap-6">
        <div className="mb-2">
          <h2 className="text-2xl font-light text-[#0e274e]">Incident Details</h2>
          <p className="text-sm text-gray-400 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex w-full flex-col gap-6">
        <div className="mb-2">
          <h2 className="text-2xl font-light text-[#0e274e]">Incident Not Found</h2>
          <p className="text-sm text-gray-400 font-light">The incident you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/dashboard/breach-notifications/incidents')} className="mt-4 rounded-none">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Incidents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
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
      <div className="mb-2 flex items-center justify-between">
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
            <p className="text-sm text-gray-400 font-light">Incident Details & Timeline</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Section 1: Overview */}
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

        {/* Section 2: PHI Impact */}
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
              {incident.phi_involved ? (
                <Badge className="bg-red-50 text-red-600 border-red-200 rounded-none">Yes</Badge>
              ) : (
                <Badge className="bg-gray-50 text-gray-600 border-gray-200 rounded-none">No</Badge>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Estimated Individuals Affected</p>
              <p className="text-sm text-[#0e274e]">{incident.estimated_individuals_affected}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Breach Confirmed</p>
              {incident.breach_confirmed ? (
                <Badge className="bg-red-50 text-red-600 border-red-200 rounded-none">Yes</Badge>
              ) : (
                <Badge className="bg-gray-50 text-gray-600 border-gray-200 rounded-none">No</Badge>
              )}
            </div>
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
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Timeline */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-light text-[#0e274e] flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#00bceb]" />
            Timeline
          </CardTitle>
          <CardDescription className="text-xs text-gray-400">
            Chronological event log for this incident
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
              <div className="w-2 h-2 rounded-full bg-[#00bceb] mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0e274e]">Incident Created</p>
                <p className="text-xs text-gray-400">
                  {format(new Date(incident.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
            <div className="text-center py-4 text-sm text-gray-400">
              No additional timeline entries yet
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Attachments */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-light text-[#0e274e] flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#00bceb]" />
            Attachments
          </CardTitle>
          <CardDescription className="text-xs text-gray-400">
            Documents and files related to this incident
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-sm text-gray-400 mb-2">No attachments uploaded</p>
            <p className="text-xs text-gray-400">Upload documents related to this incident</p>
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Breach Status */}
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
                <span className="text-sm text-red-600 font-medium">Breach Confirmed</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Not Confirmed as Breach</span>
              </div>
            )}
          </div>
          {incident.breach_notification_id && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Linked Breach Notification</p>
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/breach-notifications/history`)}
                className="rounded-none border-gray-200 text-gray-600 hover:text-[#00bceb]"
              >
                View Notification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
