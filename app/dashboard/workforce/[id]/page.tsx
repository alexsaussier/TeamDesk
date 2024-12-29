import ConsultantDetails from '@/components/ConsultantDetails'
import { connectDB } from '@/lib/mongodb'
import { Consultant } from '@/models/Consultant'
import { Project } from '@/models/Project'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import mongoose from 'mongoose'

type Props = {
  params: { id: string }
}

export default async function ConsultantPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) return notFound()

  await connectDB()

  const [consultant, projects] = await Promise.all([
    Consultant.findOne({
      _id: params.id,
      organizationId: new mongoose.Types.ObjectId(session.user.organizationId)
    }),
    Project.find({ organizationId: session.user.organizationId })
  ])

  if (!consultant) return notFound()

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <ConsultantDetails 
        consultant={JSON.parse(JSON.stringify(consultant))} 
        projects={JSON.parse(JSON.stringify(projects))}
      />
    </div>
  )
}