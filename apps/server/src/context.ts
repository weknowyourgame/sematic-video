import type { Context as HonoContext } from 'hono';
import { setCookie } from 'hono/cookie';
import type { BlankInput } from 'hono/types';
import type { Env } from './types';

export async function createContext(
  c?: HonoContext<Env, '/trpc/*', BlankInput>,
) {
  return {
    c,
    db: c?.env?.DB,
    ai: c?.env?.AI,
    r2: c?.env?.R2,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
