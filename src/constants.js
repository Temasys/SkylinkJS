import * as SkylinkEventsConstants from './skylink-events/constants';

/**
 * @namespace SkylinkConstants
 * @description
 * <ul>
 *  <li>{@link SkylinkConstants.BUNDLE_POLICY|BUNDLE_POLICY} </li>
 *  <li>{@link SkylinkConstants.CANDIDATE_GENERATION_STATE|CANDIDATE_GENERATION_STATE} </li>
 *  <li>{@link SkylinkConstants.CANDIDATE_PROCESSING_STATE|CANDIDATE_PROCESSING_STATE} </li>
 *  <li>{@link SkylinkConstants.DATA_CHANNEL_STATE|DATA_CHANNEL_STATE} </li>
 *  <li>{@link SkylinkConstants.DATA_CHANNEL_TYPE|DATA_CHANNEL_TYPE} </li>
 *  <li>{@link SkylinkConstants.DATA_CHANNEL_MESSAGE_ERROR|DATA_CHANNEL_MESSAGE_ERROR} </li>
 *  <li>{@link SkylinkEvents|EVENTS} </li>
 *  <li>{@link SkylinkConstants.GET_CONNECTION_STATUS_STATE|GET_CONNECTION_STATUS_STATE} </li>
 *  <li>{@link SkylinkConstants.GET_PEERS_STATE|GET_PEERS_STATE} </li>
 *  <li>{@link SkylinkConstants.HANDSHAKE_PROGRESS|HANDSHAKE_PROGRESS} </li>
 *  <li>{@link SkylinkConstants.ICE_CONNECTION_STATE|ICE_CONNECTION_STATE} </li>
 *  <li>{@link SkylinkConstants.LOG_LEVEL|LOG_LEVEL} </li>
 *  <li>{@link SkylinkConstants.MEDIA_ACCESS_FALLBACK_STATE|MEDIA_ACCESS_FALLBACK_STATE} </li>
 *  <li>{@link SkylinkConstants.MEDIA_SOURCE|MEDIA_SOURCE} </li>
 *  <li>{@link SkylinkConstants.MEDIA_STATUS|MEDIA_STATUS} </li>
 *  <li>{@link SkylinkConstants.MEDIA_TYPE|MEDIA_TYPE} </li>
 *  <li>{@link SkylinkConstants.MEDIA_STATE|MEDIA_STATE} </li>
 *  <li>{@link SkylinkConstants.PEER_CERTIFICATE|PEER_CERTIFICATE} </li>
 *  <li>{@link SkylinkConstants.PEER_CONNECTION_STATE|PEER_CONNECTION_STATE} </li>
 *  <li>{@link SkylinkConstants.READY_STATE_CHANGE_ERROR|READY_STATE_CHANGE_ERROR} </li>
 *  <li>{@link SkylinkConstants.READY_STATE_CHANGE|READY_STATE_CHANGE} </li>
 *  <li>{@link SkylinkConstants.RTCP_MUX_POLICY|RTCP_MUX_POLICY} </li>
 *  <li>{@link SkylinkConstants.RTMP_STATE|RTMP_STATE} </li>
 *  <li>{@link SkylinkConstants.RECORDING_STATE|RECORDING_STATE} </li>
 *  <li>{@link SkylinkConstants.SDP_SEMANTICS|SDP_SEMANTICS} </li>
 *  <li>{@link SkylinkConstants.SERVER_PEER_TYPE|SERVER_PEER_TYPE} </li>
 *  <li>{@link SkylinkConstants.SOCKET_ERROR|SOCKET_ERROR} </li>
 *  <li>{@link SkylinkConstants.SOCKET_FALLBACK|SOCKET_FALLBACK} </li>
 *  <li>{@link SkylinkConstants.SYSTEM_ACTION|SYSTEM_ACTION} </li>
 *  <li>{@link SkylinkConstants.SYSTEM_ACTION_REASON|SYSTEM_ACTION_REASON} </li>
 *  <li>{@link SkylinkConstants.SM_PROTOCOL_VERSION|SM_PROTOCOL_VERSION} </li>
 *  <li>{@link SkylinkConstants.TURN_TRANSPORT|TURN_TRANSPORT} </li>
 *  <li>{@link SkylinkConstants.VIDEO_RESOLUTION|VIDEO_RESOLUTION} </li>
 *  <li>{@link SkylinkConstants.VIDEO_QUALITY|VIDEO_QUALITY} </li>
 * </ul>
 */

/**
 *  // Not implemented yet
 *  {@link SkylinkConstants.DATA_TRANSFER_DATA_TYPE|DATA_TRANSFER_DATA_TYPE} </br>
 *  {@link SkylinkConstants.DT_PROTOCOL_VERSION|DT_PROTOCOL_VERSION} </br>
 *  {@link SkylinkConstants.DATA_TRANSFER_TYPE|DATA_TRANSFER_TYPE} </br>
 *  {@link SkylinkConstants.DATA_TRANSFER_SESSION_TYPE|DATA_TRANSFER_SESSION_TYPE} </br>
 *  {@link SkylinkConstants.DATA_TRANSFER_STATE|DATA_TRANSFER_STATE} </br>
 *  {@link SkylinkConstants.DATA_STREAM_STATE|DATA_STREAM_STATE} </br>
 *  {@link SkylinkConstants.INTRODUCE_STATE|INTRODUCE_STATE} </br>
 *  {@link SkylinkConstants.REGIONAL_SERVER|REGIONAL_SERVER} </br>
 *  {@link SkylinkConstants.PRIORITY_WEIGHT_SCHEME|PRIORITY_WEIGHT_SCHEME} </br>
 *  {@link SkylinkConstants.CHUNK_FILE_SIZE|CHUNK_FILE_SIZE} </br>
 *  {@link SkylinkConstants.MOZ_CHUNK_FILE_SIZE|MOZ_CHUNK_FILE_SIZE} </br>
 *  {@link SkylinkConstants.BINARY_FILE_SIZE|BINARY_FILE_SIZE} </br>
 *  {@link SkylinkConstants.MOZ_BINARY_FILE_SIZE|MOZ_BINARY_FILE_SIZE} </br>
 *  {@link SkylinkConstants.CHUNK_DATAURL_SIZE|CHUNK_DATAURL_SIZE} </br>
 *  {@link SkylinkConstants.DC_PROTOCOL_TYPE|DC_PROTOCOL_TYPE} </br>
 *  // Private
 *  {@link SkylinkConstants.SIG_MESSAGE_TYPE|SIG_MESSAGE_TYPE} </br>
 *  {@link SkylinkConstants.STREAM_STATUS|STREAM_STATUS} </br>
 *  {@link SkylinkConstants.GROUP_MESSAGE_LIST|GROUP_MESSAGE_LIST} </br>
 *  {@link SkylinkConstants.TAGS|TAGS} </br>
 *  {@link SkylinkConstants.TRACK_READY_STATE|TRACK_READY_STATE} </br>
 *  {@link SkylinkConstants.TRACK_KIND|TRACK_KIND} </br>
 *  {@link SkylinkConstants.MEDIA_INFO|MEDIA_INFO} </br>
 *  {@link SkylinkConstants.SDK_VERSION|SDK_VERSION} </br>
 *  {@link SkylinkConstants.SDK_NAME|SDK_NAME} </br>
 *  {@link SkylinkConstants.API_VERSION|API_VERSION} </br>
 *  {@link SkylinkConstants.SIGNALING_VERSION|SIGNALING_VERSION} </br>
 *  {@link SkylinkConstants.BROWSER_AGENT|BROWSER_AGENT} </br>
 *  {@link SkylinkConstants.PEER_TYPE|PEER_TYPE} </br>
 *  {@link SkylinkConstants.SOCKET_EVENTS|SOCKET_EVENTS} </br>
 *  {@link SkylinkConstants.SOCKET_TYPE|SOCKET_TYPE} </br>
 *  {@link SkylinkConstants.STATES|STATES} </br>
 */

/**
 * The list of Datachannel connection states.
 * @typedef DATA_CHANNEL_STATE
 * @property {String} CONNECTING          Value <code>"connecting"</code>
 *   The value of the state when Datachannel is attempting to establish a connection.
 * @property {String} OPEN                Value <code>"open"</code>
 *   The value of the state when Datachannel has established a connection.
 * @property {String} CLOSING             Value <code>"closing"</code>
 *   The value of the state when Datachannel connection is closing.
 * @property {String} CLOSED              Value <code>"closed"</code>
 *   The value of the state when Datachannel connection has closed.
 * @property {String} ERROR               Value <code>"error"</code>
 *   The value of the state when Datachannel has encountered an exception during connection.
 * @property {String} CREATE_ERROR        Value <code>"createError"</code>
 *   The value of the state when Datachannel has failed to establish a connection.
 * @property {String} BUFFERED_AMOUNT_LOW Value <code>"bufferedAmountLow"</code>
 *   The value of the state when Datachannel when the amount of data buffered to be sent
 *   falls below the Datachannel threshold.
 *   This state should occur only during after {@link Skylink#sendBlobData|sendBlobData} or {@link Skylink#sendURLData|sendURLData} or
 *   {@link Skylink#sendP2PMessage|sendP2PMessage}.
 * @property {String} SEND_MESSAGE_ERROR  Value <code>"sendMessageError"</code>
 *   The value of the state when Datachannel when data transfer packets or P2P message fails to send.
 *   This state should occur only during after {@link Skylink#sendBlobData|sendBlobData} or {@link Skylink#sendURLData|sendURLData} or
 *   {@link Skylink#sendP2PMessage|sendP2PMessage}.
 * @constant
 * @type object
 * @readOnly
 * @since 0.1.0
 * @memberOf SkylinkConstants
 */
export const DATA_CHANNEL_STATE = {
  CONNECTING: 'connecting',
  OPEN: 'open',
  CLOSING: 'closing',
  CLOSED: 'closed',
  ERROR: 'error',
  CREATE_ERROR: 'createError',
  BUFFERED_AMOUNT_LOW: 'bufferedAmountLow',
  SEND_MESSAGE_ERROR: 'sendMessageError',
};

/**
 * The list of Datachannel types.
 * @typedef DATA_CHANNEL_TYPE
 * @property {String} MESSAGING Value <code>"messaging"</code>
 *   The value of the Datachannel type that is used only for messaging in
 *   {@link Skylink#sendP2PMessage|sendP2PMessage}.
 *   However for Peers that do not support simultaneous data transfers, this Datachannel
 *   type will be used to do data transfers (1 at a time).
 *   Each Peer connections will only have one of this Datachannel type and the
 *   connection will only close when the Peer connection is closed (happens when {@link SkylinkEvents.event:PEER_CONNECTION_STATE|PEER CONNECTION
  *   STATE} event triggers parameter payload <code>state</code> as
 *   <code>CLOSED</code> for Peer).
 * @property {String} DATA [UNAVAILABLE] Value <code>"data"</code>
 *   The value of the Datachannel type that is used only for a data transfer in
 *   {@link Skylink#sendURLData|sendURLData} and
 *   {@link Skylink#sendBlobData|sendBlobData}.
 *   The connection will close after the data transfer has been completed or terminated (happens when
 *   {@link SkylinkEvents.event:DATA_TRANSFER_STATE|DATA TRANSFER STATE} triggers parameter payload
 *   <code>state</code> as <code>DOWNLOAD_COMPLETED</code>, <code>UPLOAD_COMPLETED</code>,
 *   <code>REJECTED</code>, <code>CANCEL</code> or <code>ERROR</code> for Peer).
 * @constant
 * @type object
 * @readOnly
 * @since 0.6.1
 * @memberOf SkylinkConstants
 */
