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
 * Indicates whether room is currently locked.
 * @attribute _roomLocked
 * @type Boolean
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._roomLocked = false;

/**
 * Once we have initiated Skylink object we can join a room. Calling this
 * function while you are already connected will cause you to leave the current room
 * and connect you to the new room.
 * - By joining a room you decide to give or not access rights for your video and audio source.
 * It is not possible to give higher rights once you already joined the room.
 * - You may call {{#crossLink "Skylink/getUserMedia:method"}}
 *   getUserMedia(){{/crossLink}} first if you want to get
 *   MediaStream and join the room later.
 * - If <b>joinRoom()</b> parameters are empty, it uses
 *   any previous media or user data settings if possible (default
 *   values otherwise).
 * - If no room is specified, user would be joining the default room.
 * @method joinRoom
 * @param {String} [room=init.options.defaultRoom] Room name to join.
 * @param {JSON} [options] Media Constraints
 * @param {JSON|String} [options.userData] User custom data. See
 * {{#crossLink "Skylink/setUserData:method"}}setUserData(){{/crossLink}}
 *   for more information
 * @param {Boolean|JSON} [options.audio=false] Enable audio stream.
 * @param {Boolean} [options.audio.stereo=false] Option to enable stereo
 *    during call.
 * @param {Boolean} [options.audio.mute=false] If audio stream should be muted.
 * @param {Boolean|JSON} [options.video=false] Enable video stream.
 * @param {JSON} [options.video.resolution] The resolution of video stream.
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width]
 *   The video stream resolution width (in px).
 * @param {Integer} [options.video.resolution.height]
 *   The video stream resolution height (in px).
 * @param {Integer} [options.video.frameRate=50]
 *   The video stream frameRate.
 * @param {Boolean} [options.video.mute=false] If audio stream should be muted.
 * @param {JSON} [options.bandwidth] Stream bandwidth settings.
 * @param {Integer} [options.bandwidth.audio=50] Audio stream bandwidth in kbps.
 * @param {Integer} [options.bandwidth.video=256] Video stream bandwidth in kbps.
 * @param {Integer} [options.bandwidth.data=1638400] Data stream bandwidth in kbps.
 * @param {Boolean} [options.manualGetUserMedia] Get the user media manually.
 * @param {Function} [callback] The callback fired after peer leaves the room.
 *   Default signature: function(error object, success object)
 * @example
 *   // To just join the default room without any video or audio
 *   // Note that calling joinRoom without any parameters
 *   // still sends any available existing MediaStreams allowed.
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
 *   SkylinkDemo.joinRoom({
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
 *
 *   //Example 6: joinRoom with callback
 *   SkylinkDemo.joinRoom(function(error, success){
 *     if (error){
 *       console.log('Error happened. Can not join room'));
 *     }
 *     else{
 *       console.log('Successfully joined room');
 *     }
 *   });
 * @trigger peerJoined, mediaAccessRequired
 * @for Skylink
 * @since 0.5.5
 */

