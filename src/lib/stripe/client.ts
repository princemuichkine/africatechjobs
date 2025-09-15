import Stripe from 'stripe'
import { loadStripe, type Stripe as StripeJS } from '@stripe/stripe-js'

// Server-side Stripe instance - only initialize on server
let _stripe: Stripe | null = null

export const getServerStripe = () => {
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be called on the server side')
  }

  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-08-27.basil',
      appInfo: {
        name: 'Suparaise',
        version: '1.0.0',
      },
    })
  }

  return _stripe
}

// Client-side Stripe instance
let stripePromise: Promise<StripeJS | null> | null = null

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Price IDs - these will be configured in Stripe dashboard
export const STRIPE_PRICE_IDS = {
  pro_monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!,
  max_monthly: process.env.NEXT_PUBLIC_STRIPE_MAX_PRICE_ID!,
}

// Usage billing configuration
export const USAGE_BILLING_CONFIG = {
  pricePerSubmission: 2.49, // $2.49 per additional application (psychological pricing with healthy margin)
  baseCost: 1.8, // Base cost portion ($1.80)
  processingCost: 0.69, // Processing cost portion ($0.69)
  meterId: process.env.NEXT_PUBLIC_STRIPE_USAGE_BILLING_METER_ID!, // Stripe billing meter ID
  priceId: process.env.NEXT_PUBLIC_STRIPE_USAGE_BILLING_PRICE_ID!, // Stripe price ID for usage billing
  defaultSpendLimit: 50.0, // Default monthly spend limit
  minSpendLimit: 10.0, // Minimum spend limit
  maxSpendLimit: 1000.0, // Maximum spend limit
  presetLimits: [10, 20, 50, 100, 150], // Preset spend limit options
}

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Core',
    description: 'Get started with agentic fundraising',
    price: 0,
    interval: 'month' as const,
    tier: 'starter' as const,
  },
  pro_monthly: {
    name: 'Pro',
    description: 'For startups actively raising their first round',
    price: 29,
    interval: 'month' as const,
    tier: 'pro' as const,
  },
  max_monthly: {
    name: 'Max',
    description: 'For startups that need meetings now',
    price: 79,
    interval: 'month' as const,
    tier: 'max' as const,
  },
}

// Helper function to record usage meter event in Stripe
export const recordUsageEvent = async (
  customerId: string,
  eventName: string = 'submission',
) => {
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be called on the server side')
  }

  try {
    const stripe = getServerStripe()

    await stripe.billing.meterEvents.create({
      event_name: eventName,
      payload: {
        stripe_customer_id: customerId,
        value: '1', // 1 submission
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error recording usage event:', error)
    return { success: false, error }
  }
}
