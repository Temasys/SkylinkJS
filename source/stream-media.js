/**
 * The list of available Video Codecs.
 * - Note that setting this video codec does not mean that it will be
 *   the primary codec used for the call as it may vary based on the offerer's
 *   codec set.
 * - The available video codecs are:
 * @attribute VIDEO_CODEC
 * @param {String} VP8 Use the VP8 video codec. This is the common and mandantory video codec used.
 * @param {String} H264 Use the H264 video codec. This only works if the browser supports H264.
 * @type JSON
 * @readOnly
 * @component Stream
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.VIDEO_CODEC = {
  VP8: 'VP8',
  H264: 'H264'
};

/**
 * The list of available Audio Codecs.
 * - Note that setting this audio codec does not mean that it will be
 *   the primary codec used for the call as it may vary based on the offerer's
 *   codec set.
 * - The available audio codecs are:
 * @attribute AUDIO_CODEC
 * @param {String} OPUS Use the OPUS audio codec.
 *   This is the common and mandantory audio codec used. This codec supports stereo.
 * @param {String} ISAC Use the ISAC audio codec.
 *   This only works if the browser supports ISAC. This codec is mono based.
 * @type JSON
 * @readOnly
 * @component Stream
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.AUDIO_CODEC = {
  ISAC: 'ISAC',
  OPUS: 'opus'
};

/**
 * Stores the preferred audio codec.
 * @attribute _selectedAudioCodec
 * @type String
 * @default Skylink.AUDIO_CODEC.OPUS
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._selectedAudioCodec = 'opus';

/**
 * Stores the preferred video codec.
 * @attribute _selectedVideoCodec
 * @type String
 * @default Skylink.VIDEO_CODEC.VP8
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._selectedVideoCodec = 'VP8';


/**
 * The list of recommended video resolutions.
 * - Note that the higher the resolution, the connectivity speed might
 *   be affected.
 * - The available video resolutions type are:
 * @param {JSON} QQVGA QQVGA resolution.
 * @param {Number} QQVGA.width 160
 * @param {Number} QQVGA.height 120
 * @param {String} QQVGA.aspectRatio 4:3
 * @param {JSON} HQVGA HQVGA resolution.
 * @param {Number} HQVGA.width 240
 * @param {Number} HQVGA.height 160
 * @param {String} HQVGA.aspectRatio 3:2
 * @param {JSON} QVGA QVGA resolution.
 * @param {Number} QVGA.width 320
 * @param {Number} QVGA.height 180
 * @param {String} QVGA.aspectRatio 4:3
 * @param {JSON} WQVGA WQVGA resolution.
 * @param {Number} WQVGA.width 384
 * @param {Number} WQVGA.height 240
 * @param {String} WQVGA.aspectRatio 16:10
 * @param {JSON} HVGA HVGA resolution.
 * @param {Number} HVGA.width 480
 * @param {Number} HVGA.height 320
 * @param {String} HVGA.aspectRatio 3:2
 * @param {JSON} VGA VGA resolution.
 * @param {Number} VGA.width 640
 * @param {Number} VGA.height 360
 * @param {String} VGA.aspectRatio 4:3
 * @param {JSON} WVGA WVGA resolution.
 * @param {Number} WVGA.width 768
 * @param {Number} WVGA.height 480
 * @param {String} WVGA.aspectRatio 16:10
 * @param {JSON} FWVGA FWVGA resolution.
 * @param {Number} FWVGA.width 854
 * @param {Number} FWVGA.height 480
 * @param {String} FWVGA.aspectRatio 16:9
 * @param {JSON} SVGA SVGA resolution.
 * @param {Number} SVGA.width 800
 * @param {Number} SVGA.height 600
 * @param {String} SVGA.aspectRatio 4:3
 * @param {JSON} DVGA DVGA resolution.
 * @param {Number} DVGA.width 960
 * @param {Number} DVGA.height 640
 * @param {String} DVGA.aspectRatio 3:2
 * @param {JSON} WSVGA WSVGA resolution.
 * @param {Number} WSVGA.width 1024
 * @param {Number} WSVGA.height 576
 * @param {String} WSVGA.aspectRatio 16:9
 * @param {JSON} HD HD resolution.
 * @param {Number} HD.width 1280
 * @param {Number} HD.height 720
 * @param {String} HD.aspectRatio 16:9
 * @param {JSON} HDPLUS HDPLUS resolution.
 * @param {Number} HDPLUS.width 1600
 * @param {Number} HDPLUS.height 900
 * @param {String} HDPLUS.aspectRatio 16:9
 * @param {JSON} FHD FHD resolution.
 * @param {Number} FHD.width 1920
 * @param {Number} FHD.height 1080
 * @param {String} FHD.aspectRatio 16:9
 * @param {JSON} QHD QHD resolution.
 * @param {Number} QHD.width 2560
 * @param {Number} QHD.height 1440
 * @param {String} QHD.aspectRatio 16:9
 * @param {JSON} WQXGAPLUS WQXGAPLUS resolution.
 * @param {Number} WQXGAPLUS.width 3200
 * @param {Number} WQXGAPLUS.height 1800
 * @param {String} WQXGAPLUS.aspectRatio 16:9
 * @param {JSON} UHD UHD resolution.
 * @param {Number} UHD.width 3840
 * @param {Number} UHD.height 2160
 * @param {String} UHD.aspectRatio 16:9
 * @param {JSON} UHDPLUS UHDPLUS resolution.
 * @param {Number} UHDPLUS.width 5120
 * @param {Number} UHDPLUS.height 2880
 * @param {String} UHDPLUS.aspectRatio 16:9
 * @param {JSON} FUHD FUHD resolution.
 * @param {Number} FUHD.width 7680
 * @param {Number} FUHD.height 4320
 * @param {String} FUHD.aspectRatio 16:9
 * @param {JSON} QUHD  resolution.
 * @param {Number} QUHD.width 15360
 * @param {Number} QUHD.height 8640
 * @param {String} QUHD.aspectRatio 16:9
 * @attribute VIDEO_RESOLUTION
 * @type JSON
 * @readOnly
 * @component Stream
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
 * @attribute _mediaStream
 * @type Object
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._mediaStream = null;

/**
 * Stores the local MediaStream for screensharing.
 * @attribute _mediaScreen
 * @type Object
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.11
 */
