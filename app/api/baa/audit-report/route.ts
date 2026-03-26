import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { getUserPlanTier, isPracticePlus } from '@/lib/plan-gating';
import { getVendorsWithBAA } from '@/app/actions/baa-tracker';
import type { VendorWithBAA } from '@/app/actions/baa-tracker';

export async function GET(_request: NextRequest) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const planTier = await getUserPlanTier();
    if (!isPracticePlus(planTier)) {
      return NextResponse.json({ error: 'Practice plan required' }, { status: 403 });
    }

    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('user_id', user.id)
      .single();

    const vendors = await getVendorsWithBAA();

    const active       = vendors.filter((v) => v.computed_status === 'active');
    const expiringSoon = vendors.filter((v) => v.computed_status === 'expiring_soon');
    const expired      = vendors.filter((v) => v.computed_status === 'expired');
    const notSigned    = vendors.filter((v) => v.computed_status === 'not_signed');

    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const W = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = margin;

    const checkPage = (needed: number) => {
      if (y + needed > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = margin;
      }
    };

    // ── Header ──
    doc.setFillColor(14, 39, 78);
    doc.rect(0, 0, W, 36, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('BAA Compliance Audit Report', margin, 18);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${org?.name ?? 'Organization'}  ·  Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      margin, 28
    );
    y = 50;

    // ── Summary ──
    doc.setFillColor(243, 245, 249);
    doc.rect(margin, y, W - margin * 2, 22, 'F');
    doc.setTextColor(14, 39, 78);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${vendors.length} Total Vendors`, margin + 6, y + 9);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(86, 86, 86);
    doc.text(
      `Active: ${active.length}   Expiring Soon: ${expiringSoon.length}   Expired: ${expired.length}   No BAA: ${notSigned.length}`,
      margin + 6, y + 17
    );
    y += 30;

    // ── Section helper ──
    const renderSection = (
      title: string,
      items: VendorWithBAA[],
      headerColor: [number, number, number]
    ) => {
      if (!items.length) return;
      checkPage(24);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...headerColor);
      doc.text(`${title} (${items.length})`, margin, y);
      y += 6;

      // Column headers
      doc.setFillColor(...headerColor);
      doc.rect(margin, y, W - margin * 2, 7.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      const cols = [margin + 2, margin + 72, margin + 112, margin + 150];
      doc.text('Vendor', cols[0], y + 5.5);
      doc.text('Service Type', cols[1], y + 5.5);
      doc.text('Signed Date', cols[2], y + 5.5);
      doc.text('Expiration', cols[3], y + 5.5);
      y += 8.5;

      let rowBg = false;
      for (const v of items) {
        checkPage(8);
        if (rowBg) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y, W - margin * 2, 7, 'F');
        }
        rowBg = !rowBg;

        doc.setTextColor(30, 30, 30);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(v.vendor_name.substring(0, 28), cols[0], y + 5);
        doc.text((v.service_type ?? '—').substring(0, 20), cols[1], y + 5);
        doc.text(v.baa?.signed_date ? new Date(v.baa.signed_date).toLocaleDateString() : '—', cols[2], y + 5);
        const expText = v.baa?.no_expiration ? 'No expiration' :
          v.baa?.expiration_date ? new Date(v.baa.expiration_date).toLocaleDateString() : '—';
        doc.text(expText, cols[3], y + 5);
        y += 7.5;
      }
      y += 8;
    };

    renderSection('Active BAAs',       active,       [22, 163, 74]);
    renderSection('Expiring BAAs',      expiringSoon, [217, 119, 6]);
    renderSection('Expired BAAs',       expired,      [220, 38, 38]);
    renderSection('No BAA on File',     notSigned,    [107, 114, 128]);

    // ── Footer ──
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(160, 160, 160);
      doc.text(
        `HIPAA Hub — BAA Audit Report  ·  ${org?.name ?? ''}  ·  Page ${i} of ${pageCount}`,
        W / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' }
      );
    }

    const pdfBytes = doc.output('arraybuffer');
    const fileName = `BAA_Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`;

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('BAA audit report error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
