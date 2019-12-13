/* eslint-disable prefer-destructuring */
import logger from '../../logger/index';

const getSDPFingerprint = (targetMid, sessionDescription, beSilentOnLogs) => {
  // TODO implement getSDPFingerprint
  const fingerprint = {
    fingerprint: null,
    fingerprintAlgorithm: null,
    base64Certificate: null,
  };

  if (!(sessionDescription && sessionDescription.sdp)) {
    return fingerprint;
  }

  const sdpLines = sessionDescription.sdp.split('\r\n');

  for (let i = 0; i < sdpLines.length; i += 1) {
    if (sdpLines[i].indexOf('a=fingerprint') === 0) {
      const parts = sdpLines[i].replace('a=fingerprint:', '').split(' ');
      fingerprint.fingerprint = parts[1];
      fingerprint.fingerprintAlgorithm = parts[0];
      break;
    }
  }

  if (!beSilentOnLogs) {
    logger.log.DEBUG([targetMid, 'RTCSessionDesription', sessionDescription.type,
      'Parsing session description fingerprint ->'], fingerprint);
  }

  return fingerprint;
};

export default getSDPFingerprint;
