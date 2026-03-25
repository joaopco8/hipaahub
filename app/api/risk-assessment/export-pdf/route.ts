import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getRiskAssessment, getUser } from '@/utils/supabase/queries';

export async function GET() {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get org
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('user_id', user.id)
      .single();

    const riskAssessment = await getRiskAssessment(supabase, user.id);
    if (!riskAssessment) {
      return NextResponse.json({ error: 'No risk assessment found' }, { status: 404 });
    }

    // Get action items (gaps/remediations)
    const { data: actionItems } = await supabase
      .from('action_items')
      .select('title, description, priority, category, status, hipaa_citation, ocr_risk_if_ignored')
      .eq('user_id', user.id)
      .neq('status', 'completed')
      .order('priority', { ascending: true })
      .limit(50) as any;

    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const checkPage = (needed = 10) => {
      if (y + needed > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    const addLine = (text: string, size = 10, style = 'normal', color = '#333333') => {
      doc.setFontSize(size);
      doc.setFont('helvetica', style);
      const rgb = hexToRgb(color);
      if (rgb) doc.setTextColor(rgb.r, rgb.g, rgb.b);
      const lines = doc.splitTextToSize(text, contentWidth);
      checkPage(lines.length * size * 0.4 + 4);
      doc.text(lines, margin, y);
      y += lines.length * (size * 0.4) + 3;
    };

    function hexToRgb(hex: string) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    }

    const riskLevel = riskAssessment.risk_level as string;
    const riskPct = Number(riskAssessment.risk_percentage || 0).toFixed(1);
    const riskColor = riskLevel === 'low' ? '#71bc48' : riskLevel === 'medium' ? '#fbab18' : '#e2231a';
    const riskLabel = riskLevel === 'low' ? 'Protected' : riskLevel === 'medium' ? 'Partial' : 'At Risk';
    const orgName = org?.name || 'Your Organization';
    const assessmentDate = new Date(riskAssessment.updated_at || riskAssessment.created_at).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    // ─── COVER ───────────────────────────────────────────────────────────
    doc.setFillColor(14, 39, 78);
    doc.rect(0, 0, pageWidth, 55, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('HIPAA Risk Assessment Report', margin, 28);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${orgName}`, margin, 38);
    doc.text(`Assessment Date: ${assessmentDate}`, margin, 46);

    y = 65;

    // ─── SCORE SECTION ───────────────────────────────────────────────────
    addLine('Overall Risk Score', 14, 'bold', '#0e274e');
    y += 2;

    const rgb = hexToRgb(riskColor)!;
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.rect(margin, y, contentWidth, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${riskPct}% — ${riskLabel}`, margin + 6, y + 12);
    y += 24;

    doc.setTextColor(51, 51, 51);
    const riskDesc = riskLevel === 'low'
      ? 'Your organization demonstrates good HIPAA compliance. Continue maintaining current safeguards.'
      : riskLevel === 'medium'
      ? 'Your organization has partial compliance. Address the identified gaps to improve your posture.'
      : 'Your organization has significant compliance gaps. Immediate action is required to mitigate risk.';
    addLine(riskDesc, 10, 'normal', '#555555');
    y += 4;

    // ─── GAP REPORT BY CATEGORY ───────────────────────────────────────────
    addLine('Gap Report by Category', 14, 'bold', '#0e274e');
    y += 2;

    const categories = [
      { key: 'Administrative', label: 'Administrative Safeguards', color: '#00bceb' },
      { key: 'Security', label: 'Technical Safeguards', color: '#0e274e' },
      { key: 'Training', label: 'Workforce & Training', color: '#71bc48' },
      { key: 'Contracts', label: 'Vendor & Business Associates', color: '#fbab18' },
      { key: 'Policies', label: 'Policies & Documentation', color: '#e2231a' },
    ];

    for (const cat of categories) {
      const catItems = (actionItems || []).filter((i: any) => i.category === cat.key);
      if (catItems.length === 0) continue;

      checkPage(20);
      const catRgb = hexToRgb(cat.color)!;
      doc.setFillColor(catRgb.r, catRgb.g, catRgb.b);
      doc.rect(margin, y, 3, 12, 'F');
      doc.setTextColor(14, 39, 78);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(cat.label, margin + 6, y + 8);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`${catItems.length} gap${catItems.length !== 1 ? 's' : ''} identified`, pageWidth - margin - 30, y + 8);
      y += 16;

      for (const item of catItems.slice(0, 8)) {
        checkPage(18);
        const prioColor = item.priority === 'critical' ? '#e2231a' : item.priority === 'high' ? '#fbab18' : '#00bceb';
        const prioRgb = hexToRgb(prioColor)!;
        doc.setFillColor(prioRgb.r, prioRgb.g, prioRgb.b);
        doc.rect(margin + 6, y, contentWidth - 6, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(item.priority?.toUpperCase() || 'MEDIUM', margin + 8, y + 4);
        y += 8;

        doc.setTextColor(14, 39, 78);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        const titleLines = doc.splitTextToSize(item.title, contentWidth - 10);
        doc.text(titleLines, margin + 8, y);
        y += titleLines.length * 4 + 2;

        doc.setTextColor(80, 80, 80);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(item.description, contentWidth - 10);
        checkPage(descLines.length * 4 + 4);
        doc.text(descLines, margin + 8, y);
        y += descLines.length * 4 + 4;

        if (item.hipaa_citation) {
          doc.setTextColor(100, 100, 100);
          doc.setFontSize(7);
          doc.text(`HIPAA Ref: ${item.hipaa_citation}`, margin + 8, y);
          y += 5;
        }
        y += 2;
      }
      y += 4;
    }

    // ─── FOOTER ──────────────────────────────────────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(
        `${orgName} — HIPAA Risk Assessment — Page ${i} of ${totalPages} — Generated ${new Date().toLocaleDateString()}`,
        margin, pageHeight - 8
      );
    }

    const pdfBytes = doc.output('arraybuffer');
    const fileName = `HIPAA_Risk_Assessment_${orgName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error generating risk assessment PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
