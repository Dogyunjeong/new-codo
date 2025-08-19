import type * as Types from '../@types/index.mts';
import helmet from '@fastify/helmet';
import Fastify from 'fastify';
import type {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginCallback,
  FastifyRegisterOptions,
} from 'fastify';
import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import Logger from '../utils/logger.mts';
import { urlUtil } from '@base/shared-utils';

export type {
  FastifyRequest,
  RouteHandler,
  RouteHandlerMethod,
  FastifyReply,
  FastifyPluginAsync,
  FastifyPluginCallback,
} from 'fastify';

const getFastifyLoggerPlugin =
  (logName: string): FastifyPluginAsync =>
  async (instance: FastifyInstance) => {
    instance.decorateRequest('logger', null as any);
    instance.addHook('onRequest', async (req) => {
      const logger = new Logger({ logName });
      req.logger = logger;
      req.logger.devDebug('Request received', {
        url: req.url,
        fullUrl: req.raw.url,
        method: req.method,
        queryString: req.query,
      });
    });
    return Promise.resolve();
  };

const getFastifyI18nPlugin =
  (lang?: string): FastifyPluginAsync =>
  async (instance: FastifyInstance) => {
    instance.decorateRequest('i18n', null as any);
    instance.addHook('onRequest', async (req) => {
      const t = (key: string, defaultMessage: string, options?: { [key: string]: string }) =>
        defaultMessage.replace(/\{\{([^}]+)\}\}/g, (match, p1) => {
          return options?.[p1] || match;
        });
      req.i18n = { t };
    });
    return Promise.resolve();
  };

class FastifyServer {
  private _fastify: Fastify.FastifyInstance;

  private _host: string;
  private _port: number;

  constructor({
    host = 'localhost',
    port = 3000,
    logName = 'default',
    corsOption = { origin: false },
  }: {
    host?: string;
    port: number;
    logName?: string;
    corsOption?: cors.FastifyCorsOptions;
  }) {
    this._host = host;
    this._port = port;

    this._fastify = Fastify({
      logger: true,
      querystringParser: (str) => {
        return urlUtil.qs.parse(str, { arrayFormat: 'bracket' });
      },
    });

    this._fastify.register(cors, corsOption);
    this._fastify.register(helmet, {
      global: true,
    });
    this._fastify.get('/health', function (req, reply) {
      req.logger.debug('Health check');
      reply.send({ status: 'ok' });
    });

    const fastifyLoggerPlugin: FastifyPluginAsync = getFastifyLoggerPlugin(logName);
    this._fastify.register(fp(fastifyLoggerPlugin));

    const fastifyI18nPlugin: FastifyPluginAsync = getFastifyI18nPlugin();
    this._fastify.register(fp(fastifyI18nPlugin));

    this._fastify.setErrorHandler(function (error, request, reply) {
      if (error instanceof Fastify.errorCodes.FST_ERR_BAD_STATUS_CODE) {
        // Log error
        this.log.error(error);
        // Send error response
        reply.status(500).send({ ok: false });
      } else {
        // fastify will use parent error handler to handle this
        reply.send(error);
      }
    });
  }

  public register = (plugin: FastifyPluginCallback, options?: FastifyRegisterOptions<any>) => {
    this._fastify.register(plugin, options);
  };

  public listen = async () => {
    try {
      await this._fastify.listen({
        host: this._host,
        port: this._port,
      });
      const signals = ['SIGINT', 'SIGTERM'] as const;
      signals.forEach((signal) => {
        process.on(signal, async () => {
          console.log(`Received ${signal}, server shutting down`);
          try {
            await this._fastify.close();
            process.exit(0);
          } catch (err) {
            this._fastify.log.error(err);
            process.exit(1);
          }
        });
      });
      console.log(`Server listening on port ${this._port}`);
    } catch (err) {
      this._fastify.log.error(err);
      process.exit(1);
    }
  };
}

export default FastifyServer;
