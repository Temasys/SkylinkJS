/* eslint-disable import/extensions */
import Skylink, { SkylinkLogger, SkylinkEventManager, SkylinkConstants } from '../../../../build/skylink.complete.js';
import config from '../../config.js';

/********************************************************
  API Settings
*********************************************************/
const Demo = window.Demo || {};
Demo.FILE_SIZE_LIMIT = 1024 * 1024 * 200;
Demo.Peers = 0;
Demo.PeerIds = [];
Demo.Files = [];
Demo.Stats = {};
Demo.Methods = {};
Demo.Skylink = new Skylink(config);
Demo.ShowStats = {};
Demo.TransfersDone = {};
Demo.Downloads = {};
Demo.Streams = null;
Demo._Skylink = Skylink;
window.Demo = Demo;

const { $, document } = window;

//----- join room options
const displayName = `name_user_${  Math.floor((Math.random() * 1000) + 1)}`;
$('#display_user_info').val(displayName);
const joinRoomOptions = {
  audio: { stereo: true },
  video: true,
  userData: displayName,
};

let selectedPeers = [];
let _peerId = null;

SkylinkLogger.setLevel(SkylinkLogger.logLevels.DEBUG, true);

Demo.Methods.displayFileItemHTML = function(content) {
  return '<p>' + content.name + '<small style="float:right;color:#aaa;">' + content.size + ' B</small></p>' +
    ((content.isUpload) ? ('<table id="' + content.transferId + '" class="table upload-table">' +
    '<thead><tr><th colspan="2"><span class="glyphicon glyphicon-saved">' +
    '</span> Upload Status</th></tr></thead>' +
    '<tbody></tbody></table>') : ('<div class="progress progress-striped">' +
    '<div id="' + content.transferId + '" class="progress-bar ' +
    '" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"' +
    ' style="width: 0%"><span>Downloading...</span></div></div>')) +
    '<p><a id="'  + content.transferId + '_btn" class="btn btn-default ' +
    (window.webrtcDetectedBrowser === 'IE' ? ' downloadfile' : '') + '" ' +
    (window.webrtcDetectedBrowser === 'safari' ? 'target="_blank" ' : '') +
    'href="#" style="display: block;" download="' + content.name +
    '"><span class="glyphicon glyphicon-cloud-download"></span> <b>Download file</b></a>' +
    (content.direction === Demo.Skylink.DATA_TRANSFER_TYPE.DOWNLOAD ?
    '<a class="btn btn-default cancel c-' + content.peerId + '" style="margin-top: 15px; border-color: #d9534f; color: #d9534f;" ' +
    'onclick="cancelTransfer(\'' + content.peerId + '\', \'' + content.transferId + '\')">' +
    '<span class="glyphicon glyphicon-remove"></span> Cancel Transfer</a></p>' : '');
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

Demo.Methods.displayRecordingSessionHTML = function(recordingId) {
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

  $('#recording_log').append('<div class="chat-item list-group-item active">' +
    '<p class="list-group-item-heading"><b><small><span id="recording_' + recordingId +
    '_state_icon" class="glyphicon glyphicon-record"></span></small>&nbsp;&nbsp;' +
    'Session ' + recordingId + '</b><em title="' + timestamp.toString() + '">' + Hours + ':' + Minutes + ':' + Seconds +
    '</em></p><p class="list-group-item-text"></p><blockquote style="color:#888;font-size: 14px;padding: 2px 5px;">' +
    '<small><b>STATUS:</b>&nbsp;&nbsp;<em id="recording_' + recordingId + '_state" style="font-style:normal;">STARTED</em></small></blockquote>' +
    '<p id="recording_' + recordingId + '_btn"></p>' +
    '<div id="recording_' + recordingId + '_error"></div><hr/></div>');
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

/********************************************************
  Skylink Events
*********************************************************/
// DATA TRANSFER EVENTS
//---------------------------------------------------
// Demo.Skylink.on('incomingData', function(data, transferId, peerId, transferInfo, isSelf) {
//   if (transferInfo.dataType !== 'blob') {
//     //displayChatItemHTML = function (peerId, timestamp, content, isPrivate)
//     Demo.Methods.displayChatMessage(peerId, '<img src="' + data + '">', false);
//   }
// });
// Demo.Skylink.on('incomingDataRequest', function(transferId, peerId, transferInfo, isSelf) {
//   if (!isSelf && transferInfo.dataType !== 'blob') {
//     Demo.Skylink.acceptDataTransfer(peerId, transferId, true);
//   }
// })
// Demo.Skylink.on('dataTransferState', function (state, transferId, peerId, transferInfo, error){
//   if (transferInfo.dataType !== Demo.Skylink.DATA_TRANSFER_SESSION_TYPE.BLOB) {
//     return;
//   }
//
//   if (!Demo.TransfersDone[transferId]) {
//     Demo.TransfersDone[transferId] = {};
//   }
//
//   transferInfo.peerId = peerId;
//
//   switch (state) {
//   case Demo.Skylink.DATA_TRANSFER_STATE.UPLOAD_REQUEST :
//     var result = confirm('Accept file "' + transferInfo.name +
//       '" from ' + peerId + '?\n\n[size: ' + transferInfo.size + ']');
//     Demo.Skylink.acceptDataTransfer(peerId, transferId, result);
//     break;
//   case Demo.Skylink.DATA_TRANSFER_STATE.USER_UPLOAD_REQUEST :
//   case Demo.Skylink.DATA_TRANSFER_STATE.UPLOAD_STARTED :
//     if (document.getElementById('file-' + transferId) &&
//       $('#' + transferId + ' .' + peerId).length === 0) {
//       $('#' + transferId + ' .' + peerId).append('<tbody class="' + peerId + '"></tbody>');
//       return;
//     }
//     var displayName = Demo.Skylink.getUserData();
//     transferInfo.transferId = transferId;
//     transferInfo.isUpload = true;
//     Demo.Methods.displayChatMessage(displayName, transferInfo, transferId);
//     Demo.Methods.displayChatMessage(displayName, 'File sent: ' + transferInfo.name);
//     break;
//   case Demo.Skylink.DATA_TRANSFER_STATE.DOWNLOAD_STARTED :
//     if (document.getElementById('file-' + transferId) &&
//       $('#' + transferId + ' .' + peerId).length === 0) {
//       $('#' + transferId + ' .' + peerId).append('<tbody class="' + peerId + '"></tbody>');
//       if (transferInfo.data) {
//         if (window.webrtcDetectedBrowser !== 'IE') {
//           $('#' + transferId + '_btn').attr('href', URL.createObjectURL(transferInfo.data));
//         } else {
//           $('#' + transferId + '_btn').attr('fileid', transferId);
//           Demo.Downloads[transferId] = {
//             name: transferInfo.name,
//             blob: transferInfo.data
//           };
//         }
//       }
//       return;
//     }
//     var displayName = Demo.Skylink.getPeerInfo(transferInfo.senderPeerId).userData;
//     transferInfo.transferId = transferId;
//     transferInfo.isUpload = false;
//     Demo.Methods.displayChatMessage(displayName, transferInfo, transferId);
//     Demo.Methods.displayChatMessage(displayName, 'File sent: ' + transferInfo.name);
//
//     if (transferInfo.data) {
//       if (window.webrtcDetectedBrowser !== 'IE') {
//         $('#' + transferId + '_btn').attr('href', URL.createObjectURL(transferInfo.data));
//       } else {
//         $('#' + transferId + '_btn').attr('fileid', transferId);
//         Demo.Downloads[transferId] = {
//           name: transferInfo.name,
//           blob: transferInfo.data
//         };
//       }
//     }
//     break;
//   case Demo.Skylink.DATA_TRANSFER_STATE.UPLOADING :
//     var displayName = Demo.Skylink.getPeerInfo(peerId).userData;
//     if ($('#' + transferId).find('.' + peerId).width() < 1) {
//       $('#' + transferId).append('<tr><td>' + displayName + '<a class="c-' + peerId + ' cancel" ' +
//         'style="color: #d9534f;" onclick="cancelTransfer(\'' + peerId + '\', \'' + transferId + '\');">' +
//         '<span class="glyphicon glyphicon-remove"></span></a>' +
//         '</td><td class="' + peerId + '">' + transferInfo.percentage + '%</td></tr>');
//     } else {
//       $('#' + transferId).find('.' + peerId).html(transferInfo.percentage + '%');
//     }
//     break;
//   case Demo.Skylink.DATA_TRANSFER_STATE.DOWNLOADING :
//     $('#' + transferId).attr('aria-valuenow', transferInfo.percentage);
//     $('#' + transferId).css('width', transferInfo.percentage + '%');
//     $('#' + transferId).find('span').html(transferInfo.percentage + ' %');
//     break;
//   case Demo.Skylink.DATA_TRANSFER_STATE.UPLOAD_COMPLETED :
//     if ($('#' + transferId).find('.' + peerId).width() < 1) {
//       $('#' + transferId).append('<tr><td>' + displayName + '<a class="c-' + peerId + ' cancel" ' +
//         'style="color: #d9534f;" onclick="cancelTransfer(\'' + peerId + '\', \'' + transferId + '\');">' +
//         '<span class="glyphicon glyphicon-remove"></span></a>' +
//         '</td><td class="' + peerId + '">0%</td></tr>');
//     }
//     var displayName = Demo.Skylink.getPeerInfo(peerId).userData;
//     Demo.Methods.displayChatMessage(displayName, 'File received: ' + transferInfo.name);
//     $('#' + transferId).find('.' + peerId).html('&#10003;');
//     $('#' + transferId + ' .c-' + peerId + '.cancel').css('opacity', .5);
//     $('#' + transferId + ' .c-' + peerId + '.cancel').css('cursor', 'not-allowed');
//     Demo.TransfersDone[transferId][peerId] = true;
//     break;
//   case Demo.Skylink.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED :
//     // If completed, display download button
//     var displayName = Demo.Skylink.getPeerInfo(peerId).userData;
//     $('#' + transferId).parent().remove();
//     if (window.webrtcDetectedBrowser !== 'IE') {
//       $('#' + transferId + '_btn').attr('href', URL.createObjectURL(transferInfo.data));
//     } else {
//       $('#' + transferId + '_btn').attr('fileid', transferId);
//       Demo.Downloads[transferId] = {
//         name: transferInfo.name,
//         blob: transferInfo.data
//       };
//     }
//     $('#' + transferId + '_btn').css('display', 'block');
//     Demo.Methods.displayChatMessage(displayName, 'File received: ' + transferInfo.name);
//     $('#file-' + transferId + ' .c-' + peerId + '.cancel').css('opacity', .5);
//     $('#file-' + transferId + ' .c-' + peerId + '.cancel').css('cursor', 'not-allowed');
//     Demo.TransfersDone[transferId][peerId] = true;
//     break;
//   case Demo.Skylink.DATA_TRANSFER_STATE.REJECTED :
//     alert('User "' + peerId + '" has rejected your file');
//     $('#' + transferId + ' .c-' + peerId + '.cancel').css('opacity', .5);
//     $('#' + transferId + ' .c-' + peerId + '.cancel').css('cursor', 'not-allowed');
//     Demo.TransfersDone[transferId][peerId] = true;
//     break;
//   case Demo.Skylink.DATA_TRANSFER_STATE.ERROR :
//     alert(error.transferType + ' failed. Reason: \n' +
//       error.message);
//     $('#' + transferId).parent().removeClass('progress-bar-info');
//     $('#' + transferId).parent().addClass('progress-bar-danger');
//     $('#' + transferId + ' .c-' + peerId + '.cancel').css('opacity', .5);
//     $('#' + transferId + ' .c-' + peerId + '.cancel').css('cursor', 'not-allowed');
//     $('#file-' + transferId + ' .c-' + peerId + '.cancel').css('opacity', .5);
//     $('#file-' + transferId + ' .c-' + peerId + '.cancel').css('cursor', 'not-allowed');
//     Demo.TransfersDone[transferId][peerId] = true;
//     break;
//   case Demo.Skylink.DATA_TRANSFER_STATE.CANCEL :
//     alert(error.transferType + ' canceled. Reason: \n' +
//       error.message);
//     $('#' + transferId).parent().removeClass('progress-bar-info');
//     $('#' + transferId).parent().addClass('progress-bar-danger');
//     $('#' + transferId + ' .c-' + peerId + '.cancel').css('opacity', .5);
//     $('#' + transferId + ' .c-' + peerId + '.cancel').css('cursor', 'not-allowed');
//     $('#file-' + transferId + ' .c-' + peerId + '.cancel').css('opacity', .5);
//     $('#file-' + transferId + ' .c-' + peerId + '.cancel').css('cursor', 'not-allowed');
//     Demo.TransfersDone[transferId][peerId] = true;
//   }
// });
// //---------------------------------------------------

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.ON_INCOMING_MESSAGE, (evt) => {
  const eventDetail = evt.detail;
  const { isSelf, peerInfo, message } = eventDetail;
  const peerId = isSelf ? 'You' : peerInfo.userData;
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
  const { storedMessages } = eventDetail;


  storedMessages.forEach((message) => {
      const peerId = 'Stored Message' + ` [${message.senderPeerId}]`;
      const content = `${message.isDataChannel ? 'P2P' : 'Socket'} -> GRP [${message['timeStamp'].replace('T', ", ").replace("Z", "")}] : ${message.content}`;
      Demo.Methods.displayChatMessage(peerId, content, message.isPrivate);
  })
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_REOPEN, (evt) => {
  Demo.Skylink.leaveRoom(config.defaultRoom)
  .then(() => {
    Demo.Peers = 0;
    Demo.PeerIds = [];
    Demo.Skylink.joinRoom(joinRoomOptions)
  })
});

//---------------------------------------------------

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
    $('#display_user_id').html(peerId);
    $('#isAudioMuted').css('color',
      (audioStreamId && peerInfo.mediaStatus[audioStreamId].audioMuted === 1) ? 'green' : 'red');
    $('#isVideoMuted').css('color',
      (videoStreamId && peerInfo.mediaStatus[videoStreamId].videoMuted === 1) ? 'green' : 'red');
    $('#leave_room_btn').show();
    $('#presence_panel').show();
    $('#chat_input').removeAttr('disabled');
    $('#set_persistent_message').prop('checked', Demo.Skylink.getMessagePersistence(config.defaultRoom));
    // If not supportive of File, FileReader, Blob quit
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      $('#file_panel').show();
      $('#file_list_panel').show();
    }
  } else {
    Demo.Methods.displayChatMessage('System', 'Peer ' + peerId + ' joined the room');
    var newListEntry = '<tr id="user' + peerId + '" class="badQuality">' +
      '<td><span class="name">' + peerInfo.userData + '</span><br>' +
      '<input class="select-user" target="' + peerId + '" type="checkbox" onclick="selectTargetPeer(this);"></td><td>';
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
      newListEntry += '<span class="glyphicon ' + glyphiconList[i] + ' circle ' +
        i + '" title="' + titleList[i] + '"></span>&nbsp;&nbsp;&nbsp;';
    }
    newListEntry += '</td></tr>';
    $('#presence_list').append(newListEntry);
    $('#user' + peerId + ' .0').css('color', 'green');
    $('#user' + peerId + ' .video').css('color',
      (videoStreamId && peerInfo.mediaStatus[videoStreamId].videoMuted === 1) ? 'green' : 'red');
    $('#user' + peerId + ' .audio').css('color',
      (audioStreamId && peerInfo.mediaStatus[audioStreamId].audioMuted === 1) ? 'green' : 'red');
  }

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
      peerVideo.poster = 'img/no_profile.jpg';
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
//---------------------------------------------------

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.ON_INCOMING_STREAM, (evt) => {
  const eventDetail = evt.detail;
  const { peerId, stream, isSelf, peerInfo, isReplace, isVideo, isAudio } = eventDetail;
  let peerVideo = $('#video' + peerId + ' .video-obj')[0];
  let peerAudio = $('#video' + peerId + ' .audio-obj')[0];

  if (!isReplace) {
    if ((isVideo && isAudio) || (isVideo && !isAudio)) {
      if (peerVideo.poster) {
        peerVideo.removeAttribute('poster');
      }
      window.attachMediaStream(peerVideo, stream);
    } else {
      window.attachMediaStream(peerAudio, stream);
    }
  }

  if (!isSelf) {
    if (Demo.PeerIds.indexOf(peerId) < 0) {
      Demo.PeerIds.push(peerId);
      Demo.Peers += 1;
    }
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
    if (isVideoStream) {
      $('#user' + peerId + ' .video').css('color',
        (isVideoStream && peerInfo.mediaStatus[stream.id].videoMuted === 1) ? 'green' : 'red');
    } else {
      $('#user' + peerId + ' .audio').css('color',
        (isAudioStream && peerInfo.mediaStatus[stream.id].audioMuted === 1) ? 'green' : 'red');
    }
    $('#user' + peerId + ' .name').html(peerInfo.userData);
  }

  // Handle when stream is after ICE connection is established (wat)
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
  Demo.Methods.displayChatMessage('System', 'Audio and video access is allowed.');
});

