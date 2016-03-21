/**
 * These are the list of available platform signaling servers Skylink
 *   should connect to for faster connectivity.
 * @attribute REGIONAL_SERVER
 * @type JSON
 * @param {String} APAC1 <small>Value <code>"sg"</code></small>
 *   The option to select the Asia pacific server 1 regional server.
 * @param {String} US1 <small>Value <code>"us2"</code></small>
 *   The option to select the US server 1 regional server.
 * @deprecated Signaling server selection is handled on
 *    the server side based on load and latency.
 * @readOnly
 * @component Room
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype.REGIONAL_SERVER = {
  APAC1: 'sg',
  US1: 'us2'
};

/**
 * The flag to enforce an SSL platform signaling and platform server connection.
 * If self domain accessing protocol is <code>https:</code>, SSL connections
 *   would be automatically used. This flag is mostly used for self domain accessing protocol
 *   that is <code>http:</code> and enforcing the SSL connections for
 *   platform signaling and platform server connection.
 * @attribute _forceSSL
 * @type Boolean
 * @default false
 * @required
 * @private
 * @component Room
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._forceSSL = false;

/**
 * The flag to enforce an SSL TURN server connection.
 * If self domain accessing protocol is <code>https:</code>, SSL connections
 *   would be automatically used. This flag is mostly used for self domain accessing protocol
 *   that is <code>http:</code> and enforcing the SSL connections for
 *   TURN server connection.
 * This will configure TURN server connection using port <code>443</code> only and
 *   if <code>turns:</code> protocol is supported, it will use <code>turns:</code> protocol.
 * @attribute _forceTURNSSL
 * @type Boolean
 * @default false
 * @required
 * @private
 * @component Room
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._forceTURNSSL = false;

/**
 * The flag to enforce TURN server connection for quicker connectivity.
 * @attribute _forceTURN
 * @type Boolean
 * @default false
 * @required
 * @private
 * @component Room
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._forceTURN = false;

/**
 * The constructed REST path that Skylink makes a <code>HTTP /GET</code> from
 *   to retrieve the connection information required.
 * @attribute _path
 * @type String
 * @required
 * @private
 * @component Room
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._path = null;

/**
 * The regional server that Skylink should connect to for fastest connectivity.
 * @attribute _serverRegion
 * @type String
 * @private
 * @component Room
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._serverRegion = null;

/**
 * The platform server URL that Skylink can construct the REST path with to make
 *   a <code>HTTP /GET</code> to retrieve the connection information required.
 * If the value is not the default value, it's mostly for debugging purposes.
 * It's not advisable to allow developers to set the custom server URL unless
 *   they are aware of what they are doing, as this is a debugging feature.
 * @attribute _roomServer
 * @type String
 * @default "//api.temasys.com.sg"
 * @private
 * @component Room
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._roomServer = '//api.temasys.com.sg';

/**
 * Stores the Application Key that is configured in the
 *   {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}.
 * @attribute _appKey
 * @type String
 * @private
 * @component Room
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._appKey = null;

/**
 * Stores the default room that is configured in the
 *   {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}.
 * If no room is provided in {{#crossLink "Skylink/joinRoom:method"}}joinRoom(){{/crossLink}},
 *   this is the room that self would join to by default.
 * If the value is not provided in {{#crossLink "Skylink/init:method"}}init(){{/crossLink}},
 *   by default, the value is the Application Key that is configured
 *   in {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}.
 * @attribute _defaultRoom
 * @type String
 * @default Skylink._appKey
 * @private
 * @component Room
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._defaultRoom = null;

/**
 * Stores the new persistent room meeting start datetime stamp in
 *   [(ISO 8601 format)](https://en.wikipedia.org/wiki/ISO_8601).
 * This will start a new meeting based on the starting datetime stamp
 *   in the room that was selected to join.
 * The start date time of the room will not affect non persistent room connection.
 * The persistent room feature is configurable in the Application Key
 *   in the developer console.
 * @attribute _roomStart
 * @type String
 * @private
 * @optional
 * @component Room
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._roomStart = null;

/**
 * Stores the new persistent room meeting duration (in hours)
 *   that the current new meeting duration should be in the room
 *   that was selected to join.
 * The duration will not affect non persistent room connection.
 * The persistent room feature is configurable in the Application Key
 *   in the developer console.
 * @attribute _roomDuration
 * @type Number
 * @private
 * @optional
 * @component Room
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._roomDuration = null;

/**
 * Stores the room credentials for Application Key.
 * This is required for rooms connecting without CORS verification
 *   or starting a new persistent room meeting.
 * To generate the credentials:
 * - Concatenate a string that consists of the room name
 *   the room meeting duration (in hours) and the start date timestamp (in ISO 8601 format).
 *   Format <code>room + duration + startDateTimeStamp</code>.
 * - Hash the concatenated string with the Application Key token using
 *   [SHA-1](https://en.wikipedia.org/wiki/SHA-1).
 *   You may use the [CryptoJS.HmacSHA1](https://code.google.com/p/crypto-js/#HMAC) function to do so.
 *   Example <code>var hash = CryptoJS.HmacSHA1(concatenatedString, token);</code>.
 * - Convert the hash to a [Base64](https://en.wikipedia.org/wiki/Base64) encoded string. You may use the
 *   [CryptoJS.enc.Base64](https://code.google.com/p/crypto-js/#The_Cipher_Output) function
 *   to do so. Example <code>var base64String = hash.toString(CryptoJS.enc.Base64); </code>.
 * - Encode the Base64 encoded string to a URI component using UTF-8 encoding with
 *   [encodeURIComponent()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent).
 *   Example <code>var credentials = encodeURIComponent(base64String);</code>
 * and the duration.
 * @attribute _roomCredentials
 * @type String
 * @private
 * @optional
 * @component Room
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._roomCredentials = null;

/**
 * Stores the current Skylink room connection retrieval ready state.
 * [Rel: Skylink.READY_STATE_CHANGE]
 * @attribute _readyState
 * @type Number
 * @private
 * @required
 * @component Room
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._readyState = 0;

/**
 * Stores the Skylink server connection key for the selected room.
 * @attribute _key
 * @type String
 * @private
 * @component Room
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._key = null;

/**
 * Stores the Skylink server Application Key owner string for the selected room.
 * @attribute _appKeyOwner
 * @type String
 * @private
 * @component Room
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._appKeyOwner = null;

/**
 * Stores the room connection information that is passed for starting
 *   the selected room connection. Some of these information are also
 *   used and required to send for every messages sent to the platform
 *   signaling connection for targeting the correct room and
 *   self identification in the room.
 * @attribute _room
 * @type JSON
 * @param {String} id The room ID for identification to the platform signaling connection.
 * @param {String} token The generated room token given by the platform server for starting
 *    the platform signaling connection.
 * @param {String} startDateTime The start datetime stamp (in The startDateTime in
 *    [(ISO 8601 format)](https://en.wikipedia.org/wiki/ISO_8601) that the call has started
 *    sent by the platform server as an indication for the starting datetime of
 *    the platform signaling connection to self.
 * @param {String} duration The duration of the room meeting (in hours). This duration will
 *    not affect non persistent room.
 * @param {JSON} connection Connection The RTCPeerConnection constraints and configuration.
 * @param {JSON} connection.peerConstraints <i>Deprecated feature</i>. The RTCPeerConnection
 *    constraints that is passed in this format <code>new RTCPeerConnection(config, constraints);</code>.
 *    This feature is not documented in W3C Specification draft and not advisable to use.
 * @param {JSON} connection.peerConfig The RTCPeerConnection
 *    [RTCConfiguration](http://w3c.github.io/webrtc-pc/#idl-def-RTCConfiguration).
 * @param {JSON} connection.offerConstraints <i>Deprecated feature</i>. The RTCPeerConnection
 *    [RTCOfferOptions](http://w3c.github.io/webrtc-pc/#idl-def-RTCOfferOptions) used in
 *    <code>RTCPeerConnection.createOffer(successCb, failureCb, options);</code>.
 * @param {JSON} connection.sdpConstraints <i>Not in use</i>. The RTCPeerConnection
 *    [RTCAnswerOptions](http://w3c.github.io/webrtc-pc/#idl-def-RTCAnswerOptions) to be used
 *    in <code>RTCPeerConnection.createAnswer(successCb, failureCb, options);</code>.
 *    This is currently not in use due to not all browsers supporting this feature yet.
 * @param {JSON} connection.mediaConstraints <i>Deprecated feature</i>. The getUserMedia()
 *    [MediaStreamConstraints](https://w3c.github.io/mediacapture-main/getusermedia.html#idl-def-MediaStreamConstraints)
 *    in <code>getUserMedia(constraints, successCb, failureCb);</code>.
 * @required
 * @private
 * @component Room
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._room = null;

/**
 * Starts a <code>HTTP /GET</code> REST call to the platform server to
 *   retrieve the required connection information.
 * @method _requestServerInfo
 * @param {String} method The HTTP method. The value should be provided as
 *   <code>"GET"</code>.
 * @param {String} url The HTTP URI to invoke the REST call to. The
 *   value should be {{#crossLink "Skylink/_path:attribute"}}_path{{/crossLink}}.
 * @param {Function} callback The callback fired The callback fired after the
 *   <code>HTTP /GET</code> REST call has a response from the platform server.
 * @param {Number} callback.status The HTTP status code of the HTTP response
 *   given by the platform server.
 * @param {JSON} callback.response The HTTP response data after the platform server
 *   has responded with the HTTP request.
 * @param {Boolean} callback.response.success The response from the platform server
 *   if Application Key connection retrieval is successful and validated or not.
 * @param {String} callback.response.pc_constraints For success state. The RTCPeerConnection
 *   constraints that would be configured in
 *   {{#crossLink "Skylink/_room:attribute"}}_room.peerConstraints{{/crossLink}} in
 *   {{#crossLink "Skylink/_parseInfo:method"}}_parseInfo(){{/crossLink}}.
 *   The data is in JSON stringified string and requires converting the JSON string
 *      to an JSON object to use the object.
 * @param {String} callback.response.media_constraints For success state. The getUserMedia()
 *   MediaStreamConstraints that would be configured in
 *   {{#crossLink "Skylink/_room:attribute"}}_room.mediaConstraints{{/crossLink}} in
 *   {{#crossLink "Skylink/_parseInfo:method"}}_parseInfo(){{/crossLink}}.
 *   The data is in JSON stringified string and requires converting the JSON string
 *     to an JSON object to use the object.
 * @param {String} callback.response.offer_constraints For success state. The RTCPeerConnection
 *   RTCOfferOptions that would be configured in
 *   {{#crossLink "Skylink/_room:attribute"}}_room.offerConstraints{{/crossLink}} in
 *   {{#crossLink "Skylink/_parseInfo:method"}}_parseInfo(){{/crossLink}}.
 *   The data is in JSON stringified string and requires converting the JSON string
 *      to an JSON object to use the object.
 * @param {String} callback.response.bandwidth For success state. The self
 *   streaming bandwidth settings. Setting the bandwidth flags may not
 *   force set the bandwidth for each connection stream channels as it depends
 *   on how the browser handles the bandwidth bitrate. Values are configured
 *   in <var>kb/s</var>.
 * @param {String} callback.response.bandwidth.audio The default
 *   audio stream channel for self Stream object bandwidth
 *   that audio streaming should use in <var>kb/s</var>.
 * @param {String} callback.response.bandwidth.video The default
 *   video stream channel for self Stream object bandwidth
 *   that video streaming should use in <var>kb/s</var>.
 * @param {String} callback.response.bandwidth.data The default
 *   datachannel channel for the DataChannel connection bandwidth
 *   that datachannel connection per packet should be able use in <var>kb/s</var>.
 * @param {String} callback.response.cid For success state. The Skylink server connection key for the
 *   selected room. This would be stored in {{#crossLink "Skylink/_key:attribute"}}_key{{/crossLink}}
 *   in {{#crossLink "Skylink/_parseInfo:method"}}_parseInfo(){{/crossLink}}.
 * @param {String} callback.response.apiOwner For success state. The Skylink server Application
 *   Key owner string for the selected room. This would be stored in
 *   {{#crossLink "Skylink/_appKeyOwner:attribute"}}_appKeyOwner{{/crossLink}}
 *   in {{#crossLink "Skylink/_parseInfo:method"}}_parseInfo(){{/crossLink}}.
 * @param {Array} callback.response.httpPortList For success state. The list of HTTP
 *   ports for reconnection retries. This would be stored in
 *   {{#crossLink "Skylink/_socketPorts:attribute"}}_socketPorts.http:{{/crossLink}}.
 * @param {Number} callback.response.httpPortList.(#index) The HTTP port that Skylink
 *   could reattempt to establish for a signaling connection with <code>http:</code> protocol.
 * @param {Array} callback.response.httpsPortList For success state. The list of HTTPS
 *   ports for reconnection retries. This would be stored in
 *   {{#crossLink "Skylink/_socketPorts:attribute"}}_socketPorts.https:{{/crossLink}}.
 * @param {Number} callback.response.httpsPortList.(#index) The HTTPS port that Skylink
 *   could reattempt to establish for a signaling connection with <code>https:</code> protocol or
 *   when {{#crossLink "Skylink/_forceSSL:attribute"}}_forceSSL{{/crossLink}} is enabled.
 * @param {String} callback.response.ipSigserver For success state. The platform signaling endpoint URI
 *   to open socket connection with. This would be stored in
 *   {{#crossLink "Skylink/_signalingServer:attribute"}}_signalingServer{{/crossLink}}.
 * @param {String} callback.response.roomCred For success state. The generated room token given
 *   by the platform server for starting the platform signaling connection. This would be stored in
 *   {{#crossLink "Skylink/_room:attribute"}}_room.token{{/crossLink}}.
 * @param {String} callback.response.room_key For success state. The room ID for identification
 *   to the platform signaling connection. This would be stored in
 *   {{#crossLink "Skylink/_room:attribute"}}_room.id{{/crossLink}}.
 * @param {String} callback.response.start For success state. The start datetime stamp (in The startDateTime in
 *   [(ISO 8601 format)](https://en.wikipedia.org/wiki/ISO_8601) that the call has started
 *   sent by the platform server as an indication for the starting datetime of
 *   the platform signaling connection to self. This would be stored in
 *   {{#crossLink "Skylink/_room:attribute"}}_room.startDateTime{{/crossLink}}.
 * @param {String} callback.response.timeStamp For success state. The self session timestamp.
 *   This would be stored in {{#crossLink "Skylink/_user:attribute"}}_user.timeStamp{{/crossLink}}
 * @param {String} callback.response.userCred For success state. The self session access token.
 *   This would be stored in {{#crossLink "Skylink/_user:attribute"}}_user.token{{/crossLink}}.
 * @param {String} callback.response.username For success state. The self session ID.
 *   This would be stored in {{#crossLink "Skylink/_user:attribute"}}_user.username{{/crossLink}}.
 * @param {String} callback.response.info For failure state. The error message thrown by
 *   the platform server.
 * @param {Number} callback.response.error For failure state. The error code of the error thrown by
 *   the platform server.
 * @param {JSON} params HTTP Params The HTTP data parameters that would be
 *    <code>application/json;charset=UTF-8</code> encoded when sent to the
 *    platform server.
 * @private
 * @component Room
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._requestServerInfo = function(method, url, callback, params) {
  var self = this;
  // XDomainRequest is supported in IE8 - 9
  var useXDomainRequest = typeof window.XDomainRequest === 'function' ||
    typeof window.XDomainRequest === 'object';

  self._socketUseXDR = useXDomainRequest;
  var xhr;

  // set force SSL option
  url = (self._forceSSL) ? 'https:' + url : url;

  if (useXDomainRequest) {
    log.debug([null, 'XMLHttpRequest', method, 'Using XDomainRequest. ' +
      'XMLHttpRequest is now XDomainRequest'], {
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion
    });
    xhr = new XDomainRequest();
    xhr.setContentType = function (contentType) {
      xhr.contentType = contentType;
    };
  } else {
    log.debug([null, 'XMLHttpRequest', method, 'Using XMLHttpRequest'], {
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion
    });
    xhr = new window.XMLHttpRequest();
    xhr.setContentType = function (contentType) {
      xhr.setRequestHeader('Content-type', contentType);
    };
  }

  xhr.onload = function () {
    var response = xhr.responseText || xhr.response;
    var status = xhr.status || 200;
    log.debug([null, 'XMLHttpRequest', method, 'Received sessions parameters'],
      JSON.parse(response || '{}'));
    callback(status, JSON.parse(response || '{}'));
  };

  xhr.onerror = function (error) {
    log.error([null, 'XMLHttpRequest', method, 'Failed retrieving information:'],
      { status: xhr.status });
    self._readyState = -1;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: xhr.status || null,
      content: 'Network error occurred. (Status: ' + xhr.status + ')',
      errorCode: self.READY_STATE_CHANGE_ERROR.XML_HTTP_REQUEST_ERROR
    }, self._selectedRoom);
  };

  xhr.onprogress = function () {
    log.debug([null, 'XMLHttpRequest', method,
      'Retrieving information and config from webserver. Url:'], url);
    log.debug([null, 'XMLHttpRequest', method, 'Provided parameters:'], params);
  };

  xhr.open(method, url, true);
  if (params) {
    xhr.setContentType('application/json;charset=UTF-8');
    xhr.send(JSON.stringify(params));
  } else {
    xhr.send();
  }
};

/**
 * Parses the connection information retrieved from the platform server and
 *   stores them into the relevant attributes in
 *   {{#crossLink "Skylink/_room:attribute"}}_room{{/crossLink}} and
 *   {{#crossLink "Skylink/_user:attribute"}}_user{{/crossLink}}.
 * @method _parseInfo
 * @param {JSON} info The HTTP response data if the HTTP status
 *   code is <code>200</code> (which means <var>HTTP OK</var> code)
 * @param {String} info.pc_constraints The RTCPeerConnection constraints.
 *   The data is in JSON stringified string and requires converting the JSON string
 *      to an JSON object to use the object.
 * @param {String} info.media_constraints The getUserMedia() MediaStreamConstraints.
 *   The data is in JSON stringified string and requires converting the JSON string
 *      to an JSON object to use the object.
 * @param {String} info.offer_constraints The RTCPeerConnection RTCOfferOptions.
 *   The data is in JSON stringified string and requires converting the JSON string
 *      to an JSON object to use the object.
 * @param {String} info.bandwidth The self
 *   streaming bandwidth settings. Setting the bandwidth flags may not
 *   force set the bandwidth for each connection stream channels as it depends
 *   on how the browser handles the bandwidth bitrate. Values are configured
 *   in <var>kb/s</var>.
 * @param {String} info.bandwidth.audio The default
 *   audio stream channel for self Stream object bandwidth
 *   that audio streaming should use in <var>kb/s</var>.
 * @param {String} info.bandwidth.video The default
 *   video stream channel for self Stream object bandwidth
 *   that video streaming should use in <var>kb/s</var>.
 * @param {String} info.bandwidth.data The default
 *   datachannel channel for the DataChannel connection bandwidth
 *   that datachannel connection per packet should be able use in <var>kb/s</var>.
 * @param {String} info.cid The Skylink server connection key for starting the
 *   selected room connection.
 * @param {String} info.apiOwner The Skylink server Application Key owner string for the selected room.
 * @param {Array} info.httpPortList The list of HTTP
 *   ports for reconnection retries.
 * @param {Number} info.httpPortList.(#index) The HTTP port that Skylink
 *   could reattempt to establish for a signaling connection with <code>http:</code> protocol.
 * @param {Array} info.httpsPortList The list of HTTPS
 *   ports for reconnection retries.
 * @param {Number} info.httpsPortList.(#index) The HTTPS port that Skylink
 *   could reattempt to establish for a signaling connection with <code>https:</code> protocol or
 *   when {{#crossLink "Skylink/_forceSSL:attribute"}}_forceSSL{{/crossLink}} is enabled.
 * @param {String} info.ipSigserver The platform signaling endpoint URI
 *   to open socket connection with.
 * @param {String} info.roomCred The generated room token given
 *   by the platform server for starting the platform signaling connection.
 * @param {String} info.room_key For success state. The room ID for identification
 *   to the platform signaling connection.
 * @param {String} info.start The start datetime stamp (in The startDateTime in
 *   [(ISO 8601 format)](https://en.wikipedia.org/wiki/ISO_8601) that the call has started
 *   sent by the platform server as an indication for the starting datetime of
 *   the platform signaling connection to self.
 * @param {String} info.timeStamp The self session timestamp.
 * @param {String} info.userCred The self session access token.
 * @param {String} info.username The self session ID.
 * @trigger readyStateChange
 * @private
 * @required
 * @component Room
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._parseInfo = function(info) {
  log.log('Parsing parameter from server', info);
  if (!info.pc_constraints && !info.offer_constraints) {
    this._trigger('readyStateChange', this.READY_STATE_CHANGE.ERROR, {
      status: 200,
      content: info.info,
      errorCode: info.error
    }, self._selectedRoom);
    return;
  }

  log.debug('Peer connection constraints:', info.pc_constraints);
  log.debug('Offer constraints:', info.offer_constraints);

  this._key = info.cid;
  this._appKeyOwner = info.apiOwner;

  this._signalingServer = info.ipSigserver;

  this._isPrivileged = info.isPrivileged;
  this._autoIntroduce = info.autoIntroduce;
  this._parentKey = info.room_key.substring(0,36);

  this._user = {
    uid: info.username,
    token: info.userCred,
    timeStamp: info.timeStamp,
    streams: [],
    info: {}
  };
  this._room = {
    id: info.room_key,
    token: info.roomCred,
    startDateTime: info.start,
    duration: info.len,
    connection: {
      peerConstraints: JSON.parse(info.pc_constraints),
      peerConfig: null,
      offerConstraints: JSON.parse(info.offer_constraints),
      sdpConstraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: true
        }
      },
      mediaConstraints: JSON.parse(info.media_constraints)
    }
  };
  this._parseDefaultMediaStreamSettings(this._room.connection.mediaConstraints);

  // set the socket ports
  this._socketPorts = {
    'http:': info.httpPortList,
    'https:': info.httpsPortList
  };

  // use default bandwidth and media resolution provided by server
  //this._streamSettings.bandwidth = info.bandwidth;
  //this._streamSettings.video = info.video;
  this._readyState = 2;
  this._trigger('readyStateChange', this.READY_STATE_CHANGE.COMPLETED, null, this._selectedRoom);
  log.info('Parsed parameters from webserver. ' +
    'Ready for web-realtime communication');

};

/**
 * Starts loading the required dependencies and then retrieve the required
 *   connection information from the platform server.
 * @method _loadInfo
 * @trigger readyStateChange
 * @private
 * @required
 * @component Room
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._loadInfo = function() {
  var self = this;

  // check if adapterjs has been loaded already first or not
  var adapter = (function () {
    try {
      return window.AdapterJS || AdapterJS;
    } catch (error) {
      return false;
    }
  })();

  if (!(!!adapter ? typeof adapter.webRTCReady === 'function' : false)) {
    var noAdapterErrorMsg = 'AdapterJS dependency is not loaded or incorrect AdapterJS dependency is used';
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: noAdapterErrorMsg,
      errorCode: self.READY_STATE_CHANGE_ERROR.ADAPTER_NO_LOADED
    }, self._selectedRoom);
    return;
  }
  if (!window.io) {
    log.error('Socket.io not loaded. Please load socket.io');
    self._readyState = -1;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: 'Socket.io not found',
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_SOCKET_IO
    }, self._selectedRoom);
    return;
  }
  if (!window.XMLHttpRequest) {
    log.error('XMLHttpRequest not supported. Please upgrade your browser');
    self._readyState = -1;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: 'XMLHttpRequest not available',
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_XMLHTTPREQUEST_SUPPORT
    }, self._selectedRoom);
    return;
  }
  if (!self._path) {
    log.error('Skylink is not initialised. Please call init() first');
    self._readyState = -1;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: 'No API Path is found',
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_PATH
    }, self._selectedRoom);
    return;
  }
  adapter.webRTCReady(function () {
    if (!window.RTCPeerConnection) {
      log.error('WebRTC not supported. Please upgrade your browser');
      self._readyState = -1;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
        status: null,
        content: 'WebRTC not available',
        errorCode: self.READY_STATE_CHANGE_ERROR.NO_WEBRTC_SUPPORT
      }, self._selectedRoom);
      return;
    }
    self._readyState = 1;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.LOADING, null, self._selectedRoom);
    self._requestServerInfo('GET', self._path, function(status, response) {
      if (status !== 200) {
        // 403 - Room is locked
        // 401 - API Not authorized
        // 402 - run out of credits
        var errorMessage = 'XMLHttpRequest status not OK\nStatus was: ' + status;
        self._readyState = 0;
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
          status: status,
          content: (response) ? (response.info || errorMessage) : errorMessage,
          errorCode: response.error ||
            self.READY_STATE_CHANGE_ERROR.INVALID_XMLHTTPREQUEST_STATUS
        }, self._selectedRoom);
        return;
      }
      self._parseInfo(response);
    });
  });
};

/**
 * Starts loading the required connection information to start connection
 *   based on the selected room in {{#crossLink "Skylink/joinRoom:method"}}joinRoom(){{/crossLink}}.
 * @method _initSelectedRoom
 * @param {String} [room] The room to retrieve required connection information
 *   to start connection. If room is not provided, the room
 *   would default to the the <code>defaultRoom</code> option set
 *   in {{#crossLink "Skylink/init:method"}}init() settings{{/crossLink}}.
 * @param {Function} callback The callback fired after required connection
 *   information has been retrieved successfully with the provided media
 *   settings or have met with an exception.
 * @param {Object} callback.error The error object received in the callback.
 *   If received as <code>null</code>, it means that there is no errors.
 * @trigger readyStateChange
 * @private
 * @component Room
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._initSelectedRoom = function(room, callback) {
  var self = this;
  if (typeof room === 'function' || typeof room === 'undefined') {
    log.error('Invalid room provided. Room:', room);
    return;
  }
  var defaultRoom = self._defaultRoom;
  var initOptions = {
    roomServer: self._roomServer,
    defaultRoom: room || defaultRoom,
    appKey: self._appKey,
    region: self._serverRegion,
    enableDataChannel: self._enableDataChannel,
    enableIceTrickle: self._enableIceTrickle
  };
  if (self._roomCredentials) {
    initOptions.credentials = {
      credentials: self._roomCredentials,
      duration: self._roomDuration,
      startDateTime: self._roomStart
    };
  }
  self.init(initOptions, function (error, success) {
    self._defaultRoom = defaultRoom;
    if (error) {
      callback(error);
    } else {
      callback(null);
    }
  });
};

/**
 * Initialises and configures Skylink to begin any connection.
 * <b>NOTE</b> that this is the first method that has to be called before
 *   using any other functionalities other than debugging features like
 *   {{#crossLink "Skylink/setLogLevel:method"}}setLogLevel(){{/crossLink}} and
 *   {{#crossLink "Skylink/setDebugMode:method"}}setDebugMode(){{/crossLink}} and
 *   after all event subscriptions like {{#crossLink "Skylink/on:method"}}on(){{/crossLink}}
 *   or {{#crossLink "Skylink/once:method"}}once(){{/crossLink}} has been made.
 * This is where the Application Key is configured and attached to Skylink for usage.
 * @method init
 * @param {String|JSON} options The configuration settings for Skylink.
 *   If provided options is a <var>typeof</var> <code>string</code>, it will
 *   be interpreted as the Application Key being provided.
 * @param {String} options.appKey Previously known as <code>apiKey</code>.
 *   The Application Key that Skylink uses for initialising and connecting rooms.
 * @param {String} [options.defaultRoom=options.appKey] The default room that
 *   Skylink should connect to if there is no room provided in
 *   {{#crossLink "Skylink/joinRoom:method"}}joinRoom(){{/crossLink}}.
 *   If this value is not provided, the default room value would be
 *   the Application Key provided.
 * @param {String} [options.roomServer] The platform server URL that Skylink makes a
 *   <code>HTTP /GET</code> to retrieve the connection information required.
 *   This is a debugging feature, and it's not advisable to manipulate
 *     this value unless you are using a beta platform server.
 * @param {String} [options.region] <i>Deprecated feature</i>. The regional server that Skylink
 *    should connect to for fastest connectivity. [Rel: Skylink.REGIONAL_SERVER]
 * @param {Boolean} [options.enableIceTrickle=true] <i>Debugging Feature</i>.
 *    The flag that indicates if PeerConnections
 *    should enable trickling of ICE to connect the ICE connection. Configuring
 *    this value to <code>false</code> may result in a slower connection but
 *    a more stable connection.
 * @param {Boolean} [options.enableDataChannel=true] <i>Debugging feature</i>.
 *   The flag that indicates if PeerConnections
 *   should have any DataChannel connections. Configuring this value to <code>false</code>
 *   may result in failure to use features like
 *   {{#crossLink "Skylink/sendBlobData:method"}}sendBlobData(){{/crossLink}},
 *   {{#crossLink "Skylink/sendP2PMessage:method"}}sendP2PMessage(){{/crossLink}} and
 *   {{#crossLink "Skylink/sendURLData:method"}}sendURLData(){{/crossLink}} or any
 *   DataChannel connection related services.
 * @param {Boolean} [options.enableTURNServer=true] <i>Debugging feature</i>.
 *   The flag that indicates if PeerConnections connection should use any TURN server connection.
 *   Tampering this flag may disable any successful Peer connection
 *   that is behind any firewalls, so set this value at your own risk.
 * @param {Boolean} [options.enableSTUNServer=true] <i>Debugging feature</i>.
 *   The flag that indicates if PeerConnections connection should use any STUN server connection.
 *   Tampering this flag may cause issues to connections, so set this value at your own risk.
 * @param {Boolean} [options.forceTURN=false] The flag that indicates if PeerConnections connection
 *   should only use TURN server connection which enables a quicker connectivity. This forces
 *   connection through TURN server and use TURN server connection only. If TURN is not enabled for
 *   the Application Key, connection may not work with this flag enabled.
 *   This configuration will override the settings for <code>enableTURNServer</code>
 *   and <code>enableSTUNServer</code> and set <code>enableTURNServer</code> as <code>true</code> and
 *   <code>enableSTUNServer</code> as <code>false</code> if the value is set to <code>true</code>.
 * @param {Boolean} [options.usePublicSTUN=true] The flag that indicates if PeerConnections connection
 *   should enable usage of public STUN server connection connectivity.
 *   This configuration would not work if <code>enableSTUNServer</code> is set to <code>false</code>
 *   or <code>forceTURN</code> is set to <code>true</code>.
 * @param {Boolean} [options.TURNServerTransport=Skylink.TURN_TRANSPORT.ANY] <i>Debugging feature</i>.
 *   The TURN server transport to enable for TURN server connections.
 *   Tampering this flag may cause issues to connections, so set this value at your own risk.
 *   [Rel: Skylink.TURN_TRANSPORT]
 * @param {JSON} [options.credentials] The credentials configured for starting a new persistent
 *   room meeting or connecting with Application Keys that do not use CORS authentication.
 *   Setting the <code>startDateTime</code> or the <code>duration</code> will not affect
 *   the actual duration for non persistent rooms. This feature would only affect connections with
 *   Application Keys that is configured for persistent room feature.
 *   To enable persistent room or disable CORS, you may set it in the developer console.
 *   CORS may be disabled by setting the platform to <code>"Other"</code>.
 * @param {String} options.credentials.startDateTime The room start datetime stamp in
 *   <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601 format</a>.
 *   This will start a new meeting based on the starting datetime stamp
 *   in the room that was selected to join for Application Key that is configured
 *   with persistent room feature. You may use
 *   <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString">
 *   Date.toISOString()</a> to retrieve ISO 8601 formatted date time stamp.
 *   The start date time of the room will not affect non persistent room connection.
 * @param {Number} options.credentials.duration The duration (in hours)
 *   that the room duration should be in. This will set the duration starting from
 *   the provided <code>startDateTime</code> onwards and after the duration is over,
 *   the meeting is over and the room is closed for Application Key that is
 *   configured with persistent room feature.
 *   The duration will not affect non persistent room connection.The duration of the meeting in hours.<br>
 *   <small>E.g. <code>0.5</code> for half an hour, <code>1.4</code> for 1 hour and 24 minutes</small>
 * @param {String} options.credentials.credentials The room credentials for Application Key.
 *   This is required for rooms connecting without CORS verification or starting a new persistent room meeting.<br><br>
 *   <u>To generate the credentials:</u><br>
 *   <ol>
 *   <li>Concatenate a string that consists of the room name
 *     the room meeting duration (in hours) and the start date timestamp (in ISO 8601 format).<br>
 *     <small>Format <code>room + "_" + duration + "_" + startDateTimeStamp</code></small></li>
 *   <li>Hash the concatenated string with the Application Key token using
 *     <a href="https://en.wikipedia.org/wiki/SHA-1">SHA-1</a>.
 *     You may use the <a href="https://code.google.com/p/crypto-js/#HMAC">CryptoJS.HmacSHA1</a> function to do so.<br>
 *     <small>Example <code>var hash = CryptoJS.HmacSHA1(concatenatedString, token);</code></small></li>
 *   <li>Convert the hash to a <a href="https://en.wikipedia.org/wiki/Base64">Base64</a> encoded string. You may use the
 *     <a href="https://code.google.com/p/crypto-js/#The_Cipher_Output">CryptoJS.enc.Base64</a> function
 *     to do so.<br><small>Example <code>var base64String = hash.toString(CryptoJS.enc.Base64); </code></small></li>
 *   <li>Encode the Base64 encoded string to a URI component using UTF-8 encoding with
 *     <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent()</a>.<br>
 *     <small>Example <code>var credentials = encodeURIComponent(base64String);</code></small></li>
 *   </ol><br>
 * @param {Boolean} [options.audioFallback=false] The flag that indicates if there is a failure in
 *   {{#crossLink "Skylink/getUserMedia:method"}}getUserMedia(){{/crossLink}} in retrieving user media
 *   video stream, it should fallback to retrieve audio stream only. This would not work for
 *   {{#crossLink "Skylink/joinRoom:method"}}joinRoom(){{/crossLink}} except
 *   {{#crossLink "Skylink/getUserMedia:method"}}getUserMedia(){{/crossLink}}.
 * @param {Boolean} [options.forceSSL=false] The flag to enforce an SSL platform signaling and platform server connection.
 *   If self domain accessing protocol is <code>https:</code>, SSL connections
 *   would be automatically used. This flag is mostly used for self domain accessing protocol
 *   that is <code>http:</code> and enforcing the SSL connections for
 *   platform signaling and platform server connection.
 * @param {String} [options.audioCodec=Skylink.AUDIO_CODEC.AUTO] <i>Debugging Feature</i>.
 *   The preferred audio codec that Peer connection
 *   streaming audio codec should use in the connection when available. If not available, the default
 *   codec would be the browser generated session description selected codec. [Rel: Skylink.AUDIO_CODEC]
 * @param {String} [options.videoCodec=Skylink.VIDEO_CODEC.AUTO] <i>Debugging Feature</i>.
 *   The preferred video codec that Peer connection
 *   streaming video codec should use in the connection when available. If not available, the default
 *   codec would be the browser generated session description selected codec. [Rel: Skylink.VIDEO_CODEC]
 * @param {Number} [options.socketTimeout=20000] The timeout that the socket connection should throw a
 *   timeout exception when socket fails to receive a response from connection. Depending on
 *   the max retries left based on the availability of ports given by the platform server,
 *   the socket will reattempt to establish a socket connection with the signaling server.<br>
 *   The mininum timeout value is <code>5000</code>.
 * @param {Boolean} [options.forceTURNSSL=false] The flag to enforce an SSL TURN server connection.
 *   If self domain accessing protocol is <code>https:</code>, SSL connections
 *   would be automatically used. This flag is mostly used for self domain accessing protocol
 *   that is <code>http:</code> and enforcing the SSL connections for
 *   TURN server connection.
 * This will configure TURN server connection using port <code>443</code> only and
 *   if <code>turns:</code> protocol is supported, it will use <code>turns:</code> protocol.
 * @param {Function} [callback] The callback fired after Skylink has been
 *   initialised successfully or have met with an exception.
 *   The callback signature is <code>function (error, success)</code>.
 * @param {JSON} callback.error The error object received in the callback.
 *   If received as <code>null</code>, it means that there is no errors.
 * @param {Number} callback.error.errorCode The
 *   <a href="#attr_READY_STATE_CHANGE_ERROR">READY_STATE_CHANGE_ERROR</a>
 *   if there is an <a href="#event_readyStateChange">readyStateChange</a>
 *   event error that caused the failure for initialising Skylink.
 *   [Rel: Skylink.READY_STATE_CHANGE_ERROR]
 * @param {Object} callback.error.error The exception thrown that caused the failure
 *   for initialising Skylink.
 * @param {Number} callback.error.status The XMLHttpRequest status code received
 *   when exception is thrown that caused the failure for initialising Skylink.
 * @param {JSON} callback.success The success object received in the callback.
 *   If received as <code>null</code>, it means that there are errors.
 * @param {String} callback.success.appKey Previously known as <code>apiKey</code>.
 *   The Application Key that Skylink uses for initialising and connecting rooms.
 * @param {String} callback.success.defaultRoom The default room that
 *   Skylink should connect to if there is no room provided in
 *   <a href="#method_joinRoom">joinRoom()</a>.
 * @param {String} callback.success.roomServer The platform server URL that Skylink makes a
 *   <code>HTTP /GET</code> to retrieve the connection information required.
 * @param {Boolean} callback.success.enableIceTrickle The flag that indicates if PeerConnections
 *    should enable trickling of ICE to connect the ICE connection.
 * @param {Boolean} callback.success.enableDataChannel The flag that indicates if PeerConnections
 *   should have any DataChannel connections.
 * @param {Boolean} callback.success.enableTURNServer The flag that indicates if
 *   PeerConnections connection should use any TURN server connection.
 * @param {Boolean} callback.success.enableSTUNServer The flag that indicates if
 *   PeerConnections connection should use any STUN server connection.
 * @param {Boolean} callback.success.TURNServerTransport The TURN server transport
 *   to enable for TURN server connections.
 *   [Rel: Skylink.TURN_TRANSPORT]
 * @param {String} [callback.success.serverRegion] The regional server that Skylink
 *    should connect to for fastest connectivity. [Rel: Skylink.REGIONAL_SERVER]
 * @param {Boolean} callback.success.audioFallback The flag that indicates if there is a failure in
 *   <a href="#method_getUserMedia">getUserMedia()</a> in retrieving user media
 *   video stream, it should fallback to retrieve audio stream only.
 * @param {Boolean} callback.success.forceSSL The flag to enforce an SSL platform signaling and platform server connection.
 *   If self domain accessing protocol is <code>https:</code>, SSL connections
 *   would be automatically used.
 * @param {String} callback.success.audioCodec The preferred audio codec that Peer connection
 *   streaming audio codec should use in the connection when available. [Rel: Skylink.AUDIO_CODEC]
 * @param {String} callback.success.videoCodec The preferred video codec that Peer connection
 *   streaming video codec should use in the connection when available. [Rel: Skylink.VIDEO_CODEC]
 * @param {Number} callback.success.socketTimeout The timeout that the socket connection should throw a
 *   timeout exception when socket fails to receive a response from connection. Depending on
 *   the max retries left based on the availability of ports given by the platform server,
 *   the socket will reattempt to establish a socket connection with the signaling server.
 * @param {Boolean} callback.success.forceTURNSSL The flag to enforce an SSL TURN server connection.
 *   If self domain accessing protocol is <code>https:</code>, SSL connections
 *   would be automatically used.
 * This will configure TURN server connection using port <code>443</code> only and
 *   if <code>turns:</code> protocol is supported, it will use <code>turns:</code> protocol.
 * @param {Boolean} callback.success.forceTURN The flag that indicates if PeerConnections connection
 *   should only use TURN server connection which enables a quicker connectivity.
 *   This configuration will override the settings for <code>enableTURNServer</code>
 *   and <code>enableSTUNServer</code> and set <code>enableTURNServer</code> as <code>true</code> and
 *   <code>enableSTUNServer</code> as <code>false</code> if the value is set to <code>true</code>.
 * @param {Boolean} callback.success.usePublicSTUN The flag that indicates if PeerConnections connection
 *   should enable usage of public STUN server connection connectivity.
 *   This configuration would not work if <code>enableSTUNServer</code> is set to <code>false</code>
 *   or <code>forceTURN</code> is set to <code>true</code>.
 * @example
 *   // Note: Default room is appKey when no room
 *   // Example 1: To initalize without setting any default room.
 *   SkylinkDemo.init("YOUR_APP_KEY_HERE");
 *
 *   // Example 2: To initialize with appKey and defaultRoom
 *   SkylinkDemo.init({
 *     appKey: "YOUR_APP_KEY_HERE",
 *     defaultRoom: "mainHangout"
 *   });
 *
 *   // Example 3: To initialize with credentials to set startDateTime and
 *   // duration of the room
 *   var hash = CryptoJS.HmacSHA1(roomname + "_" + duration + "_" +
 *     (new Date()).toISOString(), token);
 *   var credentials = encodeURIComponent(hash.toString(CryptoJS.enc.Base64));
 *   SkylinkDemo.init({
 *     appKey: "YOUR_APP_KEY_HERE",
 *     defaultRoom: "mainHangout"
 *     credentials: {
 *        startDateTime: (new Date()).toISOString(),
 *        duration: 500,
 *        credentials: credentials
 *     }
 *   });
 *
 *   // Example 4: To initialize with callback
 *   SkylinkDemo.init("YOUR_APP_KEY_HERE", function(error,success){
 *     if (error){
 *       console.error("Init failed:", error);
 *     }
 *     else{
 *       console.info("Init succeed:", success);
 *     }
 *   });
 *
 * @trigger readyStateChange
 * @required
 * @component Room
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.init = function(options, callback) {
  var self = this;

  if (typeof options === 'function'){
    callback = options;
    options = undefined;
  }

  if (!options) {
    var error = 'No API key provided';
    log.error(error);
    if (typeof callback === 'function'){
      callback(error,null);
    }
    return;
  }

  var appKey, room, defaultRoom, region;
  var startDateTime, duration, credentials;
  var roomServer = self._roomServer;
  // NOTE: Should we get all the default values from the variables
  // rather than setting it?
  var enableIceTrickle = true;
  var enableDataChannel = true;
  var enableSTUNServer = true;
  var enableTURNServer = true;
  var TURNTransport = self.TURN_TRANSPORT.ANY;
  var audioFallback = false;
  var forceSSL = false;
  var socketTimeout = 0;
  var forceTURNSSL = false;
  var audioCodec = self.AUDIO_CODEC.AUTO;
  var videoCodec = self.VIDEO_CODEC.AUTO;
  var forceTURN = false;
  var usePublicSTUN = true;

  log.log('Provided init options:', options);

  if (typeof options === 'string') {
    // set all the default api key, default room and room
    appKey = options;
    defaultRoom = appKey;
    room = appKey;
  } else {
    // set the api key
    appKey = options.appKey || options.apiKey;
    // set the room server
    roomServer = (typeof options.roomServer === 'string') ?
      options.roomServer : roomServer;
    // check room server if it ends with /. Remove the extra /
    roomServer = (roomServer.lastIndexOf('/') ===
      (roomServer.length - 1)) ? roomServer.substring(0,
      roomServer.length - 1) : roomServer;
    // set the region
    region = (typeof options.region === 'string') ?
      options.region : region;
    // set the default room
    defaultRoom = (typeof options.defaultRoom === 'string') ?
      options.defaultRoom : appKey;
    // set the selected room
    room = defaultRoom;
    // set ice trickle option
    enableIceTrickle = (typeof options.enableIceTrickle === 'boolean') ?
      options.enableIceTrickle : enableIceTrickle;
    // set data channel option
    enableDataChannel = (typeof options.enableDataChannel === 'boolean') ?
      options.enableDataChannel : enableDataChannel;
    // set stun server option
    enableSTUNServer = (typeof options.enableSTUNServer === 'boolean') ?
      options.enableSTUNServer : enableSTUNServer;
    // set turn server option
    enableTURNServer = (typeof options.enableTURNServer === 'boolean') ?
      options.enableTURNServer : enableTURNServer;
    // set the force ssl always option
    forceSSL = (typeof options.forceSSL === 'boolean') ?
      options.forceSSL : forceSSL;
    // set the socket timeout option
    socketTimeout = (typeof options.socketTimeout === 'number') ?
      options.socketTimeout : socketTimeout;
    // set the socket timeout option to be above 5000
    socketTimeout = (socketTimeout < 5000) ? 5000 : socketTimeout;
    // set the force turn ssl always option
    forceTURNSSL = (typeof options.forceTURNSSL === 'boolean') ?
      options.forceTURNSSL : forceTURNSSL;
    // set the preferred audio codec
    audioCodec = typeof options.audioCodec === 'string' ?
      options.audioCodec : audioCodec;
    // set the preferred video codec
    videoCodec = typeof options.videoCodec === 'string' ?
      options.videoCodec : videoCodec;
    // set the force turn server option
    forceTURN = (typeof options.forceTURN === 'boolean') ?
      options.forceTURN : forceTURN;
    // set the use public stun option
    usePublicSTUN = (typeof options.usePublicSTUN === 'boolean') ?
      options.usePublicSTUN : usePublicSTUN;

    // set turn transport option
    if (typeof options.TURNServerTransport === 'string') {
      // loop out for every transport option
      for (var type in self.TURN_TRANSPORT) {
        if (self.TURN_TRANSPORT.hasOwnProperty(type)) {
          // do a check if the transport option is valid
          if (self.TURN_TRANSPORT[type] === options.TURNServerTransport) {
            TURNTransport = options.TURNServerTransport;
            break;
          }
        }
      }
    }
    // set audio fallback option
    audioFallback = options.audioFallback || audioFallback;
    // Custom default meeting timing and duration
    // Fallback to default if no duration or startDateTime provided
    if (options.credentials &&
      typeof options.credentials.credentials === 'string' &&
      typeof options.credentials.duration === 'number' &&
      typeof options.credentials.startDateTime === 'string') {
      // set start data time
      startDateTime = options.credentials.startDateTime;
      // set the duration
      duration = options.credentials.duration;
      // set the credentials
      credentials = options.credentials.credentials;
    }

    // if force turn option is set to on
    if (forceTURN === true) {
      enableTURNServer = true;
      enableSTUNServer = false;
    }
  }
  // api key path options
  self._appKey = appKey;
  self._roomServer = roomServer;
  self._defaultRoom = defaultRoom;
  self._selectedRoom = room;
  self._serverRegion = region || null;
  self._path = roomServer + '/api/' + appKey + '/' + room;
  // set credentials if there is
  if (credentials && startDateTime && duration) {
    self._roomStart = startDateTime;
    self._roomDuration = duration;
    self._roomCredentials = credentials;
    self._path += (credentials) ? ('/' + startDateTime + '/' +
      duration + '?&cred=' + credentials) : '';
  }

  self._path += ((credentials) ? '&' : '?') + 'rand=' + (new Date()).toISOString();

  // check if there is a other query parameters or not
  if (region) {
    self._path += '&rg=' + region;
  }
  // skylink functionality options
  self._enableIceTrickle = enableIceTrickle;
  self._enableDataChannel = enableDataChannel;
  self._enableSTUN = enableSTUNServer;
  self._enableTURN = enableTURNServer;
  self._TURNTransport = TURNTransport;
  self._audioFallback = audioFallback;
  self._forceSSL = forceSSL;
  self._socketTimeout = socketTimeout;
  self._forceTURNSSL = forceTURNSSL;
  self._selectedAudioCodec = audioCodec;
  self._selectedVideoCodec = videoCodec;
  self._forceTURN = forceTURN;
  self._usePublicSTUN = usePublicSTUN;

  log.log('Init configuration:', {
    serverUrl: self._path,
    readyState: self._readyState,
    appKey: self._appKey,
    roomServer: self._roomServer,
    defaultRoom: self._defaultRoom,
    selectedRoom: self._selectedRoom,
    serverRegion: self._serverRegion,
    enableDataChannel: self._enableDataChannel,
    enableIceTrickle: self._enableIceTrickle,
    enableTURNServer: self._enableTURN,
    enableSTUNServer: self._enableSTUN,
    TURNTransport: self._TURNTransport,
    audioFallback: self._audioFallback,
    forceSSL: self._forceSSL,
    socketTimeout: self._socketTimeout,
    forceTURNSSL: self._forceTURNSSL,
    audioCodec: self._selectedAudioCodec,
    videoCodec: self._selectedVideoCodec,
    forceTURN: self._forceTURN,
    usePublicSTUN: self._usePublicSTUN
  });
  // trigger the readystate
  self._readyState = 0;
  self._trigger('readyStateChange', self.READY_STATE_CHANGE.INIT, null, self._selectedRoom);

  if (typeof callback === 'function'){
    var hasTriggered = false;

    var readyStateChangeFn = function (readyState, error) {
      if (!hasTriggered) {
        if (readyState === self.READY_STATE_CHANGE.COMPLETED) {
          log.log([null, 'Socket', null, 'Firing callback. ' +
          'Ready state change has met provided state ->'], readyState);
          hasTriggered = true;
          self.off('readyStateChange', readyStateChangeFn);
          callback(null,{
            serverUrl: self._path,
            readyState: self._readyState,
            appKey: self._appKey,
            roomServer: self._roomServer,
            defaultRoom: self._defaultRoom,
            selectedRoom: self._selectedRoom,
            serverRegion: self._serverRegion,
            enableDataChannel: self._enableDataChannel,
            enableIceTrickle: self._enableIceTrickle,
            enableTURNServer: self._enableTURN,
            enableSTUNServer: self._enableSTUN,
            TURNTransport: self._TURNTransport,
            audioFallback: self._audioFallback,
            forceSSL: self._forceSSL,
            socketTimeout: self._socketTimeout,
            forceTURNSSL: self._forceTURNSSL,
            audioCodec: self._selectedAudioCodec,
            videoCodec: self._selectedVideoCodec,
            forceTURN: self._forceTURN,
            usePublicSTUN: self._usePublicSTUN
          });
        } else if (readyState === self.READY_STATE_CHANGE.ERROR) {
          log.log([null, 'Socket', null, 'Firing callback. ' +
            'Ready state change has met provided state ->'], readyState);
          log.debug([null, 'Socket', null, 'Ready state met failure'], error);
          hasTriggered = true;
          self.off('readyStateChange', readyStateChangeFn);
          callback({
            error: new Error(error),
            errorCode: error.errorCode,
            status: error.status
          },null);
        }
      }
    };

    self.on('readyStateChange', readyStateChangeFn);
  }

  self._loadInfo();
};

/**
 * Helper function that generates an Unique ID (UUID) string.
 * @method generateUUID
 * @return {String} Generated Unique ID (UUID) string.
 * @example
 *    // Get Unique ID (UUID)
 *    var uuid = SkylinkDemo.generateUUID();
 * @for Skylink
 * @since 0.5.9
 */
/* jshint ignore:start */
Skylink.prototype.generateUUID = function() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
  return uuid;
};
/* jshint ignore:end */
