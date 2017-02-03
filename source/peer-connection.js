/**
 * Function that refresh connections.
 * @method _refreshPeerConnection
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._refreshPeerConnection = function(listOfPeers, doIceRestart, callback) {
  var self = this;
  var listOfPeerRestarts = [];
  var error = '';
  var listOfPeerRestartErrors = {};

  // To fix jshint dont put functions within a loop
  var refreshSinglePeerCallback = function (peerId) {
    return function (error) {
      if (listOfPeerRestarts.indexOf(peerId) === -1) {
        if (error) {
          self._log.error([peerId, 'RTCPeerConnection', null, 'Failed restarting for peer'], error);
          listOfPeerRestartErrors[peerId] = error;
        }
        listOfPeerRestarts.push(peerId);
      }

      if (listOfPeerRestarts.length === listOfPeers.length) {
        if (typeof callback === 'function') {
          self._log.log([null, 'PeerConnection', null, 'Invoked all peers to restart. Firing callback']);

          if (Object.keys(listOfPeerRestartErrors).length > 0) {
            callback({
              refreshErrors: listOfPeerRestartErrors,
              listOfPeers: listOfPeers
            }, null);
          } else {
            callback(null, {
              listOfPeers: listOfPeers
            });
          }
        }
      }
    };
  };

  var refreshSinglePeer = function(peerId, peerCallback){
    if (!self._peerConnections[peerId]) {
      error = 'There is currently no existing peer connection made ' +
        'with the peer. Unable to restart connection';
      self._log.error([peerId, null, null, error]);
      peerCallback(error);
      return;
    }

    self._log.log([peerId, 'PeerConnection', null, 'Restarting peer connection']);

    // do a hard reset on variable object
    self._restartPeerConnection(peerId, doIceRestart, peerCallback);
  };

  if(!self._hasMCU) {
    var i;

    for (i = 0; i < listOfPeers.length; i++) {
      var peerId = listOfPeers[i];

      if (Object.keys(self._peerConnections).indexOf(peerId) > -1) {
        refreshSinglePeer(peerId, refreshSinglePeerCallback(peerId));
      } else {
        error = 'Peer connection with peer does not exists. Unable to restart';
        self._log.error([peerId, 'PeerConnection', null, error]);
        refreshSinglePeerCallback(peerId)(error);
      }
    }
  } else {
    self._restartMCUConnection(callback, doIceRestart);
  }
};

/**
 * Function that retrieves Peer connection stats.
 * @method _retrieveStats
 * @private
 * @for Skylink
 * @since 0.6.18
 */