export const DATA_CHANNEL_TYPE = {
  MESSAGING: 'messaging',
  DATA: 'data',
};

/**
 * The list of Datachannel sending message error types.
 * @typedef DATA_CHANNEL_MESSAGE_ERROR
 * @property {String} MESSAGE  Value <code>"message"</code>
 *   The value of the Datachannel sending message error type when encountered during
 *   sending P2P message from {@link Skylink#sendP2PMessage|sendP2PMessage}.
 * @property {String} TRANSFER Value <code>"transfer"</code>
 *   The value of the Datachannel sending message error type when encountered during
 *   data transfers from {@link Skylink#sendURLData|sendURLData} or
 *   {@link Skylink#sendBlobData|sendBlobData}.
 * @constant
 * @type object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.6.16
 */
export const DATA_CHANNEL_MESSAGE_ERROR = {
  MESSAGE: 'message',
  TRANSFER: 'transfer',
};

/**
 * The list of supported data transfer data types.
 * @typedef DATA_TRANSFER_DATA_TYPE
 * @property {String} BINARY_STRING Value <code>"binaryString"</code>
 *   The value of data transfer data type when Blob binary data chunks encoded to Base64 encoded string are
 *   sent or received over the Datachannel connection for the data transfer session.
 *   Used only in {@link Skylink#sendBlobData|sendBlobData} when
 *   parameter <code>sendChunksAsBinary</code> value is <code>false</code>.
 * @property {String} ARRAY_BUFFER  Value <code>"arrayBuffer"</code>
 *   The value of data transfer data type when ArrayBuffer binary data chunks are
 *   sent or received over the Datachannel connection for the data transfer session.
 *   Used only in {@link Skylink#sendBlobData|sendBlobData} when
 *   parameter <code>sendChunksAsBinary</code> value is <code>true</code>.
 * @property {String} BLOB          Value <code>"blob"</code>
 *   The value of data transfer data type when Blob binary data chunks are
 *   sent or received over the Datachannel connection for the data transfer session.
 *   Used only in {@link Skylink#sendBlobData|sendBlobData} when
 *   parameter <code>sendChunksAsBinary</code> value is <code>true</code>.
 * @property {String} STRING        Value <code>"string"</code>
 *   The value of data transfer data type when only string data chunks are
 *   sent or received over the Datachannel connection for the data transfer session.
 *   Used only in {@link Skylink#sendURLData|sendURLData}.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.1.0
 * @ignore
 */
export const DATA_TRANSFER_DATA_TYPE = {
  BINARY_STRING: 'binaryString',
  ARRAY_BUFFER: 'arrayBuffer',
  BLOB: 'blob',
  STRING: 'string',
};

/**
 * <blockquote class="info">
 *   Note that this is used only for SDK developer purposes.<br>
 *   Current version: <code>0.1.3</code>
 * </blockquote>
 * The value of the current version of the data transfer protocol.
 * @typedef DT_PROTOCOL_VERSION
 * @type string
 * @private
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.5.10
 */
export const DT_PROTOCOL_VERSION = '0.1.3';

/**
 * The list of data transfers directions.
 * @typedef DATA_TRANSFER_TYPE
 * @property {String} UPLOAD Value <code>"upload"</code>
 *   The value of the data transfer direction when User is uploading data to Peer.
 * @property {String} DOWNLOAD Value <code>"download"</code>
 *   The value of the data transfer direction when User is downloading data from Peer.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.1.0
 * @ignore
 */
export const DATA_TRANSFER_TYPE = {
  UPLOAD: 'upload',
  DOWNLOAD: 'download',
};

/**
 * The list of data transfers session types.
 * @typedef DATA_TRANSFER_SESSION_TYPE
 * @property {String} BLOB     Value <code>"blob"</code>
 *   The value of the session type for
 *   {@link Skylink#sendURLData|sendURLData} data transfer.
 * @property {String} DATA_URL Value <code>"dataURL"</code>
 *   The value of the session type for
 *   {@link Skylink#sendBlobData|sendBlobData} data transfer.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.1.0
 * @ignore
 */
export const DATA_TRANSFER_SESSION_TYPE = {
  BLOB: 'blob',
  DATA_URL: 'dataURL',
};

/**
 * The list of data transfer states.
 * @typedef DATA_TRANSFER_STATE
 * @property {String} UPLOAD_REQUEST     Value <code>"request"</code>
 *   The value of the state when receiving an upload data transfer request from Peer to User.
 *   At this stage, the upload data transfer request from Peer may be accepted or rejected with the
 *   {@link Skylink#acceptDataTransfer} invoked by User.
 * @param {String} USER_UPLOAD_REQUEST Value <code>"userRequest"</code>
 *   The value of the state when User sent an upload data transfer request to Peer.
 *   At this stage, the upload data transfer request to Peer may be accepted or rejected with the
 *   {@link Skylink#acceptDataTransfer}invoked by Peer.
 * @property {String} UPLOAD_STARTED     Value <code>"uploadStarted"</code>
 *   The value of the state when the data transfer request has been accepted
 *   and data transfer will start uploading data to Peer.
 *   At this stage, the data transfer may be terminated with the
 *   {@link Skylink#cancelDataTransfer}.
 * @property {String} DOWNLOAD_STARTED   Value <code>"downloadStarted"</code>
 *   The value of the state when the data transfer request has been accepted
 *   and data transfer will start downloading data from Peer.
 *   At this stage, the data transfer may be terminated with the
 *   {@link Skylink#cancelDataTransfer}.
 * @property {String} REJECTED           Value <code>"rejected"</code>
 *   The value of the state when upload data transfer request to Peer has been rejected and terminated.
 * @property {String} USER_REJECTED      Value <code>"userRejected"</code>
 *   The value of the state when User rejected and terminated upload data transfer request from Peer.
 * @property {String} UPLOADING          Value <code>"uploading"</code>
 *   The value of the state when data transfer is uploading data to Peer.
 * @property {String} DOWNLOADING        Value <code>"downloading"</code>
 *   The value of the state when data transfer is downloading data from Peer.
 * @property {String} UPLOAD_COMPLETED   Value <code>"uploadCompleted"</code>
 *   The value of the state when data transfer has uploaded successfully to Peer.
 * @property {String} DOWNLOAD_COMPLETED Value <code>"downloadCompleted"</code>
 *   The value of the state when data transfer has downloaded successfully from Peer.
 * @property {String} CANCEL             Value <code>"cancel"</code>
 *   The value of the state when data transfer has been terminated from / to Peer.
 * @property {String} ERROR              Value <code>"error"</code>
 *   The value of the state when data transfer has errors and has been terminated from / to Peer.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.4.0
 * @ignore
 */
export const DATA_TRANSFER_STATE = {
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
  START_ERROR: 'startError',
};

/**
 * The list of data streaming states.
 * @typedef DATA_STREAM_STATE
 * @property {String} SENDING_STARTED   Value <code>"sendStart"</code>
 *   The value of the state when data streaming session has started from User to Peer.
 * @property {String} RECEIVING_STARTED Value <code>"receiveStart"</code>
 *   The value of the state when data streaming session has started from Peer to Peer.
 * @property {String} RECEIVED          Value <code>"received"</code>
 *   The value of the state when data streaming session data chunk has been received from Peer to User.
 * @property {String} SENT              Value <code>"sent"</code>
 *   The value of the state when data streaming session data chunk has been sent from User to Peer.
 * @property {String} SENDING_STOPPED   Value <code>"sendStop"</code>
 *   The value of the state when data streaming session has stopped from User to Peer.
 * @property {String} RECEIVING_STOPPED Value <code>"receivingStop"</code>
 *   The value of the state when data streaming session has stopped from Peer to User.
 * @property {String} ERROR             Value <code>"error"</code>
 *   The value of the state when data streaming session has errors.
 *   At this stage, the data streaming state is considered <code>SENDING_STOPPED</code> or
 *   <code>RECEIVING_STOPPED</code>.
 * @property {String} START_ERROR       Value <code>"startError"</code>
 *   The value of the state when data streaming session failed to start from User to Peer.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.6.18
 * @ignore
 */
export const DATA_STREAM_STATE = {
  SENDING_STARTED: 'sendStart',
  SENDING_STOPPED: 'sendStop',
  RECEIVING_STARTED: 'receiveStart',
  RECEIVING_STOPPED: 'receiveStop',
  RECEIVED: 'received',
  SENT: 'sent',
  ERROR: 'error',
  START_ERROR: 'startError',
};

/**
 * <blockquote class="info">
 *   Learn more about how ICE works in this
 *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of Peer connection ICE gathering states.
 * @typedef CANDIDATE_GENERATION_STATE
 * @property {String} GATHERING Value <code>"gathering"</code>
 *   The value of the state when Peer connection is gathering ICE candidates.
 *   These ICE candidates are sent to Peer for its connection to check for a suitable matching
 *   pair of ICE candidates to establish an ICE connection for stream audio, video and data.
 *   See {@link SkylinkConstants.ICE_CONNECTION_STATE|ICE_CONNECTION_STATE} for ICE connection status.
 *   This state cannot happen until Peer connection remote <code>"offer"</code> / <code>"answer"</code>
 *   session description is set. See {@link SkylinkConstants.PEER_CONNECTION_STATE|PEER_CONNECTION_STATE} for session description exchanging status.
 * @property {String} COMPLETED Value <code>"completed"</code>
 *   The value of the state when Peer connection gathering of ICE candidates has completed.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.4.1
 */
export const CANDIDATE_GENERATION_STATE = {
  NEW: 'new',
  GATHERING: 'gathering',
  COMPLETED: 'complete',
};

/**
 * <blockquote class="info">
 *   Learn more about how ICE works in this
 *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of Peer connection remote ICE candidate processing states for trickle ICE connections.
 * @typedef CANDIDATE_PROCESSING_STATE
 * @property {String} RECEIVED Value <code>"received"</code>
 *   The value of the state when the remote ICE candidate was received.
 * @property {String} DROPPED  Value <code>"received"</code>
 *   The value of the state when the remote ICE candidate is dropped.
 * @property {String} BUFFERED  Value <code>"buffered"</code>
 *   The value of the state when the remote ICE candidate is buffered.
 * @property {String} PROCESSING  Value <code>"processing"</code>
 *   The value of the state when the remote ICE candidate is being processed.
 * @property {String} PROCESS_SUCCESS  Value <code>"processSuccess"</code>
 *   The value of the state when the remote ICE candidate has been processed successfully.
 *   The ICE candidate that is processed will be used to check against the list of
 *   locally generated ICE candidate to start matching for the suitable pair for the best ICE connection.
 * @property {String} PROCESS_ERROR  Value <code>"processError"</code>
 *   The value of the state when the remote ICE candidate has failed to be processed.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.6.16
 */
