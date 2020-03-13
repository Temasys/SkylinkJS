import clone from 'clone';
import Skylink from '../../../index';
import HandleSignalingStats from '../../../skylink-stats/handleSignalingStats';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { channelOpen, channelReopen } from '../../../skylink-events';
import { STATES } from '../../../constants';

const onConnection = (resolve, roomKey) => {
  const state = Skylink.getSkylinkState(roomKey);
  const { socketSession } = state;

  new HandleSignalingStats().send(roomKey, STATES.SIGNALING.CONNECT, null);

  if (!state.channelOpen) {
    state.channelOpen = true;
    Skylink.setSkylinkState(state, roomKey);
  }

  if (socketSession.socketSession.finalAttempts !== 0 || socketSession.socketSession.attempts !== 0) {
    dispatchEvent(channelReopen({
      socketSession: clone(socketSession),
    }));

    new HandleSignalingStats().send(roomKey, STATES.SIGNALING.RECONNECT_SUCCESS);
  } else {
    dispatchEvent(channelOpen({
      socketSession: clone(socketSession),
    }));
  }

  resolve();
};

export default onConnection;
