import { NextResponse, NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Consultant } from '@/models/Consultant'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import mongoose from 'mongoose'
import { Project } from '@/models/Project'

// Get a single consultant by ID
export async function GET(request: Request) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = request.url.split('/').pop()
    

    const consultant = await Consultant.findOne({
      _id: new mongoose.Types.ObjectId(id),
      organizationId: new mongoose.Types.ObjectId(session.user.organizationId)
    })

    if (!consultant) {
      return NextResponse.json(
        { error: 'Consultant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...consultant.toObject(),
      id: consultant._id.toString(),
      _id: consultant._id.toString(),
    })
  } catch (error) {
    console.error('Error in GET /api/workforce/[id]:', error)
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
    const consultantId = new mongoose.Types.ObjectId(
      request.url.split('/').pop()
    )

    // Find the consultant to verify ownership and get their assignments
    const consultant = await Consultant.findOne({
      _id: consultantId,
      organizationId: new mongoose.Types.ObjectId(session.user.organizationId)
    })

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant not found' }, { status: 404 })
    }

    // Remove consultant from all projects they're assigned to
    await Project.updateMany(
      { 'assignedConsultants.consultantId': consultantId },
      { $pull: { assignedConsultants: { consultantId } } }
    )

    // Delete the consultant
    await Consultant.findByIdAndDelete(consultantId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/workforce/[id]:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 