import { SOCKET_EVENTS } from '../../../constants';
import callbacks from '../callbacks';

const setSocketCallbacks = (roomKey, signaling, resolve) => {
  signaling.socket.on(SOCKET_EVENTS.CONNECT, callbacks.onConnection.bind(signaling, resolve, roomKey));
  signaling.socket.on(SOCKET_EVENTS.MESSAGE, signaling.onMessage.bind(signaling));
  signaling.socket.on(SOCKET_EVENTS.DISCONNECT, callbacks.onDisconnect.bind(signaling, roomKey));
  signaling.socket.on(SOCKET_EVENTS.ERROR, callbacks.onError.bind(signaling, roomKey));
};

export default setSocketCallbacks;
