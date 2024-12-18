import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Consultant } from '@/models/Consultant'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      )
    }

    const organizationId = session.user.organizationId
    const body = await request.json()
    const { name, skills, picture } = body

    // Try to find an existing consultant with the same name in the organization
    const existingConsultant = await Consultant.findOne({
      organizationId,
      name
    })

    // If consultant already exists, return it instead of creating a new one
    if (existingConsultant) {
      return NextResponse.json(existingConsultant, { status: 200 })
    }

    // If no existing consultant, create a new one
    const newConsultant = new Consultant({
      organizationId,
      name,
      skills,
      picture: picture || 'https://asaussier-projects.s3.eu-north-1.amazonaws.com/resourcing-app/workforce/default-avatar.jpg',
      assignments: [],
      createdBy: userId,
    })

    const savedConsultant = await newConsultant.save()
    return NextResponse.json(savedConsultant, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/workforce:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


// GET endpoint to fetch all consultants for the authenticated user's organization
export async function GET() {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = session.user.organizationId
    const consultants = await Consultant.find({ organizationId }).lean()

    const transformedConsultants = consultants.map(consultant => ({
      ...consultant,
      id: consultant._id.toString(),
      _id: consultant._id.toString(),
    }))

    console.log('Sending consultants:', transformedConsultants)
    return NextResponse.json(transformedConsultants)
  } catch (error) {
    console.error('Error in GET /api/workforce:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}