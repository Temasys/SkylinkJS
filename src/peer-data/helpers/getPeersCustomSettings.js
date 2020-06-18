import clone from 'clone';
import { isEmptyObj } from '../../utils/helpers';
import { PEER_CONNECTION_STATE, PEER_TYPE, TAGS } from '../../constants';
import PeerData from '../index';
import logger from '../../logger';
import MESSAGES from '../../messages';

const hasPeers = peerInformations => !isEmptyObj(peerInformations);

/**
 * Function that gets a current custom Peer settings.
 * @param {SkylinkState} state
 * @param {String} peerId
 * @private
 * @return {Object}
 * @memberOf PeerDataHelpers
 */
const getPeerCustomSettings = (state, peerId) => {
  const usePeerId = state.hasMCU ? PEER_TYPE.MCU : peerId;
  let customSettings = {};

  if (state.peerConnections[usePeerId].connectionState !== PEER_CONNECTION_STATE.CLOSED) {
    const peerInfo = PeerData.getPeerInfo(peerId, state.room);

    customSettings = clone(peerInfo.settings);
  } else {
    logger.log.WARN([peerId, TAGS.PEER_CONNECTION, null, MESSAGES.PEER_CONNECTION.NO_PEER_CONNECTION]);
  }

  return customSettings;
};

/**
 * @description Function that gets the list of current custom Peer settings sent and set.
 * @param {SkylinkState} roomState
 * @return {Object} customSettingsList
 * @memberOf PeerDataHelpers
 */
const getPeersCustomSettings = (roomState) => {
  const { peerInformations } = roomState;
  const customSettingsList = {};

  if (hasPeers(peerInformations)) {
    const peerIds = Object.keys(peerInformations);

    for (let peerId = 0; peerId < peerIds.length; peerId += 1) {
      if (peerIds[peerId] !== PEER_TYPE.MCU) {
        customSettingsList[peerIds[peerId]] = getPeerCustomSettings(roomState, peerIds[peerId]);
      }
    }

    return customSettingsList;
  }

  return customSettingsList;
};

export default getPeersCustomSettings;
