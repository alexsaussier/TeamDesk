import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Consultant } from '@/models/Consultant'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import mongoose from 'mongoose'

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: consultantId } = await context.params
    
    if (!consultantId || !mongoose.Types.ObjectId.isValid(consultantId)) {
      return NextResponse.json(
        { error: 'Invalid consultant ID' },
        { status: 400 }
      )
    }

    const organizationId = session.user.organizationId
    
    const consultant = await Consultant.findOne({
      _id: new mongoose.Types.ObjectId(consultantId),
      organizationId: new mongoose.Types.ObjectId(organizationId)
    })

    if (!consultant) {
      return NextResponse.json(
        { error: 'Consultant not found' },
        { status: 404 }
      )
    }

    await Consultant.deleteOne({ 
      _id: new mongoose.Types.ObjectId(consultantId)
    })
    
    return NextResponse.json({ 
      message: 'Consultant deleted successfully',
      id: consultantId 
    })
  } catch (error) {
    console.error('Error in DELETE /api/workforce/[id]:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 