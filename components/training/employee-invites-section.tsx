'use client';

// Client component: Employee Invites table with "Add Employee" button and live refresh

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UserPlus,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Mail,
  Shield,
} from 'lucide-react';
import AddEmployeeModal from './add-employee-modal';
import type { EmployeeInvite } from '@/app/actions/training';

interface EmployeeInvitesSectionProps {
  initialInvites: EmployeeInvite[];
  initialStats: {
    total: number;
    completed: number;
    pending: number;
    expired: number;
    compliancePercent: number;
  };
}

export default function EmployeeInvitesSection({
  initialInvites,
  initialStats,
}: EmployeeInvitesSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invites, setInvites] = useState<EmployeeInvite[]>(initialInvites);
  const [stats, setStats] = useState(initialStats);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/training/invites-list', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setInvites(data.invites || []);
        setStats(data.stats || initialStats);
      }
    } catch {
      // silent - show stale data
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleInviteSuccess = () => {
    // Refresh after a short delay to let DB propagate
    setTimeout(refreshData, 800);
  };

  const statusBadge = (status: string, tokenExpiresAt: string) => {
    const isExpired = new Date(tokenExpiresAt) < new Date() && status !== 'completed';
    if (isExpired || status === 'expired') {
      return (
        <Badge className="bg-red-50 text-red-600 border-0 rounded-none font-normal px-2 text-xs">
          Expired
        </Badge>
      );
    }
    if (status === 'completed') {
      return (
        <Badge className="bg-[#1ad07a]/10 text-[#1ad07a] border-0 rounded-none font-normal px-2 text-xs">
          Completed
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-50 text-yellow-600 border-0 rounded-none font-normal px-2 text-xs">
        Pending
      </Badge>
    );
  };

  return (
    <>
      {/* Employee Compliance Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Total</p>
                <p className="text-2xl font-light text-[#0e274e]">{stats.total}</p>
              </div>
              <div className="h-9 w-9 rounded-full border-2 border-gray-300 flex items-center justify-center">
                <Users className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Completed</p>
                <p className="text-2xl font-light text-[#0e274e]">{stats.completed}</p>
              </div>
              <div className="h-9 w-9 rounded-full border-2 border-[#1ad07a] flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-[#1ad07a]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Pending</p>
                <p className="text-2xl font-light text-[#0e274e]">{stats.pending}</p>
              </div>
              <div className="h-9 w-9 rounded-full border-2 border-yellow-500 flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Compliant</p>
                <p className="text-2xl font-light text-[#0e274e]">{stats.compliancePercent}%</p>
              </div>
              <div className="h-9 w-9 rounded-full border-2 border-[#0c0b1d] flex items-center justify-center">
                <Shield className="h-4 w-4 text-[#0c0b1d]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Table Card */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardHeader className="border-b border-gray-100 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-light text-[#0e274e]">
                Employee Training Compliance
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                HIPAA Awareness Training invites sent to staff members.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshData}
                disabled={isRefreshing}
                className="h-8 w-8 p-0 rounded-none text-gray-400 hover:text-[#0e274e]"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="rounded-none bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90 font-medium h-8 px-3 text-xs"
              >
                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                Add Employee
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {invites.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Mail className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-base font-light text-[#0e274e] mb-2">
                No employees invited yet
              </h3>
              <p className="text-sm text-gray-400 font-light mb-5 max-w-sm mx-auto">
                Add your staff members and send them a HIPAA training link. They complete it
                without creating an account.
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="rounded-none bg-[#0e274e] text-white hover:bg-[#0e274e]/90 font-medium h-9"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add First Employee
              </Button>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-2 bg-[#f3f5f9] border-b border-gray-100">
                <span className="text-xs text-gray-400 font-light">Name</span>
                <span className="text-xs text-gray-400 font-light">Role</span>
                <span className="text-xs text-gray-400 font-light">Status</span>
                <span className="text-xs text-gray-400 font-light">Completed</span>
                <span className="text-xs text-gray-400 font-light">Score</span>
              </div>

              <div className="divide-y divide-gray-100">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 md:gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    {/* Name + email */}
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#0c0b1d] flex items-center justify-center shrink-0">
                        <span className="text-xs font-light text-white">
                          {invite.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#0e274e] truncate">{invite.name}</p>
                        <p className="text-xs text-gray-400 font-light truncate">{invite.email}</p>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="flex flex-col gap-0.5 justify-center">
                      <span className="text-xs text-gray-500 font-light">{invite.role_title}</span>
                      {invite.role_group && (
                        <span className="text-xs text-[#00bceb] capitalize">{invite.role_group}</span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center">
                      {statusBadge(invite.status, invite.token_expires_at)}
                    </div>

                    {/* Completed date */}
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400 font-light">
                        {invite.completed_at
                          ? new Date(invite.completed_at).toLocaleDateString()
                          : '—'}
                      </span>
                    </div>

                    {/* Quiz score */}
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400 font-light">
                        {invite.quiz_score !== null && invite.quiz_score !== undefined
                          ? `${invite.quiz_score}%`
                          : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AddEmployeeModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleInviteSuccess}
      />
    </>
  );
}
