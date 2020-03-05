import Skylink from '../../../index';
import stopStreamHelpers from './index';
import MESSAGES from '../../../messages';

// eslint-disable-next-line consistent-return
const prepStopStreams = (roomId, streamId, fromLeaveRoom = false, isScreensharing = false) => new Promise((resolve, reject) => {
  const state = Skylink.getSkylinkState(roomId);
  const { streams } = state;

  if (!state || !streams) {
    reject(new Error(`${MESSAGES.ROOM_STATE.NOT_FOUND} - ${roomId}`));
  }

  if (!streams || (!isScreensharing && !streams.userMedia) || (isScreensharing && !streams.screenshare) || (isScreensharing && streams.screenshare && (streams.screenshare.id !== streamId))) {
    reject(new Error(`${MESSAGES.MEDIA_STREAM.ERRORS.NO_STREAM} - ${streamId}`));
  }

  if (isScreensharing) {
    stopStreamHelpers.prepStopScreenStream(state.room, streamId, fromLeaveRoom)
      .then(() => resolve())
      .catch(rej => reject(rej));
  } else {
    stopStreamHelpers.prepStopUserMediaStreams(state, streamId, fromLeaveRoom)
      .then(() => resolve())
      .catch(rej => reject(rej));
  }
});

export default prepStopStreams;
