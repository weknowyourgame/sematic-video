import type { D1Database } from '@cloudflare/workers-types';

export const status = ['active'] as const;
export interface Env {
  DB: D1Database;
}