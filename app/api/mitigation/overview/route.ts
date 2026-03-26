import { NextResponse } from 'next/server';
import { getMitigationItems, getMitigationStats } from '@/app/actions/mitigation';

export async function GET() {
  try {
    const [items, stats] = await Promise.all([getMitigationItems(), getMitigationStats()]);
    return NextResponse.json({ items, stats });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
