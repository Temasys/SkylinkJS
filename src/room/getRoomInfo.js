import Skylink from '../index';

/**
 * @typedef roomInfo
 * @property {Number} duration - The maximum allowed room duration
 * @property {String} id - The room id
 * @property {Boolean} inRoom - The flag if the peer is in the room
 * @property {Boolean} isLocked - The flag if the room is locked
 * @property {String} roomName - The room name
 * @property {String} roomSessionId - The room name session id
 */
/**
 * @param room
 * @return {roomInfo}
 * @private
 */
const getRoomInfo = (room) => {
  const state = Skylink.getSkylinkState(room.id);
  // eslint-disable-next-line no-underscore-dangle
  let _room;

  if (state) {
    _room = state.room;
  } else {
    _room = room;
  }

  const roomInfo = Object.assign({}, _room);
  delete roomInfo.connection;
  delete roomInfo.token;
  delete roomInfo.startDateTime;
  return roomInfo;
};

export default getRoomInfo;
