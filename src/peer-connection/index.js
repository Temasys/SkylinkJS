import PeerConnectionStatistics from './helpers/statistics';
import helpers from './helpers/index';
import screenshareHelpers from '../features/screen-sharing/helpers/index';

/**
 * @classdesc Class that represents a PeerConnection
 * @class
 * @private
 */
class PeerConnection {
  /**
   * @static
   * @param {object} params - options required to create a PeerConnection
   * @param {SkylinkRoom} params.currentRoom - The currrent state
   * @param {String} params.targetMid - Peer's id
   * @param {Object} params.peerBrowser - Peer's user agent object
   * @param {RTCCertificate} params.cert - Represents a certificate that an RTCPeerConnection uses to authenticate.
   * @param {boolean} receiveOnly
   * @param {boolean} hasScreenshare - Is screenshare enabled
   */
  static addPeer(params) {
    helpers.addPeer(params);
  }

  /**
   * @static
   * @param args
   */
  static createOffer(...args) {
    return helpers.createOffer(...args);
  }

  /**
   * @static
   * @param args
   */
  static createAnswer(...args) {
    return helpers.createAnswer(...args);
  }

  /**
   * @static
   * @param args
   */
  static createDataChannel(...args) {
    return helpers.createDataChannel(...args);
  }

  /**
   * @static
   * @param args
   */
  static sendP2PMessage(...args) {
    return helpers.sendP2PMessage(...args);
  }

  /**
   * @static
   * @param args
   */
  static getPeersInRoom(...args) {
    return helpers.getPeersInRoom(...args);
  }

  /**
   * Get webRTC statistics via the getStats() method of RTCPeerConnection inside a Room
   * @param {SkylinkRoom.id} roomKey
   * @param {String} peerId
   * @param {boolean} beSilentOnLogs
   * @param {boolean} isAutoBwStats - The flag if retrieveStatistics is called from BandwidthAdjuster
   * @static
   * @return {Promise}
   */
  static retrieveStatistics(roomKey, peerId, beSilentOnLogs, isAutoBwStats) {
    const peerConnectionStatistics = new PeerConnectionStatistics(roomKey, peerId);
    return peerConnectionStatistics.getStatistics(beSilentOnLogs, isAutoBwStats);
  }

  /**
   * @static
   * @param args
   */
  static signalingEndOfCandidates(...args) {
    return helpers.signalingEndOfCandidates(...args);
  }

  /**
   * Get RTCPeerConnection status
   * @param {SkylinkState} roomState
   * @param {String|Array} peerId
   * @static
   * @return {Promise<statistics>}
   */
  static getConnectionStatus(roomState, peerId) {
    return helpers.getConnectionStatus(roomState, peerId);
  }

  /**
   * Get RTCDataChannel buffer thresholds
   * @param {RTCDataChannel.channel} channel
   * @static
   * @return {{bufferedAmountLow: number, bufferedAmountLowThreshold: number}}
   */
  static getDataChannelBuffer(channel) {
    return helpers.getDataChannelBuffer(channel);
  }

  static refreshDataChannel(roomState, peerId) {
    return helpers.refreshDataChannel(roomState, peerId);
  }

  static closeDataChannel(roomState, peerId) {
    return helpers.closeDataChannel(roomState, peerId);
  }

  static refreshConnection(roomState, targetPeerId, iceRestart, options, callback) {
    return helpers.refreshConnection(roomState, targetPeerId, iceRestart, options, callback);
  }

  static refreshPeerConnection(listOfPeers, roomState, doIceRestart, bwOptions) {
    return helpers.refreshPeerConnection(listOfPeers, roomState, doIceRestart, bwOptions);
  }

  static getPeerScreenshare(roomState) {
    return screenshareHelpers.retrievePeerScreenStream(roomState);
  }

  static buildPeerInformations(...args) {
    return helpers.buildPeerInformations(...args);
  }

  static closePeerConnection(roomState, peerId) {
    return helpers.closePeerConnection(roomState, peerId);
  }

  static updatePeerInformationsMediaStatus(roomState, peerId, transceiverMid, stream) {
    return helpers.updatePeerInformationsMediaStatus(roomState, peerId, transceiverMid, stream);
  }
}

export default PeerConnection;
