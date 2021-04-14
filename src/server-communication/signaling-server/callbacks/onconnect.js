import clone from 'clone';
import Skylink from '../../../index';
import HandleSignalingStats from '../../../skylink-stats/handleSignalingStats';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { channelOpen } from '../../../skylink-events';
import { STATES } from '../../../constants';

const onConnection = (signaling, resolve, roomKey) => {
  const state = Skylink.getSkylinkState(roomKey);
  const { socketSession, user } = state;
  const peerId = signaling.socket.id || user.sid || null;

  new HandleSignalingStats().send(roomKey, STATES.SIGNALING.CONNECT, peerId, null);

  if (!state.channelOpen) {
    state.channelOpen = true;
    Skylink.setSkylinkState(state, roomKey);
  }

  dispatchEvent(channelOpen({
    socketSession: clone(socketSession),
    peerId,
  }));

  resolve();
};

export default onConnection;
