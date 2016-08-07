/**
 * Contains the list of Signaling action states.
 * @attribute SYSTEM_ACTION
 * @param {String} WARNING <small>Value <code>"warning"</code></small>
 *   The action given when Signaling might be ending the User session.
 *   <small>See <a href="#attr_SYSTEM_ACTION_REASON"><code>SYSTEM_ACTION_REASON</code></a> for the
 *     list of reasons that would result in this action state.</small>
 * @param {String} REJECT <small>Value <code>"reject"</code></small>
 *   The action state where the Signaling has ended the User session.
 *   <small>See <a href="#attr_SYSTEM_ACTION_REASON"><code>SYSTEM_ACTION_REASON</code></a> for the
 *     list of reasons that would result in this action state.</small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype.SYSTEM_ACTION = {
  WARNING: 'warning',
  REJECT: 'reject'
};

/**
 * Contains the list of reason codes for the Signaling action states given.
 * @attribute SYSTEM_ACTION_REASON
 * @param {String} FAST_MESSAGE <small>Value <code>"fastmsg"</code></small>
 *   The reason code given when User is jamming the Signaling with a flood of messages and
 *   the Signaling might end the User session to prevent User from disrupting other Peers session.
 *  <small>This is caused by messages sent too quickly within less than 1 second interval from methods
 *     like <a href="#method_sendMessage"><code>sendMessage()</code> method</a>,
 *     <a href="#method_setUserData"><code>setUserData()</code> method</a>,
 *     <a href="#method_muteStream"><code>muteStream()</code> method</a>,
 *     <a href="#method_enableAudio"><code>enableAudio()</code> method</a>,
 *     <a href="#method_enableVideo"><code>enableVideo()</code> method</a>,
 *     <a href="#method_disableAudio"><code>disableAudio()</code> method</a> and
 *     <a href="#method_disableVideo"><code>disableVideo()</code> method</a>.
 *     However this message should not occur as queueing of messages is implemented in the SDK.</small>
 *  <small>Ties with <a href="#attr_SYSTEM_ACTION"><code>SYSTEM_ACTION</code></a> action state <code>WARNING</code></small>
 * @param {String} ROOM_CLOSING <small>Value <code>"toClose"</code></small>
 *   The reason code given when User session in the Room is ending.
 *  <small>The starting datetime and duration of the User session depends on the type of authentication scheme used.<br>
 *    Read more about the different <a href="http://support.temasys.com.sg/support/solutions/articles/
 * 12000002712-authenticating-your-application-key-to-start-a-connection">authentication methods here</a>
 *    or see the <a href="#method_init"><code>init()</code> method</a>.</small>
 *  <small>Ties with <a href="#attr_SYSTEM_ACTION"><code>SYSTEM_ACTION</code></a> action state <code>WARNING</code></small>
 * @param {String} CREDENTIALS_EXPIRED <small>Value <code>"oldTimeStamp"</code></small>
 *    The reason code given when provided credentials has already expired when User is attempting to join Room.
 *  <small>The starting datetime and duration of the User session depends on the type of authentication scheme used.<br>
 *    Read more about the different <a href="http://support.temasys.com.sg/support/solutions/articles/
 * 12000002712-authenticating-your-application-key-to-start-a-connection">authentication methods here</a>
 *    or see the <a href="#method_init"><code>init()</code> method</a>.</small>
 *  <small>Ties with <a href="#attr_SYSTEM_ACTION"><code>SYSTEM_ACTION</code></a> action state <code>REJECT</code></small>
 * @param {String} CREDENTIALS_ERROR <small>Value <code>"credentialError"</code></small>
 *    The reason code given when verifying provided credentials has failed when User is attempting to join Room.
 *  <small>Ties with <a href="#attr_SYSTEM_ACTION"><code>SYSTEM_ACTION</code></a> action state <code>REJECT</code></small>
 * @param {String} DUPLICATED_LOGIN <small>Value <code>"duplicatedLogin"</code></small>
 *    The reason code given when provided credentials has already been used when User is attempting to join Room.
 *  <small>Ties with <a href="#attr_SYSTEM_ACTION"><code>SYSTEM_ACTION</code></a> action state <code>REJECT</code></small>
 * @param {String} ROOM_NOT_STARTED <small>Value <code>"notStart"</code></small>
 *    The reason code given when Room session has not started when User is attempting to join Room.
 *  <small>The starting datetime and duration of the User session depends on the type of authentication scheme used.<br>
 *    Read more about the different <a href="http://support.temasys.com.sg/support/solutions/articles/
 * 12000002712-authenticating-your-application-key-to-start-a-connection">authentication methods here</a>
 *    or see the <a href="#method_init"><code>init()</code> method</a>.</small>
 *  <small>Ties with <a href="#attr_SYSTEM_ACTION"><code>SYSTEM_ACTION</code></a> action state <code>REJECT</code></small>
 * @param {String} EXPIRED <small>Value <code>"expired"</code></small>
 *    The reason code given when Room session has already ended when User is attempting to join Room.
 *  <small>Ties with <a href="#attr_SYSTEM_ACTION"><code>SYSTEM_ACTION</code></a> action state <code>REJECT</code></small>
 *  <small>The starting datetime and duration of the User session depends on the type of authentication scheme used.<br>
 *    Read more about the different <a href="http://support.temasys.com.sg/support/solutions/articles/
 * 12000002712-authenticating-your-application-key-to-start-a-connection">authentication methods here</a>
 *    or see the <a href="#method_init"><code>init()</code> method</a>.</small>
 * @param {String} ROOM_LOCKED <small>Value <code>"locked"</code></small>
 *    The reason code given when Room session has been locked and User is blocked from joining the Room.
 *  <small>Room can be unlocked with <a href="#method_unlockRoom"><code>unlockRoom()</code> method</a> and
 *     locked with <a href="#method_lockRoom"><code>lockRoom()</code> method</a>.</small>
 *  <small>Ties with <a href="#attr_SYSTEM_ACTION"><code>SYSTEM_ACTION</code></a> action state <code>REJECT</code></small>
 * @param {String} ROOM_CLOSED <small>Value <code>"roomclose"</code></small>
 *   The reason code given when User session in the Room has already ended.
 *   <small>Ties with <a href="#attr_SYSTEM_ACTION"><code>SYSTEM_ACTION</code></a> action state <code>REJECT</code></small>
 *  <small>The starting datetime and duration of the User session depends on the type of authentication scheme used.<br>
 *    Read more about the different <a href="http://support.temasys.com.sg/support/solutions/articles/
 * 12000002712-authenticating-your-application-key-to-start-a-connection">authentication methods here</a>
 *    or see the <a href="#method_init"><code>init()</code> method</a>.</small>
 * @param {String} SERVER_ERROR <small>Value <code>"serverError"</code></small>
 *    The reason code given when there has been errors while attempting to connect User to the Room.
 *  <small>Ties with <a href="#attr_SYSTEM_ACTION"><code>SYSTEM_ACTION</code></a> action state <code>REJECT</code></small>
 * @param {String} KEY_ERROR <small>Value <code>"keyFailed"</code></small>
 *    The reason code given when there has been errors while attempting to connect with the App Key provided in
 *    <a href="#method_init"><code>init()</code> method</a>.
 *  <small>Ties with <a href="#attr_SYSTEM_ACTION"><code>SYSTEM_ACTION</code></a> action state <code>REJECT</code></small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype.SYSTEM_ACTION_REASON = {
  CREDENTIALS_EXPIRED: 'oldTimeStamp',
  CREDENTIALS_ERROR: 'credentialError',
  DUPLICATED_LOGIN: 'duplicatedLogin',
  ROOM_NOT_STARTED: 'notStart',
  EXPIRED: 'expired',
  ROOM_LOCKED: 'locked',
  FAST_MESSAGE: 'fastmsg',
  ROOM_CLOSING: 'toClose',
  ROOM_CLOSED: 'roomclose',
  SERVER_ERROR: 'serverError',
  KEY_ERROR: 'keyFailed'
};

/**
 * Stores the current Room name that User is connected to.
 * @attribute _selectedRoom
 * @type String
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._selectedRoom = null;

/**
 * Stores the flag that indicates if Room is locked.
 * @attribute _roomLocked
 * @type Boolean
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._roomLocked = false;

/**
 * Stores the flag that indicates if User is connected to the Room.
 * @attribute _inRoom
 * @type Boolean
 * @private
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype._inRoom = false;

/**
 * <blockquote class="info">
 *   Currently, the SDK only supports sending a single Stream to Peers.
 *   If there is <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> available, it will
 *   be the Stream sent to Peers regardless if <a href="#method_getUserMedia"><code>getUserMedia()</code>
 *   Stream</a> is available.
 * </blockquote>
 * Function that connects User to the Room.
 * @method joinRoom
 * @param {String} [room] The Room name to connect to.
 *   <small>If not provided, the User will be connected to the <code>defaultRoom</code>
 *     configured in the <a href="#method_init"><code>init()</code> method</a>.</small>
 * @param {JSON} [options] The Room connection settings.
 * @param {JSON|String} [options.userData] The User custom data.
 *   <small>This can be set when User is in session with <a href="#method_setUserData"><code>setUserData()</code> method</a>.</small>
 * @param {Boolean|JSON} [options.audio] The audio settings for the Stream sent.
 *   <small>If either <code>options.audio</code> or <code>options.video</code> is defined,
 *      <code>joinRoom()</code> would invoke <a href="#method_getUserMedia"><code>getUserMedia()</code>
 *      method</a> to retrieve a new Stream, else it will use any existing Stream if any.
 *      Additionally, if <code>options.video</code> is not defined and this is, the <code>options.video</code>
 *      value will be set to <code>false</code> when retrieving the new Stream.</small>
 *      <small>Note that unless User's Stream is retrieved, <code>joinRoom()</code> will not join
 *      the Room until Stream is retrieved successfully.</small>
 *   <small>Object signature matches the <code>options.audio</code> parameter in the
 *      <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.</small>
 * @param {Boolean|JSON} [options.video] The video settings for the Stream sent.
 *   <small>If either <code>options.audio</code> or <code>options.video</code> is defined,
 *     <code>joinRoom()</code> would invoke <a href="#method_getUserMedia"><code>getUserMedia()</code>
 *      method</a> to retrieve a new Stream, else it will use any existing Stream if any.
 *      Additionally, if <code>options.audio</code> is not defined and this is, the <code>options.audio</code>
 *      value will be set to <code>false</code> when retrieving the new Stream.</small>
 *      <small>Note that unless User's Stream is retrieved, <code>joinRoom()</code> will not join
 *      the Room until Stream is retrieved successfully.</small>
 *   <small>Object signature matches the <code>options.video</code> parameter in the
 *      <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.</small>
 * @param {JSON} [options.bandwidth] <blockquote class="info">Note that this currently does not work
 *   with Firefox browsers.</blockquote> The configuration for limiting the maximum uploading Stream bandwidth.
 * @param {Number} [options.bandwidth.audio] The maximum uploading Stream audio bandwidth.
 * @param {Number} [options.bandwidth.video] The maximum uploading Stream video bandwidth.
 * @param {Number} [options.bandwidth.data] The maximum uploading Datachannel data transfer / P2P messaging bandwidth.
 *   <small>Affects <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>,
 *      <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a> and
 *      <a href="#method_sendURLData"><code>sendURLData()</code> method</a>.</small>
 * @param {Boolean} [options.manualGetUserMedia] The flag that indicates if <code>joinRoom()</code> should trigger
 *   <a href="#event_mediaAccessRequired"><code>mediaAccessRequired</code> event</a> to allow developers to
 *   handle the retrieval of Stream using <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> or
 *   <a href="#method_shareScreen"><code>shareScreen()</code> method</a> as a requirement before joining the Room.
 *   <small>Note that unless User's Stream is retrieved, <code>joinRoom()</code> will not join the Room until Stream
 *      is retrieved succesfully.</small>
 *   <small>Even if <code>options.audio</code> or <code>options.video</code> is defined, as long as this flag is
 *      enabled, <code>joinRoom()</code> would not invoke <a href="#method_getUserMedia"><code>getUserMedia()</code>
 *      method</a> to retrieve a new Stream as it would leave to the developers to retrieve it.</small>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 * @param {JSON} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {Error|String} callback.error.error The <code>joinRoom()</code> error.
 * @param {Number} callback.error.errorCode The Room authentication state error code.
 *   <small>If error is not caused by Room authentication errors, this should not be defined</small>
 *   <small>Sequentially, the User has to authenticate with the Platform to retrieve credentials which is
 *      used to join the Room which is known when <a href="#event_systemAction"><code>systemAction</code> event</a>
 *      is triggered. This error occurs when the authentication with the Platform fails.</small>
 *   [Rel: Skylink.READY_STATE_CHANGE_ERROR]
 * @param {String} callback.error.room The selected Room name to connect to.
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {String} callback.success.room The selected Room name to connect to.
 * @param {String} callback.success.peerId The User's session Peer ID in Room.
 * @param {JSON} callback.success.peerInfo The User current session information.
 *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
 *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
 * @trigger readyStateChange, mediaAccessRequired, channelOpen, channelMessage, systemAction, peerJoined, incomingStream
 * @for Skylink
 * @since 0.5.5
 */

