import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'
import { Consultant } from '@/models/Consultant'
import mongoose from 'mongoose'

// Update the percentage or hourly rate of an assignment for a consultant
export async function PATCH(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { consultantId, percentage, hourlyRate } = body
    const projectId = request.url.split('/projects/')[1].split('/update-assignment')[0]

    // Validate percentage if provided
    if (percentage !== undefined && (percentage < 0 || percentage > 100)) {
      return NextResponse.json(
        { error: 'Percentage must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Validate hourly rate if provided
    if (hourlyRate !== undefined && hourlyRate < 0) {
      return NextResponse.json(
        { error: 'Hourly rate must be a positive number' },
        { status: 400 }
      )
    }

    const projectObjectId = new mongoose.Types.ObjectId(projectId)
    const consultantObjectId = new mongoose.Types.ObjectId(consultantId)

    // Create update objects based on what fields were provided
    const projectUpdateObj: Record<string, number> = {};
    const consultantUpdateObj: Record<string, number> = {};

    if (percentage !== undefined) {
      projectUpdateObj['assignedConsultants.$.percentage'] = percentage;
      consultantUpdateObj['assignments.$.percentage'] = percentage;
    }

    if (hourlyRate !== undefined) {
      projectUpdateObj['assignedConsultants.$.hourlyRate'] = hourlyRate;
      // Note: We're not updating the consultant document with hourly rate
      // as that's project-specific and not stored in the consultant model
    }

    // Update project document
    if (Object.keys(projectUpdateObj).length > 0) {
      await Project.findOneAndUpdate(
        { 
          _id: projectObjectId,
          'assignedConsultants.consultantId': consultantObjectId 
        },
        { 
          $set: projectUpdateObj
        }
      );
    }

    // Update consultant document (only if percentage was updated)
    if (Object.keys(consultantUpdateObj).length > 0) {
      await Consultant.findOneAndUpdate(
        { 
          _id: consultantObjectId,
          'assignments.projectId': projectId
        },
        { 
          $set: consultantUpdateObj
        }
      );
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PATCH /api/projects/[id]/update-assignment:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 