import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { getUserPlanTier, isPracticePlus } from '@/lib/plan-gating';

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
      .select('id, name')
      .eq('user_id', user.id)
      .single();
    if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

    // Fetch employees + assignments
    const { data: employees } = await (supabase as any)
      .from('employees')
      .select('*')
      .eq('org_id', org.id)
      .eq('is_active', true)
      .order('last_name');

    const { data: assignments } = await (supabase as any)
      .from('training_assignments')
      .select('*, employee:employees(first_name, last_name, role_group), module:training_modules(module_name)')
      .eq('org_id', org.id)
      .order('employee_id');

    const totalEmployees = (employees ?? []).length;
    const totalAssignments = (assignments ?? []).length;
    const completed = (assignments ?? []).filter((a: any) => a.status === 'completed').length;
    const compliancePct = totalAssignments ? Math.round((completed / totalAssignments) * 100) : 100;

    const outOfCompliance = (assignments ?? []).filter(
      (a: any) => a.status !== 'completed'
    );

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
    doc.text('Training Compliance Audit Report', margin, 18);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${org.name}  ·  Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 28);
    y = 50;

    // ── Summary box ──
    doc.setFillColor(243, 245, 249);
    doc.rect(margin, y, W - margin * 2, 28, 'F');
    doc.setTextColor(14, 39, 78);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${compliancePct}% Team Compliance`, margin + 6, y + 10);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(86, 86, 86);
    doc.text(`Total Employees: ${totalEmployees}   |   Assignments: ${totalAssignments}   |   Completed: ${completed}   |   Out of Compliance: ${outOfCompliance.length}`, margin + 6, y + 20);
    y += 38;

    // ── All Assignments Table ──
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(14, 39, 78);
    doc.text('Assignment Details', margin, y);
    y += 6;

    // Table header
    doc.setFillColor(14, 39, 78);
    doc.rect(margin, y, W - margin * 2, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    const cols = [margin + 2, margin + 58, margin + 100, margin + 128, margin + 156];
    doc.text('Employee', cols[0], y + 5.5);
    doc.text('Module', cols[1], y + 5.5);
    doc.text('Status', cols[2], y + 5.5);
    doc.text('Completed', cols[3], y + 5.5);
    doc.text('Expires', cols[4], y + 5.5);
    y += 9;

    let rowBg = false;
    for (const a of (assignments ?? []) as any[]) {
      checkPage(8);
      if (rowBg) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, W - margin * 2, 7.5, 'F');
      }
      rowBg = !rowBg;

      const statusColor: Record<string, [number, number, number]> = {
        completed:   [22, 163, 74],
        in_progress: [217, 119, 6],
        not_started: [107, 114, 128],
        expired:     [220, 38,  38],
      };
      const [r, g, b] = statusColor[a.status] ?? [107, 114, 128];

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const empName = a.employee ? `${a.employee.first_name} ${a.employee.last_name}` : '—';
      doc.text(empName.substring(0, 22), cols[0], y + 5.5);
      doc.text((a.module?.module_name ?? '—').substring(0, 20), cols[1], y + 5.5);
      doc.setTextColor(r, g, b);
      doc.text(a.status.replace('_', ' '), cols[2], y + 5.5);
      doc.setTextColor(30, 30, 30);
      doc.text(a.completed_at ? new Date(a.completed_at).toLocaleDateString() : '—', cols[3], y + 5.5);
      doc.text(a.expires_at ? new Date(a.expires_at).toLocaleDateString() : '—', cols[4], y + 5.5);
      y += 7.5;
    }

    // ── Out of Compliance Section ──
    if (outOfCompliance.length > 0) {
      checkPage(30);
      y += 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text(`Out of Compliance (${outOfCompliance.length})`, margin, y);
      y += 6;

      doc.setFillColor(254, 242, 242);
      for (const a of outOfCompliance as any[]) {
        checkPage(8);
        doc.rect(margin, y, W - margin * 2, 7, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 30, 30);
        const empName = a.employee ? `${a.employee.first_name} ${a.employee.last_name}` : '—';
        doc.text(`${empName} — ${a.module?.module_name ?? 'Unknown Module'} — ${a.status.replace('_', ' ')}`, margin + 4, y + 5);
        y += 8;
      }
    }

    // ── Footer ──
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(160, 160, 160);
      doc.text(
        `HIPAA Hub — Training Compliance Audit Report  ·  ${org.name}  ·  Page ${i} of ${pageCount}`,
        W / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' }
      );
    }

    const pdfBytes = doc.output('arraybuffer');
    const fileName = `Training_Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`;

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Training audit report error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
