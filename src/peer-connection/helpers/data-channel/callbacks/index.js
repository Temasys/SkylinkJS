import onmessage from './onmessage';
import onerror from './onerror';
import onopen from './onopen';
import onbufferedamountlow from './onbufferedamountlow';
import onclose from './onclose';

/**
 * @description Callbacks for createDataChannel method
 * @type {{onopen, onmessage, onerror, onbufferedamountlow, onclose}}
 * @memberOf PeerConnection.PeerConnectionHelpers
 * @namespace CreateDataChannelCallbacks
 * @private
 */
const callbacks = {
  onopen,
  onmessage,
  onerror,
  onbufferedamountlow,
  onclose,
};

export default callbacks;
