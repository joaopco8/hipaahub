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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#f3f5f9] mb-4 rounded-none">
              <Users className="h-10 w-10 text-[#00bceb]" />
            </div>
            <h1 className="text-3xl font-thin text-[#0e274e]">
              Do you have employees?
            </h1>
            <p className="text-lg text-[#565656] font-light">
              HIPAA requires all staff members to complete training. You can add
              them now or later.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={handleSkip}
              className="border-gray-300 hover:bg-gray-50 rounded-none text-[#565656] font-light"
            >
              No employees / Skip for now
            </Button>
            <Button
              size="lg"
              onClick={() => setHasEmployees(true)}
              className="bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-bold"
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
          <h1 className="text-3xl font-thin text-[#0e274e]">Add Staff Members</h1>
          <p className="text-[#565656] font-light">
            Add employees who need HIPAA training. You can add more later.
          </p>
        </div>

        <Card className="card-premium-enter stagger-item rounded-none border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#0e274e] font-light">Add Staff Member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staff-email" className="text-[#0e274e] font-light">Email Address</Label>
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
                  className="rounded-none border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] font-light"
                />
                <Select
                  value={newStaffRole}
                  onValueChange={(value) =>
                    setNewStaffRole(value as 'staff' | 'admin')
                  }
                >
                  <SelectTrigger className="w-[140px] rounded-none border-gray-300 focus:border-[#00bceb] font-light">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="staff" className="font-light">Staff</SelectItem>
                    <SelectItem value="admin" className="font-light">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddStaff}
                  disabled={!newStaffEmail || !newStaffEmail.includes('@')}
                  className="bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {staff.length > 0 && (
          <Card className="card-premium-enter stagger-item rounded-none border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#0e274e] font-light">Staff Members ({staff.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {staff.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border border-gray-200 bg-white rounded-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#f3f5f9] rounded-none">
                        <Mail className="h-4 w-4 text-[#565656]" />
                      </div>
                      <div>
                        <div className="font-light text-[#0e274e]">
                          {member.email}
                        </div>
                        <Badge
                          className={
                            member.role === 'admin'
                              ? 'bg-[#00bceb]/10 text-[#00bceb] border-[#00bceb]/20 rounded-none font-light'
                              : 'bg-gray-100 text-[#565656] border-gray-200 rounded-none font-light'
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
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-none font-light"
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
          <Card className="card-premium-enter stagger-item border-dashed border-gray-300 rounded-none shadow-none bg-transparent">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-[#565656] font-light">
                No staff members added yet. You can add them later from the
                dashboard.
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="card-premium-enter stagger-item bg-[#f3f5f9] border border-gray-200 rounded-none shadow-none">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-[#00bceb] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-light text-[#0e274e] mb-1">
                  What happens next?
                </h4>
                <p className="text-sm text-[#565656] font-light">
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
