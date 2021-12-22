import { MongoClient } from 'mongodb';
import { _logger } from './Logger';

const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASS}@cluster0.gws5w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const databaseConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as any;

let client: MongoClient;

export async function getClient() {
  if (client) return client;
  try {
    client = new MongoClient(uri, databaseConfig);
    await client.connect();
  } catch (error) {
    _logger.log(`Error connecting to database: ${error}`);
  }
  _logger.log('Connected to database');
  return client;
}

export async function getCollection(collectionName: string) {
  const database = await getClient();
  return database.db('lol-counter').collection(collectionName);
}
