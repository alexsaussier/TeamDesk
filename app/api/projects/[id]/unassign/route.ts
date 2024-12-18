import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'
import { Consultant } from '@/models/Consultant'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { consultantId } = await request.json()
    const projectId = await params.id

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