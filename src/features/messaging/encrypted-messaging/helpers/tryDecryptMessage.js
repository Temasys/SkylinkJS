import encryptHelpers from './index';
import { isEmptyString } from '../../../../utils/helpers';
import MESSAGES from '../../../../messages';

const tryDecryptMessage = (message, secretId, encryptSecrets) => {
  const decryptedMessage = encryptHelpers.encryptMessage(message, encryptSecrets[secretId], true);
  if (isEmptyString(decryptedMessage)) {
    throw new Error(MESSAGES.MESSAGING.ENCRYPTION.ERRORS.ENCRYPT_SECRET);
  } else {
    return decryptedMessage;
  }
};

export default tryDecryptMessage;
