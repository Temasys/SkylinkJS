import logger from '../../../../logger';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { onIncomingMessage } from '../../../../skylink-events';
import PeerData from '../../../../peer-data';
import Skylink from '../../../../index';

const peerMessageFromSignalingHandler = (message, isPublic) => {
  const {
    mid,
    type,
    data,
    target,
    rid,
  } = message;
  const roomState = Skylink.getSkylinkState(rid);

  logger.log.INFO([mid, null, type, `Received ${isPublic ? 'public' : 'private'} message from peer: `], data);

  dispatchEvent(onIncomingMessage({
    room: roomState.room,
    message: {
      content: data,
      isPrivate: !isPublic,
      targetPeerId: !isPublic ? target : null,
      isDataChannel: false,
      senderPeerId: mid,
    },
    isSelf: false,
    peerId: mid,
    peerInfo: PeerData.getPeerInfo(mid, roomState),
  }));
};

export default peerMessageFromSignalingHandler;
