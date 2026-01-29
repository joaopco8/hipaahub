import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, UserPlus, CheckCircle2, Clock, AlertCircle, BookOpen, Download, AlertTriangle, FileText } from 'lucide-react';
import Link from 'next/link';
import { getTrainingRecords, getTrainingStats } from '@/app/actions/training';
import TrainingExportButton from '@/components/training/training-export-button';

export default async function TrainingPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  // Get real training data
  let trainingRecords: any[] = [];
  let stats = { completed: 0, expired: 0, pending: 0, total: 0 };

  try {
    trainingRecords = await getTrainingRecords();
    stats = await getTrainingStats();
  } catch (error) {
    console.error('Error fetching training data:', error);
  }

  // Check for expiring trainings (within 30 days)
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringSoon = trainingRecords.filter(record => {
    if (record.completion_status !== 'completed') return false;
    const expDate = new Date(record.expiration_date);
    return expDate > now && expDate <= thirtyDaysFromNow;
  });

  // Check if user has completed training
  const hasCompletedTraining = trainingRecords.some(
    r => r.completion_status === 'completed' && new Date(r.expiration_date) > now
  );

  return (
    <div className="flex w-full flex-col gap-6 page-transition-premium">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Training & Employees</h1>
          <p className="text-zinc-600 text-base">
            Manage HIPAA training for all staff members
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <TrainingExportButton />
          <Link href="/dashboard/training/take">
            <Button variant={hasCompletedTraining ? "outline" : "default"}>
              <BookOpen className="mr-2 h-4 w-4" />
              {hasCompletedTraining ? "Retake Training" : "Start Training"}
            </Button>
          </Link>
        </div>
      </div>

      {expiringSoon.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200 card-premium-enter stagger-item">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-lg text-yellow-900">Training Expiring Soon</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-900 mb-2">
              {expiringSoon.length} training record{expiringSoon.length > 1 ? 's' : ''} will expire within 30 days:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-900">
              {expiringSoon.slice(0, 5).map((record) => (
                <li key={record.id}>
                  {record.full_name} - Expires {new Date(record.expiration_date).toLocaleDateString()}
                </li>
              ))}
            </ul>
            {expiringSoon.length > 5 && (
              <p className="text-sm text-yellow-900 mt-2">
                And {expiringSoon.length - 5} more...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-premium-enter stagger-item">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">Employees trained</p>
          </CardContent>
        </Card>
        <Card className="card-premium-enter stagger-item" style={{ animationDelay: '50ms' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Need training</p>
          </CardContent>
        </Card>
        <Card className="card-premium-enter stagger-item" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            <p className="text-xs text-muted-foreground mt-1">Need renewal</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employee Training Records</CardTitle>
              <CardDescription>
                HIPAA requires all staff handling PHI to complete annual training. Records must be retained for 6 years.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {trainingRecords.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">No Training Records Yet</h3>
              <p className="text-zinc-600 mb-4">
                Start by completing HIPAA training to create your first training record.
              </p>
              <Link href="/dashboard/training/take">
                <Button>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Start Training
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {trainingRecords.map((record) => {
                const expDate = new Date(record.expiration_date);
                const isExpired = expDate <= now;
                const isExpiringSoon = expDate > now && expDate <= thirtyDaysFromNow;
                const isCurrent = record.completion_status === 'completed' && !isExpired;

                return (
                  <Card key={record.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4">
                        {/* Header: Employee Info and Status */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <GraduationCap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-zinc-900">{record.full_name}</div>
                              <div className="text-sm text-muted-foreground mt-0.5">
                                {record.email} • {record.role_title}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {isCurrent && (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Current
                              </Badge>
                            )}
                            {record.completion_status === 'pending' && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                            {isExpired && (
                              <Badge className="bg-red-100 text-red-800 border-red-200">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Expired
                              </Badge>
                            )}
                            {isExpiringSoon && !isExpired && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Expiring Soon
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Training Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <div>
                            <strong className="text-zinc-700">Training Type:</strong> {record.training_type.charAt(0).toUpperCase() + record.training_type.slice(1)}
                          </div>
                          <div>
                            <strong className="text-zinc-700">Completed:</strong> {new Date(record.training_date).toLocaleDateString()}
                          </div>
                          <div>
                            <strong className="text-zinc-700">Expires:</strong> {expDate.toLocaleDateString()}
                          </div>
                          {record.quiz_score !== null && (
                            <div>
                              <strong className="text-zinc-700">Quiz Score:</strong> {record.quiz_score}%
                            </div>
                          )}
                          {record.acknowledgement_ip && (
                            <div>
                              <strong className="text-zinc-700">IP Address:</strong> <span className="font-mono text-xs">{record.acknowledgement_ip}</span>
                            </div>
                          )}
                          <div className="sm:col-span-2 lg:col-span-1">
                            <strong className="text-zinc-700">Recorded:</strong> {new Date(record.record_timestamp).toLocaleString()}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                          {record.completion_status === 'completed' && (
                            <Link href={`/dashboard/training/${record.id}/evidence`}>
                              <Button size="sm" variant="outline" className="h-9">
                                <FileText className="mr-2 h-4 w-4" />
                                View Evidence
                              </Button>
                            </Link>
                          )}
                          {isExpired && (
                            <Link href="/dashboard/training/take">
                              <Button size="sm" className="h-9">
                                Renew Training
                              </Button>
                            </Link>
                          )}
                          {record.completion_status === 'pending' && (
                            <Link href="/dashboard/training/take">
                              <Button size="sm" className="h-9">
                                Complete Training
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Training Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            HIPAA requires that all workforce members who have access to PHI receive training on:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>What is PHI / ePHI</li>
            <li>Minimum Necessary Rule</li>
            <li>Access controls & passwords</li>
            <li>Email & communication security</li>
            <li>Incident & breach reporting</li>
            <li>Sanctions for violations</li>
            <li>Privacy rights of patients</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            <strong>Training Schedule:</strong> Initial training must be completed before or immediately after 
            access to PHI. Ongoing training is required at least annually. Training records must be documented 
            and retained for 6 years as evidence of compliance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
