import Skylink from '../../index';
import logger from '../../logger';

/**
 * Iterates through all connected peers to find the greatest peerPriorityWeight and sets the current users peerPriorityWeight to max.
 * @param {SkylinkState} roomState
 * @private
 */
const setGreatestPeerPriorityWeight = (roomState) => {
  const state = Skylink.getSkylinkState(roomState.room.id);
  const { peerInformations } = state;
  const informationList = Object.entries(peerInformations);
  const selfPriorityWeight = state.peerPriorityWeight;

  let maxPeerPriority = selfPriorityWeight;
  for (let i = 0; i < informationList.length; i += 1) {
    const peerInformation = informationList[i][1];
    const { config: { priorityWeight } } = peerInformation;

    if (priorityWeight > maxPeerPriority) {
      maxPeerPriority = priorityWeight;
      state.peerPriorityWeight = maxPeerPriority + 1;
    }
  }
  Skylink.setSkylinkState(state, state.room.id);
  logger.log.DEBUG(`User's priorityWeight is set to ${maxPeerPriority}`);
};

export default setGreatestPeerPriorityWeight;
