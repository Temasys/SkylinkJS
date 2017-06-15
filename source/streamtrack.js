/**
 * Handles the stream track.
 * @class StreamTrack
 * @since 0.7.0
 * @typedef class
 */
function StreamTrack (track, stream, settings) {
  // Reference https://www.w3.org/TR/mediacapture-streams/#widl-MediaStreamTrack
  var ref = utils.extendEvents(this);

  /**
   * The track states.
   * @attribute states
   * @param {Boolean} active The flag if state is active.
   * @param {Boolean} loaded The flag if track metadata has been loaded.
   * @param {Boolean} muted The flag if track is muted.
   * @param {Boolean} enabled The flag if track is enabled.
   * @param {Boolean} anaylser The flag if audio track anaylser has been loaded.
   * - This property is only defined for audio track type.
   * @type JSON
   * @for StreamTrack
   * @since 0.7.0
   */
  ref.states = {
    /**
		 * Event emitted when track active state has changed.
		 * @event active
		 * @param {Boolean} active The flag if track is active.
		 * @for StreamTrack
		 * @since 0.7.0 
		 */
    active: typeof track.readyState === 'string' ? track.readyState === 'live' :
      (typeof track.ended === 'boolean' ? !track.ended : true),
    /**
		 * Event emitted when track metadata loaded state has changed.
		 * @event loaded
		 * @param {Boolean} loaded The flag if track metadata has been loaded.
		 * @for StreamTrack
		 * @since 0.7.0 
		 */
    loaded: false,
    /**
		 * Event emitted when track device muted state has changed.
		 * @event muted
		 * @param {Boolean} loaded The flag if track device muted has been loaded.
		 * @for StreamTrack
		 * @since 0.7.0 
		 */
    muted: typeof track.muted === 'boolean' ? track.muted : false,
    /**
		 * Event emitted when track enabled state has changed.
		 * @event enabled
		 * @param {Boolean} enabled The flag if track is enabled.
		 * @for StreamTrack
		 * @since 0.7.0 
		 */
    enabled: track.enabled
  };

  /**
   * The track ID.
   * @attribute id
   * @type String
   * @for StreamTrack
   * @since 0.7.0
   */
  ref.id = track.id || utils.uuid();

  /**
   * The track label.
   * @attribute label
   * @type String
   * @readOnly
   * @for StreamTrack
   * @since 0.7.0
   */
  ref.label = track.label || '';

  /**
   * The track type.
   * - Reference `Constants.StreamTrack.TYPE` for the list of available values.
   * @attribute type
   * @type String
   * @readOnly
   * @for StreamTrack
   * @since 0.7.0
   */
  ref.type = track.kind;

  /**
   * The track settings.
   * @attribute settings
   * @param {Boolean} screenshare The flag if track is from screensharing source.
   * @param {JSON} input The audio track input settings.
   * - This property is only defined for audio track type.
   * @param {Number} input.level The current audio input level in decibels (dB).
   * - Range: `0` - `100`.
   * @param {Number} input.vumeter The current audio input volume unit (VU) meter.
   * @param {JSON} frame The video track frame settings.
   * - This property is only defined for video track type.
   * @param {Number} frame.height The video track frame height.
   * @param {Number} frame.width The video track frame width.
   * @type JSON
   * @readOnly
   * @for StreamTrack
   * @since 0.7.0
   */
  ref.settings = {
    screenshare: settings.screenshare
  };

  // Stores the track object
  ref._track = track;
  // Stores the audio input level anaylser
  ref._anaylser = null;
  // Stores the stream ID
  ref._streamId = settings.streamId;

  track.onended = function () {
    // Prevent manual trigger of stop() from trigger this event too fast
    setTimeout(function () {
      ref._updateEnded();
    }, 0);
  };

  track.onmute = function () {
    console.log('StreamTrack [' + ref._streamId + '][' + ref.type + ']: Muted state ->', true);
    ref.states.muted = true;
    ref._emit('muted', true);
  };

  track.onunmute = function () {
    console.log('StreamTrack [' + ref._streamId + '][' + ref.type + ']: Muted state ->', false);
    ref.states.muted = false;
    ref._emit('muted', false);
  };

  setTimeout(function () {
    console.log('StreamTrack [' + ref._streamId + '][' + ref.type + ']: Active state ->', true);
    ref._emit('active', ref.states.active);
  }, 0);

  if (track.kind === 'video') {
    ref.settings.frame = {
      width: null,
      height: null
    };

  } else if (track.kind === 'audio') {
    ref.states.anaylser = false;
    ref.settings.input = {
      level: null,
      vumeter: null
    };
    ref._anaylser = {
      context: null,
      analyser: null,
      source: null,
      processor: null
    };

    if (utils.isPlugin() || typeof window.AudioContext !== 'function') {
      console.error('StreamTrack [' + ref._streamId + '][' + ref.type + ']: Analyser is not supported for browser');
      ref._emit('anaylser', null, new Error('Analyser is not supported'));
			return;
    }

    try {
			// References: https://codepen.io/travisholliday/pen/gyaJk
			ref._anaylser.context = new AudioContext();
			ref._anaylser.analyser = ref._anaylser.context.createAnalyser();
			ref._anaylser.source = ref._anaylser.context.createMediaStreamSource(stream);
			ref._anaylser.processor = ref._anaylser.context.createScriptProcessor(2048, 1, 1);

			ref._anaylser.analyser.smoothingTimeConstant = 0.8;
			ref._anaylser.analyser.fftSize = 1024;

			ref._anaylser.source.connect(ref._anaylser.analyser);
			ref._anaylser.analyser.connect(ref._anaylser.processor);
			ref._anaylser.processor.connect(ref._anaylser.context.destination);

      console.info('StreamTrack [' + ref._streamId + '][' + ref.type + ']: Analyser has been loaded');

		} catch (error) {
			console.error('StreamTrack [' + ref._streamId + '][' + ref.type + ']: Failed parsing analyser ->', error);
      ref._emit('anaylser', null, error);
      return;
		}

    ref._anaylser.processor.onaudioprocess = function() {
      var binCount = new Uint8Array(ref._anaylser.analyser.frequencyBinCount);
      var values = 0;

      ref._anaylser.analyser.getByteFrequencyData(binCount);
      utils.forEach(binCount, function (item) {
        values += item;
      });

      var average = values / binCount.length;

      ref.settings.input.level = average;
      ref.settings.input.vumeter = Math.round(average - 40);
      ref._emit('anaylser', ref.settings.input, null);
    };
  }
}

