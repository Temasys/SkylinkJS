/**
 * <blockquote class="info">
 *   Note that some of these parameters are mainly used for experimental or debugging purposes. Toggling any of
 *   these feature may result in disruptions in connectivity.</blockquote>
 * @private
 * @typedef {Object} codecParams
 * @property {JSON} [video] - The video codecs parameters to configure.
 * @property {JSON} [video.h264] - The H264 video codec parameters to configure.
 * @property {String} [video.h264.profileLevelId] - <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only.</blockquote>
 *   The H264 video codec base16 encoded string which indicates the H264 baseline, main, or the extended profiles.
 *   When not provided, the default browser configuration is used.
 * @property {boolean} [video.h264.levelAsymmetryAllowed] - <blockquote class="info">
 *   Note that this is an experimental parameter which may result in connectivity issues when toggled.</blockquote>
 *   The flag if streaming H264 sending video data should be encoded at a different level
 *   from receiving video data from Peer encoding to User when Peer is the offerer.
 *   If Peer is the offerer instead of the User, the Peer's <code>peerInfo.config.priorityWeight</code> will be
 *   higher than User's <code>peerInfo.config.priorityWeight</code>.
 *   When not provided, the default browser configuration is used.
 * @property {number} [video.h264.packetizationMode] - <blockquote class="info">
 *   Note that this is an experimental parameter which may result in connectivity issues when enabled. It is
 *   advisable to turn off this feature off when receiving H264 decoders do not support the packetization mode,
 *   which may result in a blank receiving video stream.</blockquote>
 *   The flag to enable H264 video codec packetization mode, which splits video frames that are larger
 *   for a RTP packet into RTP packet chunks.
 *   When not provided, the default browser configuration is used.
 * @property {JSON} [video.vp8] The VP8 video codec parameters to configure.
 * @property {number} [video.vp8.maxFr] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only. Do not toggle this otherwise.</blockquote>
 *   The maximum number of fps (frames per second) that the VP8 video codec decoder is capable of
 *   decoding when receiving encoded video data packets.
 *   When not provided, the default browser configuration is used.
 * @property {number} [video.vp8.maxFs] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only. Do not toggle this otherwise.</blockquote>
 *   The maximum number of frame size macroblocks that the VP8 video codec decoder is capable of
 *   decoding when receiving encoded video data packets.
 *   The value has to have the width and height of the frame in macroblocks less than the value of
 *   <code>parseInt(Math.sqrt(maxFs * 8))</code>. E.g. If the value is <code>1200</code>, it is capable of
 *   support <code>640x480</code> frame width and height, which heights up to <code>1552px</code>
 *   (<code>97</code> macroblocks value.
 *   When not provided, the default browser configuration is used.
 * @property {JSON} [video.vp9] The VP9 video codec parameters to configure.
 * @property {number} [video.vp9.maxFr] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only. Do not toggle this otherwise.</blockquote>
 *   The maximum number of fps (frames per second) that the VP9 video codec decoder is capable of
 *   decoding when receiving encoded video data packets.
 *   When not provided, the default browser configuration is used.
 * @property {number} [video.vp9.maxFs] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only. Do not toggle this otherwise.</blockquote>
 *   The maximum number of frame size macroblocks that the VP9 video codec decoder is capable of
 *   decoding when receiving encoded video data packets.
 *   The value has to have the width and height of the frame in macroblocks less than the value of
 *   <code>parseInt(Math.sqrt(maxFs * 8))</code>. E.g. If the value is <code>1200</code>, it is capable of
 *   support <code>640x480</code> frame width and height, which heights up to <code>1552px</code>
 *   (<code>97</code> macroblocks value.
 *   When not provided, the default browser configuration is used.
 * @property {JSON} [audio] The audio codecs parameters to configure.
 * @property {JSON} [audio.opus] <blockquote class="info">
 *   Note that this is only applicable to OPUS audio codecs with a sampling rate of <code>48000</code> Hz (hertz).
 *   </blockquote> The OPUS audio codec parameters to configure.
 * @property {boolean} [audio.opus.stereo] The flag if OPUS audio codec is able to decode or receive stereo packets.
 *   When not provided, the default browser configuration is used.
 * @property {boolean} [audio.opus.sprop-stereo] The flag if OPUS audio codec is sending stereo packets.
 *   When not provided, the default browser configuration is used.
 * @property {boolean} [audio.opus.useinbandfec] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only.</blockquote>
 *   The flag if OPUS audio codec has the capability to take advantage of the in-band FEC
 *   (Forward Error Correction) when sending encoded audio data.
 *   This helps to reduce the harm of packet loss by encoding information about the previous packet loss.
 *   When not provided, the default browser configuration is used.
 * @property {number} [audio.opus.maxplaybackrate] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only.</blockquote>
 *   The OPUS audio codec maximum output sampling rate in Hz (hertz) that is is capable of receiving
 *   decoded audio data, to adjust to the hardware limitations and ensure that any sending audio data
 *   would not encode at a higher sampling rate specified by this.
 *   This value must be between <code>8000</code> to <code>48000</code>.
 *   When not provided, the default browser configuration is used.
 * @property {number} [minptime] <blockquote class="info">
 *   Note that this parameter should only be used for debugging purposes only.</blockquote>
 *   The OPUS audio codec receiving audio data decoder minimum length of time in milliseconds should be
 *   encapsulated in a single received encoded audio data packet.
 *   This value must be between <code>3</code> to <code>120</code>
 *   When not provided, the default browser configuration is used.
 */

