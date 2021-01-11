import Skylink from '../index';
import { dispatchEvent } from '../utils/skylinkEventManager';
import {
  onIncomingStream, onIncomingScreenStream, streamEnded, streamMuted,
} from '../skylink-events';
import { isEmptyObj } from '../utils/helpers';
import {
  ON_INCOMING_SCREEN_STREAM, ON_INCOMING_STREAM, STREAM_ENDED, STREAM_MUTED,
} from '../skylink-events/constants';
import HandleUserMediaStats from '../skylink-stats/handleUserMediaStats';

class PeerStream {
  static updatePeerStreamWithUserSid(room, sid) {
    const updatedState = Skylink.getSkylinkState(room.id);
    if (!updatedState.peerStreams.null) {
      return;
    }

    updatedState.peerStreams[sid] = Object.assign({}, updatedState.peerStreams.null);
    delete updatedState.peerStreams.null;
    Skylink.setSkylinkState(updatedState, room.id);
  }

  static addStream(peerId, stream = null, roomkey) {
    if (!stream) return;
    const updatedState = Skylink.getSkylinkState(roomkey);
    const { peerStreams } = updatedState;

    if (peerStreams[peerId] && peerStreams[peerId][stream.id]) {
      return;
    }

    peerStreams[peerId] = peerStreams[peerId] || {};
    peerStreams[peerId][stream.id] = stream;
    Skylink.setSkylinkState(updatedState, roomkey);
  }

  static deleteStream(peerId, room, streamId) {
    const updatedState = Skylink.getSkylinkState(room.id);
    const streamIdToRemove = streamId;
    delete updatedState.peerStreams[peerId][streamIdToRemove];

    if (isEmptyObj(updatedState.peerStreams[peerId])) {
      delete updatedState.peerStreams[peerId];
    }

    Skylink.setSkylinkState(updatedState, updatedState.room.id);

    // catch changes in stopped media that happened between the interval
    new HandleUserMediaStats().send(room.id);
  }

  static dispatchStreamEvent(eventName, detail) {
    switch (eventName) {
      case ON_INCOMING_STREAM:
        dispatchEvent(onIncomingStream(detail));
        break;
      case ON_INCOMING_SCREEN_STREAM:
        dispatchEvent(onIncomingScreenStream(detail));
        break;
      case STREAM_ENDED:
        dispatchEvent(streamEnded(detail));
        break;
      case STREAM_MUTED:
        dispatchEvent(streamMuted(detail));
        break;
      default:
        // do nothing
    }
  }
}

export default PeerStream;
