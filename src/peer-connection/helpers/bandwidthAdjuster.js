import PeerConnection from '../index';
import * as constants from '../../constants';
import Skylink from '../../index';

const instance = {};

class BandwidthAdjuster {
  constructor(params) {
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
    const { bandwidthAdjuster, peerBandwidth, room } = this.state;
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
        !== PEER_CONNECTION_STATE.CLOSED) || !bandwidthAdjuster || !peerBandwidth[this.peerId]) {
        clearInterval(adjustmentInterval);
        return;
      }

      PeerConnection.retrieveStatistics(room.id, this.peerId, Skylink.getIniOptions().beSilentOnStatsLogs, true)
        .then((stats) => {
          if (!(this.peerConnection && this.peerConnection.signalingState
            !== PEER_CONNECTION_STATE.CLOSED) || !bandwidthAdjuster) {
            clearInterval(adjustmentInterval);
          }

          bandwidth.audio.send.push(stats.audio.sending.bytes * 8);
          bandwidth.audio.recv.push(stats.audio.receiving.bytes * 8);
          bandwidth.video.send.push(stats.video.sending.bytes * 8);
          bandwidth.video.recv.push(stats.video.receiving.bytes * 8);

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
}

export default BandwidthAdjuster;
