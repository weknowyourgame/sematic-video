import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "../context";
import { convertAudioSchema, videoSchema } from "../schemas";
import { z } from "zod";

const t = initTRPC.context<Context>().create();

export const whisperRouter = t.router({
    convertVidToAudio: t.procedure
    .input(convertAudioSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        audioId,
        id: videoId,
        title,
        url,
        createdAt,
        updatedAt,
      } = input;
  
      try {
        // TODO: Add ffmpeg server 
        const ffmpegServerUrl = '';
  
        const response = await fetch(ffmpegServerUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoId,
            audioId,
            title,
            url,
            createdAt,
            updatedAt,
          }),
        });
  
        if (!response.ok) {
          throw new Error('FFmpeg server failed');
        }
        if (response.ok) {
        await ctx.db?.prepare(`
            INSERT INTO videos (id, title, url, status, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?)
          `).bind(
            audioId,
            title,
            'processing',
            'processing',
            createdAt,
            updatedAt
          ).run();
        }
        return { success: true };
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process video to audio',
        });
      }
    }),

    updateAudioUrl: t.procedure
    .input(z.object({
      id: z.string(),
      finalUrl: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
        try {
      await ctx.db?.prepare(`
        UPDATE videos SET url = ?, status = ?, updatedAt = ? WHERE id = ?
      `).bind(
        input.finalUrl,
        'active',
        new Date().toISOString(),
        input.id
      ).run();
  
        return { success: true };
        } catch (error) {
            console.error(error);
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update video" });
        }
    }),  
})

export type whisperRouter = typeof whisperRouter;