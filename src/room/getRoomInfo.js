import clone from 'clone';
import Skylink from '../index';

const getRoomInfo = (roomName) => {
  const state = Skylink.getSkylinkState(roomName);
  const roomInfo = clone(state.room);
  delete roomInfo.connection;
  delete roomInfo.token;
  return roomInfo;
};

export default getRoomInfo;
