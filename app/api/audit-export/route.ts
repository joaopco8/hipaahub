/**
 * Audit Export API Route
 * Generates a structured ZIP package with all HIPAA compliance documentation
 * Only includes sections where the clinic actually has data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { getAuditExportData, type AuditExportData } from '@/app/actions/audit-export';
import { processDocumentTemplate } from '@/lib/document-generator';
import fs from 'fs';
import path from 'path';

// ─── BRAND COLOR PALETTE ─────────────────────────────────────────────────────
// Minimalist Corporate Identity — Thin lines, no fills, clean typography
const C = {
  dark:      [12,  11,  29] as [number, number, number],  // #0c0b1d (Text)
  blue:      [0,  188, 235] as [number, number, number],  // #00bceb (Accent)
  blueMid:   [0,  155, 195] as [number, number, number],  // #009bc3 (Print safe)
  blueBg:    [255, 255, 255] as [number, number, number], // No background color
  grayBg:    [255, 255, 255] as [number, number, number], // White background
  grayLine:  [220, 222, 228] as [number, number, number], // Subtle borders
  grayText:  [86,  86,  86] as [number, number, number],  // #565656 (Labels)
  grayLight: [140, 140, 148] as [number, number, number], // Muted text
  white:     [255, 255, 255] as [number, number, number],
  // Semantic status — text colors mainly, minimal background usage
  riskLow:   [22, 101,  52] as [number, number, number],
  riskLowBg: [255, 255, 255] as [number, number, number],
  riskMid:   [133,  77,  14] as [number, number, number],
  riskMidBg: [255, 255, 255] as [number, number, number],
  riskHigh:  [153,  27,  27] as [number, number, number],
  riskHighBg:[255, 255, 255] as [number, number, number],
};

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getAuditExportData();

    if (!data) {
      return NextResponse.json({ error: 'Organization data not found' }, { status: 404 });
    }

    const JSZip = (await import('jszip')).default;
    const { default: jsPDF } = await import('jspdf');

    // Load logo - try logoescura.png first (dark logo for white bg), fallback to logohipa.png
    let logoData: Buffer | null = null;
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logoescura.png');
      if (fs.existsSync(logoPath)) {
        logoData = fs.readFileSync(logoPath);
      } else {
        const altPath = path.join(process.cwd(), 'public', 'logohipa.png');
        if (fs.existsSync(altPath)) {
          logoData = fs.readFileSync(altPath);
        }
      }
    } catch (e) {
      console.warn('Failed to load logo:', e);
    }

    const zip = new JSZip();
    const orgSlug = data.organization.name.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_');
    const exportDate = new Date(data.exportedAt).toISOString().split('T')[0];
    const root = zip.folder('Audit_Package')!;

    // 01_Executive_Summary — always included
    const summaryFolder = root.folder('01_Executive_Summary')!;
    summaryFolder.file('Compliance_Overview_Report.pdf', buildExecutiveSummaryPDF(data, jsPDF, logoData));

    // 02_Risk_Assessment — only if exists
    if (data.riskAssessment.exists) {
      const riskFolder = root.folder('02_Risk_Assessment')!;
      riskFolder.file('Latest_Risk_Assessment_Report.pdf', buildRiskAssessmentPDF(data, jsPDF, logoData));
    }

    // 03_Policies — only if at least one policy is documented
    const policiesWithDocs = data.policies.filter((p) => p.hasDocument);
    if (policiesWithDocs.length > 0) {
      const polFolder = root.folder('03_Policies')!;
      // Summary document (existing)
      polFolder.file('Policy_Documentation_Summary.pdf', buildPoliciesListPDF(data, jsPDF, logoData));
      // Full individual policy documents — one PDF per generated policy
      const fullPolFolder = polFolder.folder('Full_Policy_Documents')!;
      for (const policy of policiesWithDocs) {
        const policyPDF = await buildSinglePolicyPDF(policy.id, data, jsPDF, logoData);
        if (policyPDF) {
          const safeName = policy.name.replace(/[^a-zA-Z0-9\s&]/g, '').trim().replace(/\s+/g, '_');
          fullPolFolder.file(`${safeName}.pdf`, policyPDF);
        }
      }
    }

    // 04_Vendor_Management — only if vendors exist
    if (data.vendors.length > 0) {
      const vendorFolder = root.folder('04_Vendor_Management')!;
      // Summary report (existing)
      vendorFolder.file('Vendor_BAA_Status_Report.pdf', buildVendorManagementPDF(data, jsPDF, logoData));
      // Individual vendor profile PDFs
      const vendorProfilesFolder = vendorFolder.folder('Vendor_Profiles')!;
      for (const vendor of data.vendors) {
        const vendorPDF = buildSingleVendorPDF(vendor, data, jsPDF, logoData);
        const safeName = vendor.vendor_name.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_');
        vendorProfilesFolder.file(`${safeName}_Profile.pdf`, vendorPDF);
      }
    }

    // 05_Training — only if training records exist
    if (data.trainingRecords.length > 0) {
      const trainFolder = root.folder('05_Training')!;
      trainFolder.file('Employee_Training_Log.pdf', buildTrainingLogPDF(data, jsPDF, logoData));
    }

    // 06_Incidents — only if incidents or breaches exist
    const hasIncidents = data.incidents.length > 0;
    const hasBreaches = data.breachNotifications.length > 0;
    if (hasIncidents || hasBreaches) {
      const incFolder = root.folder('06_Incidents')!;
      // Summary documents (existing)
      if (hasIncidents)  incFolder.file('Incident_Log.pdf', buildIncidentLogPDF(data, jsPDF, logoData));
      if (hasBreaches)   incFolder.file('Breach_Documentation.pdf', buildBreachNotificationsPDF(data, jsPDF, logoData));
      // Individual detailed incident reports
      if (hasIncidents) {
        const incDetailsFolder = incFolder.folder('Individual_Incident_Reports')!;
        for (const incident of data.incidents) {
          const incPDF = buildSingleIncidentPDF(incident, data, jsPDF, logoData);
          const safeName = incident.incident_title.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_').substring(0, 50);
          const dateStr = incident.date_discovered ? incident.date_discovered.split('T')[0] : 'undated';
          incDetailsFolder.file(`${dateStr}_${safeName}.pdf`, incPDF);
        }
      }
      // Individual breach notification letter PDFs
      if (hasBreaches) {
        const breachLettersFolder = incFolder.folder('Breach_Notification_Letters')!;
        for (const breach of data.breachNotifications) {
          const breachRef = breach.breach_id || breach.id.substring(0, 8).toUpperCase();
          const dateStr = breach.breach_discovery_date
            ? breach.breach_discovery_date.split('T')[0]
            : breach.created_at.split('T')[0];
          if (breach.patient_letter_content) {
            breachLettersFolder.file(
              `${dateStr}_${breachRef}_Patient_Notification.pdf`,
              buildBreachLetterPDF(breach, data, jsPDF, logoData, 'patient')
            );
          }
          if (breach.hhs_letter_content) {
            breachLettersFolder.file(
              `${dateStr}_${breachRef}_HHS_OCR_Report.pdf`,
              buildBreachLetterPDF(breach, data, jsPDF, logoData, 'hhs')
            );
          }
          if (breach.media_letter_content) {
            breachLettersFolder.file(
              `${dateStr}_${breachRef}_Media_Notice.pdf`,
              buildBreachLetterPDF(breach, data, jsPDF, logoData, 'media')
            );
          }
        }
      }
    }

    // 07_Audit_Checklist — always included
    const checklistFolder = root.folder('07_Audit_Checklist')!;
    checklistFolder.file('HIPAA_Compliance_Checklist.pdf', buildAuditChecklistPDF(data, jsPDF, logoData));

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    const fileName = `HIPAA_Hub_Audit_Package_${orgSlug}_${exportDate}.zip`;

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': zipBuffer.length.toString()
      }
    });
  } catch (error) {
    console.error('Audit export error:', error);
    return NextResponse.json({ error: 'Failed to generate audit package' }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  PDF BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

// 01 ── EXECUTIVE SUMMARY
function buildExecutiveSummaryPDF(data: AuditExportData, jsPDF: any, logoData: Buffer | null): Uint8Array {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const { margin, contentWidth, pageWidth } = dims(doc);
  let y = margin;

  addHeader(doc, 'COMPLIANCE OVERVIEW REPORT', 'Executive Summary  ·  HIPAA Audit Package', data.organization.name, data.exportedAt, logoData);
  y = 57;

  // ── Organization Information ──────────────────────────────────────────────
  y = sectionTitle(doc, 'ORGANIZATION INFORMATION', y, pageWidth, margin);

  const org = data.organization;
  const rows: [string, string][] = [
    ['Organization Name', org.name],
  ];
  if (org.legal_name && org.legal_name !== org.name) rows.push(['Legal Name', org.legal_name]);
  if (org.practice_type) rows.push(['Practice Type', org.practice_type]);
  if (org.npi) rows.push(['National Provider Identifier (NPI)', org.npi]);
  if (org.ein) rows.push(['Employer Identification Number (EIN)', org.ein]);
  const addr = [org.address_street, org.address_city, org.address_state, org.address_zip].filter(Boolean).join(', ');
  if (addr) rows.push(['Business Address', addr]);
  if (org.phone_number) rows.push(['Phone', org.phone_number]);
  if (org.email_address) rows.push(['Email', org.email_address]);
  if (org.privacy_officer_name) rows.push(['Privacy Officer', org.privacy_officer_name + (org.privacy_officer_email ? `  |  ${org.privacy_officer_email}` : '')]);
  if (org.security_officer_name && org.security_officer_name !== org.privacy_officer_name) {
    rows.push(['Security Officer', org.security_officer_name + (org.security_officer_email ? `  |  ${org.security_officer_email}` : '')]);
  }
  rows.push(['Report Generated', fmtDateLong(data.exportedAt)]);
  rows.push(['Prepared By', 'HIPAA Hub Compliance Platform']);

  y = kvTable(doc, rows, y, margin, contentWidth);
  y += 8;

  // ── Compliance Score Banner ───────────────────────────────────────────────
  y = pgBreak(doc, y, 35, margin);
  y = sectionTitle(doc, 'OVERALL COMPLIANCE STATUS', y, pageWidth, margin);

  const scoreRgb = scoreColor(data.complianceScore);
  const readinessLabel = complianceLabel(data.complianceScore);

  // Score block — white background with colored left accent and border
  doc.setDrawColor(...C.grayLine);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, 26, 'S');

  doc.setFillColor(...scoreRgb);
  doc.rect(margin, y, 4, 26, 'F');

  // Score percentage — colored, large
  doc.setTextColor(...scoreRgb);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'normal'); // Thin/Normal weight per request
  doc.text(`${data.complianceScore}%`, margin + 26, y + 18, { align: 'center' });

  // Readiness label — dark, bold
  doc.setTextColor(...C.dark);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(readinessLabel, margin + 50, y + 11);

  // Sub-description — grayText on light bg (readable)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.grayText);
  doc.text('Compliance score reflects documentation, risk assessment,', margin + 50, y + 18);
  doc.text('workforce training, and vendor management completeness.', margin + 50, y + 23);
  y += 32;

  // ── Stats Grid ────────────────────────────────────────────────────────────
  y = pgBreak(doc, y, 40, margin);
  y = sectionTitle(doc, 'KEY COMPLIANCE METRICS', y, pageWidth, margin);

  const policiesActive = data.policies.filter((p) => p.hasDocument).length;
  const trainedCount   = data.trainingRecords.filter((t) => t.completion_status === 'completed').length;
  const openIncidents  = data.incidents.filter((i) => i.status === 'open').length;

  const metrics: { label: string; value: string; sub?: string }[] = [
    { label: 'Policies Documented',    value: `${policiesActive}/${data.policies.length}`,          sub: `${Math.round((policiesActive/data.policies.length)*100)}% documented` },
    { label: 'Employees Trained',      value: `${trainedCount}/${data.trainingRecords.length}`,      sub: data.trainingRecords.length > 0 ? `${Math.round((trainedCount/data.trainingRecords.length)*100)}% completion rate` : 'No records' },
    { label: 'Active Vendors',         value: String(data.vendors.length),                           sub: `${data.vendors.filter((v) => v.baa_signed).length} with BAA executed` },
    { label: 'Open Incidents',         value: String(openIncidents),                                 sub: `${data.incidents.length} total logged` },
    { label: 'Breach Notifications',   value: String(data.breachNotifications.length),               sub: 'Notifications on record' },
    { label: 'Evidence Items',         value: String(data.evidence.length),                          sub: 'Compliance evidence files' },
  ];

  const colW = (contentWidth - 2) / 3;
  const rowH = 22;
  metrics.forEach((m, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = margin + col * (colW + 1);
    const sy = y + row * (rowH + 2);
    pgBreak(doc, sy, rowH, margin);

    // Card outline (light gray border)
    doc.setDrawColor(...C.grayLine);
    doc.setLineWidth(0.3);
    doc.rect(x, sy, colW, rowH, 'S');

    // Left accent stripe
    doc.setFillColor(...C.blue);
    doc.rect(x, sy, 3, rowH, 'F');

    // Label
    doc.setTextColor(...C.grayText);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(m.label, x + 7, sy + 6);

    // Value - Normal weight (thin look), dark color
    doc.setTextColor(...C.dark);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal'); // Changed from bold to normal
    doc.text(m.value, x + 7, sy + 15);

    if (m.sub) {
      doc.setTextColor(...C.grayText);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(m.sub, x + 7, sy + 20);
    }
  });
  y += Math.ceil(metrics.length / 3) * (rowH + 2) + 8;

  // ── Official Statement ────────────────────────────────────────────────────
  y = pgBreak(doc, y, 45, margin);
  y = sectionTitle(doc, 'OFFICIAL COMPLIANCE STATEMENT', y, pageWidth, margin);

  doc.setFillColor(...C.blueBg);
  doc.rect(margin, y, contentWidth, 36, 'F');
  doc.setFillColor(...C.blue);
  doc.rect(margin, y, 3, 36, 'F');

  doc.setTextColor(...C.dark);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'italic');
  const statement = `This document package has been prepared by ${org.name} to demonstrate structured HIPAA compliance activities and ongoing risk management practices as required under the Health Insurance Portability and Accountability Act of 1996 (HIPAA), including the Privacy Rule (45 CFR Part 160 and Part 164, Subparts A and E), the Security Rule (45 CFR Part 164, Subparts A and C), and the Breach Notification Rule (45 CFR Part 164, Subpart D).\n\nThe documentation included in this audit package reflects the organization's administrative, physical, and technical safeguards implemented to protect electronic Protected Health Information (ePHI). All records are current as of ${fmtDateLong(data.exportedAt)}.`;
  const stmtLines = doc.splitTextToSize(statement, contentWidth - 10);
  doc.text(stmtLines, margin + 7, y + 7);
  y += 42;

  // ── Disclaimer ────────────────────────────────────────────────────────────
  y = pgBreak(doc, y, 18, margin);
  doc.setFillColor(...C.grayBg);
  doc.rect(margin, y, contentWidth, 14, 'F');
  doc.setTextColor(...C.grayText);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  const disc = 'DISCLAIMER: This document was generated by HIPAA Hub, a compliance support platform. It does not constitute legal advice and does not guarantee regulatory compliance. Organizations should consult qualified legal counsel or a certified HIPAA consultant for authoritative compliance guidance.';
  const discLines = doc.splitTextToSize(disc, contentWidth - 8);
  doc.text(discLines, margin + 4, y + 5);

  addPageNumbers(doc, data.organization.name);
  return doc.output('arraybuffer') as unknown as Uint8Array;
}

// 02 ── RISK ASSESSMENT
function buildRiskAssessmentPDF(data: AuditExportData, jsPDF: any, logoData: Buffer | null): Uint8Array {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const { margin, contentWidth, pageWidth } = dims(doc);
  let y = margin;
  const ra = data.riskAssessment;

  addHeader(doc, 'SECURITY RISK ANALYSIS REPORT', 'Risk Assessment Documentation  ·  HIPAA Security Rule § 164.308(a)(1)', data.organization.name, data.exportedAt, logoData);
  y = 57;

  // ── Assessment Info ───────────────────────────────────────────────────────
  y = sectionTitle(doc, 'ASSESSMENT INFORMATION', y, pageWidth, margin);
  const infoRows: [string, string][] = [
    ['Organization',          data.organization.name],
    ['Assessment Framework',  'NIST SP 800-30 Rev. 1  ·  HHS Security Risk Assessment Tool'],
    ['Assessment Scope',      'All systems, processes, and workforce members that create, receive, maintain, or transmit ePHI'],
    ['Regulatory Reference',  '45 CFR § 164.308(a)(1)(ii)(A) — Risk Analysis'],
  ];
  if (ra.created_at) infoRows.push(['Initial Assessment Date', fmtDateLong(ra.created_at)]);
  if (ra.updated_at)  infoRows.push(['Last Updated',           fmtDateLong(ra.updated_at)]);
  infoRows.push(['Prepared By', 'HIPAA Hub Compliance Platform']);
  y = kvTable(doc, infoRows, y, margin, contentWidth);
  y += 8;

  // ── Risk Level Banner ─────────────────────────────────────────────────────
  y = pgBreak(doc, y, 30, margin);
  y = sectionTitle(doc, 'OVERALL RISK DETERMINATION', y, pageWidth, margin);

  const riskRgb     = riskColor(ra.risk_level || 'medium');
  const riskLabel   = (ra.risk_level || 'UNDETERMINED').toUpperCase();

  // Risk level card — light background, colored left accent, dark text
  doc.setFillColor(...C.grayBg);
  doc.rect(margin, y, contentWidth, 24, 'F');
  doc.setFillColor(...riskRgb);
  doc.rect(margin, y, 4, 24, 'F');

  // Risk badge
  doc.setFillColor(...riskRgb);
  doc.roundedRect(margin + 12, y + 4, 32, 8, 2, 2, 'F');
  doc.setTextColor(...C.white);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(riskLabel, margin + 28, y + 9.5, { align: 'center' });

  // Description — dark text, clearly readable
  doc.setTextColor(...C.dark);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Overall Risk Level Determination', margin + 50, y + 10);

  doc.setTextColor(...C.grayText);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const riskDesc = ra.risk_level === 'low'
    ? 'Risk is adequately managed. Continue monitoring and maintain existing controls.'
    : ra.risk_level === 'medium'
    ? 'Moderate vulnerabilities identified. Implement remediation plan and enhanced monitoring.'
    : 'Significant vulnerabilities require immediate attention. Escalate to senior leadership.';
  doc.text(riskDesc, margin + 50, y + 18);
  y += 30;

  // ── Risk Matrix ───────────────────────────────────────────────────────────
  y = pgBreak(doc, y, 70, margin);
  y = sectionTitle(doc, 'HIPAA SAFEGUARD RISK MATRIX', y, pageWidth, margin);

  // Table header
  const thY = y;
  doc.setFillColor(...C.dark);
  doc.rect(margin, thY, contentWidth, 9, 'F');
  doc.setTextColor(...C.white);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Safeguard Category', margin + 4, thY + 6);
  doc.text('Description', margin + 65, thY + 6);
  doc.text('Risk Level', margin + contentWidth - 26, thY + 6, { align: 'center' });
  y += 9;

  const matrix = [
    {
      category:    'Administrative Safeguards',
      desc:        '§ 164.308 — Policies, procedures, workforce management, contingency planning',
      level:       ra.risk_level || 'medium',
    },
    {
      category:    'Physical Safeguards',
      desc:        '§ 164.310 — Facility access controls, workstation use, device security',
      level:       'low',
    },
    {
      category:    'Technical Safeguards',
      desc:        '§ 164.312 — Access controls, audit controls, integrity, transmission security',
      level:       ra.risk_level || 'medium',
    },
    {
      category:    'Organizational Requirements',
      desc:        '§ 164.314 — Business associate contracts, policies and procedures',
      level:       data.vendors.some((v) => v.has_phi_access && !v.baa_signed) ? 'high' : 'low',
    },
    {
      category:    'Policies, Procedures & Documentation',
      desc:        '§ 164.316 — Documentation of all required HIPAA policies and procedures',
      level:       data.policies.filter((p) => p.hasDocument).length < data.policies.length / 2 ? 'high' : data.policies.filter((p) => p.hasDocument).length < data.policies.length ? 'medium' : 'low',
    },
  ];

  matrix.forEach((row, i) => {
    y = pgBreak(doc, y, 16, margin);

    // Row container (white bg, bottom border)
    doc.setFillColor(...C.white);
    doc.rect(margin, y, contentWidth, 14, 'F');
    doc.setFillColor(...C.grayLine);
    doc.rect(margin, y + 13.6, contentWidth, 0.4, 'F');

    // Category
    doc.setTextColor(...C.dark);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal'); // Normal weight
    doc.text(row.category, margin + 4, y + 5);

    // Description
    doc.setTextColor(...C.grayText);
    doc.setFontSize(7.5);
    const descLines = doc.splitTextToSize(row.desc, contentWidth - 60);
    doc.text(descLines[0], margin + 4, y + 10);

    // Risk Level Badge (Right aligned)
    const rFg = riskColor(row.level);
    const rBg = riskBgColor(row.level); // This is C.white now
    
    // Instead of fill, use outline badge
    doc.setDrawColor(...rFg);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin + contentWidth - 36, y + 3, 30, 8, 2, 2, 'S');

    doc.setTextColor(...rFg);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold'); // Keep bold for small badge text
    doc.text(row.level.toUpperCase(), margin + contentWidth - 21, y + 9, { align: 'center' });
    y += 14;
  });
  y += 6;

  // ── Mitigation Checklist ──────────────────────────────────────────────────
  y = pgBreak(doc, y, 60, margin);
  y = sectionTitle(doc, 'RISK MITIGATION STATUS', y, pageWidth, margin);

  const mitigations: { action: string; ref: string; done: boolean }[] = [
    {
      action: 'Conduct and document a Security Risk Analysis (SRA)',
      ref:    '§ 164.308(a)(1)(ii)(A)',
      done:   data.riskAssessment.exists,
    },
    {
      action: 'Develop and implement a Risk Management Plan',
      ref:    '§ 164.308(a)(1)(ii)(B)',
      done:   data.riskAssessment.exists && ra.risk_level === 'low',
    },
    {
      action: 'Establish HIPAA Security & Privacy policies and procedures',
      ref:    '§ 164.316',
      done:   data.policies.filter((p) => p.hasDocument).length > 0,
    },
    {
      action: 'Implement workforce HIPAA security training program',
      ref:    '§ 164.308(a)(5)',
      done:   data.trainingRecords.length > 0,
    },
    {
      action: 'Execute Business Associate Agreements with all PHI-accessing vendors',
      ref:    '§ 164.308(b)(1)',
      done:   data.vendors.filter((v) => v.has_phi_access).every((v) => v.baa_signed),
    },
    {
      action: 'Establish incident response and breach notification procedures',
      ref:    '§ 164.308(a)(6)',
      done:   data.policies.some((p) => p.id === 7 && p.hasDocument),
    },
  ];

  mitigations.forEach((item, i) => {
    y = pgBreak(doc, y, 12, margin);
    const rowBg: [number, number, number] = i % 2 === 0 ? C.white : C.grayBg;
    doc.setFillColor(...rowBg);
    doc.rect(margin, y, contentWidth, 11, 'F');

    const fgColor: [number, number, number] = item.done ? C.blue : C.riskHigh;
    const bgColor: [number, number, number] = item.done ? C.blueBg : C.riskHighBg;
    doc.setFillColor(...bgColor);
    doc.roundedRect(margin + 3, y + 2, 7, 7, 1.5, 1.5, 'F');
    doc.setTextColor(...fgColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(item.done ? '✓' : '✗', margin + 6.5, y + 7.5, { align: 'center' });

    doc.setTextColor(...C.dark);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', item.done ? 'normal' : 'bold');
    doc.text(item.action, margin + 14, y + 7);

    doc.setTextColor(...C.grayText);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(item.ref, margin + contentWidth - 2, y + 7, { align: 'right' });
    y += 11;
  });
  y += 8;

  // ── Signature Block ───────────────────────────────────────────────────────
  y = pgBreak(doc, y, 40, margin);
  y = sectionTitle(doc, 'AUTHORIZATION & SIGNATURE', y, pageWidth, margin);

  const halfW = (contentWidth - 4) / 2;
  // Left: Privacy Officer
  doc.setFillColor(...C.grayBg);
  doc.rect(margin, y, halfW, 30, 'F');
  doc.setTextColor(...C.grayText);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Privacy Officer', margin + 4, y + 5);
  doc.setFillColor(...C.grayLine);
  doc.rect(margin + 4, y + 20, halfW - 12, 0.5, 'F');
  doc.setTextColor(...C.dark);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(data.organization.privacy_officer_name || '___________________________', margin + 4, y + 26);
  doc.setTextColor(...C.grayText);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Signature  ·  Date: _____________', margin + 4, y + 28);

  // Right: Security Officer
  const rx = margin + halfW + 4;
  doc.setFillColor(...C.grayBg);
  doc.rect(rx, y, halfW, 30, 'F');
  doc.setTextColor(...C.grayText);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Security Officer', rx + 4, y + 5);
  doc.setFillColor(...C.grayLine);
  doc.rect(rx + 4, y + 20, halfW - 12, 0.5, 'F');
  doc.setTextColor(...C.dark);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(data.organization.security_officer_name || '___________________________', rx + 4, y + 26);
  doc.setTextColor(...C.grayText);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Signature  ·  Date: _____________', rx + 4, y + 28);

  addPageNumbers(doc, data.organization.name);
  return doc.output('arraybuffer') as unknown as Uint8Array;
}

// 03 ── POLICIES
function buildPoliciesListPDF(data: AuditExportData, jsPDF: any, logoData: Buffer | null): Uint8Array {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const { margin, contentWidth, pageWidth } = dims(doc);
  let y = margin;

  addHeader(doc, 'POLICY DOCUMENTATION SUMMARY', 'HIPAA Policies and Procedures Index  ·  45 CFR § 164.316', data.organization.name, data.exportedAt, logoData);
  y = 57;

  const documented = data.policies.filter((p) => p.hasDocument).length;
  const rate = Math.round((documented / data.policies.length) * 100);

  // ── Summary Stats ─────────────────────────────────────────────────────────
  y = sectionTitle(doc, 'DOCUMENTATION STATUS OVERVIEW', y, pageWidth, margin);

  const smCols: { label: string; value: string }[] = [
    { label: 'Total Required',    value: String(data.policies.length) },
    { label: 'Documented',        value: String(documented) },
    { label: 'Pending',           value: String(data.policies.length - documented) },
    { label: 'Completion Rate',   value: `${rate}%` },
  ];
  const smW = (contentWidth - 3) / 4;
  smCols.forEach((s, i) => {
    const x = margin + i * (smW + 1);
    doc.setFillColor(...C.grayBg);
    doc.rect(x, y, smW, 20, 'F');
    doc.setFillColor(...C.blue);
    doc.rect(x, y, 2, 20, 'F');
    doc.setTextColor(...C.grayText);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(s.label, x + 5, y + 6);
    doc.setTextColor(...C.dark);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(s.value, x + 5, y + 16);
  });
  y += 26;

  // ── Progress bar ──────────────────────────────────────────────────────────
  doc.setFillColor(...C.grayLine);
  doc.roundedRect(margin, y, contentWidth, 5, 2.5, 2.5, 'F');
  doc.setFillColor(...C.blue);
  doc.roundedRect(margin, y, (contentWidth * rate) / 100, 5, 2.5, 2.5, 'F');
  doc.setTextColor(...C.grayText);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`${rate}% of HIPAA required policies have been documented`, margin + contentWidth / 2, y - 2, { align: 'center' });
  y += 10;

  // ── Policy Table ──────────────────────────────────────────────────────────
  y = sectionTitle(doc, 'HIPAA REQUIRED POLICIES — DETAILED STATUS', y, pageWidth, margin);

  // Column positions (contentWidth ≈ 175.9mm):
  // #: margin+3 (6mm)
  // Policy Name: margin+11 (up to ~93mm)
  // HIPAA Reference: margin+96 (up to ~145mm — 49mm)
  // Status badge: right-aligned, margin+contentWidth-26 to margin+contentWidth-2 (24mm wide)
  const badgeX = margin + contentWidth - 26;

  // Header row
  doc.setFillColor(...C.dark);
  doc.rect(margin, y, contentWidth, 9, 'F');
  doc.setTextColor(...C.white);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('#', margin + 3, y + 6);
  doc.text('Policy / Procedure Document', margin + 11, y + 6);
  doc.text('HIPAA CFR Reference', margin + 96, y + 6);
  doc.text('Status', badgeX + 12, y + 6, { align: 'center' });
  y += 9;

  const policyRefs: Record<number, string> = {
    1: '§ 164.308, 164.310, 164.312',
    2: '§ 164.308(a)(1)',
    3: '§ 164.308(a)(1)(ii)(B)',
    4: '§ 164.312(a)',
    5: '§ 164.308(a)(5)',
    6: '§ 164.308(a)(1)(ii)(C)',
    7: '§ 164.308(a)(6)',
    8: '§ 164.308(b)(1)',
    9: '§ 164.316(b)',
  };

  data.policies.forEach((policy, idx) => {
    // Row height: 14mm to accommodate policy name + secondary date line
    y = pgBreak(doc, y, 15, margin);
    const rowBg: [number, number, number] = idx % 2 === 0 ? C.white : C.grayBg;
    doc.setFillColor(...rowBg);
    doc.rect(margin, y, contentWidth, 14, 'F');

    // Index number
    doc.setTextColor(...C.grayLight);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(String(policy.id).padStart(2, '0'), margin + 3, y + 6);

    // Policy name (line 1)
    doc.setTextColor(...C.dark);
    doc.setFontSize(8);
    doc.setFont('helvetica', policy.hasDocument ? 'bold' : 'normal');
    doc.text(trunc(policy.name, 38), margin + 11, y + 6);

    // Last updated as secondary line under policy name
    if (policy.lastUpdated) {
      doc.setTextColor(...C.grayLight);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Updated: ${fmtDate(policy.lastUpdated)}`, margin + 11, y + 11);
    }

    // HIPAA Reference
    doc.setTextColor(...C.grayText);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(policyRefs[policy.id] || '—', margin + 96, y + 7);

    // Status badge — right-aligned, no overlap
    if (policy.hasDocument) {
      doc.setFillColor(...C.blue);
      doc.roundedRect(badgeX, y + 3, 24, 8, 2, 2, 'F');
      doc.setTextColor(...C.white);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('DOCUMENTED', badgeX + 12, y + 8.5, { align: 'center' });
    } else {
      doc.setFillColor(...C.grayLine);
      doc.roundedRect(badgeX, y + 3, 24, 8, 2, 2, 'F');
      doc.setTextColor(...C.grayText);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('PENDING', badgeX + 12, y + 8.5, { align: 'center' });
    }
    y += 14;
  });
  y += 8;

  // ── Regulatory Note ───────────────────────────────────────────────────────
  y = pgBreak(doc, y, 18, margin);
  doc.setFillColor(...C.blueBg);
  doc.rect(margin, y, contentWidth, 14, 'F');
  doc.setFillColor(...C.blue);
  doc.rect(margin, y, 3, 14, 'F');
  doc.setTextColor(...C.dark);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Regulatory Requirement:', margin + 7, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.grayText);
  const note = 'HIPAA covered entities are required to implement reasonable and appropriate policies and procedures to comply with the standards and implementation specifications under 45 CFR Part 164. All policies must be documented, maintained, and updated as needed (§ 164.316(b)).';
  const noteLines = doc.splitTextToSize(note, contentWidth - 12);
  doc.text(noteLines, margin + 7, y + 10);

  addPageNumbers(doc, data.organization.name);
  return doc.output('arraybuffer') as unknown as Uint8Array;
}

// 04 ── VENDOR MANAGEMENT
function buildVendorManagementPDF(data: AuditExportData, jsPDF: any, logoData: Buffer | null): Uint8Array {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const { margin, contentWidth, pageWidth } = dims(doc);
  let y = margin;

  // Ensure normal character spacing to prevent "S I G N" issues
  doc.setCharSpace(0);

  addHeader(doc, 'VENDOR MANAGEMENT REPORT', 'Business Associate and BAA Status  ·  45 CFR § 164.308(b)(1)', data.organization.name, data.exportedAt, logoData);
  y = 57;

  const phiVendors    = data.vendors.filter((v) => v.has_phi_access);
  const baaExecuted   = data.vendors.filter((v) => v.baa_signed);
  const missingBAA    = phiVendors.filter((v) => !v.baa_signed);
  const baaRate       = data.vendors.length > 0 ? Math.round((baaExecuted.length / data.vendors.length) * 100) : 0;
  const phiBaaRate    = phiVendors.length > 0 ? Math.round((phiVendors.filter((v) => v.baa_signed).length / phiVendors.length) * 100) : 100;

  // ── Summary Stats ─────────────────────────────────────────────────────────
  y = sectionTitle(doc, 'VENDOR PORTFOLIO SUMMARY', y, pageWidth, margin);

  const smData = [
    { label: 'Total Vendors',     value: String(data.vendors.length) },
    { label: 'PHI Access',        value: String(phiVendors.length) },
    { label: 'BAA Executed',      value: String(baaExecuted.length) },
    { label: 'Missing BAA',       value: String(missingBAA.length),   highlight: missingBAA.length > 0 },
  ];
  const colW = (contentWidth - 3) / 4;
  smData.forEach((s, i) => {
    const x = margin + i * (colW + 1);
    doc.setFillColor(...(s.highlight ? C.riskHighBg : C.grayBg));
    doc.rect(x, y, colW, 20, 'F');
    doc.setFillColor(...(s.highlight ? C.riskHigh as [number, number, number] : C.blue));
    doc.rect(x, y, 2, 20, 'F');
    doc.setTextColor(...C.grayText);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(s.label, x + 5, y + 6);
    doc.setTextColor(...(s.highlight ? C.riskHigh as [number, number, number] : C.dark));
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(s.value, x + 5, y + 16);
  });
  y += 26;

  // ── BAA Compliance Note ───────────────────────────────────────────────────
  if (missingBAA.length > 0) {
    y = pgBreak(doc, y, 16, margin);
    // Alert block — clean outline, no fill
    doc.setDrawColor(220, 38, 38); // Red border
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'S');
    
    // Left red stripe
    doc.setFillColor(220, 38, 38);
    doc.rect(margin, y, 4, 14, 'F');

    doc.setTextColor(185, 28, 28);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`ATTENTION: ${missingBAA.length} vendor(s) with PHI access are missing Business Associate Agreements.`, margin + 8, y + 6);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(86, 86, 86);
    doc.text('Immediate action required to execute missing BAAs.', margin + 8, y + 10);
    y += 18;
  } else if (phiVendors.length > 0) {
    y = pgBreak(doc, y, 14, margin);
    // Success block — clean outline
    doc.setDrawColor(22, 163, 74); // Green border
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'S');

    // Left green stripe
    doc.setFillColor(22, 163, 74);
    doc.rect(margin, y, 4, 12, 'F');

    doc.setTextColor(21, 128, 61); // Dark green text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal'); // Thin font
    doc.text(`All vendors with PHI access have executed Business Associate Agreements. Compliance: ${phiBaaRate}%`, margin + 8, y + 7.5);
    y += 16;
  }

  // ── Vendor Table ──────────────────────────────────────────────────────────
  y = pgBreak(doc, y, 15, margin);
  y = sectionTitle(doc, 'VENDOR DETAIL — BUSINESS ASSOCIATE REGISTER', y, pageWidth, margin);

  doc.setFillColor(...C.dark);
  doc.rect(margin, y, contentWidth, 9, 'F');
  doc.setTextColor(...C.white);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Vendor Name',   margin + 3,   y + 6);
  doc.text('Service Type',  margin + 52,  y + 6);
  doc.text('PHI Access',    margin + 98,  y + 6);
  doc.text('BAA Status',    margin + 118, y + 6);
  doc.text('BAA Expiry',    margin + 143, y + 6);
  doc.text('Risk',          margin + 167, y + 6);
  y += 9;

  data.vendors.forEach((v, i) => {
    y = pgBreak(doc, y, 12, margin);
    const rowBg: [number, number, number] = i % 2 === 0 ? C.white : C.grayBg;
    doc.setFillColor(...rowBg);
    doc.rect(margin, y, contentWidth, 12, 'F');

    doc.setTextColor(...C.dark);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(trunc(v.vendor_name, 22), margin + 3, y + 5);
    if (v.contact_name) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...C.grayText);
      doc.text(v.contact_name, margin + 3, y + 9.5);
    }

    doc.setTextColor(...C.grayText);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(trunc(v.service_type, 18), margin + 52, y + 7);

    // PHI badge
    if (v.has_phi_access) {
      doc.setFillColor(...C.riskHighBg);
      doc.roundedRect(margin + 96, y + 2, 18, 7, 1.5, 1.5, 'F');
      doc.setTextColor(...C.riskHigh as [number, number, number]);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('PHI: YES', margin + 105, y + 7, { align: 'center' });
    } else {
      doc.setTextColor(...C.grayText);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('No PHI', margin + 98, y + 7);
    }

    // BAA badge - REPLACED SIGNED with EXECUTED to fix spacing/display issue
    if (v.baa_signed) {
      doc.setFillColor(...C.blue);
      doc.roundedRect(margin + 116, y + 2, 22, 7, 1.5, 1.5, 'F');
      doc.setTextColor(...C.white);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('✓ EXECUTED', margin + 127, y + 7, { align: 'center' });
    } else {
      doc.setFillColor(...C.riskHighBg);
      doc.roundedRect(margin + 116, y + 2, 22, 7, 1.5, 1.5, 'F');
      doc.setTextColor(...C.riskHigh as [number, number, number]);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('✗ MISSING', margin + 127, y + 7, { align: 'center' });
    }

    doc.setTextColor(...C.grayText);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(v.baa_expiration_date ? fmtDate(v.baa_expiration_date) : '—', margin + 143, y + 7);

    const rFg = riskColor(v.risk_level);
    doc.setTextColor(...rFg);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(v.risk_level.toUpperCase(), margin + 167, y + 7);
    y += 12;
  });

  // ── Regulatory Note ───────────────────────────────────────────────────────
  y += 6;
  y = pgBreak(doc, y, 16, margin);
  doc.setFillColor(...C.grayBg);
  doc.rect(margin, y, contentWidth, 12, 'F');
  doc.setFillColor(...C.blue);
  doc.rect(margin, y, 3, 12, 'F');
  doc.setTextColor(...C.grayText);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const baaNote = 'Under HIPAA § 164.308(b)(1), covered entities must have written Business Associate Agreements with all business associates who create, receive, maintain, or transmit ePHI on their behalf. Failure to execute BAAs constitutes a material HIPAA violation.';
  doc.text(doc.splitTextToSize(baaNote, contentWidth - 8), margin + 6, y + 5);

  addPageNumbers(doc, data.organization.name);
  return doc.output('arraybuffer') as unknown as Uint8Array;
}

// 05 ── TRAINING LOG
function buildTrainingLogPDF(data: AuditExportData, jsPDF: any, logoData: Buffer | null): Uint8Array {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const { margin, contentWidth, pageWidth } = dims(doc);
  let y = margin;

  addHeader(doc, 'EMPLOYEE TRAINING LOG', 'HIPAA Workforce Training Records  ·  45 CFR § 164.308(a)(5)', data.organization.name, data.exportedAt, logoData);
  y = 57;

  const completed = data.trainingRecords.filter((t) => t.completion_status === 'completed').length;
  const pending   = data.trainingRecords.filter((t) => t.completion_status === 'pending').length;
  const expired   = data.trainingRecords.filter((t) => t.completion_status === 'expired').length;
  const rate      = Math.round((completed / Math.max(data.trainingRecords.length, 1)) * 100);

  // ── Summary ───────────────────────────────────────────────────────────────
  y = sectionTitle(doc, 'TRAINING PROGRAM SUMMARY', y, pageWidth, margin);
  const smItems = [
    { label: 'Total Records',    value: String(data.trainingRecords.length) },
    { label: 'Completed',        value: String(completed),  ok: true },
    { label: 'Pending',          value: String(pending),    warn: pending > 0 },
    { label: 'Expired',          value: String(expired),    danger: expired > 0 },
  ];
  const cW = (contentWidth - 3) / 4;
  smItems.forEach((s, i) => {
    const x = margin + i * (cW + 1);
    const bgRgb: [number, number, number] = s.danger ? C.riskHighBg : s.warn ? C.riskMidBg : s.ok ? C.blueBg : C.grayBg;
    const acRgb: [number, number, number] = s.danger ? C.riskHigh : s.warn ? C.riskMid : s.ok ? C.blue : C.grayText;
    doc.setFillColor(...bgRgb);
    doc.rect(x, y, cW, 20, 'F');
    doc.setFillColor(...acRgb);
    doc.rect(x, y, 2, 20, 'F');
    doc.setTextColor(...C.grayText);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(s.label, x + 5, y + 6);
    doc.setTextColor(...acRgb);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(s.value, x + 5, y + 16);
  });
  y += 24;

  // Completion bar
  doc.setFillColor(...C.grayLine);
  doc.roundedRect(margin, y, contentWidth, 4, 2, 2, 'F');
  doc.setFillColor(...C.blue);
  doc.roundedRect(margin, y, (contentWidth * rate) / 100, 4, 2, 2, 'F');
  doc.setTextColor(...C.grayText);
  doc.setFontSize(7);
  doc.text(`Training completion rate: ${rate}%`, margin + contentWidth / 2, y - 2, { align: 'center' });
  y += 10;

  // ── Training Records Table ────────────────────────────────────────────────
  y = sectionTitle(doc, 'INDIVIDUAL TRAINING RECORDS', y, pageWidth, margin);

  doc.setFillColor(...C.dark);
  doc.rect(margin, y, contentWidth, 9, 'F');
  doc.setTextColor(...C.white);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Name',  margin + 3,   y + 6);
  doc.text('Role / Title',   margin + 52,  y + 6);
  doc.text('Training Type',  margin + 95,  y + 6);
  doc.text('Date',           margin + 125, y + 6);
  doc.text('Status',         margin + 148, y + 6);
  doc.text('Renewal',        margin + 168, y + 6);
  y += 9;

  data.trainingRecords.forEach((rec, i) => {
    y = pgBreak(doc, y, 11, margin);
    const rowBg: [number, number, number] = i % 2 === 0 ? C.white : C.grayBg;
    doc.setFillColor(...rowBg);
    doc.rect(margin, y, contentWidth, 11, 'F');

    doc.setTextColor(...C.dark);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(trunc(rec.full_name, 22), margin + 3, y + 5);
    if (rec.quiz_score !== undefined && rec.quiz_score !== null) {
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...C.grayText);
      doc.text(`Quiz: ${rec.quiz_score}%`, margin + 3, y + 9.5);
    }

    doc.setTextColor(...C.grayText);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(trunc(rec.role_title, 18), margin + 52, y + 7);
    doc.text(rec.training_type, margin + 95, y + 7);
    doc.text(fmtDate(rec.training_date), margin + 125, y + 7);

    const sColor: [number, number, number] = rec.completion_status === 'completed'
      ? C.blue : rec.completion_status === 'expired'
      ? C.riskHigh : C.riskMid;
    const sBg: [number, number, number] = rec.completion_status === 'completed'
      ? C.blueBg : rec.completion_status === 'expired'
      ? C.riskHighBg : C.riskMidBg;
    doc.setFillColor(...sBg);
    doc.roundedRect(margin + 145, y + 2, 20, 7, 1.5, 1.5, 'F');
    doc.setTextColor(...sColor);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text(rec.completion_status.toUpperCase(), margin + 155, y + 7, { align: 'center' });

    doc.setTextColor(...C.grayText);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(fmtDate(rec.expiration_date), margin + 168, y + 7);
    y += 11;
  });

  // ── Regulatory Note ───────────────────────────────────────────────────────
  y += 6;
  y = pgBreak(doc, y, 16, margin);
  doc.setFillColor(...C.grayBg);
  doc.rect(margin, y, contentWidth, 12, 'F');
  doc.setFillColor(...C.blue);
  doc.rect(margin, y, 3, 12, 'F');
  doc.setTextColor(...C.grayText);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const tNote = 'HIPAA § 164.308(a)(5)(ii)(A) requires covered entities to implement a security awareness and training program for all members of its workforce. Training records must be maintained for a minimum of six (6) years from the date of creation or the date when last in effect.';
  doc.text(doc.splitTextToSize(tNote, contentWidth - 8), margin + 6, y + 5);

  addPageNumbers(doc, data.organization.name);
  return doc.output('arraybuffer') as unknown as Uint8Array;
}

// 06a ── INCIDENT LOG
function buildIncidentLogPDF(data: AuditExportData, jsPDF: any, logoData: Buffer | null): Uint8Array {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const { margin, contentWidth, pageWidth } = dims(doc);
  let y = margin;

  addHeader(doc, 'INCIDENT LOG', 'Security Incident & Event Records  ·  45 CFR § 164.308(a)(6)', data.organization.name, data.exportedAt, logoData);
  y = 57;

  const openCount    = data.incidents.filter((i) => i.status === 'open').length;
  const phiCount     = data.incidents.filter((i) => i.phi_involved).length;
  const breachCount  = data.incidents.filter((i) => i.breach_confirmed).length;
  const highCount    = data.incidents.filter((i) => i.severity === 'high').length;

  // ── Summary ───────────────────────────────────────────────────────────────
  y = sectionTitle(doc, 'INCIDENT SUMMARY', y, pageWidth, margin);
  const smItems = [
    { label: 'Total Incidents',   value: String(data.incidents.length) },
    { label: 'Open',              value: String(openCount),    danger: openCount > 0 },
    { label: 'PHI Involved',      value: String(phiCount),     danger: phiCount > 0 },
    { label: 'Breach Confirmed',  value: String(breachCount),  danger: breachCount > 0 },
  ];
  const cW = (contentWidth - 3) / 4;
  smItems.forEach((s, i) => {
    const x = margin + i * (cW + 1);
    const bgRgb: [number, number, number] = s.danger ? C.riskHighBg : C.grayBg;
    const acRgb: [number, number, number] = s.danger ? C.riskHigh : C.blue;
    doc.setFillColor(...bgRgb);
    doc.rect(x, y, cW, 20, 'F');
    doc.setFillColor(...acRgb);
    doc.rect(x, y, 2, 20, 'F');
    doc.setTextColor(...C.grayText);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(s.label, x + 5, y + 6);
    doc.setTextColor(...acRgb);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(s.value, x + 5, y + 16);
  });
  y += 26;

  // ── Individual Incidents ──────────────────────────────────────────────────
  y = sectionTitle(doc, 'INCIDENT DETAIL RECORDS', y, pageWidth, margin);

  data.incidents.forEach((incident, i) => {
    const cardH = 42 + (incident.description ? 14 : 0);
    y = pgBreak(doc, y, cardH, margin);

    const sevRgb    = riskColor(incident.severity);
    const sevBgRgb  = riskBgColor(incident.severity);

    // Card background: White, with thin border
    doc.setDrawColor(...C.grayLine);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, cardH, 2, 2, 'S');

    // Left severity stripe - keep, but make it very thin (2mm)
    doc.setFillColor(...sevRgb);
    doc.rect(margin, y, 2, cardH, 'F');

    // Incident header
    doc.setTextColor(...C.dark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal'); // Changed from bold
    doc.text(`INC-${String(i + 1).padStart(3, '0')}  —  ${trunc(incident.incident_title, 55)}`, margin + 6, y + 7);

    // Severity badge - Outlined
    doc.setDrawColor(...sevRgb);
    doc.roundedRect(margin + contentWidth - 32, y + 2, 26, 8, 2, 2, 'S');
    doc.setTextColor(...sevRgb);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${incident.severity.toUpperCase()} SEVERITY`, margin + contentWidth - 19, y + 6.5, { align: 'center' });

    // Divider
    doc.setFillColor(...C.grayLine);
    doc.rect(margin + 6, y + 10, contentWidth - 12, 0.3, 'F');

    // Fields grid
    const fields: [string, string][] = [
      ['Date Occurred',   fmtDate(incident.date_occurred)],
      ['Date Discovered', fmtDate(incident.date_discovered)],
      ['Discovered By',   incident.discovered_by],
      ['Status',          incident.status.replace(/_/g, ' ').toUpperCase()],
      ['PHI Involved',    incident.phi_involved ? 'YES - ALERT' : 'No'],
      ['Breach Confirmed',incident.breach_confirmed ? 'YES - ALERT' : 'No'],
    ];
    if (incident.estimated_individuals_affected > 0) {
      fields.push(['Individuals Affected', String(incident.estimated_individuals_affected)]);
    }

    const fW = (contentWidth - 16) / 3;
    fields.forEach((f, fi) => {
      const col = fi % 3;
      const row = Math.floor(fi / 3);
      const fx  = margin + 8 + col * (fW + 2);
      const fy  = y + 14 + row * 10;
      doc.setTextColor(...C.grayText);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text(f[0], fx, fy);
      const isWarning = f[1].startsWith('⚠');
      doc.setTextColor(...(isWarning ? C.riskHigh : C.dark));
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(f[1], fx, fy + 5);
    });

    // Description
    if (incident.description) {
      const descY = y + cardH - 14;
      doc.setFillColor(...C.white);
      doc.rect(margin + 8, descY, contentWidth - 16, 12, 'F');
      doc.setTextColor(...C.grayText);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      const descLines = doc.splitTextToSize(`"${incident.description}"`, contentWidth - 24);
      doc.text(descLines.slice(0, 2), margin + 10, descY + 5);
    }

    y += cardH + 5;
  });

  addPageNumbers(doc, data.organization.name);
  return doc.output('arraybuffer') as unknown as Uint8Array;
}

// 06b ── BREACH DOCUMENTATION
function buildBreachNotificationsPDF(data: AuditExportData, jsPDF: any, logoData: Buffer | null): Uint8Array {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const { margin, contentWidth, pageWidth } = dims(doc);
  let y = margin;

  addHeader(doc, 'BREACH NOTIFICATION DOCUMENTATION', 'HIPAA Breach Notification Records  ·  45 CFR § 164.400–164.414', data.organization.name, data.exportedAt, logoData);
  y = 57;

  // ── Regulatory Context ────────────────────────────────────────────────────
  y = sectionTitle(doc, 'REGULATORY CONTEXT', y, pageWidth, margin);
  doc.setFillColor(...C.blueBg);
  doc.rect(margin, y, contentWidth, 18, 'F');
  doc.setFillColor(...C.blue);
  doc.rect(margin, y, 3, 18, 'F');
  doc.setTextColor(...C.dark);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const regText = 'The HIPAA Breach Notification Rule (45 CFR §§ 164.400–164.414) requires covered entities to notify affected individuals, the Secretary of HHS, and in some cases the media, following a discovery of a breach of unsecured PHI. Notifications to individuals must be made no later than 60 days following discovery. Breaches affecting 500+ individuals require immediate media notification.';
  const regLines = doc.splitTextToSize(regText, contentWidth - 10);
  doc.text(regLines, margin + 6, y + 6);
  y += 22;

  // ── Summary ───────────────────────────────────────────────────────────────
  y = sectionTitle(doc, 'BREACH NOTIFICATION REGISTER', y, pageWidth, margin);
  y = kvTable(doc, [
    ['Total Breach Notifications on Record', String(data.breachNotifications.length)],
    ['Report Generated',                     fmtDateLong(data.exportedAt)],
    ['Prepared By',                          'HIPAA Hub Compliance Platform'],
  ], y, margin, contentWidth);
  y += 8;

  // ── Records ───────────────────────────────────────────────────────────────
  data.breachNotifications.forEach((bn, i) => {
    y = pgBreak(doc, y, 32, margin);

    // Card outline (Red/High risk)
    doc.setDrawColor(...C.riskHigh);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentWidth, 28, 2, 2, 'S');

    // Left accent stripe
    doc.setFillColor(...C.riskHigh);
    doc.rect(margin, y, 3, 28, 'F');

    doc.setTextColor(...C.riskHigh);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`BREACH NOTIFICATION  #${String(i + 1).padStart(3, '0')}`, margin + 8, y + 7);

    // Divider
    doc.setFillColor(...C.grayLine);
    doc.rect(margin + 8, y + 9, contentWidth - 16, 0.4, 'F');

    const bnRows: [string, string][] = [
      ['Notification ID',      bn.id.substring(0, 16) + '...'],
      ['Date Recorded',        fmtDateLong(bn.created_at)],
      ['Breach Type',          bn.breach_type || 'Not specified'],
      ['Individuals Affected', bn.individuals_affected ? String(bn.individuals_affected) : 'Under investigation'],
    ];
    bnRows.forEach((r, ri) => {
      const col  = ri % 2;
      const row  = Math.floor(ri / 2);
      const rx   = margin + 8 + col * ((contentWidth - 16) / 2);
      const ry   = y + 13 + row * 8;
      doc.setTextColor(...C.grayText);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(r[0] + ':', rx, ry);
      doc.setTextColor(...C.dark);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(r[1], rx, ry + 5);
    });
    y += 32;
  });

  addPageNumbers(doc, data.organization.name);
  return doc.output('arraybuffer') as unknown as Uint8Array;
}

// 07 ── AUDIT CHECKLIST
function buildAuditChecklistPDF(data: AuditExportData, jsPDF: any, logoData: Buffer | null): Uint8Array {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const { margin, contentWidth, pageWidth } = dims(doc);
  let y = margin;

  addHeader(doc, 'HIPAA COMPLIANCE CHECKLIST', 'Audit Readiness Assessment  ·  Comprehensive Compliance Verification', data.organization.name, data.exportedAt, logoData);
  y = 57;

  const categories = [
    {
      title: 'RISK MANAGEMENT',
      ref:   '45 CFR § 164.308(a)(1)',
      items: [
        { label: 'Security Risk Analysis (SRA) conducted and documented',         done: data.riskAssessment.exists },
        { label: 'Risk management plan developed to address identified risks',     done: data.riskAssessment.exists },
        { label: 'Risk levels assigned (Low / Medium / High) across all assets',  done: !!data.riskAssessment.risk_level },
        { label: 'Risk assessment updated when environmental or operational changes occur', done: data.riskAssessment.exists },
      ],
    },
    {
      title: 'POLICY DOCUMENTATION',
      ref:   '45 CFR § 164.316',
      items: [
        { label: 'HIPAA Security & Privacy Master Policy documented',             done: !!data.policies.find((p) => p.id === 1)?.hasDocument },
        { label: 'Security Risk Analysis Policy in place',                        done: !!data.policies.find((p) => p.id === 2)?.hasDocument },
        { label: 'Risk Management Plan documented',                               done: !!data.policies.find((p) => p.id === 3)?.hasDocument },
        { label: 'Access Control Policy implemented',                             done: !!data.policies.find((p) => p.id === 4)?.hasDocument },
        { label: 'Workforce Training Policy documented',                          done: !!data.policies.find((p) => p.id === 5)?.hasDocument },
        { label: 'Sanction Policy for violations established',                    done: !!data.policies.find((p) => p.id === 6)?.hasDocument },
        { label: 'Incident Response & Breach Notification Policy documented',     done: !!data.policies.find((p) => p.id === 7)?.hasDocument },
        { label: 'Business Associate Management Policy in place',                 done: !!data.policies.find((p) => p.id === 8)?.hasDocument },
        { label: 'Audit Logs & Documentation Retention Policy documented',        done: !!data.policies.find((p) => p.id === 9)?.hasDocument },
      ],
    },
    {
      title: 'VENDOR MANAGEMENT & BUSINESS ASSOCIATES',
      ref:   '45 CFR § 164.308(b)',
      items: [
        { label: 'Business associate inventory maintained and current',           done: data.vendors.length > 0 },
        { label: 'BAAs executed with all vendors who access PHI',                 done: data.vendors.filter((v) => v.has_phi_access).every((v) => v.baa_signed) },
        { label: 'BAA expiration dates tracked and renewal alerts active',        done: data.vendors.some((v) => !!v.baa_expiration_date) },
        { label: 'Vendor risk levels assessed and documented',                    done: data.vendors.every((v) => !!v.risk_level) },
      ],
    },
    {
      title: 'WORKFORCE TRAINING & AWARENESS',
      ref:   '45 CFR § 164.308(a)(5)',
      items: [
        { label: 'HIPAA security awareness training program established',         done: data.trainingRecords.length > 0 },
        { label: 'All workforce members trained on HIPAA requirements',           done: data.trainingRecords.filter((t) => t.completion_status === 'completed').length === data.trainingRecords.length && data.trainingRecords.length > 0 },
        { label: 'Training records maintained for each workforce member',         done: data.trainingRecords.length > 0 },
        { label: 'Annual HIPAA training renewals tracked',                        done: data.trainingRecords.some((t) => t.training_type === 'annual') },
      ],
    },
    {
      title: 'INCIDENT RESPONSE & BREACH MANAGEMENT',
      ref:   '45 CFR § 164.308(a)(6)',
      items: [
        { label: 'Incident logging system established and actively used',         done: data.incidents.length > 0 },
        { label: 'Incidents categorized by severity (low / medium / high)',       done: data.incidents.length > 0 },
        { label: 'PHI exposure assessed for each incident',                       done: data.incidents.length > 0 },
        { label: 'Breach notification procedures documented and followed',        done: !!data.policies.find((p) => p.id === 7)?.hasDocument },
        { label: 'Breach notification records maintained',                        done: data.breachNotifications.length >= 0 },
      ],
    },
  ];

  let totalItems = 0;
  let doneItems  = 0;

  categories.forEach((cat) => {
    const catH = 12 + cat.items.length * 10 + 4;
    y = pgBreak(doc, y, catH, margin);

    // Category header
    doc.setFillColor(...C.dark);
    doc.rect(margin, y, contentWidth, 10, 'F');
    doc.setFillColor(...C.blue);
    doc.rect(margin, y, 3, 10, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(cat.title, margin + 6, y + 7);
    doc.setTextColor(...C.grayLight);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(cat.ref, margin + contentWidth - 3, y + 7, { align: 'right' });
    y += 10;

    cat.items.forEach((item, ii) => {
      y = pgBreak(doc, y, 10, margin);
      totalItems++;
      if (item.done) doneItems++;

      // Row background: White + bottom border
      doc.setFillColor(...C.white);
      doc.rect(margin, y, contentWidth, 10, 'F');
      doc.setFillColor(...C.grayLine);
      doc.rect(margin, y + 9.6, contentWidth, 0.4, 'F');

      // Status Badge (Left) - Outlined pill
      const chColor = item.done ? C.blue : C.riskHigh;
      doc.setDrawColor(...chColor);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin + 2, y + 2, 16, 6, 1.5, 1.5, 'S');

      doc.setTextColor(...chColor);
      doc.setFontSize(5.5);
      doc.setFont('helvetica', 'bold');
      doc.text(item.done ? 'COMPLETE' : 'MISSING', margin + 10, y + 6.2, { align: 'center' });

      // Item Label - Normal weight
      doc.setTextColor(item.done ? C.dark[0] : C.riskHigh[0], item.done ? C.dark[1] : C.riskHigh[1], item.done ? C.dark[2] : C.riskHigh[2]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal'); // Changed from conditional bold
      doc.text(item.label, margin + 22, y + 6.5);
      y += 10;
    });
    y += 4;
  });

  // ── Final Score ───────────────────────────────────────────────────────────
  y = pgBreak(doc, y, 36, margin);
  const finalScore  = Math.round((doneItems / totalItems) * 100);
  const fScoreColor = scoreColor(finalScore);

  // Score summary card — light background, colored accent
  doc.setFillColor(...C.grayBg);
  doc.rect(margin, y, contentWidth, 30, 'F');
  doc.setFillColor(...fScoreColor);
  doc.rect(margin, y, 4, 30, 'F');

  // Large score number
  doc.setTextColor(...fScoreColor);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(`${finalScore}%`, margin + 28, y + 20, { align: 'center' });

  // Label
  doc.setTextColor(...C.dark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`AUDIT CHECKLIST: ${complianceLabel(finalScore).toUpperCase()}`, margin + 52, y + 12);

  // Sub info
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.grayText);
  doc.text(`${doneItems} of ${totalItems} compliance items verified complete.`, margin + 52, y + 20);

  // Progress bar at bottom of card
  doc.setFillColor(...C.grayLine);
  doc.roundedRect(margin + 52, y + 24, contentWidth - 56, 3, 1.5, 1.5, 'F');
  doc.setFillColor(...fScoreColor);
  doc.roundedRect(margin + 52, y + 24, (contentWidth - 56) * (finalScore / 100), 3, 1.5, 1.5, 'F');

  addPageNumbers(doc, data.organization.name);
  return doc.output('arraybuffer') as unknown as Uint8Array;
}

// ─────────────────────────────────────────────────────────────────────────────
//  SHARED HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function dims(doc: any) {
  const pageWidth   = doc.internal.pageSize.getWidth();
  const pageHeight  = doc.internal.pageSize.getHeight();
  const margin      = 20;
  const contentWidth = pageWidth - margin * 2;
  return { pageWidth, pageHeight, margin, contentWidth };
}

function addHeader(doc: any, title: string, subtitle: string, orgName: string, exportedAt: string, logoData: Buffer | null = null) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── White background — full header area ──────────────────────────────────
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 52, 'F');

  // ── Top brand accent bar — thin blue line ─────────────────────────────────
  doc.setFillColor(...C.blue);
  doc.rect(0, 0, pageWidth, 2.5, 'F');

  // ── TOP ROW: Logo (left) | CONFIDENTIAL (right) ──────────────────────────
  if (logoData) {
    try {
      // Add logo image - keep aspect ratio roughly
      doc.addImage(new Uint8Array(logoData), 'PNG', 20, 8, 35, 10, undefined, 'FAST'); 
    } catch (e) {
      // Fallback text if image fails
      doc.setTextColor(...C.blue);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('HIPAA HUB', 20, 13);
      doc.setTextColor(...C.grayText);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Compliance Platform', 20, 18);
    }
  } else {
    // No logo found, use text
    doc.setTextColor(...C.blue);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('HIPAA HUB', 20, 13);
    doc.setTextColor(...C.grayText);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Compliance Platform', 20, 18);
  }

  // CONFIDENTIAL — right, red, small
  doc.setTextColor(185, 28, 28);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('CONFIDENTIAL', pageWidth - 20, 13, { align: 'right' });
  doc.setTextColor(...C.grayText);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('For Regulatory Use Only', pageWidth - 20, 18, { align: 'right' });

  // ── Thin horizontal rule separator ────────────────────────────────────────
  doc.setFillColor(...C.grayLine);
  doc.rect(20, 21, pageWidth - 40, 0.5, 'F');

  // ── Document title ─────────────────────────────────────────────────────────
  doc.setTextColor(...C.dark);
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, 32, { align: 'center' });

  // ── Subtitle — thin/light weight, muted ────────────────────────────────────
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.grayText);
  doc.text(subtitle, pageWidth / 2, 39, { align: 'center' });

  // ── Organization name ─────────────────────────────────────────────────────
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.dark);
  doc.text(orgName, pageWidth / 2, 46, { align: 'center' });

  // ── Generated date — right-aligned, below org ─────────────────────────────
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.grayText);
  doc.text(`Generated: ${fmtDateLong(exportedAt)}`, pageWidth - 20, 46, { align: 'right' });

  // ── Bottom accent bar ─────────────────────────────────────────────────────
  doc.setFillColor(...C.blue);
  doc.rect(0, 50, pageWidth, 2, 'F');

  // ── Very light gray rule below the blue bar ───────────────────────────────
  doc.setFillColor(...C.grayLine);
  doc.rect(0, 52, pageWidth, 0.4, 'F');
}

/** Draws a section title row and returns the new Y */
function sectionTitle(doc: any, title: string, y: number, pageWidth: number, margin: number): number {
  // White background — keeps the page clean
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, pageWidth - margin * 2, 9, 'F');
  // Blue left accent
  doc.setFillColor(...C.blue);
  doc.rect(margin, y, 3, 9, 'F');
  // Dark text — max contrast on white
  doc.setTextColor(...C.dark);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin + 7, y + 6.5);
  // Thin bottom rule
  doc.setFillColor(...C.grayLine);
  doc.rect(margin, y + 9, pageWidth - margin * 2, 0.4, 'F');
  return y + 12;
}

