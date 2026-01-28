import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, FileText, Calendar, Users } from 'lucide-react';

export default async function IncidentsPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  // Mock data - será substituído por dados reais
  const incidents = [
    {
      id: 1,
      title: 'Unauthorized Access Attempt',
      date: '2024-01-15',
      status: 'resolved',
      breach: false,
      affectedCount: 0,
      description: 'Detected unauthorized login attempt. Account locked and password reset required.',
      actionTaken: 'Immediate account lockout, password reset, and security review completed.'
    },
    {
      id: 2,
      title: 'Lost USB Drive',
      date: '2024-01-10',
      status: 'under-review',
      breach: true,
      affectedCount: 15,
      description: 'USB drive containing patient data was lost. Drive was encrypted but password was written on a note.',
      actionTaken: 'All affected patients notified. HHS notification in progress.'
    }
  ];

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Incident Reporting</h1>
          <p className="text-zinc-600 text-base">
            Document and manage security incidents and potential breaches
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Report Incident
        </Button>
      </div>

      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Important: Breach Notification Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            If a breach affects 500+ individuals, you must notify HHS within 60 days. 
            For breaches affecting fewer than 500, you must notify HHS within 60 days 
            of the end of the calendar year. All affected individuals must be notified 
            without unreasonable delay, no later than 60 days after discovery.
          </p>
        </CardContent>
      </Card>

      {incidents.length > 0 ? (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <Card key={incident.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{incident.title}</CardTitle>
                      {incident.breach && (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          BREACH
                        </Badge>
                      )}
                      <Badge variant={incident.status === 'resolved' ? 'default' : 'outline'}>
                        {incident.status === 'resolved' ? 'Resolved' : 'Under Review'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(incident.date).toLocaleDateString()}</span>
                      </div>
                      {incident.affectedCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{incident.affectedCount} individuals affected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="font-semibold text-sm mb-1">What happened:</div>
                    <p className="text-sm text-muted-foreground">{incident.description}</p>
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-1">Action taken:</div>
                    <p className="text-sm text-muted-foreground">{incident.actionTaken}</p>
                  </div>
                  {incident.breach && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-semibold text-sm text-red-900 mb-1">
                        Breach Notification Status:
                      </div>
                      <div className="text-sm text-red-800">
                        {incident.affectedCount >= 500 
                          ? 'HHS notification required within 60 days'
                          : 'HHS notification required within 60 days of year end'}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    {incident.breach && (
                      <Button variant="outline" size="sm">
                        Notification Checklist
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No incidents reported</CardTitle>
            <CardDescription className="mb-4">
              If a security incident occurs, report it here immediately
            </CardDescription>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Report Your First Incident
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>What Constitutes a Breach?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            A breach is defined as the acquisition, access, use, or disclosure of PHI in a manner 
            not permitted by HIPAA that compromises the security or privacy of the PHI. Examples include:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Unauthorized access to PHI</li>
            <li>Loss or theft of devices containing PHI</li>
            <li>Hacking or ransomware attacks</li>
            <li>Improper disposal of PHI</li>
            <li>Sending PHI to the wrong recipient</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            When in doubt, it's better to report and investigate than to risk non-compliance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



