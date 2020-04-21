import parsers from './index';
import { TAGS, TRACK_KIND } from '../../../../constants';
import logger from '../../../../logger';
import messages from '../../../../messages';

const parseMedia = (state, output, type, value, peerConnection, peerId, isAutoBwStats, direction) => {
  const trackKind = value.kind || value.mediaType; // Safari uses mediaType key

  if (trackKind === TRACK_KIND.AUDIO) {
    parsers.parseAudio(state, output, type, value, peerId, isAutoBwStats, direction);
  } else if (trackKind === TRACK_KIND.VIDEO) {
    parsers.parseVideo(state, output, type, value, peerId, isAutoBwStats, direction);
  } else {
    logger.log.DEBUG([this.peerId, TAGS.STATS_MODULE, null, messages.STATS_MODULE.INVALID_TRACK_KIND], value);
  }
};

export default parseMedia;
