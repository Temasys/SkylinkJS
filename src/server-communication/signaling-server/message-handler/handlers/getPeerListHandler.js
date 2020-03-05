import logger from '../../../../logger';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { GET_PEERS_STATE } from '../../../../constants';
import { getPeersStateChange } from '../../../../skylink-events';

/**
 * Function that handles the Signaling Server message from getPeers() method.
 * @param {JSON} message
 * @memberOf SignalingMessageHandler
 * @fires getPeersStateChange
 */
const getPeerListHandler = (message) => {
  const { result, type } = message;
  const peerList = result;
  logger.log.INFO(['Server', null, type, 'Received list of peers'], peerList);
  dispatchEvent(getPeersStateChange({
    state: GET_PEERS_STATE.DISPATCHED,
    privilegePeerId: null,
    peerList,
  }));
};

export default getPeerListHandler;
