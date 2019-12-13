import { SIG_MESSAGE_TYPE } from '../../../../constants';

const byeMessage = (state, peerId) => {
  const { room, user, hasMCU } = state;
  const byeMsg = {
    type: SIG_MESSAGE_TYPE.BYE,
    rid: room.id,
    mid: user.sid,
    target: peerId,
  };

  if (hasMCU) {
    byeMsg.publisherId = user.sid;
  }

  return byeMsg;
};

export default byeMessage;
