import SkylinkStats from './index';
import Skylink from '../index';
import PeerConnection from '../peer-connection';
import logger from '../logger';
import MESSAGES from '../messages';

const formatValue = (stats, mediaType, directionType, itemKey) => {
  const value = stats[mediaType][directionType === 'send' ? 'sending' : 'receiving'][itemKey];
  if (['number', 'string', 'boolean'].indexOf(typeof value) > -1) {
    return value;
  }
  return null;
};

const buildAudioTrackInfo = (stream, track) => ({
  stream_id: stream.id,
  id: track.id,
  label: track.label,
  muted: !track.enabled,
});

const buildVideoTrackInfo = (stream, track, settings) => ({
  stream_id: stream.id,
  id: track.id,
  label: track.label,
  height: settings.video.resolution.height,
  width: settings.video.resolution.width,
  muted: !track.enabled,
});

class HandleBandwidthStats extends SkylinkStats {
  constructor() {
    super();
    this.model = {
      client_id: null,
      app_key: null,
      timestamp: null,
      room_id: null,
      user_id: null,
      peer_id: null,
      audio_send: { tracks: [] },
      audio_recv: {},
      video_send: { tracks: [] },
      video_recv: {},
      error: null,
    };
    this.stats = null;
  }

  gatherSendAudioPacketsStats() {
    this.model.audio_send.bytes = formatValue(this.stats, 'audio', 'send', 'bytes');
    this.model.audio_send.packets = formatValue(this.stats, 'audio', 'send', 'packets');
    this.model.audio_send.echo_return_loss = formatValue(this.stats, 'audio', 'send', 'echoReturnLoss');
    this.model.audio_send.echo_return_loss_enhancement = formatValue(this.stats, 'audio', 'send', 'echoReturnLossEnhancement');
    this.model.audio_send.round_trip_time = formatValue(this.stats, 'audio', 'send', 'roundTripTime');
    this.model.audio_send.audio_level = formatValue(this.stats, 'audio', 'send', 'audioLevel');
    this.model.audio_send.jitter = formatValue(this.stats, 'audio', 'send', 'jitter');
  }

  gatherReceiveAudioPacketsStats() {
    this.model.audio_recv.bytes = formatValue(this.stats, 'audio', 'recv', 'bytes');
    this.model.audio_recv.packets = formatValue(this.stats, 'audio', 'recv', 'packets');
    this.model.audio_recv.packets_lost = formatValue(this.stats, 'audio', 'recv', 'packetsLost');
    this.model.audio_recv.jitter = formatValue(this.stats, 'audio', 'recv', 'jitter');
    this.model.audio_recv.audio_level = formatValue(this.stats, 'audio', 'recv', 'audioLevel');
  }

  gatherSendVideoPacketsStats() {
    this.model.video_send.bytes = formatValue(this.stats, 'video', 'send', 'bytes');
    this.model.video_send.packets = formatValue(this.stats, 'video', 'send', 'packets');
    this.model.video_send.nack_count = formatValue(this.stats, 'video', 'send', 'nacks');
    this.model.video_send.firs_count = formatValue(this.stats, 'video', 'send', 'firs');
    this.model.video_send.plis_count = formatValue(this.stats, 'video', 'send', 'plis');
    this.model.video_send.frames_encoded = formatValue(this.stats, 'video', 'send', 'framesEncoded');
    this.model.video_send.frame_width = formatValue(this.stats, 'video', 'send', 'frameWidth');
    this.model.video_send.frame_height = formatValue(this.stats, 'video', 'send', 'frameHeight');
    this.model.video_send.round_trip_time = formatValue(this.stats, 'video', 'send', 'roundTripTime');
    this.model.video_send.qp_sum = formatValue(this.stats, 'video', 'send', 'qpSum');
    this.model.video_send.jitter = formatValue(this.stats, 'video', 'send', 'jitter');
    this.model.video_send.frames = formatValue(this.stats, 'video', 'send', 'frames');
    this.model.video_send.hugeFrames = formatValue(this.stats, 'video', 'send', 'hugeFramesSent');
    this.model.video_send.framesPerSecond = formatValue(this.stats, 'video', 'send', 'framesPerSecond');
  }

