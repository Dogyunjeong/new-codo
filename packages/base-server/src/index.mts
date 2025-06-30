import FastifyServer from './baseApp/FastifyServer.mjs';
import gcsUtil from './utils/gcp/gcs.util.mjs';
export * from './utils/index.mjs';
export * from './configs/index.mjs';
export * from './db/mongoose.mjs';
export { default as mongoQueryBuilder } from './utils/db/mongoQueryBuilder.mjs';
export * from './clients/gcp/index.mjs';

export interface ServerI18n {
  t(key: string, defaultMessage: string, options?: { [key: string]: string | string[] }): string;
}

export { FastifyServer, gcsUtil };
