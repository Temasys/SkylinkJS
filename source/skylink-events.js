/**
 * Stores the list of {{#crossLink "Skylink/on:method"}}on(){{/crossLink}}
 *   event subscription handlers.
 * @attribute _EVENTS
 * @param {Array} (#eventName) The array of event subscription handlers that is
 *   subscribed using {{#crossLink "Skylink/on:method"}}on() method{{/crossLink}}
 *   associated with the event name.
 * @param {Function} (#eventName).(#index) The event subscription handler
 *   associated with the event name. This is to be triggered multiple times
 *   until {{#crossLink "Skylink/off:method"}}off(){{/crossLink}} is invoked for
 *   this event subscription handler.
 * @type JSON
 * @private
 * @required
 * @component Events
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._EVENTS = {
  /**
   * Event triggered when the platform signaling socket connection is open and is ready for room connection.
   * @event channelOpen
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  channelOpen: [],

  /**
   * Event triggered when the platform signaling socket connection has closed.
   * server has closed.
   * @event channelClose
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  channelClose: [],

  /**
   * Event triggered when Skylink is exchanging socket messages with the platform signaling
   *   through the socket connection.
   * This is a debugging feature, and it's not advisable to subscribe to this event unless
   *   you are debugging the socket messages received from the platform signaling.
   * from the signaling server.
   * @event channelMessage
   * @param {JSON} message The socket message object data received from the platform signaling.
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  channelMessage: [],

  /**
   * Event triggered when Skylink socket connection with the platform signaling has occurred an exception.
   * This happens after a successful socket connection with the platform signaling.
   * Usually at this stage, the signaling socket connection could be disrupted.
   * @event channelError
   * @param {Object|String} error The error object thrown that caused the exception.
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  channelError: [],

  /**
   * Event triggered when Skylink attempting to reconnect the socket connection with the platform signaling.
   * @event channelRetry
   * @param {String} fallbackType The fallback socket transport that Skylink is attempting to reconnect with.
   *   [Rel: Skylink.SOCKET_FALLBACK]
   * @param {Number} currentAttempt The current reconnection attempt.
   * @component Events
   * @for Skylink
   * @since 0.5.6
   */
  channelRetry: [],

  /**
   * Event triggered when Skylink has failed to establish a socket connection with the platform signaling.
   * @event socketError
   * @param {String} errorCode The socket connection error code received.
   *   [Rel: Skylink.SOCKET_ERROR]
   * @param {Number|String|Object} error The error object thrown that caused the failure.
   * @param {String} type The socket transport that Skylink has failed to connect with.
   *   [Rel: Skylink.SOCKET_FALLBACK]
   * @component Events
   * @for Skylink
   * @since 0.5.5
   */
  socketError: [],

  /**
   * Event triggered when Skylink is retrieving the connection information from the platform server.
   * @event readyStateChange
   * @param {String} readyState The current ready state of the retrieval when the event is triggered.
   *   [Rel: Skylink.READY_STATE_CHANGE]
   * @param {JSON} [error=null] The error object thrown when there is a failure in retrieval.
   *   If received as <code>null</code>, it means that there is no errors.
   * @param {Number} error.status Http status when retrieving information.
   *   May be empty for other errors.
   * @param {Number} error.errorCode The
   *   <a href="#attr_READY_STATE_CHANGE_ERROR">READY_STATE_CHANGE_ERROR</a>
   *   if there is an <a href="#event_readyStateChange">readyStateChange</a>
   *   event error that caused the failure for initialising Skylink.
   *   [Rel: Skylink.READY_STATE_CHANGE_ERROR]
   * @param {Object} error.content The exception thrown that caused the failure
   *   for initialising Skylink.
   * @param {Number} callback.error.status The XMLHttpRequest status code received
   *   when exception is thrown that caused the failure for initialising Skylink.
   * @param {String} room The selected room connection information that Skylink is attempting
   *   to retrieve the information for to start connection to.
   * @component Events
   * @for Skylink
   * @since 0.4.0
   */
  readyStateChange: [],

  /**
   * Event triggered when a PeerConnection connection handshake state has changed.
   * @event handshakeProgress
   * @param {String} step The PeerConnection connection handshake state.
   *   [Rel: Skylink.HANDSHAKE_PROGRESS]
   * @param {String} peerId The PeerConnection ID associated with the connection
   *   handshake state.
   * @param {Object|String} [error] The error object thrown when there is a failure in
   *   the connection handshaking.
   * @component Events
   * @for Skylink
   * @since 0.3.0
   */
  handshakeProgress: [],

  /**
   * Event triggered when a PeerConnection connection ICE gathering state has changed.
   * @event candidateGenerationState
   * @param {String} state The PeerConnection connection ICE gathering state.
   *   [Rel: Skylink.CANDIDATE_GENERATION_STATE]
   * @param {String} peerId The PeerConnection ID associated with the ICE gathering state.
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  candidateGenerationState: [],

  /**
   * Event triggered when a PeerConnection connection signaling state has changed.
   * @event peerConnectionState
   * @param {String} state The PeerConnection connection signaling state.
   *   [Rel: Skylink.PEER_CONNECTION_STATE]
   * @param {String} peerId The PeerConnection ID associated with the connection
   *   signaling state.
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  peerConnectionState: [],

  /**
   * Event triggered when a PeerConnection connection ICE connection state has changed.
   * @event iceConnectionState
   * @param {String} state The PeerConnection connection ICE connection state.
   *   [Rel: Skylink.ICE_CONNECTION_STATE]
   * @param {String} peerId The PeerConnection ID associated with the ICE connection state.
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  iceConnectionState: [],

  /**
   * Event triggered when Skylink fails to have access to self user media stream.
   * @event mediaAccessError
   * @param {Object|String} error The error object thrown that caused the failure.
   * @param {Boolean} isScreensharing The flag that indicates if self
   *    Stream object is a screensharing stream or not.
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  mediaAccessError: [],

  /**
   * Event triggered when Skylink have been successfully granted access to self user media stream and
   *   attached to Skylink.
   * @event mediaAccessSuccess
   * @param {Object} stream The self user [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_API)
   *   object. To display the MediaStream object to a <code>video</code> or <code>audio</code>, simply invoke:<br>
   *   <code>attachMediaStream(domElement, stream);</code>.
   * @param {Boolean} isScreensharing The flag that indicates if self
   *    Stream object is a screensharing stream or not.
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  mediaAccessSuccess: [],

  /**
   * Event triggered when thhe application requires to retrieve self user media stream with
   *   {{#crossLink "Skylink/getUserMedia:method"}}getUserMedia(){{/crossLink}}.
   * Once the self user media stream is attached to Skylink, the socket connection to
   *   the signaling will start and then join self to the selected room.
   * This event will be triggered if <code>manualGetUserMedia</code> is set to <code>true</code> in
   *   {{#crossLink "Skylink/joinRoom:method"}}joinRoom() options{{/crossLink}}.
   * @event mediaAccessRequired
   * @component Events
   * @for Skylink
   * @since 0.5.5
   */
  mediaAccessRequired: [],

  /**
   * Event triggered when self user media stream attached to Skylink has been stopped.
   * @event mediaAccessStopped
   * @param {Boolean} isScreensharing The flag that indicates if self
   *    Stream object is a screensharing stream or not.
   * @component Events
   * @for Skylink
   * @since 0.5.6
   */
  mediaAccessStopped: [],

  /**
   * Event triggered when a PeerConnection peer joins the room.
   * @event peerJoined
   * @param {String} peerId The PeerConnection ID of the new peer
   *   that has joined the room.
   * @param {Object} peerInfo The peer information associated
   *   with the Peer Connection.
   * @param {String|JSON} peerInfo.userData The custom user data
   *   information set by developer. This custom user data can also
   *   be set in <a href="#method_setUserData">setUserData()</a>.
   * @param {JSON} peerInfo.settings The PeerConnection Stream
   *   streaming settings information. If both audio and video
   *   option is <code>false</code>, there should be no
   *   receiving remote Stream object from this associated PeerConnection.
   * @param {Boolean|JSON} [peerInfo.settings.audio=false] The
   *   PeerConnection Stream streaming audio settings. If
   *   <code>false</code>, it means that audio streaming is disabled in
   *   the remote Stream of the PeerConnection.
   * @param {Boolean} [peerInfo.settings.audio.stereo] The flag that indicates if
   *   stereo option should be explictly enabled to an OPUS enabled audio stream.
   *   Check the <code>audioCodec</code> configuration settings in
   *   {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}
   *   to enable OPUS as the audio codec. Note that stereo is already enabled
   *   for OPUS codecs, this only adds a stereo flag to the SDP to explictly
   *   enable stereo in the audio streaming.
   * @param {Boolean|JSON} [peerInfo.settings.video=false] The PeerConnection
   *   Stream streaming video settings. If <code>false</code>, it means that
   *   video streaming is disabled in the remote Stream of the PeerConnection.
   * @param {JSON} [peerInfo.settings.video.resolution] The PeerConnection
   *   Stream streaming video resolution settings. Setting the resolution may
   *   not force set the resolution provided as it depends on the how the
   *   browser handles the resolution. [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Number} [peerInfo.settings.video.resolution.width] The PeerConnection
   *   Stream streaming video resolution width.
   * @param {Number} [peerInfo.settings.video.resolution.height] The PeerConnection
   *   Stream streaming video resolution height.
   * @param {Number} [peerInfo.settings.video.frameRate] The PeerConnection
   *   Stream streaming video maximum frameRate.
   * @param {Boolean} [peerInfo.settings.video.screenshare=false] The flag
   *   that indicates if the PeerConnection connection Stream object sent
   *   is a screensharing stream or not.
   * @param {String} [peerInfo.settings.bandwidth] The PeerConnection
   *   streaming bandwidth settings. Setting the bandwidth flags may not
   *   force set the bandwidth for each connection stream channels as it depends
   *   on how the browser handles the bandwidth bitrate. Values are configured
   *   in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.audio] The configured
   *   audio stream channel for the remote Stream object bandwidth
   *   that audio streaming should use in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.video] The configured
   *   video stream channel for the remote Stream object bandwidth
   *   that video streaming should use in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.data] The configured
   *   datachannel channel for the DataChannel connection bandwidth
   *   that datachannel connection per packet should be able use in <var>kb/s</var>.
   * @param {JSON} peerInfo.mediaStatus The PeerConnection Stream mute
   *   settings for both audio and video streamings.
   * @param {Boolean} [peerInfo.mediaStatus.audioMuted=true] The flag that
   *   indicates if the remote Stream object audio streaming is muted. If
   *   there is no audio streaming enabled for the PeerConnection, by default,
   *   it is set to <code>true</code>.
   * @param {Boolean} [peerInfo.mediaStatus.videoMuted=true] The flag that
   *   indicates if the remote Stream object video streaming is muted. If
   *   there is no video streaming enabled for the PeerConnection, by default,
   *   it is set to <code>true</code>.
   * @param {JSON} peerInfo.agent The PeerConnection platform agent information.
   * @param {String} peerInfo.agent.name The PeerConnection platform browser or agent name.
   * @param {Number} peerInfo.agent.version The PeerConnection platform browser or agent version.
   * @param {Number} peerInfo.agent.os The PeerConnection platform name.
   * @param {String} peerInfo.room The current room that the PeerConnection peer is in.
   * @param {Boolean} isSelf The flag that indicates if self is the PeerConnection peer.
   * @component Events
   * @for Skylink
   * @since 0.5.2
   */
  peerJoined: [],

  /**
   * Event triggered when a PeerConnection connection has been restarted for
   *   a reconnection.
   * @event peerRestart
   * @param {String} peerId The PeerConnection ID of the connection that
   *   is restarted for a reconnection.
   * @param {Object} peerInfo The peer information associated
   *   with the Peer Connection.
   * @param {String|JSON} peerInfo.userData The custom user data
   *   information set by developer. This custom user data can also
   *   be set in <a href="#method_setUserData">setUserData()</a>.
   * @param {JSON} peerInfo.settings The PeerConnection Stream
   *   streaming settings information. If both audio and video
   *   option is <code>false</code>, there should be no
   *   receiving remote Stream object from this associated PeerConnection.
   * @param {Boolean|JSON} [peerInfo.settings.audio=false] The
   *   PeerConnection Stream streaming audio settings. If
   *   <code>false</code>, it means that audio streaming is disabled in
   *   the remote Stream of the PeerConnection.
   * @param {Boolean} [peerInfo.settings.audio.stereo] The flag that indicates if
   *   stereo option should be explictly enabled to an OPUS enabled audio stream.
   *   Check the <code>audioCodec</code> configuration settings in
   *   {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}
   *   to enable OPUS as the audio codec. Note that stereo is already enabled
   *   for OPUS codecs, this only adds a stereo flag to the SDP to explictly
   *   enable stereo in the audio streaming.
   * @param {Boolean|JSON} [peerInfo.settings.video=false] The PeerConnection
   *   Stream streaming video settings. If <code>false</code>, it means that
   *   video streaming is disabled in the remote Stream of the PeerConnection.
   * @param {JSON} [peerInfo.settings.video.resolution] The PeerConnection
   *   Stream streaming video resolution settings. Setting the resolution may
   *   not force set the resolution provided as it depends on the how the
   *   browser handles the resolution. [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Number} [peerInfo.settings.video.resolution.width] The PeerConnection
   *   Stream streaming video resolution width.
   * @param {Number} [peerInfo.settings.video.resolution.height] The PeerConnection
   *   Stream streaming video resolution height.
   * @param {Number} [peerInfo.settings.video.frameRate] The PeerConnection
   *   Stream streaming video maximum frameRate.
   * @param {Boolean} [peerInfo.settings.video.screenshare=false] The flag
   *   that indicates if the PeerConnection connection Stream object sent
   *   is a screensharing stream or not.
   * @param {String} [peerInfo.settings.bandwidth] The PeerConnection
   *   streaming bandwidth settings. Setting the bandwidth flags may not
   *   force set the bandwidth for each connection stream channels as it depends
   *   on how the browser handles the bandwidth bitrate. Values are configured
   *   in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.audio] The configured
   *   audio stream channel for the remote Stream object bandwidth
   *   that audio streaming should use in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.video] The configured
   *   video stream channel for the remote Stream object bandwidth
   *   that video streaming should use in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.data] The configured
   *   datachannel channel for the DataChannel connection bandwidth
   *   that datachannel connection per packet should be able use in <var>kb/s</var>.
   * @param {JSON} peerInfo.mediaStatus The PeerConnection Stream mute
   *   settings for both audio and video streamings.
   * @param {Boolean} [peerInfo.mediaStatus.audioMuted=true] The flag that
   *   indicates if the remote Stream object audio streaming is muted. If
   *   there is no audio streaming enabled for the PeerConnection, by default,
   *   it is set to <code>true</code>.
   * @param {Boolean} [peerInfo.mediaStatus.videoMuted=true] The flag that
   *   indicates if the remote Stream object video streaming is muted. If
   *   there is no video streaming enabled for the PeerConnection, by default,
   *   it is set to <code>true</code>.
   * @param {JSON} peerInfo.agent The PeerConnection platform agent information.
   * @param {String} peerInfo.agent.name The PeerConnection platform browser or agent name.
   * @param {Number} peerInfo.agent.version The PeerConnection platform browser or agent version.
   * @param {Number} peerInfo.agent.os The PeerConnection platform name.
   * @param {String} peerInfo.room The current room that the PeerConnection peer is in.
   * @param {Boolean} isSelfInitiateRestart The flag that indicates if self is
   *    the one who have initiated the PeerConnection connection restart.
   * @component Events
   * @for Skylink
   * @since 0.5.5
   */
  peerRestart: [],

  /**
   * Event triggered when a PeerConnection peer information have been updated.
   * This event would only be triggered if self is in the room.
   * @event peerUpdated
   * @param {String} peerId The PeerConnection ID of the peer with updated information.
   * @param {Object} peerInfo The peer information associated
   *   with the Peer Connection.
   * @param {String|JSON} peerInfo.userData The custom user data
   *   information set by developer. This custom user data can also
   *   be set in <a href="#method_setUserData">setUserData()</a>.
   * @param {JSON} peerInfo.settings The PeerConnection Stream
   *   streaming settings information. If both audio and video
   *   option is <code>false</code>, there should be no
   *   receiving remote Stream object from this associated PeerConnection.
   * @param {Boolean|JSON} [peerInfo.settings.audio=false] The
   *   PeerConnection Stream streaming audio settings. If
   *   <code>false</code>, it means that audio streaming is disabled in
   *   the remote Stream of the PeerConnection.
   * @param {Boolean} [peerInfo.settings.audio.stereo] The flag that indicates if
   *   stereo option should be explictly enabled to an OPUS enabled audio stream.
   *   Check the <code>audioCodec</code> configuration settings in
   *   {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}
   *   to enable OPUS as the audio codec. Note that stereo is already enabled
   *   for OPUS codecs, this only adds a stereo flag to the SDP to explictly
   *   enable stereo in the audio streaming.
   * @param {Boolean|JSON} [peerInfo.settings.video=false] The PeerConnection
   *   Stream streaming video settings. If <code>false</code>, it means that
   *   video streaming is disabled in the remote Stream of the PeerConnection.
   * @param {JSON} [peerInfo.settings.video.resolution] The PeerConnection
   *   Stream streaming video resolution settings. Setting the resolution may
   *   not force set the resolution provided as it depends on the how the
   *   browser handles the resolution. [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Number} [peerInfo.settings.video.resolution.width] The PeerConnection
   *   Stream streaming video resolution width.
   * @param {Number} [peerInfo.settings.video.resolution.height] The PeerConnection
   *   Stream streaming video resolution height.
   * @param {Number} [peerInfo.settings.video.frameRate] The PeerConnection
   *   Stream streaming video maximum frameRate.
   * @param {Boolean} [peerInfo.settings.video.screenshare=false] The flag
   *   that indicates if the PeerConnection connection Stream object sent
   *   is a screensharing stream or not.
   * @param {String} [peerInfo.settings.bandwidth] The PeerConnection
   *   streaming bandwidth settings. Setting the bandwidth flags may not
   *   force set the bandwidth for each connection stream channels as it depends
   *   on how the browser handles the bandwidth bitrate. Values are configured
   *   in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.audio] The configured
   *   audio stream channel for the remote Stream object bandwidth
   *   that audio streaming should use in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.video] The configured
   *   video stream channel for the remote Stream object bandwidth
   *   that video streaming should use in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.data] The configured
   *   datachannel channel for the DataChannel connection bandwidth
   *   that datachannel connection per packet should be able use in <var>kb/s</var>.
   * @param {JSON} peerInfo.mediaStatus The PeerConnection Stream mute
   *   settings for both audio and video streamings.
   * @param {Boolean} [peerInfo.mediaStatus.audioMuted=true] The flag that
   *   indicates if the remote Stream object audio streaming is muted. If
   *   there is no audio streaming enabled for the PeerConnection, by default,
   *   it is set to <code>true</code>.
   * @param {Boolean} [peerInfo.mediaStatus.videoMuted=true] The flag that
   *   indicates if the remote Stream object video streaming is muted. If
   *   there is no video streaming enabled for the PeerConnection, by default,
   *   it is set to <code>true</code>.
   * @param {JSON} peerInfo.agent The PeerConnection platform agent information.
   * @param {String} peerInfo.agent.name The PeerConnection platform browser or agent name.
   * @param {Number} peerInfo.agent.version The PeerConnection platform browser or agent version.
   * @param {Number} peerInfo.agent.os The PeerConnection platform name.
   * @param {String} peerInfo.room The current room that the PeerConnection peer is in.
   * @param {Boolean} isSelf The flag that indicates if self is the PeerConnection peer.
   * @component Events
   * @for Skylink
   * @since 0.5.2
   */
  peerUpdated: [],

  /**
   * Event triggered when a PeerConnection peer leaves the room.
   * @event peerLeft
   * @param {String} peerId The PeerConnection ID of the peer
   *   that had left the room.
   * @param {Object} peerInfo The peer information associated
   *   with the Peer Connection.
   * @param {String|JSON} peerInfo.userData The custom user data
   *   information set by developer. This custom user data can also
   *   be set in <a href="#method_setUserData">setUserData()</a>.
   * @param {JSON} peerInfo.settings The PeerConnection Stream
   *   streaming settings information. If both audio and video
   *   option is <code>false</code>, there should be no
   *   receiving remote Stream object from this associated PeerConnection.
   * @param {Boolean|JSON} [peerInfo.settings.audio=false] The
   *   PeerConnection Stream streaming audio settings. If
   *   <code>false</code>, it means that audio streaming is disabled in
   *   the remote Stream of the PeerConnection.
   * @param {Boolean} [peerInfo.settings.audio.stereo] The flag that indicates if
   *   stereo option should be explictly enabled to an OPUS enabled audio stream.
   *   Check the <code>audioCodec</code> configuration settings in
   *   {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}
   *   to enable OPUS as the audio codec. Note that stereo is already enabled
   *   for OPUS codecs, this only adds a stereo flag to the SDP to explictly
   *   enable stereo in the audio streaming.
   * @param {Boolean|JSON} [peerInfo.settings.video=false] The PeerConnection
   *   Stream streaming video settings. If <code>false</code>, it means that
   *   video streaming is disabled in the remote Stream of the PeerConnection.
   * @param {JSON} [peerInfo.settings.video.resolution] The PeerConnection
   *   Stream streaming video resolution settings. Setting the resolution may
   *   not force set the resolution provided as it depends on the how the
   *   browser handles the resolution. [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Number} [peerInfo.settings.video.resolution.width] The PeerConnection
   *   Stream streaming video resolution width.
   * @param {Number} [peerInfo.settings.video.resolution.height] The PeerConnection
   *   Stream streaming video resolution height.
   * @param {Number} [peerInfo.settings.video.frameRate] The PeerConnection
   *   Stream streaming video maximum frameRate.
   * @param {Boolean} [peerInfo.settings.video.screenshare=false] The flag
   *   that indicates if the PeerConnection connection Stream object sent
   *   is a screensharing stream or not.
   * @param {String} [peerInfo.settings.bandwidth] The PeerConnection
   *   streaming bandwidth settings. Setting the bandwidth flags may not
   *   force set the bandwidth for each connection stream channels as it depends
   *   on how the browser handles the bandwidth bitrate. Values are configured
   *   in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.audio] The configured
   *   audio stream channel for the remote Stream object bandwidth
   *   that audio streaming should use in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.video] The configured
   *   video stream channel for the remote Stream object bandwidth
   *   that video streaming should use in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.data] The configured
   *   datachannel channel for the DataChannel connection bandwidth
   *   that datachannel connection per packet should be able use in <var>kb/s</var>.
   * @param {JSON} peerInfo.mediaStatus The PeerConnection Stream mute
   *   settings for both audio and video streamings.
   * @param {Boolean} [peerInfo.mediaStatus.audioMuted=true] The flag that
   *   indicates if the remote Stream object audio streaming is muted. If
   *   there is no audio streaming enabled for the PeerConnection, by default,
   *   it is set to <code>true</code>.
   * @param {Boolean} [peerInfo.mediaStatus.videoMuted=true] The flag that
   *   indicates if the remote Stream object video streaming is muted. If
   *   there is no video streaming enabled for the PeerConnection, by default,
   *   it is set to <code>true</code>.
   * @param {JSON} peerInfo.agent The PeerConnection platform agent information.
   * @param {String} peerInfo.agent.name The PeerConnection platform browser or agent name.
   * @param {Number} peerInfo.agent.version The PeerConnection platform browser or agent version.
   * @param {Number} peerInfo.agent.os The PeerConnection platform name.
   * @param {String} peerInfo.room The current room that the PeerConnection peer is in.
   * @param {Boolean} isSelf The flag that indicates if self is the PeerConnection peer.
   * @component Events
   * @for Skylink
   * @since 0.5.2
   */
  peerLeft: [],

  /**
   * Event triggered when a Stream is available from a PeerConnection peer
   *   in the room.
   * @event incomingStream
   * @param {String} peerId The PeerConnection ID associated to the Stream object.
   * @param {Object} stream The PeerConnection peer
   *   [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_API)
   *   object that is sent in this connection.
   *   To display the MediaStream object to a <code>video</code> or <code>audio</code>, simply invoke:<br>
   *   <code>attachMediaStream(domElement, stream);</code>.
   * @param {Object} peerInfo The peer information associated
   *   with the Peer Connection.
   * @param {String|JSON} peerInfo.userData The custom user data
   *   information set by developer. This custom user data can also
   *   be set in <a href="#method_setUserData">setUserData()</a>.
   * @param {JSON} peerInfo.settings The PeerConnection Stream
   *   streaming settings information. If both audio and video
   *   option is <code>false</code>, there should be no
   *   receiving remote Stream object from this associated PeerConnection.
   * @param {Boolean|JSON} [peerInfo.settings.audio=false] The
   *   PeerConnection Stream streaming audio settings. If
   *   <code>false</code>, it means that audio streaming is disabled in
   *   the remote Stream of the PeerConnection.
   * @param {Boolean} [peerInfo.settings.audio.stereo] The flag that indicates if
   *   stereo option should be explictly enabled to an OPUS enabled audio stream.
   *   Check the <code>audioCodec</code> configuration settings in
   *   {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}
   *   to enable OPUS as the audio codec. Note that stereo is already enabled
   *   for OPUS codecs, this only adds a stereo flag to the SDP to explictly
   *   enable stereo in the audio streaming.
   * @param {Boolean|JSON} [peerInfo.settings.video=false] The PeerConnection
   *   Stream streaming video settings. If <code>false</code>, it means that
   *   video streaming is disabled in the remote Stream of the PeerConnection.
   * @param {JSON} [peerInfo.settings.video.resolution] The PeerConnection
   *   Stream streaming video resolution settings. Setting the resolution may
   *   not force set the resolution provided as it depends on the how the
   *   browser handles the resolution. [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Number} [peerInfo.settings.video.resolution.width] The PeerConnection
   *   Stream streaming video resolution width.
   * @param {Number} [peerInfo.settings.video.resolution.height] The PeerConnection
   *   Stream streaming video resolution height.
   * @param {Number} [peerInfo.settings.video.frameRate] The PeerConnection
   *   Stream streaming video maximum frameRate.
   * @param {Boolean} [peerInfo.settings.video.screenshare=false] The flag
   *   that indicates if the PeerConnection connection Stream object sent
   *   is a screensharing stream or not.
   * @param {String} [peerInfo.settings.bandwidth] The PeerConnection
   *   streaming bandwidth settings. Setting the bandwidth flags may not
   *   force set the bandwidth for each connection stream channels as it depends
   *   on how the browser handles the bandwidth bitrate. Values are configured
   *   in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.audio] The configured
   *   audio stream channel for the remote Stream object bandwidth
   *   that audio streaming should use in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.video] The configured
   *   video stream channel for the remote Stream object bandwidth
   *   that video streaming should use in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.data] The configured
   *   datachannel channel for the DataChannel connection bandwidth
   *   that datachannel connection per packet should be able use in <var>kb/s</var>.
   * @param {JSON} peerInfo.mediaStatus The PeerConnection Stream mute
   *   settings for both audio and video streamings.
   * @param {Boolean} [peerInfo.mediaStatus.audioMuted=true] The flag that
   *   indicates if the remote Stream object audio streaming is muted. If
   *   there is no audio streaming enabled for the PeerConnection, by default,
   *   it is set to <code>true</code>.
   * @param {Boolean} [peerInfo.mediaStatus.videoMuted=true] The flag that
   *   indicates if the remote Stream object video streaming is muted. If
   *   there is no video streaming enabled for the PeerConnection, by default,
   *   it is set to <code>true</code>.
   * @param {JSON} peerInfo.agent The PeerConnection platform agent information.
   * @param {String} peerInfo.agent.name The PeerConnection platform browser or agent name.
   * @param {Number} peerInfo.agent.version The PeerConnection platform browser or agent version.
   * @param {Number} peerInfo.agent.os The PeerConnection platform name.
   * @param {String} peerInfo.room The current room that the PeerConnection peer is in.
   * @param {Boolean} isSelf The flag that indicates if self is the PeerConnection peer.
   * @component Events
   * @for Skylink
   * @since 0.5.5
   */
  incomingStream: [],

  /**
   * Event triggered when a message is received from a PeerConnection peer.
   * @event incomingMessage
   * @param {JSON} message The message object received from PeerConnection peer.
   * @param {JSON|String} message.content The message object content. This is the
   *   message data content passed in {{#crossLink "Skylink/sendMessage:method"}}sendMessage(){{/crossLink}}
   *   and {{#crossLink "Skylink/sendP2PMessage:method"}}sendP2PMessage(){{/crossLink}}.
   * @param {String} message.senderPeerId The PeerConnection ID of the peer who
   *   sent the message object.
   * @param {String|Array} [message.targetPeerId=null] The array of targeted PeerConnection
   *   peers or the single targeted PeerConnection peer the message is
   *   targeted to received the message object. If the value is <code>null</code>, the message
   *   object is broadcasted to all PeerConnection peers in the room.
   * @param {Boolean} message.isPrivate The flag that indicates if the message object is sent to
   *   targeted PeerConnection peers and not broadcasted to all PeerConnection peers.
   * @param {Boolean} message.isDataChannel The flag that indicates if the message object is sent
   *   from the platform signaling socket connection or P2P channel connection (DataChannel connection).
   * @param {String} peerId The PeerConnection ID of peer who sent the
   *   message object.
   * @param {Object} peerInfo The peer information associated
   *   with the Peer Connection.
   * @param {String|JSON} peerInfo.userData The custom user data
   *   information set by developer. This custom user data can also
   *   be set in <a href="#method_setUserData">setUserData()</a>.
   * @param {JSON} peerInfo.settings The PeerConnection Stream
   *   streaming settings information. If both audio and video
   *   option is <code>false</code>, there should be no
   *   receiving remote Stream object from this associated PeerConnection.
   * @param {Boolean|JSON} [peerInfo.settings.audio=false] The
   *   PeerConnection Stream streaming audio settings. If
   *   <code>false</code>, it means that audio streaming is disabled in
   *   the remote Stream of the PeerConnection.
   * @param {Boolean} [peerInfo.settings.audio.stereo] The flag that indicates if
   *   stereo option should be explictly enabled to an OPUS enabled audio stream.
   *   Check the <code>audioCodec</code> configuration settings in
   *   {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}
   *   to enable OPUS as the audio codec. Note that stereo is already enabled
   *   for OPUS codecs, this only adds a stereo flag to the SDP to explictly
   *   enable stereo in the audio streaming.
   * @param {Boolean|JSON} [peerInfo.settings.video=false] The PeerConnection
   *   Stream streaming video settings. If <code>false</code>, it means that
   *   video streaming is disabled in the remote Stream of the PeerConnection.
   * @param {JSON} [peerInfo.settings.video.resolution] The PeerConnection
   *   Stream streaming video resolution settings. Setting the resolution may
   *   not force set the resolution provided as it depends on the how the
   *   browser handles the resolution. [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Number} [peerInfo.settings.video.resolution.width] The PeerConnection
   *   Stream streaming video resolution width.
   * @param {Number} [peerInfo.settings.video.resolution.height] The PeerConnection
   *   Stream streaming video resolution height.
   * @param {Number} [peerInfo.settings.video.frameRate] The PeerConnection
   *   Stream streaming video maximum frameRate.
   * @param {Boolean} [peerInfo.settings.video.screenshare=false] The flag
   *   that indicates if the PeerConnection connection Stream object sent
   *   is a screensharing stream or not.
   * @param {String} [peerInfo.settings.bandwidth] The PeerConnection
   *   streaming bandwidth settings. Setting the bandwidth flags may not
   *   force set the bandwidth for each connection stream channels as it depends
   *   on how the browser handles the bandwidth bitrate. Values are configured
   *   in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.audio] The configured
   *   audio stream channel for the remote Stream object bandwidth
   *   that audio streaming should use in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.video] The configured
   *   video stream channel for the remote Stream object bandwidth
   *   that video streaming should use in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.data] The configured
   *   datachannel channel for the DataChannel connection bandwidth
   *   that datachannel connection per packet should be able use in <var>kb/s</var>.
   * @param {JSON} peerInfo.mediaStatus The PeerConnection Stream mute
   *   settings for both audio and video streamings.
   * @param {Boolean} [peerInfo.mediaStatus.audioMuted=true] The flag that
   *   indicates if the remote Stream object audio streaming is muted. If
   *   there is no audio streaming enabled for the PeerConnection, by default,
   *   it is set to <code>true</code>.
   * @param {Boolean} [peerInfo.mediaStatus.videoMuted=true] The flag that
   *   indicates if the remote Stream object video streaming is muted. If
   *   there is no video streaming enabled for the PeerConnection, by default,
   *   it is set to <code>true</code>.
   * @param {JSON} peerInfo.agent The PeerConnection platform agent information.
   * @param {String} peerInfo.agent.name The PeerConnection platform browser or agent name.
   * @param {Number} peerInfo.agent.version The PeerConnection platform browser or agent version.
   * @param {Number} peerInfo.agent.os The PeerConnection platform name.
   * @param {String} peerInfo.room The current room that the PeerConnection peer is in.
   * @param {Boolean} isSelf The flag that indicates if self is the PeerConnection peer.
   * @component Events
   * @for Skylink
   * @since 0.5.2
   */
  incomingMessage: [],

  /**
   * Event triggered when a data transfer is completed in a DataChannel connection.
   * @event incomingData
   * @param {Blob|String} data The transferred data object.<br>
   *   For Blob data object, see the
   *   [createObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL.createObjectURL)
   *   method on how you can convert the Blob data object to a download link.
   * @param {String} transferId The transfer ID of the completed data transfer.
   * @param {String} peerId The PeerConnection ID associated with the data transfer.
   * @param {JSON} transferInfo The transfer data object information.
   * @param {String} [transferInfo.name=transferId] The transfer data object name.
   *   If there is no name based on the Blob given, the name would be the transfer ID.
   * @param {Number} transferInfo.size The transfer data size.
   * @param {String} transferInfo.dataType The type of data transfer initiated.
   *   Available types are <code>"dataURL"</code> and <code>"blob"</code>.
   * @param {String} transferInfo.timeout The waiting timeout in seconds that the DataChannel
   *   connection data transfer should wait before throwing an exception and terminating the data transfer.
   * @param {Boolean} transferInfo.isPrivate The flag to indicate if the data transferred
   *   targeted PeerConnection peers and not broadcasted to all PeerConnection peers.
   * @param {Boolean} isSelf The flag that indicates if the data transfer is from self or from
   *   associated PeerConnection peer.
   * @component Events
   * @for Skylink
   * @since 0.6.1
   */
  incomingData: [],


  /**
   * Event triggered when a data transfer request is made to PeerConnection peer in a
   *   DataChannel connection.
   * @event incomingDataRequest
   * @param {String} transferId The transfer ID of the data transfer request.
   * @param {String} peerId The PeerConnection ID associated with the data transfer request.
   * @param {JSON} transferInfo The transfer data object information.
   * @param {String} [transferInfo.name=transferId] The transfer data object name.
   *   If there is no name based on the Blob given, the name would be the transfer ID.
   * @param {Number} transferInfo.size The transfer data size.
   * @param {String} transferInfo.dataType The type of data transfer initiated.
   *   Available types are <code>"dataURL"</code> and <code>"blob"</code>.
   * @param {String} transferInfo.timeout The waiting timeout in seconds that the DataChannel
   *   connection data transfer should wait before throwing an exception and terminating the data transfer.
   * @param {Boolean} transferInfo.isPrivate The flag to indicate if the data transferred
   *   targeted PeerConnection peers and not broadcasted to all PeerConnection peers.
   * @param {Boolean} isSelf The flag that indicates if the data transfer request is from self or from
   *   associated PeerConnection peer.
   * @component Events
   * @for Skylink
   * @since 0.6.1
   */
  incomingDataRequest: [],

  /**
   * Event triggered when the currently connected room lock status have been updated.
   * @event roomLock
   * @param {Boolean} isLocked The flag that indicates if the currently connected room is locked.
   * @param {String} peerId The PeerConnection ID of the peer that updated the
   *   currently connected room lock status.
   * @param {Object} peerInfo The peer information associated
   *   with the Peer Connection.
   * @param {String|JSON} peerInfo.userData The custom user data
   *   information set by developer. This custom user data can also
   *   be set in <a href="#method_setUserData">setUserData()</a>.
   * @param {JSON} peerInfo.settings The PeerConnection Stream
   *   streaming settings information. If both audio and video
   *   option is <code>false</code>, there should be no
   *   receiving remote Stream object from this associated PeerConnection.
   * @param {Boolean|JSON} [peerInfo.settings.audio=false] The
   *   PeerConnection Stream streaming audio settings. If
   *   <code>false</code>, it means that audio streaming is disabled in
   *   the remote Stream of the PeerConnection.
   * @param {Boolean} [peerInfo.settings.audio.stereo] The flag that indicates if
   *   stereo option should be explictly enabled to an OPUS enabled audio stream.
   *   Check the <code>audioCodec</code> configuration settings in
   *   {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}
   *   to enable OPUS as the audio codec. Note that stereo is already enabled
   *   for OPUS codecs, this only adds a stereo flag to the SDP to explictly
   *   enable stereo in the audio streaming.
   * @param {Boolean|JSON} [peerInfo.settings.video=false] The PeerConnection
   *   Stream streaming video settings. If <code>false</code>, it means that
   *   video streaming is disabled in the remote Stream of the PeerConnection.
   * @param {JSON} [peerInfo.settings.video.resolution] The PeerConnection
   *   Stream streaming video resolution settings. Setting the resolution may
   *   not force set the resolution provided as it depends on the how the
   *   browser handles the resolution. [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Number} [peerInfo.settings.video.resolution.width] The PeerConnection
   *   Stream streaming video resolution width.
   * @param {Number} [peerInfo.settings.video.resolution.height] The PeerConnection
   *   Stream streaming video resolution height.
   * @param {Number} [peerInfo.settings.video.frameRate] The PeerConnection
   *   Stream streaming video maximum frameRate.
   * @param {Boolean} [peerInfo.settings.video.screenshare=false] The flag
   *   that indicates if the PeerConnection connection Stream object sent
   *   is a screensharing stream or not.
   * @param {String} [peerInfo.settings.bandwidth] The PeerConnection
   *   streaming bandwidth settings. Setting the bandwidth flags may not
   *   force set the bandwidth for each connection stream channels as it depends
   *   on how the browser handles the bandwidth bitrate. Values are configured
   *   in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.audio] The configured
   *   audio stream channel for the remote Stream object bandwidth
   *   that audio streaming should use in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.video] The configured
   *   video stream channel for the remote Stream object bandwidth
   *   that video streaming should use in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.data] The configured
   *   datachannel channel for the DataChannel connection bandwidth
   *   that datachannel connection per packet should be able use in <var>kb/s</var>.
   * @param {JSON} peerInfo.mediaStatus The PeerConnection Stream mute
   *   settings for both audio and video streamings.
   * @param {Boolean} [peerInfo.mediaStatus.audioMuted=true] The flag that
   *   indicates if the remote Stream object audio streaming is muted. If
   *   there is no audio streaming enabled for the PeerConnection, by default,
   *   it is set to <code>true</code>.
   * @param {Boolean} [peerInfo.mediaStatus.videoMuted=true] The flag that
   *   indicates if the remote Stream object video streaming is muted. If
   *   there is no video streaming enabled for the PeerConnection, by default,
   *   it is set to <code>true</code>.
   * @param {JSON} peerInfo.agent The PeerConnection platform agent information.
   * @param {String} peerInfo.agent.name The PeerConnection platform browser or agent name.
   * @param {Number} peerInfo.agent.version The PeerConnection platform browser or agent version.
   * @param {Number} peerInfo.agent.os The PeerConnection platform name.
   * @param {String} peerInfo.room The current room that the PeerConnection peer is in.
   * @param {Boolean} isSelf The flag that indicates if self is the PeerConnection peer.
   * @component Events
   * @for Skylink
   * @since 0.5.2
   */
  roomLock: [],

  /**
   * Event triggered when a PeerConnection connection DataChannel connection state has changed.
   * @event dataChannelState
   * @param {String} state The PeerConnection connection DataChannel connection state.
   *   [Rel: Skylink.DATA_CHANNEL_STATE]
   * @param {String} peerId The PeerConnection ID associated with the DataChannel connection.
   * @param {Object} [error=null] The error object thrown when there is a failure in
   *   the DataChannel connection.
   *   If received as <code>null</code>, it means that there is no errors.
   * @param {String} channelName The DataChannel connection ID.
   * @param {String} channelType The DataChannel connection functionality type.
   *   [Rel: Skylink.DATA_CHANNEL_TYPE]
   * @component Events
   * @for Skylink
   * @since 0.1.0
   */
  dataChannelState: [],

  /**
   * Event triggered when a data transfer made to PeerConnection peer in a
   *   DataChannel connection state has changed.
   * @event dataTransferState
   * @param {String} state The data transfer made to PeerConnection peer
   *   in a DataChannel connection state.
   *   [Rel: Skylink.DATA_TRANSFER_STATE]
   * @param {String} transferId The transfer ID of the completed data transfer.
   * @param {String} peerId The PeerConnection ID associated with the data transfer.
   * @param {JSON} transferInfo The transfer data object information.
   * @param {Blob|String} transferInfo.data The transfer data object. This is defined
   *   only after the transfer data is completed, when the state is
   *   <code>DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED</code> and
   *   <code>DATA_TRANSFER_STATE.UPLOAD_STARTED</code><br>
   *   For Blob data object, see the
   *   [createObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL.createObjectURL)
   *   method on how you can convert the Blob data object to a download link.
   * @param {String} [transferInfo.name=transferId] The transfer data object name.
   *   If there is no name based on the Blob given, the name would be the transfer ID.
   * @param {Number} transferInfo.size The transfer data size.
   * @param {String} transferInfo.dataType The type of data transfer initiated.
   *   Available types are <code>"dataURL"</code> and <code>"blob"</code>.
   * @param {String} transferInfo.timeout The waiting timeout in seconds that the DataChannel
   *   connection data transfer should wait before throwing an exception and terminating the data transfer.
   * @param {Boolean} transferInfo.isPrivate The flag to indicate if the data transferred
   *   targeted PeerConnection peers and not broadcasted to all PeerConnection peers.
   * @param {JSON} [error] The error object thrown when there is a failure in transferring data.
   * @param {Object} error.message The exception thrown that caused the failure
   *   for transferring data.
   * @param {String} error.transferType The data transfer type to indicate if the DataChannel is
   *   uploading or downloading the data transfer when the exception occurred.
   *   [Rel: Skylink.DATA_TRANSFER_TYPE]
   * @component Events
   * @for Skylink
   * @since 0.4.1
   */
  dataTransferState: [],

  /**
   * Event triggered when Skylink receives an system action from the platform signaling.
   * @event systemAction
   * @param {String} action The system action that is received from the platform signaling.
   *   [Rel: Skylink.SYSTEM_ACTION]
   * @param {String} message The message received from the platform signaling when
   *   the system action and reason is given.
   * @param {String} reason The reason received from the platform signaling behind the
   *   system action given.
   *   [Rel: Skylink.SYSTEM_ACTION_REASON]
   * @component Events
   * @for Skylink
   * @since 0.5.1
   */
  systemAction: [],

  /**
   * Event triggered when a server PeerConnection peer joins the room.
   * @event serverPeerJoined
   * @param {String} peerId The PeerConnection ID of the new server peer
   *   that has joined the room.
   * @param {String} serverPeerType The server PeerConnection peer type
   *   [Rel: Skylink.SERVER_PEER_TYPE]
   * @component Events
   * @for Skylink
   * @since 0.6.1
   */
  serverPeerJoined: [],

  /**
   * Event triggered when a server PeerConnection peer leaves the room.
   * @event serverPeerLeft
   * @param {String} peerId The PeerConnection ID of the new server peer
   *   that has left the room.
   * @param {String} serverPeerType The server PeerConnection peer type
   *   [Rel: Skylink.SERVER_PEER_TYPE]
   * @component Events
   * @for Skylink
   * @since 0.6.1
   */
  serverPeerLeft: [],

  /**
   * Event triggered when a sever PeerConnection connection has been restarted for
   *   a reconnection.
   * @event serverPeerRestart
   * @param {String} peerId The PeerConnection ID of the new server peer
   *   that has joined the room.
   * @param {String} serverPeerType The server PeerConnection peer type
   *   [Rel: Skylink.SERVER_PEER_TYPE]
   * @component Events
   * @for Skylink
   * @since 0.6.1
   */
  serverPeerRestart: [],

  /**
   * Event triggered when a PeerConnection connection Stream streaming has stopped.
   * @event streamEnded
   * @param {String} [peerId=null] The PeerConnection ID associated to the Stream object.
   *   If self is not in the room, the value returned would be <code>null</code>.
   * @param {Object} peerInfo The peer information associated
   *   with the Peer Connection.
   * @param {String|JSON} peerInfo.userData The custom user data
   *   information set by developer. This custom user data can also
   *   be set in <a href="#method_setUserData">setUserData()</a>.
   * @param {JSON} peerInfo.settings The PeerConnection Stream
   *   streaming settings information. If both audio and video
   *   option is <code>false</code>, there should be no
   *   receiving remote Stream object from this associated PeerConnection.
   * @param {Boolean|JSON} [peerInfo.settings.audio=false] The
   *   PeerConnection Stream streaming audio settings. If
   *   <code>false</code>, it means that audio streaming is disabled in
   *   the remote Stream of the PeerConnection.
   * @param {Boolean} [peerInfo.settings.audio.stereo] The flag that indicates if
   *   stereo option should be explictly enabled to an OPUS enabled audio stream.
   *   Check the <code>audioCodec</code> configuration settings in
   *   {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}
   *   to enable OPUS as the audio codec. Note that stereo is already enabled
   *   for OPUS codecs, this only adds a stereo flag to the SDP to explictly
   *   enable stereo in the audio streaming.
   * @param {Boolean|JSON} [peerInfo.settings.video=false] The PeerConnection
   *   Stream streaming video settings. If <code>false</code>, it means that
   *   video streaming is disabled in the remote Stream of the PeerConnection.
   * @param {JSON} [peerInfo.settings.video.resolution] The PeerConnection
   *   Stream streaming video resolution settings. Setting the resolution may
   *   not force set the resolution provided as it depends on the how the
   *   browser handles the resolution. [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Number} [peerInfo.settings.video.resolution.width] The PeerConnection
   *   Stream streaming video resolution width.
   * @param {Number} [peerInfo.settings.video.resolution.height] The PeerConnection
   *   Stream streaming video resolution height.
   * @param {Number} [peerInfo.settings.video.frameRate] The PeerConnection
   *   Stream streaming video maximum frameRate.
   * @param {Boolean} [peerInfo.settings.video.screenshare=false] The flag
   *   that indicates if the PeerConnection connection Stream object sent
   *   is a screensharing stream or not.
   * @param {String} [peerInfo.settings.bandwidth] The PeerConnection
   *   streaming bandwidth settings. Setting the bandwidth flags may not
   *   force set the bandwidth for each connection stream channels as it depends
   *   on how the browser handles the bandwidth bitrate. Values are configured
   *   in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.audio] The configured
   *   audio stream channel for the remote Stream object bandwidth
   *   that audio streaming should use in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.video] The configured
   *   video stream channel for the remote Stream object bandwidth
   *   that video streaming should use in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.data] The configured
   *   datachannel channel for the DataChannel connection bandwidth
   *   that datachannel connection per packet should be able use in <var>kb/s</var>.
   * @param {JSON} peerInfo.mediaStatus The PeerConnection Stream mute
   *   settings for both audio and video streamings.
   * @param {Boolean} [peerInfo.mediaStatus.audioMuted=true] The flag that
   *   indicates if the remote Stream object audio streaming is muted. If
   *   there is no audio streaming enabled for the PeerConnection, by default,
   *   it is set to <code>true</code>.
   * @param {Boolean} [peerInfo.mediaStatus.videoMuted=true] The flag that
   *   indicates if the remote Stream object video streaming is muted. If
   *   there is no video streaming enabled for the PeerConnection, by default,
   *   it is set to <code>true</code>.
   * @param {JSON} peerInfo.agent The PeerConnection platform agent information.
   * @param {String} peerInfo.agent.name The PeerConnection platform browser or agent name.
   * @param {Number} peerInfo.agent.version The PeerConnection platform browser or agent version.
   * @param {Number} peerInfo.agent.os The PeerConnection platform name.
   * @param {String} peerInfo.room The current room that the PeerConnection peer is in.
   * @param {Boolean} isSelf The flag that indicates if self is the PeerConnection peer.
   * @param {Boolean} isScreensharing The flag that indicates if PeerConnection connection
   *    Stream object is a screensharing stream or not.
   * @component Events
   * @for Skylink
   * @since 0.5.10
   */
  streamEnded: [],

  /**
   * Event triggered when a PeerConnection connection Stream streaming audio or video
   *   stream muted status have been updated.
   * @event streamMuted
   * @param {String} peerId The PeerConnection ID associated to the Stream object.
   *   If self is not in the room, the value returned would be <code>null</code>.
   * @param {Object} peerInfo The peer information associated
   *   with the Peer Connection.
   * @param {String|JSON} peerInfo.userData The custom user data
   *   information set by developer. This custom user data can also
   *   be set in <a href="#method_setUserData">setUserData()</a>.
   * @param {JSON} peerInfo.settings The PeerConnection Stream
   *   streaming settings information. If both audio and video
   *   option is <code>false</code>, there should be no
   *   receiving remote Stream object from this associated PeerConnection.
   * @param {Boolean|JSON} [peerInfo.settings.audio=false] The
   *   PeerConnection Stream streaming audio settings. If
   *   <code>false</code>, it means that audio streaming is disabled in
   *   the remote Stream of the PeerConnection.
   * @param {Boolean} [peerInfo.settings.audio.stereo] The flag that indicates if
   *   stereo option should be explictly enabled to an OPUS enabled audio stream.
   *   Check the <code>audioCodec</code> configuration settings in
   *   {{#crossLink "Skylink/init:method"}}init(){{/crossLink}}
   *   to enable OPUS as the audio codec. Note that stereo is already enabled
   *   for OPUS codecs, this only adds a stereo flag to the SDP to explictly
   *   enable stereo in the audio streaming.
   * @param {Boolean|JSON} [peerInfo.settings.video=false] The PeerConnection
   *   Stream streaming video settings. If <code>false</code>, it means that
   *   video streaming is disabled in the remote Stream of the PeerConnection.
   * @param {JSON} [peerInfo.settings.video.resolution] The PeerConnection
   *   Stream streaming video resolution settings. Setting the resolution may
   *   not force set the resolution provided as it depends on the how the
   *   browser handles the resolution. [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Number} [peerInfo.settings.video.resolution.width] The PeerConnection
   *   Stream streaming video resolution width.
   * @param {Number} [peerInfo.settings.video.resolution.height] The PeerConnection
   *   Stream streaming video resolution height.
   * @param {Number} [peerInfo.settings.video.frameRate] The PeerConnection
   *   Stream streaming video maximum frameRate.
   * @param {Boolean} [peerInfo.settings.video.screenshare=false] The flag
   *   that indicates if the PeerConnection connection Stream object sent
   *   is a screensharing stream or not.
   * @param {String} [peerInfo.settings.bandwidth] The PeerConnection
   *   streaming bandwidth settings. Setting the bandwidth flags may not
   *   force set the bandwidth for each connection stream channels as it depends
   *   on how the browser handles the bandwidth bitrate. Values are configured
   *   in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.audio] The configured
   *   audio stream channel for the remote Stream object bandwidth
   *   that audio streaming should use in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.video] The configured
   *   video stream channel for the remote Stream object bandwidth
   *   that video streaming should use in <var>kb/s</var>.
   * @param {String} [peerInfo.settings.bandwidth.data] The configured
   *   datachannel channel for the DataChannel connection bandwidth
   *   that datachannel connection per packet should be able use in <var>kb/s</var>.
   * @param {JSON} peerInfo.mediaStatus The PeerConnection Stream mute
   *   settings for both audio and video streamings.
   * @param {Boolean} [peerInfo.mediaStatus.audioMuted=true] The flag that
   *   indicates if the remote Stream object audio streaming is muted. If
   *   there is no audio streaming enabled for the PeerConnection, by default,
   *   it is set to <code>true</code>.
   * @param {Boolean} [peerInfo.mediaStatus.videoMuted=true] The flag that
   *   indicates if the remote Stream object video streaming is muted. If
   *   there is no video streaming enabled for the PeerConnection, by default,
   *   it is set to <code>true</code>.
   * @param {JSON} peerInfo.agent The PeerConnection platform agent information.
   * @param {String} peerInfo.agent.name The PeerConnection platform browser or agent name.
   * @param {Number} peerInfo.agent.version The PeerConnection platform browser or agent version.
   * @param {Number} peerInfo.agent.os The PeerConnection platform name.
   * @param {String} peerInfo.room The current room that the PeerConnection peer is in.
   * @param {Boolean} isSelf The flag that indicates if self is the PeerConnection peer.
   * @param {Boolean} isScreensharing The flag that indicates if PeerConnection connection
   *    Stream object is a screensharing stream or not.
   * @component Events
   * @for Skylink
   * @since 0.6.1
   */
  streamMuted: [],

  /**
   * @event getPeersStateChange
   * @param {String} state State of the get peer process
   * @param {String} privilegedPeerId Id of privileged peer
   * @param {Object} peerList List of rooms and peers under the realm
   * @component Events
   * @for Skylink
   * @since 0.6.1
   */
  getPeersStateChange: [],

  /**
   * @event introduceStateChange
   * @param {String} state State of the introduction process
   * @param {String} privilegedPeerId Id of privileged peer
   * @param {String} sendingPeerId Id of the peer who sends enter
   * @param {String} receivingPeerId Id of the peer who receives enter
   * @param {String} reason Reason of introduce failure (if there is any)
   * @component Events
   * @for Skylink
   * @since 0.6.1
   */
  introduceStateChange: []
};

