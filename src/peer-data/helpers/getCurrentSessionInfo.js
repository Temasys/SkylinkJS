import clone from 'clone';
import Skylink from '../../index';
import { isAObj, isABoolean, isANumber } from '../../utils/helpers';
import { SDK_VERSION } from '../../constants';

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
  const { AdapterJS } = window;
  const { enableDataChannel, codecParams } = initOptions;
  const { roomName } = room;
  const {
    streamsMediaStatus,
    userData,
    peerPriorityWeight,
    enableIceRestart,
    publishOnly,
    SMProtocolVersion,
    DTProtocolVersion,
    streams,
    streamsBandwidthSettings,
    sdpSettings,
    user,
  } = state;

  const peerInfo = {
    userData,
    settings: {
      audio: false,
      video: false,
    },
    mediaStatus: {},
    agent: {
      name: AdapterJS.webrtcDetectedBrowser,
      version: AdapterJS.webrtcDetectedVersion,
      os: window.navigator.platform,
      pluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
      SMProtocolVersion,
      DTProtocolVersion,
      SDKVersion: SDK_VERSION,
    },
    room: roomName,
    config: {
      enableDataChannel,
      enableIceRestart,
      priorityWeight: peerPriorityWeight,
      receiveOnly: false,
      publishOnly,
    },
    sid: user.sid,
    screenshare: false,
  };

  if (streams && streams.userMedia) {
    const streamIds = Object.keys(streams.userMedia);
    if (streams.userMedia[streamIds[0]]) { // assume that all the streams have the same settings
      peerInfo.settings = clone(streams.userMedia[streamIds[0]].settings);
    }
  }

  peerInfo.mediaStatus = streamsMediaStatus;

  peerInfo.userData = userData || null;

  peerInfo.config.receiveOnly = !peerInfo.settings.video && !peerInfo.settings.audio;

  if (streams.screenshare) {
    peerInfo.screenshare = true;
  }

  peerInfo.settings.maxBandwidth = clone(streamsBandwidthSettings.bAS);
  peerInfo.settings.googleXBandwidth = clone(streamsBandwidthSettings.googleX);

  if (peerInfo.settings.bandwidth) {
    peerInfo.settings.maxBandwidth = clone(peerInfo.settings.bandwidth);
    delete peerInfo.settings.bandwidth;
  }

  peerInfo.settings.data = enableDataChannel && sdpSettings.connection.data;

  if (peerInfo.settings.audio && isAObj(peerInfo.settings.audio)) {
    // Override the settings.audio.usedtx
    if (isABoolean(typeof codecParams.audio.opus.stereo)) {
      peerInfo.settings.audio.stereo = codecParams.audio.opus.stereo;
    }
    // Override the settings.audio.usedtx
    if (isABoolean(codecParams.audio.opus.usedtx)) {
      peerInfo.settings.audio.usedtx = codecParams.audio.opus.usedtx;
    }
    // Override the settings.audio.maxplaybackrate
    if (isANumber(codecParams.audio.opus.maxplaybackrate)) {
      peerInfo.settings.audio.maxplaybackrate = codecParams.audio.opus.maxplaybackrate;
    }
    // Override the settings.audio.useinbandfec
    if (isABoolean(codecParams.audio.opus.useinbandfec)) {
      peerInfo.settings.audio.useinbandfec = codecParams.audio.opus.useinbandfec;
    }
  }

  if (peerInfo.settings.video && isAObj(peerInfo.settings.video)) {
    peerInfo.settings.video.customSettings = {};

    if (peerInfo.settings.video.frameRate && isAObj(peerInfo.settings.video.frameRate)) {
      peerInfo.settings.video.customSettings.frameRate = clone(peerInfo.settings.video.frameRate);
      peerInfo.settings.video.frameRate = -1;
    }

    if (peerInfo.settings.video.facingMode && isAObj(peerInfo.settings.video.facingMode)) {
      peerInfo.settings.video.customSettings.facingMode = clone(peerInfo.settings.video.facingMode);
      peerInfo.settings.video.facingMode = '-1';
    }

    if (peerInfo.settings.video.resolution && isAObj(peerInfo.settings.video.resolution)) {
      if (peerInfo.settings.video.resolution.width && isAObj(peerInfo.settings.video.resolution.width)) {
        peerInfo.settings.video.customSettings.width = clone(peerInfo.settings.video.width);
        peerInfo.settings.video.resolution.width = -1;
      }

      if (peerInfo.settings.video.resolution.height && isAObj(peerInfo.settings.video.resolution.height)) {
        peerInfo.settings.video.customSettings.height = clone(peerInfo.settings.video.height);
        peerInfo.settings.video.resolution.height = -1;
      }
    }
  }

  if (!peerInfo.settings.audio && !peerInfo.settings.video) {
    peerInfo.config.receiveOnly = true;
    peerInfo.config.publishOnly = false;
  }

  return clone(peerInfo);
};

export default getCurrentSessionInfo;
