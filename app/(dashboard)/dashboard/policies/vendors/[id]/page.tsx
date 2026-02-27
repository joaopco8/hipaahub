'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Download, Upload, Building2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
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

interface BAAFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  version: number;
  is_current: boolean;
  uploaded_at: string;
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

export default function VendorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const vendorId = params.id as string;
  
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [baaFiles, setBaaFiles] = useState<BAAFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendor();
    loadBAAFiles();
  }, [vendorId]);

  async function loadVendor() {
    try {
      const supabase = createClient();
      const { data, error } = await (supabase as any)
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single();

      if (error) throw error;
      setVendor(data);
    } catch (error) {
      console.error('Error loading vendor:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadBAAFiles() {
    try {
      const supabase = createClient();
      const { data, error } = await (supabase as any)
        .from('vendor_baa_files')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setBaaFiles(data || []);
    } catch (error) {
      console.error('Error loading BAA files:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex w-full flex-col gap-6">
        <div className="mb-2">
          <h2 className="text-2xl font-light text-[#0e274e]">Vendor Details</h2>
          <p className="text-sm text-gray-400 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex w-full flex-col gap-6">
        <div className="mb-2">
          <h2 className="text-2xl font-light text-[#0e274e]">Vendor Not Found</h2>
          <p className="text-sm text-gray-400 font-light">The vendor you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/dashboard/policies/vendors')} className="mt-4 rounded-none">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendors
          </Button>
        </div>
      </div>
    );
  }

  const baaStatus = getBAAStatus(vendor);

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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/policies/vendors')}
            className="rounded-none"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h3 className="text-xl font-light text-[#0e274e]">{vendor.vendor_name}</h3>
            <p className="text-sm text-gray-400 font-light">Vendor Details & BAA Management</p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/dashboard/policies/vendors/${vendorId}/edit`)}
          className="bg-[#00bceb] text-white hover:bg-[#00a0c9] rounded-none"
        >
          Edit Vendor
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Vendor Information */}
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-base font-light text-[#0e274e] flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#00bceb]" />
              Vendor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Service Type</p>
              <p className="text-sm text-[#0e274e]">{vendor.service_type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">PHI Access</p>
              {vendor.has_phi_access ? (
                <Badge className="bg-red-50 text-red-600 border-red-200 rounded-none">Yes</Badge>
              ) : (
                <Badge className="bg-gray-50 text-gray-600 border-gray-200 rounded-none">No</Badge>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Risk Level</p>
              <Badge className={`${getRiskLevelColor(vendor.risk_level)} rounded-none capitalize`}>
                {vendor.risk_level}
              </Badge>
            </div>
            {vendor.contact_name && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Contact Name</p>
                <p className="text-sm text-[#0e274e]">{vendor.contact_name}</p>
              </div>
            )}
            {vendor.contact_email && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Contact Email</p>
                <p className="text-sm text-[#0e274e]">{vendor.contact_email}</p>
              </div>
            )}
            {vendor.contact_phone && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Contact Phone</p>
                <p className="text-sm text-[#0e274e]">{vendor.contact_phone}</p>
              </div>
            )}
            {vendor.notes && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Notes</p>
                <p className="text-sm text-[#0e274e] whitespace-pre-wrap">{vendor.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* BAA Status */}
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-base font-light text-[#0e274e] flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#00bceb]" />
              BAA Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-2">Status</p>
              <Badge className={`${baaStatus.color} rounded-none flex items-center gap-1 w-fit`}>
                {baaStatus.icon}
                {baaStatus.status}
              </Badge>
            </div>
            {vendor.baa_signed_date && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Signed Date</p>
                <p className="text-sm text-[#0e274e]">
                  {format(new Date(vendor.baa_signed_date), 'MMM d, yyyy')}
                </p>
              </div>
            )}
            {vendor.baa_expiration_date && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Expiration Date</p>
                <p className="text-sm text-[#0e274e]">
                  {format(new Date(vendor.baa_expiration_date), 'MMM d, yyyy')}
                </p>
              </div>
            )}
            <div className="pt-4">
              <Button
                variant="outline"
                className="w-full rounded-none border-gray-200 text-gray-600 hover:text-[#00bceb]"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload BAA Document
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BAA Documents */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-light text-[#0e274e] flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#00bceb]" />
            BAA Documents
          </CardTitle>
          <CardDescription className="text-xs text-gray-400">
            Uploaded BAA documents with version history
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {baaFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-sm text-gray-400 mb-2">No BAA documents uploaded</p>
              <p className="text-xs text-gray-400">Upload a BAA document to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {baaFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-none hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-[#00bceb]" />
                    <div>
                      <p className="text-sm font-medium text-[#0e274e]">{file.file_name}</p>
                      <p className="text-xs text-gray-400">
                        Version {file.version} • {format(new Date(file.uploaded_at), 'MMM d, yyyy')} • {(file.file_size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    {file.is_current && (
                      <Badge className="bg-green-50 text-green-600 border-green-200 rounded-none">
                        Current
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-none text-gray-600 hover:text-[#00bceb]"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
