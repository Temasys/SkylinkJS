/**
 * These are the list of available video codecs settings that Skylink would use
 *   when streaming video stream with Peers.
 * - The video codec would be used if the self and Peer's browser supports the selected codec.
 * - This would default to the browser selected codec. In most cases, option <code>VP8</code> is
 *   used by default.
 * @attribute VIDEO_CODEC
 * @param {String} AUTO <small><b>DEFAULT</b> | Value <code>"auto"</code></small>
 *   The option to let Skylink use any video codec selected by the browser generated session description.
 * @param {String} VP8 <small>Value <code>"VP8"</code></small>
 *   The option to let Skylink use the [VP8](https://en.wikipedia.org/wiki/VP8) codec.<br>
 *   This is the common and mandantory video codec used by most browsers.
 * @param {String} H264 <small>Value <code>"H264"</code></small>
 *   The option to let Skylink use the [H264](https://en.wikipedia.org/wiki/H.264/MPEG-4_AVC) codec.<br>
 *   This only works if the browser supports the H264 video codec.
 * @type JSON
 * @readOnly
 * @component Stream
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.VIDEO_CODEC = {
  AUTO: 'auto',
  VP8: 'VP8',
  H264: 'H264'
};

/**
 * These are the list of available audio codecs settings that Skylink would use
 *   when streaming audio stream with Peers.
 * - The audio codec would be used if the self and Peer's browser supports the selected codec.
 * - This would default to the browser selected codec. In most cases, option <code>OPUS</code> is
 *   used by default.
 * @attribute AUDIO_CODEC
 * @param {String} AUTO <small><b>DEFAULT</b> | Value <code>"auto"</code></small>
 *   The option to let Skylink use any audio codec selected by the browser generated session description.
 * @param {String} OPUS <small>Value <code>"opus"</code></small>
 *   The option to let Skylink use the [OPUS](https://en.wikipedia.org/wiki/Opus_(audio_format)) codec.<br>
 *   This is the common and mandantory audio codec used.
 * @param {String} ISAC <small>Value <code>"ISAC"</code></small>
 *   The option to let Skylink use the [iSAC](https://en.wikipedia.org/wiki/Internet_Speech_Audio_Codec).<br>
 *   This only works if the browser supports the iSAC video codec.
 * @type JSON
 * @readOnly
 * @component Stream
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.AUDIO_CODEC = {
  AUTO: 'auto',
  ISAC: 'ISAC',
  OPUS: 'opus'
};

/**
 * These are the list of suggested video resolutions that Skylink should configure
 *   when retrieving self user media video stream.
 * - Setting the resolution may not force set the resolution provided as it
 *   depends on the how the browser handles the resolution.
 * - It's recommended to use video resolution option to maximum <code>FHD</code>, as the other
 *   resolution options may be unrealistic and create performance issues. However, we provide them
 *   to allow developers to test with the browser capability, but do use it at your own risk.
 * - The higher the resolution, the more CPU usage might be used, hence it's recommended to
 *   use the default option <code>VGA</code>.
 * - This follows the
 *   [Wikipedia Graphics display resolution page](https://en.wikipedia.org/wiki/Graphics_display_resolution#Video_Graphics_Array)
 * @param {JSON} QQVGA <small>Value <code>{ width: 160, height: 120 }</code> | Aspect Ratio <code>4:3</code></small>
 *   The option to use QQVGA resolution.
 * @param {JSON} HQVGA <small>Value <code>{ width: 240, height: 160 }</code> | Aspect Ratio <code>3:2</code></small>
 *   The option to use HQVGA resolution.
 * @param {JSON} QVGA <small>Value <code>{ width: 320, height: 240 }</code> | Aspect Ratio <code>4:3</code></small>
 *   The option to use QVGA resolution.
 * @param {JSON} WQVGA <small>Value <code>{ width: 384, height: 240 }</code> | Aspect Ratio <code>16:10</code></small>
 *   The option to use WQVGA resolution.
 * @param {JSON} HVGA <small>Value <code>{ width: 480, height: 320 }</code> | Aspect Ratio <code>3:2</code></small>
 *   The option to use HVGA resolution.
 * @param {JSON} VGA <small><b>DEFAULT</b> | Value <code>{ width: 640, height: 480 }</code> | Aspect Ratio <code>4:3</code></small>
 *   The option to use VGA resolution.
 * @param {JSON} WVGA <small>Value <code>{ width: 768, height: 480 }</code> | Aspect Ratio <code>16:10</code></small>
 *   The option to use WVGA resolution.
 * @param {JSON} FWVGA <small>Value <code>{ width: 854, height: 480 }</code> | Aspect Ratio <code>16:9</code></small>
 *   The option to use FWVGA resolution.
 * @param {JSON} SVGA <small>Value <code>{ width: 800, height: 600 }</code> | Aspect Ratio <code>4:3</code></small>
 *   The option to use SVGA resolution.
 * @param {JSON} DVGA <small>Value <code>{ width: 960, height: 640 }</code> | Aspect Ratio <code>3:2</code></small>
 *   The option to use DVGA resolution.
 * @param {JSON} WSVGA <small>Value <code>{ width: 1024, height: 576 }</code> | Aspect Ratio <code>16:9</code></small>
 *   The option to use WSVGA resolution.
 * @param {JSON} HD <small>Value <code>{ width: 1280, height: 720 }</code> | Aspect Ratio <code>16:9</code></small>
 *   The option to use HD resolution.
 * @param {JSON} HDPLUS <small>Value <code>{ width: 1600, height: 900 }</code> | Aspect Ratio <code>16:9</code></small>
 *   The option to use HDPLUS resolution.
 * @param {JSON} FHD <small>Value <code>{ width: 1920, height: 1080 }</code> | Aspect Ratio <code>16:9</code></small>
 *   The option to use FHD resolution.
 * @param {JSON} QHD <small>Value <code>{ width: 2560, height: 1440 }</code> | Aspect Ratio <code>16:9</code></small>
 *   The option to use QHD resolution.
 * @param {JSON} WQXGAPLUS <small>Value <code>{ width: 3200, height: 1800 }</code> | Aspect Ratio <code>16:9</code></small>
 *   The option to use WQXGAPLUS resolution.
 * @param {JSON} UHD <small>Value <code>{ width: 3840, height: 2160 }</code> | Aspect Ratio <code>16:9</code></small>
 *   The option to use UHD resolution.
 * @param {JSON} UHDPLUS <small>Value <code>{ width: 5120, height: 2880 }</code> | Aspect Ratio <code>16:9</code></small>
 *   The option to use UHDPLUS resolution.
 * @param {JSON} FUHD <small>Value <code>{ width: 7680, height: 4320 }</code> | Aspect Ratio <code>16:9</code></small>
 *   The option to use FUHD resolution.
 * @param {JSON} QUHD <small>Value <code>{ width: 15360, height: 8640 }</code> | Aspect Ratio <code>16:9</code></small>
 *   The option to use QUHD resolution.
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
  QVGA: { width: 320, height: 240, aspectRatio: '4:3' },
  WQVGA: { width: 384, height: 240, aspectRatio: '16:10' },
  HVGA: { width: 480, height: 320, aspectRatio: '3:2' },
  VGA: { width: 640, height: 480, aspectRatio: '4:3' },
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
 * Stores the preferred sending Peer connection streaming audio codec.
 * @attribute _selectedAudioCodec
 * @type String
 * @default "auto"
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._selectedAudioCodec = 'auto';

/**
 * Stores the preferred sending Peer connection streaming video codec.
 * @attribute _selectedVideoCodec
 * @type String
 * @default "auto"
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._selectedVideoCodec = 'auto';

/**
 * Stores the User's <code>getUserMedia()</code> Stream.
 * @attribute _mediaStream
 * @type MediaStream
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._mediaStream = null;

/**
 * Stores the User's <code>shareScreen()</code> Stream.
 * @attribute _mediaScreen
 * @type MediaStream
 * @private
 * @for Skylink
 * @since 0.6.0
 */
