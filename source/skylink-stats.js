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

/**
 * Function that handles the posting of /stats/client/negotiation stats.
 * @method _handleStatsNegotiation
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsNegotiation = function(state, peerId, sessionDescription, error) {
  var self = this;
  var statsObject = {
    room_id: self._room && self._room.id,
    user_id: self._user && self._user.sid,
    peer_id: peerId,
    state: state,
    weight: self._peerPriorityWeight,
    sdp_type: (sessionDescription && sessionDescription.type) || null,
    sdp_sdp: (sessionDescription && sessionDescription.sdp) || null,
    error: error || null
  };

  self._postStatsToApi('/stats/client/negotiation', statsObject);
};

/**
 * Function that handles the posting of /stats/client/bandwidth stats.
 * @method _handleStatsBandwidth
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsBandwidth = function (peerId) {
  var self = this;
  var statsObject = {
    room_id: self._room && self._room.id,
    user_id: self._user && self._user.sid,
    peer_id: peerId,
    audio: {
      send: {
        muted: null,
        bytes: null,
        packets: null,
        round_trip_time: null,
        nacks: null
      },
      recv: {
        bytes: null,
        packets: null,
        packets_lost: null,
        jitter: null,
        nacks: null
      }
    },
    video: {
      send: {
        muted: null,
        bytes: null,
        packets: null,
        round_trip_time: null,
        // TO CHECK: Added new field "framesEncoded" etc..
        framesEncoded: null,
        framesDropped: null,
        frameHeight: null,
        frameWidth: null,
        frameRate: null,
        nacks: null,
        firs: null,
        plis: null,
        moz_frameRateMean: null,
        moz_frameRateStdDev: null,
        goog_frameRateInput: null,
        goog_frameRateSent: null,
        goog_cpuLimitedResolution: null,
        goog_bandwidthLimitedResolution: null
      },
      recv: {
        bytes: null,
        packets: null,
        packets_lost: null,
        jitter: null,
        // TO CHECK: Added new field "framesDecoded" etc..
        framesDecoded: null,
        frameHeight: null,
        frameWidth: null,
        frameRate: null,
        nacks: null,
        firs: null,
        plis: null,
        qpSum: null,
        goog_frameRateOutput: null,
        goog_frameRateReceived: null
      }
    }
  };

  var stream = (self._streams.screenshare && self._streams.screenshare.stream) ||
    (self._streams.userMedia && self._streams.userMedia.stream) || null;

  if (stream) {
    statsObject.audio.send.muted = stream.getAudioTracks()[0] ? stream.getAudioTracks()[0].muted : null;
    statsObject.video.send.muted = stream.getVideoTracks()[0] ? stream.getVideoTracks()[0].muted : null;
  }

  self.getConnectionStatus(peerId, function (error, success) {
    if (success && success.connectionStats[peerId]) {
      statsObject.audio.send.bytes = success.connectionStats[peerId].audio.sending.bytes;
      statsObject.audio.send.packets = success.connectionStats[peerId].audio.sending.packets;
      statsObject.audio.send.round_trip_time = success.connectionStats[peerId].audio.sending.rtt;
      statsObject.audio.send.echoReturnLoss = success.connectionStats[peerId].audio.sending.echoReturnLoss;
      statsObject.audio.send.echoReturnLossEnhancement = success.connectionStats[peerId].audio.sending.echoReturnLossEnhancement;
      statsObject.audio.send.nacks = success.connectionStats[peerId].audio.sending.nacks;

      statsObject.audio.recv.bytes = success.connectionStats[peerId].audio.receiving.bytes;
      statsObject.audio.recv.packets = success.connectionStats[peerId].audio.receiving.packets;
      statsObject.audio.recv.packets_lost = success.connectionStats[peerId].audio.receiving.packetsLost;
      statsObject.audio.recv.jitter = success.connectionStats[peerId].audio.receiving.jitter;
      statsObject.audio.recv.nacks = success.connectionStats[peerId].audio.receiving.nacks;

      statsObject.video.send.bytes = success.connectionStats[peerId].video.sending.bytes;
      statsObject.video.send.packets = success.connectionStats[peerId].video.sending.packets;
      statsObject.video.send.round_trip_time = success.connectionStats[peerId].video.sending.rtt;
      statsObject.video.send.framesEncoded = success.connectionStats[peerId].video.sending.framesEncoded;
      statsObject.video.send.framesDropped = success.connectionStats[peerId].video.sending.framesDropped;
      statsObject.video.send.frameHeight = success.connectionStats[peerId].video.sending.frameHeight;
      statsObject.video.send.frameWidth = success.connectionStats[peerId].video.sending.frameWidth;
      statsObject.video.send.frameRate = success.connectionStats[peerId].video.sending.frameRate;
      statsObject.video.send.nacks = success.connectionStats[peerId].video.sending.nacks;
      statsObject.video.send.firs = success.connectionStats[peerId].video.sending.firs;
      statsObject.video.send.plis = success.connectionStats[peerId].video.sending.plis;
      statsObject.video.send.moz_frameRateMean = success.connectionStats[peerId].video.sending.frameRateMean;
      statsObject.video.send.moz_frameRateStdDev = success.connectionStats[peerId].video.sending.frameRateStdDev;
      statsObject.video.send.goog_frameRateInput = success.connectionStats[peerId].video.sending.frameRateInput;
      statsObject.video.recv.goog_frameRateSent = success.connectionStats[peerId].video.receiving.frameRateSent;
      statsObject.video.send.goog_cpuLimitedResolution = success.connectionStats[peerId].video.sending.cpuLimitedResolution;
      statsObject.video.send.goog_bandwidthLimitedResolution = success.connectionStats[peerId].video.sending.bandwidthLimitedResolution;

      statsObject.video.recv.bytes = success.connectionStats[peerId].video.receiving.bytes;
      statsObject.video.recv.packets = success.connectionStats[peerId].video.receiving.packets;
      statsObject.video.recv.packets_lost = success.connectionStats[peerId].video.receiving.packetsLost;
      statsObject.video.recv.jitter = success.connectionStats[peerId].video.receiving.jitter;
      statsObject.video.send.framesDecoded = success.connectionStats[peerId].video.receiving.framesDecoded;
      statsObject.video.send.frameHeight = success.connectionStats[peerId].video.receiving.frameHeight;
      statsObject.video.send.frameWidth = success.connectionStats[peerId].video.receiving.frameWidth;
      statsObject.video.send.frameRate = success.connectionStats[peerId].video.receiving.frameRate;
      statsObject.video.recv.nacks = success.connectionStats[peerId].video.receiving.nacks;
      statsObject.video.recv.firs = success.connectionStats[peerId].video.receiving.firs;
      statsObject.video.recv.plis = success.connectionStats[peerId].video.receiving.plis;
      statsObject.video.recv.qpSum = success.connectionStats[peerId].video.receiving.qpSum;
      statsObject.video.recv.goog_frameRateOutput = success.connectionStats[peerId].video.receiving.frameRateOutput;
      statsObject.video.recv.goog_frameRateReceived = success.connectionStats[peerId].video.receiving.frameRateReceived;
    }

    self._postStatsToApi('/stats/client/bandwidth', statsObject);
  });
};

/**
 * Function that handles the posting of /stats/client/recording stats.
 * @method _handleStatsRecording
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsRecording = function(state, recordingId, recordings, error) {
  var self = this;
  var statsObject = {
    room_id: self._room && self._room.id,
    user_id: self._user && self._user.sid,
    state: state,
    recording_id: recordingId || null,
    recordings: recordings,
    error: error || null
  };

  self._postStatsToApi('/stats/client/recording', statsObject);
};

