/**
 * The current version of Skylink Web SDK.
 * @attribute VERSION
 * @type String
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.VERSION = '@@version';

/**
 * These are the list of Peer connection signaling states that Skylink would trigger.
 * - Some of the state references the [w3c WebRTC Specification Draft](http://www.w3.org/TR/webrtc/#idl-def-RTCSignalingState).
 * @attribute PEER_CONNECTION_STATE
 * @type JSON
 * @param {String} STABLE <small>Value <code>"stable"</code></small>
 *   The state when there is no handshaking in progress and when
 *   handshaking has just started or close.<br>
 * This state occurs when Peer connection has just been initialised and after
 *   <code>HAVE_LOCAL_OFFER</code> or <code>HAVE_REMOTE_OFFER</code>.
 * @param {String} HAVE_LOCAL_OFFER <small>Value <code>"have-local-offer"</code></small>
 *   The state when the local session description <code>"offer"</code> is generated and to be sent.<br>
 * This state occurs after <code>STABLE</code> state.
 * @param {String} HAVE_REMOTE_OFFER <small>Value <code>"have-remote-offer"</code></small>
 *   The state when the remote session description <code>"offer"</code> is received.<br>
 * At this stage, this indicates that the Peer connection signaling handshaking has been completed, and
 *   likely would go back to <code>STABLE</code> after local <code>"answer"</code> is received by Peer.
 * @param {String} CLOSED <small>Value <code>"closed"</code></small>
 *   The state when the Peer connection is closed.<br>
 * This state occurs when connection with Peer has been closed, usually when Peer leaves the room.
 * @readOnly
 * @component Peer
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype.PEER_CONNECTION_STATE = {
  STABLE: 'stable',
  HAVE_LOCAL_OFFER: 'have-local-offer',
  HAVE_REMOTE_OFFER: 'have-remote-offer',
  CLOSED: 'closed'
};

/**
 * These are the types of server Peers that Skylink would connect with.
 * - Different server Peers that serves different functionalities.
 * - The server Peers functionalities are only available depending on the
 *   Application Key configuration.
 * - Eventually, this list will be populated as there are more server Peer
 *   functionalities provided by the Skylink platform.
 * @attribute SERVER_PEER_TYPE
 * @param {String} MCU <small>Value <code>"mcu"</code></small>
 *   This server Peer is a MCU server connection.
 * @type JSON
 * @readOnly
 * @component Peer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.SERVER_PEER_TYPE = {
  MCU: 'mcu'
  //SIP: 'sip'
};

/**
 * These are the list of Peer list retrieval states that Skylink would trigger.
 * - This relates to and requires the Privileged Key feature where Peers using
 *   that Privileged alias Key becomes a privileged Peer with privileged functionalities.
 * @attribute GET_PEERS_STATE
 * @type JSON
 * @param {String} ENQUIRED <small>Value <code>"enquired"</code></small>
 *   The state when the privileged Peer already enquired signaling for list of peers.
 * @param {String} RECEIVED <small>Value <code>"received"</code></small>
 *   The state when the privileged Peer received list of peers from signaling.
 * @readOnly
 * @component Peer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.GET_PEERS_STATE = {
  ENQUIRED: 'enquired',
  RECEIVED: 'received'
};

/**
 * These are the list of Peer introduction states that Skylink would trigger.
 * - This relates to and requires the Privileged Key feature where Peers using
 *   that Privileged alias Key becomes a privileged Peer with privileged functionalities.
 * @attribute INTRODUCE_STATE
 * @type JSON
 * @param {String} INTRODUCING <small>Value <code>"enquired"</code></small>
 *   The state when the privileged Peer have sent the introduction signal.
 * @param {String} ERROR <small>Value <code>"error"</code></small>
 *   The state when the Peer introduction has occurred an exception.
 * @readOnly
 * @component Peer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.INTRODUCE_STATE = {
  INTRODUCING: 'introducing',
  ERROR: 'error'
};

/**
 * These are the list of Peer connection ICE connection states that Skylink would trigger.
 * - These states references the [w3c WebRTC Specification Draft](http://www.w3.org/TR/webrtc/#idl-def-RTCIceConnectionState),
 *   except the <code>TRICKLE_FAILED</code> state, which is an addition provided state by Skylink
 *   to inform that trickle ICE has failed.
 * @attribute ICE_CONNECTION_STATE
 * @type JSON
 * @param {String} STARTING <small>Value <code>"starting"</code></small>
 *   The state when the ICE agent is gathering addresses and/or waiting
 *   for remote candidates to be supplied.<br>
 * This state occurs when Peer connection has just been initialised.
 * @param {String} CHECKING <small>Value <code>"checking"</code></small>
 *   The state when the ICE agent has received remote candidates
 *   on at least one component, and is checking candidate pairs but has
 *   not yet found a connection. In addition to checking, it may also
 *   still be gathering.<br>
 * This state occurs after <code>STARTING</code> state.
 * @param {String} CONNECTED <small>Value <code>"connected"</code></small>
 *  The state when the ICE agent has found a usable connection
 *   for all components but is still checking other candidate pairs to see
 *   if there is a better connection. It may also still be gathering.<br>
 * This state occurs after <code>CHECKING</code>.
 * @param {String} COMPLETED <small>Value <code>"completed"</code></small>
 *   The state when the ICE agent has finished gathering and
 *   checking and found a connection for all components.<br>
 * This state occurs after <code>CONNECTED</code> (or sometimes after <code>CHECKING</code>).
 * @param {String} FAILED <small>Value <code>"failed"</code></small>
 *   The state when the ICE agent is finished checking all
 *   candidate pairs and failed to find a connection for at least one
 *   component.<br>
 * This state occurs during the ICE connection attempt after <code>STARTING</code> state.
 * @param {String} DISCONNECTED <small>Value <code>"disconnected"</code></small>
 *   The state when liveness checks have failed for one or
 *   more components. This is more aggressive than "failed", and may
 *   trigger intermittently (and resolve itself without action) on
 *   a flaky network.<br>
 * This state occurs after <code>CONNECTED</code> or <code>COMPLETED</code> state.
 * @param {String} CLOSED <small>Value <code>"closed"</code></small>
 *   The state when the ICE agent has shut down and is no
 *   longer responding to STUN requests.<br>
 * This state occurs after Peer connection has been disconnected <em>(closed)</em>.
 * @param {String} TRICKLE_FAILED <small>Value <code>"trickeFailed"</code></small>
 *   The state when attempting to connect successfully with ICE connection fails
 *    with trickle ICE connections.<br>
 * Trickle ICE would be disabled after <code>3</code> attempts to have a better
 *   successful ICE connection.
 * @readOnly
 * @since 0.1.0
 * @component ICE
 * @for Skylink
 */
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

