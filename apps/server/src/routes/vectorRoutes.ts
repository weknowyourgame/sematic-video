import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "../context";
import { z } from "zod";

const t = initTRPC.context<Context>().create();

export const vectorRouter = t.router({
  getVector: t.procedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    const { id } = input;

    const frame = await ctx.db?.prepare(
      'SELECT * FROM frames WHERE id = ?'
    ).bind(id).first();

    if (!frame) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Frame not found' });
    }
    const text = [
        frame.transcript,
        frame.visualDescription,
    ];
  
      const embeddings = await ctx.ai.run(
        "@cf/baai/bge-base-en-v1.5",
        {
          text: text,
        }
      );
      return embeddings;
  }),
});


export type VisionRouter = typeof vectorRouter;
