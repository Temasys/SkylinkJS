import SOCKET_CONFIG, { SOCKET_DEFAULTS } from './socketConfig';
import {
  BUNDLE_POLICY, RTCP_MUX_POLICY, VIDEO_RESOLUTION, CONFIG_NAME,
} from '../constants';
import Skylink from '../index';
import logger from '../logger';
import MESSAGES from '../messages';

const getPeerConnectionConfig = (options) => {
  const initOptions = Skylink.getInitOptions();
  const state = Skylink.getSkylinkState(options.rid);
  const { filterCandidatesType } = initOptions;
  return {
    bundlePolicy: BUNDLE_POLICY.BALANCED,
    rtcpMuxPolicy: RTCP_MUX_POLICY.REQUIRE,
    iceTransportPolicy: !state.hasMCU && filterCandidatesType.host && filterCandidatesType.srflx && !filterCandidatesType.relay ? 'relay' : 'all',
    iceCandidatePoolSize: 0,
  };
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

// eslint-disable-next-line consistent-return
const retrieveConfig = (name, options = {}) => {
  switch (name) {
    case CONFIG_NAME.PEER_CONNECTION:
      return getPeerConnectionConfig(options);
    case CONFIG_NAME.SOCKET:
      return SOCKET_CONFIG(options);
    default:
      logger.log.INFO([null, null, null, MESSAGES.UTILS.CONFIG_NOT_FOUND], name);
      break;
  }
};

export default retrieveConfig;
export { DEFAULTS };
