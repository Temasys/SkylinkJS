import logger from '../../logger';
import messages from '../../messages';
import { TAGS } from '../../constants';

const getSDPMediaSSRC = (targetMid, sessionDescription, beSilentOnLogs) => {
  const ssrcs = {
    audio: 0,
    video: 0,
  };

  if (!(sessionDescription && sessionDescription.sdp)) {
    return ssrcs;
  }

  sessionDescription.sdp.split('m=').forEach((mediaItem, index) => {
    // Ignore the v=0 lines etc..
    if (index === 0) {
      return;
    }

    const mediaType = (mediaItem.split(' ')[0] || '');
    const ssrcLine = (mediaItem.match(/a=ssrc:.*\r\n/) || [])[0];

    if (typeof ssrcs[mediaType] !== 'number') {
      return;
    }

    if (ssrcLine) {
      ssrcs[mediaType] = parseInt((ssrcLine.split('a=ssrc:')[1] || '').split(' ')[0], 10) || 0;
    }
  });

  if (!beSilentOnLogs) {
    logger.log.DEBUG([targetMid, TAGS.SESSION_DESCRIPTION, sessionDescription.type, messages.SESSION_DESCRIPTION.parsing_media_ssrc], ssrcs);
  }

  return ssrcs;
};

export default getSDPMediaSSRC;
