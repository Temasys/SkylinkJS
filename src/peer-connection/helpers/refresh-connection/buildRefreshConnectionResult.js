import Skylink from '../../../index';
import PeerData from '../../../peer-data';

/**
 * Method that returns the refreshConnection result.
 * @param {string} peerId
 * @param {SkylinkRoom} room
 * @param {boolean} doIceRestart
 * @param {Array} [errors]
 * @private
 */
const buildRefreshConnectionResult = (peerId, room, doIceRestart, errors) => {
  const state = Skylink.getSkylinkState(room.id);
  const { hasMCU, peerInformations, enableIceRestart } = state;
  const peersCustomSettings = PeerData.getPeersCustomSettings(state);
  const result = {};

  result[peerId] = {
    iceRestart: !hasMCU && peerInformations[peerId] && peerInformations[peerId].config
      && peerInformations[peerId].config.enableIceRestart && enableIceRestart && doIceRestart,
    customSettings: peersCustomSettings[peerId] || {},
  };

  if (errors) {
    result.errors = errors;
  }

  return result;
};

export default buildRefreshConnectionResult;
