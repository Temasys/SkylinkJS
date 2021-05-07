import Skylink from '../../index';
import logger from '../../logger';
import messages from '../../messages';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import { candidateGenerationState } from '../../skylink-events';
import SignalingServer from '../../server-communication/signaling-server';
import handleIceGatheringStats from '../../skylink-stats/handleIceGatheringStats';
import * as constants from '../../constants';
import Room from '../../room';

/**
 * @param targetMid - The mid of the target peer
 * @param {RTCIceCandidate} candidate - {@link https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidate}
 * @param {SkylinkRoom} currentRoom - Current room
 * @memberOf IceConnectionHelpers
 * @fires CANDIDATE_GENERATION_STATE
 * @private
 * @return {null}
 */
const onIceCandidate = (targetMid, candidate, currentRoom) => {
  const state = Skylink.getSkylinkState(currentRoom.id);
  const initOptions = Skylink.getInitOptions();
  const peerConnection = state.peerConnections[targetMid];
  const signalingServer = new SignalingServer();
  let gatheredCandidates = state.gatheredCandidates[targetMid];
  const { filterCandidatesType } = initOptions;
  const { CANDIDATE_GENERATION_STATE, TAGS } = constants;

  if (!peerConnection) {
    logger.log.WARN([targetMid, TAGS.CANDIDATE_HANDLER, null, messages.PEER_CONNECTION.NO_PEER_CONNECTION], candidate);
    return null;
  }

  if (candidate.candidate) {
    if (!peerConnection.gathering) {
      logger.log.INFO([targetMid, TAGS.CANDIDATE_HANDLER, null, messages.ICE_CONNECTION.ICE_GATHERING_STARTED], candidate);
      peerConnection.gathering = true;
      peerConnection.gathered = false;
      dispatchEvent(candidateGenerationState({
        room: Room.getRoomInfo(currentRoom.id),
        peerId: targetMid,
        state: constants.CANDIDATE_GENERATION_STATE.GATHERING,
      }));
      handleIceGatheringStats.send(currentRoom.id, CANDIDATE_GENERATION_STATE.GATHERING, targetMid, false);
    }

    const candidateType = candidate.candidate.split(' ')[7];
    logger.log.DEBUG([targetMid, TAGS.CANDIDATE_HANDLER, candidateType, messages.ICE_CANDIDATE.CANDIDATE_GENERATED], candidate);

    if (candidateType === 'endOfCandidates' || !(peerConnection
      && peerConnection.localDescription && peerConnection.localDescription.sdp
      && peerConnection.localDescription.sdp.indexOf(`\r\na=mid:${candidate.sdpMid}\r\n`) > -1)) {
      logger.log.WARN([targetMid, TAGS.CANDIDATE_HANDLER, candidateType, messages.ICE_CONNECTION.DROP_EOC], candidate);
      return null;
    }

    // Enforcing forceTURN by filtering out host and srflx candidates
    if (filterCandidatesType[candidateType]) {
      if (!(state.hasMCU && initOptions.forceTURN)) {
        logger.log.WARN([targetMid, TAGS.CANDIDATE_HANDLER, candidateType, messages.ICE_CANDIDATE.FILTERED_CANDIDATE], candidate);
        return null;
      }

      logger.log.WARN([targetMid, TAGS.CANDIDATE_HANDLER, candidateType, messages.ICE_CANDIDATE.FILTERING_FLAG_NOT_HONOURED], candidate);
    }

    if (!gatheredCandidates) {
      gatheredCandidates = {
        sending: { host: [], srflx: [], relay: [] },
        receiving: { host: [], srflx: [], relay: [] },
      };
    }

    gatheredCandidates.sending[candidateType].push({
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex,
      candidate: candidate.candidate,
    });

    state.gatheredCandidates[targetMid] = gatheredCandidates;
    Skylink.setSkylinkState(state, currentRoom.id);

    logger.log.DEBUG([targetMid, TAGS.CANDIDATE_HANDLER, candidateType, messages.ICE_CANDIDATE.SENDING_CANDIDATE], candidate);

    signalingServer.sendCandidate(targetMid, state, candidate);
  } else {
    logger.log.INFO([targetMid, TAGS.CANDIDATE_HANDLER, null, messages.ICE_CONNECTION.ICE_GATHERING_COMPLETED]);

    if (peerConnection.gathered) {
      return null;
    }

    peerConnection.gathering = false;
    peerConnection.gathered = true;

    dispatchEvent(candidateGenerationState({
      peerId: targetMid,
      state: constants.CANDIDATE_GENERATION_STATE.COMPLETED,
      room: currentRoom,
    }));
    handleIceGatheringStats.send(currentRoom.id, CANDIDATE_GENERATION_STATE.COMPLETED, targetMid, false);

    if (state.gatheredCandidates[targetMid]) {
      const sendEndOfCandidates = () => {
        if (!state.gatheredCandidates[targetMid]) return;
        const currentState = Skylink.getSkylinkState(currentRoom.id);
        if (!currentState) {
          logger.log.WARN([targetMid, TAGS.CANDIDATE_HANDLER, null, `${messages.ICE_CONNECTION.DROP_EOC} peer has left the room`]);
          return;
        }

        signalingServer.sendMessage({
          type: constants.SIG_MESSAGE_TYPE.END_OF_CANDIDATES,
          noOfExpectedCandidates: state.gatheredCandidates[targetMid].sending.srflx.length + state.gatheredCandidates[targetMid].sending.host.length + state.gatheredCandidates[targetMid].sending.relay.length,
          mid: state.user.sid,
          target: targetMid,
          rid: currentRoom.id,
        });
      };
      setTimeout(sendEndOfCandidates, 6000);
    }
  }
  return null;
};

export default onIceCandidate;