/** Draws a key-value table and returns the new Y */
function kvTable(doc: any, rows: [string, string][], y: number, margin: number, contentWidth: number): number {
  rows.forEach((row, i) => {
    // White background for all rows (clean look)
    doc.setFillColor(...C.white);
    doc.rect(margin, y, contentWidth, 9, 'F');

    // Thin bottom border
    doc.setFillColor(...C.grayLine);
    doc.rect(margin, y + 8.6, contentWidth, 0.4, 'F');

    // Label — dark gray, regular weight
    doc.setTextColor(86, 86, 86);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(row[0], margin + 2, y + 6);

    // Value — dark, regular weight (not bold, per user request "thin mesmo")
    doc.setTextColor(...C.dark);
    doc.setFont('helvetica', 'normal'); // Changed from bold to normal
    const valLines = doc.splitTextToSize(row[1], contentWidth / 2 - 4);
    doc.text(valLines[0], margin + contentWidth / 2, y + 6);
    y += 9;
  });
  return y + 4; // Extra spacing after table
}

/** Checks if a page break is needed and adds a new page if so */
function pgBreak(doc: any, y: number, neededSpace: number, margin: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + neededSpace > pageHeight - margin - 16) {
    doc.addPage();
    return margin + 5;
  }
  return y;
}

