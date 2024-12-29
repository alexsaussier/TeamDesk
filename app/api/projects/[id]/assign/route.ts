import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'
import { Consultant } from '@/models/Consultant'
import { checkConsultantAvailability } from '@/utils/consultantAvailability'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { consultantId, percentage } = body
    const projectId = request.url.split('/projects/')[1].split('/assign')[0]

    const projectObjectId = new mongoose.Types.ObjectId(projectId)
    const consultantObjectId = new mongoose.Types.ObjectId(consultantId)

    const [consultant, project] = await Promise.all([
      Consultant.findById(consultantObjectId),
      Project.findById(projectObjectId)
    ])

    if (!consultant || !project) {
      return NextResponse.json(
        { error: 'Consultant or Project not found' },
        { status: 404 }
      )
    }

    // Get all projects for availability check
    const allProjects = await Project.find({
      _id: { $in: consultant.assignments.map((a: { projectId: string }) => a.projectId) }
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

    // Update both documents with percentage information
    await Promise.all([
      Project.findByIdAndUpdate(projectObjectId, {
        $push: { 
          assignedConsultants: {
            consultantId: consultantObjectId,
            percentage
          }
        }
      }),
      Consultant.findByIdAndUpdate(consultantObjectId, {
        $push: { 
          assignments: {
            projectId: projectObjectId,
            percentage
          }
        }
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