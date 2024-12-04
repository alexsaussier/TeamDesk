import mongoose from 'mongoose'

const AssignmentSchema = new mongoose.Schema({
  projectId: String,
  projectName: String,
  startDate: String,
  endDate: String,
})

const ConsultantSchema = new mongoose.Schema({

  organizationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'Organization'
  },
  name: { type: String, required: true },
  skills: [String],
  currentAssignment: AssignmentSchema,
  futureAssignments: [AssignmentSchema],
  picture: { type: String, default: '/default-avatar.png' },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
})

// Add compound index for organization and name uniqueness
ConsultantSchema.index({ organizationId: 1, name: 1 }, { unique: true })

export const Consultant = mongoose.models.Consultant || mongoose.model('Consultant', ConsultantSchema)