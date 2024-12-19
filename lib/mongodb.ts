import { MongoClient } from 'mongodb'
import mongoose from 'mongoose'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

const uri = process.env.MONGODB_URI


// For the MongoDB native driver client
let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

// For Mongoose connections
export const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      return mongoose.connections[0]
    }

    await mongoose.connect(uri, {
      dbName: 'Resourcing-app-demo',
      bufferCommands: false,
      maxPoolSize: 10
    })

    return mongoose.connections[0]
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

export default clientPromise
