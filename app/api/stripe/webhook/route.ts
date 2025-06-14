import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { Organization } from '@/models/Organization'
import { User } from '@/models/User'
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
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message)
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

        // Update the organization's plan type to premium
        const organization = await Organization.findByIdAndUpdate(
          user.organizationId,
          { planType: 'premium' },
          { new: true }
        )

        if (!organization) {
          console.error('Organization not found:', user.organizationId)
          return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
        }

        console.log(`Successfully upgraded organization ${organization._id} to premium plan`)
        break

      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        const canceledSubscription = event.data.object as Stripe.Subscription
        
        // You might want to add logic here to downgrade the organization
        // For now, we'll log it
        console.log('Subscription canceled:', canceledSubscription.id)
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