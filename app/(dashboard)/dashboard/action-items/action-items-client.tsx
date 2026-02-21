'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Info, FileText, Shield, Users, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { updateActionItemStatus } from '@/app/actions/action-items';
import { useRouter } from 'next/navigation';

interface ActionItem {
  id: string;
  item_key: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium';
  category: string;
  status: 'pending' | 'in-progress' | 'completed';
  completed_at: string | null;
  created_at: string;
}

interface ActionItemsClientProps {
  initialItems: ActionItem[];
}

export function ActionItemsClient({ initialItems }: ActionItemsClientProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'high':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'medium':
        return 'bg-[#00bceb]/10 text-[#00bceb] border-[#00bceb]/20';
      default:
        return 'bg-[#f3f5f9] text-[#565656] border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Policies':
        return <FileText className="h-5 w-5" />;
      case 'Security':
        return <Shield className="h-5 w-5" />;
      case 'Training':
        return <Users className="h-5 w-5" />;
      case 'Contracts':
        return <FileText className="h-5 w-5" />;
      case 'Administrative':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const handleStatusUpdate = async (itemId: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    setUpdatingId(itemId);
    try {
      await updateActionItemStatus(itemId, newStatus);
      
      // Update local state
      setItems(items.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              status: newStatus,
              completed_at: newStatus === 'completed' ? new Date().toISOString() : null
            }
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

  // Filter items by status
  const pendingItems = items.filter(item => item.status === 'pending');
  const inProgressItems = items.filter(item => item.status === 'in-progress');
  const completedItems = items.filter(item => item.status === 'completed');

  const renderItem = (item: ActionItem, index: number) => (
    <Card 
      key={item.id} 
      className={`border-0 shadow-sm bg-white rounded-none ${
        item.status === 'completed' ? 'opacity-75' : ''
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-none bg-[#f3f5f9] text-[#565656] shrink-0">
            {getCategoryIcon(item.category)}
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-light text-[#0e274e] text-lg">{item.title}</h3>
                  <Badge className={`${getPriorityColor(item.priority)} border rounded-none font-light capitalize`}>
                    {item.priority}
                  </Badge>
                  {item.status === 'completed' && (
                    <Badge className="bg-[#71bc48]/10 text-[#71bc48] border-[#71bc48]/20 rounded-none font-light">
                      Completed
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

            {item.status !== 'completed' && (
              <div className="flex gap-2 pt-2">
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
                {item.category === 'Policies' && (
                  <Button size="sm" variant="outline" asChild className="border-gray-300 text-[#565656] hover:bg-gray-50 rounded-none font-light">
                    <Link href="/dashboard/policies">
                      Go to Policies
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Pending Items */}
      {pendingItems.length > 0 && (
        <div>
          <h2 className="text-xl font-light text-[#0e274e] mb-4">Pending Items</h2>
          <div className="grid gap-4">
            {pendingItems.map((item, index) => renderItem(item, index))}
          </div>
        </div>
      )}

      {/* In Progress Items */}
      {inProgressItems.length > 0 && (
        <div>
          <h2 className="text-xl font-light text-[#0e274e] mb-4">In Progress</h2>
          <div className="grid gap-4">
            {inProgressItems.map((item, index) => renderItem(item, pendingItems.length + index))}
          </div>
        </div>
      )}

      {/* Completed Items */}
      {completedItems.length > 0 && (
        <div>
          <h2 className="text-xl font-light text-[#0e274e] mb-4">Completed</h2>
          <div className="grid gap-4">
            {completedItems.map((item, index) => renderItem(item, pendingItems.length + inProgressItems.length + index))}
          </div>
        </div>
      )}
    </div>
  );
}








