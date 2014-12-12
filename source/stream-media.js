/**
 * The list of recommended video resolutions.
 * - Note that the higher the resolution, the connectivity speed might
 *   be affected.
 * - The available video resolutions type are:
 * @param {JSON} QQVGA QQVGA resolution.
 * @param {Integer} QQVGA.width 160
 * @param {Integer} QQVGA.height 120
 * @param {String} QQVGA.aspectRatio 4:3
 * @param {JSON} HQVGA HQVGA resolution.
 * @param {Integer} HQVGA.width 240
 * @param {Integer} HQVGA.height 160
 * @param {String} HQVGA.aspectRatio 3:2
 * @param {JSON} QVGA QVGA resolution.
 * @param {Integer} QVGA.width 320
 * @param {Integer} QVGA.height 180
 * @param {String} QVGA.aspectRatio 4:3
 * @param {JSON} WQVGA WQVGA resolution.
 * @param {Integer} WQVGA.width 384
 * @param {Integer} WQVGA.height 240
 * @param {String} WQVGA.aspectRatio 16:10
 * @param {JSON} HVGA HVGA resolution.
 * @param {Integer} HVGA.width 480
 * @param {Integer} HVGA.height 320
 * @param {String} HVGA.aspectRatio 3:2
 * @param {JSON} VGA VGA resolution.
 * @param {Integer} VGA.width 640
 * @param {Integer} VGA.height 360
 * @param {String} VGA.aspectRatio 4:3
 * @param {JSON} WVGA WVGA resolution.
 * @param {Integer} WVGA.width 768
 * @param {Integer} WVGA.height 480
 * @param {String} WVGA.aspectRatio 16:10
 * @param {JSON} FWVGA FWVGA resolution.
 * @param {Integer} FWVGA.width 854
 * @param {Integer} FWVGA.height 480
 * @param {String} FWVGA.aspectRatio 16:9
 * @param {JSON} SVGA SVGA resolution.
 * @param {Integer} SVGA.width 800
 * @param {Integer} SVGA.height 600
 * @param {String} SVGA.aspectRatio 4:3
 * @param {JSON} DVGA DVGA resolution.
 * @param {Integer} DVGA.width 960
 * @param {Integer} DVGA.height 640
 * @param {String} DVGA.aspectRatio 3:2
 * @param {JSON} WSVGA WSVGA resolution.
 * @param {Integer} WSVGA.width 1024
 * @param {Integer} WSVGA.height 576
 * @param {String} WSVGA.aspectRatio 16:9
 * @param {JSON} HD HD resolution.
 * @param {Integer} HD.width 1280
 * @param {Integer} HD.height 720
 * @param {String} HD.aspectRatio 16:9
 * @param {JSON} HDPLUS HDPLUS resolution.
 * @param {Integer} HDPLUS.width 1600
 * @param {Integer} HDPLUS.height 900
 * @param {String} HDPLUS.aspectRatio 16:9
 * @param {JSON} FHD FHD resolution.
 * @param {Integer} FHD.width 1920
 * @param {Integer} FHD.height 1080
 * @param {String} FHD.aspectRatio 16:9
 * @param {JSON} QHD QHD resolution.
 * @param {Integer} QHD.width 2560
 * @param {Integer} QHD.height 1440
 * @param {String} QHD.aspectRatio 16:9
 * @param {JSON} WQXGAPLUS WQXGAPLUS resolution.
 * @param {Integer} WQXGAPLUS.width 3200
 * @param {Integer} WQXGAPLUS.height 1800
 * @param {String} WQXGAPLUS.aspectRatio 16:9
 * @param {JSON} UHD UHD resolution.
 * @param {Integer} UHD.width 3840
 * @param {Integer} UHD.height 2160
 * @param {String} UHD.aspectRatio 16:9
 * @param {JSON} UHDPLUS UHDPLUS resolution.
 * @param {Integer} UHDPLUS.width 5120
 * @param {Integer} UHDPLUS.height 2880
 * @param {String} UHDPLUS.aspectRatio 16:9
 * @param {JSON} FUHD FUHD resolution.
 * @param {Integer} FUHD.width 7680
 * @param {Integer} FUHD.height 4320
 * @param {String} FUHD.aspectRatio 16:9
 * @param {JSON} QUHD QUHD resolution.
 * @param {Integer} QUHD.width 15360
 * @param {Integer} QUHD.height 8640
 * @param {String} QUHD.aspectRatio 16:9
 * @attribute VIDEO_RESOLUTION
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.VIDEO_RESOLUTION = {
  QQVGA: { width: 160, height: 120, aspectRatio: '4:3' },
  HQVGA: { width: 240, height: 160, aspectRatio: '3:2' },
  QVGA: { width: 320, height: 180, aspectRatio: '4:3' },
  WQVGA: { width: 384, height: 240, aspectRatio: '16:10' },
  HVGA: { width: 480, height: 320, aspectRatio: '3:2' },
  VGA: { width: 640, height: 360, aspectRatio: '4:3' },
  WVGA: { width: 768, height: 480, aspectRatio: '16:10' },
  FWVGA: { width: 854, height: 480, aspectRatio: '16:9' },
  SVGA: { width: 800, height: 600, aspectRatio: '4:3' },
  DVGA: { width: 960, height: 640, aspectRatio: '3:2' },
  WSVGA: { width: 1024, height: 576, aspectRatio: '16:9' },
  HD: { width: 1280, height: 720, aspectRatio: '16:9' },
  HDPLUS: { width: 1600, height: 900, aspectRatio: '16:9' },
  FHD: { width: 1920, height: 1080, aspectRatio: '16:9' },
  QHD: { width: 2560, height: 1440, aspectRatio: '16:9' },
  WQXGAPLUS: { width: 3200, height: 1800, aspectRatio: '16:9' },
  UHD: { width: 3840, height: 2160, aspectRatio: '16:9' },
  UHDPLUS: { width: 5120, height: 2880, aspectRatio: '16:9' },
  FUHD: { width: 7680, height: 4320, aspectRatio: '16:9' },
  QUHD: { width: 15360, height: 8640, aspectRatio: '16:9' }
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
 * @param {Integer} [video.frameRate] Maximum frameRate of Video
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
 * @param {Integer} [video.mandatory.maxHeight] Video maximum width.
 * @param {Integer} [video.mandatory.maxWidth] Video maximum height.
 * @param {Integer} [video.mandatory.maxFrameRate] Maximum frameRate of Video.
 * @param {Array} [video.optional] The getUserMedia options.
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
 * @trigger mediaAccessError
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
 * @param {Integer} [options.frameRate=50] Maximum frameRate of Video
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
    videoOptions.resolution = videoOptions.resolution || {};
    tempVideoOptions.resolution = tempVideoOptions.resolution || {};
    tempVideoOptions.resolution.width = videoOptions.resolution.width || defaultWidth;
    tempVideoOptions.resolution.height = videoOptions.resolution.height || defaultHeight;
    // set the framerate
    tempVideoOptions.frameRate = videoOptions.frameRate || 50;
    videoOptions = tempVideoOptions;

    userMedia = {
      mandatory: {
        //minWidth: videoOptions.resolution.width,
        //minHeight: videoOptions.resolution.height,
        maxWidth: videoOptions.resolution.width,
        maxHeight: videoOptions.resolution.height,
        //minFrameRate: videoOptions.frameRate,
        maxFrameRate: videoOptions.frameRate
      },
      optional: []
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
 * @param {JSON} options Media Constraints.
 * @param {Boolean|JSON} [options.audio=false] This call requires audio
 * @param {Boolean} [options.audio.stereo=false] Enabled stereo or not.
 * @param {Boolean} [options.audio.mute=false] If audio stream should be muted.
 * @param {Boolean|JSON} [options.video=false] This call requires video
 * @param {JSON} [options.video.resolution] [Rel: VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width] Video width
 * @param {Integer} [options.video.resolution.height] Video height
 * @param {Integer} [options.video.frameRate=50] Maximum frameRate of video.
 * @param {Boolean} [options.video.mute=false] If video stream should be muted.
 * @return {JSON} The parsed muted options.
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._parseMutedSettings = function (options) {
  // the stream options
  options = (typeof options === 'object') ?
    options : { audio: false, video: false };

  var updateAudioMuted = (typeof options.audio === 'object') ?
    !!options.audio.mute : !options.audio;
  var updateVideoMuted = (typeof options.video === 'object') ?
    !!options.video.mute : !options.video;

  return {
    audioMuted: updateAudioMuted,
    videoMuted: updateVideoMuted
  };
};

/**
 * Parse stream settings
 * @method _parseMediaStreamSettings
 * @param {JSON} options Media Constraints.
 * @param {Boolean|JSON} [options.audio=false] This call requires audio
 * @param {Boolean} [options.audio.stereo=false] Enabled stereo or not.
 * @param {Boolean} [options.audio.mute=false] If audio stream should be muted.
 * @param {Boolean|JSON} [options.video=false] This call requires video
 * @param {JSON} [options.video.resolution] [Rel: VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width] Video width
 * @param {Integer} [options.video.resolution.height] Video height
 * @param {Integer} [options.video.frameRate=50] Maximum frameRate of video.
 * @param {Boolean} [options.video.mute=false] If video stream should be muted.
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
  var mutedSettings = this._parseMutedSettings(options);

  this._mediaStreamsStatus = mutedSettings;

  log.debug('Parsed user media stream settings', this._streamSettings);

  log.debug('User media status:', this._mediaStreamsStatus);
};

/**
 * Sends our Local MediaStreams to other Peers.
 * By default, it sends all it's other stream
 * @method _addLocalMediaStreams
 * @param {String} peerId The peerId of the peer to send local stream to.
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
  if (Object.keys(this._mediaStreams).length > 0) {
    this._trigger('mediaAccessStopped');
  }
  this._mediaStreams = [];
};

/**
 * Handles the muting of audio and video streams.
 * @method _muteLocalMediaStreams
 * @return options If MediaStream(s) has specified tracks.
 * @return options.hasAudioTracks If MediaStream(s) has audio tracks.
 * @return options.hasVideoTracks If MediaStream(s) has video tracks.
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._muteLocalMediaStreams = function () {
  var hasAudioTracks = false;
  var hasVideoTracks = false;

  // Loop and enable tracks accordingly
  for (var streamId in this._mediaStreams) {
    if (this._mediaStreams.hasOwnProperty(streamId)) {
      var audioTracks = this._mediaStreams[streamId].getAudioTracks();
      var videoTracks = this._mediaStreams[streamId].getVideoTracks();

      hasAudioTracks = audioTracks.length > 0 || hasAudioTracks;
      hasVideoTracks = videoTracks.length > 0 || hasVideoTracks;

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
 * @param {Boolean} [options.audio.mute=false] If audio stream should be muted.
 * @param {Boolean|JSON} [options.video=false] This call requires video
 * @param {JSON} [options.video.resolution] [Rel: VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width] Video width
 * @param {Integer} [options.video.resolution.height] Video height
 * @param {Integer} [options.video.frameRate] Maximum frameRate of Video
 * @param {Boolean} [options.video.mute=false] If video stream should be muted.
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
    if (options.audio === false && options.video === false) {
      self._parseMediaStreamSettings(options);
    }

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

  var current50Block = 0;
  var mediaAccessRequiredFailure = false;

  // wait for available audio or video stream
  self._wait(function () {
    if (mediaAccessRequiredFailure === true) {
      self._onUserMediaError('Waiting for stream timeout');

    } else {
      callback();
    }

  }, function () {
    var hasAudio = !requireAudio;
    var hasVideo = !requireVideo;

    // for now we require one MediaStream with both audio and video
    // due to firefox non-supported audio or video
    for (var streamId in self._mediaStreams) {
      if (self._mediaStreams.hasOwnProperty(streamId)) {
        var stream = self._mediaStreams[streamId];

        if (stream && options.manualGetUserMedia) {
          return true;
        }

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

    if (options.manualGetUserMedia === true) {
      current50Block += 1;
      if (current50Block === 600) {
        mediaAccessRequiredFailure = true;
        return true;
      }
    }
  }, 50);
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
 * @param {Boolean} [options.audio.mute=false] If audio stream should be muted.
 * @param {JSON|Boolean} [options.video=true] Option to allow video stream.
 * @param {JSON} [options.video.resolution] The resolution of video stream.
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [options.video.resolution.width]
 *   The video stream resolution width (in px).
 * @param {Integer} [options.video.resolution.height]
 *   The video stream resolution height (in px).
 * @param {Integer} [options.video.frameRate=50]
 *   The video stream maximum frameRate.
 * @param {Boolean} [options.video.mute=false] If video stream should be muted.
 * @param {Function} [callback] The callback fired after media was successfully accessed.
 *   Default signature: function(error object, success object)
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
 *
 *   // Example 4: Get user media with callback
 *   SkylinkDemo.getUserMedia({
 *     'video' : false,
 *     'audio' : true
 *   },function(error,success){
 *      if (error){
 *        console.log(error);
 *      }
 *      else{
 *        console.log(success);
 *     }
 *   });
 * @trigger mediaAccessSuccess, mediaAccessError
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.getUserMedia = function(options,callback) {
  var self = this;

  if (!options){
    options = {
      audio: true,
      video: true
    };
  }
  else if (typeof options === 'function'){
    callback = options;
    options = {
      audio: true,
      video: true
    };
  }

  // parse stream settings
  self._parseMediaStreamSettings(options);

  // if audio and video is false, do not call getUserMedia
  if (!(options.audio === false && options.video === false)) {
    // clear previous mediastreams
    self._stopLocalMediaStreams();
    try {
      window.getUserMedia(self._getUserMediaSettings, function (stream) {
        self._onUserMediaSuccess(stream);
        if (typeof callback === 'function'){
          callback(null,stream);
        }
      }, function (error) {
        self._onUserMediaError(error);
        if (typeof callback === 'function'){
          callback(error,null);
        }
      });
    } catch (error) {
      self._onUserMediaError(error);
      if (typeof callback === 'function'){
        callback(error,null);
      }
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
 * @param {Boolean} [stream.audio.stereo=false] Option to enable stereo
 *    during call.
 * @param {Boolean} [stream.audio.mute=false] If send a new stream with audio muted.
 * @param {JSON|Boolean} [stream.video=false] Option to allow video stream.
 * @param {JSON} [stream.video.resolution] The resolution of video stream.
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Integer} [stream.video.resolution.width]
 *   The video stream resolution width (in px).
 * @param {Integer} [stream.video.resolution.height]
 *   The video stream resolution height (in px).
 * @param {Integer} [stream.video.frameRate=50]
 *   The video stream maximum frameRate.
 * @param {Boolean} [stream.video.mute=false] If send a new stream with video muted.
 * @param {Function} [callback] The callback fired after stream was sent.
 *   Default signature: function(error object, success object)
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
 *    
 *   // Example 4: Send stream with callback
 *   SkylinkDemo.sendStream({
 *    audio: true,
 *    video: true 
 *   },function(error,success){
 *    if (error){
 *      console.log('Error occurred. Stream was not sent: '+error)
 *    }
 *    else{
 *      console.log('Stream successfully sent: '+success);
 *    }
 *   });
 *
 * @trigger peerRestart, incomingStream
 * @for Skylink
 * @since 0.5.6
 */