Skylink.prototype._mediaScreen = null;

/**
 * Stores the local MediaStream clone for audio screensharing.
 * @attribute _mediaScreenClone
 * @type Object
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.11
 */
Skylink.prototype._mediaScreenClone = null;

/**
 * The user stream settings.
 * @attribute _defaultStreamSettings
 * @type JSON
 * @param {Boolean|JSON} [audio] If user enables audio, this is the default setting.
 * @param {Boolean} [audio.stereo] Enabled stereo or not
 * @param {Boolean|JSON} [video] If user enables video, this is the default setting.
 * @param {JSON} [video.resolution] [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Number} [video.resolution.width] Video width
 * @param {Number} [video.resolution.height] Video height
 * @param {Number} [video.frameRate] Maximum frameRate of Video
 * @param {String} bandwidth Bandwidth settings.
 * @param {String} bandwidth.audio Audio default Bandwidth
 * @param {String} bandwidth.video Video default Bandwidth
 * @param {String} bandwidth.data Data default Bandwidth.
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.7
 */
Skylink.prototype._defaultStreamSettings = {
  audio: {
    stereo: false
  },
  video: {
    resolution: {
      width: 640,
      height: 480
    },
    frameRate: 50
  },
  bandwidth: {
    audio: 50,
    video: 256,
    data: 1638400
  }
};

