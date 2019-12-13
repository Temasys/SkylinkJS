import helpers from './helpers';
import { generateUUID } from '../../utils/helpers';
import logger from '../../logger';
import messages from '../../messages';
import { PEER_TYPE } from '../../constants';

class RTMP {
  /**
   * Start an RTMP session
   * @param {SkylinkState} roomState
   * @param {String} streamId
   * @param {String} endpoint
   */
  static startSession(roomState, streamId, endpoint) {
    return this.commonRTMPOperations(roomState, streamId, null, endpoint, true, messages.RTMP.starting_rtmp);
  }

  /**
   * Stop a RTMP Session
   * @param {SkylinkState} roomState
   * @param {String} rtmpId
   */
  static stopSession(roomState, rtmpId) {
    return this.commonRTMPOperations(roomState, null, rtmpId, null, false, messages.RTMP.stopping_rtmp);
  }

  static logErrorAndReject(error, reject) {
    logger.log.ERROR(error);
    reject(error);
  }

  static commonRTMPOperations(roomState, streamId, rtmpId, endpoint, isStartRTMPSession, msg) {
    return new Promise((resolve, reject) => {
      try {
        const result = helpers.checkRTMPDependencies(isStartRTMPSession, roomState, streamId, endpoint);
        const gRtmpId = rtmpId || generateUUID();

        if (result.shouldProceed) {
          helpers.registerRTMPEventListenersAndResolve(isStartRTMPSession, resolve);
          helpers.sendRTMPMessageViaSig(roomState, isStartRTMPSession, gRtmpId, streamId, endpoint);
          logger.log.INFO([PEER_TYPE.MCU, 'RTMP', msg]);
        } else {
          this.logErrorAndReject(new Error(result.errorMessage), reject);
        }
      } catch (error) {
        this.logErrorAndReject(error, reject);
      }
    });
  }
}

export default RTMP;
