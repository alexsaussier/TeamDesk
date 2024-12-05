import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { Organization } from '@/models/Organization'

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
      name: organizationName,
      admin: {
        name,
        email
      }
    })
    const savedOrganization = await organization.save()

    // Create new user with the organization's ID
    const newUser = new User({
      name,
      email,
      hashedPassword: password, // This will be hashed by the pre-save middleware
      organizationId: savedOrganization._id,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date()
    })
    await newUser.save()

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