import mongoose from 'mongoose'
import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MONGODB_URI to .env.local')
}

const MONGODB_URI = process.env.MONGODB_URI

// MongoDB Native Client (if you need it)
const client = new MongoClient(MONGODB_URI)
export const clientPromise = client.connect()

// Mongoose connection
export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
        dbName: 'Resourcing-app-demo',
      })
      console.log('Connected to MongoDB - Database: Resourcing-app-demo')
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    process.exit(1) // Exit if unable to connect to database
  }
}


