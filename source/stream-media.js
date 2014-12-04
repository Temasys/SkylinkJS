/**
 * The list of recommended video resolutions.
 * - Note that the higher the resolution, the connectivity speed might
 *   be affected.
 * - The available video resolutions type are:
 * @param {JSON} QVGA QVGA video resolution.
 * @param {Integer} QVGA.width 320
 * @param {Integer} QVGA.height 180
 * @param {JSON} VGA VGA video resolution.
 * @param {Integer} VGA.width 640
 * @param {Integer} VGA.height 360
 * @param {JSON} HD HD video quality
 * @param {Integer} HD.width 1280
 * @param {Integer} HD.height 720
 * @param {JSON} FHD Might not be supported. Full HD video resolution.
 * @param {Integer} FHD.width 1920
 * @param {Integer} FHD.height 1080
 * @attribute VIDEO_RESOLUTION
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype.VIDEO_RESOLUTION = {
  QVGA: {
    width: 320,
    height: 180
  },
  VGA: {
    width: 640,
    height: 360
  },
  HD: {
    width: 1280,
    height: 720
  },
  FHD: {
    width: 1920,
    height: 1080
  } // Please check support
};

/**
 * The list of local media streams.
 * @attribute _mediaStreams
 * @type Array
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._mediaStreams = [];

/**
 * The user stream settings.
 * @attribute _streamSettings
 * @type JSON
 * @param {Boolean|JSON} [audio=false] This call requires audio
 * @param {Boolean} [audio.stereo=false] Enabled stereo or not
 * @param {Boolean|JSON} [video=false] This call requires video
 * @param {JSON} [video.resolution] [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [video.resolution.width] Video width
 * @param {Integer} [video.resolution.height] Video height
 * @param {Integer} [video.frameRate] Mininum frameRate of Video
 * @param {String} [bandwidth] Bandwidth settings
 * @param {String} [bandwidth.audio] Audio Bandwidth
 * @param {String} [bandwidth.video] Video Bandwidth
 * @param {String} [bandwidth.data] Data Bandwidth.
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._streamSettings = {};

/**
 * The getUserMedia settings parsed from
 * {{#crossLink "Skylink/_streamSettings:attr"}}_streamSettings{{/crossLink}}.
 * @attribute _getUserMediaSettings
 * @type JSON
 * @param {Boolean|JSON} [audio=false] This call requires audio.
 * @param {Boolean|JSON} [video=false] This call requires video.
 * @param {Integer} [video.mandatory.minHeight] Video minimum width.
 * @param {Integer} [video.mandatory.minWidth] Video minimum height.
 * @param {Integer} [video.mandatory.maxHeight] Video maximum width.
 * @param {Integer} [video.mandatory.maxWidth] Video maximum height.
 * @param {Integer} [video.optional.0.minFrameRate] Mininum frameRate of Video.
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._getUserMediaSettings = {};

/**
 * The user MediaStream(s) status.
 * @attribute _mediaStreamsStatus
 * @type JSON
 * @param {Boolean} [audioMuted=true] Is user's audio muted.
 * @param {Boolean} [videoMuted=true] Is user's vide muted.
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._mediaStreamsStatus = {};

/**
 * Fallback to audio call if audio and video is required.
 * @attribute _audioFallback
 * @type Boolean
 * @default false
 * @private
 * @required
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._audioFallback = false;

/**
 * Access to user's MediaStream is successful.
 * @method _onUserMediaSuccess
 * @param {MediaStream} stream MediaStream object.
 * @trigger mediaAccessSuccess
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._onUserMediaSuccess = function(stream) {
  var self = this;
  log.log([null, 'MediaStream', stream.id,
    'User has granted access to local media'], stream);
  self._trigger('mediaAccessSuccess', stream);

  // check if readyStateChange is done
  self._condition('readyStateChange', function () {
    self._mediaStreams[stream.id] = stream;

    self._muteLocalMediaStreams();

    // check if users is in the room already
    self._condition('peerJoined', function () {
      self._trigger('incomingStream', self._user.sid, stream, true, self.getPeerInfo());
    }, function () {
      return self._inRoom;
    }, function (peerId, peerInfo, isSelf) {
      return isSelf;
    });
  }, function () {
    return self._readyState === self.READY_STATE_CHANGE.COMPLETED;
  }, function (state) {
    return state === self.READY_STATE_CHANGE.COMPLETED;
  });
};

/**
 * Access to user's MediaStream failed.
 * @method _onUserMediaError
 * @param {Object} error Error object that was thrown.
 * @trigger mediaAccessFailure
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._onUserMediaError = function(error) {
  var self = this;
  log.error([null, 'MediaStream', null, 'Failed retrieving stream:'], error);
  if (self._audioFallback && self._streamSettings.video) {
    // redefined the settings for video as false
    self._streamSettings.video = false;

    log.debug([null, 'MediaStream', null, 'Falling back to audio stream call']);
    window.getUserMedia({
      audio: true
    }, function(stream) {
      self._onUserMediaSuccess(stream);
    }, function(error) {
      log.error([null, 'MediaStream', null,
        'Failed retrieving audio in audio fallback:'], error);
      self._trigger('mediaAccessError', error);
    });
    this.getUserMedia({ audio: true });
  } else {
    log.error([null, 'MediaStream', null, 'Failed retrieving stream:'], error);
   self._trigger('mediaAccessError', error);
  }
};

/**
 * The remote peer advertised streams, that we are forwarding to the app. This is part
 * of the peerConnection's addRemoteDescription() API's callback.
 * @method _onRemoteStreamAdded
 * @param {String} targetMid PeerId of the peer that has remote stream to send.
 * @param {Event}  event This is provided directly by the peerconnection API.
 * @trigger incomingStream
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._onRemoteStreamAdded = function(targetMid, event) {
  if(targetMid !== 'MCU') {
    if (!this._peerInformations[targetMid]) {
      log.error([targetMid, 'MediaStream', event.stream.id,
          'Received remote stream when peer is not connected. ' +
          'Ignoring stream ->'], event.stream);
      return;
    }
    if (!this._peerInformations[targetMid].settings.audio &&
      !this._peerInformations[targetMid].settings.video) {
      log.log([targetMid, 'MediaStream', event.stream.id,
        'Receive remote stream but ignoring stream as it is empty ->'
        ], event.stream);
      return;
    }
    log.log([targetMid, 'MediaStream', event.stream.id,
      'Received remote stream ->'], event.stream);
    this._trigger('incomingStream', targetMid, event.stream,
      false, this._peerInformations[targetMid]);
  } else {
    log.log([targetMid, null, null, 'MCU is listening']);
  }
};

/**
 * Parse stream settings
 * @method _parseAudioStreamSettings
 * @param {Boolean|JSON} [options=false] This call requires audio
 * @param {Boolean} [options.stereo=false] Enabled stereo or not.
 * @return {JSON} The parsed audio options.
 * - settings: User set audio options
 * - userMedia: getUserMedia options
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._parseAudioStreamSettings = function (audioOptions) {
  audioOptions = (typeof audioOptions === 'object') ?
    audioOptions : !!audioOptions;

  // Cleaning of unwanted keys
  if (audioOptions !== false) {
    audioOptions = (typeof audioOptions === 'boolean') ? {} : audioOptions;
    var tempAudioOptions = {};
    tempAudioOptions.stereo = !!audioOptions.stereo;
    audioOptions = tempAudioOptions;
  }

  var userMedia = (typeof audioOptions === 'object') ?
    true : audioOptions;

  return {
    settings: audioOptions,
    userMedia: userMedia
  };
};

/**
 * Parse stream settings
 * @method _parseAudioStreamSettings
 * @param {Boolean|JSON} [options=false] This call requires video
 * @param {JSON} [options.resolution] [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [options.resolution.width=640] Video width
 * @param {Integer} [options.resolution.height=480] Video height
 * @param {Integer} [options.frameRate=50] Mininum frameRate of Video
 * @return {JSON} The parsed video options.
 * - settings: User set video options
 * - userMedia: getUserMedia options
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._parseVideoStreamSettings = function (videoOptions) {
  videoOptions = (typeof videoOptions === 'object') ?
    videoOptions : !!videoOptions;

  // prevent undefined error
  this._room = this._room || {};
  this._room.connection = this._room.connection || {};
  this._room.connection.mediaConstraints = this._room.connection.mediaConstraints || {};
  var defaultWidth = this._room.connection.mediaConstraints.maxWidth || 640;
  var defaultHeight = this._room.connection.mediaConstraints.maxHeight || 480;

  var userMedia = false;

  // Cleaning of unwanted keys
  if (videoOptions !== false) {
    videoOptions = (typeof videoOptions === 'boolean') ?
      { resolution: {} } : videoOptions;
    var tempVideoOptions = {};
    // set the resolution
    tempVideoOptions.resolution = tempVideoOptions.resolution || {};
    tempVideoOptions.resolution.width = videoOptions.resolution.width || defaultWidth;
    tempVideoOptions.resolution.height = videoOptions.resolution.height || defaultHeight;
    // set the framerate
    tempVideoOptions.frameRate = videoOptions.frameRate || 50;
    videoOptions = tempVideoOptions;

    userMedia = {
      mandatory: {
        maxWidth: videoOptions.resolution.width,
        maxHeight: videoOptions.resolution.height
      },
      optional: [{ minFrameRate: videoOptions.frameRate }]
    };
  }

  return {
    settings: videoOptions,
    userMedia: userMedia
  };
};

/**
 * Parse and set bandwidth settings.
 * @method _parseBandwidthSettings
 * @param {String} [options] Bandwidth settings
 * @param {String} [options.audio=50] Audio Bandwidth
 * @param {String} [options.video=256] Video Bandwidth
 * @param {String} [options.data=1638400] Data Bandwidth
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._parseBandwidthSettings = function (bwOptions) {
  bwOptions = (typeof bwOptions === 'object') ?
    bwOptions : {};

  // set audio bandwidth
  bwOptions.audio = (typeof bwOptions.audio === 'number') ?
    bwOptions.audio : 50;
  // set video bandwidth
  bwOptions.video = (typeof bwOptions.video === 'number') ?
    bwOptions.video : 256;
  // set data bandwidth
  bwOptions.data = (typeof bwOptions.data === 'number') ?
    bwOptions.data : 1638400;

  // set the settings
  this._streamSettings.bandwidth = bwOptions;
};

/**
 * Parse stream settings
 * @method _parseMutedSettings
 * @param {JSON} [options] The stream settings
 * @param {Boolean} [options.audio] Is audio enabled.
 * @param {Boolean} [options.video] Is video enabled.
 * @param {JSON} [muted] The muted settings
 * @param {Boolean} [muted.audio] Is audio muted.
 * @param {Boolean} [muted.video] Is video muted.
 * @return {JSON} The parsed muted options.
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._parseMutedSettings = function (options, muted) {
  // the stream options
  options = (typeof options === 'object') ?
    options : { audio: false, video: false };
  // the muted options
  muted = (typeof muted === 'object') ?
    muted : { audioMuted: true, videoMuted: true };

  var updateAudioMuted = (typeof muted.audioMuted === 'boolean') ?
    muted.audioMuted : !!this._mediaStreamsStatus.audioMuted;
  var updateVideoMuted = (typeof muted.videoMuted === 'boolean') ?
    muted.videoMuted : !!this._mediaStreamsStatus.videoMuted;

  return {
    audioMuted: (!!options.audio) ? updateAudioMuted : true,
    videoMuted: (!!options.video) ? updateVideoMuted : true
  };
};

/**
 * Parse stream settings
 * @method _parseMediaStreamSettings
 * @param {JSON} options Media Constraints.
 * @param {Boolean|JSON} [options.audio=false] This call requires audio
 * @param {Boolean} [options.audio.stereo=false] Enabled stereo or not
 * @param {Boolean|JSON} [options.video=false] This call requires video
 * @param {JSON} [options.video.resolution] [Rel: VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width] Video width
 * @param {Integer} [options.video.resolution.height] Video height
 * @param {Integer} [options.video.frameRate=50] Mininum frameRate of video.
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._parseMediaStreamSettings = function(options) {
  var hasMediaChanged = false;

  options = options || {};

  log.debug('Parsing stream settings. Stream options:', options);

  // Set audio settings
  var audioSettings = this._parseAudioStreamSettings(options.audio);
  // check for change
  this._streamSettings.audio = audioSettings.settings;
  this._getUserMediaSettings.audio = audioSettings.userMedia;

  // Set video settings
  var videoSettings = this._parseVideoStreamSettings(options.video);
  // check for change
  this._streamSettings.video = videoSettings.settings;
  this._getUserMediaSettings.video = videoSettings.userMedia;

  // Set user media status options
  var mutedSettings = this._parseMutedSettings({
    video: !!videoSettings.settings,
    audio: !!audioSettings.settings
  }, this._mediaStreamsStatus);

  this._mediaStreamsStatus = mutedSettings;

  log.debug('Parsed user media stream settings', this._streamSettings);

  log.debug('User media status:', this._mediaStreamsStatus);
};

/**
 * Sends our Local MediaStreams to other Peers.
 * By default, it sends all it's other stream
 * @method _addLocalMediaStreams
 * @param {String} peerId PeerId of the peer to send local stream to.
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._addLocalMediaStreams = function(peerId) {
  // NOTE ALEX: here we could do something smarter
  // a mediastream is mainly a container, most of the info
  // are attached to the tracks. We should iterates over track and print
  log.log([peerId, null, null, 'Adding local stream']);
  if (Object.keys(this._mediaStreams).length > 0) {
    for (var stream in this._mediaStreams) {
      if (this._mediaStreams.hasOwnProperty(stream)) {
        this._peerConnections[peerId].addStream(this._mediaStreams[stream]);
        log.debug([peerId, 'MediaStream', stream, 'Sending stream']);
      }
    }
  } else {
    log.warn([peerId, null, null, 'No media to send. Will be only receiving']);
  }
};

/**
 * Stops all MediaStreams(s) playback and streaming.
 * @method _stopLocalMediaStreams
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._stopLocalMediaStreams = function () {
  for (var streamId in this._mediaStreams) {
    if (this._mediaStreams.hasOwnProperty(streamId)) {
      this._mediaStreams[streamId].stop();
    }
  }
  this._mediaStreams = [];
};

/**
 * Handles the muting of audio and video streams.
 * @method _muteLocalMediaStreams
 * @return options If MediaStream(s) has specified tracks.
 * @return options.hasAudioTracks If MediaStream(s) has audio tracks.
 * @return options.hasVideoTracks If MediaStream(s)  has video tracks.
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._muteLocalMediaStreams = function () {
  var hasAudioTracks = false;
  var hasVideoTracks = false;

  console.info(Object.keys(this._mediaStreams)[0]);

  // Loop and enable tracks accordingly
  for (var streamId in this._mediaStreams) {
    if (this._mediaStreams.hasOwnProperty(streamId)) {
      var audioTracks = this._mediaStreams[streamId].getAudioTracks();
      var videoTracks = this._mediaStreams[streamId].getVideoTracks();

      hasAudioTracks = audioTracks.length > 0 || hasAudioTracks;
      hasVideoTracks = videoTracks.length > 0 || hasVideoTracks;

      console.info(hasAudioTracks, hasVideoTracks, audioTracks, videoTracks);

      // loop audio tracks
      for (var a = 0; a < audioTracks.length; a++) {
        audioTracks[a].enabled = this._mediaStreamsStatus.audioMuted !== true;
      }
      // loop video tracks
      for (var v = 0; v < videoTracks.length; v++) {
        videoTracks[v].enabled = this._mediaStreamsStatus.videoMuted !== true;
      }
    }
  }

  // update accordingly if failed
  if (!hasAudioTracks) {
    //this._mediaStreamsStatus.audioMuted = true;
    this._streamSettings.audio = false;
  }
  if (!hasVideoTracks) {
    //this._mediaStreamsStatus.videoMuted = true;
    this._streamSettings.video = false;
  }

  log.log('Update to isAudioMuted status ->', this._mediaStreamsStatus.audioMuted);
  log.log('Update to isVideoMuted status ->', this._mediaStreamsStatus.videoMuted);

  return {
    hasAudioTracks: hasAudioTracks,
    hasVideoTracks: hasVideoTracks
  };
};

/**
 * Waits for MediaStream.
 * - Once the stream is loaded, callback is called
 * - If there's not a need for stream, callback is called
 * @method _waitForLocalMediaStream
 * @param {Function} callback Callback after requested constraints are loaded.
 * @param {JSON} [options] Media Constraints.
 * @param {JSON} [options.userData] User custom data.
 * @param {Boolean|JSON} [options.audio=false] This call requires audio
 * @param {Boolean} [options.audio.stereo=false] Enabled stereo or not
 * @param {Boolean|JSON} [options.video=false] This call requires video
 * @param {JSON} [options.video.resolution] [Rel: VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width] Video width
 * @param {Integer} [options.video.resolution.height] Video height
 * @param {Integer} [options.video.frameRate] Mininum frameRate of Video
 * @param {String} [options.bandwidth] Bandwidth settings
 * @param {String} [options.bandwidth.audio=50] Audio Bandwidth
 * @param {String} [options.bandwidth.video=256] Video Bandwidth
 * @param {String} [options.bandwidth.data=1638400] Data Bandwidth
 * @trigger mediaAccessRequired
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._waitForLocalMediaStream = function(callback, options) {
  var self = this;
  options = options || {};

  // get the stream
  if (options.manualGetUserMedia === true) {
    self._trigger('mediaAccessRequired');
  }
  // If options video or audio false, do the opposite to throw a true.
  var requireAudio = !!options.audio;
  var requireVideo = !!options.video;

  log.log('Requested audio:', requireAudio);
  log.log('Requested video:', requireVideo);

  // check if it requires audio or video
  if (!requireAudio && !requireVideo && !options.manualGetUserMedia) {
    // set to default
    self._parseMediaStreamSettings(self._streamSettings);
    callback();
    return;
  }

  // get the user media
  if (!options.manualGetUserMedia && (options.audio || options.video)) {
    self.getUserMedia({
      audio: options.audio,
      video: options.video
    });
  }

  // clear previous mediastreams
  self._stopLocalMediaStreams();

  // wait for available audio or video stream
  self._wait(callback, function () {
    var hasAudio = !requireAudio;
    var hasVideo = !requireVideo;

    // for now we require one MediaStream with both audio and video
    // due to firefox non-supported audio or video
    for (var streamId in self._mediaStreams) {
      if (self._mediaStreams.hasOwnProperty(streamId)) {
        var stream = self._mediaStreams[streamId];

        // do the check
        if (requireAudio) {
          hasAudio = stream.getAudioTracks().length > 0;
        }
        if (requireVideo) {
          hasVideo =  stream.getVideoTracks().length > 0;
        }
        if (hasAudio && hasVideo) {
          return true;
        }
      }
    }
  });
};

/**
 * Gets the default video source and microphone source.
 * - This is an implemented function for Skylink.
 * - Constraints are not the same as the [MediaStreamConstraints](http://dev.w3.
 *   org/2011/webrtc/editor/archives/20140817/getusermedia.html#dictionary
 *   -mediastreamconstraints-members) specified in the w3c specs.
 * - Calling <b>getUserMedia</b> while having streams being sent to another peer may
 *   actually cause problems, because currently <b>getUserMedia</b> refreshes all streams.
 * @method getUserMedia
 * @param {JSON} [options]  MediaStream constraints.
 * @param {JSON|Boolean} [options.audio=true] Option to allow audio stream.
 * @param {Boolean} [options.audio.stereo=false] Option to enable stereo
 *    during call.
 * @param {JSON|Boolean} [options.video=true] Option to allow video stream.
 * @param {JSON} [options.video.resolution] The resolution of video stream.
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width]
 *   The video stream resolution width (in px).
 * @param {Integer} [options.video.resolution.height]
 *   The video stream resolution height (in px).
 * @param {Integer} [options.video.frameRate=50]
 *   The video stream mininum frameRate.
 * @example
 *   // Default is to get both audio and video
 *   // Example 1: Get both audio and video by default.
 *   SkylinkDemo.getUserMedia();
 *
 *   // Example 2: Get the audio stream only
 *   SkylinkDemo.getUserMedia({
 *     'video' : false,
 *     'audio' : true
 *   });
 *
 *   // Example 3: Set the stream settings for the audio and video
 *   SkylinkDemo.getUserMedia({
 *     'video' : {
 *        'resolution': SkylinkDemo.VIDEO_RESOLUTION.HD,
 *        'frameRate': 50
 *      },
 *     'audio' : {
 *       'stereo': true
 *     }
 *   });
 * @trigger mediaAccessSuccess, mediaAccessError
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.getUserMedia = function(options) {
  var self = this;

  options = options || {
    audio: true,
    video: true
  };

  // parse stream settings
  self._parseMediaStreamSettings(options);

  // if audio and video is false, do not call getUserMedia
  if (!(options.audio === false && options.video === false)) {
    // clear previous mediastreams
    self._stopLocalMediaStreams();

    try {
      window.getUserMedia(self._getUserMediaSettings, function (stream) {
        self._onUserMediaSuccess(stream);
      }, function (error) {
        self._onUserMediaError(error);
      });
    } catch (error) {
      self._onUserMediaError(error);
    }
  } else {
    log.warn([null, 'MediaStream', null, 'Not retrieving stream']);
  }
};

/**
 * Resends a Local MediaStreams. This overrides all previous MediaStreams sent.
 * Provided MediaStream would be automatically detected as unmuted by default.
 * @method sendStream
 * @param {Object|JSON} stream The stream object or options.
 * @param {Boolean} [stream.audio=false] If send a new stream with audio.
 * @param {Boolean} [stream.video=false] If send a new stream with video.
 * @param {Boolean} [stream.audioMuted=true] If send a new stream with audio muted.
 * @param {Boolean} [stream.videoMuted=true] If send a new stream with video muted.
 * @param {Boolean} [stream.getEmptyStream=false] If audio or video muted is set and there is
 *   no audio or video stream, it will get the stream before muting it.
 * @example
 *   // Example 1: Send a stream object instead
 *   SkylinkDemo.on('mediaAccessSuccess', function (stream) {
 *     SkylinkDemo.sendStream(stream);
 *   });
 *
 *   // Example 2: Send stream with getUserMedia automatically called for you
 *   SkylinkDemo.sendStream({
 *     audio: true,
 *     video: false
 *   });
 *
 *   // Example 3: Send stream with getUserMedia automatically called for you
 *   // and audio is muted
 *   SkylinkDemo.sendStream({
 *     audio: true,
 *     video: false,
 *     audioMuted: true
 *   });
 * @trigger peerRestart, peerUpdated, incomingStream
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.sendStream = function(stream) {
  var self = this;

  if (typeof stream !== 'object') {
    log.error('Provided stream settings is not an object');
    return;
  }

  // Stream object
  // getAudioTracks or getVideoTracks first because adapterjs
  // has not implemeneted MediaStream as an interface
  // interopability with firefox and chrome
  //MediaStream = MediaStream || webkitMediaStream;
  // NOTE: eventually we should do instanceof
  if (typeof stream.getAudioTracks === 'function' ||
    typeof stream.getVideoTracks === 'function') {
    // stop playback
    self._stopLocalMediaStreams();
    // send the stream
    if (!self._mediaStreams[stream.id]) {
      self._onUserMediaSuccess(stream);
    }

    self._mediaStreamsStatus.audioMuted = false;
    self._mediaStreamsStatus.videoMuted = false;

    self._streamSettings.audio = stream.getAudioTracks().length > 0;
    self._streamSettings.video = stream.getVideoTracks().length > 0;

    for (var peer in self._peerConnections) {
      if (self._peerConnections.hasOwnProperty(peer)) {
        self._restartPeerConnection(peer, true);
      }
    }
    self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);

  // Options object
  } else {
    // set the muted status
    if (typeof stream.audioMuted === 'boolean') {
      self._mediaStreamsStatus.audioMuted = !!stream.audioMuted;
    }
    if (typeof stream.videoMuted === 'boolean') {
      self._mediaStreamsStatus.videoMuted = !!stream.videoMuted;
    }

    // do a reinit
    if (typeof stream.audio === 'boolean' || typeof stream.video === 'boolean') {
      // set the settings
      self._parseMediaStreamSettings({
        audio: !!stream.audio,
        video: !!stream.video
      });
      // get the mediastream and then wait for it to be retrieved before sending
      self._waitForLocalMediaStream(function () {
        // mute unwanted streams
        for (var peer in self._peerConnections) {
          if (self._peerConnections.hasOwnProperty(peer)) {
            self._restartPeerConnection(peer, true);
          }
        }
        self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
      }, stream);

    } else {
      var hasTracksOption = self._muteLocalMediaStreams();
      var refetchAudio = false;
      var refetchVideo = false;

      // update to mute status of audio tracks
      if (!hasTracksOption.hasAudioTracks) {
        // do a refetch
        refetchAudio = stream.audioMuted === false && stream.getEmptyStream === true;
      }

      // update to mute status of video tracks
      if (!hasTracksOption.hasVideoTracks) {
        // do a refetch
        refetchVideo = stream.videoMuted === false && stream.getEmptyStream === true;
      }

      // do a refetch
      if (refetchAudio || refetchVideo) {
        // set the settings
        self._parseMediaStreamSettings({
          audio: stream.audioMuted === false || self._streamSettings.audio,
          video: stream.videoMuted === false || self._streamSettings.video
        });

        self.getUserMedia(self._streamSettings);

        self.once('mediaAccessSuccess', function (stream) {
          // mute unwanted streams
          for (var peer in self._peerConnections) {
            if (self._peerConnections.hasOwnProperty(peer)) {
              self._restartPeerConnection(peer, true);
            }
          }
          self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
        });
        // get the mediastream and then wait for it to be retrieved before sending
        /*self._waitForLocalMediaStream(function () {

        }, stream);*/

      } else {
        // update to mute status of video tracks
        if (hasTracksOption.hasVideoTracks) {
          // send message
          this._sendChannelMessage({
            type: this._SIG_MESSAGE_TYPE.MUTE_VIDEO,
            mid: this._user.sid,
            rid: this._room.id,
            muted: this._mediaStreamsStatus.videoMuted
          });
        }
        // update to mute status of audio tracks
        if (hasTracksOption.hasAudioTracks) {
          // send message
          this._sendChannelMessage({
            type: this._SIG_MESSAGE_TYPE.MUTE_AUDIO,
            mid: this._user.sid,
            rid: this._room.id,
            muted: this._mediaStreamsStatus.audioMuted
          });
        }
        self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
      }
    }
  }
};

