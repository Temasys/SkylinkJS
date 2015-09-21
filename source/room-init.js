/**
 * The list of Skylink platform room initialization ready state that indicates
 *   if the required connection information has been retrieved successfully from
 *   the platform server to start a connection.
 * @attribute READY_STATE_CHANGE
 * @type JSON
 * @param {Number} INIT Retrieval Step 1. The ready state is at it's beginning.
 *   When {{#crossLink "Skylink/init:method"}}init(){{/crossLink}} is invoked, or
 *   when {{#crossLink "Skylink/joinRoom:attr"}}joinRoom(){{/crossLink}} is invoked
 *   with a provided room, it will start proceeding to Step 2.
 * @param {Number} LOADING Retrieval Step 2. Skylink starts retrieving the
 *   connection information from the platform server.
 * @param {Number} COMPLETED Retrieval Step 3. The connection information
 *   has been retrieved successfully.
 * @param {Number} ERROR Retrieval failure Step. An exception occured while retrieving
 *   the connection information. This could also be due to missing dependencies or the
 *   lack of WebRTC support.
 * @readOnly
 * @component Room
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.READY_STATE_CHANGE = {
  INIT: 0,
  LOADING: 1,
  COMPLETED: 2,
  ERROR: -1
};

/**
 * The list of Skylink platform room initialization ready state errors when
 *   the error state is triggered by
 *   {{#crossLink "Skylink/readyStateChange:event"}}readyStateChange{{/crossLink}}
     The list of ready state change errors.
 * - These are the error states from the error object error code.
 * - <b>ROOM_LOCKED</b> is deprecated in 0.5.2. Please use
 *   {{#crossLink "Skylink/:attr"}}leaveRoom(){{/crossLink}}
 * - The states that would occur are:
 * @attribute READY_STATE_CHANGE_ERROR
 * @type JSON
 * @param {Number} API_INVALID Provided Application Key does not exists (invalid).
 * @param {Number} API_DOMAIN_NOT_MATCH Provided Application Key registered CORS
 *   is not registered for this accessing domain.
 * @param {Number} API_CORS_DOMAIN_NOT_MATCH Api Key used in CORS
 *   domain does not match.
 * @param {Number} API_CREDENTIALS_INVALID Api Key credentials does
 *   not exist.
 * @param {Number} API_CREDENTIALS_NOT_MATCH Api Key credentials does not
 *   match what is expected.
 * @param {Number} API_INVALID_PARENT_KEY Api Key does not have a parent
 *   key nor is a root key.
 * @param {Number} API_NOT_ENOUGH_CREDIT Api Key does not have enough
 *   credits to use.
 * @param {Number} API_NOT_ENOUGH_PREPAID_CREDIT Api Key does not have
 *   enough prepaid credits to use.
 * @param {Number} API_FAILED_FINDING_PREPAID_CREDIT Api Key preapid
 *   payments does not exist.
 * @param {Number} API_NO_MEETING_RECORD_FOUND Api Key does not have a
 *   meeting record at this timing. This occurs when Api Key is a
 *   static one.
 * @param {Number} ROOM_LOCKED Room is locked.
 * @param {Number} NO_SOCKET_IO No socket.io dependency is loaded to use.
 * @param {Number} NO_XMLHTTPREQUEST_SUPPORT Browser does not support
 *   XMLHttpRequest to use.
 * @param {Number} NO_WEBRTC_SUPPORT Browser does not have WebRTC support.
 * @param {Number} NO_PATH No path is loaded yet.
 * @param {Number} INVALID_XMLHTTPREQUEST_STATUS Invalid XMLHttpRequest
 *   when retrieving information.
 * @param {Number} ADAPTER_NO_LOADED AdapterJS dependency is not loaded.
 * @readOnly
 * @component Room
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.READY_STATE_CHANGE_ERROR = {
  API_INVALID: 4001,
  API_DOMAIN_NOT_MATCH: 4002,
  API_CORS_DOMAIN_NOT_MATCH: 4003,
  API_CREDENTIALS_INVALID: 4004,
  API_CREDENTIALS_NOT_MATCH: 4005,
  API_INVALID_PARENT_KEY: 4006,
  API_NOT_ENOUGH_CREDIT: 4007,
  API_NOT_ENOUGH_PREPAID_CREDIT: 4008,
  API_FAILED_FINDING_PREPAID_CREDIT: 4009,
  API_NO_MEETING_RECORD_FOUND: 4010,
  ROOM_LOCKED: 5001,
  NO_SOCKET_IO: 1,
  NO_XMLHTTPREQUEST_SUPPORT: 2,
  NO_WEBRTC_SUPPORT: 3,
  NO_PATH: 4,
  INVALID_XMLHTTPREQUEST_STATUS: 5,
  SCRIPT_ERROR: 6,
  ADAPTER_NO_LOADED: 7
};

/**
 * The list of available regional servers.
 * - This is for developers to set the nearest region server
 *   for Skylink to connect to for faster connectivity.
 * - The available regional servers are:
 * @attribute REGIONAL_SERVER
 * @type JSON
 * @param {String} APAC1 Asia pacific server 1.
 * @param {String} US1 server 1.
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
 *   would be used. This flag is mostly used for self domain accessing protocol
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
 *   would be used. This flag is mostly used for self domain accessing protocol
 *   that is <code>http:</code> and enforcing the SSL connections for
 *   TURN server connection.
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
 * The regional server that Skylink connects to.
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
 * Stores the Skylink server connection key for starting the
 *   selected room connection.
 * @attribute _key
 * @type String
 * @private
 * @component Room
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._key = null;

/**
 * Stores the Skylink server Application Key owner string for starting
 *   the selected room connection.
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
 * @param {JSON} connection.peerConstraints <i>Deprecated</i>. The RTCPeerConnection
 *    constraints that is passed in this format <code>new RTCPeerConnection(config, constraints);</code>.
 *    This feature is not documented in W3C Specification draft and not advisable to use.
 * @param {JSON} connection.peerConfig The RTCPeerConnection
 *    [RTCConfiguration](http://w3c.github.io/webrtc-pc/#idl-def-RTCConfiguration).
 * @param {JSON} connection.offerConstraints <i>Deprecated</i>. The RTCPeerConnection
 *    [RTCOfferOptions](http://w3c.github.io/webrtc-pc/#idl-def-RTCOfferOptions) used in
 *    <code>RTCPeerConnection.createOffer(successCb, failureCb, options);</code>.
 * @param {JSON} connection.sdpConstraints <i>Not in use</i>. The RTCPeerConnection
 *    [RTCAnswerOptions](http://w3c.github.io/webrtc-pc/#idl-def-RTCAnswerOptions) to be used
 *    in <code>RTCPeerConnection.createAnswer(successCb, failureCb, options);</code>.
 *    This is currently not in use due to not all browsers supporting this feature yet.
 * @required
 * @private
 * @component Room
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._room = null;

/**
 * Starts a <code>HTTP /GET</code> REST call to the platform server to
 *    retrieve the required connection information.
 * @method _requestServerInfo
 * @param {String} method The HTTP method. The value should be provided as
 *    <code>"GET"</code>.
 * @param {String} url The HTTP URI to invoke the REST call to. The
 *    value should be {{#crossLink "Skylink/_path:attribute"}}_path{{/crossLink}}.
 * @param {Function} callback The callback fired The callback fired after the
 *    <code>HTTP /GET</code> REST call has a response from the platform server.
 * @param {Number} callback.status The HTTP status code of the HTTP response
 *    given by the platform server.
 * @param {JSON} callback.response The HTTP response data if the HTTP status
 *   code is <code>200</code> (which means <var>HTTP OK</var> code).
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

  xhr.onerror = function () {
    log.error([null, 'XMLHttpRequest', method, 'Failed retrieving information:'],
      { status: xhr.status });
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
 * Parse the information received from the api server.
 * @method _parseInfo
 * @param {JSON} info The parsed information from the server.
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
 * Start the loading of information from the api server.
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
};

/**
 * Initialize Skylink to retrieve new connection information based on options.
 * @method _initSelectedRoom
 * @param {String} [room=Skylink._defaultRoom] The room to connect to.
 * @param {Function} callback The callback fired once Skylink is re-initialized.
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
  self.init(initOptions);
  self._defaultRoom = defaultRoom;

  // wait for ready state to be completed
  self._condition('readyStateChange', function () {
    callback();
  }, function () {
    return self._readyState === self.READY_STATE_CHANGE.COMPLETED;
  }, function (state) {
    return state === self.READY_STATE_CHANGE.COMPLETED;
  });
};

/**
 * Initialize Skylink to retrieve connection information.
 * This is the first method to invoke before using any of Skylink functionalities.
 * - Credentials parsing is not usabel.
 * @method init
 * @param {String|JSON} options Connection options or Application Key ID
 * @param {String} options.appKey Application Key ID to identify with the Temasys
 *   backend server
 * @param {String} [options.defaultRoom] The default room to connect
 *   to if there is no room provided in
 *   {{#crossLink "Skylink/joinRoom:method"}}joinRoom(){{/crossLink}}.
 * @param {String} [options.roomServer] Path to the Temasys
 *   backend server. If there's no room provided, default room would be used.
 * @param {String} [options.region] The regional server that user
 *   chooses to use. [Rel: Skylink.REGIONAL_SERVER]
 * @param {Boolean} [options.enableIceTrickle=true] The option to enable
 *   ICE trickle or not.
 * @param {Boolean} [options.enableDataChannel=true] The option to enable
 *   enableDataChannel or not.
 * @param {Boolean} [options.enableTURNServer=true] To enable TURN servers in ice connection.
 *   Please do so at your own risk as it might disrupt the connection.
 * @param {Boolean} [options.enableSTUNServer=true] To enable STUN servers in ice connection.
 *   Please do so at your own risk as it might disrupt the connection.
 * @param {Boolean} [options.TURNServerTransport=Skylink.TURN_TRANSPORT.ANY] Transport
 *  to set the transport packet type. [Rel: Skylink.TURN_TRANSPORT]
 * @param {JSON} [options.credentials] Credentials options for
 *   setting a static meeting.
 * @param {String} options.credentials.startDateTime The start timing of the
 *   meeting in Date ISO String
 * @param {Number} options.credentials.duration The duration of the meeting in hours.<br>
 *   E.g. <code>0.5</code> for half an hour, <code>1.4</code> for 1 hour and 24 minutes
 * @param {String} options.credentials.credentials The credentials required
 *   to set the timing and duration of a meeting.
 * @param {Boolean} [options.audioFallback=false] To allow the option to fallback to
 *   audio if failed retrieving video stream.
 * @param {Boolean} [options.forceSSL=false] To force SSL connections to the API server
 *   and signaling server.
 * @param {String} [options.audioCodec=Skylink.AUDIO_CODEC.OPUS] The preferred audio codec to use.
 *   It is only used when available.
 * @param {String} [options.audioCodec=Skylink.VIDEO_CODEC.OPUS] The preferred video codec to use.
 *   It is only used when available.
 * @param {Number} [options.socketTimeout=20000] To set the timeout for socket to fail
 *   and attempt a reconnection. The mininum value is 5000.
 * @param {Boolean} [options.forceTURNSSL=false] To force SSL connections to the TURN server
 *   if enabled.
 * @param {Function} [callback] The callback fired after the room was initialized.
 *   Default signature: function(error object, success object)
 * @example
 *   // Note: Default room is appKey when no room
 *   // Example 1: To initalize without setting any default room.
 *   SkylinkDemo.init('appKey');
 *
 *   // Example 2: To initialize with appKey, roomServer and defaultRoom
 *   SkylinkDemo.init({
 *     'appKey' : 'appKey',
 *     'roomServer' : 'http://xxxx.com',
 *     'defaultRoom' : 'mainHangout'
 *   });
 *
 *   // Example 3: To initialize with credentials to set startDateTime and
 *   // duration of the room
 *   var hash = CryptoJS.HmacSHA1(roomname + '_' + duration + '_' +
 *     (new Date()).toISOString(), token);
 *   var credentials = encodeURIComponent(hash.toString(CryptoJS.enc.Base64));
 *   SkylinkDemo.init({
 *     'appKey' : 'appKey',
 *     'roomServer' : 'http://xxxx.com',
 *     'defaultRoom' : 'mainHangout'
 *     'credentials' : {
 *        'startDateTime' : (new Date()).toISOString(),
 *        'duration' : 500,
 *        'credentials' : credentials
 *     }
 *   });
 *
 *   // Example 4: To initialize with callback
 *   SkylinkDemo.init('appKey',function(error,success){
 *     if (error){
 *       console.log('Init failed: '+JSON.stringify(error));
 *     }
 *     else{
 *       console.log('Init succeed: '+JSON.stringify(success));
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

  var adapter = (function () {
    try {
      return window.AdapterJS || AdapterJS;
    } catch (error) {
      return false;
    }
  })();

  if (!!adapter ? typeof adapter.webRTCReady === 'function' : false) {
    adapter.webRTCReady(function () {

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
      var forceTURNSSL = window.location.protocol === 'https:';
      var audioCodec = self.AUDIO_CODEC.AUTO;
      var videoCodec = self.VIDEO_CODEC.AUTO;

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
        roomServer = options.roomServer || roomServer;
        // check room server if it ends with /. Remove the extra /
        roomServer = (roomServer.lastIndexOf('/') ===
          (roomServer.length - 1)) ? roomServer.substring(0,
          roomServer.length - 1) : roomServer;
        // set the region
        region = options.region || region;
        // set the default room
        defaultRoom = options.defaultRoom || appKey;
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
        if (options.credentials) {
          // set start data time
          startDateTime = options.credentials.startDateTime ||
            (new Date()).toISOString();
          // set the duration
          duration = options.credentials.duration || 200;
          // set the credentials
          credentials = options.credentials.credentials;
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
      if (credentials) {
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
        videoCodec: self._selectedVideoCodec
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
                videoCodec: self._selectedVideoCodec
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
    });
  } else {
    var noAdapterErrorMsg = 'AdapterJS dependency is not loaded or incorrect AdapterJS dependency is used';
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: noAdapterErrorMsg,
      errorCode: self.READY_STATE_CHANGE_ERROR.ADAPTER_NO_LOADED
    }, self._selectedRoom);

    if (typeof callback === 'function'){
      log.debug(noAdapterErrorMsg);
      callback({
        error: new Error(noAdapterErrorMsg),
        errorCode: self.READY_STATE_CHANGE_ERROR.ADAPTER_NO_LOADED,
        status: null
      },null);
    }
  }
};





