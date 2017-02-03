/**
 * <blockquote class="info">
 *   Note that this feature requires MCU and recording to be enabled for the App Key provided in the
 *   <a href="#method_init"><code>init()</code> method</a>. If recording feature is not available to
 *   be enabled in the <a href="https://console.temasys.io">Developer Console</a>, please
 *   <a href="http://support.temasys.io">contact us on our support portal</a>.
 * </blockquote>
 * Starts a recording session.
 * @method startRecording
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_recordingState">
 *   <code>recordingState</code> event</a> triggering <code>state</code> parameter payload as <code>START</code>.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>startRecording()</code> error when starting a new recording session.</small>
 * @param {String|JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature is the <a href="#event_recordingState">
 *   <code>recordingState</code> event</a> triggered <code>recordingId</code> parameter payload.</small>
 * @example
 *   // Example 1: Start recording session
 *   skylinkDemo.startRecording(function (error, success) {
 *     if (error) return;
 *     console.info("Recording session has started. ID ->", success);
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>If MCU is not connected: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>If there is an existing recording session currently going on: <ol>
 *   <li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Sends to MCU via Signaling server to start recording session. <ol>
 *   <li>If recording session has been started successfully: <ol>
 *   <li><a href="#event_recordingState"><code>recordingState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>START</code>.</li></ol></li></ol></li></ol>
 * @beta
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.startRecording = function (callback) {
  var self = this;

  if (!self._hasMCU) {
    var noMCUError = 'Unable to start recording as MCU is not connected';
    self._log.error(noMCUError);
    if (typeof callback === 'function') {
      callback(new Error(noMCUError), null);
    }
    return;
  }

  if (self._currentRecordingId) {
    var hasRecordingSessionError = 'Unable to start recording as there is an existing recording in-progress';
    self._log.error(hasRecordingSessionError);
    if (typeof callback === 'function') {
      callback(new Error(hasRecordingSessionError), null);
    }
    return;
  }

  if (typeof callback === 'function') {
    self.once('recordingState', function (state, recordingId) {
      callback(null, recordingId);
    }, function (state) {
      return state === self.RECORDING_STATE.START;
    });
  }

  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.START_RECORDING,
    rid: self._room.id,
    target: 'MCU'
  });

  self._log.debug(['MCU', 'Recording', null, 'Starting recording']);
};