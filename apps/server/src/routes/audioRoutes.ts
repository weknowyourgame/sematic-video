import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "../context";
import { convertAudioSchema, uploadAudioSchema, videoSchema } from "../schemas";
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
        // Convert base64 to Uint8Array for R2 upload (Cloudflare Workers compatible)
        const binaryString = atob(audioBase64);
        const audioBuffer = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          audioBuffer[i] = binaryString.charCodeAt(i);
        }

        await audiosBucket.put(audioKey, audioBuffer, {
          httpMetadata: {
            contentType: 'audio/wav',
          },
        });

        const audioUrl = `https://pub-5e55bce7f108440f8bc08456a420cbdf.r2.dev/${audioKey}`;

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
        UPDATE audios SET url = ?, status = ?, updatedAt = ? WHERE id = ?
      `).bind(
        input.finalUrl,
        'active',
        new Date().toISOString(),
        input.id
      ).run();
  
        return { success: true };
        } catch (error) {
            console.error(error);
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update audio" });
        }
    }),  
    uploadAudio: t.procedure
    .input(uploadAudioSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, title, status, text, createdAt, updatedAt, fileData, fileName, fileType } = input;

      // Convert base64 to Uint8Array for R2 upload (Cloudflare Workers compatible)
      const binaryString = atob(fileData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audiosBucket = ctx.audios;
      const audioKey = `${id}.wav`;
      await audiosBucket.put(audioKey, bytes, {
        httpMetadata: {
          contentType: fileType,
        },
      });

      const audioUrl = `https://pub-5e55bce7f108440f8bc08456a420cbdf.r2.dev/${audioKey}`;

      await ctx.db?.prepare(`
        INSERT INTO audios (id, title, url, status, text, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        title,
        audioUrl,
        status,
        text || "",
        createdAt || new Date().toISOString(),
        updatedAt || new Date().toISOString()
      ).run();

      return { success: true, audioUrl };
    }),
})

export type audioRouter = typeof audioRouter;