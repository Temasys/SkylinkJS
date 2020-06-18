import { getStateByRid } from '../../../../utils/helpers';
import * as constants from '../../../../constants';
import { streamEnded } from '../../../../skylink-events';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import PeerData from '../../../../peer-data/index';
import Skylink from '../../../../index';

/**
 * Function that handles the "stream" socket message received.
 * @param {JSON} message
 * @param {String} message.rid - The room key.
 * @param {SkylinkUser} message.mid - The source peerId.
 * @param {String} message.streamId - The media stream Id.
 * @param {String} message.status - The stream status.
 * @param {Object} message.settings
 * @param {String} message.settings.screenshareId - Id of the screenshare stream.
 * @memberOf SignalingMessageHandler
 */
const streamHandler = (message) => {
  const {
    mid, rid, status, streamId, settings,
  } = message;
  const roomState = getStateByRid(rid);
  const { room, peerInformations } = roomState;

  if (status === constants.STREAM_STATUS.ENDED) {
    if (settings.isScreensharing) {
      peerInformations[mid].screenshare = false;
      Skylink.setSkylinkState(roomState, room.id);
    }

    dispatchEvent(streamEnded({
      room,
      peerId: mid,
      peerInfo: PeerData.getPeerInfo(mid, room),
      streamId,
      isSelf: false,
      isScreensharing: settings.isScreensharing,
      options: settings,
      isVideo: !!settings.audio,
      isAudio: !!settings.video,
    }));
  }

  return null;
};

export default streamHandler;
