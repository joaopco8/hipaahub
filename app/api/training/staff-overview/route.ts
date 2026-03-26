import { NextResponse } from 'next/server';
import { getEmployeesWithAssignments, getTrainingOverviewStats } from '@/app/actions/staff-training';

export async function GET() {
  try {
    const [employees, stats] = await Promise.all([
      getEmployeesWithAssignments(),
      getTrainingOverviewStats(),
    ]);
    return NextResponse.json({ employees, stats });
  } catch (error) {
    console.error('Staff overview error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
