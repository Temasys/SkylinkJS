import Skylink from '../../index';
import logger from '../../logger';
import { candidateProcessingState } from '../../skylink-events';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import * as constants from '../../constants';
import messages from '../../messages';
import HandleIceCandidateStats from '../../skylink-stats/handleIceCandidateStats';

const handleIceCandidateStats = new HandleIceCandidateStats();

/**
 * Success callback for adding an IceCandidate
 * @param {SkylinkRoom} room - The current room
 * @param {string} targetMid - The mid of the target peer
 * @param {string} candidateId - The id of the ICE Candidate
 * @param {string} candidateType - Type of the ICE Candidate
 * @param {RTCIceCandidate} candidate - An RTCIceCandidate Object
 * @fires candidateProcessingState
 * @memberOf IceConnectionHelpers
 * @private
 */
const addIceCandidateSuccess = (room, targetMid, candidateId, candidateType, candidate) => {
  const { STATS_MODULE, ICE_CANDIDATE } = messages;
  const { CANDIDATE_PROCESSING_STATE, TAGS } = constants;

  logger.log.INFO([targetMid, TAGS.CANDIDATE_HANDLER, `${candidateId}:${candidateType}`, ICE_CANDIDATE.CANDIDATE_HANDLER.added_ice_candidate]);
  dispatchEvent(candidateProcessingState({
    room,
    state: CANDIDATE_PROCESSING_STATE.PROCESS_SUCCESS,
    peerId: targetMid,
    candidateId,
    candidateType,
    candidate,
    error: null,
  }));
  handleIceCandidateStats.send(room.id, STATS_MODULE.HANDLE_ICE_GATHERING_STATS.process_success, targetMid, candidateId, candidate);
};

/**
 * Failure callback for adding an IceCandidate
 * @param {SkylinkRoom} room - The current room
 * @param {string} targetMid - The mid of the target peer
 * @param {string} candidateId - The id of the ICE Candidate
 * @param {string} candidateType - Type of the ICE Candidate
 * @param {RTCIceCandidate} candidate - An RTCIceCandidate Object
 * @param {Error} error - Error
 * @fires candidateProcessingState
 * @memberOf IceConnectionHelpers
 * @private
 */
const addIceCandidateFailure = (room, targetMid, candidateId, candidateType, candidate, error) => {
  const { STATS_MODULE, ICE_CANDIDATE } = messages;
  const { CANDIDATE_PROCESSING_STATE, TAGS } = constants;

  logger.log.ERROR([targetMid, TAGS.CANDIDATE_HANDLER, `${candidateId}:${candidateType}`, ICE_CANDIDATE.CANDIDATE_HANDLER.failed_adding_ice_candidate], error);
  dispatchEvent(candidateProcessingState({
    room,
    state: CANDIDATE_PROCESSING_STATE.PROCESS_ERROR,
    peerId: targetMid,
    candidateId,
    candidateType,
    candidate,
    error,
  }));
  handleIceCandidateStats.send(room.id, STATS_MODULE.HANDLE_ICE_GATHERING_STATS.process_failed, targetMid, candidateId, candidate, error);
};

/**
 * @param {string} targetMid - The mid of the target peer
 * @param {string} candidateId - The id of the ICE Candidate
 * @param {string} candidateType - Type of the ICE Candidate
 * @param {RTCIceCandidate} nativeCandidate - An RTCIceCandidate Object
 * @param {SkylinkState} roomState - Skylink State
 * @fires candidateProcessingState
 * @memberOf IceConnectionHelpers
 * @private
 */
const addIceCandidate = (targetMid, candidateId, candidateType, nativeCandidate, roomState) => {
  const state = Skylink.getSkylinkState(roomState.room.id);
  const { peerConnections, room } = state;
  const peerConnection = peerConnections[targetMid];
  const candidate = {
    candidate: nativeCandidate.candidate,
    sdpMid: nativeCandidate.sdpMid,
    sdpMLineIndex: nativeCandidate.sdpMLineIndex,
  };
  const { STATS_MODULE, ICE_CANDIDATE, PEER_CONNECTION } = messages;
  const { CANDIDATE_PROCESSING_STATE, PEER_CONNECTION_STATE, TAGS } = constants;

  logger.log.DEBUG([targetMid, TAGS.CANDIDATE_HANDLER, `${candidateId}:${candidateType}`, ICE_CANDIDATE.CANDIDATE_HANDLER.adding_ice_candidate]);
  dispatchEvent(candidateProcessingState({
    peerId: targetMid,
    room,
    candidateType,
    candidate,
    candidateId,
    state: CANDIDATE_PROCESSING_STATE.PROCESSING,
    error: null,
  }));
  handleIceCandidateStats.send(room.id, STATS_MODULE.HANDLE_ICE_GATHERING_STATS.processing, targetMid, candidateId, candidate);

  if (!(peerConnection
    && peerConnection.signalingState !== PEER_CONNECTION_STATE.CLOSED
    && peerConnection.remoteDescription
    && peerConnection.remoteDescription.sdp
    && peerConnection.remoteDescription.sdp.indexOf(`\r\na=mid:${candidate.sdpMid}\r\n`) > -1)) {
    logger.log.WARN([targetMid, TAGS.CANDIDATE_HANDLER, `${candidateId}:${candidateType}`, `${ICE_CANDIDATE.CANDIDATE_HANDLER.DROPPING_ICE_CANDIDATE} - ${PEER_CONNECTION.NO_PEER_CONNECTION}`]);

    dispatchEvent(candidateProcessingState({
      peerId: targetMid,
      room: roomState.room,
      candidateType,
      candidate,
      candidateId,
      state: constants.CANDIDATE_PROCESSING_STATE.DROPPED,
      error: new Error(ICE_CANDIDATE.CANDIDATE_HANDLER.no_peer_connection_event_log),
    }));
    handleIceCandidateStats.send(room.id, STATS_MODULE.HANDLE_ICE_GATHERING_STATS.process_failed, targetMid, candidateId, candidate, PEER_CONNECTION.NO_PEER_CONNECTION);
  }

  try {
    peerConnection.addIceCandidate(
      candidate,
      addIceCandidateSuccess.bind(peerConnection, room, targetMid, candidateId, candidateType, candidate),
      addIceCandidateFailure.bind(peerConnection, room, targetMid, candidateId, candidateType, candidate),
    );
  } catch (error) {
    addIceCandidateFailure.bind(peerConnection, room, targetMid, candidateId, candidateType, candidate, error);
  }
};

export default addIceCandidate;
