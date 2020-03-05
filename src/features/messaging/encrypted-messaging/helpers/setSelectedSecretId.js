import helpers from './index';
import MESSAGES from '../../../../messages';

const setSelectedSecretId = (encryptSecrets, secretId) => {
  if (!secretId) {
    return '';
  }

  if (!helpers.utils.isValidString(secretId)) {
    throw new Error(MESSAGES.MESSAGING.ENCRYPTION.ERRORS.INVALID_TYPE);
  }

  if (!encryptSecrets[secretId]) {
    throw new Error(MESSAGES.MESSAGING.ENCRYPTION.ERRORS.SECRET_ID_NOT_FOUND);
  }

  return secretId;
};

export default setSelectedSecretId;
