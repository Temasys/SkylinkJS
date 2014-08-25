/**
 * @class Skyway
 */
(function() {
  /**
   * Please check on the {{#crossLink "Skyway/init:method"}}init(){{/crossLink}} function
   * on how you can initialize Skyway. Note that:
   * - You will have to subscribe all Skyway events first before calling
   *   {{#crossLink "Skyway/init:method"}}init(){{/crossLink}}.
   * - If you need an api key, please [register an api key](http://
   *   developer.temasys.com.sg) at our developer console.
   * @class Skyway
   * @constructor
   * @example
   *   // Getting started on how to use Skyway
   *   var SkywayDemo = new Skyway();
   *   SkywayDemo.init('apiKey');
   * @since 0.1.0
   */
  function Skyway() {
    if (!(this instanceof Skyway)) {
      return new Skyway();
    }
    /**
     * Version of Skyway
     * @attribute VERSION
     * @type String
     * @readOnly
     * @since 0.1.0
     */
    this.VERSION = '@@version';
    /**
     * List of regional server for Skyway to connect to.
     * Default server is US1. Servers:
     * @attribute REGIONAL_SERVER
     * @type JSON
     * @param {String} US1 USA server 1. Default server if region is not provided.
     * @param {String} US2 USA server 2
     * @param {String} SG Singapore server
     * @param {String} EU Europe server
     * @readOnly
     * @since 0.3.0
     */
    this.REGIONAL_SERVER = {
      US1: 'us1',
      US2: 'us2',
      SG: 'sg',
      EU: 'eu'
    };
    /**
     * ICE Connection States. States that would occur are:
     * @attribute ICE_CONNECTION_STATE
     * @type JSON
     * @param {String} STARTING     ICE Connection to Peer initialized
     * @param {String} CLOSED       ICE Connection to Peer has been closed
     * @param {String} FAILED       ICE Connection to Peer has failed
     * @param {String} CHECKING     ICE Connection to Peer is still in checking status
     * @param {String} DISCONNECTED ICE Connection to Peer has been disconnected
     * @param {String} CONNECTED    ICE Connection to Peer has been connected
     * @param {String} COMPLETED    ICE Connection to Peer has been completed
     * @readOnly
     * @since 0.1.0
     */
    this.ICE_CONNECTION_STATE = {
      STARTING: 'starting',
      CHECKING: 'checking',
      CONNECTED: 'connected',
      COMPLETED: 'completed',
      CLOSED: 'closed',
      FAILED: 'failed',
      DISCONNECTED: 'disconnected'
    };
    /**
     * Peer Connection States. States that would occur are:
     * @attribute PEER_CONNECTION_STATE
     * @type JSON
     * @param {String} STABLE               Initial stage. No local or remote description is applied
     * @param {String} HAVE_LOCAL_OFFER     "Offer" local description is applied
     * @param {String} HAVE_REMOTE_OFFER    "Offer" remote description is applied
     * @param {String} HAVE_LOCAL_PRANSWER  "Answer" local description is applied
     * @param {String} HAVE_REMOTE_PRANSWER "Answer" remote description is applied
     * @param {String} ESTABLISHED          All description is set and is applied
     * @param {String} CLOSED               Connection closed.
     * @readOnly
     * @since 0.1.0
     */
    this.PEER_CONNECTION_STATE = {
      STABLE: 'stable',
      HAVE_LOCAL_OFFER: 'have-local-offer',
      HAVE_REMOTE_OFFER: 'have-remote-offer',
      HAVE_LOCAL_PRANSWER: 'have-local-pranswer',
      HAVE_REMOTE_PRANSWER: 'have-remote-pranswer',
      ESTABLISHED: 'established',
      CLOSED: 'closed'
    };
    /**
     * ICE Candidate Generation States. States that would occur are:
     * @attribute CANDIDATE_GENERATION_STATE
     * @type JSON
     * @param {String} GATHERING ICE Gathering to Peer has just started
     * @param {String} DONE      ICE Gathering to Peer has been completed
     * @readOnly
     * @since 0.1.0
     */
    this.CANDIDATE_GENERATION_STATE = {
      GATHERING: 'gathering',
      DONE: 'done'
    };
    /**
     * Handshake Progress Steps. Steps that would occur are:
     * @type JSON
     * @attribute HANDSHAKE_PROGRESS
     * @param {String} ENTER   Step 1. Received enter from Peer
     * @param {String} WELCOME Step 2. Received welcome from Peer
     * @param {String} OFFER   Step 3. Received offer from Peer
     * @param {String} ANSWER  Step 4. Received answer from Peer
     * @param {String} ERROR   Error state
     * @readOnly
     * @since 0.1.0
     */
    this.HANDSHAKE_PROGRESS = {
      ENTER: 'enter',
      WELCOME: 'welcome',
      OFFER: 'offer',
      ANSWER: 'answer',
      ERROR: 'error'
    };
    /**
     * Data Channel Connection States. Steps that would occur are:
     * @attribute DATA_CHANNEL_STATE
     * @type JSON
     * @param {String} NEW        Step 1. DataChannel has been created.
     * @param {String} LOADED     Step 2. DataChannel events has been loaded.
     * @param {String} OPEN       Step 3. DataChannel is connected. [WebRTC Standard]
     * @param {String} CONNECTING DataChannel is connecting. [WebRTC Standard]
     * @param {String} CLOSING    DataChannel is closing. [WebRTC Standard]
     * @param {String} CLOSED     DataChannel has been closed. [WebRTC Standard]
     * @param {String} ERROR      DataChannel has an error ocurring.
     * @readOnly
     * @since 0.1.0
     */
    this.DATA_CHANNEL_STATE = {
      CONNECTING: 'connecting',
      OPEN: 'open',
      CLOSING: 'closing',
      CLOSED: 'closed',
      NEW: 'new',
      LOADED: 'loaded',
      ERROR: 'error'
    };
    /**
     * System actions received from Signaling server. System action outcomes are:
     * @attribute SYSTEM_ACTION
     * @type JSON
     * @param {String} WARNING System is warning user that the room is closing
     * @param {String} REJECT  System has rejected user from room
     * @param {String} CLOSED  System has closed the room
     * @readOnly
     * @since 0.1.0
     */
    this.SYSTEM_ACTION = {
      WARNING: 'warning',
      REJECT: 'reject',
      CLOSED: 'close'
    };
    /**
     * State to check if Skyway initialization is ready. Steps that would occur are:
     * @attribute DATA_CHANNEL_STATE
     * @type JSON
     * @param {Integer} INIT      Step 1. Init state. If ReadyState fails, it goes to 0.
     * @param {Integer} LOADING   Step 2. RTCPeerConnection exists. Roomserver,
     *   API ID provided is not empty
     * @param {Integer} COMPLETED Step 3. Retrieval of configuration is complete.
     *   Socket.io begins connection.
     * @param {Integer} ERROR     Error state. Occurs when ReadyState fails loading.
     * @readOnly
     * @since 0.1.0
     */
    this.READY_STATE_CHANGE = {
      INIT: 0,
      LOADING: 1,
      COMPLETED: 2,
      ERROR: -1
    };

    /**
     * Error states that occurs when retrieving server information. States are:
     * @attribute READY_STATE_CHANGE_ERROR
     * @type JSON
     * @param {Integer} API_INVALID  Api Key provided does not exist.
     * @param {Integer} API_DOMAIN_NOT_MATCH Api Key used in domain does not match.
     * @param {Integer} API_CORS_DOMAIN_NOT_MATCH Api Key used in CORS domain does
     *   not match.
     * @param {Integer} API_CREDENTIALS_INVALID Api Key credentials does not exist.
     * @param {Integer} API_CREDENTIALS_NOT_MATCH Api Key credentials does not
     *   match what is expected.
     * @param {Integer} API_INVALID_PARENT_KEY Api Key does not have a parent key
     *   nor is a root key.
     * @param {Integer} API_NOT_ENOUGH_CREDIT Api Key does not have enough credits
     *   to use.
     * @param {Integer} API_NOT_ENOUGH_PREPAID_CREDIT Api Key does not have enough
     *   prepaid credits to use.
     * @param {Integer} API_FAILED_FINDING_PREPAID_CREDIT Api Key preapid payments
     *   does not exist.
     * @param {Integer} API_NO_MEETING_RECORD_FOUND Api Key does not have a meeting
     *   record at this timing. This occurs when Api Key is a static one.
     * @param {Integer} ROOM_LOCKED Room is locked.
     * @param {Integer} NO_SOCKET_IO No socket.io dependency is loaded to use.
     * @param {Integer} NO_XMLHTTPREQUEST_SUPPORT Browser does not support
     *   XMLHttpRequest to use.
     * @param {Integer} NO_WEBRTC_SUPPORT Browser does not have WebRTC support.
     * @param {Integer} NO_PATH No path is loaded yet.
     * @param {Integer} INVALID_XMLHTTPREQUEST_STATUS Invalid XMLHttpRequest
     *   when retrieving information.
     * @readOnly
     * @since 0.4.0
     */
    this.READY_STATE_CHANGE_ERROR = {
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
     * Data Channel Transfer Type. Types are:
     * @attribute DATA_TRANSFER_TYPE
     * @type JSON
     * @param {String} UPLOAD    Error occurs at UPLOAD state
     * @param {String} DOWNLOAD  Error occurs at DOWNLOAD state
     * @readOnly
     * @since 0.1.0
     */
    this.DATA_TRANSFER_TYPE = {
      UPLOAD: 'upload',
      DOWNLOAD: 'download'
    };
    /**
     * Data Channel Transfer State. State that would occur are:
     * @attribute DATA_TRANSFER_STATE
     * @type JSON
     * @param {String} UPLOAD_STARTED     Data Transfer of Upload has just started
     * @param {String} DOWNLOAD_STARTED   Data Transfer od Download has just started
     * @param {String} REJECTED           Peer rejected User's Data Transfer request
     * @param {String} ERROR              Error occurred when uploading or downloading file
     * @param {String} UPLOADING          Data is uploading
     * @param {String} DOWNLOADING        Data is downloading
     * @param {String} UPLOAD_COMPLETED   Data Transfer of Upload has completed
     * @param {String} DOWNLOAD_COMPLETED Data Transfer of Download has completed
     * @readOnly
     * @since 0.1.0
     */
    this.DATA_TRANSFER_STATE = {
      UPLOAD_STARTED: 'uploadStarted',
      DOWNLOAD_STARTED: 'downloadStarted',
      UPLOAD_REQUEST: 'request',
      REJECTED: 'rejected',
      ERROR: 'error',
      UPLOADING: 'uploading',
      DOWNLOADING: 'downloading',
      UPLOAD_COMPLETED: 'uploadCompleted',
      DOWNLOAD_COMPLETED: 'downloadCompleted'
    };
    /**
     * TODO : ArrayBuffer and Blob in DataChannel
     * Data Channel Transfer Data type. Data Types are:
     * @attribute DATA_TRANSFER_DATA_TYPE
     * @type JSON
     * @param {String} BINARY_STRING BinaryString data
     * @param {String} ARRAY_BUFFER  ArrayBuffer data
     * @param {String} BLOB          Blob data
     * @readOnly
     * @since 0.1.0
     */
    this.DATA_TRANSFER_DATA_TYPE = {
      BINARY_STRING: 'binaryString',
      ARRAY_BUFFER: 'arrayBuffer',
      BLOB: 'blob'
    };
    /**
     * Signaling message type. These message types are fixed.
     * (Legend: S - Send only. R - Received only. SR - Can be Both).
     * Signaling types are:
     * @attribute SIG_TYPE
     * @type JSON
     * @readOnly
     * @param {String} JOIN_ROOM S. Join the Room
     * @param {String} IN_ROOM R. User has already joined the Room
     * @param {String} ENTER SR. Enter from handshake
     * @param {String} WELCOME SR. Welcome from handshake
     * @param {String} OFFER SR. Offer from handshake
     * @param {String} ANSWER SR. Answer from handshake
     * @param {String} CANDIDATE SR. Candidate received
     * @param {String} BYE R. Peer left the room
     * @param {String} CHAT SR. Chat message relaying
     * @param {String} REDIRECT R. Server redirecting User
     * @param {String} ERROR R. Server occuring an error
     * @param {String} INVITE SR. TODO.
     * @param {String} UPDATE_USER SR. Update of User information
     * @param {String} ROOM_LOCK SR. Locking of Room
     * @param {String} MUTE_VIDEO SR. Muting of User's video
     * @param {String} MUTE_AUDIO SR. Muting of User's audio
     * @param {String} PUBLIC_MESSAGE SR. Sending a public broadcast message.
     * @param {String} PRIVATE_MESSAGE SR. Sending a private message
     * @private
     * @since 0.3.0
     */
    this.SIG_TYPE = {
      JOIN_ROOM: 'joinRoom',
      IN_ROOM: 'inRoom',
      ENTER: this.HANDSHAKE_PROGRESS.ENTER,
      WELCOME: this.HANDSHAKE_PROGRESS.WELCOME,
      OFFER: this.HANDSHAKE_PROGRESS.OFFER,
      ANSWER: this.HANDSHAKE_PROGRESS.ANSWER,
      CANDIDATE: 'candidate',
      BYE: 'bye',
      CHAT: 'chat',
      REDIRECT: 'redirect',
      ERROR: 'error',
      UPDATE_USER: 'updateUserEvent',
      ROOM_LOCK: 'roomLockEvent',
      MUTE_VIDEO: 'muteVideoEvent',
      MUTE_AUDIO: 'muteAudioEvent',
      PUBLIC_MESSAGE: 'public',
      PRIVATE_MESSAGE: 'private',
      GROUP: 'group'
    };
    /**
     * Lock Action States
     * @attribute LOCK_ACTION
     * @type JSON
     * @param {String} LOCK   Lock the room
     * @param {String} UNLOCK Unlock the room
     * @param {String} STATUS Get the status of the room if it's locked or not
     * @readOnly
     * @since 0.2.0
     */
    this.LOCK_ACTION = {
      LOCK: 'lock',
      UNLOCK: 'unlock',
      STATUS: 'check'
    };
    /**
     * Video Resolutions. Resolution types are:
     * @param {JSON} QVGA QVGA video quality
     * @param {Integer} QVGA.width 320
     * @param {Integer} QVGA.height 180
     * @param {JSON} VGA VGA video quality
     * @param {Integer} VGA.width 640
     * @param {Integer} VGA.height 360
     * @param {JSON} HD HD video quality
     * @param {Integer} HD.width 1280
     * @param {Integer} HD.height 720
     * @param {JSON} FHD Might not be supported. FullHD video quality.
     * @param {Integer} FHD.width 1920
     * @param {Integer} FHD.height 1080
     * @attribute VIDEO_RESOLUTION
     * @type JSON
     * @readOnly
     * @since 0.2.0
     */
    this.VIDEO_RESOLUTION = {
      QVGA: {
        width: 320,
        height: 180
      },
      VGA: {
        width: 640,
        height: 360
      },
      HD: {
        width: 1280,
        height: 720
      },
      FHD: {
        width: 1920,
        height: 1080
      } // Please check support
    };
    /**
     * NOTE ALEX: check if last char is '/'
     * @attribute _path
     * @type String
     * @default _serverPath
     * @final
     * @required
     * @private
     * @since 0.1.0
     */
    this._path = null;
    /**
     * Url Skyway makes API calls to
     * @attribute _serverPath
     * @type String
     * @final
     * @required
     * @private
     * @since 0.2.0
     */
    this._serverPath = '//api.temasys.com.sg';
    /**
     * The server region the room connects to
     * @attribute _serverRegion
     * @type String
     * @default REGIONAL_SERVER.US1
     * @private
     * @since 0.3.0
     */
    this._serverRegion = null;
    /**
     * The Room server User connects to
     * @attribute _roomServer
     * @type String
     * @private
     * @since 0.3.0
     */
    this._roomServer = null;
    /**
     * The Application Key ID
     * @attribute _apiKey
     * @type String
     * @private
     * @since 0.3.0
     */
    this._apiKey = null;
    /**
     * The default room that the User connects to
     * @attribute _defaultRoom
     * @type String
     * @private
     * @since 0.3.0
     */
    this._defaultRoom = null;
    /**
     * The room that the User connects to
     * @attribute _selectedRoom
     * @type String
     * @default _defaultRoom
     * @private
     * @since 0.3.0
     */
    this._selectedRoom = null;
    /**
     * The room start datetime in ISO format
     * @attribute _roomStart
     * @type String
     * @private
     * @optional
     * @since 0.3.0
     */
    this._roomStart = null;
    /**
     * The room duration before closing
     * @attribute _roomDuration
     * @type Integer
     * @private
     * @optional
     * @since 0.3.0
     */
    this._roomDuration = null;
    /**
     * The room credentials to set the start time and duration
     * @attribute _roomCredentials
     * @type String
     * @private
     * @optional
     * @since 0.3.0
     */
    this._roomCredentials = null;
    /**
     * The Server Key
     * @attribute _key
     * @type String
     * @private
     * @since 0.1.0
     */
    this._key = null;
    /**
     * The actual socket that handle the connection
     * @attribute _socket
     * @type Object
     * @required
     * @private
     * @since 0.1.0
     */
    this._socket = null;
    /**
     * The socket version of the socket.io used
     * @attribute _socketVersion
     * @type Integer
     * @private
     * @since 0.1.0
     */
    this._socketVersion = null;
    /**
     * User Information, credential and the local stream(s).
     * @attribute _user
     * @type JSON
     * @param {String} id User Session ID
     * @param {Object} peer PeerConnection object
     * @param {String} sid User Secret Session ID
     * @param {String} apiOwner Owner of the room
     * @param {Array} streams Array of User's MediaStream
     * @param {String} timestamp User's timestamp
     * @param {String} token User access token
     * @param {JSON} info Optional. User information
     * @param {JSON} info.settings Peer stream settings
     * @param {Boolean|JSON} info.settings.audio
     * @param {Boolean} info.settings.audio.stereo
     * @param {Boolean|JSON} info.settings.video
     * @param {Bolean|JSON} info.settings.video.resolution [Rel: Skyway.VIDEO_RESOLUTION]
     * @param {Integer} info.settings.video.resolution.width
     * @param {Integer} info.settings.video.resolution.height
     * @param {Integer} info.settings.video.frameRate
     * @param {JSON} info.mediaStatus Peer stream status.
     * @param {Boolean} info.mediaStatus.audioMuted If Peer's Audio stream is muted.
     * @param {Boolean} info.mediaStatus.videoMuted If Peer's Video stream is muted.
     * @param {String|JSON} info.userData Peer custom data
     * @required
     * @private
     * @since 0.3.0
     */
    this._user = null;
    /**
     * @attribute _room
     * @type JSON
     * @param {JSON} room  Room Information, and credentials.
     * @param {String} room.id
     * @param {String} room.token
     * @param {String} room.tokenTimestamp
     * @param {JSON} room.signalingServer
     * @param {String} room.signalingServer.ip
     * @param {String} room.signalingServer.port
     * @param {JSON} room.pcHelper Holder for all the constraints objects used
     *   in a peerconnection lifetime. Some are initialized by default, some are initialized by
     *   internal methods, all can be overriden through updateUser. Future APIs will help user
     * modifying specific parts (audio only, video only, ...) separately without knowing the
     * intricacies of constraints.
     * @param {JSON} room.pcHelper.pcConstraints
     * @param {JSON} room.pcHelper.pcConfig Will be provided upon connection to a room
     * @param {JSON}  [room.pcHelper.pcConfig.mandatory]
     * @param {Array} [room.pcHelper.pcConfig.optional]
     *   Ex: [{DtlsSrtpKeyAgreement: true}]
     * @param {JSON} room.pcHelper.offerConstraints
     * @param {JSON} [room.pcHelper.offerConstraints.mandatory]
     *   Ex: {MozDontOfferDataChannel:true}
     * @param {Array} [room.pcHelper.offerConstraints.optional]
     * @param {JSON} room.pcHelper.sdpConstraints
     * @param {JSON} [room.pcHelper.sdpConstraints.mandatory]
     *   Ex: { 'OfferToReceiveAudio':true, 'OfferToReceiveVideo':true }
     * @param {Array} [room.pcHelper.sdpConstraints.optional]
     * @required
     * @private
     * @since 0.3.0
     */
    this._room = null;
    /**
     * Internal array of peer connections
     * @attribute _peerConnections
     * @type Object
     * @required
     * @private
     * @since 0.1.0
     */
    this._peerConnections = [];
    /**
     * Internal array of peer informations
     * @attribute _peerInformations
     * @type Object
     * @private
     * @required
     * @since 0.3.0
     */
    this._peerInformations = [];
    /**
     * Internal array of dataChannels
     * @attribute _dataChannels
     * @type Object
     * @private
     * @required
     * @since 0.2.0
     */
    this._dataChannels = [];
    /**
     * Internal array of dataChannel peers
     * @attribute _dataChannelPeers
     * @type Object
     * @private
     * @required
     * @since 0.2.0
     */
    this._dataChannelPeers = [];
    /**
     * The current ReadyState
     * [Rel: Skyway.READY_STATE_CHANGE]
     * @attribute _readyState
     * @type Integer
     * @private
     * @required
     * @since 0.1.0
     */
    this._readyState = 0;
    /**
     * State if Channel is opened or not
     * @attribute _channel_open
     * @type Boolean
     * @private
     * @required
     * @since 0.1.0
     */
    this._channel_open = false;
    /**
     * State if Room is locked or not
     * @attribute _room_lock
     * @type Boolean
     * @private
     * @required
     * @since 0.4.0
     */
    this._room_lock = false;
    /**
     * State if User is in room or not
     * @attribute _in_room
     * @type Boolean
     * @private
     * @required
     * @since 0.1.0
     */
    this._in_room = false;
    /**
     * Stores the upload data chunks
     * @attribute _uploadDataTransfers
     * @type JSON
     * @private
     * @required
     * @since 0.1.0
     */
    this._uploadDataTransfers = {};
    /**
     * Stores the upload data session information
     * @attribute _uploadDataSessions
     * @type JSON
     * @private
     * @required
     * @since 0.1.0
     */
    this._uploadDataSessions = {};
    /**
     * Stores the download data chunks
     * @attribute _downloadDataTransfers
     * @type JSON
     * @private
     * @required
     * @since 0.1.0
     */
    this._downloadDataTransfers = {};
    /**
     * Stores the download data session information
     * @attribute _downloadDataSessions
     * @type JSON
     * @private
     * @required
     * @since 0.1.0
     */
    this._downloadDataSessions = {};
    /**
     * Stores the data transfers timeout
     * @attribute _dataTransfersTimeout
     * @type JSON
     * @private
     * @required
     * @since 0.1.0
     */
    this._dataTransfersTimeout = {};
    /**
     * Standard File Size of each chunk
     * @attribute _chunkFileSize
     * @type Integer
     * @private
     * @final
     * @required
     * @since 0.1.0
     */
    this._chunkFileSize = 49152; // [25KB because Plugin] 60 KB Limit | 4 KB for info
    /**
     * Standard File Size of each chunk for Firefox
     * @attribute _mozChunkFileSize
     * @type Integer
     * @private
     * @final
     * @required
     * @since 0.2.0
     */
    this._mozChunkFileSize = 16384; // Firefox the sender chunks 49152 but receives as 16384
    /**
     * If ICE trickle should be disabled or not
     * @attribute _enableIceTrickle
     * @type Boolean
     * @default true
     * @private
     * @required
     * @since 0.3.0
     */
    this._enableIceTrickle = true;
    /**
     * If DataChannel should be disabled or not
     * @attribute _enableDataChannel
     * @type Boolean
     * @default true
     * @private
     * @required
     * @since 0.3.0
     */
    this._enableDataChannel = true;
    /**
     * User stream settings. By default, all is false.
     * @attribute _streamSettings
     * @type JSON
     * @default {
     *   'audio' : false,
     *   'video' : false
     * }
     * @private
     * @since 0.2.0
     */
    this._streamSettings = {
      audio: false,
      video: false
    };
    /**
     * Get information from server
     * @method _requestServerInfo
     * @param {String} method HTTP Method
     * @param {String} url Path url to make request to
     * @param {Function} callback Callback function after request is laoded
     * @param {JSON} params HTTP Params
     * @private
     * @since 0.2.0
     */
    this._requestServerInfo = function(method, url, callback, params) {
      var xhr = new window.XMLHttpRequest();
      console.info('XHR - Fetching infos from webserver');
      xhr.onreadystatechange = function() {
        if (this.readyState === this.DONE) {
          console.info('XHR - Got infos from webserver.');
          if (this.status !== 200) {
            console.info('XHR - ERROR ' + this.status, false);
          }
          console.info(JSON.parse(this.response) || '{}');
          callback(this.status, JSON.parse(this.response || '{}'));
        }
      };
      xhr.open(method, url, true);
      if (params) {
        console.info(params);
        xhr.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
        xhr.send(JSON.stringify(params));
      } else {
        xhr.send();
      }
    };
    /**
     * Parse information from server
     * @method _parseInfo
     * @param {JSON} info Parsed Information from the server
     * @param {Skyway} self Skyway object
     * @trigger readyStateChange
     * @private
     * @required
     * @since 0.1.0
     */
    this._parseInfo = function(info, self) {
      console.log(info);

      if (!info.pc_constraints && !info.offer_constraints) {
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
          status: 200,
          content: info.info,
          errorCode: info.error
        });
        return;
      }
      console.log(JSON.parse(info.pc_constraints));
      console.log(JSON.parse(info.offer_constraints));

      self._key = info.cid;
      self._user = {
        id: info.username,
        token: info.userCred,
        timeStamp: info.timeStamp,
        apiOwner: info.apiOwner,
        streams: [],
        info: {}
      };
      self._room = {
        id: info.room_key,
        token: info.roomCred,
        start: info.start,
        len: info.len,
        signalingServer: {
          ip: info.ipSigserver,
          port: info.portSigserver,
          protocol: info.protocol
        },
        pcHelper: {
          pcConstraints: JSON.parse(info.pc_constraints),
          pcConfig: null,
          offerConstraints: JSON.parse(info.offer_constraints),
          sdpConstraints: {
            mandatory: {
              OfferToReceiveAudio: true,
              OfferToReceiveVideo: true
            }
          }
        }
      };
      self._readyState = 2;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.COMPLETED);
      console.info('API - Parsed infos from webserver. Ready.');
    };
    /**
     * Load information from server
     * @method _loadInfo
     * @param {Skyway} self Skyway object
     * @trigger readyStateChange
     * @private
     * @required
     * @since 0.1.0
     */
    this._loadInfo = function(self) {
      if (!window.io) {
        console.error('API - Socket.io not loaded.');
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
          status: null,
          content: 'Socket.io not found',
          errorCode: self.READY_STATE_CHANGE_ERROR.NO_SOCKET_IO
        });
        return;
      }
      if (!window.XMLHttpRequest) {
        console.error('XHR - XMLHttpRequest not supported');
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
          status: null,
          content: 'XMLHttpRequest not available',
          errorCode: self.READY_STATE_CHANGE_ERROR.NO_XMLHTTPREQUEST_SUPPORT
        });
        return;
      }
      if (!window.RTCPeerConnection) {
        console.error('RTC - WebRTC not supported.');
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
          status: null,
          content: 'WebRTC not available',
          errorCode: self.READY_STATE_CHANGE_ERROR.NO_WEBRTC_SUPPORT
        });
        return;
      }
      if (!self._path) {
        console.error('API - No connection info. Call init() first.');
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
          console.error(errorMessage);
          return;
        }
        console.info(response);
        self._parseInfo(response, self);
      });
      console.log('API - Waiting for webserver to provide infos.');
    };
  }
  this.Skyway = Skyway;
  /**
   * Let app register a callback function to an event
   * @method on
   * @param {String} eventName
   * @param {Function} callback
   * @example
   *   SkywayDemo.on('peerJoined', function (peerId, peerInfo) {
   *      console.info(peerId + ' has joined the room');
   *      console.log('Peer information are:');
   *      console.info(peerInfo);
   *   });
   * @since 0.1.0
   */
  Skyway.prototype.on = function(eventName, callback) {
    if ('function' === typeof callback) {
      this._events[eventName] = this._events[eventName] || [];
      this._events[eventName].push(callback);
    }
  };

  /**
   * Let app unregister a callback function from an event
   * @method off
   * @param {String} eventName
   * @param {Function} callback
   * @example
   *   SkywayDemo.off('peerJoined', callback);
   * @since 0.1.0
   */
  Skyway.prototype.off = function(eventName, callback) {
    if (callback === undefined) {
      this._events[eventName] = [];
      return;
    }
    var arr = this._events[eventName],
      l = arr.length;
    for (var i = 0; i < l; i++) {
      if (arr[i] === callback) {
        arr.splice(i, 1);
        break;
      }
    }
  };

  /**
   * Trigger all the callbacks associated with an event
   * Note that extra arguments can be passed to the callback
   * which extra argument can be expected by callback is documented by each event
   * @method _trigger
   * @param {String} eventName
   * @for Skyway
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._trigger = function(eventName) {
    var args = Array.prototype.slice.call(arguments),
      arr = this._events[eventName];
    args.shift();
    if (arr) {
      for (var e in arr) {
        if (arr.hasOwnProperty(e)) {
          try {
            if (arr[e].apply(this, args) === false) {
              break;
            }
          } catch(error) {
            console.warn(error);
          }
        }
      }
    }
  };

  /**
   * IMPORTANT: Please call this method to load all server information before joining
   * the room or doing anything else.
   * This is Init function to load Skyway.
   * @method init
   * @param {String|JSON} options Connection options or API Key ID
   * @param {String} options.apiKey API Key ID to identify with the Temasys backend server
   * @param {String} options.defaultRoom Optional. The default room to connect to if there is
   *   no room provided in {{#crossLink "Skyway/joinRoom:method"}}joinRoom(){{/crossLink}}.
   * @param {String} options.roomServer Optional. Path to the Temasys backend server
   *   If there's no room provided, default room would be used.
   * @param {String} options.region Optional. The regional server that user chooses to use.
   *   [Rel: Skyway.REGIONAL_SERVER]
   * @param {String} options.iceTrickle Optional. The option to enable iceTrickle or not.
   *   Default is true.
   * @param {String} options.dataChannel Optional. The option to enable dataChannel or not.
   *   Default is true.
   * @param {String} options.credentials Optional. Credentials options
   * @param {String} options.credentials.startDateTime The Start timing of the
   *   meeting in Date ISO String
   * @param {Integer} options.credentials.duration The duration of the meeting
   * @param {String} options.credentials.credentials The credentials required
   *   to set the timing and duration of a meeting.
   * @example
   *   // Note: Default room is apiKey when no room
   *   // Example 1: To initalize without setting any default room.
   *   SkywayDemo.init('apiKey');
   *
   *   // Example 2: To initialize with apikey, roomServer and defaultRoom
   *   SkywayDemo.init({
   *     'apiKey' : 'apiKey',
   *     'roomServer' : 'http://xxxx.com',
   *     'defaultRoom' : 'mainHangout'
   *   });
   *
   *   // Example 3: To initialize with credentials to set startDateTime and
   *   // duration of the room
   *   // If you would like to set the start time and duration of the room,
   *   // you have to generate the credentials. In this example, we use the
   *   // CryptoJS library
   *   // ------------------------------------------------------------------------
   *   // Step 1: Generate the hash. It is created by using the roomname,
   *   // duration and the timestamp (in ISO String format).
   *   var hash = CryptoJS.HmacSHA1(roomname + '_' + duration + '_' +
   *     (new Date()).toISOString(), token);
   *   // ------------------------------------------------------------------------
   *   // Step 2: Generate the Credentials. It is is generated by converting
   *   // the hash to a Base64 string and then encoding it to a URI string.
   *   var credentials = encodeURIComponent(hash.toString(CryptoJS.enc.Base64));
   *   // ------------------------------------------------------------------------
   *   // Step 3: Initialize Skyway
   *   SkywayDemo.init({
   *     'apiKey' : 'apiKey',
   *     'roomServer' : 'http://xxxx.com',
   *     'defaultRoom' : 'mainHangout'
   *     'credentials' : {
   *        'startDateTime' : (new Date()).toISOString(),
   *        'duration' : 500,
   *        'credentials' : credentials
   *     }
   *   });
   * @trigger readyStateChange
   * @for Skyway
   * @required
   * @since 0.3.0
   */
  Skyway.prototype.init = function(options) {
    if (!options) {
      console.error('API - No apiKey is inputted');
      return;
    }
    var apiKey, room, defaultRoom;
    var startDateTime, duration, credentials;
    var roomserver = this._serverPath;
    var region = 'us1';
    var iceTrickle = true;
    var dataChannel = true;

    if (typeof options === 'string') {
      apiKey = options;
      defaultRoom = apiKey;
      room = apiKey;
    } else {
      apiKey = options.apiKey;
      roomserver = options.roomServer || roomserver;
      roomserver = (roomserver.lastIndexOf('/') ===
        (roomserver.length - 1)) ? roomserver.substring(0,
        roomserver.length - 1) : roomserver;
      region = options.region || region;
      defaultRoom = options.defaultRoom || apiKey;
      room = defaultRoom;
      iceTrickle = (typeof options.iceTrickle === 'boolean') ?
        options.iceTrickle : iceTrickle;
      dataChannel = (typeof options.dataChannel === 'boolean') ?
        options.dataChannel : dataChannel;
      // Custom default meeting timing and duration
      // Fallback to default if no duration or startDateTime provided
      if (options.credentials) {
        startDateTime = options.credentials.startDateTime ||
          (new Date()).toISOString();
        duration = options.credentials.duration || 200;
        credentials = options.credentials.credentials;
      }
    }
    this._readyState = 0;
    this._trigger('readyStateChange', this.READY_STATE_CHANGE.INIT);
    this._apiKey = apiKey;
    this._roomServer = roomserver;
    this._defaultRoom = defaultRoom;
    this._selectedRoom = room;
    this._serverRegion = region;
    this._enableIceTrickle = iceTrickle;
    this._enableDataChannel = dataChannel;
    this._path = roomserver + '/api/' + apiKey + '/' + room;
    if (credentials) {
      this._roomStart = startDateTime;
      this._roomDuration = duration;
      this._roomCredentials = credentials;
      this._path += (credentials) ? ('/' + startDateTime + '/' +
        duration + '?&cred=' + credentials) : '';
    }
    this._path += ((this._path.indexOf('?&') > -1) ?
      '&' : '?&') + 'rg=' + region;
    console.log('API - Path: ' + this._path);
    console.info('API - ICE Trickle: ' + ((typeof options.iceTrickle ===
      'boolean') ? options.iceTrickle : '[Default: true]'));
    this._loadInfo(this);
  };

  /**
   * Reinitialize Skyway signaling credentials
   * @method _reinit
   * @param {JSON} options
   * @param {String} options.roomserver
   * @param {String} options.apiKey
   * @param {String} options.defaultRoom
   * @param {String} options.room
   * @param {String} options.region
   * @param {String} options.iceTrickle
   * @param {String} options.dataChannel
   * @param {String} options.credentials
   * @param {String} options.credentials.startDateTime
   * @param {Integer} options.credentials.duration
   * @param {String} options.credentials.credentials
   * @param {Function} callback Once everything is done
   * @trigger readyStateChange
   * @private
   * @since 0.4.0
   */
  Skyway.prototype._reinit = function(options, callback) {
    var self = this;
    var startDateTime, duration, credentials;
    var apiKey = options.apiKey || self._apiKey;
    var roomserver = options.roomServer || self._roomServer;
    roomserver = (roomserver.lastIndexOf('/') ===
      (roomserver.length - 1)) ? roomserver.substring(0,
      roomserver.length - 1) : roomserver;
    var region = options.region || self._serverRegion;
    var defaultRoom = options.defaultRoom || self._defaultRoom;
    var room = options.room || defaultRoom;
    var iceTrickle = (typeof options.iceTrickle === 'boolean') ?
      options.iceTrickle : self._enableIceTrickle;
    var dataChannel = (typeof options.dataChannel === 'boolean') ?
      options.dataChannel : self._enableDataChannel;
    if (options.credentials) {
      startDateTime = options.credentials.startDateTime ||
        (new Date()).toISOString();
      duration = options.credentials.duration || 500;
      credentials = options.credentials.credentials ||
        self._roomCredentials;
    } else if (self._roomCredentials) {
      startDateTime = self._roomStart;
      duration = self._roomDuration;
      credentials = self._roomCredentials;
    }
    self._apiKey = apiKey;
    self._roomServer = roomserver;
    self._defaultRoom = defaultRoom;
    self._selectedRoom = room;
    self._serverRegion = region;
    self._enableIceTrickle = iceTrickle;
    self._enableDataChannel = dataChannel;
    self._path = roomserver + '/api/' + apiKey + '/' + room;
    if (credentials) {
      self._roomStart = startDateTime;
      self._roomDuration = duration;
      self._roomCredentials = credentials;
      self._path += (credentials) ? ('/' + startDateTime + '/' +
        duration + '?&cred=' + credentials) : '';
    }
    self._path += ((self._path.indexOf('?&') > -1) ?
      '&' : '?&') + 'rg=' + region;
    console.log('API - Path: ' + this._path);
    console.info('API - ICE Trickle: ' + ((typeof options.iceTrickle ===
      'boolean') ? options.iceTrickle : '[Default: true]'));
    self._requestServerInfo('GET', self._path, function(status, response) {
      if (status !== 200) {
        var errorMessage = 'XMLHttpRequest status not OK.\nStatus was: ' + status;
        self._readyState = 0;
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
          status: status,
          content: (response) ? (response.info || errorMessage) : errorMessage,
          errorCode: response.error ||
            self.READY_STATE_CHANGE_ERROR.INVALID_XMLHTTPREQUEST_STATUS
        });
        console.error(errorMessage);
        return;
      }
      console.info(response);
      var info = response;
      try {
        self._key = info.cid;
        self._user = {
          id: info.username,
          token: info.userCred,
          timeStamp: info.timeStamp,
          apiOwner: info.apiOwner,
          streams: []
        };
        self._room = {
          id: info.room_key,
          token: info.roomCred,
          start: info.start,
          len: info.len,
          signalingServer: {
            ip: info.ipSigserver,
            port: info.portSigserver,
            protocol: info.protocol
          },
          pcHelper: {
            pcConstraints: JSON.parse(info.pc_constraints),
            pcConfig: null,
            offerConstraints: JSON.parse(info.offer_constraints),
            sdpConstraints: {
              mandatory: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
              }
            }
          }
        };
        callback();
      } catch (error) {
        self._readyState = 0;
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
          status: null,
          content: error,
          errorCode: self.READY_STATE_CHANGE_ERROR.SCRIPT_ERROR
        });
        console.error('API - Error occurred rejoining room');
        console.error(error);
        return;
      }
    });
  };

  /**
   * Set and Update the User information. Please note that the custom
   * data would be overrided so please call getUser and then modify the
   * information you want individually.
   * @method setUserData
   * @param {JSON} userData User custom data
   * @example
   *   // Example 1: Intial way of setting data before user joins the room
   *   SkywayDemo.setUserData({
   *     displayName: 'Bobby Rays',
   *     fbUserId: 'blah'
   *   });
   *
   *  // Example 2: Way of setting data after user joins the room
   *   var userData = SkywayDemo.getUserData();
   *   userData.userData.displayName = 'New Name';
   *   userData.userData.fbUserId = 'another Id';
   *   SkywayDemo.setUserData(userData);
   * @trigger peerUpdated
   * @since 0.3.0
   */
  Skyway.prototype.setUserData = function(userData) {
    var self = this;
    // NOTE ALEX: be smarter and copy fields and only if different
    var checkInRoom = setInterval(function () {
      if (self._readyState === self.READY_STATE_CHANGE.COMPLETED) {
        self._user.info = self._user.info || {};
        self._user.info.userData = userData ||
          self._user.info.userData || {};
        if (self._in_room) {
          clearInterval(checkInRoom);
          self._sendMessage({
            type: self.SIG_TYPE.UPDATE_USER,
            mid: self._user.sid,
            rid: self._room.id,
            userData: self._user.info.userData
          });
          self._trigger('peerUpdated', self._user.sid, self._user.info, true);
        }
      }
    }, 50);
  };

  /**
   * Get the User Information
   * @method getUserData
   * @return {JSON} User information
   * @example
   *   var userInfo = SkywayDemo.getUserData();
   * @since 0.4.0
   */
  Skyway.prototype.getUserData = function() {
    return (this._user) ?
      ((this._user.info) ? (this._user.info.userData || '')
      : '') : '';
  };

  /**
   * Get the Peer Information.
   * @method getPeerInfo
   * @param {String} peerId
   * @return {JSON} Peer information
   * @example
   *   // Example 1: To get other peer's information
   *   var peerInfo = SkywayDemo.getPeerInfo(peerId);
   *
   *   // Example 2: To get own information
   *   var userInfo = SkywayDemo.getPeerInfo();
   * @since 0.4.0
   */
  Skyway.prototype.getPeerInfo = function(peerId) {
    return (peerId) ? this._peerInformations[peerId] :
      ((this._user) ? this._user.info : null);
  };

  /* Syntactically private variables and utility functions */
  Skyway.prototype._events = {
    /**
     * Event fired when a successfull connection channel has been established
     * with the signaling server
     * @event channelOpen
     * @since 0.1.0
     */
    'channelOpen': [],
    /**
     * Event fired when the channel has been closed.
     * @event channelClose
     * @since 0.1.0
     */
    'channelClose': [],
    /**
     * Event fired when we received a message from the signaling server.
     * @event channelMessage
     * @param {JSON} message
     * @since 0.1.0
     */
    'channelMessage': [],
    /**
     * Event fired when there was an error with the connection channel to the sig server.
     * @event channelError
     * @param {Object|String} error Error message or object thrown.
     * @since 0.1.0
     */
    'channelError': [],
    /**
     * Event fired whether the room is ready for use
     * @event readyStateChange
     * @param {String} readyState [Rel: Skyway.READY_STATE_CHANGE]
     * @param {JSON} error Error object thrown.
     * @param {Integer} error.status HTTP status when retrieving information.
     *   May be empty for other errors.
     * @param {String} error.content A short description of the error
     * @param {Integer} error.errorCode The error code for the type of error
     *   [Rel: Skyway.READY_STATE_CHANGE_ERROR]
     * @since 0.4.0
     */
    'readyStateChange': [],
    /**
     * Event fired when a step of the handshake has happened. Usefull for diagnostic
     * or progress bar.
     * @event handshakeProgress
     * @param {String} step The current handshake progress step.
     *   [Rel: Skyway.HANDSHAKE_PROGRESS]
     * @param {String} peerId PeerId of the peer's handshake progress.
     * @param {JSON|Object|String} error Error message or object thrown.
     * @since 0.3.0
     */
    'handshakeProgress': [],
    /**
     * Event fired during ICE gathering
     * @event candidateGenerationState
     * @param {String} state The current ice candidate generation state.
     *   [Rel: Skyway.CANDIDATE_GENERATION_STATE]
     * @param {String} peerId PeerId of the peer that had an ice candidate
     *    generation state change.
     * @since 0.1.0
     */
    'candidateGenerationState': [],
    /**
     * Event fired during Peer Connection state change
     * @event peerConnectionState
     * @param {String} state The current peer connection state.
     *   [Rel: Skyway.PEER_CONNECTION_STATE]
     * @param {String} peerId PeerId of the peer that had a peer connection state
     *    change.
     * @since 0.1.0
     */
    'peerConnectionState': [],
    /**
     * Event fired during ICE connection
     * @iceConnectionState
     * @param {String} state The current ice connection state.
     *   [Rel: Skyway.ICE_CONNECTION_STATE]
     * @param {String} peerId PeerId of the peer that had an ice connection state change.
     * @since 0.1.0
     */
    'iceConnectionState': [],
    //-- per peer, local media events
    /**
     * Event fired when allowing webcam media stream fails
     * @event mediaAccessError
     * @param {Object|String} error Error message or object thrown.
     * @since 0.1.0
     */
    'mediaAccessError': [],
    /**
     * Event fired when allowing webcam media stream passes
     * @event mediaAccessSuccess
     * @param {Object} stream MediaStream object.
     * @since 0.1.0
     */
    'mediaAccessSuccess': [],
    /**
     * Event fired when a peer joins the room. Inactive audio or video means that the
     * audio is muted or video is muted.
     * @event peerJoined
     * @param {String} peerId PeerId of the peer that joined the room.
     * @param {JSON} peerInfo Peer Information of the peer
     * @param {JSON} peerInfo.settings Peer stream settings
     * @param {Boolean|JSON} peerInfo.settings.audio
     * @param {Boolean} peerInfo.settings.audio.stereo
     * @param {Boolean|JSON} peerInfo.settings.video
     * @param {JSON} peerInfo.settings.video.resolution [Rel: Skyway.VIDEO_RESOLUTION]
     * @param {Integer} peerInfo.settings.video.resolution.width Video width
     * @param {Integer} peerInfo.settings.video.resolution.height Video height
     * @param {Integer} peerInfo.settings.video.frameRate
     * @param {JSON} peerInfo.mediaStatus Peer stream status.
     * @param {Boolean} peerInfo.mediaStatus.audioMuted If Peer's Audio stream is muted.
     * @param {Boolean} peerInfo.mediaStatus.videoMuted If Peer's Video stream is muted.
     * @param {String|JSON} peerInfo.userData Peer custom data
     * @param {Boolean} isSelf Is the Peer self.
     * @since 0.3.0
     */
    'peerJoined': [],
    /**
     * Event fired when a peer information is updated. Inactive audio or video means that the
     * audio is muted or video is muted.
     * @event peerUpdated
     * @param {String} peerId PeerId of the peer that had information updaed.
     * @param {JSON} peerInfo Peer Information of the peer
     * @param {JSON} peerInfo.settings Peer stream settings
     * @param {Boolean|JSON} peerInfo.settings.audio
     * @param {Boolean} peerInfo.settings.audio.stereo
     * @param {Boolean|JSON} peerInfo.settings.video
     * @param {JSON} peerInfo.settings.video.resolution [Rel: Skyway.VIDEO_RESOLUTION]
     * @param {Integer} peerInfo.settings.video.resolution.width
     * @param {Integer} peerInfo.settings.video.resolution.height
     * @param {Integer} peerInfo.settings.video.frameRate
     * @param {JSON} peerInfo.mediaStatus Peer stream status.
     * @param {Boolean} peerInfo.mediaStatus.audioMuted If Peer's Audio stream is muted.
     * @param {Boolean} peerInfo.mediaStatus.videoMuted If Peer's Video stream is muted.
     * @param {String|JSON} peerInfo.userData Peer custom data
     * @param {Boolean} isSelf Is the peer self.
     * @since 0.3.0
     */
    'peerUpdated': [],
    /**
     * Event fired when a peer leaves the room
     * @event peerLeft
     * @param {String} peerId PeerId of the peer that left.
     * @param {JSON} peerInfo Peer Information of the peer
     * @param {JSON} peerInfo.settings Peer stream settings
     * @param {Boolean|JSON} peerInfo.settings.audio
     * @param {Boolean} peerInfo.settings.audio.stereo
     * @param {Boolean|JSON} peerInfo.settings.video
     * @param {JSON} peerInfo.settings.video.resolution [Rel: Skyway.VIDEO_RESOLUTION]
     * @param {Integer} peerInfo.settings.video.resolution.width
     * @param {Integer} peerInfo.settings.video.resolution.height
     * @param {Integer} peerInfo.settings.video.frameRate
     * @param {JSON} peerInfo.mediaStatus Peer stream status.
     * @param {Boolean} peerInfo.mediaStatus.audioMuted If Peer's Audio stream is muted.
     * @param {Boolean} peerInfo.mediaStatus.videoMuted If Peer's Video stream is muted.
     * @param {String|JSON} peerInfo.userData Peer custom data
     * @param {Boolean} isSelf Is the peer self.
     * @since 0.3.0
     */
    'peerLeft': [],
    /**
     * TODO Event fired when a peer joins the room
     * @event presenceChanged
     * @param {JSON} users The list of users
     * @private
     * @deprecated
     * @since 0.1.0
     */
    'presenceChanged': [],
    //-- per peer, peer connection events
    /**
     * Event fired when a remote stream has become available.
     * This occurs after the user joins the room.
     * @event incomingStream
     * @param {Object} stream MediaStream object.
     * @param {String} peerId PeerId of the peer that is sending the stream.
     * @param {Boolean} isSelf Is the peer self.
     * @since 0.4.0
     */
    'incomingStream': [],
    /**
     * Event fired when a message being broadcasted is received.
     * @event incomingMessage
     * @param {JSON} message Message object that is received.
     * @param {JSON|String} message.content Data that is broadcasted.
     * @param {String} message.sendPeerId PeerId of the sender peer.
     * @param {String} message.targetPeerId PeerId that is specifically
     *   targeted to receive the message.
     * @param {Boolean} message.isPrivate Is data received a private message.
     * @param {Boolean} message.isDataChannel Is data received from a data channel.
     * @param {String} peerId PeerId of the sender peer.
     * @param {Boolean} isSelf Check if message is sent to self
     * @since 0.4.0
     */
    'incomingMessage': [],
    /**
     * Event fired when a room lock status has changed.
     * @event roomLock
     * @param {Boolean} isLocked Is the room locked.
     * @param {String} peerId PeerId of the peer that is locking/unlocking the room.
     * @param {JSON} peerInfo Peer Information of the peer
     * @param {JSON} peerInfo.settings Peer stream settings
     * @param {Boolean|JSON} peerInfo.settings.audio
     * @param {Boolean} peerInfo.settings.audio.stereo
     * @param {Boolean|JSON} peerInfo.settings.video
     * @param {JSON} peerInfo.settings.video.resolution [Rel: Skyway.VIDEO_RESOLUTION]
     * @param {Integer} peerInfo.settings.video.resolution.width Video width
     * @param {Integer} peerInfo.settings.video.resolution.height Video height
     * @param {Integer} peerInfo.settings.video.frameRate
     * @param {JSON} peerInfo.mediaStatus Peer stream status.
     * @param {Boolean} peerInfo.mediaStatus.audioMuted If Peer's Audio stream is muted.
     * @param {Boolean} peerInfo.mediaStatus.videoMuted If Peer's Video stream is muted.
     * @param {String|JSON} peerInfo.userData Peer custom data
     * @param {Boolean} isSelf Is the peer self.
     * @since 0.4.0
     */
    'roomLock': [],
    //-- data state events
    /**
     * Event fired when a peer's datachannel state has changed.
     * @event dataChannelState
     * @param {String} state The current datachannel state.
     *   [Rel: Skyway.DATA_CHANNEL_STATE]
     * @param {String} peerId PeerId of peer that has a datachannel state change.
     * @since 0.1.0
     */
    'dataChannelState': [],
    /**
     * Event fired when a data transfer state has changed.
     * @event dataTransferState
     * @param {String} state The current data transfer state.
     *   [Rel: Skyway.DATA_TRANSFER_STATE]
     * @param {String} transferId TransferId of the data
     * @param {String} peerId PeerId of the peer that has a data
     *   transfer state change.
     * @param {JSON} transferInfo Transfer information.
     * @param {JSON} transferInfo.percentage The percetange of data being
     *   uploaded / downloaded
     * @param {JSON} transferInfo.senderPeerId
     * @param {JSON} transferInfo.data Blob data URL
     * @param {JSON} transferInfo.name Blob data name
     * @param {JSON} transferInfo.size Blob data size
     * @param {JSON} transferInfo.message Error object thrown.
     * @param {JSON} transferInfo.type Where the error message occurred.
     *   [Rel: Skyway.DATA_TRANSFER_TYPE]
     * @since 0.1.0
     */
    'dataTransferState': [],
    /**
     * Event fired when the Signalling server responds to user regarding
     * the state of the room
     * @event systemAction
     * @param {String} action The action that is required for the current peer to
     *   follow. [Rel: Skyway.SYSTEM_ACTION]
     * @param {String} message Reason for the action
     * @since 0.1.0
     */
    'systemAction': []
  };

  /**
   * Broadcast a message to all peers.
   * Note: Map arrays data would be lost when stringified in JSON, so refrain
   * from using map arrays.
   * @method sendChatMessage
   * @param {String|Array|JSON} message
   * @param {String} targetPeerId Optional. Provide if you want to send to
   *   only one peer
   * @example
   *   // Example 1: Send to all peers
   *   SkywayDemo.sendMessage('Hi there!');
   *
   *   // Example 2: Send to a targeted peer
   *   SkywayDemo.sendMessage('Hi there peer!', targetPeerId)
   * @trigger incomingMessage
   * @since 0.4.0
   */
  Skyway.prototype.sendMessage = function(message, targetPeerId) {
    var params = {
      cid: this._key,
      data: message,
      mid: this._user.sid,
      rid: this._room.id,
      type: this.SIG_TYPE.PUBLIC_MESSAGE
    };
    if (targetPeerId) {
      params.target = targetPeerId;
      params.type = this.SIG_TYPE.PRIVATE_MESSAGE;
    }
    this._sendMessage(params);
    this._trigger('incomingMessage', {
      content: message,
      isPrivate: (targetPeerId) ? true: false,
      targetPeerId: targetPeerId || null,
      isDataChannel: false,
      senderPeerId: this._user.sid
    }, this._user.sid, true);
  };

  /**
   * Broadcasts to all P2P DataChannel messages and broadcasts to a
   * peer only when targetPeerId is provided.
   * This is ideal for sending strings or json objects lesser than 40KB.
   * For huge data, please check out
   * {{#crossLink "Skyway/sendBlobData:method"}}sendBlobData(){{/crossLink}}.
   * Note: Map arrays data would be lost when stringified in JSON, so refrain
   * from using map arrays.
   * @method sendP2PMessage
   * @param {String|JSON} message
   * @param {String} targetPeerId Optional. Provide if you want to send to
   *   only one peer
   * @example
   *   // Example 1: Send to all peers
   *   SkywayDemo.sendP2PMessage('Hi there! This is from a DataChannel!');
   *
   *   // Example 2: Send to specific peer
   *   SkywayDemo.sendP2PMessage('Hi there peer! This is from a DataChannel!', targetPeerId);
   * @trigger incomingMessage
   * @since 0.4.0
   */
  Skyway.prototype.sendP2PMessage = function(message, targetPeerId) {
    // Handle typeof object sent over
    for (var peerId in this._dataChannels) {
      if (this._dataChannels.hasOwnProperty(peerId)) {
        if ((targetPeerId && targetPeerId === peerId) || !targetPeerId) {
          this._sendDataChannel(peerId, ['CHAT', ((targetPeerId) ?
            'PRIVATE' : 'GROUP'), this._user.sid,
            ((typeof message === 'object') ? JSON.stringify(message) :
            message)]);
        }
      }
    }
    this._trigger('incomingMessage', {
      content: message,
      isPrivate: (targetPeerId) ? true : false,
      targetPeerId: targetPeerId || null, // is not null if there's user
      isDataChannel: true,
      senderPeerId: this._user.sid
    }, this._user.sid, true);
  };

  /**
   * Get the default cam and microphone
   * @method getUserMedia
   * @param {JSON} options Optional. Media constraints.
   * @param {JSON|Boolean} options.audio
   * @param {Boolean} options.audio.stereo Stereo option in audio
   * @param {JSON|Boolean} options.video
   * @param {JSON} options.video.resolution Check out the types of [Rel: Skyway.VIDEO_RESOLUTION]
   * @param {Integer} options.video.resolution.width Video width
   * @param {Integer} options.video.resolution.height Video height
   * @param {Integer} options.video.frameRate Mininum frameRate of Video
   * @example
   *   // Default is to get both audio and video
   *   // Example 1: Get both audio and video by default.
   *   SkywayDemo.getUserMedia();
   *
   *   // Example 2: Get the audio stream only
   *   SkywayDemo.getUserMedia({
   *     'video' : false,
   *     'audio' : true
   *   });
   *
   *   // Example 3: Set the stream settings for the audio and video
   *   SkywayDemo.getUserMedia({
   *     'video' : {
   *        resolution: SkywayDemo.VIDEO_RESOLUTION.HD,
   *        frameRate: 50
   *      },
   *     'audio' : { stereo: true }
   *   });
   * @trigger mediaAccessSuccess, mediaAccessError
   * @since 0.4.0
   */
  Skyway.prototype.getUserMedia = function(options) {
    var self = this;
    var getStream = false;
    options = options || {
      audio: true,
      video: true
    };
    // prevent undefined error
    self._user = self._user || {};
    self._user.info = self._user.info || {};
    self._user.info.settings = self._user.info.settings || {};
    self._user.streams = self._user.streams || [];
    // called during joinRoom
    if (self._user.info.settings) {
      // So it would invoke to getMediaStream defaults
      if (!options.video && !options.audio) {
        console.warn('API - No streams requested. Request an audio/video or both.');
      } else if (self._user.info.settings.audio !== options.audio ||
        self._user.info.settings.video !== options.video) {
        if (Object.keys(self._user.streams).length > 0) {
          // NOTE: User's stream may hang.. so find a better way?
          // NOTE: Also make a use case for multiple streams?
          getStream = self._setStreams(options);
          if (getStream) {
            // NOTE: When multiple streams, streams should not be cleared.
            self._user.streams = [];
          }
        } else {
          getStream = true;
        }
      }
    } else { // called before joinRoom
      getStream = true;
    }
    self._parseStreamSettings(options);
    if (getStream) {
      try {
        window.getUserMedia({
          audio: self._streamSettings.audio,
          video: self._streamSettings.video
        }, function(stream) {
          self._onUserMediaSuccess(stream, self);
        }, function(error) {
          self._onUserMediaError(error, self);
        });
        console.log('API [MediaStream] - Requested ' +
          ((self._streamSettings.audio) ? 'A' : '') +
          ((self._streamSettings.audio &&
            self._streamSettings.video) ? '/' : '') +
          ((self._streamSettings.video) ? 'V' : ''));
      } catch (error) {
        this._onUserMediaError(error, self);
      }
    } else if (Object.keys(self._user.streams).length > 0) {
      console.warn('API - User already has stream. Reactiving stream only.');
    } else {
      console.warn('API - Not retrieving stream.');
    }
  };

  /**
   * Stream is available, let's throw the corresponding event with the stream attached.
   * @method _onUserMediaSuccess
   * @param {MediaStream} stream The acquired stream
   * @param {Skyway} self   A convenience pointer to the Skyway object for callbacks
   * @trigger mediaAccessSuccess
   * @private
   * @since 0.3.0
   */
  Skyway.prototype._onUserMediaSuccess = function(stream, self) {
    console.log('API - User has granted access to local media.');
    self._trigger('mediaAccessSuccess', stream);
    var checkReadyState = setInterval(function () {
      if (self._readyState === self.READY_STATE_CHANGE.COMPLETED) {
        clearInterval(checkReadyState);
        self._user.streams[stream.id] = stream;
        self._user.streams[stream.id].active = true;
        var checkIfUserInRoom = setInterval(function () {
          if (self._in_room) {
            clearInterval(checkIfUserInRoom);
            self._trigger('incomingStream', self._user.sid, stream, true);
          }
        }, 500);
      }
    }, 500);
  };

  /**
   * getUserMedia could not succeed.
   * @method _onUserMediaError
   * @param {Object} e error
   * @param {Skyway} self A convenience pointer to the Skyway object for callbacks
   * @trigger mediaAccessFailure
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._onUserMediaError = function(e, self) {
    console.log('API - getUserMedia failed with exception type: ' + e.name);
    if (e.message) {
      console.log('API - getUserMedia failed with exception: ' + e.message);
    }
    if (e.constraintName) {
      console.log('API - getUserMedia failed because of the following constraint: ' +
        e.constraintName);
    }
    self._trigger('mediaAccessError', (e.name || e));
  };

  /**
   * Handle every incoming message. If it's a bundle, extract single messages
   * Eventually handle the message(s) to
   * {{#crossLink "Skyway/_processSingleMessage:method"}}_processSingleMessage(){{/crossLink}}
   * @method _processSigMessage
   * @param {String} messageString
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._processSigMessage = function(messageString) {
    var message = JSON.parse(messageString);
    if (message.type === this.SIG_TYPE.GROUP) {
      console.log('API - Bundle of ' + message.lists.length + ' messages.');
      for (var i = 0; i < message.lists.length; i++) {
        this._processSingleMessage(message.lists[i]);
      }
    } else {
      this._processSingleMessage(message);
    }
  };

  /**
   * This dispatch all the messages from the infrastructure to their respective handler
   * @method _processingSingleMessage
   * @param {JSON} message
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._processSingleMessage = function(message) {
    this._trigger('channelMessage', message);
    var origin = message.mid;
    if (!origin || origin === this._user.sid) {
      origin = 'Server';
    }
    console.log('API - [' + origin + '] Incoming message: ' + message.type);
    if (message.mid === this._user.sid &&
      message.type !== this.SIG_TYPE.REDIRECT &&
      message.type !== this.SIG_TYPE.IN_ROOM) {
      console.log('API - Ignoring message: ' + message.type + '.');
      return;
    }
    switch (message.type) {
    //--- BASIC API Messages ----
    case this.SIG_TYPE.PUBLIC_MESSAGE:
      this._publicMessageHandler(message);
      break;
    case this.SIG_TYPE.PRIVATE_MESSAGE:
      this._privateMessageHandler(message);
      break;
    case this.SIG_TYPE.IN_ROOM:
      this._inRoomHandler(message);
      break;
    case this.SIG_TYPE.ENTER:
      this._enterHandler(message);
      break;
    case this.SIG_TYPE.WELCOME:
      this._welcomeHandler(message);
      break;
    case this.SIG_TYPE.OFFER:
      this._offerHandler(message);
      break;
    case this.SIG_TYPE.ANSWER:
      this._answerHandler(message);
      break;
    case this.SIG_TYPE.CANDIDATE:
      this._candidateHandler(message);
      break;
    case this.SIG_TYPE.BYE:
      this._byeHandler(message);
      break;
    case this.SIG_TYPE.REDIRECT:
      this._redirectHandler(message);
      break;
    case this.SIG_TYPE.ERROR:
      this._errorHandler(message);
      break;
      //--- ADVANCED API Messages ----
    case this.SIG_TYPE.UPDATE_USER:
      this._updateUserEventHandler(message);
      break;
    case this.SIG_TYPE.MUTE_VIDEO:
      this._muteVideoEventHandler(message);
      break;
    case this.SIG_TYPE.MUTE_AUDIO:
      this._muteAudioEventHandler(message);
      break;
    case this.SIG_TYPE.ROOM_LOCK:
      this._roomLockEventHandler(message);
      break;
    default:
      console.log('API - [' + message.mid + '] Unsupported message type received: ' + message.type);
      break;
    }
  };

  /**
   * Signaling server error message
   * @method _errorHandler
   * @param {JSON} message
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.mid PeerId of the peer that is sending the error message.
   * @param {String} message.kind The error kind.
   * @param {String} message.type The type of message received.
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._errorHandler = function(message) {
    console.log('API - [Server] Error occurred: ' + message.kind);
    // location.href = '/?error=' + message.kind;
  };

  /**
   * Signaling server wants us to move out.
   * @method _redirectHandler
   * @param {JSON} message
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.url Deprecated. Url to redirect to.
   * @param {String} message.info The reason for redirect
   * @param {String} message.action The action of the redirect
   *   [Rel: Skyway.SYSTEM_ACTION]
   * @param {String} message.type The type of message received.
   * @trigger systemAction
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._redirectHandler = function(message) {
    console.log('API - [Server] You are being redirected: ' + message.info);
    this._trigger('systemAction', message.action, message.info);
  };

  /**
   * User Information is updated
   * @method _updateUserEventHandler
   * @param {JSON} message
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.mid PeerId of the peer that is sending the
   *   updated event.
   * @param {String} message.userData The peer's user data.
   * @param {String} message.type The type of message received.
   * @trigger peerUpdated
   * @private
   * @since 0.2.0
   */
  Skyway.prototype._updateUserEventHandler = function(message) {
    var targetMid = message.mid;
    console.log('API - [' + targetMid + '] received \'updateUserEvent\'.');
    if (this._peerInformations[targetMid]) {
      this._peerInformations[targetMid].userData = message.userData || {};
      this._trigger('peerUpdated', targetMid,
        this._peerInformations[targetMid], false);
    }
  };

  /**
   * Room Lock is Fired
   * @method _roomLockEventHandler
   * @param {JSON} message
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.mid PeerId of the peer that is sending the
   *   updated room lock status.
   * @param {String} message.lock If room is locked or not
   * @param {String} message.type The type of message received.
   * @trigger roomLock
   * @private
   * @since 0.2.0
   */
  Skyway.prototype._roomLockEventHandler = function(message) {
    var targetMid = message.mid;
    console.log('API - [' + targetMid + '] received \'roomLockEvent\'.');
    this._trigger('roomLock', message.lock, targetMid,
      this._peerInformations[targetMid], false);
  };

  /**
   * Peer Audio is muted/unmuted
   * @method _muteAudioEventHandler
   * @param {JSON} message The message object received from the signaling server.
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.mid PeerId of the peer that is sending
   *   their own updated audio stream status.
   * @param {String} message.muted If audio stream is muted or not
   * @param {String} message.type The type of message received.
   * @trigger peerUpdated
   * @private
   * @since 0.2.0
   */
  Skyway.prototype._muteAudioEventHandler = function(message) {
    var targetMid = message.mid;
    console.log('API - [' + targetMid + '] received \'muteAudioEvent\'.');
    if (this._peerInformations[targetMid]) {
      this._peerInformations[targetMid].mediaStatus.audioMuted = message.muted;
      this._trigger('peerUpdated', targetMid,
        this._peerInformations[targetMid], false);
    }
  };

  /**
   * Peer Video is muted/unmuted
   * @method _muteVideoEventHandler
   * @param {JSON} message
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.mid PeerId of the peer that is sending
   *   their own updated video streams status.
   * @param {String} message.muted If video stream is muted or not
   * @param {String} message.type The type of message received.
   * @trigger peerUpdated
   * @private
   * @since 0.2.0
   */
  Skyway.prototype._muteVideoEventHandler = function(message) {
    var targetMid = message.mid;
    console.log('API - [' + targetMid + '] received \'muteVideoEvent\'.');
    if (this._peerInformations[targetMid]) {
      this._peerInformations[targetMid].mediaStatus.videoMuted = message.muted;
      this._trigger('peerUpdated', targetMid,
        this._peerInformations[targetMid], false);
    }
  };

  /**
   * A peer left, let's clean the corresponding connection, and trigger an event.
   * @method _byeHandler
   * @param {JSON} message
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.mid PeerId of the peer that has left the room.
   * @param {String} message.type The type of message received.
   * @trigger peerLeft
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._byeHandler = function(message) {
    var targetMid = message.mid;
    console.log('API - [' + targetMid + '] received \'bye\'.');
    this._removePeer(targetMid);
  };

  /**
   * Throw an event with the received private message
   * @method _privateMessageHandler
   * @param {JSON} message
   * @param {JSON|String} message.data The data broadcasted
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.cid CredentialId of the room
   * @param {String} message.mid PeerId of the peer that is sending a private
   *   broadcast message
   * @param {Boolean} message.isDataChannel Is the message sent from datachannel
   * @param {String} message.type The type of message received.
   * @trigger privateMessage
   * @private
   * @since 0.4.0
   */
  Skyway.prototype._privateMessageHandler = function(message) {
    this._trigger('incomingMessage', {
      content: message.data,
      isPrivate: true,
      targetPeerId: message.target, // is not null if there's user
      isDataChannel: (message.isDataChannel) ? true : false,
      senderPeerId: this._user.sid
    }, this._user.sid, false);
  };

  /**
   * Throw an event with the received private message
   * @method _publicMessageHandler
   * @param {JSON} message
   * @param {JSON|String} message.data The data broadcasted
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.cid CredentialId of the room
   * @param {String} message.mid PeerId of the peer that is sending a private
   *   broadcast message
   * @param {Boolean} message.isDataChannel Is the message sent from datachannel
   * @param {String} message.type The type of message received.
   * @trigger publicMessage
   * @private
   * @since 0.4.0
   */
  Skyway.prototype._publicMessageHandler = function(message) {
    this._trigger('incomingMessage', {
      content: message.data,
      isPrivate: false,
      targetPeerId: null, // is not null if there's user
      isDataChannel: (message.isDataChannel) ? true : false,
      senderPeerId: this._user.sid
    }, this._user.sid, false);
  };

  /**
   * Actually clean the peerconnection and trigger an event.
   * Can be called by _byHandler and leaveRoom.
   * @method _removePeer
   * @param {String} peerId PeerId of the peer that has left.
   * @trigger peerLeft
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._removePeer = function(peerId) {
    this._trigger('peerLeft', peerId, this._peerInformations[peerId], false);
    if (this._peerConnections[peerId]) {
      this._peerConnections[peerId].close();
    }
    delete this._peerConnections[peerId];
    delete this._peerInformations[peerId];
  };

  /**
   * We just joined a room! Let's send a nice message to all to let them know I'm in.
   * @method _inRoomHandler
   * @param {JSON} message
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.sid PeerId of self.
   * @param {String} message.mid PeerId of the peer that is
   * @param {JSON} message.pc_config The peerconnection configuration
   *   sending the joinRoom message.
   * @param {String} message.type The type of message received.
   * @trigger peerJoined
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._inRoomHandler = function(message) {
    var self = this;
    console.log('API - We\'re in the room! Chat functionalities are now available.');
    console.log('API - We\'ve been given the following PC Constraint by the sig server: ');
    console.dir(message.pc_config);
    self._room.pcHelper.pcConfig = self._setFirefoxIceServers(message.pc_config);
    self._in_room = true;
    self._user.sid = message.sid;
    self._trigger('peerJoined', self._user.sid, self._user.info, true);

    // NOTE ALEX: should we wait for local streams?
    // or just go with what we have (if no stream, then one way?)
    // do we hardcode the logic here, or give the flexibility?
    // It would be better to separate, do we could choose with whom
    // we want to communicate, instead of connecting automatically to all.
    var params = {
      type: self.SIG_TYPE.ENTER,
      mid: self._user.sid,
      rid: self._room.id,
      agent: window.webrtcDetectedBrowser.browser,
      version: window.webrtcDetectedBrowser.version,
      userInfo: self._user.info
    };
    console.log('API - Sending enter.');
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, self._user.sid);
    self._sendMessage(params);
  };

  /**
   * Someone just entered the room. If we don't have a connection with him/her,
   * send him a welcome. Handshake step 2 and 3.
   * @method _enterHandler
   * @param {JSON} message
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.mid PeerId of the peer that is sending the enter shake.
   * @param {String} message.agent Peer's browser agent.
   * @param {String} message.version Peer's browser version.
   * @param {String} message.userInfo Peer's user information.
   * @param {JSON} message.userInfo.settings Peer's stream settings
   * @param {Boolean|JSON} message.userInfo.settings.audio
   * @param {Boolean} message.userInfo.settings.audio.stereo
   * @param {Boolean|JSON} message.userInfo.settings.video
   * @param {JSON} message.userInfo.settings.video.resolution [Rel: Skyway.VIDEO_RESOLUTION]
   * @param {Integer} message.userInfo.settings.video.resolution.width
   * @param {Integer} message.userInfo.settings.video.resolution.height
   * @param {Integer} message.userInfo.settings.video.frameRate
   * @param {JSON} message.userInfo.mediaStatus Peer stream status.
   * @param {Boolean} message.userInfo.mediaStatus.audioMuted If peer's audio stream is muted.
   * @param {Boolean} message.userInfo.mediaStatus.videoMuted If peer's video stream is muted.
   * @param {String|JSON} message.userInfo.userData Peer custom data
   * @param {String} message.type Message type
   * @trigger handshakeProgress, peerJoined
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._enterHandler = function(message) {
    var self = this;
    var targetMid = message.mid;
    // need to check entered user is new or not.
    if (!self._peerConnections[targetMid] && !self._peerInformations[targetMid] &&
      targetMid !== self._user.sid) {
      message.agent = (!message.agent) ? 'Chrome' : message.agent;
      var browserAgent = message.agent + ((message.version) ? ('|' + message.version) : '');
      // should we resend the enter so we can be the offerer?
      checkMediaDataChannelSettings(false, browserAgent, function(beOfferer) {
        self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, targetMid);
        var params = {
          type: ((beOfferer) ? self.SIG_TYPE.ENTER : self.SIG_TYPE.WELCOME),
          mid: self._user.sid,
          rid: self._room.id,
          agent: window.webrtcDetectedBrowser.browser,
          userInfo: self._user.info
        };
        console.info(JSON.stringify(params));
        if (!beOfferer) {
          console.log('API - [' + targetMid + '] Sending welcome.');
          self._peerInformations[targetMid] = message.userInfo;
          self._trigger('peerJoined', targetMid, message.userInfo, false);
          self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);
          params.target = targetMid;
        }
        self._sendMessage(params);
      });
    } else {
      // NOTE ALEX: and if we already have a connection when the peer enter,
      // what should we do? what are the possible use case?
      console.log('API - Received "enter" when Peer "' + targetMid +
        '" is already added.');
      return;
    }
  };

  /**
   * We have just received a welcome. If there is no existing connection with this peer,
   * create one, then set the remotedescription and answer.
   * @method _welcomeHandler
   * @param {JSON} message
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.mid PeerId of the peer that is sending the welcome shake.
   * @param {String} message.target targetPeerId
   * @param {Boolean} message.receiveOnly Peer to receive only
   * @param {Boolean} message.enableIceTrickle Option to enable Ice trickle or not
   * @param {Boolean} message.enableDataChannel Option to enable DataChannel or not
   * @param {JSON} message.userInfo Peer Skyway._user.info data.
   * @param {JSON} message.userInfo.settings Peer stream settings
   * @param {Boolean|JSON} message.userInfo.settings.audio
   * @param {Boolean} message.userInfo.settings.audio.stereo
   * @param {Boolean|JSON} message.userInfo.settings.video
   * @param {JSON} message.userInfo.settings.video.resolution [Rel: Skyway.VIDEO_RESOLUTION]
   * @param {Integer} message.userInfo.settings.video.resolution.width
   * @param {Integer} message.userInfo.settings.video.resolution.height
   * @param {Integer} message.userInfo.settings.video.frameRate
   * @param {JSON} message.userInfo.mediaStatus Peer stream status.
   * @param {Boolean} message.userInfo.mediaStatus.audioMuted If Peer's Audio stream is muted.
   * @param {Boolean} message.userInfo.mediaStatus.videoMuted If Peer's Video stream is muted.
   * @param {String|JSON} message.userInfo.userData Peer custom data
   * @param {String} message.agent Browser agent
   * @param {String} message.type Message type
   * @trigger handshakeProgress, peerJoined
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._welcomeHandler = function(message) {
    var targetMid = message.mid;
    // Prevent duplicates and receiving own peer
    if (!this._peerInformations[targetMid] && !this._peerInformations[targetMid] &&
      targetMid !== this._user.sid) {
      message.agent = (!message.agent) ? 'Chrome' : message.agent;
      this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.WELCOME, targetMid);
      this._peerInformations[targetMid] = message.userInfo;
      this._trigger('peerJoined', targetMid, message.userInfo, false);
      this._enableIceTrickle = (typeof message.enableIceTrickle === 'boolean') ?
        message.enableIceTrickle : this._enableIceTrickle;
      this._enableDataChannel = (typeof message.enableDataChannel === 'boolean') ?
        message.enableDataChannel : this._enableDataChannel;
      this._openPeer(targetMid, message.agent, true, message.receiveOnly);
    } else {
      console.log('API - Not creating offer because user is' +
        ' connected to peer already.');
      console.error('API [' + targetMid + '] - Peer connectivity issue.' +
        ' Refreshing connection');
      this.leaveRoom();
      // set timeout to 500 ?
      this.joinRoom();
      return;
    }
  };

  /**
   * We have just received an offer. If there is no existing connection with this peer,
   * create one, then set the remotedescription and answer.
   * @method _offerHandler
   * @param {JSON} message
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.mid PeerId of the peer that is sending the offer shake.
   * @param {String} message.sdp Offer sessionDescription
   * @param {String} message.type The type of message received.
   * @trigger handshakeProgress
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._offerHandler = function(message) {
    var self = this;
    var targetMid = message.mid;
    message.agent = (!message.agent) ? 'Chrome' : message.agent;
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.OFFER, targetMid);
    var offer = new window.RTCSessionDescription(message);
    console.log('API - [' + targetMid + '] Received offer:');
    console.dir(offer);
    var pc = self._peerConnections[targetMid];
    if (!pc) {
      self._openPeer(targetMid, message.agent, false);
      pc = self._peerConnections[targetMid];
    }
    pc.setRemoteDescription(new RTCSessionDescription(offer), function() {
      self._doAnswer(targetMid);
    }, function(error) {
      self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
      console.error('API - [' + targetMid + '] Failed setting remote description for offer.');
      console.error(error);
    });
  };

  /**
   * We have succesfully received an offer and set it locally. This function will take care
   * of cerating and sendng the corresponding answer. Handshake step 4.
   * @method _doAnswer
   * @param {String} targetMid PeerId of the peer to send answer to.
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._doAnswer = function(targetMid) {
    var self = this;
    var pc = self._peerConnections[targetMid];
    console.log('API - [' + targetMid + '] Creating answer.');
    if (pc) {
      pc.createAnswer(function(answer) {
        console.log('API - [' + targetMid + '] Created  answer.');
        console.dir(answer);
        self._setLocalAndSendMessage(targetMid, answer);
      }, function(error) {
        self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
        console.error('API - [' + targetMid + '] Failed creating an answer.');
        console.error(error);
      }, self._room.pcHelper.sdpConstraints);
    } else {
      return;
      /* Houston ..*/
    }
  };

  /**
   * We have a peer, this creates a peerconnection object to handle the call.
   * if we are the initiator, we then starts the O/A handshake.
   * @method _openPeer
   * @param {String} targetMid PeerId of the peer we should connect to.
   * @param {String} peerAgentBrowser Peer's browser
   * @param {Boolean} toOffer Wether we should start the O/A or wait.
   * @param {Boolean} receiveOnly Should they only receive?
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._openPeer = function(targetMid, peerAgentBrowser, toOffer, receiveOnly) {
    var self = this;
    console.log('API - [' + targetMid + '] Creating PeerConnection.');
    self._peerConnections[targetMid] = self._createPeerConnection(targetMid);
    if (!receiveOnly) {
      self._addLocalStream(targetMid);
    }
    // I'm the callee I need to make an offer
    if (toOffer) {
      if (self._enableDataChannel) {
        self._createDataChannel(targetMid, function(dc) {
          self._dataChannels[targetMid] = dc;
          self._dataChannelPeers[dc.label] = targetMid;
          self._checkDataChannelStatus(dc);
          self._doCall(targetMid, peerAgentBrowser);
        });
      } else {
        self._doCall(targetMid, peerAgentBrowser);
      }
    }
  };

  /**
   * Sends our Local MediaStream to other Peers.
   * By default, it sends all it's other stream
   * @method _addLocalStream
   * @param {String} peerId PeerId of the peer to send local stream to.
   * @private
   * @since 0.2.0
   */
  Skyway.prototype._addLocalStream = function(peerId) {
    // NOTE ALEX: here we could do something smarter
    // a mediastream is mainly a container, most of the info
    // are attached to the tracks. We should iterates over track and print
    console.log('API - [' + peerId + '] Adding local stream.');

    if (Object.keys(this._user.streams).length > 0) {
      for (var stream in this._user.streams) {
        if (this._user.streams.hasOwnProperty(stream)) {
          if (this._user.streams[stream].active) {
            this._peerConnections[peerId].addStream(this._user.streams[stream]);
          }
        }
      }
    } else {
      console.log('API - WARNING - No stream to send. You will be only receiving.');
    }
  };

  /**
   * The remote peer advertised streams, that we are forwarding to the app. This is part
   * of the peerConnection's addRemoteDescription() API's callback.
   * @method _onRemoteStreamAdded
   * @param {String} targetMid PeerId of the peer that has remote stream to send.
   * @param {Event}  event This is provided directly by the peerconnection API.
   * @trigger incomingStream
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._onRemoteStreamAdded = function(targetMid, event) {
    console.log('API - [' + targetMid + '] Remote Stream added.');
    this._trigger('incomingStream', targetMid, event.stream, false);
  };

  /**
   * It then sends it to the peer. Handshake step 3 (offer) or 4 (answer)
   * @method _doCall
   * @param {String} targetMid PeerId of the peer to send offer to.
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._doCall = function(targetMid, peerAgentBrowser) {
    var self = this;
    var pc = self._peerConnections[targetMid];
    // NOTE ALEX: handle the pc = 0 case, just to be sure
    var constraints = self._room.pcHelper.offerConstraints;
    var sc = self._room.pcHelper.sdpConstraints;
    for (var name in sc.mandatory) {
      if (sc.mandatory.hasOwnProperty(name)) {
        constraints.mandatory[name] = sc.mandatory[name];
      }
    }
    constraints.optional.concat(sc.optional);
    console.log('API - [' + targetMid + '] Creating offer.');
    checkMediaDataChannelSettings(true, peerAgentBrowser, function(offerConstraints) {
      pc.createOffer(function(offer) {
        self._setLocalAndSendMessage(targetMid, offer);
      }, function(error) {
        self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
        console.error('API - [' + targetMid + '] Failed creating an offer.');
        console.error(error);
      }, offerConstraints);
    }, constraints);
  };

  /**
   * Find a line in the SDP and return it
   * @method _findSDPLine
   * @param {Array} sdpLines
   * @param {Array} condition
   * @param {String} value Value to set Sdplines to
   * @return {Array} [index, line] - Returns the sdpLines based on the condition
   * @private
   * @since 0.2.0
   */
  Skyway.prototype._findSDPLine = function(sdpLines, condition, value) {
    for (var index in sdpLines) {
      if (sdpLines.hasOwnProperty(index)) {
        for (var c in condition) {
          if (condition.hasOwnProperty(c)) {
            if (sdpLines[index].indexOf(c) === 0) {
              sdpLines[index] = value;
              return [index, sdpLines[index]];
            }
          }
        }
      }
    }
    return [];
  };

  /**
   * Add Stereo to SDP. Requires OPUS
   * @method _addStereo
   * @param {Array} sdpLines
   * @return {Array} Updated version with Stereo feature
   * @private
   * @since 0.2.0
   */
  Skyway.prototype._addStereo = function(sdpLines) {
    var opusLineFound = false,
      opusPayload = 0;
    // Check if opus exists
    var rtpmapLine = this._findSDPLine(sdpLines, ['a=rtpmap:']);
    if (rtpmapLine.length) {
      if (rtpmapLine[1].split(' ')[1].indexOf('opus/48000/') === 0) {
        opusLineFound = true;
        opusPayload = (rtpmapLine[1].split(' ')[0]).split(':')[1];
      }
    }
    // Find the A=FMTP line with the same payload
    if (opusLineFound) {
      var fmtpLine = this._findSDPLine(sdpLines, ['a=fmtp:' + opusPayload]);
      if (fmtpLine.length) {
        sdpLines[fmtpLine[0]] = fmtpLine[1] + '; stereo=1';
      }
    }
    return sdpLines;
  };

  /**
   * Set Audio, Video and Data Bitrate in SDP
   * @method _setSDPBitrate
   * @param {Array} sdpLines
   * @return {Array} Updated version with custom Bandwidth settings
   * @private
   * @since 0.2.0
   */
  Skyway.prototype._setSDPBitrate = function(sdpLines) {
    // Find if user has audioStream
    var bandwidth = this._streamSettings.bandwidth;
    var maLineFound = this._findSDPLine(sdpLines, ['m=', 'a=']).length;
    var cLineFound = this._findSDPLine(sdpLines, ['c=']).length;
    // Find the RTPMAP with Audio Codec
    if (maLineFound && cLineFound) {
      if (bandwidth.audio) {
        var audioLine = this._findSDPLine(sdpLines, ['a=mid:audio', 'm=mid:audio']);
        sdpLines.splice(audioLine[0], 0, 'b=AS:' + bandwidth.audio);
      }
      if (bandwidth.video) {
        var videoLine = this._findSDPLine(sdpLines, ['a=mid:video', 'm=mid:video']);
        sdpLines.splice(videoLine[0], 0, 'b=AS:' + bandwidth.video);
      }
      if (bandwidth.data) {
        var dataLine = this._findSDPLine(sdpLines, ['a=mid:data', 'm=mid:data']);
        sdpLines.splice(dataLine[0], 0, 'b=AS:' + bandwidth.data);
      }
    }
    return sdpLines;
  };

  /**
   * This takes an offer or an aswer generated locally and set it in the peerconnection
   * it then sends it to the peer. Handshake step 3 (offer) or 4 (answer)
   * @method _setLocalAndSendMessage
   * @param {String} targetMid PeerId of the peer to send offer/answer to.
   * @param {JSON} sessionDescription This should be provided by the peerconnection API.
   *   User might 'tamper' with it, but then , the setLocal may fail.
   * @trigger handshakeProgress
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._setLocalAndSendMessage = function(targetMid, sessionDescription) {
    var self = this;
    var pc = self._peerConnections[targetMid];
    console.log('API - [' + targetMid + '] Created ' +
      sessionDescription.type + '.');
    console.log(sessionDescription);
    // NOTE ALEX: handle the pc = 0 case, just to be sure
    var sdpLines = sessionDescription.sdp.split('\r\n');
    if (self._streamSettings.stereo) {
      self._addStereo(sdpLines);
      console.info('API - User has requested Stereo');
    }
    if (self._streamSettings.bandwidth) {
      sdpLines = self._setSDPBitrate(sdpLines, self._streamSettings.bandwidth);
      console.info('API - Custom Bandwidth settings');
      console.info('API - Video: ' + self._streamSettings.bandwidth.video);
      console.info('API - Audio: ' + self._streamSettings.bandwidth.audio);
      console.info('API - Data: ' + self._streamSettings.bandwidth.data);
    }
    sessionDescription.sdp = sdpLines.join('\r\n');

    // NOTE ALEX: opus should not be used for mobile
    // Set Opus as the preferred codec in SDP if Opus is present.
    //sessionDescription.sdp = preferOpus(sessionDescription.sdp);

    // limit bandwidth
    //sessionDescription.sdp = this._limitBandwidth(sessionDescription.sdp);

    console.log('API - [' + targetMid + '] Setting local Description (' +
      sessionDescription.type + ').');
    pc.setLocalDescription(sessionDescription, function() {
      console.log('API - [' + targetMid + '] Set ' + sessionDescription.type + '.');
      self._trigger('handshakeProgress', sessionDescription.type, targetMid);
      if (self._enableIceTrickle || (!self._enableIceTrickle &&
        sessionDescription.type !== self.HANDSHAKE_PROGRESS.OFFER)) {
        console.log('API - [' + targetMid + '] Sending ' + sessionDescription.type + '.');
        self._sendMessage({
          type: sessionDescription.type,
          sdp: sessionDescription.sdp,
          mid: self._user.sid,
          agent: window.webrtcDetectedBrowser.browser,
          target: targetMid,
          rid: self._room.id
        });
      }
    }, function(error) {
      self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
      console.error('API - [' + targetMid + '] There was a problem setting the Local Description.');
      console.error(error);
    });
  };

  /**
   * This sets the STUN server specially for Firefox for ICE Connection
   * @method _setFirefoxIceServers
   * @param {JSON} config Ice configuration servers url object.
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._setFirefoxIceServers = function(config) {
    if (window.webrtcDetectedBrowser.mozWebRTC) {
      // NOTE ALEX: shoul dbe given by the server
      var newIceServers = [{
        'url': 'stun:stun.services.mozilla.com'
      }];
      for (var i = 0; i < config.iceServers.length; i++) {
        var iceServer = config.iceServers[i];
        var iceServerType = iceServer.url.split(':')[0];
        if (iceServerType === 'stun') {
          if (iceServer.url.indexOf('google')) {
            continue;
          }
          iceServer.url = [iceServer.url];
          newIceServers.push(iceServer);
        } else {
          var newIceServer = {};
          newIceServer.credential = iceServer.credential;
          newIceServer.url = iceServer.url.split(':')[0];
          newIceServer.username = iceServer.url.split(':')[1].split('@')[0];
          newIceServer.url += ':' + iceServer.url.split(':')[1].split('@')[1];
          newIceServers.push(newIceServer);
        }
      }
      config.iceServers = newIceServers;
    }
    return config;
  };

  /**
   * Waits for MediaStream. Once the stream is loaded, callback is called
   * If there's not a need for stream, callback is called
   * @method _waitForMediaStream
   * @param {Function} callback Callback after requested constraints are loaded.
   * @param {JSON} options Optional. Media Constraints.
   * @param {JSON} options.user Optional. User custom data.
   * @param {Boolean|JSON} options.audio This call requires audio
   * @param {Boolean} options.audio.stereo Enabled stereo or not
   * @param {Boolean|JSON} options.video This call requires video
   * @param {JSON} options.video.resolution [Rel: Skyway.VIDEO_RESOLUTION]
   * @param {Integer} options.video.resolution.width Video width
   * @param {Integer} options.video.resolution.height Video height
   * @param {Integer} options.video.frameRate Mininum frameRate of Video
   * @param {String} options.bandwidth Bandwidth settings
   * @param {String} options.bandwidth.audio Audio Bandwidth
   * @param {String} options.bandwidth.video Video Bandwidth
   * @param {String} options.bandwidth.data Data Bandwidth
   * @private
   * @since 0.4.0
   */
  Skyway.prototype._waitForMediaStream = function(callback, options) {
    var self = this;
    options = options || {};
    self.getUserMedia(options);

    console.log('API - requireVideo: ' + options.video);
    console.log('API - requireAudio: ' + options.audio);

    if (options.video || options.audio) {
      var checkForStream = setInterval(function() {
        for (var stream in self._user.streams) {
          if (self._user.streams.hasOwnProperty(stream)) {
            var audioTracks = self._user.streams[stream].getAudioTracks();
            var videoTracks = self._user.streams[stream].getVideoTracks();
            if (((options.video) ? (videoTracks.length > 0) : true) &&
              ((options.audio) ? (audioTracks.length > 0) : true)) {
              clearInterval(checkForStream);
              callback();
              break;
            }
          }
        }
      }, 2000);
    } else {
      callback();
    }
  };

  /**
   * Close/Open existing mediaStreams
   * @method _setStreams
   * @param {JSON} options
   * @param {JSON} options.audio Enable audio or not
   * @param {JSON} options.video Enable video or not
   * @return {Boolean} Whether we should re-fetch mediaStreams or not
   * @private
   * @since 0.3.0
   */
  Skyway.prototype._setStreams = function(options) {
    var hasAudioTracks = false, hasVideoTracks = false;
    if (!this._user) {
      console.error('API - User has no streams to close');
      return;
    }
    for (var stream in this._user.streams) {
      if (this._user.streams.hasOwnProperty(stream)) {
        var audios = this._user.streams[stream].getAudioTracks();
        var videos = this._user.streams[stream].getVideoTracks();
        for (var audio in audios) {
          if (audios.hasOwnProperty(audio)) {
            audios[audio].enabled = options.audio;
            hasAudioTracks = true;
          }
        }
        for (var video in videos) {
          if (videos.hasOwnProperty(video)) {
            videos[video].enabled = options.video;
            hasVideoTracks = true;
          }
        }
        if (!options.video && !options.audio) {
          this._user.streams[stream].active = false;
        } else {
          this._user.streams[stream].active = true;
        }
      }
    }
    return ((!hasAudioTracks && options.audio) ||
      (!hasVideoTracks && options.video));
  };

  /**
   * Create a peerconnection to communicate with the peer whose ID is 'targetMid'.
   * All the peerconnection callbacks are set up here. This is a quite central piece.
   * @method _createPeerConnection
   * @param {String} targetMid
   * @return {Object} The created peer connection object.
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._createPeerConnection = function(targetMid) {
    var pc, self = this;
    try {
      pc = new window.RTCPeerConnection(
        self._room.pcHelper.pcConfig,
        self._room.pcHelper.pcConstraints);
      console.log(
        'API - [' + targetMid + '] Created PeerConnection.');
      console.log(
        'API - [' + targetMid + '] PC config: ');
      console.dir(self._room.pcHelper.pcConfig);
      console.log(
        'API - [' + targetMid + '] PC constraints: ' +
        JSON.stringify(self._room.pcHelper.pcConstraints));
    } catch (error) {
      console.log('API - [' + targetMid + '] Failed to create PeerConnection: ' + error.message);
      return null;
    }
    // callbacks
    // standard not implemented: onnegotiationneeded,
    pc.ondatachannel = function(event) {
      var dc = event.channel || event;
      console.log('API - [' + targetMid + '] Received DataChannel -> ' +
        dc.label);
      if (self._enableDataChannel) {
        self._createDataChannel(targetMid, function(dc) {
          self._dataChannels[targetMid] = dc;
          self._dataChannelPeers[dc.label] = targetMid;
          self._checkDataChannelStatus(dc);
        }, dc);
      } else {
        console.info('API - [' + targetMid + '] Not adding DataChannel');
      }
    };
    pc.onaddstream = function(event) {
      self._onRemoteStreamAdded(targetMid, event);
    };
    pc.onicecandidate = function(event) {
      console.dir(event);
      self._onIceCandidate(targetMid, event);
    };
    pc.oniceconnectionstatechange = function() {
      checkIceConnectionState(targetMid, pc.iceConnectionState, function(iceConnectionState) {
        console.log('API - [' + targetMid + '] ICE connection state changed -> ' +
          iceConnectionState);
        self._trigger('iceConnectionState', iceConnectionState, targetMid);
      });
    };
    // pc.onremovestream = function () {
    //   self._onRemoteStreamRemoved(targetMid);
    // };
    pc.onsignalingstatechange = function() {
      console.log('API - [' + targetMid + '] PC connection state changed -> ' +
        pc.signalingState);
      var signalingState = pc.signalingState;
      if (pc.signalingState !== self.PEER_CONNECTION_STATE.STABLE &&
        pc.signalingState !== self.PEER_CONNECTION_STATE.CLOSED) {
        pc.hasSetOffer = true;
      } else if (pc.signalingState === self.PEER_CONNECTION_STATE.STABLE &&
        pc.hasSetOffer) {
        signalingState = self.PEER_CONNECTION_STATE.ESTABLISHED;
      }
      self._trigger('peerConnectionState', signalingState, targetMid);
    };
    pc.onicegatheringstatechange = function() {
      console.log('API - [' + targetMid + '] ICE gathering state changed -> ' +
        pc.iceGatheringState);
      self._trigger('candidateGenerationState', pc.iceGatheringState, targetMid);
    };
    return pc;
  };

  /**
   * A candidate has just been generated (ICE gathering) and will be sent to the peer.
   * Part of connection establishment.
   * @method _onIceCandidate
   * @param {String} targetMid
   * @param {Event} event This is provided directly by the peerconnection API.
   * @trigger candidateGenerationState
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._onIceCandidate = function(targetMid, event) {
    if (event.candidate) {
      if (this._enableIceTrickle) {
        var messageCan = event.candidate.candidate.split(' ');
        var candidateType = messageCan[7];
        console.log('API - [' + targetMid + '] Created and sending ' +
          candidateType + ' candidate.');
        this._sendMessage({
          type: this.SIG_TYPE.CANDIDATE,
          label: event.candidate.sdpMLineIndex,
          id: event.candidate.sdpMid,
          candidate: event.candidate.candidate,
          mid: this._user.sid,
          target: targetMid,
          rid: this._room.id
        });
      }
    } else {
      console.log('API - [' + targetMid + '] End of gathering.');
      this._trigger('candidateGenerationState', this.CANDIDATE_GENERATION_STATE.DONE, targetMid);
      // Disable Ice trickle option
      if (!this._enableIceTrickle) {
        var sessionDescription = this._peerConnections[targetMid].localDescription;
        console.log('API - [' + targetMid + '] Sending offer.');
        this._sendMessage({
          type: sessionDescription.type,
          sdp: sessionDescription.sdp,
          mid: this._user.sid,
          agent: window.webrtcDetectedBrowser.browser,
          target: targetMid,
          rid: this._room.id
        });
      }
    }
  };

  /**
   * Handling reception of a candidate. handshake done, connection ongoing.
   * @method _candidateHandler
   * @param {JSON} message
   * @param {String} message.rid RoomId
   * @param {String} message.mid TargetMid.
   * @param {String} message.target targetPeerId
   * @param {String} message.id IceCandidate Id
   * @param {String} message.candidate IceCandidate object
   * @param {String} message.label IceCandidate label
   * @param {String} message.type Message type
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._candidateHandler = function(message) {
    var targetMid = message.mid;
    var pc = this._peerConnections[targetMid];
    if (pc) {
      if (pc.iceConnectionState === this.ICE_CONNECTION_STATE.CONNECTED) {
        console.log('API - [' + targetMid + '] Received but not adding Candidate ' +
          'as we are already connected to this peer.');
        return;
      }
      var messageCan = message.candidate.split(' ');
      var canType = messageCan[7];
      console.log('API - [' + targetMid + '] Received ' + canType + ' Candidate.');
      // if (canType !== 'relay' && canType !== 'srflx') {
      // trace('Skipping non relay and non srflx candidates.');
      var index = message.label;
      var candidate = new window.RTCIceCandidate({
        sdpMLineIndex: index,
        candidate: message.candidate
      });
      pc.addIceCandidate(candidate); //,
      // NOTE ALEX: not implemented in chrome yet, need to wait
      // function () { trace('ICE  -  addIceCandidate Succesfull. '); },
      // function (error) { trace('ICE  - AddIceCandidate Failed: ' + error); }
      //);
      console.log('API - [' + targetMid + '] Added Candidate.');
    } else {
      console.log('API - [' + targetMid + '] Received but not adding Candidate ' +
        'as PeerConnection not present.');
      // NOTE ALEX: if the offer was slow, this can happen
      // we might keep a buffer of candidates to replay after receiving an offer.
    }
  };

  /**
   * Handling reception of an answer (to a previous offer). handshake step 4.
   * @method _answerHandler
   * @param {JSON} message
   * @param {String} message.rid RoomId
   * @param {String} message.mid TargetMid.
   * @param {String} message.target targetPeerId
   * @param {String} message.sdp Answer sessionDescription
   * @param {String} message.type Message type
   * @trigger handshakeProgress
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._answerHandler = function(message) {
    var self = this;
    var targetMid = message.mid;
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ANSWER, targetMid);
    var answer = new window.RTCSessionDescription(message);
    console.log('API - [' + targetMid + '] Received answer:');
    console.dir(answer);
    var pc = self._peerConnections[targetMid];
    pc.setRemoteDescription(new RTCSessionDescription(answer), function() {
      pc.remotePeerReady = true;
    }, function(error) {
      self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
      console.error('API - [' + targetMid + '] Failed setting remote description for answer.');
      console.error(error);
    });
  };

  /**
   * Send a message to the signaling server.
   * Not to be confused with method
   * {{#crossLink "Skyway/sendMessage:method"}}sendMessage(){{/crossLink}}
   * that broadcasts messages. This is for sending socket messages.
   * @method _sendMessage
   * @param {JSON} message
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._sendMessage = function(message) {
    if (!this._channel_open) {
      return;
    }
    var messageString = JSON.stringify(message);
    console.log('API - [' + (message.target ? message.target : 'server') +
      '] Outgoing message: ' + message.type);
    this._socket.send(messageString);
  };

  /**
   * Initiate a Socket signaling connection.
   * @method _openChannel
   * @trigger channelMessage, channelOpen, channelError, channelClose
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._openChannel = function() {
    var self = this;
    if (self._channel_open ||
      self._readyState !== self.READY_STATE_CHANGE.COMPLETED) {
      return;
    }
    console.log('API - Opening channel.');
    var ip_signaling = self._room.signalingServer.protocol + '://' +
      self._room.signalingServer.ip + ':' + self._room.signalingServer.port;

    console.log('API - Signaling server URL: ' + ip_signaling);

    if (self._socketVersion >= 1) {
      self._socket = io.connect(ip_signaling, {
        forceNew: true
      });
    } else {
      self._socket = window.io.connect(ip_signaling, {
        'force new connection': true
      });
    }
    self._socket = window.io.connect(ip_signaling, {
      'force new connection': true
    });
    self._socket.on('connect', function() {
      self._channel_open = true;
      self._trigger('channelOpen');
    });
    self._socket.on('error', function(error) {
      self._channel_open = false;
      self._trigger('channelError', error);
      console.error('API - Channel Error occurred.');
      console.error(error);
    });
    self._socket.on('disconnect', function() {
      self._trigger('channelClose');
    });
    self._socket.on('message', function(message) {
      self._processSigMessage(message);
    });
  };

  /**
   * Close the Socket signaling connection.
   * @method _closeChannel
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._closeChannel = function() {
    if (!this._channel_open) {
      return;
    }
    this._socket.disconnect();
    this._socket = null;
    this._channel_open = false;
  };

  /**
   * Create a DataChannel. Only SCTPDataChannel support
   * @method _createDataChannel
   * @param {String} peerId The peerId of which the dataChannel is connected to
   * @param {Function} callback The callback which it returns the DataChannel object to
   * @param {Object} dc The DataChannel object passed inside
   * @trigger dataChannelState
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._createDataChannel = function(peerId, callback, dc) {
    var self = this;
    var pc = self._peerConnections[peerId];
    var channel_name = self._user.sid + '_' + peerId;

    if (!dc) {
      if (!webrtcDetectedBrowser.isSCTPDCSupported && !webrtcDetectedBrowser.isPluginSupported) {
        console.warn('API - DataChannel [' + peerId + ']: Does not support SCTP');
      }
      dc = pc.createDataChannel(channel_name);
    } else {
      channel_name = dc.label;
    }
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.NEW, peerId);
    console.log(
      'API - DataChannel [' + peerId + ']: Binary type support is "' + dc.binaryType + '"');
    dc.onerror = function(error) {
      console.error('API - DataChannel [' + peerId + ']: Failed retrieveing DataChannel.');
      console.exception(error);
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerId, error);
    };
    dc.onclose = function() {
      console.log('API - DataChannel [' + peerId + ']: DataChannel closed.');
      self._closeDataChannel(peerId, self);
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerId);
    };
    dc.onopen = function() {
      dc.push = dc.send;
      dc.send = function(data) {
        console.log('API - DataChannel [' + peerId + ']: DataChannel is opened.');
        console.log('API - DataChannel [' + peerId + ']: Length : ' + data.length);
        dc.push(data);
      };
    };
    dc.onmessage = function(event) {
      console.log('API - DataChannel [' + peerId + ']: DataChannel message received');
      self._dataChannelHandler(event.data, peerId, self);
    };
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.LOADED, peerId);
    callback(dc);
  };

  /**
   * Check DataChannel ReadyState. If ready, it sends a 'CONN'
   * @method _checkDataChannelStatus
   * @param {Object} dc DataChannel object
   * @trigger dataChannelState
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._checkDataChannelStatus = function(dc) {
    var self = this;
    setTimeout(function() {
      console.log('API - DataChannel [' + dc.label +
        ']: Connection Status - ' + dc.readyState);
      var peerId = self._dataChannelPeers[dc.label];
      self._trigger('dataChannelState', dc.readyState, peerId);

      if (dc.readyState === self.DATA_CHANNEL_STATE.OPEN) {
        self._sendDataChannel(peerId, ['CONN', dc.label]);
      }
    }, 500);
  };

  /**
   * Sending of String Data over the DataChannels
   * @method _sendDataChannel
   * @param {String} peerId
   * @param {JSON} data
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._sendDataChannel = function(peerId, data) {
    var dc = this._dataChannels[peerId];
    if (!dc) {
      console.error('API - DataChannel [' + peerId + ']: No available existing DataChannel');
      return;
    } else {
      if (dc.readyState === this.DATA_CHANNEL_STATE.OPEN) {
        console.log('API - DataChannel [' + peerId + ']: Sending Data from DataChannel');
        try {
          var dataString = '';
          for (var i = 0; i < data.length; i++) {
            dataString += data[i];
            dataString += (i !== (data.length - 1)) ? '|' : '';
          }
          dc.send(dataString);
        } catch (error) {
          console.error('API - DataChannel [' + peerId + ']: Failed executing send on DataChannel');
          console.error(error);
          this._trigger('dataChannelState', this.DATA_CHANNEL_STATE.ERROR, peerId, error);
        }
      } else {
        console.error('API - DataChannel [' + peerId +
          ']: DataChannel is not ready.\nState is: "' + dc.readyState + '"');
        this._trigger('dataChannelState', this.DATA_CHANNEL_STATE.ERROR,
          peerId, 'DataChannel is not ready.\nState is: ' + dc.readyState);
      }
    }
  };

  /**
   * To obtain the Peer that it's connected to from the DataChannel
   * @method _dataChannelPeer
   * @param {String} channel
   * @param {Skyway} self
   * @private
   * @deprecated
   * @since 0.1.0
   */
  Skyway.prototype._dataChannelPeer = function(channel, self) {
    return self._dataChannelPeers[channel];
  };

  /**
   * To obtain the Peer that it's connected to from the DataChannel
   * @method _closeDataChannel
   * @param {String} peerId PeerId of the peer's datachannel to close.
   * @param {Skyway} self Skyway object.
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._closeDataChannel = function(peerId, self) {
    var dc = self._dataChannels[peerId];
    if (dc) {
      if (dc.readyState !== self.DATA_CHANNEL_STATE.CLOSED) {
        dc.close();
      }
      delete self._dataChannels[peerId];
      delete self._dataChannelPeers[dc.label];
    }
  };

  /**
   * The handler for all datachannel protocol events
   * @method _dataChannelHandler
   * @param {String|Object} data The data received from datachannel.
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._dataChannelHandler = function(dataString, peerId, self) {
    // PROTOCOL ESTABLISHMENT
    if (typeof dataString === 'string') {
      if (dataString.indexOf('|') > -1 && dataString.indexOf('|') < 6) {
        var data = dataString.split('|');
        var state = data[0];
        console.log('API - DataChannel [' + peerId + ']: Received ' + state);

        switch (state) {
        case 'CONN':
          // CONN - DataChannel Connection has been established
          self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.OPEN, peerId);
          break;
        case 'WRQ':
          // WRQ - Send File Request Received. For receiver to accept or not
          self._dataChannelWRQHandler(peerId, data, self);
          break;
        case 'ACK':
          // ACK - If accepted, send. Else abort
          self._dataChannelACKHandler(peerId, data, self);
          break;
        case 'ERROR':
          // ERROR - Failure in receiving data. Could be timeout
          self._dataChannelERRORHandler(peerId, data, self);
          break;
        case 'CHAT':
          // CHAT - DataChannel Chat
          self._dataChannelCHATHandler(peerId, data, self);
          break;
        default:
          console.error('API - DataChannel [' + peerId + ']: Invalid command');
        }
      } else {
        // DATA - BinaryString base64 received
        console.log('API - DataChannel [' + peerId + ']: Received "DATA"');
        self._dataChannelDATAHandler(peerId, dataString,
          self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING, self);
      }
    }
  };

  /**
   * [Datachannel TFTP protocol stage: WRQ]
   * The sender has sent a request to send file
   * From here, it's up to the user to accept or reject it
   * @method _dataChannelWRQHandler
   * @param {String} peerId PeerId of the peer that is sending the request.
   * @param {Array} data The data object received from datachannel.
   * @param {Skyway} self Skyway object.
   * @trigger dataTransferState
   * @private
   * @since 0.4.0
   */
  Skyway.prototype._dataChannelWRQHandler = function(peerId, data, self) {
    var transferId = this._user.sid + this.DATA_TRANSFER_TYPE.DOWNLOAD +
      (((new Date()).toISOString().replace(/-/g, '').replace(/:/g, ''))).replace('.', '');
    var name = data[2];
    var binarySize = parseInt(data[3], 10);
    var expectedSize = parseInt(data[4], 10);
    var timeout = parseInt(data[5], 10);
    self._downloadDataSessions[peerId] = {
      transferId: transferId,
      name: name,
      size: binarySize,
      ackN: 0,
      receivedSize: 0,
      chunkSize: expectedSize,
      timeout: timeout
    };
    var transferInfo = {
      name: name,
      size: binarySize,
      senderPeerId: peerId
    };
    self._trigger('dataTransferState',
      self.DATA_TRANSFER_STATE.UPLOAD_REQUEST, transferId, peerId, transferInfo);
  };

  /**
   * User's response to accept or reject file.
   * @method respondBlobRequest
   * @param {String} peerId PeerId of the peer that is expected to receive
   *   the request response.
   * @param {Boolean} accept Accept the Blob download request or not.
   * @trigger dataTransferState
   * @since 0.4.0
   */
  Skyway.prototype.respondBlobRequest = function (peerId, accept) {
    if (accept) {
      this._downloadDataTransfers[peerId] = [];
      var data = this._downloadDataSessions[peerId];
      this._sendDataChannel(peerId, ['ACK', 0, window.webrtcDetectedBrowser.browser]);
      var transferInfo = {
        name: data.name,
        size: data.size,
        senderPeerId: peerId
      };
      this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.DOWNLOAD_STARTED,
        data.transferId, peerId, transferInfo);
    } else {
      this._sendDataChannel(peerId, ['ACK', -1]);
      delete this._downloadDataSessions[peerId];
    }
  };

  /**
   * [Datachannel TFTP protocol stage: ACK]
   * The user sends a ACK of the request [accept/reject/nhe current
   * index of chunk to be sent over]
   * @method _dataChannelACKHandler
   * @param {String} peerId PeerId of the peer that is sending the acknowledgement.
   * @param {Array} data The data object received from datachannel.
   * @param {Skyway} self Skyway object.
   * @trigger dataTransferState
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._dataChannelACKHandler = function(peerId, data, self) {
    self._clearDataChannelTimeout(peerId, true, self);

    var ackN = parseInt(data[1], 10);
    var chunksLength = self._uploadDataTransfers[peerId].length;
    var uploadedDetails = self._uploadDataSessions[peerId];
    var transferId = uploadedDetails.transferId;
    var timeout = uploadedDetails.timeout;
    var transferInfo = {};

    console.log('API - DataChannel Received "ACK": ' + ackN + ' / ' + chunksLength);

    if (ackN > -1) {
      // Still uploading
      if (ackN < chunksLength) {
        var fileReader = new FileReader();
        fileReader.onload = function() {
          // Load Blob as dataurl base64 string
          var base64BinaryString = fileReader.result.split(',')[1];
          self._sendDataChannel(peerId, [base64BinaryString]);
          self._setDataChannelTimeout(peerId, timeout, true, self);
          transferInfo = {
            percentage: (((ackN + 1) / chunksLength) * 100).toFixed()
          };
          self._trigger('dataTransferState',
            self.DATA_TRANSFER_STATE.UPLOADING, transferId, peerId, transferInfo);
        };
        fileReader.readAsDataURL(self._uploadDataTransfers[peerId][ackN]);
      } else if (ackN === chunksLength) {
        transferInfo = {
          name: uploadedDetails.name
        };
        self._trigger('dataTransferState',
          self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED, transferId, peerId, transferInfo);
        delete self._uploadDataTransfers[peerId];
        delete self._uploadDataSessions[peerId];
      }
    } else {
      self._trigger('dataTransferState',
        self.DATA_TRANSFER_STATE.REJECTED, transferId, peerId);
      delete self._uploadDataTransfers[peerId];
      delete self._uploadDataSessions[peerId];
    }
  };

  /**
   * [Datachannel TFTP protocol stage: CHAT]
   * The user receives a DataChannel CHAT message.
   * This occurs when user receives a broadcast message.
   * @method _dataChannelCHATHandler
   * @param {String} peerId PeerId of the peer that is sending a broadcast message.
   * @param {Array} data The data object received from datachannel.
   * @param {Skyway} self Skyway object.
   * @trigger incomingMessage
   * @private
   * @since 0.4.0
   */
  Skyway.prototype._dataChannelCHATHandler = function(peerId, data) {
    var isPrivate = (this._stripNonAlphanumeric(data[1]) === 'PRIVATE') ?
      true : false;
    var senderPeerId = this._stripNonAlphanumeric(data[2]);
    var params = {
      cid: this._key,
      mid: senderPeerId,
      rid: this._room.id,
      isDataChannel: true
    };
    // Get remaining parts as the message contents.
    // Get the index of the first char of chat content
    //var start = 3 + data.slice(0, 3).join('').length;
    params.data = '';
    // Add all char from start to the end of dataStr.
    // This method is to allow '|' to appear in the chat message.
    for (var i = 3; i < data.length; i++) {
      params.data += data[i];
    }
    // Handle different type of data
    try {
      var result = JSON.parse(params.data);
      params.data = result;
      console.log('API - Received data is a JSON.');
    } catch (error) {
      console.log('API - Received data is not a JSON.');
    }
    if (isPrivate) {
      params.target = this._user.sid;
      params.type = this.SIG_TYPE.PRIVATE_MESSAGE;
    } else {
      params.target = this._user.sid;
      params.type = this.SIG_TYPE.PUBLIC_MESSAGE;
    }
    // Create a message using event.data, message mid.
    this._processSingleMessage(params);
  };

  /**
   * [Datachannel TFTP protocol stage: ERROR]
   * The user received an error, usually an exceeded timeout.
   * @method _dataChannelERRORHandler
   * @param {String} peerId PeerId of the peer that is sending the error.
   * @param {Array} data The data object received from datachannel.
   * @param {Skyway} self Skyway object.
   * @trigger dataTransferState
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._dataChannelERRORHandler = function(peerId, data, self) {
    var isUploader = data[2];
    var transferId = (isUploader) ? self._uploadDataSessions[peerId].transferId :
      self._downloadDataSessions[peerId].transferId;
    var transferInfo = {
      message: data[1],
      type: ((isUploader) ? self.DATA_TRANSFER_TYPE.UPLOAD :
        self.DATA_TRANSFER_TYPE.DOWNLOAD)
    };
    self._clearDataChannelTimeout(peerId, isUploader, self);
    self._trigger('dataTransferState',
      self.DATA_TRANSFER_STATE.ERROR, transferId, peerId, transferInfo);
  };

  /**
   * [Datachannel TFTP protocol stage: DATA]
   * This is when the data is sent from the sender to the receiving user
   * @method _dataChannelDATAHandler
   * @param {String} peerId PeerId of the peer that is sending the data.
   * @param {ArrayBuffer|Blob|String} dataString The data received.
   * @param {String} dataType The data type received from datachannel.
   *   [Rel: Skyway.DATA_TRANSFER_DATA_TYPE]
   * @param {Skyway} self Skyway object.
   * @trigger dataTransferState
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._dataChannelDATAHandler = function(peerId, dataString, dataType, self) {
    var chunk, transferInfo = {};
    self._clearDataChannelTimeout(peerId, false, self);
    var transferStatus = self._downloadDataSessions[peerId];
    var transferId = transferStatus.transferId;

    if (dataType === self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
      chunk = self._base64ToBlob(dataString);
    } else if (dataType === self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER) {
      chunk = new Blob(dataString);
    } else if (dataType === self.DATA_TRANSFER_DATA_TYPE.BLOB) {
      chunk = dataString;
    } else {
      transferInfo = {
        message: 'Unhandled data exception: ' + dataType,
        type: self.DATA_TRANSFER_TYPE.DOWNLOAD
      };
      console.error('API - ' + transferInfo.message);
      self._trigger('dataTransferState',
        self.DATA_TRANSFER_STATE.ERROR, transferId, peerId, transferInfo);
      return;
    }
    var receivedSize = (chunk.size * (4 / 3));
    console.log('API - DataChannel [' + peerId + ']: Chunk size: ' + chunk.size);

    if (transferStatus.chunkSize >= receivedSize) {
      self._downloadDataTransfers[peerId].push(chunk);
      transferStatus.ackN += 1;
      transferStatus.receivedSize += receivedSize;
      var totalReceivedSize = transferStatus.receivedSize;
      var percentage = ((totalReceivedSize / transferStatus.size) * 100).toFixed();

      self._sendDataChannel(peerId, ['ACK',
        transferStatus.ackN, self._user.sid
      ]);

      if (transferStatus.chunkSize === receivedSize) {
        transferInfo = {
          percentage: percentage
        };
        self._trigger('dataTransferState',
          self.DATA_TRANSFER_STATE.DOWNLOADING, transferId, peerId, transferInfo);
        self._setDataChannelTimeout(peerId, transferStatus.timeout, false, self);
        self._downloadDataTransfers[peerId].info = transferStatus;
      } else {
        var blob = new Blob(self._downloadDataTransfers[peerId]);
        transferInfo = {
          data: URL.createObjectURL(blob)
        };
        self._trigger('dataTransferState',
          self.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED, transferId, peerId, transferInfo);
        delete self._downloadDataTransfers[peerId];
        delete self._downloadDataSessions[peerId];
      }
    } else {
      transferInfo = {
        message: 'Packet not match - [Received]' +
          receivedSize + ' / [Expected]' + transferStatus.chunkSize,
        type: self.DATA_TRANSFER_TYPE.DOWNLOAD
      };
      self._trigger('dataTransferState',
        self.DATA_TRANSFER_STATE.ERROR, transferId, peerId, transferInfo);
      console.error('API - DataChannel [' + peerId + ']: ' + transferInfo.message);
    }
  };

  /**
   * Set the datachannel timeout. If exceeded, send the 'ERROR' message
   * @method _setDataChannelTimeout
   * @param {String} peerId PeerId of the datachannel to set timeout.
   * @param {Integer} timeout The timeout to set in seconds.
   * @param {Boolean} isSender Is peer the sender or the receiver?
   * @param {Skyway} self Skyway object.
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._setDataChannelTimeout = function(peerId, timeout, isSender, self) {
    if (!self._dataTransfersTimeout[peerId]) {
      self._dataTransfersTimeout[peerId] = {};
    }
    var type = (isSender) ? self.DATA_TRANSFER_TYPE.UPLOAD :
      self.DATA_TRANSFER_TYPE.DOWNLOAD;
    self._dataTransfersTimeout[peerId][type] = setTimeout(function() {
      if (self._dataTransfersTimeout[peerId][type]) {
        if (isSender) {
          delete self._uploadDataTransfers[peerId];
          delete self._uploadDataSessions[peerId];
        } else {
          delete self._downloadDataTransfers[peerId];
          delete self._downloadDataSessions[peerId];
        }
        self._sendDataChannel(peerId, ['ERROR',
          'Connection Timeout. Longer than ' + timeout + ' seconds. Connection is abolished.',
          isSender
        ]);
        console.error('API - Data Transfer ' + ((isSender) ? 'for': 'from') + ' ' +
          peerId + ' failed. Connection timeout');
        self._clearDataChannelTimeout(peerId, isSender, self);
      }
    }, 1000 * timeout);
  };

  /**
   * Clear the datachannel timeout as a response is received
   * @method _clearDataChannelTimeout
   * @param {String} peerId PeerId of the datachannel to clear timeout.
   * @param {Boolean} isSender Is peer the sender or the receiver?
   * @param {Skyway} self Skyway object.
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._clearDataChannelTimeout = function(peerId, isSender, self) {
    if (self._dataTransfersTimeout[peerId]) {
      var type = (isSender) ? self.DATA_TRANSFER_TYPE.UPLOAD :
        self.DATA_TRANSFER_TYPE.DOWNLOAD;
      clearTimeout(self._dataTransfersTimeout[peerId][type]);
      delete self._dataTransfersTimeout[peerId][type];
    }
  };

  /**
   * Convert base64 to raw binary data held in a string.
   * Doesn't handle URLEncoded DataURIs
   * - see StackOverflow answer #6850276 for code that does this
   * This is to convert the base64 binary string to a blob
   * @author Code from devnull69 @ stackoverflow.com
   * @method _base64ToBlob
   * @param {String} dataURL Blob base64 dataurl.
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._base64ToBlob = function(dataURL) {
    var byteString = atob(dataURL.replace(/\s\r\n/g, ''));
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
   * To chunk the blob into chunks.
   * @method _chunkFile
   * @param {Blob} blob The blob data to chunk.
   * @param {Integer} blobByteSize The blob data size.
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._chunkFile = function(blob, blobByteSize) {
    var chunksArray = [],
      startCount = 0,
      endCount = 0;
    if (blobByteSize > this._chunkFileSize) {
      // File Size greater than Chunk size
      while ((blobByteSize - 1) > endCount) {
        endCount = startCount + this._chunkFileSize;
        chunksArray.push(blob.slice(startCount, endCount));
        startCount += this._chunkFileSize;
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
   * Removes non-alphanumeric characters from a string and return it.
   * @method _stripNonAlphanumeric
   * @param {String} input String to check.
   * @return {String} Updated string from non-alphanumeric characters
   * @private
   * @since 0.2.0
   */
  Skyway.prototype._stripNonAlphanumeric = function(str) {
    var strOut = '';
    for (var i = 0; i < str.length; i++) {
      var curChar = str[i];
      console.log(i + ':' + curChar + '.');
      if (!this._alphanumeric(curChar)) {
        // If not alphanumeric, do not add to final string.
        console.log('API - Not alphanumeric, not adding.');
      } else {
        // If alphanumeric, add it to final string.
        console.log('API - Alphanumeric, so adding.');
        strOut += curChar;
      }
      console.log('API - strOut: ' + strOut + '.');
    }
    return strOut;
  };

  /**
   * Check if a text string consist of only alphanumeric characters.
   * If so, return true.
   * If not, return false.
   * @method _alphanumeric
   * @param {String} input String to check.
   * @return {Boolean} If string contains only alphanumeric characters.
   * @private
   * @since 0.2.0
   */
  Skyway.prototype._alphanumeric = function(str) {
    var letterNumber = /^[0-9a-zA-Z]+$/;
    if (str.match(letterNumber)) {
      return true;
    }
    return false;
  };

  /**
   * Method to send blob data to peers.
   * Peers have the option to download or reject the file.
   * @method sendBlobData
   * @param {Blob} data The blob data to be sent over.
   * @param {JSON} dataInfo The data information.
   * @param {String} dataInfo.transferId TransferId of the data.
   * @param {String} dataInfo.name Data name.
   * @param {Integer} dataInfo.timeout Data timeout to wait for packets.
   *   [Default is 60].
   * @param {Integer} dataInfo.size Data size
   * @param {String} targetPeerId PeerId targeted to receive data.
   *   Leave blank to send to all peers.
   * @example
   *   // Send file to all peers connected
   *   SkywayDemo.sendBlobData(file, {
   *     'name' : file.name,
   *     'size' : file.size,
   *     'timeout' : 67
   *   });
   *
   *   // Send file to individual peer
   *   SkywayDemo.sendBlobData(blob, {
   *     'name' : 'My Html',
   *     'size' : blob.size,
   *     'timeout' : 87
   *   }, targetPeerId);
   * @trigger dataTransferState
   * @since 0.1.0
   */
  Skyway.prototype.sendBlobData = function(data, dataInfo, targetPeerId) {
    if (!data && !dataInfo) {
      return false;
    }
    var noOfPeersSent = 0;
    dataInfo.timeout = dataInfo.timeout || 60;
    dataInfo.transferId = this._user.sid + this.DATA_TRANSFER_TYPE.UPLOAD +
      (((new Date()).toISOString().replace(/-/g, '').replace(/:/g, ''))).replace('.', '');
    var transferInfo = {};

    if (targetPeerId) {
      if (this._dataChannels.hasOwnProperty(targetPeerId)) {
        this._sendBlobDataToPeer(data, dataInfo, targetPeerId);
        noOfPeersSent = 1;
      } else {
        console.log('API - DataChannel [' + targetPeerId + '] does not exists');
      }
    } else {
      targetpeerId = this._user.sid;
      for (var peerId in this._dataChannels) {
        if (this._dataChannels.hasOwnProperty(peerId)) {
          // Binary String filesize [Formula n = 4/3]
          this._sendBlobDataToPeer(data, dataInfo, peerId);
          noOfPeersSent++;
        } else {
          console.log('API - DataChannel [' + peerId + '] does not exists');
        }
      }
    }
    if (noOfPeersSent > 0) {
      transferInfo = {
        transferId: dataInfo.transferId,
        senderPeerId: this._user.sid,
        name: dataInfo.name,
        size: dataInfo.size,
        timeout: dataInfo.timeout || 60,
        data: URL.createObjectURL(data)
      };
      this._trigger('dataTransferState',
        this.DATA_TRANSFER_STATE.UPLOAD_STARTED, dataInfo.transferId, targetPeerId, transferInfo);
    } else {
      transferInfo = {
        message: 'No available DataChannels to send Blob data',
        type: this.DATA_TRANSFER_TYPE.UPLOAD
      };
      this._trigger('dataTransferState',
        this.DATA_TRANSFER_STATE.ERROR, transferId, targetPeerId, transferInfo);
      console.log('API - ' + transferInfo.message);
      this._uploadDataTransfers = {};
      this._uploadDataSessions = {};
    }
  };

  /**
   * Method to send blob data to individual peer.
   * This sends the 'WRQ' and initiate the TFTP protocol.
   * @method _sendBlobDataToPeer
   * @param {Blob} data The blob data to be sent over.
   * @param {JSON} dataInfo The data information.
   * @param {String} dataInfo.transferId TransferId of the data.
   * @param {String} dataInfo.name Data name.
   * @param {Integer} dataInfo.timeout Data timeout to wait for packets.
   *   [Default is 60].
   * @param {Integer} dataInfo.size Data size
   * @param {String} targetPeerId PeerId targeted to receive data.
   *   Leave blank to send to all peers.
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._sendBlobDataToPeer = function(data, dataInfo, targetPeerId) {
    var binarySize = (dataInfo.size * (4 / 3)).toFixed();
    var chunkSize = (this._chunkFileSize * (4 / 3)).toFixed();
    if (window.webrtcDetectedBrowser.browser === 'Firefox' &&
      window.webrtcDetectedBrowser.version < 30) {
      chunkSize = this._mozChunkFileSize;
    }
    this._uploadDataTransfers[targetPeerId] = this._chunkFile(data, dataInfo.size);
    this._uploadDataSessions[targetPeerId] = {
      name: dataInfo.name,
      size: binarySize,
      transferId: dataInfo.transferId,
      timeout: dataInfo.timeout
    };
    this._sendDataChannel(targetPeerId, ['WRQ',
      window.webrtcDetectedBrowser.browser,
      dataInfo.name, binarySize, chunkSize, dataInfo.timeout
    ]);
    this._setDataChannelTimeout(targetPeerId, dataInfo.timeout, true, this);
  };

  /**
   * Handle the lock actions
   * @method _handleLock
   * @param {String} lockAction Lock action to send to server for response.
   *   [Rel: SkywayDemo.LOCK_ACTION]
   * @param {Function} callback The callback to return the response after
   *   everything's loaded.
   * @trigger roomLock
   * @private
   * @since 0.4.0
   */
  Skyway.prototype._handleLock = function(lockAction, callback) {
    var self = this;
    var url = self._serverPath + '/rest/room/lock';
    var params = {
      api: self._apiKey,
      rid: self._selectedRoom || self._defaultRoom,
      start: self._room.start,
      len: self._room.len,
      cred: self._room.token,
      action: lockAction,
      end: (new Date((new Date(self._room.start))
        .getTime() + (self._room.len * 60 * 60 * 1000))).toISOString()
    };
    self._requestServerInfo('POST', url, function(status, response) {
      if (status !== 200) {
        console.error('API - Failed ' + lockAction + 'ing room.\nReason was:');
        console.error('XMLHttpRequest status not OK.\nStatus was: ' + status);
        return;
      }
      console.info(response);
      if (response.status) {
        self._room_lock = response.content.lock;
        self._trigger('roomLock', response.content.lock, self._user.sid,
          self._user.info, true);
        if (lockAction !== self.LOCK_ACTION.STATUS) {
          self._sendMessage({
            type: self.SIG_TYPE.ROOM_LOCK,
            mid: self._user.sid,
            rid: self._room.id,
            lock: response.content.lock
          });
        }
      } else {
        console.error('API - Failed ' + lockAction + 'ing room.\nReason was:');
        console.error(response.message);
      }
    }, params);
  };

  /**
   * Restart the {{#crossLink "Skyway/joinRoom:method"}}joinRoom(){{/crossLink}}
   * process to initiate audio and video
   * @method _handleAV
   * @param {String} mediaType Media types expected to receive.
   *   [Rel: 'audio' or 'video']
   * @param {Boolean} enableMedia Enable it or disable it
   * @trigger peerUpdated
   * @private
   * @since 0.4.0
   */
  Skyway.prototype._handleAV = function(mediaType, enableMedia) {
    if (mediaType !== 'audio' && mediaType !== 'video') {
      return;
    } else if (!this._in_room) {
      console.error('API - User is not in the room. Cannot ' +
        ((enableMedia) ? 'enable' : 'disable') + ' ' + mediaType);
      return;
    }
    // Loop and enable tracks accordingly
    var hasTracks = false, isTracksActive = false;
    for (var stream in this._user.streams) {
      if (this._user.streams.hasOwnProperty(stream)) {
        var tracks = (mediaType === 'audio') ?
          this._user.streams[stream].getAudioTracks() :
          this._user.streams[stream].getVideoTracks();
        for (var track in tracks) {
          if (tracks.hasOwnProperty(track)) {
            tracks[track].enabled = enableMedia;
            hasTracks = true;
          }
        }
        isTracksActive = this._user.streams[stream].active;
      }
    }
    // Broadcast to other peers
    if (!(hasTracks && isTracksActive) && enableMedia) {
      this.leaveRoom();
      var hasProperty = (this._user) ? ((this._user.info) ? (
        (this._user.info.settings) ? true : false) : false) : false;
      // set timeout? to 500?
      this.joinRoom({
        audio: (mediaType === 'audio') ? true : ((hasProperty) ?
          this._user.info.settings.audio : false),
        video: (mediaType === 'video') ? true : ((hasProperty) ?
          this._user.info.settings.video : false)
      });
    } else {
      this._sendMessage({
        type: ((mediaType === 'audio') ? this.SIG_TYPE.MUTE_AUDIO :
          this.SIG_TYPE.MUTE_VIDEO),
        mid: this._user.sid,
        rid: this._room.id,
        muted: !enableMedia
      });
    }
    this._user.info.mediaStatus[mediaType + 'Muted'] = !enableMedia;
    this._trigger('peerUpdated', this._user.sid, this._user.info, true);
  };

  /**
   * Lock the room to prevent peers from coming in
   * @method lockRoom
   * @example
   *   SkywayDemo.lockRoom();
   * @trigger lockRoom
   * @since 0.2.0
   */
  Skyway.prototype.lockRoom = function() {
    this._handleLock(this.LOCK_ACTION.LOCK);
  };

  /**
   * Unlock the room to allow peers to come in
   * @method unlockRoom
   * @example
   *   SkywayDemo.unlockRoom();
   * @trigger lockRoom
   * @since 0.2.0
   */
  Skyway.prototype.unlockRoom = function() {
    this._handleLock(this.LOCK_ACTION.UNLOCK);
  };

  /**
   * Get the lock status of the room.
   * @method isRoomLocked
   * @example
   *   // Warning: If there's too many peers toggling the
   *   // Room lock feature at the same time, the returned
   *   // Results may not be completely correct since
   *   // while retrieving the room lock status, another peer
   *   // may be toggling it.
   *   if(SkywayDemo.isRoomLocked()) {
   *     SkywayDemo.unlockRoom();
   *   } else {
   *     SkywayDemo.lockRoom();
   *   }
   * @beta
   * @since 0.4.0
   */
  Skyway.prototype.isRoomLocked = function() {
    this._handleLock(this.LOCK_ACTION.STATUS, function (lockAction) {
      return lockAction;
    });
  };

  /**
   * Enable microphone. If microphone is not enabled from the
   * beginning, user would have to reinitate the
   * {{#crossLink "Skyway/joinRoom:method"}}joinRoom(){{/crossLink}}
   * process and ask for microphone again.
   * @method enableAudio
   * @trigger peerUpdated
   * @example
   *   SkywayDemo.enableAudio();
   * @since 0.4.0
   */
  Skyway.prototype.enableAudio = function() {
    this._handleAV('audio', true);
  };

  /**
   * Disable microphone. If microphone is not enabled from the
   * beginning, there is no effect.
   * @method disableAudio
   * @example
   *   SkywayDemo.disableAudio();
   * @trigger peerUpdated
   * @since 0.4.0
   */
  Skyway.prototype.disableAudio = function() {
    this._handleAV('audio', false);
  };

  /**
   * Enable webcam video. If webcam is not enabled from the
   * beginning, user would have to reinitate the
   * {{#crossLink "Skyway/joinRoom:method"}}joinRoom(){{/crossLink}}
   * process and ask for webcam again.
   * @method enableVideo
   * @example
   *   SkywayDemo.enableVideo();
   * @trigger peerUpdated
   * @since 0.4.0
   */
  Skyway.prototype.enableVideo = function() {
    this._handleAV('video', true);
  };

  /**
   * Disable webcam video. If webcam is not enabled from the
   * beginning, there is no effect.
   * @method disableVideo
   * @example
   *   SkywayDemo.disableVideo();
   * @trigger peerUpdated
   * @since 0.4.0
   */
  Skyway.prototype.disableVideo = function() {
    this._handleAV('video', false);
  };

  /**
   * Parse stream settings
   * @method _parseStreamSettings
   * @param {JSON} options Optional. Media Constraints.
   * @param {JSON} options.user Optional. User custom data.
   * @param {Boolean|JSON} options.audio This call requires audio
   * @param {Boolean} options.audio.stereo Enabled stereo or not
   * @param {Boolean|JSON} options.video This call requires video
   * @param {JSON} options.video.resolution [Rel: Skyway.VIDEO_RESOLUTION]
   * @param {Integer} options.video.resolution.width Video width
   * @param {Integer} options.video.resolution.height Video height
   * @param {Integer} options.video.frameRate Mininum frameRate of Video
   * @param {String} options.bandwidth Bandwidth settings
   * @param {String} options.bandwidth.audio Audio Bandwidth
   * @param {String} options.bandwidth.video Video Bandwidth
   * @param {String} options.bandwidth.data Data Bandwidth
   * @private
   * @since 0.4.0
   */
  Skyway.prototype._parseStreamSettings = function(options) {
    options = options || {};
    this._user.info = this._user.info || {};
    this._user.info.settings = this._user.info.settings || {};
    this._user.info.mediaStatus = this._user.info.mediaStatus || {};
    // Set User
    this._user.info.userData = options.user || this._user.info.userData;
    // Set Bandwidth
    this._streamSettings.bandwidth = options.bandwidth ||
      this._streamSettings.bandwidth || {};
    this._user.info.settings.bandwidth = options.bandwidth ||
      this._user.info.settings.bandwidth || {};
    // Set audio settings
    this._user.info.settings.audio = (typeof options.audio === 'boolean' ||
      typeof options.audio === 'object') ? options.audio :
      (this._streamSettings.audio || false);
    this._user.info.mediaStatus.audioMuted = (options.audio) ?
      ((typeof this._user.info.mediaStatus.audioMuted === 'boolean') ?
      this._user.info.mediaStatus.audioMuted : (options.audio || true)) : true;
    // Set video settings
    this._user.info.settings.video = (typeof options.video === 'boolean' ||
      typeof options.video === 'object') ? options.video :
      (this._streamSettings.video || false);
    // Set user media status options
    this._user.info.mediaStatus.videoMuted = (options.video) ?
      ((typeof this._user.info.mediaStatus.videoMuted === 'boolean') ?
      this._user.info.mediaStatus.videoMuted : (options.video || true)) : true;

    console.dir(this._user.info);

    if (!options.video && !options.audio) {
      return;
    }
    // If undefined, at least set to boolean
    options.video = options.video || false;
    options.audio = options.audio || false;

    // Set Video
    if (typeof options.video === 'object') {
      if (typeof options.video.resolution === 'object') {
        var width = options.video.resolution.width;
        var height = options.video.resolution.height;
        var frameRate = (typeof options.video.frameRate === 'number') ?
          options.video.frameRate : 50;
        if (!width || !height) {
          options.video = true;
        } else {
          options.video = {
            mandatory: {
              minWidth: width,
              minHeight: height
            },
            optional: [{ minFrameRate: frameRate }]
          };
        }
      }
    }
    // Set Audio
    if (typeof options.audio === 'object') {
      options.stereo = (typeof options.audio.stereo === 'boolean') ?
        options.audio.stereo : false;
      options.audio = true;
    }
    // Set stream settings
    this._streamSettings.video = options.video;
    this._streamSettings.audio = options.audio;
    this._streamSettings.stereo = options.stereo;
  };

  /**
   * User to join the room.
   * You may call {{#crossLink "Skyway/getUserMedia:method"}}getUserMedia(){{/crossLink}}
   * first if you want to get MediaStream and joining Room seperately.
   * @method joinRoom
   * @param {String} room Room to join
   * @param {JSON} options Optional. Media Constraints.
   * @param {JSON} options.user Optional. User custom data.
   * @param {Boolean|JSON} options.audio This call requires audio
   * @param {Boolean} options.audio.stereo Enabled stereo or not
   * @param {Boolean|JSON} options.video This call requires video
   * @param {JSON} options.video.resolution [Rel: Skyway.VIDEO_RESOLUTION]
   * @param {Integer} options.video.resolution.width Video width
   * @param {Integer} options.video.resolution.height Video height
   * @param {Integer} options.video.frameRate Mininum frameRate of Video
   * @param {String} options.bandwidth Bandwidth settings
   * @param {String} options.bandwidth.audio Audio Bandwidth
   * @param {String} options.bandwidth.video Video Bandwidth
   * @param {String} options.bandwidth.data Data Bandwidth
   * @example
   *   // To just join the default room without any video or audio
   *   // Note that calling joinRoom without any parameters
   *   // Still sends any available existing MediaStreams allowed.
   *   // See Examples 2, 3, 4 and 5 etc to prevent video or audio stream
   *   SkywayDemo.joinRoom();
   *
   *   // To just join the default room with bandwidth settings
   *   SkywayDemo.joinRoom({
   *     bandwidth: {
   *       data: 14440
   *     }
   *   });
   *
   *   // Example 1: To call getUserMedia and joinRoom seperately
   *   SkywayDemo.getUserMedia();
   *   SkywayDemo.on('mediaAccessSuccess', function (stream)) {
   *     attachMediaStream($('.localVideo')[0], stream);
   *     SkywayDemo.joinRoom();
   *   });
   *
   *   // Example 2: Join a room without any video or audio
   *   SkywayDemo.joinRoom('room');
   *
   *   // Example 3: Join a room with audio only
   *   SkywayDemo.joinRoom('room', {
   *     'audio' : true,
   *     'video' : false
   *   });
   *
   *   // Example 4: Join a room with prefixed video width and height settings
   *   SkywayDemo.joinRoom('room', {
   *     'audio' : true,
   *     'video' : {
   *       'res' : {
   *         'width' : 640,
   *         'height' : 320
   *       }
   *     }
   *   });
   *
   *   // Example 5: Join a room with userData and settings with audio, video and bandwidth
   *   SkwayDemo.joinRoom({
   *     'userData': {
   *       item1: 'My custom data',
   *       item2: 'Put whatever, string or JSON or array'
   *     },
   *     'audio' : {
   *        'stereo' : true
   *      },
   *     'video' : {
   *        'res' : SkywayDemo.VIDEO_RESOLUTION.VGA,
   *        'frameRate' : 50
   *     },
   *     'bandwidth' : {
   *        'audio' : 48,
   *        'video' : 256,
   *        'data' : 14480
   *      }
   *   });
   * @trigger peerJoined
   * @since 0.2.0
   */
  Skyway.prototype.joinRoom = function(room, mediaOptions) {
    console.info(mediaOptions);
    var self = this;
    if (self._in_room) {
      return;
    }
    var sendJoinRoomMessage = function() {
      console.log('API - Joining room: ' + self._room.id);
      self._sendMessage({
        type: self.SIG_TYPE.JOIN_ROOM,
        uid: self._user.id,
        cid: self._key,
        rid: self._room.id,
        userCred: self._user.token,
        timeStamp: self._user.timeStamp,
        apiOwner: self._user.apiOwner,
        roomCred: self._room.token,
        start: self._room.start,
        len: self._room.len
      });
      // self._user.peer = self._createPeerConnection(self._user.sid);
    };
    var doJoinRoom = function() {
      var checkChannelOpen = setInterval(function () {
        if (!self._channel_open) {
          if (self._readyState === self.READY_STATE_CHANGE.COMPLETED) {
            self._openChannel();
          }
        } else {
          clearInterval(checkChannelOpen);
          self._waitForMediaStream(function() {
            sendJoinRoomMessage();
          }, mediaOptions);
        }
      }, 500);
    };
    if (typeof room === 'string') {
      self._reinit({
        room: room
      }, doJoinRoom);
    } else {
      mediaOptions = room;
      doJoinRoom();
    }
  };

  /**
   * User to leave the room
   * @method leaveRoom
   * @example
   *   SkywayDemo.leaveRoom();
   * @trigger peerLeft, channelClose
   * @since 0.1.0
   */
  Skyway.prototype.leaveRoom = function() {
    if (!this._in_room) {
      return;
    }
    for (var pc_index in this._peerConnections) {
      if (this._peerConnections.hasOwnProperty(pc_index)) {
        this._removePeer(pc_index);
      }
    }
    this._in_room = false;
    this._closeChannel();
    this._trigger('peerLeft', this._user.sid, this._user.info, true);
  };
}).call(this);