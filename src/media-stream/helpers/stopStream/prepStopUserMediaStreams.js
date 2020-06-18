import logger from '../../../logger';
import { TAGS } from '../../../constants';
import MESSAGES from '../../../messages';
import stopStreamHelpers from './index';
import PeerMedia from '../../../peer-media';

const retrieveUserMediaStreams = (state) => {
  const { peerStreams, user, room } = state;
  const streamIds = Object.keys(peerStreams[user.sid]);
  const streams = streamIds.map((id) => {
    if (!PeerMedia.retrieveScreenMediaInfo(room, user.sid, { streamId: id })) {
      return peerStreams[user.sid][id];
    }
    return null;
  });

  return streams.filter(i => i !== null);
};

// eslint-disable-next-line consistent-return
const prepStopUserMediaStreams = (state, streamId, fromLeaveRoom) => new Promise((resolve, reject) => {
  const { user, peerStreams } = state;
  const mediaStreams = retrieveUserMediaStreams(state);
  const isScreensharing = false;

  try {
    if (!streamId) {
      stopStreamHelpers.stopAddedStreams(state, mediaStreams, isScreensharing, fromLeaveRoom);
    } else {
      const { stream } = peerStreams[user.sid][streamId];
      stopStreamHelpers.stopAddedStream(state, stream, isScreensharing, fromLeaveRoom);
    }

    return stopStreamHelpers.initRefreshConnectionAndResolve(state.room, fromLeaveRoom, resolve, reject);
  } catch (error) {
    logger.log.DEBUG([user.sid, TAGS.MEDIA_STREAM, null, MESSAGES.MEDIA_STREAM.ERRORS.STOP_USER_MEDIA], error);
    reject(MESSAGES.MEDIA_STREAM.ERRORS.STOP_USER_MEDIA);
  }
});


export default prepStopUserMediaStreams;
