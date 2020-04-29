/* eslint-disable prefer-destructuring */
import logger from '../../logger';

const getTransceiverMid = (sessionDescription, beSilentOnParseLogs) => {
  const results = {
    audio: [],
    video: [],
  };

  sessionDescription.sdp.split('m=').forEach((mediaItem, index) => {
    const msidLines = mediaItem.split(/\n/);
    const mediaType = msidLines[0].split(' ')[0];
    if (mediaType === 'application' || index === 0) {
      return;
    }
    let parsedMline = {};
    for (let i = 0; i < msidLines.length; i += 1) {
      if (msidLines[i].match(/a=recvonly|a=sendonly|a=sendrecv|a=inactive/)) {
        const array = msidLines[i].split('=');
        parsedMline.direction = array[1].trim();
      }

      if (msidLines[i].match(/a=mid:*/)) {
        parsedMline.transceiverMid = msidLines[i].split(/:/)[1].trim();
      }
      if (msidLines[i].match(/a=msid:([\w|-|{]+)/)) { // include '{' character for firefox sdp parsing
        const array = msidLines[i].split(' ');
        const firstItem = array[0].split(/:/)[1].trim();
        parsedMline.streamId = firstItem === '-' ? '' : firstItem;
        parsedMline.trackId = array[1].trim();
      }
      if (parsedMline.transceiverMid && parsedMline.streamId && parsedMline.trackId) {
        results[mediaType].push(parsedMline);
        parsedMline = {};
      }
    }
  });

  if (!beSilentOnParseLogs) {
    logger.log.INFO([null, 'RTCSessionDesription', sessionDescription.type,
      `Parsing session description "${sessionDescription.type}" transceivers ->`], results);
  }

  return results;
};

export default getTransceiverMid;
