/* eslint-disable prefer-destructuring */
import Skylink from '../../../index';
import { SOCKET_FALLBACK, SOCKET_TYPE } from '../../../constants';
import retrieveConfig, { DEFAULTS } from '../../../defaults/index';
import { isAString, isAObj } from '../../../utils/helpers';

const isFirstConnectionAttempt = config => !config.signalingServerPort;

const isLastPort = (ports, config) => ports.indexOf(config.signalingServerPort) === ports.length - 1;

const getSignalingServerUrl = (params) => {
  const {
    signalingServerProtocol,
    signalingServer,
    signalingServerPort,
    socketServer,
  } = params;

  let url = '';

  if (isAString(socketServer)) {
    url = socketServer;
  } else if (socketServer && isAObj(socketServer) && socketServer.protocol) {
    url = `${socketServer.protocol}//${socketServer.url}:${signalingServerPort}?rand=${Date.now()}`;
  } else {
    url = `${signalingServerProtocol}//${signalingServer}:${signalingServerPort}?rand=${Date.now()}`;
  }

  return url;
};

const createSocket = (params) => {
  const skylinkState = Skylink.getSkylinkState(params.roomKey);
  const initOptions = Skylink.getInitOptions();
  const { config } = params;
  const { socketServer, socketTimeout, socketServerPath } = initOptions;
  const { socketPorts } = skylinkState;
  const socketConfig = retrieveConfig('SOCKET', { socketTimeout, socketServerPath });

  let ports = [];

  if (socketServer && isAObj(socketServer) && Array.isArray(socketServer.ports) && socketServer.ports.length) {
    ({ ports } = socketServer);
  } else {
    ports = socketPorts[config.signalingServerProtocol];
  }

  if (isFirstConnectionAttempt(config)) {
    config.signalingServerPort = ports[0];
    config.fallbackType = SOCKET_FALLBACK.NON_FALLBACK;
  } else if (isLastPort(ports, config) || isAString(initOptions.socketServer)) {
    // re-refresh to long-polling port
    if (config.socketType === SOCKET_TYPE.WEBSOCKET) {
      config.socketType = SOCKET_TYPE.POLLING;
      config.signalingServerPort = ports[0];
    } else {
      config.socketSession.finalAttempts += 1;
      config.signalingServerPort = ports[0];
    }
  // move to the next port
  } else {
    config.signalingServerPort = ports[ports.indexOf(config.signalingServerPort) + 1];
  }

  if (config.socketType === SOCKET_TYPE.POLLING) {
    socketConfig.reconnectionDelayMax = DEFAULTS.SOCKET.RECONNECTION_DELAY_MAX;
    socketConfig.reconnectionAttempts = DEFAULTS.SOCKET.RECONNECTION_ATTEMPTS.POLLING;
    socketConfig.transports = [SOCKET_TYPE.XHR_POLLING, SOCKET_TYPE.JSONP_POLLING, SOCKET_TYPE.POLLING.toLowerCase()];
  }

  const url = getSignalingServerUrl({
    signalingServerProtocol: config.signalingServerProtocol,
    signalingServer: skylinkState.signalingServer,
    signalingServerPort: config.signalingServerPort,
    socketServer,
  });

  config.socketServer = url;
  config.socketServerPath = socketServerPath;
  skylinkState.socketSession = config;
  Skylink.setSkylinkState(skylinkState, params.roomKey);

  return window.io(url, socketConfig);
};

export default createSocket;
