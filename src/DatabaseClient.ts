import { MongoClient } from 'mongodb';

const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASS}@cluster0.gws5w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const databaseConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as any;

let client: MongoClient;

export async function getClient() {
  if (client) return client;
  client = new MongoClient(uri, databaseConfig);
  try {
    await client.connect();
  } catch (error) {
    console.log(`Error connecting to database: ${error}`);
  }
  console.log('Connected to database');
  return client;
}

export async function getCollection(collectionName: string) {
  const database = await getClient();
  return database.db('lol-counter').collection(collectionName);
}
