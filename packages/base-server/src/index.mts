import FastifyServer from './baseApp/FastifyServer.mts';
import gcsUtil from './utils/gcp/gcs.util.mts';
export * from './utils/index.mts';
export * from './configs/index.mts';
export * from './db/mongoose.mts';
export { default as mongoQueryBuilder } from './utils/db/mongoQueryBuilder.mts';
export * from './clients/gcp/index.mts';

export interface ServerI18n {
  t(key: string, defaultMessage: string, options?: { [key: string]: string | string[] }): string;
}

export { FastifyServer, gcsUtil };
