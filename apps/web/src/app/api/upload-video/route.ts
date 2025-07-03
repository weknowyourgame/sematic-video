import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const videoId = formData.get('videoId') as string;
    const title = formData.get('title') as string || file.name;

    console.log(`Processing video upload: ${videoId}, title: ${title}`);

    const ffmpegServerUrl = process.env.NEXT_PUBLIC_FFMPEG_URL || 'https://sematic-video-884913204584.europe-west1.run.app';
    
    const probeFormData = new FormData();
    probeFormData.append('file', file);

    console.log('Probing video metadata...');
    const probeResponse = await fetch(`${ffmpegServerUrl}/probe`, {
      method: 'POST',
      body: probeFormData,
    });

    if (!probeResponse.ok) {
      const probeError = await probeResponse.text();
      console.error('Probe failed:', probeError);
      throw new Error(`Failed to probe video: ${probeResponse.status} ${probeError}`);
    }

    const metadata = await probeResponse.json();
    
    // Extract duration from metadata
    let duration = 0;
    if (metadata && metadata.format && metadata.format.duration) {
      duration = parseFloat(metadata.format.duration);
    }
    
    console.log(`Video duration: ${duration} seconds`);

    // Step 2: Convert file to base64 for server upload
    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');

    // Step 3: Upload video to R2 via server
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://sematic-video-server.warpify.workers.dev';
    
    const uploadData = {
      id: videoId,
      title: title,
      status: 'idle' as const,
      duration: duration,
      text: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fileData: base64Data,
      fileName: file.name,
      fileType: file.type || 'video/mp4',
    };

    console.log('Uploading to server...');
    console.log('Upload data:', { id: uploadData.id, title: uploadData.title, duration: uploadData.duration });
    
    const uploadResponse = await fetch(`${serverUrl}/trpc/video.uploadVideo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploadData),
    });

    if (!uploadResponse.ok) {
      const uploadError = await uploadResponse.text();
      console.error('Upload failed:', uploadError);
      throw new Error(`Server upload failed: ${uploadResponse.status} ${uploadError}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log('Upload successful:', uploadResult);

    return NextResponse.json({
      success: true,
      videoId: videoId,
      duration: duration,
      title: title,
      message: 'Video uploaded successfully',
      result: uploadResult
    });

  } catch (error) {
    console.error('Upload video error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload video' },
      { status: 500 }
    );
  }
}