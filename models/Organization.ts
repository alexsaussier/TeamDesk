import mongoose from 'mongoose'

const OrganizationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  admin: {
    name: { type: String, required: true },
    email: { type: String, required: true }
  }
}, {
  timestamps: true
})

export const Organization = mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema) 