export const CANDIDATE_PROCESSING_STATE = {
  RECEIVED: 'received',
  DROPPED: 'dropped',
  BUFFERED: 'buffered',
  PROCESSING: 'processing',
  PROCESS_SUCCESS: 'processSuccess',
  PROCESS_ERROR: 'processError',
};

/**
 * <blockquote class="info">
 *   Learn more about how ICE works in this
 *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of Peer connection ICE connection states.
 * @typedef ICE_CONNECTION_STATE
 * @property {String} CHECKING       Value <code>"checking"</code>
 *   The value of the state when Peer connection is checking for a suitable matching pair of
 *   ICE candidates to establish ICE connection.
 *   Exchanging of ICE candidates happens during {@link SkylinkEvents.event:candidateGenerationState|{@link SkylinkEvents.event:CANDIDATE_GENERATION_STATE|CANDIDATE GENERATION STATE} event}.
 * @property {String} CONNECTED      Value <code>"connected"</code>
 *   The value of the state when Peer connection has found a suitable matching pair of
 *   ICE candidates to establish ICE connection but is still checking for a better
 *   suitable matching pair of ICE candidates for the best ICE connectivity.
 *   At this state, ICE connection is already established and audio, video and
 *   data streaming has already started.
 * @property {String} COMPLETED      Value <code>"completed"</code>
 *   The value of the state when Peer connection has found the best suitable matching pair
 *   of ICE candidates to establish ICE connection and checking has stopped.
 *   At this state, ICE connection is already established and audio, video and
 *   data streaming has already started. This may happen after <code>CONNECTED</code>.
 * @property {String} FAILED         Value <code>"failed"</code>
 *   The value of the state when Peer connection ICE connection has failed.
 * @property {String} DISCONNECTED   Value <code>"disconnected"</code>
 *   The value of the state when Peer connection ICE connection is disconnected.
 *   At this state, the Peer connection may attempt to revive the ICE connection.
 *   This may happen due to flaky network conditions.
 * @property {String} CLOSED         Value <code>"closed"</code>
 *   The value of the state when Peer connection ICE connection has closed.
 *   This happens when Peer connection is closed and no streaming can occur at this stage.
 * @property {String} TRICKLE_FAILED Value <code>"trickleFailed"</code>
 *   The value of the state when Peer connection ICE connection has failed during trickle ICE.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.1.0
 */
export const ICE_CONNECTION_STATE = {
  STARTING: 'starting',
  CHECKING: 'checking',
  CONNECTED: 'connected',
  COMPLETED: 'completed',
  CLOSED: 'closed',
  FAILED: 'failed',
  TRICKLE_FAILED: 'trickleFailed',
  DISCONNECTED: 'disconnected',
};

/**
 * <blockquote class="info">
 *   Note that configuring the protocol may not necessarily result in the desired network transports protocol
 *   used in the actual TURN network traffic as it depends which protocol the browser selects and connects with.
 *   This simply configures the TURN ICE server urls <code?transport=(protocol)</code> query option when constructing
 *   the Peer connection. When all protocols are selected, the ICE servers urls are duplicated with all protocols.
 * </blockquote>
 * The list of TURN network transport protocols options when constructing Peer connections
 * configured in Skylink {@link initOptions}.
 * Example <code>.urls</code> inital input: [<code>"turn:server.com?transport=tcp"</code>,
 * <code>"turn:server1.com:3478"</code>, <code>"turn:server.com?transport=udp"</code>]
 * @typedef TURN_TRANSPORT
 * @property {String} TCP Value  <code>"tcp"</code>
 *   The value of the option to configure using only TCP network transport protocol.
 *   Example <code>.urls</code> output: [<code>"turn:server.com?transport=tcp"</code>,
 *   <code>"turn:server1.com:3478?transport=tcp"</code>]
 * @property {String} UDP Value  <code>"udp"</code>
 *   The value of the option to configure using only UDP network transport protocol.
 *   Example <code>.urls</code> output: [<code>"turn:server.com?transport=udp"</code>,
 *   <code>"turn:server1.com:3478?transport=udp"</code>]
 * @property {String} ANY Value  <code>"any"</code>
 *   The value of the option to configure using any network transport protocols configured from the Signaling server.
 *   Example <code>.urls</code> output: [<code>"turn:server.com?transport=tcp"</code>,
 *   <code>"turn:server1.com:3478"</code>, <code>"turn:server.com?transport=udp"</code>]
 * @property {String} NONE Value <code>"none"</code>
 *   The value of the option to not configure using any network transport protocols.
 *   Example <code>.urls</code> output: [<code>"turn:server.com"</code>, <code>"turn:server1.com:3478"</code>]
 *   Configuring this does not mean that no protocols will be used, but
 *   rather removing <code>?transport=(protocol)</code> query option in
 *   the TURN ICE server <code>.urls</code> when constructing the Peer connection.
 * @property {String} ALL Value  <code>"all"</code>
 *   The value of the option to configure using both TCP and UDP network transport protocols.
 *   Example <code>.urls</code> output: [<code>"turn:server.com?transport=tcp"</code>,
 *   <code>"turn:server.com?transport=udp"</code>, <code>"turn:server1.com:3478?transport=tcp"</code>,
 *   <code>"turn:server1.com:3478?transport=udp"</code>]
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.5.4
 */
export const TURN_TRANSPORT = {
  UDP: 'udp',
  TCP: 'tcp',
  ANY: 'any',
  NONE: 'none',
  ALL: 'all',
};

/**
 * <blockquote class="info">
 *   Learn more about how ICE works in this
 *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of Peer connection session description exchanging states.
 * @typedef PEER_CONNECTION_STATE
 * @property {String} STABLE            Value <code>"stable"</code>
 *   The value of the state when there is no session description being exchanged between Peer connection.
 * @property {String} HAVE_LOCAL_OFFER  Value <code>"have-local-offer"</code>
 *   The value of the state when local <code>"offer"</code> session description is set.
 *   This should transition to <code>STABLE</code> state after remote <code>"answer"</code>
 *   session description is set.
 *   See {@link SkylinkConstants.HANDSHAKE_PROGRESS|HANDSHAKE_PROGRESS} for a more
 *   detailed exchanging of session description states.
 * @property {String} HAVE_REMOTE_OFFER Value <code>"have-remote-offer"</code>
 *   The value of the state when remote <code>"offer"</code> session description is set.
 *   This should transition to <code>STABLE</code> state after local <code>"answer"</code>
 *   session description is set.
 *   See {@link SkylinkConstants.HANDSHAKE_PROGRESS|HANDSHAKE_PROGRESS} for a more
 *   detailed exchanging of session description states.
 * @property {String} CLOSED            Value <code>"closed"</code>
 *   The value of the state when Peer connection is closed and no session description can be exchanged and set.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.5.0
 */
export const PEER_CONNECTION_STATE = {
  STABLE: 'stable',
  HAVE_LOCAL_OFFER: 'have-local-offer',
  HAVE_REMOTE_OFFER: 'have-remote-offer',
  CLOSED: 'closed',
};

/**
 * The list of {@link Skylink#getConnectionStatus} retrieval states.
 * @typedef GET_CONNECTION_STATUS_STATE
 * @property {number} RETRIEVING Value <code>0</code>
 *   The value of the state when {@link Skylink#getConnectionStatus|getConnectionStatus} is retrieving the Peer connection stats.
 * @property {number} RETRIEVE_SUCCESS Value <code>1</code>
 *   The value of the state when {@link Skylink#getConnectionStatus|getConnectionStatus} has retrieved the Peer connection stats successfully.
 * @property {number} RETRIEVE_ERROR Value <code>-1</code>
 *   The value of the state when {@link Skylink#getConnectionStatus|getConnectionStatus} has failed retrieving the Peer connection stats.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.1.0
 */
export const GET_CONNECTION_STATUS_STATE = {
  RETRIEVING: 0,
  RETRIEVE_SUCCESS: 1,
  RETRIEVE_ERROR: -1,
};

/**
 * <blockquote class="info">
 *  As there are more features getting implemented, there will be eventually more different types of
 *  server Peers.
 * </blockquote>
 * The list of available types of server Peer connections.
 * @typedef SERVER_PEER_TYPE
 * @property {String} MCU Value <code>"mcu"</code>
 *   The value of the server Peer type that is used for MCU connection.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.6.1
 */
export const SERVER_PEER_TYPE = {
  MCU: 'mcu',
};

/**
 * <blockquote class="info">
 *  Learn more about how ICE works in this
 *  <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of available Peer connection bundle policies.
 * @typedef BUNDLE_POLICY
 * @property {String} MAX_COMPAT Value <code>"max-compat"</code>
 *   The value of the bundle policy to generate ICE candidates for each media type
 *   so each media type flows through different transports.
 * @property {String} MAX_BUNDLE Value <code>"max-bundle"</code>
 *   The value of the bundle policy to generate ICE candidates for one media type
 *   so all media type flows through a single transport.
 * @property {String} BALANCED   Value <code>"balanced"</code>
 *   The value of the bundle policy to use <code>MAX_BUNDLE</code> if Peer supports it,
 *   else fallback to <code>MAX_COMPAT</code>.
 * @property {String} NONE       Value <code>"none"</code>
 *   The value of the bundle policy to not use any media bundle.
 *   This removes the <code>a=group:BUNDLE</code> line from session descriptions.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.6.18
 */
export const BUNDLE_POLICY = {
  MAX_COMPAT: 'max-compat',
  BALANCED: 'balanced',
  MAX_BUNDLE: 'max-bundle',
  NONE: 'none',
};

/**
 * <blockquote class="info">
 *  Learn more about how ICE works in this
 *  <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of available Peer connection RTCP mux policies.
 * @typedef RTCP_MUX_POLICY
 * @property {String} REQUIRE   Value <code>"require"</code>
 *   The value of the RTCP mux policy to generate ICE candidates for RTP only and RTCP shares the same ICE candidates.
 * @property {String} NEGOTIATE Value <code>"negotiate"</code>
 *   The value of the RTCP mux policy to generate ICE candidates for both RTP and RTCP each.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.6.18
 */
export const RTCP_MUX_POLICY = {
  REQUIRE: 'require',
  NEGOTIATE: 'negotiate',
};

/**
 * <blockquote class="info">
 *  Learn more about how ICE works in this
 *  <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of available Peer connection certificates cryptographic algorithm to use.
 * @typedef PEER_CERTIFICATE
 * @property {String} RSA   Value <code>"RSA"</code>
 *   The value of the Peer connection certificate algorithm to use RSA-1024.
 * @property {String} ECDSA Value <code>"ECDSA"</code>
 *   The value of the Peer connection certificate algorithm to use ECDSA.
 * @property {String} AUTO  Value <code>"AUTO"</code>
 *   The value of the Peer connection to use the default certificate generated.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.6.18
 */
export const PEER_CERTIFICATE = {
  RSA: 'RSA',
  ECDSA: 'ECDSA',
  AUTO: 'AUTO',
};