Skylink.prototype._mediaScreen = null;

/**
 * Stores the User's <code>shareScreen()</code> Stream clone for storing the video track.
 * Currently Chrome doesn't give us the audio track in the stream we receive, so we have to
 *   make another getUserMedia() call to retrieve the audio track only.
 * @attribute _mediaScreenClone
 * @type MediaStream
 * @private
 * @for Skylink
 * @since 0.6.0
 */
Skylink.prototype._mediaScreenClone = null;

/**
 * Stores the default Stream settings for <code>getUserMedia()</code> method.
 * @attribute _defaultStreamSettings
 * @param {JSON} audio The default Stream audio settings.
 * @param {JSON} video The default Stream video settings.
 * @type JSON
 * @private
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
    //audio: 50,
    //video: 256,
    //data: 1638400
  }
};

/**
 * Stores the <code>getUserMedia()</code> Stream settings.
 * @attribute _streamSettings
 * @param {JSON} audio The Stream audio settings.
 * @param {JSON} video The Stream video settings.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._streamSettings = {};

/**
 * Stores the <code>shareScreen()</code> Stream settings.
 * @attribute _screenSharingStreamSettings
 * @param {JSON} audio The Stream audio settings.
 * @param {JSON} video The Stream video settings.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._screenSharingStreamSettings = {
  video: true
};

/**
 * Stores the flag that indicates if screensharing is supported in the browser.
 * @attribute _screenSharingAvailable
 * @type Boolean
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._screenSharingAvailable = false;

/**
 * Stores the native <code>navigator.getUserMedia()</code> API constraints for
 *   <code>getUserMedia()</code> retrieval of Stream.
 * @attribute _getUserMediaSettings
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._getUserMediaSettings = {};

/**
 * Stores the User's Stream (both <code>getUserMedia()</code> and <code>shareScreen()</code>) muted status.
 * @attribute _mediaStreamsStatus
 * @param {Boolean} audioMuted The flag that indicates if audio is muted or not available.
 * @param {Boolean} videoMuted The flag that indicates if video is muted or not available.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._mediaStreamsStatus = {};

/**
 * Stores the flag that indicates if <code>getUserMedia()</code> should fallback to retrieve
 *   audio only Stream after retrieval of audio and video Stream had failed.
 * @attribute _audioFallback
 * @type Boolean
 * @default false
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._audioFallback = false;

/**
 * Gets self user media Stream object to attach to Skylink.
 * Do not invoke this function when user has already joined a room as
 *   this may affect any currently attached stream. You may use
 *  {{#crossLink "Skylink/sendStream:method"}}sendStream(){{/crossLink}}
 *  instead if self is already in the room, and allows application to
 *  attach application own MediaStream object to Skylink.
 * @method getUserMedia
 * @param {JSON} [options] The self Stream streaming settings for the new Stream
 *   object attached to Skylink. If this parameter is not provided, the
 *   options value would be <code>{ audio: true, video: true }</code>.
 * @param {Boolean|JSON} [options.audio=false] The self Stream streaming audio settings.
 *   If <code>false</code>, it means that audio streaming is disabled in
 *   the self Stream. If this option is set to <code>true</code> or is defined with
 *   settings, {{#crossLink "Skylink/getUserMedia:method"}}getUserMedia(){{/crossLink}}
 *   will be invoked. Self will not connect to the room unless the Stream audio
 *   user media access is given.
 * @param {Boolean} [options.audio.stereo=false] The flag that indicates if
 *   stereo should be enabled in self connection Stream
 *   audio streaming.
 * @param {Boolean} [options.audio.mute=false] The flag that
 *   indicates if the self Stream object audio streaming is muted.
 * @param {Array} [options.audio.optional] The optional constraints for audio streaming
 *   in self user media Stream object. This follows the <code>optional</code>
 *   setting in the <code>MediaStreamConstraints</code> when <code>getUserMedia()</code> is invoked.
 *   Tampering this may cause errors in retrieval of self user media Stream object.
 *   Refer to this [site for more reference](http://www.sitepoint.com/introduction-getusermedia-api/).
 * @param {Boolean|JSON} [options.video=false] The self Stream streaming video settings.
 *   If <code>false</code>, it means that video streaming is disabled in
 *   the self Stream. If this option is set to <code>true</code> or is defined with
 *   settings, {{#crossLink "Skylink/getUserMedia:method"}}getUserMedia(){{/crossLink}}
 *   will be invoked. Self will not connect to the room unless the Stream video
 *   user media access is given.
 * @param {Boolean} [options.video.mute=false] The flag that
 *   indicates if the self Stream object video streaming is muted.
 * @param {JSON} [options.video.resolution] The self Stream streaming video
 *   resolution settings. Setting the resolution may
 *   not force set the resolution provided as it depends on the how the
 *   browser handles the resolution. [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Number} [options.video.resolution.width] The self
 *   Stream streaming video resolution width.
 *   <i>This sets the <code>maxWidth</code> of the <code>video</code>
 *   constraints passed in <code>getUserMedia()</code></i>.
 * @param {Number} [options.video.resolution.height] The self
 *   Stream streaming video resolution height.
 *   <i>This sets the <code>maxHeight</code> of the <code>video</code>
 *   constraints passed in <code>getUserMedia()</code></i>.
 * @param {Number} [options.video.frameRate=50] The self
 *   Stream streaming video maximum frameRate.
 *   <i>This sets the <code>maxFramerate</code> of the <code>video</code>
 *   constraints passed in <code>getUserMedia()</code></i>.
 * @param {Array} [options.video.optional] The optional constraints for video streaming
 *   in self user media Stream object. This follows the <code>optional</code>
 *   setting in the <code>MediaStreamConstraints</code> when <code>getUserMedia()</code> is invoked.
 *   Tampering this may cause errors in retrieval of self user media Stream object.
 *   Refer to this [site for more reference](http://www.sitepoint.com/introduction-getusermedia-api/).
 * @param {Function} [callback] The callback fired after Skylink has gained
 *   access to self media stream and attached it successfully with the provided
 *   media settings or have met with an exception.
 *   The callback signature is <code>function (error, success)</code>.
 * @param {Object} callback.error The error object received in the callback.
 *   This is the exception thrown that caused the failure for getting self user media.
 *   If received as <code>null</code>, it means that there is no errors.
 * @param {Object} callback.success The success object received in the callback.
 *   The self user media [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_API)
 *   object. To display the MediaStream object to a <code>video</code> or <code>audio</code>, simply invoke:<br>
 *   <code>attachMediaStream(domElement, stream);</code>.
 *   If received as <code>null</code>, it means that there are errors.
 * @example
 *   // Default is to get both audio and video
 *   // Example 1: Get both audio and video by default.
 *   SkylinkDemo.getUserMedia();
 *
 *   // Example 2: Get the audio stream only
 *   SkylinkDemo.getUserMedia({
 *     video: false,
 *     audio: true
 *   });
 *
 *   // Example 3: Set the stream settings for the audio and video
 *   SkylinkDemo.getUserMedia({
 *     video: {
 *        resolution: SkylinkDemo.VIDEO_RESOLUTION.HD,
 *        frameRate: 50
 *      },
 *     audio: {
 *       stereo: true
 *     }
 *   });
 *
 *   // Example 4: Get user media with callback
 *   SkylinkDemo.getUserMedia({
 *     video: false,
 *     audio: true
 *   },function(error,success){
 *      if (error){
 *        console.log(error);
 *      }
 *      else{
 *        console.log(success);
 *     }
 *   });
 * @trigger mediaAccessSuccess, mediaAccessError
 * @component Stream
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.getUserMedia = function(options,callback) {
  var self = this;

  var errorMsg; // j-shint rocks

  if (typeof options === 'function'){
    callback = options;
    options = {
      audio: true,
      video: true
    };
  }
  else if (typeof options !== 'object' || options === null) {
    if (typeof options === 'undefined') {
      options = {
        audio: true,
        video: true
      };
    } else {
      errorMsg = 'Please provide a valid options';
      log.error(errorMsg, options);
      if (typeof callback === 'function') {
        callback(new Error(errorMsg), null);
      }
      return;
    }
  }
  else if (!options.audio && !options.video) {
    errorMsg = 'Please select audio or video';
    log.error(errorMsg, options);
    if (typeof callback === 'function') {
      callback(new Error(errorMsg), null);
    }
    return;
  }

  /*if (window.location.protocol !== 'https:' && window.webrtcDetectedBrowser === 'chrome' &&
    window.webrtcDetectedVersion > 46) {
    errorMsg = 'getUserMedia() has to be called in https:// application';
    log.error(errorMsg, options);
    if (typeof callback === 'function') {
      callback(new Error(errorMsg), null);
    }
    return;
  }*/

  // parse stream settings
  self._parseMediaStreamSettings(options);

  // if audio and video is false, do not call getUserMedia
  if (!(options.audio === false && options.video === false)) {
    // clear previous mediastreams
    self.stopStream();

    setTimeout(function () {
      try {
        if (typeof callback === 'function'){
          var mediaAccessErrorFn = function (error) {
            callback(error, null);
            self.off('mediaAccessSuccess', mediaAccessSuccessFn);
          };

          var mediaAccessSuccessFn = function (stream) {
            callback(null, stream);
            self.off('mediaAccessError', mediaAccessErrorFn);
          };

          self.once('mediaAccessError', mediaAccessErrorFn);
          self.once('mediaAccessSuccess', mediaAccessSuccessFn);
        }

        window.getUserMedia(self._getUserMediaSettings, function (stream) {
          var isSuccess = false;
          var requireAudio = !!options.audio;
          var requireVideo = !!options.video;
          var hasAudio = !requireAudio;
          var hasVideo = !requireVideo;

          // for now we require one MediaStream with both audio and video
          // due to firefox non-supported audio or video
          if (stream && stream !== null) {
            var notSameTracksError = new Error(
              'Expected audio tracks length with ' +
              (requireAudio ? '1' : '0') + ' and video tracks length with ' +
              (requireVideo ? '1' : '0') + ' but received audio tracks length ' +
              'with ' + stream.getAudioTracks().length + ' and video ' +
              'tracks length with ' + stream.getVideoTracks().length);

            // do the check
            if (requireAudio) {
              hasAudio = stream.getAudioTracks().length > 0;
            }
            if (requireVideo) {
              hasVideo =  stream.getVideoTracks().length > 0;

              /*if (self._audioFallback && !hasVideo) {
                hasVideo = true; // to trick isSuccess to be true
                self._trigger('mediaAccessFallback', notSameTracksError);
              }*/
            }
            if (hasAudio && hasVideo) {
              isSuccess = true;
            }

            if (!isSuccess) {
              self._trigger('mediaAccessFallback', {
                error: notSameTracksError,
                diff: {
                  video: { expected: requireAudio ? 1 : 0, received: stream.getVideoTracks().length },
                  audio: { expected: requireVideo ? 1 : 0, received: stream.getAudioTracks().length }
                }
              }, 1, false, false);
            }

            self._onUserMediaSuccess(stream);
          }
        }, function (error) {
          self._onUserMediaError(error, false, true);
        });
      } catch (error) {
        self._onUserMediaError(error, false, true);
      }
    }, window.webrtcDetectedBrowser === 'firefox' ? 500 : 1);
  } else {
    log.warn([null, 'MediaStream', null, 'Not retrieving stream']);
  }
};

