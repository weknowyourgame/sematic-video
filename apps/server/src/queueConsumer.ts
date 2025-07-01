import { createContext } from './context';
import { processSegmentJob } from './routes/segmentRoutes';
import type { Env, MessageBatch, Message } from './types';

export default {
  async queue(batch: MessageBatch<any>, env: Env): Promise<void> {
    // create context for database and R2 operations
    const ctx = await createContext();
    // override with actual environment bindings
    ctx.db = env.DB;
    ctx.ai = env.AI;
    ctx.r2 = env.R2;
    ctx.segmentQueue = env.video_segment_queue;

    for (const message of batch.messages) {
      try {
        console.log('Processing segment job:', message.body);
        
        // Process the segment job
        await processSegmentJob(ctx, message.body);
        
        // Acknowledge successful processing
        message.ack();
        
      } catch (error) {
        console.error('Failed to process segment job:', error);
        
        // Retry the message (Cloudflare will handle retry logic)
        message.retry();
      }
    }
  },
};
