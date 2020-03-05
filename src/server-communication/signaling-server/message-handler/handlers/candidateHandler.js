import Skylink from '../../../../index';
import logger from '../../../../logger';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { candidateProcessingState } from '../../../../skylink-events';
import * as constants from '../../../../constants';
import PeerConnection from '../../../../peer-connection';
import IceConnection from '../../../../ice-connection';
import messages from '../../../../messages';
import HandleIceCandidateStats from '../../../../skylink-stats/handleIceCandidateStats';


/**
 * Function that handles the "candidate" socket message received.
 * @param {JSON} message
 * @memberOf SignalingMessageHandler
 * @returns {null}
 * @fires candidateProcessingState
 */
const candidateHandler = (message) => {
  const { candidate, mid, rid } = message;
  const state = Skylink.getSkylinkState(rid);
  const { room } = state;
  const initOptions = Skylink.getInitOptions();
  const peerConnection = state.peerConnections[mid];
  const peerEndOfCandidatesCounter = state.peerEndOfCandidatesCounter[mid] || {};
  const { RTCIceCandidate } = window;
  const { ICE_CANDIDATE: { CANDIDATE_HANDLER }, PEER_CONNECTION, STATS_MODULE: { HANDLE_ICE_GATHERING_STATS } } = messages;
  const handleIceCandidateStats = new HandleIceCandidateStats();

  if (!candidate && !message.id) {
    logger.log.WARN([mid, CANDIDATE_HANDLER.tag, null, CANDIDATE_HANDLER.INVALID_CANDIDATE], message);
    return null;
  }

  const nativeCandidate = new RTCIceCandidate({
    sdpMLineIndex: message.label,
    candidate,
    sdpMid: message.id,
  });
  const candidateId = `can-${nativeCandidate.foundation}`;
  const candidateType = nativeCandidate.candidate.split(' ')[7] || '';

  logger.log.DEBUG([mid, CANDIDATE_HANDLER.tag, `${candidateId}:${candidateType}`, CANDIDATE_HANDLER.VALID_CANDIDATE], nativeCandidate);

  peerEndOfCandidatesCounter.len = peerEndOfCandidatesCounter.len || 0;
  peerEndOfCandidatesCounter.hasSet = false;
  peerEndOfCandidatesCounter.len += 1;

  Skylink.setSkylinkState(state, rid);

  const candidateProcessingStateEventDetail = {
    candidate: {
      candidate: nativeCandidate.candidate,
      sdpMid: nativeCandidate.sdpMid,
      sdpMLineIndex: nativeCandidate.sdpMLineIndex,
    },
    error: null,
  };

  dispatchEvent(candidateProcessingState({
    room,
    state: constants.CANDIDATE_PROCESSING_STATE.RECEIVED,
    peerId: mid,
    candidateId,
    candidateType,
    candidate: candidateProcessingStateEventDetail.candidate,
    error: candidateProcessingStateEventDetail.error,
  }));

  if (!(peerConnection && peerConnection.signalingState !== constants.PEER_CONNECTION_STATE.CLOSED)) {
    logger.log.WARN([mid, CANDIDATE_HANDLER.tag, `${candidateId}:${candidateType}`, PEER_CONNECTION.NO_PEER_CONNECTION]);

    candidateProcessingStateEventDetail.error = new Error(PEER_CONNECTION.NO_PEER_CONNECTION);
    handleIceCandidateStats.send(room.id, HANDLE_ICE_GATHERING_STATS.PROCESS_FAILED, mid, candidateId, candidateProcessingStateEventDetail.candidate, candidateProcessingStateEventDetail.error);
    dispatchEvent(candidateProcessingState({
      room,
      state: constants.CANDIDATE_PROCESSING_STATE.DROPPED,
      peerId: mid,
      candidateId,
      candidateType,
      candidate: candidateProcessingStateEventDetail.candidate,
      error: candidateProcessingStateEventDetail.error,
    }));

    PeerConnection.signalingEndOfCandidates(mid, state);
    return null;
  }

  if (initOptions.filterCandidatesType[candidateType]) {
    if (!(state.hasMCU && initOptions.forceTURN)) {
      logger.log.WARN([mid, CANDIDATE_HANDLER.tag, `${candidateId}:${candidateType}`, CANDIDATE_HANDLER.FILTERED_CANDIDATE], nativeCandidate);

      candidateProcessingStateEventDetail.error = new Error(CANDIDATE_HANDLER.FILTERED_CANDIDATE);
      handleIceCandidateStats.send(room.id, HANDLE_ICE_GATHERING_STATS.DROPPED, mid, candidateId, candidateProcessingStateEventDetail.candidate, candidateProcessingStateEventDetail.error);
      dispatchEvent(candidateProcessingState({
        room,
        state: constants.CANDIDATE_PROCESSING_STATE.DROPPED,
        peerId: mid,
        candidateId,
        candidateType,
        candidate: candidateProcessingStateEventDetail.candidate,
        error: candidateProcessingStateEventDetail.error,
      }));

      PeerConnection.signalingEndOfCandidates(mid, state);
      return null;
    }

    logger.log.WARN([mid, CANDIDATE_HANDLER.tag, `${candidateId}:${candidateType}`, CANDIDATE_HANDLER.FILTERING_FLAG_NOT_HONOURED], nativeCandidate);
  }

  if (peerConnection.remoteDescription && peerConnection.remoteDescription.sdp && peerConnection.localDescription && peerConnection.localDescription.sdp) {
    IceConnection.addIceCandidate(mid, candidateId, candidateType, nativeCandidate, state);
  } else {
    IceConnection.addIceCandidateToQueue(mid, candidateId, candidateType, nativeCandidate, state);
  }

  PeerConnection.signalingEndOfCandidates(mid, state);

  let gatheredCandidates = state.gatheredCandidates[mid];
  if (!gatheredCandidates) {
    gatheredCandidates = {
      sending: { host: [], srflx: [], relay: [] },
      receiving: { host: [], srflx: [], relay: [] },
    };
  }

  gatheredCandidates.receiving[candidateType].push({
    sdpMid: nativeCandidate.sdpMid,
    sdpMLineIndex: nativeCandidate.sdpMLineIndex,
    candidate: nativeCandidate.candidate,
  });

  state.gatheredCandidates[mid] = gatheredCandidates;
  Skylink.setSkylinkState(state, rid);

  return null;
};

export default candidateHandler;
