import Skylink, { SkylinkConstants } from '../index';
import logger from '../logger';
import messages from '../messages';
import { GET_PEERS_STATE } from '../constants';
import SkylinkSignalingServer from '../server-communication/signaling-server';
import { dispatchEvent, removeEventListener, addEventListener } from '../utils/skylinkEventManager';
import { getPeersStateChange } from '../skylink-events';

/**
 * @classdesc Class that represents a Privilege Peer methods
 * @class
 * @private
 */
class PeerPrivileged {
  static shouldProceed(state, appKey, reject) {
    let errMsg = null;

    if (!state.isPrivileged) {
      errMsg = messages.PEER_PRIVILEGED.not_privileged;
    }

    if (!appKey) {
      errMsg = messages.PEER_PRIVILEGED.no_appkey;
    }

    if (errMsg) {
      logger.log.DEBUG(errMsg);
      reject(new Error(errMsg));
    }

    return !errMsg;
  }

  /**
   * Function that retrieves the list of Peer IDs from Rooms within the same App space.
   * @param {SkylinkRoom} room
   * @param {boolean} showAll
   * @return {Promise<object>}
   * @fires GET_PEERS_STATE_CHANGE
   */
  static getPeerList(room, showAll) {
    return new Promise((resolve, reject) => {
      try {
        const state = Skylink.getSkylinkState(room.id);
        const initOptions = Skylink.getInitOptions();
        const pShowAll = showAll || false;

        const executeCallbackAndRemoveEvtListener = (evt) => {
          const result = evt.detail;

          if (result.state === GET_PEERS_STATE.DISPATCHED) {
            removeEventListener(SkylinkConstants.EVENTS.GET_PEERS_STATE_CHANGE, executeCallbackAndRemoveEvtListener);

            dispatchEvent(getPeersStateChange({
              state: GET_PEERS_STATE.RECEIVED,
              privilegePeerId: state.user.sid,
              peerList: result.peerList,
            }));

            resolve(result.peerList);
          }
        };

        if (this.shouldProceed(state, initOptions.appKey, reject)) {
          new SkylinkSignalingServer().getPeerList(pShowAll);

          dispatchEvent(getPeersStateChange({
            state: GET_PEERS_STATE.ENQUIRED,
            privilegePeerId: state.user.sid,
            peerList: null,
          }));

          logger.log.INFO(messages.PEER_PRIVILEGED.getPeerListFromServer);

          addEventListener(SkylinkConstants.EVENTS.GET_PEERS_STATE_CHANGE, executeCallbackAndRemoveEvtListener);
        }
      } catch (error) {
        logger.log.ERROR(error);
        reject(error);
      }
    });
  }
}

export default PeerPrivileged;
