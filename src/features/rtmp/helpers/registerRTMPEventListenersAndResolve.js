import { SkylinkConstants } from '../../../index';
import { addEventListener, removeEventListener } from '../../../utils/skylinkEventManager';

const registerRTMPEventListenersAndResolve = (isStartRTMPSession, resolve) => {
  const executeCallbackAndRemoveEvtListener = (evt) => {
    const result = evt.detail;
    const stateToCompare = isStartRTMPSession ? SkylinkConstants.RTMP_STATE.START : SkylinkConstants.RTMP_STATE.STOP;

    if (result.state === stateToCompare) {
      removeEventListener(SkylinkConstants.EVENTS.RTMP_STATE, executeCallbackAndRemoveEvtListener);
      resolve(result.rtmpId);
    }
  };

  addEventListener(SkylinkConstants.EVENTS.RTMP_STATE, executeCallbackAndRemoveEvtListener);
};

export default registerRTMPEventListenersAndResolve;
