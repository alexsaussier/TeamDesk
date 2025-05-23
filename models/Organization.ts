import mongoose from 'mongoose'

const OrganizationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  admin: {
    name: { type: String, required: true },
    email: { type: String, required: true }
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
  }
}, {
  timestamps: true
})

export const Organization = mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema) 