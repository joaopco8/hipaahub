import { NextRequest, NextResponse } from 'next/server';
import { getMitigationItem } from '@/app/actions/mitigation';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json([], { status: 400 });
  try {
    const result = await getMitigationItem(id);
    return NextResponse.json(result?.comments ?? []);
  } catch {
    return NextResponse.json([]);
  }
}
