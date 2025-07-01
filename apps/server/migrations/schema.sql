-- =====================================================
-- SEMATIC VIDEO PROCESSING SYSTEM - DATABASE SCHEMA
-- =====================================================

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- =====================================================
-- VIDEOS TABLE
-- =====================================================
CREATE TABLE videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,                    -- Final R2 URL after upload
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'processing', 'failed', 'active')),
  duration REAL DEFAULT 0,              -- Video duration in seconds (can be NULL initially)
  text TEXT DEFAULT '',                 -- Video description or metadata
  createdAt TEXT NOT NULL,             -- ISO datetime string
  updatedAt TEXT NOT NULL              -- ISO datetime string
);

-- =====================================================
-- AUDIOS TABLE
-- =====================================================
CREATE TABLE audios (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,                    -- Audio file URL in R2
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'active', 'failed')),
  text TEXT DEFAULT '',                 -- Transcribed text from audio
  createdAt TEXT NOT NULL,             -- ISO datetime string
  updatedAt TEXT NOT NULL              -- ISO datetime string
);

-- =====================================================
-- FRAMES TABLE
-- =====================================================
CREATE TABLE frames (
  id TEXT PRIMARY KEY,
  videoId TEXT NOT NULL,
  startTime REAL NOT NULL,              -- Start time in seconds
  endTime REAL NOT NULL,                -- End time in seconds
  transcript TEXT DEFAULT '',           -- Audio transcript for this time segment
  visualDescription TEXT DEFAULT '',    -- Visual description of the frame
  embedding TEXT DEFAULT '[]',          -- JSON string of embedding vector
  frameUrl TEXT NOT NULL,               -- URL to the frame image in R2
  createdAt TEXT NOT NULL,              -- ISO datetime string
  updatedAt TEXT NOT NULL,              -- ISO datetime string
  
  -- Foreign key constraints
  FOREIGN KEY (videoId) REFERENCES videos(id) ON DELETE CASCADE
);

