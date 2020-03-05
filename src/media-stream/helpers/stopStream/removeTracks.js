import Skylink from '../../../index';
import logger from '../../../logger';
import MESSAGES from '../../../messages';
import removeSenderFromList from '../../../peer-connection/helpers/removeSenderFromList';
import { PEER_CONNECTION_STATE, TAGS } from '../../../constants';

const removeTrack = (state, peerConnections, track) => {
  const trackId = track.id;
  const peerIds = Object.keys(peerConnections);

  for (let i = 0; i < peerIds.length; i += 1) {
    try {
      const targetMid = peerIds[i];
      const peerConnection = peerConnections[targetMid];

      if (peerConnection.connectionState === PEER_CONNECTION_STATE.CLOSED) {
        break;
      }

      const senders = peerConnection.getSenders();
      let sender = null;
      for (let y = 0; y < senders.length; y += 1) {
        if (senders[y].track && senders[y].track.id === trackId) {
          sender = senders[y];
          peerConnection.removeTrack(sender);
          removeSenderFromList(state, targetMid, sender);
        }
      }
    } catch (error) {
      logger.log.ERROR([peerIds[i], TAGS.PEER_CONNECTION, null, MESSAGES.PEER_CONNECTION.ERRORS.REMOVE_TRACK], error);
    }
  }
};

/**
 * Function that removes the tracks from the peer connection.
 * @param {SkylinkRoom} room
 * @param {MediaStream} stream
 * @memberOf MediaStreamHelpers
 */
const removeTracks = (room, stream) => {
  const state = Skylink.getSkylinkState(room.id);
  const { peerConnections, user } = state;
  const tracks = stream.getTracks();

  try {
    tracks.forEach((track) => {
      removeTrack(state, peerConnections, track);
    });
  } catch (error) {
    logger.log.ERROR([user.sid, TAGS.PEER_CONNECTION, null, MESSAGES.PEER_CONNECTION.ERRORS.REMOVE_TRACK], error);
  }
};

export default removeTracks;
