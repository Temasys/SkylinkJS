
import * as helpers from './helpers/index';

export const createSocket = params => helpers.createSocket(params);

export const processSignalingMessage = (...args) => {
  helpers.processSignalingMessage(...args);
};

export const sendChannelMessage = (socket, message) => {
  socket.send(JSON.stringify(message));
};

export const handleSocketClose = (...args) => {
  helpers.handleSocketClose(...args);
};

export const closeSocket = (...args) => {
  helpers.closeSocket(...args);
};

export const setSocketCallbacks = (...args) => {
  helpers.setSocketCallbacks(...args);
};
