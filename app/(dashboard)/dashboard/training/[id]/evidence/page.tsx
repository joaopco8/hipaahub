'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  CheckCircle2, 
  Clock, 
  Globe, 
  FileText, 
  Download,
  ArrowLeft,
  Award,
  User,
  Calendar,
  Hash
} from 'lucide-react';
import { toast } from 'sonner';
// Certificate generation using HTML print instead of jsPDF

export default function TrainingEvidencePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [trainingRecord, setTrainingRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load Monsieur La Doulaise font
  useEffect(() => {
    // Check if font is already loaded
    if (document.querySelector('link[href*="Monsieur+La+Doulaise"]')) {
      return;
    }

    const link1 = document.createElement('link');
    link1.rel = 'preconnect';
    link1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(link1);

    const link2 = document.createElement('link');
    link2.rel = 'preconnect';
    link2.href = 'https://fonts.gstatic.com';
    link2.crossOrigin = 'anonymous';
    document.head.appendChild(link2);

    const link3 = document.createElement('link');
    link3.href = 'https://fonts.googleapis.com/css2?family=Monsieur+La+Doulaise&display=swap';
    link3.rel = 'stylesheet';
    document.head.appendChild(link3);

    // Preload the font
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.as = 'style';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Monsieur+La+Doulaise&display=swap';
    document.head.appendChild(fontLink);
  }, []);

  useEffect(() => {
    async function loadTrainingRecord() {
      try {
        // NOTE: `training_records` is not currently present in `types/db.ts`.
        // Use an untyped query here to avoid TS build failures while still fetching real data.
        const { data, error } = await (supabase as any)
          .from('training_records' as any)
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setTrainingRecord(data);
      } catch (error: any) {
        console.error('Error loading training record:', error);
        toast.error('Failed to load training evidence');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadTrainingRecord();
    }
  }, [params.id, supabase]);

  const generateCertificate = () => {
    if (!trainingRecord) return;

    // Create a printable certificate window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to generate certificate');
      return;
    }

    const certificateId = trainingRecord.certificate_id || `CERT-${Date.now()}`;
    const trainingDate = new Date(trainingRecord.training_date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const completionDateTime = new Date(trainingRecord.training_date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>HIPAA Training Certificate - ${trainingRecord.full_name}</title>
          <meta charset="UTF-8">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Monsieur+La+Doulaise&display=swap" rel="stylesheet">
          <style>
            @media print {
              @page {
                size: 3508px 2480px;
                margin: 0;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                width: 3508px;
                height: 2480px;
              }
              .certificate-container {
                 transform: scale(1); /* Ensure no scaling down for print if possible */
                 width: 100%;
                 height: 100%;
                 max-width: none;
                 border: 40px solid white; /* Proportional border */
                 outline: 20px solid #999;
              }
              .certificate-inner {
                 padding: 120px 160px; /* Scaled padding */
              }
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 0;
            }
            .certificate-container {
              background: #ebf7fa;
              width: 3508px;
              height: 2480px;
              /* Scale down for screen preview */
              transform-origin: top center;
              transform: scale(0.25); 
              padding: 0;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              position: relative;
              border: 40px solid white;
              outline: 20px solid #999;
            }
            .certificate-inner {
              padding: 120px 160px;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .certificate-container::before { display: none; }
            .certificate-container::after { display: none; }
            
            .logo-header {
              display: flex;
              align-items: flex-start;
              justify-content: flex-start;
              margin-bottom: 20px;
            }
            .logo {
              height: 140px;
              width: auto;
              filter: brightness(0); /* Make black */
            }
            
            .certificate-title {
              text-align: center;
              font-size: 56px;
              font-weight: 400;
              color: #1a1a1a;
              letter-spacing: 1px;
              margin-bottom: 80px;
              text-transform: none;
            }
            .certificate-subtitle { display: none; }
            .divider { display: none; }
            
            .trainee-name {
              text-align: center;
              font-size: 100px;
              font-weight: 700;
              color: #000;
              margin: 20px 0 60px;
              padding: 0;
              border: none;
              display: block;
              width: 100%;
            }
            .trainee-name-container {
              text-align: center;
              margin-bottom: 0;
            }
            
            .completion-statement {
              text-align: center;
              font-size: 38px;
              font-weight: 400;
              color: #1a1a1a;
              margin: 0 auto 60px;
              line-height: 1.5;
              max-width: 80%;
            }
            
            .certification-main-title {
              text-align: center;
              font-size: 80px;
              font-weight: 600;
              color: #000;
              margin-bottom: 100px;
            }
            
            .seal-section {
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 80px 0;
              border: none;
              padding: 0;
            }
            
            /* Custom HIPAA Seal */
            .custom-seal {
              width: 300px;
              height: 300px;
              border: 6px solid #1a1a1a;
              border-radius: 50%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              position: relative;
            }
            .custom-seal::before {
              content: '';
              position: absolute;
              top: 10px;
              left: 10px;
              right: 10px;
              bottom: 10px;
              border: 2px solid #1a1a1a;
              border-radius: 50%;
            }
            .seal-top-text {
              font-size: 24px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-bottom: 10px;
              color: #1a1a1a;
            }
            .seal-center-text {
              font-size: 56px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 4px;
              color: #1a1a1a;
              border-top: 4px solid #1a1a1a;
              border-bottom: 4px solid #1a1a1a;
              padding: 10px 0;
            }
            
            .bottom-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 100px;
              padding: 0 80px;
            }
            
            .date-info {
              text-align: left;
              font-size: 32px;
              color: #1a1a1a;
              line-height: 1.6;
            }
            .date-row {
              display: flex;
              gap: 40px;
            }
            .date-label {
              min-width: 240px;
            }
            .date-value {
              font-weight: 600;
            }
            
            .signature-block {
              text-align: right;
            }
            .signature-image {
              font-family: 'Monsieur La Doulaise', cursive !important;
              font-weight: 400 !important;
              font-style: normal !important;
              font-size: 110px;
              color: #1a1a1a;
              margin-bottom: 15px;
              line-height: 1;
            }
            .signer-name {
              font-size: 32px;
              font-weight: 700;
              color: #1a1a1a;
            }
            .signer-title {
              font-size: 28px;
              color: #555;
            }
            
            .footer-validation {
              margin-top: 80px;
              font-size: 24px;
              color: #555;
              border-top: none;
              text-align: left;
              padding: 0 80px 40px;
            }
            
            /* Hide unused styles */
            .details-grid, .pass-badge, .footer-info, .certify-text, .seal, .seal-icon, .seal-icon-text, .seal-label {
              display: none;
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div class="certificate-inner">
              <!-- Logo Header -->
              <div class="logo-header">
                <img src="/images/logoescura.png" alt="HIPAA Hub" class="logo" />
              </div>

              <!-- Header Title -->
              <div class="certificate-title">HIPAA Hub Certifications</div>

              <!-- Trainee Name -->
              <div class="trainee-name">${trainingRecord.full_name}</div>

              <!-- Completion Text -->
              <div class="completion-statement">
                has successfully completed the mandatory HIPAA certification exam requirements and is recognized as a
              </div>

              <!-- Certification Title -->
              <div class="certification-main-title">
                HIPAA Security Certified Associate
              </div>

              <!-- Seal -->
              <div class="seal-section">
                <div class="custom-seal">
                  <div class="seal-top-text">HIPAA HUB</div>
                  <div class="seal-center-text">HIPAA</div>
                  <div class="seal-top-text" style="margin-top: 10px;">CERTIFIED</div>
                </div>
              </div>

              <!-- Bottom Details -->
              <div class="bottom-section">
                <div class="date-info">
                  <div class="date-row">
                    <span class="date-label">Date Certified</span>
                    <span class="date-value">${trainingDate}</span>
                  </div>
                  <div class="date-row">
                    <span class="date-label">Valid Through</span>
                    <span class="date-value">${new Date(trainingRecord.expiration_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div class="date-row">
                    <span class="date-label">Certificate ID</span>
                    <span class="date-value" style="font-family: monospace;">${certificateId}</span>
                  </div>
                </div>

                <div class="signature-block">
                  <div class="signature-image">John Camargo</div>
                  <div class="signer-name">John Camargo</div>
                  <div class="signer-title">CEO, HIPAA Hub</div>
                </div>
              </div>

              <!-- Footer -->
              <div class="footer-validation">
                Validate this certificate's authenticity at<br/>
                www.hipaahubhealth.com/verify/${certificateId}<br/>
                Certificate Verification No. ${certificateId}
                <br/><br/>
                © ${new Date().getFullYear()} HIPAA Hub Compliance Solutions
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      toast.success('Professional certificate ready for printing');
    }, 250);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f5f9]">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-[#00bceb]" />
          <p className="text-[#565656] font-light">Loading training evidence...</p>
        </div>
      </div>
    );
  }

  if (!trainingRecord) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f5f9]">
        <Card className="max-w-md border-0 shadow-sm bg-white rounded-none">
          <CardContent className="pt-6">
            <p className="text-center text-[#565656] font-light">Training record not found</p>
            <Button onClick={() => router.back()} className="mt-4 w-full bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-bold">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPassed = (trainingRecord.quiz_score || 0) >= 70;
  const quizAnswers = trainingRecord.quiz_answers || {};

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Monsieur+La+Doulaise&display=swap');
        .signature-font {
          font-family: 'Monsieur La Doulaise', cursive !important;
          font-weight: 400 !important;
          font-style: normal !important;
        }
      `}} />
      <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-0 sm:py-0 bg-[#f3f5f9]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-[#565656] hover:bg-gray-50 rounded-none font-light">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-light text-[#0e274e]">Training Evidence</h1>
          <p className="text-[#565656] mt-1 font-light">
            Legal evidence and audit trail for {trainingRecord.full_name}
          </p>
        </div>
        <Button onClick={generateCertificate} className="w-full sm:w-auto bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-bold">
          <Download className="mr-2 h-4 w-4" />
          Download Certificate
        </Button>
      </div>

      {/* Certificate Preview */}
      <Card className="relative overflow-hidden border-2 border-gray-200 shadow-sm bg-[#ebf7fa] rounded-none">
        <div className="absolute top-0 left-0 right-0 bottom-0 border-[15px] border-white pointer-events-none" />
        <CardContent className="p-12 relative z-10">
          <div className="flex flex-col items-start">
            <div className="mb-8">
               <img src="/images/logoescura.png" alt="HIPAA Hub" className="h-12 w-auto brightness-0" />
            </div>
            
            <h2 className="w-full text-center text-xl text-[#1a1a1a] font-normal tracking-wide mb-8">
              HIPAA Hub Certifications
            </h2>
            
            <div className="w-full text-center">
              <h1 className="text-4xl font-bold text-black mb-6">
                {trainingRecord.full_name}
              </h1>
              
              <p className="text-[#1a1a1a] max-w-2xl mx-auto mb-8 leading-relaxed">
                has successfully completed the mandatory HIPAA certification exam requirements and is recognized as a
              </p>
              
              <h3 className="text-3xl font-semibold text-black mb-12">
                HIPAA Security Certified Associate
              </h3>
            </div>
            
            <div className="w-full flex justify-center mb-12">
              <div className="w-32 h-32 border-[3px] border-[#1a1a1a] rounded-full flex flex-col items-center justify-center relative">
                 <div className="absolute inset-1 border border-[#1a1a1a] rounded-full" />
                 <span className="text-[8px] font-bold uppercase tracking-widest mb-1 text-[#1a1a1a]">HIPAA HUB</span>
                 <span className="text-xl font-extrabold uppercase tracking-[0.2em] py-1 border-t-2 border-b-2 border-[#1a1a1a] text-[#1a1a1a]">HIPAA</span>
                 <span className="text-[8px] font-bold uppercase tracking-widest mt-1 text-[#1a1a1a]">CERTIFIED</span>
              </div>
            </div>
            
            <div className="w-full flex justify-between items-end px-8 mt-8">
              <div className="text-xs text-[#1a1a1a] space-y-1">
                <div className="flex gap-4">
                  <span className="min-w-[80px]">Date Certified</span>
                  <span className="font-semibold">
                    {new Date(trainingRecord.training_date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className="min-w-[80px]">Valid Through</span>
                  <span className="font-semibold">
                    {new Date(trainingRecord.expiration_date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className="min-w-[80px]">Certificate ID</span>
                  <span className="font-mono font-semibold">
                    {trainingRecord.certificate_id || 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div 
                  className="signature-font text-4xl text-[#1a1a1a] mb-1 leading-none"
                >
                  John Camargo
                </div>
                <div className="text-xs font-bold text-[#1a1a1a]">John Camargo</div>
                <div className="text-[10px] text-[#555]">CEO, HIPAA Hub</div>
              </div>
            </div>
            
            <div className="w-full mt-8 pt-4 border-t border-transparent px-8">
              <p className="text-[9px] text-[#555]">
                Validate this certificate's authenticity at<br/>
                www.hipaahubhealth.com/verify/{trainingRecord.certificate_id || 'N/A'}<br/>
                Certificate Verification No. {trainingRecord.certificate_id || 'N/A'}<br/><br/>
                © {new Date().getFullYear()} HIPAA Hub Compliance Solutions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Data */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 font-light text-[#0e274e]">
              <User className="h-5 w-5" />
              Employee Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <div>
              <p className="text-sm text-[#565656] font-light">Full Name</p>
              <p className="font-light text-[#0e274e]">{trainingRecord.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-[#565656] font-light">Email</p>
              <p className="font-light text-[#0e274e]">{trainingRecord.email}</p>
            </div>
            <div>
              <p className="text-sm text-[#565656] font-light">Role</p>
              <p className="font-light text-[#0e274e]">{trainingRecord.role_title}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 font-light text-[#0e274e]">
              <Shield className="h-5 w-5" />
              Training Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <div>
              <p className="text-sm text-[#565656] font-light">Score</p>
              <p className="font-light text-2xl text-[#0e274e]">{trainingRecord.quiz_score || 0}%</p>
            </div>
            <div>
              <p className="text-sm text-[#565656] font-light">Status</p>
              <Badge className={isPassed ? 'bg-[#71bc48] text-white rounded-none font-light' : 'bg-red-600 text-white rounded-none font-light'}>
                {isPassed ? 'Passed' : 'Failed'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-[#565656] font-light">Training Type</p>
              <p className="font-light capitalize text-[#0e274e]">{trainingRecord.training_type}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 font-light text-[#0e274e]">
              <Calendar className="h-5 w-5" />
              Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <div>
              <p className="text-sm text-[#565656] font-light">Training Date</p>
              <p className="font-light text-[#0e274e]">
                {new Date(trainingRecord.training_date).toLocaleString()}
              </p>
            </div>
            {trainingRecord.training_start_time && (
              <div>
                <p className="text-sm text-[#565656] font-light">Started</p>
                <p className="font-light text-[#0e274e]">
                  {new Date(trainingRecord.training_start_time).toLocaleString()}
                </p>
              </div>
            )}
            {trainingRecord.training_duration_minutes && (
              <div>
                <p className="text-sm text-[#565656] font-light">Duration</p>
                <p className="font-light text-[#0e274e]">{trainingRecord.training_duration_minutes} minutes</p>
              </div>
            )}
            <div>
              <p className="text-sm text-[#565656] font-light">Expires</p>
              <p className="font-light text-[#0e274e]">
                {new Date(trainingRecord.expiration_date).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 font-light text-[#0e274e]">
              <Globe className="h-5 w-5" />
              Forensic Evidence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <div>
              <p className="text-sm text-[#565656] font-light">IP Address</p>
              <p className="font-mono text-sm font-light text-[#0e274e]">{trainingRecord.acknowledgement_ip || 'N/A'}</p>
            </div>
            {trainingRecord.user_agent && (
              <div>
                <p className="text-sm text-[#565656] font-light">User Agent</p>
                <p className="font-mono text-xs break-all font-light text-[#565656]">{trainingRecord.user_agent}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-[#565656] font-light">Recorded By</p>
              <p className="font-light text-[#0e274e]">{trainingRecord.recorded_by}</p>
            </div>
            <div>
              <p className="text-sm text-[#565656] font-light">Record Timestamp</p>
              <p className="font-light text-[#0e274e]">
                {new Date(trainingRecord.record_timestamp).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Answers Log */}
      {Object.keys(quizAnswers).length > 0 && (
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 font-light text-[#0e274e]">
              <FileText className="h-5 w-5" />
              Complete Quiz Log
            </CardTitle>
            <CardDescription className="text-[#565656] font-light">
              Detailed record of all questions and answers (legal evidence)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6 max-h-[600px] overflow-y-auto">
              {Object.entries(quizAnswers).map(([key, answer]: [string, any]) => (
                <div key={key} className="border-l-4 border-gray-200 pl-4 py-2">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-light text-[#0e274e]">{answer.question}</p>
                      <p className="text-sm text-[#565656] mt-1 font-light">
                        Section: {answer.section_title}
                      </p>
                    </div>
                    {answer.is_correct ? (
                      <Badge className="bg-[#71bc48]/10 text-[#71bc48] border-[#71bc48]/20 rounded-none font-light">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Correct
                      </Badge>
                    ) : (
                      <Badge className="bg-red-50 text-red-600 border-red-200 rounded-none font-light">
                        Incorrect
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 space-y-2">
                    {answer.options?.map((option: string, idx: number) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-none text-sm border ${
                          idx === answer.correct_answer
                            ? 'bg-[#71bc48]/10 border-[#71bc48]/20'
                            : idx === answer.user_answer
                            ? 'bg-red-50 border-red-200'
                            : 'bg-[#f3f5f9] border-gray-200'
                        }`}
                      >
                        <span className="font-light text-[#565656]">
                          {idx === answer.correct_answer && '✓ '}
                          {idx === answer.user_answer && answer.user_answer !== answer.correct_answer && '✗ '}
                          {option}
                        </span>
                        {idx === answer.correct_answer && (
                          <span className="text-[#71bc48] text-xs ml-2 font-light">(Correct Answer)</span>
                        )}
                        {idx === answer.user_answer && (
                          <span className="text-[#00bceb] text-xs ml-2 font-light">(Your Answer)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </>
  );
}
