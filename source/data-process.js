/**
 * The fixed size for each data chunk.
 * @attribute _CHUNK_FILE_SIZE
 * @type Integer
 * @readOnly
 * @private
 * @final
 * @required
 * @since 0.5.2
 */
Skylink.prototype._CHUNK_FILE_SIZE = 49152;

/**
 * The fixed for each data chunk for firefox implementation.
 * - Firefox the sender chunks 49152 but receives as 16384.
 * @attribute _MOZ_CHUNK_FILE_SIZE
 * @type Integer
 * @readOnly
 * @private
 * @final
 * @required
 * @since 0.5.2
 */
Skylink.prototype._MOZ_CHUNK_FILE_SIZE = 16384;

/**
 * The list of data transfer data types.
 * - <b><i>TODO</i></b>: ArrayBuffer and Blob data transfer in
 *   datachannel.
 * - The available data transfer data types are:
 * @attribute DATA_TRANSFER_DATA_TYPE
 * @type JSON
 * @param {String} BINARY_STRING BinaryString data type.
 * @param {String} ARRAY_BUFFER Still-implementing. ArrayBuffer data type.
 * @param {String} BLOB Still-implementing. Blob data type.
 * @readOnly
 * @since 0.1.0
 */
Skylink.prototype.DATA_TRANSFER_DATA_TYPE = {
  BINARY_STRING: 'binaryString',
  ARRAY_BUFFER: 'arrayBuffer',
  BLOB: 'blob'
};

/**
 * Converts base64 string to raw binary data.
 * - Doesn't handle URLEncoded DataURIs
 * - See StackOverflow answer #6850276 for code that does this
 * This is to convert the base64 binary string to a blob
 * @author Code from devnull69 @ stackoverflow.com
 * @method _base64ToBlob
 * @param {String} dataURL Blob base64 dataurl.
 * @private
 * @since 0.1.0
 */
Skylink.prototype._base64ToBlob = function(dataURL) {
  var byteString = atob(dataURL.replace(/\s\r\n/g, ''));
  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var j = 0; j < byteString.length; j++) {
    ia[j] = byteString.charCodeAt(j);
  }
  // write the ArrayBuffer to a blob, and you're done
  return new Blob([ab]);
};

/**
 * Chunks blob data into chunks.
 * @method _chunkBlobData
 * @param {Blob} blob The blob data to chunk.
 * @param {Integer} blobByteSize The blob data size.
 * @private
 * @since 0.5.2
 */
Skylink.prototype._chunkBlobData = function(blob, blobByteSize) {
  var chunksArray = [],
    startCount = 0,
    endCount = 0;
  if (blobByteSize > this._CHUNK_FILE_SIZE) {
    // File Size greater than Chunk size
    while ((blobByteSize - 1) > endCount) {
      endCount = startCount + this._CHUNK_FILE_SIZE;
      chunksArray.push(blob.slice(startCount, endCount));
      startCount += this._CHUNK_FILE_SIZE;
    }
    if ((blobByteSize - (startCount + 1)) > 0) {
      chunksArray.push(blob.slice(startCount, blobByteSize - 1));
    }
  } else {
    // File Size below Chunk size
    chunksArray.push(blob);
  }
  return chunksArray;
};