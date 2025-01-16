import { NextRequest, NextResponse } from 'next/server'
import { parse } from 'csv-parse/sync'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Consultant } from '@/models/Consultant'
import { Project } from '@/models/Project'
import { read, utils } from 'xlsx'
import mongoose from 'mongoose'

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

const requiredHeaders = {
  consultants: ['name', 'level', 'skills'],
  projects: ['name', 'client', 'requiredSkills', 'startDate', 'endDate', 'teamSize.junior', 'teamSize.manager', 'teamSize.partner', 'status', 'chanceToClose']
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as 'consultants' | 'projects'
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    let records: any[]
    
    try {
      if (file.name.endsWith('.csv')) {
        const csvText = await file.text()
        records = parse(csvText, {
          columns: true,
          skip_empty_lines: true,
          trim: true
        })
      } else {
        const buffer = await file.arrayBuffer()
        const workbook = read(buffer)
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        records = utils.sheet_to_json(worksheet)
      }

      if (records.length > 0) {
        const headers = Object.keys(records[0])
        const missingHeaders = requiredHeaders[type].filter(h => !headers.includes(h))
        
        if (missingHeaders.length > 0) {
          return NextResponse.json({ 
            error: 'Missing required columns',
            details: `The following column headers are missing (make sure they are lowercase): ${missingHeaders.join(', ')}` 
          }, { status: 400 })
        }
      }

    } catch (error: unknown) {
      const err = error as Error
      return NextResponse.json({ 
        error: 'Invalid file format. Please ensure your file has the correct headers and is a valid CSV or Excel file.',
        details: err?.message || 'Unknown error'
      }, { status: 400 })
    }

    if (records.length === 0) {
      return NextResponse.json({ 
        error: 'The file is empty. Please add some data.' 
      }, { status: 400 })
    }

    const errors: ValidationError[] = []

    if (type === 'consultants') {
      records.forEach((record, index) => {
        if (!record.name) {
          errors.push({ row: index + 2, field: 'name', message: 'Name is required' })
        }
        if (!record.level || !['junior', 'manager', 'partner'].includes(record.level.toLowerCase())) {
          errors.push({ row: index + 2, field: 'level', message: 'Level must be junior, manager, or partner' })
        }
        if (!record.skills) {
          errors.push({ row: index + 2, field: 'skills', message: 'Skills are required' })
        }
      })
    }

    if (type === 'projects') {
      records.forEach((record, index) => {
        if (!record.name) {
          errors.push({ row: index + 2, field: 'name', message: 'Name is required' })
        }
        if (!record.client) {
          errors.push({ row: index + 2, field: 'client', message: 'Client is required' })
        }
        if (!record.startDate || !Date.parse(record.startDate)) {
          errors.push({ row: index + 2, field: 'startDate', message: 'Invalid start date format' })
        }
        if (!record.endDate || !Date.parse(record.endDate)) {
          errors.push({ row: index + 2, field: 'endDate', message: 'Invalid end date format' })
        }
        if (!['Discussions', 'Sold', 'Started', 'Completed'].includes(record.status)) {
          errors.push({ row: index + 2, field: 'status', message: 'Status must be Discussions, Sold, Started, or Completed' })
        }
      })
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation errors found',
        errors 
      }, { status: 400 })
    }

    if (type === 'consultants') {
      const consultants = records.map((record: any) => ({
        organizationId: new mongoose.Types.ObjectId(session.user.organizationId),
        name: record.name,
        level: record.level.toLowerCase(),
        skills: record.skills.split(',').map((s: string) => s.trim()),
        assignments: [],
        picture: 'https://www.gravatar.com/avatar/?d=mp',
        createdBy: new mongoose.Types.ObjectId(session.user.id)
      }))

      const result = await Consultant.insertMany(consultants, { ordered: false })
      return NextResponse.json({ created: result.length })
    }

    if (type === 'projects') {
      const projects = records.map((record: any) => ({
        organizationId: session.user.organizationId,
        name: record.name,
        client: record.client,
        requiredSkills: record.requiredSkills.split(',').map((s: string) => s.trim()),
        startDate: record.startDate,
        endDate: record.endDate,
        teamSize: {
          junior: parseFloat(record['teamSize.junior']),
          manager: parseFloat(record['teamSize.manager']),
          partner: parseFloat(record['teamSize.partner'])
        },
        status: record.status,
        chanceToClose: parseInt(record.chanceToClose),
        assignedConsultants: [],
        updatedBy: session.user.id
      }))

      const result = await Project.insertMany(projects, { ordered: false })
      return NextResponse.json({ created: result.length })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error: any) {
    console.error('Batch upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
} 