/**
 * Function that generates an <a href="https://en.wikipedia.org/wiki/Universally_unique_identifier">UUID</a> (Unique ID).
 * @method generateUUID
 * @return {String} Returns a generated UUID (Unique ID).
 * @for Skylink
 * @since 0.5.9
 */
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

/**
 * Function that authenticates and initialises App Key used for Room connections.
 * @method init
 * @param {JSON|String} options The configuration options.
 * - When provided as a string, it's configured as <code>options.appKey</code>.
 * @param {String} options.appKey The App Key.
 *   <small>By default, <code>init()</code> uses [HTTP CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
 *   authentication. For credentials based authentication, see the <code>options.credentials</code> configuration
 *   below. You can know more about the <a href="http://support.temasys.io/support/solutions/articles/
 * 12000002712-authenticating-your-application-key-to-start-a-connection">in the authentication methods article here</a>
 *   for more details on the various authentication methods.</small>
 *   <small>If you are using the Persistent Room feature for scheduled meetings, you will require to
 *   use the credential based authentication. See the <a href="http://support.temasys.io/support
 * /solutions/articles/12000002811-using-the-persistent-room-feature-to-configure-meetings">Persistent Room article here
 *   </a> for more information.</small>
 * @param {String} [options.defaultRoom] The default Room to connect to when no <code>room</code> parameter
 *    is provided in  <a href="#method_joinRoom"><code>joinRoom()</code> method</a>.
 * - When not provided or is provided as an empty string, its value is <code>options.appKey</code>.
 *   <small>Note that switching Rooms is not available when using <code>options.credentials</code> based authentication.
 *   The Room that User will be connected to is the <code>defaultRoom</code> provided.</small>
 * @param {String} [options.roomServer] The Auth server for debugging purposes to use.
 *   <small>Note that this is a debugging feature and is only used when instructed for debugging purposes.</small>
 * @param {Boolean} [options.enableIceTrickle=true] The flag if Peer connections should
 *   trickle ICE for faster connectivity.
 * @param {Boolean} [options.enableDataChannel=true] <blockquote class="info">
 *   Note that for Edge browsers, this value is overriden as <code>false</code> due to its supports.
 *   </blockquote> The flag if Datachannel connections should be enabled.
 *   <small>This is required to be enabled for <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a>,
 *   <a href="#method_sendURLData"><code>sendURLData()</code> method</a> and
 *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>.</small>
 * @param {Boolean} [options.enableTURNServer=true] The flag if TURN ICE servers should
 *   be used when constructing Peer connections to allow TURN connections when required and enabled for the App Key.
 * @param {Boolean} [options.enableSTUNServer=true] The flag if STUN ICE servers should
 *   be used when constructing Peer connections to allow TURN connections when required.
 * @param {Boolean} [options.forceTURN=false] The flag if Peer connections should enforce
 *   connections over the TURN server.
 *   <small>This overrides <code>options.enableTURNServer</code> value to <code>true</code> and
 *   <code>options.enableSTUNServer</code> value to <code>false</code>, <code>options.filterCandidatesType.host</code>
 *   value to <code>true</code>, <code>options.filterCandidatesType.srflx</code> value to <code>true</code> and
 *   <code>options.filterCandidatesType.relay</code> value to <code>false</code>.</small>
 *   <small>Note that currently for MCU enabled Peer connections, the <code>options.filterCandidatesType</code>
 *   configuration is not honoured as Peers connected with MCU is similar as a forced TURN connection. The flags
 *   will act as if the value is <code>false</code> and ICE candidates will never be filtered regardless of the
 *   <code>options.filterCandidatesType</code> configuration.</small>
 * @param {Boolean} [options.usePublicSTUN=false] The flag if publicly available STUN ICE servers should
 *   be used if <code>options.enableSTUNServer</code> is enabled.
 * @param {Boolean} [options.TURNServerTransport] <blockquote class="info">
 *   Note that configuring the protocol may not necessarily result in the desired network transports protocol
 *   used in the actual TURN network traffic as it depends which protocol the browser selects and connects with.
 *   This simply configures the TURN ICE server urls <code?transport=(protocol)</code> query option when constructing
 *   the Peer connection. When all protocols are selected, the ICE servers urls are duplicated with all protocols.<br>
 *   Note that for Edge browsers, this value is overriden as <code>UDP</code> due to its supports.
 *   </blockquote> The option to configure the <code>?transport=</code>
 *   query parameter in TURN ICE servers when constructing a Peer connections.
 * - When not provided, its value is <code>ANY</code>.
 *   [Rel: Skylink.TURN_TRANSPORT]
 * @param {Boolean} [options.disableVideoFecCodecs=false] <blockquote class="info">
 *   Note that this is an experimental flag and may cause disruptions in connections or connectivity issues when toggled,
 *   and to prevent connectivity issues, these codecs will not be removed for MCU enabled Peer connections.
 *   </blockquote> The flag if video FEC (Forward Error Correction)
 *   codecs like ulpfec and red should be removed in sending session descriptions.
 *   <small>This can be useful for debugging purposes to prevent redundancy and overheads in RTP encoding.</small>
 * @param {Boolean} [options.disableComfortNoiseCodec=false] <blockquote class="info">
 *   Note that this is an experimental flag and may cause disruptions in connections or connectivity issues when toggled.
 *   </blockquote> The flag if audio
 *   <a href="https://en.wikipedia.org/wiki/Comfort_noise">Comfort Noise (CN)</a> codec should be removed
 *   in sending session descriptions.
 *   <small>This can be useful for debugging purposes to test preferred audio quality and feedback.</small>
 * @param {Boolean} [options.disableREMB=false] <blockquote class="info">
 *   Note that this is mainly used for debugging purposes and that it is an experimental flag, so
 *   it may cause disruptions in connections or connectivity issues when toggled. </blockquote>
 *   The flag if video REMB feedback packets should be disabled in sending session descriptions.
 * @param {JSON} [options.credentials] <blockquote class="info">
 *   Note that we strongly recommend developers to return the <code>options.credentials.duration</code>,
 *   <code>options.credentials.startDateTime</code> and <code>options.defaultRoom</code> and generate the
 *   <code>options.credentials.credentials</code> from a web server as secret shouldn't be exposed on client web app as
 *   it poses a security risk itself.</blockquote>
 *   The credentials used for authenticating App Key with
 *   credentials to retrieve the Room session token used for connection in <a href="#method_joinRoom">
 *   <code>joinRoom()</code> method</a>.
 *   <small>Note that switching of Rooms is not allowed when using credentials based authentication, unless
 *   <code>init()</code> is invoked again with a different set of credentials followed by invoking
 *   the <a href="#method_joinRoom"><code>joinRoom()</code> method</a>.</small>
 * @param {String} options.credentials.startDateTime The credentials User session in Room starting DateTime
 *   in <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601 format</a>.
 * @param {Number} options.credentials.duration The credentials User session in Room duration in hours.
 * @param {String} options.credentials.credentials The generated credentials used to authenticate
 *   the provided App Key with its <code>"secret"</code> property.
 *   <blockquote class="details"><h5>To generate the credentials:</h5><ol>
 *   <li>Concatenate a string that consists of the Room name you provide in the <code>options.defaultRoom</code>,
 *   the <code>options.credentials.duration</code> and the <code>options.credentials.startDateTime</code>.
 *   <small>Example: <code>var concatStr = defaultRoom + "_" + duration + "_" + startDateTime;</code></small></li>
 *   <li>Hash the concatenated string with the App Key <code>"secret"</code> property using
 *   <a href="https://en.wikipedia.org/wiki/SHA-1">SHA-1</a>.
 *   <small>Example: <code>var hash = CryptoJS.HmacSHA1(concatStr, appKeySecret);</code></small>
 *   <small>See the <a href="https://code.google.com/p/crypto-js/#HMAC"><code>CryptoJS.HmacSHA1</code> library</a>.</small></li>
 *   <li>Encode the hashed string using <a href="https://en.wikipedia.org/wiki/Base64">base64</a>
 *   <small>Example: <code>var b64Str = hash.toString(CryptoJS.enc.Base64);</code></small>
 *   <small>See the <a href="https://code.google.com/p/crypto-js/#The_Cipher_Output">CryptoJS.enc.Base64</a> library</a>.</small></li>
 *   <li>Encode the base64 encoded string to replace special characters using UTF-8 encoding.
 *   <small>Example: <code>var credentials = encodeURIComponent(base64String);</code></small>
 *   <small>See <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/
 * Global_Objects/encodeURIComponent">encodeURIComponent() API</a>.</small></li></ol></blockquote>
 * @param {Boolean} [options.audioFallback=false] The flag if <a href="#method_getUserMedia">
 *   <code>getUserMedia()</code> method</a> should fallback to retrieve only audio Stream when
 *   retrieving audio and video Stream fails.
 * @param {Boolean} [options.forceSSL=true] The flag if HTTPS connections should be enforced
 *   during request to Auth server and socket connections to Signaling server
 *   when accessing <code>window.location.protocol</code> value is <code>"http:"</code>.
 *   <small>By default, <code>"https:"</code> protocol connections uses HTTPS connections.</small>
 * @param {String|JSON} [options.audioCodec] <blockquote class="info">
 *   Note that if the audio codec is not supported, the SDK will not configure the local <code>"offer"</code> or
 *   <code>"answer"</code> session description to prefer the codec.<br>
 *   Note that for Edge browsers, this value is set as <code>OPUS</code> due to its supports.</blockquote>
 *   The option to configure the preferred audio codec to use to encode sending audio data when available for Peer connection.
 * - When not provided, its value is <code>AUTO</code>.
 *   [Rel: Skylink.AUDIO_CODEC]
 * @param {String} options.audioCodec.codec The audio codec to prefer to encode sending audio data when available.
 *   <small>The value must not be <code>AUTO</code>.</small>
 *   [Rel: Skylink.AUDIO_CODEC]
 * @param {Number} [options.audioCodec.samplingRate] The audio codec sampling to prefer to encode sending audio data when available.
 * @param {Number} [options.audioCodec.channels] The audio codec channels to prefer to encode sending audio data when available.
 * @param {String|JSON} [options.videoCodec] <blockquote class="info">
 *   Note that if the video codec is not supported, the SDK will not configure the local <code>"offer"</code> or
 *   <code>"answer"</code> session description to prefer the codec.<br>
 *   Note that for Edge browsers, this value is set as <code>H264</code> due to its supports.</blockquote>
 *   The option to configure the preferred video codec to use to encode sending video data when available for Peer connection.
 * - When not provided, its value is <code>AUTO</code>.
 *   [Rel: Skylink.VIDEO_CODEC]
 * @param {String} options.videoCodec.codec The video codec to prefer to encode sending audio data when available.
 *   <small>The value must not be <code>AUTO</code>.</small>
 *   [Rel: Skylink.VIDEO_CODEC]
 * @param {Number} [options.videoCodec.samplingRate] The video codec sampling to prefer to encode sending video data when available.
 * @param {Number} [options.socketTimeout=7000] The timeout for each attempts for socket connection
 *   with the Signaling server to indicate that connection has timed out and has failed to establish.
 *   <small>Note that the mininum timeout value is <code>5000</code>. If less, this value will be <code>5000</code>.</small>
 *   <small>Note that it is recommended to use <code>7000</code> as the lowest timeout value if Peers are connecting
 *   using Polling transports to prevent connection errors.</small>
 * @param {Number} [options.apiTimeout=4000] The timeout to wait for response from Auth server.
 * @param {Boolean} [options.forceTURNSSL=false] <blockquote class="info">
 *   Note that currently Firefox does not support the TURNS protocol, and that if TURNS is required,
 *   TURN ICE servers using port <code>443</code> will be used instead.<br>
 *   Note that for Edge browsers, this value is overriden as <code>false</code> due to its supports and
 *   only port <code>3478</code> is used.</blockquote>
 *   The flag if TURNS protocol should be used when <code>options.enableTURNServer</code> is enabled.
 * @param {JSON} [options.filterCandidatesType] <blockquote class="info">
 *   Note that this a debugging feature and there might be connectivity issues when toggling these flags.
 *   </blockquote> The configuration options to filter the type of ICE candidates sent and received.
 * @param {Boolean} [options.filterCandidatesType.host=false] The flag if local network ICE candidates should be filtered out.
 * @param {Boolean} [options.filterCandidatesType.srflx=false] The flag if STUN ICE candidates should be filtered out.
 * @param {Boolean} [options.filterCandidatesType.relay=false] The flag if TURN ICE candidates should be filtered out.
 * @param {JSON} [options.throttleIntervals] The configuration options to configure the throttling method timeouts.
 * @param {Number} [options.throttleIntervals.shareScreen=10000] The interval timeout for
 *   <a href="#method_shareScreen"><code>shareScreen()</code> method</a> throttling in milliseconds.
 * @param {Number} [options.throttleIntervals.getUserMedia=0] The interval timeout for
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> throttling in milliseconds.
 * @param {Number} [options.throttleIntervals.refreshConnection=5000] <blockquote class="info">
 *   Note that this throttling is only done for MCU enabled Peer connections with the
 *   <code>options.mcuUseRenegoRestart</code> being set to <code>false</code>.
 *   </blockquote> The interval timeout for <a href="#method_refreshConnection">
 *   <code>refreshConnection()</code> method</a> throttling in milliseconds.
 *   <small>Note that there will be no throttling when <a href="#method_refreshConnection">
 *   <code>refreshConnection()</code> method</a> is called internally.</small>
 * @param {Boolean} [options.throttleShouldThrowError=false] The flag if throttled methods should throw errors when
 *   method is invoked less than the interval timeout value configured in <code>options.throttleIntervals</code>.
 * @param {Boolean} [options.mcuUseRenegoRestart=true] <blockquote class="info">
 *   Note that this feature is currently is beta and for any enquiries on enabling and its support, please
 *   contact <a href="http://support.temasys.io">our support portal</a>.</blockquote>
 *   The flag if <a href="#method_refreshConnection"><code>
 *   refreshConnection()</code> method</a> should renegotiate like non-MCU enabled Peer connection for MCU
 *   enabled Peer connections instead of invoking <a href="#method_joinRoom"><code>joinRoom()</code> method</a> again.
 * @param {String|Array} [options.iceServer] The ICE servers for debugging purposes to use.
 *   - When defined as string, the value is considered as <code>[options.iceServer]</code>.
 *   <small>Note that this is a debugging feature and is only used when instructed for debugging purposes.</small>
 * @param {String} [options.iceServer.#index] The ICE server url for debugging purposes to use.
 * @param {String|JSON} [options.socketServer] The Signaling server for debugging purposes to use.
 *   - When defined as string, the value is considered as <code>{ url: options.socketServer }</code>.
 *   <small>Note that this is a debugging feature and is only used when instructed for debugging purposes.</small>
 * @param {String} options.socketServer.url The Signaling server URL for debugging purposes to use.
 * @param {Array} [options.socketServer.ports] The list of Signaling server ports for debugging purposes to use.
 *   <small>If not defined, it will use the default list of ports specified.</small>
 * @param {Number} options.socketServer.ports.#index The Signaling server port to fallback and use for debugging purposes.
 * @param {String} [options.socketServer.protocol] The Signaling server protocol for debugging purposes to use.
 *   <small>If not defined, it will use the default protocol specified.</small>
 * @param {JSON} [options.codecParams] <blockquote class="info">
 *   Note that some of these parameters are mainly used for experimental or debugging purposes. Toggling any of
 *   these feature may result in disruptions in connectivity.</blockquote>
 *   The audio and video codecs parameters to configure.
 * @param {JSON} [options.codecParams.video] The video codecs parameters to configure.
 * @param {JSON} [options.codecParams.video.h264] The H264 video codec parameters to configure.
 * @param {String} [options.codecParams.video.h264.profileLevelId] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only.</blockquote>
 *   The H264 video codec base16 encoded string which indicates the H264 baseline, main, or the extended profiles.
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Boolean} [options.codecParams.video.h264.levelAsymmetryAllowed] <blockquote class="info">
 *   Note that this is an experimental parameter which may result in connectivity issues when toggled.</blockquote>
 *   The flag if streaming H264 sending video data should be encoded at a different level
 *   from receiving video data from Peer encoding to User when Peer is the offerer.
 *   <small>If Peer is the offerer instead of the User, the Peer's <code>peerInfo.config.priorityWeight</code> will be
 *   higher than User's <code>peerInfo.config.priorityWeight</code>.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Number} [options.codecParams.video.h264.packetizationMode] <blockquote class="info">
 *   Note that this is an experimental parameter which may result in connectivity issues when enabled. It is
 *   advisable to turn off this feature off when receiving H264 decoders do not support the packetization mode,
 *   which may result in a blank receiving video stream.</blockquote>
 *   The flag to enable H264 video codec packetization mode, which splits video frames that are larger
 *   for a RTP packet into RTP packet chunks.
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {JSON} [options.codecParams.video.vp8] The VP8 video codec parameters to configure.
 * @param {Number} [options.codecParams.video.vp8.maxFr] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only. Do not toggle this otherwise.</blockquote>
 *   The maximum number of fps (frames per second) that the VP8 video codec decoder is capable of
 *   decoding when receiving encoded video data packets.
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Number} [options.codecParams.video.vp8.maxFs] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only. Do not toggle this otherwise.</blockquote>
 *   The maximum number of frame size macroblocks that the VP8 video codec decoder is capable of
 *   decoding when receiving encoded video data packets.
 *   <small>The value has to have the width and height of the frame in macroblocks less than the value of
 *   <code>parseInt(Math.sqrt(maxFs * 8))</code>. E.g. If the value is <code>1200</code>, it is capable of
 *   support <code>640x480</code> frame width and height, which heights up to <code>1552px</code>
 *   (<code>97</code> macroblocks value.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {JSON} [options.codecParams.video.vp9] The VP9 video codec parameters to configure.
 * @param {Number} [options.codecParams.video.vp9.maxFr] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only. Do not toggle this otherwise.</blockquote>
 *   The maximum number of fps (frames per second) that the VP9 video codec decoder is capable of
 *   decoding when receiving encoded video data packets.
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Number} [options.codecParams.video.vp9.maxFs] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only. Do not toggle this otherwise.</blockquote>
 *   The maximum number of frame size macroblocks that the VP9 video codec decoder is capable of
 *   decoding when receiving encoded video data packets.
 *   <small>The value has to have the width and height of the frame in macroblocks less than the value of
 *   <code>parseInt(Math.sqrt(maxFs * 8))</code>. E.g. If the value is <code>1200</code>, it is capable of
 *   support <code>640x480</code> frame width and height, which heights up to <code>1552px</code>
 *   (<code>97</code> macroblocks value.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {JSON} [options.codecParams.audio] The audio codecs parameters to configure.
 * @param {JSON} [options.codecParams.audio.opus] <blockquote class="info">
 *   Note that this is only applicable to OPUS audio codecs with a sampling rate of <code>48000</code> Hz (hertz).
 *   </blockquote> The OPUS audio codec parameters to configure.
 * @param {Boolean} [options.codecParams.audio.opus.stereo] The flag if OPUS audio codec is able to decode or receive stereo packets.
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Boolean} [options.codecParams.audio.opus.sprop-stereo] The flag if OPUS audio codec is sending stereo packets.
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Boolean} [options.codecParams.audio.opus.usedtx] <blockquote class="info">
 *   Note that this feature might not work depending on the browser support and implementation.</blockquote>
 *   The flag if OPUS audio codec should enable DTX (Discontinuous Transmission) for sending encoded audio data.
 *   <small>This might help to reduce bandwidth as it reduces the bitrate during silence or background noise, and
 *   goes hand-in-hand with the <code>options.voiceActivityDetection</code> flag in <a href="#method_joinRoom">
 *   <code>joinRoom()</code> method</a>.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Boolean} [options.codecParams.audio.opus.useinbandfec] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only.</blockquote>
 *   The flag if OPUS audio codec has the capability to take advantage of the in-band FEC
 *   (Forward Error Correction) when sending encoded audio data.
 *   <small>This helps to reduce the harm of packet loss by encoding information about the previous packet loss.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Number} [options.codecParams.audio.opus.maxplaybackrate] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only.</blockquote>
 *   The OPUS audio codec maximum output sampling rate in Hz (hertz) that is is capable of receiving
 *   decoded audio data, to adjust to the hardware limitations and ensure that any sending audio data
 *   would not encode at a higher sampling rate specified by this.
 *   <small>This value must be between <code>8000</code> to <code>48000</code>.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Number} [options.codecParams.minptime] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only.</blockquote>
 *   The OPUS audio codec receiving audio data decoder minimum length of time in milleseconds should be
 *   encapsulated in a single received encoded audio data packet.
 *   <small>This value must be between <code>3</code> to <code>120</code></small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {String} [options.priorityWeightScheme] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only and may not work when
 *   internals change.</blockquote> The User's priority weight to enforce User as offerer or answerer.
 * - When not provided, its value is <code>AUTO</code>.
 *   [Rel: Skylink.PRIORITY_WEIGHT_SCHEME]
 * @param {Boolean} [options.useEdgeWebRTC=false] The flag to use Edge 15.x pre-1.0 WebRTC support.
 * @param {Boolean} [options.enableSimultaneousTransfers=true] The flag to enable simultaneous data transfers.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_readyStateChange">
 *   <code>readyStateChange</code> event</a> <code>state</code> parameter payload value
 *   as <code>COMPLETED</code> for request success.</small>
 *   [Rel: Skylink.READY_STATE_CHANGE]
 * @param {JSON|String} callback.error The error result in request.
 * - When defined as string, it's the error when required App Key is not provided.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {Number} callback.error.errorCode The <a href="#event_readyStateChange"><code>readyStateChange</code>
 *   event</a> <code>error.errorCode</code> parameter payload value.
 *   [Rel: Skylink.READY_STATE_CHANGE_ERROR]
 * @param {Error|String} callback.error.error The <a href="#event_readyStateChange"><code>readyStateChange</code>
 *   event</a> <code>error.content</code> parameter payload value.
 * @param {Number} callback.error.status The <a href="#event_readyStateChange"><code>readyStateChange</code>
 *   event</a> <code>error.status</code> parameter payload value.
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {String} callback.success.serverUrl The constructed REST URL requested to Auth server.
 * @param {Number} callback.success.readyState The current ready state.
 *   [Rel: Skylink.READY_STATE_CHANGE]
 * @param {String} callback.success.selectedRoom The Room based on the current Room session token retrieved for.
 * @param {String} callback.success.appKey The configured value of the <code>options.appKey</code>.
 * @param {String} callback.success.defaultRoom The configured value of the <code>options.defaultRoom</code>.
 * @param {String} callback.success.roomServer The configured value of the <code>options.roomServer</code>.
 * @param {Boolean} callback.success.enableIceTrickle The configured value of the <code>options.enableIceTrickle</code>.
 * @param {Boolean} callback.success.enableDataChannel The configured value of the <code>options.enableDataChannel</code>.
 * @param {Boolean} callback.success.enableTURNServer The configured value of the <code>options.enableTURNServer</code>.
 * @param {Boolean} callback.success.enableSTUNServer The configured value of the <code>options.enableSTUNServer</code>.
 * @param {Boolean} callback.success.TURNTransport The configured value of the <code>options.TURNServerTransport</code>.
 * @param {Boolean} callback.success.audioFallback The configured value of the <code>options.audioFallback</code>.
 * @param {Boolean} callback.success.forceSSL The configured value of the <code>options.forceSSL</code>.
 * @param {String|JSON} callback.success.audioCodec The configured value of the <code>options.audioCodec</code>.
 * @param {String|JSON} callback.success.videoCodec The configured value of the <code>options.videoCodec</code>.
 * @param {Number} callback.success.socketTimeout The configured value of the <code>options.socketTimeout</code>.
 * @param {Number} callback.success.apiTimeout The configured value of the <code>options.apiTimeout</code>.
 * @param {Boolean} callback.success.forceTURNSSL The configured value of the <code>options.forceTURNSSL</code>.
 * @param {Boolean} callback.success.forceTURN The configured value of the <code>options.forceTURN</code>.
 * @param {Boolean} callback.success.usePublicSTUN The configured value of the <code>options.usePublicSTUN</code>.
 * @param {Boolean} callback.success.disableVideoFecCodecs The configured value of the <code>options.disableVideoFecCodecs</code>.
 * @param {Boolean} callback.success.disableComfortNoiseCodec The configured value of the <code>options.disableComfortNoiseCodec</code>.
 * @param {Boolean} callback.success.disableREMB The configured value of the <code>options.disableREMB</code>.
 * @param {JSON} callback.success.filterCandidatesType The configured value of the <code>options.filterCandidatesType</code>.
 * @param {JSON} callback.success.throttleIntervals The configured value of the <code>options.throttleIntervals</code>.
 * @param {Boolean} callback.success.throttleShouldThrowError The configured value of the <code>options.throttleShouldThrowError</code>.
 * @param {JSON} callback.success.mcuUseRenegoRestart The configured value of the <code>options.mcuUseRenegoRestart</code>.
 * @param {JSON} callback.success.iceServer The configured value of the <code>options.iceServer</code>.
 *   <small>See the <code>.urls</code> property in this object for configured value if defined.</small>
 * @param {JSON|String} callback.success.socketServer The configured value of the <code>options.socketServer</code>.
 * @param {Boolean} callback.success.useEdgeWebRTC The configured value of the <code>options.useEdgeWebRTC</code>.
 * @param {Boolean} callback.success.enableSimultaneousTransfers The configured value of the <code>options.enableSimultaneousTransfers</code>.
 * @example
 *   // Example 1: Using CORS authentication and connection to default Room
 *   skylinkDemo(appKey, function (error, success) {
 *     if (error) return;
 *     skylinkDemo.joinRoom(); // Goes to default Room
 *   });
 *
 *   // Example 2: Using CORS authentication and connection to a different Room
 *   skylinkDemo(appKey, function (error, success) {
 *     skylinkDemo.joinRoom("testxx"); // Goes to "testxx" Room
 *   });
 *
 *   // Example 3: Using credentials authentication and connection to only default Room
 *   var defaultRoom   = "test",
 *       startDateTime = (new Date()).toISOString(),
 *       duration      = 1, // Allows only User session to stay for 1 hour
 *       appKeySecret  = "xxxxxxx",
 *       hash          = CryptoJS.HmacSHA1(defaultRoom + "\_" + duration + "\_" + startDateTime, appKeySecret);
 *       credentials   = encodeURIComponent(hash.toString(CryptoJS.enc.Base64));
 *
 *   skylinkDemo({
 *     defaultRoom: defaultRoom,
 *     appKey: appKey,
 *     credentials: {
 *       duration: duration,
 *       startDateTime: startDateTime,
 *       credentials: credentials
 *     }
 *   }, function (error, success) {
 *     if (error) return;
 *     skylinkDemo.joinRoom(); // Goes to default Room (switching to different Room is not allowed for credentials authentication)
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>If parameter <code>options</code> is not provided: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Checks if dependecies and browser APIs are available. <ol><li>If AdapterJS is not loaded: <ol>
 *   <li><a href="#event_readyStateChange"><code>readyStateChange</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>ERROR</code> and <code>error.errorCode</code> as
 *   <code>ADAPTER_NO_LOADED</code>.</li><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>If socket.io-client is not loaded: <ol><li><a href="#event_readyStateChange">
 *   <code>readyStateChange</code> event</a> triggers parameter payload <code>state</code>
 *   as <code>ERROR</code> and <code>error.errorCode</code> as <code>NO_SOCKET_IO</code>.</li>
 *   <li><b>ABORT</b> and return error. </li></ol></li>
 *   <li>If XMLHttpRequest API is not available: <ol><li><a href="#event_readyStateChange">
 *   <code>readyStateChange</code> event</a> triggers parameter payload <code>state</code>
 *   as <code>ERROR</code> and <code>error.errorCode</code> as <code>NO_XMLHTTPREQUEST_SUPPORT</code>.</li>
 *   <li><b>ABORT</b> and return error.</li></ol></li><li>If WebRTC is not supported by device: <ol>
 *   <li><a href="#event_readyStateChange"><code>readyStateChange</code> event</a> triggers parameter
 *   payload <code>state</code> as <code>ERROR</code> and <code>error.errorCode</code> as
 *   <code>NO_WEBRTC_SUPPORT</code>.</li><li><b>ABORT</b> and return error.</li></ol></li></ol></li>
 *   <li>Retrieves Room session token from Auth server. <ol>
 *   <li><a href="#event_readyStateChange"><code>readyStateChange</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>LOADING</code>.</li>
 *   <li>If retrieval was successful: <ol><li><a href="#event_readyStateChange"><code>readyStateChange</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>COMPLETED</code>.</li></ol></li><li>Else: <ol>
 *   <li><a href="#event_readyStateChange"><code>readyStateChange</code> event</a> triggers parameter
 *   payload <code>state</code> as <code>ERROR</code>.</li><li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.init = function(_options, _callback) {
  var self = this;
  var options = {};
  var callback = function () {};

  // `init(function () {})`
  if (typeof _options === 'function'){
    callback = _options;

  // `init({})`
  } else if (_options && typeof _options === 'object') {
    options = clone(_options);

    // `init({ apiKey: "xxxxx" })` (fallback for older documentation)
    if (!(options.appKey && typeof options.appKey === 'string') &&
      (options.apiKey && typeof options.apiKey === 'string')) {
      options.appKey = options.apiKey;
    }

  // `init("xxxxx")` (for just the options.appKey being provided)
  } else if (_options && typeof _options === 'string') {
    options.appKey = _options;
  }

  // `init(.., function () {})`
  if (typeof _callback === 'function') {
    callback = _callback;
  }

  // `init({ defaultRoom: "xxxxx" })`
  options.defaultRoom = options.defaultRoom && typeof options.defaultRoom === 'string' ? options.defaultRoom : options.appKey;

  // `init({ roomServer: "//server.temasys.io" })`
  options.roomServer = options.roomServer && typeof options.roomServer === 'string' ? options.roomServer : '//api.temasys.io';

  // `init({ enableIceTrickle: true })`
  options.enableIceTrickle = options.enableIceTrickle !== false;

  // `init({ enableIceTrickle: true })`
  options.enableDataChannel = options.enableDataChannel !== false;

  // `init({ enableSTUNServer: true })`
  options.enableSTUNServer = options.enableSTUNServer !== false;

  // `init({ enableTURNServer: true })`
  options.enableTURNServer = options.enableTURNServer !== false;

  // `init({ audioFallback: true })`
  options.audioFallback = options.audioFallback === true;

  // `init({ forceSSL: true })`
  options.forceSSL = options.forceSSL !== false;

  // `init({ socketTimeout: 20000 })`
  options.socketTimeout = typeof options.socketTimeout === 'number' && options.socketTimeout >= 5000 ? options.socketTimeout : 7000;

  // `init({ socketTimeout: 4000 })`
  options.apiTimeout = typeof options.apiTimeout === 'number' ? options.apiTimeout : 4000;

  // `init({ forceTURNSSL: false })`
  options.forceTURNSSL = options.forceTURNSSL === true;

  // `init({ forceTURN: false })`
  options.forceTURN = options.forceTURN === true;

  // `init({ usePublicSTUN: false })`
  options.usePublicSTUN = options.usePublicSTUN === true;

  // `init({ disableVideoFecCodecs: false })`
  options.disableVideoFecCodecs = options.disableVideoFecCodecs === true;

  // `init({ disableComfortNoiseCodec: false })`
  options.disableComfortNoiseCodec = options.disableComfortNoiseCodec === true;

  // `init({ disableREMB: false })`
  options.disableREMB = options.disableREMB === true;

  // `init({ throttleShouldThrowError: false })`
  options.throttleShouldThrowError = options.throttleShouldThrowError === true;

  // `init({ mcuUseRenegoRestart: true })`
  options.mcuUseRenegoRestart = options.mcuUseRenegoRestart === false;

  // `init({ useEdgeWebRTC: false })`
  options.useEdgeWebRTC = options.useEdgeWebRTC === true;

  // `init({ enableSimultaneousTransfers: true })`
  options.enableSimultaneousTransfers = options.enableSimultaneousTransfers !== false;

  // `init({ priorityWeightScheme: "auto" })`
  options.priorityWeightScheme = self._containsInList('PRIORITY_WEIGHT_SCHEME', options.priorityWeightScheme, 'AUTO');

  // `init({ TURNServerTransport: "any" })`
  options.TURNServerTransport = self._containsInList('TURN_TRANSPORT', options.TURNServerTransport, 'ANY');

  // `init({ credentials: { credentials: "xxxxx", startDateTime: "xxxxx", duration: 24 } })`
  options.credentials = options.credentials && typeof options.credentials === 'object' &&
    options.credentials.startDateTime && typeof options.credentials.startDateTime === 'string' &&
    options.credentials.credentials && typeof options.credentials.credentials === 'string' &&
    typeof options.credentials.duration === 'number' ? options.credentials : null;

  // `init({ filterCandidatesType: { .. } })`
  options.filterCandidatesType = options.filterCandidatesType &&
    typeof options.filterCandidatesType === 'object' ? options.filterCandidatesType : {};

  // `init({ filterCandidatesType: { host: false } })`
  options.filterCandidatesType.host = options.filterCandidatesType.host === true;

  // `init({ filterCandidatesType: { srflx: false } })`
  options.filterCandidatesType.srflx = options.filterCandidatesType.srflx === true;

  // `init({ filterCandidatesType: { relay: false } })`
  options.filterCandidatesType.relay = options.filterCandidatesType.relay === true;

  // `init({ throttleIntervals: { .. } })`
  options.throttleIntervals = options.throttleIntervals &&
    typeof options.throttleIntervals === 'object' ? options.throttleIntervals : {};

  // `init({ throttleIntervals: { shareScreen: 10000 } })`
  options.throttleIntervals.shareScreen = typeof options.throttleIntervals.shareScreen === 'number' ?
    options.throttleIntervals.shareScreen : 10000;

  // `init({ throttleIntervals: { refreshConnection: 5000 } })`
  options.throttleIntervals.refreshConnection = typeof options.throttleIntervals.refreshConnection === 'number' ?
    options.throttleIntervals.refreshConnection : 5000;

  // `init({ throttleIntervals: { getUserMedia: 0 } })`
  options.throttleIntervals.getUserMedia = typeof options.throttleIntervals.getUserMedia === 'number' ?
    options.throttleIntervals.getUserMedia : 0;

  // `init({ iceServer: "turn:xxxx.io" })`
  if (options.iceServer && typeof options.iceServer === 'string') {
    options.iceServer = { urls: [options.iceServer] };

  // `init({ iceServer: ["turn:xxxx.io", "turn:xxx2.io"] })`
  } else if (Array.isArray(options.iceServer) && options.iceServer.length > 0) {
    options.iceServer = { urls: options.iceServer };

  } else {
    options.iceServer = null;
  }

  // `init({ socketServer: "server.io" })`
  if (options.socketServer && typeof options.socketServer === 'string') {
    options.socketServer = options.socketServer;

  // `init({ socketServer: { url: "server.io", ... } })`
  } else if (options.socketServer && typeof options.socketServer === 'object' &&
    options.socketServer.url && typeof options.socketServer.url === 'string') {
    options.socketServer = {
      url: options.socketServer.url,
      // `init({ socketServer: { ports: [80, 3000], ... } })`
      ports: Array.isArray(options.socketServer.ports) ? options.socketServer.ports : [],
      // `init({ socketServer: { protocol: "https:", ... } })`
      protocol: options.socketServer.protocol ? options.socketServer.protocol : null
    };

  } else {
    options.socketServer = null;
  }

  // `init({ audioCodec: { codec: "xxxx", ... } })`
  if (options.audioCodec && typeof options.audioCodec === 'object' &&
    self._containsInList('AUDIO_CODEC', options.audioCodec.codec, '-')) {
    options.audioCodec = {
      codec: options.audioCodec.codec,
      // `init({ audioCodec: { samplingRate: 48000, ... } })`
      samplingRate: typeof options.audioCodec.samplingRate === 'number' ? options.audioCodec.samplingRate : null,
      // `init({ audioCodec: { channels: 2, ... } })`
      channels: typeof options.audioCodec.channels === 'number' ? options.audioCodec.channels : null
    };

  // `init({ audioCodec: "xxxx" })`
  } else {
    options.audioCodec = self._containsInList('AUDIO_CODEC', options.audioCodec, 'AUTO');
  }

  // `init({ videoCodec: { codec: "xxxx", ... } })`
  if (options.videoCodec && typeof options.videoCodec === 'object' &&
    self._containsInList('VIDEO_CODEC', options.videoCodec.codec, '-')) {
    options.videoCodec = {
      codec: options.videoCodec.codec,
      // `init({ videoCodec: { samplingRate: 48000, ... } })`
      samplingRate: typeof options.videoCodec.samplingRate === 'number' ? options.videoCodec.samplingRate : null
    };

  // `init({ videoCodec: "xxxx" })`
  } else {
    options.videoCodec = self._containsInList('VIDEO_CODEC', options.videoCodec, 'AUTO');
  }

  // `init({ codecParams: { ... } })`
  options.codecParams = options.codecParams && typeof options.codecParams === 'object' ? options.codecParams : {};

  // `init({ codecParams: { audio: { ... } } })`
  options.codecParams.audio = options.codecParams.audio && typeof options.codecParams.audio === 'object' ? options.codecParams.audio : {};

  // `init({ codecParams: { video: { ... } } })`
  options.codecParams.video = options.codecParams.video && typeof options.codecParams.video === 'object' ? options.codecParams.video : {};

  // `init({ codecParams: { audio: { opus: { ... } } } })`
  options.codecParams.audio.opus = options.codecParams.audio.opus &&
    typeof options.codecParams.audio.opus === 'object' ? options.codecParams.audio.opus : {};

  // `init({ codecParams: { audio: { opus: { stereo: true } } } })`
  options.codecParams.audio.opus.stereo = typeof options.codecParams.audio.opus.stereo === 'boolean' ?
    options.codecParams.audio.opus.stereo : null;

  // `init({ codecParams: { audio: { opus: { "sprop-stereo": true } } } })`
  options.codecParams.audio.opus['sprop-stereo'] = typeof options.codecParams.audio.opus['sprop-stereo'] === 'boolean' ?
    options.codecParams.audio.opus['sprop-stereo'] : null;

  // `init({ codecParams: { audio: { opus: { usedtx: true } } } })`
  options.codecParams.audio.opus.usedtx = typeof options.codecParams.audio.opus.usedtx === 'boolean' ?
    options.codecParams.audio.opus.usedtx : null;

  // `init({ codecParams: { audio: { opus: { useinbandfec: true } } } })`
  options.codecParams.audio.opus.useinbandfec = typeof options.codecParams.audio.opus.useinbandfec === 'boolean' ?
    options.codecParams.audio.opus.useinbandfec : null;

  // `init({ codecParams: { audio: { opus: { maxplaybackrate: 48000 } } } })`
  options.codecParams.audio.opus.maxplaybackrate = typeof options.codecParams.audio.opus.maxplaybackrate === 'number' &&
    options.codecParams.audio.opus.maxplaybackrate >= 8000 && options.codecParams.audio.opus.maxplaybackrate <= 48000 ?
    options.codecParams.audio.opus.maxplaybackrate : null;

  // `init({ codecParams: { audio: { opus: { minptime: 60 } } } })`
  options.codecParams.audio.opus.minptime = typeof options.codecParams.audio.opus.minptime === 'number' &&
    options.codecParams.audio.opus.minptime >= 3 ? options.codecParams.audio.opus.minptime : null;

  // `init({ codecParams: { video: { h264: { ... } } } })`
  options.codecParams.video.h264 = options.codecParams.video.h264 &&
    typeof options.codecParams.video.h264 === 'object' ? options.codecParams.video.h264 : {};

  // `init({ codecParams: { video: { h264: { profileLevelId: "xxxxxx" } } } })`
  options.codecParams.video.h264.profileLevelId = options.codecParams.video.h264.profileLevelId &&
    typeof options.codecParams.video.h264.profileLevelId === 'string' ?
    options.codecParams.video.h264.profileLevelId : null;

  // `init({ codecParams: { video: { h264: { levelAsymmetryAllowed: 1 } } } })`
  options.codecParams.video.h264.levelAsymmetryAllowed = typeof options.codecParams.video.h264.levelAsymmetryAllowed === 'boolean' ?
    options.codecParams.video.h264.levelAsymmetryAllowed : null;

  // `init({ codecParams: { video: { h264: { packetizationMode: 1 } } } })` (fallback for number)
  options.codecParams.video.h264.packetizationMode = typeof options.codecParams.video.h264.packetizationMode === 'boolean' ?
    (options.codecParams.video.h264.packetizationMode === true ? 1 : 0) :
    (typeof options.codecParams.video.h264.packetizationMode === 'number' ?
    options.codecParams.video.h264.packetizationMode : null);

  // `init({ codecParams: { video: { vp8: { ... } } } })`
  options.codecParams.video.vp8 = options.codecParams.video.vp8 &&
    typeof options.codecParams.video.vp8 === 'object' ? options.codecParams.video.vp8 : {};

  // `init({ codecParams: { video: { vp8: { maxFs: 100 } } } })`
  options.codecParams.video.vp8.maxFs = typeof options.codecParams.video.vp8.maxFs === 'number' ?
    options.codecParams.video.vp8.maxFs : null;

  // `init({ codecParams: { video: { vp8: { maxFr: 100 } } } })`
  options.codecParams.video.vp8.maxFr = typeof options.codecParams.video.vp8.maxFr === 'number' ?
    options.codecParams.video.vp8.maxFr : null;

  // `init({ codecParams: { video: { vp9: { ... } } } })`
  options.codecParams.video.vp9 = options.codecParams.video.vp9 &&
    typeof options.codecParams.video.vp9 === 'object' ? options.codecParams.video.vp9 : {};

  // `init({ codecParams: { video: { vp9: { maxFs: 100 } } } })`
  options.codecParams.video.vp9.maxFs = typeof options.codecParams.video.vp9.maxFs === 'number' ?
    options.codecParams.video.vp9.maxFs : null;

  // `init({ codecParams: { video: { vp9: { maxFr: 100 } } } })`
  options.codecParams.video.vp9.maxFr = typeof options.codecParams.video.vp9.maxFr === 'number' ?
    options.codecParams.video.vp9.maxFr : null;

  // Force TURN connections should enforce settings.
  if (options.forceTURN) {
    options.enableTURNServer = true;
    options.enableSTUNServer = false;
    options.filterCandidatesType.host = true;
    options.filterCandidatesType.srflx = true;
    options.filterCandidatesType.relay = false;
  }

  self.once('readyStateChange', function () { }, function (state, error) {
    if (state === self.READY_STATE_CHANGE.ERROR) {
      log.error('Failed init() process ->', error);
      callback({
        error: error.content,
        errorCode: error.errorCode,
        status: error.status
      }, null);
      return true;

    } else if (state === self.READY_STATE_CHANGE.COMPLETED) {
      log.info('Completed init() successfully ->', options);

      var success = clone(self._initOptions);
      success.serverUrl = self._path;
      success.readyState = self._readyState;
      success.selectedRoom = self._selectedRoom;
      success.TURNTransport = success.TURNServerTransport;

      callback(null, success);
      return true;
    }
  });

  self._initOptions = options;
  self._readyState = self.READY_STATE_CHANGE.INIT;
  self._selectedRoom = self._initOptions.defaultRoom;
  self._trigger('readyStateChange', self.READY_STATE_CHANGE.INIT, null, self._selectedRoom);

  if (!(options && options.appKey && typeof options.appKey === 'string')) {
    self._readyState = self.READY_STATE_CHANGE.ERROR;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      content: new Error('Please provide an app key'),
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_PATH,
      status: -2
    }, self._selectedRoom);
    return;
  }

  // Format: https://api.temasys.io/api/<appKey>/<room>[/<creds.start>][/<creds.duration>][?cred=<creds.hash>]&rand=<rand>
  self._path = self._initOptions.roomServer + '/api/' + self._initOptions.appKey + '/' + self._selectedRoom +
    (self._initOptions.credentials ? '/' + self._initOptions.credentials.startDateTime + '/' +
    self._initOptions.credentials.duration + '?cred=' + self._initOptions.credentials.credentials : '') +
    (self._initOptions.credentials ? '&' : '?') + 'rand=' + Date.now();

  self._loadInfo();
};

/**
 * Function that checks if value is contained in a SDK constant.
 * @method _containsInList
 * @for Skylink
 * @since 0.6.27
 * @private
 */
