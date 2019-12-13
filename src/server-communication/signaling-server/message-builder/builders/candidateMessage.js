import Skylink from '../../../../index';
import { SIG_MESSAGE_TYPE } from '../../../../constants';

const candidateMessage = (targetMid, roomState, candidate) => {
  const rid = roomState.room.id;
  const state = Skylink.getSkylinkState(rid);
  return {
    type: SIG_MESSAGE_TYPE.CANDIDATE,
    label: candidate.sdpMLineIndex,
    id: candidate.sdpMid,
    candidate: candidate.candidate,
    mid: state.user.sid,
    target: targetMid,
    rid,
  };
};

export default candidateMessage;
