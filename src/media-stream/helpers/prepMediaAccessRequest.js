import helpers from './index';
import messages from '../../messages';
import { TRACK_KIND } from '../../constants';

/**
 * @description Helper function for {@link MediaStream.getUserMedia}
 * @param {GetUserMediaOptions} params - The camera Stream configuration options.
 * @memberOf MediaStreamHelpers
 * @return {Promise}
 */
const prepMediaAccessRequest = params => new Promise((resolve, reject) => {
  const { roomKey, ...rest } = params;
  const audioSettings = helpers.parseStreamSettings(rest, TRACK_KIND.AUDIO);
  const videoSettings = helpers.parseStreamSettings(rest, TRACK_KIND.VIDEO);
  const { AdapterJS } = window;

  if (!audioSettings.getUserMediaSettings.audio && !videoSettings.getUserMediaSettings.video) {
    reject(messages.MEDIA_STREAM.ERRORS.INVALID_GUM_OPTIONS);
  }

  AdapterJS.webRTCReady(() => {
    window.navigator.mediaDevices.getUserMedia({ audio: audioSettings.getUserMediaSettings.audio, video: videoSettings.getUserMediaSettings.video }).then((stream) => {
      const isAudioFallback = false;
      return helpers.onStreamAccessSuccess(roomKey, stream, audioSettings, videoSettings, isAudioFallback, resolve);
    }).catch(error => helpers.onStreamAccessError(error, reject, resolve, roomKey, audioSettings, videoSettings));
  });
});

export default prepMediaAccessRequest;
