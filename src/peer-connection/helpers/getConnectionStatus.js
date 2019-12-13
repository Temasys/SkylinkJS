import {
  rejectPromise, isEmptyArray, isValidPeerId, isAString,
} from '../../utils/helpers';
import messages from '../../messages';
import PeerConnectionStatistics from './statistics';
import logger from '../../logger';

const retrieveValidPeerIdsOrErrorMsg = (roomState, peerId) => {
  const { peerConnections, room } = roomState;
  const { PEER_CONNECTION } = messages;
  let peerIds = null;
  let errorMsg = null;

  if (isEmptyArray(Object.keys(peerConnections))) {
    errorMsg = PEER_CONNECTION.not_initialised;
  } else if (Array.isArray(peerId)) {
    peerIds = peerId;
    peerIds.forEach((id) => {
      if (!isValidPeerId(room, id)) {
        errorMsg = `${PEER_CONNECTION.peerId_does_not_exist} ${id}`;
      }
    });
  } else if (isAString(peerId)) {
    if (!isValidPeerId(room, peerId)) {
      errorMsg = `${PEER_CONNECTION.peerId_does_not_exist} ${peerId}`;
    }

    peerIds = [peerId];
  } else {
    peerIds = Object.keys(peerConnections);
  }

  return {
    peerIds,
    errorMsg,
  };
};

const getConnectionStatus = (roomState, peerId = null) => {
  const { ROOM_STATE } = messages;
  if (!roomState) {
    logger.log.WARN(ROOM_STATE.NO_ROOM_NAME);
    return rejectPromise(ROOM_STATE.NO_ROOM_NAME);
  }

  const { room } = roomState;
  const result = retrieveValidPeerIdsOrErrorMsg(roomState, peerId);

  if (result.errorMsg) {
    logger.log.WARN(result.errorMsg);
    return rejectPromise(result.errorMsg);
  }

  const { peerIds } = result;
  const connectionStatusPromises = [];
  for (let i = 0; i < peerIds.length; i += 1) {
    const peerConnectionStatistics = new PeerConnectionStatistics(room.id, peerIds[i]);
    connectionStatusPromises.push(peerConnectionStatistics.getConnectionStatus());
  }

  return Promise.all(connectionStatusPromises);
};

export default getConnectionStatus;
