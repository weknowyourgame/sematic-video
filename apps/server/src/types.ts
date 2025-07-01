import type { Ai, D1Database, R2Bucket, Queue } from '@cloudflare/workers-types';

export const status = ['active'] as const;
export interface Env {
  DB: D1Database;
  AI: Ai;
  videos: R2Bucket;
  audios: R2Bucket;
  frames: R2Bucket;
  video_segment_queue: Queue;
}
export interface Message<T = any> {
  id: string;
  timestamp: Date;
  body: T;
  ack(): void;
  retry(): void;
}

export interface MessageBatch<T = any> {
  messages: Message<T>[];
} 