/**
 * Replaces the currently attached Stream object in Skylink and refreshes all
 *   connection with Peer connections to send the updated Stream object.
 * The application may provide their own MediaStream object to send to
 *   all PeerConnections connection.
 * Reference {{#crossLink "Skylink/refreshConnection:method"}}refreshConnection(){{/crossLink}}
 *    on the events triggered and restart mechanism.
 * @method sendStream
 * @param {Object|JSON} options The self Stream streaming settings for the new Stream
 *   object to replace the current Stream object attached to Skylink.
 *   If this parameter is provided as a MediaStream object, the
 *   MediaStream object settings for <code>mediaStatus</code> would be
 *   detected as unmuted by default.
 * @param {Boolean|JSON} [options.audio=false] The self Stream streaming audio settings.
 *   If <code>false</code>, it means that audio streaming is disabled in
 *   the self Stream. If this option is set to <code>true</code> or is defined with
 *   settings, {{#crossLink "Skylink/getUserMedia:method"}}getUserMedia(){{/crossLink}}
 *   will be invoked. Self will not connect to the room unless the Stream audio
 *   user media access is given.
 * @param {Boolean} [options.audio.stereo=false] The flag that indicates if
 *   stereo should be enabled in self connection Stream
 *   audio streaming.
 * @param {Boolean} [options.audio.mute=false] The flag that
 *   indicates if the self Stream object audio streaming is muted.
 * @param {Boolean|JSON} [options.video=false] The self Stream streaming video settings.
 *   If <code>false</code>, it means that video streaming is disabled in
 *   the self Stream. If this option is set to <code>true</code> or is defined with
 *   settings, {{#crossLink "Skylink/getUserMedia:method"}}getUserMedia(){{/crossLink}}
 *   will be invoked. Self will not connect to the room unless the Stream video
 *   user media access is given.
 * @param {Array} [options.audio.optional] The optional constraints for audio streaming
 *   in self user media Stream object. This follows the <code>optional</code>
 *   setting in the <code>MediaStreamConstraints</code> when <code>getUserMedia()</code> is invoked.
 *   Tampering this may cause errors in retrieval of self user media Stream object.
 *   Refer to this [site for more reference](http://www.sitepoint.com/introduction-getusermedia-api/).
 * @param {Boolean} [options.video.mute=false] The flag that
 *   indicates if the self Stream object video streaming is muted.
 * @param {JSON} [options.video.resolution] The self Stream streaming video
 *   resolution settings. Setting the resolution may
 *   not force set the resolution provided as it depends on the how the
 *   browser handles the resolution. [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Number} [options.video.resolution.width] The self
 *   Stream streaming video resolution width.
 * @param {Number} [options.video.resolution.height] The self
 *   Stream streaming video resolution height.
 * @param {Number} [options.video.frameRate=50] The self
 *   Stream streaming video maximum frameRate.
 * @param {Array} [options.video.optional] The optional constraints for video streaming
 *   in self user media Stream object. This follows the <code>optional</code>
 *   setting in the <code>MediaStreamConstraints</code> when <code>getUserMedia()</code> is invoked.
 *   Tampering this may cause errors in retrieval of self user media Stream object.
 *   Refer to this [site for more reference](http://www.sitepoint.com/introduction-getusermedia-api/).
 * @param {Function} [callback] The callback fired after Skylink has replaced
 *   the current Stream object successfully with the provided
 *   media settings / MediaStream object or have met with an exception.
 *   The callback signature is <code>function (error, success)</code>.
 * @param {Object} callback.error The error object received in the callback.
 *   This is the exception thrown that caused the failure for replacing the current
 *   Stream object. If received as <code>null</code>, it means that there is no errors.
 * @param {Object} callback.success The success object received in the callback.
 *   The self user media [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_API)
 *   object. To display the MediaStream object to a <code>video</code> or <code>audio</code>, simply invoke:<br>
 *   <code>attachMediaStream(domElement, stream);</code>.
 *   If received as <code>null</code>, it means that there are errors.
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
 * @trigger peerRestart, serverPeerRestart, incomingStream
 * @component Stream
 * @for Skylink
 * @since 0.5.6
 */

