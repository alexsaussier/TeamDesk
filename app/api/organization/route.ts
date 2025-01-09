import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Organization } from '@/models/Organization'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    await connectDB()
    
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = session.user.organizationId
    const organization = await Organization.findById(organizationId)

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    return NextResponse.json({
      name: organization.name,
      admin: organization.admin
    })
  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
