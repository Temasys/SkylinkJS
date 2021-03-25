import { MEDIA_TYPE, TAGS } from '../../../constants';
import stopStreamHelpers from '../../../media-stream/helpers/stopStream';
import logger from '../../../logger';
import MESSAGES from '../../../messages';
import mediaStreamHelpers from '../../../media-stream/helpers/index';

const retrievePeersScreenStreamId = (state) => {
  const { peerMedias, user } = state;
  const peersScreenStreamId = {};

  const peerIds = Object.keys(peerMedias).filter(peerId => peerId !== user.sid);
  for (let i = 0; i < peerIds.length; i += 1) {
    const peerId = peerIds[i];
    Object.values(peerMedias[peerId]).forEach((mInfo) => {
      if (mInfo.mediaType === MEDIA_TYPE.VIDEO_SCREEN) {
        peersScreenStreamId[peerId] = mInfo.streamId;
      }
    });
  }

  return peersScreenStreamId;
};

const stopScreenStream = (room, screenStream, peerId) => {
  const isScreensharing = true;
  stopStreamHelpers.prepStopStreams(room.id, screenStream.id, isScreensharing)
    .then(() => logger.log.DEBUG([peerId, TAGS.MEDIA_STREAM, null, `${MESSAGES.MEDIA_STREAM.STOP_SCREEN_SUCCESS}`]))
    .catch(error => logger.log.DEBUG([peerId, TAGS.MEDIA_STREAM, null, `${MESSAGES.MEDIA_STREAM.ERRORS.STOP_SCREEN}`], error));
};

const addScreenStreamCallbacks = (state, stream) => {
  const tracks = stream.getTracks();
  tracks.forEach((track) => {
    // eslint-disable-next-line no-param-reassign
    track.onended = () => stopScreenStream(state.room, stream, state.user.sid);
  });
};

const onScreenStreamAccessSuccess = (roomKey, stream, audioSettings, videoSettings, isAudioFallback, isScreensharing) => {
  mediaStreamHelpers.onStreamAccessSuccess(roomKey, stream, audioSettings, videoSettings, isAudioFallback, isScreensharing);
};

const helpers = {
  addScreenStreamCallbacks,
  retrievePeersScreenStreamId,
  stopScreenStream,
  onScreenStreamAccessSuccess,
};

export default helpers;
