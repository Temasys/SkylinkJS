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
     * @type {string}
     */
    this.uid = rawApiResponse.username;
    /**
     * The user credentials or token of the user
     * @type {string}
     */
    this.token = rawApiResponse.userCred;
    /**
     * TimeStamp returned by API
     * @type {Date}
     */
    this.timeStamp = rawApiResponse.timeStamp;
    /**
     * The MediaStreams for this user
     * @type {MediaStreams[]}
     */
    this.streams = [];
    /**
     * Information about this user
     * @type {JSON}
     */
    this.info = {};
    /**
     * The socket ID of the user
     * @type {JSON}
     */
    this.sid = null;
  }
}

export default SkylinkUser;
