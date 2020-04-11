import ondatachannel from './ondatachannel';
import onicecandidate from './onicecandidate';
import oniceconnectionstatechange from './oniceconnectionstatechange';
import onicegatheringstatechange from './onicegatheringstatechange';
import onsignalingstatechange from './onsignalingstatechange';
import ontrack from './ontrack';
import onremovetrack from './onremovetrack';
import onsenderadded from './onsenderadded';

/**
 * @description Callbacks for createPeerConnection method
 * @type {{ondatachannel, onicecandidate, oniceconnectionstatechange, onicegatheringstatechange, onsignalingstatechange, ontrack, onremovetrack, onsenderadded}}
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
  onsenderadded,
};

export default callbacks;
