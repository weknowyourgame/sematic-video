import type { Ai, D1Database, R2Bucket } from '@cloudflare/workers-types';

export const status = ['active'] as const;
export interface Env {
  DB: D1Database;
  AI: Ai;
  R2: R2Bucket;
}