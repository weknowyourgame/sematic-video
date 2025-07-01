import type { Context as HonoContext } from 'hono';
import type { BlankInput } from 'hono/types';
import type { Env } from './types';

export async function createContext(
  c?: HonoContext<Env, '/trpc/*', BlankInput>,
) {
  return {
    c,
    db: c?.env?.DB,
    ai: c?.env?.AI,
    videos: c?.env?.videos,
    audios: c?.env?.audios,
    frames: c?.env?.frames,
    segmentQueue: c?.env?.video_segment_queue,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
