import Skylink from '../../..';
import logger from '../../../logger';
import restartPeerConnection from './restartPeerConnection';
import restartMCUConnection from './restartMCUConnection';
import MESSAGES from '../../../messages';
import { TAGS } from '../../../constants';

const refreshSinglePeer = (peerId, roomState, options) => restartPeerConnection(peerId, roomState, options);

/**
 * @param {String<Array>}listOfPeers
 * @param {SkylinkState} roomState
 * @param {boolean} [doIceRestart = false]
 * @param {Object} [bwOptions = {}]
 * @param {JSON} bwOptions.bandwidth
 * @param {JSON} bwOptions.googleXBandwidth
 * @returns {Promise}
 * @memberOf PeerConnection.PeerConnectionHelpers
 */
const refreshPeerConnection = (listOfPeers, roomState, doIceRestart = false, bwOptions = {}) => {
  const state = Skylink.getSkylinkState(roomState.room.id);
  const { hasMCU } = state;

  try {
    if (!hasMCU) {
      const restartPeerConnectionPromises = [];
      for (let i = 0; i < listOfPeers.length; i += 1) {
        const peerId = listOfPeers[i];
        const options = {
          doIceRestart,
          bwOptions,
        };
        const restartPeerConnectionPromise = refreshSinglePeer(peerId, state, options);
        restartPeerConnectionPromises.push(restartPeerConnectionPromise);
      }

      return Promise.all(restartPeerConnectionPromises);
    }

    return restartMCUConnection(roomState, doIceRestart, bwOptions);
  } catch (error) {
    logger.log.ERROR([null, TAGS.PEER_CONNECTION, null, MESSAGES.PEER_CONNECTION.REFRESH_CONNECTION.FAILED], error);
    return null;
  }
};

export default refreshPeerConnection;
