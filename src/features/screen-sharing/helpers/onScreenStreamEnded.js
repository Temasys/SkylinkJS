import screenshareHelpers from './index';
import mediaStreamHelpers from '../../../media-stream/helpers';
import { updateReplacedStreamInState } from '../../../utils/helpers';
import ScreenSharing from '../index';
import logger from '../../../logger';
import MESSAGES from '../../../messages';
import SkylinkSignalingServer from '../../../server-communication/signaling-server/index';
import { TAGS, STREAM_STATUS } from '../../../constants';

const replaceScreenTrack = (state, peerIds, streams, streamId) => {
  const oldStream = streams.screenshare.stream;
  const newStream = streamId ? streams.userMedia[streamId].stream : mediaStreamHelpers.retrieveVideoStreams(state.room)[0];

  peerIds.forEach((peerId) => {
    mediaStreamHelpers.replaceTrack(oldStream, newStream, peerId, state);
  });
  updateReplacedStreamInState(oldStream, newStream, state, false);
};

const dispatchScreenEndedEvents = (room, user, stream) => {
  const options = mediaStreamHelpers.parseStreamSettings({ video: true });
  options.isScreensharing = true;
  new SkylinkSignalingServer().stream(room.id, user, stream, STREAM_STATUS.ENDED, options);

  // mediaStreamHelpers.onLocalStreamEnded(room.id, null, true, true, stream);
};

const onScreenEndedReplaceScreensharing = (state, stream, streamId) => {
  const {
    peerConnections, room, user, streams,
  } = state;
  const peerIds = Object.keys(peerConnections);

  // If userMedia streams have all been stopped and there are no streams to replace the screen share stream, dispatch stream ended events.
  if (!streams.userMedia) {
    dispatchScreenEndedEvents(room, user, stream);
    return null;
  }

  if (peerIds.length === 0) {
    return null;
  }

  replaceScreenTrack(state, peerIds, streams, streamId);
  dispatchScreenEndedEvents(room, user, stream);

  return true;
};

const onScreenStreamEnded = (state, stream, streamId) => {
  try {
    if (new ScreenSharing(state).isReplaceScreenStream()) {
      onScreenEndedReplaceScreensharing(state, stream, streamId);
      screenshareHelpers.handleScreenStreamStates.removeScreenStreamFromState(state);
    }
  } catch (error) {
    logger.log.ERROR([state.user.sid, TAGS.MEDIA_STREAM, null, MESSAGES.MEDIA_STREAM.ERRORS.STOP_SCREEN], error);
  }
};

export default onScreenStreamEnded;
