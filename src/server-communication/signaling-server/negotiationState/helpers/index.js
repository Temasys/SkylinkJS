import processNewPeer from './processNewPeer';
import updateStateInformation from './updateStateInformation';
import getBufferedRemoteOffer from './getBufferedRemoteOffer';
import logInfoOrErrorAndSendStats from './logInfoOrErrorAndSendStats';
import bufferRemoteOffer from './bufferRemoteOffer';
import checkAndApplyBufferedRestart from './checkAndApplyBufferedRestart';

const negotiationStateHelpers = {
  processNewPeer,
  updateStateInformation,
  getBufferedRemoteOffer,
  logInfoOrErrorAndSendStats,
  bufferRemoteOffer,
  checkAndApplyBufferedRestart,
};

export default negotiationStateHelpers;
