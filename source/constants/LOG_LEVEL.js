/**
 * The list of the SDK <code>console</code> API log levels.
 * @attribute LOG_LEVEL
 * @param {Number} DEBUG <small>Value <code>4</code></small>
 *   The value of the log level that displays <code>console</code> <code>debug</code>,
 *   <code>log</code>, <code>info</code>, <code>warn</code> and <code>error</code> logs.
 * @param {Number} LOG   <small>Value <code>3</code></small>
 *   The value of the log level that displays only <code>console</code> <code>log</code>,
 *   <code>info</code>, <code>warn</code> and <code>error</code> logs.
 * @param {Number} INFO  <small>Value <code>2</code></small>
 *   The value of the log level that displays only <code>console</code> <code>info</code>,
 *   <code>warn</code> and <code>error</code> logs.
 * @param {Number} WARN  <small>Value <code>1</code></small>
 *   The value of the log level that displays only <code>console</code> <code>warn</code>
 *   and <code>error</code> logs.
 * @param {Number} ERROR <small>Value <code>0</code></small>
 *   The value of the log level that displays only <code>console</code> <code>error</code> logs.
 * @param {Number} NONE <small>Value <code>-1</code></small>
 *   The value of the log level that displays no logs.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype.LOG_LEVEL = {
  DEBUG: 4,
  LOG: 3,
  INFO: 2,
  WARN: 1,
  ERROR: 0,
  NONE: -1
};