Skylink.prototype._containsInList = function (listName, value, defaultProperty) {
  var self = this;

  for (var property in self[listName]) {
    if (self[listName].hasOwnProperty(property) && self[listName][property] === value) {
      return value;
    }
  }

  return self[listName][defaultProperty];
};

/**
 * Starts retrieving Room credentials information from API server.
 * @method _requestServerInfo
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._requestServerInfo = function(method, url, callback, params) {
  var self = this;
  var retries = 0;

  // XDomainRequest is supported in IE8 - 9 for CORS connection.
  self._socketUseXDR = typeof window.XDomainRequest === 'function' || typeof window.XDomainRequest === 'object';
  url = (self._initOptions.forceSSL) ? 'https:' + url : url;

  (function requestFn () {
    var xhr = new XMLHttpRequest();
    var completed = false;

    if (self._socketUseXDR) {
      log.debug([null, 'XMLHttpRequest', method, 'Using XDomainRequest for CORS authentication.']);
      xhr = new XDomainRequest();
      xhr.setContentType = function (contentType) {
        xhr.contentType = contentType;
      };
    }

    xhr.onload = function () {
      if (completed) {
        return;
      }
      completed = true;
      var response = JSON.parse(xhr.responseText || xhr.response || '{}');
      var status = xhr.status || (response.success ? 200 : 400);
      self._handleAuthStats(response.success ? 'success' : 'error', response, status);

      if (response.success) {
      	log.debug([null, 'XMLHttpRequest', method, 'Received sessions parameters ->'], response);
      	callback(response);
      	return;
      }

      log.error([null, 'XMLHttpRequest', method, 'Failed retrieving sessions parameters ->'], response);

      // 400 - Bad request
      // 403 - Room is locked
      // 401 - API Not authorized
      // 402 - run out of credits
      self._readyState = self.READY_STATE_CHANGE.ERROR;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
        status: status,
        content: new Error(response.info || 'XMLHttpRequest status not OK\nStatus was: ' + status),
        errorCode: response.error || status
      }, self._selectedRoom);
    };

    xhr.onerror = function (error) {
      if (completed) {
        return;
      }
      completed = true;
      log.error([null, 'XMLHttpRequest', method, 'Failed retrieving information with status ->'], xhr.status);
      // TO CHECK: Added a new field "web_sdk_error" not documented in specs.
      self._handleAuthStats('error', null, -1, 'Failed connecting to server');
      self._readyState = self.READY_STATE_CHANGE.ERROR;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
        status: xhr.status || -1,
        content: new Error('Network error occurred. (Status: ' + xhr.status + ')'),
        errorCode: self.READY_STATE_CHANGE_ERROR.XML_HTTP_REQUEST_ERROR
      }, self._selectedRoom);
    };

    xhr.onprogress = function () {
      log.debug([null, 'XMLHttpRequest', method, 'Retrieving information and config from webserver ->'], {
        url: url,
        params: params
      });
    };

    try {
      xhr.open(method, url, true);

      // ESS-1038: Adding custom headers to signaling
      if(!self._socketUseXDR) {
        xhr.setRequestHeader('Skylink_SDK_version', self.VERSION);
        xhr.setRequestHeader('Skylink_SDK_type', 'WEB_SDK');
      }

      if (params) {
        xhr.setContentType('application/json;charset=UTF-8');
        xhr.send(JSON.stringify(params));
      } else {
        xhr.send();
      }
    } catch (error) {
      completed = true;
      self._handleAuthStats('error', null, -1, error);
      self._readyState = self.READY_STATE_CHANGE.ERROR;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
        status: xhr.status || -1,
        content: new Error('Failed starting XHR process.'),
        errorCode: self.READY_STATE_CHANGE_ERROR.XML_HTTP_REQUEST_ERROR
      }, self._selectedRoom);
      return;
    }

    setTimeout(function () {
      if (completed) {
        return;
      }
      completed = true;
      xhr.onload = null;
      xhr.onerror = null;
      xhr.onprogress = null;

      if (retries < 2) {
        retries++;
        requestFn();

      } else {
      	var timeoutError = new Error('Response timed out from API server');
        self._handleAuthStats('error', null, -1, timeoutError);
      	self._readyState = self.READY_STATE_CHANGE.ERROR;
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
          status: xhr.status || -1,
          content: timeoutError,
          errorCode: self.READY_STATE_CHANGE_ERROR.XML_HTTP_NO_REPONSE_ERROR
        }, self._selectedRoom);
      }
    }, self._initOptions.apiTimeout);
  })();
};

/**
 * Parses the Room credentials information retrieved from API server.
 * @method _parseInfo
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._parseInfo = function(info) {
  log.log('Parsing parameter from server', info);
  if (!info.pc_constraints && !info.offer_constraints) {
    this._trigger('readyStateChange', this.READY_STATE_CHANGE.ERROR, {
      status: 200,
      content: info.info,
      errorCode: info.error
    }, self._selectedRoom);
    return;
  }

  log.debug('Peer connection constraints:', info.pc_constraints);
  log.debug('Offer constraints:', info.offer_constraints);

  this._key = info.cid;
  this._appKeyOwner = info.apiOwner;
  this._signalingServer = info.ipSigserver;
  this._isPrivileged = info.isPrivileged;
  this._autoIntroduce = info.autoIntroduce;
  this._hasMCU = info.hasMCU;

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
    'http:': Array.isArray(info.httpPortList) && info.httpPortList.length > 0 ? info.httpPortList : [80, 3000],
    'https:': Array.isArray(info.httpsPortList) && info.httpsPortList.length > 0 ? info.httpsPortList : [443, 3443]
  };

  // use default bandwidth and media resolution provided by server
  //this._streamSettings.bandwidth = info.bandwidth;
  //this._streamSettings.video = info.video;
  this._readyState = this.READY_STATE_CHANGE.COMPLETED;
  this._trigger('readyStateChange', this.READY_STATE_CHANGE.COMPLETED, null, this._selectedRoom);
  log.info('Parsed parameters from webserver. Ready for web-realtime communication');
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

  if (typeof (globals.AdapterJS || window.AdapterJS || {}).webRTCReady !== 'function') {
    var noAdapterErrorMsg = 'AdapterJS dependency is not loaded or incorrect AdapterJS dependency is used';
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: -2,
      content: new Error(noAdapterErrorMsg),
      errorCode: self.READY_STATE_CHANGE_ERROR.ADAPTER_NO_LOADED
    }, self._selectedRoom);
    return;

  } else if (!(globals.io || window.io)) {
    log.error('Socket.io not loaded. Please load socket.io');
    self._readyState = self.READY_STATE_CHANGE.ERROR;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: -2,
      content: new Error('Socket.io not found'),
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_SOCKET_IO
    }, self._selectedRoom);
    return;

  } else if (!window.XMLHttpRequest) {
    log.error('XMLHttpRequest not supported. Please upgrade your browser');
    self._readyState = self.READY_STATE_CHANGE.ERROR;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: -2,
      content: new Error('XMLHttpRequest not available'),
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_XMLHTTPREQUEST_SUPPORT
    }, self._selectedRoom);
    return;

  } else if (!self._path) {
    log.error('Skylink is not initialised. Please call init() first');
    self._readyState = self.READY_STATE_CHANGE.ERROR;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: -2,
      content: new Error('No API Path is found'),
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_PATH
    }, self._selectedRoom);
    return;
  }

  AdapterJS.webRTCReady(function () {
    self._enableIceRestart = AdapterJS.webrtcDetectedBrowser === 'firefox' ?
      AdapterJS.webrtcDetectedVersion >= 48 : true;
    self._binaryChunkType = AdapterJS.webrtcDetectedBrowser === 'firefox' ?
      self.DATA_TRANSFER_DATA_TYPE.BLOB : self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER;

      // Prevent empty object returned when constructing the RTCPeerConnection object
    if (!(function () {
      try {
        var p = new window.RTCPeerConnection(null);
        // IE returns as typeof object
        return ['object', 'function'].indexOf(typeof p.createOffer) > -1 && p.createOffer !== null;
      } catch (e) {
        return false;
      }
    })()) {
      if (window.RTCPeerConnection && AdapterJS.webrtcDetectedType === 'plugin') {
        log.error('Plugin is not available. Please check plugin status.');
      } else {
        log.error('WebRTC not supported. Please upgrade your browser');
      }
      self._readyState = self.READY_STATE_CHANGE.ERROR;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
        status: -2,
        content: new Error(AdapterJS.webrtcDetectedType === 'plugin' && window.RTCPeerConnection ? 'Plugin is not available' : 'WebRTC not available'),
        errorCode: self.READY_STATE_CHANGE_ERROR.NO_WEBRTC_SUPPORT
      }, self._selectedRoom);
      return;
    }

    self._getCodecsSupport(function (error) {
      if (error) {
        log.error(error);
        self._readyState = self.READY_STATE_CHANGE.ERROR;
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
          status: -2,
          content: new Error(error.message || error.toString()),
          errorCode: self.READY_STATE_CHANGE_ERROR.PARSE_CODECS
        }, self._selectedRoom);
        return;
      }

      if (Object.keys(self._currentCodecSupport.audio).length === 0 && Object.keys(self._currentCodecSupport.video).length === 0) {
        log.error('No audio/video codecs available to start connection.');
        self._readyState = self.READY_STATE_CHANGE.ERROR;
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
          status: -2,
          content: new Error('No audio/video codecs available to start connection'),
          errorCode: self.READY_STATE_CHANGE_ERROR.PARSE_CODECS
        }, self._selectedRoom);
        return;
      }

      self._readyState = self.READY_STATE_CHANGE.LOADING;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.LOADING, null, self._selectedRoom);
      self._handleClientStats();
      self._requestServerInfo('GET', self._path, function(response) {
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
    log.error('Invalid room provided. Room:', room);
    callback(new Error('Invalid room provided'), null);
    return;
  }
  var defaultRoom = self._initOptions.defaultRoom;
  var options = clone(self._initOptions);
  options.iceServer = options.iceServer ? options.iceServer.urls : null;

  if(options.defaultRoom!==room){
    options.defaultRoom = room;
  }

  self.init(options, function (error, success) {
    self._initOptions.defaultRoom = defaultRoom;
    if (error) {
      callback(error, null);
    } else {
      callback(null, success);
    }
  });
};

