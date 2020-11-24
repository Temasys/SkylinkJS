/* eslint-disable camelcase */
import SkylinkStats from './index';
import Skylink from '../index';
import { MEDIA_TYPE } from '../constants';
import { isEmptyObj } from '../utils/helpers';

class HandleUserMediaStats extends SkylinkStats {
  constructor() {
    super();
    this.model = {
      client_id: null,
      app_key: null,
      timestamp: null,
      room_id: null,
      user_id: null,
      send_audio: null,
      recv_audio: null,
      send_video: null,
      recv_video: null,
      send_screen: null,
      recv_screen: null,
      mode: null,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getMediaCount(roomState, peerId, streams) {
    let audioCount = 0;
    let videoCount = 0;
    let screenCount = 0;

    const { peerMedias } = roomState;
    Object.values(streams).forEach((stream) => {
      const audioTrack = stream.getAudioTracks()[0]; // there should be only one track per stream
      const videoTrack = stream.getVideoTracks()[0]; // there should be only one track per stream
      if (audioTrack) {
        audioCount += 1;
      } else if (videoTrack) {
        const isScreen = !isEmptyObj(peerMedias) && peerMedias[peerId][`VIDEO_${stream.id}`] && peerMedias[peerId][`VIDEO_${stream.id}`].mediaType === MEDIA_TYPE.VIDEO_SCREEN;

        if (isScreen) {
          screenCount += 1;
        } else {
          videoCount += 1;
        }
      }
    });

    return {
      audioCount,
      videoCount,
      screenCount,
    };
  }

  parseMediaStats(roomState) {
    const { peerStreams, user, peerConnections } = roomState;
    const localStreams = peerStreams[user.sid] || [];

    let send_audio = 0;
    let send_video = 0;
    let send_screen = 0;

    if (!isEmptyObj(peerConnections)) { // count as sending media only if there is a remote peer connected
      const sendMediaCount = this.getMediaCount(roomState, user.sid, localStreams);
      send_audio = sendMediaCount.audioCount;
      send_video = sendMediaCount.videoCount;
      send_screen = sendMediaCount.screenCount;
    }

    let recv_audio = 0;
    let recv_video = 0;
    let recv_screen = 0;

    const peerIds = Object.keys(peerStreams).filter(peerId => peerId !== user.sid);
    peerIds.forEach((peerId) => {
      const remoteStreams = peerStreams[peerId];
      const recvMediaCount = this.getMediaCount(roomState, peerId, remoteStreams);
      recv_audio += recvMediaCount.audioCount;
      recv_video += recvMediaCount.videoCount;
      recv_screen += recvMediaCount.screenCount;
    });

    return {
      send_audio,
      send_video,
      send_screen,
      recv_audio,
      recv_video,
      recv_screen,
    };
  }

  send(roomKey) {
    const roomState = Skylink.getSkylinkState(roomKey);
    this.model.client_id = roomState.clientId;
    this.model.app_key = Skylink.getInitOptions().appKey;
    this.model.timestamp = (new Date()).toISOString();
    this.model.room_id = roomKey;
    this.model.user_id = (roomState && roomState.user && roomState.user.sid) || null;
    this.model.mode = roomState.hasMCU ? 'MCU' : 'P2P';

    const mediaStats = this.parseMediaStats(roomState);
    this.model.send_audio = mediaStats.send_audio;
    this.model.recv_audio = mediaStats.recv_audio;
    this.model.send_video = mediaStats.send_video;
    this.model.recv_video = mediaStats.recv_video;
    this.model.send_screen = mediaStats.send_screen;
    this.model.recv_screen = mediaStats.recv_screen;

    this.postStats(this.endpoints.userMedia, this.model);
  }
}

export default HandleUserMediaStats;
