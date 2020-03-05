import { TAGS } from '../../../constants';
import logger from '../../../logger';
import MESSAGES from '../../../messages';
import SkylinkSignalingServer from '../../../server-communication/signaling-server';
import {
  getParamValidity, getRoomStateByName, isABoolean,
} from '../../../utils/helpers';
import SkylinkError from '../../../utils/skylinkError';
import Skylink from '../../../index';
import EncryptedMessaging from '../encrypted-messaging';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { storedMessages, persistentMessageState } from '../../../skylink-events';
import PeerData from '../../../peer-data';
import asyncHelpers from './helpers/index';
import getUserInfo from '../../../peer-data/helpers/getUserInfo';

const instance = {};

/**
 * @classdesc Class used for handling the asynchronous messaging feature
 * @class
 * @private
 */
class AsyncMessaging {
  constructor(roomState) {
    const { user, room, hasPersistentMessage } = roomState;

    if (!instance[room.id]) {
      instance[room.id] = this;
    }

    this.room = room;
    this.peerId = user.sid;
    this.isPersistent = hasPersistentMessage; // Value defaults to hasPersistentMessage
    this.hasPersistentMessage = hasPersistentMessage;

    return instance[room.id];
  }

  setMessagePersistence(isPersistent) {
    if (!isABoolean(isPersistent)) {
      throw SkylinkError.throwError(MESSAGES.MESSAGING.PERSISTENCE.ERRORS.FAILED_SETTING_PERSISTENCE, MESSAGES.MESSAGING.PERSISTENCE.ERRORS.INVALID_TYPE);
    } else if (!this.hasPersistentMessage) {
      throw SkylinkError.throwError(MESSAGES.MESSAGING.PERSISTENCE.ERRORS.FAILED_SETTING_PERSISTENCE, MESSAGES.MESSAGING.PERSISTENCE.ERRORS.PERSISTENT_MESSAGE_FEATURE_NOT_ENABLED);
    }

    this.isPersistent = isPersistent;

    dispatchEvent(persistentMessageState({
      room: this.room,
      isPersistent: this.isPersistent,
      peerInfo: getUserInfo(this.room),
      peerId: this.peerId,
    }));
  }

  getMessagePersistence() {
    return this.isPersistent;
  }

  sendMessage(roomName, message, targetPeerId) {
    const roomState = getRoomStateByName(roomName);
    if (getParamValidity(message, 'message', 'sendMessage') && roomState) {
      try {
        logger.log.DEBUG([null, TAGS.ASYNC_MESSAGING, null, MESSAGES.MESSAGING.PERSISTENCE.SEND_MESSAGE]);
        const encryptedMessaging = new EncryptedMessaging(roomState);
        if (encryptedMessaging.canEncrypt(true)) {
          encryptedMessaging.sendMessage(roomName, message, targetPeerId, this.isPersistent);
        }
      } catch (error) {
        SkylinkError.throwError(MESSAGES.MESSAGING.ERRORS.DROPPING_MESSAGE, error.message);
      }
    }
  }

  getStoredMessages() {
    const roomState = Skylink.getSkylinkState(this.room.id);
    if (!this.hasPersistentMessage) {
      logger.log.WARN([this.peerId, TAGS.ASYNC_MESSAGING, null, `${MESSAGES.MESSAGING.PERSISTENCE.ERRORS.PERSISTENT_MESSAGE_FEATURE_NOT_ENABLED}`]);
      return;
    }

    new SkylinkSignalingServer().getStoredMessages(roomState);
  }

  canPersist() {
    if (this.hasPersistentMessage) {
      if (this.isPersistent) {
        return true;
      }

      logger.log.DEBUG([null, TAGS.ASYNC_MESSAGING, null, MESSAGES.MESSAGING.PERSISTENCE.NOT_PERSISTED]);
      return false;
    }

    if (this.isPersistent) {
      logger.log.DEBUG([null, TAGS.ASYNC_MESSAGING, null, `${MESSAGES.MESSAGING.PERSISTENCE.IS_PERSISTENT_CONFIG} ${this.isPersistent}`]);
      throw new Error(MESSAGES.MESSAGING.PERSISTENCE.ERRORS.PERSISTENT_MESSAGE_FEATURE_NOT_ENABLED);
    }

    return false;
  }

  static processStoredMessages(message) {
    const roomState = Skylink.getSkylinkState(message.rid);
    const { room } = roomState;
    const targetMid = message.mid;
    const messageData = JSON.parse(message.data);
    const encryptedMessaging = new EncryptedMessaging(roomState);
    const messages = [];

    logger.log.DEBUG([targetMid, TAGS.ASYNC_MESSAGING, null, MESSAGES.MESSAGING.PERSISTENCE.STORED_MESSAGES], messageData);

    try {
      for (let i = 0; i < messageData.length; i += 1) {
        messageData[i].data = encryptedMessaging.decryptStoredMessages(messageData[i].data, messageData[i].secretId);
        messages.push(asyncHelpers.parseDecryptedMessageData(messageData[i], targetMid));
      }
    } catch (error) {
      throw SkylinkError.throwError(MESSAGES.MESSAGING.ENCRYPTION.ERRORS.FAILED_DECRYPTING_MESSAGE, error.message);
    }

    dispatchEvent(storedMessages({
      room,
      storedMessages: messages,
      isSelf: false,
      peerId: targetMid,
      peerInfo: PeerData.getPeerInfo(targetMid, room),
    }));
  }
}

export default AsyncMessaging;
