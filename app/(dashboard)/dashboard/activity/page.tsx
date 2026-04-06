import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import {
  Activity, FileText, FileCheck, GraduationCap, UserPlus,
  AlertTriangle, CheckCircle2, Building2, FolderOpen, Shield, Package
} from 'lucide-react';
import Link from 'next/link';
import { getRecentActivity, type ActivityEvent } from '@/lib/activity-feed';

const TYPE_LABELS: Record<ActivityEvent['type'], string> = {
  policy_activated:            'Policy Activated',
  policy_draft:                'Policy Updated',
  training_completed:          'Training Completed',
  training_invited:            'Employee Invited',
  incident_opened:             'Incident Logged',
  incident_closed:             'Incident Closed',
  vendor_added:                'Vendor Registered',
  evidence_uploaded:           'Evidence Uploaded',
  risk_assessment_completed:   'Risk Assessment Updated',
  asset_added:                 'Asset Registered',
};

function EventIcon({ type }: { type: ActivityEvent['type'] }) {
  const cls = 'w-4 h-4';
  switch (type) {
    case 'policy_activated':           return <FileCheck className={`${cls} text-[#1ad07a]`} />;
    case 'policy_draft':               return <FileText className={`${cls} text-[#0175a2]`} />;
    case 'training_completed':         return <GraduationCap className={`${cls} text-[#1ad07a]`} />;
    case 'training_invited':           return <UserPlus className={`${cls} text-[#0175a2]`} />;
    case 'incident_opened':            return <AlertTriangle className={`${cls} text-red-500`} />;
    case 'incident_closed':            return <CheckCircle2 className={`${cls} text-[#1ad07a]`} />;
    case 'vendor_added':               return <Building2 className={`${cls} text-[#0175a2]`} />;
    case 'evidence_uploaded':          return <FolderOpen className={`${cls} text-[#0175a2]`} />;
    case 'risk_assessment_completed':  return <Shield className={`${cls} text-[#0175a2]`} />;
    case 'asset_added':                return <Package className={`${cls} text-[#0175a2]`} />;
    default:                           return <Activity className={`${cls} text-gray-400`} />;
  }
}

export default async function ActivityPage() {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return redirect('/signin');

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!org) return redirect('/onboarding/expectation');

  const events = await getRecentActivity(50);

  // Group events by date
  const grouped: Map<string, ActivityEvent[]> = new Map();
  for (const event of events) {
    const key = event.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(event);
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-2xl font-light text-[#0e274e]">Activity Log</h2>
        <p className="text-sm text-gray-400 font-light">
          Recent compliance actions across your practice
        </p>
      </div>

      {events.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Activity className="h-12 w-12 text-gray-200 mb-4" />
            <p className="text-sm text-gray-400">No activity recorded yet.</p>
            <p className="text-xs text-gray-400 mt-1">Actions will appear here as you use the platform.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([date, dayEvents]) => (
            <div key={date}>
              <p className="text-xs font-medium text-gray-400 mb-3">{date}</p>
              <Card className="border-0 shadow-sm bg-white rounded-none">
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-50">
                    {dayEvents.map((event) => (
                      <div key={event.id} className="flex items-start gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                        <div className="mt-0.5 shrink-0">
                          <EventIcon type={event.type} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-normal text-[#0e274e]">{TYPE_LABELS[event.type]}</p>
                            <span className="text-xs text-gray-400 font-light shrink-0">
                              {event.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 font-light truncate">{event.description}</p>
                        </div>
                        {event.link && (
                          <Link href={event.link} className="text-xs text-[#0175a2] font-light shrink-0 hover:underline">
                            View
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
