import Skylink from '../../../../index';
import logger from '../../../../logger';
import messages from '../../../../messages';
import { RTMP_STATE, PEER_TYPE } from '../../../../constants';
import { getStateByRid } from '../../../../utils/helpers';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { rtmpState } from '../../../../skylink-events';

const ACTION = {
  START_SUCCESS: 'startSuccess',
  STOP_SUCCESS: 'stopSuccess',
};

const rtmpSessionStartSuccess = (roomState, message) => {
  const { rtmpSessions } = roomState;
  const { rtmpId, peerId, streamId } = message;

  if (!rtmpSessions[rtmpId]) {
    const updatedState = Object.assign({}, roomState);
    logger.log.DEBUG([PEER_TYPE.MCU, 'RTMP', messages.RTMP.started_success]);

    updatedState.rtmpSessions[rtmpId] = {
      active: true,
      state: RTMP_STATE.START,
      startedDateTime: (new Date()).toISOString(),
      endedDateTime: null,
      peerId,
      streamId,
    };

    dispatchEvent(rtmpState({
      state: RTMP_STATE.START,
      rtmpId,
      error: null,
    }));

    Skylink.setSkylinkState(updatedState, updatedState.room.id);
  }
  return null;
};

const rtmpSessionStopSuccess = (roomState, message) => {
  const { rtmpSessions } = roomState;
  const { rtmpId } = message;
  const updatedState = Object.assign({}, roomState);

  if (!rtmpSessions[rtmpId]) {
    logger.log.DEBUG([PEER_TYPE.MCU, 'RTMP', messages.RTMP.stop_session_empty]);
    return false;
  }

  logger.log.DEBUG([PEER_TYPE.MCU, 'RTMP', messages.RTMP.stopped_success]);

  updatedState.rtmpSessions[rtmpId].active = false;
  updatedState.rtmpSessions[rtmpId].state = RTMP_STATE.STOP;
  updatedState.rtmpSessions[rtmpId].endedDateTime = (new Date()).toISOString();

  dispatchEvent(rtmpState({
    state: RTMP_STATE.STOP,
    rtmpId,
    error: null,
  }));

  Skylink.setSkylinkState(updatedState, updatedState.room.id);
  return null;
};

const rtmpSessionFailed = (roomState, message) => {
  const { error, rtmpId } = message;
  const { rtmpSessions } = roomState;
  const rtmpError = new Error(error || 'Unkown Error');
  const updatedState = Object.assign({}, roomState);

  if (!rtmpSessions[rtmpId]) {
    logger.log.DEBUG([PEER_TYPE.MCU, 'RTMP', messages.RTMP.error_session_empty]);
    return null;
  }

  logger.log.DEBUG([PEER_TYPE.MCU, 'RTMP', messages.RTMP.error_session]);

  updatedState.rtmpSessions[rtmpId].state = RTMP_STATE.ERROR;
  updatedState.rtmpSessions[rtmpId].error = rtmpError;

  if (rtmpSessions[rtmpId].active) {
    logger.log.DEBUG([PEER_TYPE.MCU, 'RTMP', messages.RTMP.error_Session_abrupt]);
    updatedState.rtmpSessions[rtmpId].active = false;
  }

  dispatchEvent(rtmpState({
    state: RTMP_STATE.ERROR,
    rtmpId,
    error: rtmpError,
  }));

  Skylink.setSkylinkState(updatedState, updatedState.room.id);
  return null;
};

const rtmpHandler = (message) => {
  const { action, rid } = message;
  const roomState = getStateByRid(rid);

  logger.log.DEBUG([PEER_TYPE.MCU, 'RTMP', null, messages.RTMP.message_received_from_sig]);

  if (action === ACTION.START_SUCCESS) {
    rtmpSessionStartSuccess(roomState, message);
  } else if (action === ACTION.STOP_SUCCESS) {
    rtmpSessionStopSuccess(roomState, message);
  } else {
    rtmpSessionFailed(roomState, message);
  }
};

export default rtmpHandler;
