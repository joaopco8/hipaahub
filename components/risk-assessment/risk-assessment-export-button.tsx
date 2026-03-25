'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

export function RiskAssessmentExportButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/risk-assessment/export-pdf');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HIPAA_Risk_Assessment_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      className="rounded-none border-gray-200 text-[#565656]"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-1.5" />
      )}
      Export PDF
    </Button>
  );
}
