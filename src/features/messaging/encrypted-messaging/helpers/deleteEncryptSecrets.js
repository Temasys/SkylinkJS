import MESSAGES from '../../../../messages';
import logger from '../../../../logger';
import { TAGS } from '../../../../constants';
import helpers from './index';

/**
 * Method that deletes the encryption secret associated with the given secretId. If the secretId is not provided all encryption secrets are deleted.
 * @param encryptSecrets
 * @param selectedSecretId
 * @param secretId
 * @returns {object}
 * @private
 */
const deleteEncryptSecrets = (encryptSecrets, selectedSecretId, secretId) => {
  const updatedData = {
    encryptSecrets,
    selectedSecretId,
  };

  if (secretId) {
    if (!updatedData.encryptSecrets[secretId]) {
      throw new Error(MESSAGES.MESSAGING.ENCRYPTION.ERRORS.SECRET_ID_NOT_FOUND);
    }

    // selectedSecretId should be set to default if there are no encryptSecrets stored
    if (updatedData.selectedSecretId === secretId) {
      updatedData.selectedSecretId = helpers.setSelectedSecretId();
    }

    delete updatedData.encryptSecrets[secretId];
  } else {
    logger.log.DEBUG([null, TAGS.ENCRYPTED_MESSAGING, null, `${MESSAGES.MESSAGING.ENCRYPTION.DELETE_ALL}`]);
    updatedData.selectedSecretId = helpers.setSelectedSecretId();
    updatedData.encryptSecrets = {};
  }

  return updatedData;
};

export default deleteEncryptSecrets;
