/**
 * The list of <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> or
 * <a href="#method_shareScreen"><code>shareScreen()</code> method</a> Stream fallback states.
 * @attribute MEDIA_ACCESS_FALLBACK_STATE
 * @param {JSON} FALLBACKING <small>Value <code>0</code></small>
 *   The value of the state when <code>getUserMedia()</code> will retrieve audio track only
 *   when retrieving audio and video tracks failed.
 *   <small>This can be configured by <a href="#method_init"><code>init()</code> method</a>
 *   <code>audioFallback</code> option.</small>
 * @param {JSON} FALLBACKED  <small>Value <code>1</code></small>
 *   The value of the state when <code>getUserMedia()</code> or <code>shareScreen()</code>
 *   retrieves camera / screensharing Stream successfully but with missing originally required audio or video tracks.
 * @param {JSON} ERROR       <small>Value <code>-1</code></small>
 *   The value of the state when <code>getUserMedia()</code> failed to retrieve audio track only
 *   after retrieving audio and video tracks failed.
 * @readOnly
 * @for Skylink
 * @since 0.6.14
 */
Skylink.prototype.MEDIA_ACCESS_FALLBACK_STATE = {
  FALLBACKING: 0,
  FALLBACKED: 1,
  ERROR: -1
};