import logger from '../../../../logger';
import messages from '../../../../messages';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { peerConnectionState } from '../../../../skylink-events';
import * as constants from '../../../../constants';
import { isAgent } from '../../../../utils/helpers';

/**
 *
 * @param {RTCPeerConnection} peerConnection
 * @param {String} targetMid - The Peer Id
 * @param {SkylinkState} roomState - The current state.
 * @fires PEER_CONNECTION_STATE
 * @memberOf PeerConnection.PeerConnectionHelpers.CreatePeerConnectionCallbacks
 */
// eslint-disable-next-line no-unused-vars
const onsignalingstatechange = (peerConnection, targetMid) => {
  const { PEER_CONNECTION } = messages;
  const { BROWSER_AGENT, PEER_CONNECTION_STATE } = constants;
  const { signalingState, signalingStateClosed } = peerConnection;

  logger.log.DEBUG([targetMid, 'RTCSignalingState', null, PEER_CONNECTION.STATE_CHANGE], signalingState);

  if (isAgent(BROWSER_AGENT.SAFARI) && signalingState === PEER_CONNECTION_STATE.CLOSED) {
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
