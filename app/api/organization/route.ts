import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Organization } from '@/models/Organization'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * API route for organization-related operations
 * GET: Retrieves basic organization details (name and admin info) by ID or for the authenticated user's organization
 * PATCH: Updates organization details (name, description, perks)
 * Requires authentication via NextAuth session
 * Returns 401 if unauthorized, 404 if organization not found, 500 for server errors
 */

export async function GET(request: Request) {
  try {
    await connectDB()
    
    // Check if we're requesting a specific organization by ID
    const url = new URL(request.url)
    const organizationId = url.searchParams.get('id')
    
    if (organizationId) {
      console.log("fetching organization by ID", organizationId);
      // Public endpoint to get organization by ID (limited info)
      const organization = await Organization.findById(organizationId)
      
      if (!organization) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
      }
      
      return NextResponse.json({
        _id: organization._id,
        name: organization.name,
        description: organization.description,
        perks: organization.perks
      })
    } else {
      // Original functionality - get organization for authenticated user
      const session = await getServerSession(authOptions)
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const organizationId = session.user.organizationId
      const organization = await Organization.findById(organizationId)

      if (!organization) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
      }

      return NextResponse.json({
        name: organization.name,
        admin: organization.admin,
        description: organization.description,
        perks: organization.perks
      })
    }
  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    await connectDB()
    
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = session.user.organizationId
    
    const organization = await Organization.findById(organizationId)
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const body = await request.json()
    
    const { name, description, perks } = body

    // Update organization fields - handle all cases including empty strings
    if (name !== undefined) organization.name = name
    if (description !== undefined) {
      organization.description = description
    }
    if (perks !== undefined) {
      organization.perks = perks
    }

    await organization.save()
    console.log('Organization after save:', JSON.stringify(organization.toObject()))

    return NextResponse.json({
      _id: organization._id,
      name: organization.name,
      admin: organization.admin,
      description: organization.description,
      perks: organization.perks,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt
    })
  } catch (error) {
    console.error('Error updating organization:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}