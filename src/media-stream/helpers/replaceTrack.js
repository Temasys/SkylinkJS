import logger from '../../logger';
import MESSAGES from '../../messages';
import { TAGS } from '../../constants';

const getTrackSender = (state, peerId, trackId, mediaType) => {
  const { peerConnections } = state;
  const senders = peerConnections[peerId].getSenders();
  let trackSender = null;

  if (!trackId) {
    return trackSender;
  }
  senders.forEach((sender) => {
    if (sender.track && (sender.track.id === trackId) && (sender.track.kind === mediaType)) {
      trackSender = sender;
    }
  });

  return trackSender;
};

/**
 * Function that replaces a track screensharing track.
 * @param {MediaStream} oldStream - The stream to be replaced with newStream
 * @param {MediaStream} newStream - The new stream
 * @param {String} peerId - The PeerId
 * @param {SkylinkState} state
 * @private
 */
const replaceTrack = (oldStream, newStream, peerId, state) => {
  const oldVideoTrack = oldStream.getVideoTracks()[0];
  const oldAudioTrack = oldStream.getAudioTracks()[0];
  const videoSender = getTrackSender(state, peerId, oldVideoTrack ? oldVideoTrack.id : null, 'video');
  const audioSender = getTrackSender(state, peerId, oldAudioTrack ? oldAudioTrack.id : null, 'audio');
  const newVideoTrack = newStream.getVideoTracks()[0];
  const newAudioTrack = newStream.getAudioTracks()[0];

  try {
    if (oldVideoTrack && newVideoTrack && videoSender) {
      videoSender.replaceTrack(newVideoTrack);
    }

    if (oldAudioTrack && newAudioTrack && audioSender) {
      audioSender.replaceTrack(newAudioTrack);
    }
  } catch (error) {
    logger.log.ERROR([peerId, TAGS.PEER_CONNECTION, null, MESSAGES.PEER_CONNECTION.ERRORS.REPLACE_TRACK], error);
  }
};

export default replaceTrack;
