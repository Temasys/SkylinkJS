import clone from 'clone';
import Skylink from '../../../index';
import HandleSignalingStats from '../../../skylink-stats/handleSignalingStats';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { channelOpen } from '../../../skylink-events';
import { STATES } from '../../../constants';

const onConnection = (resolve, roomKey) => {
  const state = Skylink.getSkylinkState(roomKey);
  const { socketSession } = state;

  new HandleSignalingStats().send(roomKey, STATES.SIGNALING.CONNECT, null);

  if (!state.channelOpen) {
    state.channelOpen = true;
    Skylink.setSkylinkState(state, roomKey);
  }

  dispatchEvent(channelOpen({
    socketSession: clone(socketSession),
  }));

  resolve();
};

export default onConnection;
