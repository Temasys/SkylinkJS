/**
 * Handles the stream object.
 * @class Stream
 * @param {JSON|MediaStream} opts The options.
 * - When provided as `MediaStream` object, it is mandatory to have at least `1` audio or video track available,
 *   and the limits are to `1` per audio and video track.
 * - Note that it is mandatory to have audio or video track requested.
 * @param {Boolean} [opts.strict] The flag if stream must contain requested both audio and video tracks
 *   if requested and not audio or video track only instead when not available.
 * - When not provided, the value is `true`.
 * @param {Boolean} [opts.fake] The flag if stream is a "fake" testing stream.
 * - When not provided, the value is `false`.
 * - Note that this currently works only for Firefox browsers, and is useful to prevent browser prompts.
 * @param {JSON|Boolean} opts.audio The audio options.
 * - When not provided, the default value is `false`.
 * - Examples: `true`, `false`, `{ deviceId: null }`.
 * @param {String|JSON} [opts.audio.deviceId] The audio source device input ID to use.
 * - Examples: `"xxxxx"`, `{ idea: "xxxxx" }`.
 * @param {Boolean} [opts.audio.echoCancellation] The flag if echo cancellation (AEC) should be enabled when supported.
 * - When not provided, the default value is `null`.
 * @param {Boolean} [opts.audio.autoGainControl] The flag if auto gain control (AGC) should be enabled when supported.
 * - When not provided, the default value is `null`.
 * @param {Boolean} [opts.audio.noiseSuppression] The flag if noise suppression should be enabled when supported.
 * - When not provided, the default value is `null`.
 * @param {Boolean} [opts.audio.screensharing] The flag if screensharing audio should be used when supported.
 * - When not provided, the default value is `false`.
 * - Note that `opts.video.screensharing.sources` has to be defined with `MEDIA_SOURCE.TAB`, as it is currently
 *   the only available audio source.
 * @param {JSON|Boolean} opts.video The video options.
 * - When not provided, the default value is `false`.
 * - Examples: `true`, `false`, `{ deviceId: null }`.
 * @param {String|JSON} [opts.video.deviceId] The video source device input ID to use.
 * - Examples: `"xxxxx"`, `{ idea: "xxxxx" }`.
 * @param {Number|JSON} [opts.video.width] The video frame width.
 * - Examples: `320` (SVGA), `640` (VGA), `1280` (HD), `1920` (FHD), `{ ideal: 1920 }`, `{ min: 640, max: 1920 }`.
 * @param {Number|JSON} [opts.video.height] The video frame height.
 * - Examples: `160` (SVGA), `480` (VGA), `720` (HD), `1080` (FHD), `{ ideal: 1080 }`, `{ min: 480, max: 1080 }`.
 * @param {Number|JSON} [opts.video.frameRate] The video frame rate (fps).
 * - Examples: `20`, `{ ideal: 30 }`, `{ min: 20, max: 30 }`.
 * @param {String|JSON} [opts.video.facingMode] The video environment facing mode.
 * - Examples: `"user"`, `{ ideal: "environment" }`.
 * - Reference `Constants.Stream.FACING_MODE` for the list of available values.
 * @param {JSON} [opts.video.screensharing] The video screensharing options.
 * - Note that this ignores the `deviceId`, `width`, `height`, `frameRate` and `facingMode` if this is defined.
 * @param {Array} opts.video.screensharing.sources The video screensharing sources.
 * - Examples: `["screen", "window"]`.
 * - Reference `Constants.Stream.SCREENSHARING_SOURCES` for the list of available values.
 * @param {String} [opts.video.screensharing.sourceId] The video screensharing source ID.
 * @constructor
 * @throws Error
 * @typedef class
 * @since 0.7.0
 */
