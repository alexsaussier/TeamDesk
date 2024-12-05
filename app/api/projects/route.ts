import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import mongoose from 'mongoose'

interface ProjectDocument {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  // Add other fields as needed
}

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
  } catch (error: any) {
    console.error('Error in POST /api/projects:', error)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A project with this name already exists in your organization' },
        { status: 400 }
      )
    }
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
    const projects = await Project.find({ organizationId })
      .populate('assignedConsultants')
      .lean<ProjectDocument[]>()

    const transformedProjects = projects.map(project => ({
      ...project,
      id: project._id.toString(),
      organizationId: project.organizationId.toString(),
      updatedBy: project.updatedBy.toString(),
    }))

    return NextResponse.json(transformedProjects)
  } catch (error) {
    console.error('Error in GET /api/projects:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

