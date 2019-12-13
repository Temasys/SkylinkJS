import { DATA_CHANNEL_STATE } from '../../constants';

const buildPeerInformations = (userInfo, state) => {
  const peerInfo = userInfo;
  const peerId = peerInfo.sid;

  peerInfo.room = state.room.roomName;
  peerInfo.settings.data = !!(state.dataChannels[peerId] && state.dataChannels[peerId].main && state.dataChannels[peerId].main.channel && state.dataChannels[peerId].main.channel.readyState === DATA_CHANNEL_STATE.OPEN);

  delete peerInfo.publishOnly;

  return peerInfo;
};

export default buildPeerInformations;
