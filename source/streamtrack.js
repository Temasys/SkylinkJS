/**
 * Handles the Stream's StreamTrack data.
 * @class StreamTrack
 * @constructor
 * @param {Object} track The MediaStreamTrack object to parse and hook events on.
 * @for Skylink
 * @since 0.6.0
 */
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