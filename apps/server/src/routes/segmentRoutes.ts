import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "../context";
import { segmentVideoSchema, segmentJobSchema } from "../schemas";
import { z } from "zod";

const t = initTRPC.context<Context>().create();

export const segmentRouter = t.router({
  segmentVideo: t.procedure
    .input(segmentVideoSchema)
    .mutation(async ({ ctx, input }) => {
      const { videoId, segmentDuration } = input;

      try {
        // get video info from database
        const video = await ctx.db?.prepare(
          'SELECT * FROM videos WHERE id = ?'
        ).bind(videoId).first();

        if (!video) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Video not found',
          });
        }

        const videosBucket = ctx.videos;
        const videoKey = `${videoId}.mp4`;
        const videoObject = await videosBucket.get(videoKey);

        if (!videoObject) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Video file not found in R2',
          });
        }

        // get video duration
        const videoDuration = await getVideoDuration(ctx, videoId);

        // calculate segments
        const totalSegments = Math.ceil(videoDuration / segmentDuration);

        // update video status to processing
        await ctx.db?.prepare(
          'UPDATE videos SET status = ?, updatedAt = ? WHERE id = ?'
        ).bind('processing', new Date().toISOString(), videoId).run();

        // queue segmentation jobs
        const queuePromises = [];
        for (let i = 0; i < totalSegments; i++) {
          const startTime = i * segmentDuration;
          const endTime = Math.min((i + 1) * segmentDuration, videoDuration);

          const segmentJob = {
            videoId,
            startTime,
            endTime,
            segmentIndex: i,
            totalSegments,
          };

          // add job to queue with delay to prevent overwhelming
          queuePromises.push(
            ctx.segmentQueue?.send(segmentJob, {
              delaySeconds: i * 2, // stagger jobs by 2 seconds
            })
          );
        }

        await Promise.all(queuePromises);

        return {
          success: true,
          videoId,
          videoDuration,
          segmentDuration,
          totalSegments,
          estimatedProcessingTime: totalSegments * 10, // Rough estimate in seconds
        };

      } catch (error) {
        console.error('Video segmentation error:', error);
        
        // update video status to failed
        await ctx.db?.prepare(
          'UPDATE videos SET status = ?, updatedAt = ? WHERE id = ?'
        ).bind('failed', new Date().toISOString(), videoId).run();

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to start video segmentation',
        });
      }
    }),

  getSegmentationStatus: t.procedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { videoId } = input;

      try {
        // get video status
        const video = await ctx.db?.prepare(
          'SELECT status FROM videos WHERE id = ?'
        ).bind(videoId).first();

        if (!video) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Video not found',
          });
        }

        // get frame count
        const frameCount = await ctx.db?.prepare(
          'SELECT COUNT(*) as count FROM frames WHERE videoId = ?'
        ).bind(videoId).first();

        // get latest frames
        const latestFrames = await ctx.db?.prepare(
          'SELECT id, startTime, endTime, frameUrl FROM frames WHERE videoId = ? ORDER BY startTime DESC LIMIT 5'
        ).bind(videoId).all();

        return {
          videoId,
          status: video.status,
          processedFrames: frameCount?.count || 0,
          latestFrames: latestFrames?.results || [],
        };

      } catch (error) {
        console.error('Error getting segmentation status:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get segmentation status',
        });
      }
    }),

  getVideoFrames: t.procedure
    .input(z.object({ 
      videoId: z.string(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { videoId, limit, offset } = input;

      try {
        const frames = await ctx.db?.prepare(
          'SELECT * FROM frames WHERE videoId = ? ORDER BY startTime ASC LIMIT ? OFFSET ?'
        ).bind(videoId, limit, offset).all();

        const totalCount = await ctx.db?.prepare(
          'SELECT COUNT(*) as count FROM frames WHERE videoId = ?'
        ).bind(videoId).first();

        return {
          frames: frames?.results || [],
          total: totalCount?.count || 0,
          limit,
          offset,
          hasMore: (totalCount?.count || 0) > offset + limit,
        };

      } catch (error) {
        console.error('Error fetching video frames:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch video frames',
        });
      }
    }),
});

