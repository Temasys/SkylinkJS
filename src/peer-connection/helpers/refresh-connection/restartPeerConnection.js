import Skylink from '../../..';
import logger from '../../../logger';
import { PEER_CONNECTION_STATE } from '../../../constants';
import SkylinkSignalingServer from '../../../server-communication/signaling-server';
import messages from '../../../messages';
import sendRestartOfferMsg from './sendRestartOfferMsg';

/**
 * Function that sends restart message to the signaling server.
 * @param {String} peerId
 * @param {SkylinkState} roomState
 * @param {Object} options
 * @param {Object} options.bandwidth
 * @param {Object} options.googleXBandwidth
 * @return {Promise}
 * @memberOf PeerConnection.PeerConnectionHelpers
 */
const restartPeerConnection = (peerId, roomState, options) => {
  const state = Skylink.getSkylinkState(roomState.room.id);
  const { AdapterJS } = window;
  const {
    peerConnections, peerCustomConfigs, peerEndOfCandidatesCounter, room, user,
  } = state;
  const { doIceRestart, bwOptions } = options;
  const signaling = new SkylinkSignalingServer();
  const { PEER_CONNECTION } = messages;
  const errors = [];

  return new Promise((resolve) => {
    // reject with wrong peerId
    if (!peerConnections[peerId]) {
      logger.log.ERROR([peerId, null, null, PEER_CONNECTION.refresh_peerId_no_match]);
      errors.push(PEER_CONNECTION.refresh_peerId_no_match);
      return resolve([peerId, errors]);
    }

    const peerConnection = peerConnections[peerId];
    // refresh not supported in edge
    if (AdapterJS.webrtcDetectedBrowser === 'edge') {
      logger.log.WARN([peerId, 'RTCPeerConnection', null, PEER_CONNECTION.refresh_not_supported]);
      errors.push(PEER_CONNECTION.refresh_no_edge_support);
    }

    if (errors.length !== 0) {
      return resolve([peerId, errors]);
    }

    // Let's check if the signalingState is stable first.
    // In another galaxy or universe, where the local description gets dropped..
    // In the offerHandler or answerHandler, do the appropriate flags to ignore or drop "extra" descriptions
    if (peerConnection.signalingState === PEER_CONNECTION_STATE.STABLE) {
      logger.log.INFO([peerId, null, null, 'Sending restart message to signaling server ->'], {
        iceRestart: doIceRestart,
        options: bwOptions,
      });

      peerCustomConfigs[peerId] = peerCustomConfigs[peerId] || {};
      peerCustomConfigs[peerId].bandwidth = peerCustomConfigs[peerId].bandwidth || {};
      peerCustomConfigs[peerId].googleXBandwidth = peerCustomConfigs[peerId].googleXBandwidth || {};

      if (bwOptions.bandwidth && typeof bwOptions.bandwidth === 'object') {
        if (typeof bwOptions.bandwidth.audio === 'number') {
          peerCustomConfigs[peerId].bandwidth.audio = bwOptions.bandwidth.audio;
        }
        if (typeof bwOptions.bandwidth.video === 'number') {
          peerCustomConfigs[peerId].bandwidth.video = bwOptions.bandwidth.video;
        }
        if (typeof bwOptions.bandwidth.data === 'number') {
          peerCustomConfigs[peerId].bandwidth.data = bwOptions.bandwidth.data;
        }
      }

      if (bwOptions.googleXBandwidth && typeof bwOptions.googleXBandwidth === 'object') {
        if (typeof bwOptions.googleXBandwidth.min === 'number') {
          peerCustomConfigs[peerId].googleXBandwidth.min = bwOptions.googleXBandwidth.min;
        }
        if (typeof bwOptions.googleXBandwidth.max === 'number') {
          peerCustomConfigs[peerId].googleXBandwidth.max = bwOptions.googleXBandwidth.max;
        }
      }

      peerEndOfCandidatesCounter[peerId] = peerEndOfCandidatesCounter[peerId] || {};
      peerEndOfCandidatesCounter[peerId].len = 0;

      return resolve(sendRestartOfferMsg(state, peerId, doIceRestart));
    }

    // Checks if the local description is defined first
    const hasLocalDescription = peerConnection.localDescription && peerConnection.localDescription.sdp;
    // This is when the state is stable and re-handshaking is possible
    // This could be due to previous connection handshaking that is already done
    if (peerConnection.signalingState === PEER_CONNECTION_STATE.HAVE_LOCAL_OFFER && hasLocalDescription) {
      signaling.sendMessage({
        type: peerConnection.localDescription.type,
        sdp: peerConnection.localDescription.sdp,
        mid: user.sid,
        target: peerId,
        rid: room.id,
        restart: true,
      });
      return resolve(peerId);
    }

    const unableToRestartError = `Failed restarting as peer connection state is ${peerConnection.signalingState} and there is no localDescription set to connection. There could be a handshaking step error.`;
    logger.log.DEBUG([peerId, 'RTCPeerConnection', null, unableToRestartError], {
      localDescription: peerConnection.localDescription,
      remoteDescription: peerConnection.remoteDescription,
    });
    errors.push(unableToRestartError);

    resolve([peerId, errors]);

    return null;
  });
};

export default restartPeerConnection;
