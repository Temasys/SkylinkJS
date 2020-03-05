import { SIG_MESSAGE_TYPE } from '../../../../constants';

const answerAckMessage = (state, targetMid, isSuccess) => {
  const { room, user } = state;

  return {
    type: SIG_MESSAGE_TYPE.ANSWER_ACK,
    rid: room.id,
    mid: user.sid,
    target: targetMid,
    success: isSuccess,
  };
};

export default answerAckMessage;