/**
 * The user stream settings.
 * @attribute _streamSettings
 * @type JSON
 * @param {Boolean|JSON} [audio=false] This call requires audio
 * @param {Boolean} [audio.stereo] Enabled stereo or not
 * @param {Boolean|JSON} [video=false] This call requires video
 * @param {JSON} [video.resolution] [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Number} [video.resolution.width] Video width
 * @param {Number} [video.resolution.height] Video height
 * @param {Number} [video.frameRate] Maximum frameRate of Video
 * @param {String} [bandwidth] Bandwidth settings
 * @param {String} [bandwidth.audio] Audio Bandwidth
 * @param {String} [bandwidth.video] Video Bandwidth
 * @param {String} [bandwidth.data] Data Bandwidth.
 * @private
 * @component Stream
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
 * @param {Number} [video.mandatory.maxHeight] Video maximum width.
 * @param {Number} [video.mandatory.maxWidth] Video maximum height.
 * @param {Number} [video.mandatory.maxFrameRate] Maximum frameRate of Video.
 * @param {Array} [video.optional] The getUserMedia options.
 * @private
 * @component Stream
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
 * @component Stream
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
 * @component Stream
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._audioFallback = false;

/**
 * Access to user's MediaStream is successful.
 * @method _onUserMediaSuccess
 * @param {MediaStream} stream MediaStream object.
 * @param {Boolean} [isScreenSharing=false] The flag that indicates
 *   if stream is a screensharing stream.
 * @trigger mediaAccessSuccess
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._onUserMediaSuccess = function(stream, isScreenSharing) {
  var self = this;
  log.log([null, 'MediaStream', stream.id,
    'User has granted access to local media'], stream);
  self._trigger('mediaAccessSuccess', stream, !!isScreenSharing);

  var streamEnded = function () {
    self._sendChannelMessage({
      type: self._SIG_MESSAGE_TYPE.STREAM,
      mid: self._user.sid,
      rid: self._room.id,
      cid: self._key,
      status: 'ended'
    });
    self._trigger('streamEnded', self._user.sid, self.getPeerInfo(), true);
  };
  stream.onended = streamEnded;

  // Workaround for local stream.onended because firefox has not yet implemented it
  if (window.webrtcDetectedBrowser === 'firefox') {
    stream.onended = setInterval(function () {
      if (typeof stream.recordedTime === 'undefined') {
        stream.recordedTime = 0;
      }

      if (stream.recordedTime === stream.currentTime) {
        clearInterval(stream.onended);
        // trigger that it has ended
        streamEnded();

      } else {
        stream.recordedTime = stream.currentTime;
      }

    }, 1000);
  }

  // check if readyStateChange is done
  self._condition('readyStateChange', function () {
    if (!isScreenSharing) {
      self._mediaStream = stream;
    } else {
      self._mediaScreen = stream;
    }

    self._muteLocalMediaStreams();

    // check if users is in the room already
    self._condition('peerJoined', function () {
      self._trigger('incomingStream', self._user.sid, stream, true,
        self.getPeerInfo(), !!isScreenSharing);
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
 * @param {Boolean} [isScreenSharing=false] The flag that indicates
 *   if stream is a screensharing stream.
 * @trigger mediaAccessError
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._onUserMediaError = function(error, isScreenSharing) {
  var self = this;
  log.error([null, 'MediaStream', null, 'Failed retrieving stream:'], error);
  if (self._audioFallback && self._streamSettings.video && !isScreenSharing) {
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
   self._trigger('mediaAccessError', error, !!isScreenSharing);
  }
};

/**
 * The remote peer advertised streams, that we are forwarding to the app. This is part
 * of the peerConnection's addRemoteDescription() API's callback.
 * @method _onRemoteStreamAdded
 * @param {String} targetMid PeerId of the peer that has remote stream to send.
 * @param {Event}  event This is provided directly by the peerconnection API.
 * @param {Boolean} [isScreenSharing=false] The flag that indicates
 *   if stream is a screensharing stream.
 * @trigger incomingStream
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._onRemoteStreamAdded = function(targetMid, event, isScreenSharing) {
  var self = this;

  if(targetMid !== 'MCU') {
    if (!self._peerInformations[targetMid]) {
      log.error([targetMid, 'MediaStream', event.stream.id,
          'Received remote stream when peer is not connected. ' +
          'Ignoring stream ->'], event.stream);
      return;
    }

    console.log(self._peerInformations[targetMid].settings);
    if (!self._peerInformations[targetMid].settings.audio &&
      !self._peerInformations[targetMid].settings.video) {
      log.log([targetMid, 'MediaStream', event.stream.id,
        'Receive remote stream but ignoring stream as it is empty ->'
        ], event.stream);
      return;
    }
    log.log([targetMid, 'MediaStream', event.stream.id,
      'Received remote stream ->'], event.stream);

    if (isScreenSharing) {
      log.log([targetMid, 'MediaStream', event.stream.id,
        'Peer is having a screensharing session with user']);
    }

    self._trigger('incomingStream', targetMid, event.stream,
      false, self._peerInformations[targetMid], !!isScreenSharing);
  } else {
    log.log([targetMid, null, null, 'MCU is listening']);
  }
};

/**
 * Parse stream settings
 * @method _parseAudioStreamSettings
 * @param {Boolean|JSON} [options=false] This call requires audio
 * @param {Boolean} [options.stereo] Enabled stereo or not.
 * @return {JSON} The parsed audio options.
 * - settings: User set audio options
 * - userMedia: getUserMedia options
 * @private
 * @component Stream
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
 * @param {Number} [options.resolution.width] Video width
 * @param {Number} [options.resolution.height] Video height
 * @param {Number} [options.frameRate] Maximum frameRate of Video
 * @return {JSON} The parsed video options.
 * - settings: User set video options
 * - userMedia: getUserMedia options
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._parseVideoStreamSettings = function (videoOptions) {
  videoOptions = (typeof videoOptions === 'object') ?
    videoOptions : !!videoOptions;

  var userMedia = false;

  // Cleaning of unwanted keys
  if (videoOptions !== false) {
    videoOptions = (typeof videoOptions === 'boolean') ?
      { resolution: {} } : videoOptions;
    var tempVideoOptions = {};
    // set the resolution parsing
    videoOptions.resolution = videoOptions.resolution || {};
    tempVideoOptions.resolution = tempVideoOptions.resolution || {};
    // set resolution
    tempVideoOptions.resolution.width = videoOptions.resolution.width ||
      this._defaultStreamSettings.video.resolution.width;
    tempVideoOptions.resolution.height = videoOptions.resolution.height ||
      this._defaultStreamSettings.video.resolution.height;
    // set the framerate
    tempVideoOptions.frameRate = videoOptions.frameRate ||
      this._defaultStreamSettings.video.frameRate;
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

    //Remove maxFrameRate for AdapterJS to work with Safari
    if (window.webrtcDetectedType === 'plugin') {
      delete userMedia.mandatory.maxFrameRate;
    }
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
 * @component Stream
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
 * @param {Boolean} [options.audio.stereo] Enabled stereo or not.
 * @param {Boolean} [options.audio.mute=false] If audio stream should be muted.
 * @param {Boolean|JSON} [options.video=false] This call requires video
 * @param {JSON} [options.video.resolution] [Rel: VIDEO_RESOLUTION]
 * @param {Number} [options.video.resolution.width] Video width
 * @param {Number} [options.video.resolution.height] Video height
 * @param {Number} [options.video.frameRate] Maximum frameRate of video.
 * @param {Boolean} [options.video.mute=false] If video stream should be muted.
 * @return {JSON} The parsed muted options.
 * @private
 * @component Stream
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
 * Parse stream default settings
 * @method _parseDefaultMediaStreamSettings
 * @param {JSON} options Media default Constraints.
 * @param {Boolean|JSON} [options.maxWidth=640] Video default width.
 * @param {Boolean} [options.maxHeight=480] Video default height.
 * @private
 * @component Stream
 * @for Skylink
 * @since 0.5.7
 */
