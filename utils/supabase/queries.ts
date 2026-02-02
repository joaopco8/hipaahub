import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { Database } from '@/types/db';

export const getUser = cache(async (supabase: SupabaseClient<Database>) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
});

export const getSubscription = cache(async (supabase: SupabaseClient<Database>, userId: string) => {
  try {
    // Now fetch the subscription for this user
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        prices (
          *,
          products (*)
        )
      `)
      .eq('user_id', userId)
      .in('status', ['trialing', 'active'])
      .maybeSingle();

    if (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError);
      return null;
    }

    return subscription;
  } catch (err: any) {
    console.error('Exception in getSubscription:', err);
    // Always return null to prevent Server Component errors
    return null;
  }
});

export const getProducts = cache(async (supabase: SupabaseClient) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*, prices(*)')
      .eq('active', true);

    if (error) {
      console.error('Error fetching products:', error);
      // Return empty array instead of null to prevent Server Component errors
      return [];
    }

    // If no products, return empty array
    if (!products || products.length === 0) {
      return [];
    }

    // Filter products that have at least one active price
    const productsWithActivePrices = products.filter((product) => {
      if (!product.prices || !Array.isArray(product.prices)) {
        return false;
      }
      return product.prices.some((price: any) => price.active === true);
    });

    // Sort by metadata index if available, otherwise by id
    productsWithActivePrices.sort((a, b) => {
      const aIndex = a.metadata?.index ?? 999;
      const bIndex = b.metadata?.index ?? 999;
      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }
      // Fallback to id if index is the same
      return (a.id || '').localeCompare(b.id || '');
    });

    return productsWithActivePrices;
  } catch (err: any) {
    console.error('Exception in getProducts:', err);
    // Always return empty array to prevent Server Component errors
    return [];
  }
});

export const getPlans = cache(async (supabase: SupabaseClient) => {
  const { data: plans, error } = await supabase
    .from('plan')
    .select('*')
    .order('sort', { ascending: true })
    .order('id', { ascending: true }); // Secondary sort by id as a fallback

  if (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
  return plans;
});

export const getUserDetails = cache(async (supabase: SupabaseClient) => {
  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .single();
  return userDetails;
});

// Get Organization
export const getOrganization = cache(async (supabase: SupabaseClient<Database>, userId: string) => {
  const { data: organization, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // PGRST116 is "no rows returned" - this is expected when organization doesn't exist
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching organization:', error);
    return null;
  }

  return organization || null;
});

// Get Risk Assessment (from onboarding_risk_assessments table)
export const getRiskAssessment = cache(async (supabase: SupabaseClient<Database>, userId: string) => {
  // NOTE: `onboarding_risk_assessments` is not currently present in `types/db.ts`.
  // We intentionally use an untyped query here to avoid TS build failures while still fetching real data.
  const { data: riskAssessment, error } = await (supabase as any)
    .from('onboarding_risk_assessments')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // PGRST116 is "no rows returned" - this is expected when risk assessment doesn't exist
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching risk assessment:', error);
    return null;
  }

  return riskAssessment || null;
});

// Get Staff Members
export const getStaffMembers = cache(async (supabase: SupabaseClient<Database>, userId: string) => {
  const { data: staff, error } = await supabase
    .from('staff_members')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    return [];
  }

  return staff || [];
});

// Get Compliance Commitment
export const getComplianceCommitment = cache(async (supabase: SupabaseClient<Database>, userId: string) => {
  const { data: commitment, error } = await supabase
    .from('compliance_commitments')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // PGRST116 is "no rows returned" - this is expected when commitment doesn't exist
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching compliance commitment:', error);
    return null;
  }

  return commitment || null;
});

// Get Action Items
export const getActionItems = cache(async (supabase: SupabaseClient<Database>, userId: string) => {
  const { data: actionItems, error } = await supabase
    .from('action_items')
    .select('*')
    .eq('user_id', userId)
    .order('status', { ascending: true }) // pending, in-progress, completed
    .order('priority', { ascending: true }) // critical, high, medium
    .order('created_at', { ascending: true });

  if (error) {
    return [];
  }

  return actionItems || [];
});