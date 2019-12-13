/* eslint-disable prefer-promise-reject-errors */
import Skylink from '../../../index';
import MESSAGES from '../../../messages';
import logger from '../../../logger';
import PeerConnection from '../../index';
import {
  isEmptyArray, isAObj, isAString, isABoolean,
} from '../../../utils/helpers';
import buildRefreshConnectionResult from './buildRefreshConnectionResult';

const buildResult = (listOfPeers, refreshErrors, refreshSettings) => {
  const result = {};
  result.listOfPeers = listOfPeers;
  result.refreshErrors = refreshErrors;
  result.refreshSettings = refreshSettings;

  return result;
};

const buildPeerRefreshSettings = (listOfPeers, room, doIceRestart) => {
  const refreshSettings = [];

  Object.keys(listOfPeers).forEach((i) => {
    refreshSettings.push(buildRefreshConnectionResult(listOfPeers[i], room, doIceRestart));
  });

  return refreshSettings;
};

const buildPeerRefreshErrors = (peerId, errors) => {
  const peerRefreshError = {};
  peerRefreshError[peerId] = errors;

  return peerRefreshError;
};

const filterParams = (targetPeerId, iceRestart, options, peerConnections) => {
  let doIceRestart = false;
  let bwOptions = {};
  let listOfPeers = Object.keys(peerConnections);

  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
  } else if (isAString(targetPeerId)) {
    listOfPeers = [targetPeerId];
  } else if (isABoolean(targetPeerId)) {
    doIceRestart = targetPeerId;
  } else if (targetPeerId && isAObj(targetPeerId)) {
    bwOptions = targetPeerId;
  }

  if (isABoolean(iceRestart)) {
    doIceRestart = iceRestart;
  } else if (iceRestart && isAObj(iceRestart)) {
    bwOptions = iceRestart;
  }

  if (options && isAObj(options)) {
    bwOptions = options;
  }

  return {
    listOfPeers,
    doIceRestart,
    bwOptions,
  };
};

/**
 * Function that refreshes Peer connections to update with the current streaming.
 * @param {SkylinkState} roomState
 * @param {String} targetPeerId
 * @param {boolean} iceRestart
 * @param {Object} options
 * @param {Object} options.andwidth
 * @param {Object} options.googleXBandwidth
 * @return {Promise}
 * @memberof PeerConnection
 */
const refreshConnection = (roomState, targetPeerId, iceRestart, options) => new Promise((resolve, reject) => {
  if (!roomState) {
    reject(new Error(MESSAGES.ROOM_STATE.NO_ROOM_NAME));
  }

  const { peerConnections, hasMCU, room } = roomState;
  const initOptions = Skylink.getInitOptions();
  const { mcuUseRenegoRestart } = initOptions;
  const { PEER_CONNECTION } = MESSAGES;
  const params = filterParams(targetPeerId, iceRestart, options, peerConnections);
  const { listOfPeers, doIceRestart, bwOptions } = params;

  try {
    if (isEmptyArray(listOfPeers) && !(hasMCU && !mcuUseRenegoRestart)) {
      logger.log.ERROR(PEER_CONNECTION.refresh_no_peer_connection);
      reject({
        refreshErrors: { self: PEER_CONNECTION.refresh_no_peer_connection },
        listOfPeers,
      });
    }

    logger.log.INFO([null, 'PeerConnection', null, PEER_CONNECTION.refresh_start]);

    const refreshPeerConnectionPromises = PeerConnection.refreshPeerConnection(listOfPeers, roomState, doIceRestart, bwOptions);
    refreshPeerConnectionPromises
      .then((results) => {
        const mResults = hasMCU ? [results] : results;
        const refreshErrors = [];
        for (let i = 0; i < mResults.length; i += 1) {
          if (Array.isArray(mResults[i])) {
            const error = mResults[i];
            refreshErrors.push(buildPeerRefreshErrors(error[0], error[1]));
            logger.log.WARN([listOfPeers, 'PeerConnection', null, PEER_CONNECTION.refresh_peer_failed], error[0]);
          } else if (typeof mResults[i] === 'string') {
            logger.log.INFO([listOfPeers, 'PeerConnection', null, PEER_CONNECTION.refresh_peer_success], mResults[i]);
          }
        }

        if (refreshErrors.length === listOfPeers.length) {
          reject(buildResult(listOfPeers, refreshErrors, buildPeerRefreshSettings(listOfPeers, room, doIceRestart)));
        } else {
          resolve(buildResult(listOfPeers, refreshErrors, buildPeerRefreshSettings(listOfPeers, room, doIceRestart)));
        }
      })
      .catch(error => logger.log.ERROR([null, 'RTCPeerConnection', null, PEER_CONNECTION.refresh_failed], error))
      .finally(() => logger.log.INFO(PEER_CONNECTION.refresh_completed));
  } catch (error) {
    reject(error);
  }
});

export default refreshConnection;
