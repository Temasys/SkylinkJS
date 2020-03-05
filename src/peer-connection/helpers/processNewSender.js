import Skylink from '../../index';

const processNewSender = (state, targetMid, sender) => {
  const updatedState = state;
  if (!updatedState.currentRTCRTPSenders[targetMid]) {
    updatedState.currentRTCRTPSenders[targetMid] = [];
  }
  updatedState.currentRTCRTPSenders[targetMid].push(sender);
  Skylink.setSkylinkState(updatedState, updatedState.room.id);
};

export default processNewSender;
