/* eslint-disable import/prefer-default-export */
/**
 * @module Compatibility
 * @private
 */

import validateDepencies from './dependencies';
import getConnectionPortsAndProtocolByBrowser from './ice-connection';
import updateRemoveStream from './peer-connection';

export {
  validateDepencies,
  getConnectionPortsAndProtocolByBrowser,
  updateRemoveStream,
};
