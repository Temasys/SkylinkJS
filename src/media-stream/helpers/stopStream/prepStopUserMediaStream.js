import logger from '../../../logger';
import { TAGS } from '../../../constants';
import MESSAGES from '../../../messages';
import stopStreamHelpers from './index';

const hasStreamBeenReplaced = (state, stoppedStream) => {
  const { streams } = state;

  if (!streams.userMedia) {
    return false;
  }

  const streamObjs = Object.values(streams.userMedia);

  return streamObjs.some(streamObj => streamObj.isReplaced && (streamObj.id === stoppedStream.id));
};

const filterUserMediaStreams = (state) => {
  const { streams } = state;
  const filteredStreams = {
    replacedStreams: [],
    addedStreams: [],
  };
  const streamIds = Object.keys(streams.userMedia);
  streamIds.forEach((userMediaStreamId) => {
    if (hasStreamBeenReplaced(state, streams.userMedia[userMediaStreamId].stream)) {
      filteredStreams.replacedStreams.push(streams.userMedia[userMediaStreamId].stream);
    } else {
      filteredStreams.addedStreams.push(streams.userMedia[userMediaStreamId].stream);
    }
  });

  return filteredStreams;
};

const prepStopUserMediaStream = (state, streamId, fromLeaveRoom) => {
  const { user } = state;
  const filteredStreams = filterUserMediaStreams(state);
  const isScreensharing = false;

  try {
    if (!streamId) {
      stopStreamHelpers.stopAddedStreams(state, filteredStreams.addedStreams, isScreensharing, fromLeaveRoom);

      // TODO:
      // added streams must be stopped first and renegotiation started before replaced streams are stopped
      // add event listener to listen for handshake offer to trigger stopReplacedStreams

      stopStreamHelpers.stopReplacedStreams(state, filteredStreams.replacedStreams, isScreensharing, fromLeaveRoom);
    } else {
      const { stream } = state.streams.userMedia[streamId];
      if (hasStreamBeenReplaced(state, stream)) {
        // TODO
        stopStreamHelpers.stopReplacedStream(state, stream, fromLeaveRoom);
      } else {
        stopStreamHelpers.stopAddedStream(state, stream, isScreensharing, fromLeaveRoom);
      }
    }

    stopStreamHelpers.initRefreshConnection(state.room, fromLeaveRoom);
  } catch (error) {
    logger.log.ERROR([user.sid, TAGS.MEDIA_STREAM, null, MESSAGES.MEDIA_STREAM.ERRORS.STOP_USER_MEDIA], error);
  }
};

export default prepStopUserMediaStream;
