import Skylink from '../../../index';
import sendRestartOfferMsg from './sendRestartOfferMsg';
import { PEER_TYPE } from '../../../constants';

/**
 * @param {SkylinkState} roomState
 * @param {boolean} [doIceRestart = false]
 * @param {Object} [bwOptions = {}]
 * @param {JSON} bwOptions.bandwidth
 * @returns {Promise}
 * @memberOf PeerConnection.PeerConnectionHelpers
 */
const restartMCUConnection = (roomState, doIceRestart, bwOptions) => new Promise((resolve) => {
  const updatedRoomState = roomState;
  const initOptions = Skylink.getInitOptions();
  const { mcuUseRenegoRestart } = initOptions;

  try {
    updatedRoomState.streamsBandwidthSettings.bAS = bwOptions.bandwidth || updatedRoomState.streamsBandwidthSettings.bAS;

    if (mcuUseRenegoRestart) {
      updatedRoomState.peerEndOfCandidatesCounter.MCU = updatedRoomState.peerEndOfCandidatesCounter.MCU || {};
      updatedRoomState.peerEndOfCandidatesCounter.MCU.len = 0;

      Skylink.setSkylinkState(updatedRoomState);
      resolve(sendRestartOfferMsg(updatedRoomState, PEER_TYPE.MCU, doIceRestart));
    }
  } catch (error) {
    resolve([PEER_TYPE.MCU, error]);
  }
});

export default restartMCUConnection;
