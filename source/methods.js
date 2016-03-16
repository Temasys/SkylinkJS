/**
 * Refreshes a Peer connection. This function may be useful when a video stream
 *   seems to be appearing black and refreshing a Peer connection will help this use-case.
 * As of now, in a MCU environment, the User will have to leave the currently joined Room
 *   and join in back again the same Room as a fallback alternative since restart is not
 *   implemented for the MCU environment yet.
 * @method refreshConnection
 * @param {String|Array} [targetPeerId] The array of targeted Peer IDs connection to refresh
 *   the connection with.
 * @param {Function} [callback] The callback fired after all targeted Peers connection has
 *   been initiated with refresh or have met with an exception.
 *   The callback signature is <code>function (error, success)</code>.
 * @param {JSON} callback.error The error object received in the callback.
 *   If received as <code>null</code>, it means that there is no errors.
 * @param {Array} callback.error.listOfPeers The list of Peers that the
 *   refresh connection had been initiated with.
 * @param {JSON} callback.error.refreshErrors The list of errors occurred
 *   based on per Peer basis.
 * @param {Object|String} callback.error.refreshErrors.(#peerId) The Peer ID that
 *   is associated with the error that occurred when refreshing the connection.
 * @param {JSON} callback.success The success object received in the callback.
 *   If received as <code>null</code>, it means that there are errors.
 * @param {Array} callback.success.listOfPeers The list of Peers that the
 *   refresh connection had been initiated with.
 * @example
 *   SkylinkDemo.on("iceConnectionState", function (state, peerId)) {
 *     if (iceConnectionState === SkylinkDemo.ICE_CONNECTION_STATE.FAILED) {
 *       // Do a refresh
 *       SkylinkDemo.refreshConnection(peerId);
 *     }
 *   });
 * @trigger peerRestart, serverPeerRestart, peerJoined, peerLeft, serverPeerJoined, serverPeerLeft
 * @component Peer
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.refreshConnection = function(passedTargetPeerId, passedCallback) {
  var superRef = this;
  var listOfPeers = Object.keys(superRef._peers);
  var listOfPeersErrors = {};
  var callback = function () {};

  // Parsing the method paramters
  // refreshConnection(['p1', 'p2'])
  if (Array.isArray(passedTargetPeerId)) {
    listOfPeers = passedTargetPeerId.splice(0);

  // refreshConnection('p1')
  } else if (typeof passedTargetPeerId === 'string' && !!passedTargetPeerId) {
    listOfPeers = [passedTargetPeerId];

  // refreshConnection(function () {})
  } else if (typeof passedTargetPeerId === 'function') {
    callback = passedTargetPeerId;
  }

  // NOTE: Passing refreshConnection(function () {}, function () {}) takes in the 2nd parameter
  // refreshConnection(.., function () {})
  if (typeof passedCallback === 'function') {
    callback = passedCallback;
  }

  /* Success Case */
  var successCaseFn = function () {
    if (Object.keys(listOfPeersErrors).length > 0) {
      errorCaseFn();
      return;
    }

    var successPayload = {
      listOfPeers: listOfPeers
    };

    log.log([null, 'Skylink', 'refreshConnection()', 'Refreshed all connections ->'], successPayload);

    callback(null, successPayload);
  };

  /* Error Case */
  var errorCaseFn = function () {
    var errorPayload = {
      listOfPeers: listOfPeers,
      refreshErrors: listOfPeersErrors
    };

    log.error([null, 'Skylink', 'refreshConnection()', 'Failed refreshing all connections ->'], errorPayload);

    callback(errorPayload, null);
  };


  // Prevent refreshing empty connection list
  if (listOfPeers.length === 0) {
    listOfPeersErrors.self = new Error('Failed refreshing connections as there is no Peer connections to refresh');
    errorCaseFn();
    return;
  }

  listOfPeers.forEach(function (peerId) {
    // Dropping of Peer ID with "MCU"
    if (peerId === 'MCU') {
      return;
    }

    if (superRef._peers.hasOwnProperty(peerId) && superRef._peers[peerId]) {
      listOfPeersErrors[peerId] = new Error('Failed refreshing connection "' + peerId +
        '" as there is no connection with this Peer to refresh');
    } else {
      superRef._peers[peerId].handshakeRestart();
    }
  });

  // For MCU environment, we have to re-join the Room as there is no support for re-negotiation yet
  if (superRef._hasMCU) {
    superRef._trigger('serverPeerRestart', 'MCU', superRef.SERVER_PEER_TYPE.MCU);

    superRef.joinRoom(superRef._selectedRoom, function (error, success) {
      if (error) {
        listOfPeersErrors.MCU = error;
      }

      successCaseFn();
    });

  } else {
    successCaseFn();
  }
};