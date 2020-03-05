import HandleSignalingStats from '../../../skylink-stats/handleSignalingStats';
import Skylink from '../../../index';
import logger from '../../../logger';
import { STATES } from '../../../constants';

const onReconnectError = (roomKey, error) => {
  const state = Skylink.getSkylinkState(roomKey);
  const { socketSession } = state;

  new HandleSignalingStats().send(roomKey, STATES.SIGNALING.RECONNECT_ERROR, error);

  if (!socketSession.socketTimeout && error ? error === 'timeout' : false) {
    logger.log.ERROR([null, 'Socket', null, `${socketSession.socketType} connection timed out.`]);
    socketSession.socketTimeout = true;
    Skylink.setSkylinkState(state, roomKey);
  }
};

export default onReconnectError;