Skylink.prototype.sendStream = function(stream, callback) {
  var self = this;
  var restartCount = 0;
  var peerCount = Object.keys(self._peerConnections).length;

  if (typeof stream !== 'object' || stream === null) {
    var error = 'Provided stream settings is invalid';
    log.error(error, stream);
    if (typeof callback === 'function'){
      callback(new Error(error),null);
    }
    return;
  }

  var hasNoPeers = Object.keys(self._peerConnections).length === 0;

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

    self._streamSettings.audio = stream.getAudioTracks().length > 0;
    self._streamSettings.video = stream.getVideoTracks().length > 0;

    //self._mediaStreamsStatus.audioMuted = self._streamSettings.audio === false;
    //self._mediaStreamsStatus.videoMuted = self._streamSettings.video === false;

    if (self._inRoom) {
      self.once('mediaAccessSuccess', function (stream) {
        if (self._hasMCU) {
          self._restartMCUConnection();
        } else {
          self._trigger('incomingStream', self._user.sid, self._mediaStream,
            true, self.getPeerInfo(), false);
          for (var peer in self._peerConnections) {
            if (self._peerConnections.hasOwnProperty(peer)) {
              self._restartPeerConnection(peer, true, false, null, true);
            }
          }
        }

        self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
      });
    }

    // send the stream
    if (self._mediaStream !== stream) {
      self._onUserMediaSuccess(stream);
    }

    // The callback is provided and has peers, so require to wait for restart
    if (typeof callback === 'function' && !hasNoPeers) {
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

    // The callback is provided but there is no peers, so automatically invoke the callback
    if (typeof callback === 'function' && hasNoPeers) {
      callback(null, self._mediaStream);
    }

  // Options object
  } else {
    // The callback is provided but there is peers, so require to wait for restart
    if (typeof callback === 'function' && !hasNoPeers) {
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

    if (self._inRoom) {
      self.once('mediaAccessSuccess', function (stream) {
        if (self._hasMCU) {
          self._restartMCUConnection();
        } else {
          self._trigger('incomingStream', self._user.sid, self._mediaStream,
            true, self.getPeerInfo(), false);
          for (var peer in self._peerConnections) {
            if (self._peerConnections.hasOwnProperty(peer)) {
              self._restartPeerConnection(peer, true, false, null, true);
            }
          }
        }

        self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
      });
    }

    // get the mediastream and then wait for it to be retrieved before sending
    self._waitForLocalMediaStream(function (error) {
      if (!error) {
        // The callback is provided but there is not peers, so automatically invoke the callback
        if (typeof callback === 'function' && hasNoPeers) {
          callback(null, self._mediaStream);
        }
      } else {
        callback(error, null);
      }
    }, stream);
  }
};

/**
 * Stops self user media Stream object attached to Skylink.
 * @method stopStream
 * @trigger mediaAccessStopped, streamEnded
 * @example
 *   SkylinkDemo.stopStream();
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.stopStream = function () {
  // if previous line break, recheck again to trigger event
  this._stopLocalMediaStreams({
    userMedia: true
  });
};

/**
 * Mutes the currently attached Stream object in Skylink.
 * @method muteStream
 * @param {JSON} options The self Stream streaming muted settings.
 * @param {Boolean} [options.audioMuted=true]  The flag that
 *   indicates if self connection Stream object audio streaming is muted. If
 *   there is no audio streaming enabled for self connection, by default,
 *   it is set to <code>true</code>.
 * @param {Boolean} [options.videoMuted=true] The flag that
 *   indicates if self connection Stream object video streaming is muted. If
 *   there is no video streaming enabled for self connection, by default,
 *   it is set to <code>true</code>.
 * @example
 *   SkylinkDemo.muteStream({
 *     audioMuted: true,
 *     videoMuted: false
 *   });
 * @trigger streamMuted, peerUpdated
 * @component Stream
 * @for Skylink
 * @since 0.5.7
 */
Skylink.prototype.muteStream = function(options) {
  var self = this;
  var hasAudioError = false;
  var hasVideoError = false;

  if (typeof options !== 'object') {
    log.error('Provided settings is not an object');
    return;
  }

  if ((!self._mediaStream || self._mediaStream === null) &&
    (!self._mediaScreen || self._mediaScreen === null)) {
    log.warn('No streams are available to mute / unmute!');
    return;
  }

  // set the muted status
  if (typeof options.audioMuted === 'boolean') {
    if (self._streamSettings.audio === false) {
      log.error('No audio available to mute / unmute');
      hasAudioError = true;
    } else {
      if (options.audioMuted) {
        self._mediaStreamsStatus.audioMuted = true;
      } else {
        self._mediaStreamsStatus.audioMuted = false;
      }
    }
  }
  if (typeof options.videoMuted === 'boolean') {
    if (self._streamSettings.video === false) {
      log.error('No video available to mute / unmute');
      hasVideoError = true;
    } else {
      if (options.videoMuted) {
        self._mediaStreamsStatus.videoMuted = true;
      } else {
        self._mediaStreamsStatus.videoMuted = false;
      }
    }
  }

  var hasTracksOption = self._muteLocalMediaStreams();

  if (self._inRoom) {
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

    if (!hasAudioError || !hasVideoError) {
      self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
    }
  }

  if (!hasAudioError || !hasVideoError) {
    self._trigger('streamMuted', self._user.sid || null, self.getPeerInfo(), true,
      !!self._mediaScreen && self._mediaScreen !== null);
  }
};

/**
 * Unmutes the currently attached Stream object audio stream.
 * @method enableAudio
 * @trigger peerUpdated
 * @deprecated Use .muteStream()
 * @example
 *   SkylinkDemo.enableAudio();
 * @trigger streamMuted, peerUpdated
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
 * Mutes the currently attached Stream object audio stream.
 * @method disableAudio
 * @deprecated Use .muteStream()
 * @example
 *   SkylinkDemo.disableAudio();
 * @trigger peerUpdated
 * @trigger streamMuted, peerUpdated
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
 * Unmutes the currently attached Stream object video stream.
 * @method enableVideo
 * @deprecated Use .muteStream()
 * @example
 *   SkylinkDemo.enableVideo();
 * @trigger peerUpdated
 * @trigger streamMuted, peerUpdated
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
 * Mutes the currently attached Stream object video stream.
 * @method disableVideo
 * @depcreated Use .muteStream()
 * @example
 *   SkylinkDemo.disableVideo();
 * @trigger streamMuted, peerUpdated
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
 * Shares the current screen with Peer connections and will refresh all
 *    Peer connections to send the screensharing Stream object with
 *    <code>HTTPS</code> protocol accessing application.
 * Reference {{#crossLink "Skylink/refreshConnection:method"}}refreshConnection(){{/crossLink}}
 *    on the events triggered and restart mechanism.
 * This will require our own Temasys Skylink extension to do screensharing.
 * For screensharing feature in IE / Safari with our Temasys Plugin, please
 *   [contact us](https://www.temasys.com.sg/contact-us).
 * Currently, Opera does not support screensharing feature.
 * This does not replace the currently attached user media Stream object in Skylink.
 * @method shareScreen
 * @param {JSON} [enableAudio=false] The flag that indicates if self screensharing
 *   Stream streaming should have audio. If
 *   <code>false</code>, it means that audio streaming is disabled in
 *   the remote Stream of self connection.
 * @param {Function} [callback] The callback fired after Skylink has shared
 *   the screen successfully or have met with an exception.
 *   The callback signature is <code>function (error, success)</code>.
 * @param {Object} callback.error The error object received in the callback.
 *   This is the exception thrown that caused the failure for sharing the screen.
 *   If received as <code>null</code>, it means that there is no errors.
 * @param {Object} callback.success The success object received in the callback.
 *   The self screensharing [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_API)
 *   object. To display the MediaStream object to a <code>video</code> or <code>audio</code>, simply invoke:<br>
 *   <code>attachMediaStream(domElement, stream);</code>.
 *   If received as <code>null</code>, it means that there are errors.
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
 * @trigger mediaAccessSuccess, mediaAccessError, incomingStream, peerRestart, serverPeerRestart, peerUpdated
 * @component Stream
 * @for Skylink
 * @since 0.6.0
 */
Skylink.prototype.shareScreen = function (enableAudio, callback) {
  var self = this;
  var hasAudio = false;

  var settings = {
    video: {
      mediaSource: 'window'
    }
  };

  if (typeof enableAudio === 'function') {
    callback = enableAudio;
    enableAudio = true;
  }

  if (typeof enableAudio !== 'boolean') {
    enableAudio = true;
  }

  var triggerSuccessFn = function (sStream) {
    if (hasAudio) {
      if (typeof self._streamSettings.audio === 'object') {
        self._screenSharingStreamSettings.audio = {
          stereo: !!self._streamSettings.audio.stereo
        };
      } else {
        self._screenSharingStreamSettings.audio = true;
      }
    } else {
      log.warn('This screensharing session will not support audio streaming');
      self._screenSharingStreamSettings.audio = false;
    }

    var requireAudio = enableAudio === true;
    var requireVideo = true;
    var checkAudio = !requireAudio;
    var checkVideo = !requireVideo;
    var notSameTracksError = new Error(
      'Expected audio tracks length with ' +
      (requireAudio ? '1' : '0') + ' and video tracks length with ' +
      (requireVideo ? '1' : '0') + ' but received audio tracks length ' +
      'with ' + sStream.getAudioTracks().length + ' and video ' +
      'tracks length with ' + sStream.getVideoTracks().length);

    // do the check
    if (requireAudio) {
      checkAudio = sStream.getAudioTracks().length > 0;
    }
    if (requireVideo) {
      checkVideo =  sStream.getVideoTracks().length > 0;
    }

    if (checkVideo) {
      self._screenSharingStreamSettings.video = true;

      // no audio but has video for screensharing
      if (!checkAudio) {
        self._trigger('mediaAccessFallback', {
          error: notSameTracksError,
          diff: {
            video: { expected: 1, received: sStream.getVideoTracks().length },
            audio: { expected: requireAudio ? 1 : 0, received: sStream.getAudioTracks().length }
          }
        }, 1, true, false);
        self._screenSharingStreamSettings.audio = false;
      }

      self._onUserMediaSuccess(sStream, true);

    } else {
      self._onUserMediaError(notSameTracksError, true);
    }

    self._timestamp.screen = true;
  };

  if (window.webrtcDetectedBrowser === 'firefox') {
    settings.audio = !!enableAudio;
  }

  var throttleFn = function (fn, wait) {
    if (!self._timestamp.func){
      //First time run, need to force timestamp to skip condition
      self._timestamp.func = self._timestamp.now - wait;
    }
    var now = Date.now();

    if (!self._timestamp.screen) {
      if (now - self._timestamp.func < wait) {
        return;
      }
    }
    fn();
    self._timestamp.screen = false;
    self._timestamp.func = now;
  };

  var toShareScreen = function(){
    try {
      window.getUserMedia(settings, function (stream) {
        self.once('mediaAccessSuccess', function (stream) {
          if (self._inRoom) {
            if (self._hasMCU) {
              self._restartMCUConnection();
            } else {
              self._trigger('incomingStream', self._user.sid, stream,
                true, self.getPeerInfo(), false);
              for (var peer in self._peerConnections) {
                if (self._peerConnections.hasOwnProperty(peer)) {
                  self._restartPeerConnection(peer, true, false, null, true);
                }
              }
            }
          } else if (typeof callback === 'function') {
            callback(null, stream);
          }
        }, function (stream, isScreenSharing) {
          return isScreenSharing;
        });

        if (window.webrtcDetectedBrowser !== 'firefox' && enableAudio) {
          window.getUserMedia({
            audio: true
          }, function (audioStream) {
            try {
              audioStream.addTrack(stream.getVideoTracks()[0]);
              self._mediaScreenClone = stream;
              hasAudio = true;
              triggerSuccessFn(audioStream, true);

            } catch (error) {
              log.error('Failed retrieving audio stream for screensharing stream', error);
              triggerSuccessFn(stream, true);
            }

          }, function (error) {
            log.error('Failed retrieving audio stream for screensharing stream', error);
            triggerSuccessFn(stream, true);
          });
        } else {
          hasAudio = window.webrtcDetectedBrowser === 'firefox' ? enableAudio : false;
          triggerSuccessFn(stream, true);
        }

      }, function (error) {
        self._onUserMediaError(error, true, false);

        self._timestamp.screen = true;

        if (typeof callback === 'function') {
          callback(error, null);
        }
      });

    } catch (error) {
      self._onUserMediaError(error, true, false);

      if (typeof callback === 'function') {
        callback(error, null);
      }
    }
  };

  //self._throttle(toShareScreen,10000)();
  throttleFn(toShareScreen, 10000);
};

/**
 * Stops self screensharing Stream object attached to Skylink.
 * If user media Stream object is available, Skylink will refresh all
 *    Peer connections to send the user media Stream object.
 * Reference {{#crossLink "Skylink/refreshConnection:method"}}refreshConnection(){{/crossLink}}
 *    on the events triggered and restart mechanism.
 * @method stopScreen
 * @example
 *   SkylinkDemo.stopScreen();
 * @trigger mediaAccessStopped, streamEnded, incomingStream, peerRestart, serverPeerRestart
 * @for Skylink
 * @since 0.6.0
 */
Skylink.prototype.stopScreen = function () {
  if (this._mediaScreen && this._mediaScreen !== null) {
    this._stopLocalMediaStreams({
      screenshare: true
    });

    /*// for changes where the audio is not muted in here but the original mediastream has no audio
    if (!this._mediaStreamsStatus.audioMuted && !this._streamSettings.audio) {
      this._mediaStreamsStatus.audioMuted = true;
    }

    // for changes where the video is not muted in here but the original mediastream has no video
    if (!this._mediaStreamsStatus.videoMuted && !this._streamSettings.video) {
      this._mediaStreamsStatus.videoMuted = true;
    }*/

    if (this._inRoom) {
      if (this._hasMCU) {
        this._restartMCUConnection();
      } else {
        if (!!this._mediaStream && this._mediaStream !== null) {
          this._trigger('incomingStream', this._user.sid, this._mediaStream, true,
            this.getPeerInfo(), false);
        }
        for (var peer in this._peerConnections) {
          if (this._peerConnections.hasOwnProperty(peer)) {
            this._restartPeerConnection(peer, true, false, null, true);
          }
        }
      }
    }
  }
};

/**
 * Function that handles the native <code>navigator.getUserMedia()</code> API success callback result.
 * @method _onUserMediaSuccess
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._onUserMediaSuccess = function(stream, isScreenSharing) {
  var self = this;
  log.log([null, 'MediaStream', stream.id,
    'User has granted access to local media'], stream);

  var streamEnded = function () {
    log.log([null, 'MediaStream', stream.id, 'Local mediastream has ended'], {
      inRoom: self._inRoom,
      currentTime: stream.currentTime,
      ended: typeof stream.active === 'boolean' ?
        stream.active : stream.ended
    });

    if (self._inRoom) {
      log.debug([null, 'MediaStream', stream.id, 'Sending mediastream ended status']);
      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.STREAM,
        mid: self._user.sid,
        rid: self._room.id,
        cid: self._key,
        sessionType: !!isScreenSharing ? 'screensharing' : 'stream',
        status: 'ended'
      });
    }
    self._trigger('streamEnded', self._user.sid || null, self.getPeerInfo(), true, !!isScreenSharing);
  };

  // chrome uses the new specs
  if (window.webrtcDetectedBrowser === 'chrome' || window.webrtcDetectedBrowser === 'opera') {
    stream.oninactive = streamEnded;
  // Workaround for local stream.onended because firefox has not yet implemented it
  } else if (window.webrtcDetectedBrowser === 'firefox') {
    stream.endedInterval = setInterval(function () {
      if (typeof stream.recordedTime === 'undefined') {
        stream.recordedTime = 0;
      }

      if (stream.recordedTime === stream.currentTime) {
        clearInterval(stream.endedInterval);
        // trigger that it has ended
        streamEnded();

      } else {
        stream.recordedTime = stream.currentTime;
      }

    }, 1000);
  } else {
    stream.onended = streamEnded;
  }

  // check if readyStateChange is done
  if (!isScreenSharing) {
    self._mediaStream = stream;
  } else {
    self._mediaScreen = stream;

    /*// for the case where local user media (audio) is not available for screensharing audio is, do not mute it
    if (!self._streamSettings.audio) {
      self._mediaStreamsStatus.audioMuted = !self._screenSharingStreamSettings.audio;
    }

    // for the case where local user media (video) is not available for screensharing video is, do not mute it
    // logically, this should always pass because screensharing will always require video
    if (!self._streamSettings.video) {
      self._mediaStreamsStatus.videoMuted = !self._screenSharingStreamSettings.video;
    }*/
  }

  self._muteLocalMediaStreams();

  self._wait(function () {
    self._trigger('mediaAccessSuccess', stream, !!isScreenSharing);
  }, function () {
    if (!isScreenSharing) {
      return self._mediaStream && self._mediaStream !== null;
    } else {
      return self._mediaScreen && self._mediaScreen !== null;
    }
  });

  /*self._condition('readyStateChange', function () {
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
  });*/
};

