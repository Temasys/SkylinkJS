/**
 * Function that posts the stats to API.
 * @method _postStatsToApi
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._postStatsToApi = function (endpoint, params) {
  var self = this;

  // Noted that the API result returned "username" will change upon a /stats/client.
  if (!self._statIdRandomStr) {
    self._statIdRandomStr = (Date.now() + Math.floor(Math.random() * 1000000));
  }

  params.client_id = ((self._user && self._user.uid) || 'dummy') + '_' + self._statIdRandomStr;
  params.app_key = self._initOptions.appKey;
  params.timestamp = (new Date()).toISOString();

  // We need not use CORS and do not need to care if API returns success or failure
  // since we are just endlessly posting it.
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://api.temasys.io' + endpoint, true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(JSON.stringify(params));
};


/**
 * Function that handles the posting of /stats/client stats.
 * @method _handleStatsClient
 * @private
 * @for Skylink
 * @since 0.6.31
 */
Skylink.prototype._handleStatsClient = function() {
  var self = this;
  var statsObject = {
    username: (self._user && self._user.uid) || null,
    sdk: {
      name: 'web',
      version: self.VERSION
    },
    agent: {
      name: AdapterJS.webrtcDetectedBrowser,
      version: AdapterJS.webrtcDetectedVersion,
      platform: navigator.platform,
      plugin_version: (AdapterJS.WebRTCPlugin.plugin && AdapterJS.WebRTCPlugin.plugin.VERSION) || null
    },
    media: {
      audio: [],
      video: []
    }
  };

  var stream = null;
  var frameWidth = null;
  var frameHeight = null;

  // Retrieve the screensharing stream first since it is by default what the SDK sends first before the camera one.
  if (self._streams.screenshare && self._streams.screenshare.stream) {
    stream = self._streams.screenshare.stream;

  } else if (self._streams.userMedia && self._streams.userMedia.stream) {
    stream = self._streams.userMedia.stream;

    if (typeof self._streams.userMedia.constraints.video === 'object') {
      frameWidth = (typeof self._streams.userMedia.constraints.video.width === 'object' &&
        self._streams.userMedia.constraints.video.width.exact) || null;
      frameHeight = (typeof self._streams.userMedia.constraints.video.height === 'object' &&
        self._streams.userMedia.constraints.video.height.exact) || null;
    }
  }

  if (stream) {
    stream.getAudioTracks().forEach(function (track) {
      statsObject.media.audio.push({
        id: track.id,
        stream_id: stream.id || stream.label
      });
    });

    // TODO: Technically the video frame can be obtained by appending the stream into a dummy video element and then
    //       discarding the dummy video element.
    stream.getVideoTracks().forEach(function (track) {
      statsObject.media.video.push({
        id: track.id,
        stream_id: stream.id || stream.label,
        resolution_width: frameWidth,
        resolution_height: frameHeight
      });
    });
  }

  self._postStatsToApi('/stats/client', statsObject);
};