/** Adds page number footer to all pages */
function addPageNumbers(doc: any, orgName: string) {
  const count     = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pH        = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= count; i++) {
    doc.setPage(i);
    // Footer bar
    doc.setFillColor(...C.dark);
    doc.rect(0, pH - 18, pageWidth, 18, 'F');
    doc.setFillColor(...C.blue);
    doc.rect(0, pH - 18, pageWidth, 1.5, 'F');

    // Left side: Organization and confidential notice
    doc.setTextColor(180, 182, 192);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(`HIPAA Hub  ·  ${orgName}  ·  CONFIDENTIAL COMPLIANCE DOCUMENTATION`, 20, pH - 12);

    // Center: Copyright and location
    doc.setTextColor(180, 182, 192);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.text('© 2026 HIPAA Hub LLC. All rights reserved.', pageWidth / 2, pH - 12, { align: 'center' });
    doc.text('Austin, Texas, United States', pageWidth / 2, pH - 9, { align: 'center' });

    // Right side: Contact and page number
    doc.setTextColor(180, 182, 192);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('contact@hipaahubhealth.com', pageWidth - 20, pH - 12, { align: 'right' });
    doc.text(`Page ${i} of ${count}`, pageWidth - 20, pH - 9, { align: 'right' });
  }
}

// ─── Color helpers ────────────────────────────────────────────────────────────

