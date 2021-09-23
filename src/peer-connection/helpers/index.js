import createOffer from './createOffer';
import addPeer from './peer-addition/addPeer';
import createAnswer from './createAnswer';
import sendP2PMessage from './sendP2PMessage';
import getPeersInRoom from './getPeersInRoom';
import signalingEndOfCandidates from './signalingEndOfCandidates';
import refreshConnection from './refresh-connection/refreshConnection';
import refreshPeerConnection from './refresh-connection/refreshPeerConnection';
import restartPeerConnection from './refresh-connection/restartPeerConnection';
import buildAndSetPeerInformations from './buildAndSetPeerInformations';
import getConnectionStatus from './getConnectionStatus';
import closePeerConnection from './closePeerConnection';
import updatePeerInformationsMediaStatus from './updatePeerInformationsMediaStatus';
import processNewSender from './processNewSender';
import renegotiateIfNeeded from './renegotiateIfNeeded';

/**
 * @namespace PeerConnectionHelpers
 * @description All helper and utility functions for <code>{@link PeerConnection}</code> class are listed here.
 * @private
 * @memberOf PeerConnection
 * @type {{createOffer, createAnswer, addPeer, sendP2PMessage, getPeersInRoom, signalingEndOfCandidates, refreshConnection, refreshPeerConnection, restartPeerConnection, buildAndSetPeerInformations, getConnectionStatus, closePeerConnection, updatePeerInformationsMediaStatus, processNewSender, renegotiateIfNeeded }}
 */
const helpers = {
  createOffer,
  createAnswer,
  addPeer,
  sendP2PMessage,
  getPeersInRoom,
  signalingEndOfCandidates,
  refreshConnection,
  refreshPeerConnection,
  restartPeerConnection,
  buildAndSetPeerInformations,
  getConnectionStatus,
  closePeerConnection,
  updatePeerInformationsMediaStatus,
  processNewSender,
  renegotiateIfNeeded,
};

export default helpers;
