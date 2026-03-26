import { NextResponse } from 'next/server';
import { getVendorsWithBAA, getBAAStats } from '@/app/actions/baa-tracker';

export async function GET() {
  try {
    const [vendors, stats] = await Promise.all([getVendorsWithBAA(), getBAAStats()]);
    return NextResponse.json({ vendors, stats });
  } catch (error) {
    console.error('BAA overview error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
