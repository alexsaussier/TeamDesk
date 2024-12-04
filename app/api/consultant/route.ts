import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Consultant } from '@/models/Consultant'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: Request) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = session.user.organizationId
    const body = await request.json()
    const { name, skills, picture } = body

    const newConsultant = new Consultant({
      organizationId,
      name,
      skills,
      picture: picture || '/default-avatar.png',
      currentAssignment: null,
      futureAssignments: [],
    })

    const savedConsultant = await newConsultant.save()
    return NextResponse.json(savedConsultant, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/consultants:', error)
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
    console.error('Error in GET /api/consultants:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}