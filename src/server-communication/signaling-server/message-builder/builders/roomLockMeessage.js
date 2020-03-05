import { SIG_MESSAGE_TYPE } from '../../../../constants';

const roomLockMessage = (roomState) => {
  const { user, room, roomLocked } = roomState;

  return {
    type: SIG_MESSAGE_TYPE.ROOM_LOCK,
    mid: user.sid,
    rid: room.id,
    lock: roomLocked,
  };
};

export default roomLockMessage;
