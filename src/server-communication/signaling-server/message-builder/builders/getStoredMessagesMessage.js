import { SIG_MESSAGE_TYPE } from '../../../../constants';

const getStoredMessagesMessage = (roomState) => {
  const { user, room } = roomState;
  return {
    mid: user.sid,
    rid: room.id,
    target: user.sid,
    type: SIG_MESSAGE_TYPE.GET_STORED_MESSAGES,
  };
};

export default getStoredMessagesMessage;