/**
 * Stores the list of {{#crossLink "Skylink/once:method"}}once(){{/crossLink}}
 *   event subscription handlers.
 * @attribute _onceEvents
 * @param {Array} (#eventName) The array of event subscription handlers that is
 *   subscribed using {{#crossLink "Skylink/once:method"}}once() method{{/crossLink}}
 *   associated with the event name.
 * @param {Function} (#eventName).(#index) The event subscription handler
 *   associated with the event name. This is to be triggered once when condition is met.
 *   Alternatively, the <code>once()</code> event subscription handler can be
 *   unsubscribed with {{#crossLink "Skylink/off:method"}}off(){{/crossLink}} before
 *   condition is met.
 * @type JSON
 * @private
 * @required
 * @component Events
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._onceEvents = {};

/**
 * The throttling function datetime stamp in
 *   [(ISO 8601 format)](https://en.wikipedia.org/wiki/ISO_8601).
 * @attribute _timestamp
 * @type JSON
 * @private
 * @required
 * @component Events
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._timestamp = {
  now: Date.now() || function() { return +new Date(); }
};

/**
 * Triggers event subscription handlers that is associated with the event name.
 * {{#crossLink "Skylink/on:method"}}on() event subscription handlers{{/crossLink}}
 *   will be triggered always, but
 *   {{#crossLink "Skylink/once:method"}}once() event subscription hadlers{{/crossLink}}
 *   will only be triggered once the condition is met.
 * @method _trigger
 * @param {String} eventName The Skylink event name to trigger that would trigger event subscription
 *   handlers associated to the event name with the <code>arguments</code> parameters payload.
 * @for Skylink
 * @private
 * @component Events
 * @for Skylink
 * @since 0.1.0
 */
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
        log.log([null, 'Event', eventName, 'Event is fired']);
        if(arr[i].apply(this, args) === false) {
          break;
        }
      } catch(error) {
        log.error([null, 'Event', eventName, 'Exception occurred in event:'], error);
        throw error;
      }
    }
  }
  if (once){
    // for events subscribed on once
    for (var j = 0; j < once.length; j++) {
      if (once[j][1].apply(this, args) === true) {
        log.log([null, 'Event', eventName, 'Condition is met. Firing event']);
        if(once[j][0].apply(this, args) === false) {
          break;
        }
        if (!once[j][2]) {
          log.log([null, 'Event', eventName, 'Removing event after firing once']);
          once.splice(j, 1);
          //After removing current element, the next element should be element of the same index
          j--;
        }
      } else {
        log.log([null, 'Event', eventName, 'Condition is still not met. ' +
          'Holding event from being fired']);
      }
    }
  }

  log.log([null, 'Event', eventName, 'Event is triggered']);
};