function Stream (opts) {
	var ref = utils.extendEvents(this);

  if (!(opts && typeof opts === 'object' && ((opts.audio || opts.video) || typeof opts.getAudioTracks === 'function'))) {
		throw new Error('Please request audio and/or video tracks');
	}

	/**
	 * The stream ID.
	 * @attribute id
	 * @type String
	 * @readOnly
	 * @for Stream
	 * @since 0.7.0
	 */
	ref.id = null;

	/**
	 * The stream states.
	 * @attribute states
	 * @param {Boolean} active The flag if stream is active.
	 * @param {String} state The state.
	 * - Reference `Constants.Stream.STATE` for the list of available values.
	 * @type JSON
	 * @readOnly
	 * @for Stream
	 * @since 0.7.0
	 */
	ref.states = {
		/**
		 * Event emitted when stream state has changed.
		 * @event state
		 * @param {String} state The state.
		 * - Reference `Constants.Stream.STATE` for the list of available values.
		 * @param {Error} [error] The error.
		 * @for Stream
		 * @since 0.7.0 
		 */
		state: null,
		active: false
	};

	/**
	 * The stream constraints.
	 * @attribute constraints
	 * @param {JSON|Boolean} audio The audio constraints.
	 * @param {JSON|Boolean} video The video constraints.
	 * @param {Boolean} fake The flag if stream is "fake" testing stream.
	 * @type JSON
	 * @readOnly
	 * @for Stream
	 * @since 0.7.0
	 */
	ref.constraints = {
    audio: false,
		video: false,
		fake: opts.fake === true
  };

	/**
	 * The stream tracks settings.
	 * @attribute tracks
	 * @param {StreamTrack} [audio] The audio track.
	 * - When defined as `null`, it means that the current stream does not contain audio track.
	 * @param {StreamTrack} [video] The video track.
	 * - When defined as `null`, it means that the current stream does not contain video track.
	 * @type JSON
	 * @readOnly
	 * @for Stream
	 * @since 0.7.0
	 */
	ref.tracks = {
		audio: null,
		video: null
	};

	// Stores the stream object
	ref._stream = null;
	// Stores the flag if stream has screensharing session
	ref._screensharing = {
		audio: false,
		video: false
	};

	ref._parseVideoOpts(opts);
	ref._parseAudioOpts(opts);

	if (!ref.constraints.audio && !ref.constraints.video) {
		throw new Error('Empty stream with no tracks provided');
	}

	if (typeof opts === 'object' && typeof opts.getAudioTracks === 'function') {
		ref._parseTracks(opts);			
		return;
	}

	if (opts.strict === false) {
		ref._getSources(function (constraints) {
			if (!constraints.audio && !constraints.video) {
				console.error('new Stream(): No available audio or video sources');
				ref.states.state = Constants.Stream.STATE.ERROR;
				ref._emit('state', Constants.Stream.STATE.ERROR, new Error('No available audio or video sources'));
				return;
			}

			if ((ref.constraints.audio && !constraints.audio) || (ref.constraints.video && !constraints.video)) {
				console.log('new Stream(): Fallback to available sources ->', constraints);
				ref.constraints.audio = constraints.audio ? ref.constraints.audio : false;
				ref.constraints.video = constraints.video ? ref.constraints.video : false;

				ref.states.state = Constants.Stream.STATE.FALLBACK;
				ref._emit('state', Constants.Stream.STATE.FALLBACK, new Error('Fallback to available sources: ' + JSON.stringify(constraints)));
			}

			ref._fetch();
		});
		return;
	}

	ref._fetch();
}

/**
 * Method to parse video options (opts.video).
 */
