/**
 * The size of a chunk that DataTransfer should chunk a Blob into.
 * @attribute _CHUNK_FILE_SIZE
 * @type Number
 * @private
 * @final
 * @required
 * @component DataProcess
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._CHUNK_FILE_SIZE = 49152;

/**
 * The size of a chunk that DataTransfer should chunk a Blob into specifically for Firefox
 * based browsers.
 * - Tested: Sends <code>49152</code> kb | Receives <code>16384</code> kb.
 * @attribute _MOZ_CHUNK_FILE_SIZE
 * @type Number
 * @private
 * @final
 * @required
 * @component DataProcess
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._MOZ_CHUNK_FILE_SIZE = 16384;

/**
 * The list of DataTransfer native data types that would be transfered with.
 * - Not Implemented: <code>ARRAY_BUFFER</code>, <code>BLOB</code>.
 * @attribute DATA_TRANSFER_DATA_TYPE
 * @type JSON
 * @param {String} BINARY_STRING BinaryString data type.
 * @param {String} ARRAY_BUFFER ArrayBuffer data type.
 * @param {String} BLOB Blob data type.
 * @readOnly
 * @component DataProcess
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.DATA_TRANSFER_DATA_TYPE = {
  BINARY_STRING: 'binaryString',
  ARRAY_BUFFER: 'arrayBuffer',
  BLOB: 'blob'
};

/**
 * Converts a Base64 encoded string to a Blob.
 * - Not Implemented: Handling of URLEncoded DataURIs.
 * @author devnull69@stackoverflow.com #6850276
 * @method _base64ToBlob
 * @param {String} dataURL Blob base64 dataurl.
 * @private
 * @component DataProcess
 * @for Skylink
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
 * Chunks a Blob into Blob chunks based on a fixed size.
 * @method _chunkBlobData
 * @param {Blob} blob The Blob data to chunk.
 * @param {Number} blobByteSize The original Blob data size.
 * @private
 * @component DataProcess
 * @for Skylink
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