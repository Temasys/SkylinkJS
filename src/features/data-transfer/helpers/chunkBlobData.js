import logger from '../../../logger';
import { TAGS } from '../../../constants';
import MESSAGES from '../../../messages';

const chunkBlobData = (blob, chunkSize) => {
  const chunksArray = [];
  const blobByteSize = blob.size;
  let startCount = 0;
  let endCount = 0;

  logger.log.DEBUG([null, TAGS.DATA_CHANNEL, null, MESSAGES.DATA_CHANNEL.CHUNKING_BLOB]);

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

export default chunkBlobData;
