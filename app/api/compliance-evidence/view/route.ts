/**
 * Compliance Evidence View API
 * Generates signed URLs for evidence file viewing/preview
 */

// Force dynamic rendering - this route uses Supabase auth which requires cookies
export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/utils/supabase/queries';
import { Database } from '@/types/db';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    let fileUrl = searchParams.get('file_url');
    const bucket = searchParams.get('bucket') || 'evidence';

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'Missing file_url parameter' },
        { status: 400 }
      );
    }

    // Decode URL-encoded path
    fileUrl = decodeURIComponent(fileUrl);

    // Remove leading slash if present (Supabase Storage paths should not start with /)
    fileUrl = fileUrl.replace(/^\//, '');

    // Get organization to verify access
    const { data: organization } = await supabase
      .from('organizations')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Try to generate signed URL with regular client first
    let urlData, urlError;
    
    // First attempt with the path as-is
    ({ data: urlData, error: urlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(fileUrl, 3600));

    // If that fails, try with admin client to verify file exists
    if (urlError && (urlError.message?.includes('not found') || urlError.message?.includes('Object not found'))) {
      console.log('Regular client failed, trying with admin client to verify file...', { 
        originalPath: fileUrl,
        error: urlError.message 
      });

      // Use admin client to check if file exists (bypasses RLS)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && serviceKey) {
        const supabaseAdmin = createAdminClient<Database>(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        // Try to list files in the directory to see what exists
        const pathParts = fileUrl.split('/');
        const directory = pathParts.slice(0, -1).join('/');
        const fileName = pathParts[pathParts.length - 1];

        const { data: files, error: listError } = await supabaseAdmin.storage
          .from(bucket)
          .list(directory || '', {
            limit: 1000,
            search: fileName
          });

        if (listError) {
          console.error('Error listing files:', listError);
        } else {
          console.log('Files found in directory:', {
            directory,
            fileName,
            foundFiles: files?.map(f => f.name),
            exactMatch: files?.some(f => f.name === fileName)
          });
        }

        // Try to generate signed URL with admin client
        ({ data: urlData, error: urlError } = await supabaseAdmin.storage
          .from(bucket)
          .createSignedUrl(fileUrl, 3600));

        if (urlError) {
          // Try alternative path formats
          const pathParts = fileUrl.split('/');
          
          // Try removing duplicate 'evidence' prefix if exists
          if (pathParts[1] === 'evidence' && pathParts.length > 2) {
            const alternativePath = pathParts.slice(2).join('/');
            console.log('Trying alternative path (removed duplicate evidence):', alternativePath);
            ({ data: urlData, error: urlError } = await supabaseAdmin.storage
              .from(bucket)
              .createSignedUrl(alternativePath, 3600));
          }
        }
      }
    }

    if (urlError) {
      console.error('Failed to generate signed URL:', {
        error: urlError,
        fileUrl,
        bucket,
        message: urlError.message
      });

      // Return more specific error message with debug info
      if (urlError.message?.includes('not found') || urlError.message?.includes('Object not found')) {
        // Try to list files in the parent directory to help debug
        const pathParts = fileUrl.split('/');
        const parentDir = pathParts.slice(0, -1).join('/');
        const fileName = pathParts[pathParts.length - 1];
        
        let debugInfo: any = {
          requestedPath: fileUrl,
          bucket,
          parentDirectory: parentDir,
          fileName,
        };

        // Try to list files in parent directory for debugging
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          
          if (supabaseUrl && serviceKey) {
            const supabaseAdmin = createAdminClient<Database>(supabaseUrl, serviceKey, {
              auth: { autoRefreshToken: false, persistSession: false },
            });

            const { data: listedFiles } = await supabaseAdmin.storage
              .from(bucket)
              .list(parentDir || '', { limit: 100 });
            
            debugInfo.availableFiles = listedFiles?.map(f => f.name) || [];
            debugInfo.fileExists = listedFiles?.some(f => f.name === fileName);
          }
        } catch (debugError) {
          // Ignore debug errors
        }

        return NextResponse.json(
          { 
            error: 'File not found in storage. The file may have been deleted or the path is incorrect.',
            details: debugInfo,
            suggestion: 'Please re-upload the document or verify the file path in the database.'
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Failed to generate view URL',
          details: urlError.message || 'Unknown error'
        },
        { status: 500 }
      );
    }

    if (!urlData?.signedUrl) {
      return NextResponse.json(
        { error: 'Failed to generate view URL - no URL returned' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      view_url: urlData.signedUrl,
    });

  } catch (error: any) {
    console.error('View URL generation error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate view URL',
        details: error.stack
      },
      { status: 500 }
    );
  }
}
