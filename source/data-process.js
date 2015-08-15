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
 * The size of a chunk that DataTransfer should use for DataURL.
 * @attribute _CHUNK_DATAURL_SIZE
 * @type Number
 * @private
 * @final
 * @required
 * @component DataProcess
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._CHUNK_DATAURL_SIZE = 1212;

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
Skylink.prototype._MOZ_CHUNK_FILE_SIZE = 12288;

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
 * Converts a Blob data to base64 string.
 * @method _blobToBase64
 * @param {Blob} data Blob data.
 * @param {Function} callback The callback fired when Blob is processed as string.
 * @private
 * @component DataProcess
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._blobToBase64 = function(data, callback) {
  var fileReader = new FileReader();
  fileReader.onload = function() {
    // Load Blob as dataurl base64 string
    var base64BinaryString = fileReader.result.split(',')[1];
    callback(base64BinaryString);
  };
  fileReader.readAsDataURL(data);
};

/**
 * Chunks a Blob into Blob chunks based on a fixed size.
 * @method _chunkBlobData
 * @param {Blob} blob The Blob data to chunk.
 * @param {Number} chunkSize The chunk size to chunk the Blob data into.
 * @private
 * @component DataProcess
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._chunkBlobData = function(blob, chunkSize) {
  var chunksArray = [];
  var startCount = 0;
  var endCount = 0;
  var blobByteSize = blob.size;

  if (blobByteSize > chunkSize) {
    // File Size greater than Chunk size
    while ((blobByteSize - 1) > endCount) {
      endCount = startCount + chunkSize;
      chunksArray.push(blob.slice(startCount, endCount));
      startCount += chunkSize;
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

/**
 * Chunks a DataURL into string chunks based on a fixed size.
 * @method _chunkDataURL
 * @param {String} dataURL The dataURL string to chunk.
 * @param {Number} chunkSize The chunk size to chunk the dataURL data into.
 * @private
 * @component DataProcess
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._chunkDataURL = function(dataURL, chunkSize) {
  var outputStr = encodeURIComponent(dataURL);
  var dataURLArray = [];
  var startCount = 0;
  var endCount = 0;
  var dataByteSize = dataURL.size || dataURL.length;

  if (dataByteSize > chunkSize) {
    // File Size greater than Chunk size
    while ((dataByteSize - 1) > endCount) {
      endCount = startCount + chunkSize;
      dataURLArray.push(outputStr.slice(startCount, endCount));
      startCount += chunkSize;
    }
    if ((dataByteSize - (startCount + 1)) > 0) {
      chunksArray.push(outputStr.slice(startCount, dataByteSize - 1));
    }
  } else {
    // File Size below Chunk size
    dataURLArray.push(outputStr);
  }

  return dataURLArray;
};

/**
 * Assembles the chunk array into a full DataURL string.
 * @method _assembleDataURL
 * @param {Array} dataURLArray The dataURL string chunk array.
 * @private
 * @component DataProcess
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._assembleDataURL = function(dataURLArray) {
  var outputStr = '';

  for (var i = 0; i < dataURLArray.length; i++) {
    outputStr += dataURLArray[i];
  }

  return decodeURIComponent(outputStr);
};