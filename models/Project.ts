import mongoose from 'mongoose'


const ProjectSchema = new mongoose.Schema({
  organizationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'Organization'
  },
  name: { type: String, required: true },
  client: { type: String, required: true },
  requiredSkills: [String],
  startDate: String,
  endDate: String,
  assignedConsultants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultant'
  }],
  status: { 
    type: String, 
    enum: ['Discussions', 'Sold', 'Started', 'Completed'],
    default: 'Discussions'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
})

// Add compound index for organization and project name uniqueness
ProjectSchema.index({ organizationId: 1, name: 1 }, { unique: true })

export const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema)

