import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, AlertCircle, CheckCircle2, Clock, X } from 'lucide-react';
import Link from 'next/link';

export default async function AlertsPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  // Mock data - será substituído por dados reais
  const alerts = [
    {
      id: 1,
      type: 'high',
      title: 'Security Policy Update Required',
      message: 'Your Security Policy is due for annual review. Update required by February 15, 2024.',
      category: 'Policy Review',
      createdAt: '2024-01-20',
      actionUrl: '/dashboard/policies'
    },
    {
      id: 2,
      type: 'high',
      title: 'Missing BAA with Cloud Provider',
      message: 'No Business Associate Agreement found for your cloud storage provider. This is required for HIPAA compliance.',
      category: 'Contracts',
      createdAt: '2024-01-18',
      actionUrl: '/dashboard/action-items'
    },
    {
      id: 3,
      type: 'medium',
      title: 'Employee Training Expiring Soon',
      message: '3 employees have training certificates expiring within 30 days. Schedule renewal training.',
      category: 'Training',
      createdAt: '2024-01-15',
      actionUrl: '/dashboard/training'
    },
    {
      id: 4,
      type: 'low',
      title: 'Risk Assessment Due',
      message: 'Annual risk assessment should be completed. Last assessment was 11 months ago.',
      category: 'Compliance',
      createdAt: '2024-01-10',
      actionUrl: '/dashboard/risk-assessment'
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <Bell className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const highPriorityCount = alerts.filter(a => a.type === 'high').length;
  const mediumPriorityCount = alerts.filter(a => a.type === 'medium').length;
  const lowPriorityCount = alerts.filter(a => a.type === 'low').length;

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 max-w-7xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Alerts & Notifications</h1>
        <p className="text-zinc-600 text-base">
          Stay informed about important compliance deadlines and requirements
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highPriorityCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              Medium Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mediumPriorityCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Should be addressed soon</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              Low Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{lowPriorityCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Informational</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className={`hover:shadow-md transition-shadow ${getAlertColor(alert.type)}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-base">{alert.title}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {alert.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Created {new Date(alert.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={alert.actionUrl}>
                      <span>Take Action</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {alerts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
            <CardTitle className="mb-2">All clear!</CardTitle>
            <CardDescription>You have no active alerts at this time.</CardDescription>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Alert Settings</CardTitle>
          <CardDescription>
            Configure how and when you receive compliance alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Receive alerts via email
                </div>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">In-App Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Show alerts in dashboard
                </div>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Alert Frequency</div>
                <div className="text-sm text-muted-foreground">
                  How often to check for new alerts
                </div>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

