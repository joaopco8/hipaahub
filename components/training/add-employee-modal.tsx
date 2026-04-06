'use client';

// Modal for inviting an employee to complete HIPAA training
// Admin fills in name, email, role → system sends invite email with unique token

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserPlus, Mail, Loader2, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface InviteResult {
  success: boolean;
  invite_id: string;
  training_url: string;
  warning?: string;
}

export default function AddEmployeeModal({ open, onClose, onSuccess }: AddEmployeeModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [roleGroup, setRoleGroup] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);

  const resetForm = () => {
    setName('');
    setEmail('');
    setRoleTitle('');
    setRoleGroup('');
    setInviteResult(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !roleTitle.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/training/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          role_title: roleTitle.trim(),
          role_group: roleGroup || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite');
      }

      setInviteResult(data);

      if (data.warning) {
        toast.warning('Invite created but email not sent. Share the link manually.');
      } else {
        toast.success(`Training invite sent to ${email.trim()}`);
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invite. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = async () => {
    if (!inviteResult?.training_url) return;
    await navigator.clipboard.writeText(inviteResult.training_url);
    toast.success('Training link copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md rounded-none border-0 shadow-lg p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#0c0b1d] flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-[#1ad07a]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-light text-[#0e274e]">
                Add Employee
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 font-light mt-0.5">
                Send a HIPAA training invite by email
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Success state */}
        {inviteResult ? (
          <div className="px-6 py-6 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-[#1ad07a] shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#0e274e]">
                  {inviteResult.warning ? 'Invite created' : 'Invite sent successfully'}
                </p>
                <p className="text-xs text-gray-400 font-light">{name} · {email}</p>
              </div>
            </div>

            {inviteResult.warning && (
              <div className="bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs text-amber-800 font-light">{inviteResult.warning}</p>
              </div>
            )}

            <div className="bg-[#f3f5f9] p-3 space-y-2">
              <p className="text-xs text-gray-400 font-light">Training Link</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-[#0e274e] font-mono truncate flex-1">
                  {inviteResult.training_url}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyLink}
                  className="h-7 w-7 p-0 shrink-0 rounded-none text-gray-400 hover:text-[#1ad07a]"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <a
                  href={inviteResult.training_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 shrink-0 rounded-none text-gray-400 hover:text-[#1ad07a]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-none border-gray-200 text-gray-600 font-light h-9"
                onClick={() => {
                  resetForm();
                }}
              >
                Add Another
              </Button>
              <Button
                className="flex-1 rounded-none bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90 font-medium h-9"
                onClick={handleClose}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* Form state */
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emp-name" className="text-sm font-light text-[#0e274e]">
                Full Name *
              </Label>
              <Input
                id="emp-name"
                type="text"
                placeholder="e.g., Sarah Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 border-gray-200 focus:border-[#1ad07a] rounded-none font-light"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emp-email" className="text-sm font-light text-[#0e274e]">
                Email Address *
              </Label>
              <Input
                id="emp-email"
                type="email"
                placeholder="sarah.johnson@yourclinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 border-gray-200 focus:border-[#1ad07a] rounded-none font-light"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emp-role" className="text-sm font-light text-[#0e274e]">
                Job Role / Title *
              </Label>
              <Input
                id="emp-role"
                type="text"
                placeholder="e.g., Medical Assistant, Front Desk, Nurse"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="h-10 border-gray-200 focus:border-[#1ad07a] rounded-none font-light"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-light text-[#0e274e]">
                Role Group <span className="text-gray-400">(optional)</span>
              </Label>
              <Select value={roleGroup} onValueChange={setRoleGroup} disabled={isSubmitting}>
                <SelectTrigger className="h-10 border-gray-200 rounded-none font-light">
                  <SelectValue placeholder="Select role group…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clinical">Clinical</SelectItem>
                  <SelectItem value="admin">Administrative</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-[#f3f5f9] p-3 flex items-start gap-2">
              <Mail className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400 font-light">
                An email with a unique training link will be sent to the employee. They can complete the
                training without creating an account.
              </p>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="rounded-none border-gray-200 text-gray-600 font-light h-9"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90 rounded-none font-medium h-9"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invite
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
