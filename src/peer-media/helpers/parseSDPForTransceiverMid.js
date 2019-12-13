import SessionDescription from '../../session-description';
import helpers from './index';
import { MEDIA_INFO, MEDIA_STATE } from '../../constants';
import Skylink from '../../index';

const parseSDPForTransceiverMid = (room, peerId, sessionDescription) => {
  const state = Skylink.getSkylinkState(room.id);
  const { peerMedias } = state;
  const mediaInfos = Object.values(peerMedias[peerId]);
  const mediaMids = SessionDescription.getTransceiverMid(sessionDescription);
  const audioMids = mediaMids.audio;
  const videoMids = mediaMids.video;

  for (let m = 0; m < mediaInfos.length; m += 1) {
    const mediaInfo = mediaInfos[m];
    // If mediaState is unavailable, there is no corresponding transceiverMid in the SDP and mediaInfo.transceiverMid will be 'null'. mediaInfo.transceiverMid cannot be 'null'.
    mediaInfo.transceiverMid = mediaInfo.mediaState === MEDIA_STATE.UNAVAILABLE ? mediaInfo.transceiverMid : null;
    for (let a = 0; a < audioMids.length; a += 1) {
      if (audioMids[a].streamId === mediaInfo.streamId && (audioMids[a].direction === 'sendonly' || audioMids[a].direction === 'sendrecv')) {
        helpers.updatePeerMediaInfo(room, peerId, false, mediaInfo.mediaId, MEDIA_INFO.TRANSCEIVER_MID, audioMids[a].transceiverMid);
        break;
      }
    }

    for (let v = 0; v < videoMids.length; v += 1) {
      if (videoMids[v].streamId === mediaInfo.streamId && (videoMids[v].direction === 'sendonly' || videoMids[v].direction === 'sendrecv')) {
        helpers.updatePeerMediaInfo(room, peerId, false, mediaInfo.mediaId, MEDIA_INFO.TRANSCEIVER_MID, videoMids[v].transceiverMid);
        break;
      }
    }
  }
};

export default parseSDPForTransceiverMid;
