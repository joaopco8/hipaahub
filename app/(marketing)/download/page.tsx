'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Download, ArrowRight, Shield, FileText, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { initiateCheckout } from '@/app/actions/checkout';
import { getStripe } from '@/utils/stripe/client';

export default function DownloadPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  useEffect(() => {
    // If no email, redirect to home
    if (!email) {
      router.push('/');
    }
  }, [email, router]);

  const handleDownload = async () => {
    if (!email) return;

    setIsDownloading(true);

    try {
      const supabase = createClient();
      
      // Update lead record to mark as downloaded (most recent one for this email)
      const { data: latestLead } = await supabase
        .from('leads')
        .select('id')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latestLead) {
        await supabase
          .from('leads')
          .update({
            material_downloaded: true,
            downloaded_at: new Date().toISOString()
          })
          .eq('id', latestLead.id);
      }

      // Create a simple text-based PDF content (you can replace this with an actual PDF file)
      const checklistContent = `HIPAA COMPLIANCE CHECKLIST
      
This comprehensive checklist will help you ensure your practice is HIPAA compliant.

ADMINISTRATIVE SAFEGUARDS
□ Designate a Security Officer
□ Designate a Privacy Officer
□ Conduct regular risk assessments
□ Implement workforce training program
□ Establish access management procedures
□ Create incident response procedures
□ Develop contingency plans
□ Document all policies and procedures

PHYSICAL SAFEGUARDS
□ Control facility access
□ Secure workstations
□ Implement device controls
□ Maintain proper disposal procedures
□ Document physical security measures

TECHNICAL SAFEGUARDS
□ Implement access controls
□ Establish audit controls
□ Ensure data integrity
□ Implement transmission security
□ Use encryption for ePHI
□ Maintain secure backups
□ Implement authentication measures

For more detailed guidance and automated compliance tools, visit HIPAA Hub.`;

      // Create blob and download
      const blob = new Blob([checklistContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'HIPAA-Compliance-Checklist.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setHasDownloaded(true);
      toast.success('Download started!');
    } catch (error) {
      console.error('Error downloading:', error);
      toast.error('Failed to download. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGetStarted = async () => {
    setIsCheckoutLoading(true);
    try {
      const result = await initiateCheckout();
      
      if (result.type === 'redirect') {
        window.location.href = result.path;
      } else if (result.type === 'checkout') {
        const stripe = await getStripe();
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId: result.sessionId });
        } else {
          window.location.href = '/signup?redirect=checkout';
        }
      } else if (result.type === 'error') {
        window.location.href = '/signup?redirect=checkout';
      }
    } catch (error: any) {
      console.error('Error initiating checkout:', error);
      window.location.href = '/signup?redirect=checkout';
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* SECTION 1: Download Section - Text Left, Image Right */}
      <section className="w-full bg-white py-24 md:py-32 font-extralight">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              {/* Left Side - Text Content */}
              <div className="space-y-6 font-extralight">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl text-[#0c0b1d] font-extralight leading-tight">
                    Your Free HIPAA Compliance Checklist
                  </h1>
                  <p className="text-lg md:text-xl text-zinc-600 font-extralight leading-relaxed">
                    Get instant access to our comprehensive HIPAA Compliance Checklist. This guide will help you understand the key requirements for protecting patient health information.
                  </p>
                </div>

                {!hasDownloaded ? (
                  <div className="space-y-4 pt-4">
                    <Button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="bg-[#1ad07a] text-[#0d1122] hover:bg-[#1ad07a]/90 font-medium h-14 px-8 text-lg w-full sm:w-auto"
                    >
                      {isDownloading ? (
                        'Preparing Download...'
                      ) : (
                        <>
                          <Download className="mr-2 h-5 w-5" />
                          Download Free Checklist
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-zinc-500 font-extralight">
                      No credit card required. Instant access to your checklist.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3 text-[#1ad07a]">
                      <CheckCircle2 className="w-6 h-6" />
                      <p className="text-lg font-extralight">Download Complete!</p>
                    </div>
                    <p className="text-base text-zinc-600 font-extralight">
                      Check your downloads folder. The checklist is ready to help you achieve HIPAA compliance.
                    </p>
                  </div>
                )}

                <div className="space-y-3 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1ad07a] mt-2 flex-shrink-0" />
                    <p className="text-base text-zinc-700 font-extralight">
                      Complete administrative, physical, and technical safeguards checklist
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1ad07a] mt-2 flex-shrink-0" />
                    <p className="text-base text-zinc-700 font-extralight">
                      Step-by-step guidance for OCR audit preparation
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1ad07a] mt-2 flex-shrink-0" />
                    <p className="text-base text-zinc-700 font-extralight">
                      Best practices from healthcare compliance experts
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side - Image */}
              <div className="order-first lg:order-last">
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-sm">
                  <Image
                    src="/mockup9doc.jpg"
                    alt="HIPAA Compliance Documents"
                    fill
                    className="object-cover object-center"
                    quality={100}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CTA Section - Buy HIPAA Hub */}
      <section className="w-full bg-[#0c0b1d] py-24 md:py-32 font-extralight">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1ad07a]/10 border border-[#1ad07a]/20">
                <Shield className="w-4 h-4 text-[#1ad07a]" />
                <span className="text-xs text-[#1ad07a] font-extralight">Complete Compliance Solution</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl text-white font-extralight leading-tight">
                Ready to Automate Your HIPAA Compliance?
              </h2>
              <p className="text-lg md:text-xl text-zinc-400 font-extralight leading-relaxed max-w-2xl mx-auto">
                HIPAA Hub automates your entire compliance process. Generate audit-ready policies, track evidence, and stay compliant 24/7.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={handleGetStarted}
                  disabled={isCheckoutLoading}
                  className="bg-[#1ad07a] text-[#0d1122] hover:bg-[#1ad07a]/90 font-medium h-14 px-12 text-lg w-full sm:w-auto"
                >
                  {isCheckoutLoading ? (
                    'Processing...'
                  ) : (
                    <>
                      Get Started with HIPAA Hub
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                <Link href="/signin">
                  <Button
                    className="border border-zinc-400 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-300 font-medium h-14 px-8 w-full sm:w-auto"
                  >
                    Already have an account?
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5 text-[#1ad07a]" />
                    <h3 className="text-lg text-white font-extralight">9 Required Policies</h3>
                  </div>
                  <p className="text-sm text-zinc-400 font-extralight">
                    Auto-generated and audit-ready
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5 text-[#1ad07a]" />
                    <h3 className="text-lg text-white font-extralight">Risk Assessment</h3>
                  </div>
                  <p className="text-sm text-zinc-400 font-extralight">
                    OCR-aligned security analysis
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#1ad07a]" />
                    <h3 className="text-lg text-white font-extralight">Audit Defense</h3>
                  </div>
                  <p className="text-sm text-zinc-400 font-extralight">
                    Complete evidence vault
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
