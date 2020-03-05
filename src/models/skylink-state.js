import { DATA_TRANSFER_DATA_TYPE, SM_PROTOCOL_VERSION, DT_PROTOCOL_VERSION } from '../constants';
import { generateUUID } from '../utils/helpers';

/**
 * @class
 * @classdesc Class representing a Skylink State.\
 * @private
 */
class SkylinkState {
  /**
   * @property {SkylinkApiResponse} skylinkApiResponse
   */
  constructor(initOptions) {
    /**
     * Stores the list of Peer DataChannel connections.
     * @name dataChannels
     * @type {Object}
     * @property {String} peerId - The list of DataChannels associated with Peer ID.
     * @property {RTCDataChannel} channeLabel - The DataChannel connection.
     * The property name <code>"main"</code> is reserved for messaging Datachannel type.
     * @since 0.2.0
     * @private
     */
    this.dataChannels = {};
    /**
     * Stores the list of data transfers from / to Peers.
     * @name dataTransfers
     * @property {JSON} #transferId The data transfer session.
     * @type JSON
     * @since 0.6.16
     * @private
     */
    this.dataTransfers = {};
    /**
     * Stores the list of sending data streaming sessions to Peers.
     * @name dataStreams
     * @property {JSON} #streamId The data stream session.
     * @type JSON
     * @since 0.6.18
     * @private
     */
    this.dataStreams = {};
    /**
     * Stores the list of buffered ICE candidates that is received before
     *   remote session description is received and set.
     * @name peerCandidatesQueue
     * @property {Array} <#peerId> The list of the Peer connection buffered ICE candidates received.
     * @property {RTCIceCandidate} <#peerId>.<#index> The Peer connection buffered ICE candidate received.
     * @type JSON
     * @since 0.5.1
     * @private
     */
    this.peerCandidatesQueue = {};
    /**
     * Stores the list of ICE candidates received before signaling end.
     * @name peerEndOfCandidatesCounter
     * @type JSON
     * @since 0.6.16
     * @private
     */
    this.peerEndOfCandidatesCounter = {};
    /**
     * Stores the list of Peer connection ICE candidates.
     * @name gatheredCandidates
     * @property {JSON} <#peerId> The list of the Peer connection ICE candidates.
     * @property {JSON} <#peerId>.sending The list of the Peer connection ICE candidates sent.
     * @property {JSON} <#peerId>.receiving The list of the Peer connection ICE candidates received.
     * @type JSON
     * @since 0.6.14
     * @private
     */
    this.gatheredCandidates = {};
    /**
     * Stores the window number of Peer connection retries that would increase the wait-for-response timeout
     *   for the Peer connection health timer.
     * @name retryCounters
     * @type JSON
     * @since 0.5.10
     * @private
     */
    this.retryCounters = {};
    /**
     * Stores the list of the Peer connections.
     * @name peerConnections
     * @property {RTCPeerConnection} <#peerId> The Peer connection.
     * @type JSON
     * @since 0.1.0
     * @private
     */
    this.peerConnections = {};
    /**
     * Stores the list of the Peer connections stats.
     * @name peerStats
     * @property {JSON} <#peerId> The Peer connection stats.
     * @type JSON
     * @since 0.6.16
     * @private
     */
    this.peerStats = {};
    /**
     * Stores the list of the Peer connections stats.
     * @name peerBandwidth
     * @property {JSON} <#peerId> The Peer connection stats.
     * @type JSON
     * @since 0.6.16
     * @private
     */
    this.peerBandwidth = {};
    /**
     * Stores the list of the Peer custom configs.
     * @name peerCustomConfigs
     * @type JSON
     * @since 0.6.18
     * @private
     */
    this.peerCustomConfigs = {};
    /**
     * Stores the list of Peers session information.
     * @name peerInformations
     * @property {JSON} <#peerId> The Peer session information.
     * @property {JSON|string} <#peerId>.userData The Peer custom data.
     * @property {JSON} <#peerId>.settings The Peer streaming information.
     * @property {JSON} <#peerId>.mediaStatus The Peer streaming media status.
     * @property {JSON} <#peerId>.agent The Peer agent information.
     * @type JSON
     * @since 0.3.0
     * @private
     */
    this.peerInformations = {};
    /**
     * Stores the Signaling user credentials from the API response required for connecting to the Signaling server.
     * @name user
     * @property {String} uid The API result "username".
     * @property {String} token The API result "userCred".
     * @property {String} timeStamp The API result "timeStamp".
     * @property {String} sid The Signaling server receive user Peer ID.
     * @type SkylinkUser
     * @since 0.5.6
     * @private
     */
    this.user = initOptions.user;
    /**
     * Stores the User custom data.
     * By default, if no custom user data is set, it is an empty string <code>""</code>.
     * @name userData
     * @type JSON|string
     * @default ""
     * @since 0.5.6
     * @private
     */
    this.userData = '';
    /**
     * Stores the User connection priority weight.
     * If Peer has a higher connection weight, it will do the offer from its Peer connection first.
     * @name peerPriorityWeight
     * @type number
     * @since 0.5.0
     * @private
     */
    this.peerPriorityWeight = 0;
    /**
     * Stores the flag that indicates if "autoIntroduce" is enabled.
     * If enabled, the Peers connecting the same Room will receive each others "enter" message ping.
     * @name autoIntroduce
     * @type boolean
     * @default true
     * @since 0.6.1
     * @private
     */
    this.autoIntroduce = initOptions.autoIntroduce;
    /**
     * Stores the flag that indicates if "isPrivileged" is enabled.
     * If enabled, the User has Privileged features which has the ability to retrieve the list of
     *   Peers in the same App space with <code>getPeers()</code> method
     *   and introduce Peers to each other with <code>introducePeer</code> method.
     * @name isPrivileged
     * @type boolean
     * @default false
     * @since 0.6.1
     * @private
     */
    this.isPrivileged = initOptions.isPrivileged;
    /**
     * Stores the current Room name that User is connected to.
     * @name selectedRoom
     * @type string
     * @since 0.3.0
     * @private
     */
    this.selectedRoom = null;
    /**
     * Stores the flag that indicates if Room is locked.
     * @name roomLocked
     * @type boolean
     * @since 0.5.2
     * @private
     */
    this.roomLocked = false;
    /**
     * Stores the flag that indicates if User is connected to the Room.
     * @name inRoom
     * @type boolean
     * @since 0.4.0
     * @private
     */
    this.inRoom = false;
    /**
    /**
     * Stores the timestamps data used for throttling.
     * @name timestamp
     * @type JSON
     * @since 0.5.8
     * @private
     */
    this.timestamp = {
      socketMessage: null,
      shareScreen: null,
      refreshConnection: null,
      getUserMedia: null,
      lastRestart: null,
    };
    /**
     * Stores the current socket connection information.
     * @name socketSession
     * @type {socketSession}
     * @since 0.6.13
     * @private
     */
    this.socketSession = {};
    /**
     * Stores the queued socket messages.
     * This is to prevent too many sent over less than a second interval that might cause DROPPED messages
     *   or jams to the Signaling connection.
     * @name socketMessageQueue
     * @type Array
     * @since 0.5.8
     * @private
     */
    this.socketMessageQueue = [];
    /**
     * Stores the <code>setTimeout</code> to sent queued socket messages.
     * @name socketMessageTimeout
     * @type Object
     * @since 0.5.8
     * @private
     */
    this.socketMessageTimeout = null;
    /**
     * Stores the list of socket ports to use to connect to the Signaling.
     * These ports are defined by default which is commonly used currently by the Signaling.
     * Should re-evaluate this sometime.
     * @name socketPorts
     * @property {Array} http: The list of HTTP socket ports.
     * @property {Array} https: The list of HTTPS socket ports.
     * @type JSON
     * @since 0.5.8
     * @private
     */
    this.socketPorts = initOptions.socketPorts;
    /**
     * Stores the flag that indicates if socket connection to the Signaling has opened.
     * @name channelOpen
     * @type boolean
     * @since 0.5.2
     * @private
     */
    this.channelOpen = false;
    /**
     * Stores the Signaling server url.
     * @name signalingServer
     * @type string
     * @since 0.5.2
     * @private
     */
    this.socketServer = initOptions.socketServer;
    /**
     * Stores the Signaling server protocol.
     * @name signalingServerProtocol
     * @type string
     * @since 0.5.4
     * @private
     */
    this.signalingServerProtocol = initOptions.forceSSL ? 'https:' : window.location.protocol;
    /**
     * Stores the Signaling server port.
     * @name signalingServerPort
     * @type number
     * @since 0.5.4
     * @private
     */
    this.signalingServerPort = null;
    /**
     * Stores the Signaling socket connection object.
     * @name socket
     * @type io
     * @since 0.1.0
     * @private
     */
    this.socket = null;
    /**
     * Stores the flag that indicates if XDomainRequest is used for IE 8/9.
     * @name socketUseXDR
     * @type boolean
     * @since 0.5.4
     * @private
     */
    this.socketUseXDR = false;
    /**
     * Stores the value if ICE restart is supported.
     * @name enableIceRestart
     * @type string
     * @since 0.6.16
     * @private
     */
    this.enableIceRestart = false;
    /**
     * Stores the flag if MCU environment is enabled.
     * @name hasMCU
     * @type boolean
     * @since 0.5.4
     * @private
     */
    this.hasMCU = initOptions.hasMCU;
    /**
     * Stores the construct API REST path to obtain Room credentials.
     * @name path
     * @type string
     * @since 0.1.0
     * @private
     */
    this.path = null;
    /**
     * Stores the current <code>init()</code> readyState.
     * @name readyState
     * @type number
     * @since 0.1.0
     * @private
     */
    /**
     * Stores the "cid" used for <code>joinRoom()</code>.
     * @name key
     * @type string
     * @since 0.1.0
     * @private
     */
    this.key = initOptions.key;
    /**
     * Stores the "apiOwner" used for <code>joinRoom()</code>.
     * @name appKeyOwner
     * @type string
     * @since 0.5.2
     * @private
     */
    this.appKeyOwner = initOptions.appKeyOwner;
    /**
     * Stores the Room credentials information for <code>joinRoom()</code>.
     * @name room
     * @property {String} id The "rid" for <code>joinRoom()</code>.
     * @property {String} token The "roomCred" for <code>joinRoom()</code>.
     * @property {String} startDateTime The "start" for <code>joinRoom()</code>.
     * @property {String} duration The "len" for <code>joinRoom()</code>.
     * @property {String} connection The RTCPeerConnection constraints and configuration. This is not used in the SDK
     *   except for the "mediaConstraints" property that sets the default <code>getUserMedia()</code> settings.
     * @type SkylinkRoom
     * @since 0.5.2
     * @private
     */
    this.room = initOptions.room;
    /**
     * Stores the list of Peer messages timestamp.
     * @name peerMessagesStamps
     * @type JSON
     * @since 0.6.15
     * @private
     */
    this.peerMessagesStamps = {};
    /**
     * Stores the Streams.
     * @name streams
     * @type JSON
     * @since 0.6.15
     * @private
     */
    this.streams = {
      userMedia: null,
      screenshare: null,
    };
    /**
     * Stores the default camera Stream settings.
     * @name streamsDefaultSettings
     * @type JSON
     * @since 0.6.15
     * @private
     */
    this.streamsDefaultSettings = {
      userMedia: {
        audio: {
          stereo: false,
        },
        video: {
          resolution: {
            width: 640,
            height: 480,
          },
          frameRate: 50,
        },
      },
      screenshare: {
        video: true,
      },
    };
    /**
     * Stores all the Stream required muted settings.
     * @name streamsMutedSettings
     * @type JSON
     * @since 0.6.15
     * @private
     */
    this.streamsMutedSettings = {};
    /**
     * Stores all the Stream sending maximum bandwidth settings.
     * @name streamsBandwidthSettings
     * @type JSON
     * @since 0.6.15
     * @private
     */
    this.streamsBandwidthSettings = {
      googleX: {},
      bAS: {},
    };
    /**
     * Stores all the Stream stopped callbacks.
     * @name streamsStoppedCbs
     * @type JSON
     * @since 0.6.15
     * @private
     */
    /**
     * Stores the session description settings.
     * @name sdpSettings
     * @type JSON
     * @since 0.6.16
     * @private
     */
    this.sdpSettings = {
      connection: {
        audio: true,
        video: true,
        data: true,
      },
      direction: {
        audio: { send: true, receive: true },
        video: { send: true, receive: true },
      },
    };
    /**
     * Stores the publish only settings.
     * @name publishOnly
     * @type boolean
     * @since 0.6.16
     * @private
     */
    this.publishOnly = false;
    /**
     * Stores the list of recordings.
     * @name recordings
     * @type JSON
     * @since 0.6.16
     * @private
     */
    this.recordings = {};
    /**
     * Stores the current active recording session ID.
     * There can only be 1 recording session at a time in a Room
     * @name currentRecordingId
     * @type JSON
     * @since 0.6.16
     * @private
     */
    this.currentRecordingId = false;
    /**
     * Stores the recording session timeout to ensure 4 seconds has been recorded.
     * @name recordingStartInterval
     * @type number
     * @since 0.6.16
     * @private
     */
    this.recordingStartInterval = null;
    /**
     * Stores the currently supported codecs.
     * @name currentCodecSupport
     * @type JSON
     * @since 0.6.18
     * @private
     */
    this.currentCodecSupport = null;
    /**
     * Stores the session description orders and info.
     * @name sdpSessions
     * @type JSON
     * @since 0.6.18
     * @private
     */
    this.sdpSessions = {};
    /**
     * Stores the flag if voice activity detection should be enabled.
     * @name voiceActivityDetection
     * @type boolean
     * @default true
     * @since 0.6.18
     * @private
     */
    this.voiceActivityDetection = true;
    /**
     * Stores the datachannel binary data chunk type.
     * @name binaryChunkType
     * @type JSON
     * @since 0.6.18
     * @private
     */
    this.binaryChunkType = DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER;
    /**
     * Stores the RTCPeerConnection configuration.
     * @name peerConnectionConfig
     * @type JSON
     * @since 0.6.18
     * @private
     */
    this.peerConnectionConfig = {};
    /**
     * Stores the auto bandwidth settings.
     * @name bandwidthAdjuster
     * @type JSON
     * @since 0.6.18
     * @private
     */
    this.bandwidthAdjuster = null;
    /**
     * Stores the Peer connection status.
     * @name peerConnStatus
     * @type JSON
     * @since 0.6.19
     * @private
     */
    this.peerConnStatus = {};
    /**
     * Stores the flag to temporarily halt joinRoom() from processing.
     * @name joinRoomManager
     * @type boolean
     * @since 0.6.19
     * @private
     */
    this.joinRoomManager = {
      timestamp: 0,
      socketsFn: [],
    };
    /**
     * Stores the unique random number used for generating the "client_id".
     * @name statIdRandom
     * @type number
     * @since 0.6.31
     * @private
     */
    this.statIdRandom = Date.now() + Math.floor(Math.random() * 100000000);
    /**
     * Stores the list of RTMP Sessions.
     * @name rtmpSessions
     * @type JSON
     * @since 0.6.36
     * @private
     */
    this.rtmpSessions = {};
    /**
     * Stores the SM Protocol Version
     * @type {String}
     */
    this.SMProtocolVersion = SM_PROTOCOL_VERSION;
    /**
     * Stores the DT Protocol Version
     * @type {String}
     */
    this.DTProtocolVersion = DT_PROTOCOL_VERSION;
    /**
     * Originally negotiated DTLS role of this peer.
     * @name originalDTLSRole
     * @type string
     * @since 1.0.0
     * @private
     */
    this.originalDTLSRole = null;
    /**
     * Offer buffered in order to apply when received answer
     * @name bufferedLocalOffer
     * @type Object
     * @private
     * @since 1.0.0
     */
    this.bufferedLocalOffer = {};
    /**
     * Offers buffered in order to apply when answerAck has been received
     * @name bufferedRemoteOffers
     * @type Object
     * @private
     * @since 2.0.0
     */
    this.bufferedRemoteOffers = {};
    /**
     * Map of RTCRTPSenders that are added via addTrack
     * @name currentRTCRTPSenders
     * @type Object
     * @private
     * @since 1.0.0
     */
    this.currentRTCRTPSenders = {};
    /**
     * Stores the unique random number used for generating the "client_id".
     * @name clientId
     * @type string
     * @private
     * @since 0.6.31
     */
    this.clientId = generateUUID();
    /**
     * Stores all the Stream media status.
     * @name streamsMediaStatus
     * @type Object
     * @private
     * @since 1.0.0
     */
    this.streamsMediaStatus = {};
    /**
     * Stores the media info of all peers.
     * @name peerMedias
     * @type Object
     * @private
     * @since 2.0.0
     */
    this.peerMedias = {};
    /**
     * Stores the remote streams of all peers.
     * @name remoteStreams
     * @type Object
     * @private
     * @since 2.0.0
     */
    this.remoteStreams = {};
    /**
     * Stores the flag if messages should be persisted. Value determined by the hasPersistentMessage value returned from the API.
     * This feature is enabled in the Temasys Developer Console by toggling the Persistent Message feature at the key level.
     * @name hasPersistentMessage
     * @type Object
     * @private
     * @since 2.0.0
     */
    this.hasPersistentMessage = initOptions.hasPersistentMessage;
  }
}
export default SkylinkState;
