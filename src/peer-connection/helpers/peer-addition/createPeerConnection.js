import {
  BUNDLE_POLICY, HANDSHAKE_PROGRESS, PEER_TYPE, BROWSER_AGENT, TAGS,
} from '../../../constants';
import Skylink from '../../../index';
import logger from '../../../logger';
import callbacks from './callbacks/index';
import { dispatchEvent } from '../../../utils/skylinkEventManager';
import { handshakeProgress } from '../../../skylink-events';
import { updateRemoveStream } from '../../../compatibility/index';
import MESSAGES from '../../../messages';

const createNativePeerConnection = (targetMid, constraints, optional, hasScreenShare, currentRoom) => {
  const initOptions = Skylink.getInitOptions();
  const state = Skylink.getSkylinkState(currentRoom.id);
  const { AdapterJS } = window;
  logger.log.DEBUG([targetMid, TAGS.PEER_CONNECTION, null, MESSAGES.PEER_CONNECTION.CREATE_NEW], {
    constraints,
    optional,
  });
  const { RTCPeerConnection, msRTCPeerConnection } = window;
  const rtcPeerConnection = new (initOptions.useEdgeWebRTC && msRTCPeerConnection ? window.msRTCPeerConnection : RTCPeerConnection)(constraints, optional);
  const callbackExtraParams = [rtcPeerConnection, targetMid, state];

  // attributes (added on by Temasys)
  rtcPeerConnection.setOffer = '';
  rtcPeerConnection.setAnswer = '';
  rtcPeerConnection.negotiating = false;
  rtcPeerConnection.hasStream = false;
  rtcPeerConnection.hasMainChannel = false;
  rtcPeerConnection.firefoxStreamId = '';
  rtcPeerConnection.processingLocalSDP = false;
  rtcPeerConnection.processingRemoteSDP = false;
  rtcPeerConnection.gathered = false;
  rtcPeerConnection.gathering = false;
  rtcPeerConnection.localStream = null;
  rtcPeerConnection.localStreamId = null;

  // Used for safari 11
  rtcPeerConnection.iceConnectionStateClosed = false;
  rtcPeerConnection.signalingStateClosed = false;

  // candidates
  state.gatheredCandidates[targetMid] = {
    sending: { host: [], srflx: [], relay: [] },
    receiving: { host: [], srflx: [], relay: [] },
  };

  // self._streamsSession[targetMid] = self._streamsSession[targetMid] || {}; from SkylinkJS
  state.peerEndOfCandidatesCounter[targetMid] = state.peerEndOfCandidatesCounter[targetMid] || {};
  state.sdpSessions[targetMid] = { local: {}, remote: {} };
  state.peerBandwidth[targetMid] = {};
  // state.peerStats[targetMid] = {}; // initialised only after peerConnationStatus === 'completed'

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

  if (AdapterJS.webrtcDetectedBrowser === 'firefox') {
    rtcPeerConnection.removeStream = updateRemoveStream(rtcPeerConnection);
  }

  /* CALLBACKS */
  rtcPeerConnection.ontrack = callbacks.ontrack.bind(rtcPeerConnection, ...callbackExtraParams);
  rtcPeerConnection.ondatachannel = callbacks.ondatachannel.bind(rtcPeerConnection, ...callbackExtraParams);
  rtcPeerConnection.onicecandidate = callbacks.onicecandidate.bind(rtcPeerConnection, ...callbackExtraParams);
  rtcPeerConnection.oniceconnectionstatechange = callbacks.oniceconnectionstatechange.bind(rtcPeerConnection, ...callbackExtraParams);
  rtcPeerConnection.onsignalingstatechange = callbacks.onsignalingstatechange.bind(rtcPeerConnection, ...callbackExtraParams);
  rtcPeerConnection.onicegatheringstatechange = callbacks.onicegatheringstatechange.bind(rtcPeerConnection, ...callbackExtraParams);

  if (AdapterJS.webrtcDetectedBrowser === BROWSER_AGENT.REACT_NATIVE) {
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
 * @fires handshakeProgress
 */
const createPeerConnection = (params) => {
  let peerConnection = null;
  const {
    currentRoom,
    targetMid,
    cert,
    hasScreenShare,
  } = params;
  const initOptions = Skylink.getInitOptions();
  const { filterCandidatesType } = initOptions;
  const state = Skylink.getSkylinkState(currentRoom.id);
  const {
    peerConnectionConfig,
    room,
  } = state;
  const constraints = {
    iceServers: state.room.connection.peerConfig.iceServers,
    iceTransportPolicy: filterCandidatesType.host && filterCandidatesType.srflx && !filterCandidatesType.relay ? 'relay' : 'all',
    bundlePolicy: peerConnectionConfig.bundlePolicy === BUNDLE_POLICY.NONE ? BUNDLE_POLICY.BALANCED : peerConnectionConfig.bundlePolicy,
    rtcpMuxPolicy: peerConnectionConfig.rtcpMuxPolicy,
    iceCandidatePoolSize: peerConnectionConfig.iceCandidatePoolSize,
  };
  const optional = {
    optional: [
      { DtlsSrtpKeyAgreement: true },
      { googIPv6: true },
    ],
  };

  if (cert) {
    constraints.certificates = [cert];
  }

  if (state.peerConnStatus[targetMid]) {
    state.peerConnStatus[targetMid].constraints = constraints;
    state.peerConnStatus[targetMid].optional = optional;
  }

  Skylink.setSkylinkState(state, currentRoom.id);

  try {
    peerConnection = createNativePeerConnection(targetMid, constraints, optional, hasScreenShare, currentRoom);
  } catch (error) {
    logger.log.ERROR([targetMid, null, null, 'Failed creating peer connection:'], error);
    peerConnection = null;
    dispatchEvent(handshakeProgress({
      state: HANDSHAKE_PROGRESS.ERROR,
      peerId: targetMid,
      error,
      room,
    }));
  }

  return peerConnection;
};

export default createPeerConnection;
