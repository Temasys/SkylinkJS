import Skylink from '../../..';
import logger from '../../../logger';
import { PEER_CONNECTION_STATE, TAGS } from '../../../constants';
import SkylinkSignalingServer from '../../../server-communication/signaling-server';
import MESSAGES from '../../../messages';
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
  const {
    peerConnections, peerCustomConfigs, peerEndOfCandidatesCounter, room, user,
  } = state;
  const { doIceRestart, bwOptions } = options;
  const signaling = new SkylinkSignalingServer();
  const errors = [];

  return new Promise((resolve) => {
    // reject with wrong peerId
    if (!peerConnections[peerId]) {
      logger.log.ERROR([peerId, null, null, MESSAGES.PEER_CONNECTION.ERRORS.NOT_FOUND]);
      errors.push(MESSAGES.PEER_CONNECTION.ERRORS.NOT_FOUND);
      return resolve([peerId, errors]);
    }

    const peerConnection = peerConnections[peerId];

    if (errors.length !== 0) {
      return resolve([peerId, errors]);
    }

    // Let's check if the signalingState is stable first.
    // In another galaxy or universe, where the local description gets dropped..
    // In the offerHandler or answerHandler, do the appropriate flags to ignore or drop "extra" descriptions
    if (peerConnection.signalingState === PEER_CONNECTION_STATE.STABLE) {
      logger.log.INFO([peerId, null, null, MESSAGES.PEER_CONNECTION.REFRESH_CONNECTION.SEND_RESTART_OFFER], {
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

    logger.log.DEBUG([peerId, TAGS.PEER_CONNECTION, null, MESSAGES.PEER_CONNECTION.REFRESH_CONNECTION.NO_LOCAL_DESCRIPTION], {
      localDescription: peerConnection.localDescription,
      remoteDescription: peerConnection.remoteDescription,
      signalingState: peerConnection.signalingState,
    });
    errors.push(MESSAGES.PEER_CONNECTION.REFRESH_CONNECTION.NO_LOCAL_DESCRIPTION);

    resolve([peerId, errors]);

    return null;
  });
};

export default restartPeerConnection;