/**
 * The list of Peer connection states.
 * @typedef HANDSHAKE_PROGRESS
 * @property {String} ENTER   Value <code>"enter"</code>
 *   The value of the connection state when Peer has just entered the Room.
 *   At this stage, {@link SkylinkConstants.PEER_JOINED|PEER_JOINED}
 *   is triggered.
 * @property {String} WELCOME Value <code>"welcome"</code>
 *   The value of the connection state when Peer is aware that User has entered the Room.
 *   At this stage, {@link SkylinkConstants.PEER_JOINED|PEER_JOINED}
 *   is triggered and Peer connection may commence.
 * @property {String} OFFER   Value <code>"offer"</code>
 *   The value of the connection state when Peer connection has set the local / remote <code>"offer"</code>
 *   session description to start streaming connection.
 * @property {String} ANSWER  Value <code>"answer"</code>
 *   The value of the connection state when Peer connection has set the local / remote <code>"answer"</code>
 *   session description to establish streaming connection.
 * @property {string} ANSWER_ACK  Value <code>"answerAck"</code>
 *   The value of the connection state when Peer connection is aware that the user has received the answer and the handshake is
 *   complete.
 * @property {string} ERROR   Value <code>"error"</code>
 *   The value of the connection state when Peer connection has failed to establish streaming connection.
 *   This happens when there are errors that occurs in creating local <code>"offer"</code> /
 *   <code>"answer"</code>, or when setting remote / local <code>"offer"</code> / <code>"answer"</code>.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.1.0
 */
export const HANDSHAKE_PROGRESS = {
  ENTER: 'enter',
  WELCOME: 'welcome',
  OFFER: 'offer',
  ANSWER: 'answer',
  ANSWER_ACK: 'answerAck',
  ERROR: 'error',
};

/**
 * <blockquote class="info">
 *   Note that this feature requires <code>"isPrivileged"</code> flag to be enabled for the App Key
 *   provided in Skylink {@link initOptions}, as only Users connecting using
 *   the App Key with this flag enabled (which we call privileged Users / Peers) can retrieve the list of
 *   Peer IDs from Rooms within the same App space.
 *   <a href="http://support.temasys.io/support/solutions/articles/12000012342-what-is-a-privileged-key-">
 *   Read more about privileged App Key feature here</a>.
 * </blockquote>
 * The list of <code>{@link Skylink#getPeers|getPeers}</code> method retrieval states.
 * @typedef GET_PEERS_STATE
 * @property {String} ENQUIRED Value <code>"enquired"</code>
 *   The value of the state when <code>{@link Skylink#getPeers|getPeers}</code> is retrieving the list of Peer IDs
 *   from Rooms within the same App space from the Signaling server.
 * @property {String} RECEIVED Value <code>"received"</code>
 *   The value of the state when <code>{@link Skylink#getPeers|getPeers}</code> has retrieved the list of Peer IDs
 *   from Rooms within the same App space from the Signaling server successfully.
 * @readOnly
 * @type Object
 * @constant
 * @public
 * @memberOf SkylinkConstants
 * @since 0.6.1
 */
export const GET_PEERS_STATE = {
  ENQUIRED: 'enquired',
  DISPATCHED: 'dispatched',
  RECEIVED: 'received',
};

/**
 * <blockquote class="info">
 *   Note that this feature requires <code>"isPrivileged"</code> flag to be enabled and
 *   <code>"autoIntroduce"</code> flag to be disabled for the App Key provided in
 *   Skylink {@link initOptions}, as only Users connecting using
 *   the App Key with this flag enabled (which we call privileged Users / Peers) can retrieve the list of
 *   Peer IDs from Rooms within the same App space.
 *   <a href="http://support.temasys.io/support/solutions/articles/12000012342-what-is-a-privileged-key-">
 *   Read more about privileged App Key feature here</a>.
 * </blockquote>
 * The list of {@link Skylink#introducePeer} Peer introduction request states.
 * @typedef INTRODUCE_STATE
 * @property {String} INTRODUCING Value <code>"enquired"</code>
 *   The value of the state when introduction request for the selected pair of Peers has been made to the Signaling server.
 * @property {String} ERROR       Value <code>"error"</code>
 *   The value of the state when introduction request made to the Signaling server
 *   for the selected pair of Peers has failed.
 * @readOnly
 * @constant
 * @memberOf SkylinkConstants
 * @since 0.6.1
 * @ignore
 */
export const INTRODUCE_STATE = {
  INTRODUCING: 'introducing',
  ERROR: 'error',
};

/**
 * The list of Signaling server reaction states during {@link Skylink#joinRoom|joinRoom}.
 * @typedef SYSTEM_ACTION
 * @property {String} WARNING Value <code>"warning"</code>
 *   The value of the state when Room session is about to end.
 * @property {String} REJECT  Value <code>"reject"</code>
 *   The value of the state when Room session has failed to start or has ended.
 * @property {String} LOCKED  Value <code>"locked"</code>
 *   The value of the state when Room sis locked.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.5.1
 */
export const SYSTEM_ACTION = {
  WARNING: 'warning',
  REJECT: 'reject',
  LOCKED: 'locked',
};

/**
 * The list of Signaling server reaction states reason of action code during
 * {@link Skylink#joinRoom|joinRoom}.
 * @typedef SYSTEM_ACTION_REASON
 * @property {String} CREDENTIALS_EXPIRED Value <code>"oldTimeStamp"</code>
 *   The value of the reason code when Room session token has expired.
 *   Happens during {@link Skylink#joinRoom|joinRoom} request.
 *   Results with: <code>REJECT</code>
 * @property {String} CREDENTIALS_ERROR   Value <code>"credentialError"</code>
 *   The value of the reason code when Room session token provided is invalid.
 *   Happens during {@link Skylink#joinRoom|joinRoom} request.
 * @property {String} DUPLICATED_LOGIN    Value <code>"duplicatedLogin"</code>
 *   The value of the reason code when Room session token has been used already.
 *   Happens during {@link Skylink#joinRoom|joinRoom} request.
 *   Results with: <code>REJECT</code>
 * @property {String} ROOM_NOT_STARTED    Value <code>"notStart"</code>
 *   The value of the reason code when Room session has not started.
 *   Happens during {@link Skylink#joinRoom|joinRoom} request.
 *   Results with: <code>REJECT</code>
 * @property {String} EXPIRED             Value <code>"expired"</code>
 *   The value of the reason code when Room session has ended already.
 *   Happens during {@link Skylink#joinRoom|joinRoom} request.
 *   Results with: <code>REJECT</code>
 * @property {String} ROOM_LOCKED         Value <code>"locked"</code>
 *   The value of the reason code when Room is locked.
 *   Happens during {@link Skylink#joinRoom|joinRoom} request.
 *   Results with: <code>REJECT</code>
 * @property {String} FAST_MESSAGE        Value <code>"fastmsg"</code>
 *    The value of the reason code when User is flooding socket messages to the Signaling server
 *    that is sent too quickly within less than a second interval.
 *    Happens after Room session has started. This can be caused by various methods like
 *    {@link Skylink#sendMessage|sendMessage},
 *    {@link Skylink#muteStreams|muteStreams}
 *    Results with: <code>WARNING</code>
 * @property {String} ROOM_CLOSING        Value <code>"toClose"</code>
 *    The value of the reason code when Room session is ending.
 *    Happens after Room session has started. This serves as a prerequisite warning before
 *    <code>ROOM_CLOSED</code> occurs.
 *    Results with: <code>WARNING</code>
 * @property {String} ROOM_CLOSED         Value <code>"roomclose"</code>
 *    The value of the reason code when Room session has just ended.
 *    Happens after Room session has started.
 *    Results with: <code>REJECT</code>
 * @property {String} SERVER_ERROR        Value <code>"serverError"</code>
 *    The value of the reason code when Room session fails to start due to some technical errors.
 *    Happens during {@link Skylink#joinRoom|joinRoom} request.
 *    Results with: <code>REJECT</code>
 * @property {String} KEY_ERROR           Value <code>"keyFailed"</code>
 *    The value of the reason code when Room session fails to start due to some technical error pertaining to
 *    App Key initialization.
 *    Happens during {@link Skylink#joinRoom|joinRoom} request.
 *    Results with: <code>REJECT</code>
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.5.2
 */
export const SYSTEM_ACTION_REASON = {
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
  KEY_ERROR: 'keyFailed',
};

/**
 * The list of Skylink {@link initOptions} ready states.
 * @typedef READY_STATE_CHANGE
 * @property {number} INIT      Value <code>0</code>
 *   The value of the state when <code>init()</code> has just started.
 * @property {number} LOADING   Value <code>1</code>
 *   The value of the state when <code>init()</code> is authenticating App Key provided
 *   (and with credentials if provided as well) with the Auth server.
 * @property {number} COMPLETED Value <code>2</code>
 *   The value of the state when <code>init()</code> has successfully authenticated with the Auth server.
 *   Room session token is generated for joining the <codRoom</code> provided in <code>init()</code>.
 *   Room session token has to be generated each time User switches to a different Room
 *   in {@link Skylink#joinRoom|joinRoom} method.
 * @property {number} ERROR     Value <code>-1</code>
 *   The value of the state when <code>init()</code> has failed authenticating with the Auth server.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.1.0
 */
export const READY_STATE_CHANGE = {
  INIT: 0,
  LOADING: 1,
  COMPLETED: 2,
  ERROR: -1,
};