/**
 * Subscribes an event handler associated to the event name.
 * This event handler will always be triggered when the event name is triggered. If you
 *   are looking for subscription event handler to be triggered once, check out
 *   {{#crossLink "Skylink/once:method"}}once() event subscription{{/crossLink}}.
 * @method on
 * @param {String} eventName The Skylink event name to subscribe to.
 * @param {Function} callback The event handler to subsribe to the associated
 *   Skylink event name that would be triggered once the event name is triggered.
 * @example
 *   SkylinkDemo.on("peerJoined", function (peerId, peerInfo) {
 *      alert(peerId + " has joined the room");
 *   });
 * @component Events
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.on = function(eventName, callback) {
  if ('function' === typeof callback) {
    this._EVENTS[eventName] = this._EVENTS[eventName] || [];
    this._EVENTS[eventName].push(callback);
    log.log([null, 'Event', eventName, 'Event is subscribed']);
  } else {
    log.error([null, 'Event', eventName, 'Provided parameter is not a function']);
  }
};

/**
 * Subscribes an event handler associated to the event name that
 *    would only be triggered once the provided condition function has been met.
 * @method once
 * @param {String} eventName The Skylink event name to subscribe to.
 * @param {Function} callback The event handler to subscribe to the associated
 *   Skylink event name to trigger once the condition has met. If
 *   <code>fireAlways</code> option is set toe <code>true</code>, this will
 *   always be fired when condition is met.
 * @param {Function} [condition] The condition function that once the condition has
 *   been met, trigger the event handler once. Return in the condition function <code>true</code>
 *   to pass as meeting the condition.
 *   If the condition function is not provided, the event handler will be triggered
 *     once the Skylink event name is triggered.
 * @param {Boolean} [fireAlways=false] The flag that indicates if Skylink should interrupt this
 *   <code>once()</code> function once the function has been triggered to not unsubscribe the
 *   event handler but to always trigger when the condition has been met.
 * @example
 *   SkylinkDemo.once("peerConnectionState", function (state, peerId) {
 *     alert("Peer has left");
 *   }, function (state, peerId) {
 *     return state === SkylinkDemo.PEER_CONNECTION_STATE.CLOSED;
 *   });
 * @component Events
 * @for Skylink
 * @since 0.5.4
 */
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

    this._EVENTS[eventName] = this._EVENTS[eventName] || [];
    // prevent undefined error
    this._onceEvents[eventName] = this._onceEvents[eventName] || [];
    this._onceEvents[eventName].push([callback, condition, fireAlways]);
    log.log([null, 'Event', eventName, 'Event is subscribed on condition']);
  } else {
    log.error([null, 'Event', eventName, 'Provided callback is not a function']);
  }
};

