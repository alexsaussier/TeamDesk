import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { Organization } from '@/models/Organization'
import { Project } from '@/models/Project'
import { Consultant } from '@/models/Consultant'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Get user to find organization
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const organizationId = user.organizationId

    // Get organization
    const organization = await Organization.findById(organizationId)
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Calculate onboarding progress dynamically
    // Check if settings are configured
    const settingsConfigured = !!(
      organization.description && 
      organization.description.trim() !== '' &&
      organization.consultantLevels && 
      organization.consultantLevels.length > 0
    )

    // Check if project created
    const projectCount = await Project.countDocuments({ organizationId })
    const projectCreated = projectCount > 0

    // Check if workforce added  
    const consultantCount = await Consultant.countDocuments({ organizationId })
    const workforceAdded = consultantCount > 0

    // Calculate if tutorial should be marked as completed
    const tutorialCompleted = organization.onboardingProgress?.tutorialCompleted || 
      (settingsConfigured && projectCreated && workforceAdded)

    const onboardingProgress = {
      settingsConfigured,
      projectCreated,
      workforceAdded,
      tutorialCompleted
    }

    // Update organization's onboarding progress in database
    await Organization.findByIdAndUpdate(organizationId, {
      onboardingProgress
    })

    return NextResponse.json({ onboardingProgress })
  } catch (error) {
    console.error('Error fetching onboarding progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { tutorialCompleted } = await request.json()

    // Get user to find organization
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedOrganization = await Organization.findByIdAndUpdate(
      user.organizationId,
      { 
        'onboardingProgress.tutorialCompleted': tutorialCompleted 
      },
      { new: true }
    )

    if (!updatedOrganization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      onboardingProgress: updatedOrganization.onboardingProgress 
    })
  } catch (error) {
    console.error('Error updating onboarding progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 