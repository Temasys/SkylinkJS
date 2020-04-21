const MESSAGES = {
  INIT: {
    ERRORS: {
      NO_ADAPTER: 'AdapterJS dependency is not loaded or incorrect AdapterJS dependency is used',
      NO_SOCKET_IO: 'Socket.io not loaded - Please load socket.io',
      NO_FETCH_SUPPORT: 'Fetch API is not supported in your browser. Please make sure you are using a modern browser: https://caniuse.com/#search=fetch',
      NO_APP_KEY: 'Please provide an App Key - Get one at console.temasys.io!',
      AUTH_CORS: 'Promise rejected due to CORS forbidden request - Please visit: http://support.temasys.com.sg/support/solutions/articles/12000006761-i-get-a-403-forbidden-access-is-denied-when-i-load-the-application-why-',
      AUTH_GENERAL: 'Promise rejected due to network issue',
      SOCKET_CREATE_FAILED: 'Failed creating socket connection object ->',
      SOCKET_ERROR_ABORT: 'Reconnection aborted as the connection timed out or there no more available ports, transports and final attempts left',
    },
    INFO: {
      API_SUCCESS: 'Promise resolved: APP Authenticated Successfully!',
    },
  },
  JOIN_ROOM: {
    ERRORS: {
      CODEC_SUPPORT: 'No audio/video codecs available to start connection',
    },
  },
  ROOM: {
    ERRORS: {
      STOP: {
        SCREEN_SHARE: 'Error stopping screenshare',
      },
      NOT_IN_ROOM: 'User is not in room',
      NO_PEERS: 'No peers in room',
    },
    LEAVE_ROOM: {
      ERROR: 'Leave room error -->',
      NO_PEERS: 'No peers in room',
      DROPPING_HANGUP: 'Dropping hang-up from remote peer',
      LEAVE_ALL_ROOMS: {
        SUCCESS: 'Successfully left all rooms',
        ERROR: 'Leave all rooms error -->',
      },
      PEER_LEFT: {
        START: 'Initiating peer left process',
        SUCCESS: 'Successfully completed peer left process',
        ERROR: 'Failed peer left process',
      },
      SENDING_BYE: 'Sending bye message to all peers',
      DISCONNECT_SOCKET: {
        SUCCESS: 'Successfully disconnected socket',
      },
      REMOVE_STATE: {
        SUCCESS: 'Successfully removed room state',
      },
    },
  },
  ROOM_STATE: {
    NOT_FOUND: 'Could not retrieve room state for room name/key',
    LEFT: 'Peer left room',
    NO_ROOM_NAME: 'No room name specified',
  },
  PEER_INFORMATIONS: {
    NO_PEER_INFO: 'Not able to retrieve Peer Information for peerId:',
    UPDATE_USER_DATA: 'Peer updated userData: ',
    OUTDATED_MSG: 'Dropping outdated status ->',
    USER_DATA_NOT_JSON: 'UserData is not JSON',
  },
  PEER_CONNECTION: {
    NO_PEER_CONNECTION: 'No Peer Connection detected',
    ERRORS: {
      REMOVE_TRACK: 'Error removing track from peer connection',
      REPLACE_TRACK: 'Error replacing track in peer connection',
      REFRESH: 'Error refreshing peer connection',
    },
    end_of_candidates: 'Signaling of end-of-candidates remote ICE gathering',
    end_of_candidate_failure: 'Failed signaling end-of-candidates ->',
    not_initialised: 'Peer connection is not initialised',
    getstats_api_not_available: 'getStats() API is not available',
    connection_status_no_pc: 'There is currently no peer connections to retrieve connection status',
    ice_connection_state: 'Ice connection state changed ->',
    peer_connection_state: 'Peer connection state changed ->',
    ice_gathering_state: 'Ice gathering state changed ->',
    refresh_start: 'START: Refreshing peer connections',
    refresh_failed: 'FAILED: Refreshing peer connections',
    refresh_completed: 'All peer connections refreshed with resolve or errors',
    refresh_peer_failed: 'Peer connection failed to refresh: ',
    refresh_peer_success: 'Peer connection refreshed successfully: ',
    refresh_no_peer_connection: 'There is currently no peer connections to restart',
    refresh_peerId_no_match: 'PeerId does not match existing peer connections',
    refresh_no_edge_support: 'Edge browser currently does not support renegotiation',
    refresh_not_supported: 'Failed restarting with other agents connecting from other SDKs as re-negotiation is not supported by other SDKs',
    peerId_does_not_exist: 'Peer Id does not exist ->',
  },
  PEER_PRIVILEGED: {
    not_privileged: 'Please upgrade your key to privileged to use this function',
    no_appkey: 'App key is not defined - Please authenticate again',
    getPeerListFromServer: 'Enquired server for peers within the App space',
  },
  ICE_CANDIDATE: {
    CANDIDATE_HANDLER: {
      DROPPING_CANDIDATE: 'Dropping ICE candidate',
      INVALID_CANDIDATE: 'Received invalid ICE candidate message ->',
      VALID_CANDIDATE: 'Received ICE candidate ->',
      FILTERED_CANDIDATE: 'Dropping received ICE candidate as it matches ICE candidate filtering flag ->',
      FILTERING_FLAG_NOT_HONOURED: 'Not dropping received ICE candidate as TURN connections are enforced as MCU is present (and act as a TURN itself) so filtering of ICE candidate flags are not honoured ->',
      CANDIDATE_ADDED: 'Added ICE candidate successfully',
      ADDING_CANDIDATE: 'Adding ICE Candidate',
      FAILED_ADDING_CANDIDATE: 'Failed adding ICE candidate ->',
      ADD_BUFFERED_CANDIDATE: 'Adding buffered ICE candidate',
      ADD_CANDIDATE_TO_BUFFER: 'Adding ICE candidate to buffer',
      END_OF_CANDIDATES_SUCCESS: 'Signaling of end-of-candidates remote ICE gathering',
      END_OF_CANDIDATES_FAILURE: 'Failed signaling of end-of-candidates remote ICE gathering',
      ICE_GATHERING_STARTED: 'ICE gathering has started',
      ICE_GATHERING_COMPLETED: 'ICE gathering has completed',
      CANDIDATE_GENERATED: 'Generated ICE candidate ->',
      DROP_EOC: 'Dropping of sending ICE candidate end-of-candidates signal or unused ICE candidates to prevent errors ->',
      ICE_TRICKLE_DISABLED: 'Dropping of sending ICE candidate as trickle ICE is disabled ->',
      SENDING_CANDIDATE: 'Sending ICE candidate ->',
      NO_SDP: 'Not sending any session description after ICE gathering completed as it is not present',
    },
  },
  SESSION_DESCRIPTION: {
    parsing_media_ssrc: 'Parsing session description media SSRCs ->',
  },
  DATA_CHANNEL: {
    reviving_dataChannel: 'Reviving Datachannel connection',
    refresh_error: 'Not a valid Datachannel connection',
    CLOSING: 'Closing DataChannel',
    closed: 'Datachannel has closed',
    onclose_error: 'Error in data-channel onclose callback',
    NO_REMOTE_DATA_CHANNEL: 'Remote peer does not have data channel',
    ERRORS: {
      FAILED_CLOSING: 'Failed closing DataChannels --> ',
      NO_SESSIONS: 'Peer Connection does not have DataChannel sessions',
    },
  },
  NEGOTIATION_PROGRESS: {
    SET_LOCAL_DESCRIPTION: 'Successfully set local description -->',
    SET_REMOTE_DESCRIPTION: 'Successfully set remote description -->',
    APPLYING_BUFFERED_REMOTE_OFFER: 'Applying buffered remote offer',
    ERRORS: {
      FAILED_SET_LOCAL_DESCRIPTION: 'Failed setting local description -->',
      FAILED_SET_REMOTE_DESCRIPTION: 'Failed setting remote description -->',
      FAILED_SET_REMOTE_ANSWER: 'Peer failed to set remote answer.',
      FAILED_RENEGOTIATION: 'Failed renegotiation after answerAck',
      NOT_STABLE: 'Dropping of message as signaling state is not stable',
      PROCESSING_EXISTING_SDP: 'Dropping message as there is another sessionDescription being processed -->',
      OFFER_TIEBREAKER: 'Dropping the received offer: self weight is greater than incoming offer weight -->',
      NO_LOCAL_BUFFERED_OFFER: 'FATAL: No buffered local offer found - Unable to setLocalDescription',
      ADDING_REMOTE_OFFER_TO_BUFFER: 'Adding remote offer received to buffer as current negotiation has not completed',
    },
  },
  SIGNALING: {
    MESSAGE_ADDED_TO_BUFFER: 'Message buffered as enter message has not been sent',
    ENTER_LISTENER: 'Enter listener initialized',
    BUFFERED_MESSAGES_SENT: 'Buffered messages sent',
    BUFFERED_MESSAGES_DROPPED: 'Buffered messages dropped - no mid',
    OUTDATED_MSG: 'Dropping outdated status ->',
    DROPPING_MUTE_EVENT: 'Dropping mute audio / video event message as it is processed by mediaInfoEvent',
    BUFFER_NOT_NEEDED: 'Enter message sent. Messages do not need to be buffered',
    ABORTING_OFFER: 'Aborting offer as current negotiation has not completed',
  },
  MESSAGING: {
    PRIVATE_MESSAGE: 'Sending private message to Peer',
    BROADCAST_MESSAGE: 'Broadcasting message to Peers',
    RECEIVED_MESSAGE: 'Received message from Peer',
    PERSISTENCE: {
      SEND_MESSAGE: 'Sending persisted message',
      NOT_PERSISTED: 'Message will not be persisted as persistent flag is set to false',
      STORED_MESSAGES: 'Received stored messages for room',
      IS_PERSISTENT_CONFIG: 'Persistent message flag is set to',
      ERRORS: {
        FAILED_SETTING_PERSISTENCE: 'Failed setting persistent message flag',
        INVALID_TYPE: 'Persistent message flag must be of type boolean',
        PRIVATE_MESSAGE: 'Cannot persist private messages',
        PERSISTENT_MESSAGE_FEATURE_NOT_ENABLED: 'Persistent Message feature is not enabled. Enable'
          + ' this feature on the key under \'Advanced Settings\' in the Temasys Console',
      },
    },
    ENCRYPTION: {
      SEND_MESSAGE: 'Sending encrypted message',
      DELETE_ALL: 'Deleting all stored secrets',
      ERRORS: {
        FAILED_DECRYPTING_MESSAGE: 'Failed decrypting message',
        ENCRYPT_SECRET: 'Incorrect secret provided',
        INVALID_SECRETS: 'No or invalid secret and secret id provided',
        SET_SELECTED_SECRET: 'Failed setting selected secret',
        DELETE_ENCRYPT_SECRETS: 'Failed deleting secret',
        SET_ENCRYPT_SECRET: 'Failed setting secret',
        SECRET_ID_NOT_FOUND: 'Secret id not found',
        NO_SECRET_OR_SECRET_ID: 'Secret and / or secret id not provided',
        INVALID_TYPE: 'Secret and secret id must be of type string and not empty',
        SECRET_ID_NOT_UNIQUE: 'Secret id provided is not unique',
        SECRET_ID_NOT_SELECTED: 'Secret id not selected',
        SECRET_ID_NOT_PROVIDED: 'Secret id not provided',
        SECRETS_NOT_PROVIDED: 'Secrets not provided',
      },
    },
    ERRORS: {
      DROPPING_MESSAGE: 'Dropping message',
      FAILED_SENDING_MESSAGE: 'Failed to send user message',
    },
  },
  MEDIA_INFO: {
    UPDATE_SUCCESS: 'Successfully updated media info',
    ERRORS: {
      NO_ASSOCIATED_STREAM_ID: 'There is no streamId associated with the mediaId and transceiverMid pair',
      FAILED_PROCESSING_MEDIA_INFO_EVENT: 'Failed to process mediaInfoEvent message',
      FAILED_UPDATING: 'Failed to update media info',
      FAILED_PROCESSING_PEER_MEDIA: 'Failed to process media info',
      FAILED_UPDATING_TRANSCEIVER_MID: 'Failed updating media info transceiverMid after setLocalDescription',
      FAILED_SETTING_PEER_MEDIA_INFO: 'Failed setting peer media at offer / answer',
    },
    WARN: {
      READ_ONLY_VALUE: 'Attempting to change media info read only value: ',
      INVALID_MEDIA_TYPE: 'Invalid media info media type: ',
    },
    VIDEO_STATE_CHANGE: 'Peers\'s video state changed to ->',
    AUDIO_STATE_CHANGE: 'Peers\'s audio state changed to ->',
    VIDEO_SCREEN_STATE_CHANGE: 'Peers\'s video screen state changed to ->',
  },
  MEDIA_STREAM: {
    STOP_SETTINGS: 'Stopped streams with settings:',
    STOP_SUCCESS: 'Successfully stopped and removed stream from state',
    REMOTE_TRACK_REMOVED: 'Remote MediaStreamTrack removed',
    START_FALLBACK: 'Fall back to retrieve audio only stream',
    NO_OPTIONS: 'No user media options provided',
    DEFAULT_OPTIONS: 'Using default options',
    FALLBACK_SUCCESS: 'Successfully retrieved audio fallback stream',
    START_SCREEN_SUCCESS: 'Successfully retrieved screen share stream',
    STOP_SCREEN_SUCCESS: 'Successfully stopped screen share stream',
    UPDATE_MUTED_SETTINGS: 'Updated stream muted setting',
    UPDATE_MEDIA_STATUS: 'Updated stream media status',
    AUDIO_MUTED: 'Peers\'s audio muted: ',
    VIDEO_MUTED: 'Peers\'s video muted: ',
    ERRORS: {
      STOP_SCREEN: 'Error stopping screen share stream',
      START_SCREEN: 'Error starting screen share stream',
      STOP_ADDED_STREAM: 'Error stopping added stream',
      STOP_REPLACED_STREAM: 'Error stopping replaced stream',
      STOP_USER_MEDIA: 'Error stopping user media',
      STOP_AUDIO_TRACK: 'Error stopping audio tracks in stream',
      STOP_VIDEO_TRACK: 'Error stopping video tracks in stream',
      STOP_MEDIA_TRACK: 'Error stopping MediaTrack',
      STOP_SCREEN_TRACK: 'Error stopping screen track in stream',
      DROPPING_ONREMOVETRACK: 'Dropping onremovetrack',
      NO_STREAM: 'No stream to process',
      INVALID_STREAM_ID: 'No stream detected with stream id',
      NO_USER_MEDIA_STREAMS: 'No user media streams detected',
      INVALID_STREAM_ID_TYPE: 'Stream id is not a string',
      NO_STREAM_ID: 'No stream id provided',
      PEER_SCREEN_ACTIVE: 'Peer has existing screen share',
      REPLACE_SCREEN: 'Error replacing user media stream with screenshare stream',
      FALLBACK: 'Error retrieving fallback audio stream',
      INVALID_GUM_OPTIONS: 'Invalid user media options',
      GET_USER_MEDIA: 'Error retrieving stream from \'getUserMedia\' method',
      INVALID_MUTE_OPTIONS: 'Invalid muteStreams options provided',
      NO_STREAMS_MUTED: 'No streams to mute',
      SEND_STREAM: 'Error sending stream',
      INVALID_MEDIA_STREAM_ARRAY: 'Array is not of type MediaStream',
      ACTIVE_STREAMS: 'There are currently active streams being sent to remote peers. Please stop streams.',
    },
  },
  STATS_MODULE: {
    NOT_INITIATED: 'Stats Module is not initiated',
    STATS_DISCARDED: 'Stats report discarded as peer has left the room',
    ERRORS: {
      RETRIEVE_STATS_FAILED: 'Failed retrieving stats',
      POST_FAILED: 'Failed posting to stats api',
      PARSE_FAILED: 'Failed parsing stats report',
      STATS_IS_NULL: 'Stats object is null',
      INVALID_TRACK_KIND: 'Media kind is not audio or video',
    },
    HANDLE_ICE_GATHERING_STATS: {
      PROCESS_FAILED: 'process_failed',
      PROCESS_SUCCESS: 'process_success',
      PROCESSING: 'processing',
      DROPPED: 'dropped',
      BUFFERED: 'buffered',
    },
    HANDLE_NEGOTIATION_STATS: {
      OFFER: {
        create: 'create_offer',
        create_error: 'error_create_offer',
        set: 'set_offer',
        set_error: 'error_set_offer',
        offer: 'offer',
        dropped: 'dropped_offer',
      },
      ANSWER: {
        create: 'create_answer',
        create_error: 'error_create_answer',
        set: 'set_answer',
        set_error: 'error_set_ANSWER',
        answer: 'answer',
        dropped: 'dropped_answer',
      },
    },
    HANDLE_DATA_CHANNEL_STATS: {
      open: 'open',
      closed: 'closed',
      reconnecting: 'reconnecting',
    },
    HANDLE_CONNECTION_STATS: {},
    HANDLE_BANDWIDTH_STATS: {
      RETRIEVE_FAILED: 'Failed posting bandwidth stats: ',
      NO_STATE: 'No room state',
    },
    HANDLE_ICE_CONNECTION_STATS: {
      RETRIEVE_FAILED: 'Failed retrieving stats: ',
      SEND_FAILED: 'Failed sending ice connection stats: ',
    },
    HANDLE_RECORDING_STATS: {
      START: 'start',
      STOP: 'stop',
      REQUEST_START: 'request-start',
      REQUEST_STOP: 'request-stop',
      ERROR_NO_MCU_START: 'error-no-mcu-start',
      ERROR_NO_MCU_STOP: 'error-no-mcu-stop',
      ERROR_START_ACTIVE: 'error-start-when-active',
      ERROR_STOP_ACTIVE: 'error-stop-when-active',
      ERROR_MIN_STOP: 'error-min-stop',
      MCU_RECORDING_ERROR: 'mcu-recording-error',
    },
  },
  RECORDING: {
    START_SUCCESS: 'Started recording',
    STOP_SUCCESS: 'Stopped recording',
    START_FAILED: 'Failed to start recording',
    STOP_FAILED: 'Failed to stop recording',
    MIN_RECORDING_TIME_REACHED: '4 seconds has been recorded - Recording can be stopped now',
    ERRORS: {
      MCU_NOT_CONNECTED: 'MCU is not connected',
      EXISTING_RECORDING_IN_PROGRESS: 'There is an existing recording in-progress',
      NO_RECORDING_IN_PROGRESS: 'There is no existing recording in-progress',
      MIN_RECORDING_TIME: '4 seconds has not been recorded yet',
      STOP_ABRUPT: 'Recording stopped abruptly before 4 seconds',
      SESSION_EMPTY: 'Received request of "off" but the session is empty',
      MCU_RECORDING_ERROR: 'Recording error received from MCU',
    },
  },
  RTMP: {
    start_no_mcu: 'Unable to start RTMP session as MCU is not connected',
    stop_no_mcu: 'Unable to stop RTMP as MCU is not connected',
    start_no_stream_id: 'Unable to start RTMP Session stream id is missing',
    start_no_endpoint: 'Unable to start RTMP Session as Endpoint is missing',
    starting_rtmp: 'Starting RTMP Session',
    stopping_rtmp: 'Stopping RTMP Session',
    message_received_from_sig: 'Received RTMP Session message ->',
    stop_session_empty: 'Received request of "off" but the session is empty',
    stopped_success: 'Stopped RTMP Session',
    started_success: 'Started RTMP Session',
    error_session_empty: 'Received error but the session is empty ->',
    error_session: 'RTMP session failure ->',
    error_Session_abrupt: 'Stopped RTMP session abruptly',
  },
  PERSISTENT_MESSAGE: {
    ERRORS: {
      NO_DEPENDENCY: 'CryptoJS is not available',
    },
  },
  UTILS: {
    INVALID_BROWSER_AGENT: 'Invalid browser agent',
  },
  LOGGER: {
    EVENT_DISPATCHED: 'Event dispatched',
    EVENT_REGISTERED: 'Event successfully registered',
    EVENT_UNREGISTERED: 'Event successfully unregistered',
    EVENT_DISPATCH_ERROR: 'Error dispatching event',
    EVENT_REGISTER_ERROR: 'Error registering event',
    EVENT_UNREGISTER_ERROR: 'Error unregistering event',
    LOGS_NOT_STORED: 'Store logs feature is not enabled. Enable it via SkylinkLogger.setLevel(logLevel, storeLogs)',
    LOGS_CLEARED: 'Stored logs cleared',
    INVALID_CB: 'Dropping listener as it is not a function',
  },
  BROWSER_AGENT: {
    REACT_NATIVE: {
      ERRORS: {
        DROPPING_ONREMOVETRACK: 'Dropping onremovetrack as trackInfo is malformed',
      },
    },
  },
};

export default MESSAGES;
