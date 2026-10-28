import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | null = null;

if (uri) {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
}

export async function getDb(): Promise<Db> {
  if (!clientPromise) {
    throw new Error("MongoDB connection string not configured");
  }
  const client = await clientPromise;
  return client.db("authDB");
}

export default clientPromise;
