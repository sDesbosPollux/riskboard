import Fastify from "fastify";

const fastify = Fastify({ logger: true });

fastify.get("/health", async () => {
  return { status: "ok" };
});

await fastify.listen({ port: 3000, host: "0.0.0.0" });
