'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Info } from 'lucide-react';
import type { Tables } from '@/types/db';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithStripe } from '@/utils/stripe/server';
import { getErrorRedirect } from '@/utils/helpers';
import { User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import pricingPlans from '@/config/pricing';
import { dummyPricing } from '@/config/pricing';
import { cn } from '@/utils/cn';

type Subscription = Tables<'subscriptions'>;
type Product = Tables<'products'>;
type Price = Tables<'prices'>;
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
}

type BillingInterval = 'lifetime' | 'year' | 'month';

export default function PricingRounded({
  user,
  products,
  subscription
}: Props) {
  const router = useRouter();
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>('month');
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const currentPath = usePathname();

  const handleStripeCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return router.push('/signup');
    }

    const { errorRedirect, sessionId, sessionUrl } = await checkoutWithStripe(
      price,
      currentPath
    );

    if (errorRedirect) {
      setPriceIdLoading(undefined);
      return router.push(errorRedirect);
    }

    if (!sessionId) {
      setPriceIdLoading(undefined);
      return router.push(
        getErrorRedirect(
          currentPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.'
        )
      );
    }

    const stripe = await getStripe();
    stripe?.redirectToCheckout({ sessionId });

    setPriceIdLoading(undefined);
  };

  const displayProducts = products.length ? products : dummyPricing;

  if (!displayProducts.length) {
    return (
      <section className="bg-[#0c0b1d] py-20 font-extralight" id="pricing">
        <div className="container mx-auto px-4 font-extralight">
          <div className="max-w-3xl mx-auto text-center font-extralight">
            <h2 className="text-3xl text-white sm:text-4xl font-extralight">
              Pricing Plans
            </h2>
            <p className="mt-4 text-zinc-400 font-extralight">
              No subscription pricing plans found. Create them in your{' '}
              <a
                className="text-[#1ad07a] hover:underline font-extralight"
                href="https://dashboard.stripe.com/products"
                rel="noopener noreferrer"
                target="_blank"
              >
                Stripe Dashboard
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    );
  } else {
    return (
      <section className="bg-[#0c0b1d] py-24 font-extralight" id="pricing">
        <div className="container mx-auto px-4 font-extralight">
          <div className="max-w-3xl mx-auto text-center mb-16 font-extralight">
            <h2 className="text-4xl text-white sm:text-5xl font-extralight">
              Simple, transparent pricing
            </h2>
            <p className="mt-6 text-xl text-zinc-400 font-extralight">
              Choose the plan that's right for your clinic. No hidden fees.
            </p>

            <div className="mt-10 flex justify-center font-extralight">
              <div className="relative flex p-1 bg-[#1a1a2e] rounded-xl border border-zinc-800 font-extralight">
                <button
                  onClick={() => setBillingInterval('month')}
                  className={cn(
                    'relative px-6 py-2 text-sm transition-all duration-200 rounded-lg font-extralight',
                    billingInterval === 'month'
                      ? 'bg-[#1ad07a] text-[#0c0b1d] shadow-lg'
                      : 'text-zinc-400 hover:text-white'
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingInterval('year')}
                  className={cn(
                    'relative px-6 py-2 text-sm transition-all duration-200 rounded-lg font-extralight',
                    billingInterval === 'year'
                      ? 'bg-[#1ad07a] text-[#0c0b1d] shadow-lg'
                      : 'text-zinc-400 hover:text-white'
                  )}
                >
                  Yearly
                  <span className="absolute -top-3 -right-3 px-2 py-0.5 text-[10px] bg-[#1ad07a] text-[#0c0b1d] rounded-full shadow-xl font-extralight">
                    -20%
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto font-extralight">
            {displayProducts.map((product) => {
              const price = product?.prices?.find(
                (price) => price.interval === billingInterval
              );
              if (!price) return null;

              const priceString = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: price.currency!,
                minimumFractionDigits: 0
              }).format((price?.unit_amount || 0) / 100);

              const isActive = subscription
                ? product.name === subscription?.prices?.products?.name
                : false;

              const plan = pricingPlans.find(
                (p) => p.name.toLowerCase() === product.name?.toLowerCase() || 
                       product.name?.toLowerCase().includes(p.name.toLowerCase())
              );
              const features = plan ? plan.features : [];
              const isPro = product.name?.toLowerCase().includes('pro');

              return (
                <Card
                  key={product.id}
                  className={cn(
                    'relative flex flex-col bg-[#161625] border-zinc-800 text-white transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl overflow-hidden font-extralight',
                    isActive && 'border-[#1ad07a] ring-1 ring-[#1ad07a]',
                    isPro && 'border-zinc-700 shadow-xl'
                  )}
                >
                  {isPro && (
                    <div className="absolute top-0 right-0 p-4 font-extralight">
                      <Badge className="bg-[#1ad07a]/10 text-[#1ad07a] border-[#1ad07a]/20 hover:bg-[#1ad07a]/20 font-extralight">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="p-8 pb-4 font-extralight">
                    <CardTitle className="text-2xl text-white font-extralight">
                      {product.name?.replace(' Plan', '')}
                    </CardTitle>
                    <CardDescription className="text-zinc-400 mt-2 min-h-[48px] font-extralight">
                      {product.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-8 pt-0 flex-grow font-extralight">
                    <div className="flex flex-col mt-4 font-extralight">
                      <span className="text-zinc-400 text-sm font-extralight">From</span>
                      <div className="flex items-baseline mt-1 font-extralight">
                        <span className="text-5xl font-extralight">
                          {priceString}
                        </span>
                        <span className="ml-1 text-zinc-400 font-extralight">
                          /{billingInterval === 'month' ? 'month' : 'year'}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant={isPro ? 'default' : 'outline'}
                      onClick={() => handleStripeCheckout(price)}
                      className={cn(
                        'w-full mt-8 py-6 text-lg rounded-xl transition-all duration-300 font-extralight',
                        !isPro && 'border-zinc-700 text-white hover:bg-zinc-800 hover:text-white hover:border-zinc-600'
                      )}
                      loading={priceIdLoading === price.id}
                    >
                      {isActive ? 'Manage Subscription' : 'Get Started'}
                    </Button>

                    <div className="mt-10 space-y-4 font-extralight">
                      <p className="text-sm text-white font-extralight">
                        Everything in {product.name?.toLowerCase().includes('starter') ? 'Basic' : 'the Free Plan'}, plus:
                      </p>
                      <ul className="space-y-4 font-extralight">
                        {features.map((feature, index) => (
                          <li key={index} className="flex items-start group font-extralight">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1ad07a]/10 flex items-center justify-center mt-0.5 group-hover:bg-[#1ad07a]/20 transition-colors">
                              <Check className="w-3.5 h-3.5 text-[#1ad07a]" />
                            </div>
                            <span className="ml-3 text-sm text-zinc-300 group-hover:text-white transition-colors font-extralight">
                              {feature.trim()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  
                  {isPro && (
                    <div className="p-4 bg-gradient-to-r from-[#1ad07a]/5 to-transparent border-t border-zinc-800/50 font-extralight">
                      <div className="flex items-center text-xs text-[#1ad07a] font-extralight">
                        <Info className="w-3 h-3 mr-2" />
                        <span className="font-extralight">Best value for small clinics</span>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
          
          <div className="mt-20 text-center font-extralight">
            <p className="text-zinc-500 text-sm font-extralight">
              All plans include high-priority HIPAA compliance support and 256-bit encryption.
            </p>
          </div>
        </div>
      </section>
    );
  }
}
