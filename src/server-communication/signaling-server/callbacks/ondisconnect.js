import Skylink from '../../../index';
import HandleSignalingStats from '../../../skylink-stats/handleSignalingStats';
import { handleSocketClose } from '../signaling-server-helpers';
import { STATES } from '../../../constants';

const onDisconnect = (roomKey, reason) => {
  const state = Skylink.getSkylinkState(roomKey) || Object.values(Skylink.getSkylinkState())[0]; // to handle leaveAllRooms method
  const isChannelOpen = state.channelOpen;
  const { room } = state;
  let error = null;

  if (reason !== 'io client disconnect') {
    error = reason;
  }

  new HandleSignalingStats().send(room.id, STATES.SIGNALING.DISCONNECT, error);

  if (isChannelOpen || (!isChannelOpen && roomKey !== room.roomName)) { // to handle leaveAllRooms method
    handleSocketClose(room.id, reason);
  }
};

export default onDisconnect;
