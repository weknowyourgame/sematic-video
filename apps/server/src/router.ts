import { initTRPC } from '@trpc/server';
import type { Context } from './context';
import { updateSchema } from './schemas';
import { videoRouter } from './routes/videoRoutes';
import { audioRouter } from './routes/audioRoutes';
import { whisperRouter } from './routes/whisperRoutes';
import { visionRouter } from './routes/visionRoutes';
import { vectorRouter } from './routes/vectorRoutes';

const t = initTRPC.context<Context>().create();

const publicProcedure = t.procedure;
const router = t.router;
export const createCallerFactory = t.createCallerFactory;

export const appRouter = router({
  update: publicProcedure.input(updateSchema).mutation(() => {
  }),
  get: publicProcedure.query(() => {
    return {
        id: 4,
        status: 'active'
      }
  }),
  video: videoRouter,
  audio: audioRouter,
  whisper: whisperRouter,
  vision: visionRouter,
  vector: vectorRouter,
  });

export const createCaller = createCallerFactory(appRouter);
export type AppRouter = typeof appRouter;
