import { DATA_CHANNEL_STATE } from '../../constants';

const buildPeerInformations = (userInfo, state) => {
  const peerInfo = userInfo;
  const peerId = peerInfo.sid;

  peerInfo.room = state.room.roomName;
  peerInfo.settings.data = !!(state.peerDataChannels[peerId] && state.peerDataChannels[peerId].main && state.peerDataChannels[peerId].main.channel && state.peerDataChannels[peerId].main.channel.readyState === DATA_CHANNEL_STATE.OPEN);

  return peerInfo;
};

export default buildPeerInformations;
