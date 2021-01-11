import {
  API_VERSION, SDK_NAME, SDK_VERSION, SIGNALING_VERSION, SOCKET_TYPE,
} from '../constants';

const SOCKET_DEFAULTS = {
  RECONNECTION_ATTEMPTS: {
    WEBSOCKET: 10,
    POLLING: 4,
  },
  RECONNECTION_DELAY_MAX: 5000,
  RECONNECTION_DELAY: 1000,
};

const SOCKET_CONFIG = options => ({
  forceNew: true,
  reconnection: false, // Ref: ESS-2024
  timeout: options.socketTimeout,
  path: options.socketServerPath,
  reconnectionAttempts: SOCKET_DEFAULTS.RECONNECTION_ATTEMPTS.WEBSOCKET,
  reconnectionDelayMax: SOCKET_DEFAULTS.RECONNECTION_DELAY_MAX,
  reconnectionDelay: SOCKET_DEFAULTS.RECONNECTION_DELAY,
  transports: [SOCKET_TYPE.WEBSOCKET.toLowerCase()],
  query: {
    Skylink_SDK_type: SDK_NAME.WEB,
    Skylink_SDK_version: SDK_VERSION,
    Skylink_API_version: API_VERSION,
    'X-Server-Select': SIGNALING_VERSION,
  },
  extraHeaders: {
    Skylink_SDK_type: SDK_NAME.WEB,
    Skylink_SDK_version: SDK_VERSION,
    Skylink_API_version: API_VERSION,
    'X-Server-Select': SIGNALING_VERSION,
  },
});

export default SOCKET_CONFIG;
export { SOCKET_DEFAULTS };
