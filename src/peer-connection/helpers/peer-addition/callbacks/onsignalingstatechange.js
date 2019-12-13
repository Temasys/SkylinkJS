import logger from '../../../../logger';
import messages from '../../../../messages';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { peerConnectionState } from '../../../../skylink-events';
import * as constants from '../../../../constants';

/**
 *
 * @param {RTCPeerConnection} peerConnection
 * @param {string} targetMid - The Peer Id
 * @param {SkylinkState} roomState - The current state.
 * @fires peerConnectionState
 * @memberOf PeerConnection.PeerConnectionHelpers.CreatePeerConnectionCallbacks
 */
// eslint-disable-next-line no-unused-vars
const onsignalingstatechange = (peerConnection, targetMid) => {
  const { AdapterJS } = window;
  const { PEER_CONNECTION } = messages;
  const { PEER_CONNECTION_STATE } = constants;
  const { signalingState, signalingStateClosed } = peerConnection;

  logger.log.DEBUG([targetMid, 'RTCSignalingState', null, PEER_CONNECTION.peer_connection_state], signalingState);

  if (AdapterJS.webrtcDetectedType === 'AppleWebKit' && signalingState === PEER_CONNECTION_STATE.CLOSED) {
    setTimeout(() => {
      if (!signalingStateClosed) {
        dispatchEvent(peerConnectionState({
          state: PEER_CONNECTION_STATE.CLOSED,
          peerId: targetMid,
        }));
      }
    }, 10);
    return;
  }

  dispatchEvent(peerConnectionState({
    state: signalingState,
    peerId: targetMid,
  }));
};

export default onsignalingstatechange;
