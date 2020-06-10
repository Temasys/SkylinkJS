import logger from '../../../../logger';
import messages from '../../../../messages';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { peerConnectionState } from '../../../../skylink-events';

/**
 *
 * @param {RTCPeerConnection} peerConnection
 * @param {String} targetMid - The Peer Id
 * @fires PEER_CONNECTION_STATE
 * @memberOf PeerConnection.PeerConnectionHelpers.CreatePeerConnectionCallbacks
 */
// eslint-disable-next-line no-unused-vars
const onsignalingstatechange = (peerConnection, targetMid) => {
  const { PEER_CONNECTION } = messages;

  logger.log.DEBUG([targetMid, 'RTCPeerConnectionSignalingState', null, PEER_CONNECTION.STATE_CHANGE], peerConnection.signalingState);
  dispatchEvent(peerConnectionState({
    state: peerConnection.signalingState,
    peerId: targetMid,
  }));
};

export default onsignalingstatechange;
