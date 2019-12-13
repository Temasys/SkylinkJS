import Skylink from '../../../index';
import { SDP_SEMANTICS } from '../../../constants';
import logger from '../../../logger/index';
import createPeerConnection from './createPeerConnection';
import HandleIceConnectionStats from '../../../skylink-stats/handleIceConnectionStats';
import handleIceGatheringStats from '../../../skylink-stats/handleIceGatheringStats';

/**
 * Function that starts the Peer connection session.
 * @param {object} params - options required to create a PeerConnection
 * @param {SkylinkRoom} params.currentRoom - The currrent room
 * @param {string} params.targetMid - Peer's id
 * @param {Object} params.peerBrowser - Peer's user agent object
 * @param {RTCCertificate} params.cert - Represents a certificate that an RTCPeerConnection uses to authenticate.
 * @param {boolean} params.receiveOnly
 * @param {boolean} params.hasScreenshare - Is screenshare enabled
 * @memberOf PeerConnection.PeerConnectionHelpers
 */
const addPeer = (params) => {
  let connection = null;
  const {
    currentRoom,
    targetMid,
    peerBrowser,
    cert,
    receiveOnly,
    hasScreenShare,
  } = params;
  const initOptions = Skylink.getInitOptions();
  const state = Skylink.getSkylinkState(currentRoom.id);
  const { peerConnections, room } = state;
  const handleIceConnectionStats = new HandleIceConnectionStats();

  if (!peerConnections[targetMid]) {
    state.peerConnStatus[targetMid] = {
      connected: false,
      init: false,
    };

    logger.log.INFO([targetMid, null, null, 'Starting the connection to peer. Options provided:'], {
      peerBrowser,
      receiveOnly,
      enableDataChannel: initOptions.enableDataChannel,
    });

    connection = createPeerConnection({
      currentRoom,
      targetMid,
      hasScreenShare,
      cert,
      sdpSemantics: SDP_SEMANTICS.UNIFIED,
    });

    try {
      const config = connection.getConfiguration();
      // connection.addTransceiver("video");
      if (config.sdpSemantics === SDP_SEMANTICS.UNIFIED) {
        logger.log.INFO([targetMid, 'SDP Semantics', null, 'Peer Connection has Unified plan.']);
      } else if (config.sdpSemantics === SDP_SEMANTICS.PLAN_B) {
        logger.log.INFO([targetMid, 'SDP Semantics', null, 'Peer Connection has Plan-B.']);
      } else {
        logger.log.INFO([targetMid, 'SDP Semantics', null, 'The sdpSemantics parameter is not supported by this browser version.']);
      }
    } catch (ex) {
      logger.log.INFO([targetMid, 'SDP Semantics', null, 'getConfiguration() is not available in this browser version. Ex : '], ex);
    }

    state.peerConnections[targetMid] = connection;
    Skylink.setSkylinkState(state, currentRoom.id);
    handleIceConnectionStats.send(room.id, connection.iceConnectionState, targetMid);
    handleIceGatheringStats.send(room.id, 'new', targetMid, false);
  } else {
    logger.log.WARN([targetMid, null, null, 'Connection to peer has already been made.']);
  }

  return connection;
};

export default addPeer;
