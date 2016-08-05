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
 *   Currently, the SDK supports only single sending Stream per Peer.
 * </blockquote>
 * Function that connects User to the Room.
 * @method joinRoom
 * @param {String} [room] The Room name to connect to.
 *   <small>If not provided, the User will be connected to the <code>defaultRoom</code>
 *     configured in the <a href="#method_init"><code>init()</code> method</a>.</small>
 * @param {JSON} [options] The Room connection settings.
 * @param {String|JSON} [options.userData] The User custom data.
 *   <small>This can be set when User is in session with <a href="#method_setUserData"><code>setUserData</code> method</a>.</small>
 * @param {Boolean|JSON} [options.audio=false] The audio settings for the Stream sent.
 *   <small>If either <code>options.audio</code> or <code>options.video</code> is <code>true</code> or
 *      type is of an Object, <code>joinRoom()</code> would invoke <a href="#method_getUserMedia"><code>getUserMedia()</code>
 *      method</a> to retrieve a new Stream, else it will use any existing Stream if any.</small>
 * @param {Boolean} [options.audio.stereo] The flag that indicates if
 *   stereo should be enabled in self connection Stream
 *   audio streaming.
 * @param {Boolean} [options.audio.mute=false] The flag that
 *   indicates if the self Stream object audio streaming is muted.
 * @param {Array} [options.audio.optional] The optional constraints for audio streaming
 *   in self user media Stream object. This follows the <code>optional</code>
 *   setting in the <code>MediaStreamConstraints</code> when <code>getUserMedia()</code> is invoked.
 *   Tampering this may cause errors in retrieval of self user media Stream object.
 *   Refer to this [site for more reference](http://www.sitepoint.com/introduction-getusermedia-api/).
 * @param {Boolean|JSON} [options.video=false] The self Stream streaming video settings.
 *   If <code>false</code>, it means that video streaming is disabled in
 *   the self Stream. If this option is set to <code>true</code> or is defined with
 *   settings, {{#crossLink "Skylink/getUserMedia:method"}}getUserMedia(){{/crossLink}}
 *   will be invoked. Self will not connect to the room unless the Stream video
 *   user media access is given.
 * @param {Boolean} [options.video.mute=false] The flag that
 *   indicates if the self Stream object video streaming is muted.
 * @param {Array} [options.video.optional] The optional constraints for video streaming
 *   in self user media Stream object. This follows the <code>optional</code>
 *   setting in the <code>MediaStreamConstraints</code> when <code>getUserMedia()</code> is invoked.
 *   Tampering this may cause errors in retrieval of self user media Stream object.
 *   Refer to this [site for more reference](http://www.sitepoint.com/introduction-getusermedia-api/).
 * @param {JSON} [options.video.resolution] The self Stream streaming video
 *   resolution settings. Setting the resolution may
 *   not force set the resolution provided as it depends on the how the
 *   browser handles the resolution. [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Number} [options.video.resolution.width] The self
 *   Stream streaming video resolution width.
 * @param {Number} [options.video.resolution.height] The self
 *   Stream streaming video resolution height.
 * @param {Number} [options.video.frameRate=50] The self
 *   Stream streaming video maximum frameRate.
 * @param {JSON} [options.bandwidth] The configuration for
 *   the maximum sending bandwidth. Setting the flags may or may not work depending
 *   on the browser implementations and how it handles it.
 * @param {Number} [options.bandwidth.audio] The maximum
 *   sending audio bandwidth bitrate in <var>kb/s</var>. If this is not provided,
 *   it will leave the audio bitrate to the browser defaults.
 * @param {Number} [options.bandwidth.video] The maximum
 *   sending video bandwidth bitrate in <var>kb/s</var>. If this is not provided,
 *   it will leave the video bitrate to the browser defaults.
 * @param {Number} [options.bandwidth.data] The maximum
 *   sending data bandwidth bitrate in <var>kb/s</var>. If this is not provided,
 *   it will leave the data bitrate to the browser defaults.
 * @param {Boolean} [options.manualGetUserMedia] The flag that indicates if
 *   <code>joinRoom()</code> should not invoke
 *   {{#crossLink "Skylink/getUserMedia:method"}}getUserMedia(){{/crossLink}}
 *   automatically but allow the developer's application to invoke
 *   {{#crossLink "Skylink/getUserMedia:method"}}getUserMedia(){{/crossLink}}
 *   manually in the application. When user media access is required, the
 *   event {{#crossLink "Skylink/mediaAccessRequired:event"}}mediaAccessRequired{{/crossLink}}
 *   will be triggered.
 * @param {Function} [callback] The callback fired after self has
 *   joined the room successfully with the provided media settings or
 *   have met with an exception.
 *   The callback signature is <code>function (error, success)</code>.
 * @param {JSON} callback.error The error object received in the callback.
 *   If received as <code>null</code>, it means that there is no errors.
 * @param {Array} callback.error.error The exception thrown that caused the failure
 *   for joining the room.
 * @param {JSON} callback.error.errorCode The
 *   <a href="#attr_READY_STATE_CHANGE_ERROR">READY_STATE_CHANGE_ERROR</a>
 *   if there is an <a href="#event_readyStateChange">readyStateChange</a>
 *   event error that caused the failure for joining the room.
 *   [Rel: Skylink.READY_STATE_CHANGE_ERROR]
 * @param {Object|String} callback.error.room The selected room that self is
 *   trying to join to.
 * @param {JSON} callback.success The success object received in the callback.
 *   If received as <code>null</code>, it means that there are errors.
 * @param {Array} callback.success.room The selected room that self has
 *   succesfully joined to.
 * @param {String} callback.success.peerId The self Peer ID that
 *   would be reflected remotely to peers in the room.
 * @param {JSON} callback.success.peerInfo The connection settings for self connection in the
 *   room. If both audio and video option is <code>false</code>,
 *   there should be no audio and video stream sending from self connection.
  * @param {String|JSON} callback.success.peerInfo.userData The custom user data
 *   information set by developer. This custom user data can also
 *   be set in <a href="#method_setUserData">setUserData()</a>.
 * @param {Boolean|JSON} [callback.success.peerInfo.audio=false] The self Stream
 *   streaming audio settings. If <code>false</code>, it means that audio
 *   streaming is disabled in the self Stream. If this option is set to
 *   <code>true</code> or is defined with settings,
 *   <a href="#method_getUserMedia">getUserMedia()</a>
 *   will be invoked. Self will not connect to the room unless the Stream audio
 *   user media access is given.
 * @param {Boolean} [callback.success.peerInfo.audio.stereo] The flag that indicates if
 *   stereo should be enabled in self connection Stream
 *    audio streaming.
 * @param {Boolean|JSON} [callback.success.peerInfo.video=false] The self Stream
 *   streaming video settings. If <code>false</code>, it means that video
 *   streaming is disabled in the self Stream. If this option is set to
 *   <code>true</code> or is defined with settings,
 *   <a href="#method_getUserMedia">getUserMedia()</a>
 *   will be invoked. Self will not connect to the room unless the Stream video
 *   user media access is given.
 * @param {JSON} [callback.success.peerInfo.video.resolution] The self Stream streaming video
 *   resolution settings. Setting the resolution may
 *   not force set the resolution provided as it depends on the how the
 *   browser handles the resolution. [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Number} [callback.success.peerInfo.video.resolution.width] The self
 *   Stream streaming video resolution width.
 * @param {Number} [callback.success.peerInfo.video.resolution.height] The self
 *   Stream streaming video resolution height.
 * @param {Number} [callback.success.peerInfo.video.frameRate=50] The self
 *   Stream streaming video maximum frameRate.
 * @param {Boolean} [callback.success.peerInfo.video.screenshare=false] The flag
 *   that indicates if the self connection Stream object sent
 *   is a screensharing stream or not.
 * @param {JSON} [callback.success.peerInfo.bandwidth] The configuration for
 *   the maximum sending bandwidth. Setting the flags may or may not work depending
 *   on the browser implementations and how it handles it.
 * @param {Number} [callback.success.peerInfo.bandwidth.audio] The maximum
 *   sending audio bandwidth bitrate in <var>kb/s</var>. If this is not provided,
 *   it will leave the audio bitrate to the browser defaults.
 * @param {Number} [callback.success.peerInfo.bandwidth.video] The maximum
 *   sending video bandwidth bitrate in <var>kb/s</var>. If this is not provided,
 *   it will leave the video bitrate to the browser defaults.
 * @param {Number} [callback.success.peerInfo.bandwidth.data] The maximum
 *   sending data bandwidth bitrate in <var>kb/s</var>. If this is not provided,
 *   it will leave the data bitrate to the browser defaults.
 * @param {JSON} callback.success.peerInfo.mediaStatus The self Stream mute
 *   settings for both audio and video streamings.
 * @param {Boolean} [callback.success.peerInfo.mediaStatus.audioMuted=true] The flag that
 *   indicates if the self Stream object audio streaming is muted. If
 *   there is no audio streaming enabled for the self, by default,
 *   it is set to <code>true</code>.
 * @param {Boolean} [callback.success.peerInfo.mediaStatus.videoMuted=true] The flag that
 *   indicates if the self Stream object video streaming is muted. If
 *   there is no video streaming enabled for the Peer connection, by default,
 *   it is set to <code>true</code>.
 * @param {JSON} callback.success.peerInfo.agent The self platform agent information.
 * @param {String} callback.success.peerInfo.agent.name The self platform browser or agent name.
 * @param {Number} callback.success.peerInfo.agent.version The self platform browser or agent version.
 * @param {Number} callback.success.peerInfo.agent.os The self platform name.
 * @param {String} callback.success.peerInfo.room The current room that the self is in.
 * @example
 *   // To just join the default room without any video or audio
 *   // Note that calling joinRoom without any parameters
 *   // still sends any available existing MediaStreams allowed.
 *   // See Examples 2, 3, 4 and 5 etc to prevent video or audio stream
 *   SkylinkDemo.joinRoom();
 *
 *   // To just join the default room with bandwidth settings
 *   SkylinkDemo.joinRoom({
 *     bandwidth: {
 *       data: 14440
 *     }
 *   });
 *
 *   // Example 1: To call getUserMedia and joinRoom seperately
 *   SkylinkDemo.getUserMedia();
 *   SkylinkDemo.on("mediaAccessSuccess", function (stream)) {
 *     attachMediaStream($(".localVideo")[0], stream);
 *     SkylinkDemo.joinRoom();
 *   });
 *
 *   // Example 2: Join a room without any video or audio
 *   SkylinkDemo.joinRoom("room_a");
 *
 *   // Example 3: Join a room with audio only
 *   SkylinkDemo.joinRoom("room_b", {
 *     audio: true,
 *     video: false
 *   });
 *
 *   // Example 4: Join a room with prefixed video width and height settings
 *   SkylinkDemo.joinRoom("room_c", {
 *     audio: true,
 *     video: {
 *       resolution: {
 *         width: 640,
 *         height: 320
 *       }
 *     }
 *   });
 *
 *   // Example 5: Join a room with userData and settings with audio, video
 *   // and bandwidth
 *   SkylinkDemo.joinRoom({
 *     userData: {
 *       item1: "My custom data",
 *       item2: "Put whatever, string or JSON or array"
 *     },
 *     audio: {
 *        stereo: true
 *     },
 *     video: {
 *        resolution: SkylinkDemo.VIDEO_RESOLUTION.VGA,
 *        frameRate: 50
 *     },
 *     bandwidth: {
 *       audio: 48,
 *       video: 256,
 *       data: 14480
 *     }
 *   });
 *
 *   //Example 6: joinRoom with callback
 *   SkylinkDemo.joinRoom(function(error, success){
 *     if (error){
 *       console.log("Error happened. Can not join room");
 *     }
 *     else{
 *       console.log("Successfully joined room");
 *     }
 *   });
 * @trigger readyStateChange, peerJoined, mediaAccessRequired
 * @component Room
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
 * Waits for the signaling socket channel connection to be ready before
 *   starting the room connection with the Skylink signaling platform.
 * @method _waitForOpenChannel
 * @param {JSON} [options] The connection settings for self connection in the
 *   room. If both audio and video
 *   option is <code>false</code>, there should be no audio and video stream
 *   sending from self connection.
  * @param {String|JSON} [options.userData] The custom user data
 *   information set by developer. This custom user data can also
 *   be set in {{#crossLink "Skylink/setUserData:method"}}setUserData(){{/crossLink}}.
 * @param {Boolean|JSON} [options.audio=false] The self Stream streaming audio settings.
 *   If <code>false</code>, it means that audio streaming is disabled in
 *   the self Stream. If this option is set to <code>true</code> or is defined with
 *   settings, {{#crossLink "Skylink/getUserMedia:method"}}getUserMedia(){{/crossLink}}
 *   will be invoked. Self will not connect to the room unless the Stream audio
 *   user media access is given.
 * @param {Boolean} [options.audio.stereo] The flag that indicates if
 *   stereo should be enabled in self connection Stream
 *   audio streaming.
 * @param {Boolean} [options.audio.mute=false] The flag that
 *   indicates if the self Stream object audio streaming is muted.
 * @param {Boolean|JSON} [options.video=false] The self Stream streaming video settings.
 *   If <code>false</code>, it means that video streaming is disabled in
 *   the self Stream. If this option is set to <code>true</code> or is defined with
 *   settings, {{#crossLink "Skylink/getUserMedia:method"}}getUserMedia(){{/crossLink}}
 *   will be invoked. Self will not connect to the room unless the Stream video
 *   user media access is given.
 * @param {Boolean} [options.video.mute=false] The flag that
 *   indicates if the self Stream object video streaming is muted.
 * @param {JSON} [options.video.resolution] The self Stream streaming video
 *   resolution settings. Setting the resolution may
 *   not force set the resolution provided as it depends on the how the
 *   browser handles the resolution. [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Number} [options.video.resolution.width] The self
 *   Stream streaming video resolution width.
 * @param {Number} [options.video.resolution.height] The self
 *   Stream streaming video resolution height.
 * @param {Number} [options.video.frameRate=50] The self
 *   Stream streaming video maximum frameRate.
 * @param {JSON} [options.bandwidth] The configuration for
 *   the maximum sending bandwidth. Setting the flags may or may not work depending
 *   on the browser implementations and how it handles it.
 * @param {Number} [options.bandwidth.audio] The maximum
 *   sending audio bandwidth bitrate in <var>kb/s</var>. If this is not provided,
 *   it will leave the audio bitrate to the browser defaults.
 * @param {Number} [options.bandwidth.video] The maximum
 *   sending video bandwidth bitrate in <var>kb/s</var>. If this is not provided,
 *   it will leave the video bitrate to the browser defaults.
 * @param {Number} [options.bandwidth.data] The maximum
 *   sending data bandwidth bitrate in <var>kb/s</var>. If this is not provided,
 *   it will leave the data bitrate to the browser defaults.
 * @param {Boolean} [options.manualGetUserMedia] The flag that indicates if
 *   <code>joinRoom()</code> should not invoke
 *   {{#crossLink "Skylink/getUserMedia:method"}}getUserMedia(){{/crossLink}}
 *   automatically but allow the developer's application to invoke
 *   {{#crossLink "Skylink/getUserMedia:method"}}getUserMedia(){{/crossLink}}
 *   manually in the application. When user media access is required, the
 *   event {{#crossLink "Skylink/mediaAccessRequired:event"}}mediaAccessRequired{{/crossLink}}
 *   will be triggered.
 * @param {Function} callback The callback fired after signaling socket channel connection
 *   has opened successfully with relevant user media being available according to the
 *   settings or met with an exception. The callback signature is <code>function (error)</code>.
 * @param {Object} callback.error The error object received in the callback.
 *   If received as <code>undefined</code>, it means that there is no errors.
 * @trigger peerJoined, incomingStream, mediaAccessRequired
 * @private
 * @component Room
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

/**
 * Disconnects self from current connected room.
 * @method leaveRoom
 * @param {Boolean|JSON} [stopMediaOptions=true] The stop attached Stream options for
 *   Skylink when leaving the room. If provided options is a
 *   <var>typeof</var> <code>boolean</code>, it will be interpreted as both
 *   <code>userMedia</code> and <code>screenshare</code> Streams would be stopped.
 * @param {Boolean} [stopMediaOptions.userMedia=true]  The flag that indicates if leaving the room
 *   should automatically stop and clear the existing user media stream attached to skylink.
 *   This would trigger <code>mediaAccessStopped</code> for this Stream if available.
 * @param {Boolean} [stopMediaOptions.screenshare=true] The flag that indicates if leaving the room
 *   should automatically stop and clear the existing screensharing stream attached to skylink.
 *   This would trigger <code>mediaAccessStopped</code> for this Stream if available.
 * @param {Function} [callback] The callback fired after self has
 *   left the room successfully or have met with an exception.
 *   The callback signature is <code>function (error, success)</code>.
 * @param {Object} callback.error The error object received in the callback.
 *   If received as <code>null</code>, it means that there is no errors.
 * @param {JSON} callback.success The success object received in the callback.
 *   If received as <code>null</code>, it means that there are errors.
 * @param {String} callback.success.peerId The assigned previous Peer ID
 *   to self given when self was still connected to the room.
 * @param {String} callback.success.previousRoom The room self was disconnected
 *   from.
 * @example
 *   //Example 1: Just leaveRoom
 *   SkylinkDemo.leaveRoom();
 *
 *   //Example 2: leaveRoom with callback
 *   SkylinkDemo.leaveRoom(function(error, success){
 *     if (error){
 *       console.log("Error happened");
 *     }
 *     else{
 *       console.log("Successfully left room");
 *     }
 *   });
 * @trigger peerLeft, channelClose, streamEnded
 * @component Room
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
 * Locks the currently connected room to prevent other peers
 *   from joining the room.
 * @method lockRoom
 * @example
 *   SkylinkDemo.lockRoom();
 * @trigger roomLock
 * @component Room
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
 * Unlocks the currently connected room to allow other peers
 *   to join the room.
 * @method unlockRoom
 * @example
 *   SkylinkDemo.unlockRoom();
 * @trigger roomLock
 * @component Room
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