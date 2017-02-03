/**
 * The list of <a href="#method_joinRoom"><code>joinRoom()</code> method</a> socket connection failure states.
 * @attribute SOCKET_ERROR
 * @param {Number} CONNECTION_FAILED    <small>Value <code>0</code></small>
 *   The value of the failure state when <code>joinRoom()</code> socket connection failed to establish with
 *   the Signaling server at the first attempt.
 * @param {Number} RECONNECTION_FAILED  <small>Value <code>-1</code></small>
 *   The value of the failure state when <code>joinRoom()</code> socket connection failed to establish
 *   the Signaling server after the first attempt.
 * @param {Number} CONNECTION_ABORTED   <small>Value <code>-2</code></small>
 *   The value of the failure state when <code>joinRoom()</code> socket connection will not attempt
 *   to reconnect after the failure of the first attempt in <code>CONNECTION_FAILED</code> as there
 *   are no more ports or transports to attempt for reconnection.
 * @param {Number} RECONNECTION_ABORTED <small>Value <code>-3</code></small>
 *   The value of the failure state when <code>joinRoom()</code> socket connection will not attempt
 *   to reconnect after the failure of several attempts in <code>RECONNECTION_FAILED</code> as there
 *   are no more ports or transports to attempt for reconnection.
 * @param {Number} RECONNECTION_ATTEMPT <small>Value <code>-4</code></small>
 *   The value of the failure state when <code>joinRoom()</code> socket connection is attempting
 *   to reconnect with a new port or transport after the failure of attempts in
 *   <code>CONNECTION_FAILED</code> or <code>RECONNECTED_FAILED</code>.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.SOCKET_ERROR = {
  CONNECTION_FAILED: 0,
  RECONNECTION_FAILED: -1,
  CONNECTION_ABORTED: -2,
  RECONNECTION_ABORTED: -3,
  RECONNECTION_ATTEMPT: -4
};