import { initTRPC } from "@trpc/server";
import { Context } from "../context";
import { uploadVideoSchema, videoSchema } from "../schemas";
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
    .input(uploadVideoSchema)
    .mutation(async ({ ctx, input }) => {
    const { id, title, status, duration, text, createdAt, updatedAt, fileData, fileName, fileType } = input;

    // Upload file to R2 bucket
    const videosBucket = ctx.videos;
    const key = `${id}.mp4`;
    
    // Convert base64 to Uint8Array for R2 upload (Cloudflare Workers compatible)
    const binaryString = atob(fileData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    await videosBucket.put(key, bytes, {
      httpMetadata: {
        contentType: fileType,
      },
    });

    // Use the correct R2 URL format for Cloudflare Workers
    const finalUrl = `https://pub-${videosBucket.name}.r2.dev/${key}`; 

    const video = await ctx.db?.prepare(
        `INSERT INTO videos (id, title, url, status, duration, text, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, title, finalUrl, status, duration, text, createdAt, updatedAt).run();      

    return video;
  }),
});


export type VideoRouter = typeof videoRouter;
