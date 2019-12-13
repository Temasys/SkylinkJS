import clone from 'clone';
import HandleSignalingStats from '../../../skylink-stats/handleSignalingStats';
import Skylink from '../../../index';
import logger from '../../../logger/index';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { channelError } from '../../../skylink-events/index';
import { STATES } from '../../../constants';

const onError = (roomKey, error) => {
  const state = Skylink.getSkylinkState(roomKey);
  const { socketSession } = state;

  new HandleSignalingStats().send(roomKey, STATES.SIGNALING.ERROR, error);

  logger.log.ERROR([null, 'Socket', null, 'Exception occurred ->'], error);

  dispatchEvent(channelError({
    error,
    socketSession: clone(socketSession),
  }));
};

export default onError;
