import helpers from './helpers';

/**
 * @classdesc Class that represents PeerData methods
 * @class
 * @private
 */
class PeerData {
  /**
   * @description Function that returns the User / Peer current session information.
   * @private
   * @param {String} peerId
   * @param {SkylinkRoom} room
   * @return {peerInfo}
   */
  static getPeerInfo(peerId, room) {
    return helpers.getPeerInfo(peerId, room);
  }

  /**
   * @private
   * @param {SkylinkRoom} room
   * @return {peerInfo}
   */
  static getCurrentSessionInfo(room) {
    return helpers.getCurrentSessionInfo(room);
  }

  /**
   * @description Function that returns the User session information to be sent to Peers.
   * @private
   * @param {SkylinkRoom} room
   * @return {Object}
   */
  static getUserInfo(room) {
    return helpers.getUserInfo(room);
  }

  /**
   * @description Function that returns the User / Peer current custom data.
   * @private
   * @param {Skylink} roomState
   * @param {String} peerId
   * @return {roomState.userData}
   */
  static getUserData(roomState, peerId) {
    return helpers.getUserData(roomState, peerId);
  }

  /**
   * @description Function that overwrites the User current custom data.
   * @private
   * @param {SkylinkRoom} room
   * @param {String | Object} userData
   */
  static setUserData(room, userData) {
    helpers.setUserData(room, userData);
  }

  /**
   * @description  Function that gets the list of connected Peers Streams in the Room.
   * @private
   * @param {SkylinkState} roomState
   * @param {boolean} [includeSelf=true] - The flag if self streams are included.
   * @return {Object}
   */
  static getPeersStreams(roomState, includeSelf) {
    return helpers.getPeersStreams(roomState, includeSelf);
  }

  /**
   * @description Function that gets the current list of connected Peers Datachannel connections in the Room.
   * @private
   * @param {SkylinkState} roomState
   * @return {Object} listOfPeersDataChannels
   */
  static getPeersDataChannels(roomState) {
    return helpers.getPeersDataChannels(roomState);
  }

  /**
   * @description Function that gets the list of current custom Peer settings sent and set.
   * @param {SkylinkState} roomState
   * @return {Object}
   */
  static getPeersCustomSettings(roomState) {
    return helpers.getPeersCustomSettings(roomState);
  }
}

export default PeerData;