// //---------------------------------------------------
// Demo.Skylink.on('mediaAccessError', function(error) {
//   //alert((typeof error === 'object') ? error.message : error);
//   Demo.Methods.displayChatMessage('System', 'Failed to join room as video and audio stream is required.');
// });
// //---------------------------------------------------
// Demo.Skylink.on('systemAction', function (action, message, reason){
//   //alert((typeof error === 'object') ? error.message : error);
//   Demo.Methods.displayChatMessage('System', '(' + action + ' : ' + reason + ') ' + message);
// });
//---------------------------------------------------

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.READY_STATE_CHANGE, (evt) => {
  const eventDetail = evt.detail;
  const { readyState, error } = eventDetail;
  if (readyState === SkylinkConstants.READY_STATE_CHANGE.ERROR) {
    for (let errorCode in SkylinkConstants.READY_STATE_CHANGE_ERROR) {
      if (SkylinkConstants.READY_STATE_CHANGE_ERROR[errorCode] === error.errorCode) {
        //window.alert(`An error occurred parsing and retrieving server code. Error was: ${errorCode}`);
        break;
      }
    }
  }
  $('#channel_status').show();
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_LEFT, (evt) => {
  const eventDetail = evt.detail;
  const { peerId } = eventDetail;
  Demo.Methods.displayChatMessage('System', `Peer ${peerId} has left the room`);
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

  delete Demo.Stats[peerId];
  delete Demo.ShowStats[peerId];
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
    case SkylinkConstants.PEER_CONNECTION_STATE.HAVE_REMOTE_PRANSWER:
    case SkylinkConstants.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER:
    case SkylinkConstants.PEER_CONNECTION_STATE.HAVE_LOCAL_PRANSWER:
      color = 'orange';
      break;
    case SkylinkConstants.PEER_CONNECTION_STATE.CLOSED:
      color = 'red';
      break;
    case SkylinkConstants.PEER_CONNECTION_STATE.STABLE:
      color = 'green';
      break;
  }
  $(`#user${peerId} .${6}`).css('color', color);
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
      $('#user' + peerId + ' .video').css('color',
        (videoStreamId && peerInfo.mediaStatus[videoStreamId].videoMuted === 1) ? 'green' : 'red');
      $('#user' + peerId + ' .audio').css('color',
        (audioStreamId && peerInfo.mediaStatus[audioStreamId].audioMuted === 1) ? 'green' : 'red');
    $('#user' + peerId + ' .name').html(peerInfo.userData);
  }
});