/**
 * Unsubscribes an event handler associated to the event name.
 * @method off
 * @param {String} eventName The Skylink event name to unsubscribe to.
 * @param {Function} [callback] The event handler to unsubscribe to the associated
 *   Skylink event name. If the event handler is not provided, Skylink would
 *   unsubscribe all event handlers subscribed to the associated event name.
 * @example
 *   // Example 1: Unsubscribe all event handlers related to the event
 *   SkylinkDemo.off("peerJoined");
 *
 *   // Example 2: Unsubscribe to one event handler
 *   SkylinkDemo.off("peerJoined", callback);
 * @component Events
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.off = function(eventName, callback) {
  if (callback === undefined) {
    this._EVENTS[eventName] = [];
    this._onceEvents[eventName] = [];
    log.log([null, 'Event', eventName, 'All events are unsubscribed']);
    return;
  }
  var arr = this._EVENTS[eventName];
  var once = this._onceEvents[eventName];

  // unsubscribe events that is triggered always
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === callback) {
      log.log([null, 'Event', eventName, 'Event is unsubscribed']);
      arr.splice(i, 1);
      break;
    }
  }
  // unsubscribe events fired only once
  if(once !== undefined) {
    for (var j = 0; j < once.length; j++) {
      if (once[j][0] === callback) {
        log.log([null, 'Event', eventName, 'One-time Event is unsubscribed']);
        once.splice(j, 1);
        break;
      }
    }
  }
};

/**
 * Checks if the first condition is already met before doing an event
 *   handler subscription to wait for the second condition to be met.
 * This method will do a event subscription with
 *   {{#crossLink "Skylink/once:method"}}once(){{/crossLink}} as this
 *   <code>_condition()</code> would only trigger once, unless <code>fireAlways</code>
 *   is set to <code>true</code>.
 * @method _condition
 * @param {String} eventName The Skylink event name to subscribe to.
 * @param {Function} callback The event handler to subscribe to the associated
 *   Skylink event name to trigger once the condition has met. If
 *   <code>fireAlways</code> option is set to <code>true</code>, this will
 *   always be fired when condition is met.
 * @param {Function} [checkFirst] The first condition to check before
 *   doing an event subscription to wait for second condition to meet.
 *   Return in the first condition function <code>true</code> to pass as meeting the condition.
 *   If the first condition is met, the event handler would be triggered
 *   and the event handler will not be subscribed to the event or wait
 *   for second condition to pass.
 * @param {Function} [condition] The second condition function that once the it has
 *   been met, it will trigger the event handler once.
 *   Return in the second condition function <code>true</code> to pass as meeting the condition.
 *   If the second condition is met, the event handler would be triggered and
 *   depending if <code>fireAlways</code> option is set to <code>true</code>, this will
 *   always be fired when condition is met.
 * @param {Boolean} [fireAlways=false] The flag that indicates if Skylink should interrupt the
 *   second condition function once the function has been triggered to not unsubscribe the
 *   event handler but to always trigger when the second condition has been met.
 * @private
 * @component Events
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
      log.log([null, 'Event', eventName, 'First condition is met. Firing callback']);
      callback();
      return;
    }
    log.log([null, 'Event', eventName, 'First condition is not met. Subscribing to event']);
    this.once(eventName, callback, condition, fireAlways);
  } else {
    log.error([null, 'Event', eventName, 'Provided callback or checkFirst is not a function']);
  }
};

/**
 * Starts the interval check for the condition provided to meet before clearing
 *   the interval and triggering the callback provided.
 * This utilises <code>setInterval()</code> function.
 * @method _wait
 * @param {Function} callback The callback fired after the condition provided
 *   has been met.
 * @param {Function} condition The condition function that once the condition has
 *   been met, trigger the callback. Return in the condition function <code>true</code>
 *   to pass as meeting the condition.
 * @param {Number} [intervalTime=50] The interval loop timeout that the interval
 *   check should iterate based on the timeout provided (in ms).
 *   By default, if the value is not configured, it is <code>50</code>ms.
 * @for Skylink
 * @private
 * @component Events
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._wait = function(callback, condition, intervalTime, fireAlways) {
  fireAlways = (typeof fireAlways === 'undefined' ? false : fireAlways);
  if (typeof callback === 'function' && typeof condition === 'function') {
    if (condition()) {
      log.log([null, 'Event', null, 'Condition is met. Firing callback']);
      callback();
      return;
    }
    log.log([null, 'Event', null, 'Condition is not met. Doing a check.']);

    intervalTime = (typeof intervalTime === 'number') ? intervalTime : 50;

    var doWait = setInterval(function () {
      if (condition()) {
        log.log([null, 'Event', null, 'Condition is met after waiting. Firing callback']);
        if (!fireAlways){
          clearInterval(doWait);
        }
        callback();
      }
    }, intervalTime);
  } else {
    if (typeof callback !== 'function'){
      log.error([null, 'Event', null, 'Provided callback is not a function']);
    }
    if (typeof condition !== 'function'){
      log.error([null, 'Event', null, 'Provided condition is not a function']);
    }
  }
};

/**
 * Returns a wrapper of the original function, which fires only once during
 *  a specified amount of time.
 * @method _throttle
 * @param {Function} func The function that should be throttled.
 * @param {Number} wait The amount of time that function need to throttled (in ms).
 * @return {Function} The throttled function.
 * @private
 * @component Events
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._throttle = function(func, wait){
  var self = this;
  return function () {
      if (!self._timestamp.func){
        //First time run, need to force timestamp to skip condition
        self._timestamp.func = self._timestamp.now - wait;
      }
      var now = Date.now();
      if (now - self._timestamp.func < wait) {
          return;
      }
      func.apply(self, arguments);
      self._timestamp.func = now;
  };
};