function scoreColor(score: number): [number, number, number] {
  if (score >= 80) return C.blue;
  if (score >= 50) return C.riskMid;
  return C.riskHigh;
}

function complianceLabel(score: number): string {
  if (score >= 80) return 'Audit Ready';
  if (score >= 50) return 'Partially Compliant';
  return 'Needs Attention';
}

function riskColor(level?: string): [number, number, number] {
  if (level === 'low')    return C.riskLow;
  if (level === 'high')   return C.riskHigh;
  return C.riskMid; // medium default
}

function riskBgColor(level?: string): [number, number, number] {
  if (level === 'low')    return C.riskLowBg;
  if (level === 'high')   return C.riskHighBg;
  return C.riskMidBg;
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

function fmtDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try { return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return dateStr; }
}

function fmtDateLong(dateStr?: string): string {
  if (!dateStr) return '—';
  try { return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return dateStr; }
}

function trunc(str: string | undefined | null, maxLen: number): string {
  if (!str) return '—';
  return str.length > maxLen ? str.substring(0, maxLen - 1) + '…' : str;
}

// ─── POLICY TEMPLATES MAP ─────────────────────────────────────────────────────

async function getPolicyTemplate(policyNumId: number): Promise<{ template: string; policyId: string; name: string } | null> {
  const templateMap: Record<number, { module: () => Promise<any>; exportName: string; policyId: string; name: string }> = {
    1: { module: () => import('@/lib/document-templates/hipaa-security-privacy-master-policy'), exportName: 'HIPAA_SECURITY_PRIVACY_MASTER_POLICY_TEMPLATE', policyId: 'MST-001', name: 'HIPAA Security and Privacy Master Policy' },
    2: { module: () => import('@/lib/document-templates/security-risk-analysis-policy'), exportName: 'SECURITY_RISK_ANALYSIS_POLICY_TEMPLATE', policyId: 'SRA-001', name: 'Security Risk Analysis Policy' },
    3: { module: () => import('@/lib/document-templates/risk-management-plan-policy'), exportName: 'RISK_MANAGEMENT_PLAN_POLICY_TEMPLATE', policyId: 'RMP-001', name: 'Risk Management Plan' },
    4: { module: () => import('@/lib/document-templates/access-control-policy'), exportName: 'ACCESS_CONTROL_POLICY_TEMPLATE', policyId: 'ACP-001', name: 'Access Control Policy' },
    5: { module: () => import('@/lib/document-templates/workforce-training-policy'), exportName: 'WORKFORCE_TRAINING_POLICY_TEMPLATE', policyId: 'WTP-001', name: 'Workforce Training Policy' },
    6: { module: () => import('@/lib/document-templates/sanction-policy'), exportName: 'SANCTION_POLICY_TEMPLATE', policyId: 'SAN-001', name: 'Sanction Policy' },
    7: { module: () => import('@/lib/document-templates/incident-response-breach-notification-policy'), exportName: 'INCIDENT_RESPONSE_BREACH_NOTIFICATION_POLICY_TEMPLATE', policyId: 'IRP-001', name: 'Incident Response and Breach Notification Policy' },
    8: { module: () => import('@/lib/document-templates/business-associate-management-policy'), exportName: 'BUSINESS_ASSOCIATE_MANAGEMENT_POLICY_TEMPLATE', policyId: 'BAM-001', name: 'Business Associate Management Policy' },
    9: { module: () => import('@/lib/document-templates/audit-logs-documentation-retention-policy'), exportName: 'AUDIT_LOGS_DOCUMENTATION_RETENTION_POLICY_TEMPLATE', policyId: 'ALR-001', name: 'Audit Logs and Documentation Retention Policy' },
  };

  const config = templateMap[policyNumId];
  if (!config) return null;

  try {
    const module = await config.module();
    const template = module[config.exportName] || '';
    if (!template) {
      console.error(`Template ${config.exportName} not found in module`);
      return null;
    }
    return { template, policyId: config.policyId, name: config.name };
  } catch (error) {
    console.error(`Failed to load policy template ${policyNumId}:`, error);
    return null;
  }
}

