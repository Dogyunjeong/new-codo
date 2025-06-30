import { FastifyReply, FastifyRequest } from "fastify";

export const handleError = ({
  req,
  rep,
  error,
  defaultMessage,
}: {
  req: FastifyRequest;
  rep: FastifyReply;
  error: Error | unknown;
  defaultMessage?: string;
}) => {
  rep.status(500).send({
    message: defaultMessage || "Internal Server Error",
    error: error instanceof Error ? error.message : error,
  });
};
