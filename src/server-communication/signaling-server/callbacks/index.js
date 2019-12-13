import onConnection from './onconnect';
import onDisconnect from './ondisconnect';
import onError from './onerror';
import onReconnectAttempt from './onreconnectattempt';
import onReconnectFailed from './onreconnectfailed';
import onReconnectError from './onreconnecterror';

const callbacks = {
  onConnection,
  onDisconnect,
  onError,
  onReconnectAttempt,
  onReconnectFailed,
  onReconnectError,
};

export default callbacks;
