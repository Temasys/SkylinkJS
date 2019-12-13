import clone from 'clone';
import SkylinkSignalingServer from '../index';
import Skylink from '../../../index';
import HandleSignalingStats from '../../../skylink-stats/handleSignalingStats';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { channelRetry } from '../../../skylink-events/index';
import { STATES } from '../../../constants';

// eslint-disable-next-line no-unused-vars
const onReconnectAttempt = (roomKey, attempt) => {
  const state = Skylink.getSkylinkState(roomKey);
  const { socketSession } = state;
  const signaling = new SkylinkSignalingServer();
  let currentAttempt = 0;

  signaling.updateAttempts(roomKey, 'attempts', attempt);

  if (socketSession.socketSession.finalAttempts === 0) {
    currentAttempt = attempt;
  } else {
    currentAttempt = (socketSession.socketSession.finalAttempts * 2) + socketSession.socketSession.attempts;
  }

  new HandleSignalingStats().send(roomKey, STATES.SIGNALING.RECONNECT_ATTEMPT, currentAttempt);

  dispatchEvent(channelRetry({
    fallbackType: socketSession.fallbackType,
    currentAttempt,
    session: clone(Skylink.getSkylinkState(roomKey).socketSession),
  }));
};

export default onReconnectAttempt;
