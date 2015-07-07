var Socket = function () {

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