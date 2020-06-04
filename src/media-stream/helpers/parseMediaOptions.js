import Skylink from '../../index';

/**
 * @param {GetUserMediaOptions} options
 * @param {SkylinkState} roomState
 * @return {SkylinkState}
 * @memberOf MediaStreamHelpers
 * @private
 */
const parseMediaOptions = (options, roomState) => {
  const state = Skylink.getSkylinkState(roomState.room.id);
  const mediaOptions = options || {};

  state.user.userData = mediaOptions.userData || state.userData || '';
  state.streamsBandwidthSettings = {
    bAS: {},
  };
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
    state.bandwidthAdjuster = {
      interval: 10,
      limitAtPercentage: 100,
      useUploadBwOnly: false,
    };

    if (typeof mediaOptions.autoBandwidthAdjustment === 'object') {
      if (typeof mediaOptions.autoBandwidthAdjustment.interval === 'number' && mediaOptions.autoBandwidthAdjustment.interval >= 10) {
        state.bandwidthAdjuster.interval = mediaOptions.autoBandwidthAdjustment.interval;
      }
      if (typeof mediaOptions.autoBandwidthAdjustment.limitAtPercentage === 'number' && (mediaOptions.autoBandwidthAdjustment.limitAtPercentage >= 0 && mediaOptions.autoBandwidthAdjustment.limitAtPercentage <= 100)) {
        state.bandwidthAdjuster.limitAtPercentage = mediaOptions.autoBandwidthAdjustment.limitAtPercentage;
      }
      if (typeof mediaOptions.autoBandwidthAdjustment.useUploadBwOnly === 'boolean') {
        state.bandwidthAdjuster.useUploadBwOnly = mediaOptions.autoBandwidthAdjustment.useUploadBwOnly;
      }
    }
  }
  return state;
};

export default parseMediaOptions;
