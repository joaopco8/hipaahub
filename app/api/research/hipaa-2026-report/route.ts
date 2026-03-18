export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

// GET /api/research/hipaa-2026-report
// Redirects to the 2026 HIPAA Hub Report PDF hosted via GitHub raw content.
// The PDF is hosted externally to avoid being included in the Vercel deployment bundle.
export async function GET() {
  // PDF hosted at a pinned GitHub commit (bfbb32a) where it was in public/
  const pdfUrl =
    'https://raw.githubusercontent.com/joaopco8/hipaahub/bfbb32a0b4b9c596b64c3fd9df3c0b445d6db5bc/public/2026_REPORT_HIPAAHUB.pdf';

  return NextResponse.redirect(pdfUrl, { status: 302 });
}
