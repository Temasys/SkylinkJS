import Skylink from '../../index';
import SkylinkSignalingServer from '../../server-communication/signaling-server';
import helpers from './index';
import { dispatchEvent } from '../../utils/skylinkEventManager';
import { peerUpdated } from '../../skylink-events';
import logger from '../../logger';
import MESSAGES from '../../messages';

/**
 * @description Function that overwrites the User current custom data.
 * @private
 * @param {SkylinkRoom} room
 * @param {string | Object} userData
 * @memberOf PeerDataHelpers
 * @fires peerUpdated
 */
const setUserData = (room, userData) => {
  const roomState = Skylink.getSkylinkState(room.id);
  const { PEER_INFORMATIONS: { UPDATE_USER_DATA } } = MESSAGES;

  let updatedUserData = userData;

  if (!updatedUserData) {
    updatedUserData = '';
  }

  roomState.userData = updatedUserData;

  new SkylinkSignalingServer().setUserData(roomState);

  dispatchEvent(peerUpdated({
    peerId: roomState.user.sid,
    peerInfo: helpers.getCurrentSessionInfo(room),
    isSelf: true,
  }));

  Skylink.setSkylinkState(roomState, roomState.room.id);
  logger.log.INFO(UPDATE_USER_DATA, updatedUserData);
};

export default setUserData;
