/*! skylinkjs - v1.0.0 - Fri Jul 03 2015 11:11:59 GMT+0800 (SGT) */

var Event = {

	on: function(event, callback){
		this.listeners.on[event] = this.listeners.on[event] || [];
    	this.listeners.on[event].push(callback);
		return this;
	},

	off: function(event, callback){

		//Remove all listeners if event is not provided
		if (typeof event === 'undefined'){
			this.listeners.on = {};
			this.listeners.once = {};
		}

		//Remove all callbacks of the specified events if callback is not provided
		if (typeof callback === 'undefined'){
			this.listeners.on[event]=[];
			this.listeners.once[event]=[];
		}

		else{

			//Remove single on callback
			if (this.listeners.on[event]){				
				this.removeListener(this.listeners.on[event], callback);
			}
		
			//Remove single once callback
			if (this.listeners.once[event]){
				this.removeListener(this.listeners.once[event], callback);
			}
		}
		return this;
	},

	once: function(event, callback){
		this.listeners.once[event] = this.listeners.once[event] || [];
    	this.listeners.once[event].push(callback);
		return this;
	},

	trigger: function(event){
		var args = Array.prototype.slice.call(arguments,1);

		if (this.listeners.on[event]){
			for (var i=0; i<this.listeners.on[event].length; i++) {
		    	this.listeners.on[event][i].apply(this, args);
		    }
		}

		if (this.listeners.once[event]){
			for (var i=0; i<this.listeners.once[event].length; i++){
		    	this.listeners.once[event][i].apply(this, args);
		    	this.listeners.once[event].splice(i,1);
		    	i--;
		    }
		}

		return this;
	},

	removeListener: function(listeners, listener){
		for (var i=0; i<listeners.length; i++){
			if (listeners[i]===listener){
				listeners.splice(i,1);
				return;
			}
		}
	},

	mixin: function(object){
		var methods = ['on','off','once','trigger','removeListener'];
		for (var i=0; i<methods.length; i++){
			if (Event.hasOwnProperty(methods[i]) ){
				if (typeof object === 'function'){
					object.prototype[methods[i]]=Event[methods[i]];	
				}
				else{
					object[methods[i]]=Event[methods[i]];
				}
			}
		}

		object.listeners = {
			on: {},
			once: {}
		}

		return object;
	}
};
var Stream = function () {

  'use strict';

  var self = this;

  // This stream constraints
  self._constraints = {};

  // This stream native MediaStream reference
  self._objectRef = null;

  // This stream audio tracks list
  self._audioTracks = [];

  // This stream video tracks list
  self._videoTracks = [];

  // Hook events settings in here
  // Event.hook($$); // this is an illustration
};


// getAudioTracks function. Returns AudioStreamTrack objects.
Stream.prototype.getAudioTracks = function () {
  var self = this;

  return self._audioTracks;
};

// getVideoTracks function. Returns VideoStreamTrack objects.
Stream.prototype.getVideoTracks = function () {
  var self = this;

  return self._videoTracks;
};

// stop the stream itself.
Stream.prototype.stop = function () {
  var self = this;

  try {
    self._nativeRef.stop();

  } catch (error) {
    // MediaStream.stop is not implemented.
    // Stop all MediaStreamTracks

    var i, j;

    for (i = 0; i < self._audioTracks.length; i += 1) {
      self._audioTracks[i].stop();
    }

    for (j = 0; j < self._videoTracks.length; j += 1) {
      self._videoTracks[j].stop();
    }
  }
};

// attach the video element with the stream
Stream.prototype.attachStream = function (dom) {
  var self = this;

  window.attachMediaStream(dom, self._nativeRef);
};

Stream.prototype._init = function (stream) {
  self._nativeRef = stream;

  var i, j;

  var aTracks = stream.getAudioTracks();
  var vTracks = stream.getVideoTracks();

  for (i = 0; i < aTracks.length; i += 1) {
    self._audioTracks[i] = new StreamTrack(aTracks[i], _config.audio.mute);
  }

  for (j = 0; j < vTracks.length; j += 1) {
    self._videoTracks[j] = new StreamTrack(vTracks[j], _config.video.mute);
  }
};

// initialise the stream object and subscription of events
Stream.prototype.start = function (constraints, stream) {
  var self = this;

  if (typeof stream === 'object' && stream !== null) {

    if (stream instanceof MediaStream || stream instanceof LocalMediaStream) {
      self._init(stream);

    } else {
      throw new Error('Provided stream object is not a MediaStream object');
    }

  } else {
    // we don't manage the parsing of the stream.
    // just your own rtc getUserMedia stuff here :)
    self._constraints = options;

    window.navigator.getUserMedia(self._constraints, self._init, function (error) {
      // NOTE: throw is not support for older IEs (ouch)
      return Util.throw(error);
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

// Generates unique ID
Util.generateUUID = function () {
  /* jshint ignore:start */
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0; d = Math.floor(d/16); return (c=='x' ? r : (r&0x7|0x8)).toString(16); }
  );
  return uuid;
  /* jshint ignore:end */
};

// Helps to polyfill IE's unsupported throw.
// If supported throw, if not console error
Util.throwError = function (error) {
  if (window.webrtcDetectedBrowser === 'IE') {
    console.error(error);
    return;
  }
  throw error;
};

