import { isAString, isEmptyArray } from '../../../utils/helpers';
import logger from '../../../logger';
import { PEER_TYPE, TAGS } from '../../../constants';
import MESSAGES from '../../../messages';

const getMessageConfig = (roomState, targetPeerId, peerSessionId) => {
  const {
    peerInformations,
    room,
    user,
  } = roomState;
  let listOfPeers;
  let isPrivate = false;

  if (!room.inRoom || !user) {
    throw Error(MESSAGES.ROOM.ERRORS.NOT_IN_ROOM);
  }

  if (Array.isArray(targetPeerId) && !isEmptyArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;
  } else if (targetPeerId && isAString(targetPeerId)) {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  } else {
    listOfPeers = Object.keys(peerInformations);
  }

  listOfPeers.forEach((peerId, i) => {
    if (!peerInformations[peerId]) {
      logger.log.WARN([peerId, TAGS.MESSAGING, null, `${MESSAGES.MESSAGING.ERRORS.DROPPING_MESSAGE} - ${MESSAGES.PEER_CONNECTION.NO_PEER_CONNECTION}`]);
      listOfPeers.splice(i, 1);
    } else if (peerId === PEER_TYPE.MCU) {
      listOfPeers.splice(i, 1);
    }
  });

  if (listOfPeers.length === 0) {
    logger.log.WARN([null, TAGS.MESSAGING, null, MESSAGES.PEER_CONNECTION.NO_PEER_CONNECTION]);
  }

  return { listOfPeers, isPrivate, peerSessionId };
};

export default getMessageConfig;
