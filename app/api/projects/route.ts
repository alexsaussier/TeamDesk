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
  name: string;
  client: string;
  requiredSkills: string[];
  startDate: Date;
  endDate: Date;
  status: string;
  assignedConsultants: mongoose.Types.ObjectId[];
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
    // Find all projects for this organization and populate the assignedConsultants field
    // with just the consultant name, skills and picture. Convert to plain JS objects
    // using lean() for better performance
    const projects = await Project.find({ organizationId })
      .populate({
        path: 'assignedConsultants',
        select: 'name skills picture'
      })
      .lean<ProjectDocument[]>()

    // Transform MongoDB documents into plain JavaScript objects
    // This is necessary because MongoDB ObjectIds need to be converted to strings
    // for JSON serialization and frontend consumption
    const transformedProjects = projects.map(project => ({
      // Spread all existing project properties
      ...project,
      // Add an 'id' field that's a string version of MongoDB's _id
      id: project._id.toString(),
      // Convert ObjectId to string for the organization reference
      organizationId: project.organizationId.toString(),
      // Convert ObjectId to string for the user reference
      updatedBy: project.updatedBy.toString(),
      // Transform the array of assigned consultants
      assignedConsultants: project.assignedConsultants.map((consultant: any) => ({
        // Spread existing consultant properties
        ...consultant,
        // Add both id and _id as strings for frontend compatibility
        // Some frontend frameworks expect 'id', while MongoDB uses '_id'
        id: consultant._id.toString(),
        _id: consultant._id.toString()
      }))
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

