import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, name, organizationName } = await request.json()

    if (!email || !name || !organizationName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, organizationName' },
        { status: 400 }
      )
    }

    const result = await sendWelcomeEmail(email, name, organizationName)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Welcome email sent successfully',
        messageId: result.messageId
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send welcome email', details: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Test welcome email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 