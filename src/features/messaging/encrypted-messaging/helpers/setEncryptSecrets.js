import MESSAGES from '../../../../messages';
import helpers from './index';

const isValidSecret = (secret) => {
  if (!secret) {
    throw new Error(MESSAGES.MESSAGING.ENCRYPTION.ERRORS.NO_SECRET_OR_SECRET_ID);
  }

  if (!helpers.utils.isValidString(secret)) {
    throw new Error(MESSAGES.MESSAGING.ENCRYPTION.ERRORS.INVALID_TYPE);
  }

  return true;
};

const isValidSecretId = (secretId, updatedEncryptSecrets) => {
  if (!secretId) {
    throw new Error(MESSAGES.MESSAGING.ENCRYPTION.ERRORS.NO_SECRET_OR_SECRET_ID);
  }

  if (!helpers.utils.isValidString(secretId)) {
    throw new Error(MESSAGES.MESSAGING.ENCRYPTION.ERRORS.INVALID_TYPE);
  }

  if (helpers.utils.isExisting(secretId, updatedEncryptSecrets)) {
    throw new Error(MESSAGES.MESSAGING.ENCRYPTION.ERRORS.SECRET_ID_NOT_UNIQUE);
  }

  return true;
};


// eslint-disable-next-line consistent-return
const setEncryptSecret = (encryptSecrets, secret, secretId) => {
  const updatedEncryptSecrets = encryptSecrets;

  if (isValidSecret(secret) && isValidSecretId(secretId, updatedEncryptSecrets)) {
    updatedEncryptSecrets[secretId] = secret;
    return updatedEncryptSecrets;
  }
};

export default setEncryptSecret;
