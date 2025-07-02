"use client";

import { useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Upload, Play, Loader2 } from "lucide-react";
import { useSession } from "~/lib/auth-client";

interface VideoUploadProps {
  onVideoUploaded: (videoId: string) => void;
  onProcessingStarted: (videoId: string) => void;
}

export default function VideoUpload({ onVideoUploaded, onProcessingStarted }: VideoUploadProps) {
  const { data: session } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
    } else {
      alert('Please select a valid video file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !session?.user) {
      alert('Please select a file and sign in to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(selectedFile);
      
      // Generate video ID
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      // Prepare video data
      const videoData = {
        id,
        title: selectedFile.name,
        status: "idle" as const,
        duration: 0, // Will be updated after upload
        text: "",
        createdAt: now,
        updatedAt: now,
        fileData: base64,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
      };

      // Upload to server
      const response = await fetch('/api/upload-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoData),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setVideoId(id);
      onVideoUploaded(id);
      setUploadProgress(100);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartProcessing = async () => {
    if (!videoId) return;

    setIsProcessing(true);

    try {
      const response = await fetch('/api/start-processing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          segmentDuration: 5, // 5 seconds per segment
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start processing');
      }

      onProcessingStarted(videoId);

    } catch (error) {
      console.error('Processing error:', error);
      alert('Failed to start processing. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-card rounded-lg border">
      <h2 className="text-2xl font-bold mb-6">Upload & Process Video</h2>
      
      {!session?.user && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">Please sign in to upload and process videos.</p>
        </div>
      )}

      <div className="space-y-4">
        {/* File Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Select Video File</label>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isProcessing}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
            {selectedFile && (
              <span className="text-sm text-muted-foreground">
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Uploading... {uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !session?.user || isUploading || isProcessing}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </>
          )}
        </Button>

        {/* Processing Button */}
        {videoId && !isUploading && (
          <Button
            onClick={handleStartProcessing}
            disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting Processing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Processing
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
} 