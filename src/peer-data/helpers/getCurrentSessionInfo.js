import clone from 'clone';
import Skylink from '../../index';
import { SDK_VERSION } from '../../constants';
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
    SMProtocolVersion,
    DTProtocolVersion,
    streams,
    streamsBandwidthSettings,
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
      SMProtocolVersion,
      DTProtocolVersion,
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

  if (streams && streams.userMedia) {
    const streamIds = Object.keys(streams.userMedia);
    streamIds.forEach((id) => {
      if (streams.userMedia[id].settings.audio) {
        peerInfo.settings.audio = peerInfo.settings.audio || {};
        peerInfo.settings.audio[id] = clone(streams.userMedia[id].settings.audio);
      } else if (streams.userMedia[id].settings.video) {
        peerInfo.settings.video = peerInfo.settings.video || {};
        peerInfo.settings.video[id] = clone(streams.userMedia[id].settings.video);
      }
    });
  }

  peerInfo.mediaStatus = streamsMediaStatus;
  peerInfo.userData = user.userData || null;

  if (streams.screenshare) {
    peerInfo.settings.video = peerInfo.settings.video || {};
    peerInfo.settings.video[streams.screenshare.id] = clone(streams.screenshare.settings.video);
    peerInfo.settings.video[streams.screenshare.id].screenshare = true;
  }

  peerInfo.settings.maxBandwidth = clone(streamsBandwidthSettings.bAS);

  peerInfo.settings.data = enableDataChannel;

  return clone(peerInfo);
};

export default getCurrentSessionInfo;
