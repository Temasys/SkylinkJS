import Skylink from '../../../../index';
import logger from '../../../../logger';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { candidateProcessingState } from '../../../../skylink-events';
import * as constants from '../../../../constants';
import PeerConnection from '../../../../peer-connection';
import IceConnection from '../../../../ice-connection';
import messages from '../../../../messages';
import HandleIceCandidateStats from '../../../../skylink-stats/handleIceCandidateStats';

const handleIceCandidateStats = new HandleIceCandidateStats();

/**
 * Function that handles the "candidate" socket message received.
 * @param {JSON} message
 * @memberof SignalingMessageHandler
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
  const { ICE_CANDIDATE: { CANDIDATE_HANDLER } } = messages;
  const { STATS_MODULE: { HANDLE_ICE_GATHERING_STATS } } = messages;

  if (!candidate && !message.id) {
    logger.log.WARN([mid, CANDIDATE_HANDLER.tag, null, CANDIDATE_HANDLER.invalid_candidate_message], message);
    return null;
  }

  const candidateId = `can-${(new Date()).getTime()}`;
  const candidateType = message.candidate.split(' ')[7] || '';
  const nativeCandidate = new RTCIceCandidate({
    sdpMLineIndex: message.label,
    candidate,
    sdpMid: message.id,
  });

  logger.log.DEBUG([mid, CANDIDATE_HANDLER.tag, `${candidateId}:${candidateType}`, CANDIDATE_HANDLER.valid_candidate_message], nativeCandidate);

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
    logger.log.WARN([mid, CANDIDATE_HANDLER.tag, `${candidateId}:${candidateType}`, CANDIDATE_HANDLER.no_peer_connection]);

    candidateProcessingStateEventDetail.error = new Error(CANDIDATE_HANDLER.no_peer_connection_event_log);
    handleIceCandidateStats.send(room.id, HANDLE_ICE_GATHERING_STATS.process_failed, mid, candidateId, candidate, candidateProcessingStateEventDetail.error);
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
      logger.log.WARN([mid, CANDIDATE_HANDLER.tag, `${candidateId}:${candidateType}`, CANDIDATE_HANDLER.matched_filtering_flag], nativeCandidate);

      candidateProcessingStateEventDetail.error = new Error(CANDIDATE_HANDLER.matched_filtering_flag_event_log);
      handleIceCandidateStats.send(room.id, HANDLE_ICE_GATHERING_STATS.dropped, mid, candidateId, candidate, candidateProcessingStateEventDetail.error);
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

    logger.log.WARN([mid, CANDIDATE_HANDLER.tag, `${candidateId}:${candidateType}`, CANDIDATE_HANDLER.filtering_flag_not_honored], nativeCandidate);
  }

  if (peerConnection.remoteDescription && peerConnection.remoteDescription.sdp && peerConnection.localDescription && peerConnection.localDescription.sdp) {
    IceConnection.addIceCandidate(mid, candidateId, candidateType, nativeCandidate, state);
  } else {
    IceConnection.addIceCandidateFromQueue(mid, room);
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
