import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { computeScore } from "@riskboard/domain";

const LoanApplicationSchema = z.object({
  incomeMonthly: z.number(),
  expensesMonthly: z.number(),
  requestedAmount: z.number(),
  existingDebt: z.number(),
  employmentType: z.enum(["CDI", "CDD", "FREELANCE"]),
  age: z.number().int(),
});

export function buildApp() {
  const fastify = Fastify({ logger: true });

  void fastify.register(cors);

  fastify.get("/health", async () => {
    return { status: "ok" };
  });

  fastify.post("/score", async (request, reply) => {
    const result = LoanApplicationSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: result.error.flatten() });
    }
    return computeScore(result.data);
  });

  return fastify;
}
