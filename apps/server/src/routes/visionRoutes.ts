import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "../context";
import { z } from "zod";
import { framesSchema } from "../schemas";

const t = initTRPC.context<Context>().create();

export const visionRouter = t.router({
  getFrameDescription: t.procedure
    .input(z.object({
      id: z.string(),
      frameUrl: z.string().url(),
    }))
    .query(async ({ ctx, input }) => {
      const { id, frameUrl } = input;
      
      try {
        // Fetch the image data from the R2 URL
        const imageResponse = await fetch(frameUrl);
        
        if (!imageResponse.ok) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Failed to fetch image from R2 URL: ${frameUrl} (Status: ${imageResponse.status})`,
          });
        }
        
        const imageBuffer = await imageResponse.arrayBuffer();
        
        const imageInput = {
          image: Array.from(new Uint8Array(imageBuffer)),
          prompt: "Generate a description of the image",
          max_tokens: 512,
        };
        
        const response = await ctx.ai.run(
          "@cf/llava-hf/llava-1.5-7b-hf",
          imageInput
        );
        
        console.log('AI Response:', JSON.stringify(response, null, 2));
        
        let description = null;
        
        if (response) {
          description = response.description || 
                       response.text || 
                       response.content || 
                       response.response ||
                       response.output ||
                       response.result;
          
          // Some models return nested structure
          if (response.data && typeof response.data === 'string') {
            description = response.data;
          }
        }
        
        if (!description) {
          console.error('Unexpected AI response structure:', response);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `AI model returned no description. Response: ${JSON.stringify(response)}`,
          });
        }
        
        if (ctx.db) {
          await ctx.db.prepare(
            'UPDATE frames SET visualDescription = ?, updatedAt = ? WHERE id = ?'
          ).bind(description, new Date().toISOString(), id).run();
        }
        
        return {
          success: true,
          description,
        };
        
      } catch (error) {
        console.error('Vision processing error:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to process image: ${error.message}`,
        });
      }
    }),
});

export type VisionRouter = typeof visionRouter;