import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, BookOpen, CheckCircle2, Clock, AlertTriangle, FileText, AlertCircle } from 'lucide-react';
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
    <div className="flex w-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h2 className="text-2xl font-light text-[#0e274e]">Training & Employees</h2>
          <p className="text-sm text-gray-400 font-light">
            Manage HIPAA training for staff members
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <TrainingExportButton />
          <Link href="/dashboard/training/take">
            <Button variant={hasCompletedTraining ? "outline" : "default"} className={`rounded-none font-light h-9 ${!hasCompletedTraining ? 'bg-[#00bceb] hover:bg-[#00bceb]/90 text-white border-0' : 'border-gray-200 text-gray-600'}`}>
              <BookOpen className="mr-2 h-4 w-4" />
              {hasCompletedTraining ? "Retake Training" : "Start Training"}
            </Button>
          </Link>
        </div>
      </div>

      {expiringSoon.length > 0 && (
        <Card className="bg-yellow-50 border-0 rounded-none shadow-sm">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900">Training Expiring Soon</h4>
              <p className="text-sm text-yellow-800 mt-1">
                {expiringSoon.length} record{expiringSoon.length > 1 ? 's' : ''} expiring within 30 days.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards - Cisco Style */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1 uppercase tracking-wide">Completed</p>
                <p className="text-3xl font-light text-[#0e274e]">{stats.completed}</p>
              </div>
              <div className="h-10 w-10 rounded-full border-2 border-[#71bc48] flex items-center justify-center">
                 <CheckCircle2 className="h-5 w-5 text-[#71bc48]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1 uppercase tracking-wide">Pending</p>
                <p className="text-3xl font-light text-[#0e274e]">{stats.pending}</p>
              </div>
              <div className="h-10 w-10 rounded-full border-2 border-yellow-500 flex items-center justify-center">
                 <Clock className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1 uppercase tracking-wide">Expired</p>
                <p className="text-3xl font-light text-[#0e274e]">{stats.expired}</p>
              </div>
              <div className="h-10 w-10 rounded-full border-2 border-red-500 flex items-center justify-center">
                 <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Records List */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardHeader className="border-b border-gray-100 py-4">
          <CardTitle className="text-lg font-light text-[#0e274e]">Employee Training Records</CardTitle>
          <CardDescription className="text-xs text-gray-400">
            Annual HIPAA training records for all staff members.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {trainingRecords.length === 0 ? (
            <div className="text-center py-12 px-6">
              <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-light text-[#0e274e] mb-2">No Training Records</h3>
              <p className="text-gray-400 font-light mb-4">
                Start by completing your own training to generate the first record.
              </p>
              <Link href="/dashboard/training/take">
                <Button className="rounded-none bg-[#00bceb] hover:bg-[#00bceb]/90 text-white font-light">
                  Start Training
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {trainingRecords.map((record) => {
                const expDate = new Date(record.expiration_date);
                const isExpired = expDate <= now;
                const isCurrent = record.completion_status === 'completed' && !isExpired;

                return (
                  <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* User Info */}
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-[#565656]">
                           <span className="font-light text-sm">{record.full_name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-[#0e274e] text-sm">{record.full_name}</p>
                          <p className="text-xs text-gray-400">{record.role_title || 'Staff Member'}</p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isCurrent && (
                          <Badge className="bg-[#71bc48]/10 text-[#71bc48] border-0 rounded-none font-normal px-2">
                            Current
                          </Badge>
                        )}
                        {record.completion_status === 'pending' && (
                          <Badge className="bg-yellow-50 text-yellow-600 border-0 rounded-none font-normal px-2">
                            Pending
                          </Badge>
                        )}
                        {isExpired && (
                          <Badge className="bg-red-50 text-red-600 border-0 rounded-none font-normal px-2">
                            Expired
                          </Badge>
                        )}
                      </div>

                      {/* Details */}
                      <div className="text-xs text-[#565656] font-light sm:text-right">
                        <p>Expires: {expDate.toLocaleDateString()}</p>
                        {record.quiz_score && <p>Score: {record.quiz_score}%</p>}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                         {record.completion_status === 'completed' && (
                            <Link href={`/dashboard/training/${record.id}/evidence`}>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-none text-gray-400 hover:text-[#00bceb]">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </Link>
                         )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
