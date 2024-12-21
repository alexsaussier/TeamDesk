import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'
import { Consultant } from '@/models/Consultant'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import mongoose from 'mongoose'

export async function POST(request: Request) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { consultantId } = await request.json()
    const urlParts = request.url.split('/')
    const projectId = urlParts[urlParts.length - 2] // Get the ID before 'unassign'

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    // Update both documents
    await Promise.all([
      Project.findByIdAndUpdate(projectId, {
        $pull: { assignedConsultants: consultantId }
      }),
      Consultant.findByIdAndUpdate(consultantId, {
        $pull: { assignments: projectId }
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