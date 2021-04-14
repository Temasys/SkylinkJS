import clone from 'clone';
import HandleSignalingStats from '../../../skylink-stats/handleSignalingStats';
import Skylink from '../../../index';
import logger from '../../../logger/index';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { channelError } from '../../../skylink-events/index';
import { STATES } from '../../../constants';

const onError = (signaling, roomKey, error) => {
  const state = Skylink.getSkylinkState(roomKey);
  const { socketSession, user } = state;
  const peerId = signaling.socket.id || user.sid || null;

  new HandleSignalingStats().send(roomKey, STATES.SIGNALING.ERROR, peerId, error);

  logger.log.ERROR([null, 'Socket', null, 'Exception occurred ->'], error);

  dispatchEvent(channelError({
    error,
    socketSession: clone(socketSession),
    peerId,
  }));
};

export default onError;