Stream.prototype._parseVideoOpts = function (opts) {
	var ref = this;
	var videoOpts = (typeof opts.video === 'object' && opts.video) || opts.video === true;

	if (typeof opts.getVideoTracks === 'function') {
		if (opts.getVideoTracks().length > 1) {
			throw new Error('Maximum video track length can be provided is 1');
		}
		ref.constraints.video = opts.getVideoTracks().length > 0;
		return;
	} else if (typeof videoOpts === 'boolean') {
		ref.constraints.video = videoOpts;
		return;
	}

	ref.constraints.video = {
		deviceId: videoOpts.deviceId && typeof videoOpts.deviceId === 'string' ?
			{ exact: videoOpts.deviceId } : (typeof videoOpts.deviceId === 'object' && videoOpts.deviceId) || null,
		height: typeof videoOpts.height === 'number' && videoOpts.height > 0 ?
			{ exact: videoOpts.height } : (typeof videoOpts.height === 'object' && videoOpts.height) || null,
		width: typeof videoOpts.width === 'number' && videoOpts.width > 0 ?
			{ exact: videoOpts.width } : (typeof videoOpts.width === 'object' && videoOpts.width) || null,
		frameRate: typeof videoOpts.frameRate === 'number' && videoOpts.frameRate > 0 ?
			{ exact: videoOpts.frameRate } : (typeof videoOpts.frameRate === 'object' && videoOpts.frameRate) || null,
		facingMode: typeof videoOpts.facingMode === 'string' && videoOpts.facingMode ?
			{ exact: videoOpts.facingMode } : (typeof videoOpts.facingMode === 'object' && videoOpts.facingMode) || null
	};

	if (typeof videoOpts.screensharing === 'object' && videoOpts.screensharing) {
		ref._screensharing.video = true;
		ref.constraints.video = {
			mediaSource: utils.isArray(videoOpts.screensharing.sources) || ['screen', 'window']
		};

		// For IE / Safari (plugin) sourceId
		if (utils.isPlugin() && videoOpts.screensharing.sourceId && typeof videoOpts.screensharing.sourceId === 'string') {
			ref.constraints.video.optional = [{
				screenId: videoOpts.screensharing.sourceId
			}];
		}
	}
};

/**
 * Method to parse audio options (opts.audio).
 */
Stream.prototype._parseAudioOpts = function (opts) {
	var ref = this;
	var audioOpts = (typeof opts.audio === 'object' && opts.audio) || opts.audio === true;

	if (typeof opts.getAudioTracks === 'function') {
		if (opts.getAudioTracks().length > 1) {
			throw new Error('Maximum audio track length can be provided is 1');
		}
		ref.constraints.audio = opts.getAudioTracks().length > 0;
		return;
	} else if (typeof audioOpts === 'boolean') {
		ref.constraints.audio = audioOpts;
		return;
	}

	ref.constraints.audio = {
		deviceId: audioOpts.deviceId && typeof audioOpts.deviceId === 'string' ?
			{ exact: audioOpts.deviceId } : (typeof audioOpts.deviceId === 'object' && videoOpts.deviceId) || null,
		echoCancellation: typeof audioOpts.echoCancellation === 'boolean' ? audioOpts.echoCancellation : null,
		// Note that webrtc/adapter v4.0.0 already handles the polyfills so we can ignore polyfilling here
		autoGainControl: typeof audioOpts.autoGainControl === 'boolean' ?	audioOpts.autoGainControl : null,
		noiseSuppression: typeof audioOpts.noiseSuppression === 'boolean' ? oaudioOpts.noiseSuppression : null
	};

	// For improvement in AEC for IE / Safari (plugin)
	// NOTE: Should we polyfill this in AdapterJS instead?
	if (ref.constraints.audio.echoCancellation && utils.isPlugin()) {
		ref.constraints.audio.mandatory = {
			googEchoCancellation2: true
		};
		delete ref.constraints.audio.echoCancellation;
	}

	if (audioOpts.screensharing === true) {
		if (typeof ref.constraints.video === 'object' && ref.constraints.video.mediaSource &&
			ref.constraints.video.mediaSource.indexOf('tab') > -1) {
			ref._screensharing.audio = true;
			ref.constraints.audio = {};
			ref.constraints.video.mediaSource.push('audio');
		}
	}
};

