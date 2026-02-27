'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, FileText, Calendar, Users, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generatePatientNotificationPDF, downloadPDF } from '@/lib/pdf-generator';
import { format } from 'date-fns';
import { BreachNavigation } from '@/components/breach-notifications/breach-navigation';

interface BreachNotification {
  id: string;
  organization_name: string;
  breach_discovery_date: string;
  breach_occurred_date: string | null;
  breach_description: string;
  individuals_affected: number;
  breach_type: string;
  status: string;
  created_at: string;
  patient_letter_content: string | null;
  hhs_letter_content: string | null;
  media_letter_content: string | null;
  breach_id: string;
}

export default function BreachNotificationsHistoryPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<BreachNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        // Get user's organization
        const { data: orgData } = await supabase
          .from('organizations')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!orgData) {
          setLoading(false);
          return;
        }

        // Get breach notifications
        const { data, error } = await (supabase as any)
          .from('breach_notifications')
          .select('*')
          .eq('organization_id', orgData.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading notifications:', error);
        } else {
          setNotifications(data || []);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, []);

  const handleDownload = async (notification: BreachNotification, type: 'patient' | 'hhs' | 'media') => {
    setDownloadingId(notification.id);
    try {
      const content = type === 'patient' 
        ? notification.patient_letter_content 
        : type === 'hhs' 
        ? notification.hhs_letter_content 
        : notification.media_letter_content;

      if (!content) {
        alert('Letter content not available');
        return;
      }

      if (type === 'patient') {
        try {
          const pdfBlob = await generatePatientNotificationPDF({
            organizationName: notification.organization_name,
            documentTitle: 'HIPAA Breach Notification Letter',
            content: content,
            recipientName: 'Patient',
            breachId: notification.breach_id
          });
          
          if (!pdfBlob || pdfBlob.size === 0) throw new Error('PDF blob is empty');
          
          const filename = `breach-notification-${notification.breach_id}-patient.pdf`;
          downloadPDF(pdfBlob, filename);
        } catch (error) {
          console.error('Error generating PDF:', error);
          // Fallback to text download
          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `breach-notification-${notification.breach_id}-patient.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } else {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `breach-notification-${notification.breach_id}-${type}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading:', error);
      alert('Error downloading letter. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col gap-6 p-6">
        <div className="text-center py-12 text-[#565656] font-light">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 max-w-[1600px] mx-auto p-6">
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
      <div className="mb-2">
        <h3 className="text-xl font-light text-[#0e274e]">Breach Notification History</h3>
        <p className="text-sm text-gray-400 font-light">
          View and download previously generated breach notification letters
        </p>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-light">No breach notifications generated yet.</p>
            <Button
              onClick={() => router.push('/dashboard/breach-notifications')}
              className="mt-4 bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-light"
            >
              Generate First Notification
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className="border-0 shadow-sm bg-white rounded-none">
              <CardHeader className="border-b border-gray-100 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-light text-[#0e274e] mb-2">
                      {notification.organization_name}
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-400 space-y-1">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Discovered: {format(new Date(notification.breach_discovery_date), 'MMM dd, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {notification.individuals_affected} individuals affected
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {notification.breach_type}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-gray-500">Breach ID: {notification.breach_id}</span>
                        <span className="mx-2">•</span>
                        <span className="text-gray-500">
                          Generated: {format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-light rounded ${
                      notification.status === 'generated' 
                        ? 'bg-green-100 text-green-700' 
                        : notification.status === 'sent'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {notification.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 font-light line-clamp-2">
                    {notification.breach_description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {notification.patient_letter_content && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(notification, 'patient')}
                      disabled={downloadingId === notification.id}
                      className="rounded-none border-gray-200 text-gray-600 hover:text-[#00bceb]"
                    >
                      <Download className="h-3 w-3 mr-2" />
                      Patient Letter
                    </Button>
                  )}
                  {notification.hhs_letter_content && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(notification, 'hhs')}
                      disabled={downloadingId === notification.id}
                      className="rounded-none border-gray-200 text-gray-600 hover:text-[#00bceb]"
                    >
                      <Download className="h-3 w-3 mr-2" />
                      HHS Letter
                    </Button>
                  )}
                  {notification.media_letter_content && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(notification, 'media')}
                      disabled={downloadingId === notification.id}
                      className="rounded-none border-gray-200 text-gray-600 hover:text-[#00bceb]"
                    >
                      <Download className="h-3 w-3 mr-2" />
                      Media Letter
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