/**
 * The list of Skylink {@link initOptions} ready state failure codes.
 * @typedef READY_STATE_CHANGE_ERROR
 * @property {number} API_INVALID                 Value <code>4001</code>
 *   The value of the failure code when provided App Key in <code>init()</code> does not exists.
 *   To resolve this, check that the provided App Key exists in
 *   <a href="https://console.temasys.io">the Temasys Console</a>.
 * @property {number} API_DOMAIN_NOT_MATCH        Value <code>4002</code>
 *   The value of the failure code when <code>"domainName"</code> property in the App Key does not
 *   match the accessing server IP address.
 *   To resolve this, contact our <a href="http://support.temasys.io">support portal</a>.
 * @property {number} API_CORS_DOMAIN_NOT_MATCH   Value <code>4003</code>
 *   The value of the failure code when <code>"corsurl"</code> property in the App Key does not match accessing CORS.
 *   To resolve this, configure the App Key CORS in
 *   <a href="https://console.temasys.io">the Temasys Console</a>.
 * @property {number} API_CREDENTIALS_INVALID     Value <code>4004</code>
 *   The value of the failure code when there is no [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
 *   present in the HTTP headers during the request to the Auth server present nor
 *   <code>options.credentials.credentials</code> configuration provided in the <code>init()</code>.
 *   To resolve this, ensure that CORS are present in the HTTP headers during the request to the Auth server.
 * @property {number} API_CREDENTIALS_NOT_MATCH   Value <code>4005</code>
 *   The value of the failure code when the <code>options.credentials.credentials</code> configuration provided in the
 *   <code>init()</code> does not match up with the <code>options.credentials.startDateTime</code>,
 *   <code>options.credentials.duration</code> or that the <code>"secret"</code> used to generate
 *   <code>options.credentials.credentials</code> does not match the App Key's <code>"secret</code> property provided.
 *   To resolve this, check that the <code>options.credentials.credentials</code> is generated correctly and
 *   that the <code>"secret"</code> used to generate it is from the App Key provided in the <code>init()</code>.
 * @property {number} API_INVALID_PARENT_KEY      Value <code>4006</code>
 *   The value of the failure code when the App Key provided does not belong to any existing App.
 *   To resolve this, check that the provided App Key exists in
 *   <a href="https://console.temasys.io">the Developer Console</a>.
 * @property {number} API_NO_MEETING_RECORD_FOUND Value <code>4010</code>
 *   The value of the failure code when provided <code>options.credentials</code>
 *   does not match any scheduled meetings available for the "Persistent Room" enabled App Key provided.
 *   See the <a href="http://support.temasys.io/support/solutions/articles/
 * 12000002811-using-the-persistent-room-feature-to-configure-meetings">Persistent Room article</a> to learn more.
 * @property {number} API_OVER_SEAT_LIMIT         Value <code>4020</code>
 *   The value of the failure code when App Key has reached its current concurrent users limit.
 *   To resolve this, use another App Key. To create App Keys dynamically, see the
 *   <a href="https://temasys.atlassian.net/wiki/display/TPD/SkylinkAPI+-+Application+Resources">Application REST API
 *   docs</a> for more information.
 * @property {number} API_RETRIEVAL_FAILED        Value <code>4021</code>
 *   The value of the failure code when App Key retrieval of authentication token fails.
 *   If this happens frequently, contact our <a href="http://support.temasys.io">support portal</a>.
 * @property {number} API_WRONG_ACCESS_DOMAIN     Value <code>5005</code>
 *   The value of the failure code when App Key makes request to the incorrect Auth server.
 *   To resolve this, ensure that the <code>roomServer</code> is not configured. If this persists even without
 *   <code>roomServer</code> configuration, contact our <a href="http://support.temasys.io">support portal</a>.
 * @property {number} XML_HTTP_REQUEST_ERROR      Value <code>-1</code>
 *   The value of the failure code when requesting to Auth server has timed out.
 * @property {number} XML_HTTP_NO_REPONSE_ERROR      Value <code>-2</code>
 *   The value of the failure code when response from Auth server is empty or timed out.
 * @property {number} NO_SOCKET_IO                Value <code>1</code>
 *   The value of the failure code when dependency <a href="http://socket.io/download/">Socket.IO client</a> is not loaded.
 *   To resolve this, ensure that the Socket.IO client dependency is loaded before the Skylink SDK.
 *   You may use the provided Socket.IO client <a href="http://socket.io/download/">CDN here</a>.
 * @property {number} NO_XMLHTTPREQUEST_SUPPORT   Value <code>2</code>
 *   The value of the failure code when <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest">
 *   XMLHttpRequest API</a> required to make request to Auth server is not supported.
 *   To resolve this, display in the Web UI to ask clients to switch to the list of supported browser
 *   as <a href="https://github.com/Temasys/SkylinkJS/tree/0.6.14#supported-browsers">listed in here</a>.
 * @property {number} NO_WEBRTC_SUPPORT           Value <code>3</code>
 *   The value of the failure code when <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/">
 *   RTCPeerConnection API</a> required for Peer connections is not supported.
 *   To resolve this, display in the Web UI to ask clients to switch to the list of supported browser
 *   as <a href="https://github.com/Temasys/SkylinkJS/tree/0.6.14#supported-browsers">listed in here</a>.
 *   For <a href="http://confluence.temasys.com.sg/display/TWPP">plugin supported browsers</a>, if the clients
 *   does not have the plugin installed, there will be an installation toolbar that will prompt for installation
 *   to support the RTCPeerConnection API.
 * @property {number} NO_PATH                     Value <code>4</code>
 *   The value of the failure code when provided <code>init()</code> configuration has errors.
 * @property {number} ADAPTER_NO_LOADED           Value <code>7</code>
 *   The value of the failure code when dependency <a href="https://github.com/Temasys/AdapterJS/">AdapterJS</a>
 *   is not loaded.
 *   To resolve this, ensure that the AdapterJS dependency is loaded before the Skylink dependency.
 *   You may use the provided AdapterJS <a href="https://github.com/Temasys/AdapterJS/">CDN here</a>.
 * @property {number} PARSE_CODECS                Value <code>8</code>
 *   The value of the failure code when codecs support cannot be parsed and retrieved.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.4.0
 */
export const READY_STATE_CHANGE_ERROR = {
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
  XML_HTTP_NO_REPONSE_ERROR: -2,
  NO_SOCKET_IO: 1,
  NO_XMLHTTPREQUEST_SUPPORT: 2,
  NO_WEBRTC_SUPPORT: 3,
  NO_PATH: 4,
  ADAPTER_NO_LOADED: 7,
  PARSE_CODECS: 8,
};

/**
 * Spoofs the REGIONAL_SERVER to prevent errors on deployed apps except the fact this no longer works.
 * Automatic regional selection has already been implemented hence REGIONAL_SERVER is no longer useful.
 * @typedef REGIONAL_SERVER
 * @constant
 * @type Object
 * @readOnly
 * @private
 * @memberOf SkylinkConstants
 * @since 0.6.16
 */
export const REGIONAL_SERVER = {
  APAC1: '',
  US1: '',
};

/**
 * The list of User's priority weight schemes for {@link Skylink#joinRoom|joinRoom}  connections.
 * @typedef PRIORITY_WEIGHT_SCHEME
 * @property {String} ENFORCE_OFFERER  Value <code>"enforceOfferer"</code>
 *   The value of the priority weight scheme to enforce User as the offerer.
 * @property {String} ENFORCE_ANSWERER Value <code>"enforceAnswerer"</code>
 *   The value of the priority weight scheme to enforce User as the answerer.
 * @property {String} AUTO             Value <code>"auto"</code>
 *   The value of the priority weight scheme to let User be offerer or answerer based on Signaling server selection.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.6.18
 * @deprecated
 * @ignore
 */
export const PRIORITY_WEIGHT_SCHEME = {
  ENFORCE_OFFERER: 'enforceOfferer',
  ENFORCE_ANSWERER: 'enforceAnswerer',
  AUTO: 'auto',
};

/**
 * The list of the SDK <code>console</code> API log levels.
 * @typedef LOG_LEVEL
 * @property {number} DEBUG Value <code>4</code>
 *   The value of the log level that displays <code>console</code> <code>debug</code>,
 *   <code>log</code>, <code>info</code>, <code>warn</code> and <code>error</code> logs.
 * @property {number} LOG   Value <code>3</code>
 *   The value of the log level that displays only <code>console</code> <code>log</code>,
 *   <code>info</code>, <code>warn</code> and <code>error</code> logs.
 * @property {number} INFO  Value <code>2</code>
 *   The value of the log level that displays only <code>console</code> <code>info</code>,
 *   <code>warn</code> and <code>error</code> logs.
 * @property {number} WARN  Value <code>1</code>
 *   The value of the log level that displays only <code>console</code> <code>warn</code>
 *   and <code>error</code> logs.
 * @property {number} ERROR Value <code>0</code>
 *   The value of the log level that displays only <code>console</code> <code>error</code> logs.
 * @property {number} NONE Value <code>-1</code>
 *   The value of the log level that displays no logs.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.5.4
 */
export const LOG_LEVEL = {
  DEBUG: 4,
  LOG: 3,
  INFO: 2,
  WARN: 1,
  ERROR: 0,
  NONE: -1,
};

/**
 * The list of {@link Skylink#joinRoom|joinRoom}  socket connection failure states.
 * @typedef SOCKET_ERROR
 * @property {number} CONNECTION_FAILED    Value <code>0</code>
 *   The value of the failure state when <code>{@link Skylink#joinRoom|joinRoom} </code> socket connection failed to establish with
 *   the Signaling server at the first attempt.
 * @property {number} RECONNECTION_FAILED  Value <code>-1</code>
 *   The value of the failure state when <code>{@link Skylink#joinRoom|joinRoom} </code> socket connection failed to establish
 *   the Signaling server after the first attempt.
 * @property {number} CONNECTION_ABORTED   Value <code>-2</code>
 *   The value of the failure state when <code>{@link Skylink#joinRoom|joinRoom} </code> socket connection will not attempt
 *   to reconnect after the failure of the first attempt in <code>CONNECTION_FAILED</code> as there
 *   are no more ports or transports to attempt for reconnection.
 * @property {number} RECONNECTION_ABORTED Value <code>-3</code>
 *   The value of the failure state when <code>{@link Skylink#joinRoom|joinRoom} </code> socket connection will not attempt
 *   to reconnect after the failure of several attempts in <code>RECONNECTION_FAILED</code> as there
 *   are no more ports or transports to attempt for reconnection.
 * @property {number} RECONNECTION_ATTEMPT Value <code>-4</code>
 *   The value of the failure state when <code>{@link Skylink#joinRoom|joinRoom} </code> socket connection is attempting
 *   to reconnect with a new port or transport after the failure of attempts in
 *   <code>CONNECTION_FAILED</code> or <code>RECONNECTED_FAILED</code>.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.5.6
 */
export const SOCKET_ERROR = {
  CONNECTION_FAILED: 0,
  RECONNECTION_FAILED: -1,
  CONNECTION_ABORTED: -2,
  RECONNECTION_ABORTED: -3,
  RECONNECTION_ATTEMPT: -4,
};

/**
 * The list of {@link Skylink#joinRoom|joinRoom}  socket connection reconnection states.
 * @typedef SOCKET_FALLBACK
 * @property {String} NON_FALLBACK      Value <code>"nonfallback"</code>
 *   The value of the reconnection state when <code>{@link Skylink#joinRoom|joinRoom} </code> socket connection is at its initial state
 *   without transitioning to any new socket port or transports yet.
 * @property {String} FALLBACK_PORT     Value <code>"fallbackPortNonSSL"</code>
 *   The value of the reconnection state when <code>{@link Skylink#joinRoom|joinRoom} </code> socket connection is reconnecting with
 *   another new HTTP port using WebSocket transports to attempt to establish connection with Signaling server.
 * @property {String} FALLBACK_PORT_SSL Value <code>"fallbackPortSSL"</code>
 *   The value of the reconnection state when <code>{@link Skylink#joinRoom|joinRoom} </code> socket connection is reconnecting with
 *   another new HTTPS port using WebSocket transports to attempt to establish connection with Signaling server.
 * @property {String} LONG_POLLING      Value <code>"fallbackLongPollingNonSSL"</code>
 *   The value of the reconnection state when <code>{@link Skylink#joinRoom|joinRoom} </code> socket connection is reconnecting with
 *   another new HTTP port using Polling transports to attempt to establish connection with Signaling server.
 * @property {String} LONG_POLLING_SSL  Value <code>"fallbackLongPollingSSL"</code>
 *   The value of the reconnection state when <code>{@link Skylink#joinRoom|joinRoom} </code> socket connection is reconnecting with
 *   another new HTTPS port using Polling transports to attempt to establish connection with Signaling server.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.5.6
 */
export const SOCKET_FALLBACK = {
  NON_FALLBACK: 'nonfallback',
  FALLBACK_PORT: 'fallbackPortNonSSL',
  FALLBACK_SSL_PORT: 'fallbackPortSSL',
  LONG_POLLING: 'fallbackLongPollingNonSSL',
  LONG_POLLING_SSL: 'fallbackLongPollingSSL',
};

