"use client";

import { useState } from "react";
import VideoUpload from "~/components/video-upload";
import VideoProcessing from "~/components/video-processing";

export default function VideoDashboard() {
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVideoUploaded = (videoId: string) => {
    setCurrentVideoId(videoId);
  };

  const handleProcessingStarted = (videoId: string) => {
    setIsProcessing(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Video Processing Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Upload your video and start processing to extract frames and analyze content
        </p>
      </div>

      <div className="grid gap-8">
        {/* Upload Section */}
        <VideoUpload
          onVideoUploaded={handleVideoUploaded}
          onProcessingStarted={handleProcessingStarted}
        />

        {/* Processing Status Section */}
        {currentVideoId && (
          <VideoProcessing videoId={currentVideoId} />
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">How it works:</h3>
        <ol className="list-decimal list-inside space-y-1 text-blue-800">
          <li>Upload a video file (MP4, MOV, AVI, etc.)</li>
          <li>Click "Start Processing" to begin segmentation</li>
          <li>Watch real-time progress as frames are extracted</li>
          <li>View and download processed results when complete</li>
        </ol>
      </div>
    </div>
  );
} 