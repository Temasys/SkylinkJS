import CryptoJS from 'crypto-js';
import { isAString, isEmptyObj, isEmptyString } from '../../../../utils/helpers';
import MESSAGES from '../../../../messages';
import logger from '../../../../logger';
import { TAGS } from '../../../../constants';

const isExisting = (encryptionParam, updatedEncryptSecrets) => {
  const duplicates = Object.keys(updatedEncryptSecrets).filter(id => id === encryptionParam);
  return duplicates.length > 0;
};

// conditions for encryption - encryptSecrets must not be empty obj AND selected secret must not be empty string
const canEncrypt = (selectedSecretId, encryptSecrets) => {
  if (isEmptyObj(encryptSecrets) && isEmptyString(selectedSecretId)) {
    throw new Error(`${MESSAGES.MESSAGING.ENCRYPTION.ERRORS.SECRETS_NOT_PROVIDED}, ${MESSAGES.MESSAGING.ENCRYPTION.ERRORS.SECRET_ID_NOT_PROVIDED}`);
  } else if (isEmptyString(selectedSecretId)) {
    throw new Error(MESSAGES.MESSAGING.ENCRYPTION.ERRORS.SECRET_ID_NOT_SELECTED);
  } else if (isEmptyObj(encryptSecrets)) {
    throw new Error(MESSAGES.MESSAGING.ENCRYPTION.ERRORS.SECRETS_NOT_PROVIDED);
  }

  return true;
};

// conditions for decryption - encrypt secrets must not be empty obj
const canDecrypt = (encryptSecrets) => {
  if (isEmptyObj(encryptSecrets)) {
    throw new Error(MESSAGES.MESSAGING.ENCRYPTION.ERRORS.SECRETS_NOT_PROVIDED);
  }

  return true;
};

const isValidString = (encryptionParam) => {
  if (!isAString(encryptionParam) || !isAString(encryptionParam) || isEmptyString(encryptionParam)) {
    throw new Error(MESSAGES.MESSAGING.ENCRYPTION.ERRORS.INVALID_TYPE);
  }

  return true;
};

const hasCrypto = () => {
  if (!CryptoJS) {
    logger.log.ERROR([null, TAGS.ASYNC_MESSAGING, null, MESSAGES.PERSISTENT_MESSAGE.ERRORS.NO_DEPENDENCY]);
    return false;
  }

  return CryptoJS;
};

const utils = {
  isExisting,
  isValidString,
  hasCrypto,
  canEncrypt,
  canDecrypt,
};

export default utils;