/**
 * <blockquote class="info">
 *   Note that this is used only for SDK developer purposes.<br>
 *   Current version: <code>2.1.0</code>
 * </blockquote>
 * The value of the current version of the Signaling socket message protocol.
 * @typedef SM_PROTOCOL_VERSION
 * @constant
 * @type string
 * @memberOf SkylinkConstants
 * @since 0.6.0
 */
export const SM_PROTOCOL_VERSION = '2.1.0';

/**
 * <blockquote class="info">
 *   Note that if the video codec is not supported, the SDK will not configure the local <code>"offer"</code> or
 *   <code>"answer"</code> session description to prefer the codec.
 * </blockquote>
 * The list of available video codecs to set as the preferred video codec to use to encode
 * sending video data when available encoded video codec for Peer connections
 * configured in Skylink {@link initOptions}.
 * @typedef VIDEO_CODEC
 * @property {String} AUTO Value <code>"auto"</code>
 *   The value of the option to not prefer any video codec but rather use the created
 *   local <code>"offer"</code> / <code>"answer"</code> session description video codec preference.
 * @property {String} VP8  Value <code>"VP8"</code>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/VP8">VP8</a> video codec.
 * @property {String} VP9  Value <code>"VP9"</code>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/VP9">VP9</a> video codec.
 * @property {String} H264 Value <code>"H264"</code>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/H.264/MPEG-4_AVC">H264</a> video codec.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.5.10
 * @private
 */
export const VIDEO_CODEC = {
  AUTO: 'auto',
  VP8: 'VP8',
  H264: 'H264',
  VP9: 'VP9',
};

/**
 * <blockquote class="info">
 *   Note that if the audio codec is not supported, the SDK will not configure the local <code>"offer"</code> or
 *   <code>"answer"</code> session description to prefer the codec.
 * </blockquote>
 * The list of available audio codecs to set as the preferred audio codec to use to encode
 * sending audio data when available encoded audio codec for Peer connections
 * configured in Skylink {@link initOptions}.
 * @typedef AUDIO_CODEC
 * @property {String} AUTO Value <code>"auto"</code>
 *   The value of the option to not prefer any audio codec but rather use the created
 *   local <code>"offer"</code> / <code>"answer"</code> session description audio codec preference.
 * @property {String} OPUS Value <code>"opus"</code>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/Opus_(audio_format)">OPUS</a> audio codec.
 * @property {String} ISAC Value <code>"ISAC"</code>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/Internet_Speech_Audio_Codec">ISAC</a> audio codec.
 * @property {String} ILBC Value <code>"ILBC"</code>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/Internet_Low_Bitrate_Codec">iLBC</a> audio codec.
 * @property {String} G722 Value <code>"G722"</code>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/G.722">G722</a> audio codec.
 * @property {String} PCMA Value <code>"PCMA"</code>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/G.711">G711u</a> audio codec.
 * @property {String} PCMU Value <code>"PCMU"</code>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/G.711">G711a</a> audio codec.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.5.10
 * @private
 */
export const AUDIO_CODEC = {
  AUTO: 'auto',
  ISAC: 'ISAC',
  OPUS: 'opus',
  ILBC: 'ILBC',
  G722: 'G722',
  PCMU: 'PCMU',
  PCMA: 'PCMA',
};

/**
 * The list of available screensharing media sources configured in the
 * {@link Skylink#shareScreen|shareScreen}.
 * @typedef MEDIA_SOURCE
 * @property {String} SCREEN Value <code>"screen"</code>
 *   The value of the option to share entire screen.
 * @property {String} WINDOW Value <code>"window"</code>
 *   The value of the option to share application windows.
 * @property {String} TAB Value <code>"tab"</code>
 *   The value of the option to share browser tab.
 *   Note that this is only supported by from Chrome 52+ and Opera 39+.
 * @property {String} TAB_AUDIO Value <code>"audio"</code>
 *   The value of the option to share browser tab audio.
 *   Note that this is only supported by Chrome 52+ and Opera 39+.
 *   <code>options.audio</code> has to be enabled with <code>TAB</code> also requested to enable sharing of tab audio.
 * @property {String} APPLICATION Value <code>"application"</code>
 *   The value of the option to share applications.
 *   Note that this is only supported by Firefox currently.
 * @property {String} BROWSER Value <code>"browser"</code>
 *   The value of the option to share browser.
 *   Note that this is only supported by Firefox currently, and requires toggling the <code>media.getUserMedia.browser.enabled</code>
 *   in <code>about:config</code>.
 * @property {String} CAMERA Value <code>"camera"</code>
 *   The value of the option to share camera.
 *   Note that this is only supported by Firefox currently.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.5.10
 */
export const MEDIA_SOURCE = {
  SCREEN: 'screen',
  WINDOW: 'window',
  TAB: 'tab',
  TAB_AUDIO: 'audio',
  APPLICATION: 'application',
  BROWSER: 'browser',
  CAMERA: 'camera',
};

/**
 * <blockquote class="info">
 *   Note that currently {@link Skylink#getUserMedia|getUserMedia} method only configures
 *   the maximum resolution of the Stream due to browser interopability and support.
 * </blockquote>
 * The list of <a href="https://en.wikipedia.org/wiki/Graphics_display_resolution#Video_Graphics_Array">
 * video resolutions</a> sets configured in the {@link Skylink#getUserMedia|getUserMedia} method.
 * @typedef VIDEO_RESOLUTION
 * @property {Object} QQVGA Value <code>{ width: 160, height: 120 }</code>
 *   The value of the option to configure QQVGA resolution.
 *   Aspect ratio: <code>4:3</code>
 *   Note that configurating this resolution may not be supported depending on browser and device supports.
 * @property {Object} HQVGA Value <code>{ width: 240, height: 160 }</code>
 *   The value of the option to configure HQVGA resolution.
 *   Aspect ratio: <code>3:2</code>
 *   Note that configurating this resolution may not be supported depending on browser and device supports.
 * @property {Object} QVGA Value <code>{ width: 320, height: 240 }</code>
 *   The value of the option to configure QVGA resolution.
 *   Aspect ratio: <code>4:3</code>
 * @property {Object} WQVGA Value <code>{ width: 384, height: 240 }</code>
 *   The value of the option to configure WQVGA resolution.
 *   Aspect ratio: <code>16:10</code>
 *   Note that configurating this resolution may not be supported depending on browser and device supports.
 * @property {Object} HVGA Value <code>{ width: 480, height: 320 }</code>
 *   The value of the option to configure HVGA resolution.
 *   Aspect ratio: <code>3:2</code>
 *   Note that configurating this resolution may not be supported depending on browser and device supports.
 * @property {Object} VGA Value <code>{ width: 640, height: 480 }</code>
 *   The value of the option to configure VGA resolution.
 *   Aspect ratio: <code>4:3</code>
 * @property {Object} WVGA Value <code>{ width: 768, height: 480 }</code>
 *   The value of the option to configure WVGA resolution.
 *   Aspect ratio: <code>16:10</code>
 *   Note that configurating this resolution may not be supported depending on browser and device supports.
 * @property {Object} FWVGA Value <code>{ width: 854, height: 480 }</code>
 *   The value of the option to configure FWVGA resolution.
 *   Aspect ratio: <code>16:9</code>
 *   Note that configurating this resolution may not be supported depending on browser and device supports.
 * @property {Object} SVGA Value <code>{ width: 800, height: 600 }</code>
 *   The value of the option to configure SVGA resolution.
 *   Aspect ratio: <code>4:3</code>
 *   Note that configurating this resolution may not be supported depending on browser and device supports.
 * @property {Object} DVGA Value <code>{ width: 960, height: 640 }</code>
 *   The value of the option to configure DVGA resolution.
 *   Aspect ratio: <code>3:2</code>
 *   Note that configurating this resolution may not be supported depending on browser and device supports.
 * @property {Object} WSVGA Value <code>{ width: 1024, height: 576 }</code>
 *   The value of the option to configure WSVGA resolution.
 *   Aspect ratio: <code>16:9</code>
 * @property {Object} HD Value <code>{ width: 1280, height: 720 }</code>
 *   The value of the option to configure HD resolution.
 *   Aspect ratio: <code>16:9</code>
 *   Note that configurating this resolution may not be supported depending on device supports.
 * @property {Object} HDPLUS Value <code>{ width: 1600, height: 900 }</code>
 *   The value of the option to configure HDPLUS resolution.
 *   Aspect ratio: <code>16:9</code>
 *   Note that configurating this resolution may not be supported depending on browser and device supports.
 * @property {Object} FHD Value <code>{ width: 1920, height: 1080 }</code>
 *   The value of the option to configure FHD resolution.
 *   Aspect ratio: <code>16:9</code>
 *   Note that configurating this resolution may not be supported depending on device supports.
 * @property {Object} QHD Value <code>{ width: 2560, height: 1440 }</code>
 *   The value of the option to configure QHD resolution.
 *   Aspect ratio: <code>16:9</code>
 *   Note that configurating this resolution may not be supported depending on browser and device supports.
 * @property {Object} WQXGAPLUS Value <code>{ width: 3200, height: 1800 }</code>
 *   The value of the option to configure WQXGAPLUS resolution.
 *   Aspect ratio: <code>16:9</code>
 *   Note that configurating this resolution may not be supported depending on browser and device supports.
 * @property {Object} UHD Value <code>{ width: 3840, height: 2160 }</code>
 *   The value of the option to configure UHD resolution.
 *   Aspect ratio: <code>16:9</code>
 *   Note that configurating this resolution may not be supported depending on browser and device supports.
 * @property {Object} UHDPLUS Value <code>{ width: 5120, height: 2880 }</code>
 *   The value of the option to configure UHDPLUS resolution.
 *   Aspect ratio: <code>16:9</code>
 *   Note that configurating this resolution may not be supported depending on browser and device supports.
 * @property {Object} FUHD Value <code>{ width: 7680, height: 4320 }</code>
 *   The value of the option to configure FUHD resolution.
 *   Aspect ratio: <code>16:9</code>
 *   Note that configurating this resolution may not be supported depending on browser and device supports.
 * @property {Object} QUHD Value <code>{ width: 15360, height: 8640 }</code>
 *   The value of the option to configure QUHD resolution.
 *   Aspect ratio: <code>16:9</code>
 *   Note that configurating this resolution may not be supported depending on browser and device supports.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.5.6
 */
