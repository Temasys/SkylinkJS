import clone from 'clone';
import Skylink from '../../index';
import { SDK_VERSION, DT_PROTOCOL_VERSION, SM_PROTOCOL_VERSION } from '../../constants';
import Room from '../../room';

/**
 * @description Function that returns the current session peerInfo is peer isSelf.
 * @private
 * @param {SkylinkRoom} room
 * @return {peerInfo}
 * @memberOf PeerDataHelpers
 */
const getCurrentSessionInfo = (room) => {
  const state = Skylink.getSkylinkState(room.id);
  const initOptions = Skylink.getInitOptions();
  const { AdapterJS, navigator } = window;
  const { enableDataChannel } = initOptions;
  const {
    streamsMediaStatus,
    peerPriorityWeight,
    enableIceRestart,
    peerStreams,
    streamsBandwidthSettings,
    streamsSettings,
    user,
  } = state;

  const peerInfo = {
    userData: '',
    settings: {
      audio: false,
      video: false,
    },
    mediaStatus: {},
    agent: {
      name: AdapterJS.webrtcDetectedBrowser,
      version: AdapterJS.webrtcDetectedVersion,
      os: navigator.platform,
      pluginVersion: null,
      SMProtocolVersion: SM_PROTOCOL_VERSION,
      DTProtocolVersion: DT_PROTOCOL_VERSION,
      SDKVersion: SDK_VERSION,
    },
    room: Room.getRoomInfo(room.id),
    config: {
      enableDataChannel,
      enableIceRestart,
      priorityWeight: peerPriorityWeight,
    },
    sid: user.sid,
  };

  if (peerStreams[user.sid]) {
    const streamIds = Object.keys(peerStreams[user.sid]);
    streamIds.forEach((id) => {
      if (streamsSettings[id].settings.audio) {
        peerInfo.settings.audio = peerInfo.settings.audio || {};
        peerInfo.settings.audio[id] = clone(streamsSettings[id].settings.audio);
      } else if (streamsSettings[id].settings.video) {
        peerInfo.settings.video = peerInfo.settings.video || {};
        peerInfo.settings.video[id] = clone(streamsSettings[id].settings.video);
      }
    });
  }

  peerInfo.mediaStatus = streamsMediaStatus;
  peerInfo.userData = user.userData || null;
  peerInfo.settings.maxBandwidth = clone(streamsBandwidthSettings.bAS);
  peerInfo.settings.data = enableDataChannel;

  return clone(peerInfo);
};

export default getCurrentSessionInfo;
