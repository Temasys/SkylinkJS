/* eslint-disable import/extensions */
import Skylink, { SkylinkLogger, SkylinkEventManager, SkylinkConstants } from '../../../build/skylink.complete.js';
import { config, APPKEYS } from '../config.js';
import { nanoid } from 'https://cdn.jsdelivr.net/npm/nanoid/nanoid.js'

const tabSession = {};
const tabSessionId = nanoid();

const bc = new BroadcastChannel('temasys-kitchensink');
bc.onmessage = event => {
  if (event.origin === window.location.origin) {
    if (event.data.action === "room-joined") {
      if (tabSession[event.data.tabSessionId]) {

      } else {
        tabSession[event.data.tabSessionId] = 1;
        // inform other tab of this tab presence
        bc.postMessage({
          action: "room-joined",
          tabSessionId,
        })
      }
    }

    if (event.data.action === "tab-close") {
      if (tabSession[event.data.tabSessionId]) {
        delete tabSession[event.data.tabSessionId];
      }
    }
  }

  console.log('[Kitchensink] tabSession', tabSession);
}

/********************************************************
  API Settings
*********************************************************/
const Demo = window.Demo || {};
Demo.FILE_SIZE_LIMIT = 1024 * 1024 * 200;
Demo.Peers = 0;
Demo.PeerIds = [];
Demo.Stats = {};
Demo.Methods = {};
Demo.Skylink = null;
Demo.ShowStats = {};
Demo.Streams = null;
Demo._Skylink = Skylink;
Demo.isMCU = false;
Demo.videoStream = null;
Demo.audioStream = null;
Demo.transferIds = [];
Demo.localStorageAccess = false;
Demo.rememberMe = false;
Demo.userData = null;

if (window.localStorage) {
  console.log("[Kitchensink] Local Storage available");
  Demo.localStorageAccess = true;
}

window.Demo = Demo;
let selectedPeers = [];
let _peerId = null;
let selectedAppKey = null;
let stopStreamsOnLeaveRoom = true;

const { $, document } = window;

if (window.location.href.indexOf("appKey=") > -1) {
  $('#join_room_p2p_key').prop('disabled', true);
  $('#join_room_mcu_key').prop('disabled', true);
}

//----- join room options
const joinRoomOptions = {
  audio: true,
  video: true,
  autoBandwidthAdjustment: true
};

if (config.bandwidth && config.bandwidth.video) {
  joinRoomOptions.bandwidth = joinRoomOptions.bandwidth || {};
  joinRoomOptions.bandwidth.video = parseInt(config.bandwidth.video);
}

if (config.bandwidth && config.bandwidth.audio) {
  joinRoomOptions.bandwidth = joinRoomOptions.bandwidth || {};
  joinRoomOptions.bandwidth.audio = parseInt(config.bandwidth.audio);
}

//----- set logging -----
SkylinkLogger.setLevel(SkylinkLogger.logLevels.DEBUG, true);

Demo.Methods.toggleInRoomSettings = function(peerId, inRoom) {
  if (inRoom) {
    $('#join_room_panel').css("display", "none");
    $('#in_room_panel').css("display", "block");
    $('#display_user_id').html(peerId);
    $('#logs_panel').show();
    $('#set_persistent_message').prop('checked', Demo.Skylink.getMessagePersistence(config.defaultRoom));
    $('#room_locked_row').hide();

    // reset joinRoomOptions to handle duplicate tab
    $('#join_room_p2p_key').prop('checked', true);
    // $('#join_room_audio').prop('checked', true);
    // $('#join_room_audio_muted').prop('checked', false);
    // $('#join_room_video').prop('checked', true);
    // $('#join_room_video_muted').prop('checked', false);
  } else {
    $('#join_room_btn').removeClass('disabled');
    $('#presence_list_body').empty();
    $('#secret_id_panel').hide();
    $('#secret_id_list_body').empty();
    $('#chat_log').empty();
    $('#join_room_panel').css("display", "block");
    $('#in_room_panel').css("display", "none");
    $('#isAudioMuted').css('color', 'red');
    $('#isVideoMuted').css('color', 'red');
    $('#display_room_status').html('-');
    $('#console_log').empty();
    $('#logs_panel').hide();
    if (Demo.isMCU) {
      $('#join_room_mcu_key').prop('checked', true);
    }
    $('#stop_stream_false').prop('checked', false);
  }
};

Demo.Methods.displayChatItemHTML = function(peerId, timestamp, content, isPrivate) {
  var Hours, Minutes, Seconds;
  if (timestamp.getHours() < 10)
    Hours = '0' + timestamp.getHours();
  else
    Hours = timestamp.getHours();
  if (timestamp.getMinutes() < 10)
    Minutes = '0' + timestamp.getMinutes();
  else
    Minutes = timestamp.getMinutes();
  if (timestamp.getSeconds() < 10)
    Seconds = '0' + timestamp.getSeconds();
  else
    Seconds = timestamp.getSeconds();

  return '<div ' + (typeof isPrivate === 'string' ? 'id="file-' + isPrivate + '"' : '') +
    ' class="chat-item list-group-item active">' +
    '<p class="list-group-item-heading">' + '<b>' + peerId + '</b>' +
    '<em title="' + timestamp.toString() + '">' + Hours +
    ':' + Minutes + ':' + Seconds +
    '</em></p>' + '<p class="list-group-item-text">' +
    (isPrivate === true ? '<i>[pvt msg] ' : '') + content +
    (isPrivate === true ? '</i>' : '') + '</p></div>';
};

Demo.Methods.generateTimestamp = function() {
  var timestamp = new Date(),
    Hours, Minutes, Seconds;
  if (timestamp.getHours() < 10)
    Hours = '0' + timestamp.getHours();
  else
    Hours = timestamp.getHours();
  if (timestamp.getMinutes() < 10)
    Minutes = '0' + timestamp.getMinutes();
  else
    Minutes = timestamp.getMinutes();
  if (timestamp.getSeconds() < 10)
    Seconds = '0' + timestamp.getSeconds();
  else
    Seconds = timestamp.getSeconds();

  return `${Hours}:${Minutes}:${Seconds}`
};

