/**
 * <blockquote class="info">
 *   Note that if the video codec is not supported, the SDK will not configure the local <code>"offer"</code> or
 *   <code>"answer"</code> session description to prefer the codec.
 * </blockquote>
 * The list of available video codecs to set as the preferred video codec to use to encode
 * sending video data when available encoded video codec for Peer connections
 * configured in the <a href="#method_init"><code>init()</code> method</a>.
 * @attribute VIDEO_CODEC
 * @param {String} AUTO <small>Value <code>"auto"</code></small>
 *   The value of the option to not prefer any video codec but rather use the created
 *   local <code>"offer"</code> / <code>"answer"</code> session description video codec preference.
 * @param {String} VP8  <small>Value <code>"VP8"</code></small>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/VP8">VP8</a> video codec.
 * @param {String} H264 <small>Value <code>"H264"</code></small>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/H.264/MPEG-4_AVC">H264</a> video codec.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.VIDEO_CODEC = {
  AUTO: 'auto',
  VP8: 'VP8',
  H264: 'H264'
  //H264UC: 'H264UC'
};

/**
 * <blockquote class="info">
 *   Note that if the audio codec is not supported, the SDK will not configure the local <code>"offer"</code> or
 *   <code>"answer"</code> session description to prefer the codec.
 * </blockquote>
 * The list of available audio codecs to set as the preferred audio codec to use to encode
 * sending audio data when available encoded audio codec for Peer connections
 * configured in the <a href="#method_init"><code>init()</code> method</a>.
 * @attribute AUDIO_CODEC
 * @param {String} AUTO <small>Value <code>"auto"</code></small>
 *   The value of the option to not prefer any audio codec but rather use the created
 *   local <code>"offer"</code> / <code>"answer"</code> session description audio codec preference.
 * @param {String} OPUS <small>Value <code>"opus"</code></small>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/Opus_(audio_format)">OPUS</a> audio codec.
 * @param {String} ISAC <small>Value <code>"ISAC"</code></small>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/Internet_Speech_Audio_Codec">ISAC</a> audio codec.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.AUDIO_CODEC = {
  AUTO: 'auto',
  ISAC: 'ISAC',
  OPUS: 'opus',
  //ILBC: 'ILBC',
  //G711: 'G711',
  //G722: 'G722',
  //SILK: 'SILK'
};

/**
 * <blockquote class="info">
 *   Note that currently <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> only configures
 *   the maximum resolution of the Stream due to browser interopability and support.
 * </blockquote>
 * The list of <a href="https://en.wikipedia.org/wiki/Graphics_display_resolution#Video_Graphics_Array">
 * video resolutions</a> sets configured in the <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.
 * @attribute VIDEO_RESOLUTION
 * @param {JSON} QQVGA <small>Value <code>{ width: 160, height: 120 }</code></small>
 *   The value of the option to configure QQVGA resolution.
 *   <small>Aspect ratio: <code>4:3</code></small>
 *   <small>Note that configurating this resolution may not be supported.</small>
 * @param {JSON} HQVGA <small>Value <code>{ width: 240, height: 160 }</code></small>
 *   The value of the option to configure HQVGA resolution.
 *   <small>Aspect ratio: <code>3:2</code></small>
 *   <small>Note that configurating this resolution may not be supported.</small>
 * @param {JSON} QVGA <small>Value <code>{ width: 320, height: 240 }</code></small>
 *   The value of the option to configure QVGA resolution.
 *   <small>Aspect ratio: <code>4:3</code></small>
 * @param {JSON} WQVGA <small>Value <code>{ width: 384, height: 240 }</code></small>
 *   The value of the option to configure WQVGA resolution.
 *   <small>Aspect ratio: <code>16:10</code></small>
 *   <small>Note that configurating this resolution may not be supported.</small>
 * @param {JSON} HVGA <small>Value <code>{ width: 480, height: 320 }</code></small>
 *   The value of the option to configure HVGA resolution.
 *   <small>Aspect ratio: <code>3:2</code></small>
 *   <small>Note that configurating this resolution may not be supported.</small>
 * @param {JSON} VGA <small>Value <code>{ width: 640, height: 480 }</code></small>
 *   The value of the option to configure VGA resolution.
 *   <small>Aspect ratio: <code>4:3</code></small>
 * @param {JSON} WVGA <small>Value <code>{ width: 768, height: 480 }</code></small>
 *   The value of the option to configure WVGA resolution.
 *   <small>Aspect ratio: <code>16:10</code></small>
 *   <small>Note that configurating this resolution may not be supported.</small>
 * @param {JSON} FWVGA <small>Value <code>{ width: 854, height: 480 }</code></small>
 *   The value of the option to configure FWVGA resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported.</small>
 * @param {JSON} SVGA <small>Value <code>{ width: 800, height: 600 }</code></small>
 *   The value of the option to configure SVGA resolution.
 *   <small>Aspect ratio: <code>4:3</code></small>
 *   <small>Note that configurating this resolution may not be supported.</small>
 * @param {JSON} DVGA <small>Value <code>{ width: 960, height: 640 }</code></small>
 *   The value of the option to configure DVGA resolution.
 *   <small>Aspect ratio: <code>3:2</code></small>
 *   <small>Note that configurating this resolution may not be supported.</small>
 * @param {JSON} WSVGA <small>Value <code>{ width: 1024, height: 576 }</code></small>
 *   The value of the option to configure WSVGA resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 * @param {JSON} HD <small>Value <code>{ width: 1280, height: 720 }</code></small>
 *   The value of the option to configure HD resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 * @param {JSON} HDPLUS <small>Value <code>{ width: 1600, height: 900 }</code></small>
 *   The value of the option to configure HDPLUS resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported.</small>
 * @param {JSON} FHD <small>Value <code>{ width: 1920, height: 1080 }</code></small>
 *   The value of the option to configure FHD resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported.</small>
 * @param {JSON} QHD <small>Value <code>{ width: 2560, height: 1440 }</code></small>
 *   The value of the option to configure QHD resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported.</small>
 * @param {JSON} WQXGAPLUS <small>Value <code>{ width: 3200, height: 1800 }</code></small>
 *   The value of the option to configure WQXGAPLUS resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported.</small>
 * @param {JSON} UHD <small>Value <code>{ width: 3840, height: 2160 }</code></small>
 *   The value of the option to configure UHD resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported.</small>
 * @param {JSON} UHDPLUS <small>Value <code>{ width: 5120, height: 2880 }</code></small>
 *   The value of the option to configure UHDPLUS resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported.</small>
 * @param {JSON} FUHD <small>Value <code>{ width: 7680, height: 4320 }</code></small>
 *   The value of the option to configure FUHD resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported.</small>
 * @param {JSON} QUHD <small>Value <code>{ width: 15360, height: 8640 }</code></small>
 *   The value of the option to configure QUHD resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported.</small>
 * @type JSON
 * @readOnly
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
 * The list of <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> Stream fallback states.
 * @attribute MEDIA_ACCESS_FALLBACK_STATE
 * @param {JSON} FALLBACKING <small>Value <code>0</code></small>
 *   The value of the state when <code>getUserMedia()</code> will retrieve audio track only
 *   when retrieving audio and video tracks failed.
 *   <small>This can be configured by <a href="#method_init"><code>init()</code> method</a>
 *   <code>audioFallback</code> option.</small>
 * @param {JSON} FALLBACKED  <small>Value <code>1</code></small>
 *   The value of the state when <code>getUserMedia()</code> retrieves camera Stream successfully but with
 *   missing originally required audio or video tracks.
 * @param {JSON} ERROR       <small>-1</code></small>
 *   The value of the state when <code>getUserMedia()</code> failed to retrieve audio track only
 *   after retrieving audio and video tracks failed.
 * @readOnly
 * @for Skylink
 * @since 0.6.14
 */
