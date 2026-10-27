import { MongoClient, type Db } from "mongodb";

const uri =
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  "mongodb+srv://backend_database-waitlist_user-1:!8sJ%233a%25pu3TF6C@voxlate-waitlist-cluste.rgqtxf1.mongodb.net/authDB?appName=Voxlate-Waitlist-Cluster";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

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

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db("authDB");
}

export default clientPromise;

