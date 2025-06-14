"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, ArrowRight } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { loadStripe } from '@stripe/stripe-js'
import { useState } from 'react'
import PublicNavbar from '@/components/PublicNavbar'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PricingPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [isYearly, setIsYearly] = useState(false)

  // Pricing configuration
  const pricing = {
    monthly: {
      premium: 99
    },
    yearly: {
      premium: 69 // discount when billed yearly
    }
  }

  const getDisplayPrice = (plan: 'premium') => {
    return isYearly ? pricing.yearly[plan] : pricing.monthly[plan]
  }

  const getYearlyTotal = (plan: 'premium') => {
    return pricing.yearly[plan] * 12
  }

  const getSavings = (plan: 'premium') => {
    const monthlyCost = pricing.monthly[plan] * 12
    const yearlyCost = getYearlyTotal(plan)
    return monthlyCost - yearlyCost
  }

  const handleSubscribe = async () => {
    if (!session?.user?.id) {
      // Redirect to sign in if not authenticated
      window.location.href = '/auth/signin'
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          priceType: isYearly ? 'yearly' : 'monthly',
        }),
      })

      const { sessionId } = await response.json()
      
      const stripe = await stripePromise
      const { error } = await stripe!.redirectToCheckout({
        sessionId,
      })

      if (error) {
        console.error('Error:', error)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <PublicNavbar />

      <main className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
            Choose the plan that's right for your team. Start with our free tier and upgrade when you're ready.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex flex-col items-center mt-8 space-y-3">
            <div className="flex items-center space-x-4">
              <Label htmlFor="billing-toggle" className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly billing
              </Label>
              <Switch
                id="billing-toggle"
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label htmlFor="billing-toggle" className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly billing
              </Label>
            </div>
            {isYearly && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Save ${getSavings('premium')}
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
         
         {/* Free Plan */}
          <Card className="relative flex flex-col h-full">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-gray-900">Free</CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-extrabold text-gray-900">$0</span>
                <span className="text-xl text-gray-600">/month</span>
              </div>
              <p className="mt-4 text-gray-600">Perfect for getting started</p>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow flex flex-col">
              <ul className="space-y-3 flex-grow">
              <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Up to 3 projects</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Up to 10 consultants</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>1 user per organization</span>
                </li>
              
              </ul>
              
              {/* Button stuck at bottom */}
              <div className="mt-auto pt-4">
                <Button variant="ghost" className="w-full text-blue-600 border border-blue-600">
                  <Link href="/auth/signup">Get Started Free</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Premium Plan */}
            <Card className="relative border-blue-500 border-2 shadow-lg">
              <CardHeader className="text-center pb-8">
               < CardTitle className="text-2xl font-bold text-gray-900">Premium</CardTitle>
               <div className="mt-4">
                 {isYearly ? (
                   <div className="space-y-1">
                     <div className="flex items-center justify-center space-x-2">
                       <span className="text-2xl font-medium text-gray-500 line-through">
                         $99
                       </span>
                       <span className="text-5xl font-extrabold text-gray-900">
                          $69
                        </span>
                       <span className="text-xl text-gray-600">/month</span>
                     </div>
                     <p className="text-sm text-gray-500">
                       ${getYearlyTotal('premium')} billed annually
                     </p>
                   </div>
                 ) : (
                   <>
                     <span className="text-5xl font-extrabold text-gray-900">$99</span>
                     <span className="text-xl text-gray-600">/month</span>
                   </>
                 )}
               </div>
               <p className="mt-4 text-gray-600">For growing teams and agencies</p>
             </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
              <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Unlimited projects</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Unlimited consultants</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>5 accounts per organization</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Get all advanced AI features first</span>
                </li>
              </ul>
              <div className="pt-6">
                <Button 
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    'Processing...'
                  ) : (
                    <>
                      Upgrade to Premium <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Our free plan is permanent and includes core features. You can upgrade to Premium when you need advanced features.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards through Stripe. All payments are secure and encrypted.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                All payments are non-refundable.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 py-8 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 TeamDesk. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
} 