Skylink.prototype.MEDIA_ACCESS_FALLBACK_STATE = {
  FALLBACKING: 0,
  FALLBACKED: 1,
  ERROR: -1
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
 * Function that retrieves camera Stream.
 * @method getUserMedia
 * @param {JSON} [options] The camera Stream configuration options.
 * - When not provided, the value is set to <code>{ audio: true, video: true }</code>.
 *   <small>To fallback to retrieve audio track only when retrieving of audio and video tracks failed,
 *   enable the <code>audioFallback</code> flag in the <a href="#method_init"><code>init()</code> method</a>.</small>
 * @param {Boolean|JSON} [options.audio=false] The audio configuration options.
 * @param {Boolean} [options.audio.stereo=false] The flag if stereo band should be configured
 *   when encoding audio codec is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending audio data.
 * @param {Boolean} [options.audio.mute=false] The flag if audio tracks should be muted upon receiving them.
 * @param {Array} [options.audio.optional] The <code>navigator.getUserMedia()</code> API
 *   <code>audio: { optional [..] }</code> property.
 * @param {Boolean|JSON} [options.video=false] The video configuration options.
 * @param {Boolean} [options.video.mute=false] The flag if video tracks should be muted upon receiving them.
 * @param {JSON} [options.video.resolution] <blockquote class="info">
 *   Note that currently <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> only configures
 *   the maximum resolution of the camera Stream due to browser interopability and support. </blockquote>
 *   The video resolution.
 *   <small>By default, <a href="#attr_VIDEO_RESOLUTION"><code>VGA</code></a> resolution option
 *   is selected when not provided.</small>
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Number} [options.video.resolution.width] The video resolution width.
 * @param {Number} [options.video.resolution.height] The video resolution height.
 * @param {Number} [options.video.frameRate=50] <blockquote class="info">
 *   Note that currently <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> only configures
 *   the maximum frameRate of the camera Stream due to browser interopability and support. For Safari and IE browsers
 *   (plugin-enabled), the maximum frameRate is not configured due to the lack of support.</blockquote>
 *   The video <a href="https://en.wikipedia.org/wiki/Frame_rate">frameRate</a> per second (fps).
 * @param {Array} [options.video.optional] The <code>navigator.getUserMedia()</code> API
 *   <code>video: { optional [..] }</code> property.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_mediaAccessSuccess">
 *   <code>mediaAccessSuccess</code> event</a> triggering <code>isScreensharing</code> parameter
 *   payload value as <code>false</code> for request success.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>getUserMedia()</code> error when retrieving camera Stream.</small>
 * @param {MediaStream} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature is the camera Stream object.</small>
 * @example
 *   // Example 1: Get both audio and video.
 *   skylinkDemo.getUserMedia(function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-video"), success);
 *   });
 *
 *   // Example 2: Get only audio.
 *   skylinkDemo.getUserMedia({
 *     audio: true
 *   }, function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-audio"), success);
 *   });
 *
 *   // Example 3: Configure resolution for video
 *   skylinkDemo.getUserMedia({
 *     audio: true,
 *     video: {
 *       resolution: skylinkDemo.VIDEO_RESOLUTION.HD
 *     }
 *   }, function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-video"), success);
 *   });
 *
 *   // Example 4: Configure stereo flag for OPUS codec audio (OPUS is always used by default)
 *   skylinkDemo.init({
 *     appKey: "xxxxxx",
 *     audioCodec: skylinkDemo.AUDIO_CODEC.OPUS
 *   }, function (initErr, initSuccess) {
 *     skylinkDemo.getUserMedia({
 *       audio: {
 *         stereo: true
 *       },
 *       video: true
 *     }, function (error, success) {
 *       if (error) return;
 *       attachMediaStream(document.getElementById("my-video"), success);
 *     });
 *   });
 *
 *   // Example 5: Configure frameRate for video
 *   skylinkDemo.getUserMedia({
 *     audio: true,
 *     video: {
 *       frameRate: 50
 *     }
 *   }, function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-video"), success);
 *   });
 *
 *   // Example 6: Configure video and audio based on selected sources. Does not work for Firefox currently.
 *   var sources = { audio: [], video: [] };
 *
 *   function selectStream (audioSourceId, videoSourceId) {
 *     skylinkDemo.getUserMedia({
 *       audio: {
 *         optional: [{ sourceId: audioSourceId }]
 *       },
 *       video: {
 *         optional: [{ sourceId: videoSourceId }]
 *       }
 *     }, function (error, success) {
 *       if (error) return;
 *       attachMediaStream(document.getElementById("my-video"), success);
 *     });
 *   }
 *
 *   navigator.mediaDevices.enumerateDevices().then(function(devices) {
 *     var selectedAudioSourceId = "";
 *     var selectedVideoSourceId = "";
 *     devices.forEach(function(device) {
 *       console.log(device.kind + ": " + device.label + " source ID = " + device.deviceId);
 *       if (device.kind === "audio") {
 *         selectedAudioSourceId = device.deviceId;
 *       } else {
 *         selectedVideoSourceId = device.deviceId;
 *       }
 *     });
 *     selectStream(selectedAudioSourceId, selectedVideoSourceId);
 *   }).catch(function (error) {
 *      console.error("Failed", error);
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>When retrieval of camera Stream is successful, <a href="#event_mediaAccessSuccess">
 *   <code>mediaAccessSuccess</code> event</a> triggers parameter payload <code>isScreensharing</code>
 *   value as <code>false</code>.<ol>
 *   <li>When there are missing required audio or video tracks, <a href="#event_mediaAccessFallback">
 *   <code>mediaAccessFallback</code> event</a> triggers parameter payload <code>state</code> as <code>FALLBACKED</code>
 *   , <code>isScreensharing</code> value as <code>false</code>, <code>isAudioFallback</code> as
 *   <code>false</code> and <code>error</code> is defined.</li></ol></li>
 *   <li>When retrieval of camera Stream has failed<ol>
 *   <li>If <code>audioFallback</code> is enabled in the <a href="#method_init"><code>init()</code> method</a>
 *   configuration, and <code>options.video</code> and <code>options.audio</code> is requested <ol>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a> is triggers parameter payload
 *   <code>state</code> value as <code>FALLBACKING</code>, <code>isScreensharing</code> value as <code>false</code>,
 *   <code>isAudioFallback</code> as <code>true</code> and <code>error</code> is defined.</li>
 *   <li>Invokes <code>getUserMedia()</code> with <code>options.audio</code> value as <code>true</code> and
 *   <code>options.video</code> value as <code>false</code>.<ol>
 *   <li>When retrieval of camera Stream (fallbacked audio only) is successful<ol>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a> triggers parameter payload
 *   <code>state</code> as <code>FALLBACKED</code>, <code>isScreensharing</code> value as <code>false</code> and
 *   <code>isAudioFallback</code> as <code>true</code>.</li>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a> triggers parameter
 *   payload <code>isScreensharing</code> value as <code>false</code></li></ol></li>
 *   <li>When retrieval of camera Stream (fallbacked audio only) has failed <ol>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a> triggers parameter payload
 *   <code>state</code> as <code>ERROR</code>, <code>isScreensharing</code> value as <code>false</code> and
 *   <code>isAudioFallback</code> as <code>true</code>.</li>
 *   <li><a href="#event_mediaAccessError"><code>mediaAccessError</code> event</a> triggers parameter payload
 *   <code>isScreensharing</code> value as <code>false</code> and <code>isAudioFallbackError</code>
 *   as <code>true</code>.</li></ol></li></ol></li></ol></li>
 *   <li>Else, <a href="#event_mediaAccessError"><code>mediaAccessError</code> event</a>
 *   triggers parameter payload <code>isScreensharing</code> value as <code>false</code> and
 *   <code>isAudioFallbackError</code> as <code>false</code></li></ol></li></ol>
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
 * <blockquote class="info">
 *   Note that if <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> is available despite having
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> available, the
 *   <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> is sent instead of the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> to Peers.
 * </blockquote>
 * Function that sends a new <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>
 * to all connected Peers in the Room.
 * @method sendStream
 * @param {JSON|MediaStream} options The <a href="#method_getUserMedia"><code>getUserMedia()</code>
 *   method</a> <code>options</code> parameter settings.
 * - When provided as a <code>MediaStream</code> object, this configures the <code>options.audio</code> and
 *   <code>options.video</code> based on the tracks available in the <code>MediaStream</code> object,
 *   and configures the <code>options.audio.mute</code> and <code>options.video.mute</code> based on the tracks
 *   <code>.enabled</code> flags in the tracks provided in the <code>MediaStream</code> object without
 *   invoking <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.
 *   <small>Object signature matches the <code>options</code> parameter in the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.</small>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_peerRestart">
 *   <code>peerRestart</code> event</a> triggering <code>isSelfInitiateRestart</code> parameter payload
 *   value as <code>true</code> for all Peers currently in the Room targeted for request success.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> error or
 *   when invalid <code>options</code> is provided.</small>
 * @param {MediaStream} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature is the <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>
 *   Stream object.</small>
 * @example
 *   // Example 1: Send MediaStream object
 *   function retrieveStreamBySourceForFirefox (sourceId) {
 *     navigator.mediaDevices.getUserMedia({
 *       audio: true,
 *       video: {
 *         sourceId: { exact: sourceId }
 *       }
 *     }).then(function (stream) {
 *       skylinkDemo.sendStream(stream, function (error, success) {
 *         if (err) return;
 *         if (stream === success) {
 *           console.info("Same MediaStream has been sent");
 *         }
 *         console.log("Stream is now being sent to Peers");
 *         attachMediaStream(document.getElementById("my-video"), success);
 *       });
 *     });
 *   }
 *
 *   // Example 2: Send video later
 *   var inRoom = false;
 *
 *   function sendVideo () {
 *     if (!inRoom) return;
 *     skylinkDemo.sendStream({
 *       audio: true,
 *       video: true
 *     }, function (error, success) {
 *       if (error) return;
 *       console.log("getUserMedia() Stream with video is now being sent to Peers");
 *       attachMediaStream(document.getElementById("my-video"), success);
 *     });
 *   }
 *
 *   skylinkDemo.joinRoom({
 *     audio: true
 *   }, function (jRError, jRSuccess) {
 *     if (jRError) return;
 *     inRoom = true;
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>Invokes <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.</li>
 *   <li>Invokes <a href="#method_refreshConnection"><code>refreshConnection()</code> method</a>.</li>
 *   <li>If User is in the Room, <a href="#event_incomingStream"><code>incomingStream</code> event</a> triggers with
 *   parameter payload <code>isSelf</code> as <code>true</code>, and <a href="#event_peerUpdate">
 *   <code>peerUpdated</code> event</a> triggers with parameter payload <code>isSelf</code>
 *   as <code>true</code>.</li></ol></li></ol>
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
 * Function that stops <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.
 * @method stopStream
 * @example
 *   function stopStream () {
 *     skylinkDemo.stopStream();
 *   }
 *
 *   skylinkDemo.getUserMedia();
 * @trigger <ol class="desc-seq">
 *   <li><a href="#event_mediaAccessStopped"><code>mediaAccessStopped</code> event</a> triggers parameter payload
 *   <code>isScreensharing</code> value as <code>false</code>.</li>
 *   <li>If User is in the Room, <a href="#event_streamEnded"><code>streamEnded</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>false</code> and <code>isSelf</code> value
 *   as <code>true</code>, and <a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers
 *   parameter payload <code>isSelf</code> value as <code>true</code>.</li></ol>
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
 * Function that mutes both <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
 * <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> audio or video tracks.
 * @method muteStream
 * @param {JSON} options The Streams muting options.
 * @param {Boolean} [options.audioMuted=true] The flag if all Streams audio
 *   tracks should be muted or not.
 * @param {Boolean} [options.videoMuted=true] The flag if all Streams video
 *   tracks should be muted or not.
 * @example
 *   // Example 1: Mute both audio and video tracks in all Streams
 *   skylinkDemo.muteStream({
 *     audioMuted: true,
 *     videoMuted: true
 *   });
 *
 *   // Example 2: Mute only audio tracks in all Streams
 *   skylinkDemo.muteStream({
 *     audioMuted: true,
 *     videoMuted: false
 *   });
 *
 *   // Example 3: Mute only video tracks in all Streams
 *   skylinkDemo.muteStream({
 *     audioMuted: false,
 *     videoMuted: true
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>If User is in the Room, <a href="#event_streamMuted"><code>streamMuted</code> event</a> triggers
 *   parameter payload <code>isSelf</code> value as <code>true</code>, and <a href="#event_peerUpdated">
 *   <code>peerUpdated</code> event</a> triggers parameter payload <code>isSelf</code>
 *   value as <code>true</code>.</li></ol>
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
 * <blockquote class="info"><b>Deprecation Warning!</b>
 *   This method has been deprecated. Use <a href="#method_muteStream"><code>muteStream()</code> method</a> instead.
 * </blockquote>
 * Function that unmutes both <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
 * <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> audio tracks.
 * @method enableAudio
 * @deprecated true
 * @example
 *   function unmuteAudio () {
 *     skylinkDemo.enableAudio();
 *   }
 * @trigger <ol class="desc-seq">
 *   <li>Invokes <a href="#method_muteStream"><code>muteStream()</code> method</a> with
 *   <code>options.audioMuted</code> value as <code>false</code>.</li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.enableAudio = function() {
  this.muteStream({
    audioMuted: false
  });
};

/**
 * <blockquote class="info"><b>Deprecation Warning!</b>
 *   This method has been deprecated. Use <a href="#method_muteStream"><code>muteStream()</code> method</a> instead.
 * </blockquote>
 * Function that mutes both <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
 * <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> audio tracks.
 * @method disableAudio
 * @deprecated true
 * @example
 *   function muteAudio () {
 *     skylinkDemo.disableAudio();
 *   }
 * @trigger <ol class="desc-seq">
 *   <li>Invokes <a href="#method_muteStream"><code>muteStream()</code> method</a> with
 *   <code>options.audioMuted</code> value as <code>true</code>.</li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.disableAudio = function() {
  this.muteStream({
    audioMuted: true
  });
};

/**
 * <blockquote class="info"><b>Deprecation Warning!</b>
 *   This method has been deprecated. Use <a href="#method_muteStream"><code>muteStream()</code> method</a> instead.
 * </blockquote>
 * Function that unmutes both <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
 * <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> video tracks.
 * @method enableVideo
 * @deprecated true
 * @example
 *   function unmuteVideo () {
 *     skylinkDemo.enableVideo();
 *   }
 * @trigger <ol class="desc-seq">
 *   <li>Invokes <a href="#method_muteStream"><code>muteStream()</code> method</a> with
 *   <code>options.videoMuted</code> value as <code>false</code>.</li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.enableVideo = function() {
  this.muteStream({
    videoMuted: false
  });
};

/**
 /**
 * <blockquote class="info"><b>Deprecation Warning!</b>
 *   This method has been deprecated. Use <a href="#method_muteStream"><code>muteStream()</code> method</a> instead.
 * </blockquote>
 * Function that mutes both <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
 * <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> video tracks.
 * @method disableVideo
 * @deprecated true
 * @example
 *   function muteVideo () {
 *     skylinkDemo.disableVideo();
 *   }
 * @trigger <ol class="desc-seq">
 *   <li>Invokes <a href="#method_muteStream"><code>muteStream()</code> method</a> with
 *   <code>options.videoMuted</code> value as <code>true</code>.</li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.disableVideo = function() {
  this.muteStream({
    videoMuted: true
  });
};

/**
 * Function that retrieves screensharing Stream.
 * @method shareScreen
 * @param {JSON} [enableAudio=false] The flag if audio tracks should be retrieved.

 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_mediaAccessSuccess">
 *   <code>mediaAccessSuccess</code> event</a> triggering <code>isScreensharing</code> parameter
 *   payload value as <code>true</code> for request success.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>shareScreen()</code> error when retrieving screensharing Stream.</small>
 * @param {MediaStream} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature is the screensharing Stream object.</small>
 * @example
 *   // Example 1: Share screen with audio
 *   skylinkDemo.shareScreen(function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-screen"), success);
 *   });
 *
 *   // Example 2: Share screen without audio
 *   skylinkDemo.shareScreen(false, function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-screen"), success);
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>When retrieval of screensharing Stream is successful, <a href="#event_mediaAccessSuccess">
 *   <code>mediaAccessSuccess</code> event</a> triggers parameter payload <code>isScreensharing</code>
 *   value as <code>true</code>.<ol>
 *   <li>When there are missing required audio tracks, <a href="#event_mediaAccessFallback">
 *   <code>mediaAccessFallback</code> event</a> triggers parameter payload <code>state</code> as <code>FALLBACKED</code>
 *   , <code>isScreensharing</code> value as <code>true</code>, <code>isAudioFallback</code> as
 *   <code>false</code> and <code>error</code> is defined.</li>
 *   <li>If User is in Room, <a href="#event_incomingStream"><code>incomingStream</code> event</a> triggers.</li>
 *   <li>Invokes <a href="#method_refreshConnection"><code>refreshConnection()</code> method</a>.</li></ol></li>
 *   <li>When retrieval of screensharing Stream has failed, <a href="#event_mediaAccessError">
 *   <code>mediaAccessError</code> event</a> triggers parameter payload <code>isScreensharing</code>
 *   value as <code>true</code> and <code>isAudioFallbackError</code> as <code>false</code></li></ol></li></ol>
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
 * Function that stops <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>.
 * @method stopScreen
 * @example
 *   function stopScreen () {
 *     skylinkDemo.stopScreen();
 *   }
 *
 *   skylinkDemo.shareScreen();
 * @trigger <ol class="desc-seq">
 *   <li><a href="#event_mediaAccessStopped"><code>mediaAccessStopped</code> event</a> triggers parameter payload
 *   <code>isScreensharing</code> value as <code>true</code>.</li>
 *   <li>If User is in the Room, <a href="#event_streamEnded"><code>streamEnded</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>true</code> and <code>isSelf</code> value
 *   as <code>true</code>, and <a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers
 *   parameter payload <code>isSelf</code> value as <code>true</code>.</li>
 *   <li>If User has <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and is in the Room,
 *   the Stream will be sent to Peers and <a href="#event_incomingStream"><code>incomingStream</code> event</a>
 *   triggers with parameter payload <code>isSelf</code> value as <code>true</code> using the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.</li>
 *   <li>Invokes <a href="#method_refreshConnection"><code>refreshConnection()</code> method</a>.</li></ol>
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