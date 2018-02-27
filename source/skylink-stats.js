/**
 * Function that posts the stats to API.
 * @method _postStatsToApi
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._postStatsToApi = function (endpoint, params) {
  var self = this;

  // The API result returned "username" will change each time a GET /api/:appKey/:room is done.
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
 * Function that handles the posting of client information (POST /stats/client) stats.
 * @method _handleStatsClient
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsClient = function() {
  var self = this;
  var statsObject = {
    username: (self._user && self._user.uid) || null,
    sdk_name: 'web',
    sdk_version: self.VERSION,
    agent_name: AdapterJS.webrtcDetectedBrowser,
    agent_version: AdapterJS.webrtcDetectedVersion,
    agent_platform: navigator.platform,
    agent_plugin_version: (AdapterJS.WebRTCPlugin.plugin && AdapterJS.WebRTCPlugin.plugin.VERSION) || null
  };

  self._postStatsToApi('/stats/client', statsObject);
};

/**
 * Function that handles the posting of session information (POST /stats/session) stats.
 * @method _handleStatsSession
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsSession = function(message) {
  var self = this;
  var statsObject = {
    room_id: self._room && self._room.id,
    user_id: (self._user && self._user.sid) || null,
    state: message.type,
    contents: message
  };

  self._postStatsToApi('/stats/session', statsObject);
};

/**
 * Function that handles the posting of appkey authentication (POST /stats/auth) stats.
 * @method _handleStatsAuth
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsAuth = function(state, result, status, error) {
  var self = this;
  var statsObject = {
    room_id: (result && result.room_key) || null,
    state: state,
    http_status: status,
    http_error: (typeof error === 'string' ? error : (error && error.message)) || null,
    api_url: self._path,
    api_result: result
  };

  self._postStatsToApi('/stats/auth', statsObject);
};

/**
 * Function that handles the posting of socket connection (POST /stats/client/signaling) stats.
 * @method _handleStatsSignaling
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsSignaling = function(state, retries, error) {
  var self = this;
  var socketSession = clone(self._socketSession);
  var statsObject = {
    room_id: self._room && self._room.id,
    user_id: (self._user && self._user.sid) || null,
    state: state,
    signaling_url: socketSession.socketServer,
    signaling_transport: socketSession.transportType.toLowerCase(),
    attempts: retries,
    error: (typeof error === 'string' ? error : (error && error.message)) || null
  };

  self._postStatsToApi('/stats/client/signaling', statsObject);
};

/**
 * Function that handles the posting of peer ICE connection states (POST /stats/client/iceconnection) stats.
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
    local_candidate: {},
    remote_candidate: {}
  };

  // Set a timeout interval to ensure the stats retrieval does not run at the same time the state is triggered.
  // This should handle this asyncrohonous issue.
  setTimeout(function () {
    self._retrieveStats(peerId, function (error, stats) {
      if (stats) {
        // Parse the selected ICE candidate pair for both local and remote candidate.
        ['local', 'remote'].forEach(function (directionType) {
          var candidate = stats.selectedCandidate[directionType];

          if (candidate) {
            statsObject[directionType + '_candidate'].ip_address = candidate.ipAddress || null;
            statsObject[directionType + '_candidate'].port_number = candidate.portNumber || null;
            statsObject[directionType + '_candidate'].candidate_type = candidate.candidateType || null;
            statsObject[directionType + '_candidate'].protocol = candidate.transport || null;
            statsObject[directionType + '_candidate'].priority = candidate.priority || null;

            // This is only available for the local ICE candidate.
            if (directionType === 'local') {
              statsObject.local_candidate.network_type = candidate.networkType || null;
            }
          }
        });
      }

      self._postStatsToApi('/stats/client/iceconnection', statsObject);
    }, true);
  }, 0);
};

/**
 * Function that handles the posting of peer ICE candidate processing states (POST /stats/client/icecandidate) stats.
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
    candidate_id: candidateId || null,
    candidate_sdp_mid: candidate.sdpMid,
    candidate_sdp_mindex: candidate.sdpMLineIndex,
    candidate_candidate: candidate.candidate,
    error: (typeof error === 'string' ? error : (error && error.message)) || null,
  };

  self._postStatsToApi('/stats/client/icecandidate', statsObject);
};

/**
 * Function that handles the posting of peer ICE gathering states (POST /stats/client/icegathering) stats.
 * @method _handleStatsIceGathering
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsIceGathering = function(state, peerId, isRemote) {
  var self = this;
  var statsObject = {
    room_id: self._room && self._room.id,
    user_id: self._user && self._user.sid,
    peer_id: peerId,
    state: state,
    is_remote: isRemote
  };

  self._postStatsToApi('/stats/client/icegathering', statsObject);
};

/**
 * Function that handles the posting of peer connection negotiation (POST /stats/client/negotiation) stats.
 * @method _handleStatsNegotiation
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsNegotiation = function(state, peerId, sdpOrMessage, error) {
  var self = this;
  var statsObject = {
    room_id: self._room && self._room.id,
    user_id: self._user && self._user.sid,
    peer_id: peerId,
    state: state,
    weight: sdpOrMessage.weight,
    sdp_type: null,
    sdp_sdp: null,
    error: (typeof error === 'string' ? error : (error && error.message)) || null,
  };

  if (['sent_welcome', 'sent_restart', 'received_enter', 'received_welcome', 'received_restart'].indexOf(state) === -1) {
    var peerInfoId = state.indexOf('remote_') > -1 || state.indexOf('received_') === 0 ? peerId : undefined;
    statsObject.weight = self.getPeerInfo(peerInfoId).config.priorityWeight;
    statsObject.sdp_type = (sdpOrMessage && sdpOrMessage.type) || null;
    statsObject.sdp_sdp = (sdpOrMessage && sdpOrMessage.sdp) || null;
  }

  self._postStatsToApi('/stats/client/negotiation', statsObject);
};

/**
 * Function that handles the posting of peer connection bandwidth (POST /stats/client/bandwidth) stats.
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
    audio_send: { tracks: [] },
    audio_recv: {},
    video_send: { tracks: [] },
    video_recv: {}
  };

  var useStream = self._streams.screenshare || self._streams.userMedia || null;
  var mutedStatus = self.getPeerInfo().mediaStatus;

  // Format the stream tracks information.
  if (useStream) {
    // Parse the audio track if it exists only.
    if (useStream.tracks.audio) {
      statsObject.audio_send.tracks = [{
        stream_id: useStream.id,
        id: useStream.tracks.audio.id,
        label: useStream.tracks.audio.label,
        muted: mutedStatus.audioMuted
      }];
    }

    // Parse the video track if it exists only.
    if (useStream.tracks.video) {
      statsObject.video_send.tracks = [{
        stream_id: useStream.id,
        id: useStream.tracks.video.id,
        label: useStream.tracks.video.label,
        height: useStream.tracks.video.height,
        width: useStream.tracks.video.width,
        muted: mutedStatus.videoMuted
      }];
    }
  }

  self._retrieveStats(peerId, function (error, stats) {
    if (error) {
      statsObject.error = error && error.message;
      stats = {
        audio: { sending: {}, receiving: {} },
        video: { sending: {}, receiving: {} }
      };
    }

    var formatValue = function (mediaType, directionType, itemKey) {
      var value = stats[mediaType][directionType === 'send' ? 'sending' : 'receiving'][itemKey];
      if (['number', 'string', 'boolean'].indexOf(typeof value) > -1) {
        return value;
      }
      return null;
    };

    statsObject.audio_send.bytes = formatValue('audio', 'send', 'bytes');
    statsObject.audio_send.packets = formatValue('audio', 'send', 'packets');
    statsObject.audio_send.round_trip_time = formatValue('audio', 'send', 'rtt');
    statsObject.audio_send.nack_count = formatValue('audio', 'send', 'nacks');
    statsObject.audio_send.echo_return_loss = formatValue('audio', 'send', 'echoReturnLoss');
    statsObject.audio_send.echo_return_loss_enhancement = formatValue('audio', 'send', 'echoReturnLossEnhancement');

    statsObject.audio_recv.bytes = formatValue('audio', 'recv', 'bytes');
    statsObject.audio_recv.packets = formatValue('audio', 'recv', 'packets');
    statsObject.audio_recv.packets_lost = formatValue('audio', 'recv', 'packetsLost');
    statsObject.video_recv.packets_discarded = formatValue('audio', 'recv', 'packetsDiscarded');
    statsObject.audio_recv.jitter = formatValue('audio', 'recv', 'jitter');
    statsObject.audio_recv.nack_count = formatValue('audio', 'recv', 'nacks');

    statsObject.video_send.bytes = formatValue('video', 'send', 'bytes');
    statsObject.video_send.packets = formatValue('video', 'send', 'packets');
    statsObject.video_send.round_trip_time = formatValue('video', 'send', 'rtt');
    statsObject.video_send.nack_count = formatValue('video', 'send', 'nacks');
    statsObject.video_send.firs_count = formatValue('video', 'send', 'firs');
    statsObject.video_send.plis_count = formatValue('video', 'send', 'plis');
    statsObject.video_send.frames = formatValue('video', 'send', 'frames');
    statsObject.video_send.frames_encoded = formatValue('video', 'send', 'framesEncoded');
    statsObject.video_send.frames_dropped = formatValue('video', 'send', 'framesDropped');
    statsObject.video_send.frame_width = formatValue('video', 'send', 'frameWidth');
    statsObject.video_send.frame_height = formatValue('video', 'send', 'frameHeight');
    statsObject.video_send.framerate = formatValue('video', 'send', 'frameRate');
    statsObject.video_send.framerate_input = formatValue('video', 'send', 'frameRateInput');
    statsObject.video_send.framerate_encoded = formatValue('video', 'send', 'frameRateEncoded');
    statsObject.video_send.framerate_mean = formatValue('video', 'send', 'frameRateMean');
    statsObject.video_send.framerate_std_dev = formatValue('video', 'send', 'frameRateStdDev');
    statsObject.video_send.cpu_limited_resolution = formatValue('video', 'send', 'cpuLimitedResolution');
    statsObject.video_send.bandwidth_limited_resolution = formatValue('video', 'send', 'bandwidthLimitedResolution');

    statsObject.video_recv.bytes = formatValue('video', 'recv', 'bytes');
    statsObject.video_recv.packets = formatValue('video', 'recv', 'packets');
    statsObject.video_recv.packets_lost = formatValue('video', 'recv', 'packetsLost');
    statsObject.video_recv.packets_discarded = formatValue('video', 'recv', 'packetsDiscarded');
    statsObject.video_recv.jitter = formatValue('video', 'recv', 'jitter');
    statsObject.video_recv.nack_count = formatValue('video', 'recv', 'nacks');
    statsObject.video_recv.firs_count = formatValue('video', 'recv', 'firs');
    statsObject.video_recv.plis_count = formatValue('video', 'recv', 'plis');
    statsObject.video_recv.frames = formatValue('video', 'recv', 'frames');
    statsObject.video_recv.frames_decoded = formatValue('video', 'recv', 'framesDecoded');
    statsObject.video_recv.frame_width = formatValue('video', 'recv', 'frameWidth');
    statsObject.video_recv.frame_height = formatValue('video', 'recv', 'frameHeight');
    statsObject.video_recv.framerate = formatValue('video', 'recv', 'frameRate');
    statsObject.video_recv.framerate_output = formatValue('video', 'recv', 'frameRateOutput');
    statsObject.video_recv.framerate_decoded = formatValue('video', 'recv', 'frameRateDecoded');
    statsObject.video_recv.framerate_mean = formatValue('video', 'recv', 'frameRateMean');
    statsObject.video_recv.framerate_std_dev = formatValue('video', 'recv', 'frameRateStdDev');
    statsObject.video_recv.qp_sum = formatValue('video', 'recv', 'qpSum');

    self._postStatsToApi('/stats/client/bandwidth', statsObject);
  }, true);
};

/**
 * Function that handles the posting of recording states (POST /stats/client/recording) stats.
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
    error: (typeof error === 'string' ? error : (error && error.message)) || null
  };

  self._postStatsToApi('/stats/client/recording', statsObject);
};

/**
 * Function that handles the posting of datachannel states (POST /stats/client/datachannel) stats.
 * @method _handleStatsDatachannel
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsDatachannel = function(state, peerId, channel, channelProp, error) {
  var self = this;
  var statsObject = {
    room_id: self._room && self._room.id,
    user_id: self._user && self._user.sid,
    peer_id: peerId,
    state: state,
    channel_id: channel && channel.id,
    channel_label: channel && channel.label,
    channel_type: channelProp === 'main' ? 'persistent' : 'temporal',
    channel_binary_type: channel && channel.binaryType,
    error: (typeof error === 'string' ? error : (error && error.message)) || null
  };

  if (channel && AdapterJS.webrtcDetectedType === 'plugin') {
    statsObject.channel_binary_type = AdapterJS.webrtcDetectedBrowser === 'IE' &&
      AdapterJS.webrtcDetectedVersion < 11 ? 'none' : 'int8Array';
  }

  self._postStatsToApi('/stats/client/datachannel', statsObject);
};

