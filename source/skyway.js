/**
 *
 * @class Skyway
 */
(function () {

  /**
   * @class Skyway
   * @constructor
   * @param {String} serverpath    Path to the server to collect infos from.
   *                                 Ex: https://developer.temasys.com.sg/
   * @param {String} appID         AppID of the Application you tied to this domain
   * @param {string} room          Name of the room to join.
   * @param {String} startTime     Start timing of the meeting in Date ISO String
   * @param {Integer} duration     Duration of the meeting
   * @param {String} credential    Credential required to set the timing and duration of a meeting
   * @param {String} region        Regional server that user chooses to use.
   * Servers:
   * - us1 : USA server 1. Default server if region is not provided.
   * - us2 : USA server 2
   * - sg : Singapore server
   * - eu : Europe server
   */
  function Skyway() {
    if (!(this instanceof Skyway)) {
      return new Skyway();
    }

    this.VERSION = '@@version';

    this.ICE_CONNECTION_STATE = {
      STARTING : 'starting',
      CHECKING : 'checking',
      CONNECTED : 'connected',
      COMPLETED : 'completed',
      CLOSED : 'closed',
      FAILED : 'failed',
      DISCONNECTED : 'disconnected'
    };

    this.PEER_CONNECTION_STATE = {
      STABLE : 'stable',
      HAVE_LOCAL_OFFER : 'have-local-offer',
      HAVE_REMOTE_OFFER : 'have-remote-offer',
      HAVE_LOCAL_PRANSWER : 'have-local-pranswer',
      HAVE_REMOTE_PRANSWER : 'have-remote-pranswer',
      ESTABLISHED : 'established',
      CLOSED : 'closed'
    };

    this.CANDIDATE_GENERATION_STATE = {
      GATHERING : 'gathering',
      DONE : 'done'
    };

    this.HANDSHAKE_PROGRESS = {
      ENTER : 'enter',
      WELCOME : 'welcome',
      OFFER : 'offer',
      ANSWER : 'answer'
    };

    this.DATA_CHANNEL_STATE = {
      CONNECTING : 'connecting',
      OPEN   : 'open',
      CLOSING : 'closing',
      CLOSED : 'closed',
      //-- Added ReadyState events
      NEW    : 'new',
      LOADED : 'loaded',
      ERROR  : 'error'
    };

    this.SYSTEM_ACTION = {
      WARNING : 'warning',
      REJECT : 'reject',
      CLOSED : 'close'
    };

    this.READY_STATE_CHANGE = {
      INIT : 0,
      LOADING : 1,
      COMPLETED : 2,
      ERROR :  -1,
      API_ERROR : -2,
      NO_SOCKET_ERROR : -3,
      NO_XMLHTTPREQUEST_ERROR : -4,
      NO_WEBRTC_ERROR : -5,
      NO_PATH_ERROR : -6
    };

    this.DATA_TRANSFER_TYPE = {
      UPLOAD : 'upload',
      DOWNLOAD : 'download'
    };

    this.DATA_TRANSFER_STATE = {
      UPLOAD_STARTED : 'uploadStarted',
      DOWNLOAD_STARTED : 'downloadStarted',
      REJECTED : 'rejected',
      ERROR : 'error',
      UPLOADING : 'uploading',
      DOWNLOADING : 'downloading',
      UPLOAD_COMPLETED : 'uploadCompleted',
      DOWNLOAD_COMPLETED : 'downloadCompleted'
    };

    // TODO : ArrayBuffer and Blob in DataChannel
    this.DATA_TRANSFER_DATA_TYPE = {
      BINARYSTRING : 'binaryString',
      ARRAYBUFFER : 'arrayBuffer',
      BLOB : 'blob'
    };

    // NOTE ALEX: check if last char is '/'
    /**
     * @attribute _path
     * @type String
     * @default serverpath
     * @final
     * @required
     * @private
     */
    this._path = null;

    /**
     * The API key (not used)
     * @attribute key
     * @type String
     * @private
     */
    this._key = null;
    /**
     * the actual socket that handle the connection
     *
     * @attribute _socket
     * @required
     * @private
     */
    this._socket = null;
    /**
     * the socket version of the socket.io used
     *
     * @attribute _socketVersion
     * @private
     */
    this._socketVersion = null;
    /**
     * User Information, credential and the local stream(s).
     * @attribute _user
     * @required
     * @private
     *
     */
    this._user = null;
    /**
     * @attribute _room
     * @type JSON
     * @required
     * @private
     *
     * @param {} room  Room Information, and credentials.
     * @param {String} room.id
     * @param {String} room.token
     * @param {String} room.tokenTimestamp
     * @param {String} room.displayName Displayed name
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
     */
    this._room = null;

    /**
     * Internal array of peerconnections
     * @attribute _peerConnections
     * @attribute
     * @private
     * @required
     */
    this._peerConnections = [];
    this._dataChannels = [];
    this._dataChannelPeers = [];
    this._readyState = 0; // 0 'false or failed', 1 'in process', 2 'done'
    this._channel_open = false;
    this._in_room = false;
    this._uploadDataTransfers = {}; // Stores the data
    this._uploadDataSessions = {};  // Stores the information
    this._downloadDataTransfers = {}; // Stores the data
    this._downloadDataSessions = {};  // Stores the information
    this._dataTransfersTimeout = {};
    this._chunkFileSize = 49152; // [25KB because Plugin] 60 KB Limit | 4 KB for info
    this._mozChunkFileSize = 16384; // Firefox the sender chunks 49152 but receives as 16384

    this._parseInfo = function (info, self) {
      console.log(info);

      if (!info.pc_constraints && !info.offer_constraints) {
        self._trigger('readyStateChange', this.READY_STATE_CHANGE.API_ERROR);
        return;
      }
      console.log(JSON.parse(info.pc_constraints));
      console.log(JSON.parse(info.offer_constraints));

      self._key = info.cid;
      self._user = {
        id        : info.username,
        token     : info.userCred,
        timeStamp : info.timeStamp,
        displayName : info.displayName,
        apiOwner : info.apiOwner,
        streams : []
      };
      self._room = {
        id : info.room_key,
        token : info.roomCred,
        start: info.start,
        len: info.len,
        signalingServer : {
          ip : info.ipSigserver,
          port : info.portSigserver
        },
        pcHelper : {
          pcConstraints : JSON.parse(info.pc_constraints),
          pcConfig : null,
          offerConstraints : JSON.parse(info.offer_constraints),
          sdpConstraints : {
            mandatory : {
              OfferToReceiveAudio : true,
              OfferToReceiveVideo : true
            }
          }
        }
      };
      self._readyState = 2;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.COMPLETED);
      console.info('API - Parsed infos from webserver. Ready.');
    };

    // NOTE: Changed from _init to _loadInfo to prevent confusion
    this._loadInfo = function (self) {
      if (!window.io) {
        console.error('API - Socket.io not loaded.');
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.NO_SOCKET_ERROR);
        return;
      }
      if (!window.XMLHttpRequest) {
        console.error('XHR - XMLHttpRequest not supported');
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.NO_XMLHTTPREQUEST_ERROR);
        return;
      }
      if (!window.RTCPeerConnection) {
        console.error('RTC - WebRTC not supported.');
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.NO_WEBRTC_ERROR);
        return;
      }
      if (!this._path) {
        console.error('API - No connection info. Call init() first.');
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.NO_PATH_ERROR);
        return;
      }

      self._readyState = 1;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.LOADING);

      var xhr = new window.XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (this.readyState === this.DONE) {
          if (this.status !== 200) {
            console.log('XHR - ERROR ' + this.status, false);
            self._readyState = 0;
            self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR);
            return;
          }
          console.log('API - Got infos from webserver.');
          self._parseInfo(JSON.parse(this.response), self);
        }
      };
      xhr.open('GET', self._path, true);
      console.log('API - Fetching infos from webserver');
      xhr.send();
      console.log('API - Waiting for webserver to provide infos.');
    };
  }

  this.Skyway = Skyway;

  /**
   * Let app register a callback function to an event
   *
   * @method on
   * @param {String} eventName
   * @param {Function} callback
   */
  Skyway.prototype.on = function (eventName, callback) {
    if ('function' === typeof callback) {
      this._events[eventName] = this._events[eventName] || [];
      this._events[eventName].push(callback);
    }
  };

  /**
   * Let app unregister a callback function from an event
   *
   * @method off
   * @param {String} eventName
   * @param {Function} callback
   */
  Skyway.prototype.off = function (eventName, callback) {
    if (callback === undefined) {
      this._events[eventName] = [];
      return;
    }
    var arr = this._events[eventName], l = arr.length;
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
   *
   * @method trigger
   * @param {String} eventName
   * @for Skyway
   * @private
   */
  Skyway.prototype._trigger = function (eventName) {
    var args = Array.prototype.slice.call(arguments),
    arr = this._events[eventName];
    args.shift();
    for (var e in arr) {
      if (arr[e].apply(this, args) === false) {
        break;
      }
    }
  };

  /**
   * @method init
   * @param {JSON} options Skyway appID options
   *  @param {String} options.roomserver Path to the Temasys backend server
   *  @param {String} options.appID AppID to identify with the Temasys backend server
   *  @param {String} options.room Roomname
   *  @param {String} options.region The regional server that user chooses to use.
   *  @param {String} options.credentials Credentials options
   *    @param {String} options.credentials.startDateTime
   *      The Start timing of the meeting in Date ISO String
   *    @param {Integer} options.credentials.duration The duration of the meeting
   *    @param {String} options.credentials.credentials
   *      The credential required to set the timing and duration of a meeting
   * Servers:
   * - sg : Singapore server
   * - us1 : USA server 1. Default server if region is not provided.
   * - us2 : USA server 2
   * - eu : Europe server
   */
  Skyway.prototype.init = function (options) {
    var appID, room, startDateTime, duration, credentials;
    var roomserver = 'http://sgbeta.signaling.temasys.com.sg:8018/';
    var region = 'us1';

    if (typeof options === 'string') {
      appID = options;
      room = appID;
    } else {
      appID = options.appID;
      roomserver = options.roomserver;
      roomserver = (roomserver.lastIndexOf('/') !==
        (roomserver.length - 1)) ? (roomserver += '/')
        : roomserver;
      region = options.region || region;
      room = options.room || appID;
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
    this._key = appID;
    this._path = roomserver + 'api/' + appID + '/' + room;
    this._path += (credentials) ? ('/' + startDateTime + '/' +
      duration + '?&cred=' + credentials) : '';
    this._path += ((this._path.indexOf('?&') > -1) ?
      '&' : '?&') + 'rg=' + region;
    console.log('API - Path: ' + this._path);
    this._loadInfo(this);
  };

  /**
   * @method setUser
   * @param {} user
   * @param {String} user.id username in the system, will be 'Guestxxxxx' if not logged in
   * @param {String} user.token Token for user verification upon connection
   * @param {String} user.tokenTimestamp Token timestamp for connection validation.
   * @param {String} user.displayName Displayed name
   * @param {Array}  user.streams List of all the local streams. Can ge generated internally
   *                              by getDefaultStream(), or provided through updateUser().
   */
  Skyway.prototype.setUser = function (user) {
    // NOTE ALEX: be smarter and copy fields and only if different
    this._user = user;
  };

  /* Syntactically private variables and utility functions */

  Skyway.prototype._events = {
    /**
     * Event fired when a successfull connection channel has been established
     * with the signaling server
     * @event channelOpen
     */
    'channelOpen' : [],
    /**
     * Event fired when the channel has been closed.
     * @event channelClose
     */
    'channelClose' : [],
    /**
     * Event fired when we received a message from the sig server..
     * @event channelMessage
     */
    'channelMessage' : [],
    /**
     * Event fired when there was an error with the connection channel to the sig server.
     * @event channelError
     * @param {String} error
     */
    'channelError' : [],

    /**
     * Event fired when user joins the room
     * @event joinedRoom
     * @param {String} roomID
     * @param {String} userID
     */
    'joinedRoom' : [],
    /**
     * Event fired whether the room is ready for use
     * @event readyStateChange
     * @param {String} readyState [Rel: Skyway.READY_STATE_CHANGE]
     * Steps that would occur are:
     * - INIT      : Step 1. Init state. If ReadyState fails, it goes to 0.
     * - LOADING   : Step 2. RTCPeerConnection exists. Roomserver, API ID provided is not empty
     * - COMPLETED : Step 3. Retrieval of configuration is complete. Socket.io begins connection.
     * - ERROR     : Error state. Occurs when ReadyState fails loading.
     * - API_ERROR  : API Error state. This occurs when provided APP ID or Roomserver is invalid.
     * - NO_SOCKET_ERROR         : No Socket.IO was loaded state.
     * - NO_XMLHTTPREQUEST_ERROR : XMLHttpRequest is not available in user's PC
     * - NO_WEBRTC_ERROR         : Browser does not support WebRTC error.
     * - NO_PATH_ERROR           : No path provided in init error.
     */
    'readyStateChange' : [],
    /**
     * Event fired when a step of the handshake has happened. Usefull for diagnostic
     * or progress bar.
     * @event handshakeProgress
     * @param {String} step [Rel: Skyway.HANDSHAKE_PROGRESS]
     * Steps that would occur are:
     * - ENTER   : Step 1. Received enter from Peer
     * - WELCOME : Step 2. Received welcome from Peer
     * - OFFER   : Step 3. Received offer from Peer
     * - ANSWER  : Step 4. Received answer from Peer
     * @param {String} peerID
     */
    'handshakeProgress' : [],
    /**
     * Event fired during ICE gathering
     * @event candidateGenerationState
     * @param {String} state [Rel: Skyway.CANDIDATE_GENERATION_STATE]
     * States that would occur are:
     * - GATHERING : ICE Gathering to Peer has just started
     * - DONE      : ICE Gathering to Peer has been completed
     * @param {String} peerID
     */
    'candidateGenerationState' : [],
    /**
     * Event fired during Peer Connection state change
     * @event peerConnectionState
     * @param {String} state [Rel: Skyway.PEER_CONNECTION_STATE]
     * States that would occur are:
     * - STABLE               :	Initial stage. No local or remote description is applied
     * - HAVE_LOCAL_OFFER     :	"Offer" local description is applied
     * - HAVE_REMOTE_OFFER    : "Offer" remote description is applied
     * - HAVE_LOCAL_PRANSWER  : "Answer" local description is applied
     * - HAVE_REMOTE_PRANSWER : "Answer" remote description is applied
     * - ESTABLISHED          : All description is set and is applied
     * - CLOSED               : Connection closed.
     */
    'peerConnectionState' : [],
    /**
     * Event fired during ICE connection
     * @iceConnectionState
     * @param {String} state [Rel: Skyway.ICE_CONNECTION_STATE]
     * States that would occur are:
     * - STARTING     : ICE Connection to Peer initialized
     * - CLOSED       : ICE Connection to Peer has been closed
     * - FAILED       : ICE Connection to Peer has failed
     * - CHECKING     : ICE Connection to Peer is still in checking status
     * - DISCONNECTED : ICE Connection to Peer has been disconnected
     * - CONNECTED    : ICE Connection to Peer has been connected
     * - COMPLETED    : ICE Connection to Peer has been completed
     * @param {String} peerID
     */
    'iceConnectionState' : [],
    //-- per peer, local media events
    /**
     * Event fired when allowing webcam media stream fails
     * @event mediaAccessError
     * @param {String} error
     */
    'mediaAccessError' : [],
    /**
     * Event fired when allowing webcam media stream passes
     * @event mediaAccessSuccess
     * @param {Object} stream
     */
    'mediaAccessSuccess' : [],
    /**
     * Event fired when a chat message is received from other peers
     * @event chatMessage
     * @param {String}  msg
     * @param {String}  displayName
     * @param {Boolean} pvt
     */
    'chatMessage' : [],
    /**
     * Event fired when a peer joins the room
     * @event peerJoined
     * @param {String} peerID
     */
    'peerJoined' : [],
    /**
     * TODO Event fired when a peer leaves the room
     * @event peerLeft
     * @param {String} peerID
     */
    'peerLeft' : [],
    /**
     * TODO Event fired when a peer joins the room
     * @event presenceChanged
     * @param {JSON} users The list of users
     */
    'presenceChanged' : [],
    /**
     * TODO Event fired when a room is locked
     * @event roomLock
     * @param {Boolean} isLocked
     * @private
     */
    'roomLock' : [],

    //-- per peer, peer connection events
    /**
     * Event fired when a remote stream has become available
     * @event addPeerStream
     * @param {String} peerID
     * @param {Object} stream
     */
    'addPeerStream' : [],
    /**
     * Event fired when a remote stream has become unavailable
     * @event removePeerStream
     * @param {String} peerID
     */
    'removePeerStream' : [],
    /**
     * TODO Event fired when a peer's video is muted
     * @event peerVideoMute
     * @param {String} peerID
     * @param {Boolean} isMuted
     * @private
     *
     */
    'peerVideoMute' : [],
    /**
     * TODO Event fired when a peer's audio is muted
     * @param {String} peerID
     * @param {Boolean} isMuted
     * @private
     */
    'peerAudioMute' : [],

    //-- per user events
    /**
     * TODO Event fired when a contact is added
     * @param {String} userID
     * @private
     */
    'addContact' : [],
    /**
     * TODO Event fired when a contact is removed
     * @param {String} userID
     * @private
     */
    'removeContact' : [],
    /**
     * TODO Event fired when a contact is invited
     * @param {String} userID
     * @private
     */
    'invitePeer' : [],
    /**
     * Event fired when a DataChannel's state has changed
     * @event dataChannelState
     * @param {String} state [Rel: Skyway.DATA_CHANNEL_STATE]
     * Steps that would occur are:
     * - NEW        : Step 1. DataChannel has been created.
     * - LOADED     : Step 2. DataChannel events has been loaded.
     * - OPEN       : Step 3. DataChannel is connected. [WebRTC Standard]
     * - CONNECTING : DataChannel is connecting. [WebRTC Standard]
     * - CLOSING    : DataChannel is closing. [WebRTC Standard]
     * - CLOSED     : DataChannel has been closed. [WebRTC Standard]
     * - ERROR      : DataChannel has an error ocurring.
     * @param {String} peerID
     */
    'dataChannelState' : [],
    /**
     * Event fired when a Peer there is a Data Transfer going on
     * @event dataTransferState
     * @param {String} state [Rel: Skyway.DATA_TRANSFER_STATE]
     * State that would occur are:
     * - UPLOAD_STARTED     : Data Transfer of Upload has just started
     * - DOWNLOAD_STARTED   : Data Transfer od Download has just started
     * - REJECTED           : Peer rejected User's Data Transfer request
     * - ERROR              : Error occurred when uploading or downloading file
     * - UPLOADING          : Data is uploading
     * - DOWNLOADING        : Data is downloading
     * - UPLOAD_COMPLETED   : Data Transfer of Upload has completed
     * - DOWNLOAD_COMPLETED : Data Transfer of Download has completed
     * @param {String} itemID ID of the Data Transfer
     * @param {String} peerID Peer's ID
     * @param {JSON} transferInfo. Available data may vary at different state.
     * - percentage : The percetange of data being uploaded / downloaded
     * - senderID   : The sender Peer's ID
     * - data       : Blob data URL
     * - name       : Data name
     * - size       : Data size
     * - message    : Error message
     * - type       : Where the error message occurred. [Rel: Skyway.DATA_TRANSFER_TYPE]
     *   - UPLOAD    : Error occurs at UPLOAD state
     *   - DOWNLOAD  : Error occurs at DOWNLOAD state
     */
    'dataTransferState' : [],
    /**
     * Event fired when the Signalling server responds to user regarding
     * the state of the room
     * @event systemAction
     * @param {String} action [Rel: Skyway.SYSTEM_ACTION]
     * System action outcomes are:
     * - WARNING : System is warning user that the room is closing
     * - REJECT  : System has rejected user from room
     * - CLOSED  : System has closed the room
     * @param {String} message The reason of the action
    */
    'systemAction' : [],
    /**
     * Event fired based on what user has set for specific users
     * @event privateMessage
     * @param {JSON/String} data Data to be sent over
     * @param {String} displayName Display name of the sender
     * @param {String} peerID Targeted Peer to receive the data
     * @param {Boolean} isSelf Check if message is sent to self
     */
    'privateMessage' : [],
    /**
     * Event fired based on what user has set for all users
     * @event publicMessage
     * @param {String} nick
     * @param {JSON/String} data
     * @param {Boolean} isSelf Check if message is sent to self
     */
    'publicMessage' : []
  };

  /**
   * Send a chat message
   * @method sendChatMsg
   * @param {JSON}   chatMsg
   * @param {String} chatMsg.msg
   * @param {String} [targetPeerID]
   */
  Skyway.prototype.sendChatMsg = function (chatMsg, targetPeerID) {
    var msg_json = {
      cid : this._key,
      data : chatMsg,
      mid : this._user.sid,
      nick : this._user.displayName,
      rid : this._room.id,
      type : 'chat'
    };
    if (targetPeerID) {
      msg_json.target = targetPeerID;
    }
    this._sendMessage(msg_json);
    this._trigger('chatMessage',
      chatMsg,
      this._user.displayName,
      !!targetPeerID
    );
  };

  /**
   * Send a private message
   * @method sendPrivateMsg
   * @protected
   * @param {JSON}   data
   * @param {String} data.msg
   * @param {String} [targetPeerID]
   */
  Skyway.prototype.sendPrivateMsg = function (data, targetPeerID) {
    var msg_json = {
      cid : this._key,
      data : data,
      mid : this._user.sid,
      nick : this._user.displayName,
      rid : this._room.id,
      type : 'private'
    };
    if (targetPeerID) {
      msg_json.target = targetPeerID;
    }
    this._sendMessage(msg_json);
    this._trigger('privateMessage',
      data, this._user.displayName, targetPeerID, true
    );
  };

  /**
   * Send a public broadcast message
   * @method sendPublicMsg
   * @protected
   * @param {JSON}   data
   * @param {String} data.msg
   * @param {String} [targetPeerID]
   */
  Skyway.prototype.sendPublicMsg = function (data) {
    var msg_json = {
      cid : this._key,
      data : data,
      mid : this._user.sid,
      nick : this._user.displayName,
      rid : this._room.id,
      type : 'public'
    };
    this._sendMessage(msg_json);
    this._trigger('publicMessage', this._user.displayName, data, true);
  };
  /**
   * Get the default cam and microphone
   * @method getDefaultStream
   * @param options
   *  @key {Boolean} audio
   *  @key {Boolean} video
   */
  Skyway.prototype.getDefaultStream = function (options) {
    var self = this;
    var requireAudio = (options) ? (options.hasOwnProperty('audio') ?
      options.audio : true) : true;
    var requireVideo = (options) ? (options.hasOwnProperty('video') ?
      options.video : true) : true;
    try {
      window.getUserMedia({
        'audio' : requireAudio,
        'video' : requireVideo
      }, function (s) {
        self._onUserMediaSuccess(s, self);
      }, function (e) {
        self._onUserMediaError(e, self);
      });
      console.log('API [MediaStream] - Requested ' +
        ((requireAudio) ? 'A' : '') +
        ((requireAudio && requireVideo) ? '/' : '') +
        ((requireVideo) ? 'V' : ''));
    } catch (e) {
      this._onUserMediaError(e, self);
    }
  };

  /**
   * Stream is available, let's throw the corresponding event with the stream attached.
   *
   * @method _onUserMediaSuccess
   * @param {} stream The acquired stream
   * @param {} self   A convenience pointer to the Skyway object for callbacks
   * @private
   */
  Skyway.prototype._onUserMediaSuccess = function (stream, self) {
    console.log('API - User has granted access to local media.');
    self._trigger('mediaAccessSuccess', stream);
    self._user.streams.push(stream);
  };

  /**
   * getUserMedia could not succeed.
   *
   * @method _onUserMediaError
   * @param {} e error
   * @param {} self A convenience pointer to the Skyway object for callbacks
   * @private
   */
  Skyway.prototype._onUserMediaError = function (e, self) {
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
   * Eventually handle the message(s) to _processSingleMsg
   *
   * @method _processingSigMsg
   * @param {JSON} message
   * @private
   */
  Skyway.prototype._processSigMsg = function (message) {
    var msg = JSON.parse(message);
    if (msg.type === 'group') {
      console.log('API - Bundle of ' + msg.lists.length + ' messages.');
      for (var i = 0; i < msg.lists.length; i++) {
        this._processSingleMsg(msg.lists[i]);
      }
    } else {
      this._processSingleMsg(msg);
    }
  };

  /**
   * This dispatch all the messages from the infrastructure to their respective handler
   *
   * @method _processingSingleMsg
   * @param {JSON str} msg
   * @private
   */
  Skyway.prototype._processSingleMsg = function (msg) {
    this._trigger('channelMessage');
    var origin = msg.mid;
    if (!origin || origin === this._user.sid) {
      origin = 'Server';
    }
    console.log('API - [' + origin + '] Incoming message: ' + msg.type);
    if (msg.mid === this._user.sid &&
      msg.type !== 'redirect' &&
      msg.type !== 'inRoom' &&
      msg.type !== 'chat') {
      console.log('API - Ignoring message: ' + msg.type + '.');
      return;
    }
    switch (msg.type) {
    //--- BASIC API Msgs ----
    case 'public':
      this._privateMsgHandler(msg);
      break;
    case 'private':
      this._privateMsgHandler(msg);
      break;
    case 'inRoom':
      this._inRoomHandler(msg);
      break;
    case 'enter':
      this._enterHandler(msg);
      break;
    case 'welcome':
      this._welcomeHandler(msg);
      break;
    case 'offer':
      this._offerHandler(msg);
      break;
    case 'answer':
      this._answerHandler(msg);
      break;
    case 'candidate':
      this._candidateHandler(msg);
      break;
    case 'bye':
      this._byeHandler(msg);
      break;
    case 'chat':
      this._chatHandler(msg);
      break;
    case 'redirect':
      this._redirectHandler(msg);
      break;
    case 'update_guest_name':
      // this._updateGuestNameHandler(msg);
      break;
    case 'error':
      // location.href = '/?error=' + msg.kind;
      break;
      //--- ADVANCED API Msgs ----
    case 'invite':
      // this._inviteHandler();
      break;
    case 'video_mute_event':
      // this._handleVideoMuteEventMessage(msg.mid, msg.guest);
      break;
    case 'roomLockEvent':
      // this._roomLockEventHandler(msg);
      break;
    default:
      console.log('API - [' + msg.mid + '] Unsupported message type received: ' + msg.type);
      break;
    }

  };

  /**
   * Throw an event with the received chat msg
   *
   * @method _chatHandler
   * @private
   * @param {JSON} msg
   * @param {String} msg.data
   * @param {String} msg.nick
   */
  Skyway.prototype._chatHandler = function (msg) {
    this._trigger('chatMessage',
      msg.data,
      ((msg.id === this._user.sid) ? 'Me, myself and I' : msg.nick),
      (msg.target ? true : false)
    );
  };

  /**
   * Signaller server wants us to move out.
   *
   * @method _redirectHandler
   * @private
   * @param {JSON} msg
   */
  Skyway.prototype._redirectHandler = function (msg) {
    console.log('API - [Server] You are being redirected: ' + msg.info);
    this._trigger('systemAction', msg.action, msg.info);
  };

  /**
   * A peer left, let.s clean the corresponding connection, and trigger an event.
   *
   * @method _byeHandler
   * @private
   * @param {JSON} msg
   */
  Skyway.prototype._byeHandler = function (msg) {
    var targetMid = msg.mid;
    console.log('API - [' + targetMid + '] received \'bye\'.');
    this._removePeer(targetMid);
  };

  /**
   * Throw an event with the received private msg
   *
   * @method _privateMsgHandler
   * @private
   * @param {JSON} msg
   *   @key {String} data
   *   @key {String} nick
   *   @key {String} peerID
   */
  Skyway.prototype._privateMsgHandler = function (msg) {
    this._trigger('privateMessage', msg.data, msg.nick, msg.target, false);
  };

  /**
   * Throw an event with the received private msg
   *
   * @method _publicMsgHandler
   * @private
   * @param {JSON} msg
   *   @key {String} nick
   *   @key {JSON/String} data
   */
  Skyway.prototype._publicMsgHandler = function (msg) {
    this._trigger('publicMessage', msg.nick, msg.data, false);
  };

  /**
   * Actually clean the peerconnection and trigger an event. Can be called by _byHandler
   * and leaveRoom.
   *
   * @method _removePeer
   * @private
   * @param {String} peerID Id of the peer to remove
   */
  Skyway.prototype._removePeer = function (peerID) {
    this._trigger('peerLeft', peerID);
    if (this._peerConnections[peerID]) {
      this._peerConnections[peerID].close();
    }
    delete this._peerConnections[peerID];
  };

  /**
   * We just joined a room! Let's send a nice message to all to let them know I'm in.
   *
   * @method _inRoomHandler
   * @private
   * @param {JSON} msg
   */
  Skyway.prototype._inRoomHandler = function (msg) {
    console.log('API - We\'re in the room! Chat functionalities are now available.');
    console.log('API - We\'ve been given the following PC Constraint by the sig server: ');
    console.dir(msg.pc_config);

    this._room.pcHelper.pcConfig = this._setFirefoxIceServers(msg.pc_config);
    this._in_room = true;
    this._user.sid = msg.sid;
    this._trigger('joinedRoom', this._room.id, this._user.sid);

    // NOTE ALEX: should we wait for local streams?
    // or just go with what we have (if no stream, then one way?)
    // do we hardcode the logic here, or give the flexibility?
    // It would be better to separate, do we could choose with whom
    // we want to communicate, instead of connecting automatically to all.
    var self = this;
    console.log('API - Sending enter.');
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER);
    self._sendMessage({
      type : 'enter',
      mid : self._user.sid,
      rid : self._room.id,
      agent : window.webrtcDetectedBrowser.browser,
      version : window.webrtcDetectedBrowser.version,
      nick : self._user.displayName
    });
  };

  /**
   * Someone just entered the room. If we don't have a connection with him/her,
   * send him a welcome. Handshake step 2 and 3.
   *
   * @method _enterHandler
   * @private
   * @param {JSON} msg
   */
  Skyway.prototype._enterHandler = function (msg) {
    var targetMid = msg.mid;
    var self = this;
    // need to check entered user is new or not.
    if (!self._peerConnections[targetMid]) {
      msg.agent = (!msg.agent) ? 'Chrome' : msg.agent;
      var browserAgent = msg.agent + ((msg.version) ? ('|' + msg.version) : '');
      // should we resend the enter so we can be the offerer?
      checkMediaDataChannelSettings(false, browserAgent, function (beOfferer) {
        self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, targetMid);
        var params = {
          type : ((beOfferer) ? 'enter' : 'welcome'),
          mid : self._user.sid,
          rid : self._room.id,
          agent : window.webrtcDetectedBrowser.browser,
          nick : self._user.displayName
        };
        if (!beOfferer) {
          console.log('API - [' + targetMid + '] Sending welcome.');
          self._trigger('peerJoined', targetMid);
          self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);
          params.target = targetMid;
        }
        self._sendMessage(params);
      });
    } else {
      // NOTE ALEX: and if we already have a connection when the peer enter,
      // what should we do? what are the possible use case?
      console.log('API - Received "enter" when Peer "' + targetMid +
        '" is already added');
      return;
    }
  };

  /**
   * We have just received a welcome. If there is no existing connection with this peer,
   * create one, then set the remotedescription and answer.
   *
   * @method _offerHandler
   * @private
   * @param {JSON} msg
   */
  Skyway.prototype._welcomeHandler = function (msg) {
    var targetMid = msg.mid;
    msg.agent = (!msg.agent) ? 'Chrome' : msg.agent;
    this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.WELCOME, targetMid);
    this._trigger('peerJoined', targetMid);
    if (!this._peerConnections[targetMid]) {
      this._openPeer(targetMid, msg.agent, true);
    }
  };

  /**
   * We have just received an offer. If there is no existing connection with this peer,
   * create one, then set the remotedescription and answer.
   *
   * @method _offerHandler
   * @private
   * @param {JSON} msg
   */
  Skyway.prototype._offerHandler = function (msg) {
    var targetMid = msg.mid;
    msg.agent = (!msg.agent) ? 'Chrome' : msg.agent;
    this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.OFFER, targetMid);
    console.log('Test:');
    console.log(msg);
    var offer = new window.RTCSessionDescription(msg);
    console.log('API - [' + targetMid + '] Received offer:');
    console.dir(offer);
    var pc = this._peerConnections[targetMid];
    if (!pc) {
      this._openPeer(targetMid, msg.agent, false);
      pc = this._peerConnections[targetMid];
    }
    var self = this;
    pc.setRemoteDescription(new RTCSessionDescription(offer), function () {
      self._doAnswer(targetMid);
    }, function (err) {
      console.error(err);
    });
  };

  /**
   * We have succesfully received an offer and set it locally. This function will take care
   * of cerating and sendng the corresponding answer. Handshake step 4.
   *
   * @method _doAnswer
   * @private
   * @param {String} targetMid The peer we should connect to.
   * @param {Boolean} toOffer Wether we should start the O/A or wait.
   */
  Skyway.prototype._doAnswer = function (targetMid) {
    console.log('API - [' + targetMid + '] Creating answer.');
    var pc = this._peerConnections[targetMid];
    var self = this;
    if (pc) {
      pc.createAnswer(function (answer) {
        console.log('API - [' + targetMid + '] Created  answer.');
        console.dir(answer);
        self._setLocalAndSendMessage(targetMid, answer);
      }, function (error) {
        self._onOfferOrAnswerError(targetMid, error, 'answer');
      }, self._room.pcHelper.sdpConstraints);
    } else {
      return;
      /* Houston ..*/
    }
  };

  /**
   * Fallback for offer or answer creation failure.
   *
   * @method _onOfferOrAnswerError
   * @private
   */
  Skyway.prototype._onOfferOrAnswerError = function (targetMid, error, type) {
    console.log('API - [' + targetMid + '] Failed to create an ' + type +
      '. Error code was ' + JSON.stringify(error));
  };

  /**
   * We have a peer, this creates a peerconnection object to handle the call.
   * if we are the initiator, we then starts the O/A handshake.
   *
   * @method _openPeer
   * @private
   * @param {String} targetMid The peer we should connect to.
   * @param {Boolean} toOffer Wether we should start the O/A or wait.
   */
  Skyway.prototype._openPeer = function (targetMid, peerAgentBrowser, toOffer) {
    console.log('API - [' + targetMid + '] Creating PeerConnection.');
    var self = this;

    self._peerConnections[targetMid] = self._createPeerConnection(targetMid);
    self._addLocalStream(targetMid);

    // I'm the callee I need to make an offer
    if (toOffer) {
      self._createDataChannel(targetMid, function (dc){
        self._dataChannels[targetMid] = dc;
        self._dataChannelPeers[dc.label] = targetMid;
        self._checkDataChannelStatus(dc);
        self._doCall(targetMid, peerAgentBrowser);
      });
    }
  };

  /**
   * Sends our Local MediaStream to other Peers.
   * By default, it sends all it's other stream
   *
   * @method _addLocalStream
   * @private
   * @param {String} peerID
   */
  Skyway.prototype._addLocalStream = function (peerID) {
    // NOTE ALEX: here we could do something smarter
    // a mediastream is mainly a container, most of the info
    // are attached to the tracks. We should iterates over track and print
    console.log('API - [' + peerID + '] Adding local stream.');

    if (this._user.streams.length > 0) {
      for (var i in this._user.streams) {
        if (this._user.streams.hasOwnProperty(i)) {
          this._peerConnections[peerID].addStream(this._user.streams[i]);
        }
      }
    } else {
      console.log('API - WARNING - No stream to send. You will be only receiving.');
    }
  };

  /**
   * The remote peer advertised streams, that we are forwarding to the app. This is part
   * of the peerConnection's addRemoteDescription() API's callback.
   *
   * @method _onRemoteStreamAdded
   * @private
   * @param {String} targetMid
   * @param {Event}  event      This is provided directly by the peerconnection API.
   */
  Skyway.prototype._onRemoteStreamAdded = function (targetMid, event) {
    console.log('API - [' + targetMid + '] Remote Stream added.');
    this._trigger('addPeerStream', targetMid, event.stream);
  };

  /**
   * it then sends it to the peer. Handshake step 3 (offer) or 4 (answer)
   *
   * @method _doCall
   * @private
   * @param {String} targetMid
   */
  Skyway.prototype._doCall = function (targetMid, peerAgentBrowser) {
    var pc = this._peerConnections[targetMid];
    // NOTE ALEX: handle the pc = 0 case, just to be sure
    var constraints = this._room.pcHelper.offerConstraints;
    var sc = this._room.pcHelper.sdpConstraints;
    for (var name in sc.mandatory) {
      if (sc.mandatory.hasOwnProperty(name)) {
        constraints.mandatory[name] = sc.mandatory[name];
      }
    }
    constraints.optional.concat(sc.optional);
    console.log('API - [' + targetMid + '] Creating offer.');
    var self = this;
    checkMediaDataChannelSettings(true, peerAgentBrowser, function (offerConstraints) {
      pc.createOffer(function (offer) {
        self._setLocalAndSendMessage(targetMid, offer);
      }, function (error) {
        self._onOfferOrAnswerError(targetMid, error, 'offer');
      }, offerConstraints);
    }, constraints);
  };

  /**
   * This takes an offer or an aswer generated locally and set it in the peerconnection
   * it then sends it to the peer. Handshake step 3 (offer) or 4 (answer)
   *
   * @method _setLocalAndSendMessage
   * @private
   * @param {String} targetMid
   * @param {JSON} sessionDescription This should be provided by the peerconnection API.
   * User might 'tamper' with it, but then , the setLocal may fail.
   */
  Skyway.prototype._setLocalAndSendMessage = function (targetMid, sessionDescription) {
    console.log('API - [' + targetMid + '] Created ' + sessionDescription.type + '.');
    console.log(sessionDescription);
    var pc = this._peerConnections[targetMid];
    // NOTE ALEX: handle the pc = 0 case, just to be sure

    // NOTE ALEX: opus should not be used for mobile
    // Set Opus as the preferred codec in SDP if Opus is present.
    // sessionDescription.sdp = preferOpus(sessionDescription.sdp);

    // limit bandwidth
    // sessionDescription.sdp = limitBandwidth(sessionDescription.sdp);

    console.log('API - [' + targetMid + '] Setting local Description (' +
      sessionDescription.type + ').');

    var self = this;
    pc.setLocalDescription(
      sessionDescription,
      function () {
      console.log('API - [' + targetMid + '] Set. Sending ' + sessionDescription.type + '.');
      self._trigger('handshakeProgress', sessionDescription.type, targetMid);
      self._sendMessage({
        type : sessionDescription.type,
        sdp : sessionDescription.sdp,
        mid : self._user.sid,
        agent : window.webrtcDetectedBrowser.browser,
        target : targetMid,
        rid : self._room.id
      });
    },
      function () {
      console.log('API - [' +
        targetMid + '] There was a problem setting the Local Description.');
    });
  };

  /**
   * This sets the STUN server specially for Firefox for ICE Connection
   *
   * @method _setFirefoxIceServers
   * @private
   * @param {JSON} config
   */
  Skyway.prototype._setFirefoxIceServers = function (config) {
    if (window.webrtcDetectedBrowser.mozWebRTC) {
      // NOTE ALEX: shoul dbe given by the server
      var newIceServers = [{
          'url' : 'stun:stun.services.mozilla.com'
        }
      ];
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
   *
   * @method _waitForMediaStream
   * @private
   * @param {Function} callback
   */
  Skyway.prototype._waitForMediaStream = function (callback, options) {
    var self = this;
    if (!options) {
      callback();
      return;
    }
    self.getDefaultStream(options);
    console.log('API - requireVideo: ' + options.video);
    console.log('API - requireAudio: ' + options.audio);
    // Loop for stream
    var checkForStream = setInterval(function () {
      if (self._user.streams.length > 0) {
        for (var i = 0; i < self._user.streams.length; i++) {
          var audioTracks = self._user.streams[i].getAudioTracks();
          var videoTracks = self._user.streams[i].getVideoTracks();
          if (((options.video) ? (videoTracks.length > 0)
            : true) && ((options.audio) ? (audioTracks.length > 0)
            : true)) {
            clearInterval(checkForStream);
            callback();
            break;
          }
        }
      }
    }, 2000);
  };

  /**
   * Create a peerconnection to communicate with the peer whose ID is 'targetMid'.
   * All the peerconnection callbacks are set up here. This is a quite central piece.
   *
   * @method _createPeerConnection
   * @return the created peer connection.
   * @private
   * @param {String} targetMid
   */
  Skyway.prototype._createPeerConnection = function (targetMid) {
    var pc;
    try {
      pc = new window.RTCPeerConnection(
          this._room.pcHelper.pcConfig,
          this._room.pcHelper.pcConstraints);
      console.log(
        'API - [' + targetMid + '] Created PeerConnection.');
      console.log(
        'API - [' + targetMid + '] PC config: ');
      console.dir(this._room.pcHelper.pcConfig);
      console.log(
        'API - [' + targetMid + '] PC constraints: ' +
        JSON.stringify(this._room.pcHelper.pcConstraints));
    } catch (e) {
      console.log('API - [' + targetMid + '] Failed to create PeerConnection: ' + e.message);
      return null;
    }

    // callbacks
    // standard not implemented: onnegotiationneeded,
    var self = this;
    pc.ondatachannel = function (event) {
      var dc = event.channel || event;
      console.log('API - [' + targetMid + '] Received DataChannel -> ' +
        dc.label);
      self._createDataChannel(targetMid, function (dc){
        self._dataChannels[targetMid] = dc;
        self._dataChannelPeers[dc.label] = targetMid;
        self._checkDataChannelStatus(dc);
      }, dc);
    };
    pc.onaddstream = function (event) {
      self._onRemoteStreamAdded(targetMid, event);
    };
    pc.onicecandidate = function (event) {
      console.dir(event);
      self._onIceCandidate(targetMid, event);
    };
    pc.oniceconnectionstatechange = function () {
      checkIceConnectionState(targetMid, pc.iceConnectionState, function (iceConnectionState) {
        console.log('API - [' + targetMid + '] ICE connection state changed -> ' +
          iceConnectionState);
        self._trigger('iceConnectionState', iceConnectionState, targetMid);
      });
    };
    // pc.onremovestream = onRemoteStreamRemoved;
    pc.onsignalingstatechange = function () {
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
    pc.onicegatheringstatechange = function () {
      console.log('API - [' + targetMid + '] ICE gathering state changed -> ' +
        pc.iceGatheringState);
      self._trigger('candidateGenerationState', pc.iceGatheringState, targetMid);
    };
    return pc;
  };

  /**
   * A candidate has just been generated (ICE gathering) and will be sent to the peer.
   * Part of connection establishment.
   *
   * @method _onIceCandidate
   * @private
   * @param {String} targetMid
   * @param {Event}  event      This is provided directly by the peerconnection API.
   */
  Skyway.prototype._onIceCandidate = function (targetMid, event) {
    if (event.candidate) {
      var msgCan = event.candidate.candidate.split(' ');
      var candidateType = msgCan[7];
      console.log('API - [' + targetMid + '] Created and sending ' +
        candidateType + ' candidate.');
      this._sendMessage({
        type : 'candidate',
        label : event.candidate.sdpMLineIndex,
        id : event.candidate.sdpMid,
        candidate : event.candidate.candidate,
        mid : this._user.sid,
        target : targetMid,
        rid : this._room.id
      });
    } else {
      console.log('API - [' + targetMid + '] End of gathering.');
      this._trigger('candidateGenerationState', this.CANDIDATE_GENERATION_STATE.DONE, targetMid);
    }
  };

  /**
   * Handling reception of a candidate. handshake done, connection ongoing.
   *
   * @method _candidateHandler
   * @private
   * @param {JSON} msg
   */
  Skyway.prototype._candidateHandler = function (msg) {
    var targetMid = msg.mid;
    var pc = this._peerConnections[targetMid];
    if (pc) {
      if (pc.iceConnectionState === this.ICE_CONNECTION_STATE.CONNECTED) {
        console.log('API - [' + targetMid + '] Received but not adding Candidate ' +
          'as we are already connected to this peer.');
        return;
      }
      var msgCan = msg.candidate.split(' ');
      var canType = msgCan[7];
      console.log('API - [' + targetMid + '] Received ' + canType + ' Candidate.');
      // if (canType !== 'relay' && canType !== 'srflx') {
      // trace('Skipping non relay and non srflx candidates.');
      var index = msg.label;
      var candidate = new window.RTCIceCandidate({
          sdpMLineIndex : index,
          candidate : msg.candidate
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
   *
   * @method _answerHandler
   * @private
   * @param {JSON} msg
   */
  Skyway.prototype._answerHandler = function (msg) {
    var targetMid = msg.mid;
    this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.ANSWER, targetMid);
    var answer = new window.RTCSessionDescription(msg);
    console.log('API - [' + targetMid + '] Received answer:');
    console.dir(answer);
    var pc = this._peerConnections[targetMid];
    pc.setRemoteDescription(new RTCSessionDescription(answer), function () {
      pc.remotePeerReady = true;
    }, function (err) {
      console.error(err);
    });
  };

  /**
   * Send a message to the signaling server
   *
   * @method _sendMessage
   * @private
   * @param {JSON} message
   */
  Skyway.prototype._sendMessage = function (message) {
    if (!this._channel_open) {
      return;
    }
    var msgString = JSON.stringify(message);
    console.log('API - [' + (message.target ? message.target : 'server') +
      '] Outgoing message: ' + message.type);
    this._socket.send(msgString);
  };

  /**
   * @method _openChannel
   * @private
   */
  Skyway.prototype._openChannel = function () {
    var self = this;
    var _openChannelImpl = function (readyState) {
      if (readyState !== 2) {
        return;
      }
      self.off('readyStateChange', _openChannelImpl);
      console.log('API - Opening channel.');
      var ip_signaling =
        'ws://' + self._room.signalingServer.ip + ':' + self._room.signalingServer.port;

      console.log('API - Signaling server URL: ' + ip_signaling);

      if (self._socketVersion >= 1) {
        self._socket = io.connect(ip_signaling, {
          forceNew : true
        });
      } else {
        self._socket = window.io.connect(ip_signaling, {
          'force new connection' : true
        });
      }

      self._socket = window.io.connect(ip_signaling, {
          'force new connection' : true
        });
      self._socket.on('connect', function () {
        self._channel_open = true;
        self._trigger('channelOpen');
      });
      self._socket.on('error', function (err) {
        console.log('API - Channel Error: ' + err);
        self._channel_open = false;
        self._trigger('channelError', err);
      });
      self._socket.on('disconnect', function () {
        self._trigger('channelClose');
      });
      self._socket.on('message', function (msg) {
        self._processSigMsg(msg);
      });
    };

    if (this._channel_open) {
      return;
    }
    if (this._readyState === 0) {
      this.on('readyStateChange', _openChannelImpl);
      this._loadInfo(this);
    } else {
      _openChannelImpl(2);
    }

  };

  /**
   * @method _closeChannel
   * @private
   */
  Skyway.prototype._closeChannel = function () {
    if (!this._channel_open) {
      return;
    }
    this._socket.disconnect();
    this._socket = null;
    this._channel_open = false;
    this._readyState = 0; // this forces a reinit
  };

  /**
   * Create a DataChannel. Only SCTPDataChannel support
   *
   * @method _createDataChannel
   * @private
   * @param {String} peerID - The PeerID of which the dataChannel is connected to
   * @param {Function} callback
   * @param {RTCDataChannel} dc - The DataChannel object passed inside
   */
  Skyway.prototype._createDataChannel = function (peerID, callback, dc) {
    var self = this;
    var pc = self._peerConnections[peerID];
    var channel_name = self._user.id + '_' + peerID;

    if (!dc) {
      if (!webrtcDetectedBrowser.isSCTPDCSupported && !webrtcDetectedBrowser.isPluginSupported) {
        console.warn('API - DataChannel [' + peerID + ']: Does not support SCTP');
      }
      dc = pc.createDataChannel(channel_name);
    } else {
      channel_name = dc.label;
    }
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.NEW, peerID);
    console.log(
      'API - DataChannel [' + peerID + ']: Binary type support is "' + dc.binaryType + '"');

    dc.onerror = function (err) {
      console.error('API - DataChannel [' + peerID + ']: Failed retrieveing DataChannel.');
      console.exception(err);
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerID);
    };
    dc.onclose = function () {
      console.log('API - DataChannel [' + peerID + ']: DataChannel closed.');
      self._closeDataChannel(peerID, self);
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerID);
    };
    dc.onopen = function () {
      dc.push = dc.send;
      dc.send = function (data) {
        console.log('API - DataChannel [' + peerID + ']: DataChannel is opened.');
        console.log('API - DataChannel [' + peerID + ']: Length : ' + data.length);
        dc.push(data);
      };
    };
    dc.onmessage = function (event) {
      console.log('API - DataChannel [' + peerID + ']: DataChannel message received');
      self._dataChannelHandler(event.data, peerID, self);
    };
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.LOADED, peerID);
    callback(dc);
  };

  /**
   * Check DataChannel ReadyState. If ready, it sends a 'CONN'
   *
   * @method _checkDataChannelStatus
   * @private
   * @param {DataChannel} dc
   */
  Skyway.prototype._checkDataChannelStatus = function (dc) {
    var self = this;
    setTimeout(function () {
      console.log('API - DataChannel [' + dc.label +
        ']: Connection Status - ' + dc.readyState);
      var peerID = self._dataChannelPeers[dc.label];
      self._trigger('dataChannelState', dc.readyState, peerID);

      if (dc.readyState === self.DATA_CHANNEL_STATE.OPEN) {
        self._sendDataChannel(peerID, ['CONN', dc.label]);
      }
    }, 500);
  };

  /**
   * Sending of String Data over the DataChannels
   *
   * @method _sendDataChannel
   * @private
   * @param {String} peerID
   * @param {JSON} data
   */
  Skyway.prototype._sendDataChannel = function (peerID, data) {
    var dc = this._dataChannels[peerID];
    if (!dc) {
      console.error('API - DataChannel [' + peerID + ']: No available existing DataChannel');
      return;
    } else {
      if (dc.readyState === this.DATA_CHANNEL_STATE.OPEN) {
        console.log('API - DataChannel [' + peerID + ']: Sending Data from DataChannel');
        try {
          var dataString = '';
          for (var i = 0; i < data.length; i++) {
            dataString += data[i];
            dataString += (i !== (data.length - 1)) ? '|' : '';
          }
          dc.send(dataString);
        } catch (err) {
          console.error('API - DataChannel [' + peerID + ']: Failed executing send on DataChannel');
          console.exception(err);
        }
      } else {
        console.error('API - DataChannel [' + peerID +
          ']: DataChannel is "' + dc.readyState + '"');
      }
    }
  };

  /**
   * To obtain the Peer that it's connected to from the DataChannel
   *
   * @method _dataChannelPeer
   * @private
   * @param {String} channel
   * @param {Skyway} self
   */
  Skyway.prototype._dataChannelPeer = function (channel, self) {
    return self._dataChannelPeers[channel];
  };

  /**
   * To obtain the Peer that it's connected to from the DataChannel
   *
   * @method _closeDataChannel
   * @private
   * @param {String} peerID
   */
  Skyway.prototype._closeDataChannel = function (peerID, self) {
    var dc = self._dataChannels[peerID];
    if (dc) {
      if (dc.readyState !== self.DATA_CHANNEL_STATE.CLOSED) {
        dc.close();
      }
      delete self._dataChannels[peerID];
      delete self._dataChannelPeers[dc.label];
    }
  };

  /**
   * The Handler for all DataChannel Protocol events
   * @method _dataChannelHandler
   * @private
   * @param {String} data
   */
  Skyway.prototype._dataChannelHandler = function (dataString, peerID, self) {
    // PROTOCOL ESTABLISHMENT
    console.dir(dataString);
    if (typeof dataString === 'string') {
      if (dataString.indexOf('|') > -1 && dataString.indexOf('|') < 6) {
        var data = dataString.split('|');
        var state = data[0];
        console.log('API - DataChannel [' + peerID + ']: Received "' + state + '"');

        switch(state) {
        case 'CONN':
          // CONN - DataChannel Connection has been established
          self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.OPEN, peerID);
          break;
        case 'WRQ':
          // WRQ - Send File Request Received. For receiver to accept or not
          self._dataChannelWRQHandler(peerID, data, self);
          break;
        case 'ACK':
          // ACK - If accepted, send. Else abort
          self._dataChannelACKHandler(peerID, data, self);
          break;
        case 'ERROR':
          // ERROR - Failure in receiving data. Could be timeout
          console.log('API - Received ERROR');
          self._dataChannelERRORHandler(peerID, data, self);
          break;
        default:
          console.log('API - DataChannel [' + peerID + ']: Invalid command');
        }
      } else {
        // DATA - BinaryString base64 received
        console.log('API - DataChannel [' + peerID + ']: Received "DATA"');
        self._dataChannelDATAHandler(peerID, dataString,
          self.DATA_TRANSFER_DATA_TYPE.BINARYSTRING, self
        );
      }
    }
  };

  /**
   * DataChannel TFTP Protocol Stage: WRQ
   * The sender has sent a request to send file
   * From here, it's up to the user to accept or reject it
   *
   * @method _dataChannelWRQHandler
   * @private
   * @param {String} peerID
   * @param {Array} data
   * @param {Skyway} self
   */
  Skyway.prototype._dataChannelWRQHandler = function (peerID, data, self) {
    var itemID = this._user.sid + this.DATA_TRANSFER_TYPE.DOWNLOAD +
      (((new Date()).toISOString().replace(/-/g, '').replace(/:/g, ''))).replace('.', '');
    var name = data[2];
    var binarySize = parseInt(data[3], 10);
    var expectedSize = parseInt(data[4], 10);
    var timeout = parseInt(data[5], 10);

    if (confirm('Do you want to receive "' + name + '" ?')) {
      self._downloadDataTransfers[peerID] = [];
      self._downloadDataSessions[peerID] = {
        itemID: itemID,
        name: name,
        size: binarySize,
        ackN: 0,
        receivedSize: 0,
        chunkSize: expectedSize,
        timeout: timeout
      };
      self._sendDataChannel(peerID, ['ACK', 0, window.webrtcDetectedBrowser.browser]);
      var transferInfo = {
        name : name,
        size : binarySize,
        senderID : peerID
      };
      this._trigger('dataTransferState',
        this.DATA_TRANSFER_STATE.DOWNLOAD_STARTED, itemID, peerID, transferInfo);
    } else {
      self._sendDataChannel(peerID, ['ACK', -1]);
    }
  };

  /**
   * DataChannel TFTP Protocol Stage: ACK
   * The user sends a ACK of the request [accept/reject/the current
   * index of chunk to be sent over]
   *
   * @method _dataChannelACKHandler
   * @private
   * @param {String} peerID
   * @param {Array} data
   * @param {Skyway} self
   */
  Skyway.prototype._dataChannelACKHandler = function (peerID, data, self) {
    self._clearDataChannelTimeout(peerID, true, self);

    var ackN = parseInt(data[1], 10);
    var chunksLength = self._uploadDataTransfers[peerID].length;
    var uploadedDetails = self._uploadDataSessions[peerID];
    var itemID = uploadedDetails.itemID;
    var timeout = uploadedDetails.timeout;
    var transferInfo = {};

    console.log('API - DataChannel Received "ACK": ' + ackN + ' / ' + chunksLength);

    if (ackN > -1) {
      // Still uploading
      if (ackN < chunksLength) {
        var fileReader = new FileReader();
        fileReader.onload = function () {
          // Load Blob as dataurl base64 string
          var base64BinaryString = fileReader.result.split(',')[1];
          self._sendDataChannel(peerID, [base64BinaryString]);
          self._setDataChannelTimeout(peerID, timeout, true, self);
          transferInfo = {
            percentage : (((ackN+1) / chunksLength) * 100).toFixed()
          };
          self._trigger('dataTransferState',
            self.DATA_TRANSFER_STATE.UPLOADING, itemID, peerID, transferInfo);
        };
        fileReader.readAsDataURL(self._uploadDataTransfers[peerID][ackN]);
      } else if (ackN === chunksLength) {
        transferInfo = {
          name : uploadedDetails.name
        };
        self._trigger('dataTransferState',
          self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED, itemID, peerID, transferInfo);
        delete self._uploadDataTransfers[peerID];
        delete self._uploadDataSessions[peerID];
      }
    } else {
      self._trigger('dataTransferState',
        self.DATA_TRANSFER_STATE.REJECTED, itemID, peerID);
      delete self._uploadDataTransfers[peerID];
      delete self._uploadDataSessions[peerID];
    }
  };

  /**
   * DataChannel TFTP Protocol Stage: ERROR
   * The user received an error, usually an exceeded timeout.
   *
   * @method _dataChannelERRORHandler
   * @private
   * @param {String} peerID
   * @param {Array} data
   * @param {Skyway} self
   */
  Skyway.prototype._dataChannelERRORHandler = function (peerID, data, self) {
    var isUploader = data[2];
    var itemID = (isUploader) ? self._uploadDataSessions[peerID].itemID :
      self._downloadDataSessions[peerID].itemID;
    var transferInfo = {
      message : data[1],
      type : ((isUploader) ? self.DATA_TRANSFER_TYPE.UPLOAD :
        self.DATA_TRANSFER_TYPE.DOWNLOAD)
    };
    self._clearDataChannelTimeout(peerID, isUploader, self);
    self._trigger('dataTransferState',
      self.DATA_TRANSFER_STATE.ERROR, itemID, peerID, transferInfo);
  };

  /**
   * DataChannel TFTP Protocol Stage: DATA
   * This is when the data is sent from the sender to the receiving user
   *
   * @method _dataChannelDATAHandler
   * @private
   * @param {String} peerID
   * @param {BinaryString/ArrayBuffer/Blob} dataString
   * @param {String} dataType
   * @param {Skyway} self
   */
  Skyway.prototype._dataChannelDATAHandler = function (peerID, dataString, dataType, self) {
    var chunk, transferInfo = {};
    self._clearDataChannelTimeout(peerID, false, self);
    var transferStatus = self._downloadDataSessions[peerID];
    var itemID = transferStatus.itemID;

    if(dataType === self.DATA_TRANSFER_DATA_TYPE.BINARYSTRING) {
      chunk = self._base64ToBlob(dataString);
    } else if(dataType === self.DATA_TRANSFER_DATA_TYPE.ARRAYBUFFER) {
      chunk = new Blob(dataString);
    } else if(dataType === self.DATA_TRANSFER_DATA_TYPE.BLOB) {
      chunk = dataString;
    } else {
      transferInfo = {
        message : 'Unhandled data exception: ' + dataType,
        type : self.DATA_TRANSFER_TYPE.DOWNLOAD
      };
      console.error('API - ' + transferInfo.message);
      self._trigger('dataTransferState',
        self.DATA_TRANSFER_STATE.ERROR, itemID, peerID, transferInfo);
      return;
    }
    var receivedSize = (chunk.size * (4/3));
    console.log('API - DataChannel [' + peerID + ']: Chunk size: ' + chunk.size);

    if (transferStatus.chunkSize >= receivedSize) {
      self._downloadDataTransfers[peerID].push(chunk);
      transferStatus.ackN += 1;
      transferStatus.receivedSize += receivedSize;
      var totalReceivedSize = transferStatus.receivedSize;
      var percentage = ((totalReceivedSize / transferStatus.size) * 100).toFixed();

      self._sendDataChannel(peerID, ['ACK',
        transferStatus.ackN, self._user.sid
      ]);

      if (transferStatus.chunkSize === receivedSize) {
        transferInfo = {
          percentage : percentage
        };
        self._trigger('dataTransferState',
          self.DATA_TRANSFER_STATE.DOWNLOADING, itemID, peerID, transferInfo);
        self._setDataChannelTimeout(peerID, transferStatus.timeout, false, self);
        self._downloadDataTransfers[peerID].info = transferStatus;
      } else {
        var blob = new Blob(self._downloadDataTransfers[peerID]);
        transferInfo = {
          data : URL.createObjectURL(blob)
        };
        self._trigger('dataTransferState',
          self.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED, itemID, peerID, transferInfo);
        delete self._downloadDataTransfers[peerID];
        delete self._downloadDataSessions[peerID];
      }
    } else {
      transferInfo = {
        message : 'Packet not match - [Received]' +
          receivedSize + ' / [Expected]' + transferStatus.chunkSize,
        type : self.DATA_TRANSFER_TYPE.DOWNLOAD
      };
      self._trigger('dataTransferState',
        self.DATA_TRANSFER_STATE.ERROR, itemID, peerID, transferInfo);
      console.error('API - DataChannel [' + peerID + ']: ' + transferInfo.message);
    }
  };

  /**
   * Set the DataChannel timeout. If exceeded, send the 'ERROR' message
   *
   * @method _setDataChannelTimeout
   * @private
   * @param {String} peerID
   * @param {Integer} timeout - no of seconds to timeout
   * @param {Boolean} isSender
   * @param {Skyway} self
   */
  Skyway.prototype._setDataChannelTimeout = function(peerID, timeout, isSender, self) {
    if (!self._dataTransfersTimeout[peerID]) {
      self._dataTransfersTimeout[peerID] = {};
    }
    var type = (isSender) ? self.DATA_TRANSFER_TYPE.UPLOAD :
      self.DATA_TRANSFER_TYPE.DOWNLOAD;
    self._dataTransfersTimeout[peerID][type] = setTimeout(function () {
      if (self._dataTransfersTimeout[peerID][type]) {
        if (isSender) {
          delete self._uploadDataTransfers[peerID];
          delete self._uploadDataSessions[peerID];
        } else {
          delete self._downloadDataTransfers[peerID];
          delete self._downloadDataSessions[peerID];
        }
        self._sendDataChannel(peerID, ['ERROR',
          'Connection Timeout. Longer than ' + timeout + ' seconds. Connection is abolished.',
          isSender
        ]);
        self._clearDataChannelTimeout(peerID, isSender, self);
      }
    }, 1000 * timeout);
  };

  /**
   * Clear the DataChannel timeout as a response is received
   * NOTE: Leticia - I keep getting repeated Timeout alerts. Anyway to stop this?
   *
   * @method _clearDataChannelTimeout
   * @private
   * @param {String} peerID
   * @param {Boolean} isSender
   * @param {Skyway} self
   */
  Skyway.prototype._clearDataChannelTimeout = function(peerID, isSender, self) {
    if (self._dataTransfersTimeout[peerID]) {
      var type = (isSender) ? self.DATA_TRANSFER_TYPE.UPLOAD :
        self.DATA_TRANSFER_TYPE.DOWNLOAD;
      clearTimeout(self._dataTransfersTimeout[peerID][type]);
      delete self._dataTransfersTimeout[peerID][type];
    }
  };

  /**
   * Convert base64 to raw binary data held in a string.
   * Doesn't handle URLEncoded DataURIs
   * - see SO answer #6850276 for code that does this
   * This is to convert the base64 binary string to a blob
   *
   * @author Code from devnull69 @ stackoverflow.com
   * @method _base64ToBlob
   * @private
   * @param {String} dataURL
   */
  Skyway.prototype._base64ToBlob = function (dataURL) {
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
   * To chunk the File (which already is a blob) into smaller blob files.
   * For now please send files below or around 2KB till chunking is implemented
   *
   * @method _chunkFile
   * @private
   * @param {Blob} blob
   * @param {Int} blobByteSize
   */
  Skyway.prototype._chunkFile = function (blob, blobByteSize) {
    var chunksArray = [], startCount = 0, endCount = 0;
    if(blobByteSize > this._chunkFileSize) {
      // File Size greater than Chunk size
      while((blobByteSize - 1) > endCount) {
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
   * Method to send Blob data to peers
   *
   * @method sendBlobData
   * @protected
   * @param {Blob} data - The Blob data to be sent over
   * @param {JSON} dataInfo - The Blob data information
   * @param {String} dataInfo.name Name of the Blob Data. Could be filename
   * @param {String} dataInfo.size Size of the Blob Data.
   * @param {String} dataInfo.timeout Timeout used for receiving response in seconds.
   *  Default is 60 seconds.
   */
  Skyway.prototype.sendBlobData = function(data, dataInfo) {
    if (!data && !dataInfo) {
      return false;
    }
    var noOfPeersSent = 0;
    var timeout = dataInfo.timeout || 60;
    var itemID = this._user.sid + this.DATA_TRANSFER_TYPE.UPLOAD +
      (((new Date()).toISOString().replace(/-/g, '').replace(/:/g, ''))).replace('.', '');
    var transferInfo = {};

    for (var peerID in this._dataChannels) {
      if (this._dataChannels.hasOwnProperty(peerID)) {
        // Binary String filesize [Formula n = 4/3]
        var binarySize = (dataInfo.size * (4/3)).toFixed();
        var chunkSize = (this._chunkFileSize * (4/3)).toFixed();
        if (window.webrtcDetectedBrowser.browser === 'Firefox' &&
          window.webrtcDetectedBrowser.version < 30) {
          chunkSize = this._mozChunkFileSize;
        }
        this._uploadDataTransfers[peerID] = this._chunkFile(data, dataInfo.size);
        this._uploadDataSessions[peerID] = {
          name: dataInfo.name,
          size: binarySize,
          itemID: itemID,
          timeout: timeout
        };

        this._sendDataChannel(peerID, ['WRQ',
          window.webrtcDetectedBrowser.browser,
          dataInfo.name, binarySize, chunkSize, timeout
        ]);
        noOfPeersSent++;
        this._setDataChannelTimeout(peerID, timeout, true, this);
      } else {
        console.log('API - DataChannel [' + peerID + '] does not exists' );
      }
    }
    if (noOfPeersSent > 0) {
      transferInfo = {
        itemID : itemID,
        senderID : this._user.sid,
        name : dataInfo.name,
        size : dataInfo.size,
        data : URL.createObjectURL(data)
      };
      this._trigger('dataTransferState',
        this.DATA_TRANSFER_STATE.UPLOAD_STARTED, itemID, peerID, transferInfo);
    } else {
      transferInfo = {
        message : 'No available DataChannels to send Blob data',
        type : this.DATA_TRANSFER_TYPE.UPLOAD
      };
      this._trigger('dataTransferState',
        this.DATA_TRANSFER_STATE.ERROR, itemID, peerID, transferInfo);
      console.log('API - ' + transferInfo.message);
      this._uploadDataTransfers = {};
      this._uploadDataSessions = {};
    }
  };

  /**
   * TODO
   * @method toggleLock
   * @protected
   */
  Skyway.prototype.toggleLock = function () {
    /* TODO */
  };

  /**
   * TODO
   * @method toggleAudio
   * @protected
   */
  Skyway.prototype.toggleAudio = function (audioMute) {
    /* TODO */
  };

  /**
   * TODO
   * @method toggleVideo
   * @protected
   */
  Skyway.prototype.toggleVideo = function (videoMute) {
    /* TODO */
  };

  /**
   * @method joinRoom
   * @param {JSON} options
   *   @key {Boolean} audio This call requires audio
   *   @key {Boolean} video This call requires video
   */
  Skyway.prototype.joinRoom = function (options) {
    if (this._in_room) {
      return;
    }
    var self = this;
    self._waitForMediaStream(function () {
      var _sendJoinRoomMsg = function () {
        self.off('channelOpen', _sendJoinRoomMsg);
        console.log('API - Joining room: ' + self._room.id);
        self._sendMessage({
          type : 'joinRoom',
          uid : self._user.id,
          cid : self._key,
          rid : self._room.id,
          userCred : self._user.token,
          timeStamp : self._user.timeStamp,
          apiOwner : self._user.apiOwner,
          roomCred : self._room.token,
          start : self._room.start,
          len : self._room.len
        });
        self._user.peer = self._createPeerConnection(self._user.id);
      };
      if (!self._channel_open) {
        self.on('channelOpen', _sendJoinRoomMsg);
        self._openChannel();
      } else {
        _sendJoinRoomMsg();
      }
    }, options);
  };

  /**
   * @method leaveRoom
   */
  Skyway.prototype.leaveRoom = function () {
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
  };
}).call(this);
