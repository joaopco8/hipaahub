'use client';

import { useState, useTransition } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Plus, Clock, AlertTriangle, CheckCircle2, ChevronRight,
  MessageSquare, Calendar, User, ArrowRight, Trash2, RefreshCw, Edit, XCircle,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';
import {
  createMitigationItem, updateMitigationItem, deleteMitigationItem,
  addComment, type MitigationItem, type MitigationStatus,
  type MitigationPriority, type MitigationComment,
} from '@/app/actions/mitigation';
import { toast } from 'sonner';

interface Props {
  initialItems: MitigationItem[];
  mitigationStats: { open: number; in_progress: number; done: number; overdue: number };
}

const PRIORITY_CONFIG: Record<MitigationPriority, { label: string; cls: string }> = {
  high:   { label: 'High',   cls: 'bg-red-50   text-red-600   border-red-200'   },
  medium: { label: 'Medium', cls: 'bg-amber-50  text-amber-600 border-amber-200' },
  low:    { label: 'Low',    cls: 'bg-gray-50   text-gray-500  border-gray-200'  },
};

const STATUS_COLUMNS: { status: MitigationStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { status: 'open',        label: 'Open',        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,   color: 'border-t-red-400'   },
  { status: 'in_progress', label: 'In Progress', icon: <Clock className="h-4 w-4 text-amber-500" />,         color: 'border-t-amber-400' },
  { status: 'done',        label: 'Done',        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,  color: 'border-t-green-400' },
];

// ─── New Item Form ────────────────────────────────────────────────────────────