Skylink.prototype.joinRoom = function(room, mediaOptions, callback) {
  var self = this;
  var error;
  var stopStream = false;
  var previousRoom = self._selectedRoom;

  if (room === null) {
    error = 'Invalid room name is provided';
    log.error(error, room);

    if (typeof mediaOptions === 'function') {
      callback = mediaOptions;
      mediaOptions = undefined;
    }

    if (typeof callback === 'function') {
      callback({
        room: room,
        errorCode: self._readyState,
        error: new Error(error)
      }, null);
    }
    return;
  }
  else if (typeof room === 'string') {
    //joinRoom(room+); - skip

    //joinRoom(room+,mediaOptions+) - skip

    // joinRoom(room+,callback+)
    if (typeof mediaOptions === 'function') {
      callback = mediaOptions;
      mediaOptions = undefined;

    // joinRoom(room+, mediaOptions-)
    } else if (typeof mediaOptions !== 'undefined') {
      if (mediaOptions === null || typeof mediaOptions !== 'object') {
        error = 'Invalid mediaOptions is provided';
        log.error(error, mediaOptions);

        // joinRoom(room+,mediaOptions-,callback+)
        if (typeof callback === 'function') {
          callback({
            room: room,
            errorCode: self._readyState,
            error: new Error(error)
          }, null);
        }
        return;
      }
    }

  } else if (typeof room === 'object') {
    //joinRoom(mediaOptions+, callback);
    if (typeof mediaOptions === 'function') {
      callback = mediaOptions;
    }

    //joinRoom(mediaOptions);
    mediaOptions = room;
    room = undefined;

  } else if (typeof room === 'function') {
    //joinRoom(callback);
    callback = room;
    room = undefined;
    mediaOptions = undefined;

  } else if (typeof room !== 'undefined') {
    //joinRoom(mediaOptions-,callback?);
    error = 'Invalid mediaOptions is provided';
    log.error(error, mediaOptions);

    if (typeof mediaOptions === 'function') {
      callback = mediaOptions;
      mediaOptions = undefined;
    }

    if (typeof callback === 'function') {
      callback({
        room: self._defaultRoom,
        errorCode: self._readyState,
        error: new Error(error)
      }, null);
      return;
    }
  }

  // If no room provided, join the default room
  if (!room) {
    room = self._defaultRoom;
  }

  //if none of the above is true --> joinRoom()
  var channelCallback = function (error, success) {
    if (error) {
      if (typeof callback === 'function') {
        callback({
          error: error,
          errorCode: null,
          room: self._selectedRoom
        }, null);
      }
    } else {
      if (typeof callback === 'function') {
        self.once('peerJoined', function(peerId, peerInfo, isSelf) {
          // keep returning _inRoom false, so do a wait
          self._wait(function () {
            log.log([null, 'Socket', self._selectedRoom, 'Peer joined. Firing callback. ' +
              'PeerId ->'
            ], peerId);
            callback(null, {
              room: self._selectedRoom,
              peerId: peerId,
              peerInfo: peerInfo
            });
          }, function () {
            return self._inRoom;
          }, false);
        }, function(peerId, peerInfo, isSelf) {
          return isSelf;
        }, false);
      }

      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.JOIN_ROOM,
        uid: self._user.uid,
        cid: self._key,
        rid: self._room.id,
        userCred: self._user.token,
        timeStamp: self._user.timeStamp,
        apiOwner: self._appKeyOwner,
        roomCred: self._room.token,
        start: self._room.startDateTime,
        len: self._room.duration,
        isPrivileged: self._isPrivileged === true, // Default to false if undefined
        autoIntroduce: self._autoIntroduce !== false, // Default to true if undefined
        key: self._appKey
      });
    }
  };

  if (self._inRoom) {
    if (typeof mediaOptions === 'object') {
      if (mediaOptions.audio === false && mediaOptions.video === false) {
        stopStream = true;
        log.warn([null, 'MediaStream', self._selectedRoom, 'Stopping current MediaStream ' +
          'as provided settings for audio and video is false (' + stopStream + ')'], mediaOptions);
      }
    }

    log.log([null, 'Socket', previousRoom, 'Leaving room before joining new room'], self._selectedRoom);

    self.leaveRoom(stopStream, function(error, success) {
      log.log([null, 'Socket', previousRoom, 'Leave room callback result'], {
        error: error,
        success: success
      });
      log.log([null, 'Socket', self._selectedRoom, 'Joining room. Media options:'], mediaOptions);
      if (typeof room === 'string' ? room !== self._selectedRoom : false) {
        self._initSelectedRoom(room, function(errorObj) {
          if (errorObj) {
            if (typeof callback === 'function') {
              callback({
                room: self._selectedRoom,
                errorCode: self._readyState,
                error: new Error(errorObj)
              }, null);
            }
          } else {
            self._waitForOpenChannel(mediaOptions, channelCallback);
          }
        });
      } else {
        self._waitForOpenChannel(mediaOptions, channelCallback);
      }
    });

  } else {
    log.log([null, 'Socket', self._selectedRoom, 'Joining room. Media options:'],
      mediaOptions);

    var isNotSameRoom = typeof room === 'string' ? room !== self._selectedRoom : false;

    if (isNotSameRoom) {
      self._initSelectedRoom(room, function(errorObj) {
        if (errorObj) {
          if (typeof callback === 'function') {
            callback({
              room: self._selectedRoom,
              errorCode: self._readyState,
              error: new Error(errorObj)
            }, null);
          }
        } else {
          self._waitForOpenChannel(mediaOptions, channelCallback);
        }
      });
    } else {
      self._waitForOpenChannel(mediaOptions, channelCallback);
    }
  }
};

