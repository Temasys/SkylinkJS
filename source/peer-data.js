/**
 * Stores the User information.
 * @attribute _peerInformations
 * @type Object
 * @private
 * @required
 * @component Peer
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._peerInformations = [];

/**
 * Stores the User information, credential and the local stream(s).
 * @attribute _user
 * @type JSON
 * @param {String} uid The user's session id.
 * @param {String} sid The user's secret id. This is the id used as the peerId.
 * @param {String} timestamp The user's timestamp.
 * @param {String} token The user's access token.
 * @required
 * @private
 * @component User
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._user = null;

/**
 * User's custom data set.
 * @attribute _userData
 * @type JSON|String
 * @required
 * @private
 * @component User
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._userData = '';

/**
 * User's email address. Useful to contact client when mixing is starting/done (
 * @attribute _mailAddress
 * @type String
 * @private
 * @component User
 * @for Skylink
 */
Skylink.prototype._mailAddress = '';

/**
 * Update/Set the User custom data. This Data can be a simple string or a JSON data.
 * It is let to user choice to decide how this information must be handled.
 * The Skylink demos provided use this parameter as a string for displaying user name.
 * - Please note that the custom data would be totally overwritten.
 * - If you want to modify only some data, please call
 *   {{#crossLink "Skylink/getUserData:method"}}getUserData(){{/crossLink}}
 *   and then modify the information you want individually.
 * - {{#crossLink "Skylink/peerUpdated:event"}}peerUpdated{{/crossLink}}
 *   event fires only if <b>setUserData()</b> is called after
 *   joining a room.
 * @method setUserData
 * @param {JSON|String} userData User custom data.
 * @example
 *   // Example 1: Intial way of setting data before user joins the room
 *   SkylinkDemo.setUserData({
 *     displayName: 'Bobby Rays',
 *     fbUserId: '1234'
 *   });
 *
 *  // Example 2: Way of setting data after user joins the room
 *   var userData = SkylinkDemo.getUserData();
 *   userData.displayName = 'New Name';
 *   userData.fbUserId = '1234';
 *   SkylinkDemo.setUserData(userData);
 * @trigger peerUpdated
 * @component User
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.setUserData = function(userData) {
  var self = this;
  // NOTE ALEX: be smarter and copy fields and only if different
  self._parseUserData(userData);

  if (self._inRoom) {
    log.log('Updated userData -> ', userData);
    self._sendChannelMessage({
      type: self._SIG_MESSAGE_TYPE.UPDATE_USER,
      mid: self._user.sid,
      rid: self._room.id,
      userData: self._userData
    });
    self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
  } else {
    log.warn('User is not in the room. Broadcast of updated information will be dropped');
  }
};

/**
 * Gets the User custom data.
 * See {{#crossLink "Skylink/setUserData:method"}}setUserData(){{/crossLink}}
 *   for more information
 * @method getUserData
 * @return {JSON|String} User custom data.
 * @example
 *   // Example 1: To get other peer's userData
 *   var peerData = SkylinkDemo.getUserData(peerId);
 *
 *   // Example 2: To get own userData
 *   var userData = SkylinkDemo.getUserData();
 * @component User
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.getUserData = function(peerId) {
  if (peerId && peerId !== this._user.sid) {
    // peer info
    var peerInfo = this._peerInformations[peerId];

    if (typeof peerInfo === 'object') {
      return peerInfo.userData;
    }

    return null;
  }
  return this._userData;
};

/**
 * Gets the Peer information (media settings,media status and personnal data set by the peer).
 * @method _parseUserData
 * @param {JSON} [userData] User custom data.
 * @private
 * @component User
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._parseUserData = function(userData) {
  log.debug('Parsing user data:', userData);

  this._userData = userData || '';
};

/**
 * Gets the Peer information.
 * - If there is no information related to the peer, <code>null</code> would be returned.
 * @method getPeerInfo
 * @param {String} [peerId] The peerId of the peer retrieve we want to retrieve the information.
 *    Leave this blank to return the User information.
 * @return {JSON} Peer information. Please reference
 *   {{#crossLink "Skylink/peerJoined:event"}}peerJoined{{/crossLink}}
 *   <code>peerInfo</code> parameter.
 * @example
 *   // Example 1: To get other peer's information
 *   var peerInfo = SkylinkDemo.getPeerInfo(peerId);
 *
 *   // Example 2: To get own information
 *   var userInfo = SkylinkDemo.getPeerInfo();
 * @component Peer
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.getPeerInfo = function(peerId) {
  if (peerId && peerId !== this._user.sid) {
    // peer info
    var peerInfo = this._peerInformations[peerId];

    if (typeof peerInfo === 'object') {
      return peerInfo;
    }

    return null;
  } else {
    // user info
    // prevent undefined error
    this._user = this._user || {};
    this._userData = this._userData || '';

    this._mediaStreamsStatus = this._mediaStreamsStatus || {};
    this._streamSettings = this._streamSettings || {};

    return {
      userData: this._userData,
      settings: this._streamSettings,
      mediaStatus: this._mediaStreamsStatus,
      agent: {
        name: window.webrtcDetectedBrowser,
        version: window.webrtcDetectedVersion
      }
    };
  }
};
