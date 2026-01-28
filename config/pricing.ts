interface Plan {
  name: string;
  description: string;
  features: string[];
  monthlyPrice: number;
  yearlyPrice: number;
}

const pricingPlans: Plan[] = [
  {
    name: 'Basic',
    description: 'Essential HIPAA compliance tools for small solo practices.',
    features: [
      'Access to core HIPAA templates',
      'Basic Compliance Dashboard',
      'Secure document storage',
      'Email support',
      'Monthly compliance tips'
    ],
    monthlyPrice: 900,
    yearlyPrice: 9000
  },
  {
    name: 'Pro',
    description: 'Comprehensive compliance management for growing clinics.',
    features: [
      'AI-powered document generation',
      'Guided Risk Assessment module',
      'Employee Training & Attestation',
      'Audit Readiness Package export',
      'Priority support',
      'Custom policy adaptation'
    ],
    monthlyPrice: 9900,
    yearlyPrice: 99000
  },
  {
    name: 'Enterprise',
    description: 'Advanced features and dedicated support for large healthcare organizations.',
    features: [
      'Unlimited AI document generation',
      'Multi-location management',
      'Dedicated Compliance Success Manager',
      'SSO & Advanced RBAC',
      'Custom integration support',
      'Quarterly compliance reviews',
      'White-label reporting'
    ],
    monthlyPrice: 99900,
    yearlyPrice: 999000
  }
];

export default pricingPlans;

import { Tables } from '@/types/db';

type Product = Tables<'products'>;
type Price = Tables<'prices'>;
interface ProductWithPrices extends Product {
  prices: Price[];
}

export const dummyPricing: ProductWithPrices[] = [
  {
    id: 'dummy-basic',
    name: 'Basic Plan',
    description: 'For individuals just getting started',
    prices: [
      {
        id: 'dummy-basic-price-month',
        currency: 'USD',
        unit_amount: 999,
        interval: 'month',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-basic',
        description: null,
        metadata: null
      },
      {
        id: 'dummy-basic-price-year',
        currency: 'USD',
        unit_amount: 9990,
        interval: 'year',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-basic',
        description: null,
        metadata: null
      }
    ],
    image: null,
    metadata: null,
    active: null
  },
  {
    id: 'dummy-pro',
    name: 'Pro Plan',
    description: 'For growing businesses',
    prices: [
      {
        id: 'dummy-pro-price-month',
        currency: 'USD',
        unit_amount: 2999,
        interval: 'month',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-pro',
        description: null,
        metadata: null
      },
      {
        id: 'dummy-pro-price-year',
        currency: 'USD',
        unit_amount: 29990,
        interval: 'year',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-pro',
        description: null,
        metadata: null
      }
    ],
    image: null,
    metadata: null,
    active: null
  },
  {
    id: 'dummy-enterprise',
    name: 'Enterprise Plan',
    description: 'For large organizations',
    prices: [
      {
        id: 'dummy-enterprise-price-month',
        currency: 'USD',
        unit_amount: 9999,
        interval: 'month',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-enterprise',
        description: null,
        metadata: null
      },
      {
        id: 'dummy-enterprise-price-year',
        currency: 'USD',
        unit_amount: 99990,
        interval: 'year',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'dummy-enterprise',
        description: null,
        metadata: null
      }
    ],
    image: null,
    metadata: null,
    active: null
  }
];