Demo.Methods.displayChatMessage = function(peerId, content, isPrivate) {
  var timestamp = new Date();
  var isFile = typeof content === 'object';

  var element = (isFile) ? '#file_log' : '#chat_log';
  var element_body = (isFile) ? '#file_body' : '#chat_body';
  if (isFile) {
    content = Demo.Methods.displayFileItemHTML(content);
  }

  $(element).append(Demo.Methods.displayChatItemHTML(peerId, timestamp, content, isPrivate));
  $(element_body).animate({
    scrollTop: $('#chat_body').get(0).scrollHeight
  }, 500);
};

Demo.Methods.updateStreams = function() {
  Demo.Streams = Demo.Skylink.getStreams(config.defaultRoom) || [];
};

Demo.Methods.getMediaStatus = function(type) {
  if (!Demo.Streams && !Demo.Streams[_peerId]) {
    return { audioMuted: -1, videoMuted: -1 };
  }

  if (type === 'audio') {
    let audioSId = '';
    if (Demo.Streams[_peerId].streams.audio) {
      audioSId = Demo.Skylink.getPeerInfo(config.defaultRoom).mediaStatus[Object.keys(Demo.Streams[_peerId].streams.audio)[0]]
    }

    return audioSId ? audioSId : { audioMuted: -1, videoMuted: -1 };
  }

  if (type === 'video') {
    let videoSId = '';
    if (Demo.Streams[_peerId].streams.video) {
      videoSId = Demo.Skylink.getPeerInfo(config.defaultRoom).mediaStatus[Object.keys(Demo.Streams[_peerId].streams.video)[0]]
    }

    if (!videoSId && Demo.Streams[_peerId].screenShare) {
      videoSId = Demo.Skylink.getPeerInfo(config.defaultRoom).mediaStatus[Object.keys(Demo.Streams[_peerId].stream.screenShare)[0]];
    }

    return videoSId ? videoSId: { audioMuted: -1, videoMuted: -1 };
  }
};

Demo.Methods.logToConsoleDOM = (message, level) => {
  const $loggerListParentDOM = $('ul#console_log');
  const $logListItem = $('<li />').addClass('list-group-item');
  const $logText = $('<span />').addClass('log-message-text').text(`[${Demo.Methods.generateTimestamp()}] ${message}`);

  if (level) {
    const $levelBadge = $('<span />').addClass(`log-level-badge badge ${level} `).text(level.toUpperCase());
    $logListItem.append($levelBadge);
  }

  $logListItem.append($logText);
  $logListItem.prependTo($loggerListParentDOM);
};

Demo.Methods.saveToLocalStorage = (key, value) => {
  if (Demo.localStorageAccess) {
    let skylink = window.localStorage.getItem("kitchensink");

    if (skylink) {
      skylink = JSON.parse(skylink);
    } else {
      skylink = {};
    }

    skylink[key] = value;
    window.localStorage.setItem("kitchensink", JSON.stringify(skylink));
    console.log("[Kitchensink] Saved to localStorage", key, value);
  }
}

Demo.Methods.getFromLocalStorage = (key) => {
  if (Demo.localStorageAccess) {
    let skylink = window.localStorage.getItem("kitchensink");

    if (skylink) {
      skylink = JSON.parse(skylink);
      console.log("[Kitchensink] Using existing peerSessionId", skylink[key]);
      return skylink[key];
    } else {
      console.log("[Kitchensink] No value for key", key);
      return '';
    }
  } else {
    throw Error('[Kitchensink] No localStorage access');
  }
}

Demo.Methods.clearLocalStorage = () => {
  if (Demo.localStorageAccess) {
    window.localStorage.removeItem('kitchensink');
    console.log("[Kitchensink] Cleared localStorage");
  }
}

let displayName = Demo.Methods.getFromLocalStorage('displayName') || `name_user_${  Math.floor((Math.random() * 1000) + 1)}`;
$('#join_room_user_info').val(displayName);

/********************************************************
 SKYLINK EVENTS
 *********************************************************/

// //---------------------------------------------------
// // PEER EVENTS
// //---------------------------------------------------
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_JOINED, (evt) => {
  const eventDetail = evt.detail;
  const { isSelf, peerId, peerInfo, peerSessionId, room } = eventDetail;
  const streamIds = Object.keys(peerInfo.mediaStatus);
  let audioStreamId = null;
  let videoStreamId = null;
  const userData = JSON.parse(peerInfo.userData);

  if (streamIds[0] && peerInfo.mediaStatus[streamIds[0]].videoMuted === -1) {
    audioStreamId = streamIds[0];
    videoStreamId = streamIds[1];
  }

  if (isSelf) {
    $('#display_room_session_id').html(room.roomSessionId);

    bc.postMessage({
      action: "room-joined",
      tabSessionId,
    })

    $('#display_user_info').val(userData.displayName);
    console.log(`[Kitchensink] Room Session Id - ${peerInfo.room.roomSessionId}`);

    if (Demo.Methods.getFromLocalStorage('peerSessionId')) {
      // has existing peerSessionId
    } else {
      Demo.Methods.saveToLocalStorage('peerSessionId', peerSessionId);
      Demo.userData.peerSessionId = peerSessionId;
      Demo.Skylink.setUserData(config.defaultRoom, JSON.stringify(Demo.userData));
      Demo.Methods.saveToLocalStorage('displayName', userData.displayName);
    }

    _peerId = peerId;
    if (!Demo.isMCU)  {
      Demo.Methods.toggleInRoomSettings(peerId, true);
    }
    $('#isAudioMuted').css('color',
      (audioStreamId && peerInfo.mediaStatus[audioStreamId].audioMuted === 1) ? 'green' : 'red');
    $('#isVideoMuted').css('color',
      (videoStreamId && peerInfo.mediaStatus[videoStreamId].videoMuted === 1) ? 'green' : 'red');
  } else {
    if (Demo.PeerIds.indexOf(peerId) < 0) {
      Demo.PeerIds.push(peerId);
      Demo.Peers += 1;
    }

    $('#presence_panel').show();
    Demo.Methods.logToConsoleDOM(`Peer ${peerId} has joined the room`, 'System');
    var newListEntry = '<tr id="user' + peerId + '" class="badQuality">' +
      '<td><input class="select-user" target="' + peerId + '" type="checkbox" onclick="selectTargetPeer(this);">' +
      '<span class="name">' + userData.displayName + '</span></td><td>';
    var titleList = [
      'Joined Room', 'Handshake: Welcome', 'Handshake: Offer',
      'Handshake: Answer', 'Candidate Generation state', 'ICE Connection state',
      'Peer Connection state', 'Data Channel Connection state',
      'MediaStream: Video', 'MediaStream: Audio'
    ];
    var glyphiconList = [
      'glyphicon-log-in', 'glyphicon-hand-right', 'glyphicon-hand-left',
      'glyphicon-thumbs-up', 'glyphicon-flash', 'glyphicon-magnet',
      'glyphicon-user', 'glyphicon-transfer', 'glyphicon-facetime-video video',
      'glyphicon-volume-up audio'
    ];
    for (var i = 0; i < 10; i++) {
      newListEntry += '<span class="glyphicon ' + glyphiconList[i] + ' icon-circle ' +
        i + '" title="' + titleList[i] + '"></span>&nbsp;&nbsp;&nbsp;';
    }
    newListEntry += '</td></tr>';
    $('#presence_list').append(newListEntry);
    $('#user' + peerId + ' .0').css('color', 'green');
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

  if (Demo.PeerIds.length === 0) {
    $('#presence_panel').hide();
  }

  delete Demo.Stats[peerId];
  delete Demo.ShowStats[peerId];
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_UPDATED, (evt) => {
  const { peerId, peerInfo, isSelf } = evt.detail;
  let streamIds = Object.keys(peerInfo.mediaStatus);
  let audioStreamId = null;
  let videoStreamId = null;
  const userData = JSON.parse(peerInfo.userData);

  if (Demo.Streams && Demo.Streams[_peerId] && Demo.Streams[_peerId].streams.screenShare) {
    streamIds = streamIds.filter((id) => id !== Object.keys(Demo.Streams[_peerId].streams.screenShare)[0]);
  }

  if (streamIds[0] && streamIds[1]) {
    audioStreamId = streamIds[0];
    videoStreamId = streamIds[1];
  } else if (streamIds[0] && peerInfo.mediaStatus[streamIds[0]].videoMuted === -1) {
    audioStreamId = streamIds[0];
  } else if (streamIds[0] && peerInfo.mediaStatus[streamIds[0]].videoMuted === 1) {
    videoStreamId = streamIds[0]
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

    $('#user' + peerId + ' .name').html(userData.displayName);
  }
});

// //---------------------------------------------------
// // MCU EVENTS
// //---------------------------------------------------
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.SERVER_PEER_JOINED, (evt) => {
  $('#mcu_loading').css("display", "none");
  Demo.Methods.toggleInRoomSettings(_peerId, true);
});

