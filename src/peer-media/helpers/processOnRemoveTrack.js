import {
  BROWSER_AGENT, MEDIA_TYPE, TAGS, TRACK_KIND,
} from '../../constants';
import PeerConnectionCallbacks from '../../peer-connection/helpers/peer-addition/callbacks';
import logger from '../../logger';
import MESSAGES from '../../messages';

const processOnRemoveTrack = (state, peerId, clonedMediaInfo) => {
  const { AdapterJS } = window;
  if (AdapterJS.webrtcDetectedBrowser === BROWSER_AGENT.REACT_NATIVE && clonedMediaInfo) {
    const { room } = state;
    const trackInfo = {
      track: {
        id: null,
        kind: null,
      },
    };
    const stream = {
      id: null,
    };
    trackInfo.track.id = clonedMediaInfo.trackId;
    trackInfo.track.kind = (clonedMediaInfo.mediaType === MEDIA_TYPE.AUDIO || clonedMediaInfo.mediaType === MEDIA_TYPE.AUDIO_MIC) ? TRACK_KIND.AUDIO : TRACK_KIND.VIDEO;
    stream.id = clonedMediaInfo.streamId;
    trackInfo.track.target = stream;
    if (!(trackInfo.track.id || trackInfo.track.kind || stream.id)) {
      logger.log.DEBUG([peerId, TAGS.MEDIA_STREAM, null, `${MESSAGES.BROWSER_AGENT.REACT_NATIVE.ERRORS.DROPPING_ONREMOVETRACK}`], trackInfo);
      return;
    }
    PeerConnectionCallbacks.onremovetrack(peerId, room, clonedMediaInfo.mediaType === MEDIA_TYPE.VIDEO_SCREEN, trackInfo);
  }
};

export default processOnRemoveTrack;