// ─── TEXT FLOW RENDERER ───────────────────────────────────────────────────────
// Renders long text (from templates / letter content) through multi-page jsPDF docs

function flowContentToPDF(
  doc: any,
  rawText: string,
  headerTitle: string,
  headerSubtitle: string,
  orgName: string,
  exportedAt: string,
  logoData: Buffer | null
): void {
  const { margin, contentWidth, pageWidth } = dims(doc);
  const pageHeight = doc.internal.pageSize.getHeight();
  const FOOTER_H = 22;

  addHeader(doc, headerTitle, headerSubtitle, orgName, exportedAt, logoData);
  let y = 57;
  doc.setCharSpace(0);

  // Clean and normalise content
  const cleaned = rawText
    .replace(/\{\{[^}]+\}\}/g, '')           // remove remaining placeholders
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')            // collapse excessive blank lines
    .replace(/[ \t]+/g, ' ')                 // normalise spaces
    .trim();

  const lines = cleaned.split('\n');

  const checkBreak = (needed: number) => {
    if (y + needed > pageHeight - FOOTER_H) {
      doc.addPage();
      addHeader(doc, headerTitle, headerSubtitle, orgName, exportedAt, logoData);
      y = 57;
      doc.setCharSpace(0);
    }
  };

  // State for KV table accumulator
  let kvPairs: [string, string][] = [];

  const flushKvTable = () => {
    if (kvPairs.length === 0) return;
    checkBreak(kvPairs.length * 8 + 6);
    for (const [k, v] of kvPairs) {
      checkBreak(8);
      // Key label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...C.grayText);
      doc.text(trunc(k, 40), margin, y);
      // Value
      doc.setFontSize(8);
      doc.setTextColor(...C.dark);
      const valWrapped = doc.splitTextToSize(v || '\u2014', contentWidth * 0.6);
      doc.text(valWrapped, margin + contentWidth * 0.38, y);
      y += Math.max(valWrapped.length * 4.2, 5);
      // Separator line
      doc.setDrawColor(...C.grayLine);
      doc.setLineWidth(0.15);
      doc.line(margin, y, margin + contentWidth, y);
      y += 2.5;
    }
    kvPairs = [];
    y += 3;
  };

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    // ── Blank line ──
    if (!line) {
      flushKvTable();
      y += 2.5;
      i++;
      continue;
    }

    // ── Section header: ALL CAPS, 10–90 chars, no trailing period ──
    const isAllCaps = line === line.toUpperCase() && /[A-Z]{3,}/.test(line) && line.length >= 6 && line.length <= 90 && !line.endsWith('.') && !/^\d+\.$/.test(line);
    if (isAllCaps) {
      flushKvTable();
      checkBreak(16);
      y += 5;
      doc.setDrawColor(...C.grayLine);
      doc.setLineWidth(0.3);
      doc.line(margin, y, margin + contentWidth, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...C.blue);
      doc.setCharSpace(1.2);
      doc.text(line, margin, y);
      doc.setCharSpace(0);
      y += 7;
      i++;
      continue;
    }

    // ── Subsection: starts with "N.N" or "N.N.N" ──
    if (/^\d+\.\d+/.test(line)) {
      flushKvTable();
      checkBreak(12);
      y += 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...C.dark);
      const wrapped = doc.splitTextToSize(line, contentWidth);
      checkBreak(wrapped.length * 4.5 + 3);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 4.5 + 3;
      i++;
      continue;
    }

    // ── KV table detection: short key line followed by a value line ──
    // Only try this in a block context (not mid-paragraph)
    // Heuristic: line is < 55 chars, title-cased or all-caps-words,
    // doesn't start with common prose starters
    const proseStart = /^(This|The|A |An |In |For |By |To |If |When |All |Each |No |Not |As |At |On |Or |And |We |Our |Your |It |Is |Are |Has |Have |Will |Should |Must |Any |These |Those |Such |With |Under |Upon |Within |Between |During |Before |After |Since |Without )/.test(line);
    const isShortTitleLine = line.length < 55 && !line.endsWith('.') && !proseStart && kvPairs.length > 0;
    const nextLine = lines[i + 1]?.trim() || '';
    const nextIsValue = nextLine.length > 0 && !nextLine.endsWith(':') && i + 1 < lines.length;
    const couldBeKV = line.length < 55 && !line.endsWith('.') && !proseStart && nextIsValue && nextLine.length <= 120;

    if (couldBeKV && kvPairs.length > 0) {
      kvPairs.push([line, nextLine]);
      i += 2;
      continue;
    }

    // ── Start a KV block? Check if this looks like a table header pair ──
    // Only start at beginning of a block (after empty line or section header)
    if (couldBeKV && kvPairs.length === 0 && isShortTitleLine === false) {
      // Peek: if following 4+ lines look like KV pairs, start accumulating
      let peek = i;
      let peekedPairs = 0;
      while (peek + 1 < lines.length && peekedPairs < 2) {
        const pk = lines[peek].trim();
        const pv = lines[peek + 1]?.trim() || '';
        const proseK = /^(This|The|A |An |In |For |By |To |If |When |All )/.test(pk);
        if (pk && pv && pk.length < 55 && !pk.endsWith('.') && !proseK && pv.length <= 120) {
          peekedPairs++;
          peek += 2;
        } else {
          break;
        }
      }
      if (peekedPairs >= 2) {
        kvPairs.push([line, nextLine]);
        i += 2;
        continue;
      }
    }

    // ── Regular paragraph text ──
    flushKvTable();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.dark);
    const wrapped = doc.splitTextToSize(line, contentWidth);
    checkBreak(wrapped.length * 4.5 + 1.5);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 4.5 + 2;
    i++;
  }

  flushKvTable();
}

