import logger from '../../logger';
import MESSAGES from '../../messages';
import HandleRecordingStats from '../../skylink-stats/handleRecordingStats';
import { SkylinkConstants } from '../../index';
import { addEventListener, removeEventListener } from '../../utils/skylinkEventManager';
import SkylinkSignalingServer from '../../server-communication/signaling-server';
import { PEER_TYPE } from '../../constants';

const sendRecordingMessageViaSig = (roomState, isStartRecording, currentRecordingId = null) => {
  const signaling = new SkylinkSignalingServer();
  const handleRecordingStats = new HandleRecordingStats();

  signaling.recording(roomState.room.id, isStartRecording ? SkylinkConstants.SIG_MESSAGE_TYPE.START_RECORDING : SkylinkConstants.SIG_MESSAGE_TYPE.STOP_RECORDING);
  handleRecordingStats.send(roomState.room.id, isStartRecording ? MESSAGES.STATS_MODULE.HANDLE_RECORDING_STATS.REQUEST_START : MESSAGES.STATS_MODULE.HANDLE_RECORDING_STATS.REQUEST_STOP, currentRecordingId, null, null);
};

const manageRecordingEventListeners = (resolve, isStartRecording) => {
  const executeCallbackAndRemoveEvtListener = (evt) => {
    const result = evt.detail;
    const stateToCompare = isStartRecording ? SkylinkConstants.RECORDING_STATE.START : SkylinkConstants.RECORDING_STATE.STOP;

    if (result.state === stateToCompare) {
      removeEventListener(SkylinkConstants.EVENTS.RECORDING_STATE, executeCallbackAndRemoveEvtListener);
      resolve(result.recordingId);
    }
  };

  addEventListener(SkylinkConstants.EVENTS.RECORDING_STATE, executeCallbackAndRemoveEvtListener);
};

const manageErrorStatsAndCallback = (roomState, errorMessage, statsKey, currentRecordingId = null, recordings = null) => {
  const handleRecordingStats = new HandleRecordingStats();
  logger.log.ERROR(errorMessage);
  handleRecordingStats.send(roomState.room.id, statsKey, currentRecordingId, recordings, errorMessage);
  return new Error(errorMessage);
};

/**
 * @param {SkylinkState} roomState
 * @param {boolean} isStartRecording
 * @private
 */
// eslint-disable-next-line consistent-return
const commonRecordingOperations = (roomState, isStartRecording) => new Promise((resolve, reject) => {
  const {
    currentRecordingId, recordingStartInterval, peerConnections, hasMCU,
  } = roomState;
  const errorMessage = isStartRecording ? MESSAGES.RECORDING.START_FAILED : MESSAGES.RECORDING.STOP_FAILED;

  if (isStartRecording && currentRecordingId) {
    const error = manageErrorStatsAndCallback(roomState, `${errorMessage} - ${MESSAGES.RECORDING.ERRORS.EXISTING_RECORDING_IN_PROGRESS}`, MESSAGES.STATS_MODULE.HANDLE_RECORDING_STATS.ERROR_START_ACTIVE, currentRecordingId, null);
    return reject(error);
  }

  if (isStartRecording && !hasMCU && peerConnections[PEER_TYPE.REC_SRV]) {
    const error = manageErrorStatsAndCallback(roomState, `${errorMessage} - ${MESSAGES.RECORDING.ERRORS.REC_SERVER_UNAVAILABLE}`, MESSAGES.STATS_MODULE.HANDLE_RECORDING_STATS.REC_SERVER_UNAVAILABLE, currentRecordingId || null, null);
    return reject(error);
  }

  if (!isStartRecording && !currentRecordingId) {
    const error = manageErrorStatsAndCallback(roomState, `${errorMessage} - ${MESSAGES.RECORDING.ERRORS.NO_RECORDING_IN_PROGRESS}`, MESSAGES.STATS_MODULE.HANDLE_RECORDING_STATS.ERROR_STOP_ACTIVE, currentRecordingId, null);
    return reject(error);
  }

  if (!isStartRecording && recordingStartInterval) {
    const error = manageErrorStatsAndCallback(roomState, `${errorMessage} - ${MESSAGES.RECORDING.ERRORS.MIN_RECORDING_TIME}`, MESSAGES.STATS_MODULE.HANDLE_RECORDING_STATS.ERROR_MIN_STOP, currentRecordingId, null);
    return reject(error);
  }

  manageRecordingEventListeners(resolve, isStartRecording);
  sendRecordingMessageViaSig(roomState, isStartRecording, currentRecordingId);
});

/**
 * The current room's Skylink state
 * @param {SkylinkState} roomState
 * @private
 */
export const startRecording = roomState => commonRecordingOperations(roomState, true);

/**
 * The current room's Skylink state
 * @param {SkylinkState} roomState
 * @private
 */
export const stopRecording = roomState => commonRecordingOperations(roomState, false);