/**
 * @classdesc Class representing a Skylink User.
 * @class
 * @private
 */
class SkylinkUser {
  /**
   * @param {RawApiResponse} rawApiResponse - API response received from the API Server
   */
  constructor(rawApiResponse) {
    /**
     * The user id of the user
     * @type {String}
     */
    this.uid = rawApiResponse.username;
    /**
     * The user credentials or token of the user
     * @type {String}
     */
    this.token = rawApiResponse.userCred;
    /**
     * TimeStamp returned by API
     * @type {Date}
     */
    this.timeStamp = rawApiResponse.timeStamp;
    /**
     * The socket ID of the user
     * @type {JSON}
     */
    this.sid = null;
    /**
     * The status of whether messages via signaling server should be buffered. Messages will be buffered if it is not a handshake message and
     * enter message has not been sent by the user.
     * @type {Null|Boolean} Null when uninitialized i.e. no messages have been added to buffer, true when initialized i.e. messages have been
     * added to buffer and false when enter message has been sent
     */
    this.bufferMessage = null;
    /**
     * The peer session id. A new peer session id is generated for every authenticated session. Client can choose to cache the peer session id
     * locally to be used when sending messages for a persistent peer id.
     * @type {String}
     */
    this.peerSessionId = rawApiResponse.peerSessionId;
  }
}

export default SkylinkUser;
