import clone from 'clone';
import { VIDEO_RESOLUTION, TRACK_KIND } from '../../constants';

/**
 * Parse the options provided to make sure they are compatible
 * @param {GetUserMediaOptions} options
 * @param {string|null} type - The type of stream i.e. audio or video
 * @memberOf MediaStreamHelpers
 * @private
 * @return {{settings: {audio: boolean, video: boolean}, mutedSettings: {shouldAudioMuted: boolean, shouldVideoMuted: boolean}, getUserMediaSettings: {audio: boolean, video: boolean}}}
 */
const parseStreamSettings = (options, type = null) => {
  const { AdapterJS } = window;
  const settings = {
    settings: { audio: false, video: false },
    mutedSettings: { shouldAudioMuted: false, shouldVideoMuted: false },
    getUserMediaSettings: { audio: false, video: false },
  };

  if ((options.audio && !type) || (options.audio && type === TRACK_KIND.AUDIO)) {
    // For Edge to work since they do not support the advanced constraints yet
    settings.settings.audio = {
      stereo: false,
      exactConstraints: !!options.useExactConstraints,
      echoCancellation: true,
    };
    settings.getUserMediaSettings.audio = {
      echoCancellation: true,
    };

    if (typeof options.audio === 'object') {
      if (typeof options.audio.stereo === 'boolean') {
        settings.settings.audio.stereo = options.audio.stereo;
      }

      if (typeof options.audio.useinbandfec === 'boolean') {
        settings.settings.audio.useinbandfec = options.audio.useinbandfec;
      }

      if (typeof options.audio.usedtx === 'boolean') {
        settings.settings.audio.usedtx = options.audio.usedtx;
      }

      if (typeof options.audio.maxplaybackrate === 'number'
        && options.audio.maxplaybackrate >= 8000 && options.audio.maxplaybackrate <= 48000) {
        settings.settings.audio.maxplaybackrate = options.audio.maxplaybackrate;
      }

      if (typeof options.audio.mute === 'boolean') {
        settings.mutedSettings.shouldAudioMuted = options.audio.mute;
      }

      // Not supported in Edge browser features
      if (AdapterJS.webrtcDetectedBrowser !== 'edge') {
        if (typeof options.audio.echoCancellation === 'boolean') {
          settings.settings.audio.echoCancellation = options.audio.echoCancellation;
          settings.getUserMediaSettings.audio.echoCancellation = options.audio.echoCancellation;
        }

        if (Array.isArray(options.audio.optional)) {
          settings.settings.audio.optional = clone(options.audio.optional);
          settings.getUserMediaSettings.audio.optional = clone(options.audio.optional);
        }

        if (options.audio.deviceId && typeof options.audio.deviceId === 'string'
          && AdapterJS.webrtcDetectedBrowser !== 'firefox') {
          settings.settings.audio.deviceId = options.audio.deviceId;
          settings.getUserMediaSettings.audio.deviceId = options.useExactConstraints
            ? { exact: options.audio.deviceId } : { ideal: options.audio.deviceId };
        }
      }
    }

    if (AdapterJS.webrtcDetectedBrowser === 'edge') {
      settings.getUserMediaSettings.audio = true;
    }
  }

  if ((options.video && !type) || (options.video && type === TRACK_KIND.VIDEO)) {
    // For Edge to work since they do not support the advanced constraints yet
    settings.settings.video = {
      resolution: clone(VIDEO_RESOLUTION.VGA),
      // screenshare: false,
      exactConstraints: !!options.useExactConstraints,
    };
    settings.getUserMediaSettings.video = {};

    if (typeof options.video === 'object') {
      if (typeof options.video.mute === 'boolean') {
        settings.mutedSettings.shouldVideoMuted = options.video.mute;
      }

      if (Array.isArray(options.video.optional)) {
        settings.settings.video.optional = clone(options.video.optional);
        settings.getUserMediaSettings.video.optional = clone(options.video.optional);
      }

      if (options.video.deviceId && typeof options.video.deviceId === 'string') {
        settings.settings.video.deviceId = options.video.deviceId;
        settings.getUserMediaSettings.video.deviceId = options.useExactConstraints
          ? { exact: options.video.deviceId } : { ideal: options.video.deviceId };
      }

      if (options.video.resolution && typeof options.video.resolution === 'object') {
        if ((options.video.resolution.width && typeof options.video.resolution.width === 'object')
          || typeof options.video.resolution.width === 'number') {
          settings.settings.video.resolution.width = options.video.resolution.width;
        }
        if ((options.video.resolution.height && typeof options.video.resolution.height === 'object')
          || typeof options.video.resolution.height === 'number') {
          settings.settings.video.resolution.height = options.video.resolution.height;
        }
      }

      /* eslint-disable no-nested-ternary */
      /* eslint-disable no-mixed-operators */
      settings.getUserMediaSettings.video.width = typeof settings.settings.video.resolution.width === 'object'
        ? settings.settings.video.resolution.width : (options.useExactConstraints
          ? { exact: settings.settings.video.resolution.width } : { max: settings.settings.video.resolution.width });

      settings.getUserMediaSettings.video.height = typeof settings.settings.video.resolution.height === 'object'
        ? settings.settings.video.resolution.height : (options.useExactConstraints
          ? { exact: settings.settings.video.resolution.height } : { max: settings.settings.video.resolution.height });

      if ((options.video.frameRate && typeof options.video.frameRate === 'object')
        || typeof options.video.frameRate === 'number' && AdapterJS.webrtcDetectedType !== 'plugin') {
        settings.settings.video.frameRate = options.video.frameRate;
        settings.getUserMediaSettings.video.frameRate = typeof settings.settings.video.frameRate === 'object'
          ? settings.settings.video.frameRate : (options.useExactConstraints
            ? { exact: settings.settings.video.frameRate } : { max: settings.settings.video.frameRate });
      }

      if (options.video.facingMode && ['string', 'object'].indexOf(typeof options.video.facingMode) > -1 && AdapterJS.webrtcDetectedType === 'plugin') {
        settings.settings.video.facingMode = options.video.facingMode;
        settings.getUserMediaSettings.video.facingMode = typeof settings.settings.video.facingMode === 'object'
          ? settings.settings.video.facingMode : (options.useExactConstraints
            ? { exact: settings.settings.video.facingMode } : { max: settings.settings.video.facingMode });
      }
    } else {
      settings.getUserMediaSettings.video = {
        width: options.useExactConstraints ? { exact: settings.settings.video.resolution.width }
          : { max: settings.settings.video.resolution.width },
        height: options.useExactConstraints ? { exact: settings.settings.video.resolution.height }
          : { max: settings.settings.video.resolution.height },
      };
    }

    if (AdapterJS.webrtcDetectedBrowser === 'edge') {
      settings.settings.video = {
        // screenshare: false,
        exactConstraints: !!options.useExactConstraints,
      };
      settings.getUserMediaSettings.video = true;
    }
  }

  return settings;
};

export default parseStreamSettings;
