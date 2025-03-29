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
  teamSize: {
    junior: { type: Number, required: true, default: 0 },
    manager: { type: Number, required: true, default: 0 },
    partner: { type: Number, required: true, default: 0 }
  },
  assignedConsultants: [{
    consultantId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultant',
      required: true
    },
    percentage: { 
      type: Number, 
      required: true,
      min: 0,
      max: 100,
      default: 100
    },
    hourlyRate: {
      type: Number,
      required: false,
      min: 0,
      default: 0
    }
  }],
  status: { 
    type: String, 
    enum: ['Discussions', 'Sold', 'Started', 'Completed'],
    default: 'Discussions'
  },
  chanceToClose: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
})

// To avoid duplicate project names in the same organization
ProjectSchema.index({ organizationId: 1, name: 1 }, { unique: true })

export const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema)