/**
 * Function that handles the native <code>navigator.getUserMedia()</code> API failure callback result.
 * @method _onUserMediaError
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._onUserMediaError = function(error, isScreenSharing, audioFallback) {
  var self = this;
  var hasAudioVideoRequest = !!self._streamSettings.video && !!self._streamSettings.audio;

  if (self._audioFallback && hasAudioVideoRequest && audioFallback) {
    // redefined the settings for video as false
    self._streamSettings.video = false;
    self._getUserMediaSettings.video = false;

    log.debug([null, 'MediaStream', null, 'Falling back to audio stream call']);

    self._trigger('mediaAccessFallback', {
      error: error,
      diff: null
    }, 0, false, true);

    window.getUserMedia({
      audio: true
    }, function(stream) {
      self._onUserMediaSuccess(stream);
      self._trigger('mediaAccessFallback', {
        error: null,
        diff: {
          video: { expected: 1, received: stream.getVideoTracks().length },
          audio: { expected: 1, received: stream.getAudioTracks().length }
        }
      }, 1, false, true);
    }, function(error) {
      log.error([null, 'MediaStream', null,
        'Failed retrieving audio in audio fallback:'], error);
      self._trigger('mediaAccessError', error, !!isScreenSharing, true);
      self._trigger('mediaAccessFallback', {
        error: error,
        diff: null
      }, -1, false, true);
    });
  } else {
    log.error([null, 'MediaStream', null, 'Failed retrieving stream:'], error);
   self._trigger('mediaAccessError', error, !!isScreenSharing, false);
  }
};

/**
 * Function that handles the <code>RTCPeerConnection.onaddstream</code> remote MediaStream received.
 * @method _onRemoteStreamAdded
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._onRemoteStreamAdded = function(targetMid, stream, isScreenSharing) {
  var self = this;

  if (!self._peerInformations[targetMid]) {
    log.error([targetMid, 'MediaStream', stream.id,
        'Received remote stream when peer is not connected. ' +
        'Ignoring stream ->'], stream);
    return;
  }

  if (!self._peerInformations[targetMid].settings.audio &&
    !self._peerInformations[targetMid].settings.video && !isScreenSharing) {
    log.log([targetMid, 'MediaStream', stream.id,
      'Receive remote stream but ignoring stream as it is empty ->'
      ], stream);
    return;
  }
  log.log([targetMid, 'MediaStream', stream.id,
    'Received remote stream ->'], stream);

  if (isScreenSharing) {
    log.log([targetMid, 'MediaStream', stream.id,
      'Peer is having a screensharing session with user']);
  }

  self._trigger('incomingStream', targetMid, stream,
    false, self.getPeerInfo(targetMid), !!isScreenSharing);
};

/**
 * Function that parses the <code>getUserMedia()</code> audio settings provided.
 * This parses correctly for the native <code>navigator.getUserMedia()</code> API audio constraints and
 *   sets any missing values to default.
 * @method _parseAudioStreamSettings
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._parseAudioStreamSettings = function (audioOptions) {
  audioOptions = (typeof audioOptions === 'object') ?
    audioOptions : !!audioOptions;

  var hasOptional = false;

  // Cleaning of unwanted keys
  if (audioOptions !== false) {
    audioOptions = (typeof audioOptions === 'boolean') ? {} : audioOptions;
    var tempAudioOptions = {};
    tempAudioOptions.stereo = !!audioOptions.stereo;
    tempAudioOptions.optional = [];

    if (Array.isArray(audioOptions.optional)) {
      tempAudioOptions.optional = audioOptions.optional;
      hasOptional = true;
    }

    audioOptions = tempAudioOptions;
  }

  var userMedia = (typeof audioOptions === 'object') ?
    true : audioOptions;

  if (hasOptional) {
    userMedia = {
      optional: audioOptions.optional
    };
  }

  return {
    settings: audioOptions,
    userMedia: userMedia
  };
};

/**
 * Function that parses the <code>getUserMedia()</code> video settings provided.
 * This parses correctly for the native <code>navigator.getUserMedia()</code> API video constraints and
 *   sets any missing values to default.
 * @method _parseVideoStreamSettings
 * @private
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
    // set the screenshare option
    tempVideoOptions.screenshare = false;

    tempVideoOptions.optional = [];

    if (Array.isArray(videoOptions.optional)) {
      tempVideoOptions.optional = videoOptions.optional;
    }

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
      optional: tempVideoOptions.optional
    };

    //Remove maxFrameRate for AdapterJS to work with Safari
    if (window.webrtcDetectedType === 'plugin') {
      delete userMedia.mandatory.maxFrameRate;
    }

    // Check if screensharing is available and enabled
    /*if (this._screenSharingAvailable && videoOptions.screenshare) {
      userMedia.optional.push({ sourceId: AdapterJS.WebRTCPlugin.plugin.screensharingKey });
    }*/

    //For Edge
    if (window.webrtcDetectedBrowser === 'edge') {
      userMedia = true;
    }
  }

  return {
    settings: videoOptions,
    userMedia: userMedia
  };
};

