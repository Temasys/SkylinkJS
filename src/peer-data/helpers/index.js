import getPeerInfo from './getPeerInfo';
import getCurrentSessionInfo from './getCurrentSessionInfo';
import getUserInfo from './getUserInfo';
import getUserData from './getUserData';
import setUserData from './setUserData';
import getPeersStreams from './getPeersStreams';
import getPeersDataChannels from './getPeersDataChannels';
import getPeersCustomSettings from './getPeersCustomSettings';

/**
 * @namespace PeerDataHelpers
 * @description All helper and utility functions for <code>{@link PeerData}</code> class are listed here.
 * @private
 * @type {{getCurrentSessionInfo, getPeerInfo, getUserData, getUserInfo, setUserData, getPeersStreams, getPeersDataChannels, getPeersCustomSettings}}
 */
const helpers = {
  getPeerInfo,
  getCurrentSessionInfo,
  getUserInfo,
  getUserData,
  setUserData,
  getPeersStreams,
  getPeersDataChannels,
  getPeersCustomSettings,
};

export default helpers;
