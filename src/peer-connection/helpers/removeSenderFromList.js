import logger from '../../logger';
import Skylink from '../../index';

const removeSenderFromList = (state, peerId, sender) => {
  const { room } = state;
  const updatedState = state;
  let indexToRemove = -1;

  if (!updatedState.currentRTCRTPSenders[peerId]) {
    return;
  }

  const listOfSenders = updatedState.currentRTCRTPSenders[peerId];

  for (let i = 0; i < listOfSenders.length; i += 1) {
    if (sender === listOfSenders[i]) {
      indexToRemove = i;
      break;
    }
  }

  if (indexToRemove !== -1) {
    listOfSenders.splice(indexToRemove, 1);
    updatedState.currentRTCRTPSenders[peerId] = listOfSenders;
    Skylink.setSkylinkState(updatedState, room.id);
  } else {
    logger.log.WARN([peerId, null, null, 'No matching sender was found for the peer.'], sender);
  }
};

export default removeSenderFromList;
