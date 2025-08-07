import { MongoClient, Db, Collection } from 'mongodb';
import { getAppConfig } from '../configs/app.config.mts';

export class DatabaseConnection {
  private client: MongoClient;
  private db: Db;
  private static instance: DatabaseConnection;

  private constructor() {
    const config = getAppConfig();
    this.client = new MongoClient(config.mongodbUri);
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
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

  public async initializeIndexes(): Promise<void> {
    try {
      const db = this.getDatabase();

      // Posts collection indexes
      const postsCollection = db.collection('posts');
      await postsCollection.createIndex({ userId: 1, createdAt: -1 });
      await postsCollection.createIndex({ goalId: 1, progressDate: -1 });
      await postsCollection.createIndex({ createdAt: -1 });
      await postsCollection.createIndex({ hashtags: 1 });
      await postsCollection.createIndex({ id: 1 }, { unique: true });

      // Likes collection indexes
      const likesCollection = db.collection('likes');
      await likesCollection.createIndex({ postId: 1 });
      await likesCollection.createIndex({ userId: 1, postId: 1 }, { unique: true });
      await likesCollection.createIndex({ id: 1 }, { unique: true });

      // Comments collection indexes
      const commentsCollection = db.collection('comments');
      await commentsCollection.createIndex({ postId: 1, createdAt: 1 });
      await commentsCollection.createIndex({ userId: 1 });
      await commentsCollection.createIndex({ parentCommentId: 1 });
      await commentsCollection.createIndex({ id: 1 }, { unique: true });

      console.log('MongoDB indexes created successfully');
    } catch (error) {
      console.error('Failed to create MongoDB indexes:', error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      console.log('MongoDB connection closed');
    }
  }
}