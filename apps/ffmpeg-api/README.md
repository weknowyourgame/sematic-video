= FFMPEG API

A web service for converting audio/video/image files using FFMPEG.

Based on:

* https://github.com/surebert/docker-ffmpeg-service
* https://github.com/jrottenberg/ffmpeg 
* https://github.com/fluent-ffmpeg/node-fluent-ffmpeg

FFMPEG API is provided as Docker image for easy consumption.

== Endpoints

* `GET /` - API Readme.
* `GET /endpoints` - Service endpoints as JSON.
* `POST /convert/audio/to/mp3` - Convert audio file in request body to mp3. Returns mp3-file.
* `POST /convert/audio/to/wav` - Convert audio file in request body to wav. Returns wav-file.
* `POST /convert/video/to/mp4` - Convert video file in request body to mp4. Returns mp4-file.
* `POST /convert/image/to/jpg` - Convert image file to jpg. Returns jpg-file.
* `POST /video/extract/audio` - Extract audio track from POSTed video file. Returns audio track as 1-channel wav-file.
** Query param: `mono=no` - Returns audio track, all channels.
* `POST /video/extract/images` - Extract images from POSTed video file as PNG. Default FPS is 1. Returns JSON that includes download links to extracted images.
** Query param: `compress=zip|gzip` - Returns extracted images as _zip_ or _tar.gz_ (gzip).
** Query param: `fps=2` - Extract images using specified FPS. 
* `GET /video/extract/download/:filename` - Downloads extracted image file and deletes it from server.
** Query param: `delete=no` - does not delete file.
* `POST /probe` - Probe media file, return JSON metadata.
