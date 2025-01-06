import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import mongoose from 'mongoose'

export async function PATCH(request: Request) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get projectId from URL
    const projectId = request.url.split('/').slice(-2)[0] // Get second to last segment

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      )
    }

    const organizationId = session.user.organizationId
    const { chanceToClose } = await request.json()

    console.log("Updating chance to close with this value: ", chanceToClose)

    if (typeof chanceToClose !== 'number' || chanceToClose < 0 || chanceToClose > 100) {
      return NextResponse.json(
        { error: 'Invalid chance to close value' },
        { status: 400 }
      )
    }

    // First verify the project exists and belongs to the user's organization
    const project = await Project.findOne({
      _id: new mongoose.Types.ObjectId(projectId),
      organizationId: new mongoose.Types.ObjectId(organizationId)
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Only allow changing chanceToClose for projects in Discussions
    if (project.status !== 'Discussions') {
      return NextResponse.json(
        { error: 'Can only modify chance to close for projects in Discussions status' },
        { status: 400 }
      )
    }

    console.log('Update query:', {
      _id: projectId,
      organizationId: organizationId
    })

    // Update the project with the new chance to close
    const updatedProject = await Project.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(projectId),
        organizationId: new mongoose.Types.ObjectId(organizationId)
      },
      {
        $set: {
          chanceToClose: chanceToClose,
          updatedAt: new Date(),
          updatedBy: session.user.id
        }
      },
      { new: true }
    )

    if (!updatedProject) {
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      )
    }

    console.log('Updated project result:', updatedProject)

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Error in PATCH /api/projects/[id]/chance-to-close:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 