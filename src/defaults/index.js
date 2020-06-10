import SOCKET_CONFIG, { SOCKET_DEFAULTS } from './socketConfig';
import { BUNDLE_POLICY, RTCP_MUX_POLICY, VIDEO_RESOLUTION } from '../constants';

const CONFIGS = {
  SOCKET: SOCKET_CONFIG,
  PEER_CONNECTION: {
    bundlePolicy: BUNDLE_POLICY.BALANCED,
    rtcpMuxPolicy: RTCP_MUX_POLICY.REQUIRE,
    iceTransportPolicy: 'all',
    iceCandidatePoolSize: 0,
  },
};

const DEFAULTS = {
  SOCKET: SOCKET_DEFAULTS,
  MEDIA_OPTIONS: {
    AUDIO: {
      stereo: false,
      echoCancellation: true,
      exactConstraints: false,
    },
    VIDEO: {
      resolution: VIDEO_RESOLUTION.VGA,
      frameRate: 30,
      exactConstraints: false,
    },
    SCREENSHARE: {
      video: true,
    },
  },
};

const retrieveConfig = (name, options) => {
  if (options) {
    return CONFIGS[name](options);
  }

  return CONFIGS[name];
};

export default retrieveConfig;
export { DEFAULTS };
