import { FastifyServer } from 'base-server';
import 'dotenv/config';

import appConfig from './configs/app.config.mjs';

const fastify = new FastifyServer({
  host: appConfig.HOST_URL,
  port: appConfig.HTTP_PORT as number,
  logName: 'boilerplate-service',
});

fastify.listen();
