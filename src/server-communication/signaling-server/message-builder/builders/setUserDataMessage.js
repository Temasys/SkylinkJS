import { SIG_MESSAGE_TYPE } from '../../../../constants';
import { isAString } from '../../../../utils/helpers';

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
 * @memberOf SignalingMessageBuilder
 * @private
 */
const setUserDataMessage = roomState => ({
  type: SIG_MESSAGE_TYPE.UPDATE_USER,
  mid: roomState.user.sid,
  rid: roomState.room.id,
  userData: isAString(roomState.userData) ? roomState.userData : JSON.stringify(roomState.userData),
  stamp: (new Date()).getTime(),
});

export default setUserDataMessage;