/**
 * Function that parses the <code>joinRoom()</code> bandwidth settings provided.
 * This parses and sets any missing values to default.
 * @method _parseBandwidthSettings
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._parseBandwidthSettings = function (bwOptions) {
  this._streamSettings.bandwidth = {};

  bwOptions = (typeof bwOptions === 'object') ?
    bwOptions : {};

  // Configure the audio bandwidth. Recommended = 50
  if (typeof bwOptions.audio === 'number') {
    this._streamSettings.bandwidth.audio = bwOptions.audio;
  }

  // Configure the video bandwidth. Recommended = 256
  if (typeof bwOptions.video === 'number') {
    this._streamSettings.bandwidth.video = bwOptions.video;
  }

  // Configure the data bandwidth. Recommended = 1638400
  if (typeof bwOptions.data === 'number') {
    this._streamSettings.bandwidth.data = bwOptions.data;
  }
};

/**
 * Function that parses the <code>getUserMedia()</code> audio/video mute settings provided.
 * This parses and sets any missing values to default.
 * @method _parseMutedSettings
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._parseMutedSettings = function (options) {
  // the stream options
  options = (typeof options === 'object') ?
    options : { audio: false, video: false };

  var updateAudioMuted = (typeof options.audio === 'object') ?
    !!options.audio.mute : false;//!options.audio;
  var updateVideoMuted = (typeof options.video === 'object') ?
    !!options.video.mute : false;//!options.video;

  return {
    audioMuted: updateAudioMuted,
    videoMuted: updateVideoMuted
  };
};

/**
 * Function that parses the <code>getUserMedia()</code> default settings received from the API result.
 * @method _parseDefaultMediaStreamSettings
 * @private
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
 * Function that parses the <code>getUserMedia()</code> settings provided.
 * @method _parseMediaStreamSettings
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
 * Function that sets User's Stream to send to Peer connection.
 * Priority for <code>shareScreen()</code> Stream over <code>getUserMedia()</code> Stream.
 * @method _addLocalMediaStreams
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._addLocalMediaStreams = function(peerId) {
  // NOTE ALEX: here we could do something smarter
  // a mediastream is mainly a container, most of the info
  // are attached to the tracks. We should iterates over track and print
  try {
    log.log([peerId, null, null, 'Adding local stream']);

    var pc = this._peerConnections[peerId];

    if (pc) {
      if (pc.signalingState !== this.PEER_CONNECTION_STATE.CLOSED) {
        // Updates the streams accordingly
        var updateStreamFn = function (updatedStream) {
          var hasStream = false;

          // remove streams
          var streams = pc.getLocalStreams();
          for (var i = 0; i < streams.length; i++) {
            if (updatedStream !== null && streams[i].id === updatedStream.id) {
              hasStream = true;
              continue;
            }
            // try removeStream
            pc.removeStream(streams[i]);
          }

          if (updatedStream !== null && !hasStream) {
            pc.addStream(updatedStream);
          }
        };

        if (this._mediaScreen && this._mediaScreen !== null) {
          log.debug([peerId, 'MediaStream', null, 'Sending screen'], this._mediaScreen);

          updateStreamFn(this._mediaScreen);

        } else if (this._mediaStream && this._mediaStream !== null) {
          log.debug([peerId, 'MediaStream', null, 'Sending stream'], this._mediaStream);

          updateStreamFn(this._mediaStream);

        } else {
          log.warn([peerId, 'MediaStream', null, 'No media to send. Will be only receiving']);

          updateStreamFn(null);
        }

      } else {
        log.warn([peerId, 'MediaStream', null,
          'Not adding any stream as signalingState is closed']);
      }
    } else {
      log.warn([peerId, 'MediaStream', this._mediaStream,
        'Not adding stream as peerconnection object does not exists']);
    }
  } catch (error) {
    if ((error.message || '').indexOf('already added') > -1) {
      log.warn([peerId, null, null, 'Not re-adding stream as LocalMediaStream is already added'], error);
    } else {
      // Fix errors thrown like NS_ERROR_UNEXPECTED
      log.error([peerId, null, null, 'Failed adding local stream'], error);
    }
  }
};

/**
 * Function that handles the muting of Stream audio and video tracks.
 * @method _muteLocalMediaStreams
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
      if (this._mediaStreamsStatus.audioMuted) {
        audioTracks[a].enabled = false;
      } else {
        audioTracks[a].enabled = true;
      }
    }
    // loop video tracks
    for (v = 0; v < videoTracks.length; v++) {
      if (this._mediaStreamsStatus.videoMuted) {
        videoTracks[v].enabled = false;
      } else {
        videoTracks[v].enabled = true;
      }
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
      if (this._mediaStreamsStatus.audioMuted) {
        audioTracks[a].enabled = false;
      } else {
        audioTracks[a].enabled = true;
      }
    }
    // loop video tracks
    for (v = 0; v < videoTracks.length; v++) {
      if (this._mediaStreamsStatus.videoMuted) {
        videoTracks[v].enabled = false;
      } else {
        videoTracks[v].enabled = true;
      }
    }
  }

  // Loop and enable tracks accordingly (mediaScreenClone)
  if (this._mediaScreenClone && this._mediaScreenClone !== null) {
    videoTracks = this._mediaScreen.getVideoTracks();

    hasVideoTracks = hasVideoTracks || videoTracks.length > 0;

    // loop video tracks
    for (v = 0; v < videoTracks.length; v++) {
      if (this._mediaStreamsStatus.videoMuted) {
        videoTracks[v].enabled = false;
      } else {
        videoTracks[v].enabled = true;
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

  log.log('Update to muted status ->', this._mediaStreamsStatus);

  return {
    hasAudioTracks: hasAudioTracks,
    hasVideoTracks: hasVideoTracks
  };
};

/**
 * Function that handles stopping the Stream streaming.
 * @method _stopLocalMediaStreams
 * @private
 * @for Skylink
 * @since 0.6.3
 */
