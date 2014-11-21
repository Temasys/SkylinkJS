/**
 * Internal array of peer informations.
 * @attribute _peerInformations
 * @type Object
 * @private
 * @required
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._peerInformations = [];

/**
 * User information, credential and the local stream(s).
 * @attribute _user
 * @type JSON
 * @param {String} uid The user's session id.
 * @param {String} sid The user's secret id. This is the id used as the peerId.
 * @param {String} timestamp The user's timestamp.
 * @param {String} token The user's access token.
 * @param {Array} streams The array of user's MediaStream(s).
 * @param {JSON} info The user's peer information object.
 * @param {JSON} info.settings User stream settings.
 * @param {Boolean|JSON} [info.settings.audio=false] User audio settings.
 * @param {Boolean} [info.settings.audio.stereo=false] User has enabled stereo or not.
 * @param {Boolean|JSON} [info.settings.video=false] User video settings.
 * @param {Bolean|JSON} [info.settings.video.resolution] User video
 *   resolution set. [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [info.settings.video.resolution.width] User video
 *   resolution width.
 * @param {Integer} [info.settings.video.resolution.height] User video
 *   resolution height.
 * @param {Integer} [info.settings.video.frameRate] User video minimum
 *   frame rate.
 * @param {JSON} info.mediaStatus User MediaStream(s) status.
 * @param {Boolean} [info.mediaStatus.audioMuted=true] Is user's audio muted.
 * @param {Boolean} [info.mediaStatus.videoMuted=true] Is user's vide muted.
 * @param {String|JSON} info.userData User's custom data set.
 * @required
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._user = null;

/**
 * Update/Set the user custom data. This Data can be a simple string or a JSON data.
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
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.setUserData = function(userData) {
  var self = this;
  // NOTE ALEX: be smarter and copy fields and only if different
  self._condition('readyStateChange', function () {
    self._wait(function () {
      self._user.info = self._user.info || {};
      self._user.info.userData = userData ||
        self._user.info.userData || {};

      if (self._inRoom) {
        log.log('Updated userData -> ', userData);
        self._sendChannelMessage({
          type: self._SIG_MESSAGE_TYPE.UPDATE_USER,
          mid: self._user.sid,
          rid: self._room.id,
          userData: self._user.info.userData
        });
        self._trigger('peerUpdated', self._user.sid, self._user.info, true);
      } else {
        log.warn('User is not in the room. Broadcast of updated information will be dropped');
      }
    }, function () {
      return !!self._user;
    });
  }, function () {
    return self._readyState === self.READY_STATE_CHANGE.COMPLETED;
  }, function (state) {
    return state === self.READY_STATE_CHANGE.COMPLETED;
  });
};

/**
 * Gets the user custom data.
 * See {{#crossLink "Skylink/setUserData:method"}}setUserData(){{/crossLink}}
 *   for more information
 * @method getUserData
 * @return {JSON|String} User custom data.
 * @example
 *   var userInfo = SkylinkDemo.getUserData();
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.getUserData = function() {
  return (this._user) ?
    ((this._user.info) ? (this._user.info.userData || '')
    : '') : '';
};

/**
 * Gets the peer information (media settings,media status and personnal data set by the peer).
 * @method getPeerInfo
 * @param {String} [peerId] Id of the peer retrieve we want to retrieve the information.
 * If no id is set, <b>getPeerInfo()</b> returns self peer information.
 * @return {JSON} Peer information:
 *   - settings {JSON}: User stream settings.
 *     - audio {Boolean|JSON}: User audio settings.
 *       - stereo {Boolean} : User has enabled stereo or not.
 *     - video {Boolean|JSON}: User video settings.
 *       - resolution {Boolean|JSON}: User video
 *     resolution set. [Rel: Skylink.VIDEO_RESOLUTION]
 *         - width {Integer}: User video resolution width.
 *         - height {Integer}:User video resolution height.
 *     - frameRate {Integer}: User video minimum
 *     frame rate.
 *   - mediaStatus {JSON}: User MediaStream(s) status.
 *     - audioMuted {Boolean}: Is user's audio muted.
 *     - videoMuted {Boolean}: Is user's vide muted.
 *   - userData {String|JSON}: User's custom data set.See 
 *   {{#crossLink "Skylink/setUserData:method"}}setUserData(){{/crossLink}}
 *   for more information
 * 
 * If peerId doesn't exist return 'null'.
 * @example
 *   // Example 1: To get other peer's information
 *   var peerInfo = SkylinkDemo.getPeerInfo(peerId);
 *
 *   // Example 2: To get own information
 *   var userInfo = SkylinkDemo.getPeerInfo();
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.getPeerInfo = function(peerId) {
  return (peerId && peerId !== this._user.sid) ?
    this._peerInformations[peerId] :
    ((this._user) ? this._user.info : null);
};
