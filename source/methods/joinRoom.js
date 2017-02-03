/**
 * Function that starts the Room session.
 * @method joinRoom
 * @param {String} [room] The Room name.
 * - When not provided or is provided as an empty string, its value is the <code>options.defaultRoom</code>
 *   provided in the <a href="#method_init"><code>init()</code> method</a>.
 *   <small>Note that if you are using credentials based authentication, you cannot switch the Room
 *   that is not the same as the <code>options.defaultRoom</code> defined in the
 *   <a href="#method_init"><code>init()</code> method</a>.</small>
 * @param {JSON} [options] The Room session configuration options.
 * @param {JSON|String} [options.userData] The User custom data.
 *   <small>This can be set after Room session has started using the
 *   <a href="#method_setUserData"><code>setUserData()</code> method</a>.</small>
 * @param {Boolean} [options.useExactConstraints] The <a href="#method_getUserMedia"><code>getUserMedia()</code>
 *   method</a> <code>options.useExactConstraints</code> parameter settings.
 *   <small>See the <code>options.useExactConstraints</code> parameter in the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> for more information.</small>
 * @param {Boolean|JSON} [options.audio] The <a href="#method_getUserMedia"><code>getUserMedia()</code>
 *   method</a> <code>options.audio</code> parameter settings.
 *   <small>When value is defined as <code>true</code> or an object, <a href="#method_getUserMedia">
 *   <code>getUserMedia()</code> method</a> to be invoked to retrieve new Stream. If
 *   <code>options.video</code> is not defined, it will be defined as <code>false</code>.</small>
 *   <small>Object signature matches the <code>options.audio</code> parameter in the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.</small>
 * @param {Boolean|JSON} [options.video] The <a href="#method_getUserMedia"><code>getUserMedia()</code>
 *   method</a> <code>options.video</code> parameter settings.
 *   <small>When value is defined as <code>true</code> or an object, <a href="#method_getUserMedia">
 *   <code>getUserMedia()</code> method</a> to be invoked to retrieve new Stream. If
 *   <code>options.audio</code> is not defined, it will be defined as <code>false</code>.</small>
 *   <small>Object signature matches the <code>options.video</code> parameter in the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.</small>
 * @param {JSON} [options.bandwidth] <blockquote class="info">Note that this is currently not supported
 *   with Firefox browsers versions 48 and below as noted in an existing
 *   <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=976521#c21">bugzilla ticket here</a>.</blockquote>
 *   The configuration to set the maximum streaming bandwidth to send to Peers.
 * @param {Number} [options.bandwidth.audio] The maximum audio streaming bandwidth sent to Peers in kbps.
 *   <small>Recommended values are <code>50</code> to <code>200</code>. <code>50</code> is sufficient enough for
 *   an audio call. The higher you go if you want clearer audio and to be able to hear music streaming.</small>
 * @param {Number} [options.bandwidth.video] The maximum video streaming bandwidth sent to Peers.
 *   <small>Recommended values are <code>256</code>-<code>500</code> for 180p quality,
 *   <code>500</code>-<code>1024</code> for 360p quality, <code>1024</code>-<code>2048</code> for 720p quality
 *   and <code>2048</code>-<code>4096</code> for 1080p quality.</small>
 * @param {Number} [options.bandwidth.data] The maximum data streaming bandwidth sent to Peers.
 *   <small>This affects the P2P messaging in <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>,
 *   and data transfers in <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a> and
 *   <a href="#method_sendURLData"><code>sendURLData()</code> method</a>.</small>
 * @param {JSON} [options.googleXBandwidth] <blockquote class="info">Note that this is an experimental configuration
 *   and may cause disruptions in connections or connectivity issues when toggled, or may not work depending on
 *   browser supports. Currently, this only toggles the video codec bandwidth configuration.</blockquote>
 *   The configuration to set the experimental google video streaming bandwidth sent to Peers.
 *   <small>Note that Peers may override the "receive from" streaming bandwidth depending on the Peers configuration.</small>
 * @param {Number} [options.googleXBandwidth.min] The minimum experimental google video streaming bandwidth sent to Peers.
 *   <small>This toggles the <code>"x-google-min-bitrate"</code> flag in the session description.</small>
 * @param {Number} [options.googleXBandwidth.max] The maximum experimental google video streaming bandwidth sent to Peers.
 *   <small>This toggles the <code>"x-google-max-bitrate"</code> flag in the session description.</small>
 * @param {Boolean} [options.manualGetUserMedia] The flag if <code>joinRoom()</code> should trigger
 *   <a href="#event_mediaAccessRequired"><code>mediaAccessRequired</code> event</a> in which the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> or
 *   <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>
 *   must be retrieved as a requirement before Room session may begin.
 *   <small>This ignores the <code>options.audio</code> and <code>options.video</code> configuration.</small>
 *   <small>After 30 seconds without any Stream retrieved, this results in the `callback(error, ..)` result.</small>
 * @param {JSON} [options.sdpSettings] <blockquote class="info">
 *   Note that this is mainly used for debugging purposes and that it is an experimental flag, so
 *   it may cause disruptions in connections or connectivity issues when toggled. Note that it might not work
 *   with MCU enabled Peer connections or break MCU enabled Peer connections.</blockquote>
 *   The configuration to set the session description settings.
 * @param {JSON} [options.sdpSettings.connection] The configuration to set the session description connection settings.
 *   <small>Note that this configuration may disable the media streaming and these settings will be enabled for
 *   MCU server Peer connection regardless of the flags configured.</small>
 * @param {Boolean} [options.sdpSettings.connection.audio=true] The configuration to enable audio session description connection.
 * @param {Boolean} [options.sdpSettings.connection.video=true] The configuration to enable video session description connection.
 * @param {Boolean} [options.sdpSettings.connection.data=true] The configuration to enable Datachannel session description connection.
 * @param {JSON} [options.sdpSettings.direction] The configuration to set the session description connection direction
 *   to enable or disable uploading and downloading audio or video media streaming.
 *   <small>Note that this configuration does not prevent RTCP packets from being sent and received.</small>
 * @param {JSON} [options.sdpSettings.direction.audio] The configuration to set the session description
 *   connection direction for audio streaming.
 * @param {Boolean} [options.sdpSettings.direction.audio.send=true] The flag if uploading audio streaming
 *   should be enabled when available.
 * @param {Boolean} [options.sdpSettings.direction.audio.receive=true] The flag if downloading audio
 *   streaming should be enabled when available.
 * @param {JSON} [options.sdpSettings.direction.video] The configuration to set the session description
 *   connection direction for video streaming.
 * @param {Boolean} [options.sdpSettings.direction.video.send=true] The flag if uploading video streaming
 *   should be enabled when available.
 * @param {Boolean} [options.sdpSettings.direction.video.receive=true] The flag if downloading video streaming
 *   should be enabled when available.
 * @param {JSON|Boolean} [options.publishOnly] <blockquote class="info">
 *   For MCU enabled Peer connections, defining this flag would make Peer not know other Peers presence in the Room.<br>
 *   For non-MCU enable Peer connections, defining this flag would cause other Peers in the Room to
 *   not to send Stream to Peer, and overrides the config
 *   <code>options.sdpSettings.direction.audio.receive</code> value to <code>false</code>,
 *   <code>options.sdpSettings.direction.video.receive</code> value to <code>false</code>,
 *   <code>options.sdpSettings.direction.video.send</code> value to <code>true</code> and
 *   <code>options.sdpSettings.direction.audio.send</code> value to <code>true</code>.<br>
 *   Note that this feature is currently is beta, and for any enquiries on enabling and its support for MCU enabled
 *   Peer connections, please  contact <a href="http://support.temasys.io">our support portal</a>.</blockquote></blockquote>
 *   The config if Peer would publish only.
 * @param {String} [options.publishOnly.parentId] <blockquote class="info"><b>Deprecation Warning!</b>
 *   This property has been deprecated. Use <code>options.parentId</code> instead.
 *   </blockquote> The parent Peer ID to match to when Peer is connected.
 *   <small>This is useful for identification for users connecting the Room twice simultaneously for multi-streaming.</small>
 *   <small>If User Peer ID matches the parent Peer ID provided from Peer, User will not be connected to Peer.</small>
 * @param {String} [options.parentId] The parent Peer ID to match to when Peer is connected.
 *   <small>Note that configuring this value overrides the <code>options.publishOnly.parentId</code> value.</small>
 *   <small>This is useful for identification for users connecting the Room twice simultaneously for multi-streaming.</small>
 *   <small>If User Peer ID matches the parent Peer ID provided from Peer, User will not be connected to Peer.</small>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_peerJoined">
 *   <code>peerJoined</code> event</a> triggering <code>isSelf</code> parameter payload value as <code>true</code>
 *   for request success.</small>
 * @param {JSON} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {Error|String} callback.error.error The error received when starting Room session has failed.
 * @param {Number} [callback.error.errorCode] The current <a href="#method_init"><code>init()</code> method</a> ready state.
 *   <small>Defined as <code>null</code> when no <a href="#method_init"><code>init()</code> method</a>
 *   has not been called due to invalid configuration.</small>
 *   [Rel: Skylink.READY_STATE_CHANGE]
 * @param {String} callback.error.room The Room name.
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {String} callback.success.room The Room name.
 * @param {String} callback.success.peerId The User's Room session Peer ID.
 * @param {JSON} callback.success.peerInfo The User's current Room session information.
 *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
 *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
 * @example
 *   // Example 1: Connecting to the default Room without Stream
 *   skylinkDemo.joinRoom(function (error, success) {
 *     if (error) return;
 *     console.log("User connected.");
 *   });
 *
 *   // Example 2: Connecting to Room "testxx" with Stream
 *   skylinkDemo.joinRoom("testxx", {
 *     audio: true,
 *     video: true
 *   }, function (error, success) {
 *     if (error) return;
 *     console.log("User connected with getUserMedia() Stream.")
 *   });
 *
 *   // Example 3: Connecting to default Room with Stream retrieved earlier
 *   skylinkDemo.getUserMedia(function (gUMError, gUMSuccess) {
 *     if (gUMError) return;
 *     skylinkDemo.joinRoom(function (error, success) {
 *       if (error) return;
 *       console.log("User connected with getUserMedia() Stream.");
 *     });
 *   });
 *
 *   // Example 4: Connecting to "testxx" Room with shareScreen() Stream retrieved manually
 *   skylinkDemo.on("mediaAccessRequired", function () {
 *     skylinkDemo.shareScreen(function (sSError, sSSuccess) {
 *       if (sSError) return;
 *     });
 *   });
 *
 *   skylinkDemo.joinRoom("testxx", {
 *     manualGetUserMedia: true
 *   }, function (error, success) {
 *     if (error) return;
 *     console.log("User connected with shareScreen() Stream.");
 *   });
 *
 *   // Example 5: Connecting to "testxx" Room with User custom data
 *   var data = { username: "myusername" };
 *   skylinkDemo.joinRoom("testxx", {
 *     userData: data
 *   }, function (error, success) {
 *     if (error) return;
 *     console.log("User connected with correct user data?", success.peerInfo.userData.username === data.username);
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>If User is in a Room: <ol>
 *   <li>Invoke <a href="#method_leaveRoom"><code>leaveRoom()</code> method</a>
 *   to end current Room connection. <small>Invoked <a href="#method_leaveRoom"><code>leaveRoom()</code>
 *   method</a> <code>stopMediaOptions</code> parameter value will be <code>false</code>.</small>
 *   <small>Regardless of request errors, <code>joinRoom()</code> will still proceed.</small></li></ol></li>
 *   <li>Check if Room name provided matches the Room name of the currently retrieved Room session token. <ol>
 *   <li>If Room name does not matches: <ol>
 *   <li>Invoke <a href="#method_init"><code>init()</code> method</a> to retrieve new Room session token. <ol>
 *   <li>If request has errors: <ol><li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li></ol></li>
 *   <li>Open a new socket connection to Signaling server. <ol><li>If Socket connection fails: <ol>
 *   <li><a href="#event_socketError"><code>socketError</code> event</a> triggers parameter payload
 *   <code>errorCode</code> as <code>CONNECTION_FAILED</code>. <ol>
 *   <li>Checks if there are fallback ports and transports to use. <ol>
 *   <li>If there are still fallback ports and transports: <ol>
 *   <li>Attempts to retry socket connection to Signaling server. <ol>
 *   <li><a href="#event_channelRetry"><code>channelRetry</code> event</a> triggers.</li>
 *   <li><a href="#event_socketError"><code>socketError</code> event</a> triggers parameter
 *   payload <code>errorCode</code> as <code>RECONNECTION_ATTEMPT</code>.</li>
 *   <li>If attempt to retry socket connection to Signaling server has failed: <ol>
 *   <li><a href="#event_socketError"><code>socketError</code> event</a> triggers parameter payload
 *   <code>errorCode</code> as <code>RECONNECTION_FAILED</code>.</li>
 *   <li>Checks if there are still any more fallback ports and transports to use. <ol>
 *   <li>If there are is no more fallback ports and transports to use: <ol>
 *   <li><a href="#event_socketError"><code>socketError</code> event</a> triggers
 *   parameter payload <code>errorCode</code> as <code>RECONNECTION_ABORTED</code>.</li>
 *   <li><b>ABORT</b> and return error.</li></ol></li><li>Else: <ol><li><b>REPEAT</b> attempt to retry socket connection
 *   to Signaling server step.</li></ol></li></ol></li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li><a href="#event_socketError"><code>socketError</code> event</a> triggers
 *   parameter payload <code>errorCode</code> as <code>CONNECTION_ABORTED</code>.</li>
 *   <li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li></ol></li>
 *   <li>If socket connection to Signaling server has opened: <ol>
 *   <li><a href="#event_channelOpen"><code>channelOpen</code> event</a> triggers.</li></ol></li></ol></li>
 *   <li>Checks if there is <code>options.manualGetUserMedia</code> requested <ol><li>If it is requested: <ol>
 *   <li><a href="#event_mediaAccessRequired"><code>mediaAccessRequired</code> event</a> triggers.</li>
 *   <li>If more than 30 seconds has passed and no <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>
 *   or <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>
 *   has been retrieved: <ol><li><b>ABORT</b> and return error.</li></ol></li></ol></li><li>Else: <ol>
 *   <li>If there is <code>options.audio</code> or <code>options.video</code> requested: <ol>
 *   <li>Invoke <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>. <ol>
 *   <li>If request has errors: <ol><li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li></ol></li>
 *   </ol></li><li>Starts the Room session <ol><li>If Room session has started successfully: <ol>
 *   <li><a href="#event_peerJoined"><code>peerJoined</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li>
 *   <li>If MCU is enabled for the App Key provided in <a href="#method_init"><code>init()</code>
 *   method</a> and connected: <ol><li><a href="#event_serverPeerJoined"><code>serverPeerJoined</code>
 *   event</a> triggers <code>serverPeerType</code> as <code>MCU</code>. <small>MCU has
 *   to be present in the Room in order for Peer connections to commence.</small></li>
 *   <li>Checks for any available Stream <ol>
 *   <li>If <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> is available: <ol>
 *   <li><a href="#event_incomingStream"><code>incomingStream</code> event</a>
 *   triggers parameter payload <code>isSelf</code> value as <code>true</code> and <code>stream</code>
 *   as <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>.
 *   <small>User will be sending <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>
 *   to Peers.</small></li></ol></li>
 *   <li>Else if <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> is available: <ol>
 *   <li><a href="#event_incomingStream"><code>incomingStream</code> event</a> triggers parameter
 *   payload <code>isSelf</code> value as <code>true</code> and <code>stream</code> as
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.
 *   <small>User will be sending <code>getUserMedia()</code> Stream to Peers.</small></li></ol></li><li>Else: <ol>
 *   <li>No Stream will be sent.</li></ol></li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li><a href="#event_systemAction"><code>systemAction</code> event</a> triggers
 *   parameter payload <code>action</code> as <code>REJECT</code>.</li>
 *   <li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.5
 */

