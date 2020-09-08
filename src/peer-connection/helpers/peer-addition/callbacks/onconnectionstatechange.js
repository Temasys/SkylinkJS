import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { peerConnectionState } from '../../../../skylink-events';
import HandleIceConnectionStats from '../../../../skylink-stats/handleIceConnectionStats';
import { PEER_CONNECTION_STATE, ICE_CONNECTION_STATE } from '../../../../constants';
import logger from '../../../../logger';
import MESSAGES from '../../../../messages';

const onconnectionstatechange = (peerConnection, targetMid, state) => {
  const { room } = state;
  const { connectionState, iceConnectionState } = peerConnection;

  // some states are not dispatched on oniceconnectionstatechange
  const handleIceConnectionStats = new HandleIceConnectionStats();
  handleIceConnectionStats.send(room.id, connectionState === PEER_CONNECTION_STATE.FAILED ? ICE_CONNECTION_STATE.FAILED : iceConnectionState, targetMid);

  logger.log.DEBUG([targetMid, 'RTCPeerConnectionState', null, MESSAGES.PEER_CONNECTION.STATE_CHANGE], peerConnection.connectionState);
  dispatchEvent(peerConnectionState({
    state: connectionState,
    peerId: targetMid,
  }));
};

export default onconnectionstatechange;
