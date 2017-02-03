/**
 * <blockquote class="info">
 *   Note that this feature requires MCU and recording to be enabled for the App Key provided in the
 *   <a href="#method_init"><code>init()</code> method</a>. If recording feature is not available to
 *   be enabled in the <a href="https://console.temasys.io">Developer Console</a>, please
 *   <a href="http://support.temasys.io">contact us on our support portal</a>.
 * </blockquote>
 * Gets the list of current recording sessions since User has connected to the Room.
 * @method getRecordings
 * @return {JSON} The list of recording sessions.<ul>
 *   <li><code>#recordingId</code><var><b>{</b>JSON<b>}</b></var><p>The recording session.</p><ul>
 *   <li><code>active</code><var><b>{</b>Boolean<b>}</b></var><p>The flag that indicates if the recording session is currently active.</p></li>
 *   <li><code>state</code><var><b>{</b>Number<b>}</b></var><p>The current recording state. [Rel: Skylink.RECORDING_STATE]</p></li>
 *   <li><code>startedDateTime</code><var><b>{</b>String<b>}</b></var><p>The recording session started DateTime in
 *   <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601 format</a>.<small>Note that this value may not be
 *   very accurate as this value is recorded when the start event is received.</small></p></li>
 *   <li><code>endedDateTime</code><var><b>{</b>String<b>}</b></var><p>The recording session ended DateTime in
 *   <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601 format</a>.<small>Note that this value may not be
 *   very accurate as this value is recorded when the stop event is received.</small>
 *   <small>Defined only after <code>state</code> has triggered <code>STOP</code>.</small></p></li>
 *   <li><code>mixingDateTime</code><var><b>{</b>String<b>}</b></var><p>The recording session mixing completed DateTime in
 *   <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601 format</a>.<small>Note that this value may not be
 *   very accurate as this value is recorded when the mixing completed event is received.</small>
 *   <small>Defined only when <code>state</code> is <code>LINK</code>.</small></p></li>
 *   <li><code>links</code><var><b>{</b>JSON<b>}</b></var><p>The recording session links.
 *   <small>Object signature matches the <code>link</code> parameter payload received in the
 *   <a href="#event_recordingState"><code>recordingState</code> event</a>.</small>
 *   <small>Defined only when <code>state</code> is <code>LINK</code>.</small></p></li>
 *   <li><code>error</code><var><b>{</b>Error<b>}</b></var><p>The recording session error.
 *   <small>Defined only when <code>state</code> is <code>ERROR</code>.</small></p></li></ul></li></ul>
 * @example
 *   // Example 1: Get recording sessions
 *   skylinkDemo.getRecordings();
 * @beta
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.getRecordings = function () {
  return UtilsFactory.clone(this._recordings);
};