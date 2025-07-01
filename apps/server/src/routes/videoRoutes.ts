import { initTRPC } from "@trpc/server";
import { Context } from "../context";
import { videoSchema } from "../schemas";
import { z } from "zod";

const t = initTRPC.context<Context>().create();

export const videoRouter = t.router({
  getVideo: t.procedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    const { id } = input;
    const result = await ctx.db?.prepare(
        'SELECT * FROM videos WHERE id = ?'
      ).bind(id).first();

      return result;
  }),

  uploadVideo: t.procedure
    .input(videoSchema)
    .mutation(async ({ ctx, input }) => {
    const { id, title, url, status, createdAt, updatedAt } = input;

    const video = await ctx.db?.prepare(
        `INSERT INTO videos (id, title, url, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(id, title, url, status, createdAt, updatedAt).run();      

    return video;
  }),
});


export type VideoRouter = typeof videoRouter;
