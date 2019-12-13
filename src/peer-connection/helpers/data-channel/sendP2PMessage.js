import Skylink from '../../../index';
import { getRoomStateByName } from '../../../utils/helpers';
import logger from '../../../logger';
import sendMessageToDataChannel from './sendMessageToDataChannel';
import { DC_PROTOCOL_TYPE, PEER_TYPE } from '../../../constants';
import { onIncomingMessage } from '../../../skylink-events';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import PeerData from '../../../peer-data';

/**
 * @param message
 * @param {String} targetPeerId
 * @param {String} roomName
 * @returns {null}
 * @memberOf PeerConnection.PeerConnectionHelpers
 * @fires onIncomingMessage
 */
const sendP2PMessageForRoom = (message, targetPeerId = null, roomName = null) => {
  const state = getRoomStateByName(roomName);
  const initOptions = Skylink.getInitOptions();
  const {
    dataChannels,
    inRoom,
    user,
    hasMCU,
  } = state;

  if (!state) {
    Skylink.logNoRoomState(roomName);
    return null;
  }

  let listOfPeers = Object.keys(dataChannels);
  let isPrivate = false;

  if (Array.isArray(targetPeerId) && targetPeerId.length) {
    listOfPeers = targetPeerId;
    isPrivate = true;
  } else if (targetPeerId && typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  if (!inRoom || !(user && user.sid)) {
    logger.log.ERROR('Unable to send message as User is not in Room. ->', message);
    return null;
  }

  if (!initOptions.enableDataChannel) {
    logger.log.ERROR('Unable to send message as User does not have DataChannel enabled. ->', message);
    return null;
  }

  // Loop out unwanted Peers
  for (let i = 0; i < listOfPeers.length; i += 1) {
    const peerId = listOfPeers[i];

    if (!dataChannels[peerId]) {
      logger.log.ERROR([peerId, 'RTCDataChannel', null, 'Dropping of sending message to Peer as DataChannel connection does not exist.']);
      listOfPeers.splice(i, 1);
      i -= 1;
    } else if (peerId === PEER_TYPE.MCU) {
      listOfPeers.splice(i, 1);
      i -= 1;
    } else if (!hasMCU) {
      logger.log.DEBUG([peerId, 'RTCDataChannel', null, `Sending ${isPrivate ? 'private' : ''} P2P message to Peer.`]);

      sendMessageToDataChannel(state, peerId, {
        type: DC_PROTOCOL_TYPE.MESSAGE,
        isPrivate,
        sender: user.sid,
        target: peerId,
        data: message,
      }, 'main');
    }
  }

  if (listOfPeers.length === 0) {
    logger.log.WARN('Currently there are no Peers to send P2P message to.');
  }

  if (hasMCU) {
    logger.log.DEBUG([PEER_TYPE.MCU, 'RTCDataChannel', null, `Broadcasting ${isPrivate ? 'private' : ''} P2P message to Peers.`]);
    sendMessageToDataChannel(state, PEER_TYPE.MCU, {
      type: DC_PROTOCOL_TYPE.MESSAGE,
      isPrivate,
      sender: user.sid,
      target: listOfPeers,
      data: message,
    }, 'main');
  }

  dispatchEvent(onIncomingMessage({
    room: state.room,
    message: {
      targetPeerId: targetPeerId || null,
      content: message,
      senderPeerId: user.sid,
      isDataChannel: true,
      isPrivate,
    },
    isSelf: true,
    peerId: user.sid,
    peerInfo: PeerData.getCurrentSessionInfo(state.room),
  }));

  return null;
};

const sendP2PMessage = (message, targetPeerId = null, roomName = null) => {
  if (roomName) {
    sendP2PMessageForRoom(message, targetPeerId, roomName);
  } else {
    // Global P2P Message - BroadCast to all rooms
    const roomStates = Skylink.getSkylinkState();
    const roomKeys = Object.keys(roomStates);
    for (let i = 0; i < roomKeys.length; i += 1) {
      const roomState = roomStates[roomKeys[i]];
      sendP2PMessageForRoom(message, targetPeerId, roomState.room.roomName);
    }
  }
};


export default sendP2PMessage;