// //---------------------------------------------------
// // MEDIA STREAM EVENTS
// //---------------------------------------------------
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.ON_INCOMING_STREAM, (evt) => {
  const eventDetail = evt.detail;
  const { peerId, stream, isSelf, peerInfo, isVideo, isAudio } = eventDetail;
  const userData = JSON.parse(peerInfo.userData);
  let peerVideo = $('#video' + peerId + ' .video-obj')[0];
  let peerAudio = $('#video' + peerId + ' .audio-obj')[0];

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
      Demo.audioStream = stream;
      Demo.Methods.logToConsoleDOM(`Audio stream is cached`, 'Media Stream');
    } else {
      Demo.videoStream = stream;
      Demo.Methods.logToConsoleDOM(`Video stream is cached`, 'Media Stream');
      $('#isVideoMuted').css('color',
        (isVideoStream && peerInfo.mediaStatus[stream.id].videoMuted === 1) ? 'green' : 'red');
    }
  } else {
    $('#user' + peerId + ' .name').html(userData.displayName);
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

  Demo.Methods.updateStreams();
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
    document.getElementById(`video${eventDetail.peerId}`).firstChild.setAttribute('poster', '../assets/imgs/black.png');
  }

  if (isScreensharing) {
    const screenElm = $(`.${peerId}screen`)[0];
      screenElm.parentNode.removeChild(screenElm);
    }

  setTimeout(Demo.Methods.updateStreams, 1000);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.STREAM_MUTED, (evt) => {
  console.log("STREAM_MUTED", evt.detail);
})


// //---------------------------------------------------
// // ROOM EVENTS
// //---------------------------------------------------
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.ROOM_LOCK, (evt) => {
  const eventDetail = evt.detail;
  const { isLocked } = eventDetail;
  $('#display_room_status').html((isLocked) ? 'Locked' : 'Not Locked');
  Demo.Methods.logToConsoleDOM(`Room is ${(isLocked ? 'locked' : 'unlocked')}`);
});

