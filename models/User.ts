import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true },
  organizationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'Organization'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
}, {
  timestamps: true
})

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next()
  }
  this.hashedPassword = await bcrypt.hash(this.hashedPassword, 10)
  next()
})

export const User = mongoose.models.User || mongoose.model('User', UserSchema) 