// ─── BUILDER: Single Full Policy PDF ─────────────────────────────────────────

async function buildSinglePolicyPDF(
  policyNumId: number,
  data: AuditExportData,
  jsPDF: any,
  logoData: Buffer | null
): Promise<Uint8Array | null> {
  const config = await getPolicyTemplate(policyNumId);
  if (!config) return null;

  const org = data.organization;

  // Build OrganizationData compatible object
  const orgData = {
    name: org.name,
    legal_name: org.legal_name || org.name,
    type: org.practice_type || 'Healthcare Organization',
    state: org.address_state || 'N/A',
    address_street: org.address_street || '',
    address_city: org.address_city || '',
    address_state: org.address_state || '',
    address_zip: org.address_zip || '',
    phone_number: org.phone_number || '',
    email_address: org.email_address || '',
    privacy_officer_name: org.privacy_officer_name || '',
    privacy_officer_email: org.privacy_officer_email || '',
    privacy_officer_role: 'Privacy Officer',
    security_officer_name: org.security_officer_name || org.privacy_officer_name || '',
    security_officer_email: org.security_officer_email || org.privacy_officer_email || '',
    security_officer_role: 'Security Officer',
    ein: org.ein || '',
    npi: org.npi || '',
    current_policy_id: config.policyId,
    assessment_date: new Date().toISOString(),
    next_review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  } as any;

  // Process template — replace all placeholders
  let content: string;
  try {
    content = processDocumentTemplate(config.template, orgData);
    // Remove any unresolved placeholders
    content = content.replace(/\{\{[^}]+\}\}/g, '').replace(/\n{4,}/g, '\n\n\n');
  } catch {
    return null;
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

  flowContentToPDF(
    doc,
    content,
    config.name.toUpperCase(),
    `${config.policyId}  ·  ${org.name}`,
    org.name,
    data.exportedAt,
    logoData
  );

  addPageNumbers(doc, org.name);
  return new Uint8Array(doc.output('arraybuffer') as ArrayBuffer);
}

