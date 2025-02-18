import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

    testNeo4j: publicProcedure.mutation(async ({ ctx }) => {
      const driver = ctx.db;
      const session = driver().session();
      try {
        const result = await session.run('MATCH (n) RETURN count(n) as count');
        return result.records;
      } finally {
        await session.close();
      }
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return 1;
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const post = { name: "ok" };

    return post ?? null;
  }),
});
