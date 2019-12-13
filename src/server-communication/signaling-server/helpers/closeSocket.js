import Skylink from '../../../index';
import SkylinkSignalingServer from '../index';

const closeSocket = (roomKey) => {
  const state = Skylink.getSkylinkState(roomKey);
  const { channelOpen } = state;
  const signaling = new SkylinkSignalingServer();

  if (channelOpen) {
    if (signaling.socket) {
      signaling.socket.disconnect();
    }
  }
};

export default closeSocket;
