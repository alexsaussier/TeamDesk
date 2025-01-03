import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Consultant } from '@/models/Consultant'


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
    const { name, client, requiredSkills, startDate, endDate, status, assignedConsultants, teamSize } = body

    const newProject = new Project({
      organizationId,
      name,
      client,
      requiredSkills,
      startDate,
      endDate,
      teamSize,
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

// Get all projects
export async function GET() {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = session.user.organizationId
    const projects = await Project.find({ organizationId })
      .populate({
        path: 'assignedConsultants.consultantId',
        model: Consultant,
        select: 'name skills picture level'
      })

    console.log('Fetched projects and the assigned consultants:', projects[0].assignedConsultants)

    // Necessary to update to object, some fields to string and assignedConsultants.
    const transformedProjects = projects.map(project => ({
      ...project.toObject(),
      id: project._id.toString(),
      organizationId: project.organizationId.toString(),
      updatedBy: project.updatedBy.toString(),
      assignedConsultants: project.assignedConsultants.map((assignment: { 
        consultantId: { _id: string; name: string; skills: string[]; picture: string; level: string }; 
        percentage: number 
      }) => ({
        id: assignment.consultantId._id.toString(),
        name: assignment.consultantId.name,
        skills: assignment.consultantId.skills,
        picture: assignment.consultantId.picture,
        percentage: assignment.percentage,
        level: assignment.consultantId.level,
      }))
    }))

    console.log('Sending response back to the client. Transformed projects:', transformedProjects[0].assignedConsultants)

    return NextResponse.json(transformedProjects)
  } catch (error) {
    console.error('Error in GET /api/projects:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
