/* eslint-disable import/extensions */
import Skylink, { SkylinkLogger, SkylinkEventManager, SkylinkConstants } from '../../../build/skylink.complete.js';
import { config } from '../config.js';

/********************************************************
 API Settings
 *********************************************************/
const Demo = window.Demo || {};
Demo.Peers = 0;
Demo.PeerIds = [];
Demo.Stats = {};
Demo.Methods = {};
Demo.Skylink = new Skylink(config);
Demo.ShowStats = {};
Demo.Streams = null;
Demo._Skylink = Skylink;
window.Demo = Demo;
let selectedPeers = [];
let _peerId = null;

const { $, document } = window;

//----- joinRoom options -----
const displayName = `name_user_${  Math.floor((Math.random() * 1000) + 1)}`;
$('#display_user_info').val(displayName);

const joinRoomOptions = {
  audio: { stereo: true },
  video: true,
  userData: displayName,
};

//----- set logging -----
SkylinkLogger.setLevel(SkylinkLogger.logLevels.DEBUG, true);

Demo.Methods.toggleInRoomSettings = function(peerId, inRoom) {
  if (inRoom) {
    $('#join_room_panel').css("display", "none");
    $('#in_room_panel').css("display", "block");
    $('#display_user_id').html(peerId);
    $('#room_locked_row').hide();
  } else {
    $('#join_room_btn').removeClass('disabled');
    $('#presence_list_body').empty();
    $('#join_room_panel').css("display", "block");
    $('#in_room_panel').css("display", "none");
    $('#isAudioMuted').css('color', 'red');
    $('#isVideoMuted').css('color', 'red');
    $('#display_room_status').html('-');
    $('#display_user_id').html('Not in Room');
    $('#presence_panel').hide();
    $('#console_log').empty();
  }
};

Demo.Methods.updateStreams = function() {
  Demo.Streams = Demo.Skylink.getStreams(config.defaultRoom) || [];
};

Demo.Methods.getMediaStatus = function(type) {
  if (!Demo.Streams || !Demo.Streams.userMedia) {
    return { audioMuted: -1, videoMuted: -1 };
  }

  if (type === 'audio') {
    const audioSId = Demo.Skylink.getPeerInfo(config.defaultRoom).mediaStatus[Object.keys(Demo.Streams.userMedia).filter((sId) => { return Demo.Streams.userMedia[sId].getAudioTracks().length > 0 })]
    return audioSId ? audioSId: { audioMuted: -1, videoMuted: -1 };
  }

  if (type === 'video') {
    const videoSId = Demo.Skylink.getPeerInfo(config.defaultRoom).mediaStatus[Object.keys(Demo.Streams.userMedia).filter((sId) => { return Demo.Streams.userMedia[sId].getVideoTracks().length > 0 })]
    return videoSId ? videoSId: { audioMuted: -1, videoMuted: -1 };
  }
};

Demo.Methods.logToConsoleDOM = (message, level) => {
  const $loggerListParentDOM = $('ul#console_log');
  const $logListItem = $('<li />').addClass('list-group-item');
  const $logText = $('<span />').addClass('log-message-text').text(message);

  if (level) {
    const $levelBadge = $('<span />').addClass('log-level-badge badge badge-primary').text(level.toUpperCase());
    $logListItem.append($levelBadge);
  }

  $logListItem.append($logText);
  $logListItem.appendTo($loggerListParentDOM);
};

/********************************************************
 SKYLINK EVENTS
 *********************************************************/

