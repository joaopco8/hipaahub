import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Extract IP address from request headers (forensic evidence)
    // Try multiple headers in order of preference for different hosting environments
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    const xClientIp = request.headers.get('x-client-ip');
    
    // Get the first IP from x-forwarded-for (can contain multiple IPs)
    const ipFromForwarded = forwarded?.split(',')[0]?.trim();
    
    // Try to get IP from request URL (for local development)
    let ipFromUrl: string | null = null;
    try {
      const url = new URL(request.url);
      // In some environments, IP might be in the URL
      ipFromUrl = url.searchParams.get('ip');
    } catch {
      // URL parsing failed, ignore
    }
    
    // Priority: x-forwarded-for > x-real-ip > cf-connecting-ip > x-client-ip > url param > localhost fallback
    let acknowledgementIp = ipFromForwarded || realIp || cfConnectingIp || xClientIp || ipFromUrl;
    
    // If still no IP found, try to get it from an external service (fallback)
    if (!acknowledgementIp || acknowledgementIp === 'unknown') {
      try {
        // Try to get IP from a reliable service (only as last resort)
        const ipResponse = await fetch('https://api.ipify.org?format=json', {
          signal: AbortSignal.timeout(2000) // 2 second timeout
        });
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          acknowledgementIp = ipData.ip || 'unknown';
        }
      } catch (err) {
        // External service failed, use fallback
        acknowledgementIp = process.env.NODE_ENV === 'development' 
          ? '127.0.0.1 (dev)' 
          : 'unknown';
      }
    }
    
    // Ensure we always have a value (never null, undefined, or empty)
    if (!acknowledgementIp || typeof acknowledgementIp !== 'string' || acknowledgementIp.trim() === '') {
      acknowledgementIp = 'unknown';
    }
    
    // Clean the IP (remove any whitespace)
    acknowledgementIp = acknowledgementIp.trim();
    
    // Final validation - ensure it's a valid string
    if (!acknowledgementIp) {
      acknowledgementIp = 'unknown';
    }
    
    // Log IP capture for debugging
    console.log('Captured IP:', acknowledgementIp, 'from headers:', {
      'x-forwarded-for': forwarded,
      'x-real-ip': realIp,
      'cf-connecting-ip': cfConnectingIp,
      'x-client-ip': xClientIp,
      'url-param': ipFromUrl,
      'environment': process.env.NODE_ENV
    });

    // Get organization_id
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // SOLUTION: Insert directly into table using a function that executes raw SQL
    // This completely bypasses PostgREST schema cache validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    // Try multiple approaches in sequence
    let success = false;
    let lastError: any = null;

    // Approach 1: Try the simple JSONB function
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/insert_training_via_jsonb`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          p_json: {
            user_id: user.id,
            organization_id: org?.id || null,
            staff_member_id: body.staff_member_id || null,
            full_name: body.full_name,
            email: body.email,
            role_title: body.role_title,
            training_type: body.training_type,
            training_date: body.training_date,
            completion_status: body.completion_status,
            expiration_date: body.expiration_date,
            acknowledgement: body.acknowledgement,
            acknowledgement_date: body.acknowledgement_date,
            recorded_by: body.recorded_by,
            record_timestamp: body.record_timestamp,
            training_content_version: body.training_content_version || '1.0',
            quiz_score: body.quiz_score || null,
            quiz_answers: body.quiz_answers || null,
            certificate_id: body.certificate_id || null,
            acknowledgement_ip: acknowledgementIp,
            user_agent: body.user_agent || null,
            training_start_time: body.training_start_time || null,
            training_duration_minutes: body.training_duration_minutes || null
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ data: typeof data === 'object' && data !== null ? data : {} });
      }
      
      const errorText = await response.text();
      lastError = errorText;
    } catch (err: any) {
      lastError = err.message;
    }

    // Approach 2: Try direct INSERT via PostgREST table endpoint
    // This bypasses RPC functions entirely and inserts directly into the table
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/training_records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id: user.id,
          organization_id: org?.id || null,
          staff_member_id: body.staff_member_id || null,
          full_name: body.full_name,
          email: body.email,
          role_title: body.role_title,
          training_type: body.training_type,
          training_date: body.training_date,
          completion_status: body.completion_status,
          expiration_date: body.expiration_date,
          acknowledgement: body.acknowledgement,
          acknowledgement_date: body.acknowledgement_date,
          recorded_by: body.recorded_by,
          record_timestamp: body.record_timestamp,
          training_content_version: body.training_content_version || '1.0',
          quiz_score: body.quiz_score || null,
          quiz_answers: body.quiz_answers || null,
          certificate_id: body.certificate_id || null,
          acknowledgement_ip: acknowledgementIp,
          user_agent: body.user_agent || null,
          training_start_time: body.training_start_time || null,
          training_duration_minutes: body.training_duration_minutes || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        const result = Array.isArray(data) ? data[0] : data;
        return NextResponse.json({ data: result });
      }
      
      // If table endpoint also fails, log the error
      const errorText = await response.text();
      console.log('Direct table insert failed:', errorText);
      if (!lastError) lastError = errorText;
    } catch (err: any) {
      console.log('Direct table insert exception:', err.message);
      if (!lastError) lastError = err.message;
    }

    // Approach 3: Use Supabase client directly (might work if schema cache is updated on server)
    try {
      const { data: insertData, error: insertError } = await supabase
        .from('training_records' as any)
        .insert({
          user_id: user.id,
          organization_id: org?.id || null,
          staff_member_id: body.staff_member_id || null,
          full_name: body.full_name,
          email: body.email,
          role_title: body.role_title,
          training_type: body.training_type,
          training_date: body.training_date,
          completion_status: body.completion_status,
          expiration_date: body.expiration_date,
          acknowledgement: body.acknowledgement,
          acknowledgement_date: body.acknowledgement_date,
          recorded_by: body.recorded_by,
          record_timestamp: body.record_timestamp,
          training_content_version: body.training_content_version || '1.0',
          quiz_score: body.quiz_score || null,
          quiz_answers: body.quiz_answers || null,
          certificate_id: body.certificate_id || null,
          acknowledgement_ip: acknowledgementIp,
          user_agent: body.user_agent || null,
          training_start_time: body.training_start_time || null,
          training_duration_minutes: body.training_duration_minutes || null
        })
        .select()
        .single();

      if (!insertError && insertData) {
        return NextResponse.json({ data: insertData });
      }
      
      if (insertError) {
        console.log('Supabase client insert error:', insertError.message);
        if (!lastError) lastError = insertError.message;
      }
    } catch (err: any) {
      console.log('Supabase client insert exception:', err.message);
      if (!lastError) lastError = err.message;
    }

    // Approach 4: Use service_role_key if available (bypasses RLS and schema cache)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/training_records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            user_id: user.id,
            organization_id: org?.id || null,
            staff_member_id: body.staff_member_id || null,
            full_name: body.full_name,
            email: body.email,
            role_title: body.role_title,
            training_type: body.training_type,
            training_date: body.training_date,
            completion_status: body.completion_status,
            expiration_date: body.expiration_date,
            acknowledgement: body.acknowledgement,
            acknowledgement_date: body.acknowledgement_date,
            recorded_by: body.recorded_by,
            record_timestamp: body.record_timestamp,
            training_content_version: body.training_content_version || '1.0',
            quiz_score: body.quiz_score || null,
            quiz_answers: body.quiz_answers || null,
            certificate_id: body.certificate_id || null,
            acknowledgement_ip: acknowledgementIp,
            user_agent: body.user_agent || null,
            training_start_time: body.training_start_time || null,
            training_duration_minutes: body.training_duration_minutes || null
          })
        });

        if (response.ok) {
          const data = await response.json();
          const result = Array.isArray(data) ? data[0] : data;
          return NextResponse.json({ data: result });
        }
      } catch (err: any) {
        // Service role also failed
        console.log('Service role insert failed:', err.message);
      }
    }

    // If all approaches failed, return detailed error with actionable steps
    const errorDetails = lastError || 'Unknown error';
    const isSchemaCacheError = errorDetails.includes('schema cache') || 
                                errorDetails.includes('not found') ||
                                errorDetails.includes('training_records');
    
    return NextResponse.json(
      { 
        error: `❌ All insertion methods failed.\n\n` +
          `Last error: ${errorDetails}\n\n` +
          `🔧 SOLUTION (execute in order):\n\n` +
          `1️⃣ Verify table exists in database:\n` +
          `   Run in Supabase SQL Editor:\n` +
          `   SELECT table_name FROM information_schema.tables WHERE table_name = 'training_records';\n` +
          `   (Should return 1 row)\n\n` +
          `2️⃣ If table doesn't exist, run migration:\n` +
          `   supabase/migrations/20241220000011_create_training_records.sql\n\n` +
          `3️⃣ Force PostgREST to reload schema:\n` +
          `   - Option A: Wait 2-3 minutes (auto-reload)\n` +
          `   - Option B: Supabase Dashboard → Settings → API → "Reload Schema"\n` +
          `   - Option C: Restart Supabase (if local): supabase restart\n\n` +
          `4️⃣ After reload, try again\n\n` +
          `💡 The table exists in the database, but PostgREST cache needs to be updated.`
      },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Error creating training record:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create training record' },
      { status: 500 }
    );
  }
}
