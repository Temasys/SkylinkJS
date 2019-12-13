import logger from '../../../../logger';
import messages from '../../../../messages';
import { SIG_MESSAGE_TYPE, PEER_TYPE } from '../../../../constants';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { onIncomingMessage } from '../../../../skylink-events';
import PeerData from '../../../../peer-data';

const enumeratePeersAndGetMessages = (listOfPeers, message, isPrivate, peerInformations, roomState, targetPeerId) => {
  const signalingReadyMessages = [];
  const { key, user, room } = roomState;

  for (let i = 0; i < listOfPeers.length; i += 1) {
    const peerId = listOfPeers[i];

    if (!peerInformations[peerId]) {
      logger.log.ERROR([peerId, 'Socket', null, 'Dropping of sending message to Peer as Peer session does not exists']);
      listOfPeers.splice(i, 1);
      i -= 1;
    } else if (peerId === PEER_TYPE.MCU) {
      listOfPeers.splice(i, 1);
      i -= 1;
    } else if (isPrivate) {
      logger.log.DEBUG([peerId, 'Socket', null, 'Sending private message to Peer']);
      signalingReadyMessages.push({
        cid: key,
        data: message,
        mid: user.sid,
        rid: room.id,
        target: peerId,
        type: SIG_MESSAGE_TYPE.PRIVATE_MESSAGE,
      });
    }
  }

  if (listOfPeers.length === 0) {
    logger.log.WARN('Currently there are no Peers to send message to (unless the message is queued and there are Peer connected by then).');
  }

  if (!isPrivate) {
    logger.log.DEBUG([null, 'Socket', null, 'Broadcasting message to Peers']);
    signalingReadyMessages.push({
      cid: key,
      data: message,
      mid: user.sid,
      rid: room.id,
      type: SIG_MESSAGE_TYPE.PUBLIC_MESSAGE,
    });
  }
  dispatchEvent(onIncomingMessage({
    room,
    message: {
      targetPeerId: targetPeerId || null,
      content: message,
      senderPeerId: user.sid,
      isDataChannel: false,
      isPrivate,
      listOfPeers,
    },
    isSelf: true,
    peerId: user.id,
    peerInfo: PeerData.getCurrentSessionInfo(room),
  }));

  return signalingReadyMessages;
};

/**
 * Send a message to a peer or a list of peers via the Signaling Server
 * @param {SkylinkState} roomState
 * @param {String} message
 * @param {String|Array} targetPeerId
 * @private
 */
const peerMessageViaSignaling = (roomState, message, targetPeerId) => {
  const {
    peerInformations,
    inRoom,
    user,
  } = roomState;
  let listOfPeers = Object.keys(peerInformations);
  let isPrivate = false;
  if (!inRoom || !user) {
    logger.log.ERROR(`${messages.ROOM.ERRORS.NOT_IN_ROOM} -> `, message);
    return null;
  }

  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;
  } else if (targetPeerId && typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  return enumeratePeersAndGetMessages(listOfPeers, message, isPrivate, peerInformations, roomState, targetPeerId);
};

export default peerMessageViaSignaling;
