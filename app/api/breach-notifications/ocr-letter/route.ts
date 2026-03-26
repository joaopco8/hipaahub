/**
 * OCR Notification Letter PDF Generator
 * Produces a HIPAA-compliant HHS/OCR breach notification letter (45 CFR § 164.400-414)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';

export interface OCRLetterFields {
  orgName: string;
  orgAddress: string;
  contactName: string;
  contactTitle: string;
  contactPhone: string;
  contactEmail: string;
  breachDiscoveredDate: string;
  breachOccurredDate: string;
  description: string;
  phiTypes: string;
  individualsAffected: number;
  investigationSteps: string;
  preventionSteps: string;
}

// Shared PDF colours
const C = {
  dark:      [12, 11, 29]   as [number, number, number],
  blue:      [0, 188, 235]  as [number, number, number],
  gray:      [86, 86, 86]   as [number, number, number],
  lightGray: [200, 200, 200] as [number, number, number],
  white:     [255, 255, 255] as [number, number, number],
  bgLight:   [245, 247, 250] as [number, number, number],
};

function buildOCRLetterPDF(fields: OCRLetterFields, jsPDF: any): Uint8Array {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin     = 25;
  const cw         = pageWidth - margin * 2;
  const LH         = 5.5;

  let y = 0;

  function pgBreak(needed: number) {
    if (y + needed > pageHeight - margin - 14) {
      doc.addPage();
      y = margin;
    }
  }

  function para(text: string, sectionLabel?: string) {
    if (sectionLabel) {
      pgBreak(LH * 3);
      // Section label bar
      doc.setFillColor(...C.bgLight);
      doc.rect(margin, y, cw, 8, 'F');
      doc.setFillColor(...C.blue);
      doc.rect(margin, y, 3, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...C.dark);
      doc.text(sectionLabel, margin + 6, y + 5.5);
      y += 12;
    }
    if (text) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...C.gray);
      const lines = doc.splitTextToSize(text, cw);
      pgBreak(lines.length * LH + 6);
      lines.forEach((l: string) => { doc.text(l, margin, y); y += LH; });
      y += 4;
    }
  }

  // ── Header bar ───────────────────────────────────────────────────────────
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setFillColor(...C.blue);
  doc.rect(0, 18, pageWidth, 2, 'F');
  doc.setTextColor(...C.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('HIPAA HUB', margin, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Breach Notification — OCR / HHS Letter', pageWidth - margin, 13, { align: 'right' });

  y = 28;

  // ── Sender block ─────────────────────────────────────────────────────────
  doc.setTextColor(...C.dark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(fields.orgName, margin, y); y += LH;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.gray);
  if (fields.orgAddress) {
    const addrLines = doc.splitTextToSize(fields.orgAddress, cw / 2);
    addrLines.forEach((l: string) => { doc.text(l, margin, y); y += LH; });
  }
  if (fields.contactPhone) { doc.text(fields.contactPhone, margin, y); y += LH; }
  if (fields.contactEmail) { doc.text(fields.contactEmail, margin, y); y += LH; }

  y += 4;

  // Date
  doc.setFontSize(9);
  doc.setTextColor(...C.dark);
  doc.text(
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    margin, y
  );
  y += LH * 2;

  // ── Recipient block ───────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.dark);
  doc.text('Director, Office for Civil Rights', margin, y); y += LH;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.gray);
  doc.text('U.S. Department of Health and Human Services', margin, y); y += LH;
  doc.text('200 Independence Avenue, S.W.', margin, y); y += LH;
  doc.text('Washington, D.C. 20201', margin, y); y += LH * 2;

  // ── Subject bar ───────────────────────────────────────────────────────────
  doc.setFillColor(...C.dark);
  doc.rect(margin, y - 1, cw, 9, 'F');
  doc.setFillColor(...C.blue);
  doc.rect(margin, y - 1, 3, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.white);
  doc.text(`RE: HIPAA Breach Notification — ${fields.orgName}`, margin + 6, y + 5);
  y += 14;

  // ── Salutation ────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.gray);
  doc.text('Dear Director,', margin, y);
  y += LH + 4;

  // ── Body sections ─────────────────────────────────────────────────────────
  para(
    `Pursuant to 45 CFR § 164.400-414 of the Health Insurance Portability and Accountability Act ` +
    `(HIPAA) Security Rule and the Health Information Technology for Economic and Clinical Health ` +
    `(HITECH) Act, ${fields.orgName} hereby provides formal written notification of a reportable ` +
    `breach of unsecured protected health information (PHI).`,
    '1. Notification of Breach'
  );

  para(
    `Organization: ${fields.orgName}\n` +
    `Contact Person: ${fields.contactName || 'Privacy Officer'}\n` +
    `Title: ${fields.contactTitle || 'Privacy Officer'}\n` +
    `Phone: ${fields.contactPhone || 'N/A'}\n` +
    `Email: ${fields.contactEmail || 'N/A'}\n` +
    `Address: ${fields.orgAddress || 'N/A'}`,
    '2. Covered Entity Information'
  );

  para(
    `Date Breach Occurred: ${fields.breachOccurredDate || 'Under investigation'}\n` +
    `Date Breach Discovered: ${fields.breachDiscoveredDate || 'N/A'}`,
    '3. Breach Discovery Dates'
  );

  para(fields.description || 'See attached documentation.', '4. Description of the Breach');

  para(fields.phiTypes || 'See attached documentation.', '5. Types of Protected Health Information Involved');

  para(
    fields.individualsAffected > 0
      ? `Approximately ${fields.individualsAffected.toLocaleString()} individuals were affected by this breach.`
      : 'The number of affected individuals is currently under investigation.',
    '6. Number of Individuals Affected'
  );

  para(fields.investigationSteps || 'See attached documentation.', '7. Investigation Steps Taken');

  para(fields.preventionSteps || 'See attached documentation.', '8. Steps to Prevent Future Breaches');

  // Closing paragraph
  pgBreak(LH * 5);
  para(
    `${fields.orgName} is committed to the protection of patient privacy and the security of protected ` +
    `health information. We have taken immediate steps to mitigate harm caused by this breach and will ` +
    `cooperate fully with the Office for Civil Rights in any investigation. If you require additional ` +
    `information, please do not hesitate to contact the individual listed above.`
  );

  // ── Signature block ───────────────────────────────────────────────────────
  pgBreak(LH * 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.gray);
  doc.text('Sincerely,', margin, y); y += LH * 4;

  doc.setDrawColor(...C.lightGray);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + 70, y); y += LH;
  doc.setTextColor(...C.dark);
  doc.setFont('helvetica', 'bold');
  doc.text(fields.contactName || 'Privacy Officer', margin, y); y += LH;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.gray);
  doc.text(fields.contactTitle || 'Privacy Officer', margin, y); y += LH;
  doc.text(fields.orgName, margin, y); y += LH;
  if (fields.contactEmail) { doc.text(fields.contactEmail, margin, y); y += LH; }
  if (fields.contactPhone) { doc.text(fields.contactPhone, margin, y); }

  // ── Footers ───────────────────────────────────────────────────────────────
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(...C.lightGray);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160, 160, 160);
    doc.text(
      'HIPAA Breach Notification — OCR/HHS Letter · Confidential · Generated by HIPAA Hub · hipaahubhealth.com',
      margin,
      pageHeight - 9
    );
    doc.text(`Page ${i} of ${total}`, pageWidth - margin, pageHeight - 9, { align: 'right' });
  }

  return doc.output('arraybuffer') as unknown as Uint8Array;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const fields: OCRLetterFields = await req.json();

    const { default: jsPDF } = await import('jspdf');
    const pdfBuffer = buildOCRLetterPDF(fields, jsPDF);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="OCR_Notification_Letter_${fields.orgName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error('OCR letter generation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate letter' }, { status: 500 });
  }
}