/**
 * <blockquote class="info">
 *   When provided as a string, it's configured as <code>appKey</code>.</blockquote>
 * @public
 * @typedef initOptions
 * @type {Object}
 * @property {String} appKey - The App Key. By default, {@link Skylink} uses <a href="https://en.wikipedia.org/wiki/Cross-origin_resource_sharing">HTTP CORS</a>
 *   authentication. For credentials based authentication, see the <code>credentials</code> configuration below. You can find out more details on the various authentication methods from the article <a href="http://support.temasys.io/support/solutions/articles/
 *   12000002712-authenticating-your-application-key-to-start-a-connection">here</a>. If you are using the Persistent Room feature for scheduled meetings, you will be required to
 *   use credential based authentication. See the <a href="http://support.temasys.io/support/solutions/articles/12000002811-using-the-persistent-room-feature-to-configure-meetings">Persistent Room article
 *   </a> for more information.
 * @property {String} [defaultRoom=appKey] The default Room to connect to when no <code>room</code> parameter
 *    is provided in {@link Skylink#joinRoom} method</a>. When not provided or is provided as an empty string, its value is <code>appKey</code>. Note that switching Rooms is not available when using <code>credentials</code> based authentication.
 *   The Room that User will be connected to is the <code>defaultRoom</code> provided.
 * @property {String} [roomServer] The Auth server for debugging purposes to use. Note that this is a debugging feature and is only used when instructed for debugging purposes.
 * @property {boolean} [enableStatsGathering=true] Configure the anonymous performance and connectivity statistic collection function.
 *   Temasys collects encrypted, anonymous performance and connectivity statistics to allow us to improve performance for our customers and identify regional or ISP specific connectivity issues.
 *   This data does not contain any personal information or session content.
 *   To enable the configuration of this option, you need to enable the "Collect Quality Statistics" option on the Temasys console Website under
 *   App key settings section.
 * @property {boolean} [enableDataChannel=true] The flag if Datachannel connections should be enabled.
 * @property {boolean} [enableTURNServer=true] The flag if TURN ICE servers should
 *   be used when constructing Peer connections to allow TURN connections when required and enabled for the App Key.
 * @property {boolean} [enableSTUNServer=true] The flag if STUN ICE servers should
 *   be used when constructing Peer connections to allow TURN connections when required.
 * @property {boolean} [forceTURN=false] The flag if Peer connections should enforce
 *   connections over the TURN server.
 *   <blockquote>This overrides <code>enableTURNServer</code> value to <code>true</code> and
 *   <code>enableSTUNServer</code> value to <code>false</code>.
 * @property {boolean} [TURNServerTransport] <blockquote class="info">
 *   Note that configuring the protocol may not necessarily result in the desired network transports protocol
 *   used in the actual TURN network traffic as it depends which protocol the browser selects and connects with.
 *   This simply configures the TURN ICE server urls <code?transport=(protocol)</code> query option when constructing
 *   the Peer connection. When all protocols are selected, the ICE servers urls are duplicated with all protocols.
 *   </blockquote> The option to configure the <code>?transport=</code>
 *   query parameter in TURN ICE servers when constructing a Peer connections. When not provided, its value is <code>ANY</code>.
 *   {@link Skylink.TURN_TRANSPORT}
 * @property {JSON} [credentials] <blockquote class="info">
 *   Note that we strongly recommend developers to return the <code>credentials.duration</code>,
 *   <code>credentials.startDateTime</code> and <code>defaultRoom</code> and generate the
 *   <code>credentials.credentials</code> from a web server as secret shouldn't be exposed on client web app as
 *   it poses a security risk itself.</blockquote>
 *   The credentials used for authenticating App Key with
 *   credentials to retrieve the Room session token used for connection in {@link Skylink#joinRoom}.
 *   Note that switching of Rooms is not allowed when using credentials based authentication, unless
 *   <code>init()</code> is invoked again with a different set of credentials followed by invoking
 *   the {@link Skylink#joinRoom}.
 * @property {String} credentials.startDateTime The credentials User session in Room starting DateTime
 *   in <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601 format</a>.
 * @property {number} credentials.duration The credentials User session in Room duration in hours.
 * @property {String} credentials.credentials The generated credentials used to authenticate
 *   the provided App Key with its <code>"secret"</code> property.
 *   <blockquote class="details"><h5>To generate the credentials:</h5><ol>
 *   <li>Concatenate a string that consists of the Room name you provide in the <code>defaultRoom</code>,
 *   the <code>credentials.duration</code> and the <code>credentials.startDateTime</code>.
 *   Example: <code>var concatStr = defaultRoom + "_" + duration + "_" + startDateTime;</code></li>
 *   <li>Hash the concatenated string with the App Key <code>"secret"</code> property using
 *   <a href="https://en.wikipedia.org/wiki/SHA-1">SHA-1</a>.
 *   Example: <code>var hash = CryptoJS.HmacSHA1(concatStr, appKeySecret);</code>
 *   See the <a href="https://code.google.com/p/crypto-js/#HMAC"><code>CryptoJS.HmacSHA1</code> library</a>.</li>
 *   <li>Encode the hashed string using <a href="https://en.wikipedia.org/wiki/Base64">base64</a>
 *   Example: <code>var b64Str = hash.toString(CryptoJS.enc.Base64);</code>
 *   See the <a href="https://code.google.com/p/crypto-js/#The_Cipher_Output">CryptoJS.enc.Base64</a> library</a>.</li>
 *   <li>Encode the base64 encoded string to replace special characters using UTF-8 encoding.
 *   Example: <code>var credentials = encodeURIComponent(base64String);</code>
 *   See <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/
 * Global_Objects/encodeURIComponent">encodeURIComponent() API</a>.</li></ol></blockquote>
 * @property {boolean} [audioFallback=false] The flag if {@link Skylink#getUserMedia} should fallback to retrieve only audio Stream when
 *   retrieving audio and video Stream fails.
 * @property {boolean} [forceSSL=true] The flag if HTTPS connections should be enforced
 *   during request to Auth server and socket connections to Signaling server
 *   when accessing <code>window.location.protocol</code> value is <code>"http:"</code>.
 *   By default, <code>"https:"</code> protocol connections uses HTTPS connections.
 * @property {number} [socketTimeout=7000] The timeout for each attempts for socket connection
 *   with the Signaling server to indicate that connection has timed out and has failed to establish.
 *   Note that the minimum timeout value is <code>5000</code>. If less, this value will be <code>5000</code>.
 *   Note that it is recommended to use <code>7000</code> as the lowest timeout value if Peers are connecting
 *   using Polling transports to prevent connection errors.
 * @property {boolean} [forceTURNSSL=false] The flag if TURNS protocol should be used when <code>enableTURNServer</code> is enabled.
 * <blockquote class="info">
 *   Note that currently Firefox does not support the TURNS protocol, and that if TURNS is required,
 *   TURN ICE servers using port <code>443</code> will be used instead.
 * @property {String|Array} [iceServer] The ICE servers for debugging purposes to use.
 *   - When defined as string, the value is considered as <code>[iceServer]</code>.
 *   Note that this is a debugging feature and is only used when instructed for debugging purposes.
 * @property {String} [iceServer.#index] The ICE server url for debugging purposes to use.
 * @property {String|JSON} [socketServer] The Signaling server for debugging purposes to use.
 *   - When defined as string, the value is considered as <code>{ url: socketServer }</code>.
 *   Note that this is a debugging feature and is only used when instructed for debugging purposes.
 * @property {String} socketServer.url The Signaling server URL for debugging purposes to use.
 * @property {Array} [socketServer.ports] The list of Signaling server ports for debugging purposes to use.
 *   If not defined, it will use the default list of ports specified.
 * @property {number} socketServer.ports.#index The Signaling server port to fallback and use for debugging purposes.
 * @property {String} [socketServer.protocol] The Signaling server protocol for debugging purposes to use.
 *   If not defined, it will use the default protocol specified.
 * @property {boolean} [beSilentOnStatsLogs=false] The flag if all logs triggered by the statistics module should be silent.
 * @property {boolean} [beSilentOnParseLogs=false] The flag if media and codec parsing logs should be silent.
 * @property {String} [statsInterval=20] The frequency of posting stats logs in seconds.
 */

