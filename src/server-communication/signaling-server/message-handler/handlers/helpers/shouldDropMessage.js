import PeerData from '../../../../../peer-data/index';
import { TAGS, SDK_VERSION } from '../../../../../constants';
import logger from '../../../../../logger/index';
import MESSAGES from '../../../../../messages';

const shouldDropMessage = (state, peerId) => {
  const peerInfo = PeerData.getPeerInfo(peerId, state);

  if (peerInfo.agent.SDKVersion && peerInfo.agent.SDKVersion === SDK_VERSION) {
    logger.log.INFO([peerId, TAGS.SIG_SERVER, null, MESSAGES.SIGNALING.DROPPING_MUTE_EVENT]);
    return true;
  }

  return false;
};

export default shouldDropMessage;
