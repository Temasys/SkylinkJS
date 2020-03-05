import SOCKET_CONFIG, { SOCKET_DEFAULTS } from './socketConfig';

const CONFIGS = {
  SOCKET: SOCKET_CONFIG,
};

const DEFAULTS = {
  SOCKET: SOCKET_DEFAULTS,
};

const retrieveConfig = (name, options) => CONFIGS[name](options);

export default retrieveConfig;
export { DEFAULTS };