Skylink.prototype._stopLocalMediaStreams = function (options) {
  var self = this;
  var stopUserMedia = false;
  var stopScreenshare = false;
  var triggerStopped = false;

  if (typeof options === 'object') {
    stopUserMedia = options.userMedia === true;
    stopScreenshare = options.screenshare === true;
  }

  var stopTracksFn = function (stream) {
    var audioTracks = stream.getAudioTracks();
    var videoTracks = stream.getVideoTracks();

    for (var i = 0; i < audioTracks.length; i++) {
      audioTracks[i].stop();
    }

    for (var j = 0; j < videoTracks.length; j++) {
      videoTracks[j].stop();
    }
  };

  var stopFn = function (stream, name) {
    //if (window.webrtcDetectedBrowser === 'chrome' && window.webrtcDetectedVersion > 44) {
    // chrome/opera/firefox uses mediastreamtrack.stop()
    if (['chrome', 'opera', 'firefox'].indexOf(window.webrtcDetectedBrowser) > -1) {
      stopTracksFn(stream);
    } else {
      try {
        stream.stop();
      } catch (error) {
        log.warn('Failed stopping MediaStreamTracks for ' + name + '.' +
          ' Stopping MediaStream instead', error);
        stopTracksFn(stream);
      }
    }
  };

  if (stopScreenshare) {
    log.log([null, 'MediaStream', self._selectedRoom, 'Stopping screensharing MediaStream']);

    if (this._mediaScreen && this._mediaScreen !== null) {
      stopFn(this._mediaScreen, '_mediaScreen');
      this._mediaScreen = null;
      triggerStopped = true;
    }

    if (this._mediaScreenClone && this._mediaScreenClone !== null) {
      stopFn(this._mediaScreenClone, '_mediaScreenClone');
      this._mediaScreenClone = null;
    }

    if (triggerStopped) {
      this._screenSharingStreamSettings.audio = false;
      this._screenSharingStreamSettings.video = false;
      this._trigger('mediaAccessStopped', true);
    }

  } else {
    log.log([null, 'MediaStream', self._selectedRoom, 'Screensharing MediaStream will not be stopped']);
  }

  if (stopUserMedia) {
    log.log([null, 'MediaStream', self._selectedRoom, 'Stopping user\'s MediaStream']);

    if (this._mediaStream && this._mediaStream !== null) {
      stopFn(this._mediaStream, '_mediaStream');
      this._mediaStream = null;
      triggerStopped = true;
    }

    if (triggerStopped) {
      this._streamSettings.audio = false;
      this._streamSettings.video = false;
      this._trigger('mediaAccessStopped', false);
    }
  } else {
    log.log([null, 'MediaStream', self._selectedRoom, 'User\'s MediaStream will not be stopped']);
  }

  // prevent triggering when user is not in the room
  if (this._inRoom) {
    this._trigger('peerUpdated', this._user.sid, this.getPeerInfo(), true);
  }
};

/**
 * Function that waits for Stream to be retrieved before firing callback.
 * @method _waitForLocalMediaStream
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

    callback(null);
    return;
  }

  // get the user media
  if (!options.manualGetUserMedia && (options.audio || options.video)) {
    self.getUserMedia({
      audio: options.audio,
      video: options.video

    }, function (error, success) {
      if (error) {
        callback(error);
      } else {
        callback(null, success);
      }
    });
  }

  // clear previous mediastreams
  self.stopStream();

  if (options.manualGetUserMedia === true) {
    var current50Block = 0;
    var mediaAccessRequiredFailure = false;
    // wait for available audio or video stream
    self._wait(function () {
      if (mediaAccessRequiredFailure === true) {
        self._onUserMediaError(new Error('Waiting for stream timeout'), false, false);
      } else {
        callback(null, self._mediaStream);
      }
    }, function () {
      current50Block += 1;
      if (current50Block === 600) {
        mediaAccessRequiredFailure = true;
        return true;
      }

      if (self._mediaStream && self._mediaStream !== null) {
        return true;
      }
    }, 50);
  }
};