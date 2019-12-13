import Skylink from '../../index';
import logger from '../../logger';
import messages from '../../messages';
import * as constants from '../../constants';
import PeerConnection from '../../peer-connection';
import IceConnection from '../index';
import { isLowerThanVersion } from '../../utils/helpers';

/**
 * @param {string} targetMid
 * @param {SkylinkRoom} room
 * @memberOf IceConnectionHelpers
 * @private
 */
const addIceCandidateFromQueue = (targetMid, room) => {
  const state = Skylink.getSkylinkState(room.id);
  const peerCandidatesQueue = state.peerCandidatesQueue[targetMid] || [];
  const peerConnection = state.peerConnections[targetMid];
  const { AdapterJS } = window;
  const { TAGS, PEER_CONNECTION_STATE } = constants;

  for (let i = 0; i < peerCandidatesQueue.length; i += 1) {
    const candidateArray = peerCandidatesQueue[i];

    if (candidateArray) {
      const cType = candidateArray[1].candidate.split(' ')[7];
      logger.log.DEBUG([targetMid, TAGS.CANDIDATE_HANDLER, `${cType[0]}:${cType}`, messages.ICE_CANDIDATE.CANDIDATE_HANDLER.add_buffered_candidate]);
      IceConnection.addIceCandidate(targetMid, candidateArray[0], cType, candidateArray[1], state);
    } else if (peerConnection && peerConnection.signalingState !== PEER_CONNECTION_STATE.CLOSED && AdapterJS && isLowerThanVersion(AdapterJS.VERSION, '0.14.0')) {
      try {
        peerConnection.addIceCandidate(null);
        logger.log.DEBUG([targetMid, TAGS.CANDIDATE_HANDLER, null, messages.ICE_CANDIDATE.CANDIDATE_HANDLER.end_of_candidate_success]);
      } catch (ex) {
        logger.log.DEBUG([targetMid, TAGS.CANDIDATE_HANDLER, null, messages.ICE_CANDIDATE.CANDIDATE_HANDLER.end_of_candidate_failure]);
      }
    }
  }
  delete state.peerCandidatesQueue[targetMid];
  PeerConnection.signalingEndOfCandidates(targetMid, state);
};

export default addIceCandidateFromQueue;