const logToConsoleDOM = (message, level) => {
  const $loggerListParentDOM = $('ul#console_log');
  const $logListItem = $('<li />').addClass('list-group-item');
  const $logText = $('<span />').addClass('log-message-text').text(message);
  const $levelBadge = $('<span />').addClass('log-level-badge badge badge-primary').text(level.toUpperCase());
  $logListItem.append($levelBadge);
  $logListItem.append($logText);
  $logListItem.appendTo($loggerListParentDOM);
};

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.ROOM_LOCK, (evt) => {
  const eventDetail = evt.detail;
  const { isLocked } = eventDetail;
  $('#display_room_status').html((isLocked) ? 'Locked' : 'Not Locked');
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.SYSTEM_ACTION, (evt) => {
  const eventDetail = evt.detail;
  const { action, info, reason, rid } = eventDetail;
  const message = `SkylinkJS - [Server](${action}) System Action Warning: ${info} | Reason: ${reason} | Room ID: ${rid}`;
  logToConsoleDOM(message, 'info');
});


SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.LOGGED_ON_CONSOLE, (evt) => {
  const eventDetail = evt.detail;
  const { level, message } = eventDetail;
  logToConsoleDOM(message, level);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.STREAM_ENDED, (evt) => {
  const eventDetail = evt.detail;
  const { isScreensharing, isSelf, peerId } = eventDetail;

  if (!isSelf && !isScreensharing) {
    document.getElementById(`video${eventDetail.peerId}`).firstChild.setAttribute('poster', '../app/img/black.png');
  }

  // if (isSelf && isScreensharing) {
  //   const streams = Demo.Skylink.getStreams(config.defaultRoom);
  //   const userMediaStreams = streams.userMedia;
  //   for (const streamId in userMediaStreams) {
  //     const gUMStream = userMediaStreams[streamId];
  //     const selfVideoElem = document.getElementsByClassName('self-video-elem')[0];
  //     attachMediaStream(selfVideoElem, gUMStream);
  //   }
  // }

  if (isScreensharing) {
    const screenElm = $(`.${peerId}screen`)[0];
      screenElm.parentNode.removeChild(screenElm);
    }

  Demo.Methods.updateStreams();
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
  $('#leave_room_btn').hide();
  $('#channel').css('color', 'red');
  $('#channel').html('Closed');
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_MESSAGE, () => {
  $('#channel').css('color', '00FF00');
  $('#channel').html('Connecting...');
  setTimeout(() => {
    $('#channel').css('color', 'green');
    $('#channel').html('Active');
  }, 1000);
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.CHANNEL_ERROR, (evt) => {
  const { error } = evt.detail;
  Demo.Methods.displayChatMessage('System', `Channel Error: ${error.message || error}`);
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
      .html('Ciphers - (srtp: ' +
        (stats.certificate.srtpCipher ? '<small>' + stats.certificate.srtpCipher + '</small>' : 'N/A') + ', dtls: ' +
        (stats.certificate.dtlsCipher ? '<small>' + stats.certificate.dtlsCipher + '</small>' : 'N/A') + ')');
  }
});

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

/********************************************************
  DOM Events
*********************************************************/
$(document).ready(function() {
  //---------------------------------------------------
  $('#display_app_id').html(config.appKey || config.apiKey || 'Not Provided');
  //---------------------------------------------------
  // if (typeof config.isPersistent === 'boolean') {
  //   $('#encryption_config').html(config.isPersistent || 'false');
  // } else if (typeof config.isPersistent === 'undefined') {
  //   $('#encryption_config').html('Not configured');
  // }
  // //---------------------------------------------------
  $('#set_encrypt_secret_btn').click(function(e) {
    Demo.Skylink.setEncryptSecret(config.defaultRoom, $('#encrypt_secret').val(), $('#encrypt_secret_id').val());
    $('#encrypt_secret').val('');
    $('#encrypt_secret_id').val('');
  });

  $('#clear_secret_ids_button').click(function(e) {
    Demo.Skylink.deleteEncryptSecrets(config.defaultRoom);
  });

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
        Demo.Skylink.sendMessage(config.defaultRoom, $('#chat_input').val(), selectedPeers);
      } else {
        Demo.Skylink.sendMessage(config.defaultRoom, $('#chat_input').val());
      }
    }
    $('#chat_input').val('');
  });
  // //---------------------------------------------------
  $('#set_persistent_message').click(function(e) {
    if (e.currentTarget.checked) {
      Demo.Skylink.setMessagePersistence(config.defaultRoom, true);
    } else {
      Demo.Skylink.setMessagePersistence(config.defaultRoom, false);
    }
  });
  // //---------------------------------------------------
  $('#get_stored_messages_button').click(function() {
    Demo.Skylink.getStoredMessages(config.defaultRoom);
  });
  // $('#chat_input').keyup(function(e) {
  //   e.preventDefault();
  //   if (e.keyCode === 13) {
  //     if ($('#send_data_channel').prop('checked')) {
  //       if (selectedPeers.length > 0) {
  //         Demo.Skylink.sendP2PMessage($('#chat_input').val(), selectedPeers, config.defaultRoom);
  //       } else {
  //         Demo.Skylink.sendP2PMessage($('#chat_input').val(), null, config.defaultRoom);
  //       }
  //     } else {
  //       if (selectedPeers.length > 0) {
  //         Demo.Skylink.sendMessage(config.defaultRoom, $('#chat_input').val(), selectedPeers);
  //       } else {
  //         Demo.Skylink.sendMessage(config.defaultRoom, $('#chat_input').val());
  //       }
  //     }
  //     $('#chat_input').val('');
  //   }
  // });
  // //---------------------------------------------------
  // $('#file_input').change(function() {
  //   Demo.Files = $(this)[0].files;
  // });
  // //---------------------------------------------------
  // $('#dataURL_input').change(function() {
  //   Demo.DataURL = $(this)[0].files;
  // });
  // //---------------------------------------------------
  // $('#send_file_btn').click(function() {
  //   if (!Demo.Files) {
  //     alert('No files selected');
  //     return;
  //   } else {
  //     if (Demo.Files.length > 0) {
  //       $(Demo.Files)[0].disabled = true;
  //       console.log('Button temporarily disabled to prevent crash');
  //     }
  //   }
  //   for (var i = 0; i < Demo.Files.length; i++) {
  //     var file = Demo.Files[i];
  //     if (file.size <= Demo.FILE_SIZE_LIMIT) {
  //       if (selectedPeers.length > 0) {
  //         Demo.Skylink.sendBlobData(file, selectedPeers, true);
  //       } else {
  //         Demo.Skylink.sendBlobData(file, true);
  //       }
  //       $('#file_input').val('');
  //     } else {
  //       alert('File "' + file.name + '"" exceeded the limit of 200MB.\n' +
  //         'We only currently support files up to 200MB for this demo.');
  //     }
  //   }
  //   $('#send_file_btn')[0].disabled = false;
  // });
  // //---------------------------------------------------
  // $('#send_dataURL_btn').click(function() {
  //   if (!Demo.DataURL) {
  //     alert('No files selected');
  //     return;
  //   } else {
  //     if (Demo.Files.length > 0) {
  //       $(Demo.Files)[0].disabled = true;
  //       console.log('Button temporarily disabled to prevent crash');
  //     }
  //   }
  //
  //   for (var i = 0; i < Demo.DataURL.length; i++) {
  //     var file = Demo.DataURL[i];
  //
  //     var fr = new FileReader();
  //
  //     fr.onload = function() {
  //       if (file.size <= 1024 * 1024 * 2) {
  //         if (selectedPeers.length > 0) {
  //           Demo.Skylink.sendURLData(fr.result, selectedPeers);
  //         } else {
  //           Demo.Skylink.sendURLData(fr.result);
  //         }
  //         $('#dataURL_input').val('');
  //       } else {
  //         alert('File "' + file.name + '"" exceeded the limit of 2MB.\n' +
  //           'We only currently support files up to 2MB for this demo.');
  //       }
  //     };
  //
  //     fr.readAsDataURL(file);
  //   }
  //   $('#send_dataURL_btn')[0].disabled = false;
  // });
  // //---------------------------------------------------
  // //---------------------------------------------------
  $('#update_user_info_btn').click(function() {
    Demo.Skylink.setUserData(config.defaultRoom, $('#display_user_info').val());
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
    Demo.Skylink.stopStreams(config.defaultRoom)
    .then(() => console.log("stopStreams resolved"))
    .catch((err) => console.error("stopStreams rejected", err));
  });
  //---------------------------------------------------
  const startSendStream = function(mediaOptions) {
    Demo.Skylink.sendStream(config.defaultRoom,mediaOptions);
  };

  $("#send_stream_btn").click(function() {
    const mediaOptions = {
      audio: { stereo: true },
      video: true,
    };

    if (Demo.Streams && Demo.Streams.userMedia) {
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

    if (Demo.Streams && Demo.Streams.userMedia) {
      Demo.Skylink.stopStreams(config.defaultRoom)
      .then(() => startSendStream(mediaOptions))
      .catch((err) => console.error("stopStreams rejected", err));
    } else {
      startSendStream(mediaOptions);
    }
  });
  //---------------------------------------------------
  $("#start_audio_btn").click(function() {
    const mediaOptions = {
      audio: { stereo: true },
      video: false,
    };

    if (Demo.Streams && Demo.Streams.userMedia) {
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
    Demo.Skylink.leaveRoom(config.defaultRoom)
    .then(() => {
      $('#join_room_panel').css("display", "block");
      $('#in_room_panel').css("display", "none");
      $('#presence_list_body').empty();
      Demo.Peers = 0;
      Demo.PeerIds = [];
    })
  });
  $('#restart_btn').click(function() {
    Demo.Skylink.refreshConnection(config.defaultRoom);
  });
  $('#message_btn').click(function() {
    for (let i = 0; i < 20; i += 1) {
      Demo.Skylink.sendMessage(config.defaultRoom, `message${i}`);
    }
  });
  $('#join_room_btn').click(function () {
    if (!$('#join_room_video').prop('checked')) {
      joinRoomOptions.video = false;
    }
    if (!$('#join_room_audio').prop('checked')) {
      joinRoomOptions.audio = false;
    }
    Demo.Skylink.joinRoom(joinRoomOptions);
    $('#join_room_panel').css("display", "none");
    $('#in_room_panel').css("display", "block");
  });
  $('#share_screen_btn').click(function () {
    Demo.Skylink.shareScreen(config.defaultRoom, true).then((stream) => {
      console.log('Screen share started: ', stream);
    });
  });
  $('#stop_screen_btn').click(function() {
    Demo.Skylink.stopScreen(config.defaultRoom);
  });
  $('#clear-console-log').click(() => {
    $('#console_log').find('li').remove();
  });

  $('#start_recording_btn').click(function() {
    Demo.Skylink.startRecording(config.defaultRoom)
    .then((recordingId) => {
      console.log('Recording started: ', recordingId);
    })
  });

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

  $('#stop_recording_btn').click(function() {
    Demo.Skylink.stopRecording(config.defaultRoom)
    .then((recordingId) => {
        console.log('Recording stopped: ', recordingId);
      });
    $('#peer_video_list').on('click', '.toggle-connstats', function() {
      $(this).parent().find('.connstats').slideToggle();
      $(this).attr('toggled', $(this).attr('toggled') ? '' : 'true');
      $(this).html($(this).attr('toggled') ? 'Hide Stats' : 'Show Stats');
    });
  });

  $('#get_logs_btn').click(function() {
    console.log(SkylinkLogger.getLogs());
    SkylinkLogger.clearLogs();
  });

  window.setSelectedSecret = dom => {
    var secretId = $(dom).attr('value');
    Demo.Skylink.setSelectedSecret(config.defaultRoom, secretId);
  };

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
  //
  // window.cancelTransfer = function (peerId, transferId) {
  //   if (Demo.TransfersDone[transferId][peerId]) {
  //     return;
  //   }
  //   Demo.Skylink.cancelDataTransfer(peerId, transferId);
  // };
  //
  $('#clear-selected-users').click(() => {
    $('#selected_users_panel .selected-users').html('');
    $('.select-user').each(function () {
      $(this)[0].checked = false;
    });
    $('#selected_users_panel .all').show();
    $('#selected_users_panel .all').show();
    selectedPeers = [];
  });
  //
  // if (window.webrtcDetectedBrowser === 'IE') {
  //   $('#file_list_panel').on('click', '.downloadfile', function () {
  //     var fileid = $(this).attr('fileid');
  //     window.navigator.msSaveBlob(Demo.Downloads[fileid].blob, Demo.Downloads[fileid].name);
  //   });
  // }
  //
  // if (window.webrtcDetectedBrowser === 'safari') {
  //   $('#file_list_panel .panel-heading').html( $('#file_list_panel .panel-heading').html() +
  //     '<small>For Safari, click to open a new tab. Note that only ' +
  //     'media and document files can be downloaded in the new tab.</small>');
  // }
});

var DemoSkylinkEventManager = SkylinkEventManager;
export { DemoSkylinkEventManager, SkylinkConstants };
