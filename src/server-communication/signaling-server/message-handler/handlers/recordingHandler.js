import HandleRecordingStats from '../../../../skylink-stats/handleRecordingStats';
import logger from '../../../../logger';
import { getStateByRid } from '../../../../utils/helpers';
import MESSAGES from '../../../../messages';
import Skylink from '../../../../index';
import { recordingState } from '../../../../skylink-events';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { PEER_TYPE, RECORDING_STATE, TAGS } from '../../../../constants';

const handleRecordingStats = new HandleRecordingStats();

const dispatchRecordingEvent = (state, recordingId, error) => {
  const detail = {
    state,
    recordingId,
  };

  if (error) {
    detail.error = error;
  }

  dispatchEvent(recordingState(detail));
};

/**
 * Recording successfully started
 * @param {SkylinkState} roomState
 * @param {number} recordingId
 * @private
 */
const recordingStarted = (roomState, recordingId) => {
  const updatedRoomState = Object.assign({}, roomState);
  const { room } = updatedRoomState;

  logger.log.DEBUG([PEER_TYPE.MCU, TAGS.RECORDING, recordingId, MESSAGES.RECORDING.START_SUCCESS]);

  handleRecordingStats.send(room.id, MESSAGES.STATS_MODULE.HANDLE_RECORDING_STATS.START, recordingId, null, null);

  updatedRoomState.currentRecordingId = recordingId;

  updatedRoomState.recordings[recordingId] = {
    active: true,
    state: RECORDING_STATE.START,
    startedDateTime: (new Date()).toISOString(),
    endedDateTime: null,
    error: null,
  };

  updatedRoomState.recordingStartInterval = setTimeout(() => {
    logger.log.INFO([PEER_TYPE.MCU, TAGS.RECORDING, recordingId, MESSAGES.RECORDING.MIN_RECORDING_TIME_REACHED]);
    updatedRoomState.recordingStartInterval = null;
  }, 4000);

  Skylink.setSkylinkState(updatedRoomState, room.id);
  dispatchRecordingEvent(RECORDING_STATE.START, recordingId);
};

/**
 * Recording successfully stopped
 * @param {SkylinkState} roomState
 * @param {number} recordingId
 * @private
 */
const recordingStopped = (roomState, recordingId) => {
  const updatedRoomState = Object.assign({}, roomState);
  const { room, recordings } = updatedRoomState;

  handleRecordingStats.send(room.id, MESSAGES.STATS_MODULE.HANDLE_RECORDING_STATS.STOP, recordingId, null, null);

  if (!recordings[recordingId]) {
    logger.log.ERROR([PEER_TYPE.MCU, TAGS.RECORDING, recordingId, MESSAGES.RECORDING.ERRORS.SESSION_EMPTY]);
    return null;
  }

  updatedRoomState.currentRecordingId = null;

  if (updatedRoomState.recordingStartInterval) {
    clearTimeout(updatedRoomState.recordingStartInterval);
    logger.log.WARN([PEER_TYPE.MCU, TAGS.RECORDING, recordingId, MESSAGES.RECORDING.ERRORS.STOP_ABRUPT]);
    updatedRoomState.recordingStartInterval = null;
  }

  logger.log.DEBUG([PEER_TYPE.MCU, TAGS.RECORDING, recordingId, MESSAGES.RECORDING.STOP_SUCCESS]);

  updatedRoomState.recordings[recordingId].active = false;
  updatedRoomState.recordings[recordingId].state = RECORDING_STATE.STOP;
  updatedRoomState.recordings[recordingId].endedDateTime = (new Date()).toISOString();

  Skylink.setSkylinkState(updatedRoomState, room.id);
  dispatchRecordingEvent(RECORDING_STATE.STOP, recordingId);

  return null;
};

const recordingHandler = (message) => {
  const {
    action, rid, recordingId, error,
  } = message;
  const roomState = getStateByRid(rid);

  if (action === 'on') {
    recordingStarted(roomState, recordingId);
  } else if (action === 'off') {
    recordingStopped(roomState, recordingId);
  } else if (action === 'error') {
    dispatchRecordingEvent(RECORDING_STATE.ERROR, recordingId, error);
    logger.log.ERROR([PEER_TYPE.MCU, TAGS.RECORDING, recordingId, MESSAGES.RECORDING.ERRORS.MCU_RECORDING_ERROR], error);
    handleRecordingStats.send(roomState.room.id, MESSAGES.STATS_MODULE.HANDLE_RECORDING_STATS.MCU_RECORDING_ERROR, recordingId, null, error);
  }
};

export default recordingHandler;
