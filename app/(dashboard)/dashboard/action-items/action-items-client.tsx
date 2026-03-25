'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle2, Clock, Info, FileText, Shield, Users, Lock,
  AlertCircle, EyeOff, MessageSquare, Send, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import {
  updateActionItemStatus,
  addActionItemComment,
  deleteActionItemComment,
} from '@/app/actions/action-items';
import { useRouter } from 'next/navigation';

interface ActionItem {
  id: string;
  item_key: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium';
  category: string;
  status: 'pending' | 'in-progress' | 'completed' | 'ignored';
  completed_at: string | null;
  created_at: string;
  comments?: Comment[];
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface ActionItemsClientProps {
  initialItems: ActionItem[];
  currentUserId?: string;
}

export function ActionItemsClient({ initialItems, currentUserId }: ActionItemsClientProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-50 text-red-600 border-red-200';
      case 'high':     return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'medium':   return 'bg-[#00bceb]/10 text-[#00bceb] border-[#00bceb]/20';
      default:         return 'bg-[#f3f5f9] text-[#565656] border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Policies':        return <FileText className="h-5 w-5" />;
      case 'Security':        return <Shield className="h-5 w-5" />;
      case 'Training':        return <Users className="h-5 w-5" />;
      case 'Contracts':       return <FileText className="h-5 w-5" />;
      case 'Administrative':  return <AlertCircle className="h-5 w-5" />;
      default:                return <Info className="h-5 w-5" />;
    }
  };

  const handleStatusUpdate = async (itemId: string, newStatus: 'pending' | 'in-progress' | 'completed' | 'ignored') => {
    setUpdatingId(itemId);
    try {
      await updateActionItemStatus(itemId, newStatus);
      setItems(items.map(item =>
        item.id === itemId
          ? { ...item, status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null }
          : item
      ));
      router.refresh();
    } catch (error) {
      console.error('Error updating action item:', error);
      alert('Failed to update action item. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleComments = (itemId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const handleAddComment = async (itemId: string) => {
    const text = commentText[itemId]?.trim();
    if (!text) return;
    setSubmittingComment(itemId);
    try {
      await addActionItemComment(itemId, text);
      setCommentText(prev => ({ ...prev, [itemId]: '' }));
      // Optimistically add the comment
      setItems(items.map(item =>
        item.id === itemId
          ? {
              ...item,
              comments: [...(item.comments || []), {
                id: Date.now().toString(),
                content: text,
                created_at: new Date().toISOString(),
                user_id: currentUserId || '',
              }]
            }
          : item
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(null);
    }
  };

  const handleDeleteComment = async (itemId: string, commentId: string) => {
    try {
      await deleteActionItemComment(commentId);
      setItems(items.map(item =>
        item.id === itemId
          ? { ...item, comments: (item.comments || []).filter(c => c.id !== commentId) }
          : item
      ));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Filter items by status
  const pendingItems    = items.filter(item => item.status === 'pending');
  const inProgressItems = items.filter(item => item.status === 'in-progress');
  const completedItems  = items.filter(item => item.status === 'completed');
  const ignoredItems    = items.filter(item => item.status === 'ignored');

  const renderItem = (item: ActionItem) => {
    const isExpanded = expandedComments.has(item.id);
    const comments   = item.comments || [];

    return (
      <Card key={item.id} className={`border-0 shadow-sm bg-white rounded-none ${item.status === 'completed' || item.status === 'ignored' ? 'opacity-70' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-none bg-[#f3f5f9] text-[#565656] shrink-0">
              {getCategoryIcon(item.category)}
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-light text-[#0e274e] text-lg">{item.title}</h3>
                    <Badge className={`${getPriorityColor(item.priority)} border rounded-none font-light capitalize`}>
                      {item.priority}
                    </Badge>
                    {item.status === 'completed' && (
                      <Badge className="bg-[#71bc48]/10 text-[#71bc48] border-[#71bc48]/20 rounded-none font-light">
                        Completed
                      </Badge>
                    )}
                    {item.status === 'ignored' && (
                      <Badge className="bg-gray-100 text-gray-500 border-gray-200 rounded-none font-light">
                        Ignored
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-[#565656] font-light">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-[#565656] font-light">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>{item.category}</span>
                </div>
                {item.completed_at && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Completed {new Date(item.completed_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {item.status !== 'completed' && item.status !== 'ignored' && (
                <div className="flex gap-2 pt-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(item.id, 'in-progress')}
                    disabled={updatingId === item.id || item.status === 'in-progress'}
                    variant={item.status === 'in-progress' ? 'default' : 'outline'}
                    className={item.status === 'in-progress'
                      ? "bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-bold"
                      : "border-gray-300 text-[#565656] hover:bg-gray-50 rounded-none font-light"
                    }
                  >
                    {updatingId === item.id ? 'Updating...' : item.status === 'in-progress' ? 'In Progress' : 'Start Working'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(item.id, 'completed')}
                    disabled={updatingId === item.id}
                    className="bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-bold"
                  >
                    {updatingId === item.id ? 'Saving...' : 'Mark Complete'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(item.id, 'ignored')}
                    disabled={updatingId === item.id}
                    className="border-gray-300 text-gray-400 hover:bg-gray-50 rounded-none font-light"
                  >
                    <EyeOff className="h-3.5 w-3.5 mr-1" />
                    Ignore
                  </Button>
                  {item.category === 'Policies' && (
                    <Button size="sm" variant="outline" asChild className="border-gray-300 text-[#565656] hover:bg-gray-50 rounded-none font-light">
                      <Link href="/dashboard/policies">Go to Policies</Link>
                    </Button>
                  )}
                </div>
              )}

              {/* Restore from Ignored */}
              {item.status === 'ignored' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(item.id, 'pending')}
                    disabled={updatingId === item.id}
                    className="border-gray-300 text-[#565656] hover:bg-gray-50 rounded-none font-light"
                  >
                    Restore
                  </Button>
                </div>
              )}

              {/* Comments Section */}
              <div className="border-t border-gray-100 pt-3 mt-2">
                <button
                  onClick={() => toggleComments(item.id)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#00bceb] transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
                  {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                {isExpanded && (
                  <div className="mt-3 space-y-3">
                    {comments.map(comment => (
                      <div key={comment.id} className="flex items-start gap-2 group">
                        <div className="flex-1 bg-[#f3f5f9] rounded-none p-2.5">
                          <p className="text-sm text-[#0e274e] font-light">{comment.content}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {comment.user_id === currentUserId && (
                          <button
                            onClick={() => handleDeleteComment(item.id, comment.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <Textarea
                        value={commentText[item.id] || ''}
                        onChange={e => setCommentText(prev => ({ ...prev, [item.id]: e.target.value }))}
                        placeholder="Add a comment..."
                        rows={2}
                        className="rounded-none text-sm text-[#0e274e] font-light resize-none flex-1"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            handleAddComment(item.id);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(item.id)}
                        disabled={!commentText[item.id]?.trim() || submittingComment === item.id}
                        className="bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none self-end"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {pendingItems.length > 0 && (
        <div>
          <h2 className="text-xl font-light text-[#0e274e] mb-4">Pending Items</h2>
          <div className="grid gap-4">{pendingItems.map(renderItem)}</div>
        </div>
      )}
      {inProgressItems.length > 0 && (
        <div>
          <h2 className="text-xl font-light text-[#0e274e] mb-4">In Progress</h2>
          <div className="grid gap-4">{inProgressItems.map(renderItem)}</div>
        </div>
      )}
      {completedItems.length > 0 && (
        <div>
          <h2 className="text-xl font-light text-[#0e274e] mb-4">Completed</h2>
          <div className="grid gap-4">{completedItems.map(renderItem)}</div>
        </div>
      )}
      {ignoredItems.length > 0 && (
        <div>
          <h2 className="text-xl font-light text-[#0e274e] mb-4">Ignored</h2>
          <div className="grid gap-4">{ignoredItems.map(renderItem)}</div>
        </div>
      )}
    </div>
  );
}
