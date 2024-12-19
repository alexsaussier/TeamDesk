import mongoose from 'mongoose'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MONGODB_URI to .env.local')
}

const MONGODB_URI: string = process.env.MONGODB_URI

export const connectDB = async () => {
  try {
    const opts = {
      bufferCommands: false,
      dbName: 'Resourcing-app-demo',
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, opts)
      console.log('Connected to MongoDB - Database: Resourcing-app-demo')
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    throw error
  }
}

