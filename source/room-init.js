/**
 * The list of api server data retrieval state.
 * - These are the states to inform the state of retrieving the
 *   information from the api server required to start the peer
 *   connection or if the browser is eligible to start the peer connection.
 * - This is the first event that would fired, because Skylink would retrieve
 *   information from the api server that is required to start the connection.
 * - Once the state is <u>COMPLETED</u>, Skylink is ready to start the call.
 * - The states that would occur are:
 * @attribute READY_STATE_CHANGE
 * @type JSON
 * @param {Integer} INIT Skylink has just started. No information are
 *   retrieved yet.
 * @param {Integer} LOADING Skylink is starting the retrieval of the
 *   connection information.
 * @param {Integer} COMPLETED Skylink has completed retrieving the
 *   connection.
 * @param {Integer} ERROR Skylink has occurred an error when
 *   retrieving the connection information.
 * @readOnly
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
 * The list of ready state change errors.
 * - These are the error states from the error object error code.
 * - <b>ROOM_LOCKED</b> is deprecated in 0.5.2. Please use
 *   {{#crossLink "Skylink/:attr"}}leaveRoom(){{/crossLink}}
 * - The states that would occur are:
 * @attribute READY_STATE_CHANGE_ERROR
 * @type JSON
 * @param {Integer} API_INVALID  Api Key provided does not exist.
 * @param {Integer} API_DOMAIN_NOT_MATCH Api Key used in domain does
 *   not match.
 * @param {Integer} API_CORS_DOMAIN_NOT_MATCH Api Key used in CORS
 *   domain does not match.
 * @param {Integer} API_CREDENTIALS_INVALID Api Key credentials does
 *   not exist.
 * @param {Integer} API_CREDENTIALS_NOT_MATCH Api Key credentials does not
 *   match what is expected.
 * @param {Integer} API_INVALID_PARENT_KEY Api Key does not have a parent
 *   key nor is a root key.
 * @param {Integer} API_NOT_ENOUGH_CREDIT Api Key does not have enough
 *   credits to use.
 * @param {Integer} API_NOT_ENOUGH_PREPAID_CREDIT Api Key does not have
 *   enough prepaid credits to use.
 * @param {Integer} API_FAILED_FINDING_PREPAID_CREDIT Api Key preapid
 *   payments does not exist.
 * @param {Integer} API_NO_MEETING_RECORD_FOUND Api Key does not have a
 *   meeting record at this timing. This occurs when Api Key is a
 *   static one.
 * @param {Integer} ROOM_LOCKED Room is locked.
 * @param {Integer} NO_SOCKET_IO No socket.io dependency is loaded to use.
 * @param {Integer} NO_XMLHTTPREQUEST_SUPPORT Browser does not support
 *   XMLHttpRequest to use.
 * @param {Integer} NO_WEBRTC_SUPPORT Browser does not have WebRTC support.
 * @param {Integer} NO_PATH No path is loaded yet.
 * @param {Integer} INVALID_XMLHTTPREQUEST_STATUS Invalid XMLHttpRequest
 *   when retrieving information.
 * @readOnly
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
  SCRIPT_ERROR: 6
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
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype.REGIONAL_SERVER = {
  APAC1: 'sg',
  US1: 'us2'
};

/**
 * Force an SSL connection to signalling and API server.
 * @attribute _forceSSL
 * @type Boolean
 * @default false
 * @required
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._forceSSL = false;

/**
 * The path that user is currently connect to.
 * - NOTE ALEX: check if last char is '/'
 * @attribute _path
 * @type String
 * @default Skylink._serverPath
 * @final
 * @required
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._path = null;

/**
 * The regional server that Skylink connects to.
 * @attribute _serverRegion
 * @type String
 * @private
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._serverRegion = null;

/**
 * The server that user connects to to make
 * api calls to.
 * - The reason why users can input this value is to give
 *   users the chance to connect to any of our beta servers
 *   if available instead of the stable version.
 * @attribute _roomServer
 * @type String
 * @default '//api.temasys.com.sg'
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._roomServer = '//api.temasys.com.sg';

/**
 * The API Key ID.
 * @attribute _apiKey
 * @type String
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._apiKey = null;

/**
 * The default room that the user connects to if no room is provided in
 * {{#crossLink "Skylink/joinRoom:method"}}joinRoom(){{/crossLink}}.
 * @attribute _defaultRoom
 * @type String
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._defaultRoom = null;

/**
 * The static room's meeting starting date and time.
 * - The value is in ISO formatted string.
 * @attribute _roomStart
 * @type String
 * @private
 * @optional
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._roomStart = null;

/**
 * The static room's meeting duration.
 * @attribute _roomDuration
 * @type Integer
 * @private
 * @optional
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._roomDuration = null;

/**
 * The credentials required to set the start date and time
 * and the duration.
 * @attribute _roomCredentials
 * @type String
 * @private
 * @optional
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._roomCredentials = null;

/**
 * The current Skylink ready state change.
 * [Rel: Skylink.READY_STATE_CHANGE]
 * @attribute _readyState
 * @type Integer
 * @private
 * @required
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._readyState = 0;

/**
 * The received server key.
 * @attribute _key
 * @type String
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._key = null;

/**
 * The owner's username of the apiKey.
 * @attribute _apiKeyOwner
 * @type String
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._apiKeyOwner = null;

/**
 * The room connection information.
 * @attribute _room
 * @type JSON
 * @param {String} id The roomId of the room user is connected to.
 * @param {String} token The token of the room user is connected to.
 * @param {String} startDateTime The startDateTime in ISO string format of the room.
 * @param {String} duration The duration of the room.
 * @param {JSON} connection Connection constraints and configuration.
 * @param {JSON} connection.peerConstraints The peerconnection constraints.
 * @param {JSON} connection.peerConfig The peerconnection configuration.
 * @param {JSON} connection.offerConstraints The offer constraints.
 * @param {JSON} connection.sdpConstraints The sdp constraints.
 * @required
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._room = null;

/**
 * Gets information from api server.
 * @method _requestServerInfo
 * @param {String} method The http method.
 * @param {String} url The url to do a rest call.
 * @param {Function} callback The callback fired after Skylink
 *   receives a response from the api server.
 * @param {JSON} params HTTP Params
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._requestServerInfo = function(method, url, callback, params) {
  var self = this;
  // XDomainRequest is supported in IE8 - 9
  var useXDomainRequest = window.webrtcDetectedBrowser === 'IE' &&
    (window.webrtcDetectedVersion === 9 || window.webrtcDetectedVersion === 8) &&
    typeof window.XDomainRequest === 'function';
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
    });
    return;
  }

  log.debug('Peer connection constraints:', info.pc_constraints);
  log.debug('Offer constraints:', info.offer_constraints);

  this._key = info.cid;
  this._apiKeyOwner = info.apiOwner;

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

  // use default bandwidth and media resolution provided by server
  //this._streamSettings.bandwidth = info.bandwidth;
  //this._streamSettings.video = info.video;
  this._readyState = 2;
  this._trigger('readyStateChange', this.READY_STATE_CHANGE.COMPLETED);
  log.info('Parsed parameters from webserver. ' +
    'Ready for web-realtime communication');

};

/**
 * Start the loading of information from the api server.
 * @method _loadInfo
 * @trigger readyStateChange
 * @private
 * @required
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._loadInfo = function() {
  var self = this;
  if (!window.io) {
    log.error('Socket.io not loaded. Please load socket.io');
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: 'Socket.io not found',
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_SOCKET_IO
    });
    return;
  }
  if (!window.XMLHttpRequest) {
    log.error('XMLHttpRequest not supported. Please upgrade your browser');
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: 'XMLHttpRequest not available',
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_XMLHTTPREQUEST_SUPPORT
    });
    return;
  }
  if (!window.RTCPeerConnection) {
    log.error('WebRTC not supported. Please upgrade your browser');
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: 'WebRTC not available',
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_WEBRTC_SUPPORT
    });
    return;
  }
  if (!self._path) {
    log.error('Skylink is not initialised. Please call init() first');
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: 'No API Path is found',
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_PATH
    });
    return;
  }
  self._readyState = 1;
  self._trigger('readyStateChange', self.READY_STATE_CHANGE.LOADING);
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
      });
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
    apiKey: self._apiKey,
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
 * - <b><i>IMPORTANT</i></b>: Please call this method to load all server
 *   information before joining the room or doing anything else.
 * - If you would like to set the start time and duration of the room,
 *   you have to generate the credentials. In example 3, we use the
 *    [CryptoJS](https://code.google.com/p/crypto-js/) library.
 *   - Step 1: Generate the hash. It is created by using the roomname,
 *     duration and the timestamp (in ISO String format).
 *   - Step 2: Generate the Credentials. It is is generated by converting
 *     the hash to a Base64 string and then encoding it to a URI string.
 *   - Step 3: Initialize Skylink
 * @method init
 * @param {String|JSON} options Connection options or API Key ID
 * @param {String} options.apiKey API Key ID to identify with the Temasys
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
 * @param {Integer} options.credentials.duration The duration of the meeting
 * @param {String} options.credentials.credentials The credentials required
 *   to set the timing and duration of a meeting.
 * @param {Boolean} [options.audioFallback=false] To allow the option to fallback to
 *   audio if failed retrieving video stream.
 * @param {Boolean} [options.forceSSL=false] To force SSL connections to the API server
 *   and signaling server.
 * @param {Integer} [options.socketTimeout=20000] To set the timeout for socket to fail
 *   and attempt a reconnection. The mininum value is 5000.
 * @param {Function} [callback] The callback fired after the room was initialized.
 *   Default signature: function(error object, success object)
 * @example
 *   // Note: Default room is apiKey when no room
 *   // Example 1: To initalize without setting any default room.
 *   SkylinkDemo.init('apiKey');
 *
 *   // Example 2: To initialize with apikey, roomServer and defaultRoom
 *   SkylinkDemo.init({
 *     'apiKey' : 'apiKey',
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
 *     'apiKey' : 'apiKey',
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
 *   SkylinkDemo.init('apiKey',function(error,success){
 *     if (error){
 *       console.log('Init failed: '+JSON.stringify(error));
 *     }
 *     else{
 *       console.log('Init succeed: '+JSON.stringify(success));
 *     }
 *   });
 *
 * @trigger readyStateChange
 * @for Skylink
 * @required
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
  var apiKey, room, defaultRoom, region;
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

  log.log('Provided init options:', options);

  if (typeof options === 'string') {
    // set all the default api key, default room and room
    apiKey = options;
    defaultRoom = apiKey;
    room = apiKey;
  } else {
    // set the api key
    apiKey = options.apiKey;
    // set the room server
    roomServer = options.roomServer || roomServer;
    // check room server if it ends with /. Remove the extra /
    roomServer = (roomServer.lastIndexOf('/') ===
      (roomServer.length - 1)) ? roomServer.substring(0,
      roomServer.length - 1) : roomServer;
    // set the region
    region = options.region || region;
    // set the default room
    defaultRoom = options.defaultRoom || apiKey;
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
  self._apiKey = apiKey;
  self._roomServer = roomServer;
  self._defaultRoom = defaultRoom;
  self._selectedRoom = room;
  self._serverRegion = region;
  self._path = roomServer + '/api/' + apiKey + '/' + room;
  // set credentials if there is
  if (credentials) {
    self._roomStart = startDateTime;
    self._roomDuration = duration;
    self._roomCredentials = credentials;
    self._path += (credentials) ? ('/' + startDateTime + '/' +
      duration + '?&cred=' + credentials) : '';
  }
  // check if there is a other query parameters or not
  if (region) {
    self._path += ((self._path.indexOf('?&') > -1) ?
      '&' : '?&') + 'rg=' + region;
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

  log.log('Init configuration:', {
    serverUrl: self._path,
    readyState: self._readyState,
    apiKey: self._apiKey,
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
    socketTimeout: self._socketTimeout
  });
  // trigger the readystate
  self._readyState = 0;
  self._trigger('readyStateChange', self.READY_STATE_CHANGE.INIT);
  self._loadInfo();

  if (typeof callback === 'function'){
    //Success callback fired if readyStateChange is completed
    self.once('readyStateChange',function(readyState, error){
        log.log([null, 'Socket', null, 'Firing callback. ' +
        'Ready state change has met provided state ->'], readyState);
        callback(null,{
          serverUrl: self._path,
          readyState: self._readyState,
          apiKey: self._apiKey,
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
          socketTimeout: self._socketTimeout
        });
      },
      function(state){
        return state === self.READY_STATE_CHANGE.COMPLETED;
      },
      false
    );

    //Error callback fired if readyStateChange is error
    self.once('readyStateChange',function(readyState, error){
        log.log([null, 'Socket', null, 'Firing callback. ' +
        'Ready state change has met provided state ->'], readyState);
        callback(error,null);
      },
      function(state){
        return state === self.READY_STATE_CHANGE.ERROR;
      },
      false
    );
  }
};