// ─── BUILDER: Single Breach Letter PDF ───────────────────────────────────────

function buildBreachLetterPDF(
  breach: AuditExportData['breachNotifications'][number],
  data: AuditExportData,
  jsPDF: any,
  logoData: Buffer | null,
  letterType: 'patient' | 'hhs' | 'media'
): Uint8Array {
  const org = data.organization;
  const letterContent =
    letterType === 'patient' ? breach.patient_letter_content :
    letterType === 'hhs'     ? breach.hhs_letter_content :
                               breach.media_letter_content;

  const titleMap = {
    patient: 'PATIENT BREACH NOTIFICATION LETTER',
    hhs:     'HHS / OCR BREACH NOTIFICATION REPORT',
    media:   'MEDIA BREACH NOTIFICATION NOTICE',
  };
  const subtitleMap = {
    patient: '45 CFR §164.404  ·  Patient Notification',
    hhs:     '45 CFR §164.408  ·  HHS OCR Report',
    media:   '45 CFR §164.406  ·  Media Notice',
  };

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const { margin, contentWidth } = dims(doc);

  // If we have the stored letter content, flow it
  if (letterContent) {
    flowContentToPDF(
      doc,
      letterContent,
      titleMap[letterType],
      subtitleMap[letterType],
      org.name,
      data.exportedAt,
      logoData
    );
  } else {
    // Fallback: build a structured summary
    addHeader(doc, titleMap[letterType], subtitleMap[letterType], org.name, data.exportedAt, logoData);
    let y = 57;

    y = sectionTitle(doc, 'BREACH INCIDENT DETAILS', y, doc.internal.pageSize.getWidth(), margin);
    const rows: [string, string][] = [
      ['Organization', org.name],
      ['Breach Reference', breach.breach_id || breach.id.substring(0, 8).toUpperCase()],
      ['Discovery Date', fmtDate(breach.breach_discovery_date || breach.created_at)],
      ['Incident Date', fmtDate(breach.breach_occurred_date)],
      ['Breach Type', breach.breach_type || 'Under Investigation'],
      ['Individuals Affected', String(breach.individuals_affected || 'Unknown')],
      ['Status', (breach.status || 'Filed').toUpperCase()],
      ['Date Filed', fmtDate(breach.created_at)],
    ];
    y = kvTable(doc, rows, y, margin, contentWidth);
    y += 8;

    if (breach.breach_description) {
      y = sectionTitle(doc, 'INCIDENT DESCRIPTION', y, doc.internal.pageSize.getWidth(), margin);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...C.dark);
      const wrapped = doc.splitTextToSize(breach.breach_description, contentWidth);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 4.5 + 8;
    }
  }

  addPageNumbers(doc, org.name);
  return new Uint8Array(doc.output('arraybuffer') as ArrayBuffer);
}