Skylink.prototype._retrieveStats = function (peerId, callback) {
  var self = this;

  self._log.debug([peerId, 'RTCStatsReport', null, 'Retrieivng connection status']);

  var pc = self._peerConnections[peerId];
  var result = {
    raw: null,
    connection: {
      iceConnectionState: pc.iceConnectionState,
      iceGatheringState: pc.iceGatheringState,
      signalingState: pc.signalingState,
      remoteDescription: {
        type: pc.remoteDescription ? pc.remoteDescription.type || null : null,
        sdp : pc.remoteDescription ? pc.remoteDescription.sdp || null : null
      },
      localDescription: {
        type: pc.localDescription ? pc.localDescription.type || null : null,
        sdp : pc.localDescription ? pc.localDescription.sdp || null : null
      },
      candidates: UtilsFactory.clone(self._gatheredCandidates[peerId] || {
        sending: { host: [], srflx: [], relay: [] },
        receiving: { host: [], srflx: [], relay: [] }
      }),
      dataChannels: {}
    },
    audio: {
      sending: {
        ssrc: null,
        bytes: 0,
        packets: 0,
        // Should not be for sending?
        packetsLost: 0,
        rtt: 0,
        // Should not be for sending?
        jitter: 0,
        // Should not be for sending?
        jitterBufferMs: null,
        codec: self._getSDPSelectedCodec(peerId, pc.remoteDescription, 'audio'),
        nacks: null,
        inputLevel: null,
        echoReturnLoss: null,
        echoReturnLossEnhancement: null,
        totalBytes: 0,
        totalPackets: 0,
        totalPacketsLost: 0,
        totalNacks: null
      },
      receiving: {
        ssrc: null,
        bytes: 0,
        packets: 0,
        packetsLost: 0,
        packetsDiscarded: 0,
        fractionLost: 0,
        nacks: null,
        jitter: 0,
        jitterBufferMs: null,
        codec: self._getSDPSelectedCodec(peerId, pc.remoteDescription, 'audio'),
        outputLevel: null,
        totalBytes: 0,
        totalPackets: 0,
        totalPacketsLost: 0,
        totalNacks: null
      }
    },
    video: {
      sending: {
        ssrc: null,
        bytes: 0,
        packets: 0,
        // Should not be for sending?
        packetsLost: 0,
        rtt: 0,
        // Should not be for sending?
        jitter: 0,
        // Should not be for sending?
        jitterBufferMs: null,
        codec: self._getSDPSelectedCodec(peerId, pc.remoteDescription, 'video'),
        frameWidth: null,
        frameHeight: null,
        framesDecoded: null,
        framesCorrupted: null,
        framesDropped: null,
        framesPerSecond: null,
        framesInput: null,
        frames: null,
        frameRateEncoded: null,
        frameRate: null,
        frameRateInput: null,
        frameRateMean: null,
        frameRateStdDev: null,
        nacks: null,
        plis: null,
        firs: null,
        slis: null,
        qpSum: null,
        totalBytes: 0,
        totalPackets: 0,
        totalPacketsLost: 0,
        totalNacks: null,
        totalPlis: null,
        totalFirs: null,
        totalSlis: null,
        totalFrames: null
      },
      receiving: {
        ssrc: null,
        bytes: 0,
        packets: 0,
        packetsDiscarded: 0,
        packetsLost: 0,
        fractionLost: 0,
        jitter: 0,
        jitterBufferMs: null,
        codec: self._getSDPSelectedCodec(peerId, pc.remoteDescription, 'video'),
        frameWidth: null,
        frameHeight: null,
        framesDecoded: null,
        framesCorrupted: null,
        framesPerSecond: null,
        framesDropped: null,
        framesOutput: null,
        frames: null,
        frameRateMean: null,
        frameRateStdDev: null,
        nacks: null,
        plis: null,
        firs: null,
        slis: null,
        e2eDelay: null,
        totalBytes: 0,
        totalPackets: 0,
        totalPacketsLost: 0,
        totalNacks: null,
        totalPlis: null,
        totalFirs: null,
        totalSlis: null,
        totalFrames: null
      }
    },
    selectedCandidate: {
      local: {
        ipAddress: null,
        candidateType: null,
        portNumber: null,
        transport: null, 
        turnMediaTransport: null
      },
      remote: {
        ipAddress: null,
        candidateType: null,
        portNumber: null,
        transport: null
      },
      consentResponses: {
        received: null,
        sent: null,
        totalReceived: null,
        totalSent: null
      },
      consentRequests: {
        received: null,
        sent: null,
        totalReceived: null,
        totalSent: null
      },
      responses: {
        received: null,
        sent: null,
        totalReceived: null,
        totalSent: null
      },
      requests: {
        received: null,
        sent: null,
        totalReceived: null,
        totalSent: null
      }
    },
    certificate: {
      local: self._getSDPFingerprint(peerId, pc.localDescription),
      remote: self._getSDPFingerprint(peerId, pc.remoteDescription),
      dtlsCipher: null,
      srtpCipher: null
    }
  };

  for (var channelProp in self._dataChannels[peerId]) {
    if (self._dataChannels[peerId].hasOwnProperty(channelProp) && self._dataChannels[peerId][channelProp]) {
      result.connection.dataChannels[self._dataChannels[peerId][channelProp].channel.label] = {
        label: self._dataChannels[peerId][channelProp].channel.label,
        readyState: self._dataChannels[peerId][channelProp].channel.readyState,
        channelType: channelProp === 'main' ? self.DATA_CHANNEL_TYPE.MESSAGING : self.DATA_CHANNEL_TYPE.DATA,
        currentTransferId: self._dataChannels[peerId][channelProp].transferId || null
      };
    }
  }

  var loopFn = function (obj, fn) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop) && obj[prop]) {
        fn(obj[prop], prop);
      }
    }
  };

  var formatCandidateFn = function (candidateDirType, candidate) {
    result.selectedCandidate[candidateDirType].ipAddress = candidate.ipAddress;
    result.selectedCandidate[candidateDirType].candidateType = candidate.candidateType;
    result.selectedCandidate[candidateDirType].portNumber = typeof candidate.portNumber !== 'number' ?
      parseInt(candidate.portNumber, 10) || null : candidate.portNumber;
    result.selectedCandidate[candidateDirType].transport = candidate.transport;
  };

  pc.getStats(null, function (stats) {
    self._log.debug([peerId, 'RTCStatsReport', null, 'Retrieval success ->'], stats);

    result.raw = stats;

    if (window.webrtcDetectedBrowser === 'firefox') {
      loopFn(stats, function (obj, prop) {
        var dirType = '';

        // Receiving/Sending RTP packets
        if (prop.indexOf('inbound_rtp') === 0 || prop.indexOf('outbound_rtp') === 0) {
          dirType = prop.indexOf('inbound_rtp') === 0 ? 'receiving' : 'sending';

          if (!self._peerStats[peerId][prop]) {
            self._peerStats[peerId][prop] = obj;
          }

          result[obj.mediaType][dirType].bytes = self._parseConnectionStats(self._peerStats[peerId][prop],
            obj, dirType === 'receiving' ? 'bytesReceived' : 'bytesSent');
          result[obj.mediaType][dirType].totalBytes = parseInt(
            (dirType === 'receiving' ? obj.bytesReceived : obj.bytesSent) || '0', 10);
          result[obj.mediaType][dirType].packets = self._parseConnectionStats(self._peerStats[peerId][prop],
            obj, dirType === 'receiving' ? 'packetsReceived' : 'packetsSent');
          result[obj.mediaType][dirType].totalPackets = parseInt(
            (dirType === 'receiving' ? obj.packetsReceived : obj.packetsSent) || '0', 10);
          result[obj.mediaType][dirType].ssrc = obj.ssrc;
          
          if (obj.mediaType === 'video') {
            result.video[dirType].frameRateMean = obj.framerateMean || 0;
            result.video[dirType].frameRateStdDev = obj.framerateStdDev || 0;
            result.video[dirType].framesDropped = typeof obj.framesDropped === 'number' ? obj.framesDropped :
              (typeof obj.droppedFrames === 'number' ? obj.droppedFrames : null);
            result.video[dirType].framesCorrupted = typeof obj.framesCorrupted === 'number' ? obj.framesCorrupted : null;
            result.video[dirType].framesPerSecond = typeof obj.framesPerSecond === 'number' ? obj.framesPerSecond : null;

            if (dirType === 'sending') {
              result.video[dirType].framesEncoded = typeof obj.framesEncoded === 'number' ? obj.framesEncoded : null;
              result.video[dirType].frames = typeof obj.framesSent === 'number' ? obj.framesSent : null;
            } else {
              result.video[dirType].framesDecoded = typeof obj.framesDecoded === 'number' ? obj.framesDecoded : null;
              result.video[dirType].frames = typeof obj.framesReceived === 'number' ? obj.framesReceived : null;
            }
          }

          if (dirType === 'receiving') {
            obj.packetsDiscarded = (typeof obj.packetsDiscarded === 'number' ? obj.packetsDiscarded :
              obj.discardedPackets) || 0;
            obj.packetsLost = typeof obj.packetsLost === 'number' ? obj.packetsLost : 0;

            result[obj.mediaType].receiving.packetsLost = self._parseConnectionStats(self._peerStats[peerId][prop],
              obj, 'packetsLost');
            result[obj.mediaType].receiving.packetsDiscarded = self._parseConnectionStats(self._peerStats[peerId][prop],
              obj, 'packetsDiscarded');
            result[obj.mediaType].receiving.totalPacketsDiscarded = obj.packetsDiscarded;
            result[obj.mediaType].receiving.totalPacketsLost = obj.packetsLost;
          }

          self._peerStats[peerId][prop] = obj;

        // Sending RTP packets lost
        } else if (prop.indexOf('inbound_rtcp') === 0 || prop.indexOf('outbound_rtcp') === 0) {
          dirType = prop.indexOf('inbound_rtp') === 0 ? 'receiving' : 'sending';

          if (!self._peerStats[peerId][prop]) {
            self._peerStats[peerId][prop] = obj;
          }

          if (dirType === 'sending') {
            result[obj.mediaType].sending.rtt = obj.mozRtt || 0;
            result[obj.mediaType].sending.targetBitrate = typeof obj.targetBitrate === 'number' ? obj.targetBitrate : 0;
          } else {
            result[obj.mediaType].receiving.jitter = obj.jitter || 0;
          }

          self._peerStats[peerId][prop] = obj;

        // Candidates
        } else if (obj.nominated && obj.selected) {
          formatCandidateFn('remote', stats[obj.remoteCandidateId]);
          formatCandidateFn('local', stats[obj.localCandidateId]);
        }
      });

    } else if (window.webrtcDetectedBrowser === 'edge') {
      var tracks = [];

      if (pc.getRemoteStreams().length > 0) {
        tracks = tracks.concat(pc.getRemoteStreams()[0].getTracks());
      }

      if (pc.getLocalStreams().length > 0) {
        tracks = tracks.concat(pc.getLocalStreams()[0].getTracks());
      }

      loopFn(tracks, function (track) {
        loopFn(stats, function (obj, prop) {
          if (obj.type === 'track' && obj.trackIdentifier === track.id) {
            var dirType = obj.remoteSource ? 'receiving' : 'sending';
            var mediaType = track.kind;

            if (mediaType === 'audio') {
              result[mediaType][dirType][dirType === 'sending' ? 'inputLevel' : 'outputLevel'] = obj.audioLevel;
              if (dirType === 'sending') {
                result[mediaType][dirType].echoReturnLoss = obj.echoReturnLoss;
                result[mediaType][dirType].echoReturnLossEnhancement = obj.echoReturnLossEnhancement;
              }
            } else {
              result[mediaType][dirType].frames = self._parseConnectionStats(self._peerStats[peerId][subprop],
                streamObj,dirType === 'sending' ? obj.framesSent : obj.framesReceived);
              result[mediaType][dirType].framesDropped = obj.framesDropped;
              result[mediaType][dirType].framesDecoded = obj.framesDecoded;
              result[mediaType][dirType].framesCorrupted = obj.framesCorrupted;
              result[mediaType][dirType].framesPerSecond = obj.framesPerSecond;
              result[mediaType][dirType].frameHeight = obj.frameHeight || null;
              result[mediaType][dirType].frameWidth = obj.frameWidth || null;
              result[mediaType][dirType].totalFrames = dirType === 'sending' ? obj.framesSent : obj.framesReceived;
            }

            loopFn(stats, function (streamObj, subprop) {
              if (streamObj.mediaTrackId === obj.id && ['outboundrtp', 'inboundrtp'].indexOf(streamObj.type) > -1) {
                if (!self._peerStats[peerId][subprop]) {
                  self._peerStats[peerId][subprop] = streamObj;
                }

                result[mediaType][dirType].ssrc = parseInt(streamObj.ssrc || '0', 10);
                result[mediaType][dirType].nacks = self._parseConnectionStats(self._peerStats[peerId][subprop],
                  streamObj, 'nackCount');
                result[mediaType][dirType].totalNacks = streamObj.nackCount;

                if (mediaType === 'video') {
                  result[mediaType][dirType].firs = self._parseConnectionStats(self._peerStats[peerId][subprop],
                    streamObj, 'firCount');
                  result[mediaType][dirType].plis = self._parseConnectionStats(self._peerStats[peerId][subprop],
                    streamObj, 'pliCount');
                  result[mediaType][dirType].slis = self._parseConnectionStats(self._peerStats[peerId][subprop],
                    streamObj, 'sliCount');
                  result[mediaType][dirType].totalFirs = streamObj.firCount;
                  result[mediaType][dirType].totalPlis = streamObj.plisCount;
                  result[mediaType][dirType].totalSlis = streamObj.sliCount;
                }

                result[mediaType][dirType].bytes = self._parseConnectionStats(self._peerStats[peerId][subprop],
                  streamObj, dirType === 'receiving' ? 'bytesReceived' : 'bytesSent');
                result[mediaType][dirType].packets = self._parseConnectionStats(self._peerStats[peerId][subprop],
                  streamObj, dirType === 'receiving' ? 'packetsReceived' : 'packetsSent');

                result[mediaType][dirType].totalBytes = dirType === 'receiving' ? streamObj.bytesReceived : streamObj.bytesSent;
                result[mediaType][dirType].totalPackets = dirType === 'receiving' ? streamObj.packetsReceived : streamObj.packetsSent;

                if (dirType === 'receiving') {
                  result[mediaType][dirType].jitter = streamObj.jitter || 0;
                  result[mediaType].receiving.fractionLost = streamObj.fractionLost;
                  result[mediaType][dirType].packetsLost = self._parseConnectionStats(self._peerStats[peerId][subprop],
                    streamObj, 'packetsLost');
                  result[mediaType][dirType].packetsDiscarded = self._parseConnectionStats(self._peerStats[peerId][subprop],
                    streamObj, 'packetsDiscarded');
                  result[mediaType][dirType].totalPacketsLost = streamObj.packetsLost;
                  result[mediaType][dirType].totalPacketsDiscarded = streamObj.packetsDiscarded || 0;
                } else {
                  result[mediaType].sending.rtt = streamObj.roundTripTime || 0;
                  result[mediaType].sending.targetBitrate = streamObj.targetBitrate || 0;
                }

                if (result[mediaType][dirType].codec && streamObj.codecId) {
                  result[mediaType][dirType].codec.name = streamObj.codecId;
                }
              }
            });
          }
        });
      });

    } else {
      var reportedCandidate = false;
      var reportedCertificate = false;

      loopFn(stats, function (obj, prop) {
        if (prop.indexOf('ssrc_') === 0) {
          var dirType = prop.indexOf('_recv') > 0 ? 'receiving' : 'sending';

          // Polyfill fix for plugin. Plugin should fix this though
          if (!obj.mediaType) {
            obj.mediaType = obj.hasOwnProperty('audioOutputLevel') || obj.hasOwnProperty('audioInputLevel') ||
              obj.hasOwnProperty('googEchoCancellationReturnLoss') || obj.hasOwnProperty('googEchoCancellation') ?
              'audio' : 'video';
          }

          if (!self._peerStats[peerId][prop]) {
            self._peerStats[peerId][prop] = obj;
          }

          // Capture e2e delay
          try {
            if (obj.mediaType === 'video' && dirType === 'receiving') {
              var captureStartNtpTimeMs = parseInt(obj.googCaptureStartNtpTimeMs || '0', 10);

              if (captureStartNtpTimeMs > 0 && pc.getRemoteStreams().length > 0 && document &&
                typeof document.getElementsByTagName === 'function') {
                var streamId = pc.getRemoteStreams()[0].id || pc.getRemoteStreams()[0].label;
                var elements = [];

                if (self._isUsingPlugin) {
                  elements = document.getElementsByTagName('object');
                } else {
                  elements = document.getElementsByTagName('video');

                  if (elements.length === 0) {
                    elements = document.getElementsByTagName('audio');
                  }
                }

                for (var e = 0; e < elements.length; e++) {
                  var videoElmStreamId = null;

                  if (self._isUsingPlugin) {
                    if (!(elements[e].children && typeof elements[e].children === 'object' &&
                      typeof elements[e].children.length === 'number' && elements[e].children.length > 0)) {
                      break;
                    }

                    for (var ec = 0; ec < elements[e].children.length; ec++) {
                      if (elements[e].children[ec].name === 'streamId') {
                        videoElmStreamId = elements[e].children[ec].value || null;
                        break;
                      }
                    }

                  } else {
                    videoElmStreamId = elements[e].srcObject ? elements[e].srcObject.id ||
                      elements[e].srcObject.label : null;
                  }

                  if (videoElmStreamId && videoElmStreamId === streamId) {
                    result[obj.mediaType][dirType].e2eDelay = ((new Date()).getTime() + 2208988800000) -
                      captureStartNtpTimeMs - elements[e].currentTime * 1000;
                    break;
                  }
                }
              }
            }
          } catch (error) {
            self._log.warn([peerId, 'RTCStatsReport', null, 'Failed retrieving e2e delay ->'], error);
          }

          // Receiving/Sending RTP packets
          result[obj.mediaType][dirType].ssrc = parseInt(obj.ssrc || '0', 10);
          result[obj.mediaType][dirType].bytes = self._parseConnectionStats(self._peerStats[peerId][prop],
            obj, dirType === 'receiving' ? 'bytesReceived' : 'bytesSent');
          result[obj.mediaType][dirType].packets = self._parseConnectionStats(self._peerStats[peerId][prop],
            obj, dirType === 'receiving' ? 'packetsReceived' : 'packetsSent');
          result[obj.mediaType][dirType].nacks = self._parseConnectionStats(self._peerStats[peerId][prop],
            obj, dirType === 'receiving' ? 'googNacksReceived' : 'googNacksSent');
          result[obj.mediaType][dirType].totalPackets = parseInt((dirType === 'receiving' ? obj.packetsReceived :
            obj.packetsSent) || '0', 10);
          result[obj.mediaType][dirType].totalBytes = parseInt((dirType === 'receiving' ? obj.bytesReceived :
            obj.bytesSent) || '0', 10);
          result[obj.mediaType][dirType].totalNacks = parseInt((dirType === 'receiving' ? obj.googNacksReceived :
            obj.googNacksSent) || '0', 10);

          if (result[obj.mediaType][dirType].codec) {
            if (obj.googCodecName && obj.googCodecName !== 'unknown') {
              result[obj.mediaType][dirType].codec.name = obj.googCodecName;
            }
            if (obj.codecImplementationName && obj.codecImplementationName !== 'unknown') {
              result[obj.mediaType][dirType].codec.implementation = obj.codecImplementationName;
            }
          }

          if (dirType === 'sending') {
            // NOTE: Chrome sending audio does have it but plugin has..
            result[obj.mediaType].sending.rtt = parseFloat(obj.googRtt || '0', 10);
            result[obj.mediaType].sending.targetBitrate = obj.targetBitrate ? parseInt(obj.targetBitrate, 10) : null;
          } else {
            result[obj.mediaType].receiving.packetsLost = self._parseConnectionStats(self._peerStats[peerId][prop],
              obj, 'packetsLost');
            result[obj.mediaType].receiving.packetsDiscarded = self._parseConnectionStats(self._peerStats[peerId][prop],
              obj, 'packetsDiscarded');
            result[obj.mediaType].receiving.jitter = parseFloat(obj.googJitterReceived || '0', 10);
            result[obj.mediaType].receiving.jitterBufferMs = obj.googJitterBufferMs ? parseFloat(obj.googJitterBufferMs || '0', 10) : null;
            result[obj.mediaType].receiving.totalPacketsLost = parseInt(obj.packetsLost || '0', 10);
            result[obj.mediaType].receiving.totalPacketsDiscarded = parseInt(obj.packetsDiscarded || '0', 10);
          }

          if (obj.mediaType === 'video') {
            result.video[dirType].framesCorrupted = obj.framesCorrupted ? parseInt(obj.framesCorrupted, 10) : null;
            result.video[dirType].framesPerSecond = obj.framesPerSecond ? parseFloat(obj.framesPerSecond, 10) : null;
            result.video[dirType].framesDropped = obj.framesDropped ? parseInt(obj.framesDropped, 10) : null;
            
            if (dirType === 'sending') {
              result.video[dirType].frameWidth = obj.googFrameWidthSent ?
                parseInt(obj.googFrameWidthSent, 10) : null;
              result.video[dirType].frameHeight = obj.googFrameHeightSent ?
                parseInt(obj.googFrameHeightSent, 10) : null;
              result.video[dirType].plis = obj.googPlisSent ?
                self._parseConnectionStats(self._peerStats[peerId][prop], obj, 'googPlisSent') : null;
              result.video[dirType].firs = obj.googFirsSent ?
                self._parseConnectionStats(self._peerStats[peerId][prop], obj, 'googFirsSent') : null;
              result[obj.mediaType][dirType].totalPlis = obj.googPlisSent ? parseInt(obj.googPlisSent, 10) : null;
              result[obj.mediaType][dirType].totalFirs = obj.googFirsSent ? parseInt(obj.googFirsSent, 10) : null;
              result.video[dirType].framesEncoded = obj.framesEncoded ? parseInt(obj.framesEncoded, 10) : null;
              result.video[dirType].frameRateEncoded = obj.googFrameRateEncoded ?
                parseInt(obj.googFrameRateEncoded, 10) : null;
              result.video[dirType].frameRateInput = obj.googFrameRateInput ?
                parseInt(obj.googFrameRateInput, 10) : null;
              result.video[dirType].frameRate = obj.googFrameRateSent ?
                parseInt(obj.googFrameRateSent, 10) : null;
              result.video[dirType].qpSum = obj.qpSum ? parseInt(obj.qpSum, 10) : null;
              result.video[dirType].frames = obj.framesSent ?
                self._parseConnectionStats(self._peerStats[peerId][prop], obj, 'framesSent') : null;
              result.video[dirType].totalFrames = obj.framesSent ? parseInt(obj.framesSent, 10) : null;
            } else {
              result.video[dirType].frameWidth = obj.googFrameWidthReceived ?
                parseInt(obj.googFrameWidthReceived, 10) : null;
              result.video[dirType].frameHeight = obj.googFrameHeightReceived ?
                parseInt(obj.googFrameHeightReceived, 10) : null;
              result.video[dirType].plis = obj.googPlisReceived ?
                self._parseConnectionStats(self._peerStats[peerId][prop], obj, 'googPlisReceived') : null;
              result.video[dirType].firs = obj.googFirsReceived ?
                self._parseConnectionStats(self._peerStats[peerId][prop], obj, 'googFirsReceived') : null;
              result[obj.mediaType][dirType].totalPlis = obj.googPlisReceived ? parseInt(obj.googPlisReceived, 10) : null;
              result[obj.mediaType][dirType].totalFirs = obj.googFirsReceived ? parseInt(obj.googFirsReceived, 10) : null;
              result.video[dirType].framesDecoded = obj.framesDecoded ? parseInt(obj.framesDecoded, 10) : null;
              result.video[dirType].frameRateDecoded = obj.googFrameRateDecoded ?
                parseInt(obj.googFrameRateDecoded, 10) : null;
              result.video[dirType].frameRateOutput = obj.googFrameRateOutput ?
                parseInt(obj.googFrameRateOutput, 10) : null;
              result.video[dirType].frameRate = obj.googFrameRateReceived ?
                parseInt(obj.googFrameRateReceived, 10) : null;
              result.video[dirType].frames = obj.framesReceived ?
                self._parseConnectionStats(self._peerStats[peerId][prop], obj, 'framesReceived') : null;
              result.video[dirType].totalFrames = obj.framesReceived ? parseInt(obj.framesReceived, 10) : null;
            }
          } else {
            if (dirType === 'receiving') {
              result.audio[dirType].outputLevel = parseFloat(obj.audioOutputLevel || '0', 10);
            } else {
              result.audio[dirType].inputLevel = parseFloat(obj.audioInputLevel || '0', 10);
              result.audio[dirType].echoReturnLoss = parseFloat(obj.googEchoCancellationReturnLoss || '0', 10);
              result.audio[dirType].echoReturnLossEnhancement = parseFloat(obj.googEchoCancellationReturnLossEnhancement || '0', 10);
            }
          }

          self._peerStats[peerId][prop] = obj;

          if (!reportedCandidate) {
            loopFn(stats, function (canObj, canProp) {
              if (!reportedCandidate && canProp.indexOf('Conn-') === 0) {
                if (obj.transportId === canObj.googChannelId) {
                  if (!self._peerStats[peerId][canProp]) {
                    self._peerStats[peerId][canProp] = canObj;
                  }
                  formatCandidateFn('local', stats[canObj.localCandidateId]);
                  formatCandidateFn('remote', stats[canObj.remoteCandidateId]);
                  result.selectedCandidate.writable = canObj.googWritable ? canObj.googWritable === 'true' : null;
                  result.selectedCandidate.readable = canObj.googReadable ? canObj.googReadable === 'true' : null;
                  result.selectedCandidate.rtt = canObj.googRtt ?
                    self._parseConnectionStats(self._peerStats[peerId][canProp], canObj, 'googRtt') : null;
                  result.selectedCandidate.totalRtt = canObj.googRtt ? parseInt(canObj.googRtt, 10) : null;
                  result.selectedCandidate.requests = {
                    received: canObj.requestsReceived ?
                      self._parseConnectionStats(self._peerStats[peerId][canProp], canObj, 'requestsReceived') : null,
                    sent: canObj.requestsSent ?
                      self._parseConnectionStats(self._peerStats[peerId][canProp], canObj, 'requestsSent') : null,
                    totalReceived: canObj.requestsReceived ? parseInt(canObj.requestsReceived, 10) : null,
                    totalSent: canObj.requestsSent ? parseInt(canObj.requestsSent, 10) : null
                  };
                  result.selectedCandidate.responses = {
                    received: canObj.responsesReceived ?
                      self._parseConnectionStats(self._peerStats[peerId][canProp], canObj, 'responsesReceived') : null,
                    sent: canObj.responsesSent ?
                      self._parseConnectionStats(self._peerStats[peerId][canProp], canObj, 'responsesSent') : null,
                    totalReceived: canObj.responsesReceived ? parseInt(canObj.responsesReceived, 10) : null,
                    totalSent: canObj.responsesSent ? parseInt(canObj.responsesSent, 10) : null
                  };
                  result.selectedCandidate.consentRequests = {
                    received: canObj.consentRequestsReceived ?
                      self._parseConnectionStats(self._peerStats[peerId][canProp], canObj, 'consentRequestsReceived') : null,
                    sent: canObj.consentRequestsSent ?
                      self._parseConnectionStats(self._peerStats[peerId][canProp], canObj, 'consentRequestsSent') : null,
                    totalReceived: canObj.consentRequestsReceived ? parseInt(canObj.consentRequestsReceived, 10) : null,
                    totalSent: canObj.consentRequestsSent ? parseInt(canObj.consentRequestsSent, 10) : null
                  };
                  result.selectedCandidate.consentResponses = {
                    received: canObj.consentResponsesReceived ?
                      self._parseConnectionStats(self._peerStats[peerId][canProp], canObj, 'consentResponsesReceived') : null,
                    sent: canObj.consentResponsesSent ?
                      self._parseConnectionStats(self._peerStats[peerId][canProp], canObj, 'consentResponsesSent') : null,
                    totalReceived: canObj.consentResponsesReceived ? parseInt(canObj.consentResponsesReceived, 10) : null,
                    totalSent: canObj.consentResponsesSent ? parseInt(canObj.consentResponsesSent, 10) : null
                  };
  
                  self._peerStats[peerId][canProp] = canObj;
                  reportedCandidate = true;
                }
              }
            });
          }

          if (!reportedCertificate && stats[obj.transportId]) {
            result.certificate.srtpCipher = stats[obj.transportId].srtpCipher || null;
            result.certificate.dtlsCipher = stats[obj.transportId].dtlsCipher || null;

            var localCertId = stats[obj.transportId].localCertificateId;
            var remoteCertId = stats[obj.transportId].remoteCertificateId;

            if (localCertId && stats[localCertId]) {
              result.certificate.local.derBase64 = stats[localCertId].googDerBase64 || null;
              if (stats[localCertId].googFingerprint) {
                result.certificate.local.fingerprint = stats[localCertId].googFingerprint;
              }
              if (stats[localCertId].googFingerprintAlgorithm) {
                result.certificate.local.fingerprintAlgorithm = stats[localCertId].googFingerprintAlgorithm;
              }
            }

            if (remoteCertId && stats[remoteCertId]) {
              result.certificate.remote.derBase64 = stats[remoteCertId].googDerBase64 || null;
              if (stats[remoteCertId].googFingerprint) {
                result.certificate.remote.fingerprint = stats[remoteCertId].googFingerprint;
              }
              if (stats[remoteCertId].googFingerprintAlgorithm) {
                result.certificate.remote.fingerprintAlgorithm = stats[remoteCertId].googFingerprintAlgorithm;
              }
            }
            reportedCertificate = true;
          }
        }
      });
    }

    if ((result.selectedCandidate.local.candidateType || '').indexOf('relay') === 0) {
      result.selectedCandidate.local.turnMediaTransport = 'UDP';
      if (self._forceTURNSSL && window.webrtcDetectedBrowser !== 'firefox') {
        result.selectedCandidate.local.turnMediaTransport = 'TCP/TLS';
      } else if ((self._TURNTransport === self.TURN_TRANSPORT.TCP || self._forceTURNSSL) &&
        self._room && self._room.connection && self._room.connection.peerConfig &&
        Array.isArray(self._room.connection.peerConfig.iceServers) &&
        self._room.connection.peerConfig.iceServers[0] &&
        self._room.connection.peerConfig.iceServers[0].urls[0] &&
        self._room.connection.peerConfig.iceServers[0].urls[0].indexOf('?transport=tcp') > 0) {
        result.selectedCandidate.local.turnMediaTransport = 'TCP';
      }
    } else {
      result.selectedCandidate.local.turnMediaTransport = null;
    }

    callback(null, result);

  }, function (error) {
    callback(error, null);
  });
};

