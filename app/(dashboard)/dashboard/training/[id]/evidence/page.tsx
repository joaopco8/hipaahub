'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

  useEffect(() => {
    async function loadTrainingRecord() {
      try {
        // NOTE: `training_records` is not currently present in `types/db.ts`.
        // Use an untyped query here to avoid TS build failures while still fetching real data.
        const { data, error } = await (supabase as any)
          .from('training_records')
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
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            @media print {
              @page {
                size: letter landscape;
                margin: 0;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: linear-gradient(135deg, #f3f5f9 0%, #e8ecf3 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 20px;
            }
            .certificate-container {
              background: white;
              width: 100%;
              max-width: 1000px;
              padding: 60px 80px;
              box-shadow: 0 20px 60px rgba(12, 11, 29, 0.15);
              border-radius: 8px;
              border: 3px solid #0c0b1d;
              position: relative;
              overflow: hidden;
            }
            .certificate-container::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 8px;
              background: linear-gradient(90deg, #1ad07a 0%, #0c0b1d 100%);
            }
            .certificate-container::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 8px;
              background: linear-gradient(90deg, #0c0b1d 0%, #1ad07a 100%);
            }
            .logo-header {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 40px;
            }
            .logo {
              width: 180px;
              height: auto;
            }
            .certificate-title {
              text-align: center;
              font-size: 42px;
              font-weight: 800;
              color: #0c0b1d;
              letter-spacing: 2px;
              text-transform: uppercase;
              margin-bottom: 12px;
            }
            .certificate-subtitle {
              text-align: center;
              font-size: 20px;
              font-weight: 600;
              color: #1ad07a;
              letter-spacing: 1px;
              margin-bottom: 40px;
              text-transform: uppercase;
            }
            .divider {
              width: 120px;
              height: 3px;
              background: #1ad07a;
              margin: 20px auto;
            }
            .certify-text {
              text-align: center;
              font-size: 16px;
              font-weight: 500;
              color: #52525b;
              margin: 30px 0 20px;
            }
            .trainee-name {
              text-align: center;
              font-size: 38px;
              font-weight: 700;
              color: #0c0b1d;
              margin: 20px 0;
              padding: 0 20px;
              border-bottom: 2px solid #0c0b1d;
              display: inline-block;
              min-width: 400px;
            }
            .trainee-name-container {
              text-align: center;
              margin-bottom: 20px;
            }
            .completion-statement {
              text-align: center;
              font-size: 16px;
              font-weight: 500;
              color: #52525b;
              margin: 20px 0 50px;
              line-height: 1.6;
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px 60px;
              margin: 50px 0;
              padding: 40px;
              background: #f9fafb;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            .detail-item {
              text-align: left;
            }
            .detail-label {
              font-size: 12px;
              font-weight: 700;
              color: #71717a;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 6px;
            }
            .detail-value {
              font-size: 16px;
              font-weight: 600;
              color: #0c0b1d;
            }
            .detail-value.mono {
              font-family: 'Courier New', monospace;
              font-size: 14px;
              color: #1ad07a;
            }
            .seal-section {
              display: flex;
              justify-content: center;
              align-items: center;
              margin-top: 60px;
              padding-top: 30px;
              border-top: 2px solid #e5e7eb;
            }
            .seal {
              text-align: center;
            }
            .seal-icon {
              width: 90px;
              height: 90px;
              background: #0c0b1d;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 12px;
              border: 5px solid #1ad07a;
            }
            .seal-icon-text {
              color: white;
              font-size: 36px;
              font-weight: 800;
            }
            .seal-label {
              font-size: 12px;
              font-weight: 700;
              color: #71717a;
              text-transform: uppercase;
              letter-spacing: 1.5px;
            }
            .footer-info {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 11px;
              color: #a1a1aa;
              line-height: 1.6;
            }
            .footer-info strong {
              color: #71717a;
            }
            .pass-badge {
              display: inline-block;
              background: #1ad07a;
              color: #0c0b1d;
              padding: 8px 20px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 700;
              letter-spacing: 1px;
              margin: 20px 0;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <!-- Logo Header -->
            <div class="logo-header">
              <img src="/images/logoescura.png" alt="HIPAA Hub" class="logo" />
            </div>

            <!-- Certificate Title -->
            <div class="certificate-title">Certificate of Completion</div>
            <div class="certificate-subtitle">HIPAA Security Awareness Training</div>
            <div class="divider"></div>

            <!-- Certification Statement -->
            <div class="certify-text">This document certifies that</div>
            <div class="trainee-name-container">
              <div class="trainee-name">${trainingRecord.full_name}</div>
            </div>
            <div class="completion-statement">
              has successfully completed the mandatory HIPAA Security Awareness Training<br/>
              as required by 45 CFR § 164.308(a)(5) and demonstrated proficiency<br/>
              in protecting Protected Health Information (PHI).
            </div>

            ${(trainingRecord.quiz_score || 0) >= 70 ? '<div class="pass-badge">✓ Passed with ' + (trainingRecord.quiz_score || 0) + '%</div>' : ''}

            <!-- Training Details -->
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Training Date</div>
                <div class="detail-value">${trainingDate}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Quiz Score</div>
                <div class="detail-value">${trainingRecord.quiz_score || 0}%</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Certificate ID</div>
                <div class="detail-value mono">${certificateId}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Policy Version</div>
                <div class="detail-value">${trainingRecord.training_content_version || '1.0'}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Training Type</div>
                <div class="detail-value">${trainingRecord.training_type || 'Annual Compliance'}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Expiration Date</div>
                <div class="detail-value">${new Date(trainingRecord.expiration_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>

            <!-- Digital Seal -->
            <div class="seal-section">
              <div class="seal">
                <div class="seal-icon">
                  <div class="seal-icon-text">✓</div>
                </div>
                <div class="seal-label">Digitally Verified</div>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer-info">
              <strong>Legal Notice:</strong> This certificate serves as official documentation of HIPAA training completion 
              and may be presented as evidence during audits or regulatory reviews.<br/>
              <strong>Completed:</strong> ${completionDateTime} | 
              <strong>IP Address:</strong> ${trainingRecord.acknowledgement_ip || 'N/A'}<br/>
              <strong>Generated:</strong> ${new Date().toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} | 
              HIPAA Hub - Compliance Management System
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-zinc-600">Loading training evidence...</p>
        </div>
      </div>
    );
  }

  if (!trainingRecord) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-zinc-600">Training record not found</p>
            <Button onClick={() => router.back()} className="mt-4 w-full">
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
    <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-0 sm:py-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Training Evidence</h1>
          <p className="text-zinc-600 mt-1">
            Legal evidence and audit trail for {trainingRecord.full_name}
          </p>
        </div>
        <Button onClick={generateCertificate} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Download Certificate
        </Button>
      </div>

      {/* Certificate Preview */}
      <Card className="relative overflow-hidden border-2 border-[#0c0b1d] shadow-lg">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1ad07a] to-[#0c0b1d]" />
        {/* Bottom accent bar */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0c0b1d] to-[#1ad07a]" />
        
        <CardHeader className="pb-4">
          <div className="flex flex-col items-center gap-4">
            <img 
              src="/images/logoescura.png" 
              alt="HIPAA Hub" 
              className="h-16 w-auto"
            />
            <div className="text-center">
              <CardTitle className="text-3xl font-bold text-[#0c0b1d] tracking-wide uppercase">
                Certificate of Completion
              </CardTitle>
              <p className="text-lg font-semibold text-[#1ad07a] mt-2 tracking-wider uppercase">
                HIPAA Security Awareness Training
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 pb-8">
          <div className="space-y-6">
            {/* Certification Statement */}
            <div className="text-center py-6">
              <p className="text-sm font-medium text-zinc-600 mb-3">This document certifies that</p>
              <div className="relative inline-block">
                <p className="text-3xl font-bold text-[#0c0b1d] px-8 py-2 border-b-2 border-[#0c0b1d]">
                  {trainingRecord.full_name}
                </p>
              </div>
              <p className="text-sm font-medium text-zinc-600 mt-4 leading-relaxed max-w-2xl mx-auto">
                has successfully completed the mandatory HIPAA Security Awareness Training<br/>
                as required by 45 CFR § 164.308(a)(5) and demonstrated proficiency<br/>
                in protecting Protected Health Information (PHI).
              </p>
              
              {isPassed && (
                <div className="inline-flex items-center gap-2 bg-[#1ad07a] text-[#0c0b1d] px-6 py-2 rounded-md font-bold text-sm uppercase tracking-wider mt-4">
                  <CheckCircle2 className="h-4 w-4" />
                  Passed with {trainingRecord.quiz_score || 0}%
                </div>
              )}
            </div>

            {/* Training Details Grid */}
            <div className="grid grid-cols-3 gap-6 pt-6 pb-4 bg-zinc-50/50 rounded-lg p-6 border border-zinc-200">
              <div className="text-center">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Training Date</p>
                <p className="text-base font-bold text-[#0c0b1d]">
                  {new Date(trainingRecord.training_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="text-center border-l border-r border-zinc-200">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Certificate ID</p>
                <p className="font-mono text-sm font-bold text-[#1ad07a]">
                  {trainingRecord.certificate_id || 'N/A'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Expires</p>
                <p className="text-base font-bold text-[#0c0b1d]">
                  {new Date(trainingRecord.expiration_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Digital Seal */}
            <div className="flex justify-center pt-8 border-t border-zinc-200">
              <div className="text-center">
                <div className="w-20 h-20 bg-[#0c0b1d] rounded-full flex items-center justify-center border-[5px] border-[#1ad07a] mx-auto mb-3">
                  <CheckCircle2 className="h-10 w-10 text-[#1ad07a]" />
                </div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Digitally Verified</p>
              </div>
            </div>

            {/* Footer Info */}
            <div className="text-center text-xs text-zinc-400 pt-4 border-t border-zinc-100">
              <p className="font-medium text-zinc-500">
                <strong>Legal Notice:</strong> This certificate serves as official documentation of HIPAA training completion
              </p>
              <p className="mt-1">
                Completed: {new Date(trainingRecord.training_date).toLocaleString()} | 
                IP: {trainingRecord.acknowledgement_ip || 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Data */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Employee Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-zinc-600">Full Name</p>
              <p className="font-semibold">{trainingRecord.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-600">Email</p>
              <p className="font-semibold">{trainingRecord.email}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-600">Role</p>
              <p className="font-semibold">{trainingRecord.role_title}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Training Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-zinc-600">Score</p>
              <p className="font-semibold text-2xl">{trainingRecord.quiz_score || 0}%</p>
            </div>
            <div>
              <p className="text-sm text-zinc-600">Status</p>
              <Badge className={isPassed ? 'bg-green-600' : 'bg-red-600'}>
                {isPassed ? 'Passed' : 'Failed'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-zinc-600">Training Type</p>
              <p className="font-semibold capitalize">{trainingRecord.training_type}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-zinc-600">Training Date</p>
              <p className="font-semibold">
                {new Date(trainingRecord.training_date).toLocaleString()}
              </p>
            </div>
            {trainingRecord.training_start_time && (
              <div>
                <p className="text-sm text-zinc-600">Started</p>
                <p className="font-semibold">
                  {new Date(trainingRecord.training_start_time).toLocaleString()}
                </p>
              </div>
            )}
            {trainingRecord.training_duration_minutes && (
              <div>
                <p className="text-sm text-zinc-600">Duration</p>
                <p className="font-semibold">{trainingRecord.training_duration_minutes} minutes</p>
              </div>
            )}
            <div>
              <p className="text-sm text-zinc-600">Expires</p>
              <p className="font-semibold">
                {new Date(trainingRecord.expiration_date).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Forensic Evidence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-zinc-600">IP Address</p>
              <p className="font-mono text-sm font-semibold">{trainingRecord.acknowledgement_ip || 'N/A'}</p>
            </div>
            {trainingRecord.user_agent && (
              <div>
                <p className="text-sm text-zinc-600">User Agent</p>
                <p className="font-mono text-xs break-all">{trainingRecord.user_agent}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-zinc-600">Recorded By</p>
              <p className="font-semibold">{trainingRecord.recorded_by}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-600">Record Timestamp</p>
              <p className="font-semibold">
                {new Date(trainingRecord.record_timestamp).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Answers Log */}
      {Object.keys(quizAnswers).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Complete Quiz Log
            </CardTitle>
            <CardDescription>
              Detailed record of all questions and answers (legal evidence)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 max-h-[600px] overflow-y-auto">
              {Object.entries(quizAnswers).map(([key, answer]: [string, any]) => (
                <div key={key} className="border-l-4 border-zinc-200 pl-4 py-2">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-zinc-900">{answer.question}</p>
                      <p className="text-sm text-zinc-600 mt-1">
                        Section: {answer.section_title}
                      </p>
                    </div>
                    {answer.is_correct ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Correct
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        Incorrect
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 space-y-2">
                    {answer.options?.map((option: string, idx: number) => (
                      <div
                        key={idx}
                        className={`p-2 rounded text-sm ${
                          idx === answer.correct_answer
                            ? 'bg-green-50 border border-green-200'
                            : idx === answer.user_answer
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-zinc-50 border border-zinc-200'
                        }`}
                      >
                        <span className="font-medium">
                          {idx === answer.correct_answer && '✓ '}
                          {idx === answer.user_answer && answer.user_answer !== answer.correct_answer && '✗ '}
                          {option}
                        </span>
                        {idx === answer.correct_answer && (
                          <span className="text-green-700 text-xs ml-2">(Correct Answer)</span>
                        )}
                        {idx === answer.user_answer && (
                          <span className="text-blue-700 text-xs ml-2">(Your Answer)</span>
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
  );
}
