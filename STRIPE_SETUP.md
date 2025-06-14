# Stripe Integration Setup Guide

This guide will help you set up Stripe payments for TeamDesk Premium subscriptions.

## Prerequisites

1. A Stripe account (sign up at [stripe.com](https://stripe.com))
2. Your TeamDesk application running locally or deployed

## Step 1: Get Stripe Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy the following keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

## Step 2: Set Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Step 3: Set Up Webhook Endpoint

1. In your Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
   - For local development: `https://your-ngrok-url.ngrok.io/api/stripe/webhook`
4. Select the following events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`) and add it to your environment variables

## Step 4: Test the Integration

### For Local Development

1. Install ngrok: `npm install -g ngrok`
2. Run your Next.js app: `npm run dev`
3. In another terminal, expose your local server: `ngrok http 3000`
4. Update your Stripe webhook endpoint URL with the ngrok URL
5. Test the payment flow by visiting `/pricing` and clicking "Upgrade to Premium"

### Testing Cards

Use these test card numbers in Stripe's test mode:

- **Successful payment**: `4242 4242 4242 4242`
- **Declined payment**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any postal code.

## Step 5: Production Setup

1. Switch to your Stripe live keys in production
2. Update your webhook endpoint URL to your production domain
3. Ensure your environment variables are properly set in your production environment

## How It Works

1. **User clicks "Upgrade to Premium"** → Creates a Stripe Checkout session
2. **User completes payment** → Stripe sends `checkout.session.completed` webhook
3. **Webhook handler processes payment** → Updates organization's `planType` to 'premium'
4. **User is redirected to dashboard** → Sees success message

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**:
   - Check that your webhook URL is accessible
   - Verify the webhook secret is correct
   - Check Stripe webhook logs for errors

2. **Payment not upgrading account**:
   - Check server logs for webhook processing errors
   - Verify MongoDB connection
   - Ensure user ID is correctly passed in checkout session metadata

3. **Environment variables not loading**:
   - Restart your development server after adding env vars
   - Check that variable names match exactly

### Debugging

Enable webhook debugging by checking your server logs when payments are processed. The webhook handler logs all important steps.

## Security Notes

- Never expose your Stripe secret key in client-side code
- Always verify webhook signatures
- Use HTTPS in production
- Keep your webhook secret secure

## Support

For Stripe-specific issues, check the [Stripe Documentation](https://stripe.com/docs) or contact Stripe support. 