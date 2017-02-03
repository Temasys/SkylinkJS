/**
 * The list of <a href="#method_init"><code>init()</code> method</a> ready states.
 * @attribute READY_STATE_CHANGE
 * @param {Number} INIT      <small>Value <code>0</code></small>
 *   The value of the state when <code>init()</code> has just started.
 * @param {Number} LOADING   <small>Value <code>1</code></small>
 *   The value of the state when <code>init()</code> is authenticating App Key provided
 *   (and with credentials if provided as well) with the Auth server.
 * @param {Number} COMPLETED <small>Value <code>2</code></small>
 *   The value of the state when <code>init()</code> has successfully authenticated with the Auth server.
 *   Room session token is generated for joining the <code>defaultRoom</code> provided in <code>init()</code>.
 *   <small>Room session token has to be generated each time User switches to a different Room
 *   in <a href="#method_joinRoom"><code>joinRoom()</code> method</a>.</small>
 * @param {Number} ERROR     <small>Value <code>-1</code></small>
 *   The value of the state when <code>init()</code> has failed authenticating with the Auth server.
 *   [Rel: Skylink.READY_STATE_CHANGE_ERROR]
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.READY_STATE_CHANGE = {
  INIT: 0,
  LOADING: 1,
  COMPLETED: 2,
  ERROR: -1
};