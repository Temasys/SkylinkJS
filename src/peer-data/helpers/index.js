import getPeerInfo from './getPeerInfo';
import getCurrentSessionInfo from './getCurrentSessionInfo';
import getUserInfo from './getUserInfo';
import getUserData from './getUserData';
import setUserData from './setUserData';
import getPeersStream from './getPeersStream';
import getPeersDataChannels from './getPeersDataChannels';
import getPeersCustomSettings from './getPeersCustomSettings';
import setGreatestPeerPriorityWeight from './setGreatestPeerPriorityWeight';

/**
 * @namespace PeerDataHelpers
 * @description All helper and utility functions for <code>{@link PeerData}</code> class are listed here.
 * @private
 * @type {{getCurrentSessionInfo, getPeerInfo, getUserData, getUserInfo, setUserData, getPeersStream, getPeersDataChannels, getPeersCustomSettings, setGreatestPeerPriorityWeight}}
 */
const helpers = {
  getPeerInfo,
  getCurrentSessionInfo,
  getUserInfo,
  getUserData,
  setUserData,
  getPeersStream,
  getPeersDataChannels,
  getPeersCustomSettings,
  setGreatestPeerPriorityWeight,
};

export default helpers;
