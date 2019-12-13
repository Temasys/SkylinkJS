import Skylink from '../../../../index';
import { SIG_MESSAGE_TYPE } from '../../../../constants';

const getJoinRoomMessage = (roomState) => {
  const { room } = roomState;
  const state = Skylink.getSkylinkState(room.id);
  const initOptions = Skylink.getInitOptions();
  return {
    type: SIG_MESSAGE_TYPE.JOIN_ROOM,
    uid: state.user.uid,
    cid: state.key,
    rid: room.id,
    userCred: state.user.token,
    timeStamp: state.user.timeStamp,
    apiOwner: state.appKeyOwner,
    roomCred: room.token,
    start: room.startDateTime,
    len: room.duration,
    isPrivileged: state.isPrivileged,
    autoIntroduce: state.autoIntroduce,
    key: initOptions.appKey,
  };
};

export default getJoinRoomMessage;
