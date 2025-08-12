import { FastifyReply, FastifyRequest } from 'fastify';
import { ExpectedServerError } from '@base/shared-utils';
import envConfig from '../configs/baseEnv.config.mts';

const minifyStackTrace = (error: Error) => {
  return error?.stack
    ?.split('\n')
    .filter((s) => s.indexOf('node_modules') === -1)
    .join('\n');
};

export const handleResponse = async <T extends any = any>({
  req,
  rep,
  data,
}: {
  req: FastifyRequest;
  rep: FastifyReply;
  data?: T;
}) => {
  rep.send(data);
};

export const handleError = async ({
  req,
  rep,
  error,
  defaultMessage,
  excludeBodyLogging = !envConfig.IS_PRODUCTION,
}: {
  req: FastifyRequest;
  rep: FastifyReply;
  error: ExpectedServerError | Error | unknown;
  defaultMessage?: any;
  excludeBodyLogging?: boolean;
}) => {
  const isExpectedServerError = error instanceof ExpectedServerError;
  let status = 500;
  let mostRelevantErrorMessage =
    (error as Error)?.message ||
    defaultMessage ||
    req.i18n.t('internal_server_error.default', 'Failed to proceed. Please try again');

  if (error instanceof ExpectedServerError && error?.httpStatusCode) {
    mostRelevantErrorMessage = error?.message;
    status = error?.httpStatusCode;
  }
  const errorResponse: {
    errorMessage: string;
    errorForDebugging?: any;
  } = {
    errorMessage: mostRelevantErrorMessage,
  };

  if (!envConfig.IS_PRODUCTION) {
    errorResponse.errorForDebugging = { error };
    errorResponse.errorForDebugging.errorMessage = (error as Error)?.message;
    errorResponse.errorForDebugging.stack = minifyStackTrace(error as Error);
  }
  const errorLogging: { [key: string]: any } = {
    defaultMessage,
    error: {
      error,
      message: (error as Error)?.message,
      isExpectedServerError,
      errorForDebugging: errorResponse?.errorForDebugging,
    },
    res: {
      httpStatus: status,
    },
    req: {
      query: req.query,
      headers: req.headers,
      userId: req?.locals?.user?._id?.toString(),
      method: req.method,
      host: req.hostname,
      url: req.url,
      body: excludeBodyLogging ? undefined : req.body,
    },
  };

  if (isExpectedServerError && 'errorData' in error) {
    errorLogging.errorData = error?.errorData;
  }

  req.logger.error(`Response Error - ${mostRelevantErrorMessage}`, errorLogging);
  rep.status(status).send(errorResponse);
};
