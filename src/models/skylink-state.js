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
     * Stores the api response.
     * @name apiResponse
     * @type {SkylinkApiResponse}
     * @since 2.0.0
     * @private
     */
    this.apiResponse = {};
    /**
     * Stores the list of Peer DataChannel connections.
     * @name peerDataChannels
     * @type {Object}
     * @property {String} peerId - The list of DataChannels associated with Peer ID.
     * @property {RTCDataChannel} channelLabel - The DataChannel connection.
     * The property name <code>"main"</code> is reserved for messaging Datachannel type.
     * @since 0.2.0
     * @private
     */
    this.peerDataChannels = {};
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
     * Stores the User connection priority weight received from signalling server inRoom message.
     * In case of crossing offers, the offer that contains the lower weight will be dropped.
     * @name peerPriorityWeight
     * @type number
     * @since 0.5.0
     * @private
     */
    this.peerPriorityWeight = 0;
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
     * Stores the value if ICE restart is supported.
     * @name enableIceRestart
     * @type boolean
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
      bAS: {},
    };
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
     * Stores the flag if voice activity detection should be enabled.
     * @name voiceActivityDetection
     * @type boolean
     * @default true
     * @since 0.6.18
     * @private
     */
    this.voiceActivityDetection = true;
    /**
     * Stores the list of RTMP Sessions.
     * @name rtmpSessions
     * @type JSON
     * @since 0.6.36
     * @private
     */
    this.rtmpSessions = {};
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
    this.clientId = initOptions.clientId;
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
     * Stores the flag if messages should be persisted. Value determined by the hasPersistentMessage value returned from the API.
     * This feature is enabled in the Temasys Developer Console by toggling the Persistent Message feature at the key level.
     * @name hasPersistentMessage
     * @type Object
     * @private
     * @since 2.0.0
     */
    this.hasPersistentMessage = initOptions.hasPersistentMessage;
    this.peerStreams = {};
    this.streamsSettings = {};
    this.enableStatsGathering = initOptions.enableStatsGathering;
    this.dataTransfers = {};
    /**
     * Stores the negotiation state keyed by peerId
     * @type {{}}
     */
    this.negotiationState = {};
  }
}
export default SkylinkState;
