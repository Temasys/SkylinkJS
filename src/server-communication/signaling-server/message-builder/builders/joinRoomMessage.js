import Skylink from '../../../../index';
import { SIG_MESSAGE_TYPE } from '../../../../constants';
import SkylinkApiResponse from '../../../../models/api-response';

const getJoinRoomMessage = (roomState) => {
  const { room, user } = roomState;
  const state = Skylink.getSkylinkState(room.id);
  const initOptions = Skylink.getInitOptions();
  const apiResponse = new SkylinkApiResponse(null, room.id);
  return {
    type: SIG_MESSAGE_TYPE.JOIN_ROOM,
    uid: state.user.uid,
    cid: apiResponse.key,
    rid: room.id,
    userCred: user.token,
    timeStamp: user.timeStamp,
    apiOwner: apiResponse.appKeyOwner,
    roomCred: room.token,
    start: room.startDateTime,
    len: room.duration,
    isPrivileged: apiResponse.isPrivileged,
    autoIntroduce: apiResponse.autoIntroduce,
    key: initOptions.appKey,
  };
};

export default getJoinRoomMessage;
