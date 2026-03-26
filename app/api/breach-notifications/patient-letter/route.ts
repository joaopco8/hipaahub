/**
 * Patient Notification Letter PDF Generator
 * Produces a HIPAA-compliant individual notification letter (45 CFR § 164.404)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';

export interface PatientLetterFields {
  orgName: string;
  orgAddress: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  whatHappened: string;
  whatInfoInvolved: string;
  whatWeAreDoing: string;
  whatYouCanDo: string;
  forMoreInfo: string;
  breachDiscoveredDate: string;
}

const C = {
  dark:      [12, 11, 29]   as [number, number, number],
  blue:      [0, 188, 235]  as [number, number, number],
  green:     [113, 188, 72] as [number, number, number],
  gray:      [86, 86, 86]   as [number, number, number],
  lightGray: [200, 200, 200] as [number, number, number],
  white:     [255, 255, 255] as [number, number, number],
  bgLight:   [245, 247, 250] as [number, number, number],
};

function buildPatientLetterPDF(fields: PatientLetterFields, jsPDF: any): Uint8Array {
  const doc        = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
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

  function section(title: string, icon: string, body: string) {
    pgBreak(LH * 6);

    // Section header bar
    doc.setFillColor(...C.dark);
    doc.rect(margin, y, cw, 9, 'F');
    doc.setFillColor(...C.blue);
    doc.rect(margin, y, 3, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C.white);
    doc.text(`${icon}  ${title}`, margin + 6, y + 6);
    y += 13;

    // Body
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...C.gray);
    const lines = doc.splitTextToSize(body, cw);
    pgBreak(lines.length * LH + 6);
    lines.forEach((l: string) => { doc.text(l, margin, y); y += LH; });
    y += 6;
  }

  // ── Header bar ────────────────────────────────────────────────────────────
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
  doc.text('Important Notice — Breach of Unsecured Protected Health Information', pageWidth - margin, 13, { align: 'right' });

  y = 28;

  // ── Sender block ──────────────────────────────────────────────────────────
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

  y += 3;
  doc.setFontSize(9);
  doc.setTextColor(...C.dark);
  doc.text(
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    margin, y
  ); y += LH * 2;

  // ── Notice title ──────────────────────────────────────────────────────────
  doc.setFillColor(...C.dark);
  doc.rect(margin, y - 1, cw, 11, 'F');
  doc.setFillColor(...C.blue);
  doc.rect(margin, y - 1, 3, 11, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.white);
  doc.text('NOTICE OF BREACH OF UNSECURED PROTECTED HEALTH INFORMATION', margin + 6, y + 6.5);
  y += 16;

  // ── Opening ───────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...C.gray);
  const openingText = `We are writing to inform you of a data security incident that may have involved your protected health information. We take the privacy and security of your information very seriously and are providing this notice as required by the Health Insurance Portability and Accountability Act (HIPAA). This notice was issued on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`;
  const openingLines = doc.splitTextToSize(openingText, cw);
  openingLines.forEach((l: string) => { doc.text(l, margin, y); y += LH; });
  y += 6;

  // ── Five required sections ─────────────────────────────────────────────
  section('WHAT HAPPENED', '01.', fields.whatHappened || 'Please see attached documentation.');
  section('WHAT INFORMATION WAS INVOLVED', '02.', fields.whatInfoInvolved || 'Please see attached documentation.');
  section('WHAT WE ARE DOING', '03.', fields.whatWeAreDoing || 'Please see attached documentation.');
  section('WHAT YOU CAN DO', '04.', fields.whatYouCanDo || 'Please see attached documentation.');
  section('FOR MORE INFORMATION', '05.',
    (fields.forMoreInfo || '') +
    (fields.contactName ? `\n\nContact: ${fields.contactName}` : '') +
    (fields.contactPhone ? `\nPhone: ${fields.contactPhone}` : '') +
    (fields.contactEmail ? `\nEmail: ${fields.contactEmail}` : '')
  );

  // ── Closing ───────────────────────────────────────────────────────────────
  pgBreak(LH * 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.gray);
  const closing = `We sincerely apologize for any inconvenience or concern this may cause. ${fields.orgName} is committed to protecting the privacy and security of your information and has taken, and continues to take, steps to prevent a similar event from occurring in the future.`;
  const closingLines = doc.splitTextToSize(closing, cw);
  closingLines.forEach((l: string) => { doc.text(l, margin, y); y += LH; });
  y += LH * 4;

  doc.text('Sincerely,', margin, y); y += LH * 4;

  doc.setDrawColor(...C.lightGray);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + 70, y); y += LH;
  doc.setTextColor(...C.dark);
  doc.setFont('helvetica', 'bold');
  doc.text(fields.contactName || 'Privacy Officer', margin, y); y += LH;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.gray);
  doc.text('Privacy Officer', margin, y); y += LH;
  doc.text(fields.orgName, margin, y);

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
      `HIPAA Patient Notification Letter · ${fields.orgName} · Generated by HIPAA Hub · hipaahubhealth.com`,
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

    const fields: PatientLetterFields = await req.json();

    const { default: jsPDF } = await import('jspdf');
    const pdfBuffer = buildPatientLetterPDF(fields, jsPDF);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Patient_Notification_Letter_${fields.orgName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error('Patient letter generation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate letter' }, { status: 500 });
  }
}
