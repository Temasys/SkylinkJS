import Skylink from '../../index';
import logger from '../../logger';
import messages from '../../messages';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import { candidateGenerationState } from '../../skylink-events';
import SignalingServer from '../../server-communication/signaling-server';
import PeerData from '../../peer-data';
import SessionDescription from '../../session-description';
import handleIceGatheringStats from '../../skylink-stats/handleIceGatheringStats';
import * as constants from '../../constants';

/**
 * @param targetMid - The mid of the target peer
 * @param {RTCIceCandidate} candidate - {@link https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidate}
 * @param {SkylinkRoom} currentRoom - Current room
 * @memberOf IceConnectionHelpers
 * @fires candidateGenerationState
 * @private
 * @return {null}
 */
const onIceCandidate = (targetMid, candidate, currentRoom) => {
  const state = Skylink.getSkylinkState(currentRoom.id);
  const initOptions = Skylink.getInitOptions();
  const peerConnection = state.peerConnections[targetMid];
  const signalingServer = new SignalingServer();
  let gatheredCandidates = state.gatheredCandidates[targetMid];
  const { CANDIDATE_GENERATION_STATE, TAGS } = constants;

  if (!peerConnection) {
    logger.log.WARN([targetMid, TAGS.CANDIDATE_HANDLER, null, messages.ICE_CANDIDATE.CANDIDATE_HANDLER.no_peer_connection], candidate);
    return null;
  }

  if (candidate.candidate) {
    if (!peerConnection.gathering) {
      logger.log.WARN([targetMid, TAGS.CANDIDATE_HANDLER, null, messages.ICE_CANDIDATE.CANDIDATE_HANDLER.ice_gathering_started], candidate);
      peerConnection.gathering = true;
      peerConnection.gathered = false;
      dispatchEvent(candidateGenerationState({
        room: currentRoom,
        peerId: targetMid,
        state: constants.CANDIDATE_GENERATION_STATE.GATHERING,
      }));
      handleIceGatheringStats.send(currentRoom.id, CANDIDATE_GENERATION_STATE.GATHERING, targetMid, false);
    }

    const candidateType = candidate.candidate.split(' ')[7];
    logger.log.DEBUG([targetMid, TAGS.CANDIDATE_HANDLER, candidateType, messages.ICE_CANDIDATE.CANDIDATE_HANDLER.generate_ice_candidate], candidate);

    if (candidateType === 'endOfCandidates' || !(peerConnection
      && peerConnection.localDescription && peerConnection.localDescription.sdp
      && peerConnection.localDescription.sdp.indexOf(`\r\na=mid:${candidate.sdpMid}\r\n`) > -1)) {
      logger.log.WARN([targetMid, TAGS.CANDIDATE_HANDLER, candidateType, messages.ICE_CANDIDATE.CANDIDATE_HANDLER.drop_eoc_signal], candidate);
      return null;
    }

    if (initOptions.filterCandidatesType[candidateType]) {
      if (!(state.hasMCU && initOptions.forceTURN)) {
        logger.log.WARN([targetMid, TAGS.CANDIDATE_HANDLER, candidateType, messages.ICE_CANDIDATE.CANDIDATE_HANDLER.matched_filtering_flag], candidate);
        return null;
      }

      logger.log.WARN([targetMid, TAGS.CANDIDATE_HANDLER, candidateType, messages.ICE_CANDIDATE.CANDIDATE_HANDLER.filtering_flag_not_honored], candidate);
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

    if (!initOptions.enableIceTrickle) {
      logger.log.WARN([targetMid, TAGS.CANDIDATE_HANDLER, candidateType, messages.ICE_CANDIDATE.CANDIDATE_HANDLER.ice_trickle_disabled], candidate);
      return null;
    }

    logger.log.DEBUG([targetMid, TAGS.CANDIDATE_HANDLER, candidateType, messages.ICE_CANDIDATE.CANDIDATE_HANDLER.sending_ice_candidate], candidate);

    signalingServer.sendCandidate(targetMid, state, candidate);
  } else {
    logger.log.INFO([targetMid, TAGS.CANDIDATE_HANDLER, null, messages.ICE_CANDIDATE.CANDIDATE_HANDLER.ice_gathering_completed]);

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

    // Disable Ice trickle option
    if (!initOptions.enableIceTrickle) {
      const sessionDescription = peerConnection.localDescription;

      if (!(sessionDescription && sessionDescription.type && sessionDescription.sdp)) {
        logger.log.WARN([targetMid, TAGS.CANDIDATE_HANDLER, null, messages.ICE_CANDIDATE.CANDIDATE_HANDLER.no_sdp]);
        return null;
      }
      // a=end-of-candidates should present in non-trickle ICE connections so no need to send endOfCandidates message
      signalingServer.sendMessage({
        type: sessionDescription.type,
        sdp: SessionDescription.renderSDPOutput(targetMid, sessionDescription, currentRoom.id),
        mid: state.user.sid,
        userInfo: PeerData.getUserInfo(currentRoom),
        target: targetMid,
        rid: currentRoom.id,
      });
    } else if (state.gatheredCandidates[targetMid]) {
      const sendEndOfCandidates = () => {
        if (!state.gatheredCandidates[targetMid]) return;

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
