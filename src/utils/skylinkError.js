import logger from '../logger';

class SkylinkError {
  static throwError(peerId, tag, errorLog = '', message = '', data) {
    logger.log.ERROR([peerId, tag, null, `${errorLog}${(message ? ` - ${message}` : '')}`], data);
    throw new Error(`${errorLog}${(message ? ` - ${message}` : '')}`);
  }
}

export default SkylinkError;
