import createOffer from './createOffer';
import addPeer from './peer-addition/addPeer';
import createAnswer from './createAnswer';
import createDataChannel from './data-channel/createDataChannel';
import sendP2PMessage from './data-channel/sendP2PMessage';
import getPeersInRoom from './getPeersInRoom';
import signalingEndOfCandidates from './signalingEndOfCandidates';
import getDataChannelBuffer from './data-channel/getDataChannelBuffer';
import refreshDataChannel from './data-channel/refreshDataChannel';
import closeDataChannel from './data-channel/closeDataChannel';
import refreshConnection from './refresh-connection/refreshConnection';
import refreshPeerConnection from './refresh-connection/refreshPeerConnection';
import restartPeerConnection from './refresh-connection/restartPeerConnection';
import buildPeerInformations from './buildPeerInformations';
import getConnectionStatus from './getConnectionStatus';
import closePeerConnection from './closePeerConnection';
import updatePeerInformationsMediaStatus from './updatePeerInformationsMediaStatus';

/**
 * @namespace PeerConnectionHelpers
 * @description All helper and utility functions for <code>{@link PeerConnection}</code> class are listed here.
 * @private
 * @memberof PeerConnection
 * @type {{createOffer, createAnswer, addPeer, createDataChannel, sendP2PMessage, getPeersInRoom, signalingEndOfCandidates, getDataChannelBuffer, refreshDataChannel, closeDataChannel, refreshConnection, refreshPeerConnection, restartPeerConnection, buildPeerInformations, getConnectionStatus, closePeerConnection, updatePeerInformationsMediaStatus }}
 */
const helpers = {
  createOffer,
  createAnswer,
  addPeer,
  createDataChannel,
  sendP2PMessage,
  getPeersInRoom,
  signalingEndOfCandidates,
  getDataChannelBuffer,
  refreshDataChannel,
  closeDataChannel,
  refreshConnection,
  refreshPeerConnection,
  restartPeerConnection,
  buildPeerInformations,
  getConnectionStatus,
  closePeerConnection,
  updatePeerInformationsMediaStatus,
};

export default helpers;
