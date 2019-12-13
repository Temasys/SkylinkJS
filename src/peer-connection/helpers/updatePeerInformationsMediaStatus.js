/* eslint-disable no-nested-ternary */
import Skylink from '../../index';
import { hasAudioTrack, hasVideoTrack } from '../../utils/helpers';
import { MEDIA_STATE } from '../../constants';

// Mobile SDK is sending mediaStatus  - audioMuted, videoMuted as a boolean
// 2.0 has switched to storing mediaStatus keyed by streamId with -1, 0 ,1 values
const buildMediaStatus = (state, peerId, transceiver, stream) => {
  const { peerMedias, peerInformations } = state;
  const peerMedia = peerMedias[peerId];
  const mediaStatus = peerInformations[peerId].mediaStatus || {};
  Object.values(peerMedia).forEach((mediaInfo) => {
    if (mediaInfo.transceiverMid === transceiver.mid) {
      mediaStatus[stream.id] = {
        audioMuted: hasAudioTrack(stream) ? (mediaInfo.mediaState === MEDIA_STATE.MUTED ? 0 : 1) : -1,
        videoMuted: hasVideoTrack(stream) ? (mediaInfo.mediaState === MEDIA_STATE.MUTED ? 0 : 1) : -1,
      };
    }
  });

  delete mediaStatus.audioMuted;
  delete mediaStatus.videoMuted;

  return mediaStatus;
};

const updatePeerInformationsMediaStatus = (room, peerId, transceiver, stream) => {
  const updatedState = Skylink.getSkylinkState(room.id);
  const peerInformation = updatedState.peerInformations[peerId];
  peerInformation.mediaStatus = buildMediaStatus(updatedState, peerId, transceiver, stream);
  Skylink.setSkylinkState(updatedState, room.id);
};

export default updatePeerInformationsMediaStatus;
