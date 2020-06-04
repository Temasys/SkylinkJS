import { SIG_MESSAGE_TYPE } from '../../../../constants';

const roomLockMessage = (roomState) => {
  const { user, room } = roomState;

  return {
    type: SIG_MESSAGE_TYPE.ROOM_LOCK,
    mid: user.sid,
    rid: room.id,
    lock: room.isLocked,
  };
};

export default roomLockMessage;