function NewItemModal({ open, onClose, onSuccess }: {
  open: boolean; onClose: () => void; onSuccess: (item: MitigationItem) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium' as MitigationPriority, due_date: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const item = await createMitigationItem(form);
        toast.success('Mitigation item created');
        onSuccess(item);
        onClose();
        setForm({ title: '', description: '', priority: 'medium', due_date: '' });
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to create item');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white border-gray-200 rounded-none">
        <DialogHeader>
          <DialogTitle className="text-[#0e274e] font-light">New Mitigation Item</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 font-light">
            Create a new compliance mitigation task
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-xs text-[#0e274e] font-light">Title *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="rounded-none" placeholder="e.g. Implement MFA on EHR system" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-[#0e274e] font-light">Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="rounded-none font-light text-sm" placeholder="Steps to resolve, references, notes..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-[#0e274e] font-light">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as MitigationPriority })}>
                <SelectTrigger className="rounded-none h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[#0e274e] font-light">Due Date</Label>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="rounded-none h-9" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-none">Cancel</Button>
            <Button type="submit" disabled={pending} className="bg-[#00bceb] text-white hover:bg-[#00a8d4] rounded-none">
              {pending ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Item Detail Panel ────────────────────────────────────────────────────────

function ItemDetailPanel({ item, comments, onClose, onUpdate, onDelete }: {
  item: MitigationItem;
  comments: MitigationComment[];
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<MitigationItem>) => void;
  onDelete: (id: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState(comments);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editDesc, setEditDesc] = useState(item.description ?? '');
  const [localDueDate, setLocalDueDate] = useState(item.due_date?.split('T')[0] ?? '');

  const handleStatusChange = (status: MitigationStatus) => {
    startTransition(async () => {
      try {
        await updateMitigationItem(item.id, { status });
        onUpdate(item.id, { status });
        toast.success(`Moved to ${status.replace('_', ' ')}`);
      } catch (err: any) { toast.error(err.message); }
    });
  };

  const handlePriorityChange = (priority: MitigationPriority) => {
    startTransition(async () => {
      try {
        await updateMitigationItem(item.id, { priority });
        onUpdate(item.id, { priority });
      } catch (err: any) { toast.error(err.message); }
    });
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalDueDate(val);
    startTransition(async () => {
      try {
        await updateMitigationItem(item.id, { due_date: val || null });
        onUpdate(item.id, { due_date: val || null });
      } catch (err: any) { toast.error(err.message); }
    });
  };

  const handleAssignToMe = () => {
    startTransition(async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await updateMitigationItem(item.id, { assignee_id: user.id });
        onUpdate(item.id, {
          assignee_id: user.id,
          assignee: { id: user.id, email: user.email ?? '', full_name: user.user_metadata?.full_name ?? null },
        });
        toast.success('Assigned to you');
      } catch (err: any) { toast.error(err.message); }
    });
  };

  const handleUnassign = () => {
    startTransition(async () => {
      try {
        await updateMitigationItem(item.id, { assignee_id: null });
        onUpdate(item.id, { assignee_id: null, assignee: null });
        toast.success('Assignee removed');
      } catch (err: any) { toast.error(err.message); }
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    startTransition(async () => {
      try {
        await addComment(item.id, newComment.trim());
        setLocalComments([...localComments, {
          id: Date.now().toString(), item_id: item.id, user_id: '', comment: newComment.trim(),
          created_at: new Date().toISOString(),
        }]);
        setNewComment('');
        toast.success('Comment added');
      } catch (err: any) { toast.error(err.message); }
    });
  };

  const isOverdue = item.due_date && item.status !== 'done' && new Date(item.due_date) < new Date();

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Badge className={`${PRIORITY_CONFIG[item.priority].cls} rounded-none text-xs border`}>
            {PRIORITY_CONFIG[item.priority].label}
          </Badge>
          <span className="text-xs text-gray-400 font-light capitalize">{item.source.replace('_', ' ')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-red-400 hover:text-red-600 rounded-none"
            onClick={() => { if (confirm('Delete this item?')) { onDelete(item.id); onClose(); } }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose} className="h-7 w-7 p-0 rounded-none text-gray-400">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Title */}
        <div>
          <h2 className="text-lg font-light text-[#0e274e] mb-1">{item.title}</h2>
          {item.description && (
            <p className="text-sm text-gray-500 font-light leading-relaxed">{item.description}</p>
          )}
        </div>

        {/* Meta fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-gray-400">Status</Label>
            <Select value={item.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="rounded-none h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="ignored">Ignored</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-400">Priority</Label>
            <Select value={item.priority} onValueChange={handlePriorityChange}>
              <SelectTrigger className="rounded-none h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-400">Due Date</Label>
            <Input
              type="date"
              value={localDueDate}
              onChange={handleDueDateChange}
              className="rounded-none h-8 text-xs"
            />
            {isOverdue && <p className="text-xs text-red-500 mt-0.5">Overdue</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-400">Assignee</Label>
            {item.assignee ? (
              <div className="flex items-center gap-2 h-8 px-2 border border-gray-200 bg-gray-50">
                <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
                <span className="text-xs text-[#0e274e] flex-1 truncate">
                  {item.assignee.full_name?.split(' ')[0] ?? item.assignee.email.split('@')[0]}
                </span>
                <button
                  type="button"
                  onClick={handleUnassign}
                  className="text-gray-300 hover:text-red-400 flex-shrink-0"
                >
                  <XCircle className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleAssignToMe}
                disabled={pending}
                className="rounded-none h-8 text-xs w-full border-gray-200"
              >
                <User className="h-3 w-3 mr-1" />
                Assign to me
              </Button>
            )}
          </div>
        </div>

        {/* Created at */}
        <div className="flex items-center gap-1 text-xs text-gray-400 font-light">
          <Calendar className="h-3 w-3" />
          Created {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </div>

        {/* Comments */}
        <div>
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
            Comments ({localComments.length})
          </h4>
          <div className="space-y-3 mb-4">
            {localComments.map((c) => (
              <div key={c.id} className="bg-gray-50 p-3 rounded-none">
                <p className="text-sm text-[#0e274e] font-light">{c.comment}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </p>
              </div>
            ))}
            {localComments.length === 0 && (
              <p className="text-xs text-gray-400 font-light">No comments yet</p>
            )}
          </div>
          <form onSubmit={handleAddComment} className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment…"
              className="rounded-none text-sm"
            />
            <Button type="submit" disabled={pending || !newComment.trim()} size="sm" className="bg-[#00bceb] text-white hover:bg-[#00a8d4] rounded-none h-9">
              <MessageSquare className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────

function KanbanCard({ item, onClick }: { item: MitigationItem; onClick: () => void }) {
  const isOverdue = item.due_date && item.status !== 'done' && new Date(item.due_date) < new Date();
  const daysLeft = item.due_date
    ? Math.ceil((new Date(item.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div
      className="bg-white border border-gray-100 p-4 hover:shadow-sm transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-light text-[#0e274e] leading-snug">{item.title}</p>
        <Badge className={`${PRIORITY_CONFIG[item.priority].cls} rounded-none text-xs border flex-shrink-0`}>
          {PRIORITY_CONFIG[item.priority].label}
        </Badge>
      </div>
      {item.description && (
        <p className="text-xs text-gray-400 font-light line-clamp-2 mb-2">{item.description}</p>
      )}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          {item.comments_count ? (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MessageSquare className="h-3 w-3" />{item.comments_count}
            </span>
          ) : null}
          {item.assignee && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <User className="h-3 w-3" />
              {item.assignee.full_name?.split(' ')[0] ?? item.assignee.email.split('@')[0]}
            </span>
          )}
        </div>
        {daysLeft !== null && (
          <span className={`text-xs font-light ${
            isOverdue ? 'text-red-500' : daysLeft <= 7 ? 'text-amber-500' : 'text-gray-400'
          }`}>
            {isOverdue
              ? `${Math.abs(daysLeft)}d overdue`
              : daysLeft === 0 ? 'Due today'
              : `${daysLeft}d left`}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main Board ───────────────────────────────────────────────────────────────

export default function MitigationBoard({ initialItems, mitigationStats }: Props) {
  const [items, setItems] = useState(initialItems);
  const [stats, setStats] = useState(mitigationStats);
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MitigationItem | null>(null);
  const [selectedComments, setSelectedComments] = useState<MitigationComment[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, startTransition] = useTransition();

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/mitigation/overview', { cache: 'no-store' });
      if (res.ok) {
        const d = await res.json();
        setItems(d.items ?? items);
        setStats(d.stats ?? stats);
      }
    } catch { /* silent */ }
    finally { setIsRefreshing(false); }
  };

  const handleItemClick = async (item: MitigationItem) => {
    setSelectedItem(item);
    // Fetch comments
    try {
      const res = await fetch(`/api/mitigation/comments?id=${item.id}`);
      if (res.ok) setSelectedComments(await res.json());
    } catch { /* silent */ }
  };

  const handleUpdate = (id: string, patch: Partial<MitigationItem>) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...patch } : i));
    if (selectedItem?.id === id) setSelectedItem((prev) => prev ? { ...prev, ...patch } : null);
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteMitigationItem(id);
        setItems((prev) => prev.filter((i) => i.id !== id));
        toast.success('Item deleted');
      } catch (err: any) { toast.error(err.message); }
    });
  };

  const visibleItems = items.filter((i) => i.status !== 'ignored');

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {[
            { label: 'Open', value: stats.open, cls: 'text-red-600' },
            { label: 'In Progress', value: stats.in_progress, cls: 'text-amber-600' },
            { label: 'Done', value: stats.done, cls: 'text-green-600' },
            { label: 'Overdue', value: stats.overdue, cls: 'text-red-700 font-medium' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className={`text-xl font-light ${s.cls}`}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={refresh} disabled={isRefreshing} className="h-8 w-8 p-0 rounded-none text-gray-400">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="sm" onClick={() => setNewItemOpen(true)} className="bg-[#00bceb] text-white hover:bg-[#00a8d4] rounded-none text-xs h-8">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Item
          </Button>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid md:grid-cols-3 gap-4">
        {STATUS_COLUMNS.map((col) => {
          const colItems = visibleItems.filter((i) => i.status === col.status);
          return (
            <div key={col.status} className={`border-t-2 ${col.color} pt-3`}>
              <div className="flex items-center gap-2 mb-3">
                {col.icon}
                <span className="text-sm font-medium text-[#0e274e]">{col.label}</span>
                <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {colItems.length}
                </span>
              </div>
              <div className="space-y-2">
                {colItems.map((item) => (
                  <KanbanCard key={item.id} item={item} onClick={() => handleItemClick(item)} />
                ))}
                {colItems.length === 0 && (
                  <div className="border border-dashed border-gray-200 p-4 text-center">
                    <p className="text-xs text-gray-400 font-light">No items</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals & Panels */}
      <NewItemModal
        open={newItemOpen}
        onClose={() => setNewItemOpen(false)}
        onSuccess={(item) => { setItems((prev) => [item, ...prev]); refresh(); }}
      />

      {selectedItem && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedItem(null)} />
          <ItemDetailPanel
            item={selectedItem}
            comments={selectedComments}
            onClose={() => setSelectedItem(null)}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
}