Skylink.prototype.sendStream = function(stream, callback) {
  var self = this;
  var restartCount = 0;
  var peerCount = Object.keys(self._peerConnections).length;

  if (typeof stream !== 'object') {
    var error = 'Provided stream settings is not an object';
    log.error(error);
    if (typeof callback === 'function'){
      callback(error,null);
    }
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

    if (typeof callback === 'function'){
      self.once('peerRestart',function(peerId, peerInfo, isSelfInitiatedRestart){
        log.log([null, 'MediaStream', stream.id, 
          'Stream was sent. Firing callback'], stream);
        callback(null,stream);
        restartCount = 0; //reset counter
      },function(peerId, peerInfo, isSelfInitiatedRestart){
        if (isSelfInitiatedRestart){
          restartCount++;
          if (restartCount === peerCount){
            return true;
          }
        }
        return false;
      },true);
    }

    self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);

  // Options object
  } else {

    // get the mediastream and then wait for it to be retrieved before sending
    self._waitForLocalMediaStream(function () {
      // mute unwanted streams
      for (var peer in self._peerConnections) {
        if (self._peerConnections.hasOwnProperty(peer)) {
          self._restartPeerConnection(peer, true);
        }
      }

      if (typeof callback === 'function'){
        self.once('peerRestart',function(peerId, peerInfo, isSelfInitiatedRestart){
          log.log([null, 'MediaStream', stream.id, 
            'Stream was sent. Firing callback'], stream);
          callback(null,stream);
          restartCount = 0; //reset counter
        },function(peerId, peerInfo, isSelfInitiatedRestart){
          if (isSelfInitiatedRestart){
            restartCount++;
            if (restartCount === peerCount){
              return true;
            }
          }
          return false;
        },true);
      }

      self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
    }, stream);
  }
};