/**
 * Method to update (active: false) state.
 */
StreamTrack.prototype._updateEnded = function () {
  var ref = this;

  if (ref.states.active) {
    if (ref.type === 'audio' && ref._anaylser.context) {
      try {
        ref._anaylser.source.disconnect();
        ref._anaylser.analyser.disconnect();
        ref._anaylser.processor.disconnect();

      } catch (error) {
        console.warn('StreamTrack [' + ref._streamId + '][' + ref.type + ']: Failed disconnecting anaylser ->', error);
      }

      delete ref._anaylser;
    }

    console.log('StreamTrack [' + ref._streamId + '][' + ref.type + ']: Active state ->', false);
    ref.states.active = false;
    ref._emit('active', false);
  }
};

/**
 * Method to update (loaded: true) state.
 */
StreamTrack.prototype._updateLoaded = function (settings) {
  var ref = this;

  if (!ref.states.loaded) {
    console.log('StreamTrack [' + ref._streamId + '][' + ref.type + ']: Loaded state ->', true);

    if (ref.type === 'video') {
      ref.settings.frame.height = settings.height;
      ref.settings.frame.width = settings.width;
    }

    ref._emit('loaded', true);
  }
};

/**
 * Method to enable track.
 * @method enable
 * @param {Boolean} [enabled] The flag if track should be enabled.
 * - When not provided, the value is `false`.
 * @return {Promise} Returns `()` for success and `(error)` for error.
 * @for StreamTrack
 * @since 0.7.0
 */
StreamTrack.prototype.enable = function (enabled) {
  var ref = this;

  return new Promise(function (resolve, reject) {
    enabled = typeof enabled === 'boolean' ? enabled : false;

    if (!ref.states.active) {
      console.error('StreamTrack [' + ref._streamId + '][' + ref.type + ']: Track is not active');
      reject(new Error('Track is not active'));
      return;
    }

    if (ref.states.enabled === enabled) {
      console.warn('StreamTrack [' + ref._streamId + '][' + ref.type + ']: Enabled state is already ' + enabled);
      resolve();
      return;
    }

    console.log('StreamTrack [' + ref._streamId + '][' + ref.type + ']: Enabled state ->', enabled);

    ref._track.enabled = enabled;
    ref.states.enabled = enabled;
    ref._emit('enabled', enabled);
    resolve();
  });
};

/**
 * Method to stop track.
 * @method stop
 * @return {Promise} Returns `()` for success and `(error)` for error.
 * @for StreamTrack
 * @since 0.7.0
 */
StreamTrack.prototype.stop = function () {
  var ref = this;

  return new Promise(function (resolve, reject) {
    if (!ref.states.active) {
      console.warn('StreamTrack [' + ref._streamId + '][' + ref.type + ']: Active state is already false');
      resolve();
      return;
    }

    try {
      ref._track.stop();
      ref._updateEnded();
      resolve();

    } catch (error) {
      console.error('StreamTrack [' + ref._streamId + '][' + ref.type + ']: Failed stopping track ->', error);
      reject(error);
    }
  });
};