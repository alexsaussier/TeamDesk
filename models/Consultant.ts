import mongoose from 'mongoose'

const ConsultantSchema = new mongoose.Schema({
  organizationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'Organization'
  },
  name: { type: String, required: true },
  skills: [String],
  assignments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  picture: { type: String, default: '/default-avatar.png' },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

ConsultantSchema.index({ organizationId: 1, name: 1 }, { unique: true })

export const Consultant = mongoose.models.Consultant || mongoose.model('Consultant', ConsultantSchema)