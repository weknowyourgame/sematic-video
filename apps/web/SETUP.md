# Video Processing System Setup

This project includes a complete video processing system with upload, processing, and status tracking capabilities.

## Architecture

- **Web App** (`apps/web`): Next.js frontend with video upload and processing UI
- **Server** (`apps/server`): Cloudflare Workers backend with tRPC API
- **FFmpeg API** (`apps/ffmpeg-api`): Video processing service

## Setup Instructions

### 1. Install Dependencies

```bash
# Web app dependencies
cd apps/web
pnpm add @trpc/client @trpc/server @trpc/react-query @tanstack/react-query next-auth @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-avatar

# Server dependencies
cd ../server
pnpm install

# FFmpeg API dependencies
cd ../ffmpeg-api
npm install
```

### 2. Environment Variables

Create `.env.local` in `apps/web`:

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Server connection
NEXT_PUBLIC_SERVER_URL=http://localhost:8787
```

### 3. Start Services

```bash
# Terminal 1: Start the server
cd apps/server
pnpm dev

# Terminal 2: Start the FFmpeg API
cd apps/ffmpeg-api
npm start

# Terminal 3: Start the web app
cd apps/web
pnpm dev
```

## Features

### Video Upload
- Drag & drop or click to upload video files
- Support for MP4, MOV, AVI, and other formats
- Progress tracking during upload
- Authentication required for upload

### Video Processing
- Automatic video segmentation into 5-second frames
- Real-time processing status updates
- Frame extraction and analysis
- Progress bar with estimated completion time

### Status Tracking
- Real-time status updates (idle, processing, active, failed)
- Processed frame count
- Latest frame previews
- Error handling and retry functionality

## API Endpoints

### Web App API Routes
- `POST /api/upload-video` - Upload video to server
- `POST /api/start-processing` - Start video processing
- `GET /api/processing-status` - Get processing status

### Server tRPC Routes
- `video.uploadVideo` - Upload video to R2 storage
- `segment.segmentVideo` - Start video segmentation
- `segment.getSegmentationStatus` - Get processing status
- `segment.getVideoFrames` - Get processed frames

## Components

### Core Components
- `VideoUpload` - File selection and upload interface
- `VideoProcessing` - Real-time processing status display
- `VideoDashboard` - Main dashboard combining upload and processing

### UI Components
- `Progress` - Custom progress bar component
- `Card` - Card layout component
- `Badge` - Status badge component
- `Dialog` - Modal dialog component
- `DropdownMenu` - User menu dropdown
- `Avatar` - User avatar component

## Authentication

The system uses NextAuth.js with Google OAuth:
- Sign in required for video upload
- User session management
- Protected API routes

## Video Processing Flow

1. User uploads video file
2. Video is stored in Cloudflare R2 bucket
3. Processing job is queued
4. FFmpeg API processes video segments
5. Frames are extracted and analyzed
6. Results are stored in database
7. Real-time status updates via polling

## Development Notes

- The server runs on Cloudflare Workers with D1 database
- FFmpeg API handles video processing with fluent-ffmpeg
- Web app uses Next.js 15 with App Router
- Real-time updates via polling (consider WebSockets for production)
- File size limits should be configured based on requirements 