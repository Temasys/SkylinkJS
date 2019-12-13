import Skylink from '../../index';
import { BUNDLE_POLICY, RTCP_MUX_POLICY, PEER_CERTIFICATE } from '../../constants';

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

  state.userData = mediaOptions.userData || state.userData || '';
  state.streamsBandwidthSettings = {
    googleX: {},
    bAS: {},
  };
  state.publishOnly = false;
  state.sdpSettings = {
    connection: {
      audio: true,
      video: true,
      data: true,
    },
    direction: {
      audio: { send: true, receive: true },
      video: { send: true, receive: true },
    },
  };
  state.voiceActivityDetection = typeof mediaOptions.voiceActivityDetection === 'boolean' ? mediaOptions.voiceActivityDetection : true;
  state.peerConnectionConfig = {
    bundlePolicy: BUNDLE_POLICY.BALANCED,
    rtcpMuxPolicy: RTCP_MUX_POLICY.REQUIRE,
    iceCandidatePoolSize: 0,
    certificate: PEER_CERTIFICATE.AUTO,
    disableBundle: false,
  };
  state.bandwidthAdjuster = null;

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

  if (mediaOptions.googleXBandwidth) {
    if (typeof mediaOptions.googleXBandwidth.min === 'number') {
      state.streamsBandwidthSettings.googleX.min = mediaOptions.googleXBandwidth.min;
    }

    if (typeof mediaOptions.googleXBandwidth.max === 'number') {
      state.streamsBandwidthSettings.googleX.max = mediaOptions.googleXBandwidth.max;
    }
  }

  if (mediaOptions.sdpSettings) {
    if (mediaOptions.sdpSettings.direction) {
      if (mediaOptions.sdpSettings.direction.audio) {
        state.sdpSettings.direction.audio.receive = typeof mediaOptions.sdpSettings.direction.audio.receive === 'boolean' ? mediaOptions.sdpSettings.direction.audio.receive : true;
        state.sdpSettings.direction.audio.send = typeof mediaOptions.sdpSettings.direction.audio.send === 'boolean' ? mediaOptions.sdpSettings.direction.audio.send : true;
      }

      if (mediaOptions.sdpSettings.direction.video) {
        state.sdpSettings.direction.video.receive = typeof mediaOptions.sdpSettings.direction.video.receive === 'boolean' ? mediaOptions.sdpSettings.direction.video.receive : true;
        state.sdpSettings.direction.video.send = typeof mediaOptions.sdpSettings.direction.video.send === 'boolean' ? mediaOptions.sdpSettings.direction.video.send : true;
      }
    }
    if (mediaOptions.sdpSettings.connection) {
      state.sdpSettings.connection.audio = typeof mediaOptions.sdpSettings.connection.audio === 'boolean' ? mediaOptions.sdpSettings.connection.audio : true;
      state.sdpSettings.connection.video = typeof mediaOptions.sdpSettings.connection.video === 'boolean' ? mediaOptions.sdpSettings.connection.video : true;
      state.sdpSettings.connection.data = typeof mediaOptions.sdpSettings.connection.data === 'boolean' ? mediaOptions.sdpSettings.connection.data : true;
    }
  }

  if (mediaOptions.publishOnly) {
    state.sdpSettings.direction.audio.send = true;
    state.sdpSettings.direction.audio.receive = false;
    state.sdpSettings.direction.video.send = true;
    state.sdpSettings.direction.video.receive = false;
    state.publishOnly = true;
  }

  /* eslint-disable no-restricted-syntax */
  /* eslint-disable no-prototype-builtins */
  if (mediaOptions.peerConnection && typeof mediaOptions.peerConnection === 'object') {
    if (typeof mediaOptions.peerConnection.bundlePolicy === 'string') {
      for (const bpProp in BUNDLE_POLICY) {
        if (BUNDLE_POLICY.hasOwnProperty(bpProp) && BUNDLE_POLICY[bpProp] === mediaOptions.peerConnection.bundlePolicy) {
          state.peerConnectionConfig.bundlePolicy = mediaOptions.peerConnection.bundlePolicy;
        }
      }
    }
    if (typeof mediaOptions.peerConnection.rtcpMuxPolicy === 'string') {
      for (const rmpProp in RTCP_MUX_POLICY) {
        if (RTCP_MUX_POLICY.hasOwnProperty(rmpProp) && RTCP_MUX_POLICY[rmpProp] === mediaOptions.peerConnection.rtcpMuxPolicy) {
          state.peerConnectionConfig.rtcpMuxPolicy = mediaOptions.peerConnection.rtcpMuxPolicy;
        }
      }
    }
    if (typeof mediaOptions.peerConnection.iceCandidatePoolSize === 'number' && mediaOptions.peerConnection.iceCandidatePoolSize > 0) {
      state.peerConnectionConfig.iceCandidatePoolSize = mediaOptions.peerConnection.iceCandidatePoolSize;
    }
    if (typeof mediaOptions.peerConnection.certificate === 'string') {
      for (const pcProp in PEER_CERTIFICATE) {
        if (PEER_CERTIFICATE.hasOwnProperty(pcProp) && PEER_CERTIFICATE[pcProp] === mediaOptions.peerConnection.certificate) {
          state.peerConnectionConfig.certificate = mediaOptions.peerConnection.certificate;
        }
      }
    }
    state.peerConnectionConfig.disableBundle = mediaOptions.peerConnection.disableBundle === true;
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
