import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { getUserPlanTier, isPracticePlus } from '@/lib/plan-gating';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const planTier = await getUserPlanTier();
    if (!isPracticePlus(planTier)) {
      return NextResponse.json({ error: 'Practice plan required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('id');
    if (!assignmentId) return NextResponse.json({ error: 'Missing assignment ID' }, { status: 400 });

    // Get org
    const { data: org } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('user_id', user.id)
      .single();
    if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

    // Get assignment with employee and module
    const { data: assignment, error: assignErr } = await (supabase as any)
      .from('training_assignments')
      .select('*, employee:employees(*), module:training_modules(*)')
      .eq('id', assignmentId)
      .eq('org_id', org.id)
      .single();

    if (assignErr || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    if (assignment.status !== 'completed') {
      return NextResponse.json({ error: 'Training not completed' }, { status: 400 });
    }

    const employee = assignment.employee;
    const module = assignment.module;
    const employeeName = `${employee.first_name} ${employee.last_name}`;
    const moduleName = module?.module_name ?? 'HIPAA Awareness Training';
    const completionDate = assignment.completed_at
      ? new Date(assignment.completed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const expirationDate = assignment.expires_at
      ? new Date(assignment.expires_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'N/A';
    const completionIp: string = assignment.completion_ip ?? 'Not recorded';

    // Get admin name
    const { data: adminProfile } = await supabase.from('users').select('full_name').eq('id', user.id).single();
    const adminName = (adminProfile as any)?.full_name ?? 'Compliance Administrator';
    const orgName = org.name ?? 'Your Organization';

    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const W = doc.internal.pageSize.getWidth(); // 297mm
    const H = doc.internal.pageSize.getHeight(); // 210mm

    // ── Background ──────────────────────────────────────────────
    doc.setFillColor(252, 252, 252);
    doc.rect(0, 0, W, H, 'F');

    // ── Outer decorative border (double) ────────────────────────
    // Outer thick border - navy
    doc.setDrawColor(14, 39, 78);
    doc.setLineWidth(2.5);
    doc.rect(6, 6, W - 12, H - 12);
    // Inner thin border - navy
    doc.setLineWidth(0.5);
    doc.rect(10, 10, W - 20, H - 20);

    // ── Gold accent lines at top and bottom of inner area ───────
    doc.setDrawColor(180, 145, 60);
    doc.setLineWidth(0.8);
    doc.line(10, 34, W - 10, 34);
    doc.line(10, H - 34, W - 10, H - 34);

    // ── Header band ─────────────────────────────────────────────
    doc.setFillColor(14, 39, 78);
    doc.rect(10, 10, W - 20, 24, 'F');

    // Header text - HIPAA HUB brand
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('HIPAA HUB', W / 2, 20, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(180, 210, 235);
    doc.text('OFFICIAL TRAINING CERTIFICATION RECORD', W / 2, 27, { align: 'center' });

    // Org name (right-aligned in header)
    doc.setTextColor(200, 220, 240);
    doc.setFontSize(6);
    doc.text(orgName.toUpperCase(), W - 15, 20, { align: 'right' });

    // ── "Certificate of Completion" title ───────────────────────
    doc.setTextColor(14, 39, 78);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Certificate of Completion', W / 2, 54, { align: 'center' });

    // Subtitle
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('This is to certify that', W / 2, 64, { align: 'center' });

    // ── Employee name ────────────────────────────────────────────
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(14, 39, 78);
    doc.text(employeeName, W / 2, 80, { align: 'center' });

    // Gold underline beneath name
    const nameWidth = Math.min(doc.getTextWidth(employeeName), W - 60);
    doc.setDrawColor(180, 145, 60);
    doc.setLineWidth(0.9);
    doc.line(W / 2 - nameWidth / 2, 83.5, W / 2 + nameWidth / 2, 83.5);

    // Role badge
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 90, 90);
    doc.text(employee.role_group, W / 2, 91, { align: 'center' });

    // ── "has successfully completed" ────────────────────────────
    doc.setFontSize(9.5);
    doc.setTextColor(100, 100, 100);
    doc.text('has successfully completed the required training program:', W / 2, 101, { align: 'center' });

    // ── Module name ──────────────────────────────────────────────
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 140, 200);
    doc.text(moduleName, W / 2, 113, { align: 'center' });

    // ── Info boxes (3 columns) ───────────────────────────────────
    const boxY = 122;
    const boxH = 16;
    const boxW = 72;
    const gap = 8;
    const startX = (W - (3 * boxW + 2 * gap)) / 2;

    const boxes = [
      { label: 'COMPLETION DATE', value: completionDate },
      { label: 'CERTIFICATE VALID THROUGH', value: expirationDate },
      { label: 'CERTIFICATE ID', value: assignmentId.substring(0, 18) + '…' },
    ];

    boxes.forEach((box, i) => {
      const bx = startX + i * (boxW + gap);
      doc.setFillColor(245, 247, 251);
      doc.setDrawColor(220, 225, 235);
      doc.setLineWidth(0.4);
      doc.rect(bx, boxY, boxW, boxH, 'FD');

      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(130, 140, 160);
      doc.text(box.label, bx + boxW / 2, boxY + 5.5, { align: 'center' });

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(14, 39, 78);
      doc.text(box.value, bx + boxW / 2, boxY + 12.5, { align: 'center' });
    });

    // ── Signature lines ──────────────────────────────────────────
    const sigY = 149;
    const sigLineLen = 58;
    const leftSig = W / 2 - 65;
    const rightSig = W / 2 + 15;

    doc.setDrawColor(14, 39, 78);
    doc.setLineWidth(0.5);
    doc.line(leftSig, sigY, leftSig + sigLineLen, sigY);
    doc.line(rightSig, sigY, rightSig + sigLineLen, sigY);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(14, 39, 78);
    doc.text(adminName, leftSig + sigLineLen / 2, sigY + 5, { align: 'center' });
    doc.text('Authorized Representative', rightSig + sigLineLen / 2, sigY + 5, { align: 'center' });

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(130, 130, 130);
    doc.text('Privacy & Compliance Officer', leftSig + sigLineLen / 2, sigY + 9.5, { align: 'center' });
    doc.text('HIPAA Hub Health', rightSig + sigLineLen / 2, sigY + 9.5, { align: 'center' });

    // ── Footer strip (inside gold line) ─────────────────────────
    doc.setFillColor(14, 39, 78);
    doc.rect(10, H - 34, W - 20, 24, 'F');

    // IP + cert metadata
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 215, 235);
    doc.text(
      `Completion IP: ${completionIp}   ·   Organization: ${orgName}   ·   Issued: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      W / 2, H - 27, { align: 'center' }
    );
    doc.setTextColor(150, 175, 210);
    doc.text(
      `Certificate ID: ${assignmentId}   ·   Generated by HIPAA Hub   ·   This certificate is valid for one year from completion date.`,
      W / 2, H - 21, { align: 'center' }
    );

    // Corner ornaments (small squares)
    doc.setFillColor(180, 145, 60);
    [[10, 10], [W - 14, 10], [10, H - 14], [W - 14, H - 14]].forEach(([cx, cy]) => {
      doc.rect(cx, cy, 4, 4, 'F');
    });

    const pdfBytes = doc.output('arraybuffer');
    const fileName = `Certificate_${employeeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Staff certificate error:', error);
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 });
  }
}
