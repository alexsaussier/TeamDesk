import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Consultant } from '@/models/Consultant'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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