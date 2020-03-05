import clone from 'clone';
import Skylink from '../../..';
import { PEER_TYPE, SM_PROTOCOL_VERSION, DT_PROTOCOL_VERSION } from '../../../constants';
import { isABoolean, isANumber, isAString } from '../../../utils/helpers';
import parsers from './index';

const parseVersion = (version) => {
  if (!(version && typeof version === 'string')) {
    return 0;
  }
  // E.g. 0.9.6, replace minor "." with 0
  if (version.indexOf('.') > -1) {
    const parts = version.split('.');
    if (parts.length > 2) {
      const majorVer = parts[0] || '0';
      parts.splice(0, 1);
      return parseFloat(`${majorVer}.${parts.join('0')}`, 10);
    }
    return parseFloat(version || '0', 10);
  }
  return parseInt(version || '0', 10);
};


const enterAndWelcome = (msg) => {
  const state = Skylink.getSkylinkState(msg.rid);
  const parsedMsg = {};
  const { hasMCU } = state;
  const {
    rid,
    mid,
    enableIceRestart,
    enableDataChannel,
    weight,
    receiveOnly,
    publishOnly,
    agent,
    os,
    temasysPluginVersion,
    SMProtocolVersion,
    DTProtocolVersion,
    version,
    parentId,
    publisherId,
  } = msg;

  parsedMsg.publisherId = publisherId || null;
  parsedMsg.rid = rid;
  parsedMsg.mid = mid;
  parsedMsg.agent = agent && isAString(agent) ? agent : 'other';
  parsedMsg.version = parseVersion(version);
  parsedMsg.SMProtocolVersion = isAString(SMProtocolVersion) ? SMProtocolVersion : SM_PROTOCOL_VERSION;
  // eslint-disable-next-line no-nested-ternary
  parsedMsg.DTProtocolVersion = isAString(DTProtocolVersion) ? DTProtocolVersion : (hasMCU || mid === PEER_TYPE.MCU ? DT_PROTOCOL_VERSION : '0.1.0');
  parsedMsg.weight = isANumber(weight) ? weight : 0;
  parsedMsg.receiveOnly = receiveOnly && receiveOnly !== false;
  parsedMsg.enableDataChannel = isABoolean(enableDataChannel) ? enableDataChannel : true;
  parsedMsg.enableIceRestart = isABoolean(enableIceRestart) ? enableIceRestart : false;
  parsedMsg.os = os && isAString(os) ? os : null;
  parsedMsg.temasysPluginVersion = temasysPluginVersion && isAString(temasysPluginVersion) ? temasysPluginVersion : null;
  parsedMsg.publishOnly = !!publishOnly;
  parsedMsg.parentId = !!publishOnly && parentId && isAString(parentId) ? parentId : null;
  parsedMsg.userInfo = parsers.parseUserInfo(state, msg, parsedMsg);

  if (hasMCU) {
    parsedMsg.peersInRoom = msg.peersInRoom;
  }

  return clone(parsedMsg);
};

export default enterAndWelcome;
