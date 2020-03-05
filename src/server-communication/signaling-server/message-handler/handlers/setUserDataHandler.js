import logger from '../../../../logger/index';
import Skylink from '../../../../index';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { peerUpdated } from '../../../../skylink-events';
import PeerData from '../../../../peer-data/index';
import { isANumber } from '../../../../utils/helpers';
import MESSAGES from '../../../../messages';

/**
 * Function that handles the "updateUserEvent" socket message received.
 * See confluence docs for the "updateUserEvent" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @param {JSON} message
 * @param {String} message.type - SIG_MESSAGE_TYPE
 * @param {String} message.mid - The source peerId.
 * @param {String} message.rid - The roomkey.
 * @param {String|Object} message.userData - The updated peer userData.
 * @param {Number} message.stamp - The time stamp for the current updateUserEvent userData.
 * @member SignalingMessageHandler
 * @fires peerUpdated
 * @private
 */
const setUserDataHandler = (message) => {
  const {
    type, mid, rid, userData, stamp,
  } = message;
  const state = Skylink.getSkylinkState(rid);
  const { peerInformations, peerMessagesStamps } = state;
  const targetMid = mid;
  const { PEER_INFORMATIONS } = MESSAGES;

  let parsedUserData = userData.replace(/&quot;/g, '"');

  try {
    parsedUserData = JSON.parse(parsedUserData);
  } catch (err) {
    logger.log.INFO([targetMid, null, type, `${PEER_INFORMATIONS.USER_DATA_NOT_JSON}`], parsedUserData);
  } finally {
    logger.log.INFO([targetMid, null, type, `${PEER_INFORMATIONS.UPDATE_USER_DATA}`], parsedUserData);
  }

  if (!peerInformations[targetMid]) {
    logger.log.INFO([targetMid, null, type, `${PEER_INFORMATIONS.NO_PEER_INFO} ${targetMid}`]);
    return;
  }

  if (peerMessagesStamps[targetMid] && isANumber(stamp)) {
    if (stamp < peerMessagesStamps[targetMid].userData) {
      logger.log.WARN([targetMid, null, type, `${PEER_INFORMATIONS.OUTDATED_MSG}`], message);
      return;
    }
    peerMessagesStamps[targetMid].userData = stamp;
  }

  peerInformations[targetMid].userData = parsedUserData || {};

  dispatchEvent(peerUpdated({
    peerId: targetMid,
    peerInfo: PeerData.getPeerInfo(targetMid, state.room),
    isSelf: false,
  }));
};

export default setUserDataHandler;
