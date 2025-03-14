import ConsultantDetails from '@/components/ConsultantDetails'
import { connectDB } from '@/lib/mongodb'
import { Consultant } from '@/models/Consultant'
import { Project } from '@/models/Project'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import mongoose from 'mongoose'

type Props = Promise<{ id: string }>


export default async function ConsultantPage({ params }: {params: Props}) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return notFound()

  await connectDB()

  const [consultant, projectDocs] = await Promise.all([
    Consultant.findOne({
      _id: id,
      organizationId: new mongoose.Types.ObjectId(session.user.organizationId)
    }),
    Project.find({ organizationId: session.user.organizationId })
  ])

  if (!consultant) return notFound()

  // Transform MongoDB documents to include id field
  const projects = projectDocs.map(project => ({
    ...project.toObject(),
    id: project._id.toString(),
    _id: project._id.toString()
  }))

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <ConsultantDetails 
        consultant={JSON.parse(JSON.stringify(consultant))} 
        projects={JSON.parse(JSON.stringify(projects))}
      />
    </div>
  )
}