import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "../context";
import { convertAudioSchema, videoSchema } from "../schemas";
import { z } from "zod";

const t = initTRPC.context<Context>().create();

export const audioRouter = t.router({
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
        // get video from R2 bucket
        const videosBucket = ctx.videos;
        const videoKey = `${videoId}.mp4`;
        const videoObject = await videosBucket.get(videoKey);

        if (!videoObject) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Video file not found in R2',
          });
        }

        // convert video to audio using FFmpeg API
        const ffmpegServerUrl = process.env.FFMPEG_API_URL || 'http://localhost:3001';
        const ffmpegEndpoint = `${ffmpegServerUrl}/convert/video/to/audio`;
        
        // Create form data for file upload
        const formData = new FormData();
        formData.append('file', new Blob([await videoObject.arrayBuffer()]), `${videoId}.mp4`);
        formData.append('videoId', videoId);
        formData.append('audioId', audioId);
        formData.append('title', title);
        formData.append('format', 'wav');

        const response = await fetch(ffmpegEndpoint, {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error('FFmpeg server failed');
        }

        const { audioBase64 } = await response.json();

        // upload audio to R2
        const audiosBucket = ctx.audios;
        const audioKey = `${audioId}.wav`;
        const audioBuffer = Buffer.from(audioBase64, 'base64');

        await audiosBucket.put(audioKey, audioBuffer, {
          httpMetadata: {
            contentType: 'audio/wav',
          },
        });

        const audioUrl = `https://${audiosBucket.accountId}.r2.cloudflarestorage.com/${audiosBucket.name}/${audioKey}`;

        // insert audio record
        await ctx.db?.prepare(`
            INSERT INTO audios (id, title, url, status, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?)
          `).bind(
            audioId,
            title,
            audioUrl,
            'active',
            createdAt,
            updatedAt
          ).run();
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

export type audioRouter = typeof audioRouter;