/**
 * These are the list of available transports that
 *   Skylink would use to connect to the TURN servers with.
 * - For example as explanation how these options works below, let's take that
 *   these are list of TURN servers given by the platform signaling:<br>
 *   <small><code>turn:turnurl:123?transport=tcp</code><br>
 *   <code>turn:turnurl?transport=udp</code><br>
 *   <code>turn:turnurl:1234</code><br>
 *   <code>turn:turnurl</code></small>
 * @attribute TURN_TRANSPORT
 * @type JSON
 * @param {String} TCP <small>Value <code>"tcp"</code></small>
 *   The option to connect using only TCP transports.
 *   <small>EXAMPLE OUTPUT<br>
 *   <code>turn:turnurl:123?transport=tcp</code><br>
 *   <code>turn:turnurl?transport=tcp</code><br>
 *   <code>turn:turnurl:1234?transport=tcp</code></small>
 * @param {String} UDP <small>Value <code>"udp"</code></small>
 *   The option to connect using only UDP transports.
 *   <small>EXAMPLE OUTPUT<br>
 *   <code>turn:turnurl:123?transport=udp</code><br>
 *   <code>turn:turnurl?transport=udp</code><br>
 *   <code>turn:turnurl:1234?transport=udp</code></small>
 * @param {String} ANY <small><b>DEFAULT</b> | Value <code>"any"</code></small>
 *   This option to use any transports that is preconfigured by provided by the platform signaling.
 *   <small>EXAMPLE OUTPUT<br>
 *   <code>turn:turnurl:123?transport=tcp</code><br>
 *   <code>turn:turnurl?transport=udp</code><br>
 *   <code>turn:turnurl:1234</code><br>
 *   <code>turn:turnurl</code></small>
 * @param {String} NONE <small>Value <code>"none"</code></small>
 *   This option to set no transports.
 *   <small>EXAMPLE OUTPUT<br>
 *   <code>turn:turnurl:123</code><br>
 *   <code>turn:turnurl</code><br>
 *   <code>turn:turnurl:1234</code></small>
 * @param {String} ALL <small>Value <code>"all"</code></small>
 *   This option to use both TCP and UDP transports.
 *   <small>EXAMPLE OUTPUT<br>
 *   <code>turn:turnurl:123?transport=tcp</code><br>
 *   <code>turn:turnurl:123?transport=udp</code><br>
 *   <code>turn:turnurl?transport=tcp</code><br>
 *   <code>turn:turnurl?transport=udp</code><br>
 *   <code>turn:turnurl:1234?transport=tcp</code><br>
 *   <code>turn:turnurl:1234?transport=udp</code></small>
 * @readOnly
 * @since 0.5.4
 * @component ICE
 * @for Skylink
 */
