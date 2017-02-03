/**
 * The list of recording states.
 * @attribute RECORDING_STATE
 * @param {Number} START <small>Value <code>0</code></small>
 *   The value of the state when recording session has started.
 * @param {Number} STOP <small>Value <code>1</code></small>
 *   The value of the state when recording session has stopped.<br>
 *   <small>At this stage, the recorded videos will go through the mixin server to compile the videos.</small>
 * @param {Number} LINK <small>Value <code>2</code></small>
 *   The value of the state when recording session mixin request has been completed.
 * @param {Number} ERROR <small>Value <code>-1</code></small>
 *   The value of the state state when recording session has errors.
 *   <small>This can happen during recording session or during mixin of recording videos,
 *   and at this stage, any current recording session or mixin is aborted.</small>
 * @type JSON
 * @beta
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.RECORDING_STATE = {
  START: 0,
  STOP: 1,
  LINK: 2,
  ERROR: -1
};