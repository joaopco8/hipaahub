import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import CopyEmailButton from './copy-email-button';

export default async function ContactPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  return (
    <div className="flex w-full flex-col gap-6 page-transition-premium">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Contact Us</h1>
        <p className="text-zinc-600 text-base">
          Get in touch with our support team. We're here to help with any questions about HIPAA Hub.
        </p>
      </div>

      <div className="max-w-2xl">
        {/* Email Card */}
        <Card className="border-zinc-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#1ad07a]/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-[#1ad07a]" />
              </div>
              <div>
                <CardTitle className="text-xl">Email</CardTitle>
                <CardDescription>Send us an email</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
              <p className="text-sm text-zinc-600 mb-2">Email address:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-base font-mono text-zinc-900 bg-white px-3 py-2 rounded border border-zinc-200">
                  contact@hipaahubhealth.com
                </code>
                <CopyEmailButton email="contact@hipaahubhealth.com" />
              </div>
            </div>
            <a href="mailto:contact@hipaahubhealth.com">
              <Button className="w-full bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#0c0b1d] hover:text-white">
                <Mail className="mr-2 h-4 w-4" />
                Open Email Client
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
