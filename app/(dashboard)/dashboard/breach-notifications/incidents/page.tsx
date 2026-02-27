'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, Plus, Eye, Edit, Trash2, AlertTriangle, CheckCircle2, Clock, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { BreachNavigation } from '@/components/breach-notifications/breach-navigation';

interface Incident {
  id: string;
  incident_title: string;
  description: string;
  date_occurred: string;
  date_discovered: string;
  discovered_by: string;
  phi_involved: boolean;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'under_review' | 'closed';
  estimated_individuals_affected: number;
  breach_confirmed: boolean;
  breach_notification_id: string | null;
  created_at: string;
  updated_at: string;
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'low':
      return 'bg-green-50 text-green-600 border-green-200';
    case 'medium':
      return 'bg-yellow-50 text-yellow-600 border-yellow-200';
    case 'high':
      return 'bg-red-50 text-red-600 border-red-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'open':
      return 'bg-red-50 text-red-600 border-red-200';
    case 'under_review':
      return 'bg-yellow-50 text-yellow-600 border-yellow-200';
    case 'closed':
      return 'bg-green-50 text-green-600 border-green-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

export default function IncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  
  const [formData, setFormData] = useState({
    incident_title: '',
    description: '',
    date_occurred: '',
    date_discovered: '',
    discovered_by: '',
    phi_involved: false,
    severity: 'medium' as 'low' | 'medium' | 'high',
    status: 'open' as 'open' | 'under_review' | 'closed',
    estimated_individuals_affected: 0,
    breach_confirmed: false
  });

  useEffect(() => {
    loadIncidents();
  }, []);

