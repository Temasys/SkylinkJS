import clone from 'clone';
import Skylink from '../../../index';
import { STATES, SOCKET_ERROR, PEER_CONNECTION_STATE } from '../../../constants';
import HandleSignalingStats from '../../../skylink-stats/handleSignalingStats';
import MESSAGES from '../../../messages';
import SkylinkSignalingServer from '../index';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { socketError } from '../../../skylink-events';
import { DEFAULTS } from '../../../defaults/index';
import logger from '../../../logger';

// if peer connection state is 'failed' socket should not try to reconnect
// peer connection 'failed' event should have been caught by client and leaveRoom and joinRoom initiated
const shouldReconnect = (state) => {
  const { peerConnections } = state;
  const peerIds = Object.keys(peerConnections);
  let reconnect = true;
  peerIds.forEach((peerId) => {
    if (peerConnections[peerId].connectionState === PEER_CONNECTION_STATE.FAILED) {
      reconnect = false;
    }
  });

  return reconnect;
};

const onReconnectFailed = (resolve, reject, roomKey) => {
  const state = Skylink.getSkylinkState(roomKey);
  const { socketSession } = state;
  const signaling = new SkylinkSignalingServer();

  // try next port or transport
  // TODO: ESS-1979
  if (shouldReconnect(state) && socketSession.socketSession.attempts === DEFAULTS.SOCKET.RECONNECTION_ATTEMPTS.WEBSOCKET && socketSession.socketSession.finalAttempts < DEFAULTS.SOCKET.RECONNECTION_FINAL_ATTEMPTS && !socketSession.socketTimeout) {
    signaling.socket.connect();
    signaling.updateAttempts(roomKey, 'attempts', socketSession.socketSession.attempts === DEFAULTS.SOCKET.RECONNECTION_ATTEMPTS.WEBSOCKET ? 0 : socketSession.socketSession.attempts += 1);
    signaling.updateAttempts(roomKey, 'finalAttempts', socketSession.socketSession.finalAttempts += 1);
  } else {
    let errorMsg = MESSAGES.INIT.ERRORS.SOCKET_ERROR_ABORT;

    if (!shouldReconnect(state)) {
      errorMsg = `${errorMsg} - ${MESSAGES.PEER_CONNECTION.FAILED_STATE}`;
      logger.log.WARN([null, 'Socket', null, `${MESSAGES.SOCKET.ABORT_RECONNECT} - ${MESSAGES.PEER_CONNECTION.FAILED_STATE}`]);
    }

    new HandleSignalingStats().send(roomKey, STATES.SIGNALING.RECONNECT_FAILED, errorMsg);

    dispatchEvent(socketError({
      session: clone(socketSession),
      errorCode: SOCKET_ERROR.RECONNECTION_ABORTED,
      type: socketSession.fallbackType,
      error: new Error(errorMsg),
    }));

    reject(new Error(errorMsg));
  }
};

export default onReconnectFailed;
