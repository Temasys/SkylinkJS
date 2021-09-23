import { DATA_CHANNEL_STATE } from '../../../../constants';
import Skylink from '../../../../index';
import PeerMedia from '../../../../peer-media';

const updateStateInformation = (state, message) => {
  const updatedState = state;
  const {
    userInfo, rid, mid, mediaInfoList,
  } = message;
  const { room } = updatedState;
  const updatedUserInfo = userInfo;
  const targetMid = mid;

  if (userInfo && typeof userInfo === 'object') {
    updatedUserInfo.settings.data = !!(updatedState.peerDataChannels[targetMid] && updatedState.peerDataChannels[targetMid].main && updatedState.peerDataChannels[targetMid].main.channel && updatedState.peerDataChannels[targetMid].main.channel.readyState === DATA_CHANNEL_STATE.OPEN);
    updatedState.peerInformations[targetMid].settings = updatedUserInfo.settings || {};
    updatedState.peerInformations[targetMid].mediaStatus = updatedUserInfo.mediaStatus || {};
    updatedState.peerInformations[targetMid].userData = updatedUserInfo.userData;
  }

  Skylink.setSkylinkState(updatedState, rid);

  PeerMedia.setPeerMediaInfo(room, targetMid, mediaInfoList);
  PeerMedia.deleteUnavailableMedia(room, targetMid); // mediaState can be unavailable during renegotiation
};

export default updateStateInformation;
