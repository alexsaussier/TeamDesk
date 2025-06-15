import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { Organization } from '@/models/Organization'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

// Type for Stripe subscription with missing properties
interface StripeSubscriptionWithPeriod extends Stripe.Subscription {
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Find the user and their organization
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const organization = await Organization.findById(user.organizationId)
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    if (!organization.stripeCustomerId) {
      // Organization has no Stripe customer ID, so they have no subscriptions
      return NextResponse.json({
        hasActiveSubscription: false,
        subscription: null,
        paymentMethod: null
      })
    }

    // Get subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: organization.stripeCustomerId,
      status: 'active',
      limit: 1
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json({
        hasActiveSubscription: false,
        subscription: null,
        paymentMethod: null
      })
    }

    const subscription = subscriptions.data[0] as StripeSubscriptionWithPeriod

    // Get the default payment method
    let paymentMethod = null
    if (subscription.default_payment_method) {
      try {
        paymentMethod = await stripe.paymentMethods.retrieve(
          subscription.default_payment_method as string
        )
      } catch (error) {
        console.error('Error fetching payment method:', error)
      }
    }

    // Format subscription data
    const subscriptionData = {
      id: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      priceId: subscription.items.data[0]?.price?.id,
      interval: subscription.items.data[0]?.price?.recurring?.interval,
      amount: subscription.items.data[0]?.price?.unit_amount,
      currency: subscription.items.data[0]?.price?.currency,
      product: subscription.items.data[0]?.price?.product
    }

    // Format payment method data
    const paymentMethodData = paymentMethod ? {
      id: paymentMethod.id,
      type: paymentMethod.type,
      card: paymentMethod.card ? {
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year
      } : null
    } : null

    return NextResponse.json({
      hasActiveSubscription: true,
      subscription: subscriptionData,
      paymentMethod: paymentMethodData
    })

  } catch (error: unknown) {
    console.error('Error fetching subscription info:', error)
    return NextResponse.json(
      { error: 'Error fetching subscription information' },
      { status: 500 }
    )
  }
} 