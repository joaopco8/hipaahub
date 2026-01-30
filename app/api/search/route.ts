import { NextResponse } from 'next/server';

/**
 * Search API endpoint
 * 
 * This endpoint is kept for compatibility but returns empty results
 * as this SaaS application does not use MDX pages or a docs/blog system.
 * 
 * If search functionality is needed in the future, it should be implemented
 * for searching compliance documents, evidence, or other HIPAA-related content.
 */
export async function GET() {
  return NextResponse.json({
    results: []
  });
}
