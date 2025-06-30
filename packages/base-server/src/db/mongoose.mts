import Logger from '../utils/logger.mjs';
import mongoose, { Schema as MongooseSchema } from 'mongoose';
import type { Model, FilterQuery, UpdateQuery } from 'mongoose';
type MongooseConnection = mongoose.Connection;

interface MongooseModel<T extends any> extends Model<T> {}
type MongooseFilterQuery<T> = FilterQuery<T>;
type MongooseUpdateQuery<T> = UpdateQuery<T>;

const MongooseTypes = mongoose.Types;

// Add default options to improve connection handling
const defaultOptions: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 15000, // Timeout for server selection
  socketTimeoutMS: 45000, // How long to wait for operations
  maxPoolSize: 50, // Maintain up to 50 socket connections
  minPoolSize: 10, // Maintain at least 10 socket connections
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  heartbeatFrequencyMS: 30000, // Check connection every 30 seconds
};

class MongooseClient {
  private _connection: mongoose.Connection | null;
  private _logger: Logger | Console;
  private _debug: boolean;

  private _mongoUrl: string;
  private _mongoOptions: mongoose.ConnectOptions;
  constructor({
    url,
    options = {},
    logger,
    debug = false,
  }: {
    url: string;
    options?: mongoose.ConnectOptions;
    logger?: Logger;
    debug?: boolean;
  }) {
    this._mongoUrl = url;
    this._mongoOptions = { ...defaultOptions, ...options };
    this._logger = logger || console;
    this._debug = debug;
    this._connection = this._connect();
  }
  private _connect() {
    const connection = mongoose.createConnection(this._mongoUrl, this._mongoOptions);
    connection.on('connected', () => {
      this._logger.info('Mongoose connected');
    });
    connection.on('error', (error) => {
      this._logger.info('Mongoose connection error:', error);
    });
    connection.on('disconnected', () => {
      this._logger.warn('Mongoose disconnected'); // Add disconnection monitoring
    });
    connection.on('reconnected', () => {
      this._logger.info('Mongoose reconnected'); // Add reconnection monitoring
    });

    if (this._debug) {
      mongoose.set('debug', (collectionName, method, query, doc) => {
        this._logger.debug('Mongoose debug:', {
          collectionName,
          method,
          query: JSON.stringify(query).substring(0, 300),
          doc,
        });
      });
    }

    // Handle both SIGTERM and SIGINT
    const cleanup = async () => {
      this._logger.info('Shutdown signal received');
      if (this._connection) {
        await this._connection.close();
      }
      this._logger.info('Closing all Mongoose connections');
      await mongoose.disconnect();
      this._connection = null;
    };

    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);

    return connection;
  }
  public get connection() {
    if (!this._connection || this._connection.readyState === 0) {
      this._connection = this._connect();
    }
    return this._connection;
  }

  public model<T>(name: string, schema: MongooseSchema<T>) {
    const connection = this.connection;
    return connection.model<T>(name, schema);
  }
}

export { MongooseClient, MongooseSchema, MongooseTypes };
export type { MongooseConnection, MongooseModel, MongooseFilterQuery, MongooseUpdateQuery };
