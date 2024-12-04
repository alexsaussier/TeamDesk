import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'

export async function POST(request: Request) {
  try {
    await connectDB()

    const body = await request.json()
    const { organizationId, name, requiredSkills, startDate, endDate, status } = body

    const newProject = new Project({
      organizationId,
      name,
      requiredSkills,
      startDate,
      endDate,
      assignedConsultants: [],
      status,
    })

    const savedProject = await newProject.save()
    return NextResponse.json(savedProject, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/projects:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    const projects = await Project.find({ organizationId })
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error in GET /api/projects:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

