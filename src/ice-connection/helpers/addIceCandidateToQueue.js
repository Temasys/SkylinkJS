import Skylink from '../../index';
import logger from '../../logger';
import MESSAGES from '../../messages';
import { TAGS, CANDIDATE_PROCESSING_STATE } from '../../constants';
import HandleIceCandidateStats from '../../skylink-stats/handleIceCandidateStats';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import { candidateProcessingState } from '../../skylink-events';

/**
 * Method that buffers candidates
 * @param {String} targetMid
 * @param {String} candidateId
 * @param {String} candidateType
 * @param {RTCIceCandidate} nativeCandidate
 * @param {SkylinkState} state
 * @memberOf IceConnectionHelpers
 * @private
 */
const addIceCandidateToQueue = (targetMid, candidateId, candidateType, nativeCandidate, state) => {
  const { STATS_MODULE: { HANDLE_ICE_GATHERING_STATS } } = MESSAGES;
  const updatedState = state;
  const { room } = updatedState;
  const handleIceCandidateStats = new HandleIceCandidateStats();

  logger.log.DEBUG([targetMid, TAGS.CANDIDATE_HANDLER, `${candidateId}:${candidateType}`, MESSAGES.ICE_CANDIDATE.CANDIDATE_HANDLER.ADD_CANDIDATE_TO_BUFFER]);

  handleIceCandidateStats.send(room.id, HANDLE_ICE_GATHERING_STATS.BUFFERED, targetMid, candidateId, nativeCandidate);
  dispatchEvent(candidateProcessingState({
    room,
    state: CANDIDATE_PROCESSING_STATE.BUFFERED,
    peerId: targetMid,
    candidateId,
    candidateType,
    candidate: nativeCandidate.candidate,
    error: null,
  }));

  updatedState.peerCandidatesQueue[targetMid] = updatedState.peerCandidatesQueue[targetMid] || [];
  updatedState.peerCandidatesQueue[targetMid].push([candidateId, nativeCandidate]);
  Skylink.setSkylinkState(updatedState, room.id);
};

export default addIceCandidateToQueue;
