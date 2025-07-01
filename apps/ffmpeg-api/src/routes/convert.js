var express = require('express')
const ffmpeg = require('fluent-ffmpeg');

const constants = require('../constants.js');
const logger = require('../utils/logger.js')
const utils = require('../utils/utils.js')

var router = express.Router()


//routes for /convert
//adds conversion type and format to res.locals. to be used in final post function
router.post('/audio/to/mp3', function (req, res,next) {

    res.locals.conversion="audio";
    res.locals.format="mp3";
    return convert(req,res,next);
});

router.post('/audio/to/wav', function (req, res,next) {

    res.locals.conversion="audio";
    res.locals.format="wav";
    return convert(req,res,next);
});

router.post('/video/to/mp4', function (req, res,next) {

    res.locals.conversion="video";
    res.locals.format="mp4";
    return convert(req,res,next);
});

router.post('/image/to/jpg', function (req, res,next) {

    res.locals.conversion="image";
    res.locals.format="jpg";
    return convert(req,res,next);
});

router.post('/video/to/audio', function (req, res, next) {
    return convertVideoToAudio(req, res, next);
});

// convert audio or video or image to mp3 or mp4 or jpg
function convert(req,res,next) {
    let format = res.locals.format;
    let conversion = res.locals.conversion;
    logger.debug(`path: ${req.path}, conversion: ${conversion}, format: ${format}`);

    let ffmpegParams ={
        extension: format
    };
    if (conversion == "image")
    {
        ffmpegParams.outputOptions= ['-pix_fmt yuv422p'];
    }
    if (conversion == "audio")
    {
        if (format === "mp3")
        {
            ffmpegParams.outputOptions=['-codec:a libmp3lame' ];
        }
        if (format === "wav")
        {
            ffmpegParams.outputOptions=['-codec:a pcm_s16le' ];
        }
    }
    if (conversion == "video")
    {
        ffmpegParams.outputOptions=[
            '-codec:v libx264',
            '-profile:v high',
            '-r 15',
            '-crf 23',
            '-preset ultrafast',
            '-b:v 500k',
            '-maxrate 500k',
            '-bufsize 1000k',
            '-vf scale=-2:640',
            '-threads 8',
            '-codec:a libfdk_aac',
            '-b:a 128k',
        ];
    }

    let savedFile = res.locals.savedFile;
    let outputFile = savedFile + '-output.' + ffmpegParams.extension;
    logger.debug(`begin conversion from ${savedFile} to ${outputFile}`)

    //ffmpeg processing... converting file...
    let ffmpegConvertCommand = ffmpeg(savedFile);
    ffmpegConvertCommand
            .renice(constants.defaultFFMPEGProcessPriority)
            .outputOptions(ffmpegParams.outputOptions)
            .on('error', function(err) {
                logger.error(`${err}`);
                utils.deleteFile(savedFile);
                res.writeHead(500, {'Connection': 'close'});
                res.end(JSON.stringify({error: `${err}`}));
            })
            .on('end', function() {
                utils.deleteFile(savedFile);
                return utils.downloadFile(outputFile,null,req,res,next);
            })
            .save(outputFile);
        
}

// convert video to audio with specific handling for the server API
function convertVideoToAudio(req, res, next) {
    logger.debug('converting video to audio');
    
    let videoId = req.body.videoId || req.query.videoId;
    let audioId = req.body.audioId || req.query.audioId;
    let title = req.body.title || req.query.title || 'untitled';
    let outputFormat = req.body.format || req.query.format || 'wav';
    
    if (!videoId || !audioId) {
        return res.status(400).json({
            error: 'videoId and audioId are required'
        });
    }

    let savedFile = res.locals.savedFile;
    let outputFile = `/tmp/${audioId}.${outputFormat}`;
    
    logger.debug(`converting video ${videoId} to audio ${audioId}, output: ${outputFile}`);

    // Set FFmpeg options for audio extraction
    let audioOptions = [];
    if (outputFormat === 'wav') {
        audioOptions = [
            '-vn', // no video
            '-acodec pcm_s16le',
            '-ar 16000', // 16kHz sample rate (good for speech recognition)
            '-ac 1', // mono channel
            '-f wav'
        ];
    } else if (outputFormat === 'mp3') {
        audioOptions = [
            '-vn', // no video
            '-acodec libmp3lame',
            '-ar 16000',
            '-ac 1',
            '-b:a 64k'
        ];
    }

    //ffmpeg processing...
    var ffmpegCommand = ffmpeg(savedFile);
    ffmpegCommand = ffmpegCommand
        .renice(constants.defaultFFMPEGProcessPriority)
        .outputOptions(audioOptions)
        .on('error', function(err) {
            logger.error(`Video to audio conversion error: ${err}`);
            utils.deleteFile(savedFile);
            res.status(500).json({
                error: `Video to audio conversion failed: ${err}`,
                videoId: videoId,
                audioId: audioId
            });
        })
        .on('end', function() {
            logger.debug(`Video to audio conversion completed for ${videoId}`);
            utils.deleteFile(savedFile);
            
            // Convert audio to base64 for upload to R2
            const fs = require('fs');
            try {
                const audioBuffer = fs.readFileSync(outputFile);
                const audioBase64 = audioBuffer.toString('base64');
                
                // Clean up temporary file
                utils.deleteFile(outputFile);
                
                res.status(200).json({
                    success: true,
                    audioBase64: audioBase64,
                    videoId: videoId,
                    audioId: audioId,
                    title: title,
                    format: outputFormat,
                    message: 'Video converted to audio successfully'
                });
            } catch (readErr) {
                logger.error(`Error reading audio output file: ${readErr}`);
                utils.deleteFile(outputFile);
                res.status(500).json({
                    error: 'Failed to read converted audio file',
                    videoId: videoId,
                    audioId: audioId
                });
            }
        })
        .save(outputFile);
}

module.exports = router