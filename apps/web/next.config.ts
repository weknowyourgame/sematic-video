import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	env: {
		NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || 'https://sematic-video-server.warpify.workers.dev',
		NEXT_PUBLIC_FFMPEG_URL: process.env.NEXT_PUBLIC_FFMPEG_URL || 'https://sematic-video-884913204584.europe-west1.run.app',
	},
};

export default nextConfig;
