/**
 * Handles the utils methods.
 * @class Utils
 * @since 0.7.0
 * @typedef module
 */
var utils = {

	forEach: forEach = function (obj, fn) {
		// Return true to break loop.
	 	// Return Number to increment or decrement loop index (for Array only).
		if (Array.isArray(obj)) {
			var index = 0;

			while (index < obj.length) {
				var action = fn(obj[index], index);
				if (action === true) {
					break;
				} else if (typeof action === 'number') {
					index += action;
				} else {
					index++;
				}
			}

		} else if ((window.RTCStatsReport && obj instanceof RTCStatsReport) || (window.Map && obj instanceof Map)) {
			obj.forEach(function (item) {
				fn(item, item.id);
			});

		} else if (obj && typeof obj === 'object') {
			for (var prop in obj) {
				if (obj.hasOwnProperty(prop)) {
					if (fn(obj[prop], prop) === true) {
						break;
					}
				}
			}
		}
	},

	extendEvents: function (obj) {
		obj._listeners = {
			once: {},
			on: {}
		};

		obj.on = function (eventName, fn) {
			if (typeof fn !== 'function') {
				throw new Error('Please provide a the callback function');
			}

			obj._listeners.on[eventName] = utils.isArray(obj._listeners.on[eventName]) || [];
			obj._listeners.on[eventName].push(fn);
		};

		obj.once = function (eventName, fn, fnCondition, persistent) {
			if (typeof fn !== 'function') {
				throw new Error('Please provide a the callback function');

			} else if (typeof fnCondition === 'boolean') {
				persistent = fnCondition;
			}

			obj._listeners.once[eventName] = utils.isArray(obj._listeners.once[eventName]) || [];
			obj._listeners.once[eventName].push([fn, typeof fnCondition === 'function' ?
				fnCondition : function () { return true; }, persistent === true]);
		};

		obj.off = function (eventName, fn) {
			if (typeof eventName === 'string') {
				if (typeof fn === 'function') {
					var fnOff = function (methodItem) {
						utils.forEach(obj._listeners[methodItem][eventName], function (fnItem, i) {
							if (utils.isArray(fnItem)) {
								if (fnItem === fn) {
									obj._listeners[methodItem][eventName].splice(i, 1);
									return -1;
								}
							} else if (fnItem[0] === fn) {
								obj._listeners[methodItem][eventName].splice(i, 1);
								return -1;
							}
						});
					};

					fnOff('on');
					fnOff('once');
				
				} else {
					delete obj._listeners.on[eventName];
					delete obj._listeners.once[eventName];
				}
			
			} else {
				utils.forEach('on', 'once', function (methodItem) {
					utils.forEach(obj._listeners[methodItem], function (eventNameItem) {
						if (eventNameItem.indexOf('_') !== 0) {
							delete obj._listeners[methodItem][eventNameItem];
						}
					});
				});
			}
		};

		obj._emit = function (eventName) {
			var params = Array.prototype.slice.call(arguments);
			params.shift();

			var fnEmit = function (methodItem, eventNameItem) {
				utils.forEach(obj._listeners[methodItem][eventNameItem], function (fnItem, i) {
					if (utils.isArray(fnItem)) {
						if (fnItem[1].apply(this, params)) {
							fnItem[0].apply(this, params);
							// Emit event always since it is persistent as long as condition is met.
							if (fnItem[2] !== true) {
								obj._listeners[methodItem][eventNameItem].splice(i, 1);
								return 0;
							}
						}
					} else {
						fnItem.apply(this, params);
					}
				});
			};

			fnEmit('on', eventName);
			fnEmit('on', '_' + eventName);
			fnEmit('once', eventName);
			fnEmit('once', '_' + eventName);
		};

		return obj;
	},

	uuid: function () {
		// Follows RFC 4122: https://tools.ietf.org/html/rfc4122
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			/* jshint ignore:start */
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c === 'x' ? r : (r && 0x7 | 0x8)).toString(16);
			/* jshint ignore:end */
		});
		return uuid;
	},

	isArray: function (obj) {
		return Array.isArray(obj) && obj.length > 0 ? obj : null;
	},

	contains: function (list, val) {
		var found = false;
		utils.forEach(list, function (item) {
			if (item === val) {
				found = true;
				return true;
			}
		});
		return found ? val : null;
	},

	isPlugin: function () {
		return AdapterJS && AdapterJS.WebRTCPlugin && AdapterJS.WebRTCPlugin.plugin;
	},

	getOfferOpts: function (opts) {
		return utils.isPlugin() ? {
			mandatory: {
				OfferToReceiveVideo: opts.video > 0,
				OfferToReceiveAudio: opts.audio > 0
			},
			iceRestart: !!opts.iceRestart,
			voiceActivityDetection: !!opts.voiceActivityDetection
		} : {
			offerToReceiveAudio: opts.audio,
			offerToReceiveVideo: opts.video,
			iceRestart: !!opts.iceRestart,
			voiceActivityDetection: !!opts.voiceActivityDetection
		};
	},

	/**
	 * Method to get the list of audio and video device sources.
	 * @method Utils.getDevices
	 * @return {Promise} Returns `(sources)` for success and `(error)` for error.
	 * - Example `sources` signature: `{ audio: { input: [item, item], output: [item] }, video: { input: [item] } }`.
	 *   - Example input `item` signature: `{ deviceId: "xxxx", groupId: "xxxx", label: "Microphone 1" }`.
	 *   - Example output `item` signature: `{ sinkId: "xxxx", groupId: "xxxx", label: "Speaker 1" }`.
	 * @static
	 * @for Utils
	 * @since 0.7.0
	 */
	getDevices: function () {
		return new Promise(function (resolve, reject) {
			if (!(navigator && navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function')) {
				reject(new Error('enumerateDevices() method is not supported'));
				return;

			} else if (!(navigator && typeof navigator.getUserMedia === 'function')) {
				reject(new Error('getUserMedia() method is not supported'));
				return;
			}

			navigator.mediaDevices.enumerateDevices().then(function (sources) {
				var output = {
					audio: {
						input: [],
						output: []
					},
					video: {
						input: []
					}
				};

				utils.forEach(sources, function (item) {
					if (item.kind === 'audioinput') {
						output.audio.input.push({
							deviceId: item.deviceId || item.sourceId || 'default',
							groupId: item.groupId || null,
							label: item.label || 'Audio source ' + (output.audio.input.length + 1)
						});

					} else if (item.kind === 'videoinput') {
						output.video.input.push({
							deviceId: item.deviceId || item.sourceId || 'default',
							groupId: item.groupId || null,
							label: item.label || 'Video source ' + (output.video.input.length + 1)
						});

					} else if (item.kind === 'audiooutput') {
						output.audio.output.push({
							sinkId: item.deviceId || item.sourceId || 'default',
							groupId: item.groupId || null,
							label: item.label || 'Audio output ' + (output.video.input.length + 1)
						});
					}
				});

				resolve(output);
			}, reject);
		});
	},

	/**
	 * Method to get the list of screen sources.
	 * @method Utils.getScreens
	 * @return {Promise} Returns `(sources)` for success and `(error)` for error.
	 * - Example `sources` signature: `{ sources: ["screen", "window"], input: [item] }`.
	 *   - For `sources` items, reference `Constants.Stream.SCREENSHARING_SOURCES` for the list of available values.
	 *   - Example input `item` signature: `{ sourceId: "xxxx", source: "screen", label: "Screen 1" }`.
	 * @static
	 * @for Utils
	 * @since 0.7.0
	 */
	getScreens: function () {
		return new Promise(function (resolve) {
			if (!(navigator && typeof navigator.getUserMedia === 'function')) {
				reject(new Error('getUserMedia() method is not supported'));
				return;
			}

			var output = {
				sources: [],
				input: []
			};

			// For chrome android 59+ has screensharing support behind chrome://flags (needs to be enabled by user)
			// Reference: https://bugs.chromium.org/p/chromium/issues/detail?id=487935
			if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
				if (window.webrtcDetectedBrowser === 'chrome' && window.webrtcDetectedVersion >= 59) {
					output.sources = ['screen']; 
					resolve(output);
				}
				return;
			}

			// Chrome 34+ and Opera 21(?)+ supports screensharing
			// Firefox 38(?)+ supports screensharing
			output.sources = ['window', 'screen'];


			// IE / Safari (plugin) needs commerical screensharing enabled
			// Reference: https://confluence.temasys.com.sg/display/TWT/Screensharing
			if (['IE', 'safari'].indexOf(window.webrtcDetectedBrowser) > -1) {
				// Native Safari 11+ likely do not support screensharing
				AdapterJS.webRTCReady(function () {
					// IE / Safari (plugin) is not available or do not support screensharing
					if (!(AdapterJS.WebRTCPlugin.plugin && AdapterJS.WebRTCPlugin.plugin.isScreensharingAvailable &&
						AdapterJS.WebRTCPlugin.plugin.HasScreensharingFeature)) {
						output.sources = [];
						resolve(output);
						return;
					}

					// NOTE: There is no error callback for this method.
					// Do not provide the error callback as well or it will throw NPError.
					if (typeof AdapterJS.WebRTCPlugin.plugin.getScreensharingSources === 'function') {
						AdapterJS.WebRTCPlugin.plugin.getScreensharingSources(function (sources) {
							utils.forEach(sources, function (item) {
								output.input.push({
									sourceId: item.deviceId || item.sourceId || item.id,
									source: item.kind,
									label: item.label || ''
								});
							});

							resolve(output);
						});
						return;
					}

					resolve(output);
				});
				return;
			}

			// Chrome 52+ and Opera 39+ supports tab and audio
			// Reference: https://developer.chrome.com/extensions/desktopCapture
			if ((window.webrtcDetectedBrowser === 'chrome' && window.webrtcDetectedVersion >= 52) ||
				(window.webrtcDetectedBrowser === 'opera' && window.webrtcDetectedVersion >= 39)) {
				// Remove "audio" as we will manually set it from the new Stream() when ["tab"] and its audio is requested
				output.sources.push('tab');

			// Firefox supports some other sources
			// Reference: http://fluffy.github.io/w3c-screen-share/#screen-based-video-constraints
			// Reference: https://bugzilla.mozilla.org/show_bug.cgi?id=1313758
			// Reference: https://bugzilla.mozilla.org/show_bug.cgi?id=1037405
			// Reference: https://bugzilla.mozilla.org/show_bug.cgi?id=1313758
			} else if (window.webrtcDetectedBrowser === 'firefox') {
				output.sources.push('browser', 'application', 'camera');
			}

			resolve(output);
		});
	},

	/**
	 * Method to check the current available sending bandwidth.
	 * - This retrieves device audio and video stream temporarily to check the speed.
	 * @method Utils.getBandwidth
	 * @param {JSON} opts The options.
	 * @param {Number} opts.startTimeout The number of ms to wait before recording the stats.
	 * - When not provided, the default value is `5000`.
	 * @param {Number} opts.endTimeout The number of ms to wait before ending the recording of the stats after started.
	 * - When not provided, the default value is `7000`.
	 * @param {Number} opts.estimatedPeers The estimated number of peers to connect to.
	 * - When not provided, the default value is `1`.
	 * @return {Promise} Returns `(estimates)` for success and `(error)` for error.
	 * - Example `estimates` signature: `{ audio: 30, video: 400 }`.
	 * @static
	 * @for Utils
	 * @since 0.7.0
	 */
	getBandwidth: function (opts) {
		return new Promise(function (resolve, reject) {
			if (window.webrtcDetectedBrowser === 'edge') {
				reject(new Error('Unable to getStats() in Edge browsers'));
				return;

			} else if (!window.RTCPeerConnection) {
				reject(new Error('RTCPeerConnection is not supported'));
				return;

			} else if (!(navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function')) {
				reject(new Error('enumerateDevices() is not supported'));
				return;

			} else if (typeof navigator.getUserMedia !== 'function') {
				reject(new Error('getUserMedia() is not supported'));
				return;
			}

			var rtcConstraints = [{
				iceServers: [{
					urls: ['stun:turn.temasys.io']
				}]
			}, {
				optional: [
					{ DtlsSrtpKeyAgreement: true },
					{ googIPv6: true },
					{ googCpuOveruseDetection: true },
					{ googDscp: true }
				]
			}];
			var inputOpts = (typeof opts === 'object' && opts) || {};
			var sender = new RTCPeerConnection(rtcConstraints[0], rtcConstraints[1]);
			var receiver = new RTCPeerConnection(rtcConstraints[0], rtcConstraints[1]);
			var stats = null;
			var senderStream = null;
			var terminated = false;

			if (typeof sender.getStats !== 'function') {
				reject(new Error('getStats() is not supported'));
				return;
			}

			sender.onicecandidate = function (evt) {
				if (evt.candidate) {
					receiver.addIceCandidate(evt.candidate);
				}
			};

			receiver.onicecandidate = function (evt) {
				if (evt.candidate) {
					sender.addIceCandidate(evt.candidate);
				}
			};

			sender.oniceconnectionstatechange = function () {
				if (terminated) {
					return;

				} else if (sender.iceConnectionState === 'failed') {
					terminated = true;
					reject(new Error('Failed connecting'));

				} else if (['completed', 'connected'].indexOf(sender.iceConnectionState) > -1 && !stats) {
					stats = {
						start: { bytes: 0, timestamp: 0 },
						end: { bytes: 0, timestamp: 0 }
					};

					var fnParseStats = function (target, data) {
						utils.forEach(data, function (item, prop) {
							if (window.webrtcDetectedBrowser === 'firefox') {
								if (prop.indexOf('outbound_rtp') === 0 || prop.indexOf('outbound_rtcp') === 0) {
									stats[target].timestamp = item.timestamp;
									stats[target].bytes += item.bytesSent || 0;
								}

							} else if ((prop.indexOf('ssrc_') === 0 && prop.indexOf('_send') > 0) ||
								prop.indexOf('RTCOutboundRTP') === 0 || prop.indexOf('RTCOutboundRTCP') === 0) {
								stats[target].timestamp = item.timestamp;
								stats[target].bytes += parseInt(item.bytesSent || '0', 10);
							}
						});
					};

					setTimeout(function () {
						if (terminated) {
							return;
						}

						sender.getStats(null, function (dataStart) {
							if (terminated) {
								return;
							}

							fnParseStats('start', dataStart);
						
							setTimeout(function () {
								if (terminated) {
									return;
								}

								sender.getStats(null, function (dataEnd) {
									if (terminated) {
										return;
									}

									terminated = true;
									fnParseStats('end', dataEnd);

									try {
										sender.close();
										receiver.close();
										senderStream.getTracks().forEach(function (track) {
											track.stop();
										});

									} catch (error) {
										try {
											senderStream.stop();
										} catch (stopError) {
										}
									}

									var totalBitrate = (
										((stats.end.bytes - stats.start.bytes) / (stats.end.timestamp - stats.start.timestamp)) /
										(typeof inputOpts.estimatedPeers === 'number' ? inputOpts.estimatedPeers : 1)) * 8;

									resolve({
										audio: parseInt((totalBitrate * 0.05).toFixed(0), 10),
										video: parseInt((totalBitrate * 0.95).toFixed(0), 10)
									});

								}, function (error) {
									terminated = true;
									reject(error);
								});
							}, typeof inputOpts.endTimeout === 'number' ? inputOpts.endTimeout : 7000);

						}, function (error) {
							terminated = true;
							reject(error);
						});
					}, typeof inputOpts.startTimeout === 'number' ? inputOpts.startTimeout : 5000);
				}
			};

			utils.getDevices().then(function (devices) {
				var constraints = {
					audio: devices.audio.input.length > 0,
					video: devices.video.input.length > 0
				};

				// Prevent popup from triggering
				if (window.webrtcDetectedBrowser === 'firefox') {
					constraints.fake = true;
				}

				navigator.getUserMedia(constraints, function (stream) {
					senderStream = stream;

					sender.addStream(senderStream);
					sender.createOffer(function (offer) {
						sender.setLocalDescription(offer, function () {
							receiver.setRemoteDescription(offer, function () {
								receiver.createAnswer(function (answer) {
									receiver.setLocalDescription(answer, function () {
										sender.setRemoteDescription(answer, function () {}, reject);
									}, reject);
								}, reject);
							}, reject);
						}, reject);
					}, reject, utils.getOfferOpts({	audio: 1,	video: 1 }));
				}, reject);

			}).catch(reject);
		});
	},

	/**
	 * Method to get current browser supports.
	 * @method Utils.getSupports
	 * @return {Promise} Returns `(supports)` for success and `(error)` for error.
	 * - Example `supports` signature: `{ agent: (agent), connection: (connection), settings: (settings),
	 *   iceRestart: false, devices: true, audioAnaylser: false }`.
	 *   - Example `agent` signature: `{ name: "chrome", version: 58, platform: "MacIntel", plugin: (plugin) }`.
	 *   - Example `agent.plugin` signature (defined only when Temasys plugin is used):
	 * 		 `{ company: "xx", version: "0.8.890", active: true, expired: false, expirationDate: null,
	 *     whiteList: (whiteList), features: (features) }`.
	 *   - Example `agent.plugin.whiteList` signature (defined only when whitelisting is enabled):
	 *     `{ enabled: true, restrictsUsage: false, restrictsFeatures: false }`.
	 *   - Example `agent.plugin.features` signature: `{ autoUpdate: false, crashReporter: false,
   *     noPermissionPopup: false, screensharing: false, experimentalAEC: false, h264: false, httpProxy: false }`
   *   - Example `connection` signature (defined only when WebRTC connection is supported):
	 *     `{ datachannel: (datachannel), codecs: { audio: { opus: ["8000/2"] }, video: { h264: ["48000"] } },
	 *     settings: (settings), iceRestart: true, bandwidth: { audio: true, video: true, datachannel: true }`.
	 *   - Example `connection.datachannel` signature (defined only when datachannel is supported):
	 *     `{ binaryType: { arrayBuffer: true, string: true, blob: false, int8Array: false } }`.
	 *   - Example `connection.settings` signature: `{ voiceActivityDetection: true, remb: true,
	 *     ulpfec: false, red: false, rtx: false }`.
	 * @static
	 * @for Utils
	 * @since 0.7.0
	 */
	getSupports: function () {
		return new Promise(function (resolve, reject) {
			AdapterJS.webRTCReady(function () {
				var output = {
					connection: !!window.RTCPeerConnection ? {
						datachannel: window.webrtcDetectedBrowser !== 'edge' ? {
							binaryType: {
								arrayBuffer: ['chrome', 'opera', 'safari'].indexOf(window.webrtcDetectedBrowser) > -1 && !utils.isPlugin(),
								string: true,
								blob: window.webrtcDetectedBrowser === 'firefox',
								int8Array: !!utils.isPlugin()
							},
						} : null,
						codecs: {
							audio: {
								opus: [],
								g722: [],
								pcmu: [],
								pcma: [],
								ilbc: [],
								isac: []
							},
							video: {
								vp8: [],
								vp9: [],
								h264: []
							}
						},
						settings: {
							voiceActivityDetection: true,
							remb: !((window.webrtcDetectedBrowser === 'firefox' && window.webrtcDetectedVersion < 49) ||
								window.webrtcDetectedBrowser === 'edge'),
							ulpfec: false,
							red: false,
							rtx: false
						},
						iceRestart: !(window.webrtcDetectedBrowser === 'firefox' && window.webrtcDetectedVersion < 48),
						bandwidth: {
							audio: ['edge', 'firefox'].indexOf(window.webrtcDetectedBrowser) > -1,
							video: !(window.webrtcDetectedBrowser === 'firefox' && window.webrtcDetectedBrowser < 49),
							datachannel: ['edge', 'firefox'].indexOf(window.webrtcDetectedBrowser) > -1
						}
					} : null,
					agent: {
						name: window.webrtcDetectedBrowser || 'unknown',
						version: window.webrtcDetectedVersion || 0,
						platform: navigator.platform,
						plugin: null
					},
					stream: typeof navigator.getUserMedia && typeof navigator.getUserMedia === 'function',
					devices: navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function',
					audioAnalyser: !!window.AudioContext
				};

				// Parse plugin settings
				if (utils.isPlugin()) {
					var plugin = AdapterJS.WebRTCPlugin.plugin;

					output.audioAnalyser = false;
					output.agent.plugin = {
						company: plugin.COMPANY || null,
						version: plugin.VERSION || null,
						active: false,
						expired: plugin.expirationDate ? plugin.isOutOfDate : false,
						expirationDate: plugin.expirationDate || null,
						whiteList: null,
            features: {
              autoUpdate: false,
              crashReporter: false,
              noPermissionPopup: false,
              screensharing: false,
              experimentalAEC: false,
              h264: false,
              httpProxy: false
            }
					};

					if (!!plugin.HasWhiteListingFeature) {
            output.agent.plugin.whiteList = {
              enabled: !!plugin.isWebsiteWhitelisted,
              restrictsUsage: !!plugin.HasUsageRestrictionToDomains,
              restrictsFeatures: !!plugin.HasFeaturesRestrictedToDomains
            };
          }

          try {
            var pc = new RTCPeerConnection(null);
            output.agent.plugin.active = !!(pc.createOffer !== null &&
              ['object', 'function'].indexOf(typeof pc.createOffer) > -1 &&
              // Check plugin flags "valid" is true, and then check if expired
              plugin.valid && !plugin.isOutOfDate &&
              // Check if plugin has whitelisting feature and has usage restrictions
              // Ensure that plugin <object> element to access the plugin WebRTC API is not not displayed
              plugin.style.display !== 'none' && (output.agent.plugin.whiteList ?
              (output.agent.plugin.whiteList.enabled || !output.agent.plugin.whiteList.restrictsUsage) : true));
            pc.close();

          } catch (error) {}

          if (output.agent.plugin.active && !(output.agent.plugin.whiteList &&
            !output.agent.plugin.whiteList.enabled && output.agent.plugin.restrictsFeatures)) {
            output.agent.plugin.features = {
              autoUpdate: !!plugin.HasAutoupdateFeature,
              crashReporter: !!plugin.HasCrashReporterFeature,
              noPermissionPopup: !!plugin.HasPopupFeature,
              screensharing: !!(plugin.HasScreensharingFeature && plugin.isScreensharingAvailable),
              experimentalAEC: !!plugin.HasExperimentalAEC,
              h264: !!plugin.HasH264Support,
              httpProxy: !!plugin.HasHTTPProxyFeature
            };
          }

					if (!output.agent.plugin.active) {
						output.connection = false;
						output.devices = false;
						output.stream = false;
					}
				}

				if (output.connection) {
					var fnParse = function (codec) {
						if (['audio', 'video'].indexOf(codec.kind) > -1 && codec.name) {
							if (['rtx', 'ulpfec', 'red'].indexOf(codec.name) > -1) {
								output.connection.settings[codec.name] = true;
								return;
							
							// DTMF support
							//} else if (['telephone-event'])
							// Codecs we care about for now
							} else if ((codec.kind === 'video' && ['vp9', 'vp8', 'h264'].indexOf(codec.name) === -1) ||
								(codec.kind === 'audio' && ['opus', 'pcma', 'pcmu', 'g722', 'isac', 'ilbc'].indexOf(codec.name) === -1)) {
								return;
							}

							output.connection.codecs[codec.kind][codec.name].push(codec.clockRate +
								(codec.kind === 'audio' ? '/' + (codec.numChannels || 1) : ''));
						}
					};

					if (typeof window.RTCRtpSender === 'function' && typeof RTCRtpSender.getCapabilities === 'function') {
						utils.forEach(RTCRtpSender.getCapabilities().codecs, function (item, prop) {
							fnParse({
								name: item.name.toLowerCase(),
								kind: item.kind,
								clockRate: item.clockRate,
								numChannels: item.numChannels
							});
						});
						resolve(output);
						return;
					}

					var capabilities = new RTCPeerConnection(null);

					if (typeof capabilities.createDataChannel === 'function') {
						capabilities.createDataChannel('test');
					}

					capabilities.createOffer(function (offer) {
						var media = '';

						utils.forEach(offer.sdp.split('\r\n'), function (line) {
							if (line.indexOf('m=') === 0) {
								media = line.split('m=')[1].split(' ')[0];

							} else if (line.indexOf('a=rtpmap:') === 0 && ['audio', 'video'].indexOf(media) > -1) {
								var parts = line.split(' ')[1].split('/');
								fnParse({
									name: parts[0].toLowerCase(),
									kind: media,
									clockRate: parts[1],
									numChannels: parts[2] || 1
								});
							}
						});

						capabilities.close();
						resolve(output);

					}, reject, utils.getOfferOpts({	audio: 1,	video: 1 }));
					return;
				}

				resolve(output);
			});
		});
	},

	/**
	 * Method to configure debugging mode.
	 * @method Utils.setDebugger
	 * @param {JSON} [opts] The options.
	 * 
	 * @return {Promise}
	 * @static
	 * @for Utils
	 * @since 0.7.0
	 */
	setDebugger: function () {
		
	}
};