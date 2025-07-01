import { z } from 'zod';
import { status } from './types';

export const updateSchema = z.object({
  id: z.number(),
  status: z.enum(status),
});

export const videoSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  status: z.enum(["idle", "processing", "failed", "active"]), // <- idle, processing, failed, active
  text: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const convertAudioSchema = z.object({
  ...videoSchema.shape,
  audioId: z.string(),
  audioUrl: z.string().url(),
});
