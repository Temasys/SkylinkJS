import Skylink from '../../../../index';
import SkylinkSignalingServer from '../../index';
import IceConnection from '../../../../ice-connection/index';
import PeerData from '../../../../peer-data';
import PeerMedia from '../../../../peer-media/index';
import { peerJoined, handshakeProgress, onIncomingStream } from '../../../../skylink-events';
import { dispatchEvent } from '../../../../utils/skylinkEventManager';
import { hasAudioTrack, hasVideoTrack } from '../../../../utils/helpers';
import * as constants from '../../../../constants';

/**
 * Function that handles the "inRoom" socket message received.
 * @param {JSON} message
 * @memberof SignalingMessageHandler
 * @fires peerJoined
 * @fires handshakeProgress
 * @fires onIncomingStream
 */
const inRoomHandler = (message) => {
  const {
    pc_config: { iceServers },
    sid,
    rid,
    tieBreaker,
  } = message;
  const roomState = Skylink.getSkylinkState(rid);
  const initOptions = Skylink.getInitOptions();
  const { priorityWeightScheme } = initOptions;
  const signaling = new SkylinkSignalingServer();
  let weightAppendValue = 0;

  roomState.room.connection.peerConfig = IceConnection.setIceServers(iceServers);
  roomState.room.inRoom = true;

  if (priorityWeightScheme === constants.PRIORITY_WEIGHT_SCHEME.AUTO) {
    weightAppendValue = 0;
  } else if (priorityWeightScheme === constants.PRIORITY_WEIGHT_SCHEME.ENFORCE_OFFERER) {
    weightAppendValue = 2e+15;
  } else {
    weightAppendValue = -(2e+15);
  }

  roomState.peerPriorityWeight = tieBreaker + weightAppendValue;
  roomState.user.sid = sid;
  roomState.inRoom = true;

  PeerMedia.updatePeerMediaWithUserSid(roomState.room, sid);

  dispatchEvent(peerJoined({
    peerId: roomState.user.sid,
    peerInfo: PeerData.getCurrentSessionInfo(roomState.room),
    isSelf: true,
    room: roomState.room,
  }));

  dispatchEvent(handshakeProgress({
    peerId: roomState.user.sid,
    state: constants.HANDSHAKE_PROGRESS.ENTER,
    error: null,
    room: roomState.room,
  }));

  if (roomState.streams.userMedia) {
    const streamIds = Object.keys(roomState.streams.userMedia);
    streamIds.forEach((streamId) => {
      const mediaStream = roomState.streams.userMedia[streamId].stream;
      dispatchEvent(onIncomingStream({
        stream: mediaStream,
        streamId: mediaStream.id,
        peerId: roomState.user.sid,
        room: roomState.room,
        isSelf: true,
        peerInfo: PeerData.getCurrentSessionInfo(roomState.room),
        isVideo: hasVideoTrack(mediaStream),
        isAudio: hasAudioTrack(mediaStream),
      }));
    });
  }

  // if (roomState.streams.screenshare && roomState.streams.screenshare.stream) {
  //   streamId = roomState.streams.screenshare.stream.id || roomState.streams.screenshare.stream.label;
  //   dispatchEvent(onIncomingStream({
  //     stream: roomState.streams.screenshare.stream,
  //     streamId,
  //     peerId: roomState.user.sid,
  //     room: roomState.room,
  //     isScreensharing: true,
  //     isSelf: true,
  //     peerInfo: PeerData.getCurrentSessionInfo(roomState.room),
  //   }));
  // } else if (roomState.streams.userMedia && roomState.streams.userMedia.stream) {
  //   streamId = roomState.streams.userMedia.stream.id || roomState.streams.userMedia.stream.label;
  //   dispatchEvent(onIncomingStream({
  //     stream: roomState.streams.userMedia.stream,
  //     streamId,
  //     peerId: roomState.user.sid,
  //     room: roomState.room,
  //     isScreensharing: false,
  //     isSelf: true,
  //     peerInfo: PeerData.getCurrentSessionInfo(roomState.room),
  //   }));
  // }

  Skylink.setSkylinkState(roomState, rid);
  signaling.enterRoom(roomState);
};

export default inRoomHandler;
