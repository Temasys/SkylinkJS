import messages from '../../../messages';

/**
 * Checks dependencies to start or stop an RTMP session
 * @param {boolean} isStartSession
 * @param {SkylinkState} roomState
 * @param {String|null} streamId
 * @param {String|null} endpoint
 * @private
 * @return {{shouldProceed: boolean, errorMessage: string}}
 */
const checkRTMPDependencies = (isStartSession, roomState, streamId = null, endpoint = null) => {
  const toReturn = { shouldProceed: true, errorMessage: '' };
  const { hasMCU } = roomState;

  if (!hasMCU) {
    toReturn.errorMessage = isStartSession ? messages.RTMP.start_no_mcu : messages.RTMP.stop_no_mcu;
    toReturn.shouldProceed = false;
    return toReturn;
  }

  if (isStartSession && !streamId) {
    toReturn.errorMessage = messages.RTMP.start_no_stream_id;
    toReturn.shouldProceed = false;
    return toReturn;
  }

  if (isStartSession && !endpoint) {
    toReturn.errorMessage = messages.RTMP.start_no_endpoint;
    toReturn.shouldProceed = false;
    return toReturn;
  }

  return toReturn;
};

export default checkRTMPDependencies;
