import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { Organization } from '@/models/Organization'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// Get all admins for the organization
export async function GET() {
  try {
    await connectDB()
    
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = session.user.organizationId
    
    // Get all admin users for this organization
    const admins = await User.find({ 
      organizationId,
      role: 'admin'
    }).select('-hashedPassword').sort({ createdAt: 1 })

    return NextResponse.json({ admins })
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Add a new admin to the organization
export async function POST(request: Request) {
  try {
    await connectDB()
    
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = session.user.organizationId
    
    // Get the organization to check plan type
    const organization = await Organization.findById(organizationId)
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Count existing admins
    const currentAdminCount = await User.countDocuments({ 
      organizationId,
      role: 'admin'
    })

    // Check admin limits based on plan type
    const maxAdmins = organization.planType === 'premium' ? 5 : 1
    if (currentAdminCount >= maxAdmins) {
      const planName = organization.planType === 'premium' ? 'Premium' : 'Free'
      return NextResponse.json({ 
        error: `${planName} plan is limited to ${maxAdmins} admin${maxAdmins > 1 ? 's' : ''}. ${organization.planType === 'free' ? 'Please upgrade to premium for up to 5 admins.' : ''}` 
      }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, password } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ 
        error: 'Name, email, and password are required' 
      }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ 
        error: 'A user with this email already exists' 
      }, { status: 400 })
    }

    // Create new admin user
    const newAdmin = new User({
      name,
      email,
      hashedPassword: password, // Will be hashed by the pre-save middleware
      organizationId,
      role: 'admin'
    })

    await newAdmin.save()

    // Return admin data without password
    const adminData = newAdmin.toObject()
    delete adminData.hashedPassword

    return NextResponse.json({ 
      message: 'Admin added successfully',
      admin: adminData
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding admin:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Remove an admin from the organization
export async function DELETE(request: Request) {
  try {
    await connectDB()
    
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = session.user.organizationId
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('id')

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 })
    }

    // Check if there's more than one admin (can't delete the last admin)
    const adminCount = await User.countDocuments({ 
      organizationId,
      role: 'admin'
    })

    if (adminCount <= 1) {
      return NextResponse.json({ 
        error: 'Cannot remove the last admin from the organization' 
      }, { status: 400 })
    }

    // Prevent self-deletion
    if (adminId === session.user.id) {
      return NextResponse.json({ 
        error: 'You cannot remove yourself as an admin' 
      }, { status: 400 })
    }

    // Find and delete the admin
    const adminToDelete = await User.findOne({
      _id: adminId,
      organizationId,
      role: 'admin'
    })

    if (!adminToDelete) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    await User.findByIdAndDelete(adminId)

    return NextResponse.json({ message: 'Admin removed successfully' })

  } catch (error) {
    console.error('Error removing admin:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 