/**
 * Method to retrieve available sources and set constraints when not available.
 */
Stream.prototype._getSources = function (fn) {
	var ref = this;
	var constraints = {
		audio: false,
		video: false
	};

	if (ref._screensharing.video) {
		utils.getScreens().then(function (sources) {
			constraints.video = ref.constraints.video && sources.sources.length > 0;

			if (!ref._screensharing.audio && ref.constraints.audio) {
				utils.getDevices().then(function (devices) {
					constraints.audio = devices.audio.input.length > 0;
					fn(constraints);

				}).catch(function () {
					fn(constraints);
				});
				return;
			}

			constraints.audio = ref.constraints.audio && ref._screensharing.audio && sources.sources.length > 0;
			fn(constraints);

		}).catch(function () {
			fn(constraints);
		});
	
	} else {
		utils.getDevices().then(function (devices) {
			constraints.audio = ref.constraints.audio && devices.audio.input.length > 0;
			constraints.video = ref.constraints.video && devices.video.input.length > 0;
			fn(constraints);

		}).then(function () {
			fn(constraints);
		});
	}
};

/**
 * Method to fetch for stream using `getUserMedia()`.
 */
Stream.prototype._fetch = function () {
	var ref = this;
	var constraintsFirstFetch = ref.constraints;
	var constraintsSecondFetch = null;

	if (typeof constraintsFirstFetch.video === 'object' && constraintsFirstFetch.video.mediaSource &&
		constraintsFirstFetch.video.mediaSource.indexOf('audio') === -1 && constraintsFirstFetch.audio &&
		window.webrtcDetectedBrowser !== 'firefox') {
		console.debug('new Stream(): Retrieving second audio stream later as it is not supported for retrieval of audio and screen');
		constraintsFirstFetch = {
			video: ref.constraints.video
		};
		constraintsSecondFetch = {
			audio: ref.constraints.audio
		};
	}

	var fnFetch = function (constraints, fn) {
		if (typeof navigator.getUserMedia !== 'function') {
			console.error('new Stream(): getUserMedia() is not supported');
			fn(null, new Error('getUserMedia() is not supported'));
			return;
		}

		try {
			navigator.getUserMedia(constraints, function (stream) {
				fn(stream, null);
			}, function (error) {
				fn(null, error);
			});
		} catch (error) {
			fn(null, error);
		}
	};

	console.log('new Stream(): Fetching stream');

	fnFetch(constraintsFirstFetch, function (stream, error) {
		if (error) {
			console.error('new Stream(): Failed retrieving stream ->', error);
			ref.states.state = Constants.Stream.STATE.ERROR;
			ref._emit('state', Constants.Stream.STATE.ERROR, error);
			return;
		}

		console.log('new Stream(): Fetched stream successfully ->', stream);

		if (constraintsSecondFetch) {
			console.log('new Stream(): Fetching second audio stream');
			fnFetch(constraintsSecondFetch, function (audioOnlyStream, error) {
				if (error) {
					console.warn('new Stream(): Failed retrieving second audio stream ->', error);
					ref.states.state = Constants.Stream.STATE.FALLBACK;
					ref._emit('state', Constants.Stream.STATE.FALLBACK, error);
					ref._parseTracks(stream);
					return;
				}

				console.log('new Stream(): Fetched second audio stream successfully ->', audioOnlyStream);

				try {
					audioOnlyStream.append(stream.getVideoTracks()[0]);
					ref._parseTracks(audioOnlyStream);

				} catch (error) {
					console.warn('new Stream(): Failed adding second audio stream track ->', error);
					// Stop MediaStream. It could be likely the lack of implementation.
					try {
						audioOnlyStream.stop();

					} catch (error) {
						console.error('new Stream(): Failed stopping second audio stream track ->', error);
					}

					ref.states.state = Constants.Stream.STATE.FALLBACK;
					ref._emit('state', Constants.Stream.STATE.FALLBACK, error);
					ref._parseTracks(stream);
				}
			});

		} else {
			ref._parseTracks(stream);
		}
	});
};

