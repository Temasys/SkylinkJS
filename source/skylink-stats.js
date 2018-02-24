/**
 * Function that posts the stats to API.
 * @method _postStatsToApi
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._postStatsToApi = function (endpoint, params) {
  var self = this;

  // Noted that the API result returned "username" will change upon a /stats/client.
  if (!self._statIdRandomStr) {
    self._statIdRandomStr = (Date.now() + Math.floor(Math.random() * 1000000));
  }

  params.client_id = ((self._user && self._user.uid) || 'dummy') + '_' + self._statIdRandomStr;
  params.app_key = self._initOptions.appKey;
  params.timestamp = (new Date()).toISOString();

  // We need not use CORS and do not need to care if API returns success or failure
  // since we are just endlessly posting it.
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://api.temasys.io' + endpoint, true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(JSON.stringify(params));
};


/**
 * Function that handles the posting of /stats/client stats.
 * @method _handleStatsClient
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsClient = function() {
  var self = this;
  var statsObject = {
    username: (self._user && self._user.uid) || null,
    sdk: {
      name: 'web',
      version: self.VERSION
    },
    agent: {
      name: AdapterJS.webrtcDetectedBrowser,
      version: AdapterJS.webrtcDetectedVersion,
      platform: navigator.platform,
      plugin_version: (AdapterJS.WebRTCPlugin.plugin && AdapterJS.WebRTCPlugin.plugin.VERSION) || null
    },
    media: {
      audio: [],
      video: []
    }
  };

  var stream = null;
  var frameWidth = null;
  var frameHeight = null;

  // Retrieve the screensharing stream first since it is by default what the SDK sends first before the camera one.
  if (self._streams.screenshare && self._streams.screenshare.stream) {
    stream = self._streams.screenshare.stream;

  } else if (self._streams.userMedia && self._streams.userMedia.stream) {
    stream = self._streams.userMedia.stream;

    if (typeof self._streams.userMedia.constraints.video === 'object') {
      frameWidth = (typeof self._streams.userMedia.constraints.video.width === 'object' &&
        self._streams.userMedia.constraints.video.width.exact) || null;
      frameHeight = (typeof self._streams.userMedia.constraints.video.height === 'object' &&
        self._streams.userMedia.constraints.video.height.exact) || null;
    }
  }

  if (stream) {
    stream.getAudioTracks().forEach(function (track) {
      statsObject.media.audio.push({
        id: track.id,
        stream_id: stream.id || stream.label
      });
    });

    // TODO: Technically the video frame can be obtained by appending the stream into a dummy video element and then
    //       discarding the dummy video element.
    stream.getVideoTracks().forEach(function (track) {
      statsObject.media.video.push({
        id: track.id,
        stream_id: stream.id || stream.label,
        resolution_width: frameWidth,
        resolution_height: frameHeight
      });
    });
  }

  self._postStatsToApi('/stats/client', statsObject);
};

/**
 * Function that handles the posting of /stats/auth stats.
 * @method _handleStatsAuth
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsAuth = function(result, status) {
  var self = this;
  var statsObject = {
    api_url: self._path,
    api_result: result,
    room_id: (result && result.room_key) || null,
    // TO CHECK: Added new field "http_status" not documented in specs.
    http_status: status || null
  };

  self._postStatsToApi('/stats/auth', statsObject);
};

/**
 * Function that handles the posting of /stats/client/signaling stats.
 * @method _handleStatsSignaling
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsSignaling = function(state, socketSession, error) {
  var self = this;
  var statsObject = {
    room_id: self._room && self._room.id,
    state: state,
    protocol: self._signalingServerProtocol,
    server: (socketSession.socketServer.split('//')[1] || '').split(':')[0] || '',
    port: parseInt(((socketSession.socketServer.split(':') || '')[2] || '').split('?')[0] || '', 10),
    transport: socketSession.transportType.toLowerCase(),
    attempts: socketSession.attempts,
    // TO CHECK: Added new field "error" not documented in specs.
    error: error || null
  };

  self._postStatsToApi('/stats/client/signaling', statsObject);
};

/**
 * Function that handles the posting of /stats/client/iceconnection stats.
 * @method _handleStatsIceConnection
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsIceConnection = function(state, peerId) {
  var self = this;
  var statsObject = {
    room_id: self._room && self._room.id,
    user_id: self._user && self._user.sid,
    peer_id: peerId,
    state: state,
    is_trickle: self._initOptions.enableIceTrickle,
    local_candidate: {},
    remote_candidate: {}
  };

  self.getConnectionStatus(peerId, function (error, success) {
    if (success && success.connectionStats[peerId]) {
      ['local', 'remote'].forEach(function (type) {
        var candidate = success.connectionStats[peerId].selectedCandidate[type];

        if (candidate) {
          statsObject[type + '_candidate'].address = candidate.ipAddress || null;
          statsObject[type + '_candidate'].port = candidate.portNumber || null;
          statsObject[type + '_candidate'].priority = candidate.priority || null;
          statsObject[type + '_candidate'].transport = candidate.transport || null;
          statsObject[type + '_candidate'].candidateType = candidate.candidateType || null;

          if (type === 'local') {
            statsObject[type + '_candidate'].networkType = candidate.networkType || null;
          }
        }
      });
    }

    self._postStatsToApi('/stats/client/iceconnection', statsObject);
  });
};

/**
 * Function that handles the posting of /stats/client/icecandidate stats.
 * @method _handleStatsIceCandidate
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsIceCandidate = function(state, peerId, candidateId, candidate, error) {
  var self = this;
  var statsObject = {
    room_id: self._room && self._room.id,
    user_id: self._user && self._user.sid,
    peer_id: peerId,
    state: state,
    candidate_id: candidateId,
    sdpMid: candidate.sdpMid,
    sdpMLineIndex: candidate.sdpMLineIndex,
    candidate: candidate.candidate,
    error: error || null
  };

  self._postStatsToApi('/stats/client/icecandidate', statsObject);
};

/**
 * Function that parses the session description and post to stats for every m= line that ICE gathering has completed.
 * @method _parseStatsIceGatheringCompleted
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._parseStatsIceGatheringCompleted = function(peerId, direction) {
  var self = this;

  if (!self._peerConnections[peerId]) {
    return;
  }

  var sessionDescription = self._peerConnections[peerId][direction + 'Description'];

  if (!(sessionDescription && sessionDescription.sdp)) {
    return;
  }

  (sessionDescription.sdp || '').split('m=').forEach(function (lines, index) {
    if (lines.indexOf('audio ') === 0 || lines.indexOf('video ') === 0 || lines.indexOf('application ') === 0) {
      // Double check if it is rejected for Edge browser case.
      if (lines.split(' ')[1] === '0') {
        return;
      }

      var mid = (lines.split('a=mid:')[1] || '').split('\r\n')[0];
      self._handleStatsIceCandidate(null, peerId, direction === 'remote' ? 'endofcan-' + (index - 1) : null, {
        sdpMid: mid,
        sdpMLineIndex: index - 1,
        candidate: null
      });
    }
  });
};

/**
 * Function that parses ICE candidates (a=candidate:) from the remote description and post to stats.
 * @method _parseStatsIceCandidatesFromSDP
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._parseStatsIceCandidatesFromSDP = function(peerId, sessionDescription) {
  var self = this;

  (sessionDescription.sdp || '').split('m=').forEach(function (lines, index) {
    if (lines.indexOf('audio ') === 0 || lines.indexOf('video ') === 0 || lines.indexOf('application ') === 0) {
      // Double check if it is rejected for Edge browser case.
      if (lines.split(' ')[1] === '0') {
        return;
      }

      var mid = null;
      var candidates = [];

      lines.split('\r\n').forEach(function (line) {
        if (line.indexOf('a=mid:') === 0) {
          mid = (lines.split('a=mid:')[1] || '').split('\r\n')[0];
        } else if (line.indexOf('a=candidate:') === 0) {
          candidates.push(line.replace(/a=/g, ''));
        }
      });

      candidates.forEach(function (candidate, candidateIndex) {
        self._handleStatsIceCandidate(self.CANDIDATE_PROCESSING_STATE.PROCESS_SUCCESS, peerId, mid + '-' + candidateIndex, {
          sdpMid: mid,
          sdpMLineIndex: index - 1,
          candidate: candidate
        });
      });
    }
  });
};


