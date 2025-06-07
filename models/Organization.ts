import mongoose from 'mongoose'

const ConsultantLevelSchema = new mongoose.Schema({
  id: { type: String, required: true }, // e.g. "junior", "senior", "lead" 
  name: { type: String, required: true }, // e.g. "Junior Developer", "Senior Consultant"
  order: { type: Number, required: true }, // for sorting, 1 = most junior
  isActive: { type: Boolean, default: true }
}, { _id: false })

const OrganizationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: {
    type: String,
    default: ''
  },
  perks: {
    type: String,
    default: ''
  },
  planType: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  consultantLevels: {
    type: [ConsultantLevelSchema],
    default: [
      { id: 'junior', name: 'Junior', order: 1, isActive: true },
      { id: 'manager', name: 'Manager', order: 2, isActive: true },
      { id: 'partner', name: 'Partner', order: 3, isActive: true }
    ]
  }
}, {
  timestamps: true
})

export const Organization = mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema) 