import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Health check endpoint
 * Used by monitoring services to verify application status
 * 
 * GET /api/health
 * Returns: { status: 'ok' | 'degraded' | 'down', checks: {...} }
 */
export async function GET() {
  const checks: Record<string, { status: 'ok' | 'error'; message?: string }> = {};
  let overallStatus: 'ok' | 'degraded' | 'down' = 'ok';

  // Check database connection
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);

    if (error) {
      checks.database = { status: 'error', message: error.message };
      overallStatus = 'down';
    } else {
      checks.database = { status: 'ok' };
    }
  } catch (error) {
    checks.database = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
    overallStatus = 'down';
  }

  // Check storage connection
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      checks.storage = { status: 'error', message: error.message };
      overallStatus = overallStatus === 'ok' ? 'degraded' : 'down';
    } else {
      checks.storage = { status: 'ok' };
    }
  } catch (error) {
    checks.storage = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
    overallStatus = overallStatus === 'ok' ? 'degraded' : 'down';
  }

  // Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingEnvVars.length > 0) {
    checks.environment = {
      status: 'error',
      message: `Missing: ${missingEnvVars.join(', ')}`,
    };
    overallStatus = 'down';
  } else {
    checks.environment = { status: 'ok' };
  }

  const statusCode = overallStatus === 'ok' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    },
    { status: statusCode }
  );
}
