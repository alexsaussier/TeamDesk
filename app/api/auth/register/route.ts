import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { Organization } from '@/models/Organization'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    await connectDB()
    const { name, email, password, organizationName } = await request.json()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Create new organization
    const organization = new Organization({
      name: organizationName
    })
    const savedOrganization = await organization.save()

    // Create new user
    const newUser = new User({
      name,
      email,
      hashedPassword: password,
      organizationId: savedOrganization._id,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date()
    })
    await newUser.save()

    // Send welcome email
    try {
      await sendWelcomeEmail(
        email,
        name,
        organizationName
      )
      console.log('Welcome email sent successfully to:', email)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail registration if email fails
    }

    return NextResponse.json(
      { message: 'User and organization created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 