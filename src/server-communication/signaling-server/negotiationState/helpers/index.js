import processNewPeer from './processNewPeer';
import updateStateInformation from './updateStateInformation';
import getBufferedRemoteOffer from './getBufferedRemoteOffer';
import logInfoOrErrorAndSendStats from './logInfoOrErrorAndSendStats';
import bufferRemoteOffer from './bufferRemoteOffer';

const negotiationStateHelpers = {
  processNewPeer,
  updateStateInformation,
  getBufferedRemoteOffer,
  logInfoOrErrorAndSendStats,
  bufferRemoteOffer,
};

export default negotiationStateHelpers;
