/**
 * <blockquote class="info">
 *   Learn more about how ICE works in this
 *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of Peer connection ICE connection states.
 * @attribute ICE_CONNECTION_STATE
 * @param {String} CHECKING       <small>Value <code>"checking"</code></small>
 *   The value of the state when Peer connection is checking for a suitable matching pair of
 *   ICE candidates to establish ICE connection.
 *   <small>Exchanging of ICE candidates happens during <a href="#event_candidateGenerationState">
 *   <code>candidateGenerationState</code> event</a>.</small>
 * @param {String} CONNECTED      <small>Value <code>"connected"</code></small>
 *   The value of the state when Peer connection has found a suitable matching pair of
 *   ICE candidates to establish ICE connection but is still checking for a better
 *   suitable matching pair of ICE candidates for the best ICE connectivity.
 *   <small>At this state, ICE connection is already established and audio, video and
 *   data streaming has already started.</small>
 * @param {String} COMPLETED      <small>Value <code>"completed"</code></small>
 *   The value of the state when Peer connection has found the best suitable matching pair
 *   of ICE candidates to establish ICE connection and checking has stopped.
 *   <small>At this state, ICE connection is already established and audio, video and
 *   data streaming has already started. This may happpen after <code>CONNECTED</code>.</small>
 * @param {String} FAILED         <small>Value <code>"failed"</code></small>
 *   The value of the state when Peer connection ICE connection has failed.
 * @param {String} DISCONNECTED   <small>Value <code>"disconnected"</code></small>
 *   The value of the state when Peer connection ICE connection is disconnected.
 *   <small>At this state, the Peer connection may attempt to revive the ICE connection.
 *   This may happen due to flaky network conditions.</small>
 * @param {String} CLOSED         <small>Value <code>"closed"</code></small>
 *   The value of the state when Peer connection ICE connection has closed.
 *   <small>This happens when Peer connection is closed and no streaming can occur at this stage.</small>
 * @param {String} TRICKLE_FAILED <small>Value <code>"trickeFailed"</code></small>
 *   The value of the state when Peer connection ICE connection has failed during trickle ICE.
 *   <small>Trickle ICE is enabled in <a href="#method_init"><code>init()</code> method</a>
 *   <code>enableIceTrickle</code> option.</small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.ICE_CONNECTION_STATE = {
  STARTING: 'starting',
  CHECKING: 'checking',
  CONNECTED: 'connected',
  COMPLETED: 'completed',
  CLOSED: 'closed',
  FAILED: 'failed',
  TRICKLE_FAILED: 'trickleFailed',
  DISCONNECTED: 'disconnected'
};