"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  Eye,
  Download
} from "lucide-react";

interface VideoProcessingProps {
  videoId: string;
}

interface ProcessingStatus {
  videoId: string;
  status: "idle" | "processing" | "failed" | "active";
  processedFrames: number;
  latestFrames: Array<{
    id: string;
    startTime: number;
    endTime: number;
    frameUrl: string;
  }>;
}

export default function VideoProcessing({ videoId }: VideoProcessingProps) {
  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/processing-status?videoId=${videoId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }
        const data = await response.json();
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch status');
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchStatus();

    // Poll for updates every 5 seconds if processing
    const interval = setInterval(() => {
      if (status?.status === "processing") {
        fetchStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [videoId, status?.status]);

  const getStatusIcon = () => {
    switch (status?.status) {
      case "processing":
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "idle":
        return <Clock className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status?.status) {
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "idle":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressPercentage = () => {
    // This is a rough estimate - you might want to calculate this based on actual video duration
    if (!status) return 0;
    
    // Assuming each frame represents 5 seconds of video
    const estimatedTotalFrames = 100; // This should come from video metadata
    return Math.min((status.processedFrames / estimatedTotalFrames) * 100, 100);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-600">
            <XCircle className="w-6 h-6 mr-2" />
            <span>Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Video Processing Status
          <Badge className={getStatusColor()}>
            {status?.status?.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing Progress</span>
            <span>{status?.processedFrames || 0} frames processed</span>
          </div>
          <Progress value={getProgressPercentage()} className="w-full" />
        </div>

        {/* Status Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Video ID:</span>
            <p className="text-muted-foreground font-mono text-xs">{videoId}</p>
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <p className="text-muted-foreground">{status?.status}</p>
          </div>
        </div>

        {/* Latest Frames */}
        {status?.latestFrames && status.latestFrames.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Latest Processed Frames</h4>
            <div className="grid grid-cols-2 gap-2">
              {status.latestFrames.slice(0, 4).map((frame) => (
                <div key={frame.id} className="relative group">
                  <img
                    src={frame.frameUrl}
                    alt={`Frame ${frame.startTime}s`}
                    className="w-full h-20 object-cover rounded border"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button size="sm" variant="secondary">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                    {frame.startTime}s - {frame.endTime}s
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          {status?.status === "active" && (
            <>
              <Button size="sm" variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View Results
              </Button>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </>
          )}
          {status?.status === "failed" && (
            <Button size="sm" variant="outline">
              <Play className="w-4 h-4 mr-2" />
              Retry Processing
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 