import setIceServers from './setIceServers';
import addIceCandidateFromQueue from './addIceCandidateFromQueue';
import addIceCandidate from './addIceCandidate';
import onIceCandidate from './onIceCandidate';
import addIceCandidateToQueue from './addIceCandidateToQueue';

/**
 * @namespace IceConnectionHelpers
 * @description All helper and utility functions for <code>{@link IceConnection}</code> class are listed here.
 * @private
 * @type {{setIceServers, addIceCandidateFromQueue, addIceCandidate, onIceCandidate, addIceCandidateToQueue}}
 */
const helpers = {
  setIceServers,
  addIceCandidateFromQueue,
  addIceCandidate,
  onIceCandidate,
  addIceCandidateToQueue,
};

export default helpers;
