#####################################################################
#
# A Docker image to convert audio and video for web using web API
#
#   with
#     - FFMPEG (built)
#     - NodeJS
#     - fluent-ffmpeg
#
#   For more on Fluent-FFMPEG, see 
#
#            https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
#
# Original image and FFMPEG API by Paul Visco
# https://github.com/surebert/docker-ffmpeg-service
#
#####################################################################

FROM jrottenberg/ffmpeg:4.4-alpine

# Install Node.js
RUN apk add --no-cache nodejs npm

# Create user and change workdir
RUN adduser --disabled-password --home /home/ffmpegapi ffmpegapi
WORKDIR /home/ffmpegapi

# Copy package.json first for better caching
COPY src/package.json ./
RUN npm install --production

# Copy application source code
COPY src/ ./

# Create tmp directory for ffmpeg processing
RUN mkdir -p /tmp && chmod 777 /tmp

# Change ownership of the app directory
RUN chown -R ffmpegapi:ffmpegapi /home/ffmpegapi

# Expose port
EXPOSE 8080

# Change user
USER ffmpegapi

# Set environment variables
ENV NODE_ENV=production
ENV FILE_SIZE_LIMIT_BYTES=536870912
ENV EXTERNAL_PORT=8080

# Start the application
CMD ["node", "app.js"]

