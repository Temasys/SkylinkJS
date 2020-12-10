
import * as helpers from './helpers/index';

export const createSocket = params => helpers.createSocket(params);

export const processSignalingMessage = (messageHandler, message) => {
  helpers.processSignalingMessage(messageHandler, message);
};

export const sendChannelMessage = (socket, message) => {
  socket.send(JSON.stringify(message));
};

export const handleSocketClose = (roomKey, reason) => {
  helpers.handleSocketClose(roomKey, reason);
};

export const closeSocket = (...args) => {
  helpers.closeSocket(...args);
};

export const setSocketCallbacks = (roomKey, signaling, resolve) => {
  helpers.setSocketCallbacks(roomKey, signaling, resolve);
};

export const shouldBufferMessage = message => helpers.shouldBufferMessage(message);
