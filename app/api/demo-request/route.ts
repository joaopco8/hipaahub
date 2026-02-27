/**
 * Demo Request API
 * Handles demo request submissions from the landing page modal
 */

export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, source = 'demo_request', organization, staffSize } = body;

    // Validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Prepare lead data
    const leadData: any = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone_number: phone.trim(),
      source: source
    };

    // Add optional fields if provided
    if (organization) {
      leadData.organization = organization.trim();
    }
    if (staffSize) {
      leadData.staff_size = staffSize;
    }

    // Insert lead into database
    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting lead:', error);
      return NextResponse.json(
        { error: 'Failed to submit request. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Demo request submitted successfully',
        id: data.id 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in demo-request API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
