/**
 * The list of Signaling server reaction states during <a href="#method_joinRoom"><code>joinRoom()</code> method</a>.
 * @attribute SYSTEM_ACTION
 * @param {String} WARNING <small>Value <code>"warning"</code></small>
 *   The value of the state when Room session is about to end.
 * @param {String} REJECT  <small>Value <code>"reject"</code></small>
 *   The value of the state when Room session has failed to start or has ended.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype.SYSTEM_ACTION = {
  WARNING: 'warning',
  REJECT: 'reject'
};