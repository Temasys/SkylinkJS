import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { onIncomingMessage } from '../../../skylink-events';
import { generateISOStringTimesStamp } from '../../../utils/helpers';
import PeerData from '../../../peer-data';
import logger from '../../../logger';
import { TAGS } from '../../../constants';
import MESSAGES from '../../../messages';
import Room from '../../../room';

// if isSelf = true, targetPeerId is the peer id targeted in sendMessage
// else targetPeerId is the targetMid of the incoming sig msg
const dispatchOnIncomingMessage = (roomState, config, messageContent, isSelf, targetPeerId) => {
  const { room, user } = roomState;

  logger.log.DEBUG([isSelf ? null : targetPeerId, TAGS.MESSAGING, null, `${MESSAGES.MESSAGING.RECEIVED_MESSAGE} - isPrivate: ${config.isPrivate}`]);
  const message = {
    // eslint-disable-next-line no-nested-ternary
    targetPeerId: isSelf ? (config.isPrivate ? targetPeerId : null) : user.sid,
    content: messageContent,
    senderPeerId: config.peerSessionId || (isSelf ? user.sid : targetPeerId), // always use the peerSessionId if present
    isDataChannel: false,
    isPrivate: config.isPrivate,
    timeStamp: generateISOStringTimesStamp(),
  };

  if (isSelf) {
    message.listOfPeers = config.listOfPeers;
  }

  dispatchEvent(onIncomingMessage({
    room: Room.getRoomInfo(room),
    message,
    isSelf,
    peerId: isSelf ? user.sid : targetPeerId,
    peerInfo: isSelf ? PeerData.getCurrentSessionInfo(room) : PeerData.getPeerInfo(targetPeerId, room),
  }));
};

export default dispatchOnIncomingMessage;
