/**
 * The list of signaling warnings that would be received.
 * @attribute SYSTEM_ACTION
 * @type JSON
 * @param {String} WARNING Server warning to User if actions are not
 *   taken, User would be kicked out of the Room.
 * @param {String} REJECT Server has kicked User out of the Room.
 * @readOnly
 * @component Room
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype.SYSTEM_ACTION = {
  WARNING: 'warning',
  REJECT: 'reject'
};

/**
 * The list of signaling actions to be taken upon received.
 * @attribute SYSTEM_ACTION_REASON
 * @type JSON
 * @param {String} FAST_MESSAGE User is not alowed to
 *   send too quick messages as it is used to prevent jam.
 * @param {String} ROOM_LOCKED Room is locked and User is rejected from joining the Room.
 * @param {String} ROOM_FULL The target Peers in a persistent room is full.
 * @param {String} DUPLICATED_LOGIN The User is re-attempting to connect again with
 *   an userId that has been used.
 * @param {String} SERVER_ERROR Server has an error.
 * @param {String} VERIFICATION Verification is incomplete for roomId provided.
 * @param {String} EXPIRED Persistent meeting. Room has
 *   expired and user is unable to join the room.
 * @param {String} ROOM_CLOSED The persistent room is closed as it has been expired.
 * @param {String} ROOM_CLOSING The persistent room is closing.
 * @param {String} OVER_SEAT_LIMIT The seat limit has been reached.
 * @readOnly
 * @component Room
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
 * @component Room
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._selectedRoom = null;

/**
 * The flag that indicates whether room is currently locked.
 * @attribute _roomLocked
 * @type Boolean
 * @private
 * @component Room
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._roomLocked = false;

/**
 * Connects the User to a Room.
 * @method joinRoom
 * @param {String} [room=init.options.defaultRoom] Room name to join.
 *   If Room name is not provided, User would join the default room.
 * @param {JSON} [options] Media Constraints
 * @param {JSON|String} [options.userData] User custom data. See
 * {{#crossLink "Skylink/setUserData:method"}}setUserData(){{/crossLink}}
 *   for more information
 * @param {Boolean|JSON} [options.audio=false] Enable audio stream.
 * @param {Boolean} [options.audio.stereo] Option to enable stereo
 *    during call.
 * @param {Boolean} [options.audio.mute=false] If audio stream should be muted.
 * @param {Boolean|JSON} [options.video=false] Enable video stream.
 * @param {JSON} [options.video.resolution] The resolution of video stream.
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width]
 *   The video stream resolution width (in px).
 * @param {Integer} [options.video.resolution.height]
 *   The video stream resolution height (in px).
 * @param {Integer} [options.video.frameRate]
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
 * @component Room
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

  if (self._channelOpen) {
    self.leaveRoom(function(){
      log.log([null, 'Socket', self._selectedRoom, 'Joining room. Media options:'], mediaOptions);
      if (typeof room === 'string' ? room !== self._selectedRoom : false) {
        self._initSelectedRoom(room, function () {
          self._waitForOpenChannel(mediaOptions);
        });
      } else {
        self._waitForOpenChannel(mediaOptions);
      }
    });

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
      }, false);
    }

    return;
  }
  log.log([null, 'Socket', self._selectedRoom, 'Joining room. Media options:'],
    mediaOptions);

  if (typeof room === 'string' ? room !== self._selectedRoom : false) {

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
    }, false);
  }
};
/**
 * Waits for room to ready, before starting the Room connection.
 * @method _waitForOpenChannel
 * @private
 * @param {JSON} [options] Media Constraints.
 * @param {JSON|String} [options.userData] User custom data.
 * @param {Boolean|JSON} [options.audio=false] This call requires audio stream.
 * @param {Boolean} [options.audio.stereo] Option to enable stereo
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
 * @component Room
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._waitForOpenChannel = function(mediaOptions) {
  var self = this;
  // when reopening room, it should stay as 0
  self._socketCurrentReconnectionAttempt = 0;

  // wait for ready state before opening
  self._wait(function () {
    self._condition('channelOpen', function () {
      mediaOptions = mediaOptions || {};

      // parse user data settings
      self._parseUserData(mediaOptions.userData || self._userData);
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
  });

};

/**
 * Disconnects a User from the room.
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
 * @trigger peerLeft, channelClose, streamEnded
 * @component Room
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
  self.stopStream();

  self._wait(function(){
    if (typeof callback === 'function'){
      callback(null, {
        peerId: self._user.sid,
        previousRoom: self._selectedRoom,
        inRoom: self._inRoom
      });
    }
    log.log([null, 'Socket', self._selectedRoom, 'User left the room. Callback fired.']);
    self._trigger('peerLeft', self._user.sid, self.getPeerInfo(), true);

  }, function(){
    return (Object.keys(self._peerConnections).length === 0 &&
      self._channelOpen === false &&
      self._readyState === self.READY_STATE_CHANGE.COMPLETED);
  }, false);
};

/**
 * Locks the room to prevent other Peers from joining the room.
 * @method lockRoom
 * @example
 *   SkylinkDemo.lockRoom();
 * @trigger lockRoom
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
  this._trigger('roomLock', true, this._user.sid,
    this.getPeerInfo(), true);
};

/**
 * Unlocks the room to allow other Peers to join the room.
 * @method unlockRoom
 * @example
 *   SkylinkDemo.unlockRoom();
 * @trigger lockRoom
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
  this._trigger('roomLock', false, this._user.sid,
    this.getPeerInfo(), true);
};