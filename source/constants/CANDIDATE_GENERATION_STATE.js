/**
 * <blockquote class="info">
 *   Learn more about how ICE works in this
 *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of Peer connection ICE gathering states.
 * @attribute CANDIDATE_GENERATION_STATE
 * @param {String} GATHERING <small>Value <code>"gathering"</code></small>
 *   The value of the state when Peer connection is gathering ICE candidates.
 *   <small>These ICE candidates are sent to Peer for its connection to check for a suitable matching
 *   pair of ICE candidates to establish an ICE connection for stream audio, video and data.
 *   See <a href="#event_iceConnectionState"><code>iceConnectionState</code> event</a> for ICE connection status.</small>
 *   <small>This state cannot happen until Peer connection remote <code>"offer"</code> / <code>"answer"</code>
 *   session description is set. See <a href="#event_peerConnectionState">
 *   <code>peerConnectionState</code> event</a> for session description exchanging status.</small>
 * @param {String} COMPLETED <small>Value <code>"completed"</code></small>
 *   The value of the state when Peer connection gathering of ICE candidates has completed.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.4.1
 */
Skylink.prototype.CANDIDATE_GENERATION_STATE = {
  NEW: 'new',
  GATHERING: 'gathering',
  COMPLETED: 'completed'
};