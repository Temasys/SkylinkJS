import Skylink from '../../../index';
import stopStreamHelpers from './index';
import MESSAGES from '../../../messages';

// eslint-disable-next-line consistent-return
const prepStopStreams = (roomId, streamId, isScreensharing = false) => new Promise((resolve, reject) => {
  const state = Skylink.getSkylinkState(roomId);
  const { user, peerStreams } = state;
  if (!state) {
    reject(new Error(`${MESSAGES.ROOM_STATE.NOT_FOUND} - ${roomId}`));
  }

  if (!peerStreams[user.sid] || (streamId && !peerStreams[user.sid][streamId])) {
    reject(new Error(`${MESSAGES.MEDIA_STREAM.ERRORS.NO_STREAM} - ${streamId}`));
  }

  if (isScreensharing) {
    stopStreamHelpers.prepStopScreenStream(state.room, streamId)
      .then(() => resolve())
      .catch(rej => reject(rej));
  } else {
    stopStreamHelpers.prepStopUserMediaStreams(state, streamId)
      .then(() => resolve())
      .catch(rej => reject(rej));
  }
});

export default prepStopStreams;
