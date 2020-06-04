import helpers from './index';

/**
 * @description Function that returns the userInfo to be sent to Signaling.
 * @private
 * @param {SkylinkRoom} room
 * @return {Object}
 * @memberOf PeerDataHelpers
 */
const getUserInfo = (room) => {
  const userInfo = helpers.getCurrentSessionInfo(room);
  delete userInfo.room;
  return userInfo;
};

export default getUserInfo;
