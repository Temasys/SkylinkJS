import logger from '../../logger';

const removeSDPFirefoxH264Pref = (targetMid, sessionDescription) => {
  logger.log.INFO([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Removing Firefox experimental H264 flag to ensure interopability reliability']);
  return sessionDescription.sdp.replace(/a=fmtp:0 profile-level-id=0x42e00c;packetization-mode=1\r\n/g, '');
};

export default removeSDPFirefoxH264Pref;
