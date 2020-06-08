import Skylink from '../index';

/**
 * @typedef roomInfo
 * @property {String} roomName - The room name
 * @property {Number} duration - The maximum allowed room duration
 * @property {String} id - The room id
 * @property {Boolean} inRoom - The flag if the peer is in the room
 */
/**
 * @param roomKey
 * @return {roomInfo}
 * @private
 */
const getRoomInfo = (roomKey) => {
  const state = Skylink.getSkylinkState(roomKey);
  const { room } = state;
  const roomInfo = Object.assign({}, room);
  delete roomInfo.connection;
  delete roomInfo.token;
  delete roomInfo.startDateTime;
  return roomInfo;
};

export default getRoomInfo;