  gatherReceiveVideoPacketsStats() {
    this.model.video_recv.bytes = formatValue(this.stats, 'video', 'recv', 'bytes');
    this.model.video_recv.packets = formatValue(this.stats, 'video', 'recv', 'packets');
    this.model.video_recv.packets_lost = formatValue(this.stats, 'video', 'recv', 'packetsLost');
    this.model.video_recv.nack_count = formatValue(this.stats, 'video', 'recv', 'nacks');
    this.model.video_recv.firs_count = formatValue(this.stats, 'video', 'recv', 'firs');
    this.model.video_recv.plis_count = formatValue(this.stats, 'video', 'recv', 'plis');
    this.model.video_recv.frames_decoded = formatValue(this.stats, 'video', 'recv', 'framesDecoded');
    this.model.video_recv.qp_sum = formatValue(this.stats, 'video', 'recv', 'qpSum');
    this.model.video_recv.frames_decoded = formatValue(this.stats, 'video', 'recv', 'framesDecoded');
    this.model.video_recv.frames_dropped = formatValue(this.stats, 'video', 'recv', 'framesDropped');
    this.model.video_recv.decoderImplementation = formatValue(this.stats, 'video', 'recv', 'decoderImplementation');
  }

  buildTrackInfo(roomKey) {
    const state = Skylink.getSkylinkState(roomKey);
    const { streams } = state;
    let streamObjs = [];
    if (streams.userMedia) {
      streamObjs = Object.values(Object.values(streams.userMedia));
    }

    if (streams.screenshare) {
      streamObjs.push(streams.screenshare);
    }

    streamObjs.forEach((streamObj) => {
      if (streamObj) {
        const stream = streamObj.stream ? streamObj.stream : streamObj[Object.keys(streamObj)[0]].stream;
        const settings = streamObj.settings ? streamObj.settings : streamObj[Object.keys(streamObj)[0]].settings;
        const audioTracks = stream.getAudioTracks();
        const videoTracks = stream.getVideoTracks();

        audioTracks.forEach((audioTrack) => {
          const audioTrackInfo = buildAudioTrackInfo(stream, audioTrack);
          this.model.audio_send.tracks.push(audioTrackInfo);
        });

        videoTracks.forEach((videoTrack) => {
          const videoTrackInfo = buildVideoTrackInfo(stream, videoTrack, settings);
          this.model.video_send.tracks.push(videoTrackInfo);
        });
      }
    });
  }

  send(roomKey, peerConnection, peerId) {
    const { STATS_MODULE } = MESSAGES;
    const roomState = Skylink.getSkylinkState(roomKey);

    if (!roomState) {
      logger.log.DEBUG([peerId, 'Statistics', 'Bandwidth_Stats', STATS_MODULE.HANDLE_BANDWIDTH_STATS.NO_STATE]);
      return;
    }

    if (!roomState.streams.userMedia && !roomState.streams.screenshare) {
      return;
    }

    this.model.client_id = roomState.clientId;
    this.model.app_key = Skylink.getInitOptions().appKey;
    this.model.timestamp = (new Date()).toISOString();
    this.model.room_id = roomKey;
    this.model.user_id = (roomState && roomState.user && roomState.user.sid) || null;
    this.model.peer_id = peerId;

    PeerConnection.retrieveStatistics(roomKey, peerId, Skylink.getInitOptions().beSilentOnStatsLogs).then((stats) => {
      if (stats) {
        this.stats = stats;
        this.gatherSendAudioPacketsStats();
        this.gatherReceiveAudioPacketsStats();
        this.gatherSendVideoPacketsStats();
        this.gatherReceiveVideoPacketsStats();
        this.buildTrackInfo(roomKey);
        this.postStats(this.endpoints.bandwidth, this.model);
      }
    }).catch((error) => {
      this.model.error = error ? error.message : null;
      logger.log.DEBUG(STATS_MODULE.HANDLE_BANDWIDTH_STATS.RETRIEVE_FAILED, error);
    });
  }
}

export default HandleBandwidthStats;