Skylink.prototype.TURN_TRANSPORT = {
  UDP: 'udp',
  TCP: 'tcp',
  ANY: 'any',
  NONE: 'none',
  ALL: 'all'
};

/**
 * The list of Peer connection ICE candidate generation states that Skylink would trigger.
 * - These states references the [w3c WebRTC Specification Draft](http://www.w3.org/TR/webrtc/#idl-def-RTCIceGatheringState).
 * @attribute CANDIDATE_GENERATION_STATE
 * @type JSON
 * @param {String} NEW <small>Value <code>"new"</code></small>
 *   The state when the object was just created, and no networking has occurred yet.<br>
 * This state occurs when Peer connection has just been initialised.
 * @param {String} GATHERING <small>Value <code>"gathering"</code></small>
 *   The state when the ICE engine is in the process of gathering candidates for connection.<br>
 * This state occurs after <code>NEW</code> state.
 * @param {String} COMPLETED <small>Value <code>"completed"</code></small>
 *   The ICE engine has completed gathering. Events such as adding a
 *   new interface or a new TURN server will cause the state to go back to gathering.<br>
 * This state occurs after <code>GATHERING</code> state and means ICE gathering has been done.
 * @readOnly
 * @since 0.4.1
 * @component ICE
 * @for Skylink
 */
Skylink.prototype.CANDIDATE_GENERATION_STATE = {
  NEW: 'new',
  GATHERING: 'gathering',
  COMPLETED: 'completed'
};

/**
 * The current version of the internal <u>Data Transfer (DT)</u> Protocol that Skylink is using.<br>
 * - This is not a feature for developers to use but rather for SDK developers to
 *   see the Protocol version used in this Skylink version.
 * - In some cases, this information may be used for reporting issues with Skylink.
 * - DT_PROTOCOL VERSION: <code>0.1.0</code>.
 * @attribute DT_PROTOCOL_VERSION
 * @type String
 * @readOnly
 * @component DataTransfer
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.DT_PROTOCOL_VERSION = '0.1.0';

/**
 * These are the types of data transfers that indicates if transfer is an
 *   outgoing <small><em>(uploading)</em></small> or incoming <small><em>(downloding)</em></small> transfers.
 * @attribute DATA_TRANSFER_TYPE
 * @type JSON
 * @param {String} UPLOAD <small>Value <code>"upload"</code></small>
 *   This data transfer is an outgoing <em>(uploading)</em> transfer.<br>
 *   Data is sent to the receiving Peer using the associated DataChannel connection.
 * @param {String} DOWNLOAD <small>Value <code>"download"</code></small>
 *   The data transfer is an incoming <em>(downloading)</em> transfer.<br>
 *   Data is received from the sending Peer using the associated DataChannel connection.
 * @readOnly
 * @component DataTransfer
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.DATA_TRANSFER_TYPE = {
  UPLOAD: 'upload',
  DOWNLOAD: 'download'
};

/**
 * These are the list of data transfer states that Skylink would trigger.
 * @attribute DATA_TRANSFER_STATE
 * @type JSON
 * @param {String} UPLOAD_REQUEST <small>Value <code>"request"</code></small>
 *   The state when a data transfer request has been received from Peer.
 * This happens after Peer starts a data transfer using
 *   {{#crossLink "Skylink/sendBlobData:method"}}sendBlobData(){{/crossLink}} or
 *   {{#crossLink "Skylink/sendURLData:method"}}sendURLData(){{/crossLink}}.
 * @param {String} UPLOAD_STARTED <small>Value <code>"uploadStarted"</code></small>
 *   The state when the data transfer will begin and start to upload the first data
 *   packets to receiving Peer.<br>
 * This happens after receiving Peer accepts a data transfer using
 *   {{#crossLink "Skylink/acceptDataTransfer:method"}}acceptDataTransfer(){{/crossLink}}.
 * @param {String} DOWNLOAD_STARTED <small>Value <code>"downloadStarted"</code></small>
 *   The state when the data transfer has begin and associated DataChannel connection is
 *   expected to receive the first data packet from sending Peer.<br>
 * This happens after self accepts a data transfer using
 *   {{#crossLink "Skylink/acceptDataTransfer:method"}}acceptDataTransfer(){{/crossLink}} upon
 *   the triggered state of <code>UPLOAD_REQUEST</code>.
 * @param {String} REJECTED <small>Value <code>"rejected"</code></small>
 *   The state when the data transfer has been rejected by receiving Peer and data transfer is
 *   terminated.<br>
 * This happens after Peer rejects a data transfer using
 *   {{#crossLink "Skylink/acceptDataTransfer:method"}}acceptDataTransfer(){{/crossLink}}.
 * @param {String} UPLOADING <small>Value <code>"uploading"</code></small>
 *   The state when the data transfer is still being transferred to receiving Peer.<br>
 * This happens after state <code>UPLOAD_STARTED</code>.
 * @param {String} DOWNLOADING <small>Value <code>"downloading"</code></small>
 *   The state when the data transfer is still being transferred from sending Peer.<br>
 * This happens after state <code>DOWNLOAD_STARTED</code>.
 * @param {String} UPLOAD_COMPLETED <small>Value <code>"uploadCompleted"</code></small>
 *   The state when the data transfer has been transferred to receiving Peer successfully.<br>
 * This happens after state <code>UPLOADING</code> or <code>UPLOAD_STARTED</code>, depending
 *   on how huge the data being transferred is.
 * @param {String} DOWNLOAD_COMPLETED <small>Value <code>"downloadCompleted"</code></small>
 *   The state when the data transfer has been transferred from sending Peer successfully.<br>
 * This happens after state <code>DOWNLOADING</code> or <code>DOWNLOAD_STARTED</code>, depending
 *   on how huge the data being transferred is.
 * @param {String} CANCEL <small>Value <code>"cancel"</code></small>
 *   The state when the data transfer has been terminated by Peer.<br>
 * This happens after state <code>DOWNLOAD_STARTED</code> or <code>UPLOAD_STARTED</code>.
 * @param {String} ERROR <small>Value <code>"error"</code></small>
 *   The state when the data transfer has occurred an exception.<br>
 * At this stage, the data transfer would usually be terminated and may lead to state <code>CANCEL</code>.
 * @readOnly
 * @component DataTransfer
 * @for Skylink
 * @since 0.4.0
 */
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
  DOWNLOAD_COMPLETED: 'downloadCompleted'
};

