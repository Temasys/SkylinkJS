import logger from '../../../../logger';
import messages from '../../../../messages';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { candidateGenerationState } from '../../../../skylink-events';
import Room from '../../../../room';

/**
 * @param {RTCPeerConnection} peerConnection
 * @param {String} targetMid - The Peer Id
 * @param {SkylinkState} roomState - The current state
 * @fires CANDIDATE_GENERATION_STATE
 * @memberOf PeerConnection.PeerConnectionHelpers.CreatePeerConnectionCallbacks
 */
const onicegatheringstatechange = (peerConnection, targetMid, roomState) => {
  const { ICE_CONNECTION } = messages;
  const { iceGatheringState } = peerConnection;

  logger.log.INFO([targetMid, 'RTCIceGatheringState', null, ICE_CONNECTION.STATE_CHANGE], iceGatheringState);
  dispatchEvent(candidateGenerationState({
    state: iceGatheringState,
    room: Room.getRoomInfo(roomState.room),
    peerId: targetMid,
  }));
};

export default onicegatheringstatechange;
