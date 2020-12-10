import onConnection from './onconnect';
import onDisconnect from './ondisconnect';
import onError from './onerror';

const callbacks = {
  onConnection,
  onDisconnect,
  onError,
};

export default callbacks;
