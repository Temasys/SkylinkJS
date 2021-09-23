import Skylink from '../../index';
import { DATA_CHANNEL_STATE } from '../../constants';

const buildAndSetPeerInformations = (peerId, userInfo, state) => {
  const updatedState = state;
  const peerInfo = userInfo;

  peerInfo.room = state.room.roomName;
  peerInfo.settings.data = !!(state.peerDataChannels[peerId] && state.peerDataChannels[peerId].main && state.peerDataChannels[peerId].main.channel && state.peerDataChannels[peerId].main.channel.readyState === DATA_CHANNEL_STATE.OPEN);

  updatedState.peerInformations[peerId] = peerInfo;
  Skylink.setSkylinkState(updatedState, state.room.id);

  return peerInfo;
};

export default buildAndSetPeerInformations;
