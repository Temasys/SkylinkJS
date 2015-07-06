/*! skylinkjs - v1.0.0 - Mon Jul 06 2015 09:48:19 GMT+0800 (SGT) */

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
  self._constraints = null;

  // This stream readyState
  self.readyState = 'constructed';

  // This stream native MediaStream reference
  self._objectRef = null;

  // This stream audio tracks list
  self._audioTracks = [];

  // This stream video tracks list
  self._videoTracks = [];

  // Append events settings in here
  Event.mixin(self);
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
    self._objectRef.stop();

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

  self.readyState = 'stopped';
  self.trigger('stopped', {});
};

// attach the video element with the stream
Stream.prototype.attachStream = function (dom) {
  var self = this;

  // check if IE or Safari
  // muted / autoplay is not supported in the object element
  if (window.webrtcDetectedBrowser === 'safari' ||
    window.webrtcDetectedBrowser === 'IE') {

    // NOTE: hasAttribute is only supported from IE 8 onwards
    if (dom.hasAttribute('muted')) {
      dom.removeAttribute('muted');
    }

    if (dom.hasAttribute('autoplay')) {
      dom.removeAttribute('autoplay');
    }
  }

  window.attachMediaStream(dom, self._objectRef);
};

// append listeners
Stream.prototype._appendListeners = function (mstream) {
  var self = this;

  self._objectRef = mstream;

  var i, j;

  var audioTracks = mstream.getAudioTracks();
  var videoTracks = mstream.getVideoTracks();

  for (i = 0; i < audioTracks.length; i += 1) {
    self._audioTracks[i] = new StreamTrack(audioTracks[i]);
  }

  for (j = 0; j < videoTracks.length; j += 1) {
    self._videoTracks[j] = new StreamTrack(videoTracks[j]);
  }

  self.readyState = 'streaming';
  self.trigger('streaming', {});
};

// initialise the stream object and subscription of events
Stream.prototype.start = function (constraints, mstream) {
  var self = this;

  // we don't manage the parsing of the stream.
  // just your own rtc getUserMedia stuff here :)
  self._constraints = constraints;

  // reset to null if undefined to have a fixed null if empty
  if (typeof self._constraints === 'undefined') {
    self._constraints = null;
  }

  if (typeof mstream === 'object' && mstream !== null) {

    if (typeof mstream.getAudioTracks === 'function' &&
      typeof mstream.getVideoTracks === 'function') {
      self._appendListeners(mstream);
      return;

    } else {
      return Util.throw(new Error('Provided mstream object is not a MediaStream object'));
    }

  } else {

    window.navigator.getUserMedia(self._constraints, function (mstreamrecv) {
      self._appendListeners(mstreamrecv);
    }, function (error) {
      // NOTE: throw is not support for older IEs (ouch)
      return Util.throw(error);
    });
  }
};
var StreamTrack = function (mstrack) {

  'use strict';

  var self = this;

  // The type of track "audio" / "video"
  self.type = mstrack.kind;

  // This track readyState
  self.readyState = 'streaming';

  // This track muted state
  self.muted = !!mstrack.enabled;

  // This track native MediaStreamTrack reference
  self._objectRef = null;

  // Append events settings in here
  Event.mixin(self);

  if (typeof mstrack === 'object' && mstrack !== null) {
    self._appendListeners(mstrack);

  } else {
    return Util.throw(new Error('Provided track object is not a MediaStreamTrack object'));
  }
};

// append listeners
StreamTrack.prototype._appendListeners = function (mstrack) {
  var self = this;

  self._objectRef = mstrack;
};

// mute track (enabled)
StreamTrack.prototype.mute = function () {
  var self = this;

  self._objectRef.enabled = false;

  self.muted = true;
};

// unmute track (enabled)
StreamTrack.prototype.unmute = function () {
  var self = this;

  self._objectRef.enabled = true;

  self.muted = false;
};

// stop track
StreamTrack.prototype.stop = function () {
  var self = this;

  try {
    self._objectRef.stop();

  } catch (error) {
    return Util.throw(new Error('The current browser implementation does not ' +
      'support MediaStreamTrack.stop()'));
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

