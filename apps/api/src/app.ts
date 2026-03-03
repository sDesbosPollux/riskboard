import Fastify, { type FastifyInstance } from "fastify";

export function buildApp(): FastifyInstance {
  const fastify = Fastify({ logger: false });

  fastify.get("/health", async () => {
    return { status: "ok" };
  });

  return fastify;
}
