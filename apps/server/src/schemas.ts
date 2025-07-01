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
  duration: z.number(),
  text: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const convertAudioSchema = z.object({
  ...videoSchema.shape,
  audioId: z.string(),
  audioUrl: z.string().url(),
});

export const framesSchema = z.object({
  id: z.string(),
  // combined embedding of the frame including the audio and visual
  embedding: z.array(z.number()),
  startTime: z.number(),
  endTime: z.number(),
  transcript: z.string(),
  visualDescription: z.string(),
  frameUrl: z.string().url(),
  videoId: z.string(),
});

export const segmentVideoSchema = z.object({
  videoId: z.string(),
  segmentDuration: z.number().min(1).max(60).default(5), // Default 5 seconds, max 60
});

export const segmentJobSchema = z.object({
  videoId: z.string(),
  startTime: z.number(),
  endTime: z.number(),
  segmentIndex: z.number(),
  totalSegments: z.number(),
});