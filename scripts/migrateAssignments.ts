import { connectDB } from '@/lib/mongodb'
import { Consultant } from '@/models/Consultant'


async function migrateAssignments() {
  await connectDB()

  try {
    // Get all consultants
    const consultants = await Consultant.find({})

    for (const consultant of consultants) {
      // Convert old string[] assignments to ConsultantAssignment[]
      if (Array.isArray(consultant.assignments) && consultant.assignments.length > 0 && typeof consultant.assignments[0] === 'string') {
        const newAssignments = consultant.assignments.map((oldAssignmentId: string) => ({
          projectId: oldAssignmentId,
          percentage: 100 // Default to 100% for existing assignments
        }))

        // Update consultant with new assignment structure
        await Consultant.findByIdAndUpdate(consultant._id, {
          assignments: newAssignments
        })
      }
    }

    console.log('Migration completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrateAssignments() 