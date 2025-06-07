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
    required: true,
    default: 'junior'
  },
  salary: {
    type: Number,
    required: true,
    min: 0,
    default: 0
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

// Remove any existing indexes
ConsultantSchema.index({  organizationId: 1, name: 1  }, { unique: true }) // Override the unique name index
// OR completely remove any unique constraint on the name field

export const Consultant = mongoose.models.Consultant || mongoose.model('Consultant', ConsultantSchema)