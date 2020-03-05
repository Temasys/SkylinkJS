import CryptoJS from 'crypto-js';
import MESSAGES from '../../../../messages';

const encryptMessage = (message, secret, decrypt = false) => {
  if (decrypt) {
    try {
      const decipher = CryptoJS.AES.decrypt(message, secret);

      return decipher.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error(MESSAGES.MESSAGING.ENCRYPTION.ERRORS.ENCRYPT_SECRET);
    }
  }

  const cipher = CryptoJS.AES.encrypt(message, secret);

  return cipher.toString();
};

export default encryptMessage;
