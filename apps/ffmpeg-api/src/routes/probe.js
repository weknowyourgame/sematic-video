var express = require('express')
const ffmpeg = require('fluent-ffmpeg');

const logger = require('../utils/logger.js');
const utils = require('../utils/utils.js');

var router = express.Router();

//probe input file and return metadata
router.post('/', function (req, res,next) {

    let savedFile = res.locals.savedFile;
    logger.debug(`Probing ${savedFile}`);
    
    //ffmpeg processing...
    var ffmpegCommand = ffmpeg(savedFile)
    
    ffmpegCommand.ffprobe(function(err, metadata) {
        if (err)
        {
            next(err);            
        }
        else
        {
            utils.deleteFile(savedFile);        
            res.status(200).send(metadata);
        }
    
    });

});

router.post('/duration', function (req, res, next) {
    return getVideoDuration(req, res, next);
});

module.exports = router

// get video duration specifically for the server API
function getVideoDuration(req, res, next) {
    let videoId = req.body.videoId || req.query.videoId;
    
    if (!videoId) {
        return res.status(400).json({
            error: 'videoId is required'
        });
    }

    let savedFile = res.locals.savedFile;
    logger.debug(`Getting duration for video ${videoId} from ${savedFile}`);
    
    //ffmpeg processing...
    var ffmpegCommand = ffmpeg(savedFile);
    
    ffmpegCommand.ffprobe(function(err, metadata) {
        if (err) {
            logger.error(`Probe error: ${err}`);
            utils.deleteFile(savedFile);
            res.status(500).json({
                error: `Failed to probe video: ${err}`,
                videoId: videoId
            });
        } else {
            utils.deleteFile(savedFile);
            
            // Extract duration from metadata
            let duration = 0;
            if (metadata && metadata.format && metadata.format.duration) {
                duration = parseFloat(metadata.format.duration);
            }
            
            res.status(200).json({
                success: true,
                videoId: videoId,
                duration: duration,
                metadata: metadata
            });
        }
    });
}