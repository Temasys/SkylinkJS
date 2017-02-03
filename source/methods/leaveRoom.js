/**
 * <blockquote class="info">
 *   Note that this method will close any existing socket channel connection despite not being in the Room.
 * </blockquote>
 * Function that stops Room session.
 * @method leaveRoom
 * @param {Boolean|JSON} [stopMediaOptions=true] The flag if <code>leaveRoom()</code>
 *   should stop both <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>
 *   and <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.
 * - When provided as a boolean, this sets both <code>stopMediaOptions.userMedia</code>
 *   and <code>stopMediaOptions.screenshare</code> to its boolean value.
 * @param {Boolean} [stopMediaOptions.userMedia=true] The flag if <code>leaveRoom()</code>
 *   should stop <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.
 *   <small>This invokes <a href="#method_stopStream"><code>stopStream()</code> method</a>.</small>
 * @param {Boolean} [stopMediaOptions.screenshare=true] The flag if <code>leaveRoom()</code>
 *   should stop <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>.
 *   <small>This invokes <a href="#method_stopScreen"><code>stopScreen()</code> method</a>.</small>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_peerLeft">
 *   <code>peerLeft</code> event</a> triggering <code>isSelf</code> parameter payload value as <code>true</code>
 *   for request success.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>leaveRoom()</code> error when stopping Room session.</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {String} callback.success.peerId The User's Room session Peer ID.
 * @param {String} callback.success.previousRoom The Room name.
 * @trigger <ol class="desc-seq">
 *   <li>If Socket connection is opened: <ol><li><a href="#event_channelClose"><code>channelClose</code> event</a> triggers.</li></ol></li>
 *   <li>Checks if User is in Room. <ol><li>If User is not in a Room: <ol><li><b>ABORT</b> and return error.</li>
 *   </ol></li><li>Else: <ol><li>If parameter <code>stopMediaOptions.userMedia</code> value is <code>true</code>: <ol>
 *   <li>Invoke <a href="#method_stopStream"><code>stopStream()</code> method</a>.
 *   <small>Regardless of request errors, <code>leaveRoom()</code> will still proceed.</small></li></ol></li>
 *   <li>If parameter <code>stopMediaOptions.screenshare</code> value is <code>true</code>: <ol>
 *   <li>Invoke <a href="#method_stopScreen"><code>stopScreen()</code> method</a>.
 *   <small>Regardless of request errors, <code>leaveRoom()</code> will still proceed.</small></li></ol></li>
 *   <li><a href="#event_peerLeft"><code>peerLeft</code> event</a> triggers for User and all connected Peers in Room.</li>
 *   <li>If MCU is enabled for the App Key provided in <a href="#method_init"><code>init()</code> method</a>
 *   and connected: <ol><li><a href="#event_serverPeerLeft"><code>serverPeerLeft</code> event</a>
 *   triggers parameter payload <code>serverPeerType</code> as <code>MCU</code>.</li></ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.leaveRoom = function(stopMediaOptions, callback) {
  var self = this;
  var stopUserMedia = true;
  var stopScreenshare = true;
  var previousRoom = self._selectedRoom;
  var previousUserPeerId = self._user ? self._user.sid : null;
  var peersThatLeft = [];
  var isNotInRoom = !self._inRoom;

  if (typeof stopMediaOptions === 'boolean') {
    if (stopMediaOptions === false) {
      stopUserMedia = false;
      stopScreenshare = false;
    }
  } else if (stopMediaOptions && typeof stopMediaOptions === 'object') {
    stopUserMedia = stopMediaOptions.userMedia !== false;
    stopScreenshare = stopMediaOptions.screenshare !== false;
  } else if (typeof stopMediaOptions === 'function') {
    callback = stopMediaOptions;
  }

  for (var infoPeerId in self._peerInformations) {
    if (self._peerInformations.hasOwnProperty(infoPeerId) && self._peerInformations[infoPeerId]) {
      peersThatLeft.push(infoPeerId);
      self._removePeer(infoPeerId);
    }
  }

  for (var connPeerId in self._peerConnections) {
    if (self._peerConnections.hasOwnProperty(connPeerId) && self._peerConnections[connPeerId]) {
      if (peersThatLeft.indexOf(connPeerId) === -1) {
        peersThatLeft.push(connPeerId);
        self._removePeer(connPeerId);
      }
    }
  }

  self._inRoom = false;
  self._closeChannel();

  if (isNotInRoom) {
    var notInRoomError = 'Unable to leave room as user is not in any room';
    self._log.error([null, 'Room', previousRoom, notInRoomError]);

    if (typeof callback === 'function') {
      callback(new Error(notInRoomError), null);
    }
    return;
  }

  self._stopStreams({
    userMedia: stopUserMedia,
    screenshare: stopScreenshare
  });

  self._wait(function () {
    self._log.log([null, 'Room', previousRoom, 'User left the room']);

    self._trigger('peerLeft', previousUserPeerId, self.getPeerInfo(), true);

    if (typeof callback === 'function') {
      callback(null, {
        peerId: previousUserPeerId,
        previousRoom: previousRoom
      });
    }
  }, function () {
    return !self._channelOpen;
  });
};