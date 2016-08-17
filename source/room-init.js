/**
 * Contains the list of <a href="#method_init"><code>init()</code> method</a> authentication states.
 * @attribute READY_STATE_CHANGE
 * @param {Number} INIT <small>Value <code>0</code></small>
 *   The state when <code>init()</code> has just started.
 * @param {Number} LOADING <small>Value <code>1</code></small>
 *   The state when <code>init()</code> is authenticating the App Key and credentials provided with the API.
 * @param {Number} COMPLETED <small>Value <code>2</code></small>
 *   The state when <code>init()</code> has succesfully authenticated the App key and credentials provided with the API.
 *   <small>The API will return the Room credentials which will be used in
 *   <a href="#method_joinRoom"><code>joinRoom()</code> method</a> for connection to Signaling.</small>
 * @param {Number} ERROR <small>Value <code>-1</code></small>
 *   The state when <code>init()</code> had failed authenticating the App Key and credentials provided with the API.
 *   [Rel: Skylink.READY_STATE_CHANGE_ERROR]
 * @type JSON
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
 * These are the list of room initialization ready state errors that Skylink has.
 * - Ready state errors like <code>ROOM_LOCKED</code>, <code>API_NOT_ENOUGH_CREDIT</code>,
 *   <code>API_NOT_ENOUGH_PREPAID_CREDIT</code>, <code>API_FAILED_FINDING_PREPAID_CREDIT</code> and
 *   <code>SCRIPT_ERROR</code> has been removed as they are no longer supported.
 * @attribute READY_STATE_CHANGE_ERROR
 * @type JSON
 * @param {Number} API_INVALID <small>Value <code>4001</code></small>
 *   The error returned when App Key provided does not exists.
 *  <small>To resolve this, check if the App Key provided exists in the <a href="https://developer.temasys.com.sg">
 *     Developer Console</a>.</small>
 * @param {Number} API_DOMAIN_NOT_MATCH <small>Value <code>4002</code></small>
 *   The error returned when accessing backend IP address does not match the <code>"domain"</code>
 *   property configured in the App Key settings.
 *  <small>To resolve this, contact our <a href="http://support.temasys.com.sg">Support Portal</a>.</small>
 * @param {Number} API_CORS_DOMAIN_NOT_MATCH <small>Value <code>4003</code></small>
 *   The error returned when accessing CORS domain does not match the <code>"corsurl"</code> property
 *   configured in the App Key settings.
 *   <small>To resolve this, configure the App Key CORS Url setting in the <a href="https://developer.temasys.com.sg">
 *     Developer Console</a>.</small>
 * @param {Number} API_CREDENTIALS_INVALID <small>Value <code>4004</code></small>
 *   The error returned when ac
 * The error when credentials provided is not valid for provided Application Key.<br>
 * For this error, it's recommended to check the <code>credentials</code> provided in
 *   {{#crossLink "Skylink/init:method"}}init() configuration{{/crossLink}}.
 * @param {Number} API_CREDENTIALS_NOT_MATCH <small>Value <code>4005</code></small>
 *   The error when credentials does not match as expected generated credentials for provided Application Key.<br>
 * For this error, it's recommended to check the <code>credentials</code> provided in
 *   {{#crossLink "Skylink/init:method"}}init() configuration{{/crossLink}}.
 * @param {Number} API_INVALID_PARENT_KEY <small>Value <code>4006</code></small>
 *   The error when provided alias Application Key has an error because parent Application Key does not exists.<br>
 * For this error, it's recommended to provide another alias Application Key.
 * @param {Number} API_NO_MEETING_RECORD_FOUND <small>Value <code>4010</code></small>
 *   The error when there is no meeting currently that is open or available to join
 *   for self at the current time in the selected room.<br>
 * For this error, it's recommended to retrieve the list of meetings and check if it exists using
 *   the [Meeting Resource REST API](https://temasys.atlassian.net/wiki/display/TPD/SkylinkAPI+-+Meeting+%28Persistent+Room%29+Resources).
 * @param {Number} NO_SOCKET_IO <small>Value <code>1</code></small>
 *   The error when socket.io dependency is not loaded.<br>
 * For this error, it's recommended to load the
 *   [correct socket.io-client dependency](http://socket.io/download/) from the CDN.
 * @param {Number} NO_XMLHTTPREQUEST_SUPPORT <small>Value <code>2</code></small>
 *   The error when XMLHttpRequest is not supported in current browser.<br>
 * For this error, it's recommended to ask user to switch to another browser that supports <code>XMLHttpRequest</code>.
 * @param {Number} NO_WEBRTC_SUPPORT <small>Value <code>3</code></small>
 *   The error when WebRTC is not supported in current browser.<br>
 * For this error, it's recommended to ask user to switch to another browser that supports WebRTC.
 * @param {Number} NO_PATH <small>Value <code>4</code></small>
 *   The error when constructed path is invalid.<br>
 * This rarely (and should not) occur and it's recommended to report this issue if this occurs.
 * @param {Number} INVALID_XMLHTTPREQUEST_STATUS <small>Value <code>5</code></small>
 *   The error when XMLHttpRequest does not return a HTTP status code of <code>200</code> but a HTTP failure.<br>
 * This rarely (and should not) occur and it's recommended to report this issue if this occurs.
 * @param {Number} ADAPTER_NO_LOADED <small>Value <code>7</code></small>
 *   The error when AdapterJS dependency is not loaded.<br>
 * For this error, it's recommended to load the
 *   [correct AdapterJS dependency](https://github.com/Temasys/AdapterJS/releases) from the CDN.
 * @param {Number} XML_HTTP_REQUEST_ERROR <small>Value <code>-1</code></small>
 *   The error when XMLHttpRequest failure on the network level when attempting to
 *   connect to the platform server to retrieve selected room connection information.<br>
 * This might happen when connection timeouts. If this is a persistent issue, it's recommended to report this issue.
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
  API_NO_MEETING_RECORD_FOUND: 4010,
  
  // New ones
  API_OVER_SEAT_LIMIT: 4020,
  API_RETRIEVAL_FAILED: 4021,
  API_WRONG_ACCESS_DOMAIN: 5005,
  
  //ROOM_LOCKED: 5001,
  XML_HTTP_REQUEST_ERROR: -1,
  NO_SOCKET_IO: 1,
  NO_XMLHTTPREQUEST_SUPPORT: 2,
  NO_WEBRTC_SUPPORT: 3,
  NO_PATH: 4,
  //INVALID_XMLHTTPREQUEST_STATUS: 5,
  //SCRIPT_ERROR: 6,
  ADAPTER_NO_LOADED: 7
};

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
 * Stores the flag if HTTPS connections should be enforced when connecting to
 *   the API or Signaling server if App is accessing from HTTP domain.
 * HTTPS connections are enforced if App is accessing from HTTPS domains.
 * @attribute _forceSSL
 * @type Boolean
 * @default false
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._forceSSL = false;

/**
 * Stores the flag if TURNS connections should be enforced when connecting to
 *   the TURN server if App is accessing from HTTP domain.
 * TURNS connections are enforced if App is accessing from HTTPS domains.
 * @attribute _forceTURNSSL
 * @type Boolean
 * @default false
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._forceTURNSSL = false;

/**
 * Stores the flag if TURN connections should be enforced when connecting to Peers.
 * This filters all non "relay" ICE candidates to enforce connections via the TURN server.
 * @attribute _forceTURN
 * @type Boolean
 * @default false
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._forceTURN = false;

/**
 * Stores the construct API REST path to obtain Room credentials.
 * @attribute _path
 * @type String
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._path = null;

/**
 * Stores the server region for the Signaling to use.
 * This is already deprecated an no longer useful. To discuss and remove.
 * @attribute _serverRegion
 * @type String
 * @private
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._serverRegion = null;

/**
 * Stores the API server url.
 * @attribute _roomServer
 * @type String
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._roomServer = '//api.temasys.com.sg';

/**
 * Stores the App Key configured in <code>init()</code>.
 * @attribute _appKey
 * @type String
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._appKey = null;

/**
 * Stores the default Room name to connect to when <code>joinRoom()</code> does not provide a Room name.
 * @attribute _defaultRoom
 * @type String
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._defaultRoom = null;

/**
 * Stores the <code>init()</code> credentials starting DateTime stamp in ISO 8601.
 * @attribute _roomStart
 * @type String
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._roomStart = null;

/**
 * Stores the <code>init()</code> credentials duration counted in hours.
 * @attribute _roomDuration
 * @type Number
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._roomDuration = null;

/**
 * Stores the <code>init()</code> generated credentials string.
 * @attribute _roomCredentials
 * @type String
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._roomCredentials = null;

/**
 * Stores the current <code>init()</code> readyState.
 * @attribute _readyState
 * @type Number
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._readyState = 0;

/**
 * Stores the "cid" used for <code>joinRoom()</code>.
 * @attribute _key
 * @type String
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._key = null;

/**
 * Stores the "apiOwner" used for <code>joinRoom()</code>.
 * @attribute _appKeyOwner
 * @type String
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._appKeyOwner = null;

/**
 * Stores the Room credentials information for <code>joinRoom()</code>.
 * @attribute _room
 * @param {String} id The "rid" for <code>joinRoom()</code>.
 * @param {String} token The "roomCred" for <code>joinRoom()</code>.
 * @param {String} startDateTime The "start" for <code>joinRoom()</code>.
 * @param {String} duration The "len" for <code>joinRoom()</code>.
 * @param {String} connection The RTCPeerConnection constraints and configuration. This is not used in the SDK
 *   except for the "mediaConstraints" property that sets the default <code>getUserMedia()</code> settings.
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._room = null;

/**
 * Function that authenticates the App Key to initialise the SDK. 
 * @method init
 * @param {JSON|String} options The configuration options.
 * - When provided as a string, it's configured as <code>options.appKey</code>.
 * @param {String} options.appKey The App Key.
 * @param {String} [options.defaultRoom] The default Room name to use when
 *    no Room name is provided in <a href="#method_joinRoom"><code>joinRoom()</code> method</a>.
 * - When not provided, it's configured as <code>options.appKey</code>.
 * <small>Fallbacks to the value of <code>options.appKey</code> if this is not provided.</small>
 * <small>This is the only Room name connected to when using credentials based authentication.</small>
 * @param {String} [options.roomServer] The platform API server url.
 * <small>This is a debugging feature and is not recommended to be used by developers unless
 *   instructed for debugging purposes.</small>
 * @param {String} [options.region] <blockquote class="info"><b>Deprecation Warning!</b>
 *   This option has been deprecated.<br>Automatic nearest regional server has been implemented
 *   on the platform.</blockquote>
 *   The platform regional server to connect to for better connectivity.
 *   [Rel: Skylink.REGIONAL_SERVER]
 * @param {Boolean} [options.enableIceTrickle=true] The flag if trickle ICE should be
 *   enabled when connecting with Peer connections.
 * @param {Boolean} [options.enableDataChannel=true] The flag if Datachannel connections
 *   should be enabled with connected with Peer connections.
 * @param {Boolean} [options.enableTURNServer=true] The flag if TURN ICE servers should
 *   be filtered out when constructing Peer connections.
 * @param {Boolean} [options.enableSTUNServer=true] The flag if STUN ICE servers should
 *   be filtered out when constructing Peer connections.
 * @param {Boolean} [options.forceTURN=false] The flag if Peers should have enforced
 *   connections over the TURN server.
 *   <small>This sets <code>options.enableTURNServer</code> value to <code>true</code> and
 *     <code>options.enableSTUNServer</code> value to <code>false</code>.</small>
 *   <small>Filters the <code>"relay"</code> ICE candidates during Peer connections ICE gathering to enforce TURN connections.</small>
 * @param {Boolean} [options.usePublicSTUN=true] The flag if STUN ICE servers not
 *   belonging to <code>temasys.com.sg</code> should be filtered out when constructing Peer connections.
 * @param {Boolean} [options.TURNServerTransport] The option for filtering and configuring
 *   TURN ICE servers url <code>?transport=</code> query parameter when constructing a Peer connections.
 *   <small>Fallbacks to <code>ANY</code> option if not provided.</small>
 *   [Rel: Skylink.TURN_TRANSPORT]
 * @param {JSON} [options.credentials] The credentials for authenticating App Key.
 *   <small>By default, <code>init()</code> uses the CORS URL authentication.
 *   For more details on the different authentication methods, read
 *     <a href="http://support.temasys.com.sg/support/solutions/articles/
 * 12000002712-authenticating-your-application-key-to-start-a-connection">the article here</a>.</small>
 *   <small>This is also part of the persistent Room feature configuration. <a href="http://support.temasys.com.sg/support
 * /solutions/articles/12000002811-using-the-persistent-room-feature-to-configure-meetings">Read more here</a>.</small>
 * @param {String} options.credentials.startDateTime The credentials starting DateTime stamp
 *   in <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601 format</a>.
 *   <small>This configures the User's the starting DateTime session connected to Room.</small>
 * @param {Number} options.credentials.duration The credentials duration in hours.
 *   <small>This configures the User's the duration session connected to Room.</small>
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
 *   Note that this will not work if TURN is disabled for the Application Key provided.
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
 * Starts retrieving Room credentials information from API server.
 * @method _requestServerInfo
 * @private
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
 * Parses the Room credentials information retrieved from API server.
 * @method _parseInfo
 * @private
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
  this._signalingServerPort = null;

  this._isPrivileged = info.isPrivileged;
  this._autoIntroduce = info.autoIntroduce;

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
 * Loads and checks the dependencies if they are loaded correctly.
 * @method _loadInfo
 * @private
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
 * Starts initialising for Room credentials for room name provided in <code>joinRoom()</code> method.
 * @method _initSelectedRoom
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





