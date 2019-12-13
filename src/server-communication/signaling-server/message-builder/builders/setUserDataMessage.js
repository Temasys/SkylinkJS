import { SIG_MESSAGE_TYPE } from '../../../../constants';

/**
 * @typedef userDataMessage
 * @property {SkylinkConstants.SIG_MESSAGE_TYPE.UPDATE_USER} type
 * @property {SkylinkUser.sid} mid
 * @property {SkylinkRoom.id} rid
 * @property {SkylinkUser.userData} userData
 * @property {Number} state
 */
/**
 * @param {SkylinkState} roomState
 * @returns {userDataMessage}
 * @memberof SignalingMessageBuilder
 * @private
 */
const setUserDataMessage = roomState => ({
  type: SIG_MESSAGE_TYPE.UPDATE_USER,
  mid: roomState.user.sid,
  rid: roomState.room.id,
  userData: roomState.userData,
  stamp: (new Date()).getTime(),
});

export default setUserDataMessage;
