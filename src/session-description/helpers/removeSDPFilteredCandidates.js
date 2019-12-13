import Skylink from '../../index';
import logger from '../../logger';
import { PEER_TYPE, HANDSHAKE_PROGRESS } from '../../constants';

/* eslint-disable no-param-reassign */
const removeSDPFilteredCandidates = (targetMid, sessionDescription, roomKey) => {
  const initOptions = Skylink.getInitOptions();
  const state = Skylink.getSkylinkState(roomKey);
  // Handle Firefox MCU Peer ICE candidates
  if (targetMid === PEER_TYPE.MCU && sessionDescription.type === HANDSHAKE_PROGRESS.ANSWER
    && window.webrtcDetectedBrowser === 'firefox') {
    sessionDescription.sdp = sessionDescription.sdp.replace(/ generation 0/g, '');
    sessionDescription.sdp = sessionDescription.sdp.replace(/ udp /g, ' UDP ');
  }

  if (initOptions.forceTURN && state.hasMCU) {
    logger.log.WARN([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Not filtering ICE candidates as '
    + 'TURN connections are enforced as MCU is present (and act as a TURN itself) so filtering of ICE candidate '
    + 'flags are not honoured']);
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
  // sessionDescription.sdp = sessionDescription.sdp.replace(/a=candidate:(?!.*relay.*).*\r\n/g, '');
  return sessionDescription.sdp;
};

export default removeSDPFilteredCandidates;
