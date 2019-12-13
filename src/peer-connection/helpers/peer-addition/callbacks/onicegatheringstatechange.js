import logger from '../../../../logger';
import messages from '../../../../messages';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { candidateGenerationState } from '../../../../skylink-events';

/**
 * @param {RTCPeerConnection} peerConnection
 * @param {String} targetMid - The Peer Id
 * @param {SkylinkState} roomState - The current state
 * @fires candidateGenerationState
 * @memberOf PeerConnection.PeerConnectionHelpers.CreatePeerConnectionCallbacks
 */
const onicegatheringstatechange = (peerConnection, targetMid, roomState) => {
  const { PEER_CONNECTION } = messages;
  const { iceGatheringState } = peerConnection;

  logger.log.INFO([targetMid, 'RTCIceGatheringState', null, PEER_CONNECTION.ice_gathering_state], iceGatheringState);
  dispatchEvent(candidateGenerationState({
    state: iceGatheringState,
    room: roomState.room,
    peerId: targetMid,
  }));
};

export default onicegatheringstatechange;
