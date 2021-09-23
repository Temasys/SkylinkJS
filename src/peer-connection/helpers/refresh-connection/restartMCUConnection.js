import Skylink from '../../../index';
import { PEER_TYPE } from '../../../constants';
import { sendRestartOffer } from '../../../server-communication/signaling-server/message-handler/handlers/commons/offerAndAnswer';

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
      resolve(sendRestartOffer(updatedRoomState, PEER_TYPE.MCU, doIceRestart));
    }
  } catch (error) {
    resolve([PEER_TYPE.MCU, error]);
  }
});

export default restartMCUConnection;