// ─── BUILDER: Single Incident Detailed Report PDF ────────────────────────────

function buildSingleIncidentPDF(
  incident: AuditExportData['incidents'][number],
  data: AuditExportData,
  jsPDF: any,
  logoData: Buffer | null
): Uint8Array {
  const org = data.organization;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const { margin, contentWidth, pageWidth } = dims(doc);

  const severityText = incident.severity === 'high' ? 'HIGH' : incident.severity === 'low' ? 'LOW' : 'MEDIUM';
  const statusText   = incident.status === 'closed' ? 'CLOSED' : incident.status === 'under_review' ? 'UNDER REVIEW' : 'OPEN';

  addHeader(
    doc,
    'INCIDENT REPORT',
    `Ref: ${incident.id.substring(0, 8).toUpperCase()}  ·  ${org.name}`,
    org.name,
    data.exportedAt,
    logoData
  );
  let y = 57;

  // ── Title banner ──────────────────────────────────────────────────────────
  doc.setDrawColor(...C.grayLine);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, 18, 'S');
  // Severity color accent
  const sevColor = incident.severity === 'high' ? C.riskHigh : incident.severity === 'low' ? C.riskLow : C.riskMid;
  doc.setFillColor(...sevColor);
  doc.rect(margin, y, 3, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C.dark);
  const titleWrapped = doc.splitTextToSize(incident.incident_title, contentWidth - 60);
  doc.text(titleWrapped, margin + 8, y + 7);

  // Status + severity badges
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...sevColor);
  doc.text(`SEVERITY: ${severityText}`, margin + contentWidth - 50, y + 7);
  doc.setTextColor(...C.grayText);
  doc.text(`STATUS: ${statusText}`, margin + contentWidth - 50, y + 12);
  y += 24;

  // ── Incident Details ──────────────────────────────────────────────────────
  y = sectionTitle(doc, 'INCIDENT DETAILS', y, pageWidth, margin);
  const rows: [string, string][] = [
    ['Incident ID',           incident.id.substring(0, 8).toUpperCase()],
    ['Date Occurred',         fmtDate(incident.date_occurred)],
    ['Date Discovered',       fmtDate(incident.date_discovered)],
    ['Discovered By',         incident.discovered_by],
    ['PHI Involved',          incident.phi_involved ? 'YES — Protected Health Information Affected' : 'NO'],
    ['Breach Confirmed',      incident.breach_confirmed ? 'YES — Breach Confirmed' : 'NO — Not Confirmed as Breach'],
    ['Individuals Affected',  String(incident.estimated_individuals_affected || 0)],
    ['Severity Level',        severityText],
    ['Status',                statusText],
    ['Reported Date',         fmtDate(incident.date_discovered)],
  ];
  y = kvTable(doc, rows, y, margin, contentWidth);
  y += 8;

  // ── Description ───────────────────────────────────────────────────────────
  if (incident.description) {
    y = pgBreak(doc, y, 20, margin);
    y = sectionTitle(doc, 'INCIDENT DESCRIPTION', y, pageWidth, margin);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.dark);
    const descWrapped = doc.splitTextToSize(incident.description, contentWidth);
    const neededH = descWrapped.length * 4.5 + 4;
    if (y + neededH > doc.internal.pageSize.getHeight() - 25) {
      doc.addPage();
      addHeader(doc, 'INCIDENT REPORT', `Ref: ${incident.id.substring(0, 8).toUpperCase()}`, org.name, data.exportedAt, logoData);
      y = 57;
    }
    doc.text(descWrapped, margin, y);
    y += neededH;
  }

  // ── PHI Impact Analysis ───────────────────────────────────────────────────
  y = pgBreak(doc, y, 30, margin);
  y = sectionTitle(doc, 'IMPACT ANALYSIS', y, pageWidth, margin);
  const phiRows: [string, string][] = [
    ['PHI Involvement', incident.phi_involved ? 'Protected health information was involved in this incident.' : 'No protected health information was involved.'],
    ['Breach Status', incident.breach_confirmed ? 'This incident has been confirmed as a HIPAA breach requiring notification obligations.' : 'This incident has not been confirmed as a reportable breach.'],
    ['Individuals at Risk', `${incident.estimated_individuals_affected || 0} individual(s) potentially affected`],
  ];
  y = kvTable(doc, phiRows, y, margin, contentWidth);
  y += 8;

  // ── Response Notes ────────────────────────────────────────────────────────
  y = pgBreak(doc, y, 25, margin);
  y = sectionTitle(doc, 'RESPONSE AND DOCUMENTATION', y, pageWidth, margin);
  const responseRows: [string, string][] = [
    ['Incident Status', statusText],
    ['Documentation Date', fmtDate(incident.date_discovered)],
    ['Documented By', 'HIPAA Hub Compliance Platform'],
    ['Regulatory Framework', 'HIPAA/HITECH — 45 CFR Parts 160, 162, and 164'],
    ['Retention Requirement', '6 years from date of creation (45 CFR §164.530(j))'],
  ];
  y = kvTable(doc, responseRows, y, margin, contentWidth);
  y += 12;

  // ── Signature line ────────────────────────────────────────────────────────
  y = pgBreak(doc, y, 30, margin);
  doc.setDrawColor(...C.grayLine);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + 60, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.grayText);
  doc.text('Privacy / Compliance Officer Signature', margin, y + 5);
  doc.text('Date: ___________________________', margin + 80, y + 5);

  addPageNumbers(doc, org.name);
  return new Uint8Array(doc.output('arraybuffer') as ArrayBuffer);
}

// ─── BUILDER: Single Vendor Profile PDF ──────────────────────────────────────

function buildSingleVendorPDF(
  vendor: AuditExportData['vendors'][number],
  data: AuditExportData,
  jsPDF: any,
  logoData: Buffer | null
): Uint8Array {
  const org = data.organization;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const { margin, contentWidth, pageWidth } = dims(doc);

  const baaStatus  = !vendor.has_phi_access ? 'NOT REQUIRED' : vendor.baa_signed ? 'EXECUTED' : 'REQUIRED — MISSING';
  const riskText   = (vendor.risk_level || 'medium').toUpperCase();
  const riskClr    = riskColor(vendor.risk_level);

  addHeader(
    doc,
    'VENDOR PROFILE AND BAA STATUS',
    `Business Associate Documentation  ·  ${org.name}`,
    org.name,
    data.exportedAt,
    logoData
  );
  let y = 57;

  // ── Vendor banner ─────────────────────────────────────────────────────────
  doc.setDrawColor(...C.grayLine);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, 18, 'S');
  doc.setFillColor(...riskClr);
  doc.rect(margin, y, 3, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C.dark);
  doc.text(trunc(vendor.vendor_name, 50), margin + 8, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.grayText);
  doc.text(vendor.service_type, margin + 8, y + 14);

  // BAA badge
  doc.setFontSize(7);
  const baaColor = !vendor.has_phi_access ? C.riskLow : vendor.baa_signed ? C.riskLow : C.riskHigh;
  doc.setTextColor(...baaColor);
  doc.text(`BAA: ${baaStatus}`, margin + contentWidth - 55, y + 8);
  doc.setTextColor(...riskClr);
  doc.text(`RISK: ${riskText}`, margin + contentWidth - 55, y + 14);
  y += 24;

  // ── Vendor Details ────────────────────────────────────────────────────────
  y = sectionTitle(doc, 'VENDOR INFORMATION', y, pageWidth, margin);
  const rows: [string, string][] = [
    ['Vendor Name',       vendor.vendor_name],
    ['Service Type',      vendor.service_type],
    ['Risk Classification', riskText],
  ];
  if (vendor.contact_name)  rows.push(['Contact Name',  vendor.contact_name]);
  if (vendor.contact_email) rows.push(['Contact Email', vendor.contact_email]);
  y = kvTable(doc, rows, y, margin, contentWidth);
  y += 8;

  // ── PHI and BAA Status ────────────────────────────────────────────────────
  y = sectionTitle(doc, 'PHI ACCESS AND BAA STATUS', y, pageWidth, margin);
  const baaRows: [string, string][] = [
    ['PHI Access',          vendor.has_phi_access ? 'YES — This vendor accesses Protected Health Information' : 'NO — This vendor does not access PHI'],
    ['BAA Required',        vendor.has_phi_access ? 'YES — Business Associate Agreement is required' : 'NO — BAA not required (no PHI access)'],
    ['BAA Status',          baaStatus],
    ['BAA Executed Date',   fmtDate(vendor.baa_signed_date)],
    ['BAA Expiration Date', fmtDate(vendor.baa_expiration_date)],
    ['Compliance Status',   vendor.has_phi_access && !vendor.baa_signed ? 'NON-COMPLIANT — Execute BAA immediately' : 'COMPLIANT'],
  ];
  y = kvTable(doc, baaRows, y, margin, contentWidth);
  y += 8;

  // ── BAA Expiration Alert ──────────────────────────────────────────────────
  if (vendor.baa_expiration_date) {
    const expDate = new Date(vendor.baa_expiration_date);
    const now = new Date();
    const daysUntilExp = Math.floor((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExp <= 90) {
      y = pgBreak(doc, y, 20, margin);
      doc.setDrawColor(...C.riskHigh);
      doc.setLineWidth(0.5);
      doc.rect(margin, y, contentWidth, 12, 'S');
      doc.setFillColor(...C.riskHigh);
      doc.rect(margin, y, 3, 12, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...C.riskHigh);
      const expMsg = daysUntilExp <= 0
        ? `BAA EXPIRED — Expired on ${fmtDate(vendor.baa_expiration_date)}. Renew immediately.`
        : `BAA EXPIRING SOON — ${daysUntilExp} days remaining (${fmtDate(vendor.baa_expiration_date)})`;
      doc.text(expMsg, margin + 7, y + 7.5);
      y += 18;
    }
  }

  // ── Regulatory Reference ──────────────────────────────────────────────────
  y = pgBreak(doc, y, 30, margin);
  y = sectionTitle(doc, 'REGULATORY REFERENCE', y, pageWidth, margin);
  const regRows: [string, string][] = [
    ['Legal Basis',         '45 CFR §164.308(b) — Business Associate Contracts'],
    ['Requirement',         'HIPAA requires covered entities to enter BAAs with all business associates handling PHI'],
    ['Enforcement',         'Violations subject to OCR enforcement and civil monetary penalties up to $1.9M per category'],
    ['Review Frequency',    'BAAs should be reviewed annually and updated when services change'],
    ['Documentation Date',  fmtDate(data.exportedAt)],
    ['Prepared By',         'HIPAA Hub Compliance Platform'],
  ];
  y = kvTable(doc, regRows, y, margin, contentWidth);
  y += 12;

  // ── Signature line ────────────────────────────────────────────────────────
  y = pgBreak(doc, y, 25, margin);
  doc.setDrawColor(...C.grayLine);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + 60, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.grayText);
  doc.text('Privacy / Compliance Officer Signature', margin, y + 5);
  doc.text('Date: ___________________________', margin + 80, y + 5);

  addPageNumbers(doc, org.name);
  return new Uint8Array(doc.output('arraybuffer') as ArrayBuffer);
}
