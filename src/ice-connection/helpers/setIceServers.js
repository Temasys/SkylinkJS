import { getConnectionPortsAndProtocolByBrowser } from '../../compatibility/index';
import { TURN_TRANSPORT } from '../../constants';
import Skylink from '../../index';

const defaultIceServerPorts = {
  udp: [3478, 19302, 19303, 19304],
  tcp: [80, 443],
  both: [19305, 19306, 19307, 19308],
};

const CONSTANTS = {
  STUN: 'stun',
  TURN: 'turn',
  TEMASYS: 'temasys',
  DEFAULT_TURN_SERVER: 'turn.temasys.io',
  TCP: 'TCP',
  UDP: 'UDP',
};

const userIceServer = (iceServer, serverConfig) => {
  const { urls } = iceServer;
  return [{
    urls,
    username: serverConfig.iceServers[1].username || null,
    credential: serverConfig.iceServers[1].credential || null,
  }];
};

const getConnectionPortsByTurnTransport = (params) => {
  const {
    TURNServerTransport,
    forceTURNSSL,
    udp,
    tcp,
    both,
  } = params;
  const ports = {
    udp: [],
    tcp: [],
    both: [],
  };
  if (TURNServerTransport === TURN_TRANSPORT.UDP && !forceTURNSSL) {
    ports.udp = udp.concat(both);
    ports.tcp = [];
    ports.both = [];
  } else if (TURNServerTransport === TURN_TRANSPORT.TCP) {
    ports.tcp = tcp.concat(both);
    ports.udp = [];
    ports.both = [];
  } else if (TURNServerTransport === TURN_TRANSPORT.NONE) {
    ports.tcp = [];
    ports.udp = [];
  } else {
    ports.tcp = tcp;
    ports.udp = udp;
    ports.both = both;
  }
  return ports;
};

const getIceServerPorts = () => defaultIceServerPorts;

/**
 * @param {RTCIceServer[]} servers - The list of IceServers passed | {@link https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer}
 * @memberOf IceConnectionHelpers
 * @private
 * @return {filteredIceServers}
 */
const setIceServers = (servers) => {
  const initOptions = Skylink.getInitOptions();
  const serverConfig = {
    iceServerName: null,
    iceServerPorts: getIceServerPorts(),
    iceServerProtocol: CONSTANTS.STUN,
    iceServers: [{ urls: [] }, { urls: [] }],
  };

  const {
    iceServer,
    enableTURNServer,
    forceTURNSSL,
    TURNServerTransport,
    enableSTUNServer,
    usePublicSTUN,
  } = initOptions;

  servers.forEach((server) => {
    if (server.url.indexOf(`${CONSTANTS.STUN}:`) === 0) {
      if (server.url.indexOf(`${CONSTANTS.TEMASYS}`) > 0) {
        // server[?transport=xxx]
        serverConfig.iceServerName = (server.url.split(':')[1] || '').split('?')[0] || null;
      } else {
        serverConfig.iceServers[0].urls.push(server.url);
      }
    } else if (server.url.indexOf('turn:') === 0 && server.url.indexOf('@') > 0 && server.credential && !(serverConfig.iceServers[1].username || serverConfig.iceServers[1].credential)) {
      /* eslint-disable prefer-destructuring */
      const parts = server.url.split(':');
      const urlParts = (parts[1] || '').split('@');
      serverConfig.iceServerName = (urlParts[1] || '').split('?')[0];
      serverConfig.iceServers[1].username = urlParts[0];
      serverConfig.iceServers[1].credential = server.credential;
      serverConfig.iceServerProtocol = CONSTANTS.TURN;
    }
  });

  if (iceServer) {
    return { iceServers: userIceServer(iceServer, serverConfig) };
  }

  serverConfig.iceServerName = serverConfig.iceServerName || CONSTANTS.DEFAULT_TURN_SERVER;

  if (serverConfig.iceServerProtocol === CONSTANTS.TURN && !enableTURNServer && !forceTURNSSL) {
    serverConfig.iceServerProtocol = CONSTANTS.STUN;
  } else {
    const connectionPortsAndProtocolByBrowser = getConnectionPortsAndProtocolByBrowser({
      forceTURNSSL,
      enableTURNServer,
      CONSTANTS,
      serverConfig,
    });
    serverConfig.iceServerPorts.tcp = connectionPortsAndProtocolByBrowser.tcp;
    serverConfig.iceServerPorts.udp = connectionPortsAndProtocolByBrowser.udp;
    serverConfig.iceServerPorts.both = connectionPortsAndProtocolByBrowser.both;
    serverConfig.iceServerProtocol = connectionPortsAndProtocolByBrowser.iceServerProtocol;
  }

  const connectionPortsByTurnTransport = getConnectionPortsByTurnTransport({
    forceTURNSSL,
    TURNServerTransport,
    udp: serverConfig.iceServerPorts.udp,
    tcp: serverConfig.iceServerPorts.tcp,
    both: serverConfig.iceServerPorts.both,
  });

  serverConfig.iceServerPorts.tcp = connectionPortsByTurnTransport.tcp;
  serverConfig.iceServerPorts.udp = connectionPortsByTurnTransport.udp;
  serverConfig.iceServerPorts.both = connectionPortsByTurnTransport.both;

  if (serverConfig.iceServerProtocol === CONSTANTS.STUN) {
    serverConfig.iceServerPorts.tcp = [];
  }

  if (serverConfig.iceServerProtocol === CONSTANTS.STUN && !enableSTUNServer) {
    serverConfig.iceServers = [];
  } else {
    serverConfig.iceServerPorts.tcp.forEach((tcpPort) => {
      serverConfig.iceServers[1].urls.push(`${serverConfig.iceServerProtocol}:${serverConfig.iceServerName}:${tcpPort}?transport=tcp`);
    });

    serverConfig.iceServerPorts.udp.forEach((udpPort) => {
      serverConfig.iceServers[1].urls.push(`${serverConfig.iceServerProtocol}:${serverConfig.iceServerName}:${udpPort}?transport=udp`);
    });

    serverConfig.iceServerPorts.both.forEach((bothPort) => {
      serverConfig.iceServers[1].urls.push(`${serverConfig.iceServerProtocol}:${serverConfig.iceServerName}:${bothPort}`);
    });

    if (!usePublicSTUN) {
      serverConfig.iceServers.splice(0, 1);
    }

    return {
      iceServers: serverConfig.iceServers,
    };
  }
  return null;
};

export default setIceServers;
