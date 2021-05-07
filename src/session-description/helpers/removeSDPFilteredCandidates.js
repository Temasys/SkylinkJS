import Skylink from '../../index';
import logger from '../../logger';
import MESSAGES from '../../messages';

/* eslint-disable no-param-reassign */
const removeSDPFilteredCandidates = (targetMid, sessionDescription, roomKey) => {
  const initOptions = Skylink.getInitOptions();
  const state = Skylink.getSkylinkState(roomKey);

  if (initOptions.forceTURN && state.hasMCU) {
    logger.log.WARN([targetMid, 'RTCSessionDesription', sessionDescription.type, MESSAGES.ICE_CANDIDATE.FILTERING_FLAG_NOT_HONOURED]);
    return sessionDescription.sdp;
  }

  if (initOptions.filterCandidatesType.host) {
    logger.log.INFO([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Removing "host" ICE candidates.']);
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=candidate:.*host.*\r\n/g, '');
  }

  if (initOptions.filterCandidatesType.srflx) {
    logger.log.INFO([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Removing "srflx" ICE candidates.']);
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=candidate:.*srflx.*\r\n/g, '');
  }

  if (initOptions.filterCandidatesType.relay) {
    logger.log.INFO([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Removing "relay" ICE candidates.']);
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=candidate:.*relay.*\r\n/g, '');
  }

  return sessionDescription.sdp;
};

export default removeSDPFilteredCandidates;
