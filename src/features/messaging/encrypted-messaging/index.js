import encryptHelpers from './helpers/index';
import messagingHelpers from '../helpers/index';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { encryptionSecretsUpdated } from '../../../skylink-events';
import MESSAGES from '../../../messages';
import getUserInfo from '../../../peer-data/helpers/getUserInfo';
import { getParamValidity, getRoomStateByName } from '../../../utils/helpers';
import SkylinkError from '../../../utils/skylinkError';
import logger from '../../../logger';
import { TAGS } from '../../../constants';
import Room from '../../../room';

const instance = {};
/**
 * @classdesc Class used for handling encryption
 * @class
 * @private
 */
class EncryptedMessaging {
  constructor(roomState) {
    const { room, user } = roomState;

    if (!instance[room.id]) {
      instance[room.id] = this;
    }

    this.room = room;
    this.peerId = user.sid;

    /**
     * The secret id and encrypt secret key-value pair.
     * @type {Object|{}}
     */
    this.encryptSecrets = {};

    /**
     * The selected secret id.
     * @type {String}
     */
    this.selectedSecretId = '';

    return instance[room.id];
  }

  setEncryptSecret(secret, secretId) {
    try {
      this.encryptSecrets = encryptHelpers.setEncryptSecret(this.encryptSecrets, secret, secretId);
      this.dispatchEncryptSecretEvent();
    } catch (error) {
      SkylinkError.throwError(null, TAGS.ASYNC_MESSAGING, MESSAGES.MESSAGING.ENCRYPTION.ERRORS.SET_ENCRYPT_SECRET, error.message);
    }
  }

  getEncryptSecrets() {
    return this.encryptSecrets;
  }

  deleteEncryptSecrets(secretId) {
    try {
      const updatedData = encryptHelpers.deleteEncryptSecrets(this.encryptSecrets, this.selectedSecretId, secretId);
      this.encryptSecrets = updatedData.encryptSecrets;
      this.selectedSecretId = updatedData.selectedSecretId;
      this.dispatchEncryptSecretEvent();
    } catch (error) {
      SkylinkError.throwError(null, TAGS.ASYNC_MESSAGING, MESSAGES.MESSAGING.ENCRYPTION.ERRORS.DELETE_ENCRYPT_SECRETS, error.message);
    }
  }

  setSelectedSecretId(secretId) {
    try {
      this.selectedSecretId = encryptHelpers.setSelectedSecretId(this.encryptSecrets, secretId);
      this.dispatchEncryptSecretEvent();
    } catch (error) {
      SkylinkError.throwError(null, TAGS.ASYNC_MESSAGING, MESSAGES.MESSAGING.ENCRYPTION.ERRORS.SET_SELECTED_SECRET, error.message);
    }
  }

  getSelectedSecretId() {
    return this.selectedSecretId;
  }

  dispatchEncryptSecretEvent() {
    dispatchEvent(encryptionSecretsUpdated({
      room: Room.getRoomInfo(this.room),
      encryptSecrets: this.encryptSecrets,
      selectedSecretId: this.selectedSecretId,
      peerInfo: getUserInfo(this.room),
      peerId: this.peerId,
    }));
  }

  canEncrypt(throwError) {
    try {
      if (encryptHelpers.utils.canEncrypt(this.selectedSecretId, this.encryptSecrets)) {
        return encryptHelpers.utils.isValidString(this.selectedSecretId) && encryptHelpers.utils.isValidString(this.encryptSecrets[this.selectedSecretId]);
      }

      return false;
    } catch (err) {
      if (throwError) {
        throw new Error(err.message);
      }
      return false;
    }
  }

  decryptStoredMessages(message, secretId) {
    if (encryptHelpers.utils.canEncrypt(secretId, this.encryptSecrets) && !Object.keys(this.encryptSecrets).filter(key => key === secretId).length) {
      throw new Error(MESSAGES.MESSAGING.ENCRYPTION.ERRORS.SECRET_ID_NOT_FOUND);
    }

    return this.decryptMessage(message, secretId);
  }

  decryptMessage(message, secretId = '') {
    if (secretId && encryptHelpers.utils.canDecrypt(this.encryptSecrets)) {
      return encryptHelpers.tryDecryptMessage(message, secretId, this.encryptSecrets);
    }

    throw new Error(MESSAGES.MESSAGING.ENCRYPTION.ERRORS.INVALID_SECRETS);
  }

  sendMessage(roomName, message, targetPeerId, isPersistent = false, peerSessionId) {
    const roomState = getRoomStateByName(roomName);
    if (getParamValidity(message, 'message', 'sendMessage') && roomState) {
      try {
        logger.log.DEBUG([null, TAGS.ASYNC_MESSAGING, null, MESSAGES.MESSAGING.ENCRYPTION.SEND_MESSAGE]);
        const config = encryptHelpers.getMessageConfig(roomState, targetPeerId, this.encryptSecrets, this.selectedSecretId, isPersistent, peerSessionId);
        const encryptedMessage = encryptHelpers.encryptMessage(message, this.encryptSecrets[this.selectedSecretId]);
        messagingHelpers.sendMessageToSig(roomState, config, message, encryptedMessage, targetPeerId);
      } catch (error) {
        SkylinkError.throwError(targetPeerId, TAGS.ASYNC_MESSAGING, MESSAGES.MESSAGING.ERRORS.DROPPING_MESSAGE, error.message);
      }
    }
  }

  static deleteEncryptedInstance(room) {
    delete instance[room.id];
  }
}

export default EncryptedMessaging;
