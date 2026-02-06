import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MONGODB_URI to .env.local")
}

const uri = process.env.MONGODB_URI

const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>
}

if (process.env.NODE_ENV === "development") {
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

export async function getDb(): Promise<Db> {
  const client = await clientPromise
  return client.db("litoral-fishing")
}

let indexesCreated = false

export async function ensureIndexes(): Promise<void> {
  if (indexesCreated) return
  try {
    const db = await getDb()
    await Promise.all([
      db.collection("products").createIndex({ hidden: 1, category: 1, createdAt: -1 }),
      db.collection("products").createIndex(
        { name: "text", code: "text", description: "text" },
        { default_language: "spanish" }
      ),
      db.collection("products").createIndex({ code: 1 }, { unique: true, sparse: true }),
      db.collection("settings").createIndex({ type: 1 }, { unique: true }),
    ])
    indexesCreated = true
  } catch {
    // Indexes may already exist -- ignore
  }
}
