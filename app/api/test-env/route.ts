import { NextResponse } from 'next/server';

/**
 * Diagnostic endpoint to check if SUPABASE_SERVICE_ROLE_KEY is available
 * Access at: http://localhost:3000/api/test-env
 */
export async function GET() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publicServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  
  const allSupabaseVars = Object.keys(process.env)
    .filter(k => k.includes('SUPABASE'))
    .reduce((acc, key) => {
      acc[key] = {
        exists: !!process.env[key],
        length: process.env[key]?.length || 0,
        preview: process.env[key]?.substring(0, 30) + '...' || 'empty'
      };
      return acc;
    }, {} as Record<string, any>);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    serviceRoleKey: {
      exists: !!serviceRoleKey,
      length: serviceRoleKey?.length || 0,
      preview: serviceRoleKey ? serviceRoleKey.substring(0, 30) + '...' : 'NOT SET',
      fullValue: serviceRoleKey || 'NOT SET'
    },
    publicServiceRoleKey: {
      exists: !!publicServiceRoleKey,
      length: publicServiceRoleKey?.length || 0,
      preview: publicServiceRoleKey ? publicServiceRoleKey.substring(0, 30) + '...' : 'NOT SET'
    },
    allSupabaseVars,
    processEnvKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE')),
    cwd: process.cwd()
  }, { status: 200 });
}



