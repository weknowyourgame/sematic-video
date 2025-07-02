"use client";

import { useState, useEffect } from "react";
import VideoUpload from "~/components/video-upload";
import VideoProcessing from "~/components/video-processing";
import { Chat } from "~/components/custom/chat";

export default function VideoDashboard() {
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingDone, setProcessingDone] = useState(false);

  const handleVideoUploaded = (videoId: string) => {
    setCurrentVideoId(videoId);
    setProcessingDone(false);
  };

  const handleProcessingStarted = (videoId: string) => {
    setIsProcessing(true);
    setProcessingDone(false);
  };

  // Demo: mark processing as done after 5 seconds
  useEffect(() => {
    if (isProcessing && currentVideoId) {
      const timer = setTimeout(() => setProcessingDone(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isProcessing, currentVideoId]);

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

      {/* Show chat after processing is done */}
      {currentVideoId && processingDone && (
        <Chat id={currentVideoId} />
      )}

      {/* Instructions */}
      <div className="bg-neutral-900 border border-white rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-2">How it works:</h3>
        <ol className="list-decimal list-inside space-y-1 text-white">
          <li>Upload a video file (MP4, MOV, AVI, etc.)</li>
          <li>Click "Start Processing" to begin processing</li>
          <li>Watch real-time progress as frames are extracted</li>
          <li>View and download processed results when complete</li>
        </ol>
      </div>
    </div>
  );
} 