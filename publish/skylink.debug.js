/*! skylinkjs - v0.6.17 - Fri Feb 03 2017 20:49:02 GMT+0800 (SGT) */
(function (globals) {
function Skylink(instanceLabel) {
  /**
   * The Skylink object instance label ID.
   * @attribute INSTANCE_LABEL
   * @type String
   * @readOnly
   * @for Skylink
   * @since 0.6.18
   */
  this.INSTANCE_LABEL = typeof instanceLabel === 'string' && instanceLabel && instanceLabel !== '_' ?
    instanceLabel : 'in_' + Date.now() + Math.floor(Math.random() * 10000);

  /**
   * - Stores the logging function.
   */
  this._log = LogFactory(this.INSTANCE_LABEL);

  /**
   * Stores the flag if Peers should have any Datachannel connections.
   * @attribute _enableDataChannel
   * @default true
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._enableDataChannel = true;

  /**
   * Stores the list of Peer Datachannel connections.
   * @attribute _dataChannels
   * @param {JSON} #peerId The list of Datachannels associated with Peer ID.
   * @param {RTCDataChannel} #peerId.#channelLabel The Datachannel connection.
   *   The property name <code>"main"</code> is reserved for messaging Datachannel type.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.2.0
   */
  this._dataChannels = {};

  /**
   * Stores the list of data transfers from / to Peers.
   * @attribute _dataTransfers
   * @param {JSON} #transferId The data transfer session.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._dataTransfers = {};

  /**
   * Stores the list of sending data streaming sessions to Peers.
   * @attribute _dataStreams
   * @param {JSON} #streamId The data stream session.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.18
   */
  this._dataStreams = {};

  /**
   * Stores the list of buffered ICE candidates that is received before
   *   remote session description is received and set.
   * @attribute _peerCandidatesQueue
   * @param {Array} <#peerId> The list of the Peer connection buffered ICE candidates received.
   * @param {Object} <#peerId>.<#index> The Peer connection buffered ICE candidate received.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.5.1
   */
  this._peerCandidatesQueue = {};

  /**
   * Stores the list of ICE candidates received before signaling end.
   * @attribute _peerEndOfCandidatesCounter
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._peerEndOfCandidatesCounter = {};

  /**
   * Stores the list of Peer connection ICE candidates.
   * @attribute _gatheredCandidates
   * @param {JSON} <#peerId> The list of the Peer connection ICE candidates.
   * @param {JSON} <#peerId>.sending The list of the Peer connection ICE candidates sent.
   * @param {JSON} <#peerId>.receiving The list of the Peer connection ICE candidates received.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.14
   */
  this._gatheredCandidates = {};

  /**
   * Stores the flags for ICE candidate filtering.
   * @attribute _filterCandidatesType
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._filterCandidatesType = {
    host: false,
    srflx: false,
    relay: false
  };

  /**
   * Stores the flag that indicates if Peer connections should trickle ICE.
   * @attribute _enableIceTrickle
   * @type Boolean
   * @default true
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._enableIceTrickle = true;

  /**
   * Stores the flag that indicates if STUN ICE servers should be used when constructing Peer connection.
   * @attribute _enableSTUN
   * @type Boolean
   * @default true
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._enableSTUN = true;

  /**
   * Stores the flag that indicates if TURN ICE servers should be used when constructing Peer connection.
   * @attribute _enableTURN
   * @type Boolean
   * @default true
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._enableTURN = true;

  /**
   * Stores the flag that indicates if public STUN ICE servers should be used when constructing Peer connection.
   * @attribute _usePublicSTUN
   * @type Boolean
   * @default true
   * @private
   * @for Skylink
   * @since 0.6.1
   */
  this._usePublicSTUN = true;

  /**
   * Stores the global number of Peer connection retries that would increase the wait-for-response timeout
   *   for the Peer connection health timer.
   * @attribute _retryCounters
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.5.10
   */
  this._retryCounters = {};

  /**
   * Stores the list of the Peer connections.
   * @attribute _peerConnections
   * @param {Object} <#peerId> The Peer connection.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.1.0
   */
  this._peerConnections = {};

  /**
   * Stores the list of the Peer connections stats.
   * @attribute _peerStats
   * @param {Object} <#peerId> The Peer connection stats.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._peerStats = {};

  /**
   * The flag if User is using plugin.
   * @attribute _isUsingPlugin
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._isUsingPlugin = false;

  /**
   * Stores the option for the TURN protocols to use.
   * This should configure the TURN ICE servers urls <code>?transport=protocol</code> flag.
   * @attribute _TURNTransport
   * @type String
   * @default "any"
   * @private
   * @required
   * @for Skylink
   * @since 0.5.4
   */
  this._TURNTransport = 'any';

  /**
   * Stores the list of Peers session information.
   * @attribute _peerInformations
   * @param {JSON} <#peerId> The Peer session information.
   * @param {JSON|String} <#peerId>.userData The Peer custom data.
   * @param {JSON} <#peerId>.settings The Peer streaming information.
   * @param {JSON} <#peerId>.mediaStatus The Peer streaming muted status.
   * @param {JSON} <#peerId>.agent The Peer agent information.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._peerInformations = {};

  /**
   * Stores the Signaling user credentials from the API response required for connecting to the Signaling server.
   * @attribute _user
   * @param {String} uid The API result "username".
   * @param {String} token The API result "userCred".
   * @param {String} timeStamp The API result "timeStamp".
   * @param {String} sid The Signaling server receive user Peer ID.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.5.6
   */
  this._user = null;

  /**
   * Stores the User custom data.
   * By default, if no custom user data is set, it is an empty string <code>""</code>.
   * @attribute _userData
   * @type JSON|String
   * @default ""
   * @private
   * @for Skylink
   * @since 0.5.6
   */
  this._userData = '';

  /**
   * Stores the User connection priority weight.
   * If Peer has a higher connection weight, it will do the offer from its Peer connection first.
   * @attribute _peerPriorityWeight
   * @type Number
   * @private
   * @for Skylink
   * @since 0.5.0
   */
  this._peerPriorityWeight = 0;

  /**
   * Stores the flag that indicates if "autoIntroduce" is enabled.
   * If enabled, the Peers connecting the same Room will receive each others "enter" message ping.
   * @attribute _autoIntroduce
   * @type Boolean
   * @default true
   * @private
   * @for Skylink
   * @since 0.6.1
   */
  this._autoIntroduce = true;

  /**
   * Stores the flag that indicates if "isPrivileged" is enabled.
   * If enabled, the User has Privileged features which has the ability to retrieve the list of
   *   Peers in the same App space with <code>getPeers()</code> method
   *   and introduce Peers to each other with <code>introducePeer</code> method.
   * @attribute isPrivileged
   * @type Boolean
   * @default false
   * @private
   * @for Skylink
   * @since 0.6.1
   */
  this._isPrivileged = false;

  /**
   * Stores the list of Peers retrieved from the Signaling from <code>getPeers()</code> method.
   * @attribute _peerList
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.1
   */
  this._peerList = null;

  /**
   * Stores the current Room name that User is connected to.
   * @attribute _selectedRoom
   * @type String
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._selectedRoom = null;

  /**
   * Stores the flag that indicates if Room is locked.
   * @attribute _roomLocked
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.5.2
   */
  this._roomLocked = false;

  /**
   * Stores the flag that indicates if User is connected to the Room.
   * @attribute _inRoom
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.4.0
   */
  this._inRoom = false;

  /**
   * Stores the list of <code>on()</code> event handlers.
   * @attribute _EVENTS
   * @param {Array} <#event> The list of event handlers associated with the event.
   * @param {Function} <#event>.<#index> The event handler function.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.5.2
   */
  this._EVENTS = {};

  /**
   * Stores the list of <code>once()</code> event handlers.
   * These events are only triggered once.
   * @attribute _onceEvents
   * @param {Array} <#event> The list of event handlers associated with the event.
   * @param {Array} <#event>.<#index> The array of event handler function and its condition function.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._onceEvents = {};

  /**
   * Stores the timestamps data used for throttling.
   * @attribute _timestamp
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.5.8
   */
  this._timestamp = {
    socketMessage: null,
    shareScreen: null,
    refreshConnection: null,
    getUserMedia: null,
    lastRestart: null
  };

  /**
   * Stores the throttling interval timeout.
   * @attribute _throttlingTimeouts
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._throttlingTimeouts = {
    shareScreen: 10000,
    refreshConnection: 5000,
    getUserMedia: 0
  };

  /**
   * Stores the flag if throttling should throw when called less than the interval timeout.
   * @attribute _throttlingShouldThrowError
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._throttlingShouldThrowError = false;

  /**
   * Stores the current socket connection information.
   * @attribute _socketSession
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.13
   */
  this._socketSession = {};

  /**
   * Stores the queued socket messages.
   * This is to prevent too many sent over less than a second interval that might cause dropped messages
   *   or jams to the Signaling connection.
   * @attribute _socketMessageQueue
   * @type Array
   * @private
   * @for Skylink
   * @since 0.5.8
   */
  this._socketMessageQueue = [];

  /**
   * Stores the <code>setTimeout</code> to sent queued socket messages.
   * @attribute _socketMessageTimeout
   * @type Object
   * @private
   * @for Skylink
   * @since 0.5.8
   */
  this._socketMessageTimeout = null;

  /**
   * Stores the list of socket ports to use to connect to the Signaling.
   * These ports are defined by default which is commonly used currently by the Signaling.
   * Should re-evaluate this sometime.
   * @attribute _socketPorts
   * @param {Array} http: The list of HTTP socket ports.
   * @param {Array} https: The list of HTTPS socket ports.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.5.8
   */
  this._socketPorts = {
    'http:': [80, 3000],
    'https:': [443, 3443]
  };

  /**
   * Stores the flag that indicates if socket connection to the Signaling has opened.
   * @attribute _channelOpen
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.5.2
   */
  this._channelOpen = false;

  /**
   * Stores the Signaling server url.
   * @attribute _signalingServer
   * @type String
   * @private
   * @for Skylink
   * @since 0.5.2
   */
  this._signalingServer = null;

  /**
   * Stores the Signaling server protocol.
   * @attribute _signalingServerProtocol
   * @type String
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._signalingServerProtocol = window.location.protocol;

  /**
   * Stores the Signaling server port.
   * @attribute _signalingServerPort
   * @type Number
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._signalingServerPort = null;

  /**
   * Stores the Signaling socket connection object.
   * @attribute _socket
   * @type io
   * @private
   * @for Skylink
   * @since 0.1.0
   */
  this._socket = null;

  /**
   * Stores the socket connection timeout when establishing connection to the Signaling.
   * @attribute _socketTimeout
   * @type Number
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._socketTimeout = 20000;

  /**
   * Stores the flag that indicates if XDomainRequest is used for IE 8/9.
   * @attribute _socketUseXDR
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._socketUseXDR = false;

  /**
   * Stores the value if ICE restart is supported.
   * @attribute _enableIceRestart
   * @type String
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._enableIceRestart = window.webrtcDetectedBrowser === 'firefox' ?
    window.webrtcDetectedVersion >= 48 : true;

  /**
   * Stores the flag if MCU environment is enabled.
   * @attribute _hasMCU
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._hasMCU = false;

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
  this._forceSSL = false;

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
  this._forceTURNSSL = false;

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
  this._forceTURN = false;

  /**
   * Stores the construct API REST path to obtain Room credentials.
   * @attribute _path
   * @type String
   * @private
   * @for Skylink
   * @since 0.1.0
   */
  this._path = null;

  /**
   * Stores the API server url.
   * @attribute _roomServer
   * @type String
   * @private
   * @for Skylink
   * @since 0.5.2
   */
  this._roomServer = '//api.temasys.io';

  /**
   * Stores the App Key configured in <code>init()</code>.
   * @attribute _appKey
   * @type String
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._appKey = null;

  /**
   * Stores the default Room name to connect to when <code>joinRoom()</code> does not provide a Room name.
   * @attribute _defaultRoom
   * @type String
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._defaultRoom = null;

  /**
   * Stores the <code>init()</code> credentials starting DateTime stamp in ISO 8601.
   * @attribute _roomStart
   * @type String
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._roomStart = null;

  /**
   * Stores the <code>init()</code> credentials duration counted in hours.
   * @attribute _roomDuration
   * @type Number
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._roomDuration = null;

  /**
   * Stores the <code>init()</code> generated credentials string.
   * @attribute _roomCredentials
   * @type String
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._roomCredentials = null;

  /**
   * Stores the current <code>init()</code> readyState.
   * @attribute _readyState
   * @type Number
   * @private
   * @for Skylink
   * @since 0.1.0
   */
  this._readyState = 0;

  /**
   * Stores the "cid" used for <code>joinRoom()</code>.
   * @attribute _key
   * @type String
   * @private
   * @for Skylink
   * @since 0.1.0
   */
  this._key = null;

  /**
   * Stores the "apiOwner" used for <code>joinRoom()</code>.
   * @attribute _appKeyOwner
   * @type String
   * @private
   * @for Skylink
   * @since 0.5.2
   */
  this._appKeyOwner = null;

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
  this._room = null;

  /**
   * Stores the list of Peer messages timestamp.
   * @attribute _peerMessagesStamps
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.15
   */
  this._peerMessagesStamps = {};

  /**
   * Stores the flag that indicates if <code>getUserMedia()</code> should fallback to retrieve
   *   audio only Stream after retrieval of audio and video Stream had failed.
   * @attribute _audioFallback
   * @type Boolean
   * @default false
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._audioFallback = false;

  /**
   * Stores the Streams.
   * @attribute _streams
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.15
   */
  this._streams = {
    userMedia: null,
    screenshare: null
  };

  /**
   * Stores the default camera Stream settings.
   * @attribute _streamsDefaultSettings
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.15
   */
  this._streamsDefaultSettings = {
    userMedia: {
      audio: {
        stereo: false
      },
      video: {
        resolution: {
          width: 640,
          height: 480
        },
        frameRate: 50
      }
    },
    screenshare: {
      video: true
    }
  };

  /**
   * Stores all the Stream required muted settings.
   * @attribute _streamsMutedSettings
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.15
   */
  this._streamsMutedSettings = {
    audioMuted: false,
    videoMuted: false
  };

  /**
   * Stores all the Stream sending maximum bandwidth settings.
   * @attribute _streamsBandwidthSettings
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.15
   */
  this._streamsBandwidthSettings = {
    googleX: {},
    bAS: {}
  };

  /**
   * Stores all the Stream stopped callbacks.
   * @attribute _streamsStoppedCbs
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.15
   */
  this._streamsStoppedCbs = {};

  /**
   * Stores all the Stream sessions.
   * Defined as <code>false</code> when Stream has already ended.
   * @attribute _streamsSession
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.15
   */
  this._streamsSession = {};

  /**
   * Stores the preferred sending Peer connection streaming audio codec.
   * @attribute _selectedAudioCodec
   * @type String
   * @default "auto"
   * @private
   * @for Skylink
   * @since 0.5.10
   */
  this._selectedAudioCodec = 'auto';

  /**
   * Stores the preferred sending Peer connection streaming video codec.
   * @attribute _selectedVideoCodec
   * @type String
   * @default "auto"
   * @private
   * @for Skylink
   * @since 0.5.10
   */
  this._selectedVideoCodec = 'auto';

  /**
   * Stores the flag if ulpfec and red codecs should be removed.
   * @attribute _disableVideoFecCodecs
   * @type Boolean
   * @default false
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._disableVideoFecCodecs = false;

  /**
   * Stores the flag if CN (Comfort Noise) codec should be removed.
   * @attribute _disableComfortNoiseCodec
   * @type Boolean
   * @default false
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._disableComfortNoiseCodec = false;

  /**
   * Stores the flag if REMB feedback packets should be removed.
   * @attribute _disableREMB
   * @type Boolean
   * @default false
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._disableREMB = false;

  /**
   * Stores the session description settings.
   * @attribute _sdpSettings
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._sdpSettings = {
    connection: {
      audio: true,
      video: true,
      data: true
    },
    direction: {
      audio: { send: true, receive: true },
      video: { send: true, receive: true }
    }
  };

  /**
   * Stores the publish only settings.
   * @attribute _publishOnly
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._publishOnly = false;

  /**
   * Stores the parent ID.
   * @attribute _parentId
   * @type String
   * @private
   * @for Skylink
   * @since 0.6.18
   */
  this._parentId = null;

  /**
   * Stores the list of recordings.
   * @attribute _recordings
   * @type JSON
   * @private
   * @beta
   * @for Skylink
   * @since 0.6.16
   */
  this._recordings = {};

  /**
   * Stores the current active recording session ID.
   * There can only be 1 recording session at a time in a Room
   * @attribute _currentRecordingId
   * @type JSON
   * @private
   * @beta
   * @for Skylink
   * @since 0.6.16
   */
  this._currentRecordingId = false;

  /**
   * Stores the recording session timeout to ensure 4 seconds has been recorded.
   * @attribute _recordingStartInterval
   * @type JSON
   * @private
   * @beta
   * @for Skylink
   * @since 0.6.16
   */
  this._recordingStartInterval = null;

  /**
   * Stores the flag if MCU should use renegotiation.
   * @attribute _mcuUseRenegoRestart
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._mcuUseRenegoRestart = false;

  /**
   * Stores the debugging TURN/STUN ICE server.
   * @attribute _turnServer
   * @type String
   * @private
   * @for Skylink
   * @since 0.6.18
   */
  this._turnServer = null;

  /**
   * Stores the debugging Signaling server.
   * @attribute _socketServer
   * @type String
   * @private
   * @for Skylink
   * @since 0.6.18
   */
  this._socketServer = null;

  /**
   * Stores the currently supported codecs.
   * @attribute _currentCodecSupport
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.18
   */
  this._currentCodecSupport = null;

  /**
   * Stores the session description orders and info.
   * @attribute _sdpSessions
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.18
   */
  this._sdpSessions = {};
}

/**
 * Stores the data chunk size for Blob transfers.
 * @attribute _CHUNK_FILE_SIZE
 * @type Number
 * @private
 * @readOnly
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._CHUNK_FILE_SIZE = 49152;

/**
 * Stores the data chunk size for Blob transfers transferring from/to
 *   Firefox browsers due to limitation tested in the past in some PCs (linx predominatly).
 * @attribute _MOZ_CHUNK_FILE_SIZE
 * @type Number
 * @private
 * @readOnly
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._MOZ_CHUNK_FILE_SIZE = 12288;

/**
 * Stores the data chunk size for binary Blob transfers.
 * @attribute _BINARY_FILE_SIZE
 * @type Number
 * @private
 * @readOnly
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._BINARY_FILE_SIZE = 65456;

/**
 * Stores the data chunk size for binary Blob transfers.
 * @attribute _MOZ_BINARY_FILE_SIZE
 * @type Number
 * @private
 * @readOnly
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._MOZ_BINARY_FILE_SIZE = 16384;

/**
 * Stores the data chunk size for data URI string transfers.
 * @attribute _CHUNK_DATAURL_SIZE
 * @type Number
 * @private
 * @readOnly
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._CHUNK_DATAURL_SIZE = 1212;

/**
 * Stores the list of data transfer protocols.
 * @attribute _DC_PROTOCOL_TYPE
 * @param {String} WRQ The protocol to initiate data transfer.
 * @param {String} ACK The protocol to request for data transfer chunk.
 *   Give <code>-1</code> to reject the request at the beginning and <code>0</code> to accept
 *   the data transfer request.
 * @param {String} CANCEL The protocol to terminate data transfer.
 * @param {String} ERROR The protocol when data transfer has errors and has to be terminated.
 * @param {String} MESSAGE The protocol that is used to send P2P messages.
 * @type JSON
 * @readOnly
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._DC_PROTOCOL_TYPE = {
  WRQ: 'WRQ',
  ACK: 'ACK',
  ERROR: 'ERROR',
  CANCEL: 'CANCEL',
  MESSAGE: 'MESSAGE'
};

/**
 * Stores the list of socket messaging protocol types.
 * See confluence docs for the list based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @attribute _SIG_MESSAGE_TYPE
 * @type JSON
 * @readOnly
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._SIG_MESSAGE_TYPE = {
  JOIN_ROOM: 'joinRoom',
  IN_ROOM: 'inRoom',
  ENTER: 'enter',
  WELCOME: 'welcome',
  RESTART: 'restart',
  OFFER: 'offer',
  ANSWER: 'answer',
  CANDIDATE: 'candidate',
  BYE: 'bye',
  REDIRECT: 'redirect',
  UPDATE_USER: 'updateUserEvent',
  ROOM_LOCK: 'roomLockEvent',
  MUTE_VIDEO: 'muteVideoEvent',
  MUTE_AUDIO: 'muteAudioEvent',
  PUBLIC_MESSAGE: 'public',
  PRIVATE_MESSAGE: 'private',
  STREAM: 'stream',
  GROUP: 'group',
  GET_PEERS: 'getPeers',
  PEER_LIST: 'peerList',
  INTRODUCE: 'introduce',
  INTRODUCE_ERROR: 'introduceError',
  APPROACH: 'approach',
  START_RECORDING: 'startRecordingRoom',
  STOP_RECORDING: 'stopRecordingRoom',
  RECORDING: 'recordingEvent',
  END_OF_CANDIDATES: 'endOfCandidates'
};

/**
 * Stores the list of socket messaging protocol types to queue when sent less than a second interval.
 * @attribute _groupMessageList
 * @type Array
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._groupMessageList = [
  Skylink.prototype._SIG_MESSAGE_TYPE.STREAM,
  Skylink.prototype._SIG_MESSAGE_TYPE.UPDATE_USER,
  Skylink.prototype._SIG_MESSAGE_TYPE.MUTE_AUDIO,
  Skylink.prototype._SIG_MESSAGE_TYPE.MUTE_VIDEO,
  Skylink.prototype._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE
];

var SkylinkLogs = {
  /**
   * Function that gets the current stored SDK <code>console</code> logs.
   * @property SkylinkLogs.getLogs
   * @param {Number} [logLevel] The specific log level of logs to return.
   * - When not provided or that the level does not exists, it will return all logs of all levels.
   *  [Rel: Skylink.LOG_LEVEL]
   * @return {Array} The array of stored logs.<ul>
   *   <li><code><#index></code><var><b>{</b>Array<b>}</b></var><p>The stored log item.</p><ul>
   *   <li><code>0</code><var><b>{</b>Date<b>}</b></var><p>The DateTime of when the log was stored.</p></li>
   *   <li><code>1</code><var><b>{</b>String<b>}</b></var><p>The log level. [Rel: Skylink.LOG_LEVEL]</p></li>
   *   <li><code>2</code><var><b>{</b>String<b>}</b></var><p>The log message.</p></li>
   *   <li><code>3</code><var><b>{</b>Any<b>}</b></var><span class="label">Optional</span><p>The log message object.</li>
   *   <li><code>4</code><var><b>{</b>String<b>}</b></var><span class="label">Optional</span><p>The Skylink object
   *   instance label.</li></p></li></ul></li></ul>
   * @example
   *  // Example 1: Get logs of specific level
   *  var debugLogs = SkylinkLogs.getLogs(skylinkDemo.LOG_LEVEL.DEBUG);
   *
   *  // Example 2: Get all the logs
   *  var allLogs = SkylinkLogs.getLogs();
   * @type Function
   * @global true
   * @triggerForPropHackNone true
   * @for Skylink
   * @since 0.5.5
   */
  getLogs: function (logLevel, instanceLabel) {
    if (logLevel && typeof logLevel === 'string') {
      instanceLabel = logLevel;
      logLevel = null;
    }

    return LogStorageFactory.loop(instanceLabel, logLevel);
  },

  /**
   * Function that clears all the current stored SDK <code>console</code> logs.
   * @property SkylinkLogs.clearAllLogs
   * @type Function
   * @example
   *   // Example 1: Clear all the logs
   *   SkylinkLogs.clearAllLogs();
   * @global true
   * @triggerForPropHackNone true
   * @for Skylink
   * @since 0.5.5
   */
  clearAllLogs: function (instanceLabel, logLevel) {
    if (typeof instanceLabel === 'number') {
      logLevel = instanceLabel;
      instanceLabel = null;
    }

    LogStorageFactory.clear(instanceLabel, logLevel);
  },

  /**
   * Function that prints all the current stored SDK <code>console</code> logs into the
   * <a href="https://developer.mozilla.org/en/docs/Web/API/console">Javascript Web Console</a>.
   * @property SkylinkLogs.printAllLogs
   * @type Function
   * @example
   *   // Example 1: Print all the logs
   *   SkylinkLogs.printAllLogs();
   * @global true
   * @triggerForPropHackNone true
   * @for Skylink
   * @since 0.5.5
   */
  printAllLogs: function (instanceLabel, logLevel) {
    if (typeof instanceLabel === 'number') {
      logLevel = instanceLabel;
      instanceLabel = null;
    }

    var logs = LogStorageFactory.loop(instanceLabel, logLevel);
    forEach(logs, function (log) {
      console[log[1]].apply(log);
    });
  }
};
Skylink.prototype.AUDIO_CODEC = {
  AUTO: 'auto',
  ISAC: 'ISAC',
  OPUS: 'opus',
  //ILBC: 'ILBC',
  //G711: 'G711',
  G722: 'G722'
  //SILK: 'SILK'
};
Skylink.prototype.CANDIDATE_GENERATION_STATE = {
  NEW: 'new',
  GATHERING: 'gathering',
  COMPLETED: 'completed'
};
Skylink.prototype.CANDIDATE_PROCESSING_STATE = {
  RECEIVED: 'received',
  DROPPED: 'dropped',
  BUFFERED: 'buffered',
  PROCESSING: 'processing',
  PROCESS_SUCCESS: 'processSuccess',
  PROCESS_ERROR: 'processError'
};
Skylink.prototype.DATA_CHANNEL_MESSAGE_ERROR = {
  MESSAGE: 'message',
  TRANSFER: 'transfer'
};
Skylink.prototype.DATA_CHANNEL_STATE = {
  CONNECTING: 'connecting',
  OPEN: 'open',
  CLOSING: 'closing',
  CLOSED: 'closed',
  ERROR: 'error',
  CREATE_ERROR: 'createError',
  BUFFERED_AMOUNT_LOW: 'bufferedAmountLow',
  SEND_MESSAGE_ERROR: 'sendMessageError'
};
Skylink.prototype.DATA_CHANNEL_TYPE = {
  MESSAGING: 'messaging',
  DATA: 'data'
};
Skylink.prototype.DATA_STREAM_STATE = {
  SENDING_STARTED: 'sendStart',
  SENDING_STOPPED: 'sendStop',
  RECEIVING_STARTED: 'receiveStart',
  RECEIVING_STOPPED: 'receiveStop',
  RECEIVED: 'received',
  SENT: 'sent',
  ERROR: 'error',
  START_ERROR: 'startError'
};
Skylink.prototype.DATA_TRANSFER_DATA_TYPE = {
  BINARY_STRING: 'binaryString',
  ARRAY_BUFFER: 'arrayBuffer',
  BLOB: 'blob',
  STRING: 'string'
};
Skylink.prototype.DATA_TRANSFER_SESSION_TYPE = {
  BLOB: 'blob',
  DATA_URL: 'dataURL'
};
Skylink.prototype.DATA_TRANSFER_STATE = {
  UPLOAD_REQUEST: 'request',
  UPLOAD_STARTED: 'uploadStarted',
  DOWNLOAD_STARTED: 'downloadStarted',
  REJECTED: 'rejected',
  CANCEL: 'cancel',
  ERROR: 'error',
  UPLOADING: 'uploading',
  DOWNLOADING: 'downloading',
  UPLOAD_COMPLETED: 'uploadCompleted',
  DOWNLOAD_COMPLETED: 'downloadCompleted',
  USER_REJECTED: 'userRejected',
  USER_UPLOAD_REQUEST: 'userRequest',
  START_ERROR: 'startError'
};
Skylink.prototype.DATA_TRANSFER_TYPE = {
  UPLOAD: 'upload',
  DOWNLOAD: 'download'
};
Skylink.prototype.DT_PROTOCOL_VERSION = '0.1.3';
Skylink.prototype.GET_CONNECTION_STATUS_STATE = {
  RETRIEVING: 0,
  RETRIEVE_SUCCESS: 1,
  RETRIEVE_ERROR: -1
};
Skylink.prototype.GET_PEERS_STATE = {
  ENQUIRED: 'enquired',
  RECEIVED: 'received'
};
Skylink.prototype.HANDSHAKE_PROGRESS = {
  ENTER: 'enter',
  WELCOME: 'welcome',
  OFFER: 'offer',
  ANSWER: 'answer',
  ERROR: 'error'
};
Skylink.prototype.ICE_CONNECTION_STATE = {
  STARTING: 'starting',
  CHECKING: 'checking',
  CONNECTED: 'connected',
  COMPLETED: 'completed',
  CLOSED: 'closed',
  FAILED: 'failed',
  TRICKLE_FAILED: 'trickleFailed',
  DISCONNECTED: 'disconnected'
};
Skylink.prototype.INTRODUCE_STATE = {
  INTRODUCING: 'introducing',
  ERROR: 'error'
};
Skylink.prototype.LOG_LEVEL = {
  DEBUG: 4,
  LOG: 3,
  INFO: 2,
  WARN: 1,
  ERROR: 0,
  NONE: -1
};
Skylink.prototype.MEDIA_ACCESS_FALLBACK_STATE = {
  FALLBACKING: 0,
  FALLBACKED: 1,
  ERROR: -1
};
Skylink.prototype.PEER_CONNECTION_STATE = {
  STABLE: 'stable',
  HAVE_LOCAL_OFFER: 'have-local-offer',
  HAVE_REMOTE_OFFER: 'have-remote-offer',
  CLOSED: 'closed'
};
Skylink.prototype.READY_STATE_CHANGE = {
  INIT: 0,
  LOADING: 1,
  COMPLETED: 2,
  ERROR: -1
};
Skylink.prototype.READY_STATE_CHANGE_ERROR = {
  API_INVALID: 4001,
  API_DOMAIN_NOT_MATCH: 4002,
  API_CORS_DOMAIN_NOT_MATCH: 4003,
  API_CREDENTIALS_INVALID: 4004,
  API_CREDENTIALS_NOT_MATCH: 4005,
  API_INVALID_PARENT_KEY: 4006,
  API_NO_MEETING_RECORD_FOUND: 4010,
  API_OVER_SEAT_LIMIT: 4020,
  API_RETRIEVAL_FAILED: 4021,
  API_WRONG_ACCESS_DOMAIN: 5005,
  XML_HTTP_REQUEST_ERROR: -1,
  NO_SOCKET_IO: 1,
  NO_XMLHTTPREQUEST_SUPPORT: 2,
  NO_WEBRTC_SUPPORT: 3,
  NO_PATH: 4,
  ADAPTER_NO_LOADED: 7,
  PARSE_CODECS: 8
};
Skylink.prototype.RECORDING_STATE = {
  START: 0,
  STOP: 1,
  LINK: 2,
  ERROR: -1
};
Skylink.prototype.REGIONAL_SERVER = {
  APAC1: '',
  US1: ''
};
Skylink.prototype.SERVER_PEER_TYPE = {
  MCU: 'mcu'
  //SIP: 'sip'
};
Skylink.prototype.SM_PROTOCOL_VERSION = '0.1.2.3';
Skylink.prototype.SOCKET_ERROR = {
  CONNECTION_FAILED: 0,
  RECONNECTION_FAILED: -1,
  CONNECTION_ABORTED: -2,
  RECONNECTION_ABORTED: -3,
  RECONNECTION_ATTEMPT: -4
};
Skylink.prototype.SOCKET_FALLBACK = {
  NON_FALLBACK: 'nonfallback',
  FALLBACK_PORT: 'fallbackPortNonSSL',
  FALLBACK_SSL_PORT: 'fallbackPortSSL',
  LONG_POLLING: 'fallbackLongPollingNonSSL',
  LONG_POLLING_SSL: 'fallbackLongPollingSSL'
};
Skylink.prototype.SYSTEM_ACTION = {
  WARNING: 'warning',
  REJECT: 'reject'
};
Skylink.prototype.SYSTEM_ACTION_REASON = {
  CREDENTIALS_EXPIRED: 'oldTimeStamp',
  CREDENTIALS_ERROR: 'credentialError',
  DUPLICATED_LOGIN: 'duplicatedLogin',
  ROOM_NOT_STARTED: 'notStart',
  EXPIRED: 'expired',
  ROOM_LOCKED: 'locked',
  FAST_MESSAGE: 'fastmsg',
  ROOM_CLOSING: 'toclose',
  ROOM_CLOSED: 'roomclose',
  SERVER_ERROR: 'serverError',
  KEY_ERROR: 'keyFailed'
};
Skylink.prototype.TURN_TRANSPORT = {
  UDP: 'udp',
  TCP: 'tcp',
  ANY: 'any',
  NONE: 'none',
  ALL: 'all'
};
Skylink.prototype.VERSION = '0.6.17';
Skylink.prototype.VIDEO_CODEC = {
  AUTO: 'auto',
  VP8: 'VP8',
  H264: 'H264',
  VP9: 'VP9'
  //H264UC: 'H264UC'
};
Skylink.prototype.VIDEO_RESOLUTION = {
  QQVGA: { width: 160, height: 120 /*, aspectRatio: '4:3'*/ },
  HQVGA: { width: 240, height: 160 /*, aspectRatio: '3:2'*/ },
  QVGA: { width: 320, height: 240 /*, aspectRatio: '4:3'*/ },
  WQVGA: { width: 384, height: 240 /*, aspectRatio: '16:10'*/ },
  HVGA: { width: 480, height: 320 /*, aspectRatio: '3:2'*/ },
  VGA: { width: 640, height: 480 /*, aspectRatio: '4:3'*/ },
  WVGA: { width: 768, height: 480 /*, aspectRatio: '16:10'*/ },
  FWVGA: { width: 854, height: 480 /*, aspectRatio: '16:9'*/ },
  SVGA: { width: 800, height: 600 /*, aspectRatio: '4:3'*/ },
  DVGA: { width: 960, height: 640 /*, aspectRatio: '3:2'*/ },
  WSVGA: { width: 1024, height: 576 /*, aspectRatio: '16:9'*/ },
  HD: { width: 1280, height: 720 /*, aspectRatio: '16:9'*/ },
  HDPLUS: { width: 1600, height: 900 /*, aspectRatio: '16:9'*/ },
  FHD: { width: 1920, height: 1080 /*, aspectRatio: '16:9'*/ },
  QHD: { width: 2560, height: 1440 /*, aspectRatio: '16:9'*/ },
  WQXGAPLUS: { width: 3200, height: 1800 /*, aspectRatio: '16:9'*/ },
  UHD: { width: 3840, height: 2160 /*, aspectRatio: '16:9'*/ },
  UHDPLUS: { width: 5120, height: 2880 /*, aspectRatio: '16:9'*/ },
  FUHD: { width: 7680, height: 4320 /*, aspectRatio: '16:9'*/ },
  QUHD: { width: 15360, height: 8640 /*, aspectRatio: '16:9'*/ }
};
Skylink.prototype.respondBlobRequest =
Skylink.prototype.acceptDataTransfer = function (peerId, transferId, accept) {
  var self = this;

  if (typeof transferId !== 'string' && typeof peerId !== 'string') {
    self._log.error([peerId, 'RTCDataChannel', transferId, 'Aborting accept data transfer as ' +
      'data transfer ID or peer ID is not provided']);
    return;
  }

  if (!self._dataChannels[peerId]) {
    self._log.error([peerId, 'RTCDataChannel', transferId, 'Aborting accept data transfer as ' +
      'Peer does not have any Datachannel connections']);
    return;
  }

  if (!self._dataTransfers[transferId]) {
    self._log.error([peerId, 'RTCDataChannel', transferId, 'Aborting accept data transfer as ' +
      'invalid transfer ID is provided']);
    return;
  }

  // Check Datachannel property in _dataChannels[peerId] list
  var channelProp = 'main';

  if (self._dataChannels[peerId][transferId]) {
    channelProp = transferId;
  }

  if (accept) {
    self._log.debug([peerId, 'RTCDataChannel', transferId, 'Accepted data transfer and starting ...']);

    var dataChannelStateCbFn = function (state, evtPeerId, error, cN, cT) {
      console.info(evtPeerId, error, cN, cT);
      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR, transferId, peerId,
        self._getTransferInfo(transferId, peerId, true, false, false), {
        transferType: self.DATA_TRANSFER_TYPE.DOWNLOAD,
        message: new Error('Data transfer terminated as Peer Datachannel connection closed abruptly.')
      });
    };

    self.once('dataChannelState', dataChannelStateCbFn, function (state, evtPeerId, error, channelName, channelType) {
      if (!(self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
        self.off('dataChannelState', dataChannelStateCbFn);
        return;
      }
      return evtPeerId === peerId && (channelProp === 'main' ? channelType === self.DATA_CHANNEL_STATE.MESSAGING :
        channelName === transferId) && [self.DATA_CHANNEL_STATE.CLOSING, self.DATA_CHANNEL_STATE.CLOSED,
        self.DATA_CHANNEL_STATE.ERROR].indexOf(state) > -1;
    });

    // From here we start detecting as completion for data transfer downloads
    self.once('dataTransferState', function () {
      if (dataChannelStateCbFn) {
        self.off('dataChannelState', dataChannelStateCbFn);
      }

      delete self._dataTransfers[transferId];

      if (self._dataChannels[peerId]) {
        if (channelProp === 'main' && self._dataChannels[peerId].main) {
          self._dataChannels[peerId].main.transferId = null;
        }

        if (channelProp === transferId) {
          self._closeDataChannel(peerId, transferId);
        }
      }
    }, function (state, evtTransferId, evtPeerId) {
      return evtTransferId === transferId && evtPeerId === peerId &&
        [self.DATA_TRANSFER_STATE.ERROR, self.DATA_TRANSFER_STATE.CANCEL,
        self.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED].indexOf(state) > -1;
    });

    // Send ACK protocol to start data transfer
    // MCU sends the data transfer from the "P2P" Datachannel
    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.ACK,
      sender: self._user.sid,
      ackN: 0
    }, channelProp);

    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.DOWNLOAD_STARTED, transferId, peerId,
      self._getTransferInfo(transferId, peerId, true, false, false), null);

  } else {
    self._log.warn([peerId, 'RTCDataChannel', transferId, 'Rejected data transfer and data transfer request has been aborted']);

    // Send ACK protocol to terminate data transfer request
    // MCU sends the data transfer from the "P2P" Datachannel
    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.ACK,
      sender: self._user.sid,
      ackN: -1
    }, channelProp);

    // Insanity check
    if (channelProp === 'main' && self._dataChannels[peerId].main) {
      self._dataChannels[peerId].main.transferId = null;
    }

    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.USER_REJECTED, transferId, peerId,
      self._getTransferInfo(transferId, peerId, true, false, false), {
      message: new Error('Data transfer terminated as User has rejected data transfer request.'),
      transferType: self.DATA_TRANSFER_TYPE.DOWNLOAD
    });

    delete self._dataTransfers[transferId];
  }
};
Skylink.prototype.cancelBlobTransfer =
Skylink.prototype.cancelDataTransfer = function (peerId, transferId) {
  var self = this;

  if (!(transferId && typeof transferId === 'string')) {
    self._log.error([peerId, 'RTCDataChannel', transferId, 'Aborting cancel data transfer as data transfer ID is not provided']);
    return;
  }

  if (!(peerId && typeof peerId === 'string')) {
    self._log.error([peerId, 'RTCDataChannel', transferId, 'Aborting cancel data transfer as peer ID is not provided']);
    return;
  }

  if (!self._dataTransfers[transferId]) {
    self._log.error([peerId, 'RTCDataChannel', transferId, 'Aborting cancel data transfer as ' +
      'data transfer session does not exists.']);
    return;
  }

  self._log.debug([peerId, 'RTCDataChannel', transferId, 'Canceling data transfer ...']);

  /**
   * Emit data state event function.
   */
  var emitEventFn = function (peers, transferInfoPeerId) {
    for (var i = 0; i < peers.length; i++) {
      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.CANCEL, transferId, peers[i],
        self._getTransferInfo(transferId, transferInfoPeerId, false, false, false), {
        transferType: self._dataTransfers[transferId].direction,
        message: new Error('User cancelled download transfer')
      });
    }
  };

  // For uploading from Peer to MCU case of broadcast
  if (self._hasMCU && self._dataTransfers[transferId].direction === self.DATA_TRANSFER_TYPE.UPLOAD) {
    if (!self._dataChannels.MCU) {
      self._log.error([peerId, 'RTCDataChannel', transferId, 'Aborting cancel data transfer as ' +
        'Peer does not have any Datachannel connections']);
      return;
    }

    // We abort all data transfers to all Peers if uploading via MCU since it broadcasts to MCU
    self._log.warn([peerId, 'RTCDataChannel', transferId, 'Aborting all data transfers to Peers']);

    // If data transfer to MCU broadcast has interop Peers, send to MCU via the "main" Datachannel
    if (Object.keys(self._dataTransfers[transferId].peers.main).length > 0) {
      self._sendMessageToDataChannel('MCU', {
        type: self._DC_PROTOCOL_TYPE.CANCEL,
        sender: self._user.sid,
        content: 'Peer cancelled download transfer',
        name: self._dataTransfers[transferId].name,
        ackN: 0
      }, 'main');
    }

    // If data transfer to MCU broadcast has non-interop Peers, send to MCU via the new Datachanel
    if (Object.keys(self._dataTransfers[transferId].peers[transferId]).length > 0) {
      self._sendMessageToDataChannel('MCU', {
        type: self._DC_PROTOCOL_TYPE.CANCEL,
        sender: self._user.sid,
        content: 'Peer cancelled download transfer',
        name: self._dataTransfers[transferId].name,
        ackN: 0
      }, transferId);
    }

    emitEventFn(Object.keys(self._dataTransfers[transferId].peers.main).concat(
      Object.keys(self._dataTransfers[transferId].peers[transferId])));
  } else {
    var channelProp = 'main';

    if (!self._dataChannels[peerId]) {
      self._log.error([peerId, 'RTCDataChannel', transferId, 'Aborting cancel data transfer as ' +
        'Peer does not have any Datachannel connections']);
      return;
    }

    if (self._dataChannels[peerId][transferId]) {
      channelProp = transferId;
    }

    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.CANCEL,
      sender: self._user.sid,
      content: 'Peer cancelled download transfer',
      name: self._dataTransfers[transferId].name,
      ackN: 0
    }, channelProp);

    emitEventFn([peerId], peerId);
  }
};
Skylink.prototype.disableAudio = function() {
  this.muteStream({
    audioMuted: true,
    videoMuted: this._streamsMutedSettings.videoMuted
  });
};
Skylink.prototype.disableVideo = function() {
  this.muteStream({
    videoMuted: true,
    audioMuted: this._streamsMutedSettings.audioMuted
  });
};
Skylink.prototype.enableAudio = function() {
  this.muteStream({
    audioMuted: false,
    videoMuted: this._streamsMutedSettings.videoMuted
  });
};
Skylink.prototype.enableVideo = function() {
  this.muteStream({
    videoMuted: false,
    audioMuted: this._streamsMutedSettings.audioMuted
  });
};
/* jshint ignore:start */
Skylink.prototype.generateUUID = function() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r && 0x7 | 0x8)).toString(16);
  });
  return uuid;
};
/* jshint ignore:end */
Skylink.prototype.getConnectionStatus = function (targetPeerId, callback) {
  var self = this;
  var listOfPeers = Object.keys(self._peerConnections);
  var listOfPeerStats = {};
  var listOfPeerErrors = {};

  // getConnectionStatus([])
  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;

  // getConnectionStatus('...')
  } else if (typeof targetPeerId === 'string' && !!targetPeerId) {
    listOfPeers = [targetPeerId];

  // getConnectionStatus(function () {})
  } else if (typeof targetPeerId === 'function') {
    callback = targetPeerId;
    targetPeerId = undefined;
  }

  // Check if Peers list is empty, in which we throw an Error if there isn't any
  if (listOfPeers.length === 0) {
    listOfPeerErrors.self = new Error('There is currently no peer connections to retrieve connection status');

    self._log.error([null, 'RTCStatsReport', null, 'Retrieving request failure ->'], listOfPeerErrors.self);

    if (typeof callback === 'function') {
      callback({
        listOfPeers: listOfPeers,
        retrievalErrors: listOfPeerErrors,
        connectionStats: listOfPeerStats
      }, null);
    }
    return;
  }

  if (window.webrtcDetectedBrowser === 'edge') {
    self._log.warn('Edge browser does not have well support for stats.');
  }

  var completedTaskCounter = [];

  var checkCompletedFn = function (peerId) {
    if (completedTaskCounter.indexOf(peerId) === -1) {
      completedTaskCounter.push(peerId);
    }

    if (completedTaskCounter.length === listOfPeers.length) {
      if (typeof callback === 'function') {
        if (Object.keys(listOfPeerErrors).length > 0) {
          callback({
            listOfPeers: listOfPeers,
            retrievalErrors: listOfPeerErrors,
            connectionStats: listOfPeerStats
          }, null);

        } else {
          callback(null, {
            listOfPeers: listOfPeers,
            connectionStats: listOfPeerStats
          });
        }
      }
    }
  };

  var statsFn = function (peerId) {
    var retrieveFn = function (firstRetrieval, nextCb) {
      return function (err, result) {
        if (err) {
          self._log.error([peerId, 'RTCStatsReport', null, 'Retrieval failure ->'], error);
          listOfPeerErrors[peerId] = error;
          self._trigger('getConnectionStatusStateChange', self.GET_CONNECTION_STATUS_STATE.RETRIEVE_ERROR,
            peerId, null, error);
          checkCompletedFn(peerId);
          if (firstRetrieval) {
            delete self._peerStats[peerId];
          }
          return;
        }

        if (firstRetrieval) {
          nextCb();
        } else {
          listOfPeerStats[peerId] = result;
          self._trigger('getConnectionStatusStateChange', self.GET_CONNECTION_STATUS_STATE.RETRIEVE_SUCCESS,
            peerId, listOfPeerStats[peerId], null);
          checkCompletedFn(peerId);
        }
      };
    };

    if (!self._peerStats[peerId]) {
      self._peerStats[peerId] = {};

      self._log.debug([peerId, 'RTCStatsReport', null, 'Retrieving first report to tabulate results']);

      self._retrieveStats(peerId, retrieveFn(true, function () {
        self._retrieveStats(peerId, retrieveFn());
      }));
      return;
    }

    self._retrieveStats(peerId, retrieveFn());
  };

  // Loop through all the list of Peers selected to retrieve connection status
  for (var i = 0; i < listOfPeers.length; i++) {
    var peerId = listOfPeers[i];

    self._trigger('getConnectionStatusStateChange', self.GET_CONNECTION_STATUS_STATE.RETRIEVING,
      peerId, null, null);

    // Check if the Peer connection exists first
    if (self._peerConnections.hasOwnProperty(peerId) && self._peerConnections[peerId]) {
      statsFn(peerId);

    } else {
      listOfPeerErrors[peerId] = new Error('The peer connection object does not exists');

      self._log.error([peerId, 'RTCStatsReport', null, 'Retrieval failure ->'], listOfPeerErrors[peerId]);

      self._trigger('getConnectionStatusStateChange', self.GET_CONNECTION_STATUS_STATE.RETRIEVE_ERROR,
        peerId, null, listOfPeerErrors[peerId]);

      checkCompletedFn(peerId);
    }
  }
};
Skylink.prototype.getCurrentDataTransfers = function() {
  var listOfDataTransfers = {};

  if (!(this._user && this._user.sid)) {
    return {};
  }

  for (var prop in this._dataTransfers) {
    if (this._dataTransfers.hasOwnProperty(prop) && this._dataTransfers[prop]) {
      listOfDataTransfers[prop] = {
        transferInfo: this._getTransferInfo(prop, this._user.sid, true, true, true),
        isSelf: this._dataTransfers[prop].senderPeerId === this._user.sid,
        peerId: this._dataTransfers[prop].senderPeerId || this._user.sid
      };
    }
  }

  return listOfDataTransfers;
};
Skylink.prototype.getPeerInfo = function(peerId) {
  var peerInfo = null;

  if (typeof peerId === 'string' && typeof this._peerInformations[peerId] === 'object') {
    peerInfo = UtilsFactory.clone(this._peerInformations[peerId]);
    peerInfo.room = UtilsFactory.clone(this._selectedRoom);
    peerInfo.settings.bandwidth = peerInfo.settings.bandwidth || {};
    peerInfo.settings.googleXBandwidth = peerInfo.settings.googleXBandwidth || {};

    if (!(typeof peerInfo.settings.video === 'boolean' || (peerInfo.settings.video &&
      typeof peerInfo.settings.video === 'object'))) {
      peerInfo.settings.video = false;
      peerInfo.mediaStatus.audioMuted = true;
    }

    if (!(typeof peerInfo.settings.audio === 'boolean' || (peerInfo.settings.audio &&
      typeof peerInfo.settings.audio === 'object'))) {
      peerInfo.settings.audio = false;
      peerInfo.mediaStatus.audioMuted = true;
    }

    if (typeof peerInfo.mediaStatus.audioMuted !== 'boolean') {
      peerInfo.mediaStatus.audioMuted = true;
    }

    if (typeof peerInfo.mediaStatus.videoMuted !== 'boolean') {
      peerInfo.mediaStatus.videoMuted = true;
    }

    if (peerInfo.settings.maxBandwidth) {
      peerInfo.settings.bandwidth = UtilsFactory.clone(peerInfo.settings.maxBandwidth);
      delete peerInfo.settings.maxBandwidth;
    }

    if (peerInfo.settings.video && typeof peerInfo.settings.video === 'object' &&
      peerInfo.settings.video.customSettings && typeof peerInfo.settings.video.customSettings === 'object') {
      if (peerInfo.settings.video.customSettings.frameRate) {
        peerInfo.settings.video.frameRate = UtilsFactory.clone(peerInfo.settings.video.customSettings.frameRate);
      }
      if (peerInfo.settings.video.customSettings.facingMode) {
        peerInfo.settings.video.facingMode = UtilsFactory.clone(peerInfo.settings.video.customSettings.facingMode);
      }
      if (peerInfo.settings.video.customSettings.width) {
        peerInfo.settings.video.resolution = peerInfo.settings.video.resolution || {};
        peerInfo.settings.video.resolution.width = UtilsFactory.clone(peerInfo.settings.video.customSettings.width);
      }
      if (peerInfo.settings.video.customSettings.height) {
        peerInfo.settings.video.resolution = peerInfo.settings.video.resolution || {};
        peerInfo.settings.video.resolution.height = UtilsFactory.clone(peerInfo.settings.video.customSettings.height);
      }
      if (peerInfo.settings.video.customSettings.facingMode) {
        peerInfo.settings.video.facingMode = UtilsFactory.clone(peerInfo.settings.video.customSettings.facingMode);
      }
    }

    if (peerInfo.settings.audio && typeof peerInfo.settings.audio === 'object') {
      peerInfo.settings.audio.stereo = peerInfo.settings.audio.stereo === true;
    }

    if (!(peerInfo.userData !== null && typeof peerInfo.userData !== 'undefined')) {
      peerInfo.userData = '';
    }

    peerInfo.parentId = peerInfo.parentId || null;

    if (peerId === 'MCU') {
      peerInfo.config.receiveOnly = true;
      peerInfo.config.publishOnly = false;
    } else if (this._hasMCU) {
      peerInfo.config.receiveOnly = false;
      peerInfo.config.publishOnly = true;
    }

    // If there is Peer ID (not broadcast ENTER message) and Peer is Edge browser and User is not
    if (window.webrtcDetectedBrowser !== 'edge' && peerInfo.agent.name === 'edge' ?
    // If User is IE/safari and does not have H264 support, remove video support
      ['IE', 'safari'].indexOf(window.webrtcDetectedBrowser) > -1 && !this._currentCodecSupport.video.h264 :
    // If User is Edge and Peer is not and no H264 support, remove video support
      window.webrtcDetectedBrowser === 'edge' && peerInfo.agent.name !== 'edge' && !this._currentCodecSupport.video.h264) {
      peerInfo.settings.video = false;
      peerInfo.mediaStatus.videoMuted = true;
    }

  } else {
    peerInfo = {
      userData: UtilsFactory.clone(this._userData),
      settings: {
        audio: false,
        video: false
      },
      mediaStatus: UtilsFactory.clone(this._streamsMutedSettings),
      agent: {
        name: window.webrtcDetectedBrowser,
        version: window.webrtcDetectedVersion,
        os: window.navigator.platform,
        pluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
        SMProtocolVersion: this.SMProtocolVersion,
        DTProtocolVersion: this.DTProtocolVersion
      },
      room: UtilsFactory.clone(this._selectedRoom),
      config: {
        enableDataChannel: this._enableDataChannel,
        enableIceTrickle: this._enableIceTrickle,
        enableIceRestart: this._enableIceRestart,
        priorityWeight: this._peerPriorityWeight,
        receiveOnly: false,
        publishOnly: !!this._publishOnly
      }
    };

    if (!(peerInfo.userData !== null && typeof peerInfo.userData !== 'undefined')) {
      peerInfo.userData = '';
    }

    if (this._streams.screenshare) {
      peerInfo.settings = UtilsFactory.clone(this._streams.screenshare.settings);
    } else if (this._streams.userMedia) {
      peerInfo.settings = UtilsFactory.clone(this._streams.userMedia.settings);
    }

    peerInfo.settings.bandwidth = UtilsFactory.clone(this._streamsBandwidthSettings.bAS);
    peerInfo.settings.googleXBandwidth = UtilsFactory.clone(this._streamsBandwidthSettings.googleX);
    peerInfo.parentId = this._parentId ? this._parentId : null;
    peerInfo.config.receiveOnly = !peerInfo.settings.video && !peerInfo.settings.audio;
  }

  if (!peerInfo.settings.audio) {
    peerInfo.mediaStatus.audioMuted = true;
  }

  if (!peerInfo.settings.video) {
    peerInfo.mediaStatus.videoMuted = true;
  }

  if (!peerInfo.settings.audio && !peerInfo.settings.video) {
    peerInfo.config.receiveOnly = true;
    peerInfo.config.publishOnly = false;
  }

  return peerInfo;
};
Skylink.prototype.getPeers = function(showAll, callback){
	var self = this;
	if (!self._isPrivileged){
		self._log.warn('Please upgrade your key to privileged to use this function');
		return;
	}
	if (!self._appKey){
		self._log.warn('App key is not defined. Please authenticate again.');
		return;
	}

	// Only callback is provided
	if (typeof showAll === 'function'){
		callback = showAll;
		showAll = false;
	}

	self._sendChannelMessage({
		type: self._SIG_MESSAGE_TYPE.GET_PEERS,
		showAll: showAll || false
	});

	self._trigger('getPeersStateChange',self.GET_PEERS_STATE.ENQUIRED, self._user.sid, null);

	self._log.log('Enquired server for peers within the realm');

	if (typeof callback === 'function'){
		self.once('getPeersStateChange', function(state, privilegedPeerId, peerList){
			callback(null, peerList);
		}, function(state, privilegedPeerId, peerList){
			return state === self.GET_PEERS_STATE.RECEIVED;
		});
	}

};
Skylink.prototype.getPeersInRoom = function() {
  var listOfPeersInfo = {};
  var listOfPeers = Object.keys(this._peerInformations);

  for (var i = 0; i < listOfPeers.length; i++) {
    listOfPeersInfo[listOfPeers[i]] = UtilsFactory.clone(this.getPeerInfo(listOfPeers[i]));
    listOfPeersInfo[listOfPeers[i]].isSelf = false;
  }

  if (this._user && this._user.sid) {
    listOfPeersInfo[this._user.sid] = UtilsFactory.clone(this.getPeerInfo());
    listOfPeersInfo[this._user.sid].isSelf = true;
  }

  return listOfPeersInfo;
};
Skylink.prototype.getPeersStream = function() {
  var listOfPeersStreams = {};
  var listOfPeers = Object.keys(this._peerConnections);

  for (var i = 0; i < listOfPeers.length; i++) {
    var stream = null;

    if (this._peerConnections[listOfPeers[i]] &&
      this._peerConnections[listOfPeers[i]].remoteDescription &&
      this._peerConnections[listOfPeers[i]].remoteDescription.sdp &&
      (this._sdpSettings.direction.audio.receive || this._sdpSettings.direction.video.receive)) {
      var streams = this._peerConnections[listOfPeers[i]].getRemoteStreams();

      for (var j = 0; j < streams.length; j++) {
        if (this._peerConnections[listOfPeers[i]].remoteDescription.sdp.indexOf(
          'msid:' + (streams[j].id || streams[j].label)) > 0) {
          stream = streams[j];
          break;
        }
      }
    }

    listOfPeersStreams[listOfPeers[i]] = {
      streamId: stream ? stream.id || stream.label || null : null,
      stream: stream,
      isSelf: false
    };
  }

  if (this._user && this._user.sid) {
    var selfStream = null;

    if (this._streams.screenshare && this._streams.screenshare.stream) {
      selfStream = this._streams.screenshare.stream;
    } else if (this._streams.userMedia && this._streams.userMedia.stream) {
      selfStream = this._streams.userMedia.stream;
    }

    listOfPeersStreams[this._user.sid] = {
      streamId: selfStream ? selfStream.id || selfStream.label || null : null,
      stream: selfStream,
      isSelf: true
    };
  }

  return listOfPeersStreams;
};
Skylink.prototype.getRecordings = function () {
  return UtilsFactory.clone(this._recordings);
};
Skylink.prototype.getUserData = function(peerId) {
  if (peerId && this._peerInformations[peerId]) {
    var userData = this._peerInformations[peerId].userData;
    if (!(userData !== null && typeof userData === 'undefined')) {
      userData = '';
    }
    return userData;
  }
  return this._userData;
};
Skylink.prototype.getUserMedia = function(options,callback) {
  var self = this;

  if (typeof options === 'function'){
    callback = options;
    options = {
      audio: true,
      video: true
    };

  } else if (typeof options !== 'object' || options === null) {
    if (typeof options === 'undefined') {
      options = {
        audio: true,
        video: true
      };

    } else {
      var invalidOptionsError = 'Please provide a valid options';
      self._log.error(invalidOptionsError, options);
      if (typeof callback === 'function') {
        callback(new Error(invalidOptionsError), null);
      }
      return;
    }

  } else if (!options.audio && !options.video) {
    var noConstraintOptionsSelectedError = 'Please select audio or video';
    self._log.error(noConstraintOptionsSelectedError, options);
    if (typeof callback === 'function') {
      callback(new Error(noConstraintOptionsSelectedError), null);
    }
    return;
  }

  /*if (window.location.protocol !== 'https:' && window.webrtcDetectedBrowser === 'chrome' &&
    window.webrtcDetectedVersion > 46) {
    errorMsg = 'getUserMedia() has to be called in https:// application';
    log.error(errorMsg, options);
    if (typeof callback === 'function') {
      callback(new Error(errorMsg), null);
    }
    return;
  }*/

  self._throttle(function (runFn) {
    if (!runFn) {
      if (self._throttlingShouldThrowError) {
        var throttleLimitError = 'Unable to run as throttle interval has not reached (' + self._throttlingTimeouts.getUserMedia + 'ms).';
        log.error(throttleLimitError);

        if (typeof callback === 'function') {
          callback(new Error(throttleLimitError), null);
        }
      }
      return;
    }

    if (typeof callback === 'function') {
      var mediaAccessSuccessFn = function (stream) {
        self.off('mediaAccessError', mediaAccessErrorFn);
        callback(null, stream);
      };
      var mediaAccessErrorFn = function (error) {
        self.off('mediaAccessSuccess', mediaAccessSuccessFn);
        callback(error, null);
      };

      self.once('mediaAccessSuccess', mediaAccessSuccessFn, function (stream, isScreensharing) {
        return !isScreensharing;
      });

      self.once('mediaAccessError', mediaAccessErrorFn, function (error, isScreensharing) {
        return !isScreensharing;
      });
    }

    // Parse stream settings
    var settings = self._parseStreamSettings(options);

    navigator.getUserMedia(settings.getUserMediaSettings, function (stream) {
      if (settings.mutedSettings.shouldAudioMuted) {
        self._streamsMutedSettings.audioMuted = true;
      }

      if (settings.mutedSettings.shouldVideoMuted) {
        self._streamsMutedSettings.videoMuted = true;
      }

      self._onStreamAccessSuccess(stream, settings, false, false);

    }, function (error) {
      self._onStreamAccessError(error, settings, false, false);
    });
  }, 'getUserMedia', self._throttlingTimeouts.getUserMedia);
};
Skylink.prototype.init = function(options, callback) {
  var self = this;

  if (typeof options === 'function'){
    callback = options;
    options = undefined;
  }

  if (!options) {
    var error = 'No API key provided';
    self._log.error(error);
    if (typeof callback === 'function'){
      callback(error,null);
    }
    return;
  }

  var appKey, room, defaultRoom;
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
  var socketTimeout = 20000;
  var forceTURNSSL = false;
  var audioCodec = self.AUDIO_CODEC.AUTO;
  var videoCodec = self.VIDEO_CODEC.AUTO;
  var forceTURN = false;
  var usePublicSTUN = true;
  var disableVideoFecCodecs = false;
  var disableComfortNoiseCodec = false;
  var disableREMB = false;
  var filterCandidatesType = {
    host: false,
    srflx: false,
    relay: false
  };
  var throttleIntervals = {
    shareScreen: 10000,
    refreshConnection: 5000,
    getUserMedia: 0
  };
  var throttleShouldThrowError = false;
  var mcuUseRenegoRestart = false;
  var iceServer = null;
  var socketServer = null;

  self._log.log('Provided init options:', options);

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
    // set the default room
    defaultRoom = (typeof options.defaultRoom === 'string' && options.defaultRoom) ?
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
    // set the use of disabling ulpfec and red codecs
    disableVideoFecCodecs = (typeof options.disableVideoFecCodecs === 'boolean') ?
      options.disableVideoFecCodecs : disableVideoFecCodecs;
    // set the use of disabling CN codecs
    disableComfortNoiseCodec = (typeof options.disableComfortNoiseCodec === 'boolean') ?
      options.disableComfortNoiseCodec : disableComfortNoiseCodec;
    // set the use of disabling REMB packets
    disableREMB = (typeof options.disableREMB === 'boolean') ?
      options.disableREMB : disableREMB;
    // set the flag if throttling should throw error when called less than the interval timeout configured
    throttleShouldThrowError = (typeof options.throttleShouldThrowError === 'boolean') ?
      options.throttleShouldThrowError : throttleShouldThrowError;
    // set the flag if MCU refreshConnection() should use renegotiation
    mcuUseRenegoRestart = (typeof options.mcuUseRenegoRestart === 'boolean') ?
      options.mcuUseRenegoRestart : mcuUseRenegoRestart;
    // set the TURN/STUN ICE server url for debugging purposes
    iceServer = (options.iceServer && typeof options.iceServer === 'string') ?
      options.iceServer : iceServer;
    // set the Signaling server url for debugging purposes
    socketServer = (options.socketServer && typeof options.socketServer === 'string') ?
      options.socketServer : socketServer;
    // set the flag if MCU refreshConnection() should use renegotiation
    mcuUseRenegoRestart = (typeof options.mcuUseRenegoRestart === 'boolean') ?
      options.mcuUseRenegoRestart : mcuUseRenegoRestart;
    // set the use of filtering ICE candidates
    if (typeof options.filterCandidatesType === 'object' && options.filterCandidatesType) {
      filterCandidatesType.host = (typeof options.filterCandidatesType.host === 'boolean') ?
        options.filterCandidatesType.host : filterCandidatesType.host;
      filterCandidatesType.srflx = (typeof options.filterCandidatesType.srflx === 'boolean') ?
        options.filterCandidatesType.srflx : filterCandidatesType.srflx;
      filterCandidatesType.relay = (typeof options.filterCandidatesType.relay === 'boolean') ?
        options.filterCandidatesType.relay : filterCandidatesType.relay;
    }
    // set the use of throttling interval timeouts
    if (typeof options.throttleIntervals === 'object' && options.throttleIntervals) {
      throttleIntervals.shareScreen = (typeof options.throttleIntervals.shareScreen === 'number') ?
        options.throttleIntervals.shareScreen : throttleIntervals.shareScreen;
      throttleIntervals.refreshConnection = (typeof options.throttleIntervals.refreshConnection === 'number') ?
        options.throttleIntervals.refreshConnection : throttleIntervals.refreshConnection;
      throttleIntervals.getUserMedia = (typeof options.throttleIntervals.getUserMedia === 'number') ?
        options.throttleIntervals.getUserMedia : throttleIntervals.getUserMedia;
    }

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
      filterCandidatesType.host = true;
      filterCandidatesType.srflx = true;
      filterCandidatesType.relay = false;
    }
  }

  if (window.webrtcDetectedBrowser === 'edge') {
    enableSTUNServer = false;
    forceTURNSSL = false;
    TURNTransport = self.TURN_TRANSPORT.UDP;
    audioCodec = self.AUDIO_CODEC.OPUS;
    videoCodec = self.VIDEO_CODEC.H264;
    enableDataChannel = false;
  }

  // api key path options
  self._appKey = appKey;
  self._roomServer = roomServer;
  self._defaultRoom = defaultRoom;
  self._selectedRoom = room;
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
  self._disableVideoFecCodecs = disableVideoFecCodecs;
  self._disableComfortNoiseCodec = disableComfortNoiseCodec;
  self._filterCandidatesType = filterCandidatesType;
  self._throttlingTimeouts = throttleIntervals;
  self._throttlingShouldThrowError = throttleShouldThrowError;
  self._disableREMB = disableREMB;
  self._mcuUseRenegoRestart = mcuUseRenegoRestart;
  self._turnServer = iceServer;
  self._socketServer = socketServer;

  self._log.log('Init configuration:', {
    serverUrl: self._path,
    readyState: self._readyState,
    appKey: self._appKey,
    roomServer: self._roomServer,
    defaultRoom: self._defaultRoom,
    selectedRoom: self._selectedRoom,
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
    usePublicSTUN: self._usePublicSTUN,
    disableVideoFecCodecs: self._disableVideoFecCodecs,
    disableComfortNoiseCodec: self._disableComfortNoiseCodec,
    disableREMB: self._disableREMB,
    filterCandidatesType: self._filterCandidatesType,
    throttleIntervals: self._throttlingTimeouts,
    throttleShouldThrowError: self._throttlingShouldThrowError,
    mcuUseRenegoRestart: self._mcuUseRenegoRestart,
    iceServer: self._turnServer,
    socketServer: self._socketServer
  });
  // trigger the readystate
  self._readyState = 0;
  self._trigger('readyStateChange', self.READY_STATE_CHANGE.INIT, null, self._selectedRoom);

  if (typeof callback === 'function'){
    var hasTriggered = false;

    var readyStateChangeFn = function (readyState, error) {
      if (!hasTriggered) {
        if (readyState === self.READY_STATE_CHANGE.COMPLETED) {
          self._log.log([null, 'Socket', null, 'Firing callback. ' +
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
            usePublicSTUN: self._usePublicSTUN,
            disableVideoFecCodecs: self._disableVideoFecCodecs,
            disableComfortNoiseCodec: self._disableComfortNoiseCodec,
            disableREMB: self._disableREMB,
            filterCandidatesType: self._filterCandidatesType,
            throttleIntervals: self._throttlingTimeouts,
            throttleShouldThrowError: self._throttlingShouldThrowError,
            mcuUseRenegoRestart: self._mcuUseRenegoRestart,
            iceServer: self._turnServer,
            socketServer: self._socketServer
          });
        } else if (readyState === self.READY_STATE_CHANGE.ERROR) {
          self._log.log([null, 'Socket', null, 'Firing callback. ' +
            'Ready state change has met provided state ->'], readyState);
          self._log.debug([null, 'Socket', null, 'Ready state met failure'], error);
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
Skylink.prototype.introducePeer = function(sendingPeerId, receivingPeerId){
	var self = this;
	if (!self._isPrivileged){
		self._log.warn('Please upgrade your key to privileged to use this function');
		self._trigger('introduceStateChange', self.INTRODUCE_STATE.ERROR, self._user.sid, sendingPeerId, receivingPeerId, 'notPrivileged');
		return;
	}
	self._sendChannelMessage({
		type: self._SIG_MESSAGE_TYPE.INTRODUCE,
		sendingPeerId: sendingPeerId,
		receivingPeerId: receivingPeerId
	});
	self._trigger('introduceStateChange', self.INTRODUCE_STATE.INTRODUCING, self._user.sid, sendingPeerId, receivingPeerId, null);
	self._log.log('Introducing',sendingPeerId,'to',receivingPeerId);
};
Skylink.prototype.joinRoom = function(room, options, callback) {
  var self = this;
  var selectedRoom = self._defaultRoom;
  var previousRoom = self._selectedRoom;
  var mediaOptions = {};

  if (room && typeof room === 'string') {
    selectedRoom = room;
  } else if (room && typeof room === 'object') {
    mediaOptions = room;
  } else if (typeof room === 'function') {
    callback = room;
  }

  if (options && typeof options === 'object') {
    mediaOptions = options;
  } else if (typeof options === 'function') {
    callback = options;
  }

  var resolveAsErrorFn = function (error, tryRoom, readyState) {
    self._log.error(error);

    if (typeof callback === 'function') {
      callback({
        room: tryRoom,
        errorCode: readyState || null,
        error: typeof error === 'string' ? new Error(error) : error
      });
    }
  };

  var joinRoomFn = function () {
    self._initSelectedRoom(selectedRoom, function(initError, initSuccess) {
      if (initError) {
        resolveAsErrorFn(initError.error, self._selectedRoom, self._readyState);
        return;
      }

      self._waitForOpenChannel(mediaOptions, function (error, success) {
        if (error) {
          resolveAsErrorFn(error, self._selectedRoom, self._readyState);
          return;
        }

        self.once('peerJoined', function(peerId, peerInfo, isSelf) {
          if (typeof callback === 'function') {
            self._log.info([null, 'Room', selectedRoom, 'Connected to Room ->'], peerInfo);

            callback(null, {
              room: self._selectedRoom,
              peerId: peerId,
              peerInfo: peerInfo
            });
          }
        }, function(peerId, peerInfo, isSelf) {
          return peerInfo.room === selectedRoom && isSelf;
        });

        self._sendChannelMessage({
          type: self._SIG_MESSAGE_TYPE.JOIN_ROOM,
          uid: self._user.uid,
          cid: self._key,
          rid: self._room.id,
          userCred: self._user.token,
          timeStamp: self._user.timeStamp,
          apiOwner: self._appKeyOwner,
          roomCred: self._room.token,
          start: self._room.startDateTime,
          len: self._room.duration,
          isPrivileged: self._isPrivileged === true, // Default to false if undefined
          autoIntroduce: self._autoIntroduce !== false, // Default to true if undefined
          key: self._appKey
        });
      });
    });
  };

  if (room === null || ['number', 'boolean'].indexOf(typeof room) > -1) {
    resolveAsErrorFn('Invalid room name is provided', room);
    return;
  }

  if (options === null || ['number', 'boolean'].indexOf(typeof options) > -1) {
    resolveAsErrorFn('Invalid mediaOptions is provided', selectedRoom);
    return;
  }

  if (self._inRoom) {
    var stopStream = mediaOptions.audio === false && mediaOptions.video === false;

    self.leaveRoom(stopStream, function (lRError, lRSuccess) {
      self._log.debug([null, 'Room', previousRoom, 'Leave Room callback result ->'], [lRError, lRSuccess]);
      joinRoomFn();
    });
  } else {
    joinRoomFn();
  }
};
Skylink.prototype.leaveRoom = function(stopMediaOptions, callback) {
  var self = this;
  var stopUserMedia = true;
  var stopScreenshare = true;
  var previousRoom = self._selectedRoom;
  var previousUserPeerId = self._user ? self._user.sid : null;
  var peersThatLeft = [];
  var isNotInRoom = !self._inRoom;

  if (typeof stopMediaOptions === 'boolean') {
    if (stopMediaOptions === false) {
      stopUserMedia = false;
      stopScreenshare = false;
    }
  } else if (stopMediaOptions && typeof stopMediaOptions === 'object') {
    stopUserMedia = stopMediaOptions.userMedia !== false;
    stopScreenshare = stopMediaOptions.screenshare !== false;
  } else if (typeof stopMediaOptions === 'function') {
    callback = stopMediaOptions;
  }

  for (var infoPeerId in self._peerInformations) {
    if (self._peerInformations.hasOwnProperty(infoPeerId) && self._peerInformations[infoPeerId]) {
      peersThatLeft.push(infoPeerId);
      self._removePeer(infoPeerId);
    }
  }

  for (var connPeerId in self._peerConnections) {
    if (self._peerConnections.hasOwnProperty(connPeerId) && self._peerConnections[connPeerId]) {
      if (peersThatLeft.indexOf(connPeerId) === -1) {
        peersThatLeft.push(connPeerId);
        self._removePeer(connPeerId);
      }
    }
  }

  self._inRoom = false;
  self._closeChannel();

  if (isNotInRoom) {
    var notInRoomError = 'Unable to leave room as user is not in any room';
    self._log.error([null, 'Room', previousRoom, notInRoomError]);

    if (typeof callback === 'function') {
      callback(new Error(notInRoomError), null);
    }
    return;
  }

  self._stopStreams({
    userMedia: stopUserMedia,
    screenshare: stopScreenshare
  });

  self._wait(function () {
    self._log.log([null, 'Room', previousRoom, 'User left the room']);

    self._trigger('peerLeft', previousUserPeerId, self.getPeerInfo(), true);

    if (typeof callback === 'function') {
      callback(null, {
        peerId: previousUserPeerId,
        previousRoom: previousRoom
      });
    }
  }, function () {
    return !self._channelOpen;
  });
};
Skylink.prototype.lockRoom = function() {
  if (!(this._user && this._user.sid)) {
    return;
  }
  this._log.log('Update to isRoomLocked status ->', true);
  this._sendChannelMessage({
    type: this._SIG_MESSAGE_TYPE.ROOM_LOCK,
    mid: this._user.sid,
    rid: this._room.id,
    lock: true
  });
  this._roomLocked = true;
  this._trigger('roomLock', true, this._user.sid, this.getPeerInfo(), true);
};
Skylink.prototype.muteStream = function(options) {
  var self = this;

  if (typeof options !== 'object') {
    self._log.error('Provided settings is not an object');
    return;
  }

  if (!(self._streams.userMedia && self._streams.userMedia.stream) &&
    !(self._streams.screenshare && self._streams.screenshare.stream)) {
    self._log.warn('No streams are available to mute / unmute!');
    return;
  }

  var audioMuted = typeof options.audioMuted === 'boolean' ? options.audioMuted : true;
  var videoMuted = typeof options.videoMuted === 'boolean' ? options.videoMuted : true;
  var hasToggledAudio = false;
  var hasToggledVideo = false;

  if (self._streamsMutedSettings.audioMuted !== audioMuted) {
    self._streamsMutedSettings.audioMuted = audioMuted;
    hasToggledAudio = true;
  }

  if (self._streamsMutedSettings.videoMuted !== videoMuted) {
    self._streamsMutedSettings.videoMuted = videoMuted;
    hasToggledVideo = true;
  }

  if (hasToggledVideo || hasToggledAudio) {
    var streamTracksAvailability = self._muteStreams();

    if (hasToggledVideo && self._inRoom) {
      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.MUTE_VIDEO,
        mid: self._user.sid,
        rid: self._room.id,
        muted: self._streamsMutedSettings.videoMuted,
        stamp: (new Date()).getTime()
      });
    }

    if (hasToggledAudio && self._inRoom) {
      setTimeout(function () {
        self._sendChannelMessage({
          type: self._SIG_MESSAGE_TYPE.MUTE_AUDIO,
          mid: self._user.sid,
          rid: self._room.id,
          muted: self._streamsMutedSettings.audioMuted,
          stamp: (new Date()).getTime()
        });
      }, hasToggledVideo ? 1050 : 0);
    }

    if ((streamTracksAvailability.hasVideo && hasToggledVideo) ||
      (streamTracksAvailability.hasAudio && hasToggledAudio)) {

      self._trigger('localMediaMuted', {
        audioMuted: streamTracksAvailability.hasAudio ? self._streamsMutedSettings.audioMuted : true,
        videoMuted: streamTracksAvailability.hasVideo ? self._streamsMutedSettings.videoMuted : true
      });

      if (self._inRoom) {
        self._trigger('streamMuted', self._user.sid, self.getPeerInfo(), true,
          self._streams.screenshare && self._streams.screenshare.stream);
        self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
      }
    }
  }
};
Skylink.prototype.off = function(eventName, callback) {
  if (!(eventName && typeof eventName === 'string')) {
    this._EVENTS = {};
    this._onceEvents = {};
  } else {
    if (callback === undefined) {
      this._EVENTS[eventName] = [];
      this._onceEvents[eventName] = [];
      this._log.log([null, 'Event', eventName, 'All events are unsubscribed']);
      return;
    }
    var arr = this._EVENTS[eventName];
    var once = this._onceEvents[eventName];

    // unsubscribe events that is triggered always
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === callback) {
        this._log.log([null, 'Event', eventName, 'Event is unsubscribed']);
        arr.splice(i, 1);
        break;
      }
    }
    // unsubscribe events fired only once
    if(once !== undefined) {
      for (var j = 0; j < once.length; j++) {
        if (once[j][0] === callback) {
          this._log.log([null, 'Event', eventName, 'One-time Event is unsubscribed']);
          once.splice(j, 1);
          break;
        }
      }
    }
  }
};
Skylink.prototype.on = function(eventName, callback) {
  if ('function' === typeof callback) {
    this._EVENTS[eventName] = this._EVENTS[eventName] || [];
    this._EVENTS[eventName].push(callback);
    this._log.log([null, 'Event', eventName, 'Event is subscribed']);
  } else {
    this._log.error([null, 'Event', eventName, 'Provided parameter is not a function']);
  }
};
Skylink.prototype.once = function(eventName, callback, condition, fireAlways) {
  if (typeof condition === 'boolean') {
    fireAlways = condition;
    condition = null;
  }
  fireAlways = (typeof fireAlways === 'undefined' ? false : fireAlways);
  condition = (typeof condition !== 'function') ? function () {
    return true;
  } : condition;

  if (typeof callback === 'function') {
    this._onceEvents[eventName] = this._onceEvents[eventName] || [];
    this._onceEvents[eventName].push([callback, condition, fireAlways]);
    this._log.log([null, 'Event', eventName, 'Event is subscribed on condition']);
  } else {
    this._log.error([null, 'Event', eventName, 'Provided callback is not a function']);
  }
};
Skylink.prototype.refreshConnection = function(targetPeerId, iceRestart, callback) {
  var self = this;

  var listOfPeers = Object.keys(self._peerConnections);
  var doIceRestart = false;

  if(Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
  } else if (typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
  } else if (typeof targetPeerId === 'boolean') {
    doIceRestart = targetPeerId;
  } else if (typeof targetPeerId === 'function') {
    callback = targetPeerId;
  }

  if (typeof iceRestart === 'boolean') {
    doIceRestart = iceRestart;
  } else if (typeof iceRestart === 'function') {
    callback = iceRestart;
  }

  var emitErrorForPeersFn = function (error) {
    self._log.error(error);

    if (typeof callback === 'function') {
      var listOfPeerErrors = {};

      if (listOfPeers.length === 0) {
        listOfPeerErrors.self = new Error(error);
      } else {
        for (var i = 0; i < listOfPeers.length; i++) {
          listOfPeerErrors[listOfPeers[i]] = new Error(error);
        }
      }

      callback({
        refreshErrors: listOfPeerRestartErrors,
        listOfPeers: listOfPeers
      }, null);
    }
  };

  if (listOfPeers.length === 0 && !(self._hasMCU && !self._mcuUseRenegoRestart)) {
    emitErrorForPeersFn('There is currently no peer connections to restart');
    return;
  }

  if (window.webrtcDetectedBrowser === 'edge') {
    emitErrorForPeersFn('Edge browser currently does not support renegotiation.');
    return;
  }

  self._throttle(function (runFn) {
    if (!runFn && self._hasMCU && !self._mcuUseRenegoRestart) {
      if (self._throttlingShouldThrowError) {
        emitErrorForPeersFn('Unable to run as throttle interval has not reached (' + self._throttlingTimeouts.refreshConnection + 'ms).');
      }
      return;
    }
    self._refreshPeerConnection(listOfPeers, doIceRestart, callback);
  }, 'refreshConnection', self._throttlingTimeouts.refreshConnection);

};
Skylink.prototype.sendBlobData = function(data, timeout, targetPeerId, sendChunksAsBinary, callback) {
  this._startDataTransfer(data, timeout, targetPeerId, sendChunksAsBinary, callback, 'blob');
};
Skylink.prototype.sendMessage = function(message, targetPeerId) {
  var listOfPeers = Object.keys(this._peerInformations);
  var isPrivate = false;

  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;
  } else if (targetPeerId && typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  if (!this._inRoom || !this._socket || !this._user) {
    this._log.error('Unable to send message as User is not in Room. ->', message);
    return;
  }

  // Loop out unwanted Peers
  for (var i = 0; i < listOfPeers.length; i++) {
    var peerId = listOfPeers[i];

    if (!this._peerInformations[peerId]) {
      this._log.error([peerId, 'Socket', null, 'Dropping of sending message to Peer as ' +
        'Peer session does not exists']);
      listOfPeers.splice(i, 1);
      i--;
    } else if (peerId === 'MCU') {
      listOfPeers.splice(i, 1);
      i--;
    } else if (isPrivate) {
      this._log.debug([peerId, 'Socket', null, 'Sending private message to Peer']);

      this._sendChannelMessage({
        cid: this._key,
        data: message,
        mid: this._user.sid,
        rid: this._room.id,
        target: peerId,
        type: this._SIG_MESSAGE_TYPE.PRIVATE_MESSAGE
      });
    }
  }

  if (listOfPeers.length === 0) {
    this._log.warn('Currently there are no Peers to send message to (unless the message is queued and ' +
      'there are Peer connected by then).');
  }

  if (!isPrivate) {
    this._log.debug([null, 'Socket', null, 'Broadcasting message to Peers']);

    this._sendChannelMessage({
      cid: this._key,
      data: message,
      mid: this._user.sid,
      rid: this._room.id,
      type: this._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE
    });
  } else {
    this._trigger('incomingMessage', {
      content: message,
      isPrivate: isPrivate,
      targetPeerId: targetPeerId || null,
      listOfPeers: listOfPeers,
      isDataChannel: false,
      senderPeerId: this._user.sid
    }, this._user.sid, this.getPeerInfo(), true);
  }
};
Skylink.prototype.sendP2PMessage = function(message, targetPeerId) {
  var listOfPeers = Object.keys(this._dataChannels);
  var isPrivate = false;

  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;
  } else if (targetPeerId && typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  if (!this._inRoom || !(this._user && this._user.sid)) {
    this._log.error('Unable to send message as User is not in Room. ->', message);
    return;
  }

  if (!this._enableDataChannel) {
    this._log.error('Unable to send message as User does not have Datachannel enabled. ->', message);
    return;
  }

  // Loop out unwanted Peers
  for (var i = 0; i < listOfPeers.length; i++) {
    var peerId = listOfPeers[i];

    if (!this._dataChannels[peerId]) {
      this._log.error([peerId, 'RTCDataChannel', null, 'Dropping of sending message to Peer as ' +
        'Datachannel connection does not exists']);
      listOfPeers.splice(i, 1);
      i--;
    } else if (peerId === 'MCU') {
      listOfPeers.splice(i, 1);
      i--;
    } else if (!this._hasMCU) {
      this._log.debug([peerId, 'RTCDataChannel', null, 'Sending ' + (isPrivate ? 'private' : '') +
        ' P2P message to Peer']);

      this._sendMessageToDataChannel(peerId, {
        type: this._DC_PROTOCOL_TYPE.MESSAGE,
        isPrivate: isPrivate,
        sender: this._user.sid,
        target: peerId,
        data: message
      }, 'main');
    }
  }

  if (listOfPeers.length === 0) {
    this._log.warn('Currently there are no Peers to send P2P message to (unless the message is queued ' +
      'and there are Peer connected by then).');
  }

  if (this._hasMCU) {
    this._log.debug(['MCU', 'RTCDataChannel', null, 'Broadcasting ' + (isPrivate ? 'private' : '') +
      ' P2P message to Peers']);

    this._sendMessageToDataChannel('MCU', {
      type: this._DC_PROTOCOL_TYPE.MESSAGE,
      isPrivate: isPrivate,
      sender: this._user.sid,
      target: listOfPeers,
      data: message
    }, 'main');
  }

  this._trigger('incomingMessage', {
    content: message,
    isPrivate: isPrivate,
    targetPeerId: targetPeerId || null,
    listOfPeers: listOfPeers,
    isDataChannel: true,
    senderPeerId: this._user.sid
  }, this._user.sid, this.getPeerInfo(), true);
};
Skylink.prototype.sendStream = function(options, callback) {
  var self = this;

  var restartFn = function (stream) {
    if (self._inRoom) {
      if (!self._streams.screenshare) {
        self._trigger('incomingStream', self._user.sid, stream, true, self.getPeerInfo(), false, stream.id || stream.label);
        self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
      }

      if (Object.keys(self._peerConnections).length > 0 || self._hasMCU) {
        self._refreshPeerConnection(Object.keys(self._peerConnections), false, function (err, success) {
          if (err) {
            self._log.error('Failed refreshing connections for sendStream() ->', err);
            if (typeof callback === 'function') {
              callback(new Error('Failed refreshing connections.'), null);
            }
            return;
          }
          if (typeof callback === 'function') {
            callback(null, stream);
          }
        });
      } else if (typeof callback === 'function') {
        callback(null, stream);
      }
    } else {
      var notInRoomAgainError = 'Unable to send stream as user is not in the Room.';
      self._log.error(notInRoomAgainError, stream);
      if (typeof callback === 'function') {
        callback(new Error(notInRoomAgainError), null);
      }
    }
  };

  if (typeof options !== 'object' || options === null) {
    var invalidOptionsError = 'Provided stream settings is invalid';
    self._log.error(invalidOptionsError, options);
    if (typeof callback === 'function'){
      callback(new Error(invalidOptionsError),null);
    }
    return;
  }

  if (!self._inRoom) {
    var notInRoomError = 'Unable to send stream as user is not in the Room.';
    self._log.error(notInRoomError, options);
    if (typeof callback === 'function'){
      callback(new Error(notInRoomError),null);
    }
    return;
  }

  if (window.webrtcDetectedBrowser === 'edge') {
    var edgeNotSupportError = 'Edge browser currently does not support renegotiation.';
    self._log.error(edgeNotSupportError, options);
    if (typeof callback === 'function'){
      callback(new Error(edgeNotSupportError),null);
    }
    return;
  }

  if (typeof options.getAudioTracks === 'function' || typeof options.getVideoTracks === 'function') {
    var checkActiveTracksFn = function (tracks) {
      for (var t = 0; t < tracks.length; t++) {
        if (!(tracks[t].ended || (typeof tracks[t].readyState === 'string' ?
          tracks[t].readyState !== 'live' : false))) {
          return true;
        }
      }
      return false;
    };

    if (!checkActiveTracksFn( options.getAudioTracks() ) && !checkActiveTracksFn( options.getVideoTracks() )) {
      var invalidStreamError = 'Provided stream object does not have audio or video tracks.';
      self._log.error(invalidStreamError, options);
      if (typeof callback === 'function'){
        callback(new Error(invalidStreamError),null);
      }
      return;
    }

    self._onStreamAccessSuccess(options, {
      settings: {
        audio: true,
        video: true
      },
      getUserMediaSettings: {
        audio: true,
        video: true
      }
    }, false, false);

    restartFn(options);

  } else {
    self.getUserMedia(options, function (err, stream) {
      if (err) {
        if (typeof callback === 'function') {
          callback(err, null);
        }
        return;
      }
      restartFn(stream);
    });
  }
};
Skylink.prototype.sendURLData = function(data, timeout, targetPeerId, callback) {
  this._startDataTransfer(data, timeout, targetPeerId, callback, null, 'data');
};
Skylink.prototype.setDebugMode = function(options) {
  var self = this;

  if (options && typeof options === 'object') {
    self._log.setDebugMode(options.trace, options.storeLogs, options.printInstanceLabel, options.printTimeStamp);
  } else if (options === true) {
    self._log.setDebugMode(true, true, true, true);
  } else {
    self._log.setDebugMode();
  }
};
Skylink.prototype.setLogLevel = function(logLevel) {
  var self = this;
  var error = self._log.setLogLevel(logLevel);
};
Skylink.prototype.setUserData = function(userData) {
  var self = this;
  var updatedUserData = '';

  if (!(typeof userData === 'undefined' || userData === null)) {
    updatedUserData = userData;
  }

  self._userData = updatedUserData;

  if (self._inRoom) {
    self._log.log('Updated userData -> ', updatedUserData);
    self._sendChannelMessage({
      type: self._SIG_MESSAGE_TYPE.UPDATE_USER,
      mid: self._user.sid,
      rid: self._room.id,
      userData: updatedUserData,
      stamp: (new Date()).getTime()
    });
    self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
  } else {
    self._log.warn('User is not in the room. Broadcast of updated information will be dropped');
  }
};
Skylink.prototype.shareScreen = function (enableAudio, callback) {
  var self = this;
  var enableAudioSettings = {
    stereo: true
  };

  if (typeof enableAudio === 'function') {
    callback = enableAudio;
    enableAudio = true;

  } else if (enableAudio && typeof enableAudio === 'object') {
    enableAudioSettings.usedtx = typeof enableAudio.usedtx === 'boolean' ? enableAudio.usedtx : null;
    enableAudioSettings.useinbandfec = typeof enableAudio.useinbandfec === 'boolean' ? enableAudio.useinbandfec : null;
    enableAudioSettings.stereo = enableAudio.stereo === true;
    enableAudioSettings.echoCancellation = enableAudio.echoCancellation === true;
  }

  self._throttle(function (runFn) {
    if (!runFn) {
      if (self._throttlingShouldThrowError) {
        var throttleLimitError = 'Unable to run as throttle interval has not reached (' + self._throttlingTimeouts.shareScreen + 'ms).';
        self._log.error(throttleLimitError);

        if (typeof callback === 'function') {
          callback(new Error(throttleLimitError), null);
        }
      }
      return;
    }

    var settings = {
      settings: {
        audio: enableAudio === true || (enableAudio && typeof enableAudio === 'object') ? enableAudioSettings : false,
        video: {
          screenshare: true,
          exactConstraints: false
        }
      },
      getUserMediaSettings: {
        video: {
          mediaSource: 'window'
        }
      }
    };

    var mediaAccessSuccessFn = function (stream) {
      self.off('mediaAccessError', mediaAccessErrorFn);

      if (self._inRoom) {
        self._trigger('incomingStream', self._user.sid, stream, true, self.getPeerInfo(), true, stream.id || stream.label);
        self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);

        if (Object.keys(self._peerConnections).length > 0 || self._hasMCU) {
          self._refreshPeerConnection(Object.keys(self._peerConnections), false, function (err, success) {
            if (err) {
              log.error('Failed refreshing connections for shareScreen() ->', err);
              if (typeof callback === 'function') {
                callback(new Error('Failed refreshing connections.'), null);
              }
              return;
            }
            if (typeof callback === 'function') {
              callback(null, stream);
            }
          });
        } else if (typeof callback === 'function') {
          callback(null, stream);
        }
      } else if (typeof callback === 'function') {
        callback(null, stream);
      }
    };

    var mediaAccessErrorFn = function (error) {
      self.off('mediaAccessSuccess', mediaAccessSuccessFn);

      if (typeof callback === 'function') {
        callback(error, null);
      }
    };

    self.once('mediaAccessSuccess', mediaAccessSuccessFn, function (stream, isScreensharing) {
      return isScreensharing;
    });

    self.once('mediaAccessError', mediaAccessErrorFn, function (error, isScreensharing) {
      return isScreensharing;
    });

    try {
      if (enableAudio && window.webrtcDetectedBrowser === 'firefox') {
        settings.getUserMediaSettings.audio = true;
      }

      navigator.getUserMedia(settings.getUserMediaSettings, function (stream) {
        if (window.webrtcDetectedBrowser === 'firefox' || !enableAudio) {
          self._onStreamAccessSuccess(stream, settings, true, false);
          return;
        }

        navigator.getUserMedia({
          audio: true

        }, function (audioStream) {
          try {
            audioStream.addTrack(stream.getVideoTracks()[0]);

            self.once('mediaAccessSuccess', function () {
              self._streams.screenshare.streamClone = stream;
            }, function (stream, isScreensharing) {
              return isScreensharing;
            });

            self._onStreamAccessSuccess(audioStream, settings, true, false);

          } catch (error) {
            self._log.error('Failed retrieving audio stream for screensharing stream', error);
            self._onStreamAccessSuccess(stream, settings, true, false);
          }
        }, function (error) {
          self._log.error('Failed retrieving audio stream for screensharing stream', error);
          self._onStreamAccessSuccess(stream, settings, true, false);
        });

      }, function (error) {
        self._onStreamAccessError(error, settings, true, false);
      });

    } catch (error) {
      self._onStreamAccessError(error, settings, true, false);
    }
  }, 'shareScreen', self._throttlingTimeouts.shareScreen);
};
Skylink.prototype.startRecording = function (callback) {
  var self = this;

  if (!self._hasMCU) {
    var noMCUError = 'Unable to start recording as MCU is not connected';
    self._log.error(noMCUError);
    if (typeof callback === 'function') {
      callback(new Error(noMCUError), null);
    }
    return;
  }

  if (self._currentRecordingId) {
    var hasRecordingSessionError = 'Unable to start recording as there is an existing recording in-progress';
    self._log.error(hasRecordingSessionError);
    if (typeof callback === 'function') {
      callback(new Error(hasRecordingSessionError), null);
    }
    return;
  }

  if (typeof callback === 'function') {
    self.once('recordingState', function (state, recordingId) {
      callback(null, recordingId);
    }, function (state) {
      return state === self.RECORDING_STATE.START;
    });
  }

  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.START_RECORDING,
    rid: self._room.id,
    target: 'MCU'
  });

  self._log.debug(['MCU', 'Recording', null, 'Starting recording']);
};
Skylink.prototype.startStreamingData = function(isStringStream, targetPeerId) {
  var self = this;
  var listOfPeers = Object.keys(self._dataChannels);
  var isPrivate = false;
  var sessionChunkType = 'binary';

  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;
  } else if (targetPeerId && typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  if (Array.isArray(isStringStream)) {
    listOfPeers = isStringStream;
    targetPeerId = isStringStream;
    isPrivate = true;
  } else if (isStringStream && typeof isStringStream === 'string') {
    listOfPeers = [isStringStream];
    targetPeerId = isStringStream;
    isPrivate = true;
  } else if (isStringStream && typeof isStringStream === 'boolean') {
    sessionChunkType = 'string';
  }

  var sessionInfo = {
    chunk: null,
    chunkSize: 0,
    chunkType: sessionChunkType === 'string' ? self.DATA_TRANSFER_DATA_TYPE.STRING :
      self.DATA_TRANSFER_DATA_TYPE.BLOB,
    isPrivate: isPrivate,
    isStringStream: sessionChunkType === 'string',
    senderPeerId: self._user && self._user.sid ? self._user.sid : null
  };

  // Remove MCU from list
  if (listOfPeers.indexOf('MCU') > -1) {
    listOfPeers.splice(listOfPeers.indexOf('MCU'), 1);
  }

  var emitErrorBeforeStreamingFn = function (error) {
    self._log.error(error);

    if (listOfPeers.length > 0) {
      for (var i = 0; i < listOfPeers.length; i++) {
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, null,
          listOfPeers[i], sessionInfo, new Error(error));
      }
    } else {
      self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, null,
        null, sessionInfo, new Error(error));
    }
  };

  if (!this._inRoom || !(this._user && this._user.sid)) {
    return emitErrorBeforeStreamingFn('Unable to start data streaming as User is not in Room.');
  }

  if (!this._enableDataChannel) {
    return emitErrorBeforeStreamingFn('Unable to start data streaming as User does not have Datachannel enabled.');
  }

  if (listOfPeers.length === 0) {
    return emitErrorBeforeStreamingFn('Unable to start data streaming as there are no Peers to start session with.');
  }

  var transferId = 'stream_' + (self._user && self._user.sid ? self._user.sid : '-') + '_' + (new Date()).getTime();
  var peersInterop = [];
  var peersNonInterop = [];
  var sessions = {};
  var listenToPeerFn = function (peerId, channelProp) {
    var hasStarted = false;
    sessions[peerId] = channelProp;

    self.once('dataStreamState', function () {}, function (state, evtTransferId, evtPeerId, evtSessionInfo) {
      if (!(evtTransferId === transferId && evtPeerId === peerId)) {
        return;
      }

      var dataChunk = evtSessionInfo.chunk;
      var updatedSessionInfo = UtilsFactory.clone(evtSessionInfo);
      delete updatedSessionInfo.chunk;

      if (state === self.DATA_STREAM_STATE.SENDING_STARTED) {
        hasStarted = true;
        return;
      }

      if (hasStarted && [self.DATA_STREAM_STATE.ERROR, self.DATA_STREAM_STATE.SENDING_STOPPED].indexOf(state) > -1) {
        if (channelProp === transferId) {
          self._closeDataChannel(peerId, transferId);
        }

        if (self._dataStreams[transferId] && self._dataStreams[transferId].sessions[peerId]) {
          delete self._dataStreams[transferId].sessions[peerId];

          if (Object.keys(self._dataStreams[transferId].sessions).length === 0) {
            delete self._dataStreams[transferId];
          }
        }
        return true;
      }
    });
  };

  // Loop out unwanted Peers
  for (var i = 0; i < listOfPeers.length; i++) {
    var peerId = listOfPeers[i];
    var error = null;
    var dtProtocolVersion = ((self._peerInformations[peerId] || {}).agent || {}).DTProtocolVersion || '';
    var channelProp = self._isLowerThanVersion(dtProtocolVersion, '0.1.2') ? 'main' : transferId;

    if (!(self._dataChannels[peerId] && self._dataChannels[peerId].main)) {
      error = 'Datachannel connection does not exists';
    } else if (self._hasMCU && !(self._dataChannels.MCU && self._dataChannels.MCU.main)) {
      error = 'MCU Datachannel connection does not exists';
    } else if (self._isLowerThanVersion(dtProtocolVersion, '0.1.3')) {
      error = 'Peer DTProtocolVersion does not support data streaming. (received: "' + dtProtocolVersion + '", expected: "0.1.3")';
    } else {
      if (channelProp === 'main') {
        var dataTransferId = self._hasMCU ? self._dataChannels.MCU.main.transferId : self._dataChannels[peerId].main.transferId;

        if (self._dataChannels[peerId].main.streamId) {
          error = 'Peer Datachannel currently has an active data transfer session.';
        } else if (self._hasMCU && self._dataChannels.MCU.main.streamId) {
          error = 'MCU Peer Datachannel currently has an active data transfer session.';
        } else if (self._dataTransfers[dataTransferId] && self._dataTransfers[dataTransferId].sessionChunkType === sessionChunkType) {
          error = (self._hasMCU ? 'MCU ' : '') + 'Peer Datachannel currently has an active ' + sessionChunkType + ' data transfer.';
        } else {
          peersInterop.push(peerId);
        }
      } else {
        peersNonInterop.push(peerId);
      }
    }

    if (error) {
      self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, transferId, peerId, sessionInfo, new Error(error));
      listOfPeers.splice(i, 1);
      i--;
    } else {
      listenToPeerFn(peerId, channelProp);
    }
  }

  if (listOfPeers.length === 0) {
    self._log.warn('There are no Peers to start data session with.');
    return;
  }

  self._dataStreams[transferId] = {
    sessions: sessions,
    chunkType: sessionChunkType === 'string' ? self.DATA_TRANSFER_DATA_TYPE.STRING :
      self.DATA_TRANSFER_DATA_TYPE.BLOB,
    sessionChunkType: sessionChunkType,
    isPrivate: isPrivate,
    isStringStream: sessionChunkType === 'string',
    senderPeerId: self._user && self._user.sid ? self._user.sid : null,
    isUpload: true
  };

  var startDataSessionFn = function (peerId, channelProp, targetPeers) {
    self.once('dataChannelState', function () {}, function (state, evtPeerId, channelName, channelType, error) {
      if (!self._dataStreams[transferId]) {
        return true;
      }

      if (!(evtPeerId === peerId && (channelProp === 'main' ? channelType === self.DATA_CHANNEL_TYPE.MESSAGING :
        channelName === transferId && channelType === self.DATA_CHANNEL_TYPE.DATA))) {
        return;
      }

      if ([self.DATA_CHANNEL_STATE.ERROR, self.DATA_CHANNEL_STATE.CLOSED].indexOf(state) > -1) {
        var updatedError = new Error(error && error.message ? error.message :
          'Failed data transfer as datachannel state is "' + state + '".');

        if (peerId === 'MCU') {
          for (var mp = 0; mp < targetPeers.length; mp++) {
            self._trigger('dataStreamState', self.DATA_STREAM_STATE.ERROR, transferId, targetPeers[mp], sessionInfo, updatedError);
          }
        } else {
          self._trigger('dataStreamState', self.DATA_STREAM_STATE.ERROR, transferId, peerId, sessionInfo, updatedError);
        }
        return true;
      }
    });

    if (!(self._dataChannels[peerId][channelProp] &&
      self._dataChannels[peerId][channelProp].channel.readyState === self.DATA_CHANNEL_STATE.OPEN)) {
      var notOpenError = new Error('Failed starting data streaming session as channel is not opened.');
      if (peerId === 'MCU') {
        for (i = 0; i < targetPeers.length; i++) {
          self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, transferId, targetPeers[i], sessionInfo, notOpenError);
        }
      } else {
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, transferId, peerId, sessionInfo, notOpenError);
      }
    }

    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.WRQ,
      transferId: transferId,
      name: transferId,
      size: 0,
      originalSize: 0,
      dataType: 'fastBinaryStart',
      mimeType: null,
      chunkType: sessionChunkType,
      chunkSize: 0,
      timeout: 0,
      isPrivate: isPrivate,
      sender: self._user.sid,
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion,
      target: peerId === 'MCU' ? targetPeers : peerId
    }, channelProp);
    self._dataChannels[peerId][channelProp].streamId = transferId;

    var updatedSessionInfo = UtilsFactory.clone(sessionInfo);
    delete updatedSessionInfo.chunk;

    if (peerId === 'MCU') {
      for (var tp = 0; tp < targetPeers.length; tp++) {
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENDING_STARTED, transferId, targetPeers[tp], sessionInfo, null);
        self._trigger('incomingDataStreamStarted', transferId, targetPeers[tp], updatedSessionInfo, true);
      }
    } else {
      self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENDING_STARTED, transferId, peerId, sessionInfo, null);
      self._trigger('incomingDataStreamStarted', transferId, peerId, updatedSessionInfo, true);
    }
  };

  var waitForChannelOpenFn = function (peerId, targetPeers) {
    self.once('dataChannelState', function (state, evtPeerId, error) {
      if (state === self.DATA_CHANNEL_STATE.CREATE_ERROR) {
        if (peerId === 'MCU') {
          for (var mp = 0; mp < targetPeers.length; mp++) {
            self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, transferId, targetPeers[mp], sessionInfo, error);
          }
        } else {
          self._trigger('dataStreamState', self.DATA_STREAM_STATE.START_ERROR, transferId, peerId, sessionInfo, error);
        }
        return;
      }
      startDataSessionFn(peerId, transferId, targetPeers);
    }, function (state, evtPeerId, error, channelName, channelType) {
      if (evtPeerId === peerId && channelName === transferId && channelType === self.DATA_CHANNEL_TYPE.DATA) {
        return [self.DATA_CHANNEL_STATE.CREATE_ERROR, self.DATA_CHANNEL_STATE.OPEN].indexOf(state) > -1;
      }
    });
    self._createDataChannel(peerId, transferId);
  };

  if (peersNonInterop.length > 0) {
    if (self._hasMCU) {
      waitForChannelOpenFn('MCU', peersNonInterop);
    } else {
      for (var pni = 0; pni < peersNonInterop.length; pni++) {
        waitForChannelOpenFn(peersNonInterop[pni], null);
      }
    }
  }

  if (peersInterop.length > 0) {
    if (self._hasMCU) {
      startDataSessionFn('MCU', 'main', peersInterop);
    } else {
      for (var pi = 0; pi < peersInterop.length; pi++) {
        startDataSessionFn(peersInterop[pi], 'main', null);
      }
    }
  }
};
Skylink.prototype.stopRecording = function (callback, callbackSuccessWhenLink) {
  var self = this;

  if (!self._hasMCU) {
    var noMCUError = 'Unable to stop recording as MCU is not connected';
    self._log.error(noMCUError);
    if (typeof callback === 'function') {
      callback(new Error(noMCUError), null);
    }
    return;
  }

  if (!self._currentRecordingId) {
    var noRecordingSessionError = 'Unable to stop recording as there is no recording in-progress';
    self._log.error(noRecordingSessionError);
    if (typeof callback === 'function') {
      callback(new Error(noRecordingSessionError), null);
    }
    return;
  }

  if (self._recordingStartInterval) {
    var recordingSecsRequiredError = 'Unable to stop recording as 4 seconds has not been recorded yet';
    self._log.error(recordingSecsRequiredError);
    if (typeof callback === 'function') {
      callback(new Error(recordingSecsRequiredError), null);
    }
    return;
  }

  if (typeof callback === 'function') {
    var expectedRecordingId = self._currentRecordingId;

    self.once('recordingState', function (state, recordingId, link, error) {
      if (callbackSuccessWhenLink) {
        if (error) {
          callback(error, null);
          return;
        }

        callback(null, {
          link: link,
          recordingId: recordingId
        });
        return;
      }

      callback(null, recordingId);

    }, function (state, recordingId) {
      if (expectedRecordingId === recordingId) {
        if (callbackSuccessWhenLink) {
          return [self.RECORDING_STATE.LINK, self.RECORDING_STATE.ERROR].indexOf(state) > -1;
        }
        return state === self.RECORDING_STATE.STOP;
      }
    });
  }

  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.STOP_RECORDING,
    rid: self._room.id,
    target: 'MCU'
  });

  self._log.debug(['MCU', 'Recording', null, 'Stopping recording']);
};
Skylink.prototype.stopScreen = function () {
  if (this._streams.screenshare) {
    this._stopStreams({
      screenshare: true
    });

    if (this._inRoom) {
      if (this._streams.userMedia && this._streams.userMedia.stream) {
        this._trigger('incomingStream', this._user.sid, this._streams.userMedia.stream, true, this.getPeerInfo(),
          false, this._streams.userMedia.stream.id || this._streams.userMedia.stream.label);
        this._trigger('peerUpdated', this._user.sid, this.getPeerInfo(), true);
      }
      this._refreshPeerConnection(Object.keys(this._peerConnections), false);
    }
  }
};
Skylink.prototype.stopStream = function () {
  if (this._streams.userMedia) {
    this._stopStreams({
      userMedia: true
    });
  }
};
Skylink.prototype.stopStreamingData = function(transferId) {
  var self = this;

  if (!(transferId && typeof transferId === 'string')) {
    self._log.error('Failed streaming data chunk as stream session ID is not provided.');
    return;
  }

  if (!(self._inRoom && self._user && self._user.sid)) {
    self._log.error('Failed streaming data chunk as User is not in the Room.');
    return;
  }

  if (!self._dataStreams[transferId]) {
    self._log.error('Failed stopping data streaming session as it does not exists.');
    return;
  }

  if (!self._dataStreams[transferId].isUpload) {
    self._log.error('Failed stopping data streaming session as it is not sending.');
    return;
  }

  var sessionInfo = {
    chunk: null,
    chunkSize: 0,
    chunkType: self._dataStreams[transferId].sessionChunkType === 'string' ? self.DATA_TRANSFER_DATA_TYPE.STRING :
      self.DATA_TRANSFER_DATA_TYPE.BLOB,
    isPrivate: self._dataStreams[transferId].sessionChunkType.isPrivate,
    isStringStream: self._dataStreams[transferId].sessionChunkType === 'string',
    senderPeerId: self._user && self._user.sid ? self._user.sid : null
  };

  var peersInterop = [];
  var peersNonInterop = [];
  var sendDataFn = function (peerId, channelProp, targetPeers) {
    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.WRQ,
      transferId: transferId,
      name: transferId,
      size: 0,
      originalSize: 0,
      dataType: 'fastBinaryStop',
      mimeType: null,
      chunkType: self._dataStreams[transferId].sessionChunkType,
      chunkSize: 0,
      timeout: 0,
      isPrivate: self._dataStreams[transferId].isPrivate,
      sender: self._user.sid,
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion,
      target: targetPeers ? targetPeers : peerId
    }, channelProp);

    var updatedSessionInfo = UtilsFactory.clone(sessionInfo);
    delete updatedSessionInfo.chunk;

    if (targetPeers) {
      for (var i = 0; i < targetPeers.length; i++) {
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENDING_STOPPED, transferId, targetPeers[i], sessionInfo, null);
        self._trigger('incomingDataStreamStopped', transferId, targetPeers[i], updatedSessionInfo, true);
      }
    } else {
      self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENDING_STOPPED, transferId, peerId, sessionInfo, null);
      self._trigger('incomingDataStreamStopped', transferId, peerId, updatedSessionInfo, true);
    }
  };

  for (var peerId in self._dataStreams[transferId].sessions) {
    if (self._dataStreams[transferId].sessions.hasOwnProperty(peerId) && self._dataStreams[transferId].sessions[peerId]) {
      var channelProp = self._dataStreams[transferId].sessions[peerId];

      if (!(self._dataChannels[self._hasMCU ? 'MCU' : peerId] && self._dataChannels[self._hasMCU ? 'MCU' : peerId][channelProp] &&
        self._dataChannels[self._hasMCU ? 'MCU' : peerId][channelProp].channel.readyState === self.DATA_CHANNEL_STATE.OPEN &&
        self._dataChannels[self._hasMCU ? 'MCU' : peerId][channelProp].streamId === transferId)) {
        self._log.error([peerId, 'RTCDataChannel', transferId, 'Failed stopping data streaming session as channel is closed.']);
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.ERROR, transferId, peerId, sessionInfo,
          new Error('Failed stopping data streaming session as Datachannel connection is not open or is active.'));
        return;
      }

      if (self._hasMCU) {
        if (self._dataStreams[transferId].sessions[peerId] === 'main') {
          peersInterop.push(peerId);
        } else {
          peersNonInterop.push(peerId);
        }
      } else {
        sendDataFn(peerId, channelProp);
      }
    }
  }

  if (self._hasMCU) {
    if (peersInterop.length > 0) {
      sendDataFn(peerId, 'main', peersInterop);
    }
    if (peersNonInterop.length > 0) {
      sendDataFn(peerId, transferId, peersNonInterop);
    }
  }
};
Skylink.prototype.streamData = function(transferId, dataChunk) {
  var self = this;

  if (!(transferId && typeof transferId === 'string')) {
    self._log.error('Failed streaming data chunk as stream session ID is not provided.');
    return;
  }

  if (!(dataChunk && typeof dataChunk === 'object' && (dataChunk instanceof Blob || dataChunk instanceof ArrayBuffer))) {
    self._log.error('Failed streaming data chunk as it is not provided.');
    return;
  }

  if (!(self._inRoom && self._user && self._user.sid)) {
    self._log.error('Failed streaming data chunk as User is not in the Room.');
    return;
  }

  if (!self._dataStreams[transferId]) {
    self._log.error('Failed streaming data chunk as session does not exists.');
    return;
  }

  if (!self._dataStreams[transferId].isUpload) {
    self._log.error('Failed streaming data chunk as session is not sending.');
    return;
  }

  if (self._dataStreams[transferId].sessionChunkType === 'string' ? typeof dataChunk !== 'string' :
    typeof dataChunk !== 'object') {
    self._log.error('Failed streaming data chunk as data chunk does not match expected data type.');
    return;
  }

  var updatedDataChunk = dataChunk instanceof ArrayBuffer ? new Blob(dataChunk) : dataChunk;

  if (self._dataStreams[transferId].sessionChunkType === 'string' ? updatedDataChunk.length > self._CHUNK_DATAURL_SIZE :
    updatedDataChunk.length > self._BINARY_FILE_SIZE) {
    self._log.error('Failed streaming data chunk as data chunk exceeds maximum chunk limit.');
    return;
  }

  var sessionInfo = {
    chunk: updatedDataChunk,
    chunkSize: updatedDataChunk.size || updatedDataChunk.length || updatedDataChunk.byteLength,
    chunkType: self._dataStreams[transferId].sessionChunkType === 'string' ? self.DATA_TRANSFER_DATA_TYPE.STRING :
      self.DATA_TRANSFER_DATA_TYPE.BLOB,
    isPrivate: self._dataStreams[transferId].sessionChunkType.isPrivate,
    isStringStream: self._dataStreams[transferId].sessionChunkType === 'string',
    senderPeerId: self._user && self._user.sid ? self._user.sid : null
  };

  var peersInterop = [];
  var peersNonInterop = [];
  var sendDataFn = function (peerId, channelProp, targetPeers) {
    var updatedSessionInfo = UtilsFactory.clone(sessionInfo);
    delete updatedSessionInfo.chunk;

    if (dataChunk instanceof Blob) {
      self._blobToArrayBuffer(dataChunk, function (buffer) {
        self._sendMessageToDataChannel(peerId, buffer, channelProp, true);
        if (targetPeers) {
          for (var i = 0; i < targetPeers.length; i++) {
            self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENT, transferId, targetPeers[i], sessionInfo, null);
            self._trigger('incomingDataStream', dataChunk, transferId, targetPeers[i], updatedSessionInfo, true);
          }
        } else {
          self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENT, transferId, peerId, sessionInfo, null);
          self._trigger('incomingDataStream', dataChunk, transferId, peerId, updatedSessionInfo, true);
        }
      });
    } else {
      self._sendMessageToDataChannel(peerId, dataChunk, channelProp, true);
      if (targetPeers) {
        for (var i = 0; i < targetPeers.length; i++) {
          self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENT, transferId, targetPeers[i], sessionInfo, null);
          self._trigger('incomingDataStream', updatedDataChunk, transferId, targetPeers[i], updatedSessionInfo, true);
        }
      } else {
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.SENT, transferId, peerId, sessionInfo, null);
        self._trigger('incomingDataStream', updatedDataChunk, transferId, peerId, updatedSessionInfo, true);
      }
    }
  };

  for (var peerId in self._dataStreams[transferId].sessions) {
    if (self._dataStreams[transferId].sessions.hasOwnProperty(peerId) && self._dataStreams[transferId].sessions[peerId]) {
      var channelProp = self._dataStreams[transferId].sessions[peerId];

      if (!(self._dataChannels[self._hasMCU ? 'MCU' : peerId] && self._dataChannels[self._hasMCU ? 'MCU' : peerId][channelProp] &&
        self._dataChannels[self._hasMCU ? 'MCU' : peerId][channelProp].channel.readyState === self.DATA_CHANNEL_STATE.OPEN &&
        self._dataChannels[self._hasMCU ? 'MCU' : peerId][channelProp].streamId === transferId)) {
        self._log.error([peerId, 'RTCDataChannel', transferId, 'Failed streaming data as it has not started or is ready.']);
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.ERROR, transferId, peerId, sessionInfo,
          new Error('Streaming as it has not started or Datachannel connection is not open.'));
        return;
      }

      if (self._hasMCU) {
        if (channelProp === 'main') {
          peersInterop.push(peerId);
        } else {
          peersNonInterop.push(peerId);
        }
      } else {
        sendDataFn(peerId, channelProp);
      }
    }
  }

  if (self._hasMCU) {
    if (peersInterop.length > 0) {
      sendDataFn(peerId, 'main', peersInterop);
    }
    if (peersNonInterop.length > 0) {
      sendDataFn(peerId, transferId, peersNonInterop);
    }
  }
};
Skylink.prototype.unlockRoom = function() {
  if (!(this._user && this._user.sid)) {
    return;
  }
  this._log.log('Update to isRoomLocked status ->', false);
  this._sendChannelMessage({
    type: this._SIG_MESSAGE_TYPE.ROOM_LOCK,
    mid: this._user.sid,
    rid: this._room.id,
    lock: false
  });
  this._roomLocked = false;
  this._trigger('roomLock', false, this._user.sid, this.getPeerInfo(), true);
};
Skylink.prototype._createDataChannel = function(peerId, dataChannel, createAsMessagingChannel) {
  var self = this;
  var channelName = (self._user && self._user.sid ? self._user.sid : '-') + '_' + peerId;
  var channelType = createAsMessagingChannel ? self.DATA_CHANNEL_TYPE.MESSAGING : self.DATA_CHANNEL_TYPE.DATA;
  var channelProp = channelType === self.DATA_CHANNEL_TYPE.MESSAGING ? 'main' : channelName;

  if (!self._user) {
    self._log.error([peerId, 'RTCDataChannel', channelProp,
      'Aborting of creating or initializing Datachannel as User does not have Room session']);
    return;
  }

  if (!(self._peerConnections[peerId] &&
    self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED)) {
    self._log.error([peerId, 'RTCDataChannel', channelProp,
      'Aborting of creating or initializing Datachannel as Peer connection does not exists']);
    return;
  }

  
  if (dataChannel && typeof dataChannel === 'object') {
    channelName = dataChannel.label;

  } else if (typeof dataChannel === 'string') {
    channelName = dataChannel;
    dataChannel = null;
  }

  if (!dataChannel) {
    try {
      dataChannel = self._peerConnections[peerId].createDataChannel(channelName, {
        reliable: true,
        ordered: true
      });

    } catch (error) {
      self._log.error([peerId, 'RTCDataChannel', channelProp, 'Failed creating Datachannel ->'], error);
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CREATE_ERROR, peerId, error, channelName, channelType, null);
      return;
    }
  }

  if (!self._dataChannels[peerId]) {
    channelProp = 'main';
    channelType = self.DATA_CHANNEL_TYPE.MESSAGING;
    self._dataChannels[peerId] = {};
    self._log.debug([peerId, 'RTCDataChannel', channelProp, 'initializing main DataChannel']);
  } else if (self._dataChannels[peerId].main && self._dataChannels[peerId].main.channel.label === channelName) {
    channelProp = 'main';
    channelType = self.DATA_CHANNEL_TYPE.MESSAGING;
  }

  /**
   * Subscribe to events
   */
  dataChannel.onerror = function (evt) {
    var channelError = evt.error || evt;

    self._log.error([peerId, 'RTCDataChannel', channelProp, 'Datachannel has an exception ->'], channelError);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerId, channelError, channelName, channelType, null);
  };

  dataChannel.onbufferedamountlow = function () {
    self._log.debug([peerId, 'RTCDataChannel', channelProp, 'Datachannel buffering data transfer low']);

    // TODO: Should we add an event here
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.BUFFERED_AMOUNT_LOW, peerId, null, channelName, channelType, null);
  };

  dataChannel.onmessage = function(event) {
    self._processDataChannelData(event.data, peerId, channelName, channelType);
  };

  var onOpenHandlerFn = function () {
    self._log.debug([peerId, 'RTCDataChannel', channelProp, 'Datachannel has opened']);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.OPEN, peerId, null, channelName, channelType, null);
  };

  if (dataChannel.readyState === self.DATA_CHANNEL_STATE.OPEN) {
    setTimeout(onOpenHandlerFn, 1); // 500);

  } else {
    self._trigger('dataChannelState', dataChannel.readyState, peerId, null, channelName, channelType, null);

    dataChannel.onopen = onOpenHandlerFn;
  }

  var onCloseHandlerFn = function () {
    self._log.debug([peerId, 'RTCDataChannel', channelProp, 'Datachannel has closed']);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerId, null, channelName, channelType, null);

    if (self._peerConnections[peerId] && self._peerConnections[peerId].remoteDescription &&
      self._peerConnections[peerId].remoteDescription.sdp && (self._peerConnections[peerId].remoteDescription.sdp.indexOf(
      'm=application') === -1 || self._peerConnections[peerId].remoteDescription.sdp.indexOf('m=application 0') > 0)) {
      return;
    }

    if (channelType === self.DATA_CHANNEL_TYPE.MESSAGING) {
      setTimeout(function () {
        if (self._peerConnections[peerId] &&
          self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED &&
          (self._peerConnections[peerId].localDescription &&
          self._peerConnections[peerId].localDescription.type === self.HANDSHAKE_PROGRESS.OFFER)) {
          self._log.debug([peerId, 'RTCDataChannel', channelProp, 'Reviving Datachannel connection']);
          self._createDataChannel(peerId, channelName, true);
        }
      }, 100);
    }
  };

  // Fixes for Firefox bug (49 is working) -> https://bugzilla.mozilla.org/show_bug.cgi?id=1118398
  if (window.webrtcDetectedBrowser === 'firefox') {
    var hasTriggeredClose = false;
    var timeBlockAfterClosing = 0;

    dataChannel.onclose = function () {
      if (!hasTriggeredClose) {
        hasTriggeredClose = true;
        onCloseHandlerFn();
      }
    };

    var onFFClosed = setInterval(function () {
      if (dataChannel.readyState === self.DATA_CHANNEL_STATE.CLOSED ||
        hasTriggeredClose || timeBlockAfterClosing === 5) {
        clearInterval(onFFClosed);

        if (!hasTriggeredClose) {
          hasTriggeredClose = true;
          onCloseHandlerFn();
        }
      // After 5 seconds from CLOSING state and Firefox is not rendering to close, we have to assume to close it.
      // It is dead! This fixes the case where if it's Firefox who closes the Datachannel, the connection will
      // still assume as CLOSING..
      } else if (dataChannel.readyState === self.DATA_CHANNEL_STATE.CLOSING) {
        timeBlockAfterClosing++;
      }
    }, 1000);

  } else {
    dataChannel.onclose = onCloseHandlerFn;
  }

  if (channelType === self.DATA_CHANNEL_TYPE.MESSAGING) {
    self._dataChannels[peerId].main = {
      channelName: channelName,
      channelType: channelType,
      transferId: null,
      streamId: null,
      channel: dataChannel
    };
  } else {
    self._dataChannels[peerId][channelName] = {
      channelName: channelName,
      channelType: channelType,
      transferId: null,
      streamId: null,
      channel: dataChannel
    };
  }
};

/**
 * Function that sends data over the Datachannel connection.
 * @method _sendMessageToDataChannel
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._sendMessageToDataChannel = function(peerId, data, channelProp, doNotConvert) {
  var self = this;

  // Set it as "main" (MESSAGING) Datachannel
  if (!channelProp || channelProp === peerId) {
    channelProp = 'main';
  }

  // TODO: What happens when we want to send binary data over or ArrayBuffers?
  if (!(typeof data === 'object' && data) && !(data && typeof data === 'string')) {
    self._log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping invalid data ->'], data);
    return;
  }

  if (!(self._peerConnections[peerId] &&
    self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED)) {
    self._log.warn([peerId, 'RTCDataChannel', channelProp,
      'Dropping for sending message as Peer connection does not exists or is closed ->'], data);
    return;
  }

  if (!(self._dataChannels[peerId] && self._dataChannels[peerId][channelProp])) {
    self._log.warn([peerId, 'RTCDataChannel', channelProp,
      'Dropping for sending message as Datachannel connection does not exists ->'], data);
    return;
  }

  var channelName = self._dataChannels[peerId][channelProp].channelName;
  var channelType = self._dataChannels[peerId][channelProp].channelType;
  var readyState  = self._dataChannels[peerId][channelProp].channel.readyState;
  var messageType = typeof data === 'object' && data.type === self._DC_PROTOCOL_TYPE.MESSAGE ?
    self.DATA_CHANNEL_MESSAGE_ERROR.MESSAGE : self.DATA_CHANNEL_MESSAGE_ERROR.TRANSFER;

  if (readyState !== self.DATA_CHANNEL_STATE.OPEN) {
    var notOpenError = 'Failed sending message as Datachannel connection state is not opened. Current ' +
      'readyState is "' + readyState + '"';

    self._log.error([peerId, 'RTCDataChannel', channelProp, notOpenError + ' ->'], data);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.SEND_MESSAGE_ERROR, peerId,
      new Error(notOpenError), channelName, channelType, messageType);

    throw new Error(notOpenError);
  }

  try {
    if (!doNotConvert && typeof data === 'object') {
      self._log.debug([peerId, 'RTCDataChannel', channelProp, 'Sending "' + data.type + '" protocol message ->'], data);

      self._dataChannels[peerId][channelProp].channel.send(JSON.stringify(data));

    } else {
      self._log.debug([peerId, 'RTCDataChannel', channelProp, 'Sending data with size ->'],
        data.size || data.length || data.byteLength);

      self._dataChannels[peerId][channelProp].channel.send(data);
    }
  } catch (error) {
    self._log.error([peerId, 'RTCDataChannel', channelProp, 'Failed sending ' + (!doNotConvert && typeof data === 'object' ?
      '"' + data.type + '" protocol message' : 'data') + ' ->'], error);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.SEND_MESSAGE_ERROR, peerId,
      error, channelName, channelType, messageType);

    throw error;
  }
};

/**
 * Function that stops the Datachannel connection and removes object references.
 * @method _closeDataChannel
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._closeDataChannel = function(peerId, channelProp) {
  var self = this;

  if (!self._dataChannels[peerId]) {
    self._log.warn([peerId, 'RTCDataChannel', channelProp || null,
      'Aborting closing Datachannels as Peer connection does not have Datachannel sessions']);
    return;
  }

  var closeFn = function (rChannelProp) {
    var channelName = self._dataChannels[peerId][rChannelProp].channelName;
    var channelType = self._dataChannels[peerId][rChannelProp].channelType;

    if (self._dataChannels[peerId][rChannelProp].readyState !== self.DATA_CHANNEL_STATE.CLOSED) {
      self._log.debug([peerId, 'RTCDataChannel', channelProp, 'Closing Datachannel']);

      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSING, peerId, null, channelName, channelType, null);

      self._dataChannels[peerId][rChannelProp].channel.close();

      delete self._dataChannels[peerId][rChannelProp];
    }
  };

  if (!channelProp) {
    for (var channelNameProp in self._dataChannels) {
      if (self._dataChannels[peerId].hasOwnProperty(channelNameProp)) {
        if (self._dataChannels[peerId][channelNameProp]) {
          closeFn(channelNameProp);
        }
      }
    }
  } else {
    if (!self._dataChannels[peerId][channelProp]) {
      self._log.warn([peerId, 'RTCDataChannel', channelProp, 'Aborting closing Datachannel as it does not exists']);
      return;
    }

    closeFn(channelProp);
  }
};
Skylink.prototype._base64ToBlob = function(dataURL) {
  var byteString = atob(dataURL);
  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var j = 0; j < byteString.length; j++) {
    ia[j] = byteString.charCodeAt(j);
  }
  // write the ArrayBuffer to a blob, and you're done
  return new Blob([ab]);
};

/**
 * Function that converts a Blob object into Base64 string.
 * @method _blobToBase64
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._blobToBase64 = function(data, callback) {
  var fileReader = new FileReader();
  fileReader.onload = function() {
    // Load Blob as dataurl base64 string
    var base64BinaryString = fileReader.result.split(',')[1];
    callback(base64BinaryString);
  };
  fileReader.readAsDataURL(data);
};

/**
 * Function that converts a Blob object into ArrayBuffer object.
 * @method _blobToArrayBuffer
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._blobToArrayBuffer = function(data, callback) {
  var self = this;
  var fileReader = new FileReader();
  fileReader.onload = function() {
    // Load Blob as dataurl base64 string
    if (self._isUsingPlugin) {
      callback(new Int8Array(fileReader.result));
    } else {
      callback(fileReader.result);
    }
  };
  fileReader.readAsArrayBuffer(data);
};

/**
 * Function that chunks Blob object based on the data chunk size provided.
 * If provided Blob object size is lesser than or equals to the chunk size, it should return an array
 *   of length of <code>1</code>.
 * @method _chunkBlobData
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._chunkBlobData = function(blob, chunkSize) {
  var chunksArray = [];
  var startCount = 0;
  var endCount = 0;
  var blobByteSize = blob.size;

  if (blobByteSize > chunkSize) {
    // File Size greater than Chunk size
    while ((blobByteSize - 1) > endCount) {
      endCount = startCount + chunkSize;
      chunksArray.push(blob.slice(startCount, endCount));
      startCount += chunkSize;
    }
    if ((blobByteSize - (startCount + 1)) > 0) {
      chunksArray.push(blob.slice(startCount, blobByteSize - 1));
    }
  } else {
    // File Size below Chunk size
    chunksArray.push(blob);
  }
  return chunksArray;
};

/**
 * Function that chunks large string into string chunks based on the data chunk size provided.
 * If provided string length is lesser than or equals to the chunk size, it should return an array
 *   of length of <code>1</code>.
 * @method _chunkDataURL
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._chunkDataURL = function(dataURL, chunkSize) {
  var outputStr = dataURL; //encodeURIComponent(dataURL);
  var dataURLArray = [];
  var startCount = 0;
  var endCount = 0;
  var dataByteSize = dataURL.size || dataURL.length;

  if (dataByteSize > chunkSize) {
    // File Size greater than Chunk size
    while ((dataByteSize - 1) > endCount) {
      endCount = startCount + chunkSize;
      dataURLArray.push(outputStr.slice(startCount, endCount));
      startCount += chunkSize;
    }
    if ((dataByteSize - (startCount + 1)) > 0) {
      chunksArray.push(outputStr.slice(startCount, dataByteSize - 1));
    }
  } else {
    // File Size below Chunk size
    dataURLArray.push(outputStr);
  }

  return dataURLArray;
};
Skylink.prototype._startDataTransfer = function(data, timeout, targetPeerId, sendChunksAsBinary, callback, sessionType) {
  var self = this;
  var transferId = (self._user ? self._user.sid : '') + '_' + (new Date()).getTime();
  var transferErrors = {};
  var transferCompleted = [];
  var chunks = [];
  var listOfPeers = Object.keys(self._peerConnections);
  var sessionChunkType = 'string';
  var transferInfo = {
    name: null,
    size: null,
    chunkSize: null,
    chunkType: null,
    dataType: null,
    mimeType: null,
    direction: self.DATA_TRANSFER_TYPE.UPLOAD,
    timeout: 60,
    isPrivate: false,
    percentage: 0
  };

  // sendBlobData(.., timeout)
  if (typeof timeout === 'number') {
    transferInfo.timeout = timeout;
  } else if (Array.isArray(timeout)) {
    listOfPeers = timeout;
  } else if (timeout && typeof timeout === 'string') {
    listOfPeers = [timeout];
  } else if (timeout && typeof timeout === 'boolean') {
    sessionChunkType = 'binary';
  } else if (typeof timeout === 'function') {
    callback = timeout;
  }

  // sendBlobData(.., .., targetPeerId)
  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
  } else if (targetPeerId && typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
  } else if (targetPeerId && typeof targetPeerId === 'boolean') {
    sessionChunkType = 'binary';
  } else if (typeof targetPeerId === 'function') {
    callback = targetPeerId;
  }

  // sendBlobData(.., .., .., sendChunksAsBinary)
  if (sendChunksAsBinary && typeof sendChunksAsBinary === 'boolean') {
    sessionChunkType = 'binary';
  } else if (typeof sendChunksAsBinary === 'function') {
    callback = sendChunksAsBinary;
  }

  // Remove MCU Peer as list of Peers
  if (listOfPeers.indexOf('MCU') > -1) {
    listOfPeers.splice(listOfPeers.indexOf('MCU'), 1);
  }

  // Function that returns the error emitted before data transfer has started
  var emitErrorBeforeDataTransferFn = function (error) {
    self._log.error(error);

    if (typeof callback === 'function') {
      var transferErrors = {};

      if (listOfPeers.length === 0) {
        transferErrors.self = new Error(error);
        self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.START_ERROR, null, null, transferInfo, {
          transferType: self.DATA_TRANSFER_TYPE.DOWNLOAD,
          message: new Error(error)
        });
      } else {
        for (var i = 0; i < listOfPeers.length; i++) {
          transferErrors[listOfPeers[i]] = new Error(error);
          self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.START_ERROR, null, listOfPeers[i], transferInfo, {
            transferType: self.DATA_TRANSFER_TYPE.DOWNLOAD,
            message: new Error(error)
          });
        }
      }

      callback({
        transferId: null,
        transferInfo: transferInfo,
        listOfPeers: listOfPeers,
        transferErrors: transferErrors
      }, null);
    }
  };

  if (sessionType === 'blob') {
    if (self._hasMCU && sessionChunkType === 'binary') {
      self._log.warn('Binary data chunks transfer is not yet supported with MCU environment. ' +
        'Fallbacking to binary string data chunks transfer.');
      sessionChunkType = 'string';
    }

    var chunkSize = sessionChunkType === 'string' ? (window.webrtcDetectedBrowser === 'firefox' ?
      self._MOZ_CHUNK_FILE_SIZE : self._CHUNK_FILE_SIZE) : (window.webrtcDetectedBrowser === 'firefox' ?
      self._MOZ_BINARY_FILE_SIZE : self._BINARY_FILE_SIZE);

    transferInfo.dataType = self.DATA_TRANSFER_SESSION_TYPE.BLOB;
    transferInfo.chunkSize = sessionChunkType === 'string' ? 4 * Math.ceil(chunkSize / 3) : chunkSize;
    transferInfo.chunkType = sessionChunkType === 'binary' ? (window.webrtcDetectedBrowser === 'firefox' ?
      self.DATA_TRANSFER_DATA_TYPE.BLOB : self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER) :
      self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING;

    // Start checking if data transfer can start
    if (!(data && typeof data === 'object' && data instanceof Blob)) {
      emitErrorBeforeDataTransferFn('Provided data is not a Blob data');
      return;
    }

    transferInfo.name = data.name || transferId;
    transferInfo.mimeType = data.type || null;

    if (data.size < 1) {
      emitErrorBeforeDataTransferFn('Provided data is not a valid Blob data.');
      return;
    }

    transferInfo.originalSize = data.size;
    transferInfo.size = sessionChunkType === 'string' ? 4 * Math.ceil(data.size / 3) : data.size;
    chunks = self._chunkBlobData(data, chunkSize);
  } else {
    transferInfo.dataType = self.DATA_TRANSFER_SESSION_TYPE.DATA_URL;
    transferInfo.chunkSize = self._CHUNK_DATAURL_SIZE;
    transferInfo.chunkType = self.DATA_TRANSFER_DATA_TYPE.STRING;

    // Start checking if data transfer can start
    if (!(data && typeof data === 'string')) {
      emitErrorBeforeDataTransferFn('Provided data is not a dataURL');
      return;
    }

    transferInfo.originalSize = transferInfo.size = data.length || data.size;
    chunks = self._chunkDataURL(data, transferInfo.chunkSize);
  }

  if (!(self._user && self._user.sid)) {
    emitErrorBeforeDataTransferFn('Unable to send any ' +
      sessionType.replace('data', 'dataURL') + ' data. User is not in Room.');
    return;
  }

  if (!self._enableDataChannel) {
    emitErrorBeforeDataTransferFn('Unable to send any ' +
      sessionType.replace('data', 'dataURL') + ' data. Datachannel is disabled');
    return;
  }

  if (listOfPeers.length === 0) {
    emitErrorBeforeDataTransferFn('Unable to send any ' +
      sessionType.replace('data', 'dataURL') + ' data. There are no Peers to start data transfer with');
    return;
  }

  self._dataTransfers[transferId] = UtilsFactory.clone(transferInfo);
  self._dataTransfers[transferId].peers = {};
  self._dataTransfers[transferId].peers.main = {};
  self._dataTransfers[transferId].peers[transferId] = {};
  self._dataTransfers[transferId].sessions = {};
  self._dataTransfers[transferId].chunks = chunks;
  self._dataTransfers[transferId].enforceBSPeers = [];
  self._dataTransfers[transferId].enforcedBSInfo = {};
  self._dataTransfers[transferId].sessionType = sessionType;
  self._dataTransfers[transferId].sessionChunkType = sessionChunkType;
  self._dataTransfers[transferId].senderPeerId = self._user.sid;

  // Check if fallback chunks is required
  if (sessionType === 'blob' && sessionChunkType === 'binary') {
    for (var p = 0; p < listOfPeers.length; p++) {
      var protocolVer = (((self._peerInformations[listOfPeers[p]]) || {}).agent || {}).DTProtocolVersion || '0.1.0';

      // C++ SDK does not support binary file transfer for now
      if (self._isLowerThanVersion(protocolVer, '0.1.3')) {
        self._dataTransfers[transferId].enforceBSPeers.push(listOfPeers[p]);
      }
    }

    if (self._dataTransfers[transferId].enforceBSPeers.length > 0) {
      var bsChunkSize = window.webrtcDetectedBrowser === 'firefox' ? self._MOZ_CHUNK_FILE_SIZE : self._CHUNK_FILE_SIZE;
      var bsChunks = self._chunkBlobData(new Blob(chunks), bsChunkSize);

      self._dataTransfers[transferId].enforceBSInfo = {
        chunkSize: 4 * Math.ceil(bsChunkSize / 3),
        chunkType: self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING,
        size: 4 * Math.ceil(transferInfo.originalSize / 3),
        chunks: bsChunks
      };
    }
  }

  /**
   * Complete Peer function.
   */
  var completeFn = function (peerId, error) {
    // Ignore if already added.
    if (transferCompleted.indexOf(peerId) > -1) {
      return;
    }

    self._log.debug([peerId, 'RTCDataChannel', transferId, 'Data transfer result. Is errors present? ->'], error);

    transferCompleted.push(peerId);

    if (error) {
      transferErrors[peerId] = new Error(error);
    }

    if (listOfPeers.length === transferCompleted.length) {
      self._log.log([null, 'RTCDataChannel', transferId, 'Data transfer request completed']);

      if (typeof callback === 'function') {
        if (Object.keys(transferErrors).length > 0) {
          callback({
            transferId: transferId,
            transferInfo: self._getTransferInfo(transferId, peerId, false, true, false),
            transferErrors: transferErrors,
            listOfPeers: listOfPeers
          }, null);
        } else {
          callback(null, {
            transferId: transferId,
            transferInfo: self._getTransferInfo(transferId, peerId, false, true, false),
            listOfPeers: listOfPeers
          });
        }
      }
    }
  };

  for (var i = 0; i < listOfPeers.length; i++) {
    var MCUInteropStatus = self._startDataTransferToPeer(transferId, listOfPeers[i], completeFn, null, null);

    if (typeof MCUInteropStatus === 'boolean') {
      if (MCUInteropStatus === true) {
        self._dataTransfers[transferId].peers.main[listOfPeers[i]] = true;
      } else {
        self._dataTransfers[transferId].peers[transferId][listOfPeers[i]] = true;
      }
    }
  }

  if (self._hasMCU) {
    if (Object.keys(self._dataTransfers[transferId].peers.main).length > 0) {
      self._startDataTransferToPeer(transferId, 'MCU', completeFn, 'main',
        Object.keys(self._dataTransfers[transferId].peers.main));
    }

    if (Object.keys(self._dataTransfers[transferId].peers[transferId]).length > 0) {
      self._startDataTransferToPeer(transferId, 'MCU', completeFn, transferId,
        Object.keys(self._dataTransfers[transferId].peers[transferId]));
    }
  }
};

/**
 * Function that starts or listens the data transfer status to Peer.
 * This reacts differently during MCU environment.
 * @method _startDataTransferToPeer
 * @return {Boolean} Returns a Boolean only during MCU environment which flag indicates if Peer requires interop
 *   (Use messaging Datachannel connection instead).
 * @private
 * @since 0.6.16
 */
Skylink.prototype._startDataTransferToPeer = function (transferId, peerId, callback, channelProp, targetPeers) {
  var self = this;

  var peerConnectionStateCbFn = null;
  var dataChannelStateCbFn = null;

  /**
   * Emit event for Peers function.
   */
  var emitEventFn = function (cb) {
    var peers = targetPeers || [peerId];
    for (var i = 0; i < peers.length; i++) {
      cb(peers[i]);
    }
  };

  /**
   * Return error and trigger them if failed before or during data transfers function.
   */
  var returnErrorBeforeTransferFn = function (error) {
    // Replace if it is a MCU Peer errors for clear indication in error message
    var updatedError = peerId === 'MCU' ? error.replace(/Peer/g, 'MCU Peer') : error;

    emitEventFn(function (evtPeerId) {
      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR, transferId, evtPeerId,
        self._getTransferInfo(transferId, peerId, true, true, false), {
        message: new Error(updatedError),
        transferType: self.DATA_TRANSFER_TYPE.UPLOAD
      });
    });
  };

  /**
   * Send WRQ protocol to start data transfers.
   */
  var sendWRQFn = function () {
    var size = self._dataTransfers[transferId].size;
    var chunkSize = self._dataTransfers[transferId].chunkSize;
    var chunkType = self._dataTransfers[transferId].sessionChunkType;

    if (self._dataTransfers[transferId].enforceBSPeers.indexOf(peerId) > -1) {
      self._log.warn([peerId, 'RTCDataChannel', transferId,
        'Binary data chunks transfer is not yet supported with Peer connecting from ' +
        'Android, iOS and C++ SDK. Fallbacking to binary string data chunks transfer.']);

      size = self._dataTransfers[transferId].enforceBSInfo.size;
      chunkSize = self._dataTransfers[transferId].enforceBSInfo.chunkSize;
      chunkType = 'string';
    }

    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.WRQ,
      transferId: transferId,
      name: self._dataTransfers[transferId].name,
      size: size,
      originalSize: self._dataTransfers[transferId].originalSize,
      dataType: self._dataTransfers[transferId].sessionType,
      mimeType: self._dataTransfers[transferId].mimeType,
      chunkType: chunkType,
      chunkSize: chunkSize,
      timeout: self._dataTransfers[transferId].timeout,
      isPrivate: self._dataTransfers[transferId].isPrivate,
      sender: self._user.sid,
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion,
      target: targetPeers ? targetPeers : peerId
    }, channelProp);

    emitEventFn(function (evtPeerId) {
      self._trigger('incomingDataRequest', transferId, evtPeerId,
        self._getTransferInfo(transferId, peerId, false, false, false), true);

      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.USER_UPLOAD_REQUEST, transferId, evtPeerId,
        self._getTransferInfo(transferId, peerId, true, false, false), null);
    });
  };

  // Listen to data transfer state
  if (peerId !== 'MCU') {
    var dataTransferStateCbFn = function (state, evtTransferId, evtPeerId, transferInfo, error) {
      if (peerConnectionStateCbFn) {
        self.off('peerConnectionState', peerConnectionStateCbFn);
      }

      if (dataChannelStateCbFn) {
        self.off('dataChannelState', dataChannelStateCbFn);
      }

      if (channelProp) {
        delete self._dataTransfers[transferId].peers[channelProp][peerId];
      }

      if (state === self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED) {
        callback(peerId, null);
      } else {
        callback(peerId, error.message.message || error.message.toString());
      }

      // Handle Peer uploading to MCU case
      if (self._hasMCU && self._dataTransfers[transferId].direction === self.DATA_TRANSFER_TYPE.UPLOAD) {
        if (!(Object.keys(self._dataTransfers[transferId].peers.main).length === 0 &&
          Object.keys(self._dataTransfers[transferId].peers[transferId]).length === 0)) {
          return;
        }

        delete self._dataTransfers[transferId];

      } else {
        delete self._dataTransfers[transferId].sessions[peerId];

        if (Object.keys(self._dataTransfers[transferId].sessions).length === 0) {
          delete self._dataTransfers[transferId];
        }
      }
    };

    self.once('dataTransferState', dataTransferStateCbFn, function (state, evtTransferId, evtPeerId) {
      if (!(self._dataTransfers[transferId] && (self._hasMCU ? (self._dataTransfers[transferId].peers.main[peerId] ||
        self._dataTransfers[transferId].peers[transferId][peerId]) : self._dataTransfers[transferId].sessions[peerId]))) {
        if (dataTransferStateCbFn) {
          self.off('dataTransferState', dataTransferStateCbFn);
        }
        if (peerConnectionStateCbFn) {
          self.off('peerConnectionState', peerConnectionStateCbFn);
        }
        if (dataChannelStateCbFn) {
          self.off('dataChannelState', dataChannelStateCbFn);
        }
        return;
      }
      return evtTransferId === transferId && evtPeerId === peerId &&
        [self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED, self.DATA_TRANSFER_STATE.ERROR,
        self.DATA_TRANSFER_STATE.CANCEL, self.DATA_TRANSFER_STATE.REJECTED].indexOf(state) > -1;
    });
  }

  // When Peer connection does not exists
  if (!self._peerConnections[peerId]) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer connection does not exists.');
    return;
  }

  // When Peer session does not exists
  if (!self._peerInformations[peerId]) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer connection does not exists.');
    return;
  }

  // When Peer connection is not STABLE
  if (self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.STABLE) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer connection is not stable.');
    return;
  }

  if (!self._dataTransfers[transferId]) {
    returnErrorBeforeTransferFn('Unable to start data transfer as data transfer session is not in order.');
    return;
  }

  if (!(self._dataChannels[peerId] && self._dataChannels[peerId].main)) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer Datachannel connection does not exists.');
    return;
  }

  if (self._dataChannels[peerId].main.channel.readyState !== self.DATA_CHANNEL_STATE.OPEN) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer Datachannel connection is not opened.');
    return;
  }

  var streamId = self._dataChannels[peerId].main.streamId;

  if (streamId && channelProp === 'main' && self._dataStreams[streamId] &&
  // Check if session chunk streaming is string and sending is string for Peer
    ((self._dataStreams[streamId].sessionChunkType === 'string' &&
    (self._dataTransfers[transferId].sessionChunkType === 'string' ||
    self._dataTransfers[transferId].enforceBSPeers.indexOf(peerId) > -1)) ||
  // Check if session chunk streaming is binary and sending is binary for Peer
    (self._dataStreams[streamId].sessionChunkType === 'binary' &&
    self._dataStreams[streamId].sessionChunkType === 'binary' &&
    self._dataTransfers[transferId].enforceBSPeers.indexOf(peerId) === -1))) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer Datachannel currently has an active ' +
      self._dataStreams[streamId].sessionChunkType + ' data streaming session.');
    return;
  }

  var protocolVer = (self._peerInformations[peerId].agent || {}).DTProtocolVersion || '0.1.0';
  var requireInterop = self._isLowerThanVersion(protocolVer, '0.1.2');

  // Prevent DATA_URL (or "string" dataType transfers) with Android / iOS / C++ SDKs
  if (self._isLowerThanVersion(protocolVer, '0.1.2') && self._dataTransfers[transferId].sessionType === 'data' &&
    self._dataTransfers[transferId].sessionChunkType === 'string') {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer do not support DATA_URL type of data transfers');
    return;
  }

  // Listen to Peer connection state for MCU Peer
  if (peerId !== 'MCU' && self._hasMCU) {
    channelProp = requireInterop ? 'main' : transferId;

    peerConnectionStateCbFn = function () {
      returnErrorBeforeTransferFn('Data transfer terminated as Peer connection is not stable.');
    };

    self.once('peerConnectionState', peerConnectionStateCbFn, function (state, evtPeerId) {
      if (!self._dataTransfers[transferId]) {
        self.off('peerConnectionState', peerConnectionStateCbFn);
        return;
      }
      return state !== self.PEER_CONNECTION_STATE.STABLE && evtPeerId === peerId;
    });
    return requireInterop;
  }

  if (requireInterop || channelProp === 'main') {
    // When MCU Datachannel connection has a transfer in-progress
    if (self._dataChannels[peerId].main.transferId) {
      returnErrorBeforeTransferFn('Unable to start data transfer as Peer Datachannel has a data transfer in-progress.');
      return;
    }
  }

  self._dataTransfers[transferId].sessions[peerId] = {
    timer: null,
    ackN: 0
  };

  dataChannelStateCbFn = function (state, evtPeerId, error) {
    // Prevent from triggering in instances where the ackN === chunks.length
    if (self._dataTransfers[transferId].sessions[peerId].ackN >= (self._dataTransfers[transferId].chunks.length - 1)) {
      return;
    }

    if (error) {
      returnErrorBeforeTransferFn(error.message || error.toString());
    } else {
      returnErrorBeforeTransferFn('Data transfer terminated as Peer Datachannel connection closed abruptly.');
    }
  };

  self.once('dataChannelState', dataChannelStateCbFn, function (state, evtPeerId, error, channelName, channelType) {
    if (!(self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
      self.off('dataChannelState', dataChannelStateCbFn);
      return;
    }

    if (evtPeerId === peerId && (channelType === self.DATA_CHANNEL_TYPE.DATA ? channelName === transferId : true)) {
      if (state === self.DATA_CHANNEL_STATE.OPEN && channelType === self.DATA_CHANNEL_TYPE.DATA &&
        channelName === transferId) {
        self._dataChannels[peerId][channelProp].transferId = transferId;
        sendWRQFn();
        return false;
      }
      return [self.DATA_CHANNEL_STATE.CREATE_ERROR, self.DATA_CHANNEL_STATE.ERROR,
        self.DATA_CHANNEL_STATE.CLOSING, self.DATA_CHANNEL_STATE.CLOSED].indexOf(state) > -1;
    }
  });

  // Create new Datachannel for Peer to start data transfer
  if (!((requireInterop && peerId !== 'MCU') || channelProp === 'main')) {
    channelProp = transferId;
    self._createDataChannel(peerId, transferId);
  } else {
    self._dataChannels[peerId].main.transferId = transferId;
    sendWRQFn();
  }
};

/**
 * Function that returns the data transfer session.
 * @method _getTransferInfo
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._getTransferInfo = function (transferId, peerId, returnDataProp, hidePercentage, returnDataAtStart) {
  if (!this._dataTransfers[transferId]) {
    return {};
  }

  var transferInfo = {
    name: this._dataTransfers[transferId].name,
    size: this._dataTransfers[transferId].size,
    dataType: this._dataTransfers[transferId].dataType || this.DATA_TRANSFER_SESSION_TYPE.BLOB,
    mimeType: this._dataTransfers[transferId].mimeType || null,
    chunkSize: this._dataTransfers[transferId].chunkSize,
    chunkType: this._dataTransfers[transferId].chunkType,
    timeout: this._dataTransfers[transferId].timeout,
    isPrivate: this._dataTransfers[transferId].isPrivate,
    direction: this._dataTransfers[transferId].direction
  };

  if (this._dataTransfers[transferId].originalSize) {
    transferInfo.size = this._dataTransfers[transferId].originalSize;

  } else if (this._dataTransfers[transferId].chunkType === this.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
    transferInfo.size = Math.ceil(transferInfo.size * 3 / 4);
  }

  if (!hidePercentage) {
    transferInfo.percentage = 0;

    if (!this._dataTransfers[transferId].sessions[peerId]) {
      if (returnDataProp) {
        transferInfo.data = null;
      }
      return transferInfo;
    }

    if (this._dataTransfers[transferId].direction === this.DATA_TRANSFER_TYPE.DOWNLOAD) {
      if (this._dataTransfers[transferId].sessions[peerId].receivedSize === this._dataTransfers[transferId].sessions[peerId].size) {
        transferInfo.percentage = 100;

      } else {
        transferInfo.percentage = parseFloat(((this._dataTransfers[transferId].sessions[peerId].receivedSize /
          this._dataTransfers[transferId].size) * 100).toFixed(2), 10);
      }
    } else {
      var chunksLength = (this._dataTransfers[transferId].enforceBSPeers.indexOf(peerId) > -1 ?
        this._dataTransfers[transferId].enforceBSInfo.chunks.length : this._dataTransfers[transferId].chunks.length);

      if (this._dataTransfers[transferId].sessions[peerId].ackN === chunksLength) {
        transferInfo.percentage = 100;

      } else {
        transferInfo.percentage = parseFloat(((this._dataTransfers[transferId].sessions[peerId].ackN /
          chunksLength) * 100).toFixed(2), 10);
      }
    }

    if (returnDataProp) {
      if (typeof returnDataAtStart !== 'number') {
        if (transferInfo.percentage === 100) {
          transferInfo.data = this._getTransferData(transferId);
        } else {
          transferInfo.data = null;
        }
      } else {
        transferInfo.percentage = returnDataAtStart;

        if (returnDataAtStart === 0) {
          transferInfo.data = this._getTransferData(transferId);
        }
      }
    }
  }

  return transferInfo;
};

/**
 * Function that returns the compiled data transfer data.
 * @method _getTransferData
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._getTransferData = function (transferId) {
  if (!this._dataTransfers[transferId]) {
    return null;
  }

  if (this._dataTransfers[transferId].dataType === this.DATA_TRANSFER_SESSION_TYPE.BLOB) {
    var mimeType = {
      name: this._dataTransfers[transferId].name
    };

    if (this._dataTransfers[transferId].mimeType) {
      mimeType.type = this._dataTransfers[transferId].mimeType;
    }

    return new Blob(this._dataTransfers[transferId].chunks, mimeType);
  }

  return this._dataTransfers[transferId].chunks.join('');
};

/**
 * Function that handles the data transfers sessions timeouts.
 * @method _handleDataTransferTimeoutForPeer
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._handleDataTransferTimeoutForPeer = function (transferId, peerId, setPeerTO) {
  var self = this;

  if (!(self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
    self._log.debug([peerId, 'RTCDataChannel', transferId, 'Data transfer does not exists for Peer. Ignoring timeout.']);
    return;
  }

  self._log.debug([peerId, 'RTCDataChannel', transferId, 'Clearing data transfer timer for Peer.']);

  if (self._dataTransfers[transferId].sessions[peerId].timer) {
    clearTimeout(self._dataTransfers[transferId].sessions[peerId].timer);
  }

  self._dataTransfers[transferId].sessions[peerId].timer = null;

  if (setPeerTO) {
    self._log.debug([peerId, 'RTCDataChannel', transferId, 'Setting data transfer timer for Peer.']);

    self._dataTransfers[transferId].sessions[peerId].timer = setTimeout(function () {
      if (!(self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
        self._log.debug([peerId, 'RTCDataChannel', transferId, 'Data transfer already ended for Peer. Ignoring expired timeout.']);
        return;
      }

      if (!(self._user && self._user.sid)) {
        self._log.debug([peerId, 'RTCDataChannel', transferId, 'User is not in Room. Ignoring expired timeout.']);
        return;
      }

      if (!self._dataChannels[peerId]) {
        self._log.debug([peerId, 'RTCDataChannel', transferId, 'Datachannel connection does not exists. Ignoring expired timeout.']);
        return;
      }

      self._log.error([peerId, 'RTCDataChannel', transferId, 'Data transfer response has timed out.']);

      /**
       * Emit event for Peers function.
       */
      var emitEventFn = function (cb) {
        if (peerId === 'MCU') {
          var broadcastedPeers = [self._dataTransfers[transferId].peers.main,
            self._dataTransfers[transferId].peers[transferId]];

          for (var i = 0; i < broadcastedPeers.length; i++) {
            // Should not happen but insanity check
            if (!broadcastedPeers[i]) {
              continue;
            }

            for (var bcPeerId in broadcastedPeers[i]) {
              if (broadcastedPeers[i].hasOwnProperty(bcPeerId) && broadcastedPeers[i][bcPeerId]) {
                cb(bcPeerId);
              }
            }
          }
        } else {
          cb(peerId);
        }
      };

      var errorMsg = 'Connection Timeout. Longer than ' + self._dataTransfers[transferId].timeout +
        ' seconds. Connection is abolished.';

      self._sendMessageToDataChannel(peerId, {
        type: self._DC_PROTOCOL_TYPE.ERROR,
        content: errorMsg,
        isUploadError: self._dataTransfers[transferId].direction === self.DATA_TRANSFER_TYPE.UPLOAD,
        sender: self._user.sid,
        name: self._dataTransfers[transferId].name
      }, self._dataChannels[peerId][transferId] ? transferId : 'main');

      emitEventFn(function (evtPeerId) {
        self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR, transferId, peerId,
          self._getTransferInfo(transferId, peerId, true, false, false), {
          transferType: self.DATA_TRANSFER_TYPE.DOWNLOAD,
          message: new Error(errorMsg)
        });
      });
    }, self._dataTransfers[transferId].timeout * 1000);
  }
};

/**
 * Function that handles the data received from Datachannel and
 * routes to the relevant data transfer protocol handler.
 * @method _processDataChannelData
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._processDataChannelData = function(rawData, peerId, channelName, channelType) {
  var self = this;

  var channelProp = channelType === self.DATA_CHANNEL_TYPE.MESSAGING ? 'main' : channelName;
  var transferId = self._dataChannels[peerId][channelProp].transferId || null;
  var streamId = self._dataChannels[peerId][channelProp].streamId || null;
  var isStreamChunk = false;

  console.info(streamId, self._dataStreams, typeof rawData);

  if (streamId && self._dataStreams[streamId]) {
    isStreamChunk = self._dataStreams[streamId].sessionChunkType === 'string' ? typeof rawData === 'string' :
      typeof rawData === 'object';
  }

  if (!self._peerConnections[peerId]) {
    self._log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping data received from Peer ' +
      'as connection is not present ->'], rawData);
    return;
  }

  if (!(self._dataChannels[peerId] && self._dataChannels[peerId][channelProp])) {
    self._log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping data received from Peer ' +
      'as Datachannel connection is not present ->'], rawData);
    return;
  }

  // Expect as string
  if (typeof rawData === 'string') {
    try {
      var protocolData = JSON.parse(rawData);
      isStreamChunk = false;

      self._log.debug([peerId, 'RTCDataChannel', channelProp, 'Received protocol "' + protocolData.type + '" message ->'], protocolData);

      // Ignore ACK, ERROR and CANCEL if there is no data transfer session in-progress
      if ([self._DC_PROTOCOL_TYPE.ACK, self._DC_PROTOCOL_TYPE.ERROR, self._DC_PROTOCOL_TYPE.CANCEL].indexOf(protocolData.type) > -1 &&
        !(transferId && self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
          self._log.warn([peerId, 'RTCDataChannel', channelProp, 'Discarded protocol message as data transfer session ' +
            'is not present ->'], protocolData);
          return;
      }

      switch (protocolData.type) {
        case self._DC_PROTOCOL_TYPE.WRQ:
          // Discard iOS bidirectional upload when Datachannel is in-progress for data transfers
          if (transferId && self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId]) {
            self._log.warn([peerId, 'RTCDataChannel', channelProp, 'Rejecting bidirectional data transfer request as ' +
              'it is currently not supported in the SDK ->'], protocolData);

            self._sendMessageToDataChannel(peerId, {
              type: self._DC_PROTOCOL_TYPE.ACK,
              ackN: -1,
              sender: self._user.sid
            }, channelProp);
            return;
          }
          self._WRQProtocolHandler(peerId, protocolData, channelProp);
          break;
        case self._DC_PROTOCOL_TYPE.ACK:
          self._ACKProtocolHandler(peerId, protocolData, channelProp);
          break;
        case self._DC_PROTOCOL_TYPE.ERROR:
          self._ERRORProtocolHandler(peerId, protocolData, channelProp);
          break;
        case self._DC_PROTOCOL_TYPE.CANCEL:
          self._CANCELProtocolHandler(peerId, protocolData, channelProp);
          break;
        case self._DC_PROTOCOL_TYPE.MESSAGE:
          self._MESSAGEProtocolHandler(peerId, protocolData, channelProp);
          break;
        default:
          self._log.warn([peerId, 'RTCDataChannel', channelProp, 'Discarded unknown "' + protocolData.type + '" message ->'], protocolData);
      }

    } catch (error) {
      if (rawData.indexOf('{') > -1 && rawData.indexOf('}') > 0) {
        self._log.error([peerId, 'RTCDataChannel', channelProp, 'Failed parsing protocol step data error ->'], {
          data: rawData,
          error: error
        });

        self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerId, error, channelName, channelType, null);
        throw error;
      }

      if (!isStreamChunk && !(transferId && self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
        self._log.warn([peerId, 'RTCDataChannel', channelProp, 'Discarded data chunk without session ->'], rawData);
        return;
      }

      if (!isStreamChunk && transferId) {
        if (self._dataTransfers[transferId].chunks[self._dataTransfers[transferId].sessions[peerId].ackN]) {
          self._log.warn([peerId, 'RTCDataChannel', transferId, 'Dropping data chunk ' + (!isStreamChunk ? '@' +
            self._dataTransfers[transferId].sessions[peerId].ackN : '') + ' as it has already been added ->'], rawData);
          return;
        }
      }

      var chunkType = self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING;

      if (!isStreamChunk ? self._dataTransfers[transferId].dataType === self.DATA_TRANSFER_SESSION_TYPE.DATA_URL : true) {
        self._log.debug([peerId, 'RTCDataChannel', channelProp, 'Received string data chunk ' + (!isStreamChunk ? '@' +
          self._dataTransfers[transferId].sessions[peerId].ackN : '') + ' with size ->'], rawData.length || rawData.size);

        self._DATAProtocolHandler(peerId, rawData, self.DATA_TRANSFER_DATA_TYPE.STRING,
          rawData.length || rawData.size || 0, channelProp);

      } else {
        var removeSpaceData = rawData.replace(/\s|\r|\n/g, '');

        self._log.debug([peerId, 'RTCDataChannel', channelProp, 'Received binary string data chunk @' +
          self._dataTransfers[transferId].sessions[peerId].ackN + ' with size ->'],
          removeSpaceData.length || removeSpaceData.size);

        self._DATAProtocolHandler(peerId, self._base64ToBlob(removeSpaceData), self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING,
          removeSpaceData.length || removeSpaceData.size || 0, channelProp);
      }
    }
  } else {
    if (!isStreamChunk && !(transferId && self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
      self._log.warn([peerId, 'RTCDataChannel', channelProp, 'Discarded data chunk without session ->'], rawData);
      return;
    }

    if (!isStreamChunk && transferId) {
      if (self._dataTransfers[transferId].chunks[self._dataTransfers[transferId].sessions[peerId].ackN]) {
        self._log.warn([peerId, 'RTCDataChannel', transferId, 'Dropping data chunk ' + (!isStreamChunk ? '@' +
          self._dataTransfers[transferId].sessions[peerId].ackN : '') + ' as it has already been added ->'], rawData);
        return;
      }
    }

    if (rawData instanceof Blob) {
      self._log.debug([peerId, 'RTCDataChannel', channelProp, 'Received blob data chunk ' + (isStreamChunk ? '' :
        '@' + self._dataTransfers[transferId].sessions[peerId].ackN) + ' with size ->'], rawData.size);

      self._DATAProtocolHandler(peerId, rawData, self.DATA_TRANSFER_DATA_TYPE.BLOB, rawData.size, channelProp);

    } else {
      var byteArray = rawData;

      if (rawData.constructor && rawData.constructor.name === 'Array') {
        // Need to re-parse on some browsers
        byteArray = new Int8Array(rawData);
      }

      var blob = new Blob([byteArray]);

      self._log.debug([peerId, 'RTCDataChannel', channelProp, 'Received arraybuffer data chunk ' + (isStreamChunk ? '' : 
        '@' + self._dataTransfers[transferId].sessions[peerId].ackN) + ' with size ->'], blob.size);

      self._DATAProtocolHandler(peerId, blob, self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER, blob.size, channelProp);
    }
  }
};

/**
 * Function that handles the "WRQ" data transfer protocol.
 * @method _WRQProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._WRQProtocolHandler = function(peerId, data, channelProp) {
  var self = this;
  var transferId = channelProp === 'main' ? data.transferId || null : channelProp;
  var senderPeerId = data.sender || peerId;

  if (['fastBinaryStart', 'fastBinaryStop'].indexOf(data.dataType) > -1) {
    if (data.dataType === 'fastBinaryStart') {
      if (!transferId) {
        transferId = 'stream_' + peerId + '_' + (new Date()).getTime();
      }
      self._dataStreams[transferId] = {
        chunkSize: 0,
        chunkType: data.chunkType === 'string' ? self.DATA_TRANSFER_DATA_TYPE.STRING : self.DATA_TRANSFER_DATA_TYPE.BLOB,
        sessionChunkType: data.chunkType,
        isPrivate: !!data.isPrivate,
        isStringStream: data.chunkType === 'string',
        senderPeerId: senderPeerId,
        isUpload: false
      };
      self._dataChannels[peerId][channelProp].streamId = transferId;
      var hasStarted = false;
      self.once('dataChannelState', function () {}, function (state, evtPeerId, channelName, channelType, error) {
        if (!self._dataStreams[transferId]) {
          return true;
        }

        if (!(evtPeerId === peerId && (channelProp === 'main' ? channelType === self.DATA_CHANNEL_TYPE.MESSAGING :
          channelName === transferId && channelType === self.DATA_CHANNEL_TYPE.DATA))) {
          return;
        }

        if ([self.DATA_CHANNEL_STATE.ERROR, self.DATA_CHANNEL_STATE.CLOSED].indexOf(state) > -1) {
          var updatedError = new Error(error && error.message ? error.message :
            'Failed data transfer as datachannel state is "' + state + '".');

          self._trigger('dataStreamState', self.DATA_STREAM_STATE.ERROR, transferId, senderPeerId, {
            chunk: null,
            chunkSize: 0,
            chunkType: self._dataStreams[transferId].chunkType,
            isPrivate: self._dataStreams[transferId].isPrivate,
            isStringStream: self._dataStreams[transferId].sessionChunkType === 'string',
            senderPeerId: senderPeerId
          }, updatedError);
          return true;
        }
      });

      self._trigger('dataStreamState', self.DATA_STREAM_STATE.RECEIVING_STARTED, transferId, senderPeerId, {
        chunk: null,
        chunkSize: 0,
        chunkType: self._dataStreams[transferId].chunkType,
        isPrivate: self._dataStreams[transferId].isPrivate,
        isStringStream: self._dataStreams[transferId].sessionChunkType === 'string',
        senderPeerId: senderPeerId
      }, null);
      self._trigger('incomingDataStreamStarted', transferId, senderPeerId, {
        chunkSize: 0,
        chunkType: self._dataStreams[transferId].chunkType,
        isPrivate: self._dataStreams[transferId].isPrivate,
        isStringStream: self._dataStreams[transferId].sessionChunkType === 'string',
        senderPeerId: senderPeerId
      }, false);

    } else {
      transferId = self._dataChannels[peerId][channelProp].streamId;
      if (self._dataStreams[transferId] && !self._dataStreams[transferId].isUpload) {
        self._trigger('dataStreamState', self.DATA_STREAM_STATE.RECEIVING_STOPPED, transferId, senderPeerId, {
          chunk: null,
          chunkSize: 0,
          chunkType: self._dataStreams[transferId].chunkType,
          isPrivate: self._dataStreams[transferId].isPrivate,
          isStringStream: self._dataStreams[transferId].sessionChunkType === 'string',
          senderPeerId: senderPeerId
        }, null);
        self._trigger('incomingDataStreamStopped', transferId, senderPeerId, {
          chunkSize: 0,
          chunkType: self._dataStreams[transferId].chunkType,
          isPrivate: self._dataStreams[transferId].isPrivate,
          isStringStream: self._dataStreams[transferId].sessionChunkType === 'string',
          senderPeerId: senderPeerId
        }, false);
        self._dataChannels[peerId][channelProp].streamId = null;
        if (channelProp !== 'main') {
          self._closeDataChannel(peerId, channelProp);
        }

        delete self._dataStreams[transferId];
      }
    }
  } else {
    if (!transferId) {
      transferId = 'transfer_' + peerId + '_' + (new Date()).getTime();
    }

    self._dataTransfers[transferId] = {
      name: data.name || transferId,
      size: data.size || 0,
      chunkSize: data.chunkSize,
      originalSize: data.originalSize || 0,
      timeout: data.timeout || 60,
      isPrivate: !!data.isPrivate,
      senderPeerId: data.sender || peerId,
      dataType: self.DATA_TRANSFER_SESSION_TYPE.BLOB,
      mimeType: data.mimeType || null,
      chunkType: self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING,
      direction: self.DATA_TRANSFER_TYPE.DOWNLOAD,
      chunks: [],
      sessions: {},
      sessionType: data.dataType || 'blob',
      sessionChunkType: data.chunkType || 'string'
    };

    if (self._dataTransfers[transferId].sessionType === 'data' &&
      self._dataTransfers[transferId].sessionChunkType === 'string') {
      self._dataTransfers[transferId].dataType = self.DATA_TRANSFER_SESSION_TYPE.DATA_URL;
      self._dataTransfers[transferId].chunkType = self.DATA_TRANSFER_DATA_TYPE.STRING;
    } else if (self._dataTransfers[transferId].sessionType === 'blob' &&
      self._dataTransfers[transferId].sessionChunkType === 'binary') {
      self._dataTransfers[transferId].chunkType = self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER;
    }

    self._dataChannels[peerId][channelProp].transferId = transferId;
    self._dataTransfers[transferId].sessions[peerId] = {
      timer: null,
      ackN: 0,
      receivedSize: 0
    };

    self._trigger('incomingDataRequest', transferId, senderPeerId,
      self._getTransferInfo(transferId, peerId, false, false, false), false);

    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOAD_REQUEST, transferId, senderPeerId,
      self._getTransferInfo(transferId, peerId, true, false, false), null);
  }
};

/**
 * Function that handles the "ACK" data transfer protocol.
 * @method _ACKProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._ACKProtocolHandler = function(peerId, data, channelProp) {
  var self = this;

  var transferId = channelProp;
  var senderPeerId = data.sender || peerId;

  if (channelProp === 'main') {
    transferId = self._dataChannels[peerId].main.transferId;
  }

  self._handleDataTransferTimeoutForPeer(transferId, peerId, false);

  /**
   * Emit event for Peers function.
   */
  var emitEventFn = function (cb) {
    if (peerId === 'MCU') {
      if (!self._dataTransfers[transferId].peers[channelProp]) {
        self._log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping triggering of ACK event as ' +
          'Peers list does not exists']);
        return;
      }
      for (var evtPeerId in self._dataTransfers[transferId].peers[channelProp]) {
        if (self._dataTransfers[transferId].peers[channelProp].hasOwnProperty(evtPeerId) &&
          self._dataTransfers[transferId].peers[channelProp][evtPeerId]) {
          cb(evtPeerId);
        }
      }
    } else {
      cb(senderPeerId);
    }
  };

  if (data.ackN > -1) {
    if (data.ackN === 0) {
      emitEventFn(function (evtPeerId) {
        self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOAD_STARTED, transferId, evtPeerId,
          self._getTransferInfo(transferId, peerId, true, false, 0), null);
      });
    } else if (self._dataTransfers[transferId].enforceBSPeers.indexOf(peerId) > -1 ?
      data.ackN === self._dataTransfers[transferId].enforceBSInfo.chunks.length :
      data.ackN === self._dataTransfers[transferId].chunks.length) {
      self._dataTransfers[transferId].sessions[peerId].ackN = data.ackN;

      emitEventFn(function (evtPeerId) {
        self._trigger('incomingData', self._getTransferData(transferId), transferId, evtPeerId,
          self._getTransferInfo(transferId, peerId, false, false, false), true);

        self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED, transferId, evtPeerId,
          self._getTransferInfo(transferId, peerId, true, false, 100), null);
      });

      if (self._dataChannels[peerId][channelProp]) {
        self._dataChannels[peerId][channelProp].transferId = null;

        if (channelProp !== 'main') {
          self._closeDataChannel(peerId, channelProp);
        }
      }
      return;
    }

    var uploadFn = function (chunk) {
      self._sendMessageToDataChannel(peerId, chunk, channelProp, true);

      if (data.ackN < self._dataTransfers[transferId].chunks.length) {
        emitEventFn(function (evtPeerId) {
          self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOADING, transferId, evtPeerId,
            self._getTransferInfo(transferId, peerId, true, false, false), null);
        });
      }

      self._handleDataTransferTimeoutForPeer(transferId, peerId, true);
    };

    self._dataTransfers[transferId].sessions[peerId].ackN = data.ackN;

    if (self._dataTransfers[transferId].enforceBSPeers.indexOf(peerId) > -1) {
      self._blobToBase64(self._dataTransfers[transferId].enforceBSInfo.chunks[data.ackN], uploadFn);
    } else if (self._dataTransfers[transferId].chunkType === self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
      self._blobToBase64(self._dataTransfers[transferId].chunks[data.ackN], uploadFn);
    } else if (self._dataTransfers[transferId].chunkType === self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER) {
      self._blobToArrayBuffer(self._dataTransfers[transferId].chunks[data.ackN], uploadFn);
    } else {
      uploadFn(self._dataTransfers[transferId].chunks[data.ackN]);
    }
  } else {
    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.REJECTED, transferId, senderPeerId,
      self._getTransferInfo(transferId, peerId, true, false, false), {
      message: new Error('Data transfer terminated as Peer has rejected data transfer request'),
      transferType: self.DATA_TRANSFER_TYPE.UPLOAD
    });
  }
};

/**
 * Function that handles the "MESSAGE" data transfer protocol.
 * @method _MESSAGEProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._MESSAGEProtocolHandler = function(peerId, data, channelProp) {
  var senderPeerId = data.sender || peerId;

  self._log.log([senderPeerId, 'RTCDataChannel', channelProp, 'Received P2P message from peer:'], data);

  this._trigger('incomingMessage', {
    content: data.data,
    isPrivate: data.isPrivate,
    isDataChannel: true,
    targetPeerId: this._user.sid,
    senderPeerId: senderPeerId
  }, senderPeerId, this.getPeerInfo(senderPeerId), false);
};

/**
 * Function that handles the "ERROR" data transfer protocol.
 * @method _ERRORProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._ERRORProtocolHandler = function(peerId, data, channelProp) {
  var self = this;

  var transferId = channelProp;
  var senderPeerId = data.sender || peerId;

  if (channelProp === 'main') {
    transferId = self._dataChannels[peerId].main.transferId;
  }

  self._handleDataTransferTimeoutForPeer(transferId, peerId, false);

  /**
   * Emit event for Peers function.
   */
  var emitEventFn = function (cb) {
    if (peerId === 'MCU') {
      if (!self._dataTransfers[transferId].peers[channelProp]) {
        self._log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping triggering of ERROR event as ' +
          'Peers list does not exists']);
        return;
      }
      for (var evtPeerId in self._dataTransfers[transferId].peers[channelProp]) {
        if (self._dataTransfers[transferId].peers[channelProp].hasOwnProperty(evtPeerId) &&
          self._dataTransfers[transferId].peers[channelProp][evtPeerId]) {
          cb(evtPeerId);
        }
      }
    } else {
      cb(senderPeerId);
    }
  };

  self._log.error([peerId, 'RTCDataChannel', channelProp, 'Received an error from peer ->'], data);

  emitEventFn(function (evtPeerId) {
    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR, transferId, evtPeerId,
      self._getTransferInfo(transferId, peerID, true, false, false), {
      message: new Error(data.content),
      transferType: self._dataTransfers[transferId].direction
    });
  });
};

/**
 * Function that handles the "CANCEL" data transfer protocol.
 * @method _CANCELProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._CANCELProtocolHandler = function(peerId, data, channelProp) {
  var self = this;
  var transferId = channelProp;

  if (channelProp === 'main') {
    transferId = self._dataChannels[peerId].main.transferId;
  }

  self._handleDataTransferTimeoutForPeer(transferId, peerId, false);

  /**
   * Emit event for Peers function.
   */
  var emitEventFn = function (cb) {
    if (peerId === 'MCU') {
      if (!self._dataTransfers[transferId].peers[channelProp]) {
        self._log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping triggering of CANCEL event as ' +
          'Peers list does not exists']);
        return;
      }
      for (var evtPeerId in self._dataTransfers[transferId].peers[channelProp]) {
        if (self._dataTransfers[transferId].peers[channelProp].hasOwnProperty(evtPeerId) &&
          self._dataTransfers[transferId].peers[channelProp][evtPeerId]) {
          cb(evtPeerId);
        }
      }
    } else {
      cb(peerId);
    }
  };

  self._log.error([peerId, 'RTCDataChannel', channelProp, 'Received data transfer termination from peer ->'], data);

  emitEventFn(function (evtPeerId) {
    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.CANCEL, transferId, evtPeerId,
      self._getTransferInfo(transferId, peerId, true, false, false), {
      message: new Error(data.content || 'Peer has terminated data transfer.'),
      transferType: self._dataTransfers[transferId].direction
    });
  });
};

/**
 * Function that handles the data transfer chunk received.
 * @method _DATAProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._DATAProtocolHandler = function(peerId, chunk, chunkType, chunkSize, channelProp) {
  var self = this;
  var transferId = channelProp;
  var senderPeerId = peerId;

  if (!(self._dataChannels[peerId] && self._dataChannels[peerId][channelProp])) {
    return;
  }

  var streamId = self._dataChannels[peerId][channelProp].streamId;

  if (streamId && self._dataStreams[streamId] && ((typeof chunk === 'string' &&
    self._dataStreams[streamId].sessionChunkType === 'string') || (chunk instanceof Blob &&
    self._dataStreams[streamId].sessionChunkType === 'binary'))) {
    senderPeerId = self._dataStreams[streamId].senderPeerId || peerId;
    self._trigger('dataStreamState', self.DATA_STREAM_STATE.RECEIVED, streamId, senderPeerId, {
      chunk: chunk,
      chunkSize: chunkSize,
      chunkType: chunkType,
      isPrivate: self._dataStreams[streamId].sessionChunkType.isPrivate,
      isStringStream: self._dataStreams[streamId].sessionChunkType === 'string',
      senderPeerId: senderPeerId
    }, null);
    self._trigger('incomingDataStream', chunk, transferId, senderPeerId, {
      chunkSize: chunkSize,
      chunkType: chunkType,
      isPrivate: self._dataStreams[streamId].sessionChunkType.isPrivate,
      isStringStream: self._dataStreams[streamId].sessionChunkType === 'string',
      senderPeerId: senderPeerId
    }, false);    
    return;
  }

  if (channelProp === 'main') {
    transferId = self._dataChannels[peerId].main.transferId;
  }

  if (self._dataTransfers[transferId].senderPeerId) {
    senderPeerId = self._dataTransfers[transferId].senderPeerId;
  }

  self._handleDataTransferTimeoutForPeer(transferId, peerId, false);

  self._dataTransfers[transferId].chunkType = chunkType;
  self._dataTransfers[transferId].sessions[peerId].receivedSize += chunkSize;
  self._dataTransfers[transferId].chunks[self._dataTransfers[transferId].sessions[peerId].ackN] = chunk;

  if (self._dataTransfers[transferId].sessions[peerId].receivedSize >= self._dataTransfers[transferId].size) {
    self._log.log([peerId, 'RTCDataChannel', channelProp, 'Data transfer has been completed. Computed size ->'],
      self._dataTransfers[transferId].sessions[peerId].receivedSize);

    // Send last ACK to Peer to indicate completion of data transfers
    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.ACK,
      sender: self._user.sid,
      ackN: self._dataTransfers[transferId].sessions[peerId].ackN + 1
    }, channelProp);

    self._trigger('incomingData', self._getTransferData(transferId), transferId, senderPeerId,
      self._getTransferInfo(transferId, peerId, false, false, false), null);

    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED, transferId, senderPeerId,
      self._getTransferInfo(transferId, peerId, true, false, false), null);
    return;
  }

  self._dataTransfers[transferId].sessions[peerId].ackN += 1;

  self._sendMessageToDataChannel(peerId, {
    type: self._DC_PROTOCOL_TYPE.ACK,
    sender: self._user.sid,
    ackN: self._dataTransfers[transferId].sessions[peerId].ackN
  }, channelProp);

  self._handleDataTransferTimeoutForPeer(transferId, peerId, true);

  self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.DOWNLOADING, transferId, senderPeerId,
    self._getTransferInfo(transferId, peerId, true, false, false), null);
};

var SkylinkEvents = {
  /**
   * Event triggered when socket connection to Signaling server has opened.
   * @event channelOpen
   * @param {JSON} session The socket connection session information.
   * @param {String} session.serverUrl The socket connection Signaling url used.
   * @param {String} session.transportType The socket connection transport type used.
   * @param {JSON} session.socketOptions The socket connection options.
   * @param {Number} session.attempts The socket connection current reconnection attempts.
   * @param {Number} session.finalAttempts The socket connection current last attempts
   *   for the last available transports and port.
   * @for Skylink
   * @since 0.1.0
   */
  channelOpen: [],

  /**
   * Event triggered when socket connection to Signaling server has closed.
   * @event channelClose
   * @param {JSON} session The socket connection session information.
   *   <small>Object signature matches the <code>session</code> parameter payload received in the
   *   <a href="#event_channelOpen"><code>channelOpen</code> event</a>.</small>
   * @for Skylink
   * @since 0.1.0
   */
  channelClose: [],

  /**
   * <blockquote class="info">
   *   Note that this is used only for SDK developer purposes.
   * </blockquote>
   * Event triggered when receiving socket message from the Signaling server.
   * @event channelMessage
   * @param {JSON} message The socket message object.
   * @param {JSON} session The socket connection session information.
   *   <small>Object signature matches the <code>session</code> parameter payload received in the
   *   <a href="#event_channelOpen"><code>channelOpen</code> event</a>.</small>
   * @for Skylink
   * @since 0.1.0
   */
  channelMessage: [],

  /**
   * <blockquote class="info">
   *   This may be caused by Javascript errors in the event listener when subscribing to events.<br>
   *   It may be resolved by checking for code errors in your Web App in the event subscribing listener.<br>
   *   <code>skylinkDemo.on("eventName", function () { // Errors here });</code>
   * </blockquote>
   * Event triggered when socket connection encountered exception.
   * @event channelError
   * @param {Error|String} error The error object.
   * @param {JSON} session The socket connection session information.
   *   <small>Object signature matches the <code>session</code> parameter payload received in the
   *   <a href="#event_channelOpen"><code>channelOpen</code> event</a>.</small>
   * @for Skylink
   * @since 0.1.0
   */
  channelError: [],

  /**
   * Event triggered when attempting to establish socket connection to Signaling server when failed.
   * @event channelRetry
   * @param {String} fallbackType The current fallback state.
   *   [Rel: Skylink.SOCKET_FALLBACK]
   * @param {Number} currentAttempt The current socket reconnection attempt.
   * @param {JSON} session The socket connection session information.
   *   <small>Object signature matches the <code>session</code> parameter payload received in the
   *   <a href="#event_channelOpen"><code>channelOpen</code> event</a>.</small>
   * @for Skylink
   * @since 0.5.6
   */
  channelRetry: [],

  /**
   * Event triggered when attempt to establish socket connection to Signaling server has failed.
   * @event socketError
   * @param {Number} errorCode The socket connection error code.
   *   [Rel: Skylink.SOCKET_ERROR]
   * @param {Error|String|Number} error The error object.
   * @param {String} type The fallback state of the socket connection attempt.
   *   [Rel: Skylink.SOCKET_FALLBACK]
   * @param {JSON} session The socket connection session information.
   *   <small>Object signature matches the <code>session</code> parameter payload received in the
   *   <a href="#event_channelOpen"><code>channelOpen</code> event</a>.</small>
   * @for Skylink
   * @since 0.5.5
   */
  socketError: [],

  /**
   * Event triggered when <a href="#method_init"><code>init()</code> method</a> ready state changes.
   * @event readyStateChange
   * @param {Number} readyState The current <code>init()</code> ready state.
   *   [Rel: Skylink.READY_STATE_CHANGE]
   * @param {JSON} [error] The error result.
   *   <small>Defined only when <code>state</code> is <code>ERROR</code>.</small>
   * @param {Number} error.status The HTTP status code when failed.
   * @param {Number} error.errorCode The ready state change failure code.
   *   [Rel: Skylink.READY_STATE_CHANGE_ERROR]
   * @param {Error} error.content The error object.
   * @param {String} room The Room to The Room to retrieve session token for.
   * @for Skylink
   * @since 0.4.0
   */
  readyStateChange: [],

  /**
   * Event triggered when a Peer connection establishment state has changed.
   * @event handshakeProgress
   * @param {String} state The current Peer connection establishment state.
   *   [Rel: Skylink.HANDSHAKE_PROGRESS]
   * @param {String} peerId The Peer ID.
   * @param {Error|String} [error] The error object.
   *   <small>Defined only when <code>state</code> is <code>ERROR</code>.</small>
   * @for Skylink
   * @since 0.3.0
   */
  handshakeProgress: [],

  /**
   * <blockquote class="info">
   *   Learn more about how ICE works in this
   *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
   * </blockquote>
   * Event triggered when a Peer connection ICE gathering state has changed.
   * @event candidateGenerationState
   * @param {String} state The current Peer connection ICE gathering state.
   *   [Rel: Skylink.CANDIDATE_GENERATION_STATE]
   * @param {String} peerId The Peer ID.
   * @for Skylink
   * @since 0.1.0
   */
  candidateGenerationState: [],

  /**
   * <blockquote class="info">
   *   Learn more about how ICE works in this
   *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
   * </blockquote>
   * Event triggered when a Peer connection session description exchanging state has changed.
   * @event peerConnectionState
   * @param {String} state The current Peer connection session description exchanging state.
   *   [Rel: Skylink.PEER_CONNECTION_STATE]
   * @param {String} peerId The Peer ID.
   * @for Skylink
   * @since 0.1.0
   */
  peerConnectionState: [],

  /**
   * <blockquote class="info">
   *   Learn more about how ICE works in this
   *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
   * </blockquote>
   * Event triggered when a Peer connection ICE connection state has changed.
   * @event iceConnectionState
   * @param {String} state The current Peer connection ICE connection state.
   *   [Rel: Skylink.ICE_CONNECTION_STATE]
   * @param {String} peerId The Peer ID.
   * @for Skylink
   * @since 0.1.0
   */
  iceConnectionState: [],

  /**
   * Event triggered when retrieval of Stream failed.
   * @event mediaAccessError
   * @param {Error|String} error The error object.
   * @param {Boolean} isScreensharing The flag if event occurred during
   *   <a href="#method_shareScreen"><code>shareScreen()</code> method</a> and not
   *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.
   * @param {Boolean} isAudioFallbackError The flag if event occurred during
   *   retrieval of audio tracks only when <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>
   *   had failed to retrieve both audio and video tracks.
   * @for Skylink
   * @since 0.1.0
   */
  mediaAccessError: [],

  /**
   * Event triggered when Stream retrieval fallback state has changed.
   * @event mediaAccessFallback
   * @param {JSON} error The error result.
   * @param {Error|String} error.error The error object.
   * @param {JSON} [error.diff=null] The list of excepted but received audio and video tracks in Stream.
   *   <small>Defined only when <code>state</code> payload is <code>FALLBACKED</code>.</small>
   * @param {JSON} error.diff.video The expected and received video tracks.
   * @param {Number} error.diff.video.expected The expected video tracks.
   * @param {Number} error.diff.video.received The received video tracks.
   * @param {JSON} error.diff.audio The expected and received audio tracks.
   * @param {Number} error.diff.audio.expected The expected audio tracks.
   * @param {Number} error.diff.audio.received The received audio tracks.
   * @param {Number} state The fallback state.
   *   [Rel: Skylink.MEDIA_ACCESS_FALLBACK_STATE]
   * @param {Boolean} isScreensharing The flag if event occurred during
   *   <a href="#method_shareScreen"><code>shareScreen()</code> method</a> and not
   *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.
   * @param {Boolean} isAudioFallback The flag if event occurred during
   *   retrieval of audio tracks only when <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>
   *   had failed to retrieve both audio and video tracks.
   * @param {String} streamId The Stream ID.
   *   <small>Defined only when <code>state</code> payload is <code>FALLBACKED</code>.</small>
   * @for Skylink
   * @since 0.6.3
   */
  mediaAccessFallback: [],

  /**
   * Event triggered when retrieval of Stream is successful.
   * @event mediaAccessSuccess
   * @param {MediaStream} stream The Stream object.
   *   <small>To attach it to an element: <code>attachMediaStream(videoElement, stream);</code>.</small>
   * @param {Boolean} isScreensharing The flag if event occurred during
   *   <a href="#method_shareScreen"><code>shareScreen()</code> method</a> and not
   *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.
   * @param {Boolean} isAudioFallback The flag if event occurred during
   *   retrieval of audio tracks only when <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>
   *   had failed to retrieve both audio and video tracks.
   * @param {String} streamId The Stream ID.
   * @for Skylink
   * @since 0.1.0
   */
  mediaAccessSuccess: [],

  /**
   * Event triggered when retrieval of Stream is required to complete <a href="#method_joinRoom">
   * <code>joinRoom()</code> method</a> request.
   * @event mediaAccessRequired
   * @for Skylink
   * @since 0.5.5
   */
  mediaAccessRequired: [],

  /**
   * Event triggered when Stream has stopped streaming.
   * @event mediaAccessStopped
   * @param {Boolean} isScreensharing The flag if event occurred during
   *   <a href="#method_shareScreen"><code>shareScreen()</code> method</a> and not
   *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.
   * @param {Boolean} isAudioFallback The flag if event occurred during
   *   retrieval of audio tracks only when <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>
   *   had failed to retrieve both audio and video tracks.
   * @param {String} streamId The Stream ID.
   * @for Skylink
   * @since 0.5.6
   */
  mediaAccessStopped: [],

  /**
   * Event triggered when a Peer joins the room.
   * @event peerJoined
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   * @param {JSON|String} peerInfo.userData The Peer current custom data.
   * @param {JSON} peerInfo.settings The Peer sending Stream settings.
   * @param {Boolean|JSON} peerInfo.settings.audio The Peer Stream audio settings.
   *   <small>When defined as <code>false</code>, it means there is no audio being sent from Peer.</small>
   *   <small>When defined as <code>true</code>, the <code>peerInfo.settings.audio.stereo</code> value is
   *   considered as <code>false</code> and the <code>peerInfo.settings.audio.exactConstraints</code>
   *   value is considered as <code>false</code>.</small>
   * @param {Boolean} peerInfo.settings.audio.stereo The flag if stereo band is configured
   *   when encoding audio codec is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for receiving audio data.
   * @param {Boolean} [peerInfo.settings.audio.usedtx] <blockquote class="info">
   *   Note that this feature might not work depending on the browser support and implementation.</blockquote>
   *   The flag if DTX (Discontinuous Transmission) is configured when encoding audio codec
   *   is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending audio data.
   *   <small>This might help to reduce bandwidth it reduces the bitrate during silence or background noise.</small>
   *   <small>When not defined, the default browser configuration is used.</small>
   * @param {Boolean} [peerInfo.settings.audio.useinbandfec] <blockquote class="info">
   *   Note that this feature might not work depending on the browser support and implementation.</blockquote>
   *   The flag if capability to take advantage of in-band FEC (Forward Error Correction) is
   *   configured when encoding audio codec is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending audio data.
   *   <small>This might help to reduce the harm of packet loss by encoding information about the previous packet.</small>
   *   <small>When not defined, the default browser configuration is used.</small>
   * @param {Number} [peerInfo.settings.audio.maxplaybackrate] <blockquote class="info">
   *   Note that this feature might not work depending on the browser support and implementation.</blockquote>
   *   The maximum output sampling rate rendered in Hertz (Hz) when encoding audio codec is
   *   <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending audio data.
   *   <small>This value must be between <code>8000</code> to <code>48000</code>.</small>
   *   <small>When not defined, the default browser configuration is used.</small>
   * @param {Boolean} peerInfo.settings.audio.echoCancellation The flag if echo cancellation is enabled for audio tracks.
   * @param {Array} [peerInfo.settings.audio.optional] The Peer Stream <code>navigator.getUserMedia()</code> API
   *   <code>audio: { optional [..] }</code> property.
   * @param {String} [peerInfo.settings.audio.deviceId] The Peer Stream audio track source ID of the device used.
   * @param {Boolean} peerInfo.settings.audio.exactConstraints The flag if Peer Stream audio track is sending exact
   *   requested values of <code>peerInfo.settings.audio.deviceId</code> when provided.
   * @param {Boolean|JSON} peerInfo.settings.video The Peer Stream video settings.
   *   <small>When defined as <code>false</code>, it means there is no video being sent from Peer.</small>
   *   <small>When defined as <code>true</code>, the <code>peerInfo.settings.video.screenshare</code> value is
   *   considered as <code>false</code>  and the <code>peerInfo.settings.video.exactConstraints</code>
   *   value is considered as <code>false</code>.</small>
   * @param {JSON} [peerInfo.settings.video.resolution] The Peer Stream video resolution.
   *   [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Number|JSON} peerInfo.settings.video.resolution.width The Peer Stream video resolution width or
   *   video resolution width settings.
   *   <small>When defined as a JSON object, it is the user set resolution width settings with (<code>"min"</code> or
   *   <code>"max"</code> or <code>"ideal"</code> or <code>"exact"</code> etc configurations).</small>
   * @param {Number|JSON} peerInfo.settings.video.resolution.height The Peer Stream video resolution height or
   *   video resolution height settings.
   *   <small>When defined as a JSON object, it is the user set resolution height settings with (<code>"min"</code> or
   *   <code>"max"</code> or <code>"ideal"</code> or <code>"exact"</code> etc configurations).</small>
   * @param {Number|JSON} [peerInfo.settings.video.frameRate] The Peer Stream video
   *   <a href="https://en.wikipedia.org/wiki/Frame_rate">frameRate</a> per second (fps) or video frameRate settings.
   *   <small>When defined as a JSON object, it is the user set frameRate settings with (<code>"min"</code> or
   *   <code>"max"</code> or <code>"ideal"</code> or <code>"exact"</code> etc configurations).</small>
   * @param {Boolean} peerInfo.settings.video.screenshare The flag if Peer Stream is a screensharing Stream.
   * @param {Array} [peerInfo.settings.video.optional] The Peer Stream <code>navigator.getUserMedia()</code> API
   *   <code>video: { optional [..] }</code> property.
   * @param {String} [peerInfo.settings.video.deviceId] The Peer Stream video track source ID of the device used.
   * @param {Boolean} peerInfo.settings.video.exactConstraints The flag if Peer Stream video track is sending exact
   *   requested values of <code>peerInfo.settings.video.resolution</code>,
   *   <code>peerInfo.settings.video.frameRate</code> and <code>peerInfo.settings.video.deviceId</code>
   *   when provided.
   * @param {String|JSON} [peerInfo.settings.video.facingMode] The Peer Stream video camera facing mode.
   *   <small>When defined as a JSON object, it is the user set facingMode settings with (<code>"min"</code> or
   *   <code>"max"</code> or <code>"ideal"</code> or <code>"exact"</code> etc configurations).</small>
   * @param {JSON} peerInfo.settings.bandwidth The maximum streaming bandwidth sent from Peer.
   * @param {Number} [peerInfo.settings.bandwidth.audio] The maximum audio streaming bandwidth sent from Peer.
   * @param {Number} [peerInfo.settings.bandwidth.video] The maximum video streaming bandwidth sent from Peer.
   * @param {Number} [peerInfo.settings.bandwidth.data] The maximum data streaming bandwidth sent from Peer.
   * @param {JSON} peerInfo.settings.googleXBandwidth <blockquote class="info">
   *   Note that this feature might not work depending on the browser support and implementation,
   *   and its properties and values are only defined for User's end and cannot be viewed
   *   from Peer's end (when <code>isSelf</code> value is <code>false</code>).</blockquote>
   *   The experimental google video streaming bandwidth sent to Peers.
   * @param {Number} [peerInfo.settings.googleXBandwidth.min] The minimum experimental google video streaming bandwidth sent to Peers.
   * @param {Number} [peerInfo.settings.googleXBandwidth.max] The maximum experimental google video streaming bandwidth sent to Peers.
   * @param {JSON} peerInfo.mediaStatus The Peer Stream muted settings.
   * @param {Boolean} peerInfo.mediaStatus.audioMuted The flag if Peer Stream audio tracks is muted or not.
   *   <small>If Peer <code>peerInfo.settings.audio</code> is false, this will be defined as <code>true</code>.</small>
   * @param {Boolean} peerInfo.mediaStatus.videoMuted The flag if Peer Stream video tracks is muted or not.
   *   <small>If Peer <code>peerInfo.settings.video</code> is false, this will be defined as <code>true</code>.</small>
   * @param {JSON} peerInfo.agent The Peer agent information.
   * @param {String} peerInfo.agent.name The Peer agent name.
   *   <small>Data may be accessing browser or non-Web SDK name.</small>
   * @param {Number} peerInfo.agent.version The Peer agent version.
   *   <small>Data may be accessing browser or non-Web SDK version. If the original value is <code>"0.9.6.1"</code>,
   *   it will be interpreted as <code>0.90601</code> where <code>0</code> helps to seperate the minor dots.</small>
   * @param {String} [peerInfo.agent.os] The Peer platform name.
   *  <small>Data may be accessing OS platform version from Web SDK.</small>
   * @param {String} [peerInfo.agent.pluginVersion] The Peer Temasys Plugin version.
   *  <small>Defined only when Peer is using the Temasys Plugin (IE / Safari).</small>
   * @param {String} peerInfo.agent.DTProtocolVersion The Peer data transfer (DT) protocol version.
   * @param {String} peerInfo.agent.SMProtocolVersion The Peer signaling message (SM) protocol version.
   * @param {String} peerInfo.room The Room Peer is from.
   * @param {JSON} peerInfo.config The Peer connection configuration.
   * @param {Boolean} peerInfo.config.enableIceTrickle The flag if Peer connection has
   *   trickle ICE enabled or faster connectivity.
   * @param {Boolean} peerInfo.config.enableDataChannel The flag if Datachannel connections would be enabled for Peer.
   * @param {Boolean} peerInfo.config.enableIceRestart The flag if Peer connection has ICE connection restart support.
   *   <small>Note that ICE connection restart support is not honoured for MCU enabled Peer connection.</small>
   * @param {Number} peerInfo.config.priorityWeight The flag if Peer or User should be the offerer.
   *   <small>If User's <code>priorityWeight</code> is higher than Peer's, User is the offerer, else Peer is.
   *   However for the case where the MCU is connected, User will always be the offerer.</small>
   * @param {Boolean} peerInfo.config.publishOnly The flag if Peer is publishing only stream but not receiving streams.
   * @param {Boolean} peerInfo.config.receiveOnly The flag if Peer is receiving only streams but not publishing stream.
   * @param {String} [peerInfo.parentId] The parent Peer ID that it is matched to for multi-streaming connections.
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.5.2
   */
  peerJoined: [],

  /**
   * Event triggered when a Peer connection has been refreshed.
   * @event peerRestart
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelfInitiateRestart The flag if User is initiating the Peer connection refresh.
   * @param {Boolean} isIceRestart The flag if Peer connection ICE connection will restart.
   * @for Skylink
   * @since 0.5.5
   */
  peerRestart: [],

  /**
   * Event triggered when a Peer session information has been updated.
   * @event peerUpdated
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.5.2
   */
  peerUpdated: [],

  /**
   * Event triggered when a Peer leaves the room.
   * @event peerLeft
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.5.2
   */
  peerLeft: [],

  /**
   * Event triggered when Room session has ended abruptly due to network disconnections.
   * @event sessionDisconnect
   * @param {String} peerId The User's Room session Peer ID.
   * @param {JSON} peerInfo The User's Room session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @for Skylink
   * @since 0.6.10
   */
  sessionDisconnect: [],

  /**
   * Event triggered when receiving Peer Stream.
   * @event incomingStream
   * @param {String} peerId The Peer ID.
   * @param {MediaStream} stream The Stream object.
   *   <small>To attach it to an element: <code>attachMediaStream(videoElement, stream);</code>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isScreensharing The flag if Peer Stream is a screensharing Stream.
   * @param {String} streamId The Stream ID.
   * @for Skylink
   * @since 0.5.5
   */
  incomingStream: [],

  /**
   * Event triggered when receiving message from Peer.
   * @event incomingMessage
   * @param {JSON} message The message result.
   * @param {JSON|String} message.content The message object.
   * @param {String} message.senderPeerId The sender Peer ID.
   * @param {String|Array} [message.targetPeerId] The value of the <code>targetPeerId</code>
   *   defined in <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a> or
   *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>.
   *   <small>Defined as User's Peer ID when <code>isSelf</code> payload value is <code>false</code>.</small>
   *   <small>Defined as <code>null</code> when provided <code>targetPeerId</code> in
   *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a> or
   *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a> is not defined.</small>
   * @param {Array} [message.listOfPeers] The list of Peers that the message has been sent to.
   *  <small>Defined only when <code>isSelf</code> payload value is <code>true</code>.</small>
   * @param {Boolean} message.isPrivate The flag if message is targeted or not, basing
   *   off the <code>targetPeerId</code> parameter being defined in
   *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a> or
   *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>.
   * @param {Boolean} message.isDataChannel The flag if message is sent from
   *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>.
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.5.2
   */
  incomingMessage: [],

  /**
   * Event triggered when receiving completed data transfer from Peer.
   * @event incomingData
   * @param {Blob|String} data The data.
   * @param {String} transferId The data transfer ID.
   * @param {String} peerId The Peer ID.
   * @param {JSON} transferInfo The data transfer information.
   *   <small>Object signature matches the <code>transferInfo</code> parameter payload received in the
   *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
   *   except without the <code>data</code> property.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.6.1
   */
  incomingData: [],

  /**
   * Event triggered when receiving upload data transfer from Peer.
   * @event incomingDataRequest
   * @param {String} transferId The transfer ID.
   * @param {String} peerId The Peer ID.
   * @param {String} transferInfo The data transfer information.
   *   <small>Object signature matches the <code>transferInfo</code> parameter payload received in the
   *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
   *   except without the <code>data</code> property.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.6.1
   */
  incomingDataRequest: [],

  /**
   * Event triggered when data streaming session has been started from Peer to User.
   * @event incomingDataStreamStarted
   * @param {String} streamId The data streaming session ID.
   * @param {String} peerId The Peer ID.
   * @param {JSON} streamInfo The data streaming session information.
   *   <small>Object signature matches the <code>streamInfo</code> parameter payload received in the
   *   <a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
   *   except without the <code>chunk</code> property.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.6.18
   */
  incomingDataStreamStarted: [],

  /**
   * Event triggered when data streaming session has been stopped from Peer to User.
   * @event incomingDataStreamStopped
   * @param {String} streamId The data streaming session ID.
   * @param {String} peerId The Peer ID.
   * @param {JSON} streamInfo The data streaming session information.
   *   <small>Object signature matches the <code>streamInfo</code> parameter payload received in the
   *   <a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
   *   except without the <code>chunk</code> property.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.6.18
   */
  incomingDataStreamStopped: [],

  /**
   * Event triggered when data streaming session has been stopped from Peer to User.
   * @event incomingDataStream
   * @param {Blob|String} chunk The data chunk received.
   * @param {String} streamId The data streaming session ID.
   * @param {String} peerId The Peer ID.
   * @param {JSON} streamInfo The data streaming session information.
   *   <small>Object signature matches the <code>streamInfo</code> parameter payload received in the
   *   <a href="#event_dataStreamState"><code>dataStreamState</code> event</a>
   *   except without the <code>chunk</code> property.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.6.18
   */
  incomingDataStream: [],

  /**
   * Event triggered when Room locked status has changed.
   * @event roomLock
   * @param {Boolean} isLocked The flag if Room is locked.
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if User changed the Room locked status.
   * @for Skylink
   * @since 0.5.2
   */
  roomLock: [],

  /**
   * Event triggered when a Datachannel connection state has changed.
   * @event dataChannelState
   * @param {String} state The current Datachannel connection state.
   *   [Rel: Skylink.DATA_CHANNEL_STATE]
   * @param {String} peerId The Peer ID.
   * @param {Error} [error] The error object.
   *   <small>Defined only when <code>state</code> payload is <code>ERROR</code> or <code>SEND_MESSAGE_ERROR</code>.</small>
   * @param {String} channelName The Datachannel ID.
   * @param {String} channelType The Datachannel type.
   *   [Rel: Skylink.DATA_CHANNEL_TYPE]
   * @param {String} messageType The Datachannel sending Datachannel message error type.
   *   <small>Defined only when <cod>state</code> payload is <code>SEND_MESSAGE_ERROR</code>.</small>
   *   [Rel: Skylink.DATA_CHANNEL_MESSAGE_ERROR]
   * @for Skylink
   * @since 0.1.0
   */
  dataChannelState: [],

  /**
   * Event triggered when a data transfer state has changed.
   * @event dataTransferState
   * @param {String} state The current data transfer state.
   *   [Rel: Skylink.DATA_TRANSFER_STATE]
   * @param {String} transferId The data transfer ID.
   *   <small>Note that this is defined as <code>null</code> when <code>state</code> payload is <code>START_ERROR</code>.</small>
   * @param {String} peerId The Peer ID.
   *   <small>Note that this could be defined as <code>null</code> when <code>state</code> payload is
   *   <code>START_ERROR</code> and there is no Peers to start data transfer with.</small>
   * @param {JSON} transferInfo The data transfer information.
   * @param {Blob|String} [transferInfo.data] The data object.
   *   <small>Defined only when <code>state</code> payload is <code>UPLOAD_STARTED</code> or
   *   <code>DOWNLOAD_COMPLETED</code>.</small>
   * @param {String} transferInfo.name The data transfer name.
   * @param {Number} transferInfo.size The data transfer data object size.
   * @param {String} transferInfo.dataType The data transfer session type.
   *   [Rel: Skylink.DATA_TRANSFER_SESSION_TYPE]
   * @param {String} transferInfo.chunkType The data transfer type of data chunk being used to send to Peer for transfers.
   *   <small>For <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a> data transfers, the
   *   initial data chunks value may change depending on the currently received data chunk type or the
   *   agent supported sending type of data chunks.</small>
   *   <small>For <a href="#method_sendURLData"><code>sendURLData()</code> method</a> data transfers, it is
   *   <code>STRING</code> always.</small>
   *   [Rel: Skylink.DATA_TRANSFER_DATA_TYPE]
   * @param {String} [transferInfo.mimeType] The data transfer data object MIME type.
   *   <small>Defined only when <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a>
   *   data object sent MIME type information is defined.</small>
   * @param {Number} transferInfo.chunkSize The data transfer data chunk size.
   * @param {Number} transferInfo.percentage The data transfer percentage of completion progress.
   * @param {Number} transferInfo.timeout The flag if data transfer is targeted or not, basing
   *   off the <code>targetPeerId</code> parameter being defined in
   *   <a href="#method_sendURLData"><code>sendURLData()</code> method</a> or
   *   <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a>.
   * @param {Boolean} transferInfo.isPrivate The flag if message is targeted or not, basing
   *   off the <code>targetPeerId</code> parameter being defined in
   *   <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a> or
   *   <a href="#method_sendURLData"><code>sendURLData()</code> method</a>.
   * @param {String} transferInfo.direction The data transfer direction.
   *   [Rel: Skylink.DATA_TRANSFER_TYPE]
   * @param {JSON} [error] The error result.
   *   <small>Defined only when <code>state</code> payload is <code>ERROR</code>, <code>CANCEL</code>,
   *   <code>REJECTED</code>, <code>START_ERROR</code> or <code>USER_REJECTED</code>.</small>
   * @param {Error|String} error.message The error object.
   * @param {String} error.transferType The data transfer direction from where the error occurred.
   *   [Rel: Skylink.DATA_TRANSFER_TYPE]
   * @for Skylink
   * @since 0.4.1
   */
  dataTransferState: [],

  /**
   * Event triggered when a data streaming state has changed.
   * @event dataStreamState
   * @param {String} state The current data streaming state.
   *   [Rel: Skylink.DATA_STREAM_STATE]
   * @param {String} streamId The data streaming session ID.
   *   <small>Note that this is defined as <code>null</code> when <code>state</code> payload is <code>START_ERROR</code>.</small>
   * @param {String} peerId The Peer ID.
   *   <small>Note that this could be defined as <code>null</code> when <code>state</code> payload is
   *   <code>START_ERROR</code> and there is no Peers to start data streaming with.</small>
   * @param {JSON} streamInfo The data streaming information.
   * @param {Blob|String} [streamInfo.chunk] The data chunk received.
   *   <small>Defined only when <code>state</code> payload is <code>RECEIVED</code> or <code>SENT</code>.</small>
   * @param {Number} streamInfo.chunkSize The data streaming data chunk size received.
   * @param {String} streamInfo.chunkType The data streaming data chunk type received.
   *   <small>The initial data chunks value may change depending on the currently received data chunk type or the
   *   agent supported sending type of data chunks.</small>
   *   [Rel: Skylink.DATA_TRANSFER_DATA_TYPE]
   * @param {String} streamInfo.isStringStream The flag if data streaming data chunks are strings.
   * @param {Boolean} streamInfo.isPrivate The flag if data streaming is targeted or not, basing
   *   off the <code>targetPeerId</code> parameter being defined in
   *   <a href="#method_startStreamingData"><code>startStreamingData()</code> method</a>.
   * @param {String} streamInfo.senderPeerId The sender Peer ID.
   * @param {Error} [error] The error object.
   *   <small>Defined only when <code>state</code> payload is <code>ERROR</code> or <code>START_ERROR</code>,.</small>
   * @for Skylink
   * @since 0.6.18
   */
  dataStreamState: [],

  /**
   * Event triggered when Signaling server reaction state has changed.
   * @event systemAction
   * @param {String} action The current Signaling server reaction state.
   *   [Rel: Skylink.SYSTEM_ACTION]
   * @param {String} message The message.
   * @param {String} reason The Signaling server reaction state reason of action code.
   *   [Rel: Skylink.SYSTEM_ACTION_REASON]
   * @for Skylink
   * @since 0.5.1
   */
  systemAction: [],

  /**
   * Event triggered when a server Peer joins the room.
   * @event serverPeerJoined
   * @param {String} peerId The Peer ID.
   * @param {String} serverPeerType The server Peer type
   *   [Rel: Skylink.SERVER_PEER_TYPE]
   * @for Skylink
   * @since 0.6.1
   */
  serverPeerJoined: [],

  /**
   * Event triggered when a server Peer leaves the room.
   * @event serverPeerLeft
   * @param {String} peerId The Peer ID.
   * @param {String} serverPeerType The server Peer type
   *   [Rel: Skylink.SERVER_PEER_TYPE]
   * @for Skylink
   * @since 0.6.1
   */
  serverPeerLeft: [],

  /**
   * Event triggered when a server Peer connection has been refreshed.
   * @event serverPeerRestart
   * @param {String} peerId The Peer ID.
   * @param {String} serverPeerType The server Peer type
   *   [Rel: Skylink.SERVER_PEER_TYPE]
   * @for Skylink
   * @since 0.6.1
   */
  serverPeerRestart: [],

  /**
   * Event triggered when a Peer Stream streaming has stopped.
   * <small>Note that it may not be the currently sent Stream to User, and it also triggers
   * when User leaves the Room for any currently sent Stream to User from Peer.</small>
   * @event streamEnded
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @param {Boolean} isScreensharing The flag if Peer Stream is a screensharing Stream.
   * @param {String} streamId The Stream ID.
   * @for Skylink
   * @since 0.5.10
   */
  streamEnded: [],

  /**
   * Event triggered when Peer Stream audio or video tracks has been muted / unmuted.
   * @event streamMuted
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @param {Boolean} isScreensharing The flag if Peer Stream is a screensharing Stream.
   * @for Skylink
   * @since 0.6.1
   */
  streamMuted: [],

  /**
   * Event triggered when <a href="#method_getPeers"><code>getPeers()</code> method</a> retrieval state changes.
   * @event getPeersStateChange
   * @param {String} state The current <code>getPeers()</code> retrieval state.
   *   [Rel: Skylink.GET_PEERS_STATE]
   * @param {String} privilegedPeerId The User's privileged Peer ID.
   * @param {JSON} peerList The list of Peer IDs Rooms within the same App space.
   * @param {Array} peerList.#room The list of Peer IDs associated with the Room defined in <code>#room</code> property.
   * @for Skylink
   * @since 0.6.1
   */
  getPeersStateChange: [],

  /**
   * Event triggered when <a href="#method_introducePeer"><code>introducePeer()</code> method</a>
   * introduction request state changes.
   * @event introduceStateChange
   * @param {String} state The current <code>introducePeer()</code> introduction request state.
   *   [Rel: Skylink.INTRODUCE_STATE]
   * @param {String} privilegedPeerId The User's privileged Peer ID.
   * @param {String} sendingPeerId The Peer ID to be connected with <code>receivingPeerId</code>.
   * @param {String} receivingPeerId The Peer ID to be connected with <code>sendingPeerId</code>.
   * @param {String} [reason] The error object.
   *   <small>Defined only when <code>state</code> payload is <code>ERROR</code>.</small>
   * @for Skylink
   * @since 0.6.1
   */
  introduceStateChange: [],

  /**
   * Event triggered when recording session state has changed.
   * @event recordingState
   * @param {Number} state The current recording session state.
   *   [Rel: Skylink.RECORDING_STATE]
   * @param {String} recordingId The recording session ID.
   * @param {JSON} link The recording session mixin videos link in
   *   <a href="https://en.wikipedia.org/wiki/MPEG-4_Part_14">MP4</a> format.
   *   <small>Defined only when <code>state</code> payload is <code>LINK</code>.</small>
   * @param {String} link.#peerId The recording session recorded Peer only video associated
   *   with the Peer ID defined in <code>#peerId</code> property.
   *   <small>If <code>#peerId</code> value is <code>"mixin"</code>, it means that is the mixin
   *   video of all Peers in the Room.</small>
   * @param {Error|String} error The error object.
   *   <small>Defined only when <code>state</code> payload is <code>ERROR</code>.</small>
   * @beta
   * @for Skylink
   * @since 0.6.16
   */
  recordingState: [],

  /**
   * Event triggered when <a href="#method_getConnectionStatus"><code>getConnectionStatus()</code> method</a>
   * retrieval state changes.
   * @event getConnectionStatusStateChange
   * @param {Number} state The current <code>getConnectionStatus()</code> retrieval state.
   *   [Rel: Skylink.GET_CONNECTION_STATUS_STATE]
   * @param {String} peerId The Peer ID.
   * @param {JSON} [stats] The Peer connection current stats.
   *   <small>Defined only when <code>state</code> payload is <code>RETRIEVE_SUCCESS</code>.</small>
   * @param {JSON} stats.raw The Peer connection raw stats before parsing.
   * @param {JSON} stats.audio The Peer connection audio streaming stats.
   * @param {JSON} stats.audio.sending The Peer connection sending audio streaming stats.
   * @param {Number} stats.audio.sending.bytes The Peer connection current sending audio streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.audio.sending.totalBytes The Peer connection total sending audio streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.audio.sending.packets The Peer connection current sending audio streaming packets.
   * @param {Number} stats.audio.sending.totalPackets The Peer connection total sending audio streaming packets.
   * @param {Number} stats.audio.sending.packetsLost <blockquote class="info">
   *   This property has been deprecated and would be removed in future releases
   *   as it should not be in <code>sending</code> property.
   *   </blockquote> The Peer connection current sending audio streaming packets lost.
   * @param {Number} stats.audio.sending.totalPacketsLost <blockquote class="info">
   *   This property has been deprecated and would be removed in future releases
   *   as it should not be in <code>sending</code> property.
   *   </blockquote> The Peer connection total sending audio streaming packets lost.
   * @param {Number} stats.audio.sending.ssrc The Peer connection sending audio streaming RTP packets SSRC.
   * @param {Number} stats.audio.sending.rtt The Peer connection sending audio streaming RTT (Round-trip delay time).
   *   <small>Defined as <code>0</code> if it's not present in original raw stats before parsing.</small>
   * @param {Number} stats.audio.sending.jitter <blockquote class="info">
   *   This property has been deprecated and would be removed in future releases
   *   as it should not be in <code>sending</code> property.
   *   </blockquote> The Peer connection sending audio streaming RTP packets jitter in seconds.
   *   <small>Defined as <code>0</code> if it's not present in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.sending.jitterBufferMs] <blockquote class="info">
   *   This property has been deprecated and would be removed in future releases
   *   as it should not be in <code>sending</code> property.
   *   </blockquote> The Peer connection sending audio streaming
   *   RTP packets jitter buffer in miliseconds.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} [stats.audio.sending.codec] The Peer connection sending audio streaming selected codec information.
   *   <small>Defined as <code>null</code> if local session description is not available before parsing.</small>
   * @param {String} stats.audio.sending.codec.name The Peer connection sending audio streaming selected codec name.
   * @param {Number} stats.audio.sending.codec.payloadType The Peer connection sending audio streaming selected codec payload type.
   * @param {String} [stats.audio.sending.codec.implementation] The Peer connection sending audio streaming selected codec implementation.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.sending.codec.channels] The Peer connection sending audio streaming selected codec channels (2 for stereo).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing,
   *   and this is usually present in <code>stats.audio</code> property.</small>
   * @param {Number} [stats.audio.sending.codec.clockRate] The Peer connection sending audio streaming selected codec media sampling rate.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.audio.sending.codec.params] The Peer connection sending audio streaming selected codec parameters.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.sending.inputLevel] The Peer connection sending audio streaming input level.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.sending.echoReturnLoss] The Peer connection sending audio streaming echo return loss in db (decibels).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.sending.echoReturnLossEnhancement] The Peer connection sending audio streaming
   *   echo return loss enhancement db (decibels).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.audio.receiving The Peer connection receiving audio streaming stats.
   * @param {Number} stats.audio.receiving.bytes The Peer connection current sending audio streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.audio.receiving.totalBytes The Peer connection total sending audio streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.audio.receiving.packets The Peer connection current receiving audio streaming packets.
   * @param {Number} stats.audio.receiving.totalPackets The Peer connection total receiving audio streaming packets.
   * @param {Number} stats.audio.receiving.packetsLost The Peer connection current receiving audio streaming packets lost.
   * @param {Number} stats.audio.receiving.fractionLost The Peer connection current receiving audio streaming fraction packets lost.
   * @param {Number} stats.audio.receiving.packetsDiscarded The Peer connection current receiving audio streaming packets discarded.
   * @param {Number} stats.audio.receiving.totalPacketsLost The Peer connection total receiving audio streaming packets lost.
   * @param {Number} stats.audio.receiving.totalPacketsDiscarded The Peer connection total receiving audio streaming packets discarded.
   * @param {Number} stats.audio.receiving.ssrc The Peer connection receiving audio streaming RTP packets SSRC.
   * @param {Number} stats.audio.receiving.jitter The Peer connection receiving audio streaming RTP packets jitter in seconds.
   *   <small>Defined as <code>0</code> if it's not present in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.receiving.jitterBufferMs] The Peer connection receiving audio streaming
   *   RTP packets jitter buffer in miliseconds.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} [stats.audio.receiving.codec] The Peer connection receiving audio streaming selected codec information.
   *   <small>Defined as <code>null</code> if remote session description is not available before parsing.</small>
   *   <small>Note that if the value is polyfilled, the value may not be accurate since the remote Peer can override the selected codec.
   *   The value is derived from the remote session description.</small>
   * @param {String} stats.audio.receiving.codec.name The Peer connection receiving audio streaming selected codec name.
   * @param {Number} stats.audio.receiving.codec.payloadType The Peer connection receiving audio streaming selected codec payload type.
   * @param {String} [stats.audio.receiving.codec.implementation] The Peer connection receiving audio streaming selected codec implementation.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.receiving.codec.channels] The Peer connection receiving audio streaming selected codec channels (2 for stereo).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing,
   *   and this is usually present in <code>stats.audio</code> property.</small>
   * @param {Number} [stats.audio.receiving.codec.clockRate] The Peer connection receiving audio streaming selected codec media sampling rate.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.audio.receiving.codec.params] The Peer connection receiving audio streaming selected codec parameters.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.receiving.outputLevel] The Peer connection receiving audio streaming output level.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.video The Peer connection video streaming stats.
   * @param {JSON} stats.video.sending The Peer connection sending video streaming stats.
   * @param {Number} stats.video.sending.bytes The Peer connection current sending video streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.video.sending.totalBytes The Peer connection total sending video streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.video.sending.packets The Peer connection current sending video streaming packets.
   * @param {Number} stats.video.sending.totalPackets The Peer connection total sending video streaming packets.
   * @param {Number} stats.video.sending.packetsLost <blockquote class="info">
   *   This property has been deprecated and would be removed in future releases
   *   as it should not be in <code>sending</code> property.
   *   </blockquote> The Peer connection current sending video streaming packets lost.
   * @param {Number} stats.video.sending.totalPacketsLost <blockquote class="info">
   *   This property has been deprecated and would be removed in future releases
   *   as it should not be in <code>sending</code> property.
   *   </blockquote> The Peer connection total sending video streaming packets lost.
   * @param {Number} stats.video.sending.ssrc The Peer connection sending video streaming RTP packets SSRC.
   * @param {Number} stats.video.sending.rtt The Peer connection sending video streaming RTT (Round-trip delay time).
   *   <small>Defined as <code>0</code> if it's not present in original raw stats before parsing.</small>
   * @param {Number} stats.video.sending.jitter <blockquote class="info">
   *   This property has been deprecated and would be removed in future releases
   *   as it should not be in <code>sending</code> property.
   *   </blockquote> The Peer connection sending video streaming RTP packets jitter in seconds.
   *   <small>Defined as <code>0</code> if it's not present in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.jitterBufferMs] <blockquote class="info">
   *   This property has been deprecated and would be removed in future releases
   *   as it should not be in <code>sending</code> property.
   *   </blockquote> The Peer connection sending video streaming RTP packets jitter buffer in miliseconds.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.qpSum] The Peer connection sending video streaming sum of the QP values of frames passed.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} [stats.video.sending.codec] The Peer connection sending video streaming selected codec information.
   *   <small>Defined as <code>null</code> if local session description is not available before parsing.</small>
   * @param {String} stats.video.sending.codec.name The Peer connection sending video streaming selected codec name.
   * @param {Number} stats.video.sending.codec.payloadType The Peer connection sending video streaming selected codec payload type.
   * @param {String} [stats.video.sending.codec.implementation] The Peer connection sending video streaming selected codec implementation.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.codec.channels] The Peer connection sending video streaming selected codec channels (2 for stereo).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing,
   *   and this is usually present in <code>stats.audio</code> property.</small>
   * @param {Number} [stats.video.sending.codec.clockRate] The Peer connection sending video streaming selected codec media sampling rate.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.video.sending.codec.params] The Peer connection sending video streaming selected codec parameters.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.frames] The Peer connection sending video streaming frames.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.frameRateInput] The Peer connection sending video streaming fps input.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.frameRateInput] The Peer connection sending video streaming fps input.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.framesDropped] The Peer connection sending video streaming frames dropped.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.frameRateMean] The Peer connection sending video streaming fps mean.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.frameRateStdDev] The Peer connection sending video streaming fps standard deviation.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.framesPerSecond] The Peer connection sending video streaming fps.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.framesDecoded] The Peer connection sending video streaming frames decoded.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.framesCorrupted] The Peer connection sending video streaming frames corrupted.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.totalFrames] The Peer connection total sending video streaming frames.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.nacks] The Peer connection current sending video streaming nacks.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.totalNacks] The Peer connection total sending video streaming nacks.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.plis] The Peer connection current sending video streaming plis.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.totalPlis] The Peer connection total sending video streaming plis.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.firs] The Peer connection current sending video streaming firs.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.totalFirs] The Peer connection total sending video streaming firs.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.slis] The Peer connection current sending video streaming slis.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.totalSlis] The Peer connection total sending video streaming slis.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.video.receiving The Peer connection receiving video streaming stats.
   * @param {Number} stats.video.receiving.bytes The Peer connection current receiving video streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.video.receiving.totalBytes The Peer connection total receiving video streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.video.receiving.packets The Peer connection current receiving video streaming packets.
   * @param {Number} stats.video.receiving.totalPackets The Peer connection total receiving video streaming packets.
   * @param {Number} stats.video.receiving.packetsLost The Peer connection current receiving video streaming packets lost.
   * @param {Number} stats.video.receiving.fractionLost The Peer connection current receiving video streaming fraction packets lost.
   * @param {Number} stats.video.receiving.packetsDiscarded The Peer connection current receiving video streaming packets discarded.
   * @param {Number} stats.video.receiving.totalPacketsLost The Peer connection total receiving video streaming packets lost.
   * @param {Number} stats.video.receiving.totalPacketsDiscarded The Peer connection total receiving video streaming packets discarded.
   * @param {Number} stats.video.receiving.ssrc The Peer connection receiving video streaming RTP packets SSRC.
   * @param {Number} [stats.video.receiving.e2eDelay] The Peer connection receiving video streaming e2e delay.
   *   <small>Defined as <code>null</code> if it's not present in original raw stats before parsing, and that
   *   it finds any existing audio, video or object (plugin) DOM elements that has set with the
   *   Peer remote stream object to parse current time. Note that <code>document.getElementsByTagName</code> function
   *   and DOM <code>.currentTime</code> has to be supported inorder for data to be parsed correctly.</small>
   * @param {Number} stats.video.receiving.jitter The Peer connection receiving video streaming RTP packets jitter in seconds.
   *   <small>Defined as <code>0</code> if it's not present in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.jitterBufferMs] The Peer connection receiving video streaming
   *   RTP packets jitter buffer in miliseconds.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} [stats.video.receiving.codec] The Peer connection receiving video streaming selected codec information.
   *   <small>Defined as <code>null</code> if remote session description is not available before parsing.</small>
   *   <small>Note that if the value is polyfilled, the value may not be accurate since the remote Peer can override the selected codec.
   *   The value is derived from the remote session description.</small>
   * @param {String} stats.video.receiving.codec.name The Peer connection receiving video streaming selected codec name.
   * @param {Number} stats.video.receiving.codec.payloadType The Peer connection receiving video streaming selected codec payload type.
   * @param {String} [stats.video.receiving.codec.implementation] The Peer connection receiving video streaming selected codec implementation.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.codec.channels] The Peer connection receiving video streaming selected codec channels (2 for stereo).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing,
   *   and this is usually present in <code>stats.audio</code> property.</small>
   * @param {Number} [stats.video.receiving.codec.clockRate] The Peer connection receiving video streaming selected codec media sampling rate.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.video.receiving.codec.params] The Peer connection receiving video streaming selected codec parameters.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.frames] The Peer connection receiving video streaming frames.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.framesOutput] The Peer connection receiving video streaming fps output.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.framesDecoded] The Peer connection receiving video streaming frames decoded.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.frameRateMean] The Peer connection receiving video streaming fps mean.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.frameRateStdDev] The Peer connection receiving video streaming fps standard deviation.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.framesPerSecond] The Peer connection receiving video streaming fps.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.framesDecoded] The Peer connection receiving video streaming frames decoded.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.framesCorrupted] The Peer connection receiving video streaming frames corrupted.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.totalFrames] The Peer connection total receiving video streaming frames.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.nacks] The Peer connection current receiving video streaming nacks.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.totalNacks] The Peer connection total receiving video streaming nacks.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.plis] The Peer connection current receiving video streaming plis.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.totalPlis] The Peer connection total receiving video streaming plis.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.firs] The Peer connection current receiving video streaming firs.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.totalFirs] The Peer connection total receiving video streaming firs.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.slis] The Peer connection current receiving video streaming slis.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.totalPlis] The Peer connection total receiving video streaming slis.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.selectedCandidate The Peer connection selected ICE candidate pair stats.
   * @param {JSON} stats.selectedCandidate.local The Peer connection selected local ICE candidate.
   * @param {String} stats.selectedCandidate.local.ipAddress The Peer connection selected
   *   local ICE candidate IP address.
   * @param {Number} stats.selectedCandidate.local.portNumber The Peer connection selected
   *   local ICE candidate port number.
   * @param {String} stats.selectedCandidate.local.transport The Peer connection selected
   *   local ICE candidate IP transport type.
   * @param {String} stats.selectedCandidate.local.candidateType The Peer connection selected
   *   local ICE candidate type.
   * @param {String} [stats.selectedCandidate.local.turnMediaTransport] The Peer connection possible
   *   transport used when relaying local media to TURN server.
   *   <small>Types are <code>"UDP"</code> (UDP connections), <code>"TCP"</code> (TCP connections) and
   *   <code>"TCP/TLS"</code> (TCP over TLS connections).</small>
   * @param {JSON} stats.selectedCandidate.remote The Peer connection selected remote ICE candidate.
   * @param {String} stats.selectedCandidate.remote.ipAddress The Peer connection selected
   *   remote ICE candidate IP address.
   * @param {Number} stats.selectedCandidate.remote.portNumber The Peer connection selected
   *   remote ICE candidate port number.
   * @param {String} stats.selectedCandidate.remote.transport The Peer connection selected
   *   remote ICE candidate IP transport type.
   * @param {String} stats.selectedCandidate.remote.candidateType The Peer connection selected
   *   remote ICE candidate type.
   * @param {Boolean} [stats.selectedCandidate.writable] The flag if Peer has gotten ACK to an ICE request.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Boolean} [stats.selectedCandidate.readable] The flag if Peer has gotten a valid incoming ICE request.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.rtt] The current STUN connectivity checks RTT (Round-trip delay time).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.totalRtt] The total STUN connectivity checks RTT (Round-trip delay time).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.selectedCandidate.requests The ICE connectivity check requests.
   * @param {String} [stats.selectedCandidate.requests.received] The current ICE connectivity check requests received.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.requests.sent] The current ICE connectivity check requests sent.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.requests.totalReceived] The total ICE connectivity check requests received.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.requests.totalSent] The total ICE connectivity check requests sent.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.selectedCandidate.responses The ICE connectivity check responses.
   * @param {String} [stats.selectedCandidate.responses.received] The current ICE connectivity check responses received.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.responses.sent] The current ICE connectivity check responses sent.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.responses.totalReceived] The total ICE connectivity check responses received.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.responses.totalSent] The total ICE connectivity check responses sent.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.selectedCandidate.consentRequests The current ICE consent requests.
   * @param {String} [stats.selectedCandidate.consentRequests.received] The current ICE consent requests received.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.consentRequests.sent] The current ICE consent requests sent.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.consentRequests.totalReceived] The total ICE consent requests received.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.consentRequests.totalSent] The total ICE consent requests sent.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.selectedCandidate.consentResponses The current ICE consent responses.
   * @param {String} [stats.selectedCandidate.consentResponses.received] The current ICE consent responses received.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.consentResponses.sent] The current ICE consent responses sent.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.consentResponses.totalReceived] The total ICE consent responses received.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.selectedCandidate.consentResponses.totalSent] The total ICE consent responses sent.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.certificate The Peer connection DTLS/SRTP exchanged certificates information.
   * @param {JSON} stats.certificate.local The Peer connection local certificate information.
   * @param {String} [stats.certificate.local.fingerprint] The Peer connection local certificate fingerprint.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.certificate.local.fingerprintAlgorithm] The Peer connection local
   *   certificate fingerprint algorithm.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.certificate.local.derBase64] The Peer connection local
   *   base64 certificate in binary DER format encoded in base64.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.certificate.remote The Peer connection remote certificate information.
   * @param {String} [stats.certificate.remote.fingerprint] The Peer connection remote certificate fingerprint.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.certificate.remote.fingerprintAlgorithm] The Peer connection remote
   *   certificate fingerprint algorithm.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.certificate.remote.derBase64] The Peer connection remote
   *   base64 certificate in binary DER format encoded in base64.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.certificate.srtpCipher] The certificates SRTP cipher.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.certificate.dtlsCipher] The certificates DTLS cipher.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.connection The Peer connection object stats.
   * @param {String} stats.connection.iceConnectionState The Peer connection ICE connection state.
   * @param {String} stats.connection.iceGatheringState The Peer connection ICE gathering state.
   * @param {String} stats.connection.signalingState The Peer connection signaling state.
   * @param {JSON} stats.connection.localDescription The Peer connection local session description.
   * @param {String} stats.connection.localDescription.type The Peer connection local session description type.
   *   <small>Defined as <code>null</code> when local session description is not available.</small>
   * @param {String} stats.connection.localDescription.sdp The Peer connection local session description SDP.
   *   <small>Defined as <code>null</code> when local session description is not available.</small>
   * @param {JSON} stats.connection.remoteDescription The Peer connection remote session description.
   * @param {String} stats.connection.remoteDescription.type The Peer connection remote session description type.
   *   <small>Defined as <code>null</code> when remote session description is not available.</small>
   * @param {String} stats.connection.remoteDescription.sdp The Peer connection remote session description sdp.
   *   <small>Defined as <code>null</code> when remote session description is not available.</small>
   * @param {JSON} stats.connection.candidates The Peer connection list of ICE candidates sent or received.
   * @param {JSON} stats.connection.candidates.sending The Peer connection list of local ICE candidates sent.
   * @param {Array} stats.connection.candidates.sending.host The Peer connection list of local
   *   <code>"host"</code> (local network) ICE candidates sent.
   * @param {JSON} stats.connection.candidates.sending.host.#index The Peer connection local
   *   <code>"host"</code> (local network) ICE candidate.
   * @param {String} stats.connection.candidates.sending.host.#index.candidate The Peer connection local
   *   <code>"host"</code> (local network) ICE candidate connection description.
   * @param {String} stats.connection.candidates.sending.host.#index.sdpMid The Peer connection local
   *   <code>"host"</code> (local network) ICE candidate identifier based on the local session description.
   * @param {Number} stats.connection.candidates.sending.host.#index.sdpMLineIndex The Peer connection local
   *   <code>"host"</code> (local network) ICE candidate media description index (starting from <code>0</code>)
   *   based on the local session description.
   * @param {Array} stats.connection.candidates.sending.srflx The Peer connection list of local
   *   <code>"srflx"</code> (STUN) ICE candidates sent.
   * @param {JSON} stats.connection.candidates.sending.srflx.#index The Peer connection local
   *   <code>"srflx"</code> (STUN) ICE candidate.
   * @param {String} stats.connection.candidates.sending.srflx.#index.candidate The Peer connection local
   *   <code>"srflx"</code> (STUN) ICE candidate connection description.
   * @param {String} stats.connection.candidates.sending.srflx.#index.sdpMid The Peer connection local
   *   <code>"srflx"</code> (STUN) ICE candidate identifier based on the local session description.
   * @param {Number} stats.connection.candidates.sending.srflx.#index.sdpMLineIndex The Peer connection local
   *   <code>"srflx"</code> (STUN) ICE candidate media description index (starting from <code>0</code>)
   *   based on the local session description.
   * @param {Array} stats.connection.candidates.sending.relay The Peer connection list of local
   *   <code>"relay"</code> (TURN) candidates sent.
   * @param {JSON} stats.connection.candidates.sending.relay.#index The Peer connection local
   *   <code>"relay"</code> (TURN) ICE candidate.
   * @param {String} stats.connection.candidates.sending.relay.#index.candidate The Peer connection local
   *   <code>"relay"</code> (TURN) ICE candidate connection description.
   * @param {String} stats.connection.candidates.sending.relay.#index.sdpMid The Peer connection local
   *   <code>"relay"</code> (TURN) ICE candidate identifier based on the local session description.
   * @param {Number} stats.connection.candidates.sending.relay.#index.sdpMLineIndex The Peer connection local
   *   <code>"relay"</code> (TURN) ICE candidate media description index (starting from <code>0</code>)
   *   based on the local session description.
   * @param {JSON} stats.connection.candidates.receiving The Peer connection list of remote ICE candidates received.
   * @param {Array} stats.connection.candidates.receiving.host The Peer connection list of remote
   *   <code>"host"</code> (local network) ICE candidates received.
   * @param {JSON} stats.connection.candidates.receiving.host.#index The Peer connection remote
   *   <code>"host"</code> (local network) ICE candidate.
   * @param {String} stats.connection.candidates.receiving.host.#index.candidate The Peer connection remote
   *   <code>"host"</code> (local network) ICE candidate connection description.
   * @param {String} stats.connection.candidates.receiving.host.#index.sdpMid The Peer connection remote
   *   <code>"host"</code> (local network) ICE candidate identifier based on the remote session description.
   * @param {Number} stats.connection.candidates.receiving.host.#index.sdpMLineIndex The Peer connection remote
   *   <code>"host"</code> (local network) ICE candidate media description index (starting from <code>0</code>)
   *   based on the remote session description.
   * @param {Array} stats.connection.candidates.receiving.srflx The Peer connection list of remote
   *   <code>"srflx"</code> (STUN) ICE candidates received.
   * @param {JSON} stats.connection.candidates.receiving.srflx.#index The Peer connection remote
   *   <code>"srflx"</code> (STUN) ICE candidate.
   * @param {String} stats.connection.candidates.receiving.srflx.#index.candidate The Peer connection remote
   *   <code>"srflx"</code> (STUN) ICE candidate connection description.
   * @param {String} stats.connection.candidates.receiving.srflx.#index.sdpMid The Peer connection remote
   *   <code>"srflx"</code> (STUN) ICE candidate identifier based on the remote session description.
   * @param {Number} stats.connection.candidates.receiving.srflx.#index.sdpMLineIndex The Peer connection remote
   *   <code>"srflx"</code> (STUN) ICE candidate media description index (starting from <code>0</code>)
   *   based on the remote session description.
   * @param {Array} stats.connection.candidates.receiving.relay The Peer connection list of remote
   *   <code>"relay"</code> (TURN) ICE candidates received.
   * @param {JSON} stats.connection.candidates.receiving.relay.#index The Peer connection remote
   *   <code>"relay"</code> (TURN) ICE candidate.
   * @param {String} stats.connection.candidates.receiving.relay.#index.candidate The Peer connection remote
   *   <code>"relay"</code> (TURN) ICE candidate connection description.
   * @param {String} stats.connection.candidates.receiving.relay.#index.sdpMid The Peer connection remote
   *   <code>"relay"</code> (TURN) ICE candidate identifier based on the remote session description.
   * @param {Number} stats.connection.candidates.receiving.relay.#index.sdpMLineIndex The Peer connection remote
   *   <code>"relay"</code> (TURN) ICE candidate media description index (starting from <code>0</code>)
   *   based on the remote session description.
   * @param {JSON} stats.connection.dataChannels The Peer connection list of Datachannel connections.
   * @param {JSON} stats.connection.dataChannels.#channelName The Peer connection Datachannel connection stats.
   * @param {String} stats.connection.dataChannels.#channelName.label The Peer connection Datachannel connection ID.
   * @param {String} stats.connection.dataChannels.#channelName.readyState The Peer connection Datachannel connection readyState.
   *   [Rel: Skylink.DATA_CHANNEL_STATE]
   * @param {String} stats.connection.dataChannels.#channelName.type The Peer connection Datachannel connection type.
   *   [Rel: Skylink.DATA_CHANNEL_TYPE]
   * @param {String} stats.connection.dataChannels.#channelName.currentTransferId The Peer connection
   *   Datachannel connection current progressing transfer session ID.
   *   <small>Defined as <code>null</code> when there is currently no transfer session progressing on the Datachannel connection.</small>
   * @param {Error} error The error object received.
   *   <small>Defined only when <code>state</code> payload is <code>RETRIEVE_ERROR</code>.</small>
   * @for Skylink
   * @since 0.6.14
   */
  getConnectionStatusStateChange: [],

  /**
   * Event triggered when <a href="#method_muteStream"><code>muteStream()</code> method</a> changes
   * User Streams audio and video tracks muted status.
   * @event localMediaMuted
   * @param {JSON} mediaStatus The Streams muted settings.
   *   <small>This indicates the muted settings for both
   *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
   *   <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>.</small>
   * @param {Boolean} mediaStatus.audioMuted The flag if all Streams audio tracks is muted or not.
   *   <small>If User's <code>peerInfo.settings.audio</code> is false, this will be defined as <code>true</code>.</small>
   * @param {Boolean} mediaStatus.videoMuted The flag if all Streams video tracks is muted or not.
   *   <small>If User's <code>peerInfo.settings.video</code> is false, this will be defined as <code>true</code>.</small>
   * @for Skylink
   * @since 0.6.15
   */
  localMediaMuted: [],

  /**
   * <blockquote class="info">
   *   Learn more about how ICE works in this
   *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.<br>
   *   Note that this event may not be triggered for MCU enabled Peer connections as ICE candidates
   *   may be received in the session description instead.
   * </blockquote>
   * Event triggered when remote ICE candidate processing state has changed when Peer is using trickle ICE.
   * @event candidateProcessingState
   * @param {String} state The ICE candidate processing state.
   *   [Rel: Skylink.CANDIDATE_PROCESSING_STATE]
   * @param {String} peerId The Peer ID.
   * @param {String} candidateId The remote ICE candidate session ID.
   *   <small>Note that this value is not related to WebRTC API but for identification of remote ICE candidate received.</small>
   * @param {String} candidateType The remote ICE candidate type.
   *   <small>Expected values are <code>"host"</code> (local network), <code>"srflx"</code> (STUN) and <code>"relay"</code> (TURN).</small>
   * @param {JSON} candidate The remote ICE candidate.
   * @param {String} candidate.candidate The remote ICE candidate connection description.
   * @param {String} candidate.sdpMid The remote ICE candidate identifier based on the remote session description.
   * @param {Number} candidate.sdpMLineIndex The remote ICE candidate media description index
   *   (starting from <code>0</code>) based on the remote session description.
   * @param {Error} [error] The error object.
   *   <small>Defined only when <code>state</code> is <code>DROPPED</code> or <code>PROCESS_ERROR</code>.</small>
   * @for Skylink
   * @since 0.6.16
   */
  candidateProcessingState: [],

  /**
   * <blockquote class="info">
   *   Learn more about how ICE works in this
   *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.<br>
   *   Note that this event may not be triggered for MCU enabled Peer connections as ICE candidates
   *   may be received in the session description instead.
   * </blockquote>
   * Event triggered when all remote ICE candidates gathering has completed and been processed.
   * @event candidatesGathered
   * @param {String} peerId The Peer ID.
   * @param {JSON} length The remote ICE candidates length.
   * @param {Number} length.expected The expected total number of remote ICE candidates to be received.
   * @param {Number} length.received The actual total number of remote ICE candidates received.
   * @param {Number} length.processed The total number of remote ICE candidates processed.
   * @for Skylink
   * @since 0.6.18
   */
  candidatesGathered: []
};
// Object.keys() polyfill - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
!function(){Object.keys||(Object.keys=function(){var t=Object.prototype.hasOwnProperty,r=!{toString:null}.propertyIsEnumerable("toString"),e=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],o=e.length;return function(n){if("object"!=typeof n&&"function"!=typeof n||null===n)throw new TypeError("Object.keys called on non-object");var c=[];for(var l in n)t.call(n,l)&&c.push(l);if(r)for(var p=0;o>p;p++)t.call(n,e[p])&&c.push(e[p]);return c}}())}();
// Date.getISOString() polyfill - https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
!function(){function t(t){return 10>t?"0"+t:t}Date.prototype.toISOString=function(){return this.getUTCFullYear()+"-"+t(this.getUTCMonth()+1)+"-"+t(this.getUTCDate())+"T"+t(this.getUTCHours())+":"+t(this.getUTCMinutes())+":"+t(this.getUTCSeconds())+"."+(this.getUTCMilliseconds()/1e3).toFixed(3).slice(2,5)+"Z"}}();
// Date.now() polyfill
!function(){"function"!=typeof Date.now&&(Date.now=function(){return(new Date).getTime()})}();
// addEventListener() polyfill - https://gist.github.com/eirikbacker/2864711
!function(e,t){function n(e){var n=t[e];t[e]=function(e){return o(n(e))}}function a(t,n,a){return(a=this).attachEvent("on"+t,function(t){var t=t||e.event;t.preventDefault=t.preventDefault||function(){t.returnValue=!1},t.stopPropagation=t.stopPropagation||function(){t.cancelBubble=!0},n.call(a,t)})}function o(e,t){if(t=e.length)for(;t--;)e[t].addEventListener=a;else e.addEventListener=a;return e}e.addEventListener||(o([t,e]),"Element"in e?e.Element.prototype.addEventListener=a:(t.attachEvent("onreadystatechange",function(){o(t.all)}),n("getElementsByTagName"),n("getElementById"),n("createElement"),o(t.all)))}(window,document);
// Promise polyfill - https://github.com/stefanpenner/es6-promise
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):t.ES6Promise=e()}(this,function(){"use strict";function t(t){return"function"==typeof t||"object"==typeof t&&null!==t}function e(t){return"function"==typeof t}function n(t){I=t}function r(t){J=t}function o(){return function(){return process.nextTick(a)}}function i(){return"undefined"!=typeof H?function(){H(a)}:c()}function s(){var t=0,e=new V(a),n=document.createTextNode("");return e.observe(n,{characterData:!0}),function(){n.data=t=++t%2}}function u(){var t=new MessageChannel;return t.port1.onmessage=a,function(){return t.port2.postMessage(0)}}function c(){var t=setTimeout;return function(){return t(a,1)}}function a(){for(var t=0;t<G;t+=2){var e=$[t],n=$[t+1];e(n),$[t]=void 0,$[t+1]=void 0}G=0}function f(){try{var t=require,e=t("vertx");return H=e.runOnLoop||e.runOnContext,i()}catch(n){return c()}}function l(t,e){var n=arguments,r=this,o=new this.constructor(p);void 0===o[et]&&k(o);var i=r._state;return i?!function(){var t=n[i-1];J(function(){return x(i,o,t,r._result)})}():E(r,o,t,e),o}function h(t){var e=this;if(t&&"object"==typeof t&&t.constructor===e)return t;var n=new e(p);return g(n,t),n}function p(){}function v(){return new TypeError("You cannot resolve a promise with itself")}function d(){return new TypeError("A promises callback cannot return that same promise.")}function _(t){try{return t.then}catch(e){return it.error=e,it}}function y(t,e,n,r){try{t.call(e,n,r)}catch(o){return o}}function m(t,e,n){J(function(t){var r=!1,o=y(n,e,function(n){r||(r=!0,e!==n?g(t,n):S(t,n))},function(e){r||(r=!0,j(t,e))},"Settle: "+(t._label||" unknown promise"));!r&&o&&(r=!0,j(t,o))},t)}function b(t,e){e._state===rt?S(t,e._result):e._state===ot?j(t,e._result):E(e,void 0,function(e){return g(t,e)},function(e){return j(t,e)})}function w(t,n,r){n.constructor===t.constructor&&r===l&&n.constructor.resolve===h?b(t,n):r===it?j(t,it.error):void 0===r?S(t,n):e(r)?m(t,n,r):S(t,n)}function g(e,n){e===n?j(e,v()):t(n)?w(e,n,_(n)):S(e,n)}function A(t){t._onerror&&t._onerror(t._result),T(t)}function S(t,e){t._state===nt&&(t._result=e,t._state=rt,0!==t._subscribers.length&&J(T,t))}function j(t,e){t._state===nt&&(t._state=ot,t._result=e,J(A,t))}function E(t,e,n,r){var o=t._subscribers,i=o.length;t._onerror=null,o[i]=e,o[i+rt]=n,o[i+ot]=r,0===i&&t._state&&J(T,t)}function T(t){var e=t._subscribers,n=t._state;if(0!==e.length){for(var r=void 0,o=void 0,i=t._result,s=0;s<e.length;s+=3)r=e[s],o=e[s+n],r?x(n,r,o,i):o(i);t._subscribers.length=0}}function M(){this.error=null}function P(t,e){try{return t(e)}catch(n){return st.error=n,st}}function x(t,n,r,o){var i=e(r),s=void 0,u=void 0,c=void 0,a=void 0;if(i){if(s=P(r,o),s===st?(a=!0,u=s.error,s=null):c=!0,n===s)return void j(n,d())}else s=o,c=!0;n._state!==nt||(i&&c?g(n,s):a?j(n,u):t===rt?S(n,s):t===ot&&j(n,s))}function C(t,e){try{e(function(e){g(t,e)},function(e){j(t,e)})}catch(n){j(t,n)}}function O(){return ut++}function k(t){t[et]=ut++,t._state=void 0,t._result=void 0,t._subscribers=[]}function Y(t,e){this._instanceConstructor=t,this.promise=new t(p),this.promise[et]||k(this.promise),B(e)?(this._input=e,this.length=e.length,this._remaining=e.length,this._result=new Array(this.length),0===this.length?S(this.promise,this._result):(this.length=this.length||0,this._enumerate(),0===this._remaining&&S(this.promise,this._result))):j(this.promise,q())}function q(){return new Error("Array Methods must be provided an Array")}function F(t){return new Y(this,t).promise}function D(t){var e=this;return new e(B(t)?function(n,r){for(var o=t.length,i=0;i<o;i++)e.resolve(t[i]).then(n,r)}:function(t,e){return e(new TypeError("You must pass an array to race."))})}function K(t){var e=this,n=new e(p);return j(n,t),n}function L(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}function N(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}function U(t){this[et]=O(),this._result=this._state=void 0,this._subscribers=[],p!==t&&("function"!=typeof t&&L(),this instanceof U?C(this,t):N())}function W(){var t=void 0;if("undefined"!=typeof global)t=global;else if("undefined"!=typeof self)t=self;else try{t=Function("return this")()}catch(e){throw new Error("polyfill failed because global object is unavailable in this environment")}var n=t.Promise;if(n){var r=null;try{r=Object.prototype.toString.call(n.resolve())}catch(e){}if("[object Promise]"===r&&!n.cast)return}t.Promise=U}var z=void 0;z=Array.isArray?Array.isArray:function(t){return"[object Array]"===Object.prototype.toString.call(t)};var B=z,G=0,H=void 0,I=void 0,J=function(t,e){$[G]=t,$[G+1]=e,G+=2,2===G&&(I?I(a):tt())},Q="undefined"!=typeof window?window:void 0,R=Q||{},V=R.MutationObserver||R.WebKitMutationObserver,X="undefined"==typeof self&&"undefined"!=typeof process&&"[object process]"==={}.toString.call(process),Z="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel,$=new Array(1e3),tt=void 0;tt=X?o():V?s():Z?u():void 0===Q&&"function"==typeof require?f():c();var et=Math.random().toString(36).substring(16),nt=void 0,rt=1,ot=2,it=new M,st=new M,ut=0;return Y.prototype._enumerate=function(){for(var t=this.length,e=this._input,n=0;this._state===nt&&n<t;n++)this._eachEntry(e[n],n)},Y.prototype._eachEntry=function(t,e){var n=this._instanceConstructor,r=n.resolve;if(r===h){var o=_(t);if(o===l&&t._state!==nt)this._settledAt(t._state,e,t._result);else if("function"!=typeof o)this._remaining--,this._result[e]=t;else if(n===U){var i=new n(p);w(i,t,o),this._willSettleAt(i,e)}else this._willSettleAt(new n(function(e){return e(t)}),e)}else this._willSettleAt(r(t),e)},Y.prototype._settledAt=function(t,e,n){var r=this.promise;r._state===nt&&(this._remaining--,t===ot?j(r,n):this._result[e]=n),0===this._remaining&&S(r,this._result)},Y.prototype._willSettleAt=function(t,e){var n=this;E(t,void 0,function(t){return n._settledAt(rt,e,t)},function(t){return n._settledAt(ot,e,t)})},U.all=F,U.race=D,U.resolve=h,U.reject=K,U._setScheduler=n,U._setAsap=r,U._asap=J,U.prototype={constructor:U,then:l,"catch":function(t){return this.then(null,t)}},U.polyfill=W,U.Promise=U,U});
/* jshint ignore:end */

// Exports Skylink & SkylinkLogs object
if(typeof exports !== 'undefined') {
  module.exports = {
  	Skylink: Skylink,
  	SkylinkLogs: SkylinkLogs
  };
} else if (globals) {
  globals.Skylink = Skylink;
  globals.SkylinkLogs = SkylinkLogs;
} else if (window) {
  window.Skylink = Skylink;
  window.SkylinkLogs = SkylinkLogs;
}
function LogFactory (instanceLabel) {
  var logger = {
    header: 'SkylinkJS',
    level: Skylink.prototype.LOG_LEVEL.ERROR,
    trace: false,
    storeLogs: false,
    printTimeStamp: false,
    printInstanceLabel: false,
    instanceLabel: instanceLabel
  };

  /**
   * - Function that handles the log message.
   */
  var fn = function (prop, message, obj) {
    var output = '';
    var printOutput = '';
    var timestamp = (new Date());

    if (Array.isArray(message)) {
      output += message[0] ? ' [' + message[0] + '] -' : ' -';
      output += message[1] ? ' <<' + message[1] + '>>' : '';
      output += message[2] ? '(' + message[2] + ')' : '';
      output += ' ' + message[3];
    } else {
      output += ' - ' + message;
    }

    // Output for printing is different from the output stored in the logs array
    printOutput = (logger.printTimeStamp ? '[' + timestamp.toISOString() + '] ' : '') +
      logger.header + (logger.printInstanceLabel ? ' :: ' + logger.instanceLabel : '') + output;
    output = logger.header + output;

    // Store the log message
    if (logger.storeLogs) {
      LogStorageFactory.push(timestamp, prop, output, obj || null, logger.instanceLabel);
    }

    if (logger.level >= Skylink.prototype.LOG_LEVEL[prop.toUpperCase()]) {
      var useProp = typeof console[prop] === 'undefined' ? 'log' : prop;
      useProp = logger.trace && typeof console.trace !== 'undefined' ? 'trace' : useProp;

      console[useProp]((useProp === 'trace' ? '[' + prop.toUpperCase() + ']' : '') +
        printOutput, typeof obj !== 'undefined' ? obj : '');
    }
  };

  return {
    /**
     * + Function that sets the debugging options.
     */
    setDebugMode: function (trace, storeLogs, printInstanceLabel, printTimeStamp) {
      logger.trace = trace === true;
      logger.storeLogs = storeLogs === true;
      logger.printInstanceLabel = printInstanceLabel === true;
      logger.printTimeStamp = printTimeStamp === true;
    },

    /**
     * + Function that sets the log level.
     */
    setLogLevel: function (level) {
      var hasSet = false;

      if (typeof level === 'number') {
        UtilsFactory.forEach(Skylink.prototype.LOG_LEVEL, function (opt, prop) {
          if (opt === level) {
            logger.level = level;
            hasSet = true;
          }
        });
      }

      if (!hasSet) {
        return new Error('Log level does not exist. Level is not set.');
      }
    },

    /**
     * + Function that prints the console.debug() level.
     */
    debug: function (message, obj) {
      fn('debug', message, obj);
    },

    /**
     * + Function that prints the console.log() level.
     */
    log: function (message, obj) {
      fn('log', message, obj);
    },

    /**
     * + Function that prints the console.info() level.
     */
    info: function (message, obj) {
      fn('info', message, obj);
    },

    /**
     * + Function that prints the console.warn() level.
     */
    warn: function (message, obj) {
      fn('warn', message, obj);
    },

    /**
     * + Function that prints the console.error() level.
     */
    error: function (message, obj) {
      fn('error', message, obj);
    }
  };
}
var LogStorageFactory = (function () {
  var storedLogs = {};

  return {
    /**
     * + Function that pushes log to storage.
     */
    push: function (timestamp, prop, output, obj, instanceLabel) {
      storedLogs[instanceLabel] = storedLogs[instanceLabel] || [];
      storedLogs[instanceLabel].push([timestamp, prop, output, obj || null, instanceLabel]);
    },

    /**
     * + Function loops for each logs.
     */
    loop: function (instanceLabel, level) {
      var output = [];
      var prop = null;

      if (typeof level === 'number') {
        UtilsFactory.forEach(Skylink.prototype.LOG_LEVEL, function (opt, cprop) {
          if (opt === level) {
            prop = cprop;
          }
        });
      }

      UtilsFactory.forEach(storedLogs, function (logs, clabel) {
        if (instanceLabel && typeof instanceLabel === 'string' ? instanceLabel === clabel : true) {
          UtilsFactory.forEach(logs, function (log) {
            if (prop ? (log[1] || '').toUpperCase() === prop : true) {
              output.push(log);
            }
          });
        }
      });

      return output;
    },

    /**
     * + Function that clears log.
     */
    clear: function (instanceLabel, level) {
      var prop = null;
      var fn = function (instanceLabel) {
        if (!Array.isArray(storedLogs[instanceLabel])) {
          return;
        }

        for (var i = 0; i < storedLogs[instanceLabel].length; i++) {
          if (prop ? (storedLogs[instanceLabel][i][1] || '').toUpperCase() === prop : true) {
            storedLogs[instanceLabel].splice(i, 1);
            i--;
          }
        }
      };

      if (typeof level === 'number') {
        UtilsFactory.forEach(Skylink.prototype.LOG_LEVEL, function (opt, cprop) {
          if (opt === level) {
            prop = cprop;
          }
        });
      }

      if (instanceLabel && typeof instanceLabel === 'string') {
        fn(instanceLabel);
      } else {
        UtilsFactory.forEach(storedLogs, function (logs, clabel) {
          fn(clabel);
        });
      }
    }
  };
})();

var UtilsFactory = {
  /**
   * + Function that clones an object.
   */
  clone: function (obj) {
    if (!(obj && typeof obj === 'object')) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.concat([]);
    }

    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      var fn = function (item) {
        if (Array.isArray(item)) {
          return item.concat([]);
        } else if (!(item && typeof item === 'object')) {
          return item;
        }
        var copy = {};
        UtilsFactory.forEach(item, function (opt, prop) {
          copy[prop] = fn(opt);
        });
        return copy;
      };
      return fn(obj);
    }
  },

  /**
   * + Function that loops an object.
   */
  forEach: function (obj, fn) {
    if (Array.isArray(obj)) {
      if (typeof obj.forEach === 'function') {
        obj.UtilsFactory.forEach(fn);
      } else {
        for (var i = 0; i < obj.length; i++) {
          fn(obj[i], i);
        }
      }
    } else if (obj && typeof obj === 'object') {
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          fn(obj[prop], prop);
        }
      }
    }
  }
};
Skylink.prototype._onIceCandidate = function(targetMid, candidate) {
  var self = this;
  var pc = self._peerConnections[targetMid];

  if (!pc) {
    self._log.warn([targetMid, 'RTCIceCandidate', null, 'Ignoring of ICE candidate event as ' +
      'Peer connection does not exists ->'], candidate);
    return;
  }

  if (candidate.candidate) {
    if (!pc.gathering) {
      self._log.log([targetMid, 'RTCIceCandidate', null, 'ICE gathering has started.']);

      pc.gathering = true;
      pc.gathered = false;

      self._trigger('candidateGenerationState', self.CANDIDATE_GENERATION_STATE.GATHERING, targetMid);
    }

    var candidateType = candidate.candidate.split(' ')[7];

    self._log.debug([targetMid, 'RTCIceCandidate', candidateType, 'Generated ICE candidate ->'], candidate);

    if (candidateType === 'endOfCandidates') {
      self._log.warn([targetMid, 'RTCIceCandidate', candidateType, 'Dropping of sending ICE candidate ' +
        'end-of-candidates signal to prevent errors ->'], candidate);
      return;
    }

    if (self._filterCandidatesType[candidateType]) {
      if (!(self._hasMCU && self._forceTURN)) {
        self._log.warn([targetMid, 'RTCIceCandidate', candidateType, 'Dropping of sending ICE candidate as ' +
          'it matches ICE candidate filtering flag ->'], candidate);
        return;
      }

      self._log.warn([targetMid, 'RTCIceCandidate', candidateType, 'Not dropping of sending ICE candidate as ' +
        'TURN connections are enforced as MCU is present (and act as a TURN itself) so filtering of ICE candidate ' +
        'flags are not honoured ->'], candidate);
    }

    if (!self._gatheredCandidates[targetMid]) {
      self._gatheredCandidates[targetMid] = {
        sending: { host: [], srflx: [], relay: [] },
        receiving: { host: [], srflx: [], relay: [] }
      };
    }

    self._gatheredCandidates[targetMid].sending[candidateType].push({
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex,
      candidate: candidate.candidate
    });

    if (!self._enableIceTrickle) {
      self._log.warn([targetMid, 'RTCIceCandidate', candidateType, 'Dropping of sending ICE candidate as ' +
        'trickle ICE is disabled ->'], candidate);
      return;
    }

    self._log.debug([targetMid, 'RTCIceCandidate', candidateType, 'Sending ICE candidate ->'], candidate);

    self._sendChannelMessage({
      type: self._SIG_MESSAGE_TYPE.CANDIDATE,
      label: candidate.sdpMLineIndex,
      id: candidate.sdpMid,
      candidate: candidate.candidate,
      mid: self._user.sid,
      target: targetMid,
      rid: self._room.id
    });

  } else {
    self._log.log([targetMid, 'RTCIceCandidate', null, 'ICE gathering has completed.']);

    pc.gathering = false;
    pc.gathered = true;

    self._trigger('candidateGenerationState', self.CANDIDATE_GENERATION_STATE.COMPLETED, targetMid);

    // Disable Ice trickle option
    if (!self._enableIceTrickle) {
      var sessionDescription = self._peerConnections[targetMid].localDescription;

      if (!(sessionDescription && sessionDescription.type && sessionDescription.sdp)) {
        self._log.warn([targetMid, 'RTCSessionDescription', null, 'Not sending any session description after ' +
          'ICE gathering completed as it is not present.']);
        return;
      }

      // a=end-of-candidates should present in non-trickle ICE connections so no need to send endOfCandidates message
      self._sendChannelMessage({
        type: sessionDescription.type,
        sdp: self._addSDPMediaStreamTrackIDs(targetMid, sessionDescription),
        mid: self._user.sid,
        userInfo: self._getUserInfo(),
        target: targetMid,
        rid: self._room.id
      });
    } else if (self._gatheredCandidates[targetMid]) {
      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.END_OF_CANDIDATES,
        noOfExpectedCandidates: self._gatheredCandidates[targetMid].sending.srflx.length +
          self._gatheredCandidates[targetMid].sending.host.length +
          self._gatheredCandidates[targetMid].sending.relay.length,
        mid: self._user.sid,
        target: targetMid,
        rid: self._room.id
      });
    }
  }
};

/**
 * Function that buffers the Peer connection ICE candidate when received
 *   before remote session description is received and set.
 * @method _addIceCandidateToQueue
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._addIceCandidateToQueue = function(targetMid, canId, candidate) {
  var candidateType = candidate.candidate.split(' ')[7];

  this._log.debug([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Buffering ICE candidate.']);

  this._trigger('candidateProcessingState', this.CANDIDATE_PROCESSING_STATE.BUFFERED,
    targetMid, canId, candidateType, {
    candidate: candidate.candidate,
    sdpMid: candidate.sdpMid,
    sdpMLineIndex: candidate.sdpMLineIndex
  }, null);

  this._peerCandidatesQueue[targetMid] = this._peerCandidatesQueue[targetMid] || [];
  this._peerCandidatesQueue[targetMid].push([canId, candidate]);
};

/**
 * Function that adds all the Peer connection buffered ICE candidates received.
 * This should be called only after the remote session description is received and set.
 * @method _addIceCandidateFromQueue
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._addIceCandidateFromQueue = function(targetMid) {
  this._peerCandidatesQueue[targetMid] = this._peerCandidatesQueue[targetMid] || [];

  for (var i = 0; i < this._peerCandidatesQueue[targetMid].length; i++) {
    var canArray = this._peerCandidatesQueue[targetMid][i];

    if (canArray) {
      var candidateType = canArray[1].candidate.split(' ')[7];

      this._log.debug([targetMid, 'RTCIceCandidate', canArray[0] + ':' + candidateType, 'Adding buffered ICE candidate.']);

      this._addIceCandidate(targetMid, canArray[0], canArray[1]);
    } else if (this._peerConnections[targetMid] &&
      this._peerConnections[targetMid].signalingState !== this.PEER_CONNECTION_STATE.CLOSED) {
      this._log.debug([targetMid, 'RTCPeerConnection', null, 'Signaling of end-of-candidates remote ICE gathering.']);
      this._peerConnections[targetMid].addIceCandidate(null);
    }
  }

  delete this._peerCandidatesQueue[targetMid];

  this._signalingEndOfCandidates(targetMid);
};

/**
 * Function that adds the ICE candidate to Peer connection.
 * @method _addIceCandidate
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._addIceCandidate = function (targetMid, canId, candidate) {
  var self = this;
  var candidateType = candidate.candidate.split(' ')[7];

  var onSuccessCbFn = function () {
    self._log.log([targetMid, 'RTCIceCandidate', canId + ':' + candidateType,
      'Added ICE candidate successfully.']);
    self._trigger('candidateProcessingState', self.CANDIDATE_PROCESSING_STATE.PROCESS_SUCCESS,
      targetMid, canId, candidateType, {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex
    }, null);
  };

  var onErrorCbFn = function (error) {
    self._log.error([targetMid, 'RTCIceCandidate', canId + ':' + candidateType,
      'Failed adding ICE candidate ->'], error);
    self._trigger('candidateProcessingState', self.CANDIDATE_PROCESSING_STATE.PROCESS_ERROR,
      targetMid, canId, candidateType, {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex
    }, error);
  };

  self._log.debug([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Adding ICE candidate.']);

  self._trigger('candidateProcessingState', self.CANDIDATE_PROCESSING_STATE.PROCESSING,
    targetMid, canId, candidateType, {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex
    }, null);

  if (!(self._peerConnections[targetMid] &&
    self._peerConnections[targetMid].signalingState !== self.PEER_CONNECTION_STATE.CLOSED)) {
    self._log.warn([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Dropping ICE candidate ' +
      'as Peer connection does not exists or is closed']);
    self._trigger('candidateProcessingState', self.CANDIDATE_PROCESSING_STATE.DROPPED,
      targetMid, canId, candidateType, {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex
    }, new Error('Failed processing ICE candidate as Peer connection does not exists or is closed.'));
    return;
  }

  self._peerConnections[targetMid].addIceCandidate(candidate, onSuccessCbFn, onErrorCbFn);
};
Skylink.prototype._setIceServers = function(givenConfig) {
  var self = this;
  var givenIceServers = UtilsFactory.clone(givenConfig.iceServers);
  var iceServersList = {};
  var newIceServers = [];
  // TURN SSL config
  var useTURNSSLProtocol = false;
  var useTURNSSLPort = false;



  if (self._forceTURNSSL) {
    if (window.webrtcDetectedBrowser === 'chrome' ||
      window.webrtcDetectedBrowser === 'safari' ||
      window.webrtcDetectedBrowser === 'IE') {
      useTURNSSLProtocol = true;
    } else {
      useTURNSSLPort = true;
    }
  }

  self._log.log('TURN server connections SSL configuration', {
    useTURNSSLProtocol: useTURNSSLProtocol,
    useTURNSSLPort: useTURNSSLPort
  });

  var pushIceServer = function (username, credential, url, index) {
    if (!iceServersList[username]) {
      iceServersList[username] = {};
    }

    if (!iceServersList[username][credential]) {
      iceServersList[username][credential] = [];
    }

    if (self._turnServer && url.indexOf('temasys') > 0) {
      var parts = url.split(':');
      var subparts = (parts[1] || '').split('?');
      subparts[0] = self._turnServer;
      parts[1] = subparts.join('?');
      url = parts.join(':');
    }

    if (iceServersList[username][credential].indexOf(url) === -1) {
      if (typeof index === 'number') {
        iceServersList[username][credential].splice(index, 0, url);
      } else {
        iceServersList[username][credential].push(url);
      }
    }
  };

  var i, serverItem;

  for (i = 0; i < givenIceServers.length; i++) {
    var server = givenIceServers[i];

    if (typeof server.url !== 'string') {
      self._log.warn('Ignoring ICE server provided at index ' + i, UtilsFactory.clone(server));
      continue;
    }

    if (server.url.indexOf('stun') === 0) {
      if (!self._enableSTUN) {
        self._log.warn('Ignoring STUN server provided at index ' + i, UtilsFactory.clone(server));
        continue;
      }

      if (!self._usePublicSTUN && server.url.indexOf('temasys') === -1) {
        self._log.warn('Ignoring public STUN server provided at index ' + i, UtilsFactory.clone(server));
        continue;
      }

    } else if (server.url.indexOf('turn') === 0) {
      if (!self._enableTURN) {
        self._log.warn('Ignoring TURN server provided at index ' + i, UtilsFactory.clone(server));
        continue;
      }

      if (server.url.indexOf(':443') === -1 && useTURNSSLPort) {
        self._log.log('Ignoring TURN Server (non-SSL port) provided at index ' + i, UtilsFactory.clone(server));
        continue;
      }

      if (useTURNSSLProtocol) {
        var parts = server.url.split(':');
        parts[0] = 'turns';
        server.url = parts.join(':');
      }
    }

    // parse "@" settings
    if (server.url.indexOf('@') > 0) {
      var protocolParts = server.url.split(':');
      var urlParts = protocolParts[1].split('@');
      server.username = urlParts[0];
      server.url = protocolParts[0] + ':' + urlParts[1];

      // add the ICE server port
      // Edge uses 3478 with ?transport=udp for now
      if (window.webrtcDetectedBrowser === 'edge') {
        server.url += ':3478';
      } else if (protocolParts[2]) {
        server.url += ':' + protocolParts[2];
      }
    }

    var username = typeof server.username === 'string' ? server.username : 'none';
    var credential = typeof server.credential === 'string' ? server.credential : 'none';

    if (server.url.indexOf('turn') === 0) {
      if (self._TURNTransport === self.TURN_TRANSPORT.ANY) {
        pushIceServer(username, credential, server.url);

      } else {
        var rawUrl = server.url;

        if (rawUrl.indexOf('?transport=') > 0) {
          rawUrl = rawUrl.split('?transport=')[0];
        }

        if (self._TURNTransport === self.TURN_TRANSPORT.NONE) {
          pushIceServer(username, credential, rawUrl);
        } else if (self._TURNTransport === self.TURN_TRANSPORT.UDP) {
          pushIceServer(username, credential, rawUrl + '?transport=udp');
        } else if (self._TURNTransport === self.TURN_TRANSPORT.TCP) {
          pushIceServer(username, credential, rawUrl + '?transport=tcp');
        } else if (self._TURNTransport === self.TURN_TRANSPORT.ALL) {
          pushIceServer(username, credential, rawUrl + '?transport=tcp');
          pushIceServer(username, credential, rawUrl + '?transport=udp');
        } else {
          self._log.warn('Invalid TURN transport option "' + self._TURNTransport +
            '". Ignoring TURN server at index' + i, UtilsFactory.clone(server));
          continue;
        }
      }
    } else {
      pushIceServer(username, credential, server.url);
    }
  }

  // add mozilla STUN for firefox
  if (self._enableSTUN && self._usePublicSTUN && window.webrtcDetectedBrowser === 'firefox') {
    pushIceServer('none', 'none', 'stun:stun.services.mozilla.com', 0);
  }

  var hasUrlsSupport = false;

  if (window.webrtcDetectedBrowser === 'chrome' && window.webrtcDetectedVersion > 34) {
    hasUrlsSupport = true;
  }

  if (window.webrtcDetectedBrowser === 'firefox' && window.webrtcDetectedVersion > 38) {
    hasUrlsSupport = true;
  }

  if (window.webrtcDetectedBrowser === 'opera' && window.webrtcDetectedVersion > 31) {
    hasUrlsSupport = true;
  }

  // plugin supports .urls
  if (window.webrtcDetectedBrowser === 'safari' || window.webrtcDetectedBrowser === 'IE') {
    hasUrlsSupport = true;
  }

  // bowser / edge
  if (['bowser', 'edge'].indexOf(window.webrtcDetectedBrowser) > -1) {
    hasUrlsSupport = true;
  }

  for (var serverUsername in iceServersList) {
    if (iceServersList.hasOwnProperty(serverUsername)) {
      for (var serverCred in iceServersList[serverUsername]) {
        if (iceServersList[serverUsername].hasOwnProperty(serverCred)) {
          if (hasUrlsSupport) {
            var urlsItem = {
              urls: iceServersList[serverUsername][serverCred]
            };
            if (serverUsername !== 'none') {
              urlsItem.username = serverUsername;
            }
            if (serverCred !== 'none') {
              urlsItem.credential = serverCred;
            }

            // Edge uses 1 url only for now
            if (window.webrtcDetectedBrowser === 'edge') {
              if (urlsItem.username && urlsItem.credential) {
                urlsItem.urls = [urlsItem.urls[0]];
                newIceServers.push(urlsItem);
                break;
              }
            } else {
              newIceServers.push(urlsItem);
            }
          } else {
            for (var j = 0; j < iceServersList[serverUsername][serverCred].length; j++) {
              var urlItem = {
                url: iceServersList[serverUsername][serverCred][j]
              };
              if (serverUsername !== 'none') {
                urlItem.username = serverUsername;
              }
              if (serverCred !== 'none') {
                urlItem.credential = serverCred;
              }
              newIceServers.push(urlItem);
            }
          }
        }
      }
    }
  }

  self._log.log('Output iceServers configuration:', newIceServers);

  return {
    iceServers: newIceServers
  };
};
Skylink.prototype._refreshPeerConnection = function(listOfPeers, doIceRestart, callback) {
  var self = this;
  var listOfPeerRestarts = [];
  var error = '';
  var listOfPeerRestartErrors = {};

  // To fix jshint dont put functions within a loop
  var refreshSinglePeerCallback = function (peerId) {
    return function (error) {
      if (listOfPeerRestarts.indexOf(peerId) === -1) {
        if (error) {
          self._log.error([peerId, 'RTCPeerConnection', null, 'Failed restarting for peer'], error);
          listOfPeerRestartErrors[peerId] = error;
        }
        listOfPeerRestarts.push(peerId);
      }

      if (listOfPeerRestarts.length === listOfPeers.length) {
        if (typeof callback === 'function') {
          self._log.log([null, 'PeerConnection', null, 'Invoked all peers to restart. Firing callback']);

          if (Object.keys(listOfPeerRestartErrors).length > 0) {
            callback({
              refreshErrors: listOfPeerRestartErrors,
              listOfPeers: listOfPeers
            }, null);
          } else {
            callback(null, {
              listOfPeers: listOfPeers
            });
          }
        }
      }
    };
  };

  var refreshSinglePeer = function(peerId, peerCallback){
    if (!self._peerConnections[peerId]) {
      error = 'There is currently no existing peer connection made ' +
        'with the peer. Unable to restart connection';
      self._log.error([peerId, null, null, error]);
      peerCallback(error);
      return;
    }

    self._log.log([peerId, 'PeerConnection', null, 'Restarting peer connection']);

    // do a hard reset on variable object
    self._restartPeerConnection(peerId, doIceRestart, peerCallback);
  };

  if(!self._hasMCU) {
    var i;

    for (i = 0; i < listOfPeers.length; i++) {
      var peerId = listOfPeers[i];

      if (Object.keys(self._peerConnections).indexOf(peerId) > -1) {
        refreshSinglePeer(peerId, refreshSinglePeerCallback(peerId));
      } else {
        error = 'Peer connection with peer does not exists. Unable to restart';
        self._log.error([peerId, 'PeerConnection', null, error]);
        refreshSinglePeerCallback(peerId)(error);
      }
    }
  } else {
    self._restartMCUConnection(callback, doIceRestart);
  }
};

/**
 * Function that retrieves Peer connection stats.
 * @method _retrieveStats
 * @private
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype._retrieveStats = function (peerId, callback) {
  var self = this;

  self._log.debug([peerId, 'RTCStatsReport', null, 'Retrieivng connection status']);

  var pc = self._peerConnections[peerId];
  var result = {
    raw: null,
    connection: {
      iceConnectionState: pc.iceConnectionState,
      iceGatheringState: pc.iceGatheringState,
      signalingState: pc.signalingState,
      remoteDescription: {
        type: pc.remoteDescription ? pc.remoteDescription.type || null : null,
        sdp : pc.remoteDescription ? pc.remoteDescription.sdp || null : null
      },
      localDescription: {
        type: pc.localDescription ? pc.localDescription.type || null : null,
        sdp : pc.localDescription ? pc.localDescription.sdp || null : null
      },
      candidates: UtilsFactory.clone(self._gatheredCandidates[peerId] || {
        sending: { host: [], srflx: [], relay: [] },
        receiving: { host: [], srflx: [], relay: [] }
      }),
      dataChannels: {}
    },
    audio: {
      sending: {
        ssrc: null,
        bytes: 0,
        packets: 0,
        // Should not be for sending?
        packetsLost: 0,
        rtt: 0,
        // Should not be for sending?
        jitter: 0,
        // Should not be for sending?
        jitterBufferMs: null,
        codec: self._getSDPSelectedCodec(peerId, pc.remoteDescription, 'audio'),
        nacks: null,
        inputLevel: null,
        echoReturnLoss: null,
        echoReturnLossEnhancement: null,
        totalBytes: 0,
        totalPackets: 0,
        totalPacketsLost: 0,
        totalNacks: null
      },
      receiving: {
        ssrc: null,
        bytes: 0,
        packets: 0,
        packetsLost: 0,
        packetsDiscarded: 0,
        fractionLost: 0,
        nacks: null,
        jitter: 0,
        jitterBufferMs: null,
        codec: self._getSDPSelectedCodec(peerId, pc.remoteDescription, 'audio'),
        outputLevel: null,
        totalBytes: 0,
        totalPackets: 0,
        totalPacketsLost: 0,
        totalNacks: null
      }
    },
    video: {
      sending: {
        ssrc: null,
        bytes: 0,
        packets: 0,
        // Should not be for sending?
        packetsLost: 0,
        rtt: 0,
        // Should not be for sending?
        jitter: 0,
        // Should not be for sending?
        jitterBufferMs: null,
        codec: self._getSDPSelectedCodec(peerId, pc.remoteDescription, 'video'),
        frameWidth: null,
        frameHeight: null,
        framesDecoded: null,
        framesCorrupted: null,
        framesDropped: null,
        framesPerSecond: null,
        framesInput: null,
        frames: null,
        frameRateEncoded: null,
        frameRate: null,
        frameRateInput: null,
        frameRateMean: null,
        frameRateStdDev: null,
        nacks: null,
        plis: null,
        firs: null,
        slis: null,
        qpSum: null,
        totalBytes: 0,
        totalPackets: 0,
        totalPacketsLost: 0,
        totalNacks: null,
        totalPlis: null,
        totalFirs: null,
        totalSlis: null,
        totalFrames: null
      },
      receiving: {
        ssrc: null,
        bytes: 0,
        packets: 0,
        packetsDiscarded: 0,
        packetsLost: 0,
        fractionLost: 0,
        jitter: 0,
        jitterBufferMs: null,
        codec: self._getSDPSelectedCodec(peerId, pc.remoteDescription, 'video'),
        frameWidth: null,
        frameHeight: null,
        framesDecoded: null,
        framesCorrupted: null,
        framesPerSecond: null,
        framesDropped: null,
        framesOutput: null,
        frames: null,
        frameRateMean: null,
        frameRateStdDev: null,
        nacks: null,
        plis: null,
        firs: null,
        slis: null,
        e2eDelay: null,
        totalBytes: 0,
        totalPackets: 0,
        totalPacketsLost: 0,
        totalNacks: null,
        totalPlis: null,
        totalFirs: null,
        totalSlis: null,
        totalFrames: null
      }
    },
    selectedCandidate: {
      local: {
        ipAddress: null,
        candidateType: null,
        portNumber: null,
        transport: null, 
        turnMediaTransport: null
      },
      remote: {
        ipAddress: null,
        candidateType: null,
        portNumber: null,
        transport: null
      },
      consentResponses: {
        received: null,
        sent: null,
        totalReceived: null,
        totalSent: null
      },
      consentRequests: {
        received: null,
        sent: null,
        totalReceived: null,
        totalSent: null
      },
      responses: {
        received: null,
        sent: null,
        totalReceived: null,
        totalSent: null
      },
      requests: {
        received: null,
        sent: null,
        totalReceived: null,
        totalSent: null
      }
    },
    certificate: {
      local: self._getSDPFingerprint(peerId, pc.localDescription),
      remote: self._getSDPFingerprint(peerId, pc.remoteDescription),
      dtlsCipher: null,
      srtpCipher: null
    }
  };

  for (var channelProp in self._dataChannels[peerId]) {
    if (self._dataChannels[peerId].hasOwnProperty(channelProp) && self._dataChannels[peerId][channelProp]) {
      result.connection.dataChannels[self._dataChannels[peerId][channelProp].channel.label] = {
        label: self._dataChannels[peerId][channelProp].channel.label,
        readyState: self._dataChannels[peerId][channelProp].channel.readyState,
        channelType: channelProp === 'main' ? self.DATA_CHANNEL_TYPE.MESSAGING : self.DATA_CHANNEL_TYPE.DATA,
        currentTransferId: self._dataChannels[peerId][channelProp].transferId || null
      };
    }
  }

  var loopFn = function (obj, fn) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop) && obj[prop]) {
        fn(obj[prop], prop);
      }
    }
  };

  var formatCandidateFn = function (candidateDirType, candidate) {
    result.selectedCandidate[candidateDirType].ipAddress = candidate.ipAddress;
    result.selectedCandidate[candidateDirType].candidateType = candidate.candidateType;
    result.selectedCandidate[candidateDirType].portNumber = typeof candidate.portNumber !== 'number' ?
      parseInt(candidate.portNumber, 10) || null : candidate.portNumber;
    result.selectedCandidate[candidateDirType].transport = candidate.transport;
  };

  pc.getStats(null, function (stats) {
    self._log.debug([peerId, 'RTCStatsReport', null, 'Retrieval success ->'], stats);

    result.raw = stats;

    if (window.webrtcDetectedBrowser === 'firefox') {
      loopFn(stats, function (obj, prop) {
        var dirType = '';

        // Receiving/Sending RTP packets
        if (prop.indexOf('inbound_rtp') === 0 || prop.indexOf('outbound_rtp') === 0) {
          dirType = prop.indexOf('inbound_rtp') === 0 ? 'receiving' : 'sending';

          if (!self._peerStats[peerId][prop]) {
            self._peerStats[peerId][prop] = obj;
          }

          result[obj.mediaType][dirType].bytes = self._parseConnectionStats(self._peerStats[peerId][prop],
            obj, dirType === 'receiving' ? 'bytesReceived' : 'bytesSent');
          result[obj.mediaType][dirType].totalBytes = parseInt(
            (dirType === 'receiving' ? obj.bytesReceived : obj.bytesSent) || '0', 10);
          result[obj.mediaType][dirType].packets = self._parseConnectionStats(self._peerStats[peerId][prop],
            obj, dirType === 'receiving' ? 'packetsReceived' : 'packetsSent');
          result[obj.mediaType][dirType].totalPackets = parseInt(
            (dirType === 'receiving' ? obj.packetsReceived : obj.packetsSent) || '0', 10);
          result[obj.mediaType][dirType].ssrc = obj.ssrc;
          
          if (obj.mediaType === 'video') {
            result.video[dirType].frameRateMean = obj.framerateMean || 0;
            result.video[dirType].frameRateStdDev = obj.framerateStdDev || 0;
            result.video[dirType].framesDropped = typeof obj.framesDropped === 'number' ? obj.framesDropped :
              (typeof obj.droppedFrames === 'number' ? obj.droppedFrames : null);
            result.video[dirType].framesCorrupted = typeof obj.framesCorrupted === 'number' ? obj.framesCorrupted : null;
            result.video[dirType].framesPerSecond = typeof obj.framesPerSecond === 'number' ? obj.framesPerSecond : null;

            if (dirType === 'sending') {
              result.video[dirType].framesEncoded = typeof obj.framesEncoded === 'number' ? obj.framesEncoded : null;
              result.video[dirType].frames = typeof obj.framesSent === 'number' ? obj.framesSent : null;
            } else {
              result.video[dirType].framesDecoded = typeof obj.framesDecoded === 'number' ? obj.framesDecoded : null;
              result.video[dirType].frames = typeof obj.framesReceived === 'number' ? obj.framesReceived : null;
            }
          }

          if (dirType === 'receiving') {
            obj.packetsDiscarded = (typeof obj.packetsDiscarded === 'number' ? obj.packetsDiscarded :
              obj.discardedPackets) || 0;
            obj.packetsLost = typeof obj.packetsLost === 'number' ? obj.packetsLost : 0;

            result[obj.mediaType].receiving.packetsLost = self._parseConnectionStats(self._peerStats[peerId][prop],
              obj, 'packetsLost');
            result[obj.mediaType].receiving.packetsDiscarded = self._parseConnectionStats(self._peerStats[peerId][prop],
              obj, 'packetsDiscarded');
            result[obj.mediaType].receiving.totalPacketsDiscarded = obj.packetsDiscarded;
            result[obj.mediaType].receiving.totalPacketsLost = obj.packetsLost;
          }

          self._peerStats[peerId][prop] = obj;

        // Sending RTP packets lost
        } else if (prop.indexOf('inbound_rtcp') === 0 || prop.indexOf('outbound_rtcp') === 0) {
          dirType = prop.indexOf('inbound_rtp') === 0 ? 'receiving' : 'sending';

          if (!self._peerStats[peerId][prop]) {
            self._peerStats[peerId][prop] = obj;
          }

          if (dirType === 'sending') {
            result[obj.mediaType].sending.rtt = obj.mozRtt || 0;
            result[obj.mediaType].sending.targetBitrate = typeof obj.targetBitrate === 'number' ? obj.targetBitrate : 0;
          } else {
            result[obj.mediaType].receiving.jitter = obj.jitter || 0;
          }

          self._peerStats[peerId][prop] = obj;

        // Candidates
        } else if (obj.nominated && obj.selected) {
          formatCandidateFn('remote', stats[obj.remoteCandidateId]);
          formatCandidateFn('local', stats[obj.localCandidateId]);
        }
      });

    } else if (window.webrtcDetectedBrowser === 'edge') {
      var tracks = [];

      if (pc.getRemoteStreams().length > 0) {
        tracks = tracks.concat(pc.getRemoteStreams()[0].getTracks());
      }

      if (pc.getLocalStreams().length > 0) {
        tracks = tracks.concat(pc.getLocalStreams()[0].getTracks());
      }

      loopFn(tracks, function (track) {
        loopFn(stats, function (obj, prop) {
          if (obj.type === 'track' && obj.trackIdentifier === track.id) {
            var dirType = obj.remoteSource ? 'receiving' : 'sending';
            var mediaType = track.kind;

            if (mediaType === 'audio') {
              result[mediaType][dirType][dirType === 'sending' ? 'inputLevel' : 'outputLevel'] = obj.audioLevel;
              if (dirType === 'sending') {
                result[mediaType][dirType].echoReturnLoss = obj.echoReturnLoss;
                result[mediaType][dirType].echoReturnLossEnhancement = obj.echoReturnLossEnhancement;
              }
            } else {
              result[mediaType][dirType].frames = self._parseConnectionStats(self._peerStats[peerId][subprop],
                streamObj,dirType === 'sending' ? obj.framesSent : obj.framesReceived);
              result[mediaType][dirType].framesDropped = obj.framesDropped;
              result[mediaType][dirType].framesDecoded = obj.framesDecoded;
              result[mediaType][dirType].framesCorrupted = obj.framesCorrupted;
              result[mediaType][dirType].framesPerSecond = obj.framesPerSecond;
              result[mediaType][dirType].frameHeight = obj.frameHeight || null;
              result[mediaType][dirType].frameWidth = obj.frameWidth || null;
              result[mediaType][dirType].totalFrames = dirType === 'sending' ? obj.framesSent : obj.framesReceived;
            }

            loopFn(stats, function (streamObj, subprop) {
              if (streamObj.mediaTrackId === obj.id && ['outboundrtp', 'inboundrtp'].indexOf(streamObj.type) > -1) {
                if (!self._peerStats[peerId][subprop]) {
                  self._peerStats[peerId][subprop] = streamObj;
                }

                result[mediaType][dirType].ssrc = parseInt(streamObj.ssrc || '0', 10);
                result[mediaType][dirType].nacks = self._parseConnectionStats(self._peerStats[peerId][subprop],
                  streamObj, 'nackCount');
                result[mediaType][dirType].totalNacks = streamObj.nackCount;

                if (mediaType === 'video') {
                  result[mediaType][dirType].firs = self._parseConnectionStats(self._peerStats[peerId][subprop],
                    streamObj, 'firCount');
                  result[mediaType][dirType].plis = self._parseConnectionStats(self._peerStats[peerId][subprop],
                    streamObj, 'pliCount');
                  result[mediaType][dirType].slis = self._parseConnectionStats(self._peerStats[peerId][subprop],
                    streamObj, 'sliCount');
                  result[mediaType][dirType].totalFirs = streamObj.firCount;
                  result[mediaType][dirType].totalPlis = streamObj.plisCount;
                  result[mediaType][dirType].totalSlis = streamObj.sliCount;
                }

                result[mediaType][dirType].bytes = self._parseConnectionStats(self._peerStats[peerId][subprop],
                  streamObj, dirType === 'receiving' ? 'bytesReceived' : 'bytesSent');
                result[mediaType][dirType].packets = self._parseConnectionStats(self._peerStats[peerId][subprop],
                  streamObj, dirType === 'receiving' ? 'packetsReceived' : 'packetsSent');

                result[mediaType][dirType].totalBytes = dirType === 'receiving' ? streamObj.bytesReceived : streamObj.bytesSent;
                result[mediaType][dirType].totalPackets = dirType === 'receiving' ? streamObj.packetsReceived : streamObj.packetsSent;

                if (dirType === 'receiving') {
                  result[mediaType][dirType].jitter = streamObj.jitter || 0;
                  result[mediaType].receiving.fractionLost = streamObj.fractionLost;
                  result[mediaType][dirType].packetsLost = self._parseConnectionStats(self._peerStats[peerId][subprop],
                    streamObj, 'packetsLost');
                  result[mediaType][dirType].packetsDiscarded = self._parseConnectionStats(self._peerStats[peerId][subprop],
                    streamObj, 'packetsDiscarded');
                  result[mediaType][dirType].totalPacketsLost = streamObj.packetsLost;
                  result[mediaType][dirType].totalPacketsDiscarded = streamObj.packetsDiscarded || 0;
                } else {
                  result[mediaType].sending.rtt = streamObj.roundTripTime || 0;
                  result[mediaType].sending.targetBitrate = streamObj.targetBitrate || 0;
                }

                if (result[mediaType][dirType].codec && streamObj.codecId) {
                  result[mediaType][dirType].codec.name = streamObj.codecId;
                }
              }
            });
          }
        });
      });

    } else {
      var reportedCandidate = false;
      var reportedCertificate = false;

      loopFn(stats, function (obj, prop) {
        if (prop.indexOf('ssrc_') === 0) {
          var dirType = prop.indexOf('_recv') > 0 ? 'receiving' : 'sending';

          // Polyfill fix for plugin. Plugin should fix this though
          if (!obj.mediaType) {
            obj.mediaType = obj.hasOwnProperty('audioOutputLevel') || obj.hasOwnProperty('audioInputLevel') ||
              obj.hasOwnProperty('googEchoCancellationReturnLoss') || obj.hasOwnProperty('googEchoCancellation') ?
              'audio' : 'video';
          }

          if (!self._peerStats[peerId][prop]) {
            self._peerStats[peerId][prop] = obj;
          }

          // Capture e2e delay
          try {
            if (obj.mediaType === 'video' && dirType === 'receiving') {
              var captureStartNtpTimeMs = parseInt(obj.googCaptureStartNtpTimeMs || '0', 10);

              if (captureStartNtpTimeMs > 0 && pc.getRemoteStreams().length > 0 && document &&
                typeof document.getElementsByTagName === 'function') {
                var streamId = pc.getRemoteStreams()[0].id || pc.getRemoteStreams()[0].label;
                var elements = [];

                if (self._isUsingPlugin) {
                  elements = document.getElementsByTagName('object');
                } else {
                  elements = document.getElementsByTagName('video');

                  if (elements.length === 0) {
                    elements = document.getElementsByTagName('audio');
                  }
                }

                for (var e = 0; e < elements.length; e++) {
                  var videoElmStreamId = null;

                  if (self._isUsingPlugin) {
                    if (!(elements[e].children && typeof elements[e].children === 'object' &&
                      typeof elements[e].children.length === 'number' && elements[e].children.length > 0)) {
                      break;
                    }

                    for (var ec = 0; ec < elements[e].children.length; ec++) {
                      if (elements[e].children[ec].name === 'streamId') {
                        videoElmStreamId = elements[e].children[ec].value || null;
                        break;
                      }
                    }

                  } else {
                    videoElmStreamId = elements[e].srcObject ? elements[e].srcObject.id ||
                      elements[e].srcObject.label : null;
                  }

                  if (videoElmStreamId && videoElmStreamId === streamId) {
                    result[obj.mediaType][dirType].e2eDelay = ((new Date()).getTime() + 2208988800000) -
                      captureStartNtpTimeMs - elements[e].currentTime * 1000;
                    break;
                  }
                }
              }
            }
          } catch (error) {
            self._log.warn([peerId, 'RTCStatsReport', null, 'Failed retrieving e2e delay ->'], error);
          }

          // Receiving/Sending RTP packets
          result[obj.mediaType][dirType].ssrc = parseInt(obj.ssrc || '0', 10);
          result[obj.mediaType][dirType].bytes = self._parseConnectionStats(self._peerStats[peerId][prop],
            obj, dirType === 'receiving' ? 'bytesReceived' : 'bytesSent');
          result[obj.mediaType][dirType].packets = self._parseConnectionStats(self._peerStats[peerId][prop],
            obj, dirType === 'receiving' ? 'packetsReceived' : 'packetsSent');
          result[obj.mediaType][dirType].nacks = self._parseConnectionStats(self._peerStats[peerId][prop],
            obj, dirType === 'receiving' ? 'googNacksReceived' : 'googNacksSent');
          result[obj.mediaType][dirType].totalPackets = parseInt((dirType === 'receiving' ? obj.packetsReceived :
            obj.packetsSent) || '0', 10);
          result[obj.mediaType][dirType].totalBytes = parseInt((dirType === 'receiving' ? obj.bytesReceived :
            obj.bytesSent) || '0', 10);
          result[obj.mediaType][dirType].totalNacks = parseInt((dirType === 'receiving' ? obj.googNacksReceived :
            obj.googNacksSent) || '0', 10);

          if (result[obj.mediaType][dirType].codec) {
            if (obj.googCodecName && obj.googCodecName !== 'unknown') {
              result[obj.mediaType][dirType].codec.name = obj.googCodecName;
            }
            if (obj.codecImplementationName && obj.codecImplementationName !== 'unknown') {
              result[obj.mediaType][dirType].codec.implementation = obj.codecImplementationName;
            }
          }

          if (dirType === 'sending') {
            // NOTE: Chrome sending audio does have it but plugin has..
            result[obj.mediaType].sending.rtt = parseFloat(obj.googRtt || '0', 10);
            result[obj.mediaType].sending.targetBitrate = obj.targetBitrate ? parseInt(obj.targetBitrate, 10) : null;
          } else {
            result[obj.mediaType].receiving.packetsLost = self._parseConnectionStats(self._peerStats[peerId][prop],
              obj, 'packetsLost');
            result[obj.mediaType].receiving.packetsDiscarded = self._parseConnectionStats(self._peerStats[peerId][prop],
              obj, 'packetsDiscarded');
            result[obj.mediaType].receiving.jitter = parseFloat(obj.googJitterReceived || '0', 10);
            result[obj.mediaType].receiving.jitterBufferMs = obj.googJitterBufferMs ? parseFloat(obj.googJitterBufferMs || '0', 10) : null;
            result[obj.mediaType].receiving.totalPacketsLost = parseInt(obj.packetsLost || '0', 10);
            result[obj.mediaType].receiving.totalPacketsDiscarded = parseInt(obj.packetsDiscarded || '0', 10);
          }

          if (obj.mediaType === 'video') {
            result.video[dirType].framesCorrupted = obj.framesCorrupted ? parseInt(obj.framesCorrupted, 10) : null;
            result.video[dirType].framesPerSecond = obj.framesPerSecond ? parseFloat(obj.framesPerSecond, 10) : null;
            result.video[dirType].framesDropped = obj.framesDropped ? parseInt(obj.framesDropped, 10) : null;
            
            if (dirType === 'sending') {
              result.video[dirType].frameWidth = obj.googFrameWidthSent ?
                parseInt(obj.googFrameWidthSent, 10) : null;
              result.video[dirType].frameHeight = obj.googFrameHeightSent ?
                parseInt(obj.googFrameHeightSent, 10) : null;
              result.video[dirType].plis = obj.googPlisSent ?
                self._parseConnectionStats(self._peerStats[peerId][prop], obj, 'googPlisSent') : null;
              result.video[dirType].firs = obj.googFirsSent ?
                self._parseConnectionStats(self._peerStats[peerId][prop], obj, 'googFirsSent') : null;
              result[obj.mediaType][dirType].totalPlis = obj.googPlisSent ? parseInt(obj.googPlisSent, 10) : null;
              result[obj.mediaType][dirType].totalFirs = obj.googFirsSent ? parseInt(obj.googFirsSent, 10) : null;
              result.video[dirType].framesEncoded = obj.framesEncoded ? parseInt(obj.framesEncoded, 10) : null;
              result.video[dirType].frameRateEncoded = obj.googFrameRateEncoded ?
                parseInt(obj.googFrameRateEncoded, 10) : null;
              result.video[dirType].frameRateInput = obj.googFrameRateInput ?
                parseInt(obj.googFrameRateInput, 10) : null;
              result.video[dirType].frameRate = obj.googFrameRateSent ?
                parseInt(obj.googFrameRateSent, 10) : null;
              result.video[dirType].qpSum = obj.qpSum ? parseInt(obj.qpSum, 10) : null;
              result.video[dirType].frames = obj.framesSent ?
                self._parseConnectionStats(self._peerStats[peerId][prop], obj, 'framesSent') : null;
              result.video[dirType].totalFrames = obj.framesSent ? parseInt(obj.framesSent, 10) : null;
            } else {
              result.video[dirType].frameWidth = obj.googFrameWidthReceived ?
                parseInt(obj.googFrameWidthReceived, 10) : null;
              result.video[dirType].frameHeight = obj.googFrameHeightReceived ?
                parseInt(obj.googFrameHeightReceived, 10) : null;
              result.video[dirType].plis = obj.googPlisReceived ?
                self._parseConnectionStats(self._peerStats[peerId][prop], obj, 'googPlisReceived') : null;
              result.video[dirType].firs = obj.googFirsReceived ?
                self._parseConnectionStats(self._peerStats[peerId][prop], obj, 'googFirsReceived') : null;
              result[obj.mediaType][dirType].totalPlis = obj.googPlisReceived ? parseInt(obj.googPlisReceived, 10) : null;
              result[obj.mediaType][dirType].totalFirs = obj.googFirsReceived ? parseInt(obj.googFirsReceived, 10) : null;
              result.video[dirType].framesDecoded = obj.framesDecoded ? parseInt(obj.framesDecoded, 10) : null;
              result.video[dirType].frameRateDecoded = obj.googFrameRateDecoded ?
                parseInt(obj.googFrameRateDecoded, 10) : null;
              result.video[dirType].frameRateOutput = obj.googFrameRateOutput ?
                parseInt(obj.googFrameRateOutput, 10) : null;
              result.video[dirType].frameRate = obj.googFrameRateReceived ?
                parseInt(obj.googFrameRateReceived, 10) : null;
              result.video[dirType].frames = obj.framesReceived ?
                self._parseConnectionStats(self._peerStats[peerId][prop], obj, 'framesReceived') : null;
              result.video[dirType].totalFrames = obj.framesReceived ? parseInt(obj.framesReceived, 10) : null;
            }
          } else {
            if (dirType === 'receiving') {
              result.audio[dirType].outputLevel = parseFloat(obj.audioOutputLevel || '0', 10);
            } else {
              result.audio[dirType].inputLevel = parseFloat(obj.audioInputLevel || '0', 10);
              result.audio[dirType].echoReturnLoss = parseFloat(obj.googEchoCancellationReturnLoss || '0', 10);
              result.audio[dirType].echoReturnLossEnhancement = parseFloat(obj.googEchoCancellationReturnLossEnhancement || '0', 10);
            }
          }

          self._peerStats[peerId][prop] = obj;

          if (!reportedCandidate) {
            loopFn(stats, function (canObj, canProp) {
              if (!reportedCandidate && canProp.indexOf('Conn-') === 0) {
                if (obj.transportId === canObj.googChannelId) {
                  if (!self._peerStats[peerId][canProp]) {
                    self._peerStats[peerId][canProp] = canObj;
                  }
                  formatCandidateFn('local', stats[canObj.localCandidateId]);
                  formatCandidateFn('remote', stats[canObj.remoteCandidateId]);
                  result.selectedCandidate.writable = canObj.googWritable ? canObj.googWritable === 'true' : null;
                  result.selectedCandidate.readable = canObj.googReadable ? canObj.googReadable === 'true' : null;
                  result.selectedCandidate.rtt = canObj.googRtt ?
                    self._parseConnectionStats(self._peerStats[peerId][canProp], canObj, 'googRtt') : null;
                  result.selectedCandidate.totalRtt = canObj.googRtt ? parseInt(canObj.googRtt, 10) : null;
                  result.selectedCandidate.requests = {
                    received: canObj.requestsReceived ?
                      self._parseConnectionStats(self._peerStats[peerId][canProp], canObj, 'requestsReceived') : null,
                    sent: canObj.requestsSent ?
                      self._parseConnectionStats(self._peerStats[peerId][canProp], canObj, 'requestsSent') : null,
                    totalReceived: canObj.requestsReceived ? parseInt(canObj.requestsReceived, 10) : null,
                    totalSent: canObj.requestsSent ? parseInt(canObj.requestsSent, 10) : null
                  };
                  result.selectedCandidate.responses = {
                    received: canObj.responsesReceived ?
                      self._parseConnectionStats(self._peerStats[peerId][canProp], canObj, 'responsesReceived') : null,
                    sent: canObj.responsesSent ?
                      self._parseConnectionStats(self._peerStats[peerId][canProp], canObj, 'responsesSent') : null,
                    totalReceived: canObj.responsesReceived ? parseInt(canObj.responsesReceived, 10) : null,
                    totalSent: canObj.responsesSent ? parseInt(canObj.responsesSent, 10) : null
                  };
                  result.selectedCandidate.consentRequests = {
                    received: canObj.consentRequestsReceived ?
                      self._parseConnectionStats(self._peerStats[peerId][canProp], canObj, 'consentRequestsReceived') : null,
                    sent: canObj.consentRequestsSent ?
                      self._parseConnectionStats(self._peerStats[peerId][canProp], canObj, 'consentRequestsSent') : null,
                    totalReceived: canObj.consentRequestsReceived ? parseInt(canObj.consentRequestsReceived, 10) : null,
                    totalSent: canObj.consentRequestsSent ? parseInt(canObj.consentRequestsSent, 10) : null
                  };
                  result.selectedCandidate.consentResponses = {
                    received: canObj.consentResponsesReceived ?
                      self._parseConnectionStats(self._peerStats[peerId][canProp], canObj, 'consentResponsesReceived') : null,
                    sent: canObj.consentResponsesSent ?
                      self._parseConnectionStats(self._peerStats[peerId][canProp], canObj, 'consentResponsesSent') : null,
                    totalReceived: canObj.consentResponsesReceived ? parseInt(canObj.consentResponsesReceived, 10) : null,
                    totalSent: canObj.consentResponsesSent ? parseInt(canObj.consentResponsesSent, 10) : null
                  };
  
                  self._peerStats[peerId][canProp] = canObj;
                  reportedCandidate = true;
                }
              }
            });
          }

          if (!reportedCertificate && stats[obj.transportId]) {
            result.certificate.srtpCipher = stats[obj.transportId].srtpCipher || null;
            result.certificate.dtlsCipher = stats[obj.transportId].dtlsCipher || null;

            var localCertId = stats[obj.transportId].localCertificateId;
            var remoteCertId = stats[obj.transportId].remoteCertificateId;

            if (localCertId && stats[localCertId]) {
              result.certificate.local.derBase64 = stats[localCertId].googDerBase64 || null;
              if (stats[localCertId].googFingerprint) {
                result.certificate.local.fingerprint = stats[localCertId].googFingerprint;
              }
              if (stats[localCertId].googFingerprintAlgorithm) {
                result.certificate.local.fingerprintAlgorithm = stats[localCertId].googFingerprintAlgorithm;
              }
            }

            if (remoteCertId && stats[remoteCertId]) {
              result.certificate.remote.derBase64 = stats[remoteCertId].googDerBase64 || null;
              if (stats[remoteCertId].googFingerprint) {
                result.certificate.remote.fingerprint = stats[remoteCertId].googFingerprint;
              }
              if (stats[remoteCertId].googFingerprintAlgorithm) {
                result.certificate.remote.fingerprintAlgorithm = stats[remoteCertId].googFingerprintAlgorithm;
              }
            }
            reportedCertificate = true;
          }
        }
      });
    }

    if ((result.selectedCandidate.local.candidateType || '').indexOf('relay') === 0) {
      result.selectedCandidate.local.turnMediaTransport = 'UDP';
      if (self._forceTURNSSL && window.webrtcDetectedBrowser !== 'firefox') {
        result.selectedCandidate.local.turnMediaTransport = 'TCP/TLS';
      } else if ((self._TURNTransport === self.TURN_TRANSPORT.TCP || self._forceTURNSSL) &&
        self._room && self._room.connection && self._room.connection.peerConfig &&
        Array.isArray(self._room.connection.peerConfig.iceServers) &&
        self._room.connection.peerConfig.iceServers[0] &&
        self._room.connection.peerConfig.iceServers[0].urls[0] &&
        self._room.connection.peerConfig.iceServers[0].urls[0].indexOf('?transport=tcp') > 0) {
        result.selectedCandidate.local.turnMediaTransport = 'TCP';
      }
    } else {
      result.selectedCandidate.local.turnMediaTransport = null;
    }

    callback(null, result);

  }, function (error) {
    callback(error, null);
  });
};

/**
 * Function that starts the Peer connection session.
 * Remember to remove previous method of reconnection (re-creating the Peer connection - destroy and create connection).
 * @method _addPeer
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._addPeer = function(targetMid, peerBrowser, toOffer, restartConn, receiveOnly, isSS) {
  var self = this;
  if (self._peerConnections[targetMid] && !restartConn) {
    self._log.error([targetMid, null, null, 'Connection to peer has already been made']);
    return;
  }
  self._log.log([targetMid, null, null, 'Starting the connection to peer. Options provided:'], {
    peerBrowser: peerBrowser,
    toOffer: toOffer,
    receiveOnly: receiveOnly,
    enableDataChannel: self._enableDataChannel
  });

  self._log.info('Adding peer', isSS);

  if (!restartConn) {
    self._peerConnections[targetMid] = self._createPeerConnection(targetMid, !!isSS);
  }

  if (!self._peerConnections[targetMid]) {
    self._log.error([targetMid, null, null, 'Failed creating the connection to peer']);
    return;
  }

  self._peerConnections[targetMid].hasScreen = !!isSS;
};

/**
 * Function that re-negotiates a Peer connection.
 * Remember to remove previous method of reconnection (re-creating the Peer connection - destroy and create connection).
 * @method _restartPeerConnection
 * @private
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._restartPeerConnection = function (peerId, doIceRestart, callback) {
  var self = this;

  if (!self._peerConnections[peerId]) {
    self._log.error([peerId, null, null, 'Peer does not have an existing ' +
      'connection. Unable to restart']);
    return;
  }

  var pc = self._peerConnections[peerId];
  var agent = (self.getPeerInfo(peerId) || {}).agent || {};

  // prevent restarts for other SDK clients
  if (self._isLowerThanVersion(agent.SMProtocolVersion || '', '0.1.2')) {
    var notSupportedError = new Error('Failed restarting with other agents connecting from other SDKs as ' +
      're-negotiation is not supported by other SDKs');

    self._log.warn([peerId, 'RTCPeerConnection', null, 'Ignoring restart request as agent\'s SDK does not support it'],
        notSupportedError);

    if (typeof callback === 'function') {
      self._log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart failure callback']);
      callback(notSupportedError);
    }
    return;
  }

  // This is when the state is stable and re-handshaking is possible
  // This could be due to previous connection handshaking that is already done
  if (pc.signalingState === self.PEER_CONNECTION_STATE.STABLE && self._peerConnections[peerId]) {
    self._log.log([peerId, null, null, 'Sending restart message to signaling server']);

    var restartMsg = {
      type: self._SIG_MESSAGE_TYPE.RESTART,
      mid: self._user.sid,
      rid: self._room.id,
      agent: window.webrtcDetectedBrowser,
      version: (window.webrtcDetectedVersion || 0).toString(),
      os: window.navigator.platform,
      userInfo: self._getUserInfo(),
      target: peerId,
      weight: self._peerPriorityWeight,
      receiveOnly: self.getPeerInfo().config.receiveOnly,
      enableIceTrickle: self._enableIceTrickle,
      enableDataChannel: self._enableDataChannel,
      enableIceRestart: self._enableIceRestart,
      doIceRestart: doIceRestart === true && self._enableIceRestart && self._peerInformations[peerId] &&
        self._peerInformations[peerId].config.enableIceRestart,
      isRestartResend: false,
      temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
      SMProtocolVersion: self.SM_PROTOCOL_VERSION,
      DTProtocolVersion: self.DT_PROTOCOL_VERSION
    };

    if (self._publishOnly) {
      restartMsg.publishOnly = {
        type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
      };
    }

    if (self._parentId) {
      restartMsg.parentId = self._parentId;
    }

    self._peerEndOfCandidatesCounter[peerId] = self._peerEndOfCandidatesCounter[peerId] || {};
    self._peerEndOfCandidatesCounter[peerId].len = 0;
    self._sendChannelMessage(restartMsg);
    self._trigger('peerRestart', peerId, self.getPeerInfo(peerId), true, doIceRestart === true);

    if (typeof callback === 'function') {
      self._log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart callback']);
      callback(null);
    }

  } else {
    // Let's check if the signalingState is stable first.
    // In another galaxy or universe, where the local description gets dropped..
    // In the offerHandler or answerHandler, do the appropriate flags to ignore or drop "extra" descriptions
    if (pc.signalingState === self.PEER_CONNECTION_STATE.HAVE_LOCAL_OFFER) {
      // Checks if the local description is defined first
      var hasLocalDescription = pc.localDescription && pc.localDescription.sdp;
      // By then it should have at least the local description..
      if (hasLocalDescription) {
        self._sendChannelMessage({
          type: pc.localDescription.type,
          sdp: pc.localDescription.sdp,
          mid: self._user.sid,
          target: peerId,
          rid: self._room.id,
          restart: true
        });
      } else {
        var noLocalDescriptionError = 'Failed re-sending localDescription as there is ' +
          'no localDescription set to connection. There could be a handshaking step error';
        self._log.error([peerId, 'RTCPeerConnection', null, noLocalDescriptionError], {
            localDescription: pc.localDescription,
            remoteDescription: pc.remoteDescription
        });
        if (typeof callback === 'function') {
          self._log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart failure callback']);
          callback(new Error(noLocalDescriptionError));
        }
      }
    // It could have connection state closed
    } else {
      var unableToRestartError = 'Failed restarting as peer connection state is ' + pc.signalingState;
      self._log.warn([peerId, 'RTCPeerConnection', null, unableToRestartError]);
      if (typeof callback === 'function') {
        self._log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart failure callback']);
        callback(new Error(unableToRestartError));
      }
    }
  }
};

/**
 * Function that ends the Peer connection session.
 * @method _removePeer
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._removePeer = function(peerId) {
  if (!this._peerConnections[peerId] && !this._peerInformations[peerId]) {
    this._log.debug([peerId, 'RTCPeerConnection', null, 'Dropping the hangup from Peer as not connected to Peer at all.']);
    return;
  }

  var peerInfo = UtilsFactory.clone(this.getPeerInfo(peerId)) || {
    userData: '',
    settings: {},
    mediaStatus: {},
    agent: {},
    config: {},
    room: UtilsFactory.clone(this._selectedRoom)
  };

  if (peerId !== 'MCU') {
    this._trigger('peerLeft', peerId, peerInfo, false);
  } else {
    this._hasMCU = false;
    this._log.log([peerId, null, null, 'MCU has stopped listening and left']);
    this._trigger('serverPeerLeft', peerId, this.SERVER_PEER_TYPE.MCU);
  }

  // check if health timer exists
  if (this._peerConnections[peerId]) {
    if (this._peerConnections[peerId].signalingState !== this.PEER_CONNECTION_STATE.CLOSED) {
      this._peerConnections[peerId].close();
    }

    if (peerId !== 'MCU') {
      this._handleEndedStreams(peerId);
    }

    delete this._peerConnections[peerId];
  }
  // remove peer informations session
  if (this._peerInformations[peerId]) {
    delete this._peerInformations[peerId];
  }
  // remove peer messages stamps session
  if (this._peerMessagesStamps[peerId]) {
    delete this._peerMessagesStamps[peerId];
  }
  // remove peer streams session
  if (this._streamsSession[peerId]) {
    delete this._streamsSession[peerId];
  }
  // remove peer streams session
  if (this._peerEndOfCandidatesCounter[peerId]) {
    delete this._peerEndOfCandidatesCounter[peerId];
  }
  // remove peer sdp session
  if (this._sdpSessions[peerId]) {
    delete this._sdpSessions[peerId];
  }

  // close datachannel connection
  if (this._dataChannels[peerId]) {
    this._closeDataChannel(peerId);
  }

  this._log.log([peerId, null, null, 'Successfully removed peer']);
};

/**
 * Function that creates the Peer connection.
 * @method _createPeerConnection
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._createPeerConnection = function(targetMid, isScreenSharing) {
  var pc, self = this;
  if (!self._inRoom || !(self._room && self._room.connection &&
    self._room.connection.peerConfig && Array.isArray(self._room.connection.peerConfig.iceServers))) {
    return;
  }
  // currently the AdapterJS 0.12.1-2 causes an issue to prevent firefox from
  // using .urls feature
  try {
    pc = new RTCPeerConnection({
      iceServers: self._room.connection.peerConfig.iceServers,
      iceTransportPolicy: self._filterCandidatesType.host && self._filterCandidatesType.srflx &&
        !self._filterCandidatesType.relay ? 'relay' : 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    }, {
      optional: [
        { DtlsSrtpKeyAgreement: true },
        { googIPv6: true }
      ]
    });
    self._log.info([targetMid, null, null, 'Created peer connection']);
    self._log.debug([targetMid, null, null, 'Peer connection config:'], self._room.connection.peerConfig);
    self._log.debug([targetMid, null, null, 'Peer connection constraints:'], self._room.connection.peerConstraints);
  } catch (error) {
    self._log.error([targetMid, null, null, 'Failed creating peer connection:'], error);
    return null;
  }
  // attributes (added on by Temasys)
  pc.setOffer = '';
  pc.setAnswer = '';
  pc.hasStream = false;
  pc.hasScreen = !!isScreenSharing;
  pc.hasMainChannel = false;
  pc.firefoxStreamId = '';
  pc.processingLocalSDP = false;
  pc.processingRemoteSDP = false;
  pc.gathered = false;
  pc.gathering = false;

  // candidates
  self._gatheredCandidates[targetMid] = {
    sending: { host: [], srflx: [], relay: [] },
    receiving: { host: [], srflx: [], relay: [] }
  };

  self._streamsSession[targetMid] = self._streamsSession[targetMid] || {};
  self._peerEndOfCandidatesCounter[targetMid] = self._peerEndOfCandidatesCounter[targetMid] || {};
  self._sdpSessions[targetMid] = { local: {}, remote: {} };

  // callbacks
  // standard not implemented: onnegotiationneeded,
  pc.ondatachannel = function(event) {
    var dc = event.channel || event;
    self._log.debug([targetMid, 'RTCDataChannel', dc.label, 'Received datachannel ->'], dc);
    if (self._enableDataChannel && self._peerInformations[targetMid] &&
      self._peerInformations[targetMid].config.enableDataChannel) {
      var channelType = self.DATA_CHANNEL_TYPE.DATA;
      var channelKey = dc.label;

      // if peer does not have main channel, the first item is main
      if (!pc.hasMainChannel) {
        channelType = self.DATA_CHANNEL_TYPE.MESSAGING;
        channelKey = 'main';
        pc.hasMainChannel = true;
      }

      self._createDataChannel(targetMid, dc);

    } else {
      self._log.warn([targetMid, 'RTCDataChannel', dc.label, 'Not adding datachannel as enable datachannel ' +
        'is set to false']);
    }
  };

  pc.onaddstream = function(event) {
    if (!self._peerConnections[targetMid]) {
      return;
    }

    var stream = event.stream || event;
    var streamId = stream.id || stream.label;

    if (targetMid === 'MCU') {
      self._log.warn([targetMid, 'MediaStream', streamId, 'Ignoring received remote stream from MCU ->'], stream);
      return;
    } else if (!self._sdpSettings.direction.audio.receive && !self._sdpSettings.direction.video.receive) {
      self._log.warn([targetMid, 'MediaStream', streamId, 'Ignoring received empty remote stream ->'], stream);
      return;
    }

    // Fixes for the dirty-hack for Chrome offer to Firefox (inactive)
    // See: ESS-680
    if (!self._hasMCU && window.webrtcDetectedBrowser === 'firefox' &&
      pc.getRemoteStreams().length > 1 && pc.remoteDescription && pc.remoteDescription.sdp) {

      if (pc.remoteDescription.sdp.indexOf(' msid:' + streamId + ' ') === -1) {
        self._log.warn([targetMid, 'MediaStream', streamId, 'Ignoring received empty remote stream ->'], stream);
        return;
      }
    }

    var peerSettings = UtilsFactory.clone(self.getPeerInfo(targetMid).settings);
    var hasScreenshare = peerSettings.video && typeof peerSettings.video === 'object' && !!peerSettings.video.screenshare;

    pc.hasStream = true;
    pc.hasScreen = !!hasScreenshare;

    self._streamsSession[targetMid][streamId] = peerSettings;
    self._onRemoteStreamAdded(targetMid, stream, !!hasScreenshare);
  };

  pc.onicecandidate = function(event) {
    self._onIceCandidate(targetMid, event.candidate || event);
  };

  pc.oniceconnectionstatechange = function(evt) {
    var iceConnectionState = pc.iceConnectionState;

    self._log.debug([targetMid, 'RTCIceConnectionState', null, 'Ice connection state changed ->'], iceConnectionState);

    if (window.webrtcDetectedBrowser === 'edge') {
      if (iceConnectionState === 'connecting') {
        iceConnectionState = self.ICE_CONNECTION_STATE.CHECKING;
      } else if (iceConnectionState === 'new') {
        iceConnectionState = self.ICE_CONNECTION_STATE.FAILED;
      }
    }

    self._trigger('iceConnectionState', iceConnectionState, targetMid);

    if (pc.iceConnectionState === self.ICE_CONNECTION_STATE.FAILED && self._enableIceTrickle) {
      self._trigger('iceConnectionState', self.ICE_CONNECTION_STATE.TRICKLE_FAILED, targetMid);
    }
  };

  pc.onsignalingstatechange = function() {
    self._log.debug([targetMid, 'RTCSignalingState', null, 'Peer connection state changed ->'], pc.signalingState);
    self._trigger('peerConnectionState', pc.signalingState, targetMid);
  };
  pc.onicegatheringstatechange = function() {
    self._log.log([targetMid, 'RTCIceGatheringState', null, 'Ice gathering state changed ->'], pc.iceGatheringState);
    self._trigger('candidateGenerationState', pc.iceGatheringState, targetMid);
  };

  if (window.webrtcDetectedBrowser === 'firefox') {
    pc.removeStream = function (stream) {
      var senders = pc.getSenders();
      for (var s = 0; s < senders.length; s++) {
        var tracks = stream.getTracks();
        for (var t = 0; t < tracks.length; t++) {
          if (tracks[t] === senders[s].track) {
            pc.removeTrack(senders[s]);
          }
        }
      }
    };
  }

  return pc;
};

/**
 * Function that handles the <code>_restartPeerConnection</code> scenario
 *   for MCU enabled Peer connections.
 * This is implemented currently by making the user leave and join the Room again.
 * The Peer ID will not stay the same though.
 * @method _restartMCUConnection
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._restartMCUConnection = function(callback, doIceRestart) {
  var self = this;
  var listOfPeers = Object.keys(self._peerConnections);
  var listOfPeerRestartErrors = {};
  var sendRestartMsgFn = function (peerId) {
    var restartMsg = {
      type: self._SIG_MESSAGE_TYPE.RESTART,
      mid: self._user.sid,
      rid: self._room.id,
      agent: window.webrtcDetectedBrowser,
      version: (window.webrtcDetectedVersion || 0).toString(),
      os: window.navigator.platform,
      userInfo: self._getUserInfo(),
      target: peerId,
      weight: self._peerPriorityWeight,
      receiveOnly: self.getPeerInfo().config.receiveOnly,
      enableIceTrickle: self._enableIceTrickle,
      enableDataChannel: self._enableDataChannel,
      enableIceRestart: self._enableIceRestart,
      doIceRestart: self._mcuUseRenegoRestart && doIceRestart === true &&
        self._enableIceRestart && self._peerInformations[peerId] &&
        self._peerInformations[peerId].config.enableIceRestart,
      isRestartResend: false,
      temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
      SMProtocolVersion: self.SM_PROTOCOL_VERSION,
      DTProtocolVersion: self.DT_PROTOCOL_VERSION
    };

    if (self._publishOnly) {
      restartMsg.publishOnly = {
        type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
      };
    }

    if (self._parentId) {
      restartMsg.parentId = self._parentId;
    }

    self._log.log([peerId, 'RTCPeerConnection', null, 'Sending restart message to signaling server ->'], restartMsg);

    self._sendChannelMessage(restartMsg);
  };

  for (var i = 0; i < listOfPeers.length; i++) {
    if (!self._peerConnections[listOfPeers[i]]) {
      var error = 'Peer connection with peer does not exists. Unable to restart';
      self._log.error([listOfPeers[i], 'PeerConnection', null, error]);
      listOfPeerRestartErrors[listOfPeers[i]] = new Error(error);
      continue;
    }

    if (listOfPeers[i] !== 'MCU') {
      self._trigger('peerRestart', listOfPeers[i], self.getPeerInfo(listOfPeers[i]), true, false);

      if (!self._mcuUseRenegoRestart) {
        sendRestartMsgFn(listOfPeers[i]);
      }
    }
  }

  self._trigger('serverPeerRestart', 'MCU', self.SERVER_PEER_TYPE.MCU);

  if (self._mcuUseRenegoRestart) {
    self._peerEndOfCandidatesCounter.MCU = self._peerEndOfCandidatesCounter.MCU || {};
    self._peerEndOfCandidatesCounter.MCU.len = 0;
    sendRestartMsgFn('MCU');
  } else {
    // Restart with MCU = peer leaves then rejoins room
    var peerJoinedFn = function (peerId, peerInfo, isSelf) {
      self._log.log([null, 'PeerConnection', null, 'Invoked all peers to restart with MCU. Firing callback']);

      if (typeof callback === 'function') {
        if (Object.keys(listOfPeerRestartErrors).length > 0) {
          callback({
            refreshErrors: listOfPeerRestartErrors,
            listOfPeers: listOfPeers
          }, null);
        } else {
          callback(null, {
            listOfPeers: listOfPeers
          });
        }
      }
    };

    self.once('peerJoined', peerJoinedFn, function (peerId, peerInfo, isSelf) {
      return isSelf;
    });

    self.leaveRoom(false, function (error, success) {
      if (error) {
        if (typeof callback === 'function') {
          for (var i = 0; i < listOfPeers.length; i++) {
            listOfPeerRestartErrors[listOfPeers[i]] = error;
          }
          callback({
            refreshErrors: listOfPeerRestartErrors,
            listOfPeers: listOfPeers
          }, null);
        }
      } else {
        //self._trigger('serverPeerLeft', 'MCU', self.SERVER_PEER_TYPE.MCU);
        self.joinRoom(self._selectedRoom);
      }
    });
  }
};

/**
 * Function that handles the stats tabulation.
 * @method _parseConnectionStats
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._parseConnectionStats = function(prevStats, stats, prop) {
  var nTime = stats.timestamp;
  var oTime = prevStats.timestamp;
  var nVal = parseFloat(stats[prop] || '0', 10);
  var oVal = parseFloat(prevStats[prop] || '0', 10);

  if ((new Date(nTime).getTime()) === (new Date(oTime).getTime())) {
    return nVal;
  }

  return parseFloat(((nVal - oVal) / (nTime - oTime) * 1000).toFixed(3) || '0', 10);
};

/**
 * Function that signals the end-of-candidates flag.
 * @method _signalingEndOfCandidates
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._signalingEndOfCandidates = function(targetMid) {
  var self = this;

  if (!self._peerEndOfCandidatesCounter[targetMid]) {
    return;
  }

  // If remote description is set
  if (self._peerConnections[targetMid].remoteDescription && self._peerConnections[targetMid].remoteDescription.sdp &&
  // If end-of-candidates signal is received
    typeof self._peerEndOfCandidatesCounter[targetMid].expectedLen === 'number' &&
  // If all ICE candidates are received
    self._peerEndOfCandidatesCounter[targetMid].len >= self._peerEndOfCandidatesCounter[targetMid].expectedLen &&
  // If there is no ICE candidates queue
    (self._peerCandidatesQueue[targetMid] ? self._peerCandidatesQueue[targetMid].length === 0 : true) &&
  // If it has not been set yet
    !self._peerEndOfCandidatesCounter[targetMid].hasSet) {
    self._log.debug([targetMid, 'RTCPeerConnection', null, 'Signaling of end-of-candidates remote ICE gathering.']);
    self._peerEndOfCandidatesCounter[targetMid].hasSet = true;
    try {
      if (window.webrtcDetectedBrowser === 'edge') {
        var mLineCounter = -1;
        var addedMids = [];
        var sdpLines = self._peerConnections[targetMid].remoteDescription.sdp.split('\r\n');

        for (var i = 0; i < sdpLines.length; i++) {
          if (sdpLines[i].indexOf('m=') === 0) {
            mLineCounter++;
          } else if (sdpLines[i].indexOf('a=mid:') === 0) {
            var mid = sdpLines[i].split('a=mid:')[1] || '';
            if (mid && addedMids.indexOf(mid) === -1) {
              addedMids.push(mid);
              self._addIceCandidate(targetMid, 'endofcan-' + (new Date()).getTime(), new RTCIceCandidate({
                sdpMid: mid,
                sdpMLineIndex: mLineCounter,
                candidate: 'candidate:1 1 udp 1 0.0.0.0 9 typ endOfCandidates'
              }));
            }
          }
        }

      } else {
        self._peerConnections[targetMid].addIceCandidate(null);
      }

      if (self._gatheredCandidates[targetMid]) {
        self._trigger('candidatesGathered', targetMid, {
          expected: self._peerEndOfCandidatesCounter[targetMid].expectedLen || 0,
          received: self._peerEndOfCandidatesCounter[targetMid].len || 0,
          processed: self._gatheredCandidates[targetMid].receiving.srflx.length +
            self._gatheredCandidates[targetMid].receiving.relay.length +
            self._gatheredCandidates[targetMid].receiving.host.length
        });
      }

    } catch (error) {
      self._log.error([targetMid, 'RTCPeerConnection', null, 'Failed signaling end-of-candidates ->'], error);
    }
  }
};



Skylink.prototype._getUserInfo = function(peerId) {
  var userInfo = UtilsFactory.clone(this.getPeerInfo());
  var peerInfo = UtilsFactory.clone(this.getPeerInfo(peerId));

  // Adhere to SM protocol without breaking the other SDKs.
  if (userInfo.settings.video && typeof userInfo.settings.video === 'object') {
    userInfo.settings.video.customSettings = {};

    if (userInfo.settings.video.frameRate && typeof userInfo.settings.video.frameRate === 'object') {
      userInfo.settings.video.customSettings.frameRate = UtilsFactory.clone(userInfo.settings.video.frameRate);
      userInfo.settings.video.frameRate = -1;
    }

    if (userInfo.settings.video.facingMode && typeof userInfo.settings.video.facingMode === 'object') {
      userInfo.settings.video.customSettings.facingMode = UtilsFactory.clone(userInfo.settings.video.facingMode);
      userInfo.settings.video.facingMode = '-1';
    }

    if (userInfo.settings.video.resolution && typeof userInfo.settings.video.resolution === 'object') {
      if (userInfo.settings.video.resolution.width && typeof userInfo.settings.video.resolution.width === 'object') {
        userInfo.settings.video.customSettings.width = UtilsFactory.clone(userInfo.settings.video.width);
        userInfo.settings.video.resolution.width = -1;
      }

      if (userInfo.settings.video.resolution.height && typeof userInfo.settings.video.resolution.height === 'object') {
        userInfo.settings.video.customSettings.height = UtilsFactory.clone(userInfo.settings.video.height);
        userInfo.settings.video.resolution.height = -1;
      }
    }
  }

  if (userInfo.settings.bandwidth) {
    userInfo.settings.maxBandwidth = UtilsFactory.clone(userInfo.settings.bandwidth);
    delete userInfo.settings.bandwidth;
  }

  // If there is Peer ID (not broadcast ENTER message) and Peer is Edge browser and User is not
  if (peerId ? (window.webrtcDetectedBrowser !== 'edge' && peerInfo.agent.name === 'edge' ?
  // If User is IE/safari and does not have H264 support, remove video support
    ['IE', 'safari'].indexOf(window.webrtcDetectedBrowser) > -1 && !this._currentCodecSupport.video.h264 :
  // If User is Edge and Peer is not and no H264 support, remove video support
    window.webrtcDetectedBrowser === 'edge' && peerInfo.agent.name !== 'edge' && !this._currentCodecSupport.video.h264) :
  // If broadcast ENTER message and User is Edge and has no H264 support
    window.webrtcDetectedBrowser === 'edge' && !this._currentCodecSupport.video.h264) {
    userInfo.settings.video = false;
    userInfo.mediaStatus.videoMuted = true;
  }

  delete userInfo.agent;
  delete userInfo.room;
  delete userInfo.config;
  delete userInfo.parentId;
  return userInfo;
};

Skylink.prototype._doOffer = function(targetMid, iceRestart, peerBrowser) {
  var self = this;
  var pc = self._peerConnections[targetMid] || self._addPeer(targetMid, peerBrowser);

  self._log.log([targetMid, null, null, 'Checking caller status'], peerBrowser);

  // Added checks to ensure that connection object is defined first
  if (!pc) {
    self._log.warn([targetMid, 'RTCSessionDescription', 'offer', 'Dropping of creating of offer ' +
      'as connection does not exists']);
    return;
  }

  // Added checks to ensure that state is "stable" if setting local "offer"
  if (pc.signalingState !== self.PEER_CONNECTION_STATE.STABLE) {
    self._log.warn([targetMid, 'RTCSessionDescription', 'offer',
      'Dropping of creating of offer as signalingState is not "' +
      self.PEER_CONNECTION_STATE.STABLE + '" ->'], pc.signalingState);
    return;
  }

  var peerAgent = ((self._peerInformations[targetMid] || {}).agent || {}).name || '';
  var doIceRestart = !!((self._peerInformations[targetMid] || {}).config || {}).enableIceRestart &&
    iceRestart && self._enableIceRestart;
  var offerToReceiveAudio = !(!self._sdpSettings.connection.audio && targetMid !== 'MCU');
  var offerToReceiveVideo = !(!self._sdpSettings.connection.video && targetMid !== 'MCU') &&
    ((window.webrtcDetectedBrowser === 'edge' && peerAgent !== 'edge') ||
    (['IE', 'safari'].indexOf(window.webrtcDetectedBrowser) > -1 && peerAgent === 'edge') ?
    !!self._currentCodecSupport.video.h264 : true);

  var offerConstraints = {
    offerToReceiveAudio: offerToReceiveAudio,
    offerToReceiveVideo: offerToReceiveVideo,
    iceRestart: doIceRestart
  };

  // Prevent undefined OS errors
  peerBrowser.os = peerBrowser.os || '';

  // Fallback to use mandatory constraints for plugin based browsers
  if (['IE', 'safari'].indexOf(window.webrtcDetectedBrowser) > -1) {
    offerConstraints = {
      mandatory: {
        OfferToReceiveAudio: offerToReceiveAudio,
        OfferToReceiveVideo: offerToReceiveVideo,
        iceRestart: doIceRestart
      }
    };
  }

  // Add stream only at offer/answer end
  if (!self._hasMCU || targetMid === 'MCU') {
    self._addLocalMediaStreams(targetMid);
  }

  if (self._enableDataChannel && self._peerInformations[targetMid] &&
    self._peerInformations[targetMid].config.enableDataChannel &&
    !(!self._sdpSettings.connection.data && targetMid !== 'MCU')) {
    // Edge doesn't support datachannels yet
    if (!(self._dataChannels[targetMid] && self._dataChannels[targetMid].main)) {
      self._createDataChannel(targetMid);
      self._peerConnections[targetMid].hasMainChannel = true;
    }
  }

  self._log.debug([targetMid, null, null, 'Creating offer with config:'], offerConstraints);

  pc.endOfCandidates = false;

  pc.createOffer(function(offer) {
    self._log.debug([targetMid, null, null, 'Created offer'], offer);

    self._setLocalAndSendMessage(targetMid, offer);

  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);

    self._log.error([targetMid, null, null, 'Failed creating an offer:'], error);

  }, offerConstraints);
};

/**
 * Function that creates the Peer connection answer session description.
 * This comes after receiving and setting the offer session description.
 * @method _doAnswer
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._doAnswer = function(targetMid) {
  var self = this;
  self._log.log([targetMid, null, null, 'Creating answer with config:'],
    self._room.connection.sdpConstraints);
  var pc = self._peerConnections[targetMid];

  // Added checks to ensure that connection object is defined first
  if (!pc) {
    self._log.warn([targetMid, 'RTCSessionDescription', 'answer', 'Dropping of creating of answer ' +
      'as connection does not exists']);
    return;
  }

  // Added checks to ensure that state is "have-remote-offer" if setting local "answer"
  if (pc.signalingState !== self.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER) {
    self._log.warn([targetMid, 'RTCSessionDescription', 'answer',
      'Dropping of creating of answer as signalingState is not "' +
      self.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER + '" ->'], pc.signalingState);
    return;
  }

  // Add stream only at offer/answer end
  if (!self._hasMCU || targetMid === 'MCU') {
    self._addLocalMediaStreams(targetMid);
  }

  // No ICE restart constraints for createAnswer as it fails in chrome 48
  // { iceRestart: true }
  pc.createAnswer(function(answer) {
    self._log.debug([targetMid, null, null, 'Created answer'], answer);
    self._setLocalAndSendMessage(targetMid, answer);
  }, function(error) {
    self._log.error([targetMid, null, null, 'Failed creating an answer:'], error);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
  });
};

/**
 * Function that sets the local session description and sends to Peer.
 * If trickle ICE is disabled, the local session description will be sent after
 *   ICE gathering has been completed.
 * @method _setLocalAndSendMessage
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._setLocalAndSendMessage = function(targetMid, sessionDescription) {
  var self = this;
  var pc = self._peerConnections[targetMid];

  // Added checks to ensure that sessionDescription is defined first
  if (!(!!sessionDescription && !!sessionDescription.sdp)) {
    self._log.warn([targetMid, 'RTCSessionDescription', null, 'Local session description is undefined ->'], sessionDescription);
    return;
  }

  // Added checks to ensure that connection object is defined first
  if (!pc) {
    self._log.warn([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Local session description will not be set as connection does not exists ->'], sessionDescription);
    return;

  } else if (sessionDescription.type === self.HANDSHAKE_PROGRESS.OFFER &&
    pc.signalingState !== self.PEER_CONNECTION_STATE.STABLE) {
    self._log.warn([targetMid, 'RTCSessionDescription', sessionDescription.type, 'Local session description ' +
      'will not be set as signaling state is "' + pc.signalingState + '" ->'], sessionDescription);
    return;

  // Added checks to ensure that state is "have-remote-offer" if setting local "answer"
  } else if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER &&
    pc.signalingState !== self.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER) {
    self._log.warn([targetMid, 'RTCSessionDescription', sessionDescription.type, 'Local session description ' +
      'will not be set as signaling state is "' + pc.signalingState + '" ->'], sessionDescription);
    return;

  // Added checks if there is a current local sessionDescription being processing before processing this one
  } else if (pc.processingLocalSDP) {
    self._log.warn([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Local session description will not be set as another is being processed ->'], sessionDescription);
    return;
  }

  pc.processingLocalSDP = true;

  // Sets and expected receiving codecs etc.
  //sessionDescription.sdp = self._setSDPOpusConfig(targetMid, sessionDescription);
  //sessionDescription.sdp = self._setSDPCodec(targetMid, sessionDescription);
  sessionDescription.sdp = self._removeSDPFirefoxH264Pref(targetMid, sessionDescription);
  sessionDescription.sdp = self._removeSDPH264VP9AptRtxForOlderPlugin(targetMid, sessionDescription);
  sessionDescription.sdp = self._removeSDPCodecs(targetMid, sessionDescription);
  sessionDescription.sdp = self._handleSDPConnectionSettings(targetMid, sessionDescription, 'local');
  //sessionDescription.sdp = self._setSDPBitrate(targetMid, sessionDescription);
  sessionDescription.sdp = self._removeSDPREMBPackets(targetMid, sessionDescription);

  self._log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
    'Local session description updated ->'], sessionDescription.sdp);

  pc.setLocalDescription(sessionDescription, function() {
    self._log.debug([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Local session description has been set ->'], sessionDescription);

    pc.processingLocalSDP = false;

    self._trigger('handshakeProgress', sessionDescription.type, targetMid);

    if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER) {
      pc.setAnswer = 'local';
    } else {
      pc.setOffer = 'local';
    }

    if (!self._enableIceTrickle && !pc.gathered) {
      self._log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
        'Local session description sending is halted to complete ICE gathering.']);
      return;
    }

    self._sendChannelMessage({
      type: sessionDescription.type,
      sdp: self._addSDPMediaStreamTrackIDs(targetMid, sessionDescription),
      mid: self._user.sid,
      target: targetMid,
      rid: self._room.id,
      userInfo: self._getUserInfo()
    });

  }, function(error) {
    self._log.error([targetMid, 'RTCSessionDescription', sessionDescription.type, 'Local description failed setting ->'], error);

    pc.processingLocalSDP = false;

    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
  });
};

Skylink.prototype._waitForOpenChannel = function(mediaOptions, callback) {
  var self = this;
  // when reopening room, it should stay as 0
  self._socketCurrentReconnectionAttempt = 0;

  // wait for ready state before opening
  self._wait(function() {
    self._condition('channelOpen', function() {
      mediaOptions = mediaOptions || {};

      self._userData = mediaOptions.userData || self._userData || '';
      self._streamsBandwidthSettings = {
        googleX: {},
        bAS: {}
      };
      self._publishOnly = false;
      self._sdpSettings = {
        connection: {
          audio: true,
          video: true,
          data: true
        },
        direction: {
          audio: { send: true, receive: true },
          video: { send: true, receive: true }
        }
      };

      if (mediaOptions.bandwidth) {
        if (typeof mediaOptions.bandwidth.audio === 'number') {
          self._streamsBandwidthSettings.bAS.audio = mediaOptions.bandwidth.audio;
        }

        if (typeof mediaOptions.bandwidth.video === 'number') {
          self._streamsBandwidthSettings.bAS.video = mediaOptions.bandwidth.video;
        }

        if (typeof mediaOptions.bandwidth.data === 'number') {
          self._streamsBandwidthSettings.bAS.data = mediaOptions.bandwidth.data;
        }
      }

      if (mediaOptions.googleXBandwidth) {
        if (typeof mediaOptions.googleXBandwidth.min === 'number') {
          self._streamsBandwidthSettings.googleX.min = mediaOptions.googleXBandwidth.min;
        }

        if (typeof mediaOptions.googleXBandwidth.max === 'number') {
          self._streamsBandwidthSettings.googleX.max = mediaOptions.googleXBandwidth.max;
        }
      }

      if (mediaOptions.sdpSettings) {
        if (mediaOptions.sdpSettings.direction) {
          if (mediaOptions.sdpSettings.direction.audio) {
            self._sdpSettings.direction.audio.receive = typeof mediaOptions.sdpSettings.direction.audio.receive === 'boolean' ?
              mediaOptions.sdpSettings.direction.audio.receive : true;
            self._sdpSettings.direction.audio.send = typeof mediaOptions.sdpSettings.direction.audio.send === 'boolean' ?
              mediaOptions.sdpSettings.direction.audio.send : true;
          }

          if (mediaOptions.sdpSettings.direction.video) {
            self._sdpSettings.direction.video.receive = typeof mediaOptions.sdpSettings.direction.video.receive === 'boolean' ?
              mediaOptions.sdpSettings.direction.video.receive : true;
            self._sdpSettings.direction.video.send = typeof mediaOptions.sdpSettings.direction.video.send === 'boolean' ?
              mediaOptions.sdpSettings.direction.video.send : true;
          }
        }
        if (mediaOptions.sdpSettings.connection) {
          self._sdpSettings.connection.audio = typeof mediaOptions.sdpSettings.connection.audio === 'boolean' ?
            mediaOptions.sdpSettings.connection.audio : true;
          self._sdpSettings.connection.video = typeof mediaOptions.sdpSettings.connection.video === 'boolean' ?
            mediaOptions.sdpSettings.connection.video : true;
          self._sdpSettings.connection.data = typeof mediaOptions.sdpSettings.connection.data === 'boolean' ?
            mediaOptions.sdpSettings.connection.data : true;
        }
      }

      if (mediaOptions.publishOnly) {
        self._sdpSettings.direction.audio.send = true;
        self._sdpSettings.direction.audio.receive = false;
        self._sdpSettings.direction.video.send = true;
        self._sdpSettings.direction.video.receive = false;
        self._publishOnly = true;

        if (typeof mediaOptions.publishOnly === 'object' && mediaOptions.publishOnly.parentId &&
          typeof mediaOptions.publishOnly.parentId === 'string') {
          self._parentId = mediaOptions.publishOnly.parentId;
        }
      }

      if (mediaOptions.parentId) {
        self._parentId = mediaOptions.parentId;
      }

      // get the stream
      if (mediaOptions.manualGetUserMedia === true) {
        self._trigger('mediaAccessRequired');

        var current50Block = 0;
        var mediaAccessRequiredFailure = false;
        // wait for available audio or video stream
        self._wait(function () {
          if (mediaAccessRequiredFailure === true) {
            self._onUserMediaError(new Error('Waiting for stream timeout'), false, false);
          } else {
            callback(null, self._streams.userMedia.stream);
          }
        }, function () {
          current50Block += 1;
          if (current50Block === 600) {
            mediaAccessRequiredFailure = true;
            return true;
          }

          if (self._streams.userMedia && self._streams.userMedia.stream) {
            return true;
          }
        }, 50);
        return;
      }

      if (mediaOptions.audio || mediaOptions.video) {
        self.getUserMedia({
          useExactConstraints: !!mediaOptions.useExactConstraints,
          audio: mediaOptions.audio,
          video: mediaOptions.video

        }, function (error, success) {
          if (error) {
            callback(error, null);
          } else {
            callback(null, success);
          }
        });
        return;
      }

      callback(null, null);

    }, function() { // open channel first if it's not opened

      if (!self._channelOpen) {
        self._openChannel();
      }
      return self._channelOpen;
    }, function(state) {
      return true;
    });
  }, function() {
    return self._readyState === self.READY_STATE_CHANGE.COMPLETED;
  });

};

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
    self._log.debug([null, 'XMLHttpRequest', method, 'Using XDomainRequest. ' +
      'XMLHttpRequest is now XDomainRequest'], {
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion
    });
    xhr = new XDomainRequest();
    xhr.setContentType = function (contentType) {
      xhr.contentType = contentType;
    };
  } else {
    self._log.debug([null, 'XMLHttpRequest', method, 'Using XMLHttpRequest'], {
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
    self._log.debug([null, 'XMLHttpRequest', method, 'Received sessions parameters'],
      JSON.parse(response || '{}'));
    callback(status, JSON.parse(response || '{}'));
  };

  xhr.onerror = function (error) {
    self._log.error([null, 'XMLHttpRequest', method, 'Failed retrieving information:'],
      { status: xhr.status });
    self._readyState = -1;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: xhr.status || null,
      content: 'Network error occurred. (Status: ' + xhr.status + ')',
      errorCode: self.READY_STATE_CHANGE_ERROR.XML_HTTP_REQUEST_ERROR
    }, self._selectedRoom);
  };

  xhr.onprogress = function () {
    self._log.debug([null, 'XMLHttpRequest', method,
      'Retrieving information and config from webserver. Url:'], url);
    self._log.debug([null, 'XMLHttpRequest', method, 'Provided parameters:'], params);
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
  this._log.log('Parsing parameter from server', info);
  if (!info.pc_constraints && !info.offer_constraints) {
    this._trigger('readyStateChange', this.READY_STATE_CHANGE.ERROR, {
      status: 200,
      content: info.info,
      errorCode: info.error
    }, self._selectedRoom);
    return;
  }

  this._log.debug('Peer connection constraints:', info.pc_constraints);
  this._log.debug('Offer constraints:', info.offer_constraints);

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
  //this._parseDefaultMediaStreamSettings(this._room.connection.mediaConstraints);

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
  this._log.info('Parsed parameters from webserver. ' +
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
    self._log.error('Socket.io not loaded. Please load socket.io');
    self._readyState = -1;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: 'Socket.io not found',
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_SOCKET_IO
    }, self._selectedRoom);
    return;
  }
  if (!window.XMLHttpRequest) {
    self._log.error('XMLHttpRequest not supported. Please upgrade your browser');
    self._readyState = -1;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: 'XMLHttpRequest not available',
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_XMLHTTPREQUEST_SUPPORT
    }, self._selectedRoom);
    return;
  }
  if (!self._path) {
    self._log.error('Skylink is not initialised. Please call init() first');
    self._readyState = -1;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: 'No API Path is found',
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_PATH
    }, self._selectedRoom);
    return;
  }
  adapter.webRTCReady(function () {
    self._isUsingPlugin = !!adapter.WebRTCPlugin.plugin && !!adapter.WebRTCPlugin.plugin.VERSION;

    if (!window.RTCPeerConnection) {
      self._log.error('WebRTC not supported. Please upgrade your browser');
      self._readyState = -1;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
        status: null,
        content: 'WebRTC not available',
        errorCode: self.READY_STATE_CHANGE_ERROR.NO_WEBRTC_SUPPORT
      }, self._selectedRoom);
      return;
    }

    self._getCodecsSupport(function (error) {
      if (error) {
        self._log.error(error);
        self._readyState = -1;
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
          status: null,
          content: error.message || error.toString(),
          errorCode: self.READY_STATE_CHANGE_ERROR.PARSE_CODECS
        }, self._selectedRoom);
        return;
      }

      if (Object.keys(self._currentCodecSupport.audio).length === 0 && Object.keys(self._currentCodecSupport.video).length === 0) {
        self._log.error('No audio/video codecs available to start connection.');
        self._readyState = -1;
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
          status: null,
          content: 'No audio/video codecs available to start connection',
          errorCode: self.READY_STATE_CHANGE_ERROR.PARSE_CODECS
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
    self._log.error('Invalid room provided. Room:', room);
    return;
  }
  var defaultRoom = self._defaultRoom;
  var initOptions = {
    appKey: self._appKey,
    roomServer: self._roomServer,
    defaultRoom: room,
    enableDataChannel: self._enableDataChannel,
    enableIceTrickle: self._enableIceTrickle,
    enableTURNServer: self._enableTURN,
    enableSTUNServer: self._enableSTUN,
    TURNServerTransport: self._TURNTransport,
    audioFallback: self._audioFallback,
    forceSSL: self._forceSSL,
    socketTimeout: self._socketTimeout,
    forceTURNSSL: self._forceTURNSSL,
    audioCodec: self._selectedAudioCodec,
    videoCodec: self._selectedVideoCodec,
    forceTURN: self._forceTURN,
    usePublicSTUN: self._usePublicSTUN,
    disableVideoFecCodecs: self._disableVideoFecCodecs,
    disableComfortNoiseCodec: self._disableComfortNoiseCodec,
    disableREMB: self._disableREMB,
    filterCandidatesType: self._filterCandidatesType,
    throttleIntervals: self._throttlingTimeouts,
    throttleShouldThrowError: self._throttlingShouldThrowError,
    mcuUseRenegoRestart: self._mcuUseRenegoRestart,
    iceServer: self._turnServer,
    socketServer: self._socketServer
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
      callback(error, null);
    } else {
      callback(null, success);
    }
  });
};


Skylink.prototype._trigger = function(eventName) {
  //convert the arguments into an array
  var args = Array.prototype.slice.call(arguments);
  var arr = this._EVENTS[eventName];
  var once = this._onceEvents[eventName] || null;
  args.shift(); //Omit the first argument since it's the event name
  if (arr) {
    // for events subscribed forever
    for (var i = 0; i < arr.length; i++) {
      try {
        this._log.log([null, 'Event', eventName, 'Event is fired']);
        if(arr[i].apply(this, args) === false) {
          break;
        }
      } catch(error) {
        this._log.error([null, 'Event', eventName, 'Exception occurred in event:'], error);
        throw error;
      }
    }
  }
  if (once){
    // for events subscribed on once
    for (var j = 0; j < once.length; j++) {
      if (once[j][1].apply(this, args) === true) {
        this._log.log([null, 'Event', eventName, 'Condition is met. Firing event']);
        if(once[j][0].apply(this, args) === false) {
          break;
        }
        if (once[j] && !once[j][2]) {
          this._log.log([null, 'Event', eventName, 'Removing event after firing once']);
          once.splice(j, 1);
          //After removing current element, the next element should be element of the same index
          j--;
        }
      } else {
        this._log.log([null, 'Event', eventName, 'Condition is still not met. ' +
          'Holding event from being fired']);
      }
    }
  }
  this._log.log([null, 'Event', eventName, 'Event is triggered']);
};



/**
 * Function that checks if the current state condition is met before subscribing
 *   event handler to wait for condition to be fulfilled.
 * @method _condition
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._condition = function(eventName, callback, checkFirst, condition, fireAlways) {
  if (typeof condition === 'boolean') {
    fireAlways = condition;
    condition = null;
  }
  if (typeof callback === 'function' && typeof checkFirst === 'function') {
    if (checkFirst()) {
      this._log.log([null, 'Event', eventName, 'First condition is met. Firing callback']);
      callback();
      return;
    }
    this._log.log([null, 'Event', eventName, 'First condition is not met. Subscribing to event']);
    this.once(eventName, callback, condition, fireAlways);
  } else {
    this._log.error([null, 'Event', eventName, 'Provided callback or checkFirst is not a function']);
  }
};

/**
 * Function that starts an interval check to wait for a condition to be resolved.
 * @method _wait
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._wait = function(callback, condition, intervalTime, fireAlways) {
  fireAlways = (typeof fireAlways === 'undefined' ? false : fireAlways);
  if (typeof callback === 'function' && typeof condition === 'function') {
    if (condition()) {
      this._log.log([null, 'Event', null, 'Condition is met. Firing callback']);
      callback();
      return;
    }
    this._log.log([null, 'Event', null, 'Condition is not met. Doing a check.']);

    intervalTime = (typeof intervalTime === 'number') ? intervalTime : 50;

    var doWait = setInterval(function () {
      if (condition()) {
        this._log.log([null, 'Event', null, 'Condition is met after waiting. Firing callback']);
        if (!fireAlways){
          clearInterval(doWait);
        }
        callback();
      }
    }, intervalTime);
  } else {
    if (typeof callback !== 'function'){
      this._log.error([null, 'Event', null, 'Provided callback is not a function']);
    }
    if (typeof condition !== 'function'){
      this._log.error([null, 'Event', null, 'Provided condition is not a function']);
    }
  }
};

/**
 * Function that throttles a method function to prevent multiple invokes over a specified amount of time.
 * Returns a function to be invoked <code>._throttle(fn, 1000)()</code> to make throttling functionality work.
 * @method _throttle
 * @private
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._throttle = function(func, prop, wait){
  var self = this;
  var now = (new Date()).getTime();

  if (!(self._timestamp[prop] && ((now - self._timestamp[prop]) < wait))) {
    func(true);
    self._timestamp[prop] = now;
  } else {
    func(false);
  }
};
Skylink.prototype._sendChannelMessage = function(message) {
  var self = this;
  var interval = 1000;
  var throughput = 16;

  if (!self._channelOpen || !self._user || !self._socket) {
    self._log.warn([message.target || 'Server', 'Socket', message.type, 'Dropping of message as Socket connection is not opened or is at ' +
      'incorrect step ->'], message);
    return;
  }

  if (self._user.sid && !self._peerMessagesStamps[self._user.sid]) {
    self._peerMessagesStamps[self._user.sid] = {
      userData: 0,
      audioMuted: 0,
      videoMuted: 0
    };
  }

  var checkStampFn = function (statusMessage) {
    if (statusMessage.type === self._SIG_MESSAGE_TYPE.UPDATE_USER) {
      if (!self._user.sid) {
        return false;
      }
      return statusMessage.stamp > self._peerMessagesStamps[self._user.sid].userData;
    } else if (statusMessage.type === self._SIG_MESSAGE_TYPE.MUTE_VIDEO) {
      if (!self._user.sid) {
        return false;
      }
      return statusMessage.stamp > self._peerMessagesStamps[self._user.sid].videoMuted;
    } else if (statusMessage.type === self._SIG_MESSAGE_TYPE.MUTE_AUDIO) {
      if (!self._user.sid) {
        return false;
      }
      return statusMessage.stamp > self._peerMessagesStamps[self._user.sid].audioMuted;
    }
    return true;
  };

  var setStampFn = function (statusMessage) {
    if (statusMessage.type === self._SIG_MESSAGE_TYPE.UPDATE_USER) {
      self._peerMessagesStamps[self._user.sid].userData = statusMessage.stamp;
    } else if (statusMessage.type === self._SIG_MESSAGE_TYPE.MUTE_VIDEO) {
      self._peerMessagesStamps[self._user.sid].videoMuted = statusMessage.stamp;
    } else if (statusMessage.type === self._SIG_MESSAGE_TYPE.MUTE_AUDIO) {
      self._peerMessagesStamps[self._user.sid].audioMuted = statusMessage.stamp;
    }
  };

  var setQueueFn = function () {
    self._log.debug([null, 'Socket', null, 'Starting queue timeout']);

    self._socketMessageTimeout = setTimeout(function () {
      if (((new Date ()).getTime() - self._timestamp.socketMessage) <= interval) {
        self._log.debug([null, 'Socket', null, 'Restarting queue timeout']);
        setQueueFn();
        return;
      }
      startSendingQueuedMessageFn();
    }, interval - ((new Date ()).getTime() - self._timestamp.socketMessage));
  };

  var triggerEventFn = function (eventMessage) {
    if (eventMessage.type === self._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE) {
      self._trigger('incomingMessage', {
        content: eventMessage.data,
        isPrivate: false,
        targetPeerId: null,
        listOfPeers: Object.keys(self._peerInformations),
        isDataChannel: false,
        senderPeerId: self._user.sid
      }, self._user.sid, self.getPeerInfo(), true);
    }
  };

  var sendGroupMessageFn = function (groupMessageList) {
    self._socketMessageTimeout = null;

    if (!self._channelOpen || !(self._user && self._user.sid) || !self._socket) {
      self._log.warn([message.target || 'Server', 'Socket', null, 'Dropping of group messages as Socket connection is not opened or is at ' +
        'incorrect step ->'], groupMessageList);
      return;
    }

    var strGroupMessageList = [];
    var stamps = {
      userData: 0,
      audioMuted: 0,
      videoMuted: 0
    };

    for (var k = 0; k < groupMessageList.length; k++) {
      if (checkStampFn(groupMessageList[k])) {
        if (groupMessageList[k].type === self._SIG_MESSAGE_TYPE.UPDATE_USER &&
          groupMessageList[k].stamp > self._peerMessagesStamps[self._user.sid].userData &&
          groupMessageList[k].stamp > stamps.userData) {
          stamps.userData = groupMessageList[k].stamp;
        } else if (groupMessageList[k].type === self._SIG_MESSAGE_TYPE.MUTE_AUDIO &&
          groupMessageList[k].stamp > self._peerMessagesStamps[self._user.sid].audioMuted &&
          groupMessageList[k].stamp > stamps.audioMuted) {
          stamps.audioMuted = groupMessageList[k].stamp;
        } else if (groupMessageList[k].type === self._SIG_MESSAGE_TYPE.MUTE_VIDEO &&
          groupMessageList[k].stamp > self._peerMessagesStamps[self._user.sid].videoMuted &&
          groupMessageList[k].stamp > stamps.videoMuted) {
          stamps.videoMuted = groupMessageList[k].stamp;
        }
      }
    }

    for (var i = 0; i < groupMessageList.length; i++) {
      if ((groupMessageList[i].type === self._SIG_MESSAGE_TYPE.UPDATE_USER &&
          groupMessageList[i].stamp < stamps.userData) ||
          (groupMessageList[i].type === self._SIG_MESSAGE_TYPE.MUTE_AUDIO &&
          groupMessageList[i].stamp < stamps.audioMuted) ||
          (groupMessageList[i].type === self._SIG_MESSAGE_TYPE.MUTE_VIDEO &&
          groupMessageList[i].stamp < stamps.videoMuted)) {
        self._log.warn([message.target || 'Server', 'Socket', groupMessageList[i], 'Dropping of outdated status message ->'],
          UtilsFactory.clone(groupMessageList[i]));
        groupMessageList.splice(i, 1);
        i--;
        continue;
      }
      strGroupMessageList.push(JSON.stringify(groupMessageList[i]));
    }

    if (strGroupMessageList.length > 0) {
      var groupMessage = {
        type: self._SIG_MESSAGE_TYPE.GROUP,
        lists: strGroupMessageList,
        mid: self._user.sid,
        rid: self._room.id
      };

      self._log.debug([message.target || 'Server', 'Socket', groupMessage.type,
        'Sending queued grouped message (max: 16 per group) ->'], UtilsFactory.clone(groupMessage));

      self._socket.send(JSON.stringify(groupMessage));
      self._timestamp.socketMessage = (new Date()).getTime();

      for (var j = 0; j < groupMessageList.length; j++) {
        setStampFn(groupMessageList[j]);
        triggerEventFn(groupMessageList[j]);
      }
    }
  };

  var startSendingQueuedMessageFn = function(){
    if (self._socketMessageQueue.length > 0){
      if (self._socketMessageQueue.length < throughput){
        sendGroupMessageFn(self._socketMessageQueue.splice(0, self._socketMessageQueue.length));
      } else {
        sendGroupMessageFn(self._socketMessageQueue.splice(0, throughput));
        setQueueFn();
      }
    }
  };

  if (self._groupMessageList.indexOf(message.type) > -1) {
    if (!(self._timestamp.socketMessage && ((new Date ()).getTime() - self._timestamp.socketMessage) <= interval)) {
      if (!checkStampFn(message)) {
        self._log.warn([message.target || 'Server', 'Socket', message.type, 'Dropping of outdated status message ->'], UtilsFactory.clone(message));
        return;
      }
      if (self._socketMessageTimeout) {
        clearTimeout(self._socketMessageTimeout);
      }
      self._log.warn([message.target || 'Server', 'Socket', message.type, 'Sending message ->'], UtilsFactory.clone(message));
      self._socket.send(JSON.stringify(message));
      setStampFn(message);
      triggerEventFn(message);

      self._timestamp.socketMessage = (new Date()).getTime();

    } else {
      self._log.warn([message.target || 'Server', 'Socket', message.type,
        'Queueing socket message to prevent message drop ->'], UtilsFactory.clone(message));

      self._socketMessageQueue.push(message);

      if (!self._socketMessageTimeout) {
        setQueueFn();
      }
    }
  } else {
    self._log.debug([message.target || 'Server', 'Socket', message.type, 'Sending message ->'], UtilsFactory.clone(message));
    self._socket.send(JSON.stringify(message));

    // If Peer sends "bye" on its own, we trigger it as session disconnected abruptly
    if (message.type === self._SIG_MESSAGE_TYPE.BYE && self._inRoom &&
      self._user && self._user.sid && message.mid === self._user.sid) {
      self.leaveRoom(false);
      self._trigger('sessionDisconnect', self._user.sid, self.getPeerInfo());
    }
  }
};

/**
 * Function that creates and opens a socket connection to the Signaling.
 * @method _createSocket
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._createSocket = function (type) {
  var self = this;
  var options = {
    forceNew: true,
    reconnection: true,
    timeout: self._socketTimeout,
    reconnectionAttempts: 2,
    reconnectionDelayMax: 5000,
    reconnectionDelay: 1000,
    transports: ['websocket']
  };
  var ports = self._socketPorts[self._signalingServerProtocol];
  var fallbackType = null;

  // just beginning
  if (self._signalingServerPort === null) {
    self._signalingServerPort = ports[0];
    self._socketSession.finalAttempts = 0;
    self._socketSession.attempts = 0;
    fallbackType = self.SOCKET_FALLBACK.NON_FALLBACK;

  // reached the end of the last port for the protocol type
  } else if (ports.indexOf(self._signalingServerPort) === ports.length - 1) {
    // re-refresh to long-polling port
    if (type === 'WebSocket') {
      type = 'Polling';
      self._signalingServerPort = ports[0];
    } else {
      self._socketSession.finalAttempts++;
    }
  // move to the next port
  } else {
    self._signalingServerPort = ports[ ports.indexOf(self._signalingServerPort) + 1 ];
  }

  if (type === 'Polling') {
    options.reconnectionDelayMax = 1000;
    options.reconnectionAttempts = 4;
    options.transports = ['xhr-polling', 'jsonp-polling', 'polling'];
  }

  var url = self._signalingServerProtocol + '//' + (self._socketServer || self._signalingServer) + ':' + self._signalingServerPort;
    //'http://ec2-52-8-93-170.us-west-1.compute.amazonaws.com:6001';

  self._socketSession.transportType = type;
  self._socketSession.socketOptions = options;
  self._socketSession.socketServer = url;

  if (fallbackType === null) {
    fallbackType = self._signalingServerProtocol === 'http:' ?
      (type === 'Polling' ? self.SOCKET_FALLBACK.LONG_POLLING : self.SOCKET_FALLBACK.FALLBACK_PORT) :
      (type === 'Polling' ? self.SOCKET_FALLBACK.LONG_POLLING_SSL : self.SOCKET_FALLBACK.FALLBACK_SSL_PORT);

    self._socketSession.attempts++;
    self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ATTEMPT, null, fallbackType, UtilsFactory.clone(self._socketSession));
    self._trigger('channelRetry', fallbackType, self._socketSession.attempts, UtilsFactory.clone(self._socketSession));
  }

  // if socket instance already exists, exit
  if (self._socket) {
    self._socket.removeAllListeners('connect_error');
    self._socket.removeAllListeners('reconnect_attempt');
    self._socket.removeAllListeners('reconnect_error');
    self._socket.removeAllListeners('reconnect_failed');
    self._socket.removeAllListeners('connect');
    self._socket.removeAllListeners('reconnect');
    self._socket.removeAllListeners('error');
    self._socket.removeAllListeners('disconnect');
    self._socket.removeAllListeners('message');
    self._socket.disconnect();
    self._socket = null;
  }

  self._channelOpen = false;

  self._log.log('Opening channel with signaling server url:', UtilsFactory.clone(self._socketSession));

  self._socket = io.connect(url, options);

  self._socket.on('reconnect_attempt', function (attempt) {
    self._socketSession.attempts++;
    self._trigger('channelRetry', fallbackType, self._socketSession.attempts, UtilsFactory.clone(self._socketSession));
  });

  self._socket.on('reconnect_failed', function () {
    if (fallbackType === self.SOCKET_FALLBACK.NON_FALLBACK) {
      self._trigger('socketError', self.SOCKET_ERROR.CONNECTION_FAILED, new Error('Failed connection with transport "' +
        type + '" and port ' + self._signalingServerPort + '.'), fallbackType, UtilsFactory.clone(self._socketSession));
    } else {
      self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_FAILED, new Error('Failed reconnection with transport "' +
        type + '" and port ' + self._signalingServerPort + '.'), fallbackType, UtilsFactory.clone(self._socketSession));
    }

    if (self._socketSession.finalAttempts < 4) {
      self._createSocket(type);
    } else {
      self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ABORTED, new Error('Reconnection aborted as ' +
        'there no more available ports, transports and final attempts left.'), fallbackType, UtilsFactory.clone(self._socketSession));
    }
  });

  self._socket.on('connect', function () {
    if (!self._channelOpen) {
      self._log.log([null, 'Socket', null, 'Channel opened']);
      self._channelOpen = true;
      self._trigger('channelOpen', UtilsFactory.clone(self._socketSession));
    }
  });

  self._socket.on('reconnect', function () {
    if (!self._channelOpen) {
      self._log.log([null, 'Socket', null, 'Channel opened']);
      self._channelOpen = true;
      self._trigger('channelOpen', UtilsFactory.clone(self._socketSession));
    }
  });

  self._socket.on('error', function(error) {
    self._log.error([null, 'Socket', null, 'Exception occurred ->'], error);
    self._trigger('channelError', error, UtilsFactory.clone(self._socketSession));
  });

  self._socket.on('disconnect', function() {
    self._channelOpen = false;
    self._trigger('channelClose', UtilsFactory.clone(self._socketSession));
    self._log.log([null, 'Socket', null, 'Channel closed']);

    if (self._inRoom && self._user && self._user.sid) {
      self.leaveRoom(false);
      self._trigger('sessionDisconnect', self._user.sid, self.getPeerInfo());
    }
  });

  self._socket.on('message', function(messageStr) {
    var message = JSON.parse(messageStr);

    self._log.log([null, 'Socket', null, 'Received message ->'], message);

    if (message.type === self._SIG_MESSAGE_TYPE.GROUP) {
      self._log.debug('Bundle of ' + message.lists.length + ' messages');
      for (var i = 0; i < message.lists.length; i++) {
        var indiMessage = JSON.parse(message.lists[i]);
        self._processSigMessage(indiMessage);
        self._trigger('channelMessage', indiMessage, UtilsFactory.clone(self._socketSession));
      }
    } else {
      self._processSigMessage(message);
      self._trigger('channelMessage', message, UtilsFactory.clone(self._socketSession));
    }
  });
};

/**
 * Function that starts the socket connection to the Signaling.
 * This starts creating the socket connection and called at first not when requiring to fallback.
 * @method _openChannel
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._openChannel = function() {
  var self = this;
  if (self._channelOpen) {
    self._log.error([null, 'Socket', null, 'Unable to instantiate a new channel connection ' +
      'as there is already an ongoing channel connection']);
    return;
  }

  if (self._readyState !== self.READY_STATE_CHANGE.COMPLETED) {
    self._log.error([null, 'Socket', null, 'Unable to instantiate a new channel connection ' +
      'as readyState is not ready']);
    return;
  }

  // set if forceSSL
  if (self._forceSSL) {
    self._signalingServerProtocol = 'https:';
  } else {
    self._signalingServerProtocol = window.location.protocol;
  }

  var socketType = 'WebSocket';

  // For IE < 9 that doesn't support WebSocket
  if (!window.WebSocket) {
    socketType = 'Polling';
  }

  self._signalingServerPort = null;

  // Begin with a websocket connection
  self._createSocket(socketType);
};

/**
 * Function that stops the socket connection to the Signaling.
 * @method _closeChannel
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._closeChannel = function() {
  if (this._socket) {
    this._socket.removeAllListeners('connect_error');
    this._socket.removeAllListeners('reconnect_attempt');
    this._socket.removeAllListeners('reconnect_error');
    this._socket.removeAllListeners('reconnect_failed');
    this._socket.removeAllListeners('connect');
    this._socket.removeAllListeners('reconnect');
    this._socket.removeAllListeners('error');
    this._socket.removeAllListeners('disconnect');
    this._socket.removeAllListeners('message');
  }

  if (this._channelOpen) {
    if (this._socket) {
      this._socket.disconnect();
    }

    this._log.log([null, 'Socket', null, 'Channel closed']);

    this._channelOpen = false;
    this._trigger('channelClose', UtilsFactory.clone(this._socketSession));
  }

  this._socket = null;
};
Skylink.prototype._processSigMessage = function(message, session) {
  var origin = message.mid;
  if (!origin || origin === this._user.sid) {
    origin = 'Server';
  }
  this._log.debug([origin, 'Socket', message.type, 'Received from peer ->'], UtilsFactory.clone(message));
  if (message.mid === this._user.sid &&
    message.type !== this._SIG_MESSAGE_TYPE.REDIRECT &&
    message.type !== this._SIG_MESSAGE_TYPE.IN_ROOM) {
    this._log.debug([origin, 'Socket', message.type, 'Ignoring message ->'], UtilsFactory.clone(message));
    return;
  }
  switch (message.type) {
  //--- BASIC API Messages ----
  case this._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE:
    this._publicMessageHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.PRIVATE_MESSAGE:
    this._privateMessageHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.IN_ROOM:
    this._inRoomHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.ENTER:
    this._enterHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.WELCOME:
    this._welcomeHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.RESTART:
    this._restartHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.OFFER:
    this._offerHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.ANSWER:
    this._answerHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.CANDIDATE:
    this._candidateHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.BYE:
    this._byeHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.REDIRECT:
    this._redirectHandler(message);
    break;
    //--- ADVANCED API Messages ----
  case this._SIG_MESSAGE_TYPE.UPDATE_USER:
    this._updateUserEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.MUTE_VIDEO:
    this._muteVideoEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.MUTE_AUDIO:
    this._muteAudioEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.STREAM:
    this._streamEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.ROOM_LOCK:
    this._roomLockEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.PEER_LIST:
    this._peerListEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.INTRODUCE_ERROR:
    this._introduceErrorEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.APPROACH:
    this._approachEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.RECORDING:
    this._recordingEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.END_OF_CANDIDATES:
    this._endOfCandidatesHandler(message);
    break;
  default:
    this._log.error([message.mid, 'Socket', message.type, 'Unsupported message ->'], UtilsFactory.clone(message));
    break;
  }
};

/**
 * Function that handles the "peerList" socket message received.
 * See confluence docs for the "peerList" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _peerListEventHandler
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._peerListEventHandler = function(message){
  var self = this;
  self._peerList = message.result;
  self._log.log(['Server', null, message.type, 'Received list of peers'], self._peerList);
  self._trigger('getPeersStateChange',self.GET_PEERS_STATE.RECEIVED, self._user.sid, self._peerList);
};

/**
 * Function that handles the "endOfCandidates" socket message received.
 * See confluence docs for the "endOfCandidates" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _endOfCandidatesHandler
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._endOfCandidatesHandler = function(message){
  var self = this;
  var targetMid = message.mid;

  if (!(self._peerConnections[targetMid] &&
    self._peerConnections[targetMid].signalingState !== self.PEER_CONNECTION_STATE.CLOSED)) {
    return;
  }

  self._peerEndOfCandidatesCounter[targetMid].expectedLen = message.noOfExpectedCandidates || 0;
  self._signalingEndOfCandidates(targetMid);
};

/**
 * Function that handles the "introduceError" socket message received.
 * See confluence docs for the "introduceError" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _introduceErrorEventHandler
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._introduceErrorEventHandler = function(message){
  var self = this;
  self._log.log(['Server', null, message.type, 'Introduce failed. Reason: '+message.reason]);
  self._trigger('introduceStateChange',self.INTRODUCE_STATE.ERROR, self._user.sid,
    message.sendingPeerId, message.receivingPeerId, message.reason);
};

/**
 * Function that handles the "approach" socket message received.
 * See confluence docs for the "approach" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _approachEventHandler
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._approachEventHandler = function(message){
  var self = this;
  self._log.log(['Server', null, message.type, 'Approaching peer'], message.target);
  // self._room.connection.peerConfig = self._setIceServers(message.pc_config);
  // self._inRoom = true;
  self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, self._user.sid);

  var enterMsg = {
    type: self._SIG_MESSAGE_TYPE.ENTER,
    mid: self._user.sid,
    rid: self._room.id,
    agent: window.webrtcDetectedBrowser,
    version: (window.webrtcDetectedVersion || 0).toString(),
    os: window.navigator.platform,
    userInfo: self._getUserInfo(),
    receiveOnly: self.getPeerInfo().config.receiveOnly,
    target: message.target,
    weight: self._peerPriorityWeight,
    temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
    enableIceTrickle: self._enableIceTrickle,
    enableDataChannel: self._enableDataChannel,
    enableIceRestart: self._enableIceRestart,
    SMProtocolVersion: self.SM_PROTOCOL_VERSION,
    DTProtocolVersion: self.DT_PROTOCOL_VERSION
  };

  if (self._publishOnly) {
    enterMsg.publishOnly = {
      type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
    };
  }

  if (self._parentId) {
    enterMsg.parentId = self._parentId;
  }

  self._sendChannelMessage(enterMsg);
};

/**
 * Function that handles the "redirect" socket message received.
 * See confluence docs for the "redirect" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _redirectHandler
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._redirectHandler = function(message) {
  this._log.log(['Server', null, message.type, 'System action warning:'], {
    message: message.info,
    reason: message.reason,
    action: message.action
  });

  if (message.action === this.SYSTEM_ACTION.REJECT) {
  	for (var key in this._peerConnections) {
  		if (this._peerConnections.hasOwnProperty(key)) {
  			this._removePeer(key);
  		}
  	}
  }

  // Handle the differences provided in Signaling server
  if (message.reason === 'toClose') {
    message.reason = 'toclose';
  }

  this._trigger('systemAction', message.action, message.info, message.reason);
};

/**
 * Function that handles the "updateUserEvent" socket message received.
 * See confluence docs for the "updateUserEvent" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _updateUserEventHandler
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._updateUserEventHandler = function(message) {
  var targetMid = message.mid;
  this._log.log([targetMid, null, message.type, 'Peer updated userData:'], message.userData);
  if (this._peerInformations[targetMid]) {
    if (this._peerMessagesStamps[targetMid] && typeof message.stamp === 'number') {
      if (message.stamp < this._peerMessagesStamps[targetMid].userData) {
        this._log.warn([targetMid, null, message.type, 'Dropping outdated status ->'], message);
        return;
      }
      this._peerMessagesStamps[targetMid].userData = message.stamp;
    }
    this._peerInformations[targetMid].userData = message.userData || {};
    this._trigger('peerUpdated', targetMid, this.getPeerInfo(targetMid), false);
  } else {
    this._log.log([targetMid, null, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Function that handles the "roomLockEvent" socket message received.
 * See confluence docs for the "roomLockEvent" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _roomLockEventHandler
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._roomLockEventHandler = function(message) {
  var targetMid = message.mid;
  this._log.log([targetMid, message.type, 'Room lock status:'], message.lock);
  this._trigger('roomLock', message.lock, targetMid, this.getPeerInfo(targetMid), false);
};

/**
 * Function that handles the "muteAudioEvent" socket message received.
 * See confluence docs for the "muteAudioEvent" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _muteAudioEventHandler
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._muteAudioEventHandler = function(message) {
  var targetMid = message.mid;
  this._log.log([targetMid, null, message.type, 'Peer\'s audio muted:'], message.muted);
  if (this._peerInformations[targetMid]) {
    if (this._peerMessagesStamps[targetMid] && typeof message.stamp === 'number') {
      if (message.stamp < this._peerMessagesStamps[targetMid].audioMuted) {
        this._log.warn([targetMid, null, message.type, 'Dropping outdated status ->'], message);
        return;
      }
      this._peerMessagesStamps[targetMid].audioMuted = message.stamp;
    }
    this._peerInformations[targetMid].mediaStatus.audioMuted = message.muted;
    this._trigger('streamMuted', targetMid, this.getPeerInfo(targetMid), false,
      this._peerInformations[targetMid].settings.video &&
      this._peerInformations[targetMid].settings.video.screenshare);
    this._trigger('peerUpdated', targetMid, this.getPeerInfo(targetMid), false);
  } else {
    this._log.log([targetMid, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Function that handles the "muteVideoEvent" socket message received.
 * See confluence docs for the "muteVideoEvent" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _muteVideoEventHandler
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._muteVideoEventHandler = function(message) {
  var targetMid = message.mid;
  this._log.log([targetMid, null, message.type, 'Peer\'s video muted:'], message.muted);
  if (this._peerInformations[targetMid]) {
    if (this._peerMessagesStamps[targetMid] && typeof message.stamp === 'number') {
      if (message.stamp < this._peerMessagesStamps[targetMid].videoMuted) {
        this._log.warn([targetMid, null, message.type, 'Dropping outdated status ->'], message);
        return;
      }
      this._peerMessagesStamps[targetMid].videoMuted = message.stamp;
    }
    this._peerInformations[targetMid].mediaStatus.videoMuted = message.muted;
    this._trigger('streamMuted', targetMid, this.getPeerInfo(targetMid), false,
      this._peerInformations[targetMid].settings.video &&
      this._peerInformations[targetMid].settings.video.screenshare);
    this._trigger('peerUpdated', targetMid, this.getPeerInfo(targetMid), false);
  } else {
    this._log.log([targetMid, null, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Function that handles the "stream" socket message received.
 * See confluence docs for the "stream" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _streamEventHandler
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._streamEventHandler = function(message) {
  var targetMid = message.mid;
  this._log.log([targetMid, null, message.type, 'Peer\'s stream status:'], message.status);

  if (this._peerInformations[targetMid] && message.streamId) {
    this._streamsSession[targetMid] = this._streamsSession[targetMid] || {};
    if (message.status === 'ended') {
      if (message.settings && typeof message.settings === 'object' &&
        typeof this._streamsSession[targetMid][message.streamId] === 'undefined') {
        this._streamsSession[targetMid][message.streamId] = {
          audio: message.settings.audio,
          video: message.settings.video
        };
      }

      this._handleEndedStreams(targetMid, message.streamId);
  	}
  } else {
    // Probably left the room already
    this._log.log([targetMid, null, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Function that handles the "bye" socket message received.
 * See confluence docs for the "bye" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _byeHandler
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._byeHandler = function(message) {
  var targetMid = message.mid;
  var selfId = (this._user || {}).sid;

  if (selfId !== targetMid){
    this._log.log([targetMid, null, message.type, 'Peer has left the room']);
    this._removePeer(targetMid);
  } else {
    this._log.log([targetMid, null, message.type, 'Self has left the room']);
  }
};

/**
 * Function that handles the "private" socket message received.
 * See confluence docs for the "private" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _privateMessageHandler
 * @private
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype._privateMessageHandler = function(message) {
  var targetMid = message.mid;
  this._log.log([targetMid, null, message.type,
    'Received private message from peer:'], message.data);
  this._trigger('incomingMessage', {
    content: message.data,
    isPrivate: true,
    targetPeerId: message.target, // is not null if there's user
    isDataChannel: false,
    senderPeerId: targetMid
  }, targetMid, this.getPeerInfo(targetMid), false);
};

/**
 * Function that handles the "public" socket message received.
 * See confluence docs for the "public" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _publicMessageHandler
 * @private
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype._publicMessageHandler = function(message) {
  var targetMid = message.mid;
  this._log.log([targetMid, null, message.type,
    'Received public message from peer:'], message.data);
  this._trigger('incomingMessage', {
    content: message.data,
    isPrivate: false,
    targetPeerId: null, // is not null if there's user
    isDataChannel: false,
    senderPeerId: targetMid
  }, targetMid, this.getPeerInfo(targetMid), false);
};

/**
 * Handles the RECORDING Protocol message event received from the platform signaling.
 * @method _recordingEventHandler
 * @param {JSON} message The message object received from platform signaling.
 *    This should contain the <code>RECORDING</code> payload.
 * @param {String} message.url The recording URL if mixing has completed.
 * @param {String} message.action The recording action received.
 * @param {String} message.error The recording error exception received.
 * @private
 * @beta
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._recordingEventHandler = function (message) {
  var self = this;

  self._log.debug(['MCU', 'Recording', null, 'Received recording message ->'], message);

  if (message.action === 'on') {
    if (!self._recordings[message.recordingId]) {
      self._log.debug(['MCU', 'Recording', message.recordingId, 'Started recording']);

      self._currentRecordingId = message.recordingId;
      self._recordings[message.recordingId] = {
        active: true,
        state: self.RECORDING_STATE.START,
        startedDateTime: (new Date()).toISOString(),
        endedDateTime: null,
        mixingDateTime: null,
        links: null,
        error: null
      };
      self._recordingStartInterval = setTimeout(function () {
        self._log.log(['MCU', 'Recording', message.recordingId, '4 seconds has been recorded. Recording can be stopped now']);
        self._recordingStartInterval = null;
      }, 4000);
      self._trigger('recordingState', self.RECORDING_STATE.START, message.recordingId, null, null);
    }

  } else if (message.action === 'off') {
    if (!self._recordings[message.recordingId]) {
      self._log.error(['MCU', 'Recording', message.recordingId, 'Received request of "off" but the session is empty']);
      return;
    }

    self._currentRecordingId = null;

    if (self._recordingStartInterval) {
      clearTimeout(self._recordingStartInterval);
      self._log.warn(['MCU', 'Recording', message.recordingId, 'Recording stopped abruptly before 4 seconds']);
      self._recordingStartInterval = null;
    }

    self._log.debug(['MCU', 'Recording', message.recordingId, 'Stopped recording']);

    self._recordings[message.recordingId].active = false;
    self._recordings[message.recordingId].state = self.RECORDING_STATE.STOP;
    self._recordings[message.recordingId].endedDateTime = (new Date()).toISOString();
    self._trigger('recordingState', self.RECORDING_STATE.STOP, message.recordingId, null, null);

  } else if (message.action === 'url') {
    if (!self._recordings[message.recordingId]) {
      self._log.error(['MCU', 'Recording', message.recordingId, 'Received URL but the session is empty']);
      return;
    }

    var links = {};

    if (Array.isArray(message.urls)) {
      for (var i = 0; i < message.urls.length; i++) {
        links[messages.urls[i].id || ''] = messages.urls[i].url || '';
      }
    } else if (typeof message.url === 'string') {
      links.mixin = message.url;
    }

    self._recordings[message.recordingId].links = links;
    self._recordings[message.recordingId].state = self.RECORDING_STATE.LINK;
    self._recordings[message.recordingId].mixingDateTime = (new Date()).toISOString();
    self._trigger('recordingState', self.RECORDING_STATE.LINK, message.recordingId, links, null);

  } else {
    var recordingError = new Error(message.error || 'Unknown error');
    if (!self._recordings[message.recordingId]) {
      self._log.error(['MCU', 'Recording', message.recordingId, 'Received error but the session is empty ->'], recordingError);
      return;
    }

    self._log.error(['MCU', 'Recording', message.recordingId, 'Recording failure ->'], recordingError);

    self._recordings[message.recordingId].state = self.RECORDING_STATE.ERROR;
    self._recordings[message.recordingId].error = recordingError;

    if (self._recordings[message.recordingId].active) {
      self._log.debug(['MCU', 'Recording', message.recordingId, 'Stopped recording abruptly']);
      self._recordings[message.recordingId].active = false;
      //self._trigger('recordingState', self.RECORDING_STATE.STOP, message.recordingId, null, recordingError);
    }

    self._trigger('recordingState', self.RECORDING_STATE.ERROR, message.recordingId, null, recordingError);
  }
};

/**
 * Function that handles the "inRoom" socket message received.
 * See confluence docs for the "inRoom" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _inRoomHandler
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._inRoomHandler = function(message) {
  var self = this;
  self._log.log(['Server', null, message.type, 'User is now in the room and ' +
    'functionalities are now available. Config received:'], message.pc_config);
  self._room.connection.peerConfig = self._setIceServers(message.pc_config);
  self._inRoom = true;
  self._user.sid = message.sid;
  self._peerPriorityWeight = message.tieBreaker;

  self._trigger('peerJoined', self._user.sid, self.getPeerInfo(), true);
  self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, self._user.sid);

  var streamId = null;

  if (self._streams.screenshare && self._streams.screenshare.stream) {
    streamId = self._streams.screenshare.stream.id || self._streams.screenshare.stream.label;
    self._trigger('incomingStream', self._user.sid, self._streams.screenshare.stream, true, self.getPeerInfo(), true, streamId);
  } else if (self._streams.userMedia && self._streams.userMedia.stream) {
    streamId = self._streams.userMedia.stream.id || self._streams.userMedia.stream.label;
    self._trigger('incomingStream', self._user.sid, self._streams.userMedia.stream, true, self.getPeerInfo(), false, streamId);
  }
  // NOTE ALEX: should we wait for local streams?
  // or just go with what we have (if no stream, then one way?)
  // do we hardcode the logic here, or give the flexibility?
  // It would be better to separate, do we could choose with whom
  // we want to communicate, instead of connecting automatically to all.
  var enterMsg = {
    type: self._SIG_MESSAGE_TYPE.ENTER,
    mid: self._user.sid,
    rid: self._room.id,
    agent: window.webrtcDetectedBrowser,
    version: (window.webrtcDetectedVersion || 0).toString(),
    os: window.navigator.platform,
    userInfo: self._getUserInfo(),
    receiveOnly: self.getPeerInfo().config.receiveOnly,
    weight: self._peerPriorityWeight,
    temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
    enableIceTrickle: self._enableIceTrickle,
    enableDataChannel: self._enableDataChannel,
    enableIceRestart: self._enableIceRestart,
    SMProtocolVersion: self.SM_PROTOCOL_VERSION,
    DTProtocolVersion: self.DT_PROTOCOL_VERSION
  };

  if (self._publishOnly) {
    enterMsg.publishOnly = {
      type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
    };
  }

  if (self._parentId) {
    enterMsg.parentId = self._parentId;
  }

  self._sendChannelMessage(enterMsg);
};

/**
 * Function that handles the "enter" socket message received.
 * See confluence docs for the "enter" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _enterHandler
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._enterHandler = function(message) {
  var self = this;
  var targetMid = message.mid;
  var isNewPeer = false;
  var userInfo = message.userInfo || {};
  userInfo.settings = userInfo.settings || {};
  userInfo.mediaStatus = userInfo.mediaStatus || {};
  userInfo.config = {
    enableIceTrickle: typeof message.enableIceTrickle === 'boolean' ? message.enableIceTrickle : true,
    enableIceRestart: typeof message.enableIceRestart === 'boolean' ? message.enableIceRestart : false,
    enableDataChannel: typeof message.enableDataChannel === 'boolean' ? message.enableDataChannel : true,
    priorityWeight: typeof message.weight === 'number' ? message.weight : 0,
    receiveOnly: message.receiveOnly === true,
    publishOnly: !!message.publishOnly
  };
  userInfo.parentId = message.parentId || null;
  userInfo.agent = {
    name: typeof message.agent === 'string' && message.agent ? message.agent : 'other',
    version: (function () {
      if (!(message.version && typeof message.version === 'string')) {
        return 0;
      }
      // E.g. 0.9.6, replace minor "." with 0
      if (message.version.indexOf('.') > -1) {
        var parts = message.version.split('.');
        if (parts.length > 2) {
          var majorVer = parts[0] || '0';
          parts.splice(0, 1);
          return parseFloat(majorVer + '.' + parts.join('0'), 10);
        }
        return parseFloat(message.version || '0', 10);
      }
      return parseInt(message.version || '0', 10);
    })(),
    os: typeof message.os === 'string' && message.os ? message.os : '',
    pluginVersion: typeof message.temasysPluginVersion === 'string' && message.temasysPluginVersion ?
      message.temasysPluginVersion : null,
    SMProtocolVersion: message.SMProtocolVersion && typeof message.SMProtocolVersion === 'string' ?
      message.SMProtocolVersion : '0.1.1',
    DTProtocolVersion: message.DTProtocolVersion && typeof message.DTProtocolVersion === 'string' ?
      message.DTProtocolVersion : (self._hasMCU || targetMid === 'MCU' ? '0.1.2' : '0.1.0')
  };

  self._log.log([targetMid, 'RTCPeerConnection', null, 'Peer "enter" received ->'], message);

  if (targetMid !== 'MCU' && self._parentId && self._parentId === targetMid) {
    self._log.warn([targetMid, 'RTCPeerConnection', null, 'Discarding "enter" for parentId case ->'], message);
    return;
  }

  if (!self._peerInformations[targetMid]) {
    isNewPeer = true;

    self._peerInformations[targetMid] = userInfo;

    var hasScreenshare = userInfo.settings.video && typeof userInfo.settings.video === 'object' &&
      !!userInfo.settings.video.screenshare;

    self._addPeer(targetMid, {
      agent: userInfo.agent.name,
      version: userInfo.agent.version,
      os: userInfo.agent.os
    }, false, false, message.receiveOnly, hasScreenshare);

    if (targetMid === 'MCU') {
      self._log.info([targetMid, 'RTCPeerConnection', null, 'MCU feature has been enabled']);

      self._hasMCU = true;
      self._trigger('serverPeerJoined', targetMid, self.SERVER_PEER_TYPE.MCU);

    } else {
      self._trigger('peerJoined', targetMid, self.getPeerInfo(targetMid), false);
    }

    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, targetMid);
  }

  self._peerMessagesStamps[targetMid] = self._peerMessagesStamps[targetMid] || {
    userData: 0,
    audioMuted: 0,
    videoMuted: 0
  };

  var welcomeMsg = {
    type: self._SIG_MESSAGE_TYPE.WELCOME,
    mid: self._user.sid,
    rid: self._room.id,
    enableIceTrickle: self._enableIceTrickle,
    enableDataChannel: self._enableDataChannel,
    enableIceRestart: self._enableIceRestart,
    agent: window.webrtcDetectedBrowser,
    version: (window.webrtcDetectedVersion || 0).toString(),
    receiveOnly: self.getPeerInfo().config.receiveOnly,
    os: window.navigator.platform,
    userInfo: self._getUserInfo(),
    target: targetMid,
    weight: self._peerPriorityWeight,
    temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
    SMProtocolVersion: self.SM_PROTOCOL_VERSION,
    DTProtocolVersion: self.DT_PROTOCOL_VERSION
  };

  if (self._publishOnly) {
    welcomeMsg.publishOnly = {
      type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
    };
  }

  if (self._parentId) {
    welcomeMsg.parentId = self._parentId;
  }

  self._sendChannelMessage(welcomeMsg);

  if (isNewPeer) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);
  }
};

/**
 * Function that handles the "restart" socket message received.
 * See confluence docs for the "restart" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _restartHandler
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._restartHandler = function(message){
  var self = this;
  var targetMid = message.mid;
  var userInfo = message.userInfo || {};
  userInfo.settings = userInfo.settings || {};
  userInfo.mediaStatus = userInfo.mediaStatus || {};
  userInfo.config = {
    enableIceTrickle: typeof message.enableIceTrickle === 'boolean' ? message.enableIceTrickle : true,
    enableIceRestart: typeof message.enableIceRestart === 'boolean' ? message.enableIceRestart : false,
    enableDataChannel: typeof message.enableDataChannel === 'boolean' ? message.enableDataChannel : true,
    priorityWeight: typeof message.weight === 'number' ? message.weight : 0,
    receiveOnly: message.receiveOnly === true,
    publishOnly: !!message.publishOnly
  };
  userInfo.parentId = message.parentId || null;
  userInfo.agent = {
    name: typeof message.agent === 'string' && message.agent ? message.agent : 'other',
    version: (function () {
      if (!(message.version && typeof message.version === 'string')) {
        return 0;
      }
      // E.g. 0.9.6, replace minor "." with 0
      if (message.version.indexOf('.') > -1) {
        var parts = message.version.split('.');
        if (parts.length > 2) {
          var majorVer = parts[0] || '0';
          parts.splice(0, 1);
          return parseFloat(majorVer + '.' + parts.join('0'), 10);
        }
        return parseFloat(message.version || '0', 10);
      }
      return parseInt(message.version || '0', 10);
    })(),
    os: typeof message.os === 'string' && message.os ? message.os : '',
    pluginVersion: typeof message.temasysPluginVersion === 'string' && message.temasysPluginVersion ?
      message.temasysPluginVersion : null,
    SMProtocolVersion: message.SMProtocolVersion && typeof message.SMProtocolVersion === 'string' ?
      message.SMProtocolVersion : '0.1.1',
    DTProtocolVersion: message.DTProtocolVersion && typeof message.DTProtocolVersion === 'string' ?
      message.DTProtocolVersion : (self._hasMCU || targetMid === 'MCU' ? '0.1.2' : '0.1.0')
  };

  self._log.log([targetMid, 'RTCPeerConnection', null, 'Peer "restart" received ->'], message);

  if (!self._peerInformations[targetMid]) {
    self._log.error([targetMid, 'RTCPeerConnection', null, 'Peer does not have an existing session. Ignoring restart process.']);
    return;
  }

  if (targetMid !== 'MCU' && self._parentId && self._parentId === targetMid) {
    self._log.warn([targetMid, 'RTCPeerConnection', null, 'Discarding "restart" for parentId case ->'], message);
    return;
  }

  if (self._hasMCU && !self._mcuUseRenegoRestart) {
    self._log.warn([targetMid, 'RTCPeerConnection', null, 'Dropping restart request as MCU does not support re-negotiation. ' +
      'Restart workaround is to re-join Room for Peer.']);
    self._trigger('peerRestart', targetMid, self.getPeerInfo(targetMid), false, false);
    return;
  }

  self._peerInformations[targetMid] = userInfo;
  self._peerMessagesStamps[targetMid] = self._peerMessagesStamps[targetMid] || {
    userData: 0,
    audioMuted: 0,
    videoMuted: 0
  };
  self._peerEndOfCandidatesCounter[targetMid] = self._peerEndOfCandidatesCounter[targetMid] || {};
  self._peerEndOfCandidatesCounter[targetMid].len = 0;

  // Make peer with highest weight do the offer
  if (self._peerPriorityWeight > message.weight) {
    self._log.debug([targetMid, 'RTCPeerConnection', null, 'Re-negotiating new offer/answer.']);

    if (self._peerMessagesStamps[targetMid].hasRestart) {
      self._log.warn([targetMid, 'RTCPeerConnection', null, 'Discarding extra "restart" received.']);
      return;
    }

    self._peerMessagesStamps[targetMid].hasRestart = true;
    self._doOffer(targetMid, message.doIceRestart === true, {
      agent: userInfo.agent.name,
      version: userInfo.agent.version,
      os: userInfo.agent.os
    }, true);

  } else {
    self._log.debug([targetMid, 'RTCPeerConnection', null, 'Waiting for peer to start re-negotiation.']);

    var restartMsg = {
      type: self._SIG_MESSAGE_TYPE.RESTART,
      mid: self._user.sid,
      rid: self._room.id,
      agent: window.webrtcDetectedBrowser,
      version: (window.webrtcDetectedVersion || 0).toString(),
      os: window.navigator.platform,
      userInfo: self._getUserInfo(),
      target: targetMid,
      weight: self._peerPriorityWeight,
      enableIceTrickle: self._enableIceTrickle,
      enableDataChannel: self._enableDataChannel,
      enableIceRestart: self._enableIceRestart,
      doIceRestart: message.doIceRestart === true,
      receiveOnly: self.getPeerInfo().config.receiveOnly,
      isRestartResend: true,
      temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
      SMProtocolVersion: self.SM_PROTOCOL_VERSION,
      DTProtocolVersion: self.DT_PROTOCOL_VERSION,
    };

    if (self._publishOnly) {
      restartMsg.publishOnly = {
        type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
      };
    }

    if (self._parentId) {
      restartMsg.parentId = self._parentId;
    }

    self._sendChannelMessage(restartMsg);
  }

  self._trigger('peerRestart', targetMid, self.getPeerInfo(targetMid), false, message.doIceRestart === true);
};

/**
 * Function that handles the "welcome" socket message received.
 * See confluence docs for the "welcome" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _welcomeHandler
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._welcomeHandler = function(message) {
  var self = this;
  var targetMid = message.mid;
  var isNewPeer = false;
  var userInfo = message.userInfo || {};
  userInfo.settings = userInfo.settings || {};
  userInfo.mediaStatus = userInfo.mediaStatus || {};
  userInfo.config = {
    enableIceTrickle: typeof message.enableIceTrickle === 'boolean' ? message.enableIceTrickle : true,
    enableIceRestart: typeof message.enableIceRestart === 'boolean' ? message.enableIceRestart : false,
    enableDataChannel: typeof message.enableDataChannel === 'boolean' ? message.enableDataChannel : true,
    priorityWeight: typeof message.weight === 'number' ? message.weight : 0,
    receiveOnly: message.receiveOnly === true,
    publishOnly: !!message.publishOnly
  };
  userInfo.parentId = message.parentId || null;
  userInfo.agent = {
    name: typeof message.agent === 'string' && message.agent ? message.agent : 'other',
    version: (function () {
      if (!(message.version && typeof message.version === 'string')) {
        return 0;
      }
      // E.g. 0.9.6, replace minor "." with 0
      if (message.version.indexOf('.') > -1) {
        var parts = message.version.split('.');
        if (parts.length > 2) {
          var majorVer = parts[0] || '0';
          parts.splice(0, 1);
          return parseFloat(majorVer + '.' + parts.join('0'), 10);
        }
        return parseFloat(message.version || '0', 10);
      }
      return parseInt(message.version || '0', 10);
    })(),
    os: typeof message.os === 'string' && message.os ? message.os : '',
    pluginVersion: typeof message.temasysPluginVersion === 'string' && message.temasysPluginVersion ?
      message.temasysPluginVersion : null,
    SMProtocolVersion: message.SMProtocolVersion && typeof message.SMProtocolVersion === 'string' ?
      message.SMProtocolVersion : '0.1.1',
    DTProtocolVersion: message.DTProtocolVersion && typeof message.DTProtocolVersion === 'string' ?
      message.DTProtocolVersion : (self._hasMCU || targetMid === 'MCU' ? '0.1.2' : '0.1.0')
  };

  self._log.log([targetMid, 'RTCPeerConnection', null, 'Peer "welcome" received ->'], message);

  if (targetMid !== 'MCU' && self._parentId && self._parentId === targetMid) {
    self._log.warn([targetMid, 'RTCPeerConnection', null, 'Discarding "welcome" for parentId case ->'], message);
    return;
  }

  if (!self._peerInformations[targetMid]) {
    isNewPeer = true;

    self._peerInformations[targetMid] = userInfo;

    var hasScreenshare = userInfo.settings.video && typeof userInfo.settings.video === 'object' &&
      !!userInfo.settings.video.screenshare;

    self._addPeer(targetMid, {
      agent: userInfo.agent.name,
      version: userInfo.agent.version,
      os: userInfo.agent.os
    }, false, false, message.receiveOnly, hasScreenshare);

    if (targetMid === 'MCU') {
      self._log.info([targetMid, 'RTCPeerConnection', null, 'MCU feature has been enabled']);

      self._hasMCU = true;
      self._trigger('serverPeerJoined', targetMid, self.SERVER_PEER_TYPE.MCU);

    } else {
      self._trigger('peerJoined', targetMid, self.getPeerInfo(targetMid), false);
    }

    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, targetMid);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);
  }

  self._peerMessagesStamps[targetMid] = self._peerMessagesStamps[targetMid] || {
    userData: 0,
    audioMuted: 0,
    videoMuted: 0,
    hasWelcome: false
  };

  if (self._hasMCU || self._peerPriorityWeight > message.weight) {
    if (self._peerMessagesStamps[targetMid].hasWelcome) {
      self._log.warn([targetMid, 'RTCPeerConnection', null, 'Discarding extra "welcome" received.']);
      return;
    }

    self._log.debug([targetMid, 'RTCPeerConnection', null, 'Starting negotiation']);

    self._peerMessagesStamps[targetMid].hasWelcome = true;
    self._doOffer(targetMid, false, {
      agent: userInfo.agent.name,
      version: userInfo.agent.version,
      os: userInfo.agent.os
    }, true);

  } else {
    self._log.debug([targetMid, 'RTCPeerConnection', null, 'Waiting for peer to start negotiation.']);

    var welcomeMsg = {
      type: self._SIG_MESSAGE_TYPE.WELCOME,
      mid: self._user.sid,
      rid: self._room.id,
      enableIceTrickle: self._enableIceTrickle,
      enableDataChannel: self._enableDataChannel,
      enableIceRestart: self._enableIceRestart,
      receiveOnly: self.getPeerInfo().config.receiveOnly,
      agent: window.webrtcDetectedBrowser,
      version: (window.webrtcDetectedVersion || 0).toString(),
      os: window.navigator.platform,
      userInfo: self._getUserInfo(),
      target: targetMid,
      weight: self._peerPriorityWeight,
      temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
      SMProtocolVersion: self.SM_PROTOCOL_VERSION,
      DTProtocolVersion: self.DT_PROTOCOL_VERSION
    };

    if (self._publishOnly) {
      welcomeMsg.publishOnly = {
        type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
      };
    }

    if (self._parentId) {
      welcomeMsg.parentId = self._parentId;
    }

    self._sendChannelMessage(welcomeMsg);
  }
};

/**
 * Function that handles the "offer" socket message received.
 * See confluence docs for the "offer" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _offerHandler
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._offerHandler = function(message) {
  var self = this;
  var targetMid = message.mid;
  var pc = self._peerConnections[targetMid];

  if (!pc) {
    self._log.error([targetMid, null, message.type, 'Peer connection object ' +
      'not found. Unable to setRemoteDescription for offer']);
    return;
  }

  /*if (pc.localDescription ? !!pc.localDescription.sdp : false) {
    log.warn([targetMid, null, message.type, 'Peer has an existing connection'],
      pc.localDescription);
    return;
  }*/

  // Add-on by Web SDK fixes
  if (message.userInfo && typeof message.userInfo === 'object') {
    var userInfo = message.userInfo || {};

    self._peerInformations[targetMid].settings = userInfo.settings || {};
    self._peerInformations[targetMid].mediaStatus = userInfo.mediaStatus || {};
    self._peerInformations[targetMid].userData = userInfo.userData;
  }

  self._log.log([targetMid, null, message.type, 'Received offer from peer. ' +
    'Session description:'], UtilsFactory.clone(message));

  var offer = new RTCSessionDescription({
    type: message.type,
    sdp: self._hasMCU ? message.sdp.split('\n').join('\r\n') : message.sdp
  });
  self._log.log([targetMid, 'RTCSessionDescription', message.type,
    'Session description object created'], offer);

  offer.sdp = self._removeSDPFilteredCandidates(targetMid, offer);
  offer.sdp = self._setSDPCodec(targetMid, offer);
  offer.sdp = self._setSDPBitrate(targetMid, offer);
  offer.sdp = self._setSDPOpusConfig(targetMid, offer);
  offer.sdp = self._removeSDPCodecs(targetMid, offer);
  offer.sdp = self._removeSDPREMBPackets(targetMid, offer);
  offer.sdp = self._handleSDPConnectionSettings(targetMid, offer, 'remote');

  self._log.log([targetMid, 'RTCSessionDescription', message.type, 'Updated remote offer ->'], offer.sdp);

  // This is always the initial state. or even after negotiation is successful
  if (pc.signalingState !== self.PEER_CONNECTION_STATE.STABLE) {
    self._log.warn([targetMid, null, message.type, 'Peer connection state is not in ' +
      '"stable" state for re-negotiation. Dropping message.'], {
        signalingState: pc.signalingState,
        isRestart: !!message.resend
      });
    return;
  }

  // Added checks if there is a current remote sessionDescription being processing before processing this one
  if (pc.processingRemoteSDP) {
    self._log.warn([targetMid, 'RTCSessionDescription', 'offer',
      'Dropping of setting local offer as there is another ' +
      'sessionDescription being processed ->'], offer);
    return;
  }

  pc.processingRemoteSDP = true;

  // Edge FIXME problem: Add stream only at offer/answer end
  if (window.webrtcDetectedBrowser === 'edge' && (!self._hasMCU || targetMid === 'MCU')) {
    self._addLocalMediaStreams(targetMid);
  }

  pc.setRemoteDescription(offer, function() {
    self._log.debug([targetMid, 'RTCSessionDescription', message.type, 'Remote description set']);
    pc.setOffer = 'remote';
    pc.processingRemoteSDP = false;
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.OFFER, targetMid);
    self._addIceCandidateFromQueue(targetMid);
    self._doAnswer(targetMid);
  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);

    pc.processingRemoteSDP = false;

    self._log.error([targetMid, null, message.type, 'Failed setting remote description:'], error);
  });
};


/**
 * Function that handles the "candidate" socket message received.
 * See confluence docs for the "candidate" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _candidateHandler
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._candidateHandler = function(message) {
  var targetMid = message.mid;

  if (!message.candidate && !message.id) {
    this._log.warn([targetMid, 'RTCIceCandidate', null, 'Received invalid ICE candidate message ->'], message);
    return;
  }

  var canId = 'can-' + (new Date()).getTime();
  var candidateType = message.candidate.split(' ')[7] || '';
  var candidate = new RTCIceCandidate({
    sdpMLineIndex: message.label,
    candidate: message.candidate,
    sdpMid: message.id
  });

  this._log.debug([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Received ICE candidate ->'], candidate);

  this._peerEndOfCandidatesCounter[targetMid] = this._peerEndOfCandidatesCounter[targetMid] || {};
  this._peerEndOfCandidatesCounter[targetMid].len = this._peerEndOfCandidatesCounter[targetMid].len || 0;
  this._peerEndOfCandidatesCounter[targetMid].hasSet = false;
  this._peerEndOfCandidatesCounter[targetMid].len++;

  this._trigger('candidateProcessingState', this.CANDIDATE_PROCESSING_STATE.RECEIVED,
    targetMid, canId, candidateType, {
    candidate: candidate.candidate,
    sdpMid: candidate.sdpMid,
    sdpMLineIndex: candidate.sdpMLineIndex
  }, null);

  if (!(this._peerConnections[targetMid] &&
    this._peerConnections[targetMid].signalingState !== this.PEER_CONNECTION_STATE.CLOSED)) {
    this._log.warn([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Dropping ICE candidate ' +
      'as Peer connection does not exists or is closed']);
    this._trigger('candidateProcessingState', this.CANDIDATE_PROCESSING_STATE.DROPPED,
      targetMid, canId, candidateType, {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex
    }, new Error('Failed processing ICE candidate as Peer connection does not exists or is closed.'));
    this._signalingEndOfCandidates(targetMid);
    return;
  }

  if (this._filterCandidatesType[candidateType]) {
    if (!(this._hasMCU && this._forceTURN)) {
      this._log.warn([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Dropping received ICE candidate as ' +
        'it matches ICE candidate filtering flag ->'], candidate);
      this._trigger('candidateProcessingState', this.CANDIDATE_PROCESSING_STATE.DROPPED,
        targetMid, canId, candidateType, {
        candidate: candidate.candidate,
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex
      }, new Error('Dropping of processing ICE candidate as it matches ICE candidate filtering flag.'));
      this._signalingEndOfCandidates(targetMid);
      return;
    }

    this._log.warn([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Not dropping received ICE candidate as ' +
      'TURN connections are enforced as MCU is present (and act as a TURN itself) so filtering of ICE candidate ' +
      'flags are not honoured ->'], candidate);
  }

  if (this._peerConnections[targetMid].remoteDescription && this._peerConnections[targetMid].remoteDescription.sdp &&
    this._peerConnections[targetMid].localDescription && this._peerConnections[targetMid].localDescription.sdp) {
    this._addIceCandidate(targetMid, canId, candidate);
  } else {
    this._addIceCandidateToQueue(targetMid, canId, candidate);
  }

  this._signalingEndOfCandidates(targetMid);

  if (!this._gatheredCandidates[targetMid]) {
    this._gatheredCandidates[targetMid] = {
      sending: { host: [], srflx: [], relay: [] },
      receiving: { host: [], srflx: [], relay: [] }
    };
  }

  this._gatheredCandidates[targetMid].receiving[candidateType].push({
    sdpMid: candidate.sdpMid,
    sdpMLineIndex: candidate.sdpMLineIndex,
    candidate: candidate.candidate
  });
};

/**
 * Function that handles the "answer" socket message received.
 * See confluence docs for the "answer" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _answerHandler
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._answerHandler = function(message) {
  var self = this;
  var targetMid = message.mid;

  self._log.log([targetMid, null, message.type,
    'Received answer from peer. Session description:'], UtilsFactory.clone(message));

  var pc = self._peerConnections[targetMid];

  if (!pc) {
    self._log.error([targetMid, null, message.type, 'Peer connection object ' +
      'not found. Unable to setRemoteDescription for answer']);
    return;
  }

  // Add-on by Web SDK fixes
  if (message.userInfo && typeof message.userInfo === 'object') {
    var userInfo = message.userInfo || {};

    self._peerInformations[targetMid].settings = userInfo.settings || {};
    self._peerInformations[targetMid].mediaStatus = userInfo.mediaStatus || {};
    self._peerInformations[targetMid].userData = userInfo.userData;
  }

  var answer = new RTCSessionDescription({
    type: message.type,
    sdp: self._hasMCU ? message.sdp.split('\n').join('\r\n') : message.sdp
  });

  self._log.log([targetMid, 'RTCSessionDescription', message.type,
    'Session description object created'], answer);

  /*if (pc.remoteDescription ? !!pc.remoteDescription.sdp : false) {
    log.warn([targetMid, null, message.type, 'Peer has an existing connection'],
      pc.remoteDescription);
    return;
  }

  if (pc.signalingState === self.PEER_CONNECTION_STATE.STABLE) {
    log.error([targetMid, null, message.type, 'Unable to set peer connection ' +
      'at signalingState "stable". Ignoring remote answer'], pc.signalingState);
    return;
  }*/

  answer.sdp = self._removeSDPFilteredCandidates(targetMid, answer);
  answer.sdp = self._setSDPCodec(targetMid, answer);
  answer.sdp = self._setSDPBitrate(targetMid, answer);
  answer.sdp = self._setSDPOpusConfig(targetMid, answer);
  answer.sdp = self._removeSDPCodecs(targetMid, answer);
  answer.sdp = self._removeSDPREMBPackets(targetMid, answer);
  answer.sdp = self._handleSDPConnectionSettings(targetMid, answer, 'remote');

  self._log.log([targetMid, 'RTCSessionDescription', message.type, 'Updated remote answer ->'], answer.sdp);


  // This should be the state after offer is received. or even after negotiation is successful
  if (pc.signalingState !== self.PEER_CONNECTION_STATE.HAVE_LOCAL_OFFER) {
    self._log.warn([targetMid, null, message.type, 'Peer connection state is not in ' +
      '"have-local-offer" state for re-negotiation. Dropping message.'], {
        signalingState: pc.signalingState,
        isRestart: !!message.restart
      });
    return;
  }

  // Added checks if there is a current remote sessionDescription being processing before processing this one
  if (pc.processingRemoteSDP) {
    self._log.warn([targetMid, 'RTCSessionDescription', 'answer',
      'Dropping of setting local answer as there is another ' +
      'sessionDescription being processed ->'], answer);
    return;
  }

  pc.processingRemoteSDP = true;

  pc.setRemoteDescription(answer, function() {
    self._log.debug([targetMid, null, message.type, 'Remote description set']);
    pc.setAnswer = 'remote';
    pc.processingRemoteSDP = false;
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ANSWER, targetMid);
    self._addIceCandidateFromQueue(targetMid);

    if (self._peerMessagesStamps[targetMid]) {
      self._peerMessagesStamps[targetMid].hasRestart = false;
    }

    if (self._dataChannels[targetMid] && (pc.remoteDescription.sdp.indexOf('m=application') === -1 ||
      pc.remoteDescription.sdp.indexOf('m=application 0') > 0)) {
      self._log.warn([targetMid, 'RTCPeerConnection', null, 'Closing all datachannels as they were rejected.']);
      self._closeDataChannel(targetMid);
    }

  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);

    pc.processingRemoteSDP = false;

    self._log.error([targetMid, null, message.type, 'Failed setting remote description:'], {
      error: error,
      state: pc.signalingState
    });
  });
};

/**
 * Function that compares the SM / DT protocol versions to see if it in the version.
 * @method _isLowerThanVersion
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._isLowerThanVersion = function (agentVer, requiredVer) {
  var partsA = agentVer.split('.');
  var partsB = requiredVer.split('.');

  for (var i = 0; i < partsB.length; i++) {
    if (parseInt(partsA[i] || '0', 10) < parseInt(partsB[i] || '0', 10)) {
      return true;
    }
  }

  return false;
};

Skylink.prototype._muteStreams = function () {
  var self = this;
  var hasVideo = false;
  var hasAudio = false;

  var muteFn = function (stream) {
    var audioTracks = stream.getAudioTracks();
    var videoTracks = stream.getVideoTracks();

    for (var a = 0; a < audioTracks.length; a++) {
      audioTracks[a].enabled = !self._streamsMutedSettings.audioMuted;
      hasAudio = true;
    }

    for (var v = 0; v < videoTracks.length; v++) {
      videoTracks[v].enabled = !self._streamsMutedSettings.videoMuted;
      hasVideo = true;
    }
  };

  if (self._streams.userMedia && self._streams.userMedia.stream) {
    muteFn(self._streams.userMedia.stream);
  }

  if (self._streams.screenshare && self._streams.screenshare.stream) {
    muteFn(self._streams.screenshare.stream);
  }

  if (self._streams.screenshare && self._streams.screenshare.streamClone) {
    muteFn(self._streams.screenshare.streamClone);
  }

  self._log.debug('Updated Streams muted status ->', self._streamsMutedSettings);

  return {
    hasVideo: hasVideo,
    hasAudio: hasAudio
  };
};

/**
 * Function that handles stopping the Stream streaming.
 * @method _stopStreams
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._stopStreams = function (options) {
  var self = this;
  var stopFn = function (stream) {
    var streamId = stream.id || stream.label;
    self._log.debug([null, 'MediaStream', streamId, 'Stopping Stream ->'], stream);

    try {
      var audioTracks = stream.getAudioTracks();
      var videoTracks = stream.getVideoTracks();

      for (var a = 0; a < audioTracks.length; a++) {
        audioTracks[a].stop();
      }

      for (var v = 0; v < videoTracks.length; v++) {
        videoTracks[v].stop();
      }

    } catch (error) {
      stream.stop();
    }

    if (self._streamsStoppedCbs[streamId]) {
      self._streamsStoppedCbs[streamId]();
      delete self._streamsStoppedCbs[streamId];
    }
  };

  var stopUserMedia = false;
  var stopScreenshare = false;
  var hasStoppedMedia = false;

  if (typeof options === 'object') {
    stopUserMedia = options.userMedia === true;
    stopScreenshare = options.screenshare === true;
  }

  if (stopUserMedia && self._streams.userMedia) {
    if (self._streams.userMedia.stream) {
      stopFn(self._streams.userMedia.stream);
    }

    self._streams.userMedia = null;
    hasStoppedMedia = true;
  }

  if (stopScreenshare && self._streams.screenshare) {
    if (self._streams.screenshare.streamClone) {
      stopFn(self._streams.screenshare.streamClone);
    }

    if (self._streams.screenshare.stream) {
      stopFn(self._streams.screenshare.stream);
    }

    self._streams.screenshare = null;
    hasStoppedMedia = true;
  }

  if (self._inRoom && hasStoppedMedia) {
    self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
  }

  self._log.log('Stopping Streams with settings ->', options);
};

/**
 * Function that parses the <code>getUserMedia()</code> settings provided.
 * @method _parseStreamSettings
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._parseStreamSettings = function(options) {
  var settings = {
    settings: { audio: false, video: false },
    mutedSettings: { shouldAudioMuted: false, shouldVideoMuted: false },
    getUserMediaSettings: { audio: false, video: false }
  };

  if (options.audio) {
    // For Edge to work since they do not support the advanced constraints yet
    settings.settings.audio = {
      stereo: false,
      exactConstraints: !!options.useExactConstraints,
      echoCancellation: false
    };
    settings.getUserMediaSettings.audio = {
      echoCancellation: false
    };

    if (typeof options.audio === 'object') {
      if (typeof options.audio.stereo === 'boolean') {
        settings.settings.audio.stereo = options.audio.stereo;
      }

      if (typeof options.audio.useinbandfec === 'boolean') {
        settings.settings.audio.useinbandfec = options.audio.useinbandfec;
      }

      if (typeof options.audio.usedtx === 'boolean') {
        settings.settings.audio.usedtx = options.audio.usedtx;
      }

      if (typeof options.audio.maxplaybackrate === 'number' &&
        options.audio.maxplaybackrate >= 8000 && options.audio.maxplaybackrate <= 48000) {
        settings.settings.audio.maxplaybackrate = options.audio.maxplaybackrate;
      }

      if (typeof options.audio.mute === 'boolean') {
        settings.mutedSettings.shouldAudioMuted = options.audio.mute;
      }

      // Not supported in Edge browser features
      if (window.webrtcDetectedBrowser !== 'edge') {
        if (typeof options.audio.echoCancellation === 'boolean') {
          settings.settings.audio.echoCancellation = options.audio.echoCancellation;
          settings.getUserMediaSettings.audio.echoCancellation = options.audio.echoCancellation;
        }

        if (Array.isArray(options.audio.optional)) {
          settings.settings.audio.optional = UtilsFactory.clone(options.audio.optional);
          settings.getUserMediaSettings.audio.optional = UtilsFactory.clone(options.audio.optional);
        }

        if (options.audio.deviceId && typeof options.audio.deviceId === 'string' &&
          window.webrtcDetectedBrowser !== 'firefox') {
          settings.settings.audio.deviceId = options.audio.deviceId;

          if (options.useExactConstraints) {
            settings.getUserMediaSettings.audio.deviceId = { exact: options.audio.deviceId };

          } else {
            if (!Array.isArray(settings.getUserMediaSettings.audio.optional)) {
              settings.getUserMediaSettings.audio.optional = [];
            }

            settings.getUserMediaSettings.audio.optional.push({
              sourceId: options.audio.deviceId
            });
          }
        }
      }
    }

    if (window.webrtcDetectedBrowser === 'edge') {
      settings.getUserMediaSettings.audio = true;
    }
  }

  if (options.video) {
    // For Edge to work since they do not support the advanced constraints yet
    settings.settings.video = {
      resolution: UtilsFactory.clone(this.VIDEO_RESOLUTION.VGA),
      screenshare: false,
      exactConstraints: !!options.useExactConstraints
    };
    settings.getUserMediaSettings.video = {};

    if (typeof options.video === 'object') {
      if (typeof options.video.mute === 'boolean') {
        settings.mutedSettings.shouldVideoMuted = options.video.mute;
      }

      if (Array.isArray(options.video.optional)) {
        settings.settings.video.optional = UtilsFactory.clone(options.video.optional);
        settings.getUserMediaSettings.video.optional = UtilsFactory.clone(options.video.optional);
      }

      if (options.video.deviceId && typeof options.video.deviceId === 'string' &&
        window.webrtcDetectedBrowser !== 'firefox') {
        settings.settings.video.deviceId = options.video.deviceId;

        if (options.useExactConstraints) {
          settings.getUserMediaSettings.video.deviceId = { exact: options.video.deviceId };

        } else {
          if (!Array.isArray(settings.getUserMediaSettings.video.optional)) {
            settings.getUserMediaSettings.video.optional = [];
          }

          settings.getUserMediaSettings.video.optional.push({
            sourceId: options.video.deviceId
          });
        }
      }

      if (options.video.resolution && typeof options.video.resolution === 'object') {
        if ((options.video.resolution.width && typeof options.video.resolution.width === 'object') ||
          typeof options.video.resolution.width === 'number') {
          settings.settings.video.resolution.width = options.video.resolution.width;
        }
        if ((options.video.resolution.height && typeof options.video.resolution.height === 'object') ||
          typeof options.video.resolution.height === 'number') {
          settings.settings.video.resolution.height = options.video.resolution.height;
        }
      }

      settings.getUserMediaSettings.video.width = typeof settings.settings.video.resolution.width === 'object' ?
        settings.settings.video.resolution.width : (options.useExactConstraints ?
        { exact: settings.settings.video.resolution.width } : { max: settings.settings.video.resolution.width });

      settings.getUserMediaSettings.video.height = typeof settings.settings.video.resolution.height === 'object' ?
        settings.settings.video.resolution.height : (options.useExactConstraints ?
        { exact: settings.settings.video.resolution.height } : { max: settings.settings.video.resolution.height });

      if ((options.video.frameRate && typeof options.video.frameRate === 'object') ||
        typeof options.video.frameRate === 'number' && !self._isUsingPlugin) {
        settings.settings.video.frameRate = options.video.frameRate;
        settings.getUserMediaSettings.video.frameRate = typeof settings.settings.video.frameRate === 'object' ?
          settings.settings.video.frameRate : (options.useExactConstraints ?
          { exact: settings.settings.video.frameRate } : { max: settings.settings.video.frameRate });
      }

      if (options.video.facingMode && ['string', 'object'].indexOf(typeof options.video.facingMode) > -1 && self._isUsingPlugin) {
        settings.settings.video.facingMode = options.video.facingMode;
        settings.getUserMediaSettings.video.facingMode = typeof settings.settings.video.facingMode === 'object' ?
          settings.settings.video.facingMode : (options.useExactConstraints ?
          { exact: settings.settings.video.facingMode } : { max: settings.settings.video.facingMode });
      }
    } else if (options.useExactConstraints) {
      settings.getUserMediaSettings.video = {
        width: { exact: settings.settings.video.resolution.width },
        height: { exact: settings.settings.video.resolution.height }
      };

    } else {
      settings.getUserMediaSettings.video.mandatory = {
        maxWidth: settings.settings.video.resolution.width,
        maxHeight: settings.settings.video.resolution.height
      };
    }

    if (window.webrtcDetectedBrowser === 'edge') {
      settings.settings.video = {
        screenshare: false,
        exactConstraints: !!options.useExactConstraints
      };
      settings.getUserMediaSettings.video = true;
    }
  }

  return settings;
};

/**
 * Function that handles the native <code>navigator.getUserMedia()</code> API success callback result.
 * @method _onStreamAccessSuccess
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._onStreamAccessSuccess = function(stream, settings, isScreenSharing, isAudioFallback) {
  var self = this;
  var streamId = stream.id || stream.label;

  self._log.log([null, 'MediaStream', streamId, 'Has access to stream ->'], stream);

  // Stop previous stream
  if (!isScreenSharing && self._streams.userMedia) {
    self._stopStreams({
      userMedia: true,
      screenshare: false
    });

  } else if (isScreenSharing && self._streams.screenshare) {
    self._stopStreams({
      userMedia: false,
      screenshare: true
    });
  }

  self._streamsStoppedCbs[streamId] = function () {
    self._log.log([null, 'MediaStream', streamId, 'Stream has ended']);

    self._trigger('mediaAccessStopped', !!isScreenSharing, !!isAudioFallback, streamId);

    if (self._inRoom) {
      self._log.debug([null, 'MediaStream', streamId, 'Sending Stream ended status to Peers']);

      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.STREAM,
        mid: self._user.sid,
        rid: self._room.id,
        cid: self._key,
        streamId: streamId,
        settings: settings.settings,
        status: 'ended'
      });

      self._trigger('streamEnded', self._user.sid, self.getPeerInfo(), true, !!isScreenSharing, streamId);

      if (isScreenSharing && self._streams.screenshare && self._streams.screenshare.stream &&
        (self._streams.screenshare.stream.id || self._streams.screenshare.stream.label) === streamId) {
        self._streams.screenshare = null;

      } else if (!isScreenSharing && self._streams.userMedia && self._streams.userMedia.stream &&
        (self._streams.userMedia.stream.id || self._streams.userMedia.stream.label) === streamId) {
        self._streams.userMedia = null;
      }
    }
  };

  // Handle event for Chrome / Opera
  if (['chrome', 'opera'].indexOf(window.webrtcDetectedBrowser) > -1) {
    stream.oninactive = function () {
      if (self._streamsStoppedCbs[streamId]) {
        self._streamsStoppedCbs[streamId]();
        delete self._streamsStoppedCbs[streamId];
      }
    };

  // Handle event for Firefox (use an interval)
  } else if (window.webrtcDetectedBrowser === 'firefox') {
    stream.endedInterval = setInterval(function () {
      if (typeof stream.recordedTime === 'undefined') {
        stream.recordedTime = 0;
      }
      if (stream.recordedTime === stream.currentTime) {
        clearInterval(stream.endedInterval);

        if (self._streamsStoppedCbs[streamId]) {
          self._streamsStoppedCbs[streamId]();
          delete self._streamsStoppedCbs[streamId];
        }

      } else {
        stream.recordedTime = stream.currentTime;
      }
    }, 1000);

  } else {
    stream.onended = function () {
      if (self._streamsStoppedCbs[streamId]) {
        self._streamsStoppedCbs[streamId]();
        delete self._streamsStoppedCbs[streamId];
      }
    };
  }

  if ((settings.settings.audio && stream.getAudioTracks().length === 0) ||
    (settings.settings.video && stream.getVideoTracks().length === 0)) {

    var tracksNotSameError = 'Expected audio tracks length with ' +
      (settings.settings.audio ? '1' : '0') + ' and video tracks length with ' +
      (settings.settings.video ? '1' : '0') + ' but received audio tracks length ' +
      'with ' + stream.getAudioTracks().length + ' and video ' +
      'tracks length with ' + stream.getVideoTracks().length;

    self._log.warn([null, 'MediaStream', streamId, tracksNotSameError]);

    var requireAudio = !!settings.settings.audio;
    var requireVideo = !!settings.settings.video;

    if (settings.settings.audio && stream.getAudioTracks().length === 0) {
      settings.settings.audio = false;
    }

    if (settings.settings.video && stream.getVideoTracks().length === 0) {
      settings.settings.video = false;
    }

    self._trigger('mediaAccessFallback', {
      error: new Error(tracksNotSameError),
      diff: {
        video: { expected: requireVideo ? 1 : 0, received: stream.getVideoTracks().length },
        audio: { expected: requireAudio ? 1 : 0, received: stream.getAudioTracks().length }
      }
    }, self.MEDIA_ACCESS_FALLBACK_STATE.FALLBACKED, !!isScreenSharing, !!isAudioFallback, streamId);
  }

  self._streams[ isScreenSharing ? 'screenshare' : 'userMedia' ] = {
    stream: stream,
    settings: settings.settings,
    constraints: settings.getUserMediaSettings
  };
  self._muteStreams();
  self._trigger('mediaAccessSuccess', stream, !!isScreenSharing, !!isAudioFallback, streamId);
};

/**
 * Function that handles the native <code>navigator.getUserMedia()</code> API failure callback result.
 * @method _onStreamAccessError
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._onStreamAccessError = function(error, settings, isScreenSharing) {
  var self = this;

  if (!isScreenSharing && settings.settings.audio && settings.settings.video && self._audioFallback) {
    self._log.debug('Fallbacking to retrieve audio only Stream');

    self._trigger('mediaAccessFallback', {
      error: error,
      diff: null
    }, self.MEDIA_ACCESS_FALLBACK_STATE.FALLBACKING, false, true);

    navigator.getUserMedia({
      audio: true
    }, function (stream) {
      self._onStreamAccessSuccess(stream, settings, false, true);

    }, function (error) {
      self._log.error('Failed fallbacking to retrieve audio only Stream ->', error);

      self._trigger('mediaAccessError', error, false, true);
      self._trigger('mediaAccessFallback', {
        error: error,
        diff: null
      }, self.MEDIA_ACCESS_FALLBACK_STATE.ERROR, false, true);
    });
    return;
  }

  self._log.error('Failed retrieving ' + (isScreenSharing ? 'screensharing' : 'camera') + ' Stream ->', error);

  self._trigger('mediaAccessError', error, !!isScreenSharing, false);
};

/**
 * Function that handles the <code>RTCPeerConnection.onaddstream</code> remote MediaStream received.
 * @method _onRemoteStreamAdded
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._onRemoteStreamAdded = function(targetMid, stream, isScreenSharing) {
  var self = this;

  if (!self._peerInformations[targetMid]) {
    self._log.warn([targetMid, 'MediaStream', stream.id,
      'Received remote stream when peer is not connected. ' +
      'Ignoring stream ->'], stream);
    return;
  }

  /*if (!self._peerInformations[targetMid].settings.audio &&
    !self._peerInformations[targetMid].settings.video && !isScreenSharing) {
    log.log([targetMid, 'MediaStream', stream.id,
      'Receive remote stream but ignoring stream as it is empty ->'
      ], stream);
    return;
  }*/
  self._log.log([targetMid, 'MediaStream', stream.id, 'Received remote stream ->'], stream);

  if (isScreenSharing) {
    self._log.log([targetMid, 'MediaStream', stream.id, 'Peer is having a screensharing session with user']);
  }

  self._trigger('incomingStream', targetMid, stream, false, self.getPeerInfo(targetMid), isScreenSharing, stream.id || stream.label);
  self._trigger('peerUpdated', targetMid, self.getPeerInfo(targetMid), false);
};

/**
 * Function that sets User's Stream to send to Peer connection.
 * Priority for <code>shareScreen()</code> Stream over <code>getUserMedia()</code> Stream.
 * @method _addLocalMediaStreams
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._addLocalMediaStreams = function(peerId) {
  var self = this;

  // NOTE ALEX: here we could do something smarter
  // a mediastream is mainly a container, most of the info
  // are attached to the tracks. We should iterates over track and print
  try {
    self._log.log([peerId, null, null, 'Adding local stream']);

    var pc = self._peerConnections[peerId];

    if (pc) {
      if (pc.signalingState !== self.PEER_CONNECTION_STATE.CLOSED) {
        // Updates the streams accordingly
        var updateStreamFn = function (updatedStream) {
          var hasStream = false;

          // remove streams
          var streams = pc.getLocalStreams();
          for (var i = 0; i < streams.length; i++) {
            if (updatedStream !== null && streams[i].id === updatedStream.id) {
              hasStream = true;
              continue;
            }
            // try removeStream
            pc.removeStream(streams[i]);
          }

          if (updatedStream !== null && !hasStream) {
            pc.addStream(updatedStream);
          }
        };

        if (self._streams.screenshare && self._streams.screenshare.stream) {
          self._log.debug([peerId, 'MediaStream', null, 'Sending screen'], self._streams.screenshare.stream);

          updateStreamFn(self._streams.screenshare.stream);

        } else if (self._streams.userMedia && self._streams.userMedia.stream) {
          self._log.debug([peerId, 'MediaStream', null, 'Sending stream'], self._streams.userMedia.stream);

          updateStreamFn(self._streams.userMedia.stream);

        } else {
          self._log.warn([peerId, 'MediaStream', null, 'No media to send. Will be only receiving']);

          updateStreamFn(null);
        }

      } else {
        self._log.warn([peerId, 'MediaStream', null,
          'Not adding any stream as signalingState is closed']);
      }
    } else {
      self._log.warn([peerId, 'MediaStream', self._mediaStream,
        'Not adding stream as peerconnection object does not exists']);
    }
  } catch (error) {
    if ((error.message || '').indexOf('already added') > -1) {
      self._log.warn([peerId, null, null, 'Not re-adding stream as LocalMediaStream is already added'], error);
    } else {
      // Fix errors thrown like NS_ERROR_UNEXPECTED
      self._log.error([peerId, null, null, 'Failed adding local stream'], error);
    }
  }
};

/**
 * Function that handles ended streams.
 * @method _handleEndedStreams
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._handleEndedStreams = function (peerId, checkStreamId) {
  var self = this;
  self._streamsSession[peerId] = self._streamsSession[peerId] || {};

  var renderEndedFn = function (streamId) {
    var shouldTrigger = !!self._streamsSession[peerId][streamId];

    if (!checkStreamId && self._peerConnections[peerId] &&
      self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED) {
      var streams = self._peerConnections[peerId].getRemoteStreams();

      for (var i = 0; i < streams.length; i++) {
        if (streamId === (streams[i].id || streams[i].label)) {
          shouldTrigger = false;
          break;
        }
      }
    }

    if (shouldTrigger) {
      var peerInfo = UtilsFactory.clone(self.getPeerInfo(peerId));
      peerInfo.settings.audio = UtilsFactory.clone(self._streamsSession[peerId][streamId].audio);
      peerInfo.settings.video = UtilsFactory.clone(self._streamsSession[peerId][streamId].video);
      var hasScreenshare = peerInfo.settings.video && typeof peerInfo.settings.video === 'object' &&
        !!peerInfo.settings.video.screenshare;
      self._streamsSession[peerId][streamId] = false;
      self._trigger('streamEnded', peerId, peerInfo, false, hasScreenshare, streamId);
    }
  };

  if (checkStreamId) {
    renderEndedFn(checkStreamId);
  } else {
    for (var prop in self._streamsSession[peerId]) {
      if (self._streamsSession[peerId].hasOwnProperty(prop) && self._streamsSession[peerId][prop]) {
        renderEndedFn(prop);
      }
    }
  }
};
Skylink.prototype._setSDPOpusConfig = function(targetMid, sessionDescription) {
  var sdpLines = sessionDescription.sdp.split('\r\n');
  var payload = null;
  var appendFmtpLineAtIndex = -1;
  var userAudioSettings = this.getPeerInfo().settings.audio;
  var opusSettings = {
    useinbandfec: null,
    usedtx: null,
    maxplaybackrate: null,
    stereo: false
  };

  if (userAudioSettings && typeof userAudioSettings === 'object') {
    opusSettings.stereo = userAudioSettings.stereo === true;
    opusSettings.useinbandfec = typeof userAudioSettings.useinbandfec === 'boolean' ? userAudioSettings.useinbandfec : null;
    opusSettings.usedtx = typeof userAudioSettings.usedtx === 'boolean' ? userAudioSettings.usedtx : null;
    opusSettings.maxplaybackrate = typeof userAudioSettings.maxplaybackrate === 'number' ? userAudioSettings.maxplaybackrate : null;
  }


  // Find OPUS RTPMAP line
  for (var i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].indexOf('a=rtpmap:') === 0 && (sdpLines[i].toLowerCase()).indexOf('opus/48000') > 0) {
      payload = (sdpLines[i].split(' ')[0] || '').split(':')[1] || null;
      appendFmtpLineAtIndex = i;
      break;
    }
  }

  if (!payload) {
    this._log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type,
      'Failed to find OPUS payload. Not configuring options.']);
    return sessionDescription.sdp;
  }

  // Set OPUS FMTP line
  for (var j = 0; j < sdpLines.length; j++) {
    if (sdpLines[j].indexOf('a=fmtp:' + payload) === 0) {
      var opusConfigs = (sdpLines[j].split('a=fmtp:' + payload)[1] || '').replace(/\s/g, '').split(';');
      var updatedOpusParams = '';

      for (var k = 0; k < opusConfigs.length; k++) {
        if (!(opusConfigs[k] && opusConfigs[k].indexOf('=') > 0)) {
          continue;
        }

        var params = opusConfigs[k].split('=');

        if (['useinbandfec', 'usedtx', 'sprop-stereo', 'stereo', 'maxplaybackrate'].indexOf(params[0]) > -1) {
          // Get default OPUS useinbandfec
          if (params[0] === 'useinbandfec' && params[1] === '1' && opusSettings.useinbandfec === null) {
            this._log.log([targetMid, 'RTCSessionDesription', sessionDescription.type,
              'Received OPUS useinbandfec as true by default.']);
            opusSettings.useinbandfec = true;

          // Get default OPUS usedtx
          } else if (params[0] === 'usedtx' && params[1] === '1' && opusSettings.usedtx === null) {
            this._log.log([targetMid, 'RTCSessionDesription', sessionDescription.type,
              'Received OPUS usedtx as true by default.']);
            opusSettings.usedtx = true;

          // Get default OPUS maxplaybackrate
          } else if (params[0] === 'maxplaybackrate' && parseInt(params[1] || '0', 10) > 0 && opusSettings.maxplaybackrate === null) {
            this._log.log([targetMid, 'RTCSessionDesription', sessionDescription.type,
              'Received OPUS maxplaybackrate as ' + params[1] + ' by default.']);
            opusSettings.maxplaybackrate = params[1];
          }
        } else {
          updatedOpusParams += opusConfigs[k] + ';';
        }
      }

      if (opusSettings.stereo === true) {
        updatedOpusParams += 'stereo=1;';
      }

      if (opusSettings.useinbandfec === true) {
        updatedOpusParams += 'useinbandfec=1;';
      }

      if (opusSettings.usedtx === true) {
        updatedOpusParams += 'usedtx=1;';
      }

      if (opusSettings.maxplaybackrate) {
        updatedOpusParams += 'maxplaybackrate=' + opusSettings.maxplaybackrate + ';';
      }

      this._log.log([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Updated OPUS parameters ->'], updatedOpusParams);

      sdpLines[j] = 'a=fmtp:' + payload + ' ' + updatedOpusParams;
      appendFmtpLineAtIndex = -1;
      break;
    }
  }

  if (appendFmtpLineAtIndex > 0) {
    var newFmtpLine = 'a=fmtp:' + payload + ' ';

    if (opusSettings.stereo === true) {
      newFmtpLine += 'stereo=1;';
    }

    if (opusSettings.useinbandfec === true) {
      newFmtpLine += 'useinbandfec=1;';
    }

    if (opusSettings.usedtx === true) {
      newFmtpLine += 'usedtx=1;';
    }

    if (opusSettings.maxplaybackrate) {
      newFmtpLine += 'maxplaybackrate=' + opusSettings.maxplaybackrate + ';';
    }

    this._log.info([targetMid, 'RTCSessionDesription', sessionDescription.type,
      'Created OPUS parameters ->'], newFmtpLine);

    sdpLines.splice(appendFmtpLineAtIndex + 1, 0, newFmtpLine);
  }

  return sdpLines.join('\r\n');
};

/**
 * Function that modifies the session description to limit the maximum sending bandwidth.
 * Setting this may not necessarily work in Firefox.
 * @method _setSDPBitrate
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._setSDPBitrate = function(targetMid, sessionDescription) {
  var self = this;
  var sdpLines = sessionDescription.sdp.split('\r\n');
  var parseFn = function (type, bw) {
    var mLineType = type;
    var mLineIndex = -1;
    var cLineIndex = -1;

    if (type === 'data') {
      mLineType = 'application';
    }

    for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].indexOf('m=' + mLineType) === 0) {
        mLineIndex = i;
      } else if (mLineIndex > 0) {
        if (sdpLines[i].indexOf('m=') === 0) {
          break;
        }

        if (sdpLines[i].indexOf('c=') === 0) {
          cLineIndex = i;
        // Remove previous b:AS settings
        } else if (sdpLines[i].indexOf('b=AS:') === 0 || sdpLines[i].indexOf('b:TIAS:') === 0) {
          sdpLines.splice(i, 1);
          i--;
        }
      }
    }

    if (!(typeof bw === 'number' && bw > 0)) {
      self._log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Not limiting "' + type + '" bandwidth']);
      return;
    }

    if (cLineIndex === -1) {
      self._log.error([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Failed setting "' +
        type + '" bandwidth as c-line is missing.']);
      return;
    }

    // Follow RFC 4566, that the b-line should follow after c-line.
    self._log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Limiting maximum sending "' + type + '" bandwidth ->'], bw);
    sdpLines.splice(cLineIndex + 1, 0, window.webrtcDetectedBrowser === 'firefox' ? 'b=TIAS:' + (bw * 1024) : 'b=AS:' + bw);
  };

  parseFn('audio', this._streamsBandwidthSettings.bAS.audio);
  parseFn('video', this._streamsBandwidthSettings.bAS.video);
  parseFn('data', this._streamsBandwidthSettings.bAS.data);

  // Sets the experimental google bandwidth
  if ((typeof this._streamsBandwidthSettings.googleX.min === 'number') || (typeof this._streamsBandwidthSettings.googleX.max === 'number')) {
    var codec = null;
    var codecRtpMapLineIndex = -1;
    var codecFmtpLineIndex = -1;

    for (var j = 0; j < sdpLines.length; j++) {
      if (sdpLines[j].indexOf('m=video') === 0) {
        codec = sdpLines[j].split(' ')[3];
      } else if (codec) {
        if (sdpLines[j].indexOf('m=') === 0) {
          break;
        }

        if (sdpLines[j].indexOf('a=rtpmap:' + codec + ' ') === 0) {
          codecRtpMapLineIndex = j;
        } else if (sdpLines[j].indexOf('a=fmtp:' + codec + ' ') === 0) {
          sdpLines[j] = sdpLines[j].replace(/x-google-(min|max)-bitrate=[0-9]*[;]*/gi, '');
          codecFmtpLineIndex = j;
          break;
        }
      }
    }

    if (codecRtpMapLineIndex > -1) {
      var xGoogleParams = '';

      if (typeof this._streamsBandwidthSettings.googleX.min === 'number') {
        xGoogleParams += 'x-google-min-bitrate=' + this._streamsBandwidthSettings.googleX.min + ';';
      }

      if (typeof this._streamsBandwidthSettings.googleX.max === 'number') {
        xGoogleParams += 'x-google-max-bitrate=' + this._streamsBandwidthSettings.googleX.max + ';';
      }

      this._log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Limiting x-google-bitrate ->'], xGoogleParams);

      if (codecFmtpLineIndex > -1) {
        sdpLines[codecFmtpLineIndex] += (sdpLines[codecFmtpLineIndex].split(' ')[1] ? ';' : '') + xGoogleParams;
      } else {
        sdpLines.splice(codecRtpMapLineIndex + 1, 0, 'a=fmtp:' + codec + ' ' + xGoogleParams);
      }
    }
  }

  return sdpLines.join('\r\n');
};

/**
 * Function that modifies the session description to set the preferred audio/video codec.
 * @method _setSDPCodec
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._setSDPCodec = function(targetMid, sessionDescription) {
  var self = this;
  var sdpLines = sessionDescription.sdp.split('\r\n');
  var parseFn = function (type, codec) {
    if (codec === 'auto') {
      self._log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Not preferring any codec for "' + type + '" streaming. Using browser selection.']);
      return;
    }

    // Find the codec first
    for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].indexOf('a=rtpmap:') === 0 && (sdpLines[i].toLowerCase()).indexOf(codec.toLowerCase()) > 0) {
        var payload = sdpLines[i].split(':')[1].split(' ')[0] || null;

        if (!payload) {
          self._log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Not preferring "' +
            codec + '" for "' + type + '" streaming as payload is not found.']);
          return;
        }

        for (var j = 0; j < sdpLines.length; j++) {
          if (sdpLines[j].indexOf('m=' + type) === 0) {
            self._log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Preferring "' +
              codec + '" for "' + type + '" streaming.']);

            var parts = sdpLines[j].split(' ');

            if (parts.indexOf(payload) >= 3) {
              parts.splice(parts.indexOf(payload), 1);
            }

            // Example: m=audio 9 UDP/TLS/RTP/SAVPF 111
            parts.splice(3, 0, payload);
            sdpLines[j] = parts.join(' ');
            break;
          }
        }
      }
    }
  };

  parseFn('audio', this._selectedAudioCodec);
  parseFn('video', this._selectedVideoCodec);

  return sdpLines.join('\r\n');
};

/**
 * Function that modifies the session description to remove the previous experimental H264
 * codec that is apparently breaking connections.
 * NOTE: We should perhaps not remove it since H264 is supported?
 * @method _removeSDPFirefoxH264Pref
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._removeSDPFirefoxH264Pref = function(targetMid, sessionDescription) {
  this._log.info([targetMid, 'RTCSessionDesription', sessionDescription.type,
    'Removing Firefox experimental H264 flag to ensure interopability reliability']);

  return sessionDescription.sdp.replace(/a=fmtp:0 profile-level-id=0x42e00c;packetization-mode=1\r\n/g, '');
};

/**
 * Function that modifies the session description to append the MediaStream and MediaStreamTrack IDs that seems
 * to be missing from Firefox answer session description to Chrome connection causing freezes in re-negotiation.
 * @method _addSDPMediaStreamTrackIDs
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._addSDPMediaStreamTrackIDs = function (targetMid, sessionDescription) {
  var self = this;
  if (!(this._peerConnections[targetMid] && this._peerConnections[targetMid].getLocalStreams().length > 0)) {
    this._log.log([targetMid, 'RTCSessionDesription', sessionDescription.type,
      'Not enforcing MediaStream IDs as no Streams is sent.']);
    return sessionDescription.sdp;
  }

  var sessionDescriptionStr = sessionDescription.sdp;

  if (!this._enableIceTrickle) {
    sessionDescriptionStr = sessionDescriptionStr.replace(/a=end-of-candidates\r\n/g, '');
  }

  var sdpLines = sessionDescriptionStr.split('\r\n');
  var agent = ((this._peerInformations[targetMid] || {}).agent || {}).name || '';
  var localStream = this._peerConnections[targetMid].getLocalStreams()[0];
  var localStreamId = localStream.id || localStream.label;

  var parseFn = function (type, tracks) {
    if (tracks.length === 0) {
      self._log.log([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Not enforcing "' + type + '" MediaStreamTrack IDs as no Stream "' + type + '" tracks is sent.']);
      return;
    }

    var trackId = tracks[0].id || tracks[0].label;
    var trackLabel = tracks[0].label || 'Default';
    var ssrcId = null;
    var hasReachedType = false;

    // Get SSRC ID
    for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].indexOf('m=' + type) === 0) {
        if (!hasReachedType) {
          hasReachedType = true;
          continue;
        } else {
          break;
        }
      }

      if (hasReachedType && sdpLines[i].indexOf('a=ssrc:') === 0) {
        ssrcId = (sdpLines[i].split(':')[1] || '').split(' ')[0] || null;

        var msidLine = 'a=ssrc:' + ssrcId + ' msid:' + localStreamId + ' ' + trackId;
        var mslabelLine = 'a=ssrc:' + ssrcId + ' mslabel:' + trackLabel;
        var labelLine = 'a=ssrc:' + ssrcId + ' label:' + trackLabel;

        if (sdpLines.indexOf(msidLine) === -1) {
          sdpLines.splice(i + 1, 0, msidLine);
          i++;
        }

        if (sdpLines.indexOf(mslabelLine) === -1) {
          sdpLines.splice(i + 1, 0, mslabelLine);
          i++;
        }

        if (sdpLines.indexOf(labelLine) === -1) {
          sdpLines.splice(i + 1, 0, labelLine);
          i++;
        }

        self._log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Updating MediaStreamTrack ssrc (' +
          ssrcId + ') for "' + localStreamId + '" stream and "' + trackId + '" (label:"' + trackLabel + '")']);

        break;
      }
    }
  };

  parseFn('audio', localStream.getAudioTracks());
  parseFn('video', localStream.getVideoTracks());

  // Append signaling of end-of-candidates
  if (!this._enableIceTrickle){
    this._log.info([targetMid, 'RTCSessionDesription', sessionDescription.type,
      'Appending end-of-candidates signal for non-trickle ICE connection.']);
    for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].indexOf('a=candidate:') === 0) {
        if (sdpLines[i + 1] ? !(sdpLines[i + 1].indexOf('a=candidate:') === 0 ||
          sdpLines[i + 1].indexOf('a=end-of-candidates') === 0) : true) {
          sdpLines.splice(i + 1, 0, 'a=end-of-candidates');
          i++;
        }
      }
    }
  }

  if (sessionDescription.type === this.HANDSHAKE_PROGRESS.ANSWER && this._sdpSessions[targetMid]) {
    var bundleLineIndex = -1;
    var mLineIndex = -1;

    for (var j = 0; j < sdpLines.length; j++) {
      if (sdpLines[j].indexOf('a=group:BUNDLE') === 0 && this._sdpSessions[targetMid].remote.bundleLine) {
        sdpLines[j] = this._sdpSessions[targetMid].remote.bundleLine;
      } else if (sdpLines[j].indexOf('m=') === 0) {
        mLineIndex++;
        var compareA = sdpLines[j].split(' ');
        var compareB = (this._sdpSessions[targetMid].remote.mLines[mLineIndex] || '').split(' ');

        if (compareA[0] && compareB[0] && compareA[0] !== compareB[0]) {
          compareB[1] = 0;
          this._log.info([targetMid, 'RTCSessionDesription', sessionDescription.type,
            'Appending middle rejected m= line ->'], compareB.join(' '));
          sdpLines.splice(j, 0, compareB.join(' '));
          j++;
          mLineIndex++;
        }
      }
    }

    while (this._sdpSessions[targetMid].remote.mLines[mLineIndex + 1]) {
      mLineIndex++;
      var appendIndex = sdpLines.length;
      if (!sdpLines[appendIndex - 1].replace(/\s/gi, '')) {
        appendIndex -= 1;
      }
      var parts = (this._sdpSessions[targetMid].remote.mLines[mLineIndex] || '').split(' ');
      parts[1] = 0;
      this._log.info([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Appending later rejected m= line ->'], parts.join(' '));
      sdpLines.splice(appendIndex, 0, parts.join(' '));
    }
  }

  if (window.webrtcDetectedBrowser === 'edge' && sessionDescription.type === this.HANDSHAKE_PROGRESS.OFFER &&
    !sdpLines[sdpLines.length - 1].replace(/\s/gi, '')) {
    this._log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Removing last empty space for Edge browsers']);
    sdpLines.splice(sdpLines.length - 1, 1);
  }

  return sdpLines.join('\r\n');
};

/**
 * Function that modifies the session description to remove VP9 and H264 apt/rtx lines to prevent plugin connection breaks.
 * @method _removeSDPH264VP9AptRtxForOlderPlugin
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._removeSDPH264VP9AptRtxForOlderPlugin = function (targetMid, sessionDescription) {
  var removeVP9AptRtxPayload = false;
  var agent = (this._peerInformations[targetMid] || {}).agent || {};

  if (agent.pluginVersion) {
    // 0.8.870 supports
    var parts = agent.pluginVersion.split('.');
    removeVP9AptRtxPayload = parseInt(parts[0], 10) >= 0 && parseInt(parts[1], 10) >= 8 &&
      parseInt(parts[2], 10) >= 870;
  }

  // Remove rtx or apt= lines that prevent connections for browsers without VP8 or VP9 support
  // See: https://bugs.chromium.org/p/webrtc/issues/detail?id=3962
  if (['chrome', 'opera'].indexOf(window.webrtcDetectedBrowser) > -1 && removeVP9AptRtxPayload) {
    this._log.info([targetMid, 'RTCSessionDesription', sessionDescription.type,
      'Removing VP9/H264 apt= and rtx payload lines causing connectivity issues']);

    sessionDescription.sdp = sessionDescription.sdp.replace(/a=rtpmap:\d+ rtx\/\d+\r\na=fmtp:\d+ apt=101\r\n/g, '');
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=rtpmap:\d+ rtx\/\d+\r\na=fmtp:\d+ apt=107\r\n/g, '');
  }

  return sessionDescription.sdp;
};

/**
 * Function that modifies the session description to remove codecs.
 * @method _removeSDPCodecs
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._removeSDPCodecs = function (targetMid, sessionDescription) {
  var self = this;
  var audioSettings = this.getPeerInfo().settings.audio;

  var parseFn = function (type, codec) {
    var payloadList = sessionDescription.sdp.match(new RegExp('a=rtpmap:(\\d*)\\ ' + codec + '.*', 'gi'));

    if (!(Array.isArray(payloadList) && payloadList.length > 0)) {
      self._log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Not removing "' + codec + '" as it does not exists.']);
      return;
    }

    for (var i = 0; i < payloadList.length; i++) {
      var payload = payloadList[i].split(' ')[0].split(':')[1];

      self._log.info([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Removing "' + codec + '" payload ->'], payload);

      sessionDescription.sdp = sessionDescription.sdp.replace(
        new RegExp('a=rtpmap:' + payload + '\\ .*\\r\\n', 'g'), '');
      sessionDescription.sdp = sessionDescription.sdp.replace(
        new RegExp('a=fmtp:' + payload + '\\ .*\\r\\n', 'g'), '');
      sessionDescription.sdp = sessionDescription.sdp.replace(
        new RegExp('a=rtpmap:\\d+ rtx\\/\\d+\\r\\na=fmtp:\\d+ apt=' + payload + '\\r\\n', 'g'), '');

      // Remove the m-line codec
      var sdpLines = sessionDescription.sdp.split('\r\n');

      for (var j = 0; j < sdpLines.length; j++) {
        if (sdpLines[j].indexOf('m=' + type) === 0) {
          var parts = sdpLines[j].split(' ');

          if (parts.indexOf(payload) >= 3) {
            parts.splice(parts.indexOf(payload), 1);
          }

          sdpLines[j] = parts.join(' ');
          break;
        }
      }

      sessionDescription.sdp = sdpLines.join('\r\n');
    }
  };

  if (this._disableVideoFecCodecs) {
    if (this._hasMCU) {
      this._log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Not removing "ulpfec" or "red" codecs as connected to MCU to prevent connectivity issues.']);
    } else {
      parseFn('video', 'red');
      parseFn('video', 'ulpfec');
    }
  }

  if (this._disableComfortNoiseCodec && audioSettings && typeof audioSettings === 'object' && audioSettings.stereo) {
    parseFn('audio', 'CN');
  }

  return sessionDescription.sdp;
};

/**
 * Function that modifies the session description to remove REMB packets fb.
 * @method _removeSDPREMBPackets
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._removeSDPREMBPackets = function (targetMid, sessionDescription) {
  if (!this._disableREMB) {
    return sessionDescription.sdp;
  }

  this._log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Removing REMB packets.']);
  return sessionDescription.sdp.replace(/a=rtcp-fb:\d+ goog-remb\r\n/g, '');
};

/**
 * Function that retrieves the session description selected codec.
 * @method _getSDPSelectedCodec
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._getSDPSelectedCodec = function (targetMid, sessionDescription, type) {
  if (!(sessionDescription && sessionDescription.sdp)) {
    return null;
  }

  var sdpLines = sessionDescription.sdp.split('\r\n');
  var selectedCodecInfo = {
    name: null,
    implementation: null,
    clockRate: null,
    channels: null,
    payloadType: null,
    params: null
  };

  for (var i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].indexOf('m=' + type) === 0) {
      var parts = sdpLines[i].split(' ');

      if (parts.length < 4) {
        break;
      }

      selectedCodecInfo.payloadType = parseInt(parts[3], 10);

    } else if (selectedCodecInfo.payloadType !== null) {
      if (sdpLines[i].indexOf('m=') === 0) {
        break;
      }

      if (sdpLines[i].indexOf('a=rtpmap:' + selectedCodecInfo.payloadType + ' ') === 0) {
        var params = (sdpLines[i].split(' ')[1] || '').split('/');
        selectedCodecInfo.name = params[0] || '';
        selectedCodecInfo.clockRate = params[1] ? parseInt(params[1], 10) : null;
        selectedCodecInfo.channels = params[2] ? parseInt(params[2], 10) : null;

      } else if (sdpLines[i].indexOf('a=fmtp:' + selectedCodecInfo.payloadType + ' ') === 0) {
        selectedCodecInfo.params = sdpLines[i].split('a=fmtp:' + selectedCodecInfo.payloadType + ' ')[1] || null;
      }
    }
  }

  this._log.debug([targetMid, 'RTCSessionDesription', sessionDescription.type,
    'Parsing session description "' + type + '" codecs ->'], selectedCodecInfo);

  return selectedCodecInfo;
};

/**
 * Function that modifies the session description to remove non-relay ICE candidates.
 * @method _removeSDPFilteredCandidates
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._removeSDPFilteredCandidates = function (targetMid, sessionDescription) {
  // Handle Firefox MCU Peer ICE candidates
  if (targetMid === 'MCU' && sessionDescription.type === this.HANDSHAKE_PROGRESS.ANSWER &&
    window.webrtcDetectedBrowser === 'firefox') {
    sessionDescription.sdp = sessionDescription.sdp.replace(/ generation 0/g, '');
    sessionDescription.sdp = sessionDescription.sdp.replace(/ udp /g, ' UDP ');
  }

  if (this._forceTURN && this._hasMCU) {
    this._log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Not filtering ICE candidates as ' +
      'TURN connections are enforced as MCU is present (and act as a TURN itself) so filtering of ICE candidate ' +
      'flags are not honoured']);
    return sessionDescription.sdp;
  }

  if (this._filterCandidatesType.host) {
    this._log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Removing "host" ICE candidates.']);
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=candidate:.*host.*\r\n/g, '');
  }

  if (this._filterCandidatesType.srflx) {
    this._log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Removing "srflx" ICE candidates.']);
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=candidate:.*srflx.*\r\n/g, '');
  }

  if (this._filterCandidatesType.relay) {
    this._log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Removing "relay" ICE candidates.']);
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=candidate:.*relay.*\r\n/g, '');
  }

  // sessionDescription.sdp = sessionDescription.sdp.replace(/a=candidate:(?!.*relay.*).*\r\n/g, '');

  return sessionDescription.sdp;
};

/**
 * Function that retrieves the current list of support codecs.
 * @method _getCodecsSupport
 * @private
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype._getCodecsSupport = function (callback) {
  var self = this;

  if (self._currentCodecSupport) {
    callback(null);
  }

  self._currentCodecSupport = { audio: {}, video: {} };

  try {
    if (window.webrtcDetectedBrowser === 'edge') {
      var codecs = RTCRtpSender.getCapabilities().codecs;

      for (var i = 0; i < codecs.length; i++) {
        if (['audio','video'].indexOf(codecs[i].kind) > -1 && codecs[i].name) {
          var codec = codecs[i].name.toLowerCase();
          self._currentCodecSupport[codecs[i].kind][codec] = codecs[i].clockRate +
            (codecs[i].numChannels > 1 ? '/' + codecs[i].numChannels : '');
        }
      }
      // Ignore .fecMechanisms for now
      callback(null);

    } else {
      var pc = new RTCPeerConnection(null);
      var offerConstraints = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      };

      if (['IE', 'safari'].indexOf(window.webrtcDetectedBrowser) > -1) {
        offerConstraints = {
          mandatory: {
            OfferToReceiveVideo: true,
            OfferToReceiveAudio: true
          }
        };
      }

      pc.createOffer(function (offer) {
        var sdpLines = offer.sdp.split('\r\n');
        var mediaType = '';

        for (var i = 0; i < sdpLines.length; i++) {
          if (sdpLines[i].indexOf('m=') === 0) {
            mediaType = (sdpLines[i].split('m=')[1] || '').split(' ')[0];
          } else if (sdpLines[i].indexOf('a=rtpmap:') === 0) {
            if (['audio', 'video'].indexOf(mediaType) === -1) {
              continue;
            }
            var parts = (sdpLines[i].split(' ')[1] || '').split('/');
            var codec = (parts[0] || '').toLowerCase();
            var info = parts[1] + (parts[2] ? '/' + parts[2] : '');

            self._currentCodecSupport[mediaType][codec] = info;
          }
        }

        callback(null);

      }, function (error) {
        callback(error);
      }, offerConstraints);
    }
  } catch (error) {
    callback(error);
  }
};

/**
 * Function that modifies the session description to handle the connection settings.
 * This is experimental and never recommended to end-users.
 * @method _handleSDPConnectionSettings
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._handleSDPConnectionSettings = function (targetMid, sessionDescription, direction) {
  var self = this;

  if (!self._sdpSessions[targetMid]) {
    return sessionDescription.sdp;
  }

  var sessionDescriptionStr = sessionDescription.sdp;

  if (direction === 'remote' && !self.getPeerInfo(targetMid).config.enableIceTrickle) {
    sessionDescriptionStr = sessionDescriptionStr.replace(/a=end-of-candidates\r\n/g, '');
  }

  var sdpLines = sessionDescriptionStr.split('\r\n');
  var peerAgent = ((self._peerInformations[targetMid] || {}).agent || {}).name || '';
  var mediaType = '';
  var bundleLineIndex = -1;
  var bundleLineMids = [];
  var mLineIndex = -1;
  var settings = UtilsFactory.clone(self._sdpSettings);

  if (targetMid === 'MCU') {
    settings.connection.audio = true;
    settings.connection.video = true;
    settings.connection.data = true;
  }

  if (settings.video) {
    settings.connection.video = (window.webrtcDetectedBrowser === 'edge' && peerAgent !== 'edge') ||
      (['IE', 'safari'].indexOf(window.webrtcDetectedBrowser) > -1 && peerAgent === 'edge' ?
      !!self._currentCodecSupport.video.h264 : true);
  }

  if (self._hasMCU) {
    settings.direction.audio.receive = targetMid === 'MCU' ? false : true;
    settings.direction.audio.send = targetMid === 'MCU' ? true : false;
    settings.direction.video.receive = targetMid === 'MCU' ? false : true;
    settings.direction.video.send = targetMid === 'MCU' ? true : false;
  }

  // ANSWERER: Reject only the m= lines. Returned rejected m= lines as well.
  // OFFERER: Remove m= lines

  self._sdpSessions[targetMid][direction].mLines = [];
  self._sdpSessions[targetMid][direction].bundleLine = '';

  for (var i = 0; i < sdpLines.length; i++) {
    // Cache the a=group:BUNDLE line used for remote answer from Edge later
    if (sdpLines[i].indexOf('a=group:BUNDLE') === 0) {
      self._sdpSessions[targetMid][direction].bundleLine = sdpLines[i];
      bundleLineIndex = i;

    // Check if there's a need to reject m= line
    } else if (sdpLines[i].indexOf('m=') === 0) {
      mediaType = (sdpLines[i].split('m=')[1] || '').split(' ')[0] || '';
      mediaType = mediaType === 'application' ? 'data' : mediaType;
      mLineIndex++;

      self._sdpSessions[targetMid][direction].mLines[mLineIndex] = sdpLines[i];
      
      // Check if there is missing unsupported video codecs support and reject it regardles of MCU Peer or not
      if (!settings.connection[mediaType]) {
        self._log.log([targetMid, 'RTCSessionDesription', sessionDescription.type,
          'Removing rejected m=' + mediaType + ' line ->'], sdpLines[i]);
        
        // Check if answerer and we do not have the power to remove the m line if index is 0
        // Set as a=inactive because we do not have that power to reject it somehow..
        // first m= line cannot be rejected for BUNDLE
        if (bundleLineIndex > -1 && mLineIndex === 0 && (direction === 'remote' ?
          sessionDescription.type === this.HANDSHAKE_PROGRESS.OFFER :
          sessionDescription.type === this.HANDSHAKE_PROGRESS.ANSWER)) {
          self._log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type,
            'Not removing rejected m=' + mediaType + ' line ->'], sdpLines[i]);
          settings.connection[mediaType] = true;
          if (['audio', 'video'].indexOf(mediaType) > -1) {
            settings.direction[mediaType].send = false;
            settings.direction[mediaType].receive = false;
          }
          continue;
        }

        if (direction === 'remote' || sessionDescription.type === this.HANDSHAKE_PROGRESS.ANSWER) {
          var parts = sdpLines[i].split(' ');
          parts[1] = 0;
          sdpLines[i] = parts.join(' ');
          continue;
        }
      }
    }

    if (direction === 'remote' && sdpLines[i].indexOf('a=candidate:') === 0 &&
      !self.getPeerInfo(targetMid).config.enableIceTrickle) {
      if (sdpLines[i + 1] ? !(sdpLines[i + 1].indexOf('a=candidate:') === 0 ||
        sdpLines[i + 1].indexOf('a=end-of-candidates') === 0) : true) {
        self._log.info([targetMid, 'RTCSessionDesription', sessionDescription.type,
          'Appending end-of-candidates signal for non-trickle ICE connection.']);
        sdpLines.splice(i + 1, 0, 'a=end-of-candidates');
        i++;
      }
    }

    if (mediaType) {
      // Remove lines if we are rejecting the media and ensure unless (rejectVideoMedia is true), MCU has to enable those m= lines
      if (!settings.connection[mediaType]) {
        sdpLines.splice(i, 1);
        i--;
      
      // Store the mids session description
      } else if (sdpLines[i].indexOf('a=mid:') === 0) {
        bundleLineMids.push(sdpLines[i].split('a=mid:')[1] || '');
      
      // Configure direction a=sendonly etc for local sessiondescription
      }  else if (direction === 'local' && mediaType && ['audio', 'video'].indexOf(mediaType) > -1 &&
        ['a=sendrecv', 'a=sendonly', 'a=recvonly'].indexOf(sdpLines[i]) > -1) {

        if (settings.direction[mediaType].send && !settings.direction[mediaType].receive) {
          sdpLines[i] = sdpLines[i].indexOf('send') > -1 ? 'a=sendonly' : 'a=inactive';
        } else if (!settings.direction[mediaType].send && settings.direction[mediaType].receive) {
          sdpLines[i] = sdpLines[i].indexOf('recv') > -1 ? 'a=recvonly' : 'a=inactive';
        } else if (!settings.direction[mediaType].send && !settings.direction[mediaType].receive) {
        // MCU currently does not support a=inactive flag.. what do we do here?
          sdpLines[i] = 'a=inactive';
        }

        // Handle Chrome bundle bug. - See: https://bugs.chromium.org/p/webrtc/issues/detail?id=6280
        if (!self._hasMCU && window.webrtcDetectedBrowser !== 'firefox' && peerAgent === 'firefox' &&
          sessionDescription.type === self.HANDSHAKE_PROGRESS.OFFER && sdpLines[i] === 'a=recvonly') {
          self._log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Overriding any original settings ' +
            'to receive only to send and receive to resolve chrome BUNDLE errors.']);
          sdpLines[i] = 'a=sendrecv';
          settings.direction[mediaType].send = true;
          settings.direction[mediaType].receive = true;
        }
      }
    }

    // Remove weird empty characters for Edge case.. :(
    if (!(sdpLines[i] || '').replace(/\n|\r|\s|\ /gi, '')) {
      sdpLines.splice(i, 1);
      i--;
    }
  }

  // Fix chrome "offerToReceiveAudio" local offer not removing audio BUNDLE
  if (bundleLineIndex > -1) {
    sdpLines[bundleLineIndex] = 'a=group:BUNDLE ' + bundleLineMids.join(' ');
  }

  // Append empty space below
  if (window.webrtcDetectedBrowser !== 'edge') {
    if (!sdpLines[sdpLines.length - 1].replace(/\n|\r|\s/gi, '')) {
      sdpLines[sdpLines.length - 1] = '';
    } else {
      sdpLines.push('');
    }
  }

  self._log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Handling connection lines and direction ->'], settings);

  return sdpLines.join('\r\n');
};

/**
 * Function that parses and retrieves the session description fingerprint.
 * @method _getSDPFingerprint
 * @private
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype._getSDPFingerprint = function (targetMid, sessionDescription) {
  var fingerprint = {
    fingerprint: null,
    fingerprintAlgorithm: null,
    derBase64: null
  };

  if (!(sessionDescription && sessionDescription.sdp)) {
    return fingerprint;
  }

  var sdpLines = sessionDescription.sdp.split('\r\n');

  for (var i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].indexOf('a=fingerprint') === 0) {
      var parts = sdpLines[i].replace('a=fingerprint:', '').split(' ');
      fingerprint.fingerprint = parts[1];
      fingerprint.fingerprintAlgorithm = parts[0];
      break;
    }
  }

  return fingerprint;
};

})(this);