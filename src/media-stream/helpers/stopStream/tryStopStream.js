import logger from '../../../logger';
import { TAGS } from '../../../constants';
import MESSAGES from '../../../messages';

export const stopMediaTracks = (tracks, peerId) => {
  if (!tracks || !tracks[0]) {
    return false;
  }

  tracks.forEach((track) => {
    try {
      track.stop();
    } catch (error) {
      logger.log.ERROR([peerId, TAGS.MEDIA_STREAM, null, `${MESSAGES.MEDIA_STREAM.ERRORS.STOP_MEDIA_TRACK} - track id: ${track.id}`], error);
    }
  });

  return true;
};

const tryStopStream = (stream, peerId) => {
  if (!stream) return;

  try {
    stopMediaTracks(stream.getAudioTracks());
  } catch (error) {
    logger.log.ERROR([peerId, TAGS.MEDIA_STREAM, null, `${MESSAGES.MEDIA_STREAM.ERRORS.STOP_AUDIO_TRACK} - stream id: ${stream.id}`], error);
  }

  try {
    stopMediaTracks(stream.getVideoTracks());
  } catch (error) {
    logger.log.ERROR([peerId, TAGS.MEDIA_STREAM, null, `${MESSAGES.MEDIA_STREAM.ERRORS.STOP_VIDEO_TRACK} - stream id: ${stream.id}`], error);
  }
};

export default tryStopStream;
