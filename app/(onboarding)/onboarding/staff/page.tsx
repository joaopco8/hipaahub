'use client';

import { useState } from 'react';
import { useOnboarding } from '@/contexts/onboarding-context';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { saveStaffMembers } from '@/app/actions/onboarding';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Users, Plus, X, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StaffMember {
  id: string;
  email: string;
  role: 'staff' | 'admin';
}

export default function StaffPage() {
  const { nextStep, markStepComplete, state } = useOnboarding();
  const router = useRouter();
  const [hasEmployees, setHasEmployees] = useState<boolean | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'staff' | 'admin'>('staff');

  const handleAddStaff = () => {
    if (!newStaffEmail || !newStaffEmail.includes('@')) {
      return;
    }

    const newStaff: StaffMember = {
      id: Date.now().toString(),
      email: newStaffEmail,
      role: newStaffRole
    };

    setStaff([...staff, newStaff]);
    setNewStaffEmail('');
    setNewStaffRole('staff');
  };

  const handleRemoveStaff = (id: string) => {
    setStaff(staff.filter((s) => s.id !== id));
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      // Save staff members to database
      await saveStaffMembers(
        staff.map(m => ({ email: m.email, role: m.role }))
      );
      markStepComplete(8);
      router.push('/onboarding/commitment');
    } catch (error) {
      console.error('Error saving staff members:', error);
      alert('Failed to save staff members. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = async () => {
    setIsSaving(true);
    try {
      // Save empty staff list
      await saveStaffMembers([]);
      markStepComplete(8);
      router.push('/onboarding/commitment');
    } catch (error) {
      console.error('Error saving staff members:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (hasEmployees === null) {
    return (
      <OnboardingLayout
        onNext={() => setHasEmployees(true)}
        nextButtonLabel="Yes, I have employees"
        showBackButton={false}
      >
        <div className="space-y-6 max-w-2xl mx-auto w-full">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-100 mb-4">
              <Users className="h-10 w-10 text-zinc-600" />
            </div>
            <h1 className="text-3xl font-extralight text-zinc-900">
              Do you have employees?
            </h1>
            <p className="text-lg text-zinc-600">
              HIPAA requires all staff members to complete training. You can add
              them now or later.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={handleSkip}
              className="border-zinc-300 hover:bg-zinc-50"
            >
              No employees / Skip for now
            </Button>
            <Button
              size="lg"
              onClick={() => setHasEmployees(true)}
              className="bg-[#1ad07a] text-[#0d1122] hover:bg-[#1ad07a]/90"
            >
              Yes, add employees
            </Button>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      onNext={handleContinue}
      nextButtonLabel={isSaving ? 'Saving...' : 'Complete Setup'}
      showBackButton={true}
      onBack={() => setHasEmployees(null)}
      nextButtonDisabled={isSaving}
    >
      <div className="space-y-6 max-w-2xl mx-auto w-full">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extralight text-zinc-900">Add Staff Members</h1>
          <p className="text-zinc-600">
            Add employees who need HIPAA training. You can add more later.
          </p>
        </div>

        <Card className="card-premium-enter stagger-item">
          <CardHeader>
            <CardTitle>Add Staff Member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staff-email">Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="staff-email"
                  type="email"
                  placeholder="employee@example.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddStaff();
                    }
                  }}
                />
                <Select
                  value={newStaffRole}
                  onValueChange={(value) =>
                    setNewStaffRole(value as 'staff' | 'admin')
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddStaff}
                  disabled={!newStaffEmail || !newStaffEmail.includes('@')}
                  className="bg-[#1ad07a] text-[#0d1122] hover:bg-[#1ad07a]/90"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {staff.length > 0 && (
          <Card className="card-premium-enter stagger-item">
            <CardHeader>
              <CardTitle>Staff Members ({staff.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {staff.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-zinc-100">
                        <Mail className="h-4 w-4 text-zinc-600" />
                      </div>
                      <div>
                        <div className="font-extralight text-zinc-900">
                          {member.email}
                        </div>
                        <Badge
                          className={
                            member.role === 'admin'
                              ? 'bg-blue-100 text-blue-700 border-blue-200'
                              : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                          }
                        >
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStaff(member.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {staff.length === 0 && (
          <Card className="card-premium-enter stagger-item border-dashed">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <p className="text-zinc-600">
                No staff members added yet. You can add them later from the
                dashboard.
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="card-premium-enter stagger-item bg-zinc-50 border-zinc-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-zinc-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-extralight text-zinc-900 mb-1">
                  What happens next?
                </h4>
                <p className="text-sm text-zinc-600">
                  Staff members will receive an email invitation to complete
                  HIPAA training. You can track their progress from the
                  dashboard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}

