import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';

export type PlanTier = 'solo' | 'practice' | 'clinic' | 'enterprise' | 'unknown';

const SOLO_PRICE_IDS = [
  process.env.NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID,
  'price_1TEHcrFjJxHsNvNGmvH3pQur',
].filter(Boolean) as string[];

const PRACTICE_PRICE_IDS = [
  process.env.NEXT_PUBLIC_STRIPE_PRACTICE_PRICE_ID,
  'price_1TEHd6FjJxHsNvNGahdVbS6N',
].filter(Boolean) as string[];

const CLINIC_PRICE_IDS = [
  process.env.NEXT_PUBLIC_STRIPE_CLINIC_PRICE_ID,
  'price_1TEHdcFjJxHsNvNGzViIgMp8',
].filter(Boolean) as string[];

export async function getUserPlanTier(): Promise<PlanTier> {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user) return 'unknown';

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('price_id, status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .order('created', { ascending: false })
      .limit(1)
      .single();

    if (!sub?.price_id) return 'unknown';

    if (SOLO_PRICE_IDS.includes(sub.price_id)) return 'solo';
    if (PRACTICE_PRICE_IDS.includes(sub.price_id)) return 'practice';
    if (CLINIC_PRICE_IDS.includes(sub.price_id)) return 'clinic';
    // Any other active price_id treated as enterprise
    return 'enterprise';
  } catch {
    return 'unknown';
  }
}

const TIER_RANK: Record<PlanTier, number> = {
  unknown: 0,
  solo: 1,
  practice: 2,
  clinic: 3,
  enterprise: 4,
};

/** Returns true if the user's current plan meets or exceeds `required`. */
export function meetsMinimumPlan(current: PlanTier, required: PlanTier): boolean {
  return TIER_RANK[current] >= TIER_RANK[required];
}

/** Convenience: true when user is on Practice, Clinic, or Enterprise. */
export function isPracticePlus(tier: PlanTier): boolean {
  return meetsMinimumPlan(tier, 'practice');
}
