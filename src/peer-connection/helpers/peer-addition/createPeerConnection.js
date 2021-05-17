import {
  HANDSHAKE_PROGRESS, PEER_TYPE, BROWSER_AGENT, TAGS, CONFIG_NAME,
} from '../../../constants';
import Skylink from '../../../index';
import logger from '../../../logger';
import callbacks from './callbacks/index';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { handshakeProgress } from '../../../skylink-events';
import MESSAGES from '../../../messages';
import { isAgent } from '../../../utils/helpers';
import retrieveConfig from '../../../defaults';
import Room from '../../../room';

const createNativePeerConnection = (targetMid, constraints, hasScreenShare, currentRoom) => {
  const initOptions = Skylink.getInitOptions();
  const state = Skylink.getSkylinkState(currentRoom.id);
  logger.log.DEBUG([targetMid, TAGS.PEER_CONNECTION, null, MESSAGES.PEER_CONNECTION.CREATE_NEW], {
    constraints,
  });
  const { RTCPeerConnection, msRTCPeerConnection } = window;
  const rtcPeerConnection = new (initOptions.useEdgeWebRTC && msRTCPeerConnection ? window.msRTCPeerConnection : RTCPeerConnection)(constraints);
  const callbackExtraParams = [rtcPeerConnection, targetMid, state];

  // attributes (added on by Temasys)
  rtcPeerConnection.setOffer = '';
  rtcPeerConnection.setAnswer = '';
  rtcPeerConnection.negotiating = false;
  rtcPeerConnection.hasMainChannel = false;
  rtcPeerConnection.processingLocalSDP = false;
  rtcPeerConnection.processingRemoteSDP = false;
  rtcPeerConnection.gathered = false;
  rtcPeerConnection.gathering = false;

  // candidates
  state.gatheredCandidates[targetMid] = {
    sending: { host: [], srflx: [], relay: [] },
    receiving: { host: [], srflx: [], relay: [] },
  };

  state.peerEndOfCandidatesCounter[targetMid] = state.peerEndOfCandidatesCounter[targetMid] || {};

  // FIXME: ESS-1620 - To check if still needed
  if (targetMid === PEER_TYPE.MCU) {
    logger.log.INFO('Creating an empty transceiver of kind video with MCU');
    if (typeof rtcPeerConnection.addTransceiver === 'function') {
      rtcPeerConnection.addTransceiver('video');
    }
  }

  if (rtcPeerConnection.restartIce) {
    state.enableIceRestart = true;
  }

  Skylink.setSkylinkState(state, currentRoom.id);

  /* CALLBACKS */
  rtcPeerConnection.ontrack = callbacks.ontrack.bind(rtcPeerConnection, ...callbackExtraParams);
  rtcPeerConnection.ondatachannel = callbacks.ondatachannel.bind(rtcPeerConnection, ...callbackExtraParams);
  rtcPeerConnection.onicecandidate = callbacks.onicecandidate.bind(rtcPeerConnection, ...callbackExtraParams);
  rtcPeerConnection.oniceconnectionstatechange = callbacks.oniceconnectionstatechange.bind(rtcPeerConnection, ...callbackExtraParams);
  rtcPeerConnection.onconnectionstatechange = callbacks.onconnectionstatechange.bind(rtcPeerConnection, ...callbackExtraParams);
  rtcPeerConnection.onsignalingstatechange = callbacks.onsignalingstatechange.bind(rtcPeerConnection, ...callbackExtraParams);
  rtcPeerConnection.onicegatheringstatechange = callbacks.onicegatheringstatechange.bind(rtcPeerConnection, ...callbackExtraParams);

  if (isAgent(BROWSER_AGENT.REACT_NATIVE)) {
    rtcPeerConnection.onsenderadded = callbacks.onsenderadded.bind(rtcPeerConnection, ...callbackExtraParams);
    rtcPeerConnection.onremovetrack = callbacks.onremovetrack.bind(rtcPeerConnection, targetMid, state.room, false);
  }

  return rtcPeerConnection;
};

/**
 * Function that creates the Peer Connection.
 * @param {JSON} params
 * @return {RTCPeerConnection} peerConnection
 * @memberOf PeerConnection.PeerConnectionHelpers
 * @fires HANDSHAKE_PROGRESS
 */
const createPeerConnection = (params) => {
  let peerConnection = null;
  const {
    currentRoom,
    targetMid,
    cert,
    hasScreenShare,
  } = params;
  const state = Skylink.getSkylinkState(currentRoom.id);
  const { room } = state;
  const constraints = Object.assign({ iceServers: room.connection.peerConfig.iceServers }, retrieveConfig(CONFIG_NAME.PEER_CONNECTION, { rid: currentRoom.id }));

  if (cert) {
    constraints.certificates = [cert];
  }

  Skylink.setSkylinkState(state, currentRoom.id);

  try {
    peerConnection = createNativePeerConnection(targetMid, constraints, hasScreenShare, currentRoom);
    peerConnection.constraints = constraints;
  } catch (error) {
    logger.log.ERROR([targetMid, null, null, 'Failed creating peer connection:'], error);
    peerConnection = null;
    dispatchEvent(handshakeProgress({
      state: HANDSHAKE_PROGRESS.ERROR,
      peerId: targetMid,
      error,
      room: Room.getRoomInfo(room.id),
    }));
  }

  return peerConnection;
};

export default createPeerConnection;