export const VIDEO_RESOLUTION = {
  QQVGA: { width: 160, height: 120 /* , aspectRatio: '4:3' */ },
  HQVGA: { width: 240, height: 160 /* , aspectRatio: '3:2' */ },
  QVGA: { width: 320, height: 240 /* , aspectRatio: '4:3' */ },
  WQVGA: { width: 384, height: 240 /* , aspectRatio: '16:10' */ },
  HVGA: { width: 480, height: 320 /* , aspectRatio: '3:2' */ },
  VGA: { width: 640, height: 480 /* , aspectRatio: '4:3' */ },
  WVGA: { width: 768, height: 480 /* , aspectRatio: '16:10' */ },
  FWVGA: { width: 854, height: 480 /* , aspectRatio: '16:9' */ },
  SVGA: { width: 800, height: 600 /* , aspectRatio: '4:3' */ },
  DVGA: { width: 960, height: 640 /* , aspectRatio: '3:2' */ },
  WSVGA: { width: 1024, height: 576 /* , aspectRatio: '16:9' */ },
  HD: { width: 1280, height: 720 /* , aspectRatio: '16:9' */ },
  HDPLUS: { width: 1600, height: 900 /* , aspectRatio: '16:9' */ },
  FHD: { width: 1920, height: 1080 /* , aspectRatio: '16:9' */ },
  QHD: { width: 2560, height: 1440 /* , aspectRatio: '16:9' */ },
  WQXGAPLUS: { width: 3200, height: 1800 /* , aspectRatio: '16:9' */ },
  UHD: { width: 3840, height: 2160 /* , aspectRatio: '16:9' */ },
  UHDPLUS: { width: 5120, height: 2880 /* , aspectRatio: '16:9' */ },
  FUHD: { width: 7680, height: 4320 /* , aspectRatio: '16:9' */ },
  QUHD: { width: 15360, height: 8640 /* , aspectRatio: '16:9' */ },
};

/**
 * The list of {@link Skylink#getUserMedia|getUserMedia} or
 * {@link Skylink#shareScreen|shareScreen} Stream fallback states.
 * @typedef MEDIA_ACCESS_FALLBACK_STATE
 * @property {Object} FALLBACKING Value <code>0</code>
 *   The value of the state when <code>{@link Skylink#getUserMedia|getUserMedia}</code> method will retrieve audio track only
 *   when retrieving audio and video tracks failed.
 *   This can be configured by Skylink {@link initOptions}
 *   <code>audioFallback</code> option.
 * @property {Object} FALLBACKED  Value <code>1</code>
 *   The value of the state when <code>{@link Skylink#getUserMedia|getUserMedia}</code> or <code>{@link Skylink#shareScreen|shareScreen}</code>
 *   method retrieves camera / screensharing Stream successfully but with missing originally required audio or video tracks.
 * @property {Object} ERROR       Value <code>-1</code>
 *   The value of the state when <code>{@link Skylink#getUserMedia|getUserMedia}</code> method failed to retrieve audio track only
 *   after retrieving audio and video tracks failed.
 * @readOnly
 * @constant
 * @type Object
 * @memberOf SkylinkConstants
 * @since 0.6.14
 */
export const MEDIA_ACCESS_FALLBACK_STATE = {
  FALLBACKING: 0,
  FALLBACKED: 1,
  ERROR: -1,
};

/**
 * The list of recording states.
 * @typedef RECORDING_STATE
 * @property {number} START Value <code>0</code>
 *   The value of the state when recording session has started.
 * @property {number} STOP Value <code>1</code>
 *   The value of the state when recording session has stopped.<br>
 *   At this stage, the recorded videos will go through the mixin server to compile the videos.
 * @property {number} LINK Value <code>2</code>
 *   The value of the state when recording session mixin request has been completed.
 * @property {number} ERROR Value <code>-1</code>
 *   The value of the state state when recording session has errors.
 *   This can happen during recording session or during mixin of recording videos,
 *   and at this stage, any current recording session or mixin is aborted.
 * @constant
 * @type Object
 * beta
 * @memberOf SkylinkConstants
 * @since 0.6.16
 */
export const RECORDING_STATE = {
  START: 0,
  STOP: 1,
  LINK: 2,
  ERROR: -1,
};

/**
 * Stores the data chunk size for Blob transfers.
 * @typedef CHUNK_FILE_SIZE
 * @type Number
 * @private
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.5.2
 * @ignore
 */
export const CHUNK_FILE_SIZE = 49152;

/**
 * Stores the data chunk size for Blob transfers transferring from/to
 *   Firefox browsers due to limitation tested in the past in some PCs (linx predominatly).
 * @typedef MOZ_CHUNK_FILE_SIZE
 * @type Number
 * @private
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.5.2
 * @ignore
 */
export const MOZ_CHUNK_FILE_SIZE = 12288;

/**
 * Stores the data chunk size for binary Blob transfers.
 * @typedef BINARY_FILE_SIZE
 * @type Number
 * @private
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.6.16
 * @ignore
 */
export const BINARY_FILE_SIZE = 65456;

/**
 * Stores the data chunk size for binary Blob transfers.
 * @typedef MOZ_BINARY_FILE_SIZE
 * @type Number
 * @private
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.6.16
 * @ignore
 */
export const MOZ_BINARY_FILE_SIZE = 16384;

/**
 * Stores the data chunk size for data URI string transfers.
 * @typedef CHUNK_DATAURL_SIZE
 * @type Number
 * @private
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.5.2
 * @ignore
 */
export const CHUNK_DATAURL_SIZE = 1212;

/**
 * Stores the list of data transfer protocols.
 * @typedef DC_PROTOCOL_TYPE
 * @property {String} WRQ The protocol to initiate data transfer.
 * @property {String} ACK The protocol to request for data transfer chunk.
 *   Give <code>-1</code> to reject the request at the beginning and <code>0</code> to accept
 *   the data transfer request.
 * @property {String} CANCEL The protocol to terminate data transfer.
 * @property {String} ERROR The protocol when data transfer has errors and has to be terminated.
 * @property {String} MESSAGE The protocol that is used to send P2P messages.
 * @constant
 * @type Object
 * @readOnly
 * @private
 * @memberOf SkylinkConstants
 * @since 0.5.2
 * @ignore
 */
export const DC_PROTOCOL_TYPE = {
  WRQ: 'WRQ',
  ACK: 'ACK',
  ERROR: 'ERROR',
  CANCEL: 'CANCEL',
  MESSAGE: 'MESSAGE',
};

/**
 * Stores the list of socket messaging protocol types.
 * See confluence docs for the list based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @typedef SIG_MESSAGE_TYPE
 * @property {String} JOIN_ROOM Value <code>joinRoom</code>
 * Message sent by peer to Signalling server to join the room.
 * @property {String} IN_ROOM Value <code>inRoom</code>
 * Message received by peer from Signalling server when peer successfully connects to the room.
 * @property {String} ENTER Value <code>enter</code>
 * Message sent by peer to all peers in the room (after <code>inRoom</code> message).
 * @property {String} WELCOME Value <code>welcome</code>
 * Message sent by peer in response to <code>enter</code> message.
 * @property {String} OFFER Value <code>offer</code>
 * Messsage sent by the peer with the higher weight to the targeted peer after the enter/welcome message.
 * Message is sent after the local offer is created and set, or after all its local ICE candidates have been gathered completely for non-trickle ICE connections (gathering process happens after the local offer is set).
 * The targeted peer will have to set the received remote offer, create and set the local answer and send to sender peer the <code>answer</code> message to end the offer/answer handshaking process.
 * @property {String} ANSWER Value <code>answer</code>
 * Message sent by the targeted peer with the lower weight back to the peer in response to <code>offer</code> message.
 * The peer will have to set the received remote answer, which ends the offer/answer handshaking process.
 * @property {String} CANDIDATE Value <code>candidate</code>
 * Message sent by peer to targeted peer when it has gathered a local ICE candidate.
 * @property {String} BYE Value <code>bye</code>
 * Message that is broadcast by Signalling server when a peer's socket connection has been disconnected. This happens when a peer leaves the room.
 * @property {String} REDIRECT Value <code>redirect</code>
 * Message received from Signalling server when a peer fails to connect to the room (after <code>joinRoom</code> message).
 * @property {String} UPDATE_USER Value <code>updateUserEvent</code>
 * Message that is broadcast by peer to all peers in the room when the peer's custom userData has changed.
 * @property {String} ROOM_LOCK Value <code>roomLockEvent</code>
 * Message that is broadcast by peer to all peers in the room to toggle the Signaling server Room lock status
 * @property {String} MUTE_VIDEO_EVENT Value <code>muteVideoEvent</code>
 * Message that is broadcast by peer to all peers in the room to inform other peers that its sent stream object video tracks muted status have changed.
 * @property {String} MUTE_AUDIO_EVENT Value <code>muteAudioEvent</code>
 * Message that is broadcast by peer to all peers in the room to inform other peers that its sent stream object audio tracks muted status have changed.
 * @property {String} PUBLIC_MESSAGE Value <code>public</code>
 * Message sent by peer to all peers in the room as a public message.
 * @property {String} PRIVATE_MESSAGE Value <code>private</code>
 * Message sent to a targeted peer as a private message.
 * @property {String} STREAM Value <code>stream</code>
 * Message that is boradcast by peer to all peers in the room to indicate the sender peer's stream object status.
 * @property {String} GROUP Value <code>group</code>
 * Message that is boradcast by peer to all peers in the room for bundled messages that was sent before a second interval.
 * @property {String} GET_PEERS Value <code>getPeers</code>
 * Message sent by peer (connecting from a Privileged Key) to the Signaling server to retrieve a list of peer IDs in each room within the same App space (app keys that have the same parent app).
 * @property {String} PEER_LIST Value <code>peerList</code>
 * Message sent by Signalling server to the peer (connecting from a Privileged Key) containing the list of peer IDs.
 * @property {String} INTRODUCE Value <code>introduce</code>
 * Message sent by peer (connecting from a Privileged Key) to the Signaling server to introduce a peer to another peer in the same room. Peers can be a Privileged Key Peer or non-Privileged Key Peer.
 * @property {String} INTRODUCE_ERROR Value <code>introduceError</code>
 * Message sent by Signaling server to requestor peer (connecting from a Privileged Key) when introducing two peers fails.
 * @property {String} APPROACH Value <code>approach</code>
 * Message sent by Signaling server to the peer defined in the "sendingPeerId" in the <code>introduce</code> message.
 * @property {String} START_RECORDING Value <code>startRecordingRoom</code>
 * Message sent by peer to a peer (connecting from an MCU Key) to start recording session.
 * @property {String} STOP_RECORDING Value <code>stopRecordingRooms</code>
 * Message sent by peer to a peer (connecting from an MCU Key) to stop recording session.
 * @property {String} RECORDING Value <code>recordingEvent</code>
 * Message broadcasted by peer (connecting from an MCU Key) to all peers to indicate the status of the recording session.
 * @property {String} END_OF_CANDIDATES Value <code>endOfCandidates</code>
 * Message sent by peer to the targeted peer after all its local ICE candidates gathering has completed.
 * @property {String} MEDIA_INFO_EVENT Value <code>mediaStateChangeEvent</code>
 * Message sent by peer to all peers to communicate change of media state.
 * * @property {String} MESSAGE Value <code>message</code>
 * Message sent by peer to all peers in the room as either a public or a private message.
 * @property {String} GET_STORED_MESSAGES Value <code>getStoredMessages</code>
 * Message sent by peer to Signaling server to retrieve stored (persisted) messages.
 * @private
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.5.6
 */
