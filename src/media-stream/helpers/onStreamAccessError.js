/* eslint-disable consistent-return */
import Skylink from '../../index';
import logger from '../../logger';
import messages from '../../messages';
import { MEDIA_ACCESS_FALLBACK_STATE, TAGS } from '../../constants';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import { mediaAccessError, mediaAccessFallback } from '../../skylink-events';
import helpers from './index';

/**
 *
 * @param {Error} error - The error object.
 * @param {Function} reject - Reject function from promise.
 * @param {String} roomKey - The room rid.
 * @param {JSON} audioSettings - The audio media options.
 * @param {JSON} videoSettings - The video media options.
 * @param {object} resolve - The resolved promise.
 * @return {Promise<MediaStream | never>}
 * @memberOf MediaStreamHelpers
 * @fires MEDIA_ACCESS_ERROR
 * @fires MEDIA_ACCESS_FALLBACK
 */
const onStreamAccessError = (error, reject, resolve, roomKey, audioSettings, videoSettings) => {
  const initOptions = Skylink.getInitOptions();
  const state = Skylink.getSkylinkState(roomKey);
  const { audioFallback } = initOptions;

  if (audioSettings.settings.audio && videoSettings.settings.video && audioFallback) {
    const isAudioFallback = true;
    logger.log.DEBUG([state.user.sid, TAGS.MEDIA_STREAM, null, messages.MEDIA_STREAM.START_FALLBACK]);
    dispatchEvent(mediaAccessFallback({
      error,
      state: MEDIA_ACCESS_FALLBACK_STATE.FALLBACKING,
      isAudioFallback,
    }));

    return window.navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const streams = helpers.onStreamAccessSuccess(roomKey, stream, audioSettings, videoSettings, isAudioFallback);
        resolve(streams);
      })
      .catch((fallbackError) => {
        logger.log.ERROR([state.user.sid, TAGS.MEDIA_STREAM, null, messages.MEDIA_STREAM.ERRORS.FALLBACK, fallbackError]);
        dispatchEvent(mediaAccessError({
          error: fallbackError,
          isAudioFallbackError: true,
        }));
        dispatchEvent(mediaAccessFallback({
          error,
          state: MEDIA_ACCESS_FALLBACK_STATE.ERROR,
          isAudioFallback,
        }));

        reject(fallbackError);
      });
  }

  logger.log.ERROR([state.user.sid, TAGS.MEDIA_STREAM, null, messages.MEDIA_STREAM.ERRORS.GET_USER_MEDIA], error);
  dispatchEvent(mediaAccessError({
    error,
    isAudioFallbackError: false,
  }));

  reject(error);
};

export default onStreamAccessError;
