import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Forward the request to the server
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8787';
    const response = await fetch(`${serverUrl}/trpc/segment.getSegmentationStatus?input=${encodeURIComponent(JSON.stringify({ videoId }))}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result.result?.data || result);

  } catch (error) {
    console.error('Get processing status error:', error);
    return NextResponse.json(
      { error: 'Failed to get processing status' },
      { status: 500 }
    );
  }
} 