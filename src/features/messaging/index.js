import {
  getParamValidity, getRoomStateByName, isABoolean,
} from '../../utils/helpers';
import PeerConnection from '../../peer-connection';
import MESSAGES from '../../messages';
import EncryptedMessaging from './encrypted-messaging';
import AsyncMessaging from './async-messaging';
import messagingHelpers from './helpers';
import Skylink from '../../index';
import SkylinkError from '../../utils/skylinkError';

/**
 * @classdesc Class that manages the messaging feature
 * @class
 * @private
 */
class Messaging {
  static sendMessage(roomName, message, targetPeerId) {
    const roomState = getRoomStateByName(roomName);
    if (getParamValidity(message, 'message', 'sendMessage') && roomState) {
      const encryptedMessaging = new EncryptedMessaging(roomState);
      const asyncMessaging = new AsyncMessaging(roomState);
      if (asyncMessaging.canPersist()) {
        asyncMessaging.sendMessage(roomName, message, targetPeerId);
      } else if (encryptedMessaging.canEncrypt()) {
        encryptedMessaging.sendMessage(roomName, message, targetPeerId);
      } else {
        messagingHelpers.trySendMessage(roomState, message, targetPeerId);
      }
    }
  }

  static sendP2PMessage(roomName, message, targetPeerId) {
    const roomState = getRoomStateByName(roomName);
    if (getParamValidity(message, 'message', 'sendP2PMessage') && roomState) {
      PeerConnection.sendP2PMessage(roomName, message, targetPeerId);
    }
  }

  static processMessage(message, isPublic) {
    const {
      mid,
      target,
      rid,
      secretId,
      data,
    } = message;
    const roomState = Skylink.getSkylinkState(rid);
    const targetMid = mid;

    let messageData = data;
    if (secretId) {
      try {
        const encryptedMessaging = new EncryptedMessaging(roomState);
        messageData = encryptedMessaging.decryptMessage(data, secretId);
      } catch (error) {
        SkylinkError.throwError(MESSAGES.MESSAGING.ENCRYPTION.ERRORS.FAILED_DECRYPTING_MESSAGE, error.message);
      }
    }

    messagingHelpers.dispatchOnIncomingMessage(roomState, { isPrivate: isABoolean(isPublic) ? !isPublic : !!target }, messageData, false, targetMid);
  }
}

export default Messaging;