  async function loadIncidents() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/signin');
        return;
      }

      const { data: orgData } = await supabase
        .from('organizations')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!orgData) {
        setLoading(false);
        return;
      }

      const { data, error } = await (supabase as any)
        .from('incident_logs')
        .select('*')
        .eq('organization_id', orgData.id)
        .order('date_discovered', { ascending: false });

      if (error) {
        console.error('Error loading incidents:', error);
      } else {
        setIncidents(data || []);
      }
    } catch (error) {
      console.error('Error loading incidents:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data: orgData } = await supabase
        .from('organizations')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!orgData) return;

      if (editingIncident) {
        // Update existing incident
        const { error } = await (supabase as any)
          .from('incident_logs')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingIncident.id)
          .eq('organization_id', orgData.id);

        if (error) throw error;
      } else {
        // Create new incident
        const { error } = await (supabase as any)
          .from('incident_logs')
          .insert({
            ...formData,
            organization_id: orgData.id,
            created_by: user.id
          });

        if (error) throw error;
      }

      setIsDialogOpen(false);
      setEditingIncident(null);
      resetForm();
      loadIncidents();
    } catch (error) {
      console.error('Error saving incident:', error);
      alert('Failed to save incident. Please try again.');
    }
  }

  function resetForm() {
    setFormData({
      incident_title: '',
      description: '',
      date_occurred: '',
      date_discovered: '',
      discovered_by: '',
      phi_involved: false,
      severity: 'medium',
      status: 'open',
      estimated_individuals_affected: 0,
      breach_confirmed: false
    });
  }

  function handleEdit(incident: Incident) {
    setEditingIncident(incident);
    setFormData({
      incident_title: incident.incident_title,
      description: incident.description,
      date_occurred: incident.date_occurred,
      date_discovered: incident.date_discovered,
      discovered_by: incident.discovered_by,
      phi_involved: incident.phi_involved,
      severity: incident.severity,
      status: incident.status,
      estimated_individuals_affected: incident.estimated_individuals_affected,
      breach_confirmed: incident.breach_confirmed
    });
    setIsDialogOpen(true);
  }

  async function handleDelete(incidentId: string) {
    if (!confirm('Are you sure you want to delete this incident?')) return;

    try {
      const supabase = createClient();
      const { error } = await (supabase as any)
        .from('incident_logs')
        .delete()
        .eq('id', incidentId);

      if (error) throw error;
      loadIncidents();
    } catch (error) {
      console.error('Error deleting incident:', error);
      alert('Failed to delete incident. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="flex w-full flex-col gap-6">
        <div className="mb-2">
          <h2 className="text-2xl font-light text-[#0e274e]">Incident Log</h2>
          <p className="text-sm text-gray-400 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  const openIncidents = incidents.filter(i => i.status === 'open');
  const highSeverityIncidents = incidents.filter(i => i.severity === 'high' && i.status === 'open');

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-2xl font-light text-[#0e274e]">Breach Notifications</h2>
        <p className="text-sm text-gray-400 font-light">
          Manage breach notifications, incident logs, and compliance documentation
        </p>
      </div>

      {/* Navigation Tabs */}
      <BreachNavigation />

      {/* Page Header */}
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-light text-[#0e274e]">Incident Log</h3>
          <p className="text-sm text-gray-400 font-light">
            Track and manage security incidents
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setEditingIncident(null);
              }}
              className="bg-[#00bceb] text-white hover:bg-[#00a0c9] rounded-none"
            >
              <Plus className="h-4 w-4 mr-2" />
              Log Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-[#0c0b1d] font-light text-xl">
                {editingIncident ? 'Edit Incident' : 'Log New Incident'}
              </DialogTitle>
              <DialogDescription className="text-[#565656] text-sm font-light">
                {editingIncident ? 'Update incident information' : 'Create a new incident log entry'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="incident_title" className="text-[#0c0b1d] font-light text-sm">
                  Incident Title *
                </Label>
                <Input
                  id="incident_title"
                  value={formData.incident_title}
                  onChange={(e) => setFormData({ ...formData, incident_title: e.target.value })}
                  required
                  className="rounded-none text-[#0c0b1d]"
                  placeholder="Enter incident title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#0c0b1d] font-light text-sm">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="rounded-none text-[#0c0b1d]"
                  placeholder="Describe what happened..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_occurred" className="text-[#0c0b1d] font-light text-sm">
                    Date Occurred *
                  </Label>
                  <Input
                    id="date_occurred"
                    type="date"
                    value={formData.date_occurred}
                    onChange={(e) => setFormData({ ...formData, date_occurred: e.target.value })}
                    required
                    className="rounded-none text-[#0c0b1d]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_discovered" className="text-[#0c0b1d] font-light text-sm">
                    Date Discovered *
                  </Label>
                  <Input
                    id="date_discovered"
                    type="date"
                    value={formData.date_discovered}
                    onChange={(e) => setFormData({ ...formData, date_discovered: e.target.value })}
                    required
                    className="rounded-none text-[#0c0b1d]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discovered_by" className="text-[#0c0b1d] font-light text-sm">
                  Discovered By *
                </Label>
                <Input
                  id="discovered_by"
                  value={formData.discovered_by}
                  onChange={(e) => setFormData({ ...formData, discovered_by: e.target.value })}
                  required
                  className="rounded-none text-[#0c0b1d]"
                  placeholder="Name or role"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="severity" className="text-[#0c0b1d] font-light text-sm">
                    Severity
                  </Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, severity: value })}
                  >
                    <SelectTrigger className="rounded-none text-[#0c0b1d]">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-[#0c0b1d] font-light text-sm">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'open' | 'under_review' | 'closed') => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="rounded-none text-[#0c0b1d]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_individuals_affected" className="text-[#0c0b1d] font-light text-sm">
                  Estimated Individuals Affected
                </Label>
                <Input
                  id="estimated_individuals_affected"
                  type="number"
                  min="0"
                  value={formData.estimated_individuals_affected}
                  onChange={(e) => setFormData({ ...formData, estimated_individuals_affected: parseInt(e.target.value) || 0 })}
                  className="rounded-none text-[#0c0b1d]"
                  placeholder="0"
                />
              </div>

              <div className="space-y-4 border-t border-gray-200 pt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="phi_involved"
                    checked={formData.phi_involved}
                    onChange={(e) => setFormData({ ...formData, phi_involved: e.target.checked })}
                    className="rounded h-4 w-4 text-[#1ad07a] border-gray-300 focus:ring-[#1ad07a]"
                  />
                  <Label htmlFor="phi_involved" className="font-light cursor-pointer text-[#0c0b1d] text-sm">
                    PHI Involved
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="breach_confirmed"
                    checked={formData.breach_confirmed}
                    onChange={(e) => setFormData({ ...formData, breach_confirmed: e.target.checked })}
                    className="rounded h-4 w-4 text-[#1ad07a] border-gray-300 focus:ring-[#1ad07a]"
                  />
                  <Label htmlFor="breach_confirmed" className="font-light cursor-pointer text-[#0c0b1d] text-sm">
                    Breach Confirmed
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                    setEditingIncident(null);
                  }}
                  className="rounded-none"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#00bceb] text-white hover:bg-[#00a0c9] rounded-none">
                  {editingIncident ? 'Update Incident' : 'Create Incident'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts */}
      {highSeverityIncidents.length > 0 && (
        <Card className="border-0 shadow-sm bg-white rounded-none border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-[#0e274e]">
                <strong>{highSeverityIncidents.length}</strong> high severity incident{highSeverityIncidents.length > 1 ? 's' : ''} requiring immediate attention
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incidents Table */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-light text-[#0e274e]">Incidents</CardTitle>
          <CardDescription className="text-xs text-gray-400">
            {incidents.length} total incident{incidents.length !== 1 ? 's' : ''} • {openIncidents.length} open
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-sm text-gray-400 mb-2">No incidents logged yet</p>
              <p className="text-xs text-gray-400">Log your first incident to start tracking</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left p-4 text-xs font-medium text-[#565656]">Title</th>
                    <th className="text-left p-4 text-xs font-medium text-[#565656]">Severity</th>
                    <th className="text-left p-4 text-xs font-medium text-[#565656]">PHI Involved</th>
                    <th className="text-left p-4 text-xs font-medium text-[#565656]">Status</th>
                    <th className="text-left p-4 text-xs font-medium text-[#565656]">Date Discovered</th>
                    <th className="text-right p-4 text-xs font-medium text-[#565656]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr key={incident.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-medium text-[#0e274e]">{incident.incident_title}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">{incident.description}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${getSeverityColor(incident.severity)} rounded-none capitalize`}>
                          {incident.severity}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {incident.phi_involved ? (
                          <Badge className="bg-red-50 text-red-600 border-red-200 rounded-none">
                            Yes
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-50 text-gray-600 border-gray-200 rounded-none">
                            No
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge className={`${getStatusColor(incident.status)} rounded-none capitalize`}>
                          {incident.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-[#565656]">
                          {format(new Date(incident.date_discovered), 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/breach-notifications/incidents/${incident.id}`)}
                            className="h-8 rounded-none text-gray-600 hover:text-[#00bceb]"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(incident)}
                            className="h-8 rounded-none text-gray-600 hover:text-[#00bceb]"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(incident.id)}
                            className="h-8 rounded-none text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
