import PeerConnection from '../index';
import * as constants from '../../constants';
import Skylink from '../../index';

let instance = {};

class BandwidthAdjuster {
  constructor(params) {
    if (params.roomKey) {
      this.resetBandwidthAdjusterInstance(params.roomKey, params.peerId);
      return null;
    }

    const { peerConnection, state, targetMid } = params;

    if (instance[targetMid]) {
      return instance[targetMid];
    }

    this.peerId = targetMid;
    this.state = state;
    this.peerConnection = peerConnection;
    this.bandwidth = null;

    instance[this.peerId] = this;
  }

  static formatTotalFn(arr) {
    let total = 0;
    for (let i = 0; i < arr.length; i += 1) {
      total += arr[i];
    }
    return total / arr.length;
  }

  setAdjustmentInterval() {
    const { bandwidthAdjuster, peerStats, room } = this.state;
    const { PEER_CONNECTION_STATE } = constants;

    if (this.bandwidth) {
      return;
    }

    const bandwidth = {
      audio: { send: [], recv: [] },
      video: { send: [], recv: [] },
    };
    let currentBlock = 0;

    const adjustmentInterval = setInterval(() => {
      if (!(this.peerConnection && this.peerConnection.signalingState
        !== PEER_CONNECTION_STATE.CLOSED) || !bandwidthAdjuster || !peerStats[this.peerId]) {
        clearInterval(adjustmentInterval);
        return;
      }

      PeerConnection.retrieveStatistics(room.id, this.peerId, Skylink.getInitOptions().beSilentOnStatsLogs, true)
        .then((stats) => {
          if (!(this.peerConnection && this.peerConnection.signalingState
            !== PEER_CONNECTION_STATE.CLOSED) || !bandwidthAdjuster) {
            clearInterval(adjustmentInterval);
          }

          bandwidth.audio.send.push(stats.audio.sending.bytes ? stats.audio.sending.bytes * 8 : 0);
          bandwidth.audio.recv.push(stats.audio.receiving.bytes ? stats.audio.receiving.bytes * 8 : 0);
          bandwidth.video.send.push(stats.video.sending.bytes ? stats.video.sending.bytes * 8 : 0);
          bandwidth.video.recv.push(stats.video.receiving.bytes ? stats.video.receiving.bytes * 8 : 0);

          currentBlock += 1;

          if (currentBlock === bandwidthAdjuster.interval) {
            currentBlock = 0;
            let totalAudioBw = BandwidthAdjuster.formatTotalFn(bandwidth.audio.send);
            let totalVideoBw = BandwidthAdjuster.formatTotalFn(bandwidth.video.send);

            if (!bandwidthAdjuster.useUploadBwOnly) {
              totalAudioBw += BandwidthAdjuster.formatTotalFn(bandwidth.audio.recv);
              totalVideoBw += BandwidthAdjuster.formatTotalFn(bandwidth.video.recv);
              totalAudioBw /= 2;
              totalVideoBw /= 2;
            }

            totalAudioBw = parseInt((totalAudioBw * (bandwidthAdjuster.limitAtPercentage / 100)) / 1000, 10);
            totalVideoBw = parseInt((totalVideoBw * (bandwidthAdjuster.limitAtPercentage / 100)) / 1000, 10);

            PeerConnection.refreshConnection(this.state, this.peerId, false, {
              bandwidth: { audio: totalAudioBw, video: totalVideoBw },
            });
          }
        })
        .catch(() => {
          bandwidth.audio.send.push(0);
          bandwidth.audio.recv.push(0);
          bandwidth.video.send.push(0);
          bandwidth.video.recv.push(0);
        });
    }, 1000);

    this.bandwidth = bandwidth;
  }

  // eslint-disable-next-line class-methods-use-this
  resetBandwidthAdjusterInstance(roomKey, peerId = null) {
    const state = Skylink.getSkylinkState(roomKey);
    state.streamsBandwidthSettings.bAS = {};
    Skylink.setSkylinkState(state, roomKey);

    if (peerId) {
      delete instance[peerId];
    } else {
      instance = {};
    }
  }
}

export default BandwidthAdjuster;
