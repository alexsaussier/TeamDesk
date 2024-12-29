import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Consultant } from '@/models/Consultant'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Get all consultants for the current organization
export async function GET() {
  try {
    // Ensure DB connection is established before querying
    await connectDB()
    
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = session.user.organizationId
    const consultants = await Consultant.find({ organizationId })

    const transformedConsultants = consultants.map(consultant => ({
      ...consultant.toObject(),
      id: consultant._id.toString(),
      _id: consultant._id.toString(),
    }))

    return NextResponse.json(transformedConsultants)
  } catch (error) {
    console.error('Error in GET /api/workforce:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Create a new consultant
export async function POST(request: Request) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, skills, picture, level } = body

    const newConsultant = new Consultant({
      organizationId: session.user.organizationId,
      name,
      skills,
      picture: picture || 'https://www.gravatar.com/avatar/?d=mp',
      level: level || 'junior', // Use provided level or default to 'junior'
      assignments: [], // Start with no assignments
      createdBy: session.user.id
    })

    const savedConsultant = await newConsultant.save()

    return NextResponse.json({
      ...savedConsultant.toObject(),
      id: savedConsultant._id.toString(),
      _id: savedConsultant._id.toString(),
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/workforce:', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'A consultant with this name already exists in your organization' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}