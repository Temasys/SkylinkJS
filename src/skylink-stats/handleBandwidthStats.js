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
      room_id: null,
      user_id: null,
      peer_id: null,
      client_id: null,
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
    this.model.audio_send.nack_count = formatValue(this.stats, 'audio', 'send', 'nacks');
    this.model.audio_send.echo_return_loss = formatValue(this.stats, 'audio', 'send', 'echoReturnLoss');
    this.model.audio_send.echo_return_loss_enhancement = formatValue(this.stats, 'audio', 'send', 'echoReturnLossEnhancement');
    // this.model.audio_send.round_trip_time = formatValue(this.stats,'audio', 'send', 'rtt');
  }

  gatherReceiveAudioPacketsStats() {
    this.model.audio_recv.bytes = formatValue(this.stats, 'audio', 'recv', 'bytes');
    this.model.audio_recv.packets = formatValue(this.stats, 'audio', 'recv', 'packets');
    this.model.audio_recv.packets_lost = formatValue(this.stats, 'audio', 'recv', 'packetsLost');
    this.model.audio_recv.jitter = formatValue(this.stats, 'audio', 'recv', 'jitter');
    this.model.audio_recv.nack_count = formatValue(this.stats, 'audio', 'recv', 'nacks');
    this.model.audio_recv.audio_level = formatValue(this.stats, 'audio', 'recv', 'audioLevel');
    this.model.audio_recv.audio_energy = formatValue(this.stats, 'audio', 'recv', 'totalAudioEnergy');
    this.model.audio_recv.jitter_buffer_delay = formatValue(this.stats, 'audio', 'recv', 'jitterBufferDelay');
    this.model.audio_recv.jitter_buffer_emmited_count = formatValue(this.stats, 'audio', 'recv', 'jitterBufferEmittedCount');
    // this.model.video_recv.packets_discarded = formatValue(this.stats,'audio', 'recv', 'packetsDiscarded');
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
    // this.model.video_send.round_trip_time = formatValue(this.stats,'video', 'send', 'rtt');
    // this.model.video_send.frames = formatValue(this.stats,'video', 'send', 'frames');
    // this.model.video_send.frames_dropped = formatValue(this.stats,'video', 'send', 'framesDropped');
    // this.model.video_send.framerate = formatValue(this.stats,'video', 'send', 'frameRate');
    // this.model.video_send.framerate_input = formatValue(this.stats,'video', 'send', 'frameRateInput');
    // this.model.video_send.framerate_encoded = formatValue(this.stats,'video', 'send', 'frameRateEncoded');
    // this.model.video_send.framerate_mean = formatValue(this.stats,'video', 'send', 'frameRateMean');
    // this.model.video_send.framerate_std_dev = formatValue(this.stats,'video', 'send', 'frameRateStdDev');
    // this.model.video_send.cpu_limited_resolution = formatValue(this.stats,'video', 'send', 'cpuLimitedResolution');
    // this.model.video_send.bandwidth_limited_resolution = formatValue(this.stats,'video', 'send', 'bandwidthLimitedResolution');
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
    // this.model.video_recv.packets_discarded = formatValue(this.stats,'video', 'recv', 'packetsDiscarded');
    // this.model.video_recv.jitter = formatValue(this.stats,'video', 'recv', 'jitter');
    // this.model.video_recv.frames = formatValue(this.stats,'video', 'recv', 'frames');
    // this.model.video_recv.frame_width = formatValue(this.stats,'video', 'recv', 'frameWidth');
    // this.model.video_recv.frame_height = formatValue(this.stats,'video', 'recv', 'frameHeight');
    // this.model.video_recv.framerate = formatValue(this.stats,'video', 'recv', 'frameRate');
    // this.model.video_recv.framerate_output = formatValue(this.stats,'video', 'recv', 'frameRateOutput');
    // this.model.video_recv.framerate_decoded = formatValue(this.stats,'video', 'recv', 'frameRateDecoded');
    // this.model.video_recv.framerate_mean = formatValue(this.stats,'video', 'recv', 'frameRateMean');
    // this.model.video_recv.framerate_std_dev = formatValue(this.stats,'video', 'recv', 'frameRateStdDev');
  }

  buildTrackInfo(roomKey) {
    const state = Skylink.getSkylinkState(roomKey);
    const { streams } = state;
    const streamObjs = Object.values(Object.values(streams.userMedia));
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

    this.model.room_id = roomKey;
    this.model.user_id = (roomState && roomState.user && roomState.user.sid) || null;
    this.model.peer_id = peerId;
    this.model.client_id = roomState.clientId;
    this.model.appKey = Skylink.getInitOptions().appKey;
    this.model.timestamp = (new Date()).toISOString();

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