Skylink.prototype._parseDefaultMediaStreamSettings = function(options) {
  var hasMediaChanged = false;

  // prevent undefined error
  options = options || {};

  log.debug('Parsing stream settings. Default stream options:', options);

  options.maxWidth = (typeof options.maxWidth === 'number') ? options.maxWidth :
    640;
  options.maxHeight = (typeof options.maxHeight === 'number') ? options.maxHeight :
    480;

  // parse video resolution. that's for now
  this._defaultStreamSettings.video.resolution.width = options.maxWidth;
  this._defaultStreamSettings.video.resolution.height = options.maxHeight;

  log.debug('Parsed default media stream settings', this._defaultStreamSettings);
};

/**
 * Parse stream settings
 * @method _parseMediaStreamSettings
 * @param {JSON} options Media Constraints.
 * @param {Boolean|JSON} [options.audio=false] This call requires audio
 * @param {Boolean} [options.audio.stereo] Enabled stereo or not.
 * @param {Boolean} [options.audio.mute=false] If audio stream should be muted.
 * @param {Boolean|JSON} [options.video=false] This call requires video
 * @param {JSON} [options.video.resolution] [Rel: VIDEO_RESOLUTION]
 * @param {Number} [options.video.resolution.width] Video width
 * @param {Number} [options.video.resolution.height] Video height
 * @param {Number} [options.video.frameRate] Maximum frameRate of video.
 * @param {Boolean} [options.video.mute=false] If video stream should be muted.
 * @private
 * @component Stream
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
 * @component Stream
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._addLocalMediaStreams = function(peerId) {
  // NOTE ALEX: here we could do something smarter
  // a mediastream is mainly a container, most of the info
  // are attached to the tracks. We should iterates over track and print
  try {
    log.log([peerId, null, null, 'Adding local stream']);

    if (this._mediaStream && this._mediaStream !== null) {
      var pc = this._peerConnections[peerId];

      if (pc) {
        if (pc.signalingState !== this.PEER_CONNECTION_STATE.CLOSED) {
          if (this._mediaScreen && this._mediaScreen !== null) {
            pc.addStream(this._mediaScreen);

            log.debug([peerId, 'MediaStream', this._mediaStream, 'Sending screen']);
          } else {
            pc.addStream(this._mediaStream);

            log.debug([peerId, 'MediaStream', this._mediaStream, 'Sending stream']);
          }

        } else {
          log.warn([peerId, 'MediaStream', this._mediaStream,
            'Not adding stream as signalingState is closed']);
        }
      } else {
        log.warn([peerId, 'MediaStream', this._mediaStream,
          'Not adding stream as peerconnection object does not exists']);
      }
    } else {
      log.warn([peerId, null, null, 'No media to send. Will be only receiving']);
    }
  } catch (error) {
    // Fix errors thrown like NS_ERROR_UNEXPECTED
    log.error([peerId, null, null, 'Failed adding local stream'], error);
  }
};

/**
 * Stops current MediaStream playback and streaming.
 * @method stopStream
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.stopStream = function () {
  if (this._mediaStream && this._mediaStream !== null) {
    this._mediaStream.stop();
  }

  // if previous line break, recheck again to trigger event
  if (this._mediaStream && this._mediaStream !== null) {
    this._trigger('mediaAccessStopped', false);
  }

  this._mediaStream = null;
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

  var audioTracks;
  var videoTracks;
  var a, v;

  // Loop and enable tracks accordingly (mediaStream)
  if (this._mediaStream && this._mediaStream !== null) {
    audioTracks = this._mediaStream.getAudioTracks();
    videoTracks = this._mediaStream.getVideoTracks();

    hasAudioTracks = audioTracks.length > 0 || hasAudioTracks;
    hasVideoTracks = videoTracks.length > 0 || hasVideoTracks;

    // loop audio tracks
    for (a = 0; a < audioTracks.length; a++) {
      audioTracks[a].enabled = this._mediaStreamsStatus.audioMuted !== true;
    }
    // loop video tracks
    for (v = 0; v < videoTracks.length; v++) {
      videoTracks[v].enabled = this._mediaStreamsStatus.videoMuted !== true;
    }
  }

  // Loop and enable tracks accordingly (mediaScreen)
  if (this._mediaScreen && this._mediaScreen !== null) {
    audioTracks = this._mediaScreen.getAudioTracks();
    videoTracks = this._mediaScreen.getVideoTracks();

    hasAudioTracks = hasAudioTracks || audioTracks.length > 0;
    hasVideoTracks = hasVideoTracks || videoTracks.length > 0;

    // loop audio tracks
    for (a = 0; a < audioTracks.length; a++) {
      audioTracks[a].enabled = this._mediaStreamsStatus.audioMuted !== true;
    }
    // loop video tracks
    for (v = 0; v < videoTracks.length; v++) {
      videoTracks[v].enabled = this._mediaStreamsStatus.videoMuted !== true;
    }
  }

  // Loop and enable tracks accordingly (mediaScreenClone)
  if (this._mediaScreenClone && this._mediaScreenClone !== null) {
    audioTracks = this._mediaScreenClone.getAudioTracks();

    hasAudioTracks = hasAudioTracks || audioTracks.length > 0;

    // loop audio tracks
    for (a = 0; a < audioTracks.length; a++) {
      audioTracks[a].enabled = this._mediaStreamsStatus.audioMuted !== true;
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
 * @param {Boolean} [options.audio.stereo] Enabled stereo or not
 * @param {Boolean} [options.audio.mute=false] If audio stream should be muted.
 * @param {Boolean|JSON} [options.video=false] This call requires video
 * @param {JSON} [options.video.resolution] [Rel: VIDEO_RESOLUTION]
 * @param {Number} [options.video.resolution.width] Video width
 * @param {Number} [options.video.resolution.height] Video height
 * @param {Number} [options.video.frameRate] Maximum frameRate of Video
 * @param {Boolean} [options.video.mute=false] If video stream should be muted.
 * @param {String} [options.bandwidth] Bandwidth settings
 * @param {String} [options.bandwidth.audio] Audio Bandwidth
 * @param {String} [options.bandwidth.video] Video Bandwidth
 * @param {String} [options.bandwidth.data] Data Bandwidth
 * @trigger mediaAccessRequired
 * @private
 * @component Stream
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
  self.stopStream();

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
    if (self._mediaStream && self._mediaStream !== null) {
      if (self._mediaStream && options.manualGetUserMedia) {
        return true;
      }

      // do the check
      if (requireAudio) {
        hasAudio = self._mediaStream.getAudioTracks().length > 0;
      }
      if (requireVideo) {
        hasVideo =  self._mediaStream.getVideoTracks().length > 0;
      }
      if (hasAudio && hasVideo) {
        return true;
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
 * @param {Boolean} [options.audio.stereo] Option to enable stereo
 *    during call.
 * @param {Boolean} [options.audio.mute=false] If audio stream should be muted.
 * @param {JSON|Boolean} [options.video=true] Option to allow video stream.
 * @param {JSON} [options.video.resolution] The resolution of video stream.
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Number} [options.video.resolution.width]
 *   The video stream resolution width (in px).
 * @param {Number} [options.video.resolution.height]
 *   The video stream resolution height (in px).
 * @param {Number} [options.video.frameRate]
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
 * @trigger mediaAccessSuccess, mediaAccessError, streamEnded
 * @component Stream
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
    self.stopStream();
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
 * @param {Boolean} [stream.audio.stereo] Option to enable stereo
 *    during call.
 * @param {Boolean} [stream.audio.mute=false] If send a new stream with audio muted.
 * @param {JSON|Boolean} [stream.video=false] Option to allow video stream.
 * @param {JSON} [stream.video.resolution] The resolution of video stream.
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Number} [stream.video.resolution.width]
 *   The video stream resolution width (in px).
 * @param {Number} [stream.video.resolution.height]
 *   The video stream resolution height (in px).
 * @param {Number} [stream.video.frameRate]
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
 *     audio: { mute: true },
 *     video: false
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
 * @component Stream
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
    self.stopStream();
    // send the stream
    if (self._mediaStream !== stream) {
      self._onUserMediaSuccess(stream);
    }

    self._mediaStreamsStatus.audioMuted = false;
    self._mediaStreamsStatus.videoMuted = false;

    self._streamSettings.audio = stream.getAudioTracks().length > 0;
    self._streamSettings.video = stream.getVideoTracks().length > 0;

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
      },false);
    }

    for (var peer in self._peerConnections) {
      if (self._peerConnections.hasOwnProperty(peer)) {
        self._restartPeerConnection(peer, true);
      }
    }

    self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);

  // Options object
  } else {

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
        },false);
      }

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
  }
};

/**
 * Mutes a Local MediaStreams.
 * @method muteStream
 * @param {Object|JSON} options The muted options.
 * @param {Boolean} [options.audioMuted=true] If send a new stream with audio muted.
 * @param {Boolean} [options.videoMuted=true] If send a new stream with video muted.
 * @example
 *   SkylinkDemo.muteStream({
 *     audioMuted: true,
 *     videoMuted: false
 *   });
 * @trigger peerRestart, peerUpdated, incomingStream
 * @component Stream
 * @for Skylink
 * @since 0.5.7
 */
