import Skylink from '../../index';
import logger from '../../logger';
import { candidateProcessingState } from '../../skylink-events';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import * as constants from '../../constants';
import messages from '../../messages';
import HandleIceCandidateStats from '../../skylink-stats/handleIceCandidateStats';
import Room from '../../room';

const handleIceCandidateStats = new HandleIceCandidateStats();

/**
 * Success callback for adding an IceCandidate
 * @param {SkylinkRoom} room - The current room
 * @param {String} targetMid - The mid of the target peer
 * @param {String} candidateId - The id of the ICE Candidate
 * @param {String} candidateType - Type of the ICE Candidate
 * @param {RTCIceCandidate} candidate - An RTCIceCandidate Object
 * @fires CANDIDATE_PROCESSING_STATE
 * @memberOf IceConnectionHelpers
 * @private
 */
const addIceCandidateSuccess = (room, targetMid, candidateId, candidateType, candidate) => {
  const { STATS_MODULE, ICE_CANDIDATE } = messages;
  const { CANDIDATE_PROCESSING_STATE, TAGS } = constants;

  logger.log.INFO([targetMid, TAGS.CANDIDATE_HANDLER, `${candidateId}:${candidateType}`, ICE_CANDIDATE.CANDIDATE_ADDED]);
  dispatchEvent(candidateProcessingState({
    room: Room.getRoomInfo(room),
    state: CANDIDATE_PROCESSING_STATE.PROCESS_SUCCESS,
    peerId: targetMid,
    candidateId,
    candidateType,
    candidate,
    error: null,
  }));
  handleIceCandidateStats.send(room.id, STATS_MODULE.HANDLE_ICE_GATHERING_STATS.PROCESS_SUCCESS, targetMid, candidateId, candidate);
};

/**
 * Failure callback for adding an IceCandidate
 * @param {SkylinkRoom} room - The current room
 * @param {String} targetMid - The mid of the target peer
 * @param {String} candidateId - The id of the ICE Candidate
 * @param {String} candidateType - Type of the ICE Candidate
 * @param {RTCIceCandidate} candidate - An RTCIceCandidate Object
 * @param {Error} error - Error
 * @fires CANDIDATE_PROCESSING_STATE
 * @memberOf IceConnectionHelpers
 * @private
 */
const addIceCandidateFailure = (room, targetMid, candidateId, candidateType, candidate, error) => {
  const { STATS_MODULE, ICE_CANDIDATE } = messages;
  const { CANDIDATE_PROCESSING_STATE, TAGS } = constants;

  logger.log.WARN([targetMid, TAGS.CANDIDATE_HANDLER, `${candidateId}:${candidateType}`, ICE_CANDIDATE.FAILED_ADDING_CANDIDATE], error);
  dispatchEvent(candidateProcessingState({
    room: Room.getRoomInfo(room),
    state: CANDIDATE_PROCESSING_STATE.PROCESS_ERROR,
    peerId: targetMid,
    candidateId,
    candidateType,
    candidate,
    error,
  }));
  handleIceCandidateStats.send(room.id, STATS_MODULE.HANDLE_ICE_GATHERING_STATS.PROCESS_FAILED, targetMid, candidateId, candidate, error);
};

/**
 * @param {String} targetMid - The mid of the target peer
 * @param {String} candidateId - The id of the ICE Candidate
 * @param {String} candidateType - Type of the ICE Candidate
 * @param {RTCIceCandidate} nativeCandidate - An RTCIceCandidate Object
 * @param {SkylinkState} roomState - Skylink State
 * @fires CANDIDATE_PROCESSING_STATE
 * @memberOf IceConnectionHelpers
 * @private
 */
// eslint-disable-next-line consistent-return
const addIceCandidate = (targetMid, candidateId, candidateType, nativeCandidate, roomState) => {
  const state = Skylink.getSkylinkState(roomState.room.id);
  const { peerConnections, room } = state;
  const peerConnection = peerConnections[targetMid];
  const candidate = {
    candidate: nativeCandidate.candidate,
    sdpMid: nativeCandidate.sdpMid,
    sdpMLineIndex: nativeCandidate.sdpMLineIndex,
  };
  const {
    STATS_MODULE, ICE_CANDIDATE, PEER_CONNECTION, SESSION_DESCRIPTION,
  } = messages;
  const { CANDIDATE_PROCESSING_STATE, PEER_CONNECTION_STATE, TAGS } = constants;

  logger.log.DEBUG([targetMid, TAGS.CANDIDATE_HANDLER, `${candidateId}:${candidateType}`, ICE_CANDIDATE.ADDING_CANDIDATE]);
  dispatchEvent(candidateProcessingState({
    peerId: targetMid,
    room: Room.getRoomInfo(room),
    candidateType,
    candidate,
    candidateId,
    state: CANDIDATE_PROCESSING_STATE.PROCESSING,
    error: null,
  }));
  handleIceCandidateStats.send(room.id, STATS_MODULE.HANDLE_ICE_GATHERING_STATS.PROCESSING, targetMid, candidateId, candidate);
  let errorMessage = null;

  if (!peerConnection) {
    errorMessage = PEER_CONNECTION.NO_PEER_CONNECTION;
  }

  if (peerConnection.signalingState === PEER_CONNECTION_STATE.CLOSED) {
    errorMessage = PEER_CONNECTION.PEER_CONNECTION_CLOSED;
  }

  if (!peerConnection.remoteDescription || !peerConnection.remoteDescription.sdp) {
    errorMessage = SESSION_DESCRIPTION.NO_REMOTE_DESCRIPTION;
  }

  if (targetMid !== constants.PEER_TYPE.REC_SRV && peerConnection.remoteDescription.sdp.indexOf(`\r\na=mid:${candidate.sdpMid}\r\n`) === -1) {
    errorMessage = PEER_CONNECTION.SDP_ERROR;
  }

  if (errorMessage) {
    logger.log.WARN([targetMid, TAGS.CANDIDATE_HANDLER, `${candidateId}:${candidateType}`, `${ICE_CANDIDATE.DROPPING_CANDIDATE} - ${errorMessage}`]);

    dispatchEvent(candidateProcessingState({
      peerId: targetMid,
      room: Room.getRoomInfo(room),
      candidateType,
      candidate,
      candidateId,
      state: constants.CANDIDATE_PROCESSING_STATE.DROPPED,
      error: new Error(errorMessage),
    }));

    return handleIceCandidateStats.send(room.id, STATS_MODULE.HANDLE_ICE_GATHERING_STATS.PROCESS_FAILED, targetMid, candidateId, candidate, errorMessage);
  }

  try {
    peerConnection.addIceCandidate(candidate)
    .then(() => { addIceCandidateSuccess(room, targetMid, candidateId, candidateType, candidate); })
    .catch((error) => { addIceCandidateFailure(room, targetMid, candidateId, candidateType, candidate, error); });
  } catch (error) {
    addIceCandidateFailure.bind(peerConnection, room, targetMid, candidateId, candidateType, candidate, error);
  }
};

export default addIceCandidate;