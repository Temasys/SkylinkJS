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

