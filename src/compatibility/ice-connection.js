import { isAgent } from '../utils/helpers';
import { BROWSER_AGENT } from '../constants';

/**
 * @description Gets TCP and UDP ports based on the browser
 * @param {Object} params
 * @param {boolean} params.forceTURNSSL
 * @param {boolean} params.enableTURNServer
 * @param {enum} params.CONSTANTS
 * @memberOf module:Compatibility
 * @return {{tcp: Array, udp: Array, both: Array, iceServerProtocol: string}}
 */
const getConnectionPortsAndProtocolByBrowser = (params) => {
  const { forceTURNSSL, serverConfig } = params;
  const connectionConfig = {
    tcp: serverConfig.iceServerPorts.tcp,
    udp: serverConfig.iceServerPorts.udp,
    both: serverConfig.iceServerPorts.both,
    iceServerProtocol: serverConfig.iceServerProtocol,
    iceServerPorts: serverConfig.iceServerPorts,
  };

  if (forceTURNSSL) {
    connectionConfig.iceServerPorts.udp = [];
    connectionConfig.iceServerProtocol = 'turns';
  } else if (isAgent(BROWSER_AGENT.FIREFOX)) { // default configs are specific to Chrome
    connectionConfig.udp = [3478];
    connectionConfig.both = [];
  }

  return connectionConfig;
};

export default getConnectionPortsAndProtocolByBrowser;
