/* eslint-disable no-nested-ternary */
import clone from 'clone';
import { TRACK_KIND } from '../../constants';
import { DEFAULTS } from '../../defaults';
import {
  isABoolean, isANumber, isAObj, isAString,
} from '../../utils/helpers';

const parseGumSettings = (settings, type) => {
  const gumSettings = {
    audio: false,
    video: false,
  };

  if ((settings.audio && !type) || (settings.audio && type === TRACK_KIND.AUDIO)) {
    if (settings.audio && isAObj(settings.audio)) {
      gumSettings.audio = {};
      gumSettings.audio.echoCancellation = true;

      if (isABoolean(settings.audio.echoCancellation)) {
        gumSettings.audio.echoCancellation = settings.audio.echoCancellation;
      }

      if (settings.audio.deviceId && isAString(settings.audio.deviceId)) {
        gumSettings.audio.deviceId = settings.audio.exactConstraints
          ? { exact: settings.audio.deviceId } : { ideal: settings.audio.deviceId };
      }
    }
  }

  if ((settings.video && !type) || (settings.video && type === TRACK_KIND.VIDEO)) {
    if (settings.video && isAObj(settings.video)) {
      gumSettings.video = {};

      if (settings.video.deviceId && isAString(settings.video.deviceId)) {
        gumSettings.video.deviceId = settings.video.exactConstraints
          ? { exact: settings.video.deviceId } : { ideal: settings.video.deviceId };
      }

      gumSettings.video.width = isAObj(settings.video.resolution.width)
        ? settings.video.resolution.width : (settings.video.exactConstraints
          ? { exact: settings.video.resolution.width } : { max: settings.video.resolution.width });

      gumSettings.video.height = isAObj(settings.video.resolution.height)
        ? settings.video.resolution.height : (settings.video.exactConstraints
          ? { exact: settings.video.resolution.height } : { max: settings.video.resolution.height });

      if ((settings.video.frameRate && isAObj(settings.video.frameRate))
        || isANumber(settings.video.frameRate)) {
        gumSettings.video.frameRate = isAObj(settings.video.frameRate)
          ? settings.video.frameRate : (settings.video.exactConstraints
            ? { exact: settings.video.frameRate } : { max: settings.video.frameRate });
      }
    } else if (settings.video) {
      gumSettings.video = {
        width: settings.video.exactConstraints ? { exact: settings.video.resolution.width }
          : { max: settings.video.resolution.width },
        height: settings.video.exactConstraints ? { exact: settings.video.resolution.height }
          : { max: settings.video.resolution.height },
      };
    }
  }

  return gumSettings;
};

const parseSettings = (options, type = '') => {
  const settings = { audio: false, video: false };

  if ((options.audio && !type) || (options.audio && type === TRACK_KIND.AUDIO)) {
    settings.audio = clone(DEFAULTS.MEDIA_OPTIONS.AUDIO);

    if (isAObj(options.audio)) {
      if (isABoolean(options.audio.stereo)) {
        settings.audio.stereo = options.audio.stereo;
      }

      if (isABoolean(options.audio.echoCancellation)) {
        settings.audio.echoCancellation = options.audio.echoCancellation;
      }

      if (options.audio.deviceId && isAString(options.audio.deviceId)) {
        settings.audio.deviceId = options.audio.deviceId;
      }

      if ((options.useExactConstraints && isABoolean(options.useExactConstraints))) {
        settings.audio.exactConstraints = options.useExactConstraints;
      }
    }
  }

  if ((options.video && !type) || (options.video && type === TRACK_KIND.VIDEO)) {
    settings.video = clone(DEFAULTS.MEDIA_OPTIONS.VIDEO);

    if (isAObj(options.video)) {
      if (options.video.deviceId && isAString(options.video.deviceId)) {
        settings.video.deviceId = options.video.deviceId;
      }

      if (options.video.resolution && isAObj(options.video.resolution)) {
        if ((options.video.resolution.width && isAString(options.video.resolution.width))
          || isANumber(options.video.resolution.width) || isAObj(options.video.resolution.width)) {
          settings.video.resolution.width = options.video.resolution.width;
        }
        if ((options.video.resolution.height && isAString(options.video.resolution.height))
          || isANumber(options.video.resolution.height) || isAObj(options.video.resolution.height)) {
          settings.video.resolution.height = options.video.resolution.height;
        }
      }

      if ((options.video.frameRate && isAString(options.video.frameRate))
        || isANumber(options.video.frameRate) || isAObj(options.video.frameRate)) {
        settings.video.frameRate = options.video.frameRate;
      }

      if ((options.useExactConstraints && isABoolean(options.useExactConstraints))) {
        settings.video.exactConstraints = options.useExactConstraints;
      }
    }
  }

  return settings;
};

/**
 * Parse the options provided to make sure they are compatible
 * @param {getUserMediaOptions} options
 * @param {String} type - The type of stream i.e. audio or video if options contain both audio and video options
 * @memberOf MediaStreamHelpers
 * @private
 * @return {{settings: {audio: boolean, video: boolean}, mutedSettings: {shouldAudioMuted: Event | boolean | Boolean, shouldVideoMuted: Event | boolean | Boolean}, getUserMediaSettings: {audio: boolean, video: boolean}}}
 */
const parseStreamSettings = (options, type = '') => {
  const settings = parseSettings(options, type);
  const mutedSettings = { shouldAudioMuted: options.audio && isABoolean(options.audio.mute) ? options.audio.mute : false, shouldVideoMuted: options.video && isABoolean(options.video.mute) ? options.video.mute : false };
  const getUserMediaSettings = parseGumSettings(settings, type);

  return {
    settings,
    mutedSettings,
    getUserMediaSettings,
  };
};

export default parseStreamSettings;
