import { MongoClient, Db, Collection } from 'mongodb';

export interface MongoConfig {
  uri: string;
  dbName?: string;
}

export class MongoConnectionService {
  private client: MongoClient;
  private db: Db;
  private static instances: Map<string, MongoConnectionService> = new Map();

  private constructor(config: MongoConfig) {
    this.client = new MongoClient(config.uri);
  }

  public static getInstance(config: MongoConfig, key: string = 'default'): MongoConnectionService {
    if (!MongoConnectionService.instances.has(key)) {
      MongoConnectionService.instances.set(key, new MongoConnectionService(config));
    }
    return MongoConnectionService.instances.get(key)!;
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db();
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  public getDatabase(): Db {
    if (!this.db) {
      throw new Error('Database not initialized. Call connect() first.');
    }
    return this.db;
  }

  public getCollection<T = any>(collectionName: string): Collection<T> {
    return this.getDatabase().collection<T>(collectionName);
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.client.db('admin').command({ ping: 1 });
      return true;
    } catch (error) {
      console.error('MongoDB health check failed:', error);
      return false;
    }
  }

  public async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      console.log('MongoDB connection closed');
    }
  }
}