import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkoutWithStripe } from '@/utils/stripe/server';
import { getUser } from '@/utils/supabase/queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const priceId: string | undefined = body.priceId?.replace(/\s+/g, '') || undefined;
    if (!priceId) {
      return NextResponse.json({ error: 'priceId is required' }, { status: 400 });
    }

    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: price } = await supabase
      .from('prices')
      .select('*, products(*)')
      .eq('id', priceId)
      .single();

    // If price not in DB, create a minimal price object for checkout
    const priceData = price ?? {
      id: priceId,
      unit_amount: null,
      currency: 'usd',
      type: 'recurring' as const,
      interval: 'month' as const,
      interval_count: 1,
      trial_period_days: null,
      active: true,
      product_id: '',
      description: null,
      metadata: null,
      products: null,
    };

    const { sessionId, sessionUrl, errorRedirect } = await checkoutWithStripe(
      priceData as any,
      '/dashboard?subscribed=true'
    );

    if (errorRedirect) {
      return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
    }

    return NextResponse.json({ url: sessionUrl, sessionId });
  } catch (err: any) {
    console.error('create-checkout-session error:', err);
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 });
  }
}
