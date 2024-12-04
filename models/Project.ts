import mongoose from 'mongoose'

const ProjectSchema = new mongoose.Schema({
  organizationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'Organization'
  },
  name: { type: String, required: true },
  requiredSkills: [String],
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  assignedConsultants: [String],
  status: { 
    type: String, 
    enum: ['Discussions', 'Sold', 'Started', 'Completed'],
    default: 'Discussions'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
})

// Add compound index for organization and name uniqueness
ProjectSchema.index({ organizationId: 1, name: 1 }, { unique: true })

export const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema)

