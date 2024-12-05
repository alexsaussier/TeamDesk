import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import mongoose from 'mongoose'

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const projectId = params.id

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      )
    }

    const organizationId = session.user.organizationId
    const body = await request.json()
    const { status } = body

    const project = await Project.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(projectId),
        organizationId: new mongoose.Types.ObjectId(organizationId)
      },
      {
        $set: {
          status,
          updatedAt: new Date(),
          updatedBy: session.user.id
        }
      },
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