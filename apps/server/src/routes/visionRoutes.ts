import { initTRPC } from "@trpc/server";
import { Context } from "../context";
import { z } from "zod";
import { framesSchema } from "../schemas";

const t = initTRPC.context<Context>().create();

export const visionRouter = t.router({
  // get the description of the frame
  getFrameDescription: t.procedure
  .input(framesSchema)
  .query(async ({ ctx, input }) => {
    const { id, frameUrl } = input;

    const frame = await ctx.r2.bucket("sematic-frames").get(frameUrl);
    const blob = await frame.arrayBuffer();

    const imageInput = {
      image: [...new Uint8Array(blob)],
      prompt: "Generate a description of the image",
      max_tokens: 512,
    };
    const response = await ctx.ai.run(
      "@cf/llava-hf/llava-1.5-7b-hf",
      imageInput
      );
    console.log(response);
    // update the frame description in the database
    await ctx.db?.prepare(
      'UPDATE frames SET visualDescription = ?, updatedAt = ? WHERE id = ?'
    ).bind(response.text, new Date().toISOString(), id).run();
    
    return {
      success: true,
      description: response.text,
    };
  }),
});


export type VisionRouter = typeof visionRouter;
