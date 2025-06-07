import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Organization } from '@/models/Organization'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ConsultantLevelDefinition } from '@/types'

// Get organization consultant levels
export async function GET() {
  try {
    await connectDB()
    
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organization = await Organization.findById(session.user.organizationId)
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Sort levels by order
    const sortedLevels = organization.consultantLevels
      .filter((level: ConsultantLevelDefinition) => level.isActive)
      .sort((a: ConsultantLevelDefinition, b: ConsultantLevelDefinition) => a.order - b.order)

    return NextResponse.json({ levels: sortedLevels })
  } catch (error) {
    console.error('Error fetching organization levels:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Update organization consultant levels
export async function PUT(request: Request) {
  try {
    await connectDB()
    
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organization = await Organization.findById(session.user.organizationId)
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const { levels } = await request.json()

    // Validate levels
    if (!Array.isArray(levels) || levels.length === 0) {
      return NextResponse.json({ error: 'At least one level is required' }, { status: 400 })
    }

    // Validate each level
    for (const level of levels) {
      if (!level.id || !level.name || typeof level.order !== 'number') {
        return NextResponse.json({ error: 'Invalid level format' }, { status: 400 })
      }
    }

    // Update organization levels
    organization.consultantLevels = levels
    await organization.save()

    return NextResponse.json({ 
      success: true, 
      levels: organization.consultantLevels.filter((l: ConsultantLevelDefinition) => l.isActive)
        .sort((a: ConsultantLevelDefinition, b: ConsultantLevelDefinition) => a.order - b.order)
    })
  } catch (error) {
    console.error('Error updating organization levels:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 