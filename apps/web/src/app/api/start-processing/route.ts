import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { videoId, segmentDuration } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: 'videoId is required' },
        { status: 400 }
      );
    }

    console.log(`Starting video processing: videoId=${videoId}, segmentDuration=${segmentDuration || 5}`);

    // Forward the request to the main server (not ffmpeg server)
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://sematic-video-server.warpify.workers.dev';
    
    const segmentData = {
      videoId,
      segmentDuration: segmentDuration || 5, // Default 5 seconds
    };

    console.log('Sending segmentation request to server...');
    const response = await fetch(`${serverUrl}/trpc/segment.segmentVideo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(segmentData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Segmentation failed:', errorText);
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Segmentation started successfully:', result);

    return NextResponse.json({
      success: true,
      message: 'Video processing started successfully',
      ...result
    });

  } catch (error) {
    console.error('Start processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start processing' },
      { status: 500 }
    );
  }
} 