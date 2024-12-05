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

    console.log('Session:', JSON.stringify(session, null, 2))

    const userId = session.user.id || (session.user as any)._id
    console.log('User ID:', userId)
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      )
    }

    const organizationId = session.user.organizationId
    const body = await request.json()
    const { name, skills, picture } = body

    const newConsultant = new Consultant({
      organizationId,
      name,
      skills,
      picture: picture || 'https://asaussier-projects.s3.eu-north-1.amazonaws.com/resourcing-app/workforce/default-avatar.jpg',
      currentAssignment: null,
      futureAssignments: [],
      createdBy: userId
    })

    console.log('New Consultant:', JSON.stringify(newConsultant, null, 2))

    const savedConsultant = await newConsultant.save()
    return NextResponse.json(savedConsultant, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/workforce:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = session.user.organizationId
    const consultants = await Consultant.find({ organizationId })
    return NextResponse.json(consultants)
  } catch (error) {
    console.error('Error in GET /api/workforce:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}