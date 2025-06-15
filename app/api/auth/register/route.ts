import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { Organization } from '@/models/Organization'
import { Project } from '@/models/Project'
import { Consultant } from '@/models/Consultant'
import { sendWelcomeEmail } from '@/lib/email'
//import mongoose from 'mongoose'

const TEMPLATE_ORG_ID = '677fe93eb416d059e076a298'

export async function POST(request: Request) {
  try {
    await connectDB()
    const { name, email, password, organizationName, populateWithMockData } = await request.json()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Create new organization
    const organization = new Organization({
      name: organizationName
    })
    const savedOrganization = await organization.save()

    // Create new user first
    const newUser = new User({
      name,
      email,
      hashedPassword: password,
      organizationId: savedOrganization._id,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date()
    })
    await newUser.save()

    // If populateWithMockData is true, copy template data
    if (populateWithMockData) {
      // Fetch template projects and consultants
      const [templateProjects, templateConsultants] = await Promise.all([
        Project.find({ organizationId: TEMPLATE_ORG_ID }),
        Consultant.find({ organizationId: TEMPLATE_ORG_ID })
      ])

      // Create a mapping of old to new IDs
      const projectIdMap = new Map()
      const consultantIdMap = new Map()

      // First pass: Create all projects and consultants and store their ID mappings
      const projectPromises = templateProjects.map(async project => {
        const projectData = project.toObject()
        const oldId = projectData._id.toString()
        delete projectData._id
        const newProject = await new Project({
          ...projectData,
          organizationId: savedOrganization._id,
          updatedBy: newUser._id,
          assignedConsultants: [] // Clear assignments temporarily
        }).save()
        projectIdMap.set(oldId, newProject._id)
        return newProject
      })

      const consultantPromises = templateConsultants.map(async consultant => {
        const consultantData = consultant.toObject()
        const oldId = consultantData._id.toString()
        delete consultantData._id
        const newConsultant = await new Consultant({
          ...consultantData,
          organizationId: savedOrganization._id,
          createdBy: newUser._id,
          assignments: [] // Clear assignments temporarily
        }).save()
        consultantIdMap.set(oldId, newConsultant._id)
        return newConsultant
      })

      // Wait for all entities to be created
      const [newProjects, newConsultants] = await Promise.all([
        Promise.all(projectPromises),
        Promise.all(consultantPromises)
      ])

      // Second pass: Update assignments with new IDs
      // Define a type for the update operations
      type UpdateOperation = ReturnType<typeof Project.findByIdAndUpdate> | ReturnType<typeof Consultant.findByIdAndUpdate>
      const updatePromises: UpdateOperation[] = []

      // Update project assignments
      templateProjects.forEach((project, index) => {
        const oldAssignments = project.assignedConsultants || []
        const newAssignments = oldAssignments.map((assignment: { consultantId: string, percentage: number }) => ({
          consultantId: consultantIdMap.get(assignment.consultantId.toString()),
          percentage: assignment.percentage
        })).filter((assignment: { consultantId: string, percentage: number }) => assignment.consultantId) // Filter out any unmapped IDs

        updatePromises.push(
          Project.findByIdAndUpdate(newProjects[index]._id, {
            assignedConsultants: newAssignments
          })
        )
      })

      // Update consultant assignments
      templateConsultants.forEach((consultant, index) => {
        const oldAssignments = consultant.assignments || []
        const newAssignments = oldAssignments.map((assignment: { projectId: string, percentage: number }) => ({
          projectId: projectIdMap.get(assignment.projectId),
          percentage: assignment.percentage
        })).filter((assignment: { projectId: string, percentage: number }) => assignment.projectId) // Filter out any unmapped IDs

        updatePromises.push(
          Consultant.findByIdAndUpdate(newConsultants[index]._id, {
            assignments: newAssignments
          })
        )
      })

      // Wait for all updates to complete
      await Promise.all(updatePromises)
    }

    // Send welcome email
    try {
      await sendWelcomeEmail(
        email,
        name,
        organizationName
      )
      console.log('Welcome email sent successfully to:', email)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail registration if email fails
    }

    return NextResponse.json(
      { message: 'User and organization created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 