// //---------------------------------------------------
// // PEER EVENTS
// //---------------------------------------------------
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_JOINED, (evt) => {
  const eventDetail = evt.detail;
  const { isSelf, peerId, peerInfo } = eventDetail;
  const streamIds = Object.keys(peerInfo.mediaStatus);
  let audioStreamId = null;
  let videoStreamId = null;

  if (streamIds[0] && peerInfo.mediaStatus[streamIds[0]].videoMuted === -1) {
    audioStreamId = streamIds[0];
    videoStreamId = streamIds[1];
  }

  if (isSelf) {
    _peerId = peerId;
    // allow only 2 peers in the room
    if (Demo.Peers > 0) {
      Demo.Skylink.lockRoom(config.defaultRoom);
    }

    Demo.Methods.toggleInRoomSettings(peerId, true);

    $('#isAudioMuted').css('color',
      (audioStreamId && peerInfo.mediaStatus[audioStreamId].audioMuted === 1) ? 'green' : 'red');
    $('#isVideoMuted').css('color',
      (videoStreamId && peerInfo.mediaStatus[videoStreamId].videoMuted === 1) ? 'green' : 'red');
  } else {
    $('#presence_panel').show();
    Demo.Methods.logToConsoleDOM(`Peer ${peerId} has joined the room`, 'System');

    var newListEntry = '<tr id="user' + peerId + '" class="badQuality">' +
      '<td><span class="name">' + peerInfo.userData + '</span></td><td>';

    var titleList = ['MediaStream: Video', 'MediaStream: Audio'];
    var glyphiconList = ['glyphicon-facetime-video video', 'glyphicon-volume-up audio'];
    for (var i = 0; i < titleList.length; i++) {
      newListEntry += '<span class="glyphicon ' + glyphiconList[i] + ' icon-circle ' +
        i + '" title="' + titleList[i] + '"></span>&nbsp;&nbsp;&nbsp;';
    }
    newListEntry += '</td></tr>';
    $('#presence_list').append(newListEntry);

    Demo.Skylink.lockRoom(config.defaultRoom);
  }

  // create the peer video element
  if ($('#video' + peerId).length === 0) {
    var getColour = function () {
      return "hsl(" + 360 * Math.random() + ',' +
        (25 + 70 * Math.random()) + '%,' +
        (85 + 10 * Math.random()) + '%)'
    };

    var peerElm = window.document.createElement('div');
    peerElm.id = 'video' + peerId;
    peerElm.className = 'col-md-6 peervideo';
    peerElm.style.backgroundColor = getColour();
    peerElm.style.padding = '5px';

    let peerVideo = window.document.createElement('video');
    peerVideo.className = isSelf ? 'video-obj col-md-12 self-video-elem' : 'video-obj col-md-12';
    peerVideo.muted = isSelf;
    peerVideo.autoplay = true;
    peerVideo.controls = true;
    peerVideo.setAttribute('playsinline', true);

    let peerAudio = window.document.createElement('audio');
    peerAudio.className = isSelf ? 'audio-obj col-md-12 self-audio-elem' : 'audio-obj col-md-12';
    peerAudio.muted = isSelf;
    peerAudio.autoplay = true;
    peerAudio.controls = true;
    peerAudio.setAttribute('playsinline', true);

    if (!peerInfo.settings.audio && !peerInfo.settings.video) {
      peerVideo.poster = '../assets/imgs/no_profile.jpg';
    }

    $('#peer_video_list').append(peerElm);
    $(peerElm).append(peerVideo);
    $(peerElm).append(peerAudio);
    $(peerElm).append('<div class="connstats-wrapper"><button class="toggle-connstats" data="' + (isSelf ? 'MCU' : peerId) +
      '">See ' + (isSelf ? 'MCU ' : '') + 'Stats</button><div class="row connstats">' +
      '<div class="audio row"><b class="col-md-12">Audio</b><p class="col-md-6">Uploading: <span class="upload"></span></p>' +
      '<p class="col-md-6">Downloading: <span class="download"></span></p></div>' +
      '<div class="video row"><b class="col-md-12">Video</b><p class="col-md-6">Uploading: <span class="upload"></span></p>' +
      '<p class="col-md-6">Downloading: <span class="download"></span></p></div>' +
      '<div class="candidate row"><b class="col-md-12">Selected Candidate</b><p class="col-md-6">Local: <span class="local"></span></p>' +
      '<p class="col-md-6">Remote: <span class="remote"></span></p></div>' +
      '<div class="certificate row"><b class="col-md-12">Certificates</b><p class="col-md-6"><span class="certleft"></span></p>' +
      '<p class="col-md-6"><span class="certright"></span></p></div></div></div>');


    setTimeout(function () {
      peerVideo.removeAttribute('controls');
      peerAudio.removeAttribute('controls');
    });
  }
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_LEFT, (evt) => {
  const eventDetail = evt.detail;
  const { peerId } = eventDetail;

  Demo.Methods.logToConsoleDOM(`Peer ${peerId} has left the room`, 'System');

  if (Demo.PeerIds.indexOf(peerId) > -1) {
    Demo.PeerIds.splice(Demo.PeerIds.indexOf(peerId), 1);
    Demo.Peers -= 1;
  }
  $(`#video${peerId}`).remove();
  $(`#user${peerId}`).remove();
  const index = selectedPeers.indexOf(peerId);

  if (index > -1) {
    selectedPeers.splice(index, 1);
  }

  $('#presence_panel').hide();

  delete Demo.Stats[peerId];
  delete Demo.ShowStats[peerId];
  Demo.Skylink.unlockRoom(config.defaultRoom);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_UPDATED, (evt) => {
  const { peerId, peerInfo, isSelf } = evt.detail;
  const streamIds = Object.keys(peerInfo.mediaStatus);
  let audioStreamId = null;
  let videoStreamId = null;

  if (streamIds[0] && peerInfo.mediaStatus[streamIds[0]].videoMuted === -1) {
    audioStreamId = streamIds[0];
    videoStreamId = streamIds[1];
  }

  if (isSelf) {
    $('#isAudioMuted').css('color',
      (audioStreamId && peerInfo.mediaStatus[audioStreamId].audioMuted === 1) ? 'green' : 'red');
    $('#isVideoMuted').css('color',
      (videoStreamId && peerInfo.mediaStatus[videoStreamId].videoMuted === 1) ? 'green' : 'red');
  } else {
    const audioMuted = !(audioStreamId && peerInfo.mediaStatus[audioStreamId].audioMuted === 1);
    const videoMuted = !(videoStreamId && peerInfo.mediaStatus[videoStreamId].videoMuted === 1);

    if (videoMuted && $('#user' + peerId + ' .video').hasClass('green') || (!videoMuted && !$('#user' + peerId + ' .video').hasClass('green'))) {
      $('#user' + peerId + ' .video').toggleClass('green');
      Demo.Methods.logToConsoleDOM(`Peer ${peerId} ${videoMuted ? 'muted' : 'unmuted' } video`, 'Media')    ;
    }

    if (audioMuted && $('#user' + peerId + ' .audio').hasClass('green') || (!audioMuted && !$('#user' + peerId + ' .audio').hasClass('green'))) {
      $('#user' + peerId + ' .audio').toggleClass('green');
      Demo.Methods.logToConsoleDOM(`Peer ${peerId} ${audioMuted ? 'muted' : 'unmuted' } audio`, 'Media');
    }

    $('#user' + peerId + ' .name').html(peerInfo.userData);
  }
});


// //---------------------------------------------------
// // MEDIA STREAM EVENTS
// //---------------------------------------------------
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.ON_INCOMING_STREAM, (evt) => {
  const eventDetail = evt.detail;
  const { peerId, stream, isSelf, peerInfo, isVideo, isAudio } = eventDetail;
  let peerVideo = $('#video' + peerId + ' .video-obj')[0];
  let peerAudio = $('#video' + peerId + ' .audio-obj')[0];

  if (!isSelf) {
    if (Demo.PeerIds.indexOf(peerId) < 0) {
      Demo.PeerIds.push(peerId);
      Demo.Peers += 1;
    }
  }

  if ((isVideo && isAudio) || (isVideo && !isAudio)) {
    if (peerVideo.poster) {
      peerVideo.removeAttribute('poster');
    }
    window.attachMediaStream(peerVideo, stream);
  } else {
    window.attachMediaStream(peerAudio, stream);
  }

  const isAudioStream = stream.getAudioTracks().length > 0 || false;
  const isVideoStream = stream.getVideoTracks().length > 0 || false;

  if (isSelf) {
    if (isAudioStream) {
      $('#isAudioMuted').css('color',
        (peerInfo.mediaStatus[stream.id].audioMuted === 1) ? 'green' : 'red');
    } else {
      $('#isVideoMuted').css('color',
        (isVideoStream && peerInfo.mediaStatus[stream.id].videoMuted === 1) ? 'green' : 'red');
    }
  } else {
    $('#user' + peerId + ' .name').html(peerInfo.userData);
  }

  if (Demo.ShowStats[peerId]) {
    $('#video' + peerId + ' .connstats-wrapper').show();
  }

  Demo.Methods.updateStreams();
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.ON_INCOMING_SCREEN_STREAM, (evt) => {
  const eventDetail = evt.detail;
  const { peerId, stream, isSelf } = eventDetail;

  let peerScreen = window.document.createElement('video');
  peerScreen.className = isSelf ? `video-obj col-md-12 ${peerId}screen self-video-elem` : `video-obj col-md-12 ${peerId}screen`;
  peerScreen.muted = isSelf;
  peerScreen.autoplay = true;
  peerScreen.controls = true;
  peerScreen.setAttribute('playsinline', true);

  $('#video' + peerId + '.peervideo').append(peerScreen);

  window.attachMediaStream(peerScreen, stream);
  setTimeout(function () {
    peerScreen.removeAttribute('controls');
  });
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.MEDIA_ACCESS_SUCCESS, (evt) => {
  const { stream } = evt.detail;
  const audioTracks = stream.getAudioTracks();
  const videoTracks = stream.getVideoTracks();
  if (audioTracks.length > 0) {
    Demo.Methods.logToConsoleDOM('Audio access is allowed.', 'System');
  }

  if (videoTracks.length > 0) {
    Demo.Methods.logToConsoleDOM('Video access is allowed.', 'System');
  }
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.STREAM_ENDED, (evt) => {
  const eventDetail = evt.detail;
  const { isScreensharing, isSelf, peerId } = eventDetail;

  if (!isSelf && !isScreensharing) {
    document.getElementById(`video${eventDetail.peerId}`).firstChild.setAttribute('poster', '../app/img/black.png');
  }

  if (isScreensharing) {
    const screenElm = $(`.${peerId}screen`)[0];
    screenElm.parentNode.removeChild(screenElm);
  }

  Demo.Methods.updateStreams();
});

// //---------------------------------------------------
// // ROOM EVENTS
// //---------------------------------------------------
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.ROOM_LOCK, (evt) => {
  const eventDetail = evt.detail;
  const { isLocked } = eventDetail;
  Demo.Methods.logToConsoleDOM(`Room is ${(isLocked ? 'locked' : 'unlocked')}`);
});

// //---------------------------------------------------
// // RECONNECT
// //---------------------------------------------------
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_REOPEN, (evt) => {
  Demo.Skylink.leaveRoom(config.defaultRoom)
  .then(() => {
    Demo.Peers = 0;
    Demo.PeerIds = [];
    Demo.Skylink.joinRoom(joinRoomOptions)
  })
});


// //---------------------------------------------------
// // STATE EVENTS
// //---------------------------------------------------
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_MESSAGE, (evt) => {
  const detail = evt.detail;
  const { message } = detail;
  const reason = JSON.parse(message).reason;
  // room locked state will only be known after attempt to join room
  if (reason === 'locked') {
    $('#room_locked_row').show();
    $('#join_room_btn').removeClass('disabled');
  }
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_ERROR, (evt) => {
  const { error } = evt.detail;
  Demo.Methods.logToConsoleDOM(`Channel Error: ${error.message || error}`, 'System');
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.ICE_CONNECTION_STATE, (evt) => {
  const eventDetail = evt.detail;
  const { state, peerId } = eventDetail;
  switch (state) {
    case SkylinkConstants.ICE_CONNECTION_STATE.CONNECTED:
    case SkylinkConstants.ICE_CONNECTION_STATE.COMPLETED:
      $(`#video${peerId === 'MCU' ? _peerId : peerId} .connstats-wrapper`).show();
      Demo.ShowStats[peerId] = true;
      break;
    default:
    // do nothing
  }
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.GET_CONNECTION_STATUS_STATE_CHANGE, (evt) => {
  const { peerId, state, stats } = evt.detail;
  if (state === SkylinkConstants.GET_CONNECTION_STATUS_STATE.RETRIEVE_SUCCESS) {
    var statsElm = $('#video' + (peerId === 'MCU' ? _peerId : peerId))
    .find('.connstats');
    var formatStatItem = function (type, dir) {
      var itemStr = '';
      var itemAddStr = '';
      var bits = stats[type][dir].bytes * 8; // Convert to bits

      if (bits < 1000) {
        itemStr += bits + ' bps';
      } else if (bits < 1000000) {
        itemStr += (bits / 1000).toFixed(2) + ' kbps';
      } else {
        itemStr += (bits / 1000000).toFixed(2) + ' mbps';
      }
      if (!stats[type][dir].packetsLost || stats[type][dir].packetsLost == 'undefined') {
        stats[type][dir].packetsLost = 0;
      }
      if (!stats[type][dir].jitter || stats[type][dir].jitter == 'undefined') {
        stats[type][dir].jitter = 0;
      }
      if (!stats[type][dir].rtt || stats[type][dir].rtt == 'undefined') {
        stats[type][dir].rtt = 0;
      }
      // format packet stats
      itemStr += '<br>Packets - (' + stats[type][dir].packets + ' sent, ' +
        stats[type][dir].packetsLost + ' lost, ' + stats[type][dir].jitter + ' jitter' +
        (typeof stats[type][dir].jitterBufferMs === 'number' ? ', ' + stats[type][dir].jitterBufferMs +
          ' jitter buffer <i>ms</i>' : '') + (dir === 'sending' ? ', ' + stats[type][dir].rtt + ' rtt' : '') +
        (typeof stats[type][dir].nacks === 'number' ? ', ' + stats[type][dir].nacks + ' nacks' : '') +
        (typeof stats[type][dir].plis === 'number' ? ', ' + stats[type][dir].plis + ' plis' : '') +
        (typeof stats[type][dir].firs === 'number' ? ', ' + stats[type][dir].firs + ' firs' : '') +
        (typeof stats[type][dir].slis === 'number' ? ', ' + stats[type][dir].slis + ' slis' : '') +
        (typeof stats[type][dir].e2eDelay === 'number' ? ', ' + stats[type][dir].e2eDelay + ' e2eDelay' : '') + ')';

      // format codec stats
      if (stats[type][dir].codec) {
        itemStr += '<br>Codec - (name: ' + stats[type][dir].codec.name + ', payload type: ' +
          stats[type][dir].codec.payloadType + (stats[type][dir].codec.implementation ?
            ', impl: ' + stats[type][dir].codec.implementation : '') + (stats[type][dir].codec.clockRate ?
            ', clockrate: ' + stats[type][dir].codec.clockRate : '') + (stats[type][dir].codec.channels ?
            ', channels: ' + stats[type][dir].codec.channels : '') + (stats[type][dir].codec.params ?
            ', params: <small>' + stats[type][dir].codec.params + '</small>' : '') + ')';
      }

      // format settings
      if (type === 'audio') {
        itemStr += '<br>Settings - (';

        if (typeof stats.audio[dir].inputLevel === 'number') {
          itemAddStr += 'input level: ' + stats.audio[dir].inputLevel;
        } else if (typeof stats.audio[dir].outputLevel === 'number') {
          itemAddStr += 'output level: ' + stats.audio[dir].outputLevel;
        }

        if (typeof stats.audio[dir].echoReturnLoss === 'number') {
          itemAddStr += (itemAddStr ? ', ' : '') + 'echo return loss: ' + stats.audio[dir].echoReturnLoss;
        }

        if (typeof stats.audio[dir].echoReturnLossEnhancement === 'number') {
          itemAddStr += (itemAddStr ? ', ' : '') + 'echo return loss: ' + stats.audio[dir].echoReturnLossEnhancement;
        }

      } else {
        itemStr += '<br>Frame - (';

        if (typeof stats.video[dir].frameWidth === 'number') {
          itemAddStr += (itemAddStr ? ', ' : '') + 'width: ' + stats.video[dir].frameWidth;
        }

        if (typeof stats.video[dir].frameHeight === 'number') {
          itemAddStr += (itemAddStr ? ', ' : '') + 'height: ' + stats.video[dir].frameHeight;
        }

        if (typeof stats.video[dir].frames === 'number') {
          itemAddStr += (itemAddStr ? ', ' : '') + dir + ': ' + stats.video[dir].frames;
        }

        if (typeof stats.video[dir].framesInput === 'number') {
          itemAddStr += (itemAddStr ? ', ' : '') + 'input: ' + stats.video[dir].framesInput;
        }

        if (typeof stats.video[dir].framesOutput === 'number') {
          itemAddStr += (itemAddStr ? ', ' : '') + 'output: ' + stats.video[dir].framesOutput;
        }

        if (typeof stats.video[dir].framesDropped === 'number') {
          itemAddStr += (itemAddStr ? ', ' : '') + 'dropped: ' + stats.video[dir].framesDropped;
        }

        if (typeof stats.video[dir].framesDecoded === 'number') {
          itemAddStr += (itemAddStr ? ', ' : '') + 'decoded: ' + stats.video[dir].framesDecoded;
        }

        if (typeof stats.video[dir].frameRateMean === 'number') {
          itemAddStr += (itemAddStr ? ', ' : '') + 'fps mean: ' + stats.video[dir].frameRateMean.toFixed(2);
        }

        if (typeof stats.video[dir].frameRateStdDev === 'number') {
          itemAddStr += (itemAddStr ? ', ' : '') + 'fps std dev: ' + stats.video[dir].frameRateStdDev.toFixed(2);
        }

        if (typeof stats.video[dir].framesDecoded === 'number') {
          itemAddStr += (itemAddStr ? ', ' : '') + 'decoded: ' + stats.video[dir].framesDecoded.toFixed(2);
        }

        if (typeof stats.video[dir].framesCorrupted === 'number') {
          itemAddStr += (itemAddStr ? ', ' : '') + 'corrupted: ' + stats.video[dir].framesCorrupted.toFixed(2);
        }

        if (typeof stats.video[dir].framesPerSecond === 'number') {
          itemAddStr += (itemAddStr ? ', ' : '') + 'fps: ' + stats.video[dir].framesPerSecond.toFixed(2);
        }
      }

      itemStr += itemAddStr + ')';

      $(statsElm)
      .find('.' + type + ' .' + (dir === 'sending' ? 'upload' : 'download'))
      .html(itemStr);
    };
    var formatCanStatItem = function (type) {
      $(statsElm)
      .find('.candidate .' + type)
      .html((stats.selectedCandidatePair[type].ipAddress || '-') + ':' +
        (stats.selectedCandidatePair[type].portNumber || '-') + ' - (transport: ' +
        (stats.selectedCandidatePair[type].transport || 'N/A') +
        ', type: ' + (stats.selectedCandidatePair[type].candidateType || 'N/A') +
        (stats.selectedCandidatePair[type].turnMediaTransport ? ', turn media transport: ' +
          stats.selectedCandidatePair[type].turnMediaTransport : '') + ')');
    };

    formatStatItem('audio', 'sending');
    formatStatItem('audio', 'receiving');
    formatStatItem('video', 'sending');
    formatStatItem('video', 'receiving');
    formatCanStatItem('local');
    formatCanStatItem('remote');

    $(statsElm)
    .find('.certificate .certleft')
    .html('Certificate algorithm - (local: ' +
      (stats.certificate.local.fingerprintAlgorithm || '-') + ', remote: ' +
      (stats.certificate.remote.fingerprintAlgorithm || '-') + ')');
    $(statsElm)
    .find('.certificate .certright')
    .html('');
  }
});

/********************************************************
 DOM Events
 *********************************************************/
$(document).ready(function() {
  //---------------------------------------------------
  $('#display_app_id').html(config.appKey || config.apiKey || 'Not Provided');
  // //---------------------------------------------------
  $('#update_user_info_btn').click(function() {
    Demo.Skylink.setUserData(config.defaultRoom, $('#display_user_info').val());
  });

  // //---------------------------------------------------
  $('#enable_audio_btn').click(function () {
    Demo.Skylink.muteStreams(config.defaultRoom, {
      audioMuted: false,
      videoMuted: Demo.Methods.getMediaStatus('video').videoMuted
    });
  });
  //---------------------------------------------------
  $('#disable_audio_btn').click(function () {
    Demo.Skylink.muteStreams(config.defaultRoom, {
      audioMuted: true,
      videoMuted: Demo.Methods.getMediaStatus('video').videoMuted
    });
  });
  // //---------------------------------------------------
  $('#enable_video_btn').click(function () {
    Demo.Skylink.muteStreams(config.defaultRoom, {
      videoMuted: false,
      audioMuted: Demo.Methods.getMediaStatus('audio').audioMuted
    });
  });
  //---------------------------------------------------
  $('#disable_video_btn').click(function () {
    Demo.Skylink.muteStreams(config.defaultRoom, {
      videoMuted: true,
      audioMuted: Demo.Methods.getMediaStatus('audio').audioMuted
    });
  });
  // //---------------------------------------------------
  $('#share_screen_btn').click(function () {
    Demo.Skylink.shareScreen(config.defaultRoom, true).then((stream) => {
      console.log('Screen share started: ', stream);
    });
  });
  // //---------------------------------------------------
  $('#stop_screen_btn').click(function() {
    Demo.Skylink.stopScreen(config.defaultRoom);
  });
  // //---------------------------------------------------
  $('#leave_room_btn').click(function() {
    Demo.Skylink.leaveRoom(config.defaultRoom)
    .then(() => {
      Demo.Methods.toggleInRoomSettings('', false);
      Demo.Peers = 0;
      Demo.PeerIds = [];
    })
  });
  // //---------------------------------------------------
  $('#join_room_btn').click(function () {
    Demo.Skylink.joinRoom(joinRoomOptions)
    $('#join_room_btn').addClass('disabled');
  });
  // //---------------------------------------------------
  $('#clear-console-log').click(() => {
    $('#console_log').find('li').remove();
  });
  // //---------------------------------------------------
  $('#peer_video_list').on('click', '.toggle-connstats', function () {
    $(this).parent().find('.connstats').slideToggle();
    $(this).attr('toggled', $(this).attr('toggled') ? '' : 'true');

    var peerId = $(this).attr('data');

    $(this).html($(this).attr('toggled') ? 'Hide ' + (peerId === 'MCU' ? ' MCU ' : '') + 'Stats' :
      'Show ' + (peerId === 'MCU' ? ' MCU ' : '') + 'Stats');

    if ($(this).attr('toggled')) {
      Demo.Stats[peerId] = true;
      var test = setInterval(function () {
        if (Demo.Stats[peerId]) {
          Demo.Skylink.getConnectionStatus(config.defaultRoom, peerId);
        } else {
          clearInterval(test);
        }
      }, 1000);
    } else {
      Demo.Stats[peerId] = false;
    }
  });
});
