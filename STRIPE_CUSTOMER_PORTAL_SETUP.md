# Stripe Customer Portal Setup

The subscription management feature uses Stripe's Customer Portal, which provides a secure, hosted interface for customers to manage their subscriptions.

## Prerequisites

1. Complete the basic Stripe integration setup (see `STRIPE_SETUP.md`)
2. Have active subscriptions in your Stripe account

## Customer Portal Configuration

### Step 1: Enable Customer Portal in Stripe Dashboard

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Settings** → **Billing** → **Customer portal**
3. Click **Activate** if not already activated

### Step 2: Configure Portal Settings

In the Customer Portal settings, you can customize:

#### Business Information
- Business name
- Support email
- Support phone number
- Privacy policy URL
- Terms of service URL

#### Features
Enable/disable the following features based on your needs:
- **Invoice history**: Allow customers to view and download invoices
- **Update payment methods**: Allow customers to add/remove payment methods
- **Update billing addresses**: Allow customers to modify billing information
- **Cancel subscriptions**: Allow customers to cancel their subscriptions
- **Pause subscriptions**: Allow customers to pause subscriptions (if supported)

#### Functionality
- **Default return URL**: Set to `https://yourdomain.com/dashboard/settings?tab=billing`
- **Allowed actions**: Configure what customers can do in the portal

### Step 3: Test the Integration

1. Log in to your application with a user who has an active subscription
2. Go to **Settings** → **Subscription Management**
3. Click **Manage Subscription**
4. Verify you're redirected to the Stripe Customer Portal
5. Test the available features (update payment method, view billing history, etc.)

## Features Available to Customers

### Current Implementation

The subscription management section shows:

1. **Current Plan**: Display whether user is on Free or Premium plan
2. **Billing Cycle**: Shows next billing date and amount for premium users
3. **Payment Method**: Displays the card details used for billing
4. **Subscription Status**: Shows if subscription is active, canceled, etc.
5. **Manage Subscription Button**: Opens Stripe Customer Portal

### What Customers Can Do in the Portal

- **Update payment methods**: Add, remove, or set as default
- **View billing history**: Download invoices and receipts
- **Cancel subscription**: Immediate or at period end
- **Update billing address**: Modify tax information
- **Pause subscription**: If enabled in your Stripe settings

## Webhook Events

The system automatically handles these webhook events:

- `checkout.session.completed`: Creates subscription and stores customer ID
- `customer.subscription.deleted`: Downgrades organization to free plan
- `invoice.payment_failed`: Logs failed payments (extend as needed)

## Security

- All subscription management happens on Stripe's secure servers
- Customer portal sessions are temporary and expire automatically
- No sensitive payment data is stored in your application
- Webhook signatures are verified for security

## Customization

### Portal Branding
You can customize the portal appearance in Stripe Dashboard:
- Upload your logo
- Set brand colors
- Customize button styles

### Return URL
The portal redirects users back to your settings page with the query parameter `?tab=billing` for better UX.

## Troubleshooting

### Common Issues

1. **"Customer not found" error**
   - Check if user has `stripeCustomerId` field populated
   - Verify webhook is processing `checkout.session.completed` events

2. **Portal not opening**
   - Check API key permissions
   - Verify customer portal is activated in Stripe Dashboard
   - Check browser console for JavaScript errors

3. **Subscription info not displaying**
   - Verify subscription is active in Stripe Dashboard
   - Check API endpoint `/api/stripe/subscription-info` responses
   - Ensure customer has proper subscription metadata

### Debug Steps

1. Check server logs for API errors
2. Verify webhook events are being received
3. Test API endpoints manually:
   ```bash
   curl -X GET http://localhost:3000/api/stripe/subscription-info
   curl -X POST http://localhost:3000/api/stripe/customer-portal
   ```

## Production Considerations

1. **Environment Variables**: Ensure all Stripe keys are properly set
2. **Webhook URLs**: Update webhook endpoints to production URLs
3. **Return URLs**: Set production domain in portal configuration
4. **SSL Certificates**: Ensure HTTPS is properly configured
5. **Rate Limiting**: Consider implementing rate limits for portal session creation

## Support

For Stripe-specific issues:
- [Stripe Customer Portal Documentation](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Stripe Support](https://support.stripe.com/)

For application-specific issues, check the server logs and verify webhook processing. 