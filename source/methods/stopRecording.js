/**
 * <blockquote class="info">
 *   Note that this feature requires MCU and recording to be enabled for the App Key provided in the
 *   <a href="#method_init"><code>init()</code> method</a>. If recording feature is not available to
 *   be enabled in the <a href="https://console.temasys.io">Developer Console</a>, please
 *   <a href="http://support.temasys.io">contact us on our support portal</a>.
 * </blockquote>
 * Stops a recording session.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_recordingState">
 *   <code>recordingState</code> event</a> triggering <code>state</code> parameter payload as <code>STOP</code>
 *   or as <code>LINK</code> when the value of <code>callbackSuccessWhenLink</code> is <code>true</code>.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>stopRecording()</code> error when stopping current recording session.</small>
 * @param {String|JSON} callback.success The success result in request.
 * - When <code>callbackSuccessWhenLink</code> value is <code>false</code>, it is defined as string as
 *   the recording session ID.
 * - when <code>callbackSuccessWhenLink</code> value is <code>true</code>, it is defined as an object as
 *   the recording session information.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {JSON} callback.success.recordingId The recording session ID.
 * @param {JSON} callback.success.link The recording session mixin videos link in
 *   <a href="https://en.wikipedia.org/wiki/MPEG-4_Part_14">MP4</a> format.
 *   <small>Object signature matches the <code>link</code> parameter payload received in the
 *   <a href="#event_recordingState"><code>recordingState</code> event</a>.</small>
 * @param {Boolean} [callbackSuccessWhenLink=false] The flag if <code>callback</code> function provided
 *   should result in success only when <a href="#event_recordingState"><code>recordingState</code> event</a>
 *   triggering <code>state</code> parameter payload as <code>LINK</code>.
 * @method stopRecording
 * @example
 *   // Example 1: Stop recording session
 *   skylinkDemo.stopRecording(function (error, success) {
 *     if (error) return;
 *     console.info("Recording session has stopped. ID ->", success);
 *   });
 *
 *   // Example 2: Stop recording session with mixin videos link
 *   skylinkDemo.stopRecording(function (error, success) {
 *     if (error) return;
 *     console.info("Recording session has compiled with links ->", success.link);
 *   }, true);
 * @trigger <ol class="desc-seq">
 *   <li>If MCU is not connected: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>If there is no existing recording session currently going on: <ol>
 *   <li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>If existing recording session recording time has not elapsed more than 4 seconds:
 *   <small>4 seconds is mandatory for recording session to ensure better recording
 *   experience and stability.</small> <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Sends to MCU via Signaling server to stop recording session: <ol>
 *   <li>If recording session has been stopped successfully: <ol>
 *   <li><a href="#event_recordingState"><code>recordingState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>START</code>.
 *   <li>MCU starts mixin recorded session videos: <ol>
 *   <li>If recording session has been mixin successfully with links: <ol>
 *   <li><a href="#event_recordingState"><code>recordingState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>LINK</code>.<li>Else: <ol>
 *   <li><a href="#event_recordingState"><code>recordingState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>ERROR</code>.<li><b>ABORT</b> and return error.</ol></li>
 *   </ol></li></ol></li><li>Else: <ol>
 *   <li><a href="#event_recordingState"><code>recordingState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>ERROR</code>.</li><li><b>ABORT</b> and return error.</li>
 *   </ol></li></ol></li></ol>
 * @beta
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.stopRecording = function (callback, callbackSuccessWhenLink) {
  var self = this;

  if (!self._hasMCU) {
    var noMCUError = 'Unable to stop recording as MCU is not connected';
    self._log.error(noMCUError);
    if (typeof callback === 'function') {
      callback(new Error(noMCUError), null);
    }
    return;
  }

  if (!self._currentRecordingId) {
    var noRecordingSessionError = 'Unable to stop recording as there is no recording in-progress';
    self._log.error(noRecordingSessionError);
    if (typeof callback === 'function') {
      callback(new Error(noRecordingSessionError), null);
    }
    return;
  }

  if (self._recordingStartInterval) {
    var recordingSecsRequiredError = 'Unable to stop recording as 4 seconds has not been recorded yet';
    self._log.error(recordingSecsRequiredError);
    if (typeof callback === 'function') {
      callback(new Error(recordingSecsRequiredError), null);
    }
    return;
  }

  if (typeof callback === 'function') {
    var expectedRecordingId = self._currentRecordingId;

    self.once('recordingState', function (state, recordingId, link, error) {
      if (callbackSuccessWhenLink) {
        if (error) {
          callback(error, null);
          return;
        }

        callback(null, {
          link: link,
          recordingId: recordingId
        });
        return;
      }

      callback(null, recordingId);

    }, function (state, recordingId) {
      if (expectedRecordingId === recordingId) {
        if (callbackSuccessWhenLink) {
          return [self.RECORDING_STATE.LINK, self.RECORDING_STATE.ERROR].indexOf(state) > -1;
        }
        return state === self.RECORDING_STATE.STOP;
      }
    });
  }

  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.STOP_RECORDING,
    rid: self._room.id,
    target: 'MCU'
  });

  self._log.debug(['MCU', 'Recording', null, 'Stopping recording']);
};