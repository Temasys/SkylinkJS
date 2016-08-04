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
 * @trigger peerUpdated
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
 * Function that retrieves the User current custom data.
 * @method getUserData
 * @return {JSON|String} The User current custom data.
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
 * Function that parses the User custom data provided.
 * @method _parseUserData
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._parseUserData = function(userData) {
  log.debug('Parsing user data:', userData);

  this._userData = userData || '';
};

/**
 * Function that retrieves the User / Peer current session information.
 * @method getPeerInfo
 * @param {String} [peerId] The Peer ID to retrieve current session information from.<br>
 * &#8594; When not provided or the Peer ID is does not exists, it will return
 *   the User current session information
 * @return {JSON} The User / Peer current session information.
 *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
 *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.getPeerInfo = function(peerId) {
  var isNotSelf = this._user && this._user.sid ? peerId !== this._user.sid : false;

  if (typeof peerId === 'string' && isNotSelf) {
    // peer info
    var peerInfo = this._peerInformations[peerId];

    if (typeof peerInfo === 'object') {
      return peerInfo;
    }

    return null;
  } else {

    var mediaSettings = {};
    var mediaStatus = clone(this._mediaStreamsStatus) || {};

    // add screensharing information
    if (!!this._mediaScreen && this._mediaScreen !== null) {
      mediaSettings = clone(this._screenSharingStreamSettings);
      mediaSettings.bandwidth = clone(this._streamSettings.bandwidth);

      if (mediaSettings.video) {
        mediaSettings.video = {
          screenshare: true
        };
      }
    } else {
      mediaSettings = clone(this._streamSettings);
    }

    if (!mediaSettings.audio) {
      mediaStatus.audioMuted = true;
    }

    if (!mediaSettings.video) {
      mediaStatus.videoMuted = true;
    }

    return {
      userData: clone(this._userData) || '',
      settings: mediaSettings || {},
      mediaStatus: mediaStatus,
      agent: {
        name: window.webrtcDetectedBrowser,
        version: window.webrtcDetectedVersion
      },
      room: clone(this._selectedRoom)
    };
  }
};
