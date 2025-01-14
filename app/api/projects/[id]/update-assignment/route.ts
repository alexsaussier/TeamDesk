import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'
import { Consultant } from '@/models/Consultant'
import mongoose from 'mongoose'

// Update the percentage of an assignment for a consultant
export async function PATCH(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { consultantId, percentage } = body
    const projectId = request.url.split('/projects/')[1].split('/update-assignment')[0]

    if (percentage < 0 || percentage > 100) {
      return NextResponse.json(
        { error: 'Percentage must be between 0 and 100' },
        { status: 400 }
      )
    }

    const projectObjectId = new mongoose.Types.ObjectId(projectId)
    const consultantObjectId = new mongoose.Types.ObjectId(consultantId)

    // Update both documents with new percentage
    await Promise.all([
      Project.findOneAndUpdate(
        { 
          _id: projectObjectId,
          'assignedConsultants.consultantId': consultantObjectId 
        },
        { 
          $set: { 
            'assignedConsultants.$.percentage': percentage 
          }
        }
      ),
      Consultant.findOneAndUpdate(
        { 
          _id: consultantObjectId,
          'assignments.projectId': projectId
        },
        { 
          $set: { 
            'assignments.$.percentage': percentage 
          }
        }
      )
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PATCH /api/projects/[id]/update-assignment:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 