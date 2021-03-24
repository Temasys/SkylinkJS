import { SOCKET_EVENTS } from '../../../constants';
import callbacks from '../callbacks';

const setSocketCallbacks = (roomKey, signaling, resolve) => {
  signaling.socket.on(SOCKET_EVENTS.CONNECT, () => callbacks.onConnection(signaling, resolve, roomKey));
  signaling.socket.on(SOCKET_EVENTS.MESSAGE, signaling.onMessage.bind(signaling));
  signaling.socket.on(SOCKET_EVENTS.DISCONNECT, reason => callbacks.onDisconnect(roomKey, reason));
  signaling.socket.on(SOCKET_EVENTS.ERROR, error => callbacks.onError(signaling, roomKey, error));
};

export default setSocketCallbacks;
