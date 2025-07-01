import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "../context";
import { convertAudioSchema, videoSchema } from "../schemas";
import { z } from "zod";

const t = initTRPC.context<Context>().create();

export const whisperRouter = t.router({
    convertAudioToText: t.procedure
    .input(convertAudioSchema)
    .mutation(async ({ ctx, input }) => {
        const { audioId, title, url, createdAt, updatedAt, text } = input;
        const { ai } = ctx;
    try {
        const res = await fetch(
            "https://github.com/Azure-Samples/cognitive-services-speech-sdk/raw/master/samples/cpp/windows/console/samples/enrollment_audio_katie.wav"
          );

          const blob = await res.arrayBuffer();

          const audioInput = {
            audio: [...new Uint8Array(blob)],
          };
          const response = await ctx.ai.run(
            "@cf/openai/whisper",
            audioInput
          );
      
          const text = response.text;

          // upload to r2 bucket
          const bucket = ctx.r2.bucket("sematic-audios");
          const key = `${audioId}.txt`;
          await bucket.put(key, text);
          const url = `https://${ctx.r2.accountId}.r2.cloudflarestorage.com/${bucket.name}/${key}`;
          console.log(url);
          await ctx.db?.prepare(`
            UPDATE audios SET text = ?, status = ?, updatedAt = ?, url = ? WHERE id = ?
          `).bind(
            text,
            'active',
            new Date().toISOString(),
            url,
            audioId
          ).run();
          return { success: true, text };
        } catch (error) {
            console.error(error);
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to convert audio to text" });
        }
    }),
});

export type whisperRouter = typeof whisperRouter;