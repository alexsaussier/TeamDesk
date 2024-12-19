import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'
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
    const organizationId = session.user.organizationId

    const body = await request.json()
    const { name, client, requiredSkills, startDate, endDate, status, assignedConsultants } = body

    const newProject = new Project({
      organizationId,
      name,
      client,
      requiredSkills,
      startDate,
      endDate,
      assignedConsultants: assignedConsultants || [],
      status: status || 'Discussions',
      updatedBy: userId,
    })

    const savedProject = await newProject.save()
    return NextResponse.json(savedProject, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/projects:', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'A project with this name already exists in your organization' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = session.user.organizationId
    const projects = await Project.find({ organizationId })
      .populate('assignedConsultants', 'name skills picture')

    const transformedProjects = projects.map(project => ({
      ...project.toObject(),
      id: project._id.toString(),
      organizationId: project.organizationId.toString(),
      updatedBy: project.updatedBy.toString(),
      assignedConsultants: project.assignedConsultants.map((consultant: { _id: string; name: string; skills: string[]; picture: string }) => ({
        id: consultant._id.toString(),
        _id: consultant._id.toString(),
        name: consultant.name,
        skills: consultant.skills,
        picture: consultant.picture
      }))
    }))

    return NextResponse.json(transformedProjects)
  } catch (error) {
    console.error('Error in GET /api/projects:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

