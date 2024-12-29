import mongoose from 'mongoose'

const ConsultantSchema = new mongoose.Schema({
  organizationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'Organization'
  },
  name: { type: String, required: true },
  level: { 
    type: String, 
    enum: ['junior', 'manager', 'partner'],
    required: true,
    default: 'junior'
  },
  skills: [String],
  assignments: [{
    projectId: { type: String, required: true },
    percentage: { type: Number, required: true, min: 0, max: 100, default: 100 }
  }],
  picture: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
})

ConsultantSchema.index({ organizationId: 1, name: 1 }, { unique: true })

export const Consultant = mongoose.models.Consultant || mongoose.model('Consultant', ConsultantSchema)