Skylink.prototype.joinRoom = function(room, options, callback) {
  var self = this;
  var selectedRoom = self._defaultRoom;
  var previousRoom = self._selectedRoom;
  var mediaOptions = {};

  if (room && typeof room === 'string') {
    selectedRoom = room;
  } else if (room && typeof room === 'object') {
    mediaOptions = room;
  } else if (typeof room === 'function') {
    callback = room;
  }

  if (options && typeof options === 'object') {
    mediaOptions = options;
  } else if (typeof options === 'function') {
    callback = options;
  }

  var resolveAsErrorFn = function (error, tryRoom, readyState) {
    self._log.error(error);

    if (typeof callback === 'function') {
      callback({
        room: tryRoom,
        errorCode: readyState || null,
        error: typeof error === 'string' ? new Error(error) : error
      });
    }
  };

  var joinRoomFn = function () {
    self._initSelectedRoom(selectedRoom, function(initError, initSuccess) {
      if (initError) {
        resolveAsErrorFn(initError.error, self._selectedRoom, self._readyState);
        return;
      }

      self._waitForOpenChannel(mediaOptions, function (error, success) {
        if (error) {
          resolveAsErrorFn(error, self._selectedRoom, self._readyState);
          return;
        }

        self.once('peerJoined', function(peerId, peerInfo, isSelf) {
          if (typeof callback === 'function') {
            self._log.info([null, 'Room', selectedRoom, 'Connected to Room ->'], peerInfo);

            callback(null, {
              room: self._selectedRoom,
              peerId: peerId,
              peerInfo: peerInfo
            });
          }
        }, function(peerId, peerInfo, isSelf) {
          return peerInfo.room === selectedRoom && isSelf;
        });

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
      });
    });
  };

  if (room === null || ['number', 'boolean'].indexOf(typeof room) > -1) {
    resolveAsErrorFn('Invalid room name is provided', room);
    return;
  }

  if (options === null || ['number', 'boolean'].indexOf(typeof options) > -1) {
    resolveAsErrorFn('Invalid mediaOptions is provided', selectedRoom);
    return;
  }

  if (self._inRoom) {
    var stopStream = mediaOptions.audio === false && mediaOptions.video === false;

    self.leaveRoom(stopStream, function (lRError, lRSuccess) {
      self._log.debug([null, 'Room', previousRoom, 'Leave Room callback result ->'], [lRError, lRSuccess]);
      joinRoomFn();
    });
  } else {
    joinRoomFn();
  }
};