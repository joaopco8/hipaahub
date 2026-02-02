import { createClient } from '@/utils/supabase/server';
import {
  getProducts,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';
import PricingRounded from './pricing-rounded';

export default async function PricingPage() {
  try {
    const supabase = createClient();
    const [user, products] = await Promise.all([
      getUser(supabase),
      getProducts(supabase),
    ]);

    const subscription = user ? await getSubscription(supabase, user.id) : null;

    return (
      <PricingRounded
        user={user}
        products={products ?? []}
        subscription={subscription}
      />
    );
  } catch (error: any) {
    console.error('Error in PricingPage:', error);
    // Return component with empty products array to prevent Server Component error
    return (
      <PricingRounded
        user={null}
        products={[]}
        subscription={null}
      />
    );
  }
}
