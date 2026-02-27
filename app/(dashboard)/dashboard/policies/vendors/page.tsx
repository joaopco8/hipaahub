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
import { AlertCircle, Plus, FileText, Eye, Download, Edit, Trash2, Building2, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { PoliciesNavigation } from '@/components/policies/policies-navigation';

interface Vendor {
  id: string;
  vendor_name: string;
  service_type: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  has_phi_access: boolean;
  baa_signed: boolean;
  baa_signed_date: string | null;
  baa_expiration_date: string | null;
  risk_level: 'low' | 'medium' | 'high';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function getBAAStatus(vendor: Vendor): { status: string; color: string; icon: React.ReactNode } {
  if (!vendor.baa_signed) {
    return {
      status: 'Missing',
      color: 'bg-red-50 text-red-600 border-red-200',
      icon: <AlertCircle className="h-3 w-3" />
    };
  }
  
  if (!vendor.baa_expiration_date) {
    return {
      status: 'Active',
      color: 'bg-green-50 text-green-600 border-green-200',
      icon: <CheckCircle2 className="h-3 w-3" />
    };
  }
  
  const expirationDate = new Date(vendor.baa_expiration_date);
  const today = new Date();
  const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (expirationDate < today) {
    return {
      status: 'Expired',
      color: 'bg-red-50 text-red-600 border-red-200',
      icon: <AlertCircle className="h-3 w-3" />
    };
  }
  
  if (daysUntilExpiration <= 30) {
    return {
      status: 'Expiring Soon',
      color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      icon: <Clock className="h-3 w-3" />
    };
  }
  
  return {
    status: 'Active',
    color: 'bg-green-50 text-green-600 border-green-200',
    icon: <CheckCircle2 className="h-3 w-3" />
  };
}

function getRiskLevelColor(riskLevel: string) {
  switch (riskLevel) {
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

export default function VendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  
  const [formData, setFormData] = useState({
    vendor_name: '',
    service_type: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    has_phi_access: false,
    baa_signed: false,
    baa_signed_date: '',
    baa_expiration_date: '',
    risk_level: 'medium' as 'low' | 'medium' | 'high',
    notes: ''
  });

  useEffect(() => {
    loadVendors();
  }, []);

  async function loadVendors() {
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
        .from('vendors')
        .select('*')
        .eq('organization_id', orgData.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading vendors:', error);
      } else {
        setVendors(data || []);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
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

      if (editingVendor) {
        // Update existing vendor
        const { error } = await (supabase as any)
          .from('vendors')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingVendor.id)
          .eq('organization_id', orgData.id);

        if (error) throw error;
      } else {
        // Create new vendor
        const { error } = await (supabase as any)
          .from('vendors')
          .insert({
            ...formData,
            organization_id: orgData.id,
            created_by: user.id
          });

        if (error) throw error;
      }

      setIsDialogOpen(false);
      setEditingVendor(null);
      resetForm();
      loadVendors();
    } catch (error) {
      console.error('Error saving vendor:', error);
      alert('Failed to save vendor. Please try again.');
    }
  }

  function resetForm() {
    setFormData({
      vendor_name: '',
      service_type: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      has_phi_access: false,
      baa_signed: false,
      baa_signed_date: '',
      baa_expiration_date: '',
      risk_level: 'medium',
      notes: ''
    });
  }

  function handleEdit(vendor: Vendor) {
    setEditingVendor(vendor);
    setFormData({
      vendor_name: vendor.vendor_name,
      service_type: vendor.service_type,
      contact_name: vendor.contact_name || '',
      contact_email: vendor.contact_email || '',
      contact_phone: vendor.contact_phone || '',
      has_phi_access: vendor.has_phi_access,
      baa_signed: vendor.baa_signed,
      baa_signed_date: vendor.baa_signed_date || '',
      baa_expiration_date: vendor.baa_expiration_date || '',
      risk_level: vendor.risk_level,
      notes: vendor.notes || ''
    });
    setIsDialogOpen(true);
  }

  async function handleDelete(vendorId: string) {
    if (!confirm('Are you sure you want to delete this vendor?')) return;

    try {
      const supabase = createClient();
      const { error } = await (supabase as any)
        .from('vendors')
        .delete()
        .eq('id', vendorId);

      if (error) throw error;
      loadVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert('Failed to delete vendor. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="flex w-full flex-col gap-6">
        <div className="mb-2">
          <h2 className="text-2xl font-light text-[#0e274e]">Vendor & BAA</h2>
          <p className="text-sm text-gray-400 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  const vendorsWithIssues = vendors.filter(v => {
    const status = getBAAStatus(v);
    return status.status === 'Missing' || status.status === 'Expired' || status.status === 'Expiring Soon';
  });

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-2xl font-light text-[#0e274e]">Policies & Documents</h2>
        <p className="text-sm text-gray-400 font-light">
          Manage HIPAA policy templates and documentation
        </p>
      </div>

      {/* Navigation Tabs */}
      <PoliciesNavigation />

      {/* Page Header */}
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-light text-[#0e274e]">Vendor & BAA</h3>
          <p className="text-sm text-gray-400 font-light">
            Manage vendors and Business Associate Agreements
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setEditingVendor(null);
              }}
              className="bg-[#00bceb] text-white hover:bg-[#00a0c9] rounded-none"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-[#0e274e] font-light text-xl">
                {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-sm font-light">
                {editingVendor ? 'Update vendor information and BAA details' : 'Add a new vendor and track their BAA status'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor_name" className="text-[#0e274e] font-light text-sm">Vendor Name *</Label>
                  <Input
                    id="vendor_name"
                    value={formData.vendor_name}
                    onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                    required
                    className="rounded-none bg-white text-[#0e274e] border-gray-300 placeholder:text-gray-400"
                    placeholder="e.g., Amazon Web Services, Epic Systems"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service_type" className="text-[#0e274e] font-light text-sm">Service Type *</Label>
                  <Input
                    id="service_type"
                    value={formData.service_type}
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                    required
                    className="rounded-none bg-white text-[#0e274e] border-gray-300 placeholder:text-gray-400"
                    placeholder="e.g., Cloud Storage, EHR, Email Provider"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name" className="text-[#0e274e] font-light text-sm">Contact Name</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    className="rounded-none bg-white text-[#0e274e] border-gray-300 placeholder:text-gray-400"
                    placeholder="e.g., John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email" className="text-[#0e274e] font-light text-sm">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="rounded-none bg-white text-[#0e274e] border-gray-300 placeholder:text-gray-400"
                    placeholder="e.g., contact@vendor.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone" className="text-[#0e274e] font-light text-sm">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="rounded-none bg-white text-[#0e274e] border-gray-300 placeholder:text-gray-400"
                    placeholder="e.g., (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="risk_level" className="text-[#0e274e] font-light text-sm">Risk Level</Label>
                  <Select
                    value={formData.risk_level}
                    onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, risk_level: value })}
                  >
                    <SelectTrigger className="rounded-none bg-white text-[#0e274e] border-gray-300">
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#0e274e] font-light text-sm block mb-2">PHI Access</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="has_phi_access"
                      checked={formData.has_phi_access}
                      onChange={(e) => setFormData({ ...formData, has_phi_access: e.target.checked })}
                      className="rounded w-4 h-4 text-[#00bceb] border-gray-300 focus:ring-[#00bceb]"
                    />
                    <Label htmlFor="has_phi_access" className="text-[#0e274e] font-light text-sm cursor-pointer">
                      Vendor has access to PHI
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-[#0e274e] mb-3">BAA Information</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="baa_signed"
                    checked={formData.baa_signed}
                    onChange={(e) => setFormData({ ...formData, baa_signed: e.target.checked })}
                    className="rounded w-4 h-4 text-[#00bceb] border-gray-300 focus:ring-[#00bceb]"
                  />
                  <Label htmlFor="baa_signed" className="text-[#0e274e] font-light text-sm cursor-pointer">
                    BAA has been signed
                  </Label>
                </div>
                {formData.baa_signed && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="baa_signed_date" className="text-[#0e274e] font-light text-sm">BAA Signed Date</Label>
                      <Input
                        id="baa_signed_date"
                        type="date"
                        value={formData.baa_signed_date}
                        onChange={(e) => setFormData({ ...formData, baa_signed_date: e.target.value })}
                        className="rounded-none bg-white text-[#0e274e] border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="baa_expiration_date" className="text-[#0e274e] font-light text-sm">BAA Expiration Date</Label>
                      <Input
                        id="baa_expiration_date"
                        type="date"
                        value={formData.baa_expiration_date}
                        onChange={(e) => setFormData({ ...formData, baa_expiration_date: e.target.value })}
                        className="rounded-none bg-white text-[#0e274e] border-gray-300"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-[#0e274e] font-light text-sm">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="rounded-none bg-white text-[#0e274e] border-gray-300 placeholder:text-gray-400 font-light"
                  placeholder="Add any additional notes about this vendor, contract terms, or special considerations..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                    setEditingVendor(null);
                  }}
                  className="rounded-none"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#00bceb] text-white hover:bg-[#00a0c9] rounded-none">
                  {editingVendor ? 'Update Vendor' : 'Create Vendor'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts */}
      {vendorsWithIssues.length > 0 && (
        <Card className="border-0 shadow-sm bg-white rounded-none border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-[#0e274e]">
                <strong>{vendorsWithIssues.length}</strong> vendor{vendorsWithIssues.length > 1 ? 's' : ''} with BAA issues requiring attention
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vendors Table */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-light text-[#0e274e]">Vendors</CardTitle>
          <CardDescription className="text-xs text-gray-400">
            {vendors.length} total vendor{vendors.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {vendors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-sm text-gray-400 mb-2">No vendors added yet</p>
              <p className="text-xs text-gray-400">Add your first vendor to start tracking BAAs</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left p-4 text-xs font-medium text-[#565656]">Vendor Name</th>
                    <th className="text-left p-4 text-xs font-medium text-[#565656]">PHI Access</th>
                    <th className="text-left p-4 text-xs font-medium text-[#565656]">BAA Status</th>
                    <th className="text-left p-4 text-xs font-medium text-[#565656]">Expiration</th>
                    <th className="text-left p-4 text-xs font-medium text-[#565656]">Risk Level</th>
                    <th className="text-right p-4 text-xs font-medium text-[#565656]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => {
                    const baaStatus = getBAAStatus(vendor);
                    return (
                      <tr key={vendor.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <p className="text-sm font-medium text-[#0e274e]">{vendor.vendor_name}</p>
                            <p className="text-xs text-gray-400">{vendor.service_type}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          {vendor.has_phi_access ? (
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
                          <Badge className={`${baaStatus.color} rounded-none flex items-center gap-1 w-fit`}>
                            {baaStatus.icon}
                            {baaStatus.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {vendor.baa_expiration_date ? (
                            <span className="text-sm text-[#565656]">
                              {format(new Date(vendor.baa_expiration_date), 'MMM d, yyyy')}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge className={`${getRiskLevelColor(vendor.risk_level)} rounded-none capitalize`}>
                            {vendor.risk_level}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/policies/vendors/${vendor.id}`)}
                              className="h-8 rounded-none text-gray-600 hover:text-[#00bceb]"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(vendor)}
                              className="h-8 rounded-none text-gray-600 hover:text-[#00bceb]"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(vendor.id)}
                              className="h-8 rounded-none text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