/**
 * Enable microphone.
 * - Try to start the audio source.
 * - If no audio source was initialy set, this function has no effect.
 * - If you want to activate your audio but haven't initially enabled it you would need to
 *   reinitiate your connection with
 *   {{#crossLink "Skylink/joinRoom:method"}}joinRoom(){{/crossLink}}
 *   process and set the audio parameter to true.
 * @method enableAudio
 * @trigger peerUpdated, peerRestart
 * @deprecated
 * @example
 *   SkylinkDemo.enableAudio();
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.enableAudio = function() {
  this.sendStream({
    audioMuted: false,
    getEmptyStream: true
  });
};

/**
 * Disable microphone.
 * - Try to disable the microphone.
 * - If no microphone was initially set, this function has no effect.
 * @method disableAudio
 * @example
 *   SkylinkDemo.disableAudio();
 * @trigger peerUpdated, peerRestart
 * @deprecated
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.disableAudio = function() {
  this.sendStream({
    audioMuted: true
  });
};

/**
 * Enable webcam video.
 * - Try to start the video source.
 * - If no video source was initialy set, this function has no effect.
 * - If you want to activate your video but haven't initially enabled it you would need to
 *   reinitiate your connection with
 *   {{#crossLink "Skylink/joinRoom:method"}}joinRoom(){{/crossLink}}
 *   process and set the video parameter to true.
 * @method enableVideo
 * @example
 *   SkylinkDemo.enableVideo();
 * @trigger peerUpdated, peerRestart
 * @deprecated
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.enableVideo = function() {
  this.sendStream({
    videoMuted: false,
    getEmptyStream: true
  });
};

/**
 * Disable video source.
 * - Try to disable the video source.
 * - If no video source was initially set, this function has no effect.
 * @method disableVideo
 * @example
 *   SkylinkDemo.disableVideo();
 * @trigger peerUpdated, peerRestart
 * @deprecated
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.disableVideo = function() {
  this.sendStream({
    videoMuted: true
  });
};