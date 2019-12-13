import Skylink from '../../../index';
import sendRestartOfferMsg from './sendRestartOfferMsg';
import { PEER_TYPE } from '../../../constants';

/**
 * @param {SkylinkState} roomState
 * @param {boolean} [doIceRestart = false]
 * @param {Object} [bwOptions = {}]
 * @param {JSON} bwOptions.bandwidth
 * @param {JSON} bwOptions.googleXBandwidth
 * @returns {Promise}
 * @memberof PeerConnection.PeerConnectionHelpers
 */
const restartMCUConnection = (roomState, doIceRestart, bwOptions) => new Promise((resolve) => {
  const updatedRoomState = roomState;
  const initOptions = Skylink.getInitOptions();
  const { mcuUseRenegoRestart } = initOptions;

  try {
    if (bwOptions.bandwidth && typeof bwOptions.bandwidth === 'object') {
      if (typeof bwOptions.bandwidth.audio === 'number') {
        updatedRoomState.streamsBandwidthSettings.bAS.audio = bwOptions.bandwidth.audio;
      }
      if (typeof bwOptions.bandwidth.video === 'number') {
        updatedRoomState.streamsBandwidthSettings.bAS.video = bwOptions.bandwidth.video;
      }
      if (typeof bwOptions.bandwidth.data === 'number') {
        updatedRoomState.streamsBandwidthSettings.bAS.data = bwOptions.bandwidth.data;
      }
    }

    if (bwOptions.googleXBandwidth && typeof bwOptions.googleXBandwidth === 'object') {
      if (typeof bwOptions.googleXBandwidth.min === 'number') {
        updatedRoomState.streamsBandwidthSettings.googleX.min = bwOptions.googleXBandwidth.min;
      }
      if (typeof bwOptions.googleXBandwidth.max === 'number') {
        updatedRoomState.streamsBandwidthSettings.googleX.max = bwOptions.googleXBandwidth.max;
      }
    }

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
