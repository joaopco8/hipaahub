'use client';

/**
 * Evidence Upload Component
 * Handles upload of all 7 evidence types for OCR-grade compliance
 */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, File, Link as LinkIcon, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { EvidenceType } from '@/types/evidence';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EvidenceUploadProps {
  questionId: string;
  riskAssessmentId: string;
  answer: string;
  evidenceRequired: boolean;
  evidenceTypes: EvidenceType[];
  instructions: string;
  onUploadComplete?: () => void;
}

export function EvidenceUpload({
  questionId,
  riskAssessmentId,
  answer,
  evidenceRequired,
  evidenceTypes,
  instructions,
  onUploadComplete
}: EvidenceUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [attestationChecked, setAttestationChecked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('question_id', questionId);
      formData.append('risk_assessment_id', riskAssessmentId);
      formData.append('answer', answer);

      // Handle file uploads
      if (evidenceTypes.includes('document') || evidenceTypes.includes('screenshot') || evidenceTypes.includes('log')) {
        if (!selectedFile) {
          throw new Error('Please select a file to upload');
        }
        formData.append('file', selectedFile);
        formData.append('evidence_type', evidenceTypes.find(t => ['document', 'screenshot', 'log'].includes(t)) || 'document');
      }

      // Handle link
      if (evidenceTypes.includes('link')) {
        if (!linkUrl) {
          throw new Error('Please provide a link URL');
        }
        formData.append('link', linkUrl);
        formData.append('evidence_type', 'link');
      }

      // Handle attestation
      if (evidenceTypes.includes('attestation')) {
        if (!attestationChecked) {
          throw new Error('Please confirm the attestation');
        }
        formData.append('attestation', JSON.stringify({
          signer_name: 'User', // Will be replaced with actual user name
          signer_role: 'User'
        }));
        formData.append('evidence_type', 'attestation');
      }

      const response = await fetch('/api/evidence/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload evidence');
      }

      setUploaded(true);
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload evidence');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          {evidenceRequired ? 'Evidence Required' : 'Optional Evidence'}
        </CardTitle>
        <CardDescription className="text-xs text-zinc-600">
          {instructions}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        {(evidenceTypes.includes('document') || evidenceTypes.includes('screenshot') || evidenceTypes.includes('log')) && (
          <div className="space-y-2">
            <Label htmlFor={`file-${questionId}`}>
              {evidenceTypes.includes('document') && 'Document'}
              {evidenceTypes.includes('screenshot') && 'Screenshot'}
              {evidenceTypes.includes('log') && 'Log File'}
              {evidenceTypes.includes('vendor_proof') && 'Vendor Proof'}
            </Label>
            <Input
              id={`file-${questionId}`}
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept={
                evidenceTypes.includes('document') ? '.pdf,.doc,.docx' :
                evidenceTypes.includes('screenshot') ? '.png,.jpg,.jpeg' :
                evidenceTypes.includes('log') ? '.csv,.json,.txt,.log' :
                '*'
              }
              className="cursor-pointer"
            />
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <File className="h-4 w-4" />
                <span>{selectedFile.name}</span>
                <span className="text-zinc-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>
        )}

        {/* Link Input */}
        {evidenceTypes.includes('link') && (
          <div className="space-y-2">
            <Label htmlFor={`link-${questionId}`}>Secure Link (URL)</Label>
            <div className="flex gap-2">
              <Input
                id={`link-${questionId}`}
                type="url"
                placeholder="https://vendor-portal.example.com/audit-report"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <LinkIcon className="h-4 w-4 text-zinc-400 mt-2" />
            </div>
          </div>
        )}

        {/* Attestation Checkbox */}
        {evidenceTypes.includes('attestation') && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={attestationChecked}
                onChange={(e) => setAttestationChecked(e.target.checked)}
                className="h-4 w-4"
              />
              <span>I attest that the information provided is accurate and complete</span>
            </Label>
            <p className="text-xs text-zinc-500">
              This is a legally binding attestation. Your IP address and timestamp will be recorded.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {uploaded && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Evidence uploaded successfully. This will be retained for 7 years for audit purposes.
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Button */}
        {!uploaded && (
          <Button
            onClick={handleUpload}
            disabled={uploading || (evidenceRequired && !selectedFile && !linkUrl && !attestationChecked)}
            variant={evidenceRequired ? 'default' : 'outline'}
            className="w-full"
          >
            {uploading ? (
              <>Uploading...</>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {evidenceRequired ? 'Upload Evidence' : 'Upload Optional Evidence'}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