Skylink.prototype.joinRoom = function(room, mediaOptions, callback) {
  var self = this;

  if (typeof room === 'string'){
    //joinRoom(room, callback)
    if (typeof mediaOptions === 'function'){
      callback = mediaOptions;
      mediaOptions = undefined;
    }
  }
  else if (typeof room === 'object'){
    //joinRoom(mediaOptions, callback);
    if (typeof mediaOptions === 'function'){
      callback = mediaOptions;
      mediaOptions = room;
      room = undefined;
    }
    //joinRoom(mediaOptions);
    else{
      mediaOptions = room;
    }
  }
  else if (typeof room === 'function'){
    //joinRoom(callback);
    callback = room;
    room = undefined;
    mediaOptions = undefined;
  }
  //if none of the above is true --> joinRoom()

  if (self._inRoom) {

    self.leaveRoom(function(){
      log.log([null, 'Socket', self._selectedRoom, 'Joining room. Media options:'], mediaOptions);
      if (typeof room === 'string') {
        self._initSelectedRoom(room, function () {
          self._waitForOpenChannel(mediaOptions);
        });
      } else {
        self._waitForOpenChannel(mediaOptions);
      }
    });
    return;
  }
  log.log([null, 'Socket', self._selectedRoom, 'Joining room. Media options:'],
    mediaOptions);

  if (typeof room === 'string') {

    self._initSelectedRoom(room, function () {
      self._waitForOpenChannel(mediaOptions);
    });
  } else {
    self._waitForOpenChannel(mediaOptions);
  }

  if (typeof callback === 'function'){
    self.once('peerJoined',function(peerId, peerInfo, isSelf){
      log.log([null, 'Socket', self._selectedRoom, 'Peer joined. Firing callback. ' +
      'PeerId ->'], peerId);
      callback(null,{
        room: self._selectedRoom,
        peerId: peerId,
        peerInfo: peerInfo
      });
    },function(peerId, peerInfo, isSelf){
      return isSelf;
    }, true);
  }
};
/**
 * Wait for room to ready, then wait for socket signaling channel to open.
 * - If channel is not opened before then open it.
 * - Once channel is opened, wait for media stream and send a join room request to signaling server.
 * @method _waitForOpenChannel
 * @private
 * @param {JSON} [options] Media Constraints.
 * @param {JSON|String} [options.userData] User custom data.
 * @param {Boolean|JSON} [options.audio=false] This call requires audio stream.
 * @param {Boolean} [options.audio.stereo=false] Option to enable stereo
 *    during call.
 * @param {Boolean} [options.audio.mute=false] If audio stream should be muted.
 * @param {Boolean|JSON} [options.video=false] This call requires video stream.
 * @param {JSON} [options.video.resolution] The resolution of video stream.
 * @param {Integer} [options.video.resolution.width]
 *   The video stream resolution width.
 * @param {Integer} [options.video.resolution.height]
 *   The video stream resolution height.
 * @param {Integer} [options.video.frameRate]
 *   The video stream maximum frameRate.
 * @param {Boolean} [options.video.mute=false] If video stream should be muted.
 * @param {JSON} [options.bandwidth] Stream bandwidth settings.
 * @param {Integer} [options.bandwidth.audio] Audio stream bandwidth in kbps.
 *   Recommended: 50 kbps.
 * @param {Integer} [options.bandwidth.video] Video stream bandwidth in kbps.
 *   Recommended: 256 kbps.
 * @param {Integer} [options.bandwidth.data] Data stream bandwidth in kbps.
 *   Recommended: 1638400 kbps.
 * @trigger peerJoined, incomingStream, mediaAccessRequired
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._waitForOpenChannel = function(mediaOptions) {
  var self = this;
  // when reopening room, it should stay as 0
  self._socketCurrentReconnectionAttempt = 0;
  // wait for ready state before opening
  self._condition('readyStateChange', function () {
    self._condition('channelOpen', function () {
      mediaOptions = mediaOptions || {};

      // parse user data settings
      self._parseUserData(mediaOptions.userData);
      self._parseBandwidthSettings(mediaOptions.bandwidth);

      // wait for local mediastream
      self._waitForLocalMediaStream(function() {
        // once mediastream is loaded, send channel message
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
      }, mediaOptions);
    }, function () {
      // open channel first if it's not opened
      if (!self._channelOpen) {
        self._openChannel();
      }
      return self._channelOpen;
    }, function (state) {
      return true;
    });
  }, function () {
    return self._readyState === self.READY_STATE_CHANGE.COMPLETED;
  }, function (state) {
    return state === self.READY_STATE_CHANGE.COMPLETED;
  });
};

/**
 * User to leave the room.
 * @method leaveRoom
 * @param {Function} [callback] The callback fired after peer leaves the room.
 *   Default signature: function(error object, success object)
 * @example
 *   //Example 1: Just leaveRoom
 *   SkylinkDemo.leaveRoom();
 *
 *   //Example 2: leaveRoom with callback
 *   SkylinkDemo.leaveRoom(function(error, success){
 *     if (error){
 *       console.log('Error happened'));
 *     }
 *     else{
 *       console.log('Successfully left room');
 *     }
 *   });
 * @trigger peerLeft, channelClose
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.leaveRoom = function(callback) {
  var self = this;
  if (!self._inRoom) {
    var error = 'Unable to leave room as user is not in any room';
    log.error(error);
    if (typeof callback === 'function'){
      log.log([null, 'Socket', self._selectedRoom, 'Error occurred. '+
        'Firing callback with error -> '],error);
      callback(error,null);
    }
    return;
  }
  for (var pc_index in self._peerConnections) {
    if (self._peerConnections.hasOwnProperty(pc_index)) {
      self._removePeer(pc_index);
    }
  }
  self._inRoom = false;
  self._closeChannel();
  self._stopLocalMediaStreams();

  if (typeof callback === 'function'){
    self._wait(function(){
      callback(null, {
        peerId: self._user.sid,
        previousRoom: self._selectedRoom,
        inRoom: self._inRoom
      });
      log.log([null, 'Socket', self._selectedRoom, 'User left the room. Callback fired.']);
      self._trigger('peerLeft', self._user.sid, self.getPeerInfo(), true);

    }, function(){
      return (Object.keys(self._peerConnections).length === 0 &&
        self._channelOpen === false &&
        self._readyState === self.READY_STATE_CHANGE.COMPLETED);

    }, true);
  }
};

/**
 * Lock the room to prevent other users from joining the room.
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
    this.getPeerInfo(), true);
};

/**
 * Unlock the room to allow other users to join the room.
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
    this.getPeerInfo(), true);
};