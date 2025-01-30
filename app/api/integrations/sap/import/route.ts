import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SAPProfessionalServicesIntegrator } from '@/utils/sapIntegration'
import { Consultant } from '@/models/Consultant'
import { Project } from '@/models/Project'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, config } = await request.json()
    const integrator = new SAPProfessionalServicesIntegrator(config, false)

    if (action === 'preview') {
      // Just fetch and return the data for preview
      const [consultants, projects] = await Promise.all([
        integrator.fetchResources(),
        integrator.fetchProjects()
      ])
      return NextResponse.json({ consultants, projects })
    }

    if (action === 'import') {
      await connectDB()
      const [consultants, projects] = await Promise.all([
        integrator.fetchResources(),
        integrator.fetchProjects()
      ])

      // Add organization and user IDs
      const consultantsToInsert = consultants.map(c => ({
        ...c,
        organizationId: session.user.organizationId,
        createdBy: session.user.id
      }))

      const projectsToInsert = projects.map(p => ({
        ...p,
        organizationId: session.user.organizationId,
        updatedBy: session.user.id
      }))

      // Insert into MongoDB
      const [insertedConsultants, insertedProjects] = await Promise.all([
        Consultant.insertMany(consultantsToInsert),
        Project.insertMany(projectsToInsert)
      ])

      return NextResponse.json({
        consultantsImported: insertedConsultants.length,
        projectsImported: insertedProjects.length
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('SAP import error:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