/**
 * Method to parse stream tracks.
 */
Stream.prototype._parseTracks = function (stream) {
	var ref = this;

	ref._stream = stream;
	ref.id = stream.id || stream.label || utils.uuid();

	utils.forEach(stream.getTracks(), function (track) {
		ref.tracks[track.kind] = new StreamTrack(track, stream, {
			screenshare: !!ref._screensharing[track.kind],
			streamId: ref.id
		});

		ref.tracks[track.kind].once('_active', function () {
			if (ref.states.state !== Constants.Stream.STATE.ENDED &&
				!(ref.tracks.audio && ref.tracks.audio.states.active) &&
				!(ref.tracks.video && ref.tracks.video.states.active)) {
				console.info('Stream [' + ref.id + ']: Active state ->', false);
				ref.states.active = false;
				ref.states.state = Constants.Stream.STATE.ENDED;
				ref._emit('state', Constants.Stream.STATE.ENDED, null);
			}
		}, function (active) {
			return active === false;
		});

		console.debug('Stream [' + ref.id + ']: Parsed ' + track.kind + ' track ->', track);
	});

	console.info('Stream [' + ref.id + ']: Active state ->', true);
	ref.states.active = true;
	ref.states.state = Constants.Stream.STATE.ACTIVE;
	ref._emit('state', Constants.Stream.STATE.ACTIVE, null);

	if (typeof window.MediaStream === 'function') {
		var video = document.createElement('video');
		video.onloadedmetadata = function () {
			console.log('Stream [' + ref.id + ']: Loaded ->', {
				width: video.videoWidth,
				height: video.videoHeight
			});

			utils.forEach(ref.tracks, function (track) {
				if (track) {
					track._updateLoaded({
						width: video.videoWidth,
						height: video.videoHeight
					});
				}
			});
		};

		console.debug('Stream [' + ref.id + ']: Loading');
		attachMediaStream(video, stream);
	}
};

/**
 * Method to attach stream to `<video>` or `<audio>` element.
 * @method attach
 * @param {DOM} element The `<video>` or `<audio>` (or `<object>` for Temasys plugin enabled browsers) element.
 * @param {JSON} [opts] The options.
 * @param {String} [opts.sinkId] The audio source device output ID to use when supported.
 * @param {Boolean} [opts.popup] The workaround flag to use legacy appending of stream to handle
 *   issues where the element does not render the video track in a popup in some older versions of Chrome.
 * - When not provided, the default value is `false`.
 * @param {DOM} [opts.audioElement] The workaround to append seperate audio track to `<audio>` element
 *   instead for Edge 14.x versions where audio and video tracks has issues to be rendered together in
 *   a `<video>` element.
 * @throws Error
 * @for Stream
 * @since 0.7.0
 */
