import parsers from './index';
import { TRACK_KIND } from '../../../../constants';

const parseMedia = (state, output, type, value, peerConnection, peerId, isAutoBwStats, direction) => {
  const trackKind = value.kind;

  if (trackKind === TRACK_KIND.AUDIO) {
    parsers.parseAudio(state, output, type, value, peerId, isAutoBwStats, direction);
  } else {
    parsers.parseVideo(state, output, type, value, peerId, isAutoBwStats, direction);
  }
};

export default parseMedia;