Skylink.prototype.muteStream = function(options) {
  var self = this;

  if (typeof options !== 'object') {
    log.error('Provided settings is not an object');
    return;
  }

  if (!self._mediaStream || self._mediaStream === null) {
    log.warn('No streams are available to mute / unmute!');
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
    refetchAudio = options.audioMuted === false;
  }

  // update to mute status of video tracks
  if (!hasTracksOption.hasVideoTracks) {
    // do a refetch
    refetchVideo = options.videoMuted === false;
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
      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.MUTE_VIDEO,
        mid: self._user.sid,
        rid: self._room.id,
        muted: self._mediaStreamsStatus.videoMuted
      });
    }
    // update to mute status of audio tracks
    if (hasTracksOption.hasAudioTracks) {
      // send message
      // set timeout to do a wait interval of 1s
      setTimeout(function () {
        self._sendChannelMessage({
          type: self._SIG_MESSAGE_TYPE.MUTE_AUDIO,
          mid: self._user.sid,
          rid: self._room.id,
          muted: self._mediaStreamsStatus.audioMuted
        });
      }, 1050);
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
 * @component Stream
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.enableAudio = function() {
  this.muteStream({
    audioMuted: false
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
 * @component Stream
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.disableAudio = function() {
  this.muteStream({
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
 * @component Stream
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.enableVideo = function() {
  this.muteStream({
    videoMuted: false
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
 * @component Stream
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.disableVideo = function() {
  this.muteStream({
    videoMuted: true
  });
};

/**
 * Shares the current screen with users.
 * - If multi-stream is not supported, you will not be able to use it.
 * - You will require our own Temasys Skylink extension to do screensharing.
 *   Currently, opera does not support this feature.
 * @method shareScreen
 * @param {Function} [callback] The callback fired after media was successfully accessed.
 *   Default signature: function(error object, success object)
 * @example
 *   // Example 1: Share the screen
 *   SkylinkDemo.shareScreen();
 *
 *   // Example 2: Share screen with callback when screen is ready and shared
 *   SkylinkDemo.shareScreen(function(error,success){
 *      if (error){
 *        console.log(error);
 *      }
 *      else{
 *        console.log(success);
 *     }
 *   });
 * @trigger mediaAccessSuccess, mediaAccessError, incomingStream
 * @component Stream
 * @for Skylink
 * @since 0.5.11
 */
Skylink.prototype.shareScreen = function (callback) {
  var self = this;

  var constraints = {
    video: {
      mediaSource: 'window'
    },
    audio: false
  };

  if (window.webrtcDetectedBrowser === 'firefox') {
    constraints.audio = true;
  }

  try {
    window.getUserMedia(constraints, function (stream) {

      if (window.webrtcDetectedBrowser !== 'firefox') {
        window.getUserMedia({
          audio: true
        }, function (audioStream) {
          try {

            self._mediaScreenClone = audioStream;
            self._mediaScreen.addTrack(self._mediaScreenClone.getAudioTracks()[0]);

          } catch (error) {
            console.warn('This screensharing session will not support audio streaming', error);
          }

          self._onUserMediaSuccess(stream, true);

        }, function (error) {
          console.warn('This screensharing session will not support audio streaming', error);

          self._onUserMediaSuccess(stream, true);
        });
      } else {
        self._onUserMediaSuccess(stream, true);
      }

      self._wait(function () {
        if (self._inRoom) {
          self.refreshConnection();
        } else {
          if (typeof callback === 'function') {
            callback(null, stream);
          }
        }
      }, function () {
        return self._mediaScreen && self._mediaScreen !== null;
      });

    }, function (error) {
      self._onUserMediaError(error, true);

      if (typeof callback === 'function') {
        callback(error, null);
      }
    });

  } catch (error) {
    self._onUserMediaError(error, true);

    if (typeof callback === 'function') {
      callback(error, null);
    }
  }
};

/**
 * Stops screensharing playback and streaming.
 * @method stopScreen
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.stopScreen = function () {
  var endSession = false;

  if (this._mediaScreen && this._mediaScreen !== null) {
    endSession = !!this._mediaScreen.endSession;
    this._mediaScreen.stop();
  }

  if (this._mediaScreenClone && this._mediaScreenClone !== null) {
    this._mediaScreenClone.stop();
  }

  if (this._mediaScreen && this._mediaScreen !== null) {
    this._trigger('mediaAccessStopped', true);
    this._mediaScreen = null;
    this._mediaScreenClone = null;

    if (!endSession) {
      this.refreshConnection();
    }
  }
};