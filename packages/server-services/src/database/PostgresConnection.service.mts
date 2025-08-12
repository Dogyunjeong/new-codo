import { Pool, PoolClient, QueryResult } from 'pg';

export interface DatabaseConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
}

export class PostgresConnectionService {
  private pool: Pool;
  private static instances: Map<string, PostgresConnectionService> = new Map();

  private constructor(config: DatabaseConfig) {
    if (config.connectionString) {
      this.pool = new Pool({
        connectionString: config.connectionString,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    } else {
      this.pool = new Pool({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password,
        ssl: config.ssl,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    }

    this.pool.on('error', (err: Error) => {
      console.error('Database pool error:', err);
    });
  }

  public static getInstance(config: DatabaseConfig, key: string = 'default'): PostgresConnectionService {
    if (!PostgresConnectionService.instances.has(key)) {
      PostgresConnectionService.instances.set(key, new PostgresConnectionService(config));
    }
    return PostgresConnectionService.instances.get(key)!;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  public async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}