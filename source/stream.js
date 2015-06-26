/**
 * Handles the Stream data.
 * @class Stream
 * @constructor
 * @param {Object} stream The MediaStream object to parse and hook events on.
 * @param {JSON} options If MediaStream object is not provided, pass in the options
 *   to retrieve and hook a MediaStream object.
 * @for Skylink
 * @since 0.6.0
 */
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