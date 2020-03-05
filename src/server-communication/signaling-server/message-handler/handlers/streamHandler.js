import { getStateByRid } from '../../../../utils/helpers';
import * as constants from '../../../../constants';
import { streamEnded, onIncomingScreenStream, onIncomingStream } from '../../../../skylink-events';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import PeerData from '../../../../peer-data/index';
import Skylink from '../../../../index';
import PeerConnectionCallbacks from '../../../../peer-connection/helpers/peer-addition/callbacks';
import MediaStream from '../../../../media-stream';

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

  if (status === constants.STREAM_STATUS.SCREENSHARE_REPLACE_START) {
    peerInformations[mid].screenshare = true;
    Skylink.setSkylinkState(roomState, room.id);

    dispatchEvent(onIncomingScreenStream({
      room,
      peerId: mid,
      isSelf: false,
      peerInfo: PeerData.getPeerInfo(mid, room),
      stream: null,
      isReplace: true,
      streamId,
      isVideo: !!settings.audio,
      isAudio: !!settings.video,
    }));
  }

  if (status === constants.STREAM_STATUS.USER_MEDIA_REPLACE_START) {
    dispatchEvent(onIncomingStream({
      room,
      peerId: mid,
      isSelf: false,
      peerInfo: PeerData.getPeerInfo(mid, room),
      stream: null,
      streamId,
      isReplace: true,
      replacedStreamId: settings.replacedStreamId,
      isVideo: !!settings.audio,
      isAudio: !!settings.video,
    }));
  }

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

  // Handle stopped streams that are not present in sdp and therefore do not require renegotiation and therefore do not trigger onremovetrack
  if (status === constants.STREAM_STATUS.REPLACED_STREAM_ENDED) {
    const remoteStreams = MediaStream.retrieveRemoteStreams(roomState, mid);

    if (!remoteStreams) {
      return null;
    }

    const remoteStreamsObj = Object.values(remoteStreams);
    let stoppedStream = null;

    for (let i = 0; i < remoteStreamsObj.length; i += 1) {
      if (remoteStreams[i].id === streamId) {
        stoppedStream = remoteStreamsObj[i];
        break;
      }
    }

    if (!stoppedStream) {
      return null;
    }

    const tracks = stoppedStream.getTracks();
    tracks.forEach((track) => {
      PeerConnectionCallbacks.onremovetrack(mid, room, streamId, track, false);
    });
  }

  return null;
};

export default streamHandler;
