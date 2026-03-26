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

    // Get admin name
    const { data: adminProfile } = await supabase.from('users').select('full_name').eq('id', user.id).single();
    const adminName = (adminProfile as any)?.full_name ?? 'Compliance Administrator';

    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    // Outer border
    doc.setDrawColor(14, 39, 78);
    doc.setLineWidth(3);
    doc.rect(8, 8, W - 16, H - 16);
    doc.setLineWidth(0.8);
    doc.rect(13, 13, W - 26, H - 26);

    // Header bar
    doc.setFillColor(14, 39, 78);
    doc.rect(13, 13, W - 26, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('HIPAA HUB  ·  COMPLIANCE TRAINING CERTIFICATE', W / 2, 27, { align: 'center' });

    // Org name
    doc.setTextColor(0, 188, 235);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(org.name ?? 'Your Organization', W / 2, 48, { align: 'center' });

    // Title
    doc.setTextColor(14, 39, 78);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('Certificate of Completion', W / 2, 62, { align: 'center' });

    // Subtitle
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('This certifies that', W / 2, 74, { align: 'center' });

    // Employee name
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(14, 39, 78);
    doc.text(employeeName, W / 2, 90, { align: 'center' });

    // Underline
    const nameWidth = doc.getTextWidth(employeeName);
    doc.setDrawColor(0, 188, 235);
    doc.setLineWidth(0.8);
    doc.line(W / 2 - nameWidth / 2, 93, W / 2 + nameWidth / 2, 93);

    // Role
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(employee.role_group, W / 2, 100, { align: 'center' });

    // "has successfully completed"
    doc.setFontSize(11);
    doc.text('has successfully completed', W / 2, 112, { align: 'center' });

    // Module name
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 188, 235);
    doc.text(moduleName, W / 2, 123, { align: 'center' });

    // Dates row
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Completion Date: ${completionDate}`, W / 2 - 55, 138, { align: 'center' });
    doc.text(`Valid Through: ${expirationDate}`, W / 2 + 55, 138, { align: 'center' });

    // Signature
    const sigY = 156;
    doc.setDrawColor(14, 39, 78);
    doc.setLineWidth(0.5);
    doc.line(W / 2 - 65, sigY, W / 2 - 15, sigY);
    doc.line(W / 2 + 15, sigY, W / 2 + 65, sigY);

    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text(adminName, W / 2 - 40, sigY + 5, { align: 'center' });
    doc.text('Authorized Representative', W / 2 + 40, sigY + 5, { align: 'center' });

    // Certificate ID footer
    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `Certificate ID: ${assignmentId}  ·  Generated by HIPAA Hub  ·  ${new Date().toLocaleDateString()}`,
      W / 2, H - 18, { align: 'center' }
    );

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
