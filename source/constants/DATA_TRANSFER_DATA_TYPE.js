/**
 * The list of supported data transfer data types.
 * @attribute DATA_TRANSFER_DATA_TYPE
 * @param {String} BINARY_STRING <small>Value <code>"binaryString"</code></small>
 *   The value of data transfer data type when Blob binary data chunks encoded to Base64 encoded string are
 *   sent or received over the Datachannel connection for the data transfer session.
 *   <small>Used only in <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a> when
 *   parameter <code>sendChunksAsBinary</code> value is <code>false</code>.</small>
 * @param {String} ARRAY_BUFFER  <small>Value <code>"arrayBuffer"</code></small>
 *   The value of data transfer data type when ArrayBuffer binary data chunks are
 *   sent or received over the Datachannel connection for the data transfer session.
 *   <small>Used only in <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a> when
 *   parameter <code>sendChunksAsBinary</code> value is <code>true</code>.</small>
 * @param {String} BLOB          <small>Value <code>"blob"</code></small>
 *   The value of data transfer data type when Blob binary data chunks are
 *   sent or received over the Datachannel connection for the data transfer session.
 *   <small>Used only in <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a> when
 *   parameter <code>sendChunksAsBinary</code> value is <code>true</code>.</small>
 * @param {String} STRING        <small>Value <code>"string"</code></small>
 *   The value of data transfer data type when only string data chunks are
 *   sent or received over the Datachannel connection for the data transfer session.
 *   <small>Used only in <a href="#method_sendURLData"><code>sendURLData()</code> method</a>.</small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.DATA_TRANSFER_DATA_TYPE = {
  BINARY_STRING: 'binaryString',
  ARRAY_BUFFER: 'arrayBuffer',
  BLOB: 'blob',
  STRING: 'string'
};