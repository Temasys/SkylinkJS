/**
 * The list of signaling actions received.
 * - These are usually received from the signaling server to warn the user.
 * - The system action outcomes are:
 * @attribute SYSTEM_ACTION
 * @type JSON
 * @param {String} WARNING Server is warning user to take actions.
 * @param {String} REJECT Server has rejected user from room.
 * @readOnly
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype.SYSTEM_ACTION = {
  WARNING: 'warning',
  REJECT: 'reject'
};

/**
 * The list of signaling actions received.
 * - These are usually received from the signaling server to warn the user.
 * - The system action outcomes are:
 * @attribute SYSTEM_ACTION_REASON
 * @type JSON
 * @param {String} FAST_MESSAGE User sends quick messages
 *   less than a second resulting in a warning. Continuous
 *   quick messages results in user being kicked out of the room.
 * @param {String} ROOM_LOCKED Room is locked and user is locked
 *   from joining the room.
 * @param {String} ROOM_FULL Persistent meeting. Room is full.
 * @param {String} DUPLICATED_LOGIN User has same id
 * @param {String} SERVER_ERROR Server has an error
 * @param {String} VERIFICATION Verification for roomID
 * @param {String} EXPIRED Persistent meeting. Room has
 *   expired and user is unable to join the room.
 * @param {String} ROOM_CLOSED Persistent meeting. Room
 *   has expired and is closed, user to leave the room.
 * @param {String} ROOM_CLOSING Persistent meeting.
 *   Room is closing soon.
 * @param {String} OVER_SEAT_LIMIT Seat limit is hit. API Key
 *   do not have sufficient seats to continue.
 * @readOnly
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype.SYSTEM_ACTION_REASON = {
  FAST_MESSAGE: 'fastmsg',
  ROOM_LOCKED: 'locked',
  ROOM_FULL: 'roomfull',
  DUPLICATED_LOGIN: 'duplicatedLogin',
  SERVER_ERROR: 'serverError',
  VERIFICATION: 'verification',
  EXPIRED: 'expired',
  ROOM_CLOSED: 'roomclose',
  ROOM_CLOSING: 'toclose',
  OVER_SEAT_LIMIT: 'seatquota'
};

/**
 * The room that the user is currently connected to.
 * @attribute _selectedRoom
 * @type String
 * @default Skylink._defaultRoom
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._selectedRoom = null;

/**
 * The current state if room is locked.
 * @attribute _roomLocked
 * @type Boolean
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._roomLocked = false;

/**
 * User to join the room.
 * - You may call {{#crossLink "Skylink/getUserMedia:method"}}
 *   getUserMedia(){{/crossLink}} first if you want to get
 *   MediaStream and joining Room seperately.
 * - If <b>joinRoom()</b> parameters is empty, it simply uses
 *   any previous media or user data settings.
 * - If no room is specified, user would be joining the default room.
 * @method joinRoom
 * @param {String} [room=init.options.defaultRoom] Room to join user in.
 * @param {JSON} [options] Media Constraints.
 * @param {JSON|String} [options.userData] User custom data.
 * @param {Boolean|JSON} [options.audio=false] This call requires audio stream.
 * @param {Boolean} [options.audio.stereo=false] Option to enable stereo
 *    during call.
 * @param {Boolean|JSON} [options.video=false] This call requires video stream.
 * @param {JSON} [options.video.resolution] The resolution of video stream.
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width]
 *   The video stream resolution width.
 * @param {Integer} [options.video.resolution.height]
 *   The video stream resolution height.
 * @param {Integer} [options.video.frameRate]
 *   The video stream mininum frameRate.
 * @param {JSON} [options.bandwidth] Stream bandwidth settings.
 * @param {Integer} [options.bandwidth.audio] Audio stream bandwidth in kbps.
 *   Recommended: 50 kbps.
 * @param {Integer} [options.bandwidth.video] Video stream bandwidth in kbps.
 *   Recommended: 256 kbps.
 * @param {Integer} [options.bandwidth.data] Data stream bandwidth in kbps.
 *   Recommended: 1638400 kbps.
 * @example
 *   // To just join the default room without any video or audio
 *   // Note that calling joinRoom without any parameters
 *   // Still sends any available existing MediaStreams allowed.
 *   // See Examples 2, 3, 4 and 5 etc to prevent video or audio stream
 *   SkylinkDemo.joinRoom();
 *
 *   // To just join the default room with bandwidth settings
 *   SkylinkDemo.joinRoom({
 *     'bandwidth': {
 *       'data': 14440
 *     }
 *   });
 *
 *   // Example 1: To call getUserMedia and joinRoom seperately
 *   SkylinkDemo.getUserMedia();
 *   SkylinkDemo.on('mediaAccessSuccess', function (stream)) {
 *     attachMediaStream($('.localVideo')[0], stream);
 *     SkylinkDemo.joinRoom();
 *   });
 *
 *   // Example 2: Join a room without any video or audio
 *   SkylinkDemo.joinRoom('room');
 *
 *   // Example 3: Join a room with audio only
 *   SkylinkDemo.joinRoom('room', {
 *     'audio' : true,
 *     'video' : false
 *   });
 *
 *   // Example 4: Join a room with prefixed video width and height settings
 *   SkylinkDemo.joinRoom('room', {
 *     'audio' : true,
 *     'video' : {
 *       'resolution' : {
 *         'width' : 640,
 *         'height' : 320
 *       }
 *     }
 *   });
 *
 *   // Example 5: Join a room with userData and settings with audio, video
 *   // and bandwidth
 *   SkwayDemo.joinRoom({
 *     'userData': {
 *       'item1': 'My custom data',
 *       'item2': 'Put whatever, string or JSON or array'
 *     },
 *     'audio' : {
 *        'stereo' : true
 *      },
 *     'video' : {
 *        'res' : SkylinkDemo.VIDEO_RESOLUTION.VGA,
 *        'frameRate' : 50
 *     },
 *     'bandwidth' : {
 *        'audio' : 48,
 *        'video' : 256,
 *        'data' : 14480
 *      }
 *   });
 * @trigger peerJoined
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype.joinRoom = function(room, mediaOptions) {
  var self = this;
  if ((self._inRoom && typeof room !== 'string') || (typeof room === 'string' &&
    room === this._selectedRoom)) {
    log.error([null, 'Socket',
      ((typeof room === 'string') ? room : self._selectedRoom),
      'Unable to join room as user is currently in the room already']);
    return;
  }
  log.log([null, 'Socket', self._selectedRoom, 'Joining room. Media options:'],
    mediaOptions || ((typeof room === 'object') ? room : {}));
  var sendJoinRoomMessage = function() {
    self._sendChannelMessage({
      type: self._SIG_MESSAGE_TYPE.JOIN_ROOM,
      uid: self._user.uid,
      cid: self._key,
      rid: self._room.id,
      userCred: self._user.token,
      timeStamp: self._user.timeStamp,
      apiOwner: self._apiKeyOwner,
      roomCred: self._room.token,
      start: self._room.startDateTime,
      len: self._room.duration
    });
  };
  var doJoinRoom = function() {
    var checkChannelOpen = setInterval(function () {
      if (!self._channelOpen) {
        if (self._readyState === self.READY_STATE_CHANGE.COMPLETED && !self._socket) {
          self._openChannel();
        }
      } else {
        clearInterval(checkChannelOpen);
        self._waitForLocalMediaStream(function() {
          sendJoinRoomMessage();
        }, mediaOptions);
      }
    }, 500);
  };
  if (typeof room === 'string') {
    self._initSelectedRoom(room, doJoinRoom);
  } else {
    mediaOptions = room;
    doJoinRoom();
  }
};

/**
 * User to leave the room.
 * @method leaveRoom
 * @example
 *   SkylinkDemo.leaveRoom();
 * @trigger peerLeft, channelClose
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.leaveRoom = function() {
  if (!this._inRoom) {
    log.warn('Unable to leave room as user is not in any room');
    return;
  }
  for (var pc_index in this._peerConnections) {
    if (this._peerConnections.hasOwnProperty(pc_index)) {
      this._removePeer(pc_index);
    }
  }
  this._inRoom = false;
  this._closeChannel();
  log.log([null, 'Socket', this._selectedRoom, 'User left the room']);
  this._trigger('peerLeft', this._user.sid, this._user.info, true);
};

/**
 * Lock the room to prevent peers from joining the room.
 * @method lockRoom
 * @example
 *   SkylinkDemo.lockRoom();
 * @trigger lockRoom
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
  this._trigger('roomLock', true, this._user.sid,
    this._user.info, true);
};

/**
 * Unlock the room to allow peers to join the room.
 * @method unlockRoom
 * @example
 *   SkylinkDemo.unlockRoom();
 * @trigger lockRoom
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
  this._trigger('roomLock', false, this._user.sid,
    this._user.info, true);
};