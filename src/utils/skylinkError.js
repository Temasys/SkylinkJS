import logger from '../logger';
import { TAGS } from '../constants';

class SkylinkError {
  static throwError(errorLog = '', message = '') {
    logger.log.ERROR([null, TAGS.SKYLINK_ERROR, null, `${errorLog}${(message ? ` - ${message}` : '')}`]);
    throw new Error(`${errorLog}${(message ? ` - ${message}` : '')}`);
  }
}

export default SkylinkError;
