import Skylink from '../../index';
import logger from '../../logger';

const removeSDPREMBPackets = (targetMid, sessionDescription) => {
  const initOptions = Skylink.getInitOptions();
  if (!initOptions.disableREMB) {
    return sessionDescription.sdp;
  }

  logger.log.INFO([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Removing REMB packets.']);
  return sessionDescription.sdp.replace(/a=rtcp-fb:\d+ goog-remb\r\n/g, '');
};

export default removeSDPREMBPackets;
