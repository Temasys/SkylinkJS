import clone from 'clone';
import { isEmptyObj } from '../../utils/helpers';
import { PEER_CONNECTION_STATE, PEER_TYPE } from '../../constants';
import PeerData from '../index';

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

  if (state.peerConnections[usePeerId].signalingState !== PEER_CONNECTION_STATE.CLOSED) {
    const peerInfo = PeerData.getPeerInfo(usePeerId, state.room);

    customSettings = clone(peerInfo.settings);
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
      customSettingsList[peerIds[peerId]] = getPeerCustomSettings(roomState, peerIds[peerId]);
    }

    return customSettingsList;
  }

  return customSettingsList;
};

export default getPeersCustomSettings;