/**
 * Function that disconnects User from the currently connected Room and ends the User's session.
 * @method leaveRoom
 * @param {Boolean|JSON} [stopMediaOptions=true] The flag that indicates if <code>leaveRoom()</code>
 *   should invoke <a href="#method_stopStream"><code>stopStream()</code> method</a> and
 *   <a href="#method_stopScreen"><code>stopScreen()</code> method</a> to stop current Streams
 *   retrieved from <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> and
 *   <a href="#method_shareScreen"><code>shareScreen()</code> method</a>.<br>
 * &#8594; When provided as an Boolean, it will set both <code>stopMediaOptions.userMedia</code> and
 *    <code>stopMediaOptions.screenshare</code> to <code>true</code>.
 * @param {Boolean} [stopMediaOptions.userMedia=true] The flag that indicates if
 *   <code>leaveRoom()</code> should stop any currently retrieved Stream from
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.
 * @param {Boolean} [stopMediaOptions.screenshare=true] The flag that indicates if
 *   <code>leaveRoom()</code> should stop any currently retrieved Stream from
 *   <a href="#method_shareScreen"><code>shareScreen()</code> method</a>.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {String} callback.success.peerId The User's ended session Peer ID in Room.
 * @param {String} callback.success.previousRoom The Room name which User's session has ended.
 * @trigger channelClose, streamEnded, peerLeft
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.leaveRoom = function(stopMediaOptions, callback) {
  var self = this;
  var error; // j-shint !!!
  var stopUserMedia = true;
  var stopScreenshare = true;

  // shift parameters
  if (typeof stopMediaOptions === 'function') {
    callback = stopMediaOptions;
    stopMediaOptions = true;
  } else if (typeof stopMediaOptions === 'undefined') {
    stopMediaOptions = true;
  }

  // stopMediaOptions === null or {} ?
  if (typeof stopMediaOptions === 'object' && stopMediaOptions !== null) {
    stopUserMedia = stopMediaOptions.userMedia !== false;
    stopScreenshare = stopMediaOptions.screenshare !== false;

  } else if (typeof stopMediaOptions !== 'boolean') {
    error = 'stopMediaOptions parameter provided is not a boolean or valid object';
    log.error(error, stopMediaOptions);
    if (typeof callback === 'function') {
      log.log([null, 'Socket', self._selectedRoom, 'Error occurred. ' +
        'Firing callback with error -> '
      ], error);
      callback(new Error(error), null);
    }
    return;

  } else if (stopMediaOptions === false) {
    stopUserMedia = false;
    stopScreenshare = false;
  }

  if (!self._inRoom) {
    error = 'Unable to leave room as user is not in any room';
    log.error(error);
    if (typeof callback === 'function') {
      log.log([null, 'Socket', self._selectedRoom, 'Error occurred. ' +
        'Firing callback with error -> '
      ], error);
      callback(new Error(error), null);
    }
    return;
  }

  // NOTE: ENTER/WELCOME made but no peerconnection...
  // which may result in peerLeft not triggered..
  // WHY? but to ensure clear all
  var peers = Object.keys(self._peerInformations);
  var conns = Object.keys(self._peerConnections);
  var i;
  for (i = 0; i < conns.length; i++) {
    if (peers.indexOf(conns[i]) === -1) {
      peers.push(conns[i]);
    }
  }
  for (i = 0; i < peers.length; i++) {
    self._removePeer(peers[i]);
  }
  self._inRoom = false;
  self._closeChannel();

  self._stopLocalMediaStreams({
    userMedia: stopUserMedia,
    screenshare: stopScreenshare
  });

  self._wait(function() {
    log.log([null, 'Socket', self._selectedRoom, 'User left the room. Callback fired.']);
    self._trigger('peerLeft', self._user.sid, self.getPeerInfo(), true);

    if (typeof callback === 'function') {
      callback(null, {
        peerId: self._user.sid,
        previousRoom: self._selectedRoom
      });
    }
  }, function() {
    return (Object.keys(self._peerConnections).length === 0 &&
      self._channelOpen === false); // &&
      //self._readyState === self.READY_STATE_CHANGE.COMPLETED);
  }, false);
};

/**
 * Function that locks the current Room which prevent other Peers from joining the Room.
 * @method lockRoom
 * @trigger roomLock
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype.lockRoom = function() {
  log.log('Update to isRoomLocked status ->', true);
  this._sendChannelMessage({
    type: this._SIG_MESSAGE_TYPE.ROOM_LOCK,
    mid: this._user.sid,
    rid: this._room.id,
    lock: true
  });
  this._roomLocked = true;
  this._trigger('roomLock', true, this._user.sid,
    this.getPeerInfo(), true);
};

/**
 * Function that unlocks the current Room which if Room is previously lock to
 *   allow other Peers to join the Room.
 * @method unlockRoom
 * @trigger roomLock
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype.unlockRoom = function() {
  log.log('Update to isRoomLocked status ->', false);
  this._sendChannelMessage({
    type: this._SIG_MESSAGE_TYPE.ROOM_LOCK,
    mid: this._user.sid,
    rid: this._room.id,
    lock: false
  });
  this._roomLocked = false;
  this._trigger('roomLock', false, this._user.sid,
    this.getPeerInfo(), true);
};

/**
 * Function that waits for Socket connection to Signaling to be opened.
 * @method _waitForOpenChannel
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._waitForOpenChannel = function(mediaOptions, callback) {
  var self = this;
  // when reopening room, it should stay as 0
  self._socketCurrentReconnectionAttempt = 0;

  // wait for ready state before opening
  self._wait(function() {
    self._condition('channelOpen', function() {
      mediaOptions = mediaOptions || {};

      // parse user data settings
      self._parseUserData(mediaOptions.userData || self._userData);
      self._parseBandwidthSettings(mediaOptions.bandwidth);

      // wait for local mediastream
      self._waitForLocalMediaStream(callback, mediaOptions);
    }, function() { // open channel first if it's not opened

      if (!self._channelOpen) {
        self._openChannel();
      }
      return self._channelOpen;
    }, function(state) {
      return true;
    });
  }, function() {
    return self._readyState === self.READY_STATE_CHANGE.COMPLETED;
  });

};