-- =====================================================
-- SEGMENTATION JOBS TABLE (Optional - for tracking)
-- =====================================================
CREATE TABLE segmentation_jobs (
  id TEXT PRIMARY KEY,
  videoId TEXT NOT NULL,
  segmentIndex INTEGER NOT NULL,
  totalSegments INTEGER NOT NULL,
  startTime REAL NOT NULL,              -- Segment start time
  endTime REAL NOT NULL,                -- Segment end time
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error TEXT DEFAULT NULL,              -- Error message if failed
  createdAt TEXT NOT NULL,              -- ISO datetime string
  updatedAt TEXT NOT NULL,              -- ISO datetime string
  
  -- Foreign key constraints
  FOREIGN KEY (videoId) REFERENCES videos(id) ON DELETE CASCADE,
  
  -- Unique constraint to prevent duplicate segments
  UNIQUE(videoId, segmentIndex)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Videos table indexes
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_createdAt ON videos(createdAt);
CREATE INDEX idx_videos_duration ON videos(duration);

-- Audios table indexes
CREATE INDEX idx_audios_status ON audios(status);
CREATE INDEX idx_audios_createdAt ON audios(createdAt);

-- Frames table indexes
CREATE INDEX idx_frames_videoId ON frames(videoId);
CREATE INDEX idx_frames_startTime ON frames(startTime);
CREATE INDEX idx_frames_videoId_startTime ON frames(videoId, startTime);
CREATE INDEX idx_frames_createdAt ON frames(createdAt);

-- Segmentation jobs table indexes
CREATE INDEX idx_segmentation_jobs_videoId ON segmentation_jobs(videoId);
CREATE INDEX idx_segmentation_jobs_status ON segmentation_jobs(status);
CREATE INDEX idx_segmentation_jobs_videoId_segmentIndex ON segmentation_jobs(videoId, segmentIndex);

-- =====================================================
-- SAMPLE DATA INSERTIONS
-- =====================================================

-- Sample video (matches videoRoutes.ts uploadVideo query)
-- INSERT INTO videos (
--   id, title, url, status, createdAt, updatedAt
-- ) VALUES (
--   'video-123',
--   'Sample Video',
--   'https://account.r2.cloudflarestorage.com/sematic-videos/video-123.mp4',
--   'active',
--   '2024-01-01T12:00:00.000Z',
--   '2024-01-01T12:00:00.000Z'
-- );

-- Sample audio (matches audioRoutes.ts convertVidToAudio query)
-- INSERT INTO audios (
--   id, title, url, status, createdAt, updatedAt
-- ) VALUES (
--   'audio-456',
--   'Sample Audio',
--   'https://account.r2.cloudflarestorage.com/sematic-audios/audio-456.mp3',
--   'processing',
--   '2024-01-01T12:00:00.000Z',
--   '2024-01-01T12:00:00.000Z'
-- );

-- Sample frame (matches segmentRoutes.ts processSegmentJob query)
-- INSERT INTO frames (
--   id, videoId, startTime, endTime, transcript, visualDescription, 
--   embedding, frameUrl, createdAt, updatedAt
-- ) VALUES (
--   'frame-789',
--   'video-123',
--   10.5,
--   12.0,
--   'Hello world, this is a sample transcript',
--   'A person speaking in front of a camera with a blue background',
--   '[0.1, 0.2, 0.3, 0.4, 0.5]',
--   'https://account.r2.cloudflarestorage.com/sematic-frames/video-123/frame-789.jpg',
--   '2024-01-01T12:00:00.000Z',
--   '2024-01-01T12:00:00.000Z'
-- );

-- =====================================================
-- USEFUL QUERIES
-- =====================================================

-- Get all videos with their frame counts
-- SELECT 
--   v.id, 
--   v.title, 
--   v.status, 
--   v.duration,
--   COUNT(f.id) as frame_count
-- FROM videos v
-- LEFT JOIN frames f ON v.id = f.videoId
-- GROUP BY v.id;

-- Get processing status for a video (matches getSegmentationStatus query)
-- SELECT 
--   v.status as video_status,
--   COUNT(f.id) as processed_frames,
--   COUNT(sj.id) as total_segments,
--   COUNT(CASE WHEN sj.status = 'completed' THEN 1 END) as completed_segments
-- FROM videos v
-- LEFT JOIN frames f ON v.id = f.videoId
-- LEFT JOIN segmentation_jobs sj ON v.id = sj.videoId
-- WHERE v.id = 'video-123'
-- GROUP BY v.id;

-- Get frames for a video with pagination (matches getVideoFrames query)
-- SELECT * FROM frames 
-- WHERE videoId = 'video-123' 
-- ORDER BY startTime ASC 
-- LIMIT 20 OFFSET 0;

-- =====================================================
-- CRITICAL FIXES APPLIED
-- =====================================================

-- 1. Fixed video upload query: Missing duration field in INSERT
--    videoRoutes.ts: INSERT INTO videos (id, title, url, status, createdAt, updatedAt)
--    Schema: Made duration nullable with DEFAULT 0

-- 2. Fixed audio insert query: Wrong field order
--    audioRoutes.ts: INSERT INTO audios (id, title, url, status, createdAt, updatedAt)
--    Schema: Matches exact field order

-- 3. Fixed frame insert query: All fields match processSegmentJob
--    segmentRoutes.ts: INSERT INTO frames (id, videoId, startTime, endTime, transcript, visualDescription, embedding, frameUrl, createdAt, updatedAt)
--    Schema: Matches exact field order and types

-- 4. Fixed duration query: getVideoDuration function
--    segmentRoutes.ts: SELECT duration FROM videos WHERE id = ?
--    Schema: duration field exists and is queryable

-- =====================================================
-- MIGRATION NOTES
-- =====================================================

-- This schema supports:
-- 1. Video upload and metadata storage (videoRoutes.ts)
-- 2. Audio extraction and transcription (audioRoutes.ts, whisperRoutes.ts)
-- 3. Frame segmentation with timestamps (segmentRoutes.ts)
-- 4. Visual description generation (visionRoutes.ts)
-- 5. Embedding vector storage for semantic search (vectorRoutes.ts)
-- 6. Queue-based job tracking (optional)
-- 7. Comprehensive indexing for performance
-- 8. Foreign key constraints for data integrity

-- To apply this schema:
-- 1. Run this SQL file against your D1 database
-- 2. Ensure all indexes are created for performance
-- 3. Test with sample data before production use
