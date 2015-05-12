/*! skylinkjs - v0.5.10 - Tue May 12 2015 16:10:39 GMT+0800 (SGT) */

var IUtil = {};

/**
 * Stores the default stream and bandwidth settings.
 * @attribute IUtil._defaultConfig
 * @type JSON
 * @param {JSON} audio The default audio streaming configuraiton.
 * @param {Boolean} audio.stereo The default flag to indicate if stereo is enabled.
 * @param {JSON} video The default video streaming configuraiton.
 * @param {JSON} video.resolution The default video resolution.
 * @param {Integer} video.resolution.width The default video resolution width.
 * @param {Integer} video.resolution.height The default video resolution height.
 * @param {Integer} video.frameRate The default video maximum framerate.
 * @param {JSON} bandwidth The default bandwidth streaming settings.
 * @param {Integer} bandwidth.audio The default audio bandwidth bitrate.
 * @param {Integer} bandwidth.video The default video bandwidth bitrate.
 * @param {Integer} bandwidth.data The default DataChannel data bandwidth bitrate.
 * @private
 * @for IUtil
 * @since 0.6.0
 */
IUtil._defaultConfig = {
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
 * Parses the audio configuration for the stream configuration and getUserMedia constraints.
 * @method StreamParser.parseAudioConfig
 * @param {JSON|Boolean} options The audio settings or flag if audio is enabled.
 * @param {Boolean} options.stereo The flag to indicate if stereo is enabled.
 * @param {String} options.sourceId The source id of the audio MediaStreamTrack.
 * @return {JSON} Returns the output parsed audio configuration.
 * - <code>settings</code> <var>: <b>type</b> JSON|Boolean</var><br>
 *   The audio stream configuration.
 * - <code>settings.stereo</code> <var>: <b>type</b> Boolean</var><br>
 *   The flag that indicates if stereo is enabled for this streaming.
 * - <code>settings.sourceId</code> <var>: <b>type</b> JSON</var><br>
 *   The audio stream source id.
 * - <code>userMedia</code> <var>: <b>type</b> Boolean|JSON</var><br>
 *   The audio stream getUserMedia constraints.
 * - <code>userMedia.optional</code> <var>: <b>type</b> Array</var><br>
 *   The audio stream optional configuration.
 * - <code>settings.optional.(#index)</code> <var>: <b>type</b> JSON</var><br>
 *   The audio stream optional configuration item.
 * - <code>settings.optional.(#index).sourceId</code> <var>: <b>type</b> String</var><br>
 *   The audio stream source id.
 * @private
 * @since 0.6.0
 */
IUtil._parseAudioConfig = function (options) {
  options = (typeof options === 'object') ? options : !!options;

  var userMedia = false;
  var tempOptions = {};

  // Cleaning of unwanted keys
  if (options !== false) {
    options = (typeof options === 'boolean') ? {} : options;
    tempOptions.stereo = !!options.stereo;
    tempOptions.sourceId = options.sourceId || null;
    tempOptions.mute = typeof options.mute === 'boolean' ? options.mute : false;

    options = tempOptions;
  }

  userMedia = (typeof options === 'object') ?
    true : options;

  // Add video sourceId
  if (tempOptions.sourceId && tempOptions.audio !== false) {
    userMedia = { optional: [{ sourceId: tempOptions.sourceId }] };
  }

  return {
    settings: options,
    userMedia: userMedia
  };
};

/**
 * Parses the video configuration for the stream configuration and getUserMedia constraints.
 * @method StreamParser.parseVideoConfig
 * @param {JSON|Boolean} options The video settings.
 * @param {JSON} options.resolution The video resolution.
 * @param {Integer} options.resolution.width The video resolution width.
 * @param {Integer} options.resolution.height The video resolution height.
 * @param {Integer} options.frameRate The video maximum framerate.
 * @param {String} options.sourceId The source id of the video MediaStreamTrack.
 * @return {JSON} Returns the output parsed video configuration.
 * - <code>settings</code> <var>: <b>type</b> JSON|Boolean</var><br>
 *   The video stream configuration.
 * - <code>settings.resolution</code> <var>: <b>type</b> Boolean</var><br>
 *   The video stream resolution.
 * - <code>settings.resolution.width</code> <var>: <b>type</b> Integer</var><br>
 *   The video stream resolution width.
 * - <code>settings.resolution.height</code> <var>: <b>type</b> Integer</var><br>
 *   The video stream resolution height.
 * - <code>settings.resolution.frameRate</code> <var>: <b>type</b> Integer</var><br>
 *   The video stream resolution maximum framerate.
 * - <code>settings.sourceId</code> <var>: <b>type</b> JSON</var><br>
 *   The video stream source id.
 * - <code>userMedia</code> <var>: <b>type</b> Boolean|JSON</var><br>
 *   The video stream getUserMedia constraints.
 * - <code>userMedia.mandatory</code> <var>: <b>type</b> JSON</var><br>
 *   The video stream mandatory configuration.
 * - <code>userMedia.mandatory.maxWidth</code> <var>: <b>type</b> Integer</var><br>
 *   The video stream maximum width resolution.
 * - <code>userMedia.mandatory.maxHeight</code> <var>: <b>type</b> Integer</var><br>
 *   The video stream maximum height resolution.
 * - <code>userMedia.mandatory.maxFrameRate</code> <var>: <b>type</b> Array</var><br>
 *   The video stream maximum framerate. Not supported in current Plugin browsers.
 * - <code>userMedia.optional</code> <var>: <b>type</b> Array</var><br>
 *   The video stream optional configuration.
 * - <code>settings.optional.(#index)</code> <var>: <b>type</b> JSON</var><br>
 *   The video stream optional configuration item.
 * - <code>settings.optional.(#index).sourceId</code> <var>: <b>type</b> String</var><br>
 *   The video stream source id.
 * @private
 * @since 0.6.0
 */
IUtil._parseVideoConfig = function (options) {
  options = (typeof options === 'object') ?
  options : !!options;

  var userMedia = false;
  var tempOptions = {};

  // Cleaning of unwanted keys
  if (options !== false) {
    options = (typeof options === 'boolean') ?
      { resolution: {} } : options;

    // set the resolution parsing
    options.resolution = options.resolution || {};

    tempOptions.resolution = tempOptions.resolution || {};

    // set resolution
    tempOptions.resolution.width = options.resolution.width ||
      IUtil._defaultConfig.video.resolution.width;

    tempOptions.resolution.height = options.resolution.height ||
      IUtil._defaultConfig.video.resolution.height;

    // set the framerate
    tempOptions.frameRate = options.frameRate ||
      IUtil._defaultConfig.video.frameRate;

    // set the sourceid
    tempOptions.sourceId = options.sourceId || null;

    // set the mute options
    tempOptions.mute = typeof options.mute === 'boolean' ? options.mute : false;

    options = tempOptions;

    userMedia = {
      mandatory: {
        //minWidth: tempOptions.resolution.width,
        //minHeight: tempOptions.resolution.height,
        maxWidth: tempOptions.resolution.width,
        maxHeight: tempOptions.resolution.height,
        //minFrameRate: tempOptions.frameRate,
        maxFrameRate: tempOptions.frameRate
      },
      optional: []
    };

    // Add video sourceId
    if (tempOptions.sourceId) {
      userMedia.optional[0] = { sourceId: tempOptions.sourceId };
    }

    //Remove maxFrameRate for AdapterJS to work with Safari
    if (window.webrtcDetectedType === 'plugin') {
      delete userMedia.mandatory.maxFrameRate;
    }
  }

  return {
    settings: options,
    userMedia: userMedia
  };
};
var Stream = function (stream, options) {

  'use strict';

  var $$ = this;

  /**
   * The Stream object id.
   * @attribute id
   * @type String
   * @for Stream
   * @since 0.6.0
   */
  var id = null;

  /**
   * The Stream MediaStream constraints
   * @attribute _constraints
   * @type JSON
   * @private
   * @for Stream
   * @since 0.6.0
   */
  var _constraints = {};

  /**
   * The Stream options configuration.
   * @attribute _config
   * @type JSON
   * @private
   * @for Stream
   * @since 0.6.0
   */
  var _config = {};

  /**
   * The Stream MediaStream reference.
   * @attribute _nativeRef
   * @type JSON
   * @private
   * @for Stream
   * @since 0.6.0
   */
  var _nativeRef = null;

  /**
   * Stores the list of audio StreamTrack class objects.
   * @attribute _audioTracks
   * @type Array
   * @param {StreamTrack} (#index) The audio StreamTrack class object at index.
   * @private
   * @for Stream
   * @since 0.6.0
   */
  var _audioTracks = [];

  /**
   * Stores the list of video StreamTrack class objects.
   * @attribute _videoTracks
   * @type Array
   * @param {StreamTrack} (#index) The video StreamTrack class object at index.
   * @private
   * @for Stream
   * @since 0.6.0
   */
  var _videoTracks = [];

  /**
   * The attachMediaStream adapterjs method reference.
   * @attribute _attachMediaStream
   * @type Function
   * @private
   * @for Stream
   * @since 0.6.0
   */
  var _attachMediaStream = window.attachMediaStream;


  /**
   * Gets the list of audio StreamTrack class objects in the Stream container.
   * @method getAudioTracks
   * @return {Array} Returns an array of audio StreamTracks.
   * <ul>
   * <li><code>(#index)</code> <var>StreamTrack</var>
   *   The audio StreamTrack class object at index.</li>
   * </ul>
   * @for Stream
   * @since 0.6.0
   */
  var getAudioTracks = function () {
    return _audioTracks;
  };

  /**
   * Gets the list of video StreamTrack class objects in the Stream container.
   * @method getVideoTracks
   * @return {Array} Returns an array of video StreamTracks.
   * <ul>
   * <li><code>(#index)</code> <var>StreamTrack</var>
   *   The video StreamTrack class object at index.</li>
   * </ul>
   * @for Stream
   * @since 0.6.0
   */
  var getVideoTracks = function () {
    return _videoTracks;
  };

  /**
   * Stops the current Stream object streamming.
   * @method stop
   * @for Stream
   * @since 0.6.0
   */
  var stop = function () {
    try {
      _nativeRef.stop();

    } catch (error) {
      // MediaStream.stop is not implemented.
      // Stop all MediaStreamTracks

      var i, j;

      for (i = 0; i < _audioTracks.length; i += 1) {
        _audioTracks[i].stop();
      }

      for (j = 0; j < _videoTracks.length; j += 1) {
        _videoTracks[j].stop();
      }
    }
  };

  /**
   * Attaches the stream object to a <code>&#60;video&#62;</code>
   *   or a <code>&#60;audio&#62;</code> element.
   * @method attach
   * @for Stream
   * @since 0.6.0
   */
  var attach = function (dom) {
    _attachMediaStream(dom, _nativeRef);
  };

  /**
   * Initializes the MediaStream object.
   * @method _init
   * @private
   * @for Stream
   * @since 0.6.0
   */
  var _init = function (stream) {
    _nativeRef = stream;
    id = Util.generateUUID();

    var i, j;

    var aTracks = stream.getAudioTracks();
    var vTracks = stream.getVideoTracks();

    for (i = 0; i < aTracks.length; i += 1) {
      _audioTracks[i] = new StreamTrack(aTracks[i], _config.audio.mute);
    }

    for (j = 0; j < vTracks.length; j += 1) {
      _videoTracks[j] = new StreamTrack(vTracks[j], _config.video.mute);
    }

    // Exposed to developers
    $$.id = id;
    $$.getAudioTracks = getAudioTracks;
    $$.getVideoTracks = getVideoTracks;
    $$.stop = stop;
    $$.attach = attach;
  };


  // Hook events settings in here
  // Event.hook($$); // this is an illustration

  if (typeof stream === 'object' && stream !== null) {

    if (stream instanceof MediaStream || stream instanceof LocalMediaStream) {
      _init(stream);

    } else {
      throw new Error('Provided stream object is not a MediaStream object');
    }

  } else {
    options = options || {};

    var audioConfig = IUtil._parseAudioConfig(options.audio || {});
    var videoConfig = IUtil._parseVideoConfig(options.video || {});

    _config = {
      audio: audioConfig.settings,
      video: videoConfig.settings
    };

    _constraints = {
      audio: audioConfig.userMedia,
      video: videoConfig.userMedia
    };

    window.navigator.getUserMedia(_constraints, _init, function (error) {
      throw error;
    });
  }
};
var StreamTrack = function (track, startAsMute) {

  'use strict';

  var $$ = this;

  /**
   * The Stream object id.
   * @attribute id
   * @type String
   * @for StreamTrack
   * @since 0.6.0
   */
  var id = null;


  /**
   * The Stream object type.
   * @attribute type
   * @type String
   * @for StreamTrack
   * @since 0.6.0
   */
  var type = null;

  /**
   * The Stream MediaStream reference.
   * @attribute _nativeRef
   * @type JSON
   * @private
   * @for StreamTrack
   * @since 0.6.0
   */
  var _nativeRef = null;


  /**
   * Mutes the current StreamTrack object.
   * @method mute
   * @for StreamTrack
   * @since 0.6.0
   */
  var mute = function () {
    _nativeRef.enabled = true;
  };

  /**
   * Unmutes the current StreamTrack object.
   * @method unmute
   * @for StreamTrack
   * @since 0.6.0
   */
  var unmute = function () {
    _nativeRef.enabled = false;
  };

  /**
   * Stops the current StreamTrack object streaming.
   * @method stop
   * @for StreamTrack
   * @since 0.6.0
   */
  var stop = function () {
    try {
      _nativeRef.stop();

    } catch (error) {
      throw new Error('The current browser implementation does not ' +
        'support MediaStreamTrack.stop()');
    }
  };

  /**
   * Initializes the MediaStreamTrack object.
   * @method _init
   * @private
   * @for StreamTrack
   * @since 0.6.0
   */
  var _init = function (track) {
    _nativeRef = track;
    id = Util.generateUUID();
    type = track.kind;

    if (startAsMute === true) {
      track.enabled = false;
    }

    // Exposed to developers
    $$.id = id;
    $$.type = type;
    $$.mute = mute;
    $$.unmute = unmute;
    $$.stop = stop;
  };


  // Hook events settings in here
  // Event.hook($$); // this is an illustration

  if (typeof track === 'object' && track !== null) {

    _init(track);

  } else {
    throw new Error('Provided track object is not a MediaStreamTrack object');
  }
};
var Util = {};

Util.generateUUID = function () {
  /* jshint ignore:start */
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0; d = Math.floor(d/16); return (c=='x' ? r : (r&0x7|0x8)).toString(16); }
  );
  return uuid;
  /* jshint ignore:end */
};