/**
 * Mutes a Local MediaStreams.
 * @method muteStream
 * @param {Object|JSON} options The muted options.
 * @param {Boolean} [options.audioMuted=true] If send a new stream with audio muted.
 * @param {Boolean} [options.videoMuted=true] If send a new stream with video muted.
 * @param {Boolean} [options.getEmptyStream=false] If audio or video muted is set and there is
 *   no audio or video stream, it will get the stream before muting it.
 * @example
 *   SkylinkDemo.muteStream({
 *     audioMuted: true,
 *     videoMuted: false
 *   });
 * @trigger peerRestart, peerUpdated, incomingStream
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.muteStream = function(options) {
  var self = this;

  if (typeof options !== 'object') {
    log.error('Provided settings is not an object');
    return;
  }

  // set the muted status
  if (typeof options.audioMuted === 'boolean') {
    self._mediaStreamsStatus.audioMuted = !!options.audioMuted;
  }
  if (typeof options.videoMuted === 'boolean') {
    self._mediaStreamsStatus.videoMuted = !!options.videoMuted;
  }

  var hasTracksOption = self._muteLocalMediaStreams();
  var refetchAudio = false;
  var refetchVideo = false;

  // update to mute status of audio tracks
  if (!hasTracksOption.hasAudioTracks) {
    // do a refetch
    refetchAudio = options.audioMuted === false && options.getEmptyStream === true;
  }

  // update to mute status of video tracks
  if (!hasTracksOption.hasVideoTracks) {
    // do a refetch
    refetchVideo = options.videoMuted === false && options.getEmptyStream === true;
  }

  // do a refetch
  if (refetchAudio || refetchVideo) {
    // set the settings
    self._parseMediaStreamSettings({
      audio: options.audioMuted === false || self._streamSettings.audio,
      video: options.videoMuted === false || self._streamSettings.video
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
  this.muteStream({
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
  this.muteStream({
    audioMuted: true,
    getEmptyStream: true
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
  this.muteStream({
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
  this.muteStream({
    videoMuted: true,
    getEmptyStream: true
  });
};