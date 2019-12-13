
import CryptoJS from 'crypto-js';
import config from '../../config';

export default (options = {}) => {
  const defaultRoom = options.defaultRoom || (new Date ()).toISOString() + '-temasys-test-driven';
  const duration = 24;
  const startDateTimeStamp = (new Date ()).toISOString();
  const hashedCredentials = CryptoJS.HmacSHA1(defaultRoom + '_' + duration + '_' + startDateTimeStamp, config.appKeySecret);
  const encodedCredentials = encodeURIComponent(hashedCredentials.toString(CryptoJS.enc.Base64));

  return {
    defaultRoom: defaultRoom,
    appKey: config.appKey,
    enableDataChannel: false,
    enableIceTrickle: false,
    audioFallback: false,
    credentials: {
      duration: duration,
      startDateTime: startDateTimeStamp,
      credentials: encodedCredentials
    }
  };
}