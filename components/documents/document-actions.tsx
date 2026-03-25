'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer, Loader2, Lock } from 'lucide-react';
import { generatePolicyPDF, downloadPolicyPDF } from '@/lib/policy-pdf-generator';
import { markPolicyAsGenerated } from '@/app/actions/policy-documents';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import { toast } from 'sonner';

interface DocumentActionsProps {
  onPrint?: () => void;
  onDownload?: () => void;
  documentTitle?: string;
  documentContent?: string;
  organizationName?: string;
  policyId?: string;
  /** Numeric ID (1–9) used to mark generation status in the DB */
  policyNumericId?: number;
  /** Lock PDF download for users without an active paid subscription */
  isLocked?: boolean;
  /** Version number to embed in PDF metadata */
  versionNumber?: number | string;
  /** Activation date (ISO string) to embed in PDF metadata */
  activationDate?: string;
}

export function DocumentActions({
  onPrint,
  onDownload,
  documentTitle = 'HIPAA Policy Document',
  documentContent = '',
  organizationName = 'Organization',
  policyId,
  policyNumericId,
  isLocked = false,
  versionNumber,
  activationDate,
}: DocumentActionsProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownload = async () => {
    if (isLocked) {
      setShowUpgradeModal(true);
      return;
    }

    if (onDownload) {
      onDownload();
      return;
    }

    if (!documentContent) {
      toast.error('Document content is not available for download');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const pdfBlob = await generatePolicyPDF({
        documentTitle,
        content: documentContent,
        organizationName,
        policyId,
        generatedDate: new Date(),
        versionNumber,
        activationDate,
      });

      const filename = `${documentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPolicyPDF(pdfBlob, filename);

      // Mark as generated in DB if we have a numeric policy ID
      if (policyNumericId) {
        try {
          await markPolicyAsGenerated(policyNumericId, documentTitle, documentContent);
        } catch {
          // Non-blocking — download already succeeded
        }
      }

      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={isGeneratingPDF || (!isLocked && !documentContent)}
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : isLocked ? (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Download PDF
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </>
          )}
        </Button>
      </div>
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="PDF download"
      />
    </>
  );
}
