import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'
import { Consultant } from '@/models/Consultant'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkConsultantAvailability } from '@/utils/consultantAvailability'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get projectId from URL using proper URL parsing
    const url = new URL(request.url)
    const projectId = url.pathname.split('/projects/')[1].split('/assign')[0]
    const { consultantId } = await request.json()

    console.log('Received IDs:', { projectId, consultantId })

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(consultantId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      )
    }

    // Convert string IDs to ObjectId
    const projectObjectId = new mongoose.Types.ObjectId(projectId)
    const consultantObjectId = new mongoose.Types.ObjectId(consultantId)

    // Get project and consultant without populate
    const project = await Project.findById(projectObjectId)
    const consultant = await Consultant.findById(consultantObjectId)

    if (!project || !consultant) {
      return NextResponse.json(
        { error: 'Project or consultant not found' },
        { status: 404 }
      )
    }

    // Get all projects for availability check
    const allProjects = await Project.find({
      _id: { $in: consultant.assignments }
    })
    
    const { isAvailable, hasConflicts } = checkConsultantAvailability(
      {
        ...consultant.toObject(),
        id: consultant._id.toString()
      },
      {
        ...project.toObject(),
        id: project._id.toString()
      },
      allProjects.map(p => ({
        ...p.toObject(),
        id: p._id.toString()
      }))
    )

    if (!isAvailable) {
      return NextResponse.json(
        { 
          error: 'Consultant is not available during this period',
          hasConflicts 
        },
        { status: 400 }
      )
    }

    // Update both documents
    await Promise.all([
      Project.findByIdAndUpdate(projectObjectId, {
        $addToSet: { assignedConsultants: consultantObjectId }
      }),
      Consultant.findByIdAndUpdate(consultantObjectId, {
        $addToSet: { assignments: projectObjectId }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/projects/[id]/assign:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 