import { generateUUID } from '../../../../utils/helpers';
import { SIG_MESSAGE_TYPE, TAGS } from '../../../../constants';
import logger from '../../../../logger';
import MESSAGES from '../../../../messages';

const getUserMessages = (roomState, config, message) => {
  const signalingReadyMessages = [];
  const { user, room } = roomState;
  const {
    listOfPeers, isPrivate, isPersistent, secretId,
  } = config;

  const messageBody = {
    data: message,
    mid: user.sid,
    rid: room.id,
    msgId: generateUUID(),
    type: SIG_MESSAGE_TYPE.MESSAGE,
  };

  if (secretId) {
    messageBody.secretId = secretId;
  }

  if (isPrivate) {
    for (let i = 0; i < listOfPeers.length; i += 1) {
      const peerId = listOfPeers[i];
      const mBody = Object.assign({}, messageBody);
      mBody.target = peerId;
      signalingReadyMessages.push(mBody);
      logger.log.DEBUG([peerId, TAGS.MESSAGING, null, MESSAGES.MESSAGING.PRIVATE_MESSAGE], { message });
    }
  } else {
    if (isPersistent) {
      messageBody.isPersistent = isPersistent;
    }

    signalingReadyMessages.push(messageBody);
    logger.log.DEBUG([null, TAGS.MESSAGING, null, MESSAGES.MESSAGING.BROADCAST_MESSAGE], { message });
  }

  return signalingReadyMessages;
};

export default getUserMessages;
