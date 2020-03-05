import clone from 'clone';
import Skylink from '../../../index';
import { STATES, SOCKET_ERROR } from '../../../constants';
import HandleSignalingStats from '../../../skylink-stats/handleSignalingStats';
import MESSAGES from '../../../messages';
import SkylinkSignalingServer from '../index';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { socketError } from '../../../skylink-events';
import { DEFAULTS } from '../../../defaults/index';

const onReconnectFailed = (resolve, reject, roomKey) => {
  const state = Skylink.getSkylinkState(roomKey);
  const { socketSession } = state;
  const signaling = new SkylinkSignalingServer();

  // try next port or transport
  if (socketSession.socketSession.attempts === DEFAULTS.SOCKET.RECONNECTION_ATTEMPTS.WEBSOCKET && socketSession.socketSession.finalAttempts < DEFAULTS.SOCKET.RECONNECTION_FINAL_ATTEMPTS && !socketSession.socketTimeout) {
    signaling.socket.connect();
    signaling.updateAttempts(roomKey, 'attempts', socketSession.socketSession.attempts === DEFAULTS.SOCKET.RECONNECTION_ATTEMPTS.WEBSOCKET ? 0 : socketSession.socketSession.attempts += 1);
    signaling.updateAttempts(roomKey, 'finalAttempts', socketSession.socketSession.finalAttempts += 1);
  } else {
    new HandleSignalingStats().send(roomKey, STATES.SIGNALING.RECONNECT_FAILED, MESSAGES.INIT.ERRORS.SOCKET_ERROR_ABORT);

    dispatchEvent(socketError({
      session: clone(socketSession),
      errorCode: SOCKET_ERROR.RECONNECTION_ABORTED,
      type: socketSession.fallbackType,
      error: new Error(MESSAGES.INIT.ERRORS.SOCKET_ERROR_ABORT),
    }));

    reject(new Error(MESSAGES.INIT.ERRORS.SOCKET_ERROR_ABORT));
  }
};

export default onReconnectFailed;
