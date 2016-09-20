/**
 * Stores the list of Peers session information.
 * @attribute _peerInformations
 * @param {JSON} <#peerId> The Peer session information.
 * @param {JSON|String} <#peerId>.userData The Peer custom data.
 * @param {JSON} <#peerId>.settings The Peer streaming information.
 * @param {JSON} <#peerId>.mediaStatus The Peer streaming muted status.
 * @param {JSON} <#peerId>.agent The Peer agent information.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._peerInformations = {};

/**
 * Stores the Signaling user credentials from the API response required for connecting to the Signaling server.
 * @attribute _user
 * @param {String} uid The API result "username".
 * @param {String} token The API result "userCred".
 * @param {String} timeStamp The API result "timeStamp".
 * @param {String} sid The Signaling server receive user Peer ID.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._user = null;

/**
 * Stores the User custom data.
 * By default, if no custom user data is set, it is an empty string <code>""</code>.
 * @attribute _userData
 * @type JSON|String
 * @default ""
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._userData = '';

/**
 * Function that overwrites the User current custom data.
 * @method setUserData
 * @param {JSON|String} userData The updated custom data.
 * @trigger <ol class="desc-seq">
 *   <li>Updates User custom data. <ol>
 *   <li>If User is in Room: <ol>
 *   <li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers with parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li></ol></li></ol></li></ol>
 * @example
 *   // Example 1: Set/Update User custom data before joinRoom()
 *   var userData = "beforejoin";
 *
 *   skylinkDemo.setUserData(userData);
 *
 *   skylinkDemo.joinRoom(function (error, success) {
 *      if (error) return;
 *      if (success.peerInfo.userData === userData) {
 *        console.log("User data is sent");
 *      }
 *   });
 *
 *   // Example 2: Update User custom data after joinRoom()
 *   var userData = "afterjoin";
 *
 *   skylinkDemo.joinRoom(function (error, success) {
 *     if (error) return;
 *     skylinkDemo.setUserData(userData);
 *     if (skylinkDemo.getPeerInfo().userData === userData) {
 *       console.log("User data is updated and sent");
 *     }
 *   });
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.setUserData = function(userData) {
  var self = this;

  this._userData = userData || '';

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
 * Function that returns the User / Peer current custom data.
 * @method getUserData
 * @param {String} [peerId] The Peer ID to return the current custom data from.
 * - When not provided or that the Peer ID is does not exists, it will return
 *   the User current custom data.
 * @return {JSON|String} The User / Peer current custom data.
 * @example
 *   // Example 1: Get Peer current custom data
 *   var peerUserData = skylinkDemo.getUserData(peerId);
 *
 *   // Example 2: Get User current custom data
 *   var userUserData = skylinkDemo.getUserData();
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
 * Function that returns the User / Peer current session information.
 * @method getPeerInfo
 * @param {String} [peerId] The Peer ID to return the current session information from.
 * - When not provided or that the Peer ID is does not exists, it will return
 *   the User current session information.
 * @return {JSON} The User / Peer current session information.
 *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
 *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
 * @example
 *   // Example 1: Get Peer current session information
 *   var peerPeerInfo = skylinkDemo.getPeerInfo(peerId);
 *
 *   // Example 2: Get User current session information
 *   var userPeerInfo = skylinkDemo.getPeerInfo();
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.getPeerInfo = function(peerId) {
  if (typeof peerId === 'string' && typeof this._peerInformations[peerId] === 'object') {
    return this._peerInformations[peerId];
  }

  var peerInfo = {
    userData: clone(this._userData) || '',
    settings: {
      audio: false,
      video: false
    },
    mediaStatus: clone(this._streamsMutedSettings),
    agent: {
      name: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion,
      os: window.navigator.platform,
      pluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null
    },
    room: clone(this._selectedRoom)
  };

  if (this._streams.screenshare) {
    peerInfo.settings = clone(this._streams.screenshare.settings);
  } else if (this._streams.userMedia) {
    peerInfo.settings = clone(this._streams.userMedia.settings);
  }

  if (!peerInfo.settings.audio) {
    peerInfo.mediaStatus.audioMuted = true;
  }

  if (!peerInfo.settings.video) {
    peerInfo.mediaStatus.videoMuted = true;
  }

  return peerInfo;
};
