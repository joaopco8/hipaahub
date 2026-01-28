/**
 * Dashboard Data Cache Layer
 * 
 * Uses React cache() to deduplicate and share data fetches
 * across layout and page components during a single request.
 */

import { cache } from 'react';
import { createClient } from '@/utils/supabase/server';
import {
  getUser,
  getUserDetails,
  getOrganization,
  getComplianceCommitment,
  getSubscription,
  getRiskAssessment,
  getStaffMembers,
  getActionItems
} from '@/utils/supabase/queries';

/**
 * Cached user data fetch
 * Deduplicates multiple calls to getUser in the same request
 */
export const getCachedUser = cache(async () => {
  const supabase = createClient();
  return getUser(supabase);
});

/**
 * Cached user details fetch
 */
export const getCachedUserDetails = cache(async () => {
  const supabase = createClient();
  return getUserDetails(supabase);
});

/**
 * Cached subscription fetch
 */
export const getCachedSubscription = cache(async (userId: string) => {
  const supabase = createClient();
  return getSubscription(supabase, userId);
});

/**
 * Cached organization fetch
 */
export const getCachedOrganization = cache(async (userId: string) => {
  const supabase = createClient();
  return getOrganization(supabase, userId);
});

/**
 * Cached compliance commitment fetch
 */
export const getCachedComplianceCommitment = cache(async (userId: string) => {
  const supabase = createClient();
  return getComplianceCommitment(supabase, userId);
});

/**
 * Cached risk assessment fetch
 */
export const getCachedRiskAssessment = cache(async (userId: string) => {
  const supabase = createClient();
  return getRiskAssessment(supabase, userId);
});

/**
 * Cached staff members fetch
 */
export const getCachedStaffMembers = cache(async (userId: string) => {
  const supabase = createClient();
  return getStaffMembers(supabase, userId);
});

/**
 * Cached action items fetch
 */
export const getCachedActionItems = cache(async (userId: string) => {
  const supabase = createClient();
  return getActionItems(supabase, userId);
});

/**
 * Combined dashboard data fetch
 * Fetches all essential dashboard data in parallel
 */
export const getCachedDashboardData = cache(async (userId: string) => {
  const supabase = createClient();
  
  // Fetch all data in parallel
  const [
    organization,
    riskAssessment,
    staffMembers,
    commitment,
    actionItems
  ] = await Promise.all([
    getOrganization(supabase, userId),
    getRiskAssessment(supabase, userId),
    getStaffMembers(supabase, userId),
    getComplianceCommitment(supabase, userId),
    getActionItems(supabase, userId)
  ]);

  return {
    organization,
    riskAssessment,
    staffMembers,
    commitment,
    actionItems
  };
});