export async function processSegmentJob(ctx: Context, job: any) {
  const { videoId, startTime, endTime, segmentIndex, totalSegments } = job;

  try {
    console.log(`Processing segment ${segmentIndex + 1}/${totalSegments} for video ${videoId}`);

    // generate frame ID
    const frameId = `${videoId}_segment_${segmentIndex}_${Date.now()}`;

    // get video from R2 bucket
    const videosBucket = ctx.videos;
    const videoKey = `${videoId}.mp4`;
    const videoObject = await videosBucket.get(videoKey);

    if (!videoObject) {
      throw new Error(`Video file not found in R2: ${videoKey}`);
    }

    // extract frame using FFmpeg API
    const ffmpegServerUrl = process.env.FFMPEG_API_URL || 'https://sematic-video-884913204584.europe-west1.run.app';
    const ffmpegEndpoint = `${ffmpegServerUrl}/video/extract/segment-frame`;
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', new Blob([await videoObject.arrayBuffer()]), `${videoId}.mp4`);
    formData.append('videoId', videoId);
    formData.append('frameId', frameId);
    formData.append('startTime', startTime.toString());
    formData.append('endTime', endTime.toString());

    const response = await fetch(ffmpegEndpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`FFmpeg API failed: ${response.statusText}`);
    }

    const { frameBase64 } = await response.json();

    // upload frame to R2
    const framesBucket = ctx.frames;
    const frameKey = `${videoId}/${frameId}.jpg`;
    const frameBuffer = Buffer.from(frameBase64, 'base64');

    await framesBucket.put(frameKey, frameBuffer, {
      httpMetadata: {
        contentType: 'image/jpeg',
      },
    });

    const frameUrl = `https://${framesBucket.accountId}.r2.cloudflarestorage.com/${framesBucket.name}/${frameKey}`;

    // store frame in database
    await ctx.db?.prepare(`
      INSERT INTO frames (
        id, 
        videoId, 
        startTime, 
        endTime, 
        transcript, 
        visualDescription, 
        embedding, 
        frameUrl, 
        createdAt, 
        updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      frameId,
      videoId,
      startTime,
      endTime,
      '', // Empty transcript - will be filled later
      '', // Empty visual description - will be filled later
      JSON.stringify([]), // Empty embedding - will be filled later
      frameUrl,
      new Date().toISOString(),
      new Date().toISOString()
    ).run();

    // check if this is the last segment
    const processedFrames = await ctx.db?.prepare(
      'SELECT COUNT(*) as count FROM frames WHERE videoId = ?'
    ).bind(videoId).first();

    if (processedFrames?.count >= totalSegments) {
      // all segments processed, update video status
      await ctx.db?.prepare(
        'UPDATE videos SET status = ?, updatedAt = ? WHERE id = ?'
      ).bind('active', new Date().toISOString(), videoId).run();

      console.log(`Video ${videoId} segmentation completed. Total frames: ${processedFrames.count}`);
    }

    console.log(`Successfully processed segment ${segmentIndex + 1}/${totalSegments} for video ${videoId}`);

  } catch (error) {
    console.error(`Failed to process segment job:`, error);
    
    // update video status to failed if this was the last attempt
    await ctx.db?.prepare(
      'UPDATE videos SET status = ?, updatedAt = ? WHERE id = ?'
    ).bind('failed', new Date().toISOString(), videoId).run();

    throw error;
  }
}

async function getVideoDuration(ctx: Context, videoId: string): Promise<number> {
  const video = await ctx.db?.prepare(
    'SELECT duration FROM videos WHERE id = ?'
  ).bind(videoId).first();

  return video?.duration || 0;
}

export type SegmentRouter = typeof segmentRouter;
