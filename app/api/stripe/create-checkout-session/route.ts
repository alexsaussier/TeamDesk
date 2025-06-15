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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, priceType = 'monthly' } = await request.json()

    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()

    // Get user and organization information
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const organization = await Organization.findById(user.organizationId)
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Pricing configuration
    const pricing = {
      monthly: { amount: 9900, interval: 'month' as const }, // $99.00
      yearly: { amount: 82800, interval: 'year' as const }   // $69 * 12 = $828.00
    }

    const selectedPricing = pricing[priceType as keyof typeof pricing] || pricing.monthly

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'TeamDesk Premium',
              description: `${priceType === 'yearly' ? 'Annual' : 'Monthly'} subscription to TeamDesk Premium features`,
            },
            unit_amount: selectedPricing.amount,
            recurring: {
              interval: selectedPricing.interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      metadata: {
        userId: userId,
        organizationId: organization._id.toString(),
        organizationName: organization.name,
        priceType: priceType,
      },
      customer_email: session.user.email || undefined,
    })

    return NextResponse.json({ sessionId: checkoutSession.id })
  } catch (error: unknown) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    )
  }
} 