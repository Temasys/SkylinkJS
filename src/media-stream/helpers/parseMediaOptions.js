import Skylink from '../../index';
import logger from '../../logger';
import MESSAGES from '../../messages';

/**
 * @param {getUserMediaOptions} options
 * @param {SkylinkState} roomState
 * @return {SkylinkState}
 * @memberOf MediaStreamHelpers
 * @private
 */
const parseMediaOptions = (options, roomState) => {
  const state = Skylink.getSkylinkState(roomState.room.id);
  const mediaOptions = options || {};

  state.voiceActivityDetection = typeof mediaOptions.voiceActivityDetection === 'boolean' ? mediaOptions.voiceActivityDetection : true;

  if (mediaOptions.bandwidth) {
    if (typeof mediaOptions.bandwidth.audio === 'number') {
      state.streamsBandwidthSettings.bAS.audio = mediaOptions.bandwidth.audio;
    }

    if (typeof mediaOptions.bandwidth.video === 'number') {
      state.streamsBandwidthSettings.bAS.video = mediaOptions.bandwidth.video;
    }

    if (typeof mediaOptions.bandwidth.data === 'number') {
      state.streamsBandwidthSettings.bAS.data = mediaOptions.bandwidth.data;
    }
  }

  if (mediaOptions.autoBandwidthAdjustment) {
    logger.log.WARN(MESSAGES.JOIN_ROOM.AUTO_BANDWIDTH_DEPRECATED);
  }
  return state;
};

export default parseMediaOptions;
