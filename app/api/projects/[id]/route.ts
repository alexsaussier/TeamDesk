import { NextResponse, NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import mongoose from 'mongoose'
import { Consultant } from '@/models/Consultant'

// Add this interface to bundle the data attributes that can be updated
interface ProjectUpdateData {
  updatedAt: Date;
  updatedBy: string;
  status?: string;
  chanceToClose?: number;
}

// Updates a project's status and tracks who made the change
export async function PATCH(request: Request) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get projectId from URL
    const projectId = request.url.split('/').pop()

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      )
    }

    const organizationId = session.user.organizationId
    const body = await request.json()
    const { status, chanceToClose } = body

    // Prepare update object
    const updateData: ProjectUpdateData = {
      updatedAt: new Date(),
      updatedBy: session.user.id
    }

    // If status is being updated
    if (status) {
      updateData.status = status
      // If moving from Discussions to any other status, set chanceToClose to 100%
      if (status !== 'Discussions') {
        updateData.chanceToClose = 100
      }
    }

    // If chanceToClose is being updated directly
    if (typeof chanceToClose === 'number') {
      updateData.chanceToClose = chanceToClose
    }

    const project = await Project.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(projectId),
        organizationId: new mongoose.Types.ObjectId(organizationId)
      },
      { $set: updateData },
      { new: true }
    )

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error in PATCH /api/projects/[id]:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const projectId = request.url.split('/').pop()
    const projectObjectId = new mongoose.Types.ObjectId(projectId)

    // First, remove project assignments from consultants
    await Consultant.updateMany(
      { 'assignments.projectId': projectId },
      { $pull: { assignments: { projectId: projectId } } }
    )

    // Then delete the project
    await Project.findByIdAndDelete(projectObjectId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/projects/[id]:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 