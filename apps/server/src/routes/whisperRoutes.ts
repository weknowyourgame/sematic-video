import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "../context";
import { convertAudioSchema, videoSchema } from "../schemas";
import { z } from "zod";

const t = initTRPC.context<Context>().create();

export const whisperRouter = t.router({
    convertAudioToText: t.procedure
    .input(convertAudioSchema)
    .mutation(async ({ ctx, input }) => {
        const { audioId, id: videoId, title, url, createdAt, updatedAt, text } = input;
        const { ai } = ctx;
    try {
        const audiosBucket = ctx.audios;
        const audioKey = `${audioId}.wav`;
        const audioObject = await audiosBucket.get(audioKey);

        let audioInput;
        
        if (!audioObject) {
          console.error(`Audio file not found in R2: ${audioKey}`);
        } else {
          console.log(`Found audio file in R2: ${audioKey}`);
          const audioBuffer = await audioObject.arrayBuffer();
          audioInput = {
            audio: [...new Uint8Array(audioBuffer)],
          };
        }

        console.log('Running Whisper AI model...');
        const response = await ctx.ai?.run(
          "@cf/openai/whisper",
          audioInput
        );
    
        const transcriptText = response?.text || '';
        console.log(`Transcript generated: "${transcriptText.substring(0, 100)}..."`);

        // Store transcript text file in R2
        const transcriptKey = `${audioId}.txt`;
        await audiosBucket.put(transcriptKey, transcriptText);

        // Update audios table
        await ctx.db?.prepare(`
          UPDATE audios SET text = ?, status = ?, updatedAt = ? WHERE id = ?
        `).bind(
          transcriptText,
          'active',
          new Date().toISOString(),
          audioId
        ).run();

        await ctx.db?.prepare(`
          UPDATE videos SET text = ?, updatedAt = ? WHERE id = ?
        `).bind(
          transcriptText,
          new Date().toISOString(),
          videoId
        ).run();

        console.log(`Audio to text conversion completed for video ${videoId}`);
        return { success: true, text: transcriptText };
        } catch (error) {
            console.error('Whisper conversion error:', error);
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to convert audio to text" });
        }
    }),
});

export type whisperRouter = typeof whisperRouter;