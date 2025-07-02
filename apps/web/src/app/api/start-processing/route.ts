import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { videoId, segmentDuration } = await request.json();

    // Forward the request to the server
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8787';
    const response = await fetch(`${serverUrl}/trpc/segment.segmentVideo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: {
          videoId,
          segmentDuration,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Start processing error:', error);
    return NextResponse.json(
      { error: 'Failed to start processing' },
      { status: 500 }
    );
  }
} 