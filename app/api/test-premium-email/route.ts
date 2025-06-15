import { NextRequest, NextResponse } from 'next/server'
import { sendPremiumUpgradeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, name, organizationName } = await request.json()

    if (!email || !name || !organizationName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, organizationName' },
        { status: 400 }
      )
    }

    const result = await sendPremiumUpgradeEmail(email, name, organizationName)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Premium upgrade email sent successfully',
        messageId: result.messageId
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send premium upgrade email', details: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Test premium email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 