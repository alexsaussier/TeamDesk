import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { Organization } from '@/models/Organization'
import { User } from '@/models/User'
import { sendPremiumUpgradeEmail } from '@/lib/email'
import mongoose from 'mongoose'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI!)
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret)
  } catch (err: unknown) {
    console.error(`Webhook signature verification failed:`, err)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  try {
    await connectDB()

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        
        // Get the user ID from metadata
        const userId = session.metadata?.userId
        
        if (!userId) {
          console.error('No userId found in session metadata')
          return NextResponse.json({ error: 'No userId in metadata' }, { status: 400 })
        }

        // Find the user and their organization
        const user = await User.findById(userId)
        if (!user) {
          console.error('User not found:', userId)
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Update the organization's plan type to premium and store customer ID
        const organizationUpdate: Partial<{ planType: string; stripeCustomerId: string }> = { planType: 'premium' }
        
        // Store the Stripe customer ID if not already stored
        if (session.customer) {
          const organization = await Organization.findById(user.organizationId)
          if (organization && !organization.stripeCustomerId) {
            organizationUpdate.stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer.id
          }
        }

        const organization = await Organization.findByIdAndUpdate(
          user.organizationId,
          organizationUpdate,
          { new: true }
        )

        if (!organization) {
          console.error('Organization not found:', user.organizationId)
          return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
        }

        console.log(`Successfully upgraded organization ${organization._id} to premium plan`)
        
        // Send premium upgrade email
        try {
          await sendPremiumUpgradeEmail(
            user.email,
            user.name || user.email,
            organization.name
          )
          console.log('Premium upgrade email sent successfully')
        } catch (emailError) {
          console.error('Failed to send premium upgrade email:', emailError)
          // Don't fail the webhook if email fails
        }
        break

      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        const canceledSubscription = event.data.object as Stripe.Subscription
        
        // Find the organization by customer ID and downgrade to free plan
        const customerOrganization = await Organization.findOne({ stripeCustomerId: canceledSubscription.customer })
        if (customerOrganization) {
          await Organization.findByIdAndUpdate(
            customerOrganization._id,
            { planType: 'free' }
          )
          console.log(`Downgraded organization ${customerOrganization._id} to free plan due to subscription cancellation`)
        }
        break

      case 'invoice.payment_failed':
        // Handle failed payments
        const failedInvoice = event.data.object as Stripe.Invoice
        console.log('Payment failed for invoice:', failedInvoice.id)
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 })
  }
}

// Disable body parsing, need raw body for signature verification
export const runtime = 'nodejs' 