Stream.prototype.attach = function (element, opts) {
	var ref = this;
	var inputOpts = (typeof opts === 'object' && opts) || {};

	if (!element) {
		throw new Error('Element not provided');

	} else if (!ref._stream) {
		throw new Error('Stream has not started');
	}

	element.removeAttribute('src');

	console.info(inputOpts, window.webrtcDetectedBrowser);

	if (inputOpts.popup === true && ['chrome', 'opera'].indexOf(window.webrtcDetectedBrowser) > -1) {
		console.log('Stream [' + ref.id + ']: Attaching stream (legacy) ->', element);
		element.src = URL.createObjectURL(ref._stream);

	} else if (window.webrtcDetectedBrowser === 'edge' && window.webrtcDetectedVersion < 15.15019 &&
		element && typeof element.tagName === 'string' && element.tagName.toUpperCase() === 'VIDEO' &&
		ref.tracks.video && ref.tracks.audio && inputOpts.audioElement &&
		typeof inputOpts.audioElement.tagName === 'string' && inputOpts.audioElement.tagName.toUpperCase() === 'AUDIO') {

		try {
			console.log('Stream [' + ref.id + ']: Attaching video only stream ->', element);
			attachMediaStream(element, new MediaStream([ref.tracks.video._track]));

			console.log('Stream [' + ref.id + ']: Attaching audio only stream ->', opts.audioElement);
			attachMediaStream(opts.audioElement, new MediaStream([ref.tracks.audio._track]));

		} catch (error) {
			console.warn('Stream [' + ref.id + ']: Failed attaching audio and video track separately ->', error);
			console.log('Stream [' + ref.id + ']: Attaching stream ->', element);
			attachMediaStream(element, ref._stream);
		}

	} else {
		console.log('Stream [' + ref.id + ']: Attaching stream ->', element);
		attachMediaStream(element, ref._stream);
	}

	if (inputOpts.sinkId && typeof inputOpts.sinkId === 'string' && typeof element.setSinkId === 'function') {
		console.log('Stream [' + ref.id + ']: Setting audio speaker output ->', inputsOpts.sinkId);
		element.setSinkId(inputOpts.sinkId);
	}
};

/**
 * Method to enable or disable stream tracks.
 * @method enable
 * @param {Boolean} enabled The flag if track should be enabled.
 * @param {String} [type] The track to enable or disable only.
 * - When not provided, both audio and video tracks will be targeted.
 * - Reference `Constants.StreamTrack.TYPE` for the list of available values.
 * @throws Error
 * @for Stream
 * @since 0.7.0
 */
Stream.prototype.enable = function (enabled, type) {
	var ref = this;

	if (!ref._stream) {
		throw new Error('Stream has not started');
  }
	
	if (typeof type === 'string' && ['audio', 'video'].indexOf(type) === -1) {
		console.warn('Stream [' + ref.id + ']: Track type "' + type + '" is not supported, targeting all tracks');
	}

	utils.forEach(ref.tracks, function (track, typeItem) {
		if (track && (['audio', 'video'].indexOf(type) > -1 ? typeItem === type : true)) {
			track.enable(enabled);
		}
	});
};

/**
 * Method to stop stream tracks.
 * @method stop
 * @param {String} [type] The track to stop only.
 * - When not provided, both audio and video tracks will be targeted.
 * - Reference `Constants.StreamTrack.TYPE` for the list of available values.
 * @return {Promise} Returns `()` for success and `(error)` for error.
 * @for Stream
 * @since 0.7.0
 */
Stream.prototype.stop = function (type) {
	var ref = this;

	return new Promise(function (resolve, reject) {
		if (!ref._stream) {
			console.error('new Stream(): Stream has not started, unable to stop');
			reject(new Error('Stream has not started'));
			return;
		}

		if (typeof type === 'string' && ['audio', 'video'].indexOf(type) === -1) {
			console.warn('Stream [' + ref.id + ']: Track type "' + type + '" is not supported, targeting all tracks');
		}

		if (!ref.states.active) {
			console.warn('Stream [' + ref.id + ']: Active state is already false');
			resolve();
			return;
		}

		try {
			if (ref.tracks.audio && (['audio', 'video'].indexOf(type) > -1 ? type === 'audio' : true)) {
				ref.tracks.audio.stop();
			}

			if (ref.tracks.video && (['audio', 'video'].indexOf(type) > -1 ? type === 'video' : true)) {
				ref.tracks.video.stop();
			}
		
			resolve();

		} catch (trackStopError) {
			if (['audio', 'video'].indexOf(type) === -1) {
				try {
					ref._stream.stop();

					utils.forEach(ref.tracks, function (track) {
						if (track) {
							track._updateEnded();
						}
					});
					resolve();

				} catch (streamStopError) {
					reject(streamStopError);
				}
			} else {
				reject(trackStopError);
			}
		}
	});
};