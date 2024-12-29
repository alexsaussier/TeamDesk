import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'
import { Consultant } from '@/models/Consultant'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { consultantId } = body
    const projectId = request.url.split('/projects/')[1].split('/unassign')[0]

    const projectObjectId = new mongoose.Types.ObjectId(projectId)
    const consultantObjectId = new mongoose.Types.ObjectId(consultantId)

    // Update both documents
    await Promise.all([
      Project.findByIdAndUpdate(projectObjectId, {
        $pull: { 
          assignedConsultants: { 
            consultantId: consultantObjectId 
          }
        }
      }),
      Consultant.findByIdAndUpdate(consultantObjectId, {
        $pull: { 
          assignments: { 
            projectId: projectObjectId 
          }
        }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/projects/[id]/unassign:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 