export const SIG_MESSAGE_TYPE = {
  JOIN_ROOM: 'joinRoom',
  IN_ROOM: 'inRoom',
  ENTER: 'enter',
  WELCOME: 'welcome',
  OFFER: 'offer',
  ANSWER: 'answer',
  ANSWER_ACK: 'answerAck',
  CANDIDATE: 'candidate',
  BYE: 'bye',
  REDIRECT: 'redirect',
  UPDATE_USER: 'updateUserEvent',
  ROOM_LOCK: 'roomLockEvent',
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
  END_OF_CANDIDATES: 'endOfCandidates',
  START_SCREENSHARE: 'startScreenshare',
  START_RTMP: 'startRTMP',
  STOP_RTMP: 'stopRTMP',
  RTMP: 'rtmpEvent',
  MEDIA_INFO_EVENT: 'mediaInfoEvent',
  MUTE_VIDEO_EVENT: 'muteVideoEvent',
  MUTE_AUDIO_EVENT: 'muteAudioEvent',
  MESSAGE: 'message',
  GET_STORED_MESSAGES: 'getStoredMessages',
  STORED_MESSAGES: 'storedMessages',
  RESTART: 'restart',
};

export const STREAM_STATUS = {
  ENDED: 'ended',
  REPLACED_STREAM_ENDED: 'replacedStreamEnded',
  SCREENSHARE_REPLACE_START: 'screenshareStart',
  USER_MEDIA_REPLACE_START: 'userMediaReplaceStart',
};

/**
 * Stores the list of socket messaging protocol types to queue when sent less than a second interval.
 * @typedef GROUP_MESSAGE_LIST
 * @type Array
 * @readOnly
 * @private
 * @memberOf SkylinkConstants
 * @since 0.5.10
 */
export const GROUP_MESSAGE_LIST = [
  SIG_MESSAGE_TYPE.STREAM,
  SIG_MESSAGE_TYPE.UPDATE_USER,
  SIG_MESSAGE_TYPE.MUTE_AUDIO_EVENT,
  SIG_MESSAGE_TYPE.MUTE_VIDEO_EVENT,
  SIG_MESSAGE_TYPE.PUBLIC_MESSAGE,
];

/**
 * The options available for video and audio bitrates (kbps) quality.
 * @typedef VIDEO_QUALITY
 * @property {Object} HD Value <code>{ video: 3200, audio: 80 }</code>
 *   The value of option to prefer high definition video and audio bitrates.
 * @property {Object} HQ Value <code>{ video: 1200, audio: 50 }</code>
 *   The value of option to prefer high quality video and audio bitrates.
 * @property {Object} SQ Value <code>{ video: 800, audio: 30 }</code>
 *   The value of option to prefer standard quality video and audio bitrates.
 * @property {Object} LQ Value <code>{ video: 500, audio: 20 }</code>
 *   The value of option to prefer low quality video and audio bitrates.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.6.32
 */
export const VIDEO_QUALITY = {
  HD: { video: 3200, audio: 150 },
  HQ: { video: 1200, audio: 80 },
  SQ: { video: 800, audio: 30 },
  LQ: { video: 400, audio: 20 },
};

/**
 * The options available for SDP sematics while create a PeerConnection.
 * @typedef SDP_SEMANTICS
 * @property {String} PLAN_B
 *   The value of option to prefer plan-b sdp.
 * @property {String} UNIFIED
 *   The value of option to prefer unified-plan sdp.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.6.32
 */
export const SDP_SEMANTICS = {
  PLAN_B: 'plan-b',
  UNIFIED: 'unified-plan',
};

/**
 * The list of RTMP states.
 * @typedef RTMP_STATE
 * @property {number} START Value <code>0</code>
 *   The value of the state when live streaming session has started.
 * @property {number} STOP Value <code>1</code>
 *   The value of the state when live streaming session has stopped.<br>
 *   At this stage, the recorded videos will go through the mixin server to compile the videos.
 * @property {number} ERROR Value <code>-1</code>
 *   The value of the state state when live streaming session has errors.
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 0.6.34
 */
export const RTMP_STATE = {
  START: 0,
  STOP: 1,
  ERROR: -1,
};

/**
 * The status of media on the stream.
 * @typedef MEDIA_STATUS
 * @property {number} MUTED <small>Value <code>0</code></small>
 * The media is present in the stream and muted
 * @property {number} ACTIVE <small>Value <code>1</code></small>
 * The media is present in the stream and active
 * @property {number} UNAVAILABLE <small>Value <code>-1</code></small>
 * The media is not present in the stream
 * @constant
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 1.0
 */
export const MEDIA_STATUS = {
  MUTED: 0,
  ACTIVE: 1,
  UNAVAILABLE: -1,
};

/**
 * The logging tags.
 * @typedef TAGS
 * @property {String} STATS_MODULE
 * @property {String} SESSION_DESCRIPTION
 * @property {String} PEER_CONNECTION
 * @property {String} CANDIDATE_HANDLER
 * @property {String} SIG_SERVER
 * @property {String} PEER_MEDIA
 * @property {String} PEER_INFORMATION
 * @property {String} MEDIA_STREAM
 * @constant
 * @private
 * @type Object
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 2.0
 */
export const TAGS = {
  SKYLINK_EVENT: 'SKYLINK EVENT',
  SKYLINK_ERROR: 'SKYLINK ERROR',
  STATS_MODULE: 'RTCStatsReport',
  SESSION_DESCRIPTION: 'RTCSessionDescription',
  PEER_CONNECTION: 'RTCPeerConnection',
  CANDIDATE_HANDLER: 'RTCIceCandidate',
  DATA_CHANNEL: 'RTCDataChannel',
  SIG_SERVER: 'SIG SERVER',
  PEER_MEDIA: 'PEER MEDIA',
  PEER_INFORMATION: 'PEER INFORMATION',
  ROOM: 'ROOM',
  RECORDING: 'RECORDING',
  MEDIA_STREAM: 'MEDIA STREAM',
  MESSAGING: 'MESSAGING',
  ASYNC_MESSAGING: 'ASYNC MESSAGING',
  ENCRYPTED_MESSAGING: 'ENCRYPTED MESSAGING',
};

/**
 * The list of media types.
 * @typedef MEDIA_TYPE
 * @property {String} AUDIO_MIC - Audio from a microphone.
 * @property {String} VIDEO_CAMERA - Video from a Camera of any type.
 * @property {String} VIDEO_SCREEN - Video of the Screen captured for screen sharing.
 * @property {String} VIDEO_OTHER - Video from source other than Camera.
 * @property {String} AUDIO - Audio from an unspecified MediaType.
 * @property {String} VIDEO - Video from an unspecified MediaType.
 * @constant
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 2.0
 */
export const MEDIA_TYPE = {
  AUDIO_MIC: 'audioMic',
  VIDEO_CAMERA: 'videoCamera',
  VIDEO_SCREEN: 'videoScreen',
  VIDEO_OTHER: 'videoOther',
  AUDIO: 'audio',
  VIDEO: 'video',
};

/**
 * The ready state of the track.
 * @typedef TRACK_READY_STATE
 * @type {Object}
 * @private
 * @constant
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 2.0
 */
export const TRACK_READY_STATE = {
  LIVE: 'live',
  ENDED: 'ended',
};

/**
 * The track kind.
 * @typedef TRACK_KIND
 * @type {Object}
 * @private
 * @constant
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 2.0
 */
export const TRACK_KIND = {
  AUDIO: 'audio',
  VIDEO: 'video',
};

/**
 * The state of the media.
 * @typedef MEDIA_STATE
 * @property {String} MUTED - The state when the MediaTrack enabled flag is set to false. The MediaTrack is sending black frames.
 * @property {String} ACTIVE - The state when the MediaTrack enabled flag and active flag is set to true. The MediaTrack is sending frames with content.
 * @property {String} STOPPED - The state when the MediaTrack active flag is false. The MediaTrack is not sending any frames.
 * @property {String} UNAVAILABLE - The state when the MediaTrack is no longer available or has been disposed.
 * @constant
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 2.0
 */
export const MEDIA_STATE = {
  MUTED: 'muted',
  ACTIVE: 'active',
  STOPPED: 'stopped',
  UNAVAILABLE: 'unavailable',
};

/**
 * Media Info keys.
 * @typedef MEDIA_INFO
 * @type {Object}
 * @private
 * @constant
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 2.0
 */
export const MEDIA_INFO = {
  PUBLISHER_ID: 'publisherId',
  MEDIA_ID: 'mediaId',
  MEDIA_TYPE: 'mediaType',
  MEDIA_STATE: 'mediaState',
  TRANSCEIVER_MID: 'transceiverMid',
  MEDIA_META_DATA: 'mediaMetaData',
  SIMULCAST: 'simulcast',
  STREAM_ID: 'streamId',
};

/**
 * The SDK version.
 * @typedef SDK_VERSION
 * @type {String}
 * @private
 * @constant
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 2.0
 */
export const SDK_VERSION = '2.0.0';

/**
 * The SDK type.
 * @typedef SDK_NAME
 * @type {Object}
 * @private
 * @constant
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 2.0
 */
export const SDK_NAME = {
  WEB: 'Web SDK',
  ANDROID: 'Android SDK',
  IOS: 'iOS SDK',
  CPP: 'C++ SDK',
};

/**
 * The API version.
 * @typedef API_VERSION
 * @type {String}
 * @private
 * @constant
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 2.0
 */
export const API_VERSION = '9.0.0';

/**
 * select Signaling server version.
 * @typedef Signaling_version
 * @type {String}
 * @private
 * @constant
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 2.0
 */
export const SIGNALING_VERSION = 'sig-v2';

/**
 * The Browser agent type.
 * @typedef BROWSER_AGENT
 * @type {Object}
 * @private
 * @constant
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 2.0
 */
export const BROWSER_AGENT = {
  CHROME: 'chrome',
  FIREFOX: 'firefox',
  SAFARI: 'safari',
  REACT_NATIVE: 'react-native',
};

/**
 * The Peer type.
 * @typedef PEER_TYPE
 * @type {Object}
 * @private
 * @constant
 * @readOnly
 * @memberOf SkylinkConstants
 * @since 2.0
 */
export const PEER_TYPE = {
  MCU: 'MCU',
};

/**
 * Events dispatched by Socket.io.
 * @typedef SOCKET_EVENTS
 * @type {Object}
 * @private
 * @constant
 * @readonly
 * @memberOf SkylinkConstants
 * @since 2.0
 */
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT_ATTEMPT: 'reconnect_attempt',
  RECONNECT_SUCCESS: 'reconnect_success',
  RECONNECT_FAILED: 'reconnect_failed',
  RECONNECT_ERROR: 'reconnect_error',
  MESSAGE: 'message',
  ERROR: 'error',
};

/**
 * Socket types
 * @typedef SOCKET_TYPE
 * @type {Object}
 * @private
 * @constant
 * @readonly
 * @memberOf SkylinkConstants
 * @since 2.0
 */
export const SOCKET_TYPE = {
  POLLING: 'Polling',
  WEBSOCKET: 'WebSocket',
  XHR_POLLING: 'xhr-polling',
  JSONP_POLLING: 'jsonp-polling',
};

/**
 * The state of the SDK.
 * @typedef STATES
 * @type {Object}
 * @private
 * @constant
 * @readonly
 * @memberOf SkylinkConstants
 * @since 2.0
 */
export const STATES = {
  SIGNALING: SOCKET_EVENTS,
};

export const EVENTS = SkylinkEventsConstants;