// //---------------------------------------------------
// // MESSAGING EVENTS
// //---------------------------------------------------
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.ENCRYPT_SECRETS_UPDATED, (evt) => {
  const detail = evt.detail;
  const { encryptSecrets, selectedSecretId } = detail;

  if (Object.keys(encryptSecrets).length !== 0) {
    $('#secret_id_panel').show();
    $('#secret_id_list_body').empty();

    Object.keys(encryptSecrets).forEach((secretId) => {
      const isChecked = secretId === selectedSecretId ? "checked" : "";
      let newListEntry = '<tr><td><input value="' + secretId + '" ' +'name="secret_ids" target="' + secretId + '" type="radio" '+ isChecked +
        ' onclick="setSelectedSecret(this);">' +
        '<label for="' + secretId + '"><span>' + secretId + '</span></label></td><td>' + encryptSecrets[secretId] + '</td></tr>';
      $('#secret_id_list').append(newListEntry);
    })
  } else {
    $('#secret_id_panel').hide();
  }
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.ON_INCOMING_MESSAGE, (evt) => {
  const eventDetail = evt.detail;
  const { isSelf, peerInfo, message } = eventDetail;
  const userData = JSON.parse(peerInfo.userData);
  const peerId = isSelf ? 'You' : userData.displayName;
  const isPrivate = message.isPrivate;
  let content = message.isDataChannel ? 'P2P' : 'Socket';

  content += ' -> ';

  if (message.targetPeerId) {
    content += message.targetPeerId + ' ';
  } else {
    content += 'GRP ';
  }

  content += message.content;

  Demo.Methods.displayChatMessage(peerId, content, isPrivate);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.STORED_MESSAGES, (evt) => {
  const eventDetail = evt.detail;
  const { storedMessages, room } = eventDetail;
  const peersInRoom = Demo.Skylink.getPeersInRoom(room.roomName);
  const peerSessions = {};
  Object.values(peersInRoom).forEach((peer) => {
    const userData = JSON.parse(peer.userData);
    peerSessions[userData.peerSessionId] = {};
    peerSessions[userData.peerSessionId].isSelf = peer.isSelf;
    peerSessions[userData.peerSessionId].displayName = userData.displayName;

  })

  storedMessages.forEach((message) => {
    let peerId;
    if (peerSessions[message.senderPeerId]) {
      peerId = 'Stored Message' + ` [${(peerSessions[message.senderPeerId].isSelf ? 'You' : peerSessions[message.senderPeerId].displayName)}]`;
    } else {
      peerId = 'Stored Message' + ` [${message.senderPeerId}]`
    }

    const content = `${message.isDataChannel ? 'P2P' : 'Socket'} -> GRP [${message['timeStamp'].replace('T', ", ").replace("Z", "")}] : ${message.content}`;
    Demo.Methods.displayChatMessage(peerId, content, message.isPrivate);
  })
});

// //---------------------------------------------------
// // SOCKET EVENTS
// //---------------------------------------------------
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.SESSION_DISCONNECT, (evt) => {
  Demo.Methods.logToConsoleDOM(`SOCKET_SESSION_DISCONNECTED - ${evt.detail.reason}`, 'error');
  let onlineInterval = null;
  const reconnect = () => {
    if (window.navigator.onLine) {
      clearInterval(onlineInterval);
      Demo.Methods.logToConsoleDOM(`Online now. Attempting to join room.`, 'info');
      Demo.Skylink.leaveRoom(config.defaultRoom)
      .then(() => {
        Demo.Peers = 0;
        Demo.PeerIds = [];
        Demo.Skylink.joinRoom(joinRoomOptions)
      })
      .catch((err) =>{
        Demo.Methods.logToConsoleDOM(`Failed to reconnect`, 'error');
      })
    } else {
      Demo.Methods.logToConsoleDOM(`Still offline...`, 'error');
    }
  }

  if (!onlineInterval) {
    onlineInterval = setInterval(reconnect, 1000);
  }
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_ERROR, (evt) => {
  const eventDetail = evt.detail;
  const { error } = eventDetail;
  Demo.Methods.logToConsoleDOM(`CHANNEL_ERROR - ${error}`, 'error');
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.SOCKET_ERROR, (evt) => {
  const eventDetail = evt.detail;
  const { error, errorCode } = eventDetail;
  Demo.Methods.logToConsoleDOM(`CHANNEL_ERROR - ${errorCode} - ${error}`, 'error');
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_RETRY, (evt) => {
  const eventDetail = evt.detail;
  const { currentAttempt } = eventDetail;
  Demo.Methods.logToConsoleDOM(`CHANNEL_RETRY - ${currentAttempt}`, 'error');
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_REOPEN, (evt) => {
  Demo.Methods.logToConsoleDOM(`CHANNEL_REOPEN`, 'info');
});


// //---------------------------------------------------
// // DATA TRANSFER EVENTS
// //---------------------------------------------------
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.DATA_TRANSFER_STATE, (evt) => {
  Demo.Methods.logToConsoleDOM(`DATA_TRANSFER_STATE`, 'info');
  const { state, transferInfo, peerId, transferId } = evt.detail;

  let transferStatus;
  let isUpload;
  let transfers;
  let item;
  switch (state) {
    case SkylinkConstants.DATA_TRANSFER_STATE.UPLOAD_REQUEST:
      var result = confirm('Incoming transfer request!\n\nFile: ' + transferInfo.name +
        '\n\nSize: ' + transferInfo.size + '\n\nAccept?');
        Demo.Skylink.respondBlobRequest(config.defaultRoom, peerId, transferId, result)
        .then((result) => console.log("respondBlobRequest", result))
        .catch((err) => console.log("respondBlobRequest", err))
      break;
    case SkylinkConstants.DATA_TRANSFER_STATE.UPLOAD_STARTED:
      Demo.transferIds[peerId] = transferId;
      isUpload = true;
      transfers = document.getElementById('transfers');
      item = document.createElement('tr');
      item.innerHTML = '<td>' + transferId + '</td><td class="text-center">' +
        ((isUpload) ? '&#8657;' : '&#8659;') + '</td>' +
        '<td class="text-center">' + peerId + '</td><td class="text-center">' + transferInfo.name +
        '</td><td class="text-center"><span id="' + peerId + '_' + transferId + '"></span>' +
        ((!isUpload) ? '<a id="' + transferId + '" href="#" download="' +
          transferInfo.name + '" style="display:none">Download</a>' : '') + '</td>';
      transfers.appendChild(item);
      break;
      case SkylinkConstants.DATA_TRANSFER_STATE.DOWNLOAD_STARTED:
        Demo.transferIds[peerId] = transferId;
        isUpload = false;
        transfers = document.getElementById('transfers');
          item = document.createElement('tr');
        item.innerHTML = '<td>' + transferId + '</td><td class="text-center">' +
          ((isUpload) ? '&#8657;' : '&#8659;') + '</td>' +
          '<td class="text-center">' + peerId + '</td><td class="text-center">' + transferInfo.name +
          '</td><td class="text-center"><span id="' + peerId + '_' + transferId + '"></span>' +
          ((!isUpload) ? '<a id="' + transferId + '" href="#" download="' +
            transferInfo.name + '" style="display:none">Download</a>' : '') + '</td>';
        transfers.appendChild(item);
      break;
      case SkylinkConstants.DATA_TRANSFER_STATE.CANCEL:
        console.log("CANCEL DATA TRANSFER");
        delete Demo.transferIds[peerId];
      break;
      case SkylinkConstants.DATA_TRANSFER_STATE.ERROR:
      break;
      case SkylinkConstants.DATA_TRANSFER_STATE.UPLOADING:
      break;
      case SkylinkConstants.DATA_TRANSFER_STATE.DOWNLOADING:
      break;
      case SkylinkConstants.DATA_TRANSFER_STATE.UPLOAD_COMPLETED:
        transferStatus = document.getElementById(peerId + '_' + transferId);
        transferStatus.innerHTML = 'Completed';
        transferStatus.href = URL.createObjectURL(transferInfo.data);
        delete Demo.transferIds[peerId];
      break;
      case SkylinkConstants.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED:
        transferStatus = document.getElementById(peerId + '_' + transferId);
        transferStatus.innerHTML = 'Completed';

        transferStatus = document.getElementById(transferId);
        transferStatus.href = URL.createObjectURL(transferInfo.data);
        transferStatus.style.display = 'block';
      break;
      case SkylinkConstants.DATA_TRANSFER_STATE.USER_REJECTED:
      break;
      case SkylinkConstants.DATA_TRANSFER_STATE.USER_UPLOAD_REQUEST:
      break;
      case SkylinkConstants.DATA_TRANSFER_STATE.START_ERROR:
      break;
  }

});


// //---------------------------------------------------
// // STATE EVENTS
// //---------------------------------------------------
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.SYSTEM_ACTION, (evt) => {
  const eventDetail = evt.detail;
  const { action, info, reason, rid } = eventDetail;
  const message = `SkylinkJS - [Server](${action}) System Action Warning: ${info} | Reason: ${reason} | Room ID: ${rid}`;
  Demo.Methods.logToConsoleDOM(message, 'info');
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.HANDSHAKE_PROGRESS, (evt) => {
  const eventDetail = evt.detail;
  const { state, peerId } = eventDetail;
  let stage = 0;
  switch (state) {
    case SkylinkConstants.HANDSHAKE_PROGRESS.WELCOME:
      stage = 1;
      break;
    case SkylinkConstants.HANDSHAKE_PROGRESS.OFFER:
      stage = 2;
      break;
    case SkylinkConstants.HANDSHAKE_PROGRESS.ANSWER:
      stage = 3;
      break;
    case SkylinkConstants.HANDSHAKE_PROGRESS.ANSWER_ACK:
      stage = 3;
      break;
    default: stage = 0;
  }
  for (let i = 0; i <= stage; i += 1) {
    $(`#user${peerId} .${i}`).css('color', 'green');
  }
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.ICE_CONNECTION_STATE, (evt) => {
  const eventDetail = evt.detail;
  const { state, peerId } = eventDetail;
  let color = 'orange';
  switch (state) {
    case SkylinkConstants.ICE_CONNECTION_STATE.STARTING:
    case SkylinkConstants.ICE_CONNECTION_STATE.CLOSED:
    case SkylinkConstants.ICE_CONNECTION_STATE.FAILED:
      color = 'red';
      break;
    case SkylinkConstants.ICE_CONNECTION_STATE.CHECKING:
    case SkylinkConstants.ICE_CONNECTION_STATE.DISCONNECTED:
      color = 'orange';
      break;
    case SkylinkConstants.ICE_CONNECTION_STATE.CONNECTED:
    case SkylinkConstants.ICE_CONNECTION_STATE.COMPLETED:
      color = 'green';
      $(`#video${peerId === 'MCU' ? _peerId : peerId} .connstats-wrapper`).show();
      Demo.ShowStats[peerId] = true;
      break;
    default:
      console.error('<' + peerId + '>' + ', ' + 'ICE State: ' + state);
  }
  $(`#user${peerId} .${5}`).css('color', color);

  if (state === SkylinkConstants.ICE_CONNECTION_STATE.FAILED || state === SkylinkConstants.ICE_CONNECTION_STATE.DISCONNECTED || state === SkylinkConstants.ICE_CONNECTION_STATE.CLOSED) {
    Demo.Methods.logToConsoleDOM(`ICE_CONNECTION_STATE - ${state}`, 'error');
  } else {
    Demo.Methods.logToConsoleDOM(`ICE_CONNECTION_STATE - ${state}`, 'info');
  }

  if (state === SkylinkConstants.ICE_CONNECTION_STATE.CHECKING) {
    setTimeout(() => {
      if ($(`#user${peerId} .${5}`).css('color') === 'orange') {
        $(`#user${peerId}`).remove();
      }
    }, 30000);
  }
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CANDIDATE_GENERATION_STATE, (evt) => {
  const { peerId, state } = evt.detail;
  let color = 'orange';
  switch (state) {
    case SkylinkConstants.CANDIDATE_GENERATION_STATE.COMPLETED:
      color = 'green';
      break;
    default: color = 'red';
  }
  $(`#user${peerId} .${4}`).css('color', color);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_CONNECTION_STATE, (evt) => {
  const { peerId, state } = evt.detail;
  let color = 'red';

  switch (state) {
    case SkylinkConstants.PEER_CONNECTION_STATE.HAVE_LOCAL_OFFER:
    case SkylinkConstants.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER:
    case SkylinkConstants.PEER_CONNECTION_STATE.CONNECTING:
      color = 'orange';
      break;
    case SkylinkConstants.PEER_CONNECTION_STATE.CLOSED:
      color = 'red';
      break;
    case SkylinkConstants.PEER_CONNECTION_STATE.STABLE:
    case SkylinkConstants.PEER_CONNECTION_STATE.CONNECTED:
      color = 'green';
      break;
  }

  $(`#user${peerId} .${6}`).css('color', color);

  if (state === SkylinkConstants.PEER_CONNECTION_STATE.FAILED || state === SkylinkConstants.PEER_CONNECTION_STATE.DISCONNECTED || state === SkylinkConstants.PEER_CONNECTION_STATE.CLOSED) {
    Demo.Methods.logToConsoleDOM(`PEER_CONNECTION_STATE - ${state}`, 'error');
  } else {
    Demo.Methods.logToConsoleDOM(`PEER_CONNECTION_STATE - ${state}`, 'info');
  }
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.DATA_CHANNEL_STATE, (evt) => {
  const { peerId, state, channelType } = evt.detail;
  if (channelType !== SkylinkConstants.DATA_CHANNEL_TYPE.MESSAGING) {
    return;
  }
  if (state === SkylinkConstants.DATA_CHANNEL_STATE.SEND_MESSAGE_ERROR) {
    return;
  }
  let color = 'red';
  switch (state) {
    case SkylinkConstants.DATA_CHANNEL_STATE.ERROR:
      color = 'red';
      break;
    case SkylinkConstants.DATA_CHANNEL_STATE.CONNECTING:
      color = 'orange';
      break;
    case SkylinkConstants.DATA_CHANNEL_STATE.OPEN:
      color = 'green';
      break;
    default: color = 'red';
  }
  $(`#user${peerId} .${7}`).css('color', color);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.ICE_CONNECTION_STATE, (evt) => {
  const eventDetail = evt.detail;

  if (eventDetail.state == SkylinkConstants.ICE_CONNECTION_STATE.DISCONNECTED||
  eventDetail.state == SkylinkConstants.ICE_CONNECTION_STATE.FAILED ||
  eventDetail.state == SkylinkConstants.ICE_CONNECTION_STATE.CLOSED ||
  eventDetail.state == SkylinkConstants.ICE_CONNECTION_STATE.TRICKLE_FAILED
  ) {
    if (!document.getElementById(`video${eventDetail.peerId}`)) {
      return;
    }
  }
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_OPEN, () => {
  $('#channel').css('color', 'green');
  $('#channel').html('Active');
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_CLOSE, () => {
  $('#channel').css('color', 'red');
  $('#channel').html('Closed');
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_MESSAGE, (evt) => {
  const detail = evt.detail;
  const { message } = detail;
  const reason = JSON.parse(message).reason;
  if (reason === 'locked') {
    $('#room_locked_row').show();
    $('#join_room_btn').removeClass('disabled');
  }
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_ERROR, (evt) => {
  const { error } = evt.detail;
  Demo.Methods.logToConsoleDOM(`Channel Error: ${error.message || error}`, 'System');
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
        (dir === 'sending' ? ', ' + stats[type][dir].roundTripTime + ' rtt' : '') +
        (typeof stats[type][dir].nacks === 'number' ? ', ' + stats[type][dir].nacks + ' nacks' : '') +
        (typeof stats[type][dir].plis === 'number' ? ', ' + stats[type][dir].plis + ' plis' : '') +
        (typeof stats[type][dir].firs === 'number' ? ', ' + stats[type][dir].firs + ' firs' : '') + ')';

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

        if (typeof stats.audio[dir].audioLevel === 'number') {
          itemAddStr += 'audio level: ' + stats.audio[dir].audioLevel;
        }

        if (typeof stats.audio[dir].echoReturnLoss === 'number') {
          itemAddStr += (itemAddStr ? ', ' : '') + 'echo return loss: ' + stats.audio[dir].echoReturnLoss;
        }

        if (typeof stats.audio[dir].echoReturnLossEnhancement === 'number') {
          itemAddStr += (itemAddStr ? ', ' : '') + 'echo return loss enhancement: ' + stats.audio[dir].echoReturnLossEnhancement;
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

        if (typeof stats.video[dir].framesDropped === 'number') {
          itemAddStr += (itemAddStr ? ', ' : '') + 'dropped: ' + stats.video[dir].framesDropped;
        }

        if (typeof stats.video[dir].framesDecoded === 'number') {
          itemAddStr += (itemAddStr ? ', ' : '') + 'decoded: ' + stats.video[dir].framesDecoded;
        }

        if (typeof stats.video[dir].framesEncoded === 'number') {
          itemAddStr += (itemAddStr ? ', ' : '') + 'encoded: ' + stats.video[dir].framesEncoded;
        }

        if (stats.video[dir].decoderImplementation) {
          itemAddStr += (itemAddStr ? ', ' : '') + 'decoder implementation: ' + stats.video[dir].decoderImplementation;
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
        (stats.certificate.local && stats.certificate.local.fingerprintAlgorithm || '-') + ', remote: ' +
        (stats.certificate.remote && stats.certificate.remote.fingerprintAlgorithm || '-') + ')');
    $(statsElm)
      .find('.certificate .certright')
      .html('Ciphers - (srtp: ' +
        (stats.certificate.srtpCipher ? '<small>' + stats.certificate.srtpCipher + '</small>' : 'N/A') + ', dtls: ' +
        (stats.certificate.dtlsCipher ? '<small>' + stats.certificate.dtlsCipher + '</small>' : 'N/A') + ', tlsVersion: ' +
        (stats.certificate.tlsVersion ? '<small>' + stats.certificate.tlsVersion + '</small>' : 'N/A') + ')');
  }
});

// //---------------------------------------------------
// // RECORDING EVENTS
// //---------------------------------------------------
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.RECORDING_STATE, (evt) => {
  const eventDetail = evt.detail;
  const { recordingId, state, error } = eventDetail;
  if (state === SkylinkConstants.RECORDING_STATE.ERROR) {
    Demo.Methods.logToConsoleDOM(`Recording Error - ${error}`, 'error');
  }

  if (state === SkylinkConstants.RECORDING_STATE.START) {
    Demo.Methods.logToConsoleDOM(`Recording started: ${recordingId}`, 'Recording');
  }

  if (state === SkylinkConstants.RECORDING_STATE.STOP) {
    Demo.Methods.logToConsoleDOM(`Recording stopped: ${recordingId}`, 'Recording');
  }
});

/********************************************************
  DOM Events
*********************************************************/
$(document).ready(function() {
  //---------------------------------------------------
  $('#display_app_id').html(config.appKey || config.apiKey || 'Not Provided');
  // //---------------------------------------------------
  $('#set_encrypt_secret_btn').click(function(e) {
    Demo.Skylink.setEncryptSecret(config.defaultRoom, $('#encrypt_secret').val(), $('#encrypt_secret_id').val());
    $('#encrypt_secret').val('');
    $('#encrypt_secret_id').val('');
  });
  // //---------------------------------------------------
  $('#clear_secret_ids_button').click(function(e) {
    Demo.Skylink.deleteEncryptSecrets(config.defaultRoom);
  });
  // //---------------------------------------------------
  $('#clear_selected_secret_id_button').click(function(e) {
    Demo.Skylink.setSelectedSecret(config.defaultRoom);
  });
  // //---------------------------------------------------
  $('#send_message_button').click(function(e) {
    e.preventDefault();
    if ($('#send_data_channel').prop('checked')) {
      if (selectedPeers.length > 0) {
        Demo.Skylink.sendP2PMessage(config.defaultRoom, $('#chat_input').val(), selectedPeers);
      } else {
        Demo.Skylink.sendP2PMessage(config.defaultRoom, $('#chat_input').val(), null);
      }
    } else {
      if (selectedPeers.length > 0) {
        Demo.Skylink.sendMessage(config.defaultRoom, $('#chat_input').val(), selectedPeers, $('#peer_session_id').val() || Demo.Methods.getFromLocalStorage('peerSessionId'));
      } else {
        Demo.Skylink.sendMessage(config.defaultRoom, $('#chat_input').val(), null, $('#peer_session_id').val() || Demo.Methods.getFromLocalStorage('peerSessionId'));
      }
    }
    $('#chat_input').val('');
  });
  // //---------------------------------------------------
  $('#send_file_button').click(function(e) {
    Demo.Skylink.sendBlobData(config.defaultRoom, $('#file_input').prop('files')[0], null)
    .then((res) => console.log("sendBlobData", res))
    .catch((err) => console.error("sendBlobData", err));
  });
  // //---------------------------------------------------
  $('#cancel_transfer_button').click(function(e) {
    const transferPeers = Object.keys(Demo.transferIds);
    Demo.Skylink.cancelBlobTransfer(config.defaultRoom, transferPeers[0], Demo.transferIds[transferPeers[0]])
    .then((res) => console.log("cancelBlobTransfer", res))
    .catch((err) => console.error("cancelBlobTransfer", err));
  })
  // //---------------------------------------------------
  $('#set_persistent_message').click(function(e) {
    if (e.currentTarget.checked) {
      Demo.Skylink.setMessagePersistence(config.defaultRoom, true);
    } else {
      Demo.Skylink.setMessagePersistence(config.defaultRoom, false);
    }
  });
  // //---------------------------------------------------
  $('#stop_stream_false').click(function(e) {
    stopStreamsOnLeaveRoom = !e.currentTarget.checked;
  });
  // //---------------------------------------------------
  $('#get_stored_messages_button').click(function() {
    Demo.Skylink.getStoredMessages(config.defaultRoom, $('#room_session_id').val());
    $('#room_session_id').val('');
  });
  // //---------------------------------------------------
  $('#update_user_info_btn').click(function() {
    Demo.userData.displayName = $('#display_user_info').val();
    Demo.Skylink.setUserData(config.defaultRoom, JSON.stringify(Demo.userData));
  });
  // //---------------------------------------------------
  $('#lock_btn').click(function() {
    Demo.Skylink.lockRoom(config.defaultRoom);
  });
  //---------------------------------------------------
  $('#unlock_btn').click(function() {
    Demo.Skylink.unlockRoom(config.defaultRoom);
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
  $('#stop_stream_btn').click(function() {
    if (Demo.Streams && Demo.Streams[_peerId] && (Demo.Streams[_peerId].streams.audio || Demo.Streams[_peerId].streams.video)) {
      Demo.Skylink.stopStreams(config.defaultRoom)
      .then(() => console.log("stopStreams resolved"))
      .catch((err) => console.error("stopStreams rejected", err));
    }
  });
  //---------------------------------------------------
  const startSendStream = function(mediaOptions) {
    Demo.Skylink.sendStream(config.defaultRoom, mediaOptions);
  };

  $("#get_media_stream_btn").click(function() {
    const mediaOptions = {
      audio: { stereo: true },
      video: true,
    };

    Demo.Skylink.getUserMedia(mediaOptions)
    .then((streams) => {

      Demo.audioStream = streams[0];
      Demo.videoStream = streams[1];
      Demo.Methods.logToConsoleDOM(`Get media streams successful`, 'Media Stream');
    })
    .catch((err) => {
      Demo.Methods.logToConsoleDOM(`Error getting media streams`, 'error');
      console.log("Error getting media streams", err);
    })
  })

  $("#send_media_stream_btn").click(function() {
    const mediaStreams = [];
    if (Demo.videoStream) {
      mediaStreams.push(Demo.videoStream);
    }

    if (Demo.audioStream) {
      mediaStreams.push(Demo.audioStream);
    }

    if (mediaStreams.length > 0) {
      Demo.Skylink.sendStream(config.defaultRoom, mediaStreams)
      .then((streams) => console.log("Streams sent", streams));
    } else {
      Demo.Methods.logToConsoleDOM(`No streams to send`, 'info');
    }
  })

  $("#clear_media_stream_btn").click(function() {
    Demo.audioStream = null;
    Demo.videoStream = null;
    Demo.Methods.logToConsoleDOM(`Cached media streams cleared`, 'Media Stream');
  })

  $("#start_stream_btn").click(function() {
    const mediaOptions = {
      audio: { stereo: true },
      video: true,
    };

    if (Demo.Streams && Demo.Streams[_peerId] && (Demo.Streams[_peerId].streams.audio || Demo.Streams[_peerId].streams.video)) {
      Demo.Skylink.stopStreams(config.defaultRoom)
      .then(() => startSendStream(mediaOptions))
      .catch((err) => console.error("stopStreams rejected", err));
    } else {
      startSendStream(mediaOptions);
    }
  });
  //---------------------------------------------------
  $("#start_video_btn").click(function() {
      const mediaOptions = {
        audio: false,
        video: true,
      };

    if (Demo.Streams && Demo.Streams[_peerId] && (Demo.Streams[_peerId].streams.audio || Demo.Streams[_peerId].streams.video)) {
      Demo.Skylink.stopStreams(config.defaultRoom)
      .then(() => startSendStream(mediaOptions))
      .catch((err) => console.error("stopStreams rejected", err));
    } else {
      console.log("sending as prefetched stream");
      Demo.Skylink.getUserMedia(mediaOptions)
      .then((streams) => startSendStream(streams[1]));
    }
  });
  //---------------------------------------------------
  $("#start_audio_btn").click(function() {
    const mediaOptions = {
      audio: { stereo: true },
      video: false,
    };

    if (Demo.Streams && Demo.Streams[_peerId] && (Demo.Streams[_peerId].streams.audio || Demo.Streams[_peerId].streams.video)) {
      Demo.Skylink.stopStreams(config.defaultRoom)
      .then(() => startSendStream(mediaOptions))
      .catch((err) => console.error("stopStreams rejected", err));
    } else {
      startSendStream(mediaOptions);
    }
  });
  //---------------------------------------------------
  $("#send_video_btn").click(function() {
    let sampleVideo = $("#sampleVideo")[0];
    let sampleVideoPanel = $("#sample_video_panel")[0];
    sampleVideo.play();
    const sampleVideoStream = sampleVideo.captureStream();
    sampleVideoPanel.classList.remove("hidden");
    sampleVideoStream.oninactive = (evt) => {
      console.log("Video has ended.");
      Demo.Skylink.stopStreams(config.defaultRoom);
      sampleVideoPanel.classList.add("hidden");
    };

    Demo.Skylink.sendStream(config.defaultRoom, sampleVideoStream);
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
  $('#leave_room_btn').click(function() {
    Demo.Skylink.leaveRoom(config.defaultRoom, stopStreamsOnLeaveRoom)
    .then(() => {
      Demo.Methods.toggleInRoomSettings('', false);
      $('#join_room_container').css("display", "block");
      Demo.Peers = 0;
      Demo.PeerIds = [];
    })
  });
  // //---------------------------------------------------
  $('#restart_btn').click(function() {
    Demo.Skylink.refreshConnection(config.defaultRoom, null, true);
  });
  // //---------------------------------------------------
  $('#join_room_btn').click(function () {
    Demo.userData = { displayName: $('#join_room_user_info').val(), peerSessionId: Demo.Methods.getFromLocalStorage('peerSessionId')};
    joinRoomOptions.userData = JSON.stringify(Demo.userData);
    Demo.rememberMe = $('#remember_me').prop('checked');

    config.appKey = selectedAppKey || config.appKey;

    Demo.Skylink = new Skylink(config);
    Demo.Skylink.getStreamSources().then(sources => {
      const audioInputDevices = sources.audio.input;
      const videoInputDevices = sources.video.input;
      Demo.Skylink.getUserMedia(null, {
        audio : {
          deviceId : audioInputDevices[0].deviceId,
        },
        video : {
          deviceId   : videoInputDevices[0].deviceId,
        }
      }).then(prefetchedStreams => {
        Demo.Skylink.joinRoom(joinRoomOptions, prefetchedStreams);
        $('#join_room_btn').addClass('disabled');
        if (Demo.isMCU) {
          $('#join_room_container').css("display", "none");
          $('#mcu_loading').css("display", "block");
        }
      })
    })
  });
  // //---------------------------------------------------
  $('#share_screen_btn').click(function () {
    Demo.Skylink.shareScreen(config.defaultRoom).then((stream) => {
      console.log('Screen share started: ', stream);
    });
  });
  // //---------------------------------------------------
  $('#stop_screen_btn').click(function() {
    Demo.Skylink.stopScreen(config.defaultRoom);
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
  // //---------------------------------------------------
  $('#start_recording_btn').click(function() {
    Demo.Skylink.startRecording(config.defaultRoom)
    .catch((error) => Demo.Methods.logToConsoleDOM(error.message, 'error'));
  });
  // //---------------------------------------------------
  $('#stop_recording_btn').click(function() {
    Demo.Skylink.stopRecording(config.defaultRoom)
    .catch((error) => Demo.Methods.logToConsoleDOM(error.message, 'error'));

    $('#peer_video_list').on('click', '.toggle-connstats', function() {
      $(this).parent().find('.connstats').slideToggle();
      $(this).attr('toggled', $(this).attr('toggled') ? '' : 'true');
      $(this).html($(this).attr('toggled') ? 'Hide Stats' : 'Show Stats');
    });
  });
  // //---------------------------------------------------
  $('#clear-selected-users').click(() => {
    $('#selected_users_panel .selected-users').html('');
    $('.select-user').each(function () {
      $(this)[0].checked = false;
    });
    $('#selected_users_panel .all').show();
    $('#selected_users_panel .all').show();
    selectedPeers = [];
  });
  // //---------------------------------------------------
  $('#get_logs_btn').click(function() {
    console.log(SkylinkLogger.getLogs());
    SkylinkLogger.clearLogs();
    Demo.Methods.logToConsoleDOM(`Check console log for output`, 'System');
  });

  window.setSelectedSecret = dom => {
    var secretId = $(dom).attr('value');
    Demo.Skylink.setSelectedSecret(config.defaultRoom, secretId);
  };

  window.setAppKey = dom => {
    var appKey = $(dom).attr('value');
    console.log(appKey);
    if (appKey === 'mcu') {
      Demo.isMCU = true;
      appKey = 'MCU';
    } else {
      Demo.isMCU = false;
      appKey = 'P2P';
    }
    selectedAppKey = APPKEYS[appKey];
    $('#display_app_id').html(selectedAppKey);
  };

  window.setMediaOptions = dom => {
    var type = $(dom).attr('value');
    var checked = $(dom).prop('checked');
    joinRoomOptions[type] = checked;
    if (type === 'audio') {
      if (!checked) {
        $('#join_room_audio_muted').prop('checked', checked);
      }
      $('#join_room_audio_muted').prop('disabled', !checked);
    } else if (type === 'video') {
      if (!checked) {
        $('#join_room_video_muted').prop('checked', checked);
      }
      $('#join_room_video_muted').prop('disabled', !checked);
    }
  }

  window.setMuteOption = dom => {
    var type = $(dom).attr('value');
    if ($(dom).prop('checked')) {
      joinRoomOptions[type] = {};
      joinRoomOptions[type].mute = true;
    } else {
      delete joinRoomOptions[type].mute;
      joinRoomOptions[type] = true;
    }
  }

  window.selectTargetPeer = dom => {
    var peerId = $(dom).attr('target');
    var panelDom = $('#selected_users_panel');

    if (!dom.checked) {
      $(`#${peerId}-selected-user`).remove();

      var index = selectedPeers.indexOf(peerId);

      if (index > -1) {
        selectedPeers.splice(index, 1);
      }

      if ($(panelDom).find('.selected-users em').length === 0) {
        $(panelDom).find('.all').show();
      } else {
        $(panelDom).find('.all').hide();
      }
    } else {
      $(panelDom).find('.selected-users').append('<em id="' +
        peerId + '-selected-user">Peer ' + peerId + '</em>');
      $(panelDom).find('.all').hide();
      selectedPeers.push(peerId);
    }
  };

  window.rememberMe = dom => {
    console.log('save user to local storage', dom.checked);
  }

  window.onerror = function (error) {
    let message = 'Check console for error';
    if (error.indexOf('Failed decrypting message') > -1) {
      message = `Failed decrypting message: ${error.split('-')[1].trim()}` ;
    }

    if (error.indexOf('Dropping message') > -1) {
      message = `Dropping message: ${error.split('-')[1].trim()}`;
    }

    Demo.Methods.logToConsoleDOM(message, 'error');
  };

  window.addEventListener("unhandledrejection", (promiseRejectionEvent) => {
    let message = promiseRejectionEvent.reason;
    Demo.Methods.logToConsoleDOM(message, 'error');
  });

  window.onbeforeunload = () => {
    if (!Demo.rememberMe) {
      if (Object.keys(tabSession).length === 0) {
        Demo.Methods.clearLocalStorage();
      }
    }

    // alert other tabs that this tab is closing
    bc.postMessage({
      action: "tab-close",
      tabSessionId,
    })
  };
});

var DemoSkylinkEventManager = SkylinkEventManager;
export { DemoSkylinkEventManager, SkylinkConstants };
