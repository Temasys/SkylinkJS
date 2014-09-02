/*! skywayjs - v0.4.2 - 2014-09-02 */

(function() {
  /**
   * Please check on the {{#crossLink "Skyway/init:method"}}init(){{/crossLink}}
   * function on how you can initialize Skyway. Note that:
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
    this.VERSION = '0.4.2';
    /**
     * The list of available regional servers.
     * - This is for developers to set the nearest region server
     *   for Skyway to connect to for faster connectivity.
     * - The available regional servers are:
     * @attribute REGIONAL_SERVER
     * @type JSON
     * @param {String} US1 USA server 1.
     * @param {String} US2 USA server 2.
     * @param {String} SG Singapore server.
     * @param {String} EU Europe server.
     * @readOnly
     * @since 0.5.0
     */
    this.REGIONAL_SERVER = {
      US1: 'us1',
      US2: 'us2',
      SG: 'sg',
      EU: 'eu'
    };
    /**
     * The list of ICE connection states.
     * - Check out the [w3 specification documentation](http://dev.w3.org/2011/
     *   webrtc/editor/webrtc.html#rtciceconnectionstate-enum).
     * - This is the RTCIceConnection state of the peer.
     * - The states that would occur are:
     * @attribute ICE_CONNECTION_STATE
     * @type JSON
     * @param {String} STARTING The ICE agent is gathering addresses
     *   and/or waiting for remote candidates to be supplied.
     * @param {String} CHECKING The ICE agent has received remote candidates
     *   on at least one component, and is checking candidate pairs but has
     *   not yet found a connection. In addition to checking, it may also
     *   still be gathering.
     * @param {String} CONNECTED The ICE agent has found a usable connection
     *   for all components but is still checking other candidate pairs to see
     *   if there is a better connection. It may also still be gathering.
     * @param {String} COMPLETED The ICE agent has finished gathering and
     *   checking and found a connection for all components.
     * @param {String} FAILED The ICE agent is finished checking all
     *   candidate pairs and failed to find a connection for at least one
     *   component.
     * @param {String} DISCONNECTED Liveness checks have failed for one or
     *   more components. This is more aggressive than "failed", and may
     *   trigger intermittently (and resolve itself without action) on
     *   a flaky network.
     * @param {String} CLOSED The ICE agent has shut down and is no
     *   longer responding to STUN requests.
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
     * The list of peer connection states.
     * - Check out the [w3 specification documentation](http://dev.w3.org/2011/
     *   webrtc/editor/webrtc.html#rtcpeerstate-enum).
     * - This is the RTCSignalingState of the peer.
     * - The states that would occur are:
     * @attribute PEER_CONNECTION_STATE
     * @type JSON
     * @param {String} STABLE There is no offer/answer exchange in progress.
     *   This is also the initial state in which case the local and remote
     *   descriptions are empty.
     * @param {String} HAVE_LOCAL_OFFER A local description, of type "offer",
     *   has been successfully applied.
     * @param {String} HAVE_REMOTE_OFFER A remote description, of type "offer",
     *   has been successfully applied.
     * @param {String} HAVE_LOCAL_PRANSWER A remote description of type "offer"
     *   has been successfully applied and a local description of type "pranswer"
     *   has been successfully applied.
     * @param {String} HAVE_REMOTE_PRANSWER "Answer" remote description is applied.
     * @param {String} ESTABLISHED A local description of type "offer" has
     *   been successfully applied and a remote description of type "pranswer"
     *   has been successfully applied.
     * @param {String} CLOSED The connection is closed.
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
     * The list of ICE candidate generation states.
     * - Check out the [w3 specification documentation](http://dev.w3.org/2011/
     *   webrtc/editor/webrtc.html#rtcicegatheringstate-enum).
     * - This is RTCIceGatheringState of the peer.
     * - The states that would occur are:
     * @attribute CANDIDATE_GENERATION_STATE
     * @type JSON
     * @param {String} NEW The object was just created, and no networking
     *   has occurred yet.
     * @param {String} GATHERING The ICE engine is in the process of gathering
     *   candidates for this RTCPeerConnection.
     * @param {String} COMPLETED The ICE engine has completed gathering. Events
     *   such as adding a new interface or a new TURN server will cause the
     *   state to go back to gathering.
     * @readOnly
     * @since 0.4.1
     */
    this.CANDIDATE_GENERATION_STATE = {
      NEW: 'new',
      GATHERING: 'gathering',
      COMPLETED: 'completed'
    };
    /**
     * The list of handshake progress steps.
     * - This are the list of steps for the Skyway peer connection.
     * - The steps that would occur are:
     * @type JSON
     * @attribute HANDSHAKE_PROGRESS
     * @param {String} ENTER Step 1. Received "enter" from peer.
     * @param {String} WELCOME Step 2. Received "welcome" from peer.
     * @param {String} OFFER Step 3. Received "offer" from peer.
     * @param {String} ANSWER Step 4. Received "answer" from peer.
     * @param {String} ERROR Error state.
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
     * The list of datachannel states.
     * - Check out the [w3 specification documentation](http://dev.w3.org/2011/
     *   webrtc/editor/webrtc.html#idl-def-RTCDataChannelState).
     * - This is the RTCDataChannelState of the peer.
     * - <u>ERROR</u> is an additional implemented state by Skyway
     *   for further error tracking.
     * - The states that would occur are:
     * @attribute DATA_CHANNEL_STATE
     * @type JSON
     * @param {String} CONNECTING The user agent is attempting to establish
     *   the underlying data transport. This is the initial state of a
     *   RTCDataChannel object created with createDataChannel().
     * @param {String} OPEN The underlying data transport is established
     *   and communication is possible. This is the initial state of a
     *   RTCDataChannel object dispatched as a part of a RTCDataChannelEvent.
     * @param {String} CLOSING The procedure to close down the underlying
     *   data transport has started.
     * @param {String} CLOSED The underlying data transport has been closed
     *   or could not be established.
     * @param {String} ERROR Datachannel has occurred an error.
     * @readOnly
     * @since 0.1.0
     */
    this.DATA_CHANNEL_STATE = {
      CONNECTING: 'connecting',
      OPEN: 'open',
      CLOSING: 'closing',
      CLOSED: 'closed',
      ERROR: 'error'
    };
    /**
     * The list of signaling actions received.
     * - These are usually received from the signaling server to warn the user.
     * - The system action outcomes are:
     * @attribute SYSTEM_ACTION
     * @type JSON
     * @param {String} WARNING Server is warning user that the room is closing.
     * @param {String} REJECT Server has rejected user from room.
     * @param {String} CLOSED Server has closed the room.
     * @readOnly
     * @since 0.1.0
     */
    this.SYSTEM_ACTION = {
      WARNING: 'warning',
      REJECT: 'reject',
      CLOSED: 'close'
    };
    /**
     * The list of api server data retrieval state.
     * - These are the states to inform the state of retrieving the
     *   information from the api server required to start the peer
     *   connection or if the browser is eligible to start the peer connection.
     * - This is the first event that would fired, because Skyway would retrieve
     *   information from the api server that is required to start the connection.
     * - Once the state is <u>COMPLETED</u>, Skyway is ready to start the call.
     * - The states that would occur are:
     * @attribute READY_STATE_CHANGE
     * @type JSON
     * @param {Integer} INIT Skyway has just started. No information are
     *   retrieved yet.
     * @param {Integer} LOADING Skyway is starting the retrieval of the
     *   connection information.
     * @param {Integer} COMPLETED Skyway has completed retrieving the
     *   connection.
     * @param {Integer} ERROR Skyway has occurred an error when
     *   retrieving the connection information.
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
     * The list of ready state change errors.
     * - These are the error states from the error object error code.
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
     * The list of datachannel transfer types.
     * - This is used to identify if the stream is an upload stream or
     *   a download stream.
     * - The available types are:
     * @attribute DATA_TRANSFER_TYPE
     * @type JSON
     * @param {String} UPLOAD The datachannel transfer is an upload stream.
     * @param {String} DOWNLOAD The datachannel transfer is a download stream.
     * @readOnly
     * @since 0.1.0
     */
    this.DATA_TRANSFER_TYPE = {
      UPLOAD: 'upload',
      DOWNLOAD: 'download'
    };
    /**
     * The list of datachannel transfer state.
     * - These are the states to inform the state of the data transfer.
     * - The list of states would occur are:
     * @attribute DATA_TRANSFER_STATE
     * @type JSON
     * @param {String} UPLOAD_REQUEST Peer has a data transfer request.
     * @param {String} UPLOAD_STARTED Data transfer of upload has just started.
     * @param {String} DOWNLOAD_STARTED Data transfer of download has
     *   just started.
     * @param {String} UPLOADING Data upload transfer is occurring.
     * @param {String} DOWNLOADING Data download transfer is occurring.
     * @param {String} UPLOAD_COMPLETED Data upload transfer has been completed.
     * @param {String} DOWNLOAD_COMPLETED Data download transfer has been
     *   completed.
     * @param {String} REJECTED Peer rejected user's data transfer request.
     * @param {String} ERROR Data transfer had an error occurred
     *   when uploading or downloading file.
     * @readOnly
     * @since 0.4.0
     */
    this.DATA_TRANSFER_STATE = {
      UPLOAD_REQUEST: 'request',
      UPLOAD_STARTED: 'uploadStarted',
      DOWNLOAD_STARTED: 'downloadStarted',
      REJECTED: 'rejected',
      ERROR: 'error',
      UPLOADING: 'uploading',
      DOWNLOADING: 'downloading',
      UPLOAD_COMPLETED: 'uploadCompleted',
      DOWNLOAD_COMPLETED: 'downloadCompleted'
    };
    /**
     * The list of data transfer data types.
     * - <b><i>TODO</i></b>: ArrayBuffer and Blob data transfer in
     *   datachannel.
     * - The available data transfer data types are:
     * @attribute DATA_TRANSFER_DATA_TYPE
     * @type JSON
     * @param {String} BINARY_STRING BinaryString data type.
     * @param {String} ARRAY_BUFFER Still-implementing. ArrayBuffer data type.
     * @param {String} BLOB Still-implementing. Blob data type.
     * @readOnly
     * @since 0.1.0
     */
    this.DATA_TRANSFER_DATA_TYPE = {
      BINARY_STRING: 'binaryString',
      ARRAY_BUFFER: 'arrayBuffer',
      BLOB: 'blob'
    };
    /**
     * The list of signaling message types.
     * - These are the list of available signaling message types expected to
     *   be received.
     * - These message types are fixed.
     * - The available message types are:
     * @attribute SIG_TYPE
     * @type JSON
     * @readOnly
     * @param {String} JOIN_ROOM
     * - Send: User request to join the room.
     * @param {String} IN_ROOM
     * - Received: Response from server that user has joined the room.
     * @param {String} ENTER
     * - Send: Broadcast message to inform other connected peers in the room
     *   that the user is the new peer joining the room.
     * - Received: A peer has just joined the room.
     *   To send a welcome message.
     * @param {String} WELCOME
     * - Send: Respond to user to request peer to create the offer.
     * - Received: Response from peer that peer acknowledges the user has
     *   joined the room. To send and create an offer message.
     * @param {String} OFFER
     * - Send: Respond to peer's request to create an offer.
     * - Received: Response from peer's offer message. User to create and
     *   send an answer message.
     * @param {String} ANSWER
     * - Send: Response to peer's offer message.
     * - Received: Response from peer's answer message.
     *   Connection is established.
     * @param {String} CANDIDATE
     * - Send: User to send the ICE candidate after onicecandidate is called.
     * - Received: User to add peer's ice candidate in addIceCandidate.
     * @param {String} BYE
     * - Received: Peer has left the room.
     * @param {String} CHAT
     * - Send: Deprecated. User sends a chat message.
     * - Received: Deprecated. Peer sends a chat message to user.
     * @param {String} REDIRECT
     * - Received: Server warning to user.
     * @param {String} ERROR
     * - Received: Deprecated. Server error occurred.
     * @param {String} UPDATE_USER
     * - Send: User's custom data is updated and to inform other peers
     *   of updated custom data.
     * - Received: Peer's user custom data has changed.
     * @param {String} ROOM_LOCK
     * - Send: Room lock action has changed and to inform other peers
     *   of updated room lock status.
     * - Received: Room lock status has changed.
     * @param {String} MUTE_VIDEO
     * - Send: User has muted video and to inform other peers
     *   of updated muted video stream status.
     * - Received: Peer muted video status has changed.
     * @param {String} MUTE_AUDIO
     * - Send: User has muted audio and to inform other peers
     *   of updated muted audio stream status.
     * - Received: Peer muted audio status has changed.
     * @param {String} PUBLIC_MESSAGE
     * - Send: User sends a broadcast message to all peers.
     * - Received: User receives a peer's broadcast message.
     * @param {String} PRIVATE_MESSAGE
     * - Send: User sends a private message to a peer.
     * - Received: User receives a private message from a peer.
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
      REDIRECT: 'redirect',
      UPDATE_USER: 'updateUserEvent',
      ROOM_LOCK: 'roomLockEvent',
      MUTE_VIDEO: 'muteVideoEvent',
      MUTE_AUDIO: 'muteAudioEvent',
      PUBLIC_MESSAGE: 'public',
      PRIVATE_MESSAGE: 'private',
      GROUP: 'group'
    };
    /**
     * The list of actions for room lock application.
     * - This are the list of actions available for locking a room.
     * - The available actions are:
     * @attribute LOCK_ACTION
     * @type JSON
     * @param {String} LOCK Lock the room
     * @param {String} UNLOCK Unlock the room
     * @param {String} STATUS Get the status to check the room is locked
     *   or not.
     * @readOnly
     * @since 0.2.0
     */
    this.LOCK_ACTION = {
      LOCK: 'lock',
      UNLOCK: 'unlock',
      STATUS: 'check'
    };
    /**
     * The list of recommended video resolutions.
     * - Note that the higher the resolution, the connectivity speed might
     *   be affected.
     * - The available video resolutions type are:
     * @param {JSON} QVGA QVGA video resolution.
     * @param {Integer} QVGA.width 320
     * @param {Integer} QVGA.height 180
     * @param {JSON} VGA VGA video resolution.
     * @param {Integer} VGA.width 640
     * @param {Integer} VGA.height 360
     * @param {JSON} HD HD video quality
     * @param {Integer} HD.width 1280
     * @param {Integer} HD.height 720
     * @param {JSON} FHD Might not be supported. Full HD video resolution.
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
     * The path that user is currently connect to.
     * - NOTE ALEX: check if last char is '/'
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
     * The path that Skyway makes rest api calls to.
     * @attribute _serverPath
     * @type String
     * @final
     * @required
     * @private
     * @since 0.2.0
     */
    this._serverPath = '//api.temasys.com.sg';
    /**
     * The regional server that Skyway connects to.
     * @attribute _serverRegion
     * @type String
     * @private
     * @since 0.5.0
     */
    this._serverRegion = null;
    /**
     * The server that user connects to to make
     * api calls to.
     * - The reason why users can input this value is to give
     *   users the chance to connect to any of our beta servers
     *   if available instead of the stable version.
     * @attribute _roomServer
     * @type String
     * @private
     * @since 0.3.0
     */
    this._roomServer = null;
    /**
     * The API Key ID.
     * @attribute _apiKey
     * @type String
     * @private
     * @since 0.3.0
     */
    this._apiKey = null;
    /**
     * The default room that the user connects to if no room is provided in
     * {{#crossLink "Skyway/joinRoom:method"}}joinRoom(){{/crossLink}}.
     * @attribute _defaultRoom
     * @type String
     * @private
     * @since 0.3.0
     */
    this._defaultRoom = null;
    /**
     * The room that the user is currently connected to.
     * @attribute _selectedRoom
     * @type String
     * @default _defaultRoom
     * @private
     * @since 0.3.0
     */
    this._selectedRoom = null;
    /**
     * The static room's meeting starting date and time.
     * - The value is in ISO formatted string.
     * @attribute _roomStart
     * @type String
     * @private
     * @optional
     * @since 0.3.0
     */
    this._roomStart = null;
    /**
     * The static room's meeting duration.
     * @attribute _roomDuration
     * @type Integer
     * @private
     * @optional
     * @since 0.3.0
     */
    this._roomDuration = null;
    /**
     * The credentials required to set the start date and time
     * and the duration.
     * @attribute _roomCredentials
     * @type String
     * @private
     * @optional
     * @since 0.3.0
     */
    this._roomCredentials = null;
    /**
     * The received server key.
     * @attribute _key
     * @type String
     * @private
     * @since 0.1.0
     */
    this._key = null;
    /**
     * The actual socket object that handles the connection.
     * @attribute _socket
     * @type Object
     * @required
     * @private
     * @since 0.1.0
     */
    this._socket = null;
    /**
     * The version of the
     * {{#crossLink "Skyway/_socket:attribute"}}_socket{{/crossLink}}
     * object.
     * @attribute _socketVersion
     * @type Float
     * @private
     * @since 0.1.0
     */
    this._socketVersion = null;
    /**
     * User information, credential and the local stream(s).
     * @attribute _user
     * @type JSON
     * @param {String} id User's session id.
     * @param {String} sid User's secret id. This is the id used as the peerId.
     * @param {String} apiOwner Owner of the room.
     * @param {Array} streams The array of user's MediaStream(s).
     * @param {String} timestamp User's timestamp.
     * @param {String} token User access token.
     * @param {JSON} info Optional. User information object.
     * @param {JSON} info.settings User stream settings.
     * @param {Boolean|JSON} info.settings.audio User audio settings.
     * @param {Boolean} info.settings.audio.stereo User has enabled stereo
     *   or not.
     * @param {Boolean|JSON} info.settings.video User video settings.
     * @param {Bolean|JSON} info.settings.video.resolution User video
     *   resolution set. [Rel: Skyway.VIDEO_RESOLUTION]
     * @param {Integer} info.settings.video.resolution.width User video
     *   resolution width.
     * @param {Integer} info.settings.video.resolution.height User video
     *   resolution height.
     * @param {Integer} info.settings.video.frameRate User video minimum
     *   frame rate.
     * @param {JSON} info.mediaStatus User MediaStream(s) status.
     * @param {Boolean} info.mediaStatus.audioMuted Is user's audio muted.
     * @param {Boolean} info.mediaStatus.videoMuted Is user's vide muted.
     * @param {String|JSON} info.userData User's custom data set.
     * @required
     * @private
     * @since 0.3.0
     */
    this._user = null;
    /**
     * The room connection information.
     * @attribute _room
     * @type JSON
     * @param {JSON} room  Room information and credentials.
     * @param {String} room.id RoomId of the room user is connected to.
     * @param {String} room.token Token of the room user is connected to.
     * @param {String} room.tokenTimestamp Token timestamp of the room
     *   user is connected to.
     * @param {JSON} room.signalingServer The signaling server settings
     *   the room has to connect to.
     * @param {String} room.signalingServer.protocol The protocol the room
     *   has to use.
     * @param {String} room.signalingServer.ip The ip address of the
     *  signaling server the room has to connect to.
     * @param {String} room.signalingServer.port The port that the room
     &   has to connec to.
     * @param {JSON} room.pcHelper Holder for all the constraints objects used
     *   in a peerconnection lifetime. Some are initialized by default, some are initialized by
     *   internal methods, all can be overriden through updateUser. Future APIs will help user
     *   modifying specific parts (audio only, video only, ...) separately without knowing the
     *   intricacies of constraints.
     * @param {JSON} room.pcHelper.pcConstraints The peer connection constraints object.
     * @param {JSON} room.pcHelper.pcConfig Will be provided upon connection to a room
     * @param {JSON}  room.pcHelper.pcConfig.mandatory Mandantory options.
     * @param {Array} room.pcHelper.pcConfig.optional Optional options.
     * - Ex: [{DtlsSrtpKeyAgreement: true}]
     * @param {JSON} room.pcHelper.offerConstraints The offer constraints object.
     * @param {JSON} room.pcHelper.offerConstraints.mandatory Offer mandantory object.
     * - Ex: {MozDontOfferDataChannel:true}
     * @param {Array} room.pcHelper.offerConstraints.optional Offer optional object.
     * @param {JSON} room.pcHelper.sdpConstraints Sdp constraints object
     * @param {JSON} room.pcHelper.sdpConstraints.mandatory Sdp mandantory object.
     * - Ex: { 'OfferToReceiveAudio':true, 'OfferToReceiveVideo':true }
     * @param {Array} room.pcHelper.sdpConstraints.optional Sdp optional object.
     * @required
     * @private
     * @since 0.3.0
     */
    this._room = null;
    /**
     * Internal array of peer connections.
     * @attribute _peerConnections
     * @type Object
     * @required
     * @private
     * @since 0.1.0
     */
    this._peerConnections = [];
    /**
     * Internal array of peer informations.
     * @attribute _peerInformations
     * @type Object
     * @private
     * @required
     * @since 0.3.0
     */
    this._peerInformations = [];
    /**
     * Internal array of datachannels.
     * @attribute _dataChannels
     * @type Object
     * @private
     * @required
     * @since 0.2.0
     */
    this._dataChannels = [];
    /**
     * Internal array of data upload transfers.
     * @attribute _uploadDataTransfers
     * @type Array
     * @private
     * @required
     * @since 0.4.1
     */
    this._uploadDataTransfers = [];
    /**
     * Internal array of data upload sessions.
     * @attribute _uploadDataSessions
     * @type Array
     * @private
     * @required
     * @since 0.4.1
     */
    this._uploadDataSessions = [];
    /**
     * Internal array of data download transfers.
     * @attribute _downloadDataTransfers
     * @type Array
     * @private
     * @required
     * @since 0.4.1
     */
    this._downloadDataTransfers = [];
    /**
     * Internal array of data download sessions.
     * @attribute _downloadDataSessions
     * @type Array
     * @private
     * @required
     * @since 0.4.1
     */
    this._downloadDataSessions = [];
    /**
     * Internal array of data transfers timeout.
     * @attribute _dataTransfersTimeout
     * @type Array
     * @private
     * @required
     * @since 0.4.1
     */
    this._dataTransfersTimeout = [];
    /**
     * The current Skyway ready state change.
     * [Rel: Skyway.READY_STATE_CHANGE]
     * @attribute _readyState
     * @type Integer
     * @private
     * @required
     * @since 0.1.0
     */
    this._readyState = 0;
    /**
     * The current socket opened state.
     * @attribute _channel_open
     * @type Boolean
     * @private
     * @required
     * @since 0.1.0
     */
    this._channel_open = false;
    /**
     * The current state if room is locked.
     * @attribute _room_lock
     * @type Boolean
     * @private
     * @required
     * @since 0.4.0
     */
    this._room_lock = false;
    /**
     * The current state if user is in the room.
     * @attribute _in_room
     * @type Boolean
     * @private
     * @required
     * @since 0.1.0
     */
    this._in_room = false;
    /**
     * The fixed size for each data chunk.
     * @attribute _chunkFileSize
     * @type Integer
     * @private
     * @final
     * @required
     * @since 0.1.0
     */
    this._chunkFileSize = 49152;
    /**
     * The fixed for each data chunk for firefox implementation.
     * - Firefox the sender chunks 49152 but receives as 16384.
     * @attribute _mozChunkFileSize
     * @type Integer
     * @private
     * @final
     * @required
     * @since 0.2.0
     */
    this._mozChunkFileSize = 16384;
    /**
     * The current state if ICE trickle is enabled.
     * @attribute _enableIceTrickle
     * @type Boolean
     * @default true
     * @private
     * @required
     * @since 0.3.0
     */
    this._enableIceTrickle = true;
    /**
     * The current state if datachannel is enabled.
     * @attribute _enableDataChannel
     * @type Boolean
     * @default true
     * @private
     * @required
     * @since 0.3.0
     */
    this._enableDataChannel = true;
    /**
     * The user stream settings.
     * - By default, all is false.
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
     * Gets information from api server.
     * @method _requestServerInfo
     * @param {String} method The http method.
     * @param {String} url The url to do a rest call.
     * @param {Function} callback The callback fired after Skyway
     *   receives a response from the api server.
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
     * Parse the information received from the api server.
     * @method _parseInfo
     * @param {JSON} info The parsed information from the server.
     * @param {Skyway} self Skyway object.
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
     * Start the loading of information from the api server.
     * @method _loadInfo
     * @param {Skyway} self Skyway object.
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
   * To register a callback function to an event.
   * @method on
   * @param {String} eventName The Skyway event.
   * @param {Function} callback The callback fired after the event is triggered.
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
   * To unregister a callback function from an event.
   * @method off
   * @param {String} eventName The Skyway event.
   * @param {Function} callback The callback fired after the event is triggered.
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
   * Trigger all the callbacks associated with an event.
   * - Note that extra arguments can be passed to the callback which
   *   extra argument can be expected by callback is documented by each event.
   * @method _trigger
   * @param {String} eventName The Skyway event.
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
   * Intiailize Skyway to retrieve connection information.
   * - <b><i>IMPORTANT</i></b>: Please call this method to load all server
   *   information before joining the room or doing anything else.
   * - If you would like to set the start time and duration of the room,
   *   you have to generate the credentials. In example 3, we use the
   *    [CryptoJS](https://code.google.com/p/crypto-js/) library.
   *   - Step 1: Generate the hash. It is created by using the roomname,
   *     duration and the timestamp (in ISO String format).
   *   - Step 2: Generate the Credentials. It is is generated by converting
   *     the hash to a Base64 string and then encoding it to a URI string.
   *   - Step 3: Initialize Skyway
   * @method init
   * @param {String|JSON} options Connection options or API Key ID
   * @param {String} options.apiKey API Key ID to identify with the Temasys
   *   backend server
   * @param {String} options.defaultRoom Optional. The default room to connect
   *   to if there is no room provided in
   *   {{#crossLink "Skyway/joinRoom:method"}}joinRoom(){{/crossLink}}.
   * @param {String} options.roomServer Optional. Path to the Temasys
   *   backend server. If there's no room provided, default room would be used.
   * @param {String} options.region Optional. The regional server that user
   *   chooses to use. [Rel: Skyway.REGIONAL_SERVER]
   * @param {Boolean} options.iceTrickle Optional. The option to enable
   *   ICE trickle or not.
   * - Default is true.
   * @param {Boolean} options.dataChannel Optional. The option to enable
   *   datachannel or not.
   * - Default is true.
   * @param {JSON} options.credentials Optional. Credentials options for
   *   setting a static meeting.
   * @param {String} options.credentials.startDateTime The start timing of the
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
   *   var hash = CryptoJS.HmacSHA1(roomname + '_' + duration + '_' +
   *     (new Date()).toISOString(), token);
   *   var credentials = encodeURIComponent(hash.toString(CryptoJS.enc.Base64));
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
    var region;
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
    if (region) {
      this._path += ((this._path.indexOf('?&') > -1) ?
        '&' : '?&') + 'rg=' + region;
    }
    console.log('API - Path: ' + this._path);
    console.info('API - ICE Trickle: ' + ((typeof options.iceTrickle ===
      'boolean') ? options.iceTrickle : '[Default: true]'));
    this._loadInfo(this);
  };

  /**
   * Initialize Skyway to retrieve new connection information bbasd on options.
   * @method _reinit
   * @param {String|JSON} options Connection options or API Key ID
   * @param {String} options.apiKey API Key ID to identify with the Temasys
   *   backend server
   * @param {String} options.defaultRoom Optional. The default room to connect to
   *   if there is no room provided in
   *   {{#crossLink "Skyway/joinRoom:method"}}joinRoom(){{/crossLink}}.
   * @param {String} options.roomServer Optional. Path to the Temasys
   *   backend server. If there's no room provided, default room would be used.
   * @param {String} options.region Optional. The regional server that user
   *   chooses to use. [Rel: Skyway.REGIONAL_SERVER]
   * @param {Boolean} options.iceTrickle Optional. The option to enable
   *  ICE trickle or not.
   * - Default is true.
   * @param {Boolean} options.dataChannel Optional. The option to enable
   *   datachannel or not.
   * - Default is true.
   * @param {JSON} options.credentials Optional. Credentials options for
   *   setting a static meeting.
   * @param {String} options.credentials.startDateTime The start timing of the
   *   meeting in date ISO String
   * @param {Integer} options.credentials.duration The duration of the meeting
   * @param {String} options.credentials.credentials The credentials required
   *   to set the timing and duration of a meeting.
   * @param {Function} callback The callback fired once Skyway is re-initialized.
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
    if (region) {
      self._path += ((self._path.indexOf('?&') > -1) ?
        '&' : '?&') + 'rg=' + region;
    }
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
   * Updates the user custom data.
   * - Please note that the custom data would be overrided so please call
   *   {{#crossLink "Skyway/getUserData:method"}}getUserData(){{/crossLink}}
   *   and then modify the information you want individually.
   * - {{#crossLink "Skyway/peerUpdated:event"}}peerUpdated{{/crossLink}}
   *   only fires after <b>setUserData()</b> is fired.
   *   after the user joins the room.
   * @method setUserData
   * @param {JSON|String} userData User custom data.
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
   * @since 0.4.1
   */
  Skyway.prototype.setUserData = function(userData) {
    var self = this;
    // NOTE ALEX: be smarter and copy fields and only if different
    if (self._readyState === self.READY_STATE_CHANGE.COMPLETED) {
      self._user.info = self._user.info || {};
      self._user.info.userData = userData ||
        self._user.info.userData || {};

      if (self._in_room) {
        self._sendMessage({
          type: self.SIG_TYPE.UPDATE_USER,
          mid: self._user.sid,
          rid: self._room.id,
          userData: self._user.info.userData
        });
        self._trigger('peerUpdated', self._user.sid, self._user.info, true);
      } else {
        console.warn('API - User is not in the room. Broadcast of' +
          ' updated information will be dropped.');
      }
    } else {
      var checkInRoom = setInterval(function () {
        if (self._readyState === self.READY_STATE_CHANGE.COMPLETED) {
          clearInterval(checkInRoom);
          self.setUserData(userData);
        }
      }, 50);
    }
  };

  /**
   * Gets the user custom data.
   * @method getUserData
   * @return {JSON|String} User custom data.
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
   * Gets the peer information.
   * - If input peerId is user's id or empty, <b>getPeerInfo()</b>
   *   would return user's peer information.
   * @method getPeerInfo
   * @param {String} peerId PeerId of the peer information to retrieve.
   * @return {JSON} Peer information.
   * @example
   *   // Example 1: To get other peer's information
   *   var peerInfo = SkywayDemo.getPeerInfo(peerId);
   *
   *   // Example 2: To get own information
   *   var userInfo = SkywayDemo.getPeerInfo();
   * @since 0.4.0
   */
  Skyway.prototype.getPeerInfo = function(peerId) {
    return (peerId && peerId !== this._user.sid) ?
      this._peerInformations[peerId] :
      ((this._user) ? this._user.info : null);
  };

  /* Syntactically private variables and utility functions */
  Skyway.prototype._events = {
    /**
     * Event fired when the socket connection to the signaling
     * server is open.
     * @event channelOpen
     * @since 0.1.0
     */
    'channelOpen': [],
    /**
     * Event fired when the socket connection to the signaling
     * server has closed.
     * @event channelClose
     * @since 0.1.0
     */
    'channelClose': [],
    /**
     * Event fired when the socket connection received a message
     * from the signaling server.
     * @event channelMessage
     * @param {JSON} message
     * @since 0.1.0
     */
    'channelMessage': [],
    /**
     * Event fired when the socket connection has occurred an error.
     * @event channelError
     * @param {Object|String} error Error message or object thrown.
     * @since 0.1.0
     */
    'channelError': [],
    /**
     * Event fired whether the room is ready for use.
     * @event readyStateChange
     * @param {String} readyState [Rel: Skyway.READY_STATE_CHANGE]
     * @param {JSON} error Error object thrown.
     * @param {Integer} error.status Http status when retrieving information.
     *   May be empty for other errors.
     * @param {String} error.content Error message.
     * @param {Integer} error.errorCode Error code.
     *   [Rel: Skyway.READY_STATE_CHANGE_ERROR]
     * @since 0.4.0
     */
    'readyStateChange': [],
    /**
     * Event fired when a peer's handshake progress has changed.
     * @event handshakeProgress
     * @param {String} step The handshake progress step.
     *   [Rel: Skyway.HANDSHAKE_PROGRESS]
     * @param {String} peerId PeerId of the peer's handshake progress.
     * @param {Object|String} error Error message or object thrown.
     * @since 0.3.0
     */
    'handshakeProgress': [],
    /**
     * Event fired when an ICE gathering state has changed.
     * @event candidateGenerationState
     * @param {String} state The ice candidate generation state.
     *   [Rel: Skyway.CANDIDATE_GENERATION_STATE]
     * @param {String} peerId PeerId of the peer that had an ice candidate
     *    generation state change.
     * @since 0.1.0
     */
    'candidateGenerationState': [],
    /**
     * Event fired when a peer Connection state has changed.
     * @event peerConnectionState
     * @param {String} state The peer connection state.
     *   [Rel: Skyway.PEER_CONNECTION_STATE]
     * @param {String} peerId PeerId of the peer that had a peer connection state
     *    change.
     * @since 0.1.0
     */
    'peerConnectionState': [],
    /**
     * Event fired when an ICE connection state has changed.
     * @iceConnectionState
     * @param {String} state The ice connection state.
     *   [Rel: Skyway.ICE_CONNECTION_STATE]
     * @param {String} peerId PeerId of the peer that had an ice connection state change.
     * @since 0.1.0
     */
    'iceConnectionState': [],
    /**
     * Event fired when webcam or microphone media access fails.
     * @event mediaAccessError
     * @param {Object|String} error Error object thrown.
     * @since 0.1.0
     */
    'mediaAccessError': [],
    /**
     * Event fired when webcam or microphone media acces passes.
     * @event mediaAccessSuccess
     * @param {Object} stream MediaStream object.
     * @since 0.1.0
     */
    'mediaAccessSuccess': [],
    /**
     * Event fired when a peer joins the room.
     * @event peerJoined
     * @param {String} peerId PeerId of the peer that joined the room.
     * @param {JSON} peerInfo Peer's information.
     * @param {JSON} peerInfo.settings Peer's stream settings.
     * @param {Boolean|JSON} peerInfo.settings.audio Peer's audio stream
     *   settings.
     * @param {Boolean} peerInfo.settings.audio.stereo If peer has stereo
     *   enabled or not.
     * @param {Boolean|JSON} peerInfo.settings.video Peer's video stream
     *   settings.
     * @param {JSON} peerInfo.settings.video.resolution
     *   Peer's video stream resolution [Rel: Skyway.VIDEO_RESOLUTION]
     * @param {Integer} peerInfo.settings.video.resolution.width
     *   Peer's video stream resolution width.
     * @param {Integer} peerInfo.settings.video.resolution.height
     *   Peer's video stream resolution height.
     * @param {Integer} peerInfo.settings.video.frameRate
     *   Peer's video stream resolution minimum frame rate.
     * @param {JSON} peerInfo.mediaStatus Peer stream status.
     * @param {Boolean} peerInfo.mediaStatus.audioMuted If peer's audio
     *   stream is muted.
     * @param {Boolean} peerInfo.mediaStatus.videoMuted If peer's video
     *   stream is muted.
     * @param {JSON|String} peerInfo.userData Peer's custom user data.
     * @param {Boolean} isSelf Is the peer self.
     * @since 0.3.0
     */
    'peerJoined': [],
    /**
     * Event fired when a peer information is updated.
     * @event peerUpdated
     * @param {String} peerId PeerId of the peer that had information updaed.
     * @param {JSON} peerInfo Peer's information.
     * @param {JSON} peerInfo.settings Peer's stream settings.
     * @param {Boolean|JSON} peerInfo.settings.audio Peer's audio stream
     *   settings.
     * @param {Boolean} peerInfo.settings.audio.stereo If peer has stereo
     *   enabled or not.
     * @param {Boolean|JSON} peerInfo.settings.video Peer's video stream
     *   settings.
     * @param {JSON} peerInfo.settings.video.resolution
     *   Peer's video stream resolution [Rel: Skyway.VIDEO_RESOLUTION]
     * @param {Integer} peerInfo.settings.video.resolution.width
     *   Peer's video stream resolution width.
     * @param {Integer} peerInfo.settings.video.resolution.height
     *   Peer's video stream resolution height.
     * @param {Integer} peerInfo.settings.video.frameRate
     *   Peer's video stream resolution minimum frame rate.
     * @param {JSON} peerInfo.mediaStatus Peer stream status.
     * @param {Boolean} peerInfo.mediaStatus.audioMuted If peer's audio
     *   stream is muted.
     * @param {Boolean} peerInfo.mediaStatus.videoMuted If peer's video
     *   stream is muted.
     * @param {JSON|String} peerInfo.userData Peer's custom user data.
     * @param {Boolean} isSelf Is the peer self.
     * @since 0.3.0
     */
    'peerUpdated': [],
    /**
     * Event fired when a peer leaves the room
     * @event peerLeft
     * @param {String} peerId PeerId of the peer that left.
     * @param {JSON} peerInfo Peer's information.
     * @param {JSON} peerInfo.settings Peer's stream settings.
     * @param {Boolean|JSON} peerInfo.settings.audio Peer's audio stream
     *   settings.
     * @param {Boolean} peerInfo.settings.audio.stereo If peer has stereo
     *   enabled or not.
     * @param {Boolean|JSON} peerInfo.settings.video Peer's video stream
     *   settings.
     * @param {JSON} peerInfo.settings.video.resolution
     *   Peer's video stream resolution [Rel: Skyway.VIDEO_RESOLUTION]
     * @param {Integer} peerInfo.settings.video.resolution.width
     *   Peer's video stream resolution width.
     * @param {Integer} peerInfo.settings.video.resolution.height
     *   Peer's video stream resolution height.
     * @param {Integer} peerInfo.settings.video.frameRate
     *   Peer's video stream resolution minimum frame rate.
     * @param {JSON} peerInfo.mediaStatus Peer stream status.
     * @param {Boolean} peerInfo.mediaStatus.audioMuted If peer's audio
     *   stream is muted.
     * @param {Boolean} peerInfo.mediaStatus.videoMuted If peer's video
     *   stream is muted.
     * @param {JSON|String} peerInfo.userData Peer's custom user data.
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
     * - This occurs after the user joins the room.
     * - This is changed from <b>addPeerStream</b> event.
     * - Note that <b>addPeerStream</b> is removed from the specs.
     * @event incomingStream
     * @param {Object} stream MediaStream object.
     * @param {String} peerId PeerId of the peer that is sending the stream.
     * @param {Boolean} isSelf Is the peer self.
     * @since 0.4.0
     */
    'incomingStream': [],
    /**
     * Event fired when a message being broadcasted is received.
     * - This is changed from <b>chatMessageReceived</b>,
     *   <b>privateMessage</b> and <b>publicMessage</b> event.
     * - Note that <b>chatMessageReceived</b>, <b>privateMessage</b>
     *   and <b>publicMessage</b> is removed from the specs.
     * @event incomingMessage
     * @param {JSON} message Message object that is received.
     * @param {JSON|String} message.content Data that is broadcasted.
     * @param {String} message.senderPeerId PeerId of the sender peer.
     * @param {String} message.targetPeerId PeerId that is specifically
     *   targeted to receive the message.
     * @param {Boolean} message.isPrivate Is data received a private message.
     * @param {Boolean} message.isDataChannel Is data received from a
     *   data channel.
     * @param {String} peerId PeerId of the sender peer.
     * @param {JSON} peerInfo Peer's information.
     * @param {JSON} peerInfo.settings Peer's stream settings.
     * @param {Boolean|JSON} peerInfo.settings.audio Peer's audio stream
     *   settings.
     * @param {Boolean} peerInfo.settings.audio.stereo If peer has stereo
     *   enabled or not.
     * @param {Boolean|JSON} peerInfo.settings.video Peer's video stream
     *   settings.
     * @param {JSON} peerInfo.settings.video.resolution
     *   Peer's video stream resolution [Rel: Skyway.VIDEO_RESOLUTION]
     * @param {Integer} peerInfo.settings.video.resolution.width
     *   Peer's video stream resolution width.
     * @param {Integer} peerInfo.settings.video.resolution.height
     *   Peer's video stream resolution height.
     * @param {Integer} peerInfo.settings.video.frameRate
     *   Peer's video stream resolution minimum frame rate.
     * @param {JSON} peerInfo.mediaStatus Peer stream status.
     * @param {Boolean} peerInfo.mediaStatus.audioMuted If peer's audio
     *   stream is muted.
     * @param {Boolean} peerInfo.mediaStatus.videoMuted If peer's video
     *   stream is muted.
     * @param {JSON|String} peerInfo.userData Peer's custom user data.
     * @param {Boolean} isSelf Is the peer self.
     * @since 0.4.1
     */
    'incomingMessage': [],
    /**
     * Event fired when a room lock status has changed.
     * @event roomLock
     * @param {Boolean} isLocked Is the room locked.
     * @param {String} peerId PeerId of the peer that is locking/unlocking
     *   the room.
     * @param {JSON} peerInfo Peer's information.
     * @param {JSON} peerInfo.settings Peer's stream settings.
     * @param {Boolean|JSON} peerInfo.settings.audio Peer's audio stream
     *   settings.
     * @param {Boolean} peerInfo.settings.audio.stereo If peer has stereo
     *   enabled or not.
     * @param {Boolean|JSON} peerInfo.settings.video Peer's video stream
     *   settings.
     * @param {JSON} peerInfo.settings.video.resolution
     *   Peer's video stream resolution [Rel: Skyway.VIDEO_RESOLUTION]
     * @param {Integer} peerInfo.settings.video.resolution.width
     *   Peer's video stream resolution width.
     * @param {Integer} peerInfo.settings.video.resolution.height
     *   Peer's video stream resolution height.
     * @param {Integer} peerInfo.settings.video.frameRate
     *   Peer's video stream resolution minimum frame rate.
     * @param {JSON} peerInfo.mediaStatus Peer stream status.
     * @param {Boolean} peerInfo.mediaStatus.audioMuted If peer's audio
     *   stream is muted.
     * @param {Boolean} peerInfo.mediaStatus.videoMuted If peer's video
     *   stream is muted.
     * @param {JSON|String} peerInfo.userData Peer's custom user data.
     * @param {Boolean} isSelf Is the peer self.
     * @since 0.4.0
     */
    'roomLock': [],
    //-- data state events
    /**
     * Event fired when a peer's datachannel state has changed.
     * @event dataChannelState
     * @param {String} state The datachannel state.
     *   [Rel: Skyway.DATA_CHANNEL_STATE]
     * @param {String} peerId PeerId of peer that has a datachannel
     *   state change.
     * @since 0.1.0
     */
    'dataChannelState': [],
    /**
     * Event fired when a data transfer state has changed.
     * - Note that <u>transferInfo.data</u> sends the blob data, and
     *   no longer a blob url.
     * @event dataTransferState
     * @param {String} state The data transfer state.
     *   [Rel: Skyway.DATA_TRANSFER_STATE]
     * @param {String} transferId TransferId of the data.
     * @param {String} peerId PeerId of the peer that has a data
     *   transfer state change.
     * @param {JSON} transferInfo Data transfer information.
     * @param {JSON} transferInfo.percentage The percetange of data being
     *   uploaded / downloaded.
     * @param {JSON} transferInfo.senderPeerId PeerId of the sender.
     * @param {JSON} transferInfo.data The blob data. See the
     *   [createObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL.createObjectURL)
     *   method on how you can convert the blob to a download link.
     * @param {JSON} transferInfo.name Data name.
     * @param {JSON} transferInfo.size Data size.
     * @param {JSON} error The error object.
     * @param {String} error.message Error message thrown.
     * @param {String} error.transferType Is error from uploading or downloading.
     *   [Rel: Skyway.DATA_TRANSFER_TYPE]
     * @since 0.4.1
     */
    'dataTransferState': [],
    /**
     * Event fired when the signaling server warns the user.
     * @event systemAction
     * @param {String} action The action that is required for
     *   the user to follow. [Rel: Skyway.SYSTEM_ACTION]
     * @param {String} message The reason for the action.
     * @since 0.1.0
     */
    'systemAction': []
  };

  /**
   * Broadcast a message to all peers.
   * - <b><i>WARNING</i></b>: Map arrays data would be lost when stringified
   *   in JSON, so refrain from using map arrays.
   * @method sendMessage
   * @param {String|JSON} message The message data to send.
   * @param {String} targetPeerId PeerId of the peer to send a private
   *   message data to.
   * @example
   *   // Example 1: Send to all peers
   *   SkywayDemo.sendMessage('Hi there!');
   *
   *   // Example 2: Send to a targeted peer
   *   SkywayDemo.sendMessage('Hi there peer!', targetPeerId);
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
    }, this._user.sid, this._user.info, true);
  };

  /**
   * Broadcasts to all P2P datachannel messages and sends to a
   * peer only when targetPeerId is provided.
   * - This is ideal for sending strings or json objects lesser than 16KB
   *   [as noted in here](http://www.webrtc.org/chrome).
   * - For huge data, please check out function
   *   {{#crossLink "Skyway/sendBlobData:method"}}sendBlobData(){{/crossLink}}.
   * - <b><i>WARNING</i></b>: Map arrays data would be lost when stringified
   *   in JSON, so refrain from using map arrays.
   * @method sendP2PMessage
   * @param {String|JSON} message The message data to send.
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
          this._sendDataChannel(peerId, {
            type: 'MESSAGE',
            isPrivate: !!targetPeerId,
            senderPeerId: this._user.sid,
            data: message
          });
        }
      }
    }
    this._trigger('incomingMessage', {
      content: message,
      isPrivate: (targetPeerId) ? true : false,
      targetPeerId: targetPeerId || null, // is not null if there's user
      isDataChannel: true,
      senderPeerId: this._user.sid
    }, this._user.sid, this._user.info, true);
  };

  /**
   * Gets the default webcam and microphone.
   * - Please do not be confused with the [MediaStreamConstraints](http://dev.w3.
   *   org/2011/webrtc/editor/archives/20140817/getusermedia.html#dictionary
   *   -mediastreamconstraints-members) specified in the original w3c specs.
   * - This is an implemented function for Skyway.
   * @method getUserMedia
   * @param {JSON} options Optional. MediaStream constraints.
   * @param {JSON|Boolean} options.audio Option to allow audio stream.
   * @param {Boolean} options.audio.stereo Option to enable stereo
   *    during call.
   * @param {JSON|Boolean} options.video Option to allow video stream.
   * @param {JSON} options.video.resolution The resolution of video stream.
   * - Check out <a href="#attr_VIDEO_RESOLUTION">VIDEO_RESOLUTION</a>.
   * @param {Integer} options.video.resolution.width
   *   The video stream resolution width.
   * @param {Integer} options.video.resolution.height
   *   The video stream resolution height.
   * @param {Integer} options.video.frameRate
   *   The video stream mininum frameRate.
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
   *        'resolution': SkywayDemo.VIDEO_RESOLUTION.HD,
   *        'frameRate': 50
   *      },
   *     'audio' : {
   *       'stereo': true
   *     }
   *   });
   * @trigger mediaAccessSuccess, mediaAccessError
   * @since 0.4.1
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
   * Access to user's MediaStream is successful.
   * @method _onUserMediaSuccess
   * @param {MediaStream} stream MediaStream object.
   * @param {Skyway} self Skyway object.
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
   * Access to user's MediaStream failed.
   * @method _onUserMediaError
   * @param {Object} error Error object that was thrown.
   * @param {Skyway} self Skyway object.
   * @trigger mediaAccessFailure
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._onUserMediaError = function(error, self) {
    console.log('API - getUserMedia failed with exception type: ' +
      (error.name || error));
    if (error.message) {
      console.log('API - getUserMedia failed with exception: ' + error.message);
    }
    if (error.constraintName) {
      console.log('API - getUserMedia failed because of the following constraint: ' +
        error.constraintName);
    }
    self._trigger('mediaAccessError', error);
  };

  /**
   * Handles everu incoming signaling message received.
   * - If it's a SIG_TYPE.GROUP message, break them down to single messages
   *   and let {{#crossLink "Skyway/_processSingleMessage:method"}}
   *   _processSingleMessage(){{/crossLink}} to handle them.
   * @method _processSigMessage
   * @param {String} messageString The message object stringified received.
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
   * Handles the single signaling message received.
   * @method _processingSingleMessage
   * @param {JSON} message The message object received.
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
      console.warn('API - [' + message.mid + '] Unsupported message type received: ' +
        message.type);
      break;
    }
  };

  /**
   * Signaling server sends a redirect message.
   * - SIG_TYPE: REDIRECT
   * - This occurs when the signaling server is warning us or wanting
   *   to move us out when the peer sends too much messages at the
   *   same tme.
   * @method _redirectHandler
   * @param {JSON} message The message object received.
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.url Deprecated. Url to redirect user to.
   * @param {String} message.info The reason for this action.
   * @param {String} message.action The action to work on.
   *   [Rel: Skyway.SYSTEM_ACTION]
   * @param {String} message.type The type of message received.
   * @trigger systemAction
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._redirectHandler = function(message) {
    console.log('API - [Server]: ' + message.info);
    this._trigger('systemAction', message.action, message.info);
  };

  /**
   * Signaling server sends a updateUserEvent message.
   * - SIG_TYPE: UPDATE_USER
   * - This occurs when a peer's custom user data is updated.
   * @method _updateUserEventHandler
   * @param {JSON} message The message object received.
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
   * Signaling server sends a roomLockEvent message.
   * - SIG_TYPE: ROOM_LOCK
   * - This occurs when a room lock status has changed.
   * @method _roomLockEventHandler
   * @param {JSON} message The message object received.
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.mid PeerId of the peer that is sending the
   *   updated room lock status.
   * @param {String} message.lock If room is locked or not.
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
   * Signaling server sends a muteAudioEvent message.
   * - SIG_TYPE: MUTE_AUDIO
   * - This occurs when a peer's audio stream muted
   *   status has changed.
   * @method _muteAudioEventHandler
   * @param {JSON} message The message object received.
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.mid PeerId of the peer that is sending
   *   their own updated audio stream status.
   * @param {String} message.muted If audio stream is muted or not.
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
   * Signaling server sends a muteVideoEvent message.
   * - SIG_TYPE: MUTE_VIDEO
   * - This occurs when a peer's video stream muted
   *   status has changed.
   * @method _muteVideoEventHandler
   * @param {JSON} message The message object received.
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.mid PeerId of the peer that is sending
   *   their own updated video streams status.
   * @param {String} message.muted If video stream is muted or not.
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
   * Signaling server sends a bye message.
   * - SIG_TYPE: BYE
   * - This occurs when a peer left the room.
   * @method _byeHandler
   * @param {JSON} message The message object received.
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
   * Signaling server sends a privateMessage message.
   * - SIG_TYPE: PRIVATE_MESSAGE
   * - This occurs when a peer sends private message to user.
   * @method _privateMessageHandler
   * @param {JSON} message The message object received.
   * @param {JSON|String} message.data The data received.
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.cid CredentialId of the room.
   * @param {String} message.mid PeerId of the peer that is sending a private
   *   broadcast message.
   * @param {String} message.type The type of message received.
   * @trigger privateMessage
   * @private
   * @since 0.4.0
   */
  Skyway.prototype._privateMessageHandler = function(message) {
    var targetMid = message.mid;
    this._trigger('incomingMessage', {
      content: message.data,
      isPrivate: true,
      targetPeerId: message.target, // is not null if there's user
      isDataChannel: false,
      senderPeerId: targetMid
    }, targetMid, this._peerInformations[targetMid], false);
  };

  /**
   * Signaling server sends a publicMessage message.
   * - SIG_TYPE: PUBLIC_MESSAGE
   * - This occurs when a peer broadcasts a public message to
   *   all connected peers.
   * @method _publicMessageHandler
   * @param {JSON} message The message object received.
   * @param {JSON|String} message.data The data broadcasted
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.cid CredentialId of the room.
   * @param {String} message.mid PeerId of the peer that is sending a private
   *   broadcast message.
   * @param {String} message.type The type of message received.
   * @trigger publicMessage
   * @private
   * @since 0.4.0
   */
  Skyway.prototype._publicMessageHandler = function(message) {
    var targetMid = message.mid;
    this._trigger('incomingMessage', {
      content: message.data,
      isPrivate: false,
      targetPeerId: null, // is not null if there's user
      isDataChannel: false,
      senderPeerId: targetMid
    }, targetMid, this._peerInformations[targetMid], false);
  };

  /**
   * Signaling server sends an inRoom message.
   * - SIG_TYPE: IN_ROOM
   * - This occurs the user has joined the room.
   * @method _inRoomHandler
   * @param {JSON} message The message object received.
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.sid PeerId of self.
   * @param {String} message.mid PeerId of the peer that is
   *   sending the joinRoom message.
   * @param {JSON} message.pc_config The peerconnection configuration.
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
   * Signaling server sends a enter message.
   * - SIG_TYPE: ENTER
   * - This occurs when a peer just entered the room.
   * - If we don't have a connection with the peer, send a welcome.
   * @method _enterHandler
   * @param {JSON} message The message object received.
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
   * @param {String} message.type The type of message received.
   * @trigger handshakeProgress, peerJoined
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._enterHandler = function(message) {
    var self = this;
    var targetMid = message.mid;
    // need to check entered user is new or not.
    if (!self._peerConnections[targetMid]) {
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
   * Signaling server sends a welcome message.
   * - SIG_TYPE: WELCOME
   * - This occurs when we've just received a welcome.
   * - If there is no existing connection with this peer,
   *   create one, then set the remotedescription and answer.
   * @method _welcomeHandler
   * @param {JSON} message The message object received.
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.mid PeerId of the peer that is sending the welcome shake.
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
   * @param {String} message.type The type of message received.
   * @trigger handshakeProgress, peerJoined
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._welcomeHandler = function(message) {
    var targetMid = message.mid;
    // Prevent duplicates and receiving own peer
    if (!this._peerConnections[targetMid]) {
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
    }
  };

  /**
   * Signaling server sends an offer message.
   * - SIG_TYPE: OFFER
   * - This occurs when we've just received an offer.
   * - If there is no existing connection with this peer, create one,
   *   then set the remotedescription and answer.
   * @method _offerHandler
   * @param {JSON} message The message object received.
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
   * Signaling server sends a candidate message.
   * - SIG_TYPE: CANDIDATE
   * - This occurs when a peer sends an ice candidate.
   * @method _candidateHandler
   * @param {JSON} message The message object received.
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.mid PeerId of the peer that is sending the
   *   offer shake.
   * @param {String} message.sdp Offer sessionDescription.
   * @param {String} message.target PeerId that is specifically
   *   targeted to receive the message.
   * @param {String} message.id Peer's ICE candidate id.
   * @param {String} message.candidate Peer's ICE candidate object.
   * @param {String} message.label Peer's ICE candidate label.
   * @param {String} message.type The type of message received.
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
   * Signaling server sends an answer message.
   * - SIG_TYPE: ANSWER
   * - This occurs when a peer sends an answer message is received.
   * @method _answerHandler
   * @param {String} message.type Message type
   * @param {JSON} message The message object received.
   * @param {String} message.rid RoomId of the connected room.
   * @param {String} message.sdp Answer sessionDescription
   * @param {String} message.mid PeerId of the peer that is sending the enter shake.
   * @param {String} message.type The type of message received.
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
    if (self._peerConnections[targetMid]) {
      console.log('API - [' + targetMid + '] PeerConnection has already been ' +
        'created. Abort.');
      return;
    }
    console.log('API - [' + targetMid + '] Creating PeerConnection.');
    self._peerConnections[targetMid] = self._createPeerConnection(targetMid);
    if (!receiveOnly) {
      self._addLocalStream(targetMid);
    }
    // I'm the callee I need to make an offer
    if (toOffer) {
      if (self._enableDataChannel) {
        self._createDataChannel(targetMid);
        self._doCall(targetMid, peerAgentBrowser);
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
    var inputConstraints = self._room.pcHelper.offerConstraints;
    var sc = self._room.pcHelper.sdpConstraints;
    for (var name in sc.mandatory) {
      if (sc.mandatory.hasOwnProperty(name)) {
        inputConstraints.mandatory[name] = sc.mandatory[name];
      }
    }
    inputConstraints.optional.concat(sc.optional);
    console.log('API - [' + targetMid + '] Creating offer.');
    checkMediaDataChannelSettings(true, peerAgentBrowser,
      function(unifiedOfferConstraints) {
      pc.createOffer(function(offer) {
        self._setLocalAndSendMessage(targetMid, offer);
      }, function(error) {
        self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR,
          targetMid, error);
        console.error('API - [' + targetMid + '] Failed creating an offer.');
        console.error(error);
      }, unifiedOfferConstraints);
    }, inputConstraints);
  };

  /**
   * Finds a line in the SDP and returns it.
   * - To set the value to the line, add an additional parameter to the method.
   * @method _findSDPLine
   * @param {Array} sdpLines Sdp received.
   * @param {Array} condition The conditions.
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
   * Adds stereo feature to the SDP.
   * - This requires OPUS to be enabled in the SDP or it will not work.
   * @method _addStereo
   * @param {Array} sdpLines Sdp received.
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
   * @param {Array} sdpLines Sdp received.
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
   * Sets the STUN server specially for Firefox for ICE Connection.
   * @method _setFirefoxIceServers
   * @param {JSON} config Ice configuration servers url object.
   * @return {JSON} Updated configuration
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
   * Waits for MediaStream.
   * - Once the stream is loaded, callback is called
   * - If there's not a need for stream, callback is called
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

    // If options video or audio false, do the opposite to throw a true.
    var hasAudio = (options.audio) ? false : true;
    var hasVideo = (options.video) ? false : true;

    if (options.video || options.audio) {
      // lets wait for a minute and then we pull the updates
      var count = 0;
      var checkForStream = setInterval(function() {
        if (count < 5) {
          for (var stream in self._user.streams) {
            if (self._user.streams.hasOwnProperty(stream)) {
              if (options.audio &&
                self._user.streams[stream].getAudioTracks().length > 0) {
                hasAudio = true;
              }
              if (options.video &&
                self._user.streams[stream].getVideoTracks().length > 0) {
                hasVideo = true;
              }
              if (hasAudio && hasVideo) {
                clearInterval(checkForStream);
                callback();
              } else {
                count++;
              }
            }
          }
        } else {
          clearInterval(checkForStream);
          var error = ((!hasAudio && options.audio) ?  'Expected audio but no ' +
            'audio stream received' : '') +  '\n' + ((!hasVideo && options.video) ?
            'Expected video but no video stream received' : '');
          self._trigger('mediaAccessError', error);
        }
      }, 2000);
    } else {
      callback();
    }
  };

  /**
   * Opens or closes existing MediaStreams.
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
   * Creates a peerconnection to communicate with the peer whose ID is 'targetMid'.
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
        self._createDataChannel(targetMid, dc);
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
      this._trigger('candidateGenerationState', this.CANDIDATE_GENERATION_STATE.COMPLETED,
        targetMid);
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
   * Sends a message to the signaling server.
   * - Not to be confused with method
   *   {{#crossLink "Skyway/sendMessage:method"}}sendMessage(){{/crossLink}}
   *   that broadcasts messages. This is for sending socket messages.
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
   * Initiate a socket signaling connection.
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
   * Closes the socket signaling connection.
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
   * @param {String} peerId PeerId of the peer which the datachannel is connected to
   * @param {Object} dc The datachannel object received.
   * @trigger dataChannelState
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._createDataChannel = function(peerId, dc) {
    var self = this;
    var pc = self._peerConnections[peerId];
    var channelName = self._user.sid + '_' + peerId;
    var dcOpened = function () {
      console.log('API - DataChannel [' + peerId + ']: DataChannel is opened.');
      self._dataChannels[peerId] = dc;
      self._trigger('dataChannelState', dc.readyState, peerId);
    };

    if (!dc) {
      if (!webrtcDetectedBrowser.isSCTPDCSupported && !webrtcDetectedBrowser.isPluginSupported) {
        console.warn('API - DataChannel [' + peerId + ']: Does not support SCTP');
      }
      dc = pc.createDataChannel(channelName);
      self._trigger('dataChannelState', dc.readyState, peerId);
      var checkDcOpened = setInterval(function () {
        if (dc.readyState === self.DATA_CHANNEL_STATE.OPENED) {
          clearInterval(checkDcOpened);
          dcOpened();
        }
      }, 50);
    }
    console.log('API - DataChannel [' + peerId + ']: Binary type support is "' +
      dc.binaryType + '"');
    dc.onerror = function(error) {
      console.error('API - DataChannel [' + peerId + ']: Failed retrieveing DataChannel.');
      console.exception(error);
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerId, error);
    };
    dc.onclose = function() {
      console.log('API - DataChannel [' + peerId + ']: DataChannel closed.');
      self._closeDataChannel(peerId);
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerId);
    };
    dc.onopen = dcOpened;
    dc.push = dc.send;
    dc.send = function (data) {
      console.log('API - DataChannel [' + peerId + ']: Sending data - length : ' +
        data.length);
      dc.push(data);
    };
    dc.onmessage = function(event) {
      console.log('API - DataChannel [' + peerId + ']: DataChannel message received');
      self._dataChannelHandler(event.data, peerId);
    };
  };

  /**
   * Sends data to the datachannel.
   * @method _sendDataChannel
   * @param {String} peerId PeerId of the peer's datachannel to send data.
   * @param {JSON} data The data to send.
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._sendDataChannel = function(peerId, data) {
    var dc = this._dataChannels[peerId];
    if (!dc) {
      console.error('API - DataChannel [' + peerId +
        ']: No available existing DataChannel');
      return;
    } else {
      if (dc.readyState === this.DATA_CHANNEL_STATE.OPEN) {
        console.log('API - DataChannel [' + peerId +
          ']: Sending Data from DataChannel');
        var dataString = (typeof data === 'object') ? JSON.stringify(data) : data;
        dc.send(dataString);
      } else {
        console.error('API - DataChannel [' + peerId +
          ']: DataChannel is not ready.\nState is: "' + dc.readyState + '"');
        this._trigger('dataChannelState', this.DATA_CHANNEL_STATE.ERROR,
          peerId, 'DataChannel is not ready.\nState is: ' + dc.readyState);
      }
    }
  };

  /**
   * Closes the datachannel.
   * @method _closeDataChannel
   * @param {String} peerId PeerId of the peer's datachannel to close.
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._closeDataChannel = function(peerId) {
    var dc = this._dataChannels[peerId];
    if (dc) {
      if (dc.readyState !== this.DATA_CHANNEL_STATE.CLOSED) {
        dc.close();
      }
      delete this._dataChannels[peerId];
    }
  };

  /**
   * Handles all datachannel protocol events.
   * @method _dataChannelHandler
   * @param {String|Object} data The data received from datachannel.
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._dataChannelHandler = function(dataString, peerId) {
    // PROTOCOL ESTABLISHMENT
    if (typeof dataString === 'string') {
      var data = {};
      try {
        data = JSON.parse(dataString);
      } catch (error) {
        console.log('API - DataChannel [' + peerId + ']: Received "DATA"');
        this._dataChannelDATAHandler(peerId, dataString,
          this.DATA_TRANSFER_DATA_TYPE.BINARY_STRING);
        return;
      }
      console.log('API - DataChannel [' + peerId + ']: Received ' + data.type);
      switch (data.type) {
      case 'WRQ':
        this._dataChannelWRQHandler(peerId, data);
        break;
      case 'ACK':
        this._dataChannelACKHandler(peerId, data);
        break;
      case 'ERROR':
        this._dataChannelERRORHandler(peerId, data);
        break;
      case 'MESSAGE':
        this._dataChannelMESSAGEHandler(peerId, data);
        break;
      default:
        console.warn('API - DataChannel [' + peerId + ']: Invalid command');
      }
    }
  };

  /**
   * The user receives a blob request.
   * From here, it's up to the user to accept or reject it
   * @method _dataChannelWRQHandler
   * @param {String} peerId PeerId of the peer that is sending the request.
   * @param {Array} data The data object received from datachannel.
   * @trigger dataTransferState
   * @private
   * @since 0.4.0
   */
  Skyway.prototype._dataChannelWRQHandler = function(peerId, data) {
    var transferId = this._user.sid + this.DATA_TRANSFER_TYPE.DOWNLOAD +
      (((new Date()).toISOString().replace(/-/g, '').replace(/:/g, ''))).replace('.', '');
    var name = data.name;
    var binarySize = data.size;
    var expectedSize = data.chunkSize;
    var timeout = data.timeout;
    this._downloadDataSessions[peerId] = {
      transferId: transferId,
      name: name,
      size: binarySize,
      ackN: 0,
      receivedSize: 0,
      chunkSize: expectedSize,
      timeout: timeout
    };
    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.UPLOAD_REQUEST,
      transferId, peerId, {
      name: name,
      size: binarySize,
      senderPeerId: peerId
    });
  };

  /**
   * User's response to accept or reject data transfer request.
   * @method respondBlobRequest
   * @param {String} peerId PeerId of the peer that is expected to receive
   *   the request response.
   * @param {Boolean} accept The response of the user to accept the data
   *   transfer or not.
   * @trigger dataTransferState
   * @since 0.4.0
   */
  Skyway.prototype.respondBlobRequest = function (peerId, accept) {
    if (accept) {
      this._downloadDataTransfers[peerId] = [];
      var data = this._downloadDataSessions[peerId];
      this._sendDataChannel(peerId, {
        type: 'ACK',
        ackN: 0,
        agent: window.webrtcDetectedBrowser.browser
      });
      this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.DOWNLOAD_STARTED,
        data.transferId, peerId, {
        name: data.name,
        size: data.size,
        senderPeerId: peerId
      });
    } else {
      this._sendDataChannel(peerId, {
        type: 'ACK',
        ackN: -1
      });
      delete this._downloadDataSessions[peerId];
    }
  };

  /**
   * The user receives an acknowledge of the blob request.
   * @method _dataChannelACKHandler
   * @param {String} peerId PeerId of the peer that is sending the acknowledgement.
   * @param {Array} data The data object received from datachannel.
   * @trigger dataTransferState
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._dataChannelACKHandler = function(peerId, data) {
    var self = this;
    var ackN = data.ackN;
    var chunksLength = self._uploadDataTransfers[peerId].length;
    var uploadedDetails = self._uploadDataSessions[peerId];
    var transferId = uploadedDetails.transferId;
    var timeout = uploadedDetails.timeout;

    self._clearDataChannelTimeout(peerId, true);
    console.log('API - DataChannel Received "ACK": ' + ackN + ' / ' + chunksLength);

    if (ackN > -1) {
      // Still uploading
      if (ackN < chunksLength) {
        var fileReader = new FileReader();
        fileReader.onload = function() {
          // Load Blob as dataurl base64 string
          var base64BinaryString = fileReader.result.split(',')[1];
          self._sendDataChannel(peerId, base64BinaryString);
          self._setDataChannelTimeout(peerId, timeout, true);
          self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOADING,
            transferId, peerId, {
            percentage: (((ackN + 1) / chunksLength) * 100).toFixed()
          });
        };
        fileReader.readAsDataURL(self._uploadDataTransfers[peerId][ackN]);
      } else if (ackN === chunksLength) {
        self._trigger('dataTransferState',
          self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED, transferId, peerId, {
          name: uploadedDetails.name
        });
        delete self._uploadDataTransfers[peerId];
        delete self._uploadDataSessions[peerId];
      }
    } else {
      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.REJECTED,
        transferId, peerId);
      delete self._uploadDataTransfers[peerId];
      delete self._uploadDataSessions[peerId];
    }
  };

  /**
   * The user receives a datachannel broadcast message.
   * @method _dataChannelMESSAGEHandler
   * @param {String} peerId PeerId of the peer that is sending a broadcast message.
   * @param {JSON} data The data object received from datachannel.
   * @trigger incomingMessage
   * @private
   * @since 0.4.0
   */
  Skyway.prototype._dataChannelMESSAGEHandler = function(peerId, data) {
    var targetMid = data.senderPeerId;
    this._trigger('incomingMessage', {
      content: data.data,
      isPrivate: data.isPrivate,
      targetPeerId: this._user.sid,
      isDataChannel: true,
      senderPeerId: targetMid
    }, targetMid, this._peerInformations[targetMid], false);
  };

  /**
   * The user receives a timeout error.
   * @method _dataChannelERRORHandler
   * @param {String} peerId PeerId of the peer that is sending the error.
   * @param {Array} data The data object received from datachannel.
   * @trigger dataTransferState
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._dataChannelERRORHandler = function(peerId, data) {
    var isUploader = data.isUploadError;
    var transferId = (isUploader) ? this._uploadDataSessions[peerId].transferId :
      this._downloadDataSessions[peerId].transferId;
    this._clearDataChannelTimeout(peerId, isUploader);
    this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.ERROR,
      transferId, peerId, null, {
      message: data.content,
      transferType: ((isUploader) ? this.DATA_TRANSFER_TYPE.UPLOAD :
        this.DATA_TRANSFER_TYPE.DOWNLOAD)
    });
  };

  /**
   * This is when the data is sent from the sender to the receiving user.
   * @method _dataChannelDATAHandler
   * @param {String} peerId PeerId of the peer that is sending the data.
   * @param {ArrayBuffer|Blob|String} dataString The data received.
   * @param {String} dataType The data type received from datachannel.
   *   [Rel: Skyway.DATA_TRANSFER_DATA_TYPE]
   * @trigger dataTransferState
   * @private
   * @since 0.4.1
   */
  Skyway.prototype._dataChannelDATAHandler = function(peerId, dataString, dataType) {
    var chunk, error = '';
    var transferStatus = this._downloadDataSessions[peerId];
    var transferId = transferStatus.transferId;

    this._clearDataChannelTimeout(peerId, false);

    if (dataType === this.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
      chunk = this._base64ToBlob(dataString);
    } else if (dataType === this.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER) {
      chunk = new Blob(dataString);
    } else if (dataType === this.DATA_TRANSFER_DATA_TYPE.BLOB) {
      chunk = dataString;
    } else {
      error = 'Unhandled data exception: ' + dataType;
      console.error('API - ' + error);
      this._trigger('dataTransferState',
        this.DATA_TRANSFER_STATE.ERROR, transferId, peerId, null, {
        message: error,
        transferType: this.DATA_TRANSFER_TYPE.DOWNLOAD
      });
      return;
    }
    var receivedSize = (chunk.size * (4 / 3));
    console.log('API - DataChannel [' + peerId + ']: Chunk size: ' + receivedSize);
    console.log('API - DataChannel [' + peerId + ']: Expected size: ' +
      transferStatus.chunkSize);

    if (transferStatus.chunkSize >= receivedSize) {
      this._downloadDataTransfers[peerId].push(chunk);
      transferStatus.ackN += 1;
      transferStatus.receivedSize += receivedSize;
      var totalReceivedSize = transferStatus.receivedSize;
      var percentage = ((totalReceivedSize / transferStatus.size) * 100).toFixed();

      this._sendDataChannel(peerId, {
        type: 'ACK',
        ackN: transferStatus.ackN
      });
      if (transferStatus.chunkSize === receivedSize) {
        console.log('Transfer-in-progress');
        this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.DOWNLOADING,
          transferId, peerId, {
          percentage: percentage
        });
        this._setDataChannelTimeout(peerId, transferStatus.timeout, false);
        this._downloadDataTransfers[peerId].info = transferStatus;
      } else {
        console.log('Download complete');
        var blob = new Blob(this._downloadDataTransfers[peerId]);
        this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED,
          transferId, peerId, {
          data: blob
        });
        delete this._downloadDataTransfers[peerId];
        delete this._downloadDataSessions[peerId];
      }
    } else {
      error = 'Packet not match - [Received]' + receivedSize +
        ' / [Expected]' + transferStatus.chunkSize;
      this._trigger('dataTransferState',
        this.DATA_TRANSFER_STATE.ERROR, transferId, peerId, null, {
        message: error,
        transferType: this.DATA_TRANSFER_TYPE.DOWNLOAD
      });
      console.error('API - DataChannel [' + peerId + ']: ' + error);
    }
  };

  /**
   * Sets the datachannel timeout.
   * - If timeout is met, it will send the 'ERROR' message
   * @method _setDataChannelTimeout
   * @param {String} peerId PeerId of the datachannel to set timeout.
   * @param {Integer} timeout The timeout to set in seconds.
   * @param {Boolean} isSender Is peer the sender or the receiver?
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._setDataChannelTimeout = function(peerId, timeout, isSender) {
    var self = this;
    if (!self._dataTransfersTimeout[peerId]) {
      self._dataTransfersTimeout[peerId] = [];
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
        self._sendDataChannel(peerId, {
          type: 'ERROR',
          content: 'Connection Timeout. Longer than ' + timeout +
            ' seconds. Connection is abolished.',
          isUploadError: isSender
        });
        console.error('API - Data Transfer ' + ((isSender) ? 'for': 'from') + ' ' +
          peerId + ' failed. Connection timeout');
        self._clearDataChannelTimeout(peerId, isSender);
      }
    }, 1000 * timeout);
  };

  /**
   * Clears the datachannel timeout.
   * @method _clearDataChannelTimeout
   * @param {String} peerId PeerId of the datachannel to clear timeout.
   * @param {Boolean} isSender Is peer the sender or the receiver?
   * @param {Skyway} self Skyway object.
   * @private
   * @since 0.1.0
   */
  Skyway.prototype._clearDataChannelTimeout = function(peerId, isSender) {
    if (this._dataTransfersTimeout[peerId]) {
      var type = (isSender) ? this.DATA_TRANSFER_TYPE.UPLOAD :
        this.DATA_TRANSFER_TYPE.DOWNLOAD;
      clearTimeout(this._dataTransfersTimeout[peerId][type]);
      delete this._dataTransfersTimeout[peerId][type];
    }
  };

  /**
   * Converts base64 string to raw binary data.
   * - Doesn't handle URLEncoded DataURIs
   * - See StackOverflow answer #6850276 for code that does this
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
   * Chunks blob data into chunks.
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
   * Start a data transfer with peer(s).
   * - Note that peers have the option to download or reject receiving the blob data.
   * - This method is ideal for sending files.
   * - To send a private file to a peer, input the peerId after the
   *   data information.
   * @method sendBlobData
   * @param {Object} data The data to be sent over. Data has to be a blob.
   * @param {JSON} dataInfo The data information.
   * @param {String} dataInfo.transferId transferId of the data.
   * @param {String} dataInfo.name Data name.
   * @param {Integer} dataInfo.timeout The timeout to wait for packets.
   *   [Default is 60].
   * @param {Integer} dataInfo.size The data size
   * @param {String} targetPeerId PeerId targeted to receive data.
   *   Leave blank to send to all peers.
   * @example
   *   // Send file to all peers connected
   *   SkywayDemo.sendBlobData(file, 67);
   *
   *   // Send file to individual peer
   *   SkywayDemo.sendBlobData(blob, 87, targetPeerId);
   * @trigger dataTransferState
   * @since 0.5.0
   */
  Skyway.prototype.sendBlobData = function(data, dataInfo, targetPeerId) {
    if (!data && !dataInfo) {
      return false;
    }
    var noOfPeersSent = 0;
    dataInfo.timeout = dataInfo.timeout || 60;
    dataInfo.transferId = this._user.sid + this.DATA_TRANSFER_TYPE.UPLOAD +
      (((new Date()).toISOString().replace(/-/g, '').replace(/:/g, ''))).replace('.', '');

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
      this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.UPLOAD_STARTED,
        dataInfo.transferId, targetPeerId, {
        transferId: dataInfo.transferId,
        senderPeerId: this._user.sid,
        name: dataInfo.name,
        size: dataInfo.size,
        timeout: dataInfo.timeout || 60,
        data: data
      });
    } else {
      var error = 'No available datachannels to send data.';
      this._trigger('dataTransferState', this.DATA_TRANSFER_STATE.ERROR,
        transferId, targetPeerId, null, {
        message: error,
        transferType: this.DATA_TRANSFER_TYPE.UPLOAD
      });
      console.log('API - ' + error);
      this._uploadDataTransfers = [];
      this._uploadDataSessions = [];
    }
  };

  /**
   * Sends blob data to individual peer.
   * - This sends the {{#crossLink "Skyway/WRQ:event"}}WRQ{{/crossLink}}
   *   and to initiate the TFTP protocol.
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
    var binarySize = parseInt((dataInfo.size * (4 / 3)).toFixed(), 10);
    var chunkSize = parseInt((this._chunkFileSize * (4 / 3)).toFixed(), 10);
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
    this._sendDataChannel(targetPeerId, {
      type: 'WRQ',
      agent: window.webrtcDetectedBrowser.browser,
      name: dataInfo.name,
      size: binarySize,
      chunkSize: chunkSize,
      timeout: dataInfo.timeout
    });
    console.info(typeof chunkSize, chunkSize);
    this._setDataChannelTimeout(targetPeerId, dataInfo.timeout, true);
  };

  /**
   * Handles all the room lock events.
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
   * Handles all audio and video mute events.
   * - If there is no available audio or video stream, it will call
   *   {{#crossLink "Skyway/leaveRoom:method"}}leaveRoom(){{/crossLink}}
   *   and call {{#crossLink "Skyway/joinRoom:method"}}joinRoom(){{/crossLink}}
   *   to join user in the room to send their audio and video stream.
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
    var hasTracks = false, isStreamActive = false;
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
        isStreamActive = this._user.streams[stream].active;
      }
    }
    // Broadcast to other peers
    if (!(hasTracks && isStreamActive) && enableMedia) {
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
   * Lock the room to prevent peers from joining the room.
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
   * Unlock the room to allow peers to join the room.
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
   * - <b><i>WARNING</i></b>: If there's too many peers toggling the
   *   room lock feature at the same time, the returned results may not
   *   be completely correct since while retrieving the room lock status,
   *   another peer may be toggling it.
   * @method isRoomLocked
   * @example
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
   * Enable microphone.
   * - If microphone is not enabled from the beginning, user would have to reinitate the
   *   {{#crossLink "Skyway/joinRoom:method"}}joinRoom(){{/crossLink}}
   *   process and ask for microphone again.
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
   * Disable microphone.
   * - If microphone is not enabled from the beginning, there is no effect.
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
   * Enable webcam video.
   * - If webcam is not enabled from the beginning, user would have to reinitate the
   *   {{#crossLink "Skyway/joinRoom:method"}}joinRoom(){{/crossLink}}
   *   process and ask for webcam again.
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
   * Disable webcam video.
   * - If webcam is not enabled from the beginning, there is no effect.
   * - Note that in a Chrome-to-chrome session, each party's peer audio
   *   may appear muted in when the audio is muted.
   * - You may follow up the bug on [here](https://github.com/Temasys/SkywayJS/issues/14).
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
    this._user.info.userData = options.user || this._user.info.userData || '';
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
      this._user.info.mediaStatus.audioMuted : !options.audio) : true;
    console.info(this._user.info.mediaStatus.audioMuted);
    // Set video settings
    this._user.info.settings.video = (typeof options.video === 'boolean' ||
      typeof options.video === 'object') ? options.video :
      (this._streamSettings.video || false);
    // Set user media status options
    this._user.info.mediaStatus.videoMuted = (options.video) ?
      ((typeof this._user.info.mediaStatus.videoMuted === 'boolean') ?
      this._user.info.mediaStatus.videoMuted : !options.video) : true;

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
   * - You may call {{#crossLink "Skyway/getUserMedia:method"}}
   *   getUserMedia(){{/crossLink}} first if you want to get
   *   MediaStream and joining Room seperately.
   * - If <b>joinRoom()</b> parameters is empty, it simply uses
   *   any previous media or user data settings.
   * - If no room is specified, user would be joining the default room.
   * @method joinRoom
   * @param {String} room Optional. Room to join user in.
   * @param {JSON} options Optional. Media Constraints.
   * @param {JSON|String} options.user Optional. User custom data.
   * @param {Boolean|JSON} options.audio This call requires audio stream.
   * @param {Boolean} options.audio.stereo Option to enable stereo
   *    during call.
   * @param {Boolean|JSON} options.video This call requires video stream.
   * @param {JSON} options.video.resolution The resolution of video stream.
   *   [Rel: Skyway.VIDEO_RESOLUTION]
   * @param {Integer} options.video.resolution.width
   *   The video stream resolution width.
   * @param {Integer} options.video.resolution.height
   *   The video stream resolution height.
   * @param {Integer} options.video.frameRate
   *   The video stream mininum frameRate.
   * @param {JSON} options.bandwidth Stream bandwidth settings.
   * @param {Integer} options.bandwidth.audio Audio stream bandwidth in kbps.
   * - Recommended: 50 kbps.
   * @param {Integer} options.bandwidth.video Video stream bandwidth in kbps.
   * - Recommended: 256 kbps.
   * @param {Integer} options.bandwidth.data Data stream bandwidth in kbps.
   * - Recommended: 1638400 kbps.
   * @example
   *   // To just join the default room without any video or audio
   *   // Note that calling joinRoom without any parameters
   *   // Still sends any available existing MediaStreams allowed.
   *   // See Examples 2, 3, 4 and 5 etc to prevent video or audio stream
   *   SkywayDemo.joinRoom();
   *
   *   // To just join the default room with bandwidth settings
   *   SkywayDemo.joinRoom({
   *     'bandwidth': {
   *       'data': 14440
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
   *       'resolution' : {
   *         'width' : 640,
   *         'height' : 320
   *       }
   *     }
   *   });
   *
   *   // Example 5: Join a room with userData and settings with audio, video
   *   // and bandwidth
   *   SkwayDemo.joinRoom({
   *     'user': {
   *       'item1': 'My custom data',
   *       'item2': 'Put whatever, string or JSON or array'
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
   * User to leave the room.
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