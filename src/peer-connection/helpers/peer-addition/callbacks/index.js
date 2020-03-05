import ondatachannel from './ondatachannel';
import onicecandidate from './onicecandidate';
import oniceconnectionstatechange from './oniceconnectionstatechange';
import onicegatheringstatechange from './onicegatheringstatechange';
import onsignalingstatechange from './onsignalingstatechange';
import ontrack from './ontrack';
import onremovetrack from './onremovetrack';

/**
 * @description Callbacks for createPeerConnection method
 * @type {{ondatachannel, onicecandidate, oniceconnectionstatechange, onicegatheringstatechange, onsignalingstatechange, ontrack, onremovetrack}}
 * @memberOf PeerConnection.PeerConnectionHelpers
 * @namespace CreatePeerConnectionCallbacks
 * @private
 */
const callbacks = {
  ontrack,
  ondatachannel,
  onicecandidate,
  oniceconnectionstatechange,
  onicegatheringstatechange,
  onsignalingstatechange,
  onremovetrack,
};

export default callbacks;