/**
 * Function that starts the Peer connection session.
 * Remember to remove previous method of reconnection (re-creating the Peer connection - destroy and create connection).
 * @method _addPeer
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._addPeer = function(targetMid, peerBrowser, toOffer, restartConn, receiveOnly, isSS) {
  var self = this;
  if (self._peerConnections[targetMid] && !restartConn) {
    self._log.error([targetMid, null, null, 'Connection to peer has already been made']);
    return;
  }
  self._log.log([targetMid, null, null, 'Starting the connection to peer. Options provided:'], {
    peerBrowser: peerBrowser,
    toOffer: toOffer,
    receiveOnly: receiveOnly,
    enableDataChannel: self._enableDataChannel
  });

  self._log.info('Adding peer', isSS);

  if (!restartConn) {
    self._peerConnections[targetMid] = self._createPeerConnection(targetMid, !!isSS);
  }

  if (!self._peerConnections[targetMid]) {
    self._log.error([targetMid, null, null, 'Failed creating the connection to peer']);
    return;
  }

  self._peerConnections[targetMid].hasScreen = !!isSS;
};

/**
 * Function that re-negotiates a Peer connection.
 * Remember to remove previous method of reconnection (re-creating the Peer connection - destroy and create connection).
 * @method _restartPeerConnection
 * @private
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._restartPeerConnection = function (peerId, doIceRestart, callback) {
  var self = this;

  if (!self._peerConnections[peerId]) {
    self._log.error([peerId, null, null, 'Peer does not have an existing ' +
      'connection. Unable to restart']);
    return;
  }

  var pc = self._peerConnections[peerId];
  var agent = (self.getPeerInfo(peerId) || {}).agent || {};

  // prevent restarts for other SDK clients
  if (self._isLowerThanVersion(agent.SMProtocolVersion || '', '0.1.2')) {
    var notSupportedError = new Error('Failed restarting with other agents connecting from other SDKs as ' +
      're-negotiation is not supported by other SDKs');

    self._log.warn([peerId, 'RTCPeerConnection', null, 'Ignoring restart request as agent\'s SDK does not support it'],
        notSupportedError);

    if (typeof callback === 'function') {
      self._log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart failure callback']);
      callback(notSupportedError);
    }
    return;
  }

  // This is when the state is stable and re-handshaking is possible
  // This could be due to previous connection handshaking that is already done
  if (pc.signalingState === self.PEER_CONNECTION_STATE.STABLE && self._peerConnections[peerId]) {
    self._log.log([peerId, null, null, 'Sending restart message to signaling server']);

    var restartMsg = {
      type: self._SIG_MESSAGE_TYPE.RESTART,
      mid: self._user.sid,
      rid: self._room.id,
      agent: window.webrtcDetectedBrowser,
      version: (window.webrtcDetectedVersion || 0).toString(),
      os: window.navigator.platform,
      userInfo: self._getUserInfo(),
      target: peerId,
      weight: self._peerPriorityWeight,
      receiveOnly: self.getPeerInfo().config.receiveOnly,
      enableIceTrickle: self._enableIceTrickle,
      enableDataChannel: self._enableDataChannel,
      enableIceRestart: self._enableIceRestart,
      doIceRestart: doIceRestart === true && self._enableIceRestart && self._peerInformations[peerId] &&
        self._peerInformations[peerId].config.enableIceRestart,
      isRestartResend: false,
      temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
      SMProtocolVersion: self.SM_PROTOCOL_VERSION,
      DTProtocolVersion: self.DT_PROTOCOL_VERSION
    };

    if (self._publishOnly) {
      restartMsg.publishOnly = {
        type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
      };
    }

    if (self._parentId) {
      restartMsg.parentId = self._parentId;
    }

    self._peerEndOfCandidatesCounter[peerId] = self._peerEndOfCandidatesCounter[peerId] || {};
    self._peerEndOfCandidatesCounter[peerId].len = 0;
    self._sendChannelMessage(restartMsg);
    self._trigger('peerRestart', peerId, self.getPeerInfo(peerId), true, doIceRestart === true);

    if (typeof callback === 'function') {
      self._log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart callback']);
      callback(null);
    }

  } else {
    // Let's check if the signalingState is stable first.
    // In another galaxy or universe, where the local description gets dropped..
    // In the offerHandler or answerHandler, do the appropriate flags to ignore or drop "extra" descriptions
    if (pc.signalingState === self.PEER_CONNECTION_STATE.HAVE_LOCAL_OFFER) {
      // Checks if the local description is defined first
      var hasLocalDescription = pc.localDescription && pc.localDescription.sdp;
      // By then it should have at least the local description..
      if (hasLocalDescription) {
        self._sendChannelMessage({
          type: pc.localDescription.type,
          sdp: pc.localDescription.sdp,
          mid: self._user.sid,
          target: peerId,
          rid: self._room.id,
          restart: true
        });
      } else {
        var noLocalDescriptionError = 'Failed re-sending localDescription as there is ' +
          'no localDescription set to connection. There could be a handshaking step error';
        self._log.error([peerId, 'RTCPeerConnection', null, noLocalDescriptionError], {
            localDescription: pc.localDescription,
            remoteDescription: pc.remoteDescription
        });
        if (typeof callback === 'function') {
          self._log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart failure callback']);
          callback(new Error(noLocalDescriptionError));
        }
      }
    // It could have connection state closed
    } else {
      var unableToRestartError = 'Failed restarting as peer connection state is ' + pc.signalingState;
      self._log.warn([peerId, 'RTCPeerConnection', null, unableToRestartError]);
      if (typeof callback === 'function') {
        self._log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart failure callback']);
        callback(new Error(unableToRestartError));
      }
    }
  }
};

/**
 * Function that ends the Peer connection session.
 * @method _removePeer
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._removePeer = function(peerId) {
  if (!this._peerConnections[peerId] && !this._peerInformations[peerId]) {
    this._log.debug([peerId, 'RTCPeerConnection', null, 'Dropping the hangup from Peer as not connected to Peer at all.']);
    return;
  }

  var peerInfo = UtilsFactory.clone(this.getPeerInfo(peerId)) || {
    userData: '',
    settings: {},
    mediaStatus: {},
    agent: {},
    config: {},
    room: UtilsFactory.clone(this._selectedRoom)
  };

  if (peerId !== 'MCU') {
    this._trigger('peerLeft', peerId, peerInfo, false);
  } else {
    this._hasMCU = false;
    this._log.log([peerId, null, null, 'MCU has stopped listening and left']);
    this._trigger('serverPeerLeft', peerId, this.SERVER_PEER_TYPE.MCU);
  }

  // check if health timer exists
  if (this._peerConnections[peerId]) {
    if (this._peerConnections[peerId].signalingState !== this.PEER_CONNECTION_STATE.CLOSED) {
      this._peerConnections[peerId].close();
    }

    if (peerId !== 'MCU') {
      this._handleEndedStreams(peerId);
    }

    delete this._peerConnections[peerId];
  }
  // remove peer informations session
  if (this._peerInformations[peerId]) {
    delete this._peerInformations[peerId];
  }
  // remove peer messages stamps session
  if (this._peerMessagesStamps[peerId]) {
    delete this._peerMessagesStamps[peerId];
  }
  // remove peer streams session
  if (this._streamsSession[peerId]) {
    delete this._streamsSession[peerId];
  }
  // remove peer streams session
  if (this._peerEndOfCandidatesCounter[peerId]) {
    delete this._peerEndOfCandidatesCounter[peerId];
  }
  // remove peer sdp session
  if (this._sdpSessions[peerId]) {
    delete this._sdpSessions[peerId];
  }

  // close datachannel connection
  if (this._dataChannels[peerId]) {
    this._closeDataChannel(peerId);
  }

  this._log.log([peerId, null, null, 'Successfully removed peer']);
};

/**
 * Function that creates the Peer connection.
 * @method _createPeerConnection
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._createPeerConnection = function(targetMid, isScreenSharing) {
  var pc, self = this;
  if (!self._inRoom || !(self._room && self._room.connection &&
    self._room.connection.peerConfig && Array.isArray(self._room.connection.peerConfig.iceServers))) {
    return;
  }
  // currently the AdapterJS 0.12.1-2 causes an issue to prevent firefox from
  // using .urls feature
  try {
    pc = new RTCPeerConnection({
      iceServers: self._room.connection.peerConfig.iceServers,
      iceTransportPolicy: self._filterCandidatesType.host && self._filterCandidatesType.srflx &&
        !self._filterCandidatesType.relay ? 'relay' : 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    }, {
      optional: [
        { DtlsSrtpKeyAgreement: true },
        { googIPv6: true }
      ]
    });
    self._log.info([targetMid, null, null, 'Created peer connection']);
    self._log.debug([targetMid, null, null, 'Peer connection config:'], self._room.connection.peerConfig);
    self._log.debug([targetMid, null, null, 'Peer connection constraints:'], self._room.connection.peerConstraints);
  } catch (error) {
    self._log.error([targetMid, null, null, 'Failed creating peer connection:'], error);
    return null;
  }
  // attributes (added on by Temasys)
  pc.setOffer = '';
  pc.setAnswer = '';
  pc.hasStream = false;
  pc.hasScreen = !!isScreenSharing;
  pc.hasMainChannel = false;
  pc.firefoxStreamId = '';
  pc.processingLocalSDP = false;
  pc.processingRemoteSDP = false;
  pc.gathered = false;
  pc.gathering = false;

  // candidates
  self._gatheredCandidates[targetMid] = {
    sending: { host: [], srflx: [], relay: [] },
    receiving: { host: [], srflx: [], relay: [] }
  };

  self._streamsSession[targetMid] = self._streamsSession[targetMid] || {};
  self._peerEndOfCandidatesCounter[targetMid] = self._peerEndOfCandidatesCounter[targetMid] || {};
  self._sdpSessions[targetMid] = { local: {}, remote: {} };

  // callbacks
  // standard not implemented: onnegotiationneeded,
  pc.ondatachannel = function(event) {
    var dc = event.channel || event;
    self._log.debug([targetMid, 'RTCDataChannel', dc.label, 'Received datachannel ->'], dc);
    if (self._enableDataChannel && self._peerInformations[targetMid] &&
      self._peerInformations[targetMid].config.enableDataChannel) {
      var channelType = self.DATA_CHANNEL_TYPE.DATA;
      var channelKey = dc.label;

      // if peer does not have main channel, the first item is main
      if (!pc.hasMainChannel) {
        channelType = self.DATA_CHANNEL_TYPE.MESSAGING;
        channelKey = 'main';
        pc.hasMainChannel = true;
      }

      self._createDataChannel(targetMid, dc);

    } else {
      self._log.warn([targetMid, 'RTCDataChannel', dc.label, 'Not adding datachannel as enable datachannel ' +
        'is set to false']);
    }
  };

  pc.onaddstream = function(event) {
    if (!self._peerConnections[targetMid]) {
      return;
    }

    var stream = event.stream || event;
    var streamId = stream.id || stream.label;

    if (targetMid === 'MCU') {
      self._log.warn([targetMid, 'MediaStream', streamId, 'Ignoring received remote stream from MCU ->'], stream);
      return;
    } else if (!self._sdpSettings.direction.audio.receive && !self._sdpSettings.direction.video.receive) {
      self._log.warn([targetMid, 'MediaStream', streamId, 'Ignoring received empty remote stream ->'], stream);
      return;
    }

    // Fixes for the dirty-hack for Chrome offer to Firefox (inactive)
    // See: ESS-680
    if (!self._hasMCU && window.webrtcDetectedBrowser === 'firefox' &&
      pc.getRemoteStreams().length > 1 && pc.remoteDescription && pc.remoteDescription.sdp) {

      if (pc.remoteDescription.sdp.indexOf(' msid:' + streamId + ' ') === -1) {
        self._log.warn([targetMid, 'MediaStream', streamId, 'Ignoring received empty remote stream ->'], stream);
        return;
      }
    }

    var peerSettings = UtilsFactory.clone(self.getPeerInfo(targetMid).settings);
    var hasScreenshare = peerSettings.video && typeof peerSettings.video === 'object' && !!peerSettings.video.screenshare;

    pc.hasStream = true;
    pc.hasScreen = !!hasScreenshare;

    self._streamsSession[targetMid][streamId] = peerSettings;
    self._onRemoteStreamAdded(targetMid, stream, !!hasScreenshare);
  };

  pc.onicecandidate = function(event) {
    self._onIceCandidate(targetMid, event.candidate || event);
  };

  pc.oniceconnectionstatechange = function(evt) {
    var iceConnectionState = pc.iceConnectionState;

    self._log.debug([targetMid, 'RTCIceConnectionState', null, 'Ice connection state changed ->'], iceConnectionState);

    if (window.webrtcDetectedBrowser === 'edge') {
      if (iceConnectionState === 'connecting') {
        iceConnectionState = self.ICE_CONNECTION_STATE.CHECKING;
      } else if (iceConnectionState === 'new') {
        iceConnectionState = self.ICE_CONNECTION_STATE.FAILED;
      }
    }

    self._trigger('iceConnectionState', iceConnectionState, targetMid);

    if (pc.iceConnectionState === self.ICE_CONNECTION_STATE.FAILED && self._enableIceTrickle) {
      self._trigger('iceConnectionState', self.ICE_CONNECTION_STATE.TRICKLE_FAILED, targetMid);
    }
  };

  pc.onsignalingstatechange = function() {
    self._log.debug([targetMid, 'RTCSignalingState', null, 'Peer connection state changed ->'], pc.signalingState);
    self._trigger('peerConnectionState', pc.signalingState, targetMid);
  };
  pc.onicegatheringstatechange = function() {
    self._log.log([targetMid, 'RTCIceGatheringState', null, 'Ice gathering state changed ->'], pc.iceGatheringState);
    self._trigger('candidateGenerationState', pc.iceGatheringState, targetMid);
  };

  if (window.webrtcDetectedBrowser === 'firefox') {
    pc.removeStream = function (stream) {
      var senders = pc.getSenders();
      for (var s = 0; s < senders.length; s++) {
        var tracks = stream.getTracks();
        for (var t = 0; t < tracks.length; t++) {
          if (tracks[t] === senders[s].track) {
            pc.removeTrack(senders[s]);
          }
        }
      }
    };
  }

  return pc;
};

/**
 * Function that handles the <code>_restartPeerConnection</code> scenario
 *   for MCU enabled Peer connections.
 * This is implemented currently by making the user leave and join the Room again.
 * The Peer ID will not stay the same though.
 * @method _restartMCUConnection
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._restartMCUConnection = function(callback, doIceRestart) {
  var self = this;
  var listOfPeers = Object.keys(self._peerConnections);
  var listOfPeerRestartErrors = {};
  var sendRestartMsgFn = function (peerId) {
    var restartMsg = {
      type: self._SIG_MESSAGE_TYPE.RESTART,
      mid: self._user.sid,
      rid: self._room.id,
      agent: window.webrtcDetectedBrowser,
      version: (window.webrtcDetectedVersion || 0).toString(),
      os: window.navigator.platform,
      userInfo: self._getUserInfo(),
      target: peerId,
      weight: self._peerPriorityWeight,
      receiveOnly: self.getPeerInfo().config.receiveOnly,
      enableIceTrickle: self._enableIceTrickle,
      enableDataChannel: self._enableDataChannel,
      enableIceRestart: self._enableIceRestart,
      doIceRestart: self._mcuUseRenegoRestart && doIceRestart === true &&
        self._enableIceRestart && self._peerInformations[peerId] &&
        self._peerInformations[peerId].config.enableIceRestart,
      isRestartResend: false,
      temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
      SMProtocolVersion: self.SM_PROTOCOL_VERSION,
      DTProtocolVersion: self.DT_PROTOCOL_VERSION
    };

    if (self._publishOnly) {
      restartMsg.publishOnly = {
        type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
      };
    }

    if (self._parentId) {
      restartMsg.parentId = self._parentId;
    }

    self._log.log([peerId, 'RTCPeerConnection', null, 'Sending restart message to signaling server ->'], restartMsg);

    self._sendChannelMessage(restartMsg);
  };

  for (var i = 0; i < listOfPeers.length; i++) {
    if (!self._peerConnections[listOfPeers[i]]) {
      var error = 'Peer connection with peer does not exists. Unable to restart';
      self._log.error([listOfPeers[i], 'PeerConnection', null, error]);
      listOfPeerRestartErrors[listOfPeers[i]] = new Error(error);
      continue;
    }

    if (listOfPeers[i] !== 'MCU') {
      self._trigger('peerRestart', listOfPeers[i], self.getPeerInfo(listOfPeers[i]), true, false);

      if (!self._mcuUseRenegoRestart) {
        sendRestartMsgFn(listOfPeers[i]);
      }
    }
  }

  self._trigger('serverPeerRestart', 'MCU', self.SERVER_PEER_TYPE.MCU);

  if (self._mcuUseRenegoRestart) {
    self._peerEndOfCandidatesCounter.MCU = self._peerEndOfCandidatesCounter.MCU || {};
    self._peerEndOfCandidatesCounter.MCU.len = 0;
    sendRestartMsgFn('MCU');
  } else {
    // Restart with MCU = peer leaves then rejoins room
    var peerJoinedFn = function (peerId, peerInfo, isSelf) {
      self._log.log([null, 'PeerConnection', null, 'Invoked all peers to restart with MCU. Firing callback']);

      if (typeof callback === 'function') {
        if (Object.keys(listOfPeerRestartErrors).length > 0) {
          callback({
            refreshErrors: listOfPeerRestartErrors,
            listOfPeers: listOfPeers
          }, null);
        } else {
          callback(null, {
            listOfPeers: listOfPeers
          });
        }
      }
    };

    self.once('peerJoined', peerJoinedFn, function (peerId, peerInfo, isSelf) {
      return isSelf;
    });

    self.leaveRoom(false, function (error, success) {
      if (error) {
        if (typeof callback === 'function') {
          for (var i = 0; i < listOfPeers.length; i++) {
            listOfPeerRestartErrors[listOfPeers[i]] = error;
          }
          callback({
            refreshErrors: listOfPeerRestartErrors,
            listOfPeers: listOfPeers
          }, null);
        }
      } else {
        //self._trigger('serverPeerLeft', 'MCU', self.SERVER_PEER_TYPE.MCU);
        self.joinRoom(self._selectedRoom);
      }
    });
  }
};

/**
 * Function that handles the stats tabulation.
 * @method _parseConnectionStats
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._parseConnectionStats = function(prevStats, stats, prop) {
  var nTime = stats.timestamp;
  var oTime = prevStats.timestamp;
  var nVal = parseFloat(stats[prop] || '0', 10);
  var oVal = parseFloat(prevStats[prop] || '0', 10);

  if ((new Date(nTime).getTime()) === (new Date(oTime).getTime())) {
    return nVal;
  }

  return parseFloat(((nVal - oVal) / (nTime - oTime) * 1000).toFixed(3) || '0', 10);
};

/**
 * Function that signals the end-of-candidates flag.
 * @method _signalingEndOfCandidates
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._signalingEndOfCandidates = function(targetMid) {
  var self = this;

  if (!self._peerEndOfCandidatesCounter[targetMid]) {
    return;
  }

  // If remote description is set
  if (self._peerConnections[targetMid].remoteDescription && self._peerConnections[targetMid].remoteDescription.sdp &&
  // If end-of-candidates signal is received
    typeof self._peerEndOfCandidatesCounter[targetMid].expectedLen === 'number' &&
  // If all ICE candidates are received
    self._peerEndOfCandidatesCounter[targetMid].len >= self._peerEndOfCandidatesCounter[targetMid].expectedLen &&
  // If there is no ICE candidates queue
    (self._peerCandidatesQueue[targetMid] ? self._peerCandidatesQueue[targetMid].length === 0 : true) &&
  // If it has not been set yet
    !self._peerEndOfCandidatesCounter[targetMid].hasSet) {
    self._log.debug([targetMid, 'RTCPeerConnection', null, 'Signaling of end-of-candidates remote ICE gathering.']);
    self._peerEndOfCandidatesCounter[targetMid].hasSet = true;
    try {
      if (window.webrtcDetectedBrowser === 'edge') {
        var mLineCounter = -1;
        var addedMids = [];
        var sdpLines = self._peerConnections[targetMid].remoteDescription.sdp.split('\r\n');

        for (var i = 0; i < sdpLines.length; i++) {
          if (sdpLines[i].indexOf('m=') === 0) {
            mLineCounter++;
          } else if (sdpLines[i].indexOf('a=mid:') === 0) {
            var mid = sdpLines[i].split('a=mid:')[1] || '';
            if (mid && addedMids.indexOf(mid) === -1) {
              addedMids.push(mid);
              self._addIceCandidate(targetMid, 'endofcan-' + (new Date()).getTime(), new RTCIceCandidate({
                sdpMid: mid,
                sdpMLineIndex: mLineCounter,
                candidate: 'candidate:1 1 udp 1 0.0.0.0 9 typ endOfCandidates'
              }));
            }
          }
        }

      } else {
        self._peerConnections[targetMid].addIceCandidate(null);
      }

      if (self._gatheredCandidates[targetMid]) {
        self._trigger('candidatesGathered', targetMid, {
          expected: self._peerEndOfCandidatesCounter[targetMid].expectedLen || 0,
          received: self._peerEndOfCandidatesCounter[targetMid].len || 0,
          processed: self._gatheredCandidates[targetMid].receiving.srflx.length +
            self._gatheredCandidates[targetMid].receiving.relay.length +
            self._gatheredCandidates[targetMid].receiving.host.length
        });
      }

    } catch (error) {
      self._log.error([targetMid, 'RTCPeerConnection', null, 'Failed signaling end-of-candidates ->'], error);
    }
  }
};


