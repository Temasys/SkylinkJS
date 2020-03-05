import MESSAGES from '../messages';
import logger from '../logger';
import { READY_STATE_CHANGE_ERROR } from '../constants';

/**
 * @private
 * @description Checks for the dependencies required for SkylinkJS
 * @memberOf module:Compatibility
 * @return {{fulfilled: boolean, message: string}}
 */
const validateDepencies = () => {
  const dependencies = {
    fulfilled: true,
    message: '',
  };
  const { AdapterJS, io, fetch } = window;
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
  if (!dependencies.fulfilled) {
    logger.log.ERROR(['Validating Dependencies', null, null, dependencies.message]);
  }
  return dependencies;
};

export default validateDepencies;
