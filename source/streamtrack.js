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