/**
 * The Room session configuration options.
 * @public
 * @typedef {Object} joinRoomOptions
 * @property {String} [roomName] The Room name. When not provided or is provided as an empty string, its value is the <code>defaultRoom</code>
 *   provided in the {@link initOptions}.
 *   Note that if you are using credentials based authentication, you cannot switch the Room
 *   that is not the same as the <code>defaultRoom</code> defined in {@link initOptions}.
 * @property {JSON|String} [userData] The User custom data.
 *   This can be set after Room session has started using the
 *   {@link Skylink#setUserData}.
 * @property {boolean} [useExactConstraints] The {@link Skylink#getUserMedia} <code>useExactConstraints</code> parameter settings.
 *   See the <code>useExactConstraints</code> parameter in the
 *   {@link Skylink#getUserMedia} for more information.
 * @property {boolean|JSON} [audio] The {@link Skylink#getUserMedia} <code>audio</code> parameter settings.
 *   When value is defined as <code>true</code> or an object, {@link Skylink#getUserMedia} to be invoked to retrieve new Stream. If
 *   <code>video</code> is not defined, it will be defined as <code>false</code>.
 *   Object signature matches the <code>audio</code> parameter in the
 *   {@link Skylink#getUserMedia}.
 * @property {boolean|JSON} [video] The {@link Skylink#getUserMedia} <code>video</code> parameter settings.
 *   When value is defined as <code>true</code> or an object, {@link Skylink#getUserMedia} to be invoked to retrieve new Stream. If
 *   <code>audio</code> is not defined, it will be defined as <code>false</code>.
 *   Object signature matches the <code>video</code> parameter in the
 *   {@link Skylink#getUserMedia}.
 * @property {boolean} [voiceActivityDetection=true] The flag if voice activity detection should be enabled.
 *   This can only be toggled if User is and for the offerer, which is determined if User's
 *   <code>peerInfo.config.priorityWeight</code> is higher than Peer's.
 * @property {JSON} [bandwidth] The configuration to set the maximum streaming bandwidth to send to Peers. You can also use the preconfigured
 *   constant <code>VIDEO_QUALITY</code> for recommended values.
 * <blockquote class="info">Note that this is currently not supported
 *   with Firefox browsers versions 48 and below as noted in an existing
 *   <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=976521#c21">bugzilla ticket here</a>. This option will override the <code>autoBandwidthAdjustment</code> option below.</blockquote>
 * @property {number} [bandwidth.audio] The maximum audio streaming bandwidth sent to Peers in kbps.
 *   Recommended values are <code>50</code> to <code>200</code>. <code>50</code> is sufficient enough for
 *   an audio call. The higher you go if you want clearer audio and to be able to hear music streaming.
 * @property {number} [bandwidth.video] The maximum video streaming bandwidth sent to Peers.
 *   Recommended values are <code>256</code>-<code>500</code> for 180p quality,
 *   <code>500</code>-<code>1024</code> for 360p quality, <code>1024</code>-<code>2048</code> for 720p quality
 *   and <code>2048</code>-<code>4096</code> for 1080p quality.
 * @property {number} [bandwidth.data] The maximum data streaming bandwidth sent to Peers.
 *   This affects the P2P messaging in {@link Skylink#sendP2PMessage},
 *   and data transfers in {@link Skylink#sendBlobData} and {@link Skylink#sendURLData}.
 * @property {boolean|JSON} [autoBandwidthAdjustment=false] The flag if Peer connections uploading and downloading bandwidth should be automatically adjusted
 *   each time based on a specified interval.
 * <blockquote class="info">
 *   This feature is also only available for non-MCU enabled Peer connections. Note this will cause the peer connection to restart. If <code>bandwidth</code> option is set above, autoBandwidthAdjustment will not be honoured.
 *   </blockquote>
 * @property {number} [autoBandwidthAdjustment.interval=10] The interval each time to adjust bandwidth
 *   connections in seconds.
 *   Note that the minimum value is <code>10</code>.
 * @property {number} [autoBandwidthAdjustment.limitAtPercentage=100] The percentage of the average bandwidth to adjust to.
 *   E.g. <code>avgBandwidth * (limitPercentage / 100)</code>.
 * @property {boolean} [autoBandwidthAdjustment.useUploadBwOnly=false] The flag if average bandwidth computation
 *   should only consist of the upload bandwidth.
 */

/**
 * Structure of the rawApiResponse received from the API server
 * @private
 * @typedef {JSON} RawApiResponse
 * @property {String} offer_constraints - The constraints for the offer
 * @property {String} pc_constraints - The constraints for the Peer Connection
 * @property {String} media_constraints
 * @property {String} apiOwner - The owner of the App Key
 * @property {String} ipSigserver - The signaling server URL
 * @property {boolean} isPrivileged - The value of isPrivileged
 * @property {boolean} autoIntroduce - The value of autoIntroduce
 * @property {number[]} httpPortList - list of http ports
 * @property {number[]} httpsPortList - list of https ports
 * @property {number} portSigserver
 * @property {number} len
 * @property {String} username
 * @property {String} userCred
 * @property {Date} timeStamp
 * @property {Date} start
 * @property {boolean} hasMCU
 * @property {boolean} success
 * @property {boolean} enable_stats_config
 * @property {String} protocol
 * @property {String} roomCred
 * @property {String} room_key
 * @property {String} roomName
 */

/**
 * @private
 * @typedef {Object} filteredIceServers
 * @property {RTCIceServer[]} iceServers - A list of filtered Ice Servers
 */

/**
 * @typedef {Object} getUserMediaOptions - The camera Stream configuration options.
 * <blockquote class="info">
 *   Note that Safari currently does not apply constraints if provided.
 *   </blockquote>
 * @property {boolean} [useExactConstraints=false]
 *   Note that by enabling this flag, exact values will be requested when retrieving camera Stream,
 *   but it does not prevent constraints related errors. By default when not enabled,
 *   expected mandatory maximum values (or optional values for source ID) will requested to prevent constraints related
 *   errors, with an exception for <code>video.frameRate</code> option in Safari and IE (any plugin-enabled) browsers,
 *   where the expected maximum value will not be requested due to the lack of support.
 *   The flag if <code>getUserMedia()</code> should request for camera Stream to match exact requested values of
 *   <code>audio.deviceId</code> and <code>video.deviceId</code>, <code>video.resolution</code>
 *   and <code>video.frameRate</code> when provided.
 * @property {boolean|JSON} [audio=false] The audio configuration options.
 * @property {boolean} [audio.mute=false] The flag if audio tracks should be muted upon receiving them.
 *   Providing the value as <code>false</code> does nothing to <code>peerInfo.mediaStatus.audioMuted</code>,
 *   but when provided as <code>true</code>, this sets the <code>peerInfo.mediaStatus.audioMuted</code> value to
 *   <code>true</code> and mutes any existing screen share audio tracks as well.
 * @property {String} [audio.deviceId]
 *   Note this is currently not supported in Firefox browsers.
 *    The audio track source ID of the device to use.
 *   The list of available audio source ID can be retrieved by the <a href="https://developer.
 * mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices"><code>navigator.mediaDevices.enumerateDevices</code>
 *   API</a>.
 * @property {boolean} [audio.echoCancellation=true]
 *   The echo cancellation functionality may not work and may produce a terrible
 *   feedback. It is recommended to use headphones or other microphone devices rather than the device
 *   in-built microphones. The flag to enable echo cancellation for audio track.
 * @property {boolean|JSON} [video=false] The video configuration options.
 * @property {boolean} [video.mute=false] The flag if video tracks should be muted upon receiving them.
 *   Providing the value as <code>false</code> does nothing to <code>peerInfo.mediaStatus.videoMuted</code>,
 *   but when provided as <code>true</code>, this sets the <code>peerInfo.mediaStatus.videoMuted</code> value to
 *   <code>true</code> and mutes any existing screen share video tracks as well.
 * @property {JSON} [video.resolution] The video resolution.
 *   By default, <a href="#attr_VIDEO_RESOLUTION"><code>VGA</code></a> resolution option
 *   is selected when not provided.
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @property {number|JSON} [video.resolution.width] The video resolution width.
 * - When provided as a number, it is the video resolution width.
 * - When provided as a JSON, it is the <code>navigator.mediaDevices.getUserMedia()</code> <code>.width</code> settings.
 *   Parameters are <code>"ideal"</code> for ideal resolution width, <code>"exact"</code> for exact video resolution width,
 *   <code>"min"</code> for min video resolution width and <code>"max"</code> for max video resolution width.
 *   Note that this may result in constraints related errors depending on the browser/hardware supports.
 * @property {number|JSON} [video.resolution.height] The video resolution height.
 * - When provided as a number, it is the video resolution height.
 * - When provided as a JSON, it is the <code>navigator.mediaDevices.getUserMedia()</code> <code>.height</code> settings.
 *   Parameters are <code>"ideal"</code> for ideal video resolution height, <code>"exact"</code> for exact video resolution height,
 *   <code>"min"</code> for min video resolution height and <code>"max"</code> for max video resolution height.
 *   Note that this may result in constraints related errors depending on the browser/hardware supports.
 * @property {number|JSON} [video.frameRate] The video <a href="https://en.wikipedia.org/wiki/Frame_rate">
 *   frameRate</a> per second (fps).
 * - When provided as a number, it is the video framerate.
 * - When provided as a JSON, it is the <code>navigator.mediaDevices.getUserMedia()</code> <code>.frameRate</code> settings.
 *   Parameters are <code>"ideal"</code> for ideal video framerate, <code>"exact"</code> for exact video framerate,
 *   <code>"min"</code> for min video framerate and <code>"max"</code> for max video framerate.
 *   Note that this may result in constraints related errors depending on the browser/hardware supports.
 * @property {String} [video.deviceId]
 *   Note this is currently not supported in Firefox browsers.
 *   The video track source ID of the device to use.
 *   The list of available video source ID can be retrieved by the <a href="https://developer.
 * mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices"><code>navigator.mediaDevices.enumerateDevices</code>
 *   API</a>.
 * @property {String|JSON} [video.facingMode] The video camera facing mode.
 *   The list of available video source ID can be retrieved by the <a href="https://developer.mozilla.org
 *   /en-US/docs/Web/API/MediaTrackConstraints/facingMode">MediaTrackConstraints <code>facingMode</code> API</a>.
 */

/**
 * @typedef {Object} getDisplayMediaOptions - The screen Stream configuration options.
 *  * <blockquote class="info">
 *   Note that Safari currently does not apply constraints if provided.
 *   </blockquote>
 *  * @property {boolean} [useExactConstraints=false]
 *   Note that by enabling this flag, exact values will be requested when retrieving screen Stream,
 *   but it does not prevent constraints related errors. By default when not enabled,
 *   expected mandatory maximum values (or optional values for source ID) will requested to prevent constraints related
 *   errors where the expected maximum value will not be requested due to the lack of support.
 *   The flag if <code>shareScreen()</code> should request for screen Stream to match exact requested values of
 *   <code>video.deviceId</code>, <code>video.resolution</code>
 *   and <code>video.frameRate</code> when provided.
 * @property {boolean|JSON} [video=true] The video configuration options.
 * @property {JSON} [video.resolution] The video resolution.
 *   By default, <a href="#attr_VIDEO_RESOLUTION"><code>VGA</code></a> resolution option
 *   is selected when not provided.
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @property {number|JSON} [video.resolution.width] The video resolution width.
 * - When provided as a number, it is the video resolution width.
 * - When provided as a JSON, it is the <code>navigator.mediaDevices.getUserMedia()</code> <code>.width</code> settings.
 *   Parameters are <code>"ideal"</code> for ideal resolution width, <code>"exact"</code> for exact video resolution width,
 *   <code>"min"</code> for min video resolution width and <code>"max"</code> for max video resolution width.
 *   Note that this may result in constraints related errors depending on the browser/hardware supports.
 * @property {number|JSON} [video.resolution.height] The video resolution height.
 * - When provided as a number, it is the video resolution height.
 * - When provided as a JSON, it is the <code>navigator.mediaDevices.getUserMedia()</code> <code>.height</code> settings.
 *   Parameters are <code>"ideal"</code> for ideal video resolution height, <code>"exact"</code> for exact video resolution height,
 *   <code>"min"</code> for min video resolution height and <code>"max"</code> for max video resolution height.
 *   Note that this may result in constraints related errors depending on the browser/hardware supports.
 * @property {number|JSON} [video.frameRate] The video <a href="https://en.wikipedia.org/wiki/Frame_rate">
 *   frameRate</a> per second (fps).
 * - When provided as a number, it is the video framerate.
 * - When provided as a JSON, it is the <code>navigator.mediaDevices.getUserMedia()</code> <code>.frameRate</code> settings.
 *   Parameters are <code>"ideal"</code> for ideal video framerate, <code>"exact"</code> for exact video framerate,
 *   <code>"min"</code> for min video framerate and <code>"max"</code> for max video framerate.
 *   Note that this may result in constraints related errors depending on the browser/hardware supports.
 * @property {String} [video.deviceId]
 *   Note this is currently not supported in Firefox browsers.
 *    The video track source ID of the device to use.
 *   The list of available video source ID can be retrieved by the <a href="https://developer.
 * mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices"><code>navigator.mediaDevices.enumerateDevices</code>
 *   API</a>.
 */

/**
 * @typedef peerInfo - The Peer session information.
 * @property {JSON|String} userData - The Peer current custom data.
 * @property {customSettings} settings - The Peer sending stream settings.
 * @property {JSON} agent The Peer agent information.
 * @property {String} agent.name The Peer agent name.
 *   Data may be accessing browser or non-Web SDK name.
 * @property {number} agent.version The Peer agent version.
 *   Data may be accessing browser or non-Web SDK version. If the original value is <code>"0.9.6.1"</code>,
 *   it will be interpreted as <code>0.90601</code> where <code>0</code> helps to separate the minor dots.
 * @property {String} [agent.os] - The Peer platform name.
 *  Data may be accessing OS platform version from Web SDK.
 * @property {String} [agent.pluginVersion] - The Peer Temasys Plugin version.
 *  Defined only when Peer is using the Temasys Plugin (IE / Safari).
 * @property {String} agent.DTProtocolVersion The Peer data transfer (DT) protocol version.
 * @property {String} agent.SMProtocolVersion The Peer signaling message (SM) protocol version.
 * @property {roomInfo} room The Room Peer is from.
 * @property {JSON} config The Peer connection configuration.
 * @property {boolean} config.enableDataChannel The flag if Datachannel connections would be enabled for Peer.
 * @property {boolean} config.enableIceRestart The flag if Peer connection has ICE connection restart support.
 *   Note that ICE connection restart support is not honoured for MCU enabled Peer connection.
 * @property {number} config.priorityWeight The flag if Peer or User should be the offerer.
 *   If User's <code>priorityWeight</code> is higher than Peer's, User is the offerer, else Peer is.
 *   However for the case where the MCU is connected, User will always be the offerer.
 */

/**
 * @typedef {Object} statistics - The Peer connection current statistics.
 * Defined only when <code>state</code> payload is <code>RETRIEVE_SUCCESS</code>.
 * @property {String} peerId - The peer to which the statistics belong to
 * @property {JSON} statistics.raw The Peer connection raw statistics.before parsing.
 * @property {audioStats} statistics.audio The Peer connection audio streaming statistics.
 * @property {videoStats} statistics.video The Peer connection video streaming statistics.
 * @property {JSON} statistics.selectedCandidatePair The Peer connection selected ICE candidate pair statistics.
 * @property {JSON} statistics.selectedCandidatePair.local The Peer connection selected local ICE candidate.
 * @property {String} statistics.selectedCandidatePair.local.ipAddress The Peer connection selected
 *   local ICE candidate IP address.
 * @property {Number} statistics.selectedCandidatePair.local.portNumber The Peer connection selected
 *   local ICE candidate port number.
 * @property {String} statistics.selectedCandidatePair.local.transport The Peer connection selected
 *   local ICE candidate IP transport type.
 * @property {String} statistics.selectedCandidatePair.local.candidateType The Peer connection selected
 *   local ICE candidate type.
 * @property {String} [statistics.selectedCandidatePair.local.turnMediaTransport] - The Peer connection possible
 *   transport used when relaying local media to TURN server.
 *   Types are <code>"UDP"</code> (UDP connections), <code>"TCP"</code> (TCP connections) and
 *   <code>"TCP/TLS"</code> (TCP over TLS connections).
 * @property {JSON} statistics.selectedCandidatePair.remote The Peer connection selected remote ICE candidate.
 * @property {String} statistics.selectedCandidatePair.remote.ipAddress The Peer connection selected
 *   remote ICE candidate IP address.
 * @property {Number} statistics.selectedCandidatePair.remote.portNumber The Peer connection selected
 *   remote ICE candidate port number.
 * @property {String} statistics.selectedCandidatePair.remote.transport The Peer connection selected
 *   remote ICE candidate IP transport type.
 * @property {String} statistics.selectedCandidatePair.remote.candidateType The Peer connection selected
 *   remote ICE candidate type.
 * @property {boolean} [statistics.selectedCandidatePair.writable] - The flag if Peer has gotten ACK to an ICE request.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {String} [statistics.selectedCandidatePair.roundTripTime] - The current STUN connectivity checks RTT (Round-trip delay time).
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {String} [statistics.selectedCandidatePair.totalRoundTripTime] - The total STUN connectivity checks RTT (Round-trip delay time).
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {JSON} statistics.selectedCandidatePair.requests The ICE connectivity check requests.
 * @property {String} [statistics.selectedCandidatePair.requests.received] - The current ICE connectivity check requests received.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {String} [statistics.selectedCandidatePair.requests.sent] - The current ICE connectivity check requests sent.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {String} [statistics.selectedCandidatePair.requests.totalReceived] - The total ICE connectivity check requests received.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {String} [statistics.selectedCandidatePair.requests.totalSent] - The total ICE connectivity check requests sent.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {JSON} statistics.selectedCandidatePair.responses The ICE connectivity check responses.
 * @property {String} [statistics.selectedCandidatePair.responses.received] - The current ICE connectivity check responses received.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {String} [statistics.selectedCandidatePair.responses.sent] - The current ICE connectivity check responses sent.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {String} [statistics.selectedCandidatePair.responses.totalReceived] - The total ICE connectivity check responses received.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {String} [statistics.selectedCandidatePair.responses.totalSent] - The total ICE connectivity check responses sent.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {JSON} statistics.selectedCandidatePair.consentRequests The current ICE consent requests.
 * @property {String} [statistics.selectedCandidatePair.consentRequests.sent] - The current ICE consent requests sent.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {String} [statistics.selectedCandidatePair.consentRequests.totalSent] - The total ICE consent requests sent.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.


 * @property {JSON} statistics.certificate The Peer connection DTLS/SRTP exchanged certificates information.
 * @property {JSON} statistics.certificate.local The Peer connection local certificate information.
 * @property {String} [statistics.certificate.local.fingerprint] - The Peer connection local certificate fingerprint.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {String} [statistics.certificate.local.fingerprintAlgorithm] - The Peer connection local
 *   certificate fingerprint algorithm.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {String} [statistics.certificate.local.derBase64] - The Peer connection local
 *   base64 certificate in binary DER format encoded in base64.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {JSON} statistics.certificate.remote The Peer connection remote certificate information.
 * @property {String} [statistics.certificate.remote.fingerprint] - The Peer connection remote certificate fingerprint.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {String} [statistics.certificate.remote.fingerprintAlgorithm] - The Peer connection remote
 *   certificate fingerprint algorithm.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {String} [statistics.certificate.remote.derBase64] - The Peer connection remote
 *   base64 certificate in binary DER format encoded in base64.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {String} [statistics.certificate.srtpCipher] - The certificates SRTP cipher.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {String} [statistics.certificate.dtlsCipher] - The certificates DTLS cipher.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {String} [statistics.certificate.tlsVersion] - The certificates DTLS TLS Version agreed.
 *   Defined as <code>null</code> if it's not available in original raw statistics.before parsing.
 * @property {JSON} statistics.connection The Peer connection object statistics.
 * @property {String} statistics.connection.iceConnectionState The Peer connection ICE connection state.
 * @property {String} statistics.connection.iceGatheringState The Peer connection ICE gathering state.
 * @property {String} statistics.connection.signalingState The Peer connection signaling state.
 * @property {JSON} statistics.connection.localDescription The Peer connection local session description.
 * @property {String} statistics.connection.localDescription.type The Peer connection local session description type.
 *   Defined as <code>null</code> when local session description is not available.
 * @property {String} statistics.connection.localDescription.sdp The Peer connection local session description SDP.
 *   Defined as <code>null</code> when local session description is not available.
 * @property {JSON} statistics.connection.remoteDescription The Peer connection remote session description.
 * @property {String} statistics.connection.remoteDescription.type The Peer connection remote session description type.
 *   Defined as <code>null</code> when remote session description is not available.
 * @property {String} statistics.connection.remoteDescription.sdp The Peer connection remote session description sdp.
 *   Defined as <code>null</code> when remote session description is not available.
 * @property {JSON} statistics.connection.candidates The Peer connection list of ICE candidates sent or received.
 * @property {JSON} statistics.connection.candidates.sending The Peer connection list of local ICE candidates sent.
 * @property {Array} statistics.connection.candidates.sending.host The Peer connection list of local
 *   <code>"host"</code> (local network) ICE candidates sent.
 * @property {JSON} statistics.connection.candidates.sending.host.#index The Peer connection local
 *   <code>"host"</code> (local network) ICE candidate.
 * @property {String} statistics.connection.candidates.sending.host.#index.candidate The Peer connection local
 *   <code>"host"</code> (local network) ICE candidate connection description.
 * @property {String} statistics.connection.candidates.sending.host.#index.sdpMid The Peer connection local
 *   <code>"host"</code> (local network) ICE candidate identifier based on the local session description.
 * @property {Number} statistics.connection.candidates.sending.host.#index.sdpMLineIndex The Peer connection local
 *   <code>"host"</code> (local network) ICE candidate media description index (starting from <code>0</code>)
 *   based on the local session description.
 * @property {Array} statistics.connection.candidates.sending.srflx The Peer connection list of local
 *   <code>"srflx"</code> (STUN) ICE candidates sent.
 * @property {JSON} statistics.connection.candidates.sending.srflx.#index The Peer connection local
 *   <code>"srflx"</code> (STUN) ICE candidate.
 * @property {String} statistics.connection.candidates.sending.srflx.#index.candidate The Peer connection local
 *   <code>"srflx"</code> (STUN) ICE candidate connection description.
 * @property {String} statistics.connection.candidates.sending.srflx.#index.sdpMid The Peer connection local
 *   <code>"srflx"</code> (STUN) ICE candidate identifier based on the local session description.
 * @property {Number} statistics.connection.candidates.sending.srflx.#index.sdpMLineIndex The Peer connection local
 *   <code>"srflx"</code> (STUN) ICE candidate media description index (starting from <code>0</code>)
 *   based on the local session description.
 * @property {Array} statistics.connection.candidates.sending.relay The Peer connection list of local
 *   <code>"relay"</code> (TURN) candidates sent.
 * @property {JSON} statistics.connection.candidates.sending.relay.#index The Peer connection local
 *   <code>"relay"</code> (TURN) ICE candidate.
 * @property {String} statistics.connection.candidates.sending.relay.#index.candidate The Peer connection local
 *   <code>"relay"</code> (TURN) ICE candidate connection description.
 * @property {String} statistics.connection.candidates.sending.relay.#index.sdpMid The Peer connection local
 *   <code>"relay"</code> (TURN) ICE candidate identifier based on the local session description.
 * @property {Number} statistics.connection.candidates.sending.relay.#index.sdpMLineIndex The Peer connection local
 *   <code>"relay"</code> (TURN) ICE candidate media description index (starting from <code>0</code>)
 *   based on the local session description.
 * @property {JSON} statistics.connection.candidates.receiving The Peer connection list of remote ICE candidates received.
 * @property {Array} statistics.connection.candidates.receiving.host The Peer connection list of remote
 *   <code>"host"</code> (local network) ICE candidates received.
 * @property {JSON} statistics.connection.candidates.receiving.host.#index The Peer connection remote
 *   <code>"host"</code> (local network) ICE candidate.
 * @property {String} statistics.connection.candidates.receiving.host.#index.candidate The Peer connection remote
 *   <code>"host"</code> (local network) ICE candidate connection description.
 * @property {String} statistics.connection.candidates.receiving.host.#index.sdpMid The Peer connection remote
 *   <code>"host"</code> (local network) ICE candidate identifier based on the remote session description.
 * @property {Number} statistics.connection.candidates.receiving.host.#index.sdpMLineIndex The Peer connection remote
 *   <code>"host"</code> (local network) ICE candidate media description index (starting from <code>0</code>)
 *   based on the remote session description.
 * @property {Array} statistics.connection.candidates.receiving.srflx The Peer connection list of remote
 *   <code>"srflx"</code> (STUN) ICE candidates received.
 * @property {JSON} statistics.connection.candidates.receiving.srflx.#index The Peer connection remote
 *   <code>"srflx"</code> (STUN) ICE candidate.
 * @property {String} statistics.connection.candidates.receiving.srflx.#index.candidate The Peer connection remote
 *   <code>"srflx"</code> (STUN) ICE candidate connection description.
 * @property {String} statistics.connection.candidates.receiving.srflx.#index.sdpMid The Peer connection remote
 *   <code>"srflx"</code> (STUN) ICE candidate identifier based on the remote session description.
 * @property {Number} statistics.connection.candidates.receiving.srflx.#index.sdpMLineIndex The Peer connection remote
 *   <code>"srflx"</code> (STUN) ICE candidate media description index (starting from <code>0</code>)
 *   based on the remote session description.
 * @property {Array} statistics.connection.candidates.receiving.relay The Peer connection list of remote
 *   <code>"relay"</code> (TURN) ICE candidates received.
 * @property {JSON} statistics.connection.candidates.receiving.relay.#index The Peer connection remote
 *   <code>"relay"</code> (TURN) ICE candidate.
 * @property {String} statistics.connection.candidates.receiving.relay.#index.candidate The Peer connection remote
 *   <code>"relay"</code> (TURN) ICE candidate connection description.
 * @property {String} statistics.connection.candidates.receiving.relay.#index.sdpMid The Peer connection remote
 *   <code>"relay"</code> (TURN) ICE candidate identifier based on the remote session description.
 * @property {Number} statistics.connection.candidates.receiving.relay.#index.sdpMLineIndex The Peer connection remote
 *   <code>"relay"</code> (TURN) ICE candidate media description index (starting from <code>0</code>)
 *   based on the remote session description.
 * @property {JSON} statistics.connection.dataChannels The Peer connection list of Datachannel connections.
 * @property {JSON} statistics.connection.dataChannels.#channelName The Peer connection Datachannel connection statistics.
 * @property {String} statistics.connection.dataChannels.#channelName.label The Peer connection Datachannel connection ID.
 * @property {String} statistics.connection.dataChannels.#channelName.readyState The Peer connection Datachannel connection readyState.
 *   [Rel: Skylink.DATA_CHANNEL_STATE]
 * @property {String} statistics.connection.dataChannels.#channelName.type The Peer connection Datachannel connection type.
 *   [Rel: Skylink.DATA_CHANNEL_TYPE]
 * @property {String} statistics.connection.dataChannels.#channelName.currentTransferId The Peer connection
 *   Datachannel connection current progressing transfer session ID.
 *   Defined as <code>null</code> when there is currently no transfer session progressing on the Datachannel connection.
 * @property {String} statistics.connection.dataChannels.#channelName.currentStreamId The Peer connection
 *   Datachannel connection current data streaming session ID.
 *   Defined as <code>null</code> when there is currently no data streaming session on the Datachannel connection.
 * @property {JSON} statistics.connection.constraints The constraints passed in when constructing the Peer connection object.
 * @property {JSON} statistics.connection.optional The optional constraints passed in when constructing the Peer connection object.
 * @property {JSON} [statistics.connection.sdpConstraints] - The constraints passed in when creating Peer connection offer or answer.
 * @property {Error} error The error object received.
 *   Defined only when <code>state</code> payload is <code>RETRIEVE_ERROR</code>.
*/

