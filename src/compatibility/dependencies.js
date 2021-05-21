import MESSAGES from '../messages';
import logger from '../logger';
import { READY_STATE_CHANGE_ERROR, BROWSER_AGENT } from '../constants';
import { isAgent } from '../utils/helpers';

/**
 * @private
 * @description Checks for the dependencies required for SkylinkJS
 * @memberOf module:Compatibility
 * @return {{fulfilled: boolean, message: string}}
 */
const validateDependencies = () => {
  const dependencies = {
    fulfilled: true,
    message: '',
  };
  const { AdapterJS, io, fetch } = window;
  const header = 'Validating Dependencies';
  if (typeof (AdapterJS || window.AdapterJS || window.AdapterJS || {}).webRTCReady !== 'function') {
    dependencies.message = MESSAGES.INIT.ERRORS.NO_ADAPTER;
    dependencies.fulfilled = false;
    dependencies.readyStateChangeErrorCode = READY_STATE_CHANGE_ERROR.ADAPTER_NO_LOADED;
  } else if (!(io || window.io)) {
    dependencies.message = MESSAGES.INIT.ERRORS.NO_SOCKET_IO;
    dependencies.fulfilled = false;
    dependencies.readyStateChangeErrorCode = READY_STATE_CHANGE_ERROR.NO_SOCKET_IO;
  } else if (!fetch || !window.fetch) {
    dependencies.message = MESSAGES.INIT.ERRORS.NO_FETCH_SUPPORT;
    dependencies.fulfilled = false;
    dependencies.readyStateChangeErrorCode = READY_STATE_CHANGE_ERROR.NO_XMLHTTPREQUEST_SUPPORT;
  }
  if (!((isAgent(BROWSER_AGENT.FIREFOX) && AdapterJS.webrtcDetectedType === 'moz') || isAgent(BROWSER_AGENT.SAFARI) || (isAgent(BROWSER_AGENT.CHROME) && AdapterJS.webrtcDetectedType === 'webkit') || (isAgent(BROWSER_AGENT.CHROME) && AdapterJS.webrtcDetectedType === 'AppleWebKit') || isAgent(BROWSER_AGENT.REACT_NATIVE))) {
    logger.log.WARN([header, null, null, MESSAGES.INIT.INCOMPATIBLE_BROWSER]);
  }
  if (!dependencies.fulfilled) {
    logger.log.ERROR([header, null, null, dependencies.message]);
  }
  return dependencies;
};

export default validateDependencies;
