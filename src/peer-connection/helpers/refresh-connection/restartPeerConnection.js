import Skylink from '../../..';
import logger from '../../../logger';
import { PEER_CONNECTION_STATE, TAGS } from '../../../constants';
import SkylinkSignalingServer from '../../../server-communication/signaling-server';
import MESSAGES from '../../../messages';
import { sendRestartOffer } from '../../../server-communication/signaling-server/message-handler/handlers/commons/offerAndAnswer';

/**
 * Function that sends restart message to the signaling server.
 * @param {String} peerId
 * @param {SkylinkState} roomState
 * @param {Object} options
 * @param {Object} options.bandwidth
 * @return {Promise}
 * @memberOf PeerConnection.PeerConnectionHelpers
 */
const restartPeerConnection = (peerId, roomState, options) => {
  const updateState = Skylink.getSkylinkState(roomState.room.id);
  const {
    peerConnections, streamsBandwidthSettings, peerEndOfCandidatesCounter, room, user,
  } = updateState;
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

      updateState.streamsBandwidthSettings.bAS = bwOptions.bandwidth || streamsBandwidthSettings.bAS;
      updateState.peerEndOfCandidatesCounter[peerId] = peerEndOfCandidatesCounter[peerId] || {};
      updateState.peerEndOfCandidatesCounter[peerId].len = 0;
      Skylink.setSkylinkState(updateState, updateState.room.id);

      return resolve(sendRestartOffer(updateState, peerId, doIceRestart));
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