/**
 * @typedef {Object} socketSession - The socket connection session information.
 * @property {String} socketSession.serverUrl The socket connection Signaling url used.
 * @property {String} socketSession.transportType The socket connection transport type used.
 * @property {JSON} socketSession.socketOptions The socket connection options.
 * @property {Number} socketSession.attempts The socket connection current reconnection attempts.
 * @property {Number} socketSession.finalAttempts The socket connection current last attempts
 *   for the last available transports and port.
 */

/**
 * @typedef {Object} refreshConnectionResolve
 * @property {Object.<string, Array<String>>} failedRefresh - Array of refresh errors keyed by peer Id.
 * @property {Object.<string, {'customSettings': customSettings, iceRestart: boolean}>} successfulRefresh - List of successfull refreshes keyed by peer Id.
 */

/**
 * @typedef {Object} mediaInfo - An object that represents a media.
 * @property {String} mediaInfo.publisherId
 * @property {String} mediaInfo.mediaId
 * @property {String} mediaInfo.mediaType
 * @property {String} mediaInfo.mediaState
 * @property {String} mediaInfo.transceiverMid
 * @property {String|JSON} mediaInfo.mediaMetaData
 * @property {JSON} mediaInfo.simulcast
 * @property {String} streamId - The stream id associated with the media.
 */

/**
 * @typedef {Array} logItems
 * @property {Date} logItems.0 The DateTime of when the log was stored
 * @property {String} logItems.1 The log level
 * @property {String} logItems.2 The log message
 * @property {Object} logItems.3 The debug object
 */

/**
 * @typedef {Array} MediaStreams
 * @property {MediaStream} MediaStreams.0 Audio stream
 * @property {MediaStream} MediaStreams.1 Video stream
 */

/**
 * @typedef {Object} MediaStream - <a href="https://developer.mozilla.org/en-US/docs/Web/API/MediaStream">MediaStream interface</a>
 */
