import Skylink from '../../index';
import logger from '../../logger';
import messages from '../../messages';
import * as constants from '../../constants';
import PeerConnection from '../../peer-connection';
import IceConnection from '../index';
import { isLowerThanVersion } from '../../utils/helpers';

/**
 * @param {String} targetMid
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
      const nativeCandidate = candidateArray[1];
      const candidateId = candidateArray[0];
      const candidateType = nativeCandidate.candidate.split(' ')[7];
      logger.log.DEBUG([targetMid, TAGS.CANDIDATE_HANDLER, `${candidateId}:${candidateType}`, messages.ICE_CANDIDATE.CANDIDATE_HANDLER.ADD_BUFFERED_CANDIDATE]);
      IceConnection.addIceCandidate(targetMid, candidateId, candidateType, nativeCandidate, state);
    } else if (peerConnection && peerConnection.signalingState !== PEER_CONNECTION_STATE.CLOSED && AdapterJS && isLowerThanVersion(AdapterJS.VERSION, '0.14.0')) {
      try {
        peerConnection.addIceCandidate(null);
        logger.log.DEBUG([targetMid, TAGS.CANDIDATE_HANDLER, null, messages.ICE_CANDIDATE.CANDIDATE_HANDLER.END_OF_CANDIDATES_SUCCESS]);
      } catch (ex) {
        logger.log.DEBUG([targetMid, TAGS.CANDIDATE_HANDLER, null, messages.ICE_CANDIDATE.CANDIDATE_HANDLER.END_OF_CANDIDATES_FAILURE]);
      }
    }
  }

  delete state.peerCandidatesQueue[targetMid];
  PeerConnection.signalingEndOfCandidates(targetMid, state);
};

export default addIceCandidateFromQueue;
