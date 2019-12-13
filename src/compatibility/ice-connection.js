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
  const { forceTURNSSL, CONSTANTS, serverConfig } = params;
  const { AdapterJS } = window;
  const connectionConfig = {
    tcp: serverConfig.iceServerPorts.tcp,
    udp: serverConfig.iceServerPorts.udp,
    both: serverConfig.iceServerPorts.both,
    iceServerProtocol: serverConfig.iceServerProtocol,
    iceServerPorts: serverConfig.iceServerPorts,
  };

  if (AdapterJS.webrtcDetectedBrowser === 'edge') {
    connectionConfig.tcp = [];
    connectionConfig.udp = [3478];
    connectionConfig.iceServerPorts.both = [];
    connectionConfig.iceServerProtocol = CONSTANTS.TURN;
  } else if (forceTURNSSL) {
    if (AdapterJS.webrtcDetectedBrowser === 'firefox' && AdapterJS.webrtcDetectedVersion < 53) {
      connectionConfig.udp = [];
      connectionConfig.tcp = [443];
      connectionConfig.both = [];
      connectionConfig.iceServerProtocol = CONSTANTS.TURN;
    } else {
      connectionConfig.iceServerPorts.udp = [];
      connectionConfig.iceServerProtocol = 'turns';
    }
  } else if (AdapterJS.webrtcDetectedBrowser === 'firefox') {
    connectionConfig.udp = [3478];
    connectionConfig.tcp = [443, 80];
    connectionConfig.both = [];
  }

  return connectionConfig;
};

export default getConnectionPortsAndProtocolByBrowser;