/**
 * These are the list of DataChannel connection states that Skylink would trigger.
 * - Some of the state references the [w3c WebRTC Specification Draft](http://w3c.github.io/webrtc-pc/#idl-def-RTCDataChannelState),
 *   except the <code>ERROR</code> state, which is an addition provided state by Skylink
 *   to inform exception during the DataChannel connection with Peers.
 * @attribute DATA_CHANNEL_STATE
 * @type JSON
 * @param {String} CONNECTING <small>Value <code>"connecting"</code></small>
 *   The state when DataChannel is attempting to establish a connection.<br>
 *   This is the initial state when a DataChannel connection is created.
 * @param {String} OPEN <small>Value <code>"open"</code></small>
 *   The state when DataChannel connection is established.<br>
 *   This happens usually after <code>CONNECTING</code> state, or not when DataChannel connection
 *   is from initializing Peer (the one who begins the DataChannel connection).
 * @param {String} CLOSING <small>Value <code>"closing"</code></small>
 *   The state when DataChannel connection is closing.<br>
 *   This happens when DataChannel connection is closing and happens after <code>OPEN</code>.
 * @param {String} CLOSED <small>Value <code>"closed"</code></small>
 *   The state when DataChannel connection is closed.<br>
 *   This happens when DataChannel connection has closed and happens after <code>CLOSING</code>
 *   (or sometimes <code>OPEN</code> depending on the browser implementation).
 * @param {String} ERROR <small>Value <code>"error"</code></small>
 *   The state when DataChannel connection have met with an exception.<br>
 *   This may happen during any state not after <code>CLOSED</code>.
 * @readOnly
 * @component DataChannel
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.DATA_CHANNEL_STATE = {
  CONNECTING: 'connecting',
  OPEN: 'open',
  CLOSING: 'closing',
  CLOSED: 'closed',
  ERROR: 'error'
};

/**
 * These are the types of DataChannel connection that Skylink provides.
 * - Different channels serves different functionalities.
 * @attribute DATA_CHANNEL_TYPE
 * @type JSON
 * @param {String} MESSAGING <small><b>MAIN connection</b> | Value <code>"messaging"</code></small>
 *   This DataChannel connection is used for P2P messaging only, as used in
 *   {{#crossLink "Skylink/sendP2PMessage:method"}}sendP2PMessage(){{/crossLink}}.<br>
 * Unless if self connects with Peers connecting from the mobile SDK platform applications,
 *   this connection would be used for data transfers as used in
 *   {{#crossLink "Skylink/sendBlobData:method"}}sendBlobData(){{/crossLink}} and
 *   and {{#crossLink "Skylink/sendURLData:method"}}sendURLData(){{/crossLink}}, which allows
 *   only one outgoing and incoming data transfer one at a time (no multi-transfer support).<br>
 *   This connection will always be kept alive until the Peer connection has ended.
 * @param {String} DATA <small>Value <code>"data"</code></small>
 *   This DataChannel connection is used for a data transfer, as used in
 *   {{#crossLink "Skylink/sendBlobData:method"}}sendBlobData(){{/crossLink}}
 *   and {{#crossLink "Skylink/sendURLData:method"}}sendURLData(){{/crossLink}}.<br>
 * If self connects with Peers with DataChannel connections of this type,
 *   it indicates that multi-transfer is supported.<br>
 *   This connection will be closed once the data transfer has completed or terminated.
 * @readOnly
 * @component DataChannel
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.DATA_CHANNEL_TYPE = {
  MESSAGING: 'messaging',
  DATA: 'data'
};

/**
 * These are the list of available transfer encodings that would be used by Skylink during a data transfer.
 * - The currently supported data type is <code>BINARY_STRING</code>.
 * - Support for data types <code>BLOB</code> and <code>ARRAY_BUFFER</code> is still in implementation.
 * @attribute DATA_TRANSFER_DATA_TYPE
 * @type JSON
 * @param {String} BINARY_STRING <small><b>DEFAULT</b> | Value <code>"binaryString"</code></small>
 *   The option to let Skylink encode data packets using
 *   [binary converted strings](https://developer.mozilla.org/en-US/docs/Web/HTTP/data_URIs)
 *   when sending the data packets through the DataChannel connection during data transfers.
 * @param {String} ARRAY_BUFFER <small><em>IN IMPLEMENTATION</em> | Value <code>"arrayBuffer"</code></small>
 *   The option to let Skylink encode data packets using
 *   [ArrayBuffers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)
 *   when sending the data packets through the DataChannel connection during data transfers.
 * @param {String} BLOB <small><em>IN IMPLEMENTATION</em> | Value <code>"blob"</code></small>
 *   The option to let Skylink encode data packets using
 *   [Blobs](https://developer.mozilla.org/en/docs/Web/API/Blob)
 *   when sending the data packets through the DataChannel connection during data transfers.
 * @readOnly
 * @component DataProcess
 * @partof DATA TRANSFER FUNCTIONALITY
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.DATA_TRANSFER_DATA_TYPE = {
  BINARY_STRING: 'binaryString',
  ARRAY_BUFFER: 'arrayBuffer',
  BLOB: 'blob'
};

/**
 * These are the list of platform signaling system actions that Skylink would be given with.
 * - Upon receiving from the signaling, the application has to reflect the
 *   relevant actions given.
 * - You may refer to {{#crossLink "Skylink/SYSTEM_ACTION_REASON:attribute"}}SYSTEM_ACTION_REASON{{/crossLink}}
 *   for the types of system action reasons that would be given.
 * @attribute SYSTEM_ACTION
 * @type JSON
 * @param {String} WARNING <small>Value <code>"warning"</code></small>
 *   This action serves a warning to self. Usually if
 *   warning is not heeded, it may result in an <code>REJECT</code> action.
 * @param {String} REJECT <small>Value <code>"reject"</code></small>
 *   This action means that self has been kicked out
 *   of the current signaling room connection, and subsequent Peer connections
 *   would be disconnected.
 * @readOnly
 * @component Room
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype.SYSTEM_ACTION = {
  WARNING: 'warning',
  REJECT: 'reject'
};

/**
 * These are the list of Skylink platform signaling codes as the reason
 *   for the system action given by the platform signaling that Skylink would receive.
 * - You may refer to {{#crossLink "Skylink/SYSTEM_ACTION:attribute"}}SYSTEM_ACTION{{/crossLink}}
 *   for the types of system actions that would be given.
 * - Reason codes like <code>FAST_MESSAGE</code>, <code>ROOM_FULL</code>, <code>VERIFICATION</code> and
 *   <code>OVER_SEAT_LIMIT</code> has been removed as they are no longer supported.
 * @attribute SYSTEM_ACTION_REASON
 * @type JSON
 * @param {String} ROOM_LOCKED <small>Value <code>"locked"</code> | Action ties with <code>REJECT</code></small>
 *   The reason code when room is locked and self is rejected from joining the room.
 * @param {String} DUPLICATED_LOGIN <small>Value <code>"duplicatedLogin"</code> | Action ties with <code>REJECT</code></small>
 *   The reason code when the credentials given is already in use, which the platform signaling
 *   throws an exception for this error.<br>
 * This rarely occurs as Skylink handles this issue, and it's recommended to report this issue if this occurs.
 * @param {String} SERVER_ERROR <small>Value <code>"serverError"</code> | Action ties with <code>REJECT</code></small>
 *   The reason code when the connection with the platform signaling has an exception with self.<br>
 * This rarely (and should not) occur and it's recommended to  report this issue if this occurs.
 * @param {String} EXPIRED <small>Value <code>"expired"</code> | Action ties with <code>REJECT</code></small>
 *   The reason code when the persistent room meeting has expired so self is unable to join the room as
 *   the end time of the meeting has ended.<br>
 * Depending on other meeting timings available for this room, the persistent room will appear expired.<br>
 * This relates to the persistent room feature configured in the Application Key.
 * @param {String} ROOM_CLOSED <small>Value <code>"roomclose"</code> | Action ties with <code>REJECT</code></small>
 *   The reason code when the persistent room meeting has ended and has been rendered expired so self is rejected
 *   from the room as the meeting is over.<br>
 * This relates to the persistent room feature configured in the Application Key.
 * @param {String} ROOM_CLOSING <small>Value <code>"toclose"</code> | Action ties with <code>WARNING</code></small>
 *   The reason code when the persistent room meeting is going to end soon, so this warning is given to inform
 *   users before self is rejected from the room.<br>
 * This relates to the persistent room feature configured in the Application Key.
 * @readOnly
 * @component Room
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype.SYSTEM_ACTION_REASON = {
  //FAST_MESSAGE: 'fastmsg',
  ROOM_LOCKED: 'locked',
  //ROOM_FULL: 'roomfull',
  DUPLICATED_LOGIN: 'duplicatedLogin',
  SERVER_ERROR: 'serverError',
  //VERIFICATION: 'verification',
  EXPIRED: 'expired',
  ROOM_CLOSED: 'roomclose',
  ROOM_CLOSING: 'toclose'
};

/**
 * These are the logging levels that Skylink provides.
 * - This manipulates the debugging messages sent to <code>console</code> object.
 * - Refer to [Javascript Web Console](https://developer.mozilla.org/en/docs/Web/API/console).
 * @attribute LOG_LEVEL
 * @type JSON
 * @param {Number} DEBUG <small>Value <code>4</code> | Level higher than <code>LOG</code></small>
 *   Displays debugging logs from <code>LOG</code> level onwards with <code>DEBUG</code> logs.
 * @param {Number} LOG <small>Value <code>3</code> | Level higher than <code>INFO</code></small>
 *   Displays debugging logs from <code>INFO</code> level onwards with <code>LOG</code> logs.
 * @param {Number} INFO <small>Value <code>2</code> | Level higher than <code>WARN</code></small>
 *   Displays debugging logs from <code>WARN</code> level onwards with <code>INFO</code> logs.
 * @param {Number} WARN <small>Value <code>1</code> | Level higher than <code>ERROR</code></small>
 *   Displays debugging logs of <code>ERROR</code> level with <code>WARN</code> logs.
 * @param {Number} ERROR <small><b>DEFAULT</b> | Value <code>0</code> | Lowest level</small>
 *   Displays only <code>ERROR</code> logs.
 * @readOnly
 * @component Log
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype.LOG_LEVEL = {
  DEBUG: 4,
  LOG: 3,
  INFO: 2,
  WARN: 1,
  ERROR: 0
};

/**
 * These are the list of socket connection error states that Skylink would trigger.
 * - These error states references the [socket.io-client events](http://socket.io/docs/client-api/).
 * @attribute SOCKET_ERROR
 * @type JSON
 * @param {Number} CONNECTION_FAILED <small>Value <code>0</code></small>
 *   The error state when Skylink have failed to establish a socket connection with
 *   platform signaling in the first attempt.
 * @param {String} RECONNECTION_FAILED <small>Value <code>-1</code></small>
 *   The error state when Skylink have failed to
 *   reestablish a socket connection with platform signaling after the first attempt
 *   <code>CONNECTION_FAILED</code>.
 * @param {String} CONNECTION_ABORTED <small>Value <code>-2</code></small>
 *   The error state when attempt to reestablish socket connection
 *   with platform signaling has been aborted after the failed first attempt
 *   <code>CONNECTION_FAILED</code>.
 * @param {String} RECONNECTION_ABORTED <small>Value <code>-3</code></small>
 *   The error state when attempt to reestablish socket connection
 *   with platform signaling has been aborted after several failed reattempts
 *   <code>RECONNECTION_FAILED</code>.
 * @param {String} RECONNECTION_ATTEMPT <small>Value <code>-4</code></small>
 *   The error state when Skylink is attempting to reestablish
 *   a socket connection with platform signaling after a failed attempt
 *   <code>CONNECTION_FAILED</code> or <code>RECONNECTION_FAILED</code>.
 * @readOnly
 * @component Socket
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.SOCKET_ERROR = {
  CONNECTION_FAILED: 0,
  RECONNECTION_FAILED: -1,
  CONNECTION_ABORTED: -2,
  RECONNECTION_ABORTED: -3,
  RECONNECTION_ATTEMPT: -4
};

/**
 * These are the list of fallback attempt types that Skylink would attempt with.
 * @attribute SOCKET_FALLBACK
 * @type JSON
 * @param {String} NON_FALLBACK <small>Value <code>"nonfallback"</code> | Protocol <code>"http:"</code>,
 * <code>"https:"</code> | Transports <code>"WebSocket"</code>, <code>"Polling"</code></small>
 *   The current socket connection attempt
 *   is using the first selected socket connection port for
 *   the current selected transport <code>"Polling"</code> or <code>"WebSocket"</code>.
 * @param {String} FALLBACK_PORT <small>Value <code>"fallbackPortNonSSL"</code> | Protocol <code>"http:"</code>
 *  | Transports <code>"WebSocket"</code></small>
 *   The current socket connection reattempt
 *   is using the next selected socket connection port for
 *   <code>HTTP</code> protocol connection with the current selected transport
 *   <code>"Polling"</code> or <code>"WebSocket"</code>.
 * @param {String} FALLBACK_PORT_SSL <small>Value <code>"fallbackPortSSL"</code> | Protocol <code>"https:"</code>
 *  | Transports <code>"WebSocket"</code></small>
 *   The current socket connection reattempt
 *   is using the next selected socket connection port for
 *   <code>HTTPS</code> protocol connection with the current selected transport
 *   <code>"Polling"</code> or <code>"WebSocket"</code>.
 * @param {String} LONG_POLLING <small>Value <code>"fallbackLongPollingNonSSL"</code> | Protocol <code>"http:"</code>
 *  | Transports <code>"Polling"</code></small>
 *   The current socket connection reattempt
 *   is using the next selected socket connection port for
 *   <code>HTTP</code> protocol connection with <code>"Polling"</code> after
 *   many attempts of <code>"WebSocket"</code> has failed.
 *   This occurs only for socket connection that is originally using
 *   <code>"WebSocket"</code> transports.
 * @param {String} LONG_POLLING_SSL <small>Value <code>"fallbackLongPollingSSL"</code> | Protocol <code>"https:"</code>
 *  | Transports <code>"Polling"</code></small>
 *   The current socket connection reattempt
 *   is using the next selected socket connection port for
 *   <code>HTTPS</code> protocol connection with <code>"Polling"</code> after
 *   many attempts of <code>"WebSocket"</code> has failed.
 *   This occurs only for socket connection that is originally using
 *   <code>"WebSocket"</code> transports.
 * @readOnly
 * @component Socket
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.SOCKET_FALLBACK = {
  NON_FALLBACK: 'nonfallback',
  FALLBACK_PORT: 'fallbackPortNonSSL',
  FALLBACK_SSL_PORT: 'fallbackPortSSL',
  LONG_POLLING: 'fallbackLongPollingNonSSL',
  LONG_POLLING_SSL: 'fallbackLongPollingSSL'
};

/**
 * These are the list of Peer connection handshake states that Skylink would trigger.
 * - Do not be confused with {{#crossLink "Skylink/PEER_CONNECTION_STATE:attr"}}PEER_CONNECTION_STATE{{/crossLink}}.
 *   This is the Peer recognition connection that is established with the platform signaling protocol, and not
 *   the Peer connection signaling state itself.
 * - In this case, this happens before the {{#crossLink "Skylink/PEER_CONNECTION_STATE:attr"}}PEER_CONNECTION_STATE
 *   handshaking states. {{/crossLink}} The <code>OFFER</code> and <code>ANSWER</code> relates to the
 *   {{#crossLink "Skylink/PEER_CONNECTION_STATE:attr"}}PEER_CONNECTION_STATE states{{/crossLink}}.
 * - For example as explanation how these state works below, let's make self as the offerer and
 *   the connecting Peer as the answerer.
 * @attribute HANDSHAKE_PROGRESS
 * @type JSON
 * @param {String} ENTER <small>Value <code>"enter"</code></small>
 *   The state when Peer have received <code>ENTER</code> from self,
 *   and Peer connection with self is initialised with self.<br>
 * This state will occur for both self and Peer as <code>ENTER</code>
 *   message is sent to ping for Peers in the room.<br>
 * At this state, Peer would sent <code>WELCOME</code> to the peer to
 *   start the session description connection handshake.<br>
 * <table class="table table-condensed">
 *   <thead><tr><th class="col-md-1"></th><th class="col-md-5">Self</th><th>Peer</th></thead>
 *   <tbody>
 *     <tr><td class="col-md-1">1.</td>
 *       <td class="col-md-5">Sends <code>ENTER</code></td><td>Sends <code>ENTER</code></td></tr>
 *     <tr><td class="col-md-1">2.</td>
 *       <td class="col-md-5">-</td><td>Receives self <code>ENTER</code></td></tr>
 *     <tr><td class="col-md-1">3.</td>
 *       <td class="col-md-5">-</td><td>Sends self <code>WELCOME</code></td></tr>
 *   </tbody>
 * </table>
 * @param {String} WELCOME <small>Value <code>"welcome"</code></small>
 *   The state when self have received <code>WELCOME</code> from Peer,
 *   and Peer connection is initialised with Peer.<br>
 * At this state, self would start the session description connection handshake and
 *   send the local <code>OFFER</code> session description to Peer.
 * <table class="table table-condensed">
 *   <thead><tr><th class="col-md-1"></th><th class="col-md-5">Self</th><th>Peer</th></thead>
 *   <tbody>
 *     <tr><td class="col-md-1">4.</td>
 *       <td class="col-md-5">Receives <code>WELCOME</code></td><td>-</td></tr>
 *     <tr><td class="col-md-1">5.</td>
 *       <td class="col-md-5">Generates <code>OFFER</code></td><td>-</td></tr>
 *     <tr><td class="col-md-1">6.</td>
 *       <td class="col-md-5">Sets local <code>OFFER</code><sup>REF</sup></td><td>-</td></tr>
 *     <tr><td class="col-md-1">7.</td>
 *       <td class="col-md-5">Sends <code>OFFER</code></td><td>-</td></tr>
 *   </tbody>
 * </table>
 * <sup>REF</sup>: The will cause {{#crossLink "Skylink/PEER_CONNECTION_STATE:attr"}}PEER_CONNECTION_STATE{{/crossLink}}
 *   state go to <code>HAVE_LOCAL_OFFER</code>.
 * @param {String} OFFER <small>Value <code>"offer"</code></small>
 *   The state when Peer received <code>OFFER</code> from self.
 * At this state, Peer would set the remote <code>OFFER</code> session description and
 *   start to send local <code>ANSWER</code> session description to self.<br>
 * <table class="table table-condensed">
 *   <thead><tr><th class="col-md-1"></th><th class="col-md-5">Self</th><th>Peer</th></thead>
 *   <tbody>
 *     <tr><td class="col-md-1">8.</td>
 *        <td class="col-md-5">-</td><td>Receives <code>OFFER</code></td></tr>
 *     <tr><td class="col-md-1">9.</td>
 *        <td class="col-md-5">-</td><td>Sets remote <code>OFFER</code><sup>REF</sup></td></tr>
 *     <tr><td class="col-md-1">10.</td>
 *        <td class="col-md-5">-</td><td>Generates <code>ANSWER</code></td></tr>
 *     <tr><td class="col-md-1">11.</td>
 *        <td class="col-md-5">-</td><td>Sets local <code>ANSWER</code></td></tr>
 *     <tr><td class="col-md-1">12.</td>
 *        <td class="col-md-5">-</td><td>Sends <code>ANSWER</code></td></tr>
 *   </tbody>
 * </table>
 * <sup>REF</sup>: The will cause {{#crossLink "Skylink/PEER_CONNECTION_STATE:attr"}}PEER_CONNECTION_STATE{{/crossLink}}
 *   state go to <code>HAVE_REMOTE_OFFER</code>.
 * @param {String} ANSWER <small>Value <code>"answer"</code></small>
 *   The state when self received <code>ANSWER</code> from Peer.<br>
 * At this state, self would set the remote <code>ANSWER</code> session description and
 *   the connection handshaking progress has been completed.<br>
 * <table class="table table-condensed">
 *   <thead><tr><th class="col-md-1"></th><th class="col-md-5">Self</th><th>Peer</th></thead>
 *   <tbody>
 *     <tr><td class="col-md-1">13.</td>
 *        <td class="col-md-5">Receives <code>ANSWER</code></td><td>-</td></tr>
 *     <tr><td class="col-md-1">14.</td>
 *        <td class="col-md-5">Sets remote <code>ANSWER</code></td><td>-</td></tr>
 *   </tbody>
 * </table>
 * @param {String} ERROR <small>Value <code>"error"</code></small>
 *   The state when connection handshake has occurred and exception,
 *   in this which the connection handshake could have been aborted abruptly
 *   and no Peer connection is established.
 * @readOnly
 * @component Peer
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.HANDSHAKE_PROGRESS = {
  ENTER: 'enter',
  WELCOME: 'welcome',
  OFFER: 'offer',
  ANSWER: 'answer',
  ERROR: 'error'
};

