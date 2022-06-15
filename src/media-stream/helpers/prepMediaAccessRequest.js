import helpers from './index';
import messages from '../../messages';
import { TRACK_KIND } from '../../constants';
import muteStreams from './muteStreams';
import Skylink from '../../index';

/**
 * @description Helper function for {@link MediaStream.getUserMedia}
 * @param {getUserMediaOptions} params - The camera Stream configuration options.
 * @memberOf MediaStreamHelpers
 * @return {Promise}
 */
const prepMediaAccessRequest = params => new Promise((resolve, reject) => {
  const { roomKey } = params;
  const audioSettings = helpers.parseStreamSettings(params, TRACK_KIND.AUDIO);
  const videoSettings = helpers.parseStreamSettings(params, TRACK_KIND.VIDEO);
  const { AdapterJS } = window;

  if (!audioSettings.getUserMediaSettings.audio && !videoSettings.getUserMediaSettings.video) {
    reject(messages.MEDIA_STREAM.ERRORS.INVALID_GUM_OPTIONS);
  }

  AdapterJS.webRTCReady(() => {
    window.navigator.mediaDevices.getUserMedia({ audio: audioSettings.getUserMediaSettings.audio, video: videoSettings.getUserMediaSettings.video }).then((stream) => {
      const isAudioFallback = false;

      const streams = helpers.onStreamAccessSuccess(roomKey, stream, audioSettings, videoSettings, isAudioFallback);
      const state = Skylink.getSkylinkState(roomKey);
      if (streams[0] && audioSettings.mutedSettings.shouldAudioMuted) {
        muteStreams(state, { audioMuted: audioSettings.mutedSettings.shouldAudioMuted, videoMuted: videoSettings.mutedSettings.shouldVideoMuted }, streams[0].id);
      }

      if (streams[1] && videoSettings.mutedSettings.shouldVideoMuted) {
        muteStreams(state, { audioMuted: audioSettings.mutedSettings.shouldAudioMuted, videoMuted: videoSettings.mutedSettings.shouldVideoMuted }, streams[1].id);
      }

      resolve(streams);
    }).catch(error => helpers.onStreamAccessError(error, reject, resolve, roomKey, audioSettings, videoSettings));
  });
});

export default prepMediaAccessRequest;
