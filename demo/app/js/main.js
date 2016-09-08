/********************************************************
  API Settings
*********************************************************/
var Demo = Demo || {};
Demo.FILE_SIZE_LIMIT = 1024 * 1024 * 200;
Demo.Peers = 0;
Demo.Files = [];
Demo.Streams = [];
Demo.Stats = {};
Demo.Methods = {};
Demo.Skylink = new Skylink();
Demo.ShowStats = {};

var _peerId = null;

var selectedPeers = [];

Demo.Skylink.setLogLevel(Demo.Skylink.LOG_LEVEL.DEBUG);

Demo.Methods.displayFileItemHTML = function(content) {
  return '<p>' + content.name + '<small style="float:right;color:#aaa;">' + content.size + ' B</small></p>' +
    ((content.isUpload) ? ('<table id="' + content.transferId + '" class="table upload-table">' +
      '<thead><tr><th colspan="2"><span class="glyphicon glyphicon-saved">' +
      '</span> Upload Status</th></tr></thead>' +
      '<tbody></tbody></table>') : ('<div class="progress progress-striped">' +
      '<div id="' + content.transferId + '" class="progress-bar ' +
      '" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"' +
      ' style="width: 0%"><span>Downloading...</span></div></div>')) +
    '<p><a id="' + content.transferId + '_btn" class="btn btn-default" ' +
    'href="' + content.data + '" style="display: ' + ((content.data.length > 1) ?
      'block' : 'none') + ';" download="' + content.name +
    '"><span class="glyphicon glyphicon-cloud-download"></span> <b>Download file</b></a></p>';
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

  return '<div class="chat-item list-group-item active">' +
    '<p class="list-group-item-heading">' + '<b>' + peerId + '</b>' +
    '<em title="' + timestamp.toString() + '">' + Hours +
    ':' + Minutes + ':' + Seconds +
    '</em></p>' + '<p class="list-group-item-text">' +
    (isPrivate ? '<i>[pvt msg] ' : '') + content +
    (isPrivate ? '</i>' : '') + '</p></div>';
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
    '<p><a id="recording_' + recordingId + '_btn" class="btn btn-default" ' +
    'href="" style="width:100%;margin:7px 0;display:none;" download="' + recordingId + '.mp4">' +
    '<span class="glyphicon glyphicon-cloud-download"></span> <b>Download Recording</b></a></p>' +
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

/********************************************************
  Skylink Events
*********************************************************/
//---------------------------------------------------
Demo.Skylink.on('incomingData', function(data, transferId, peerId, transferInfo, isSelf) {
  if (transferInfo.dataType !== 'blob') {
    //displayChatItemHTML = function (peerId, timestamp, content, isPrivate)
    Demo.Methods.displayChatMessage(peerId, '<img src="' + data + '">', false);
  }
});
Demo.Skylink.on('incomingDataRequest', function(transferId, peerId, transferInfo, isSelf) {
  if (!isSelf && transferInfo.dataType !== 'blob') {
    Demo.Skylink.acceptDataTransfer(peerId, transferId, true);
  }
})
Demo.Skylink.on('dataTransferState', function(state, transferId, peerId, transferInfo, error) {
  transferInfo = transferInfo || {};

  if (transferInfo.dataType !== 'blob') {
    return;
  }

  switch (state) {
    case Demo.Skylink.DATA_TRANSFER_STATE.UPLOAD_REQUEST:
      var result = confirm('Accept file "' + transferInfo.name +
        '" from ' + peerId + '?\n\n[size: ' + transferInfo.size + ']');
      Demo.Skylink.acceptDataTransfer(peerId, transferId, result);
      break;
    case Demo.Skylink.DATA_TRANSFER_STATE.UPLOAD_STARTED:
      var displayName = Demo.Skylink.getUserData();
      transferInfo.transferId = transferId;
      transferInfo.isUpload = true;
      transferInfo.data = URL.createObjectURL(transferInfo.data);
      Demo.Methods.displayChatMessage(displayName, transferInfo);
      Demo.Methods.displayChatMessage(displayName, 'File sent: ' + transferInfo.name);
      break;
    case Demo.Skylink.DATA_TRANSFER_STATE.DOWNLOAD_STARTED:
      var displayName = Demo.Skylink.getPeerInfo(transferInfo.senderPeerId).userData;
      transferInfo.transferId = transferId;
      transferInfo.data = '#';
      transferInfo.isUpload = false;
      Demo.Methods.displayChatMessage(displayName, transferInfo);
      Demo.Methods.displayChatMessage(displayName, 'File sent: ' + transferInfo.name);
      break;
    case Demo.Skylink.DATA_TRANSFER_STATE.UPLOADING:
      var displayName = Demo.Skylink.getPeerInfo(peerId).userData;
      if ($('#' + transferId).find('.' + peerId).width() < 1) {
        $('#' + transferId).append('<tr><td>' + displayName +
          '</td><td class="' + peerId + '">' + transferInfo.percentage + '%</td></tr>');
      } else {
        $('#' + transferId).find('.' + peerId).html(transferInfo.percentage + '%');
      }
      break;
    case Demo.Skylink.DATA_TRANSFER_STATE.DOWNLOADING:
      $('#' + transferId).attr('aria-valuenow', transferInfo.percentage);
      $('#' + transferId).css('width', transferInfo.percentage + '%');
      $('#' + transferId).find('span').html(transferInfo.percentage + ' %');
      break;
    case Demo.Skylink.DATA_TRANSFER_STATE.UPLOAD_COMPLETED:
      var displayName = Demo.Skylink.getPeerInfo(peerId).userData;
      Demo.Methods.displayChatMessage(displayName, 'File received: ' + transferInfo.name);
      $('#' + transferId).find('.' + peerId).html('&#10003;');
      break;
    case Demo.Skylink.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED:
      // If completed, display download button
      var displayName = Demo.Skylink.getPeerInfo(peerId).userData;
      $('#' + transferId).parent().remove();
      $('#' + transferId + '_btn').attr('href', URL.createObjectURL(transferInfo.data));
      $('#' + transferId + '_btn').css('display', 'block');
      Demo.Methods.displayChatMessage(displayName, 'File received: ' + transferInfo.name);
      break;
    case Demo.Skylink.DATA_TRANSFER_STATE.REJECTED:
      alert('User "' + peerId + '" has rejected your file');
      break;
    case Demo.Skylink.DATA_TRANSFER_STATE.ERROR:
      alert(error.transferType + ' failed. Reason: \n' +
        error.message);
      $('#' + transferId).parent().removeClass('progress-bar-info');
      $('#' + transferId).parent().addClass('progress-bar-danger');
      break;
    case Demo.Skylink.DATA_TRANSFER_STATE.CANCEL:
      alert(error.transferType + ' canceled. Reason: \n' +
        error.message);
      $('#' + transferId).parent().removeClass('progress-bar-info');
      $('#' + transferId).parent().addClass('progress-bar-danger');
  }
});
//---------------------------------------------------
Demo.Skylink.on('incomingMessage', function(message, peerId, peerInfo, isSelf) {
  Demo.Methods.displayChatMessage((isSelf) ? 'You' : peerInfo.userData,
    ((message.isDataChannel) ? 'P2P' : 'Socket') + ' -> ' + message.targetPeerId + ': ' +
    message.content, message.isPrivate);
});
//---------------------------------------------------
Demo.Skylink.on('peerRestart', function(peerId, peerInfo, isSelf) {
  if (isSelf) {
    $('#isAudioMuted').css('color',
      (peerInfo.mediaStatus.audioMuted) ? 'red' : 'green');
    $('#isVideoMuted').css('color',
      (peerInfo.mediaStatus.videoMuted) ? 'red' : 'green');
  } else {
    $('#user' + peerId + ' .video').css('color',
      (peerInfo.mediaStatus.videoMuted) ? 'red' : 'green');
    $('#user' + peerId + ' .audio').css('color',
      (peerInfo.mediaStatus.audioMuted) ? 'red' : 'green');
    $('#user' + peerId + ' .name').html(peerInfo.userData);
  }

  if ($('#video' + peerId).length > 0) {
    if (!peerInfo.settings.video && !peerInfo.settings.audio) {
      $('#video' + peerId + ' .video-obj').hide();
      if (Demo.Streams[peerId]) {
        delete Demo.Streams[peerId];
      }
      return;
    }

    if (peerInfo.settings.video && peerInfo.mediaStatus.videoMuted && Demo.Streams[peerId]) {
      attachMediaStream($('#video' + peerId + ' .video-obj')[0], Demo.Streams[peerId]);
    }
  }
});
//---------------------------------------------------
Demo.Skylink.on('peerJoined', function(peerId, peerInfo, isSelf) {
  if (isSelf) {
    $('#display_user_id').html(peerId);
    $('#isAudioMuted').css('color',
      (peerInfo.mediaStatus.audioMuted) ? 'red' : 'green');
    $('#isVideoMuted').css('color',
      (peerInfo.mediaStatus.videoMuted) ? 'red' : 'green');
    $('#leave_room_btn').show();
    $('#presence_panel').show();
    $('#chat_input').removeAttr('disabled');
    // If not supportive of File, FileReader, Blob quit
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      $('#file_panel').show();
      $('#file_list_panel').show();
    }
  } else {
    _peerId = peerId;
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
      (peerInfo.mediaStatus.videoMuted) ? 'red' : 'green');
    $('#user' + peerId + ' .audio').css('color',
      (peerInfo.mediaStatus.audioMuted) ? 'red' : 'green');
  }
});
//---------------------------------------------------
Demo.Skylink.on('incomingStream', function(peerId, stream, isSelf, peerInfo) {
  if (!isSelf) {
    Demo.Peers += 1;
  }
  var peerVideo;

  if ($('#video' + peerId).length === 0) {
    var peerElm = document.createElement('div');
    peerElm.id = 'video' + peerId;
    peerElm.className = 'col-md-6 peervideo';

    peerVideo = document.createElement('video');
    peerVideo.className = 'video-obj';

    if (window.webrtcDetectedBrowser !== 'IE') {
      peerVideo.autoplay = 'autoplay';
    }

    // mutes user's video
    if (isSelf && window.webrtcDetectedBrowser !== 'IE') {
      peerVideo.muted = 'muted';
    }

    $('#peer_video_list').append(peerElm);

    peerElm.appendChild(peerVideo);

    if (!isSelf) {
      $(peerElm).append('<div class="connstats-wrapper"><button class="toggle-connstats" data="' + peerId +
        '">See Stats</button><div class="row connstats">' +
        '<div class="agent row"><b class="col-md-12">Agent</b><p class="col-md-6">Name: <span class="upload">' +
          peerInfo.agent.name + (peerInfo.agent.os ? ' (' + peerInfo.agent.os + ')' : '') + '</span></p>' +
          '<p class="col-md-6">Version: <span class="download">' + peerInfo.agent.version + '</span></p></div>' +
        '<div class="audio row"><b class="col-md-12">Audio</b><p class="col-md-6">Uploading: <span class="upload"></span></p>' +
        '<p class="col-md-6">Downloading: <span class="download"></span></p></div>' +
        '<div class="video row"><b class="col-md-12">Video</b><p class="col-md-6">Uploading: <span class="upload"></span></p>' +
        '<p class="col-md-6">Downloading: <span class="download"></span></p></div>' +
        '<div class="candidate row"><b class="col-md-12">Selected Candidate</b><p class="col-md-6">Local: <span class="local"></span></p>' +
        '<p class="col-md-6">Remote: <span class="remote"></span></p></div></div></div>');
    }

  } else {
    peerVideo = $('video' + peerId + ' .video-obj')[0];
  }

  attachMediaStream(peerVideo, stream);
  Demo.Streams[peerId] = stream;
  $(peerVideo).show();

  if (isSelf) {
    $('#isAudioMuted').css('color',
      (peerInfo.mediaStatus.audioMuted) ? 'red' : 'green');
    $('#isVideoMuted').css('color',
      (peerInfo.mediaStatus.videoMuted) ? 'red' : 'green');
  } else {
    $('#user' + peerId + ' .video').css('color',
      (peerInfo.mediaStatus.videoMuted) ? 'red' : 'green');
    $('#user' + peerId + ' .audio').css('color',
      (peerInfo.mediaStatus.audioMuted) ? 'red' : 'green');
    $('#user' + peerId + ' .name').html(peerInfo.userData);
  }

  if ($('#video' + peerId + ' .video-obj').length > 0) {
    if (peerInfo.mediaStatus.videoMuted) {
      $('#video' + peerId + ' .video-obj')[0].src = '';
    } else {
      $('#video' + peerId + ' .video-obj')[0].src = Demo.Streams[peerId];
    }
  }

  // Handle when stream is after ICE connection is established (wat)
  if (Demo.ShowStats[peerId]) {
    $('#video' + peerId + ' .connstats-wrapper').show();
  }
});
//---------------------------------------------------
Demo.Skylink.on('mediaAccessSuccess', function(stream) {
  Demo.Methods.displayChatMessage('System', 'Audio and video access is allowed.');
});
//---------------------------------------------------
Demo.Skylink.on('mediaAccessError', function(error) {
  //alert((typeof error === 'object') ? error.message : error);
  Demo.Methods.displayChatMessage('System', 'Failed to join room as video and audio stream is required.');
});
//---------------------------------------------------
Demo.Skylink.on('systemAction', function (action, message, reason){
  //alert((typeof error === 'object') ? error.message : error);
  Demo.Methods.displayChatMessage('System', '(' + action + ' : ' + reason + ') ' + message);
});
//---------------------------------------------------
Demo.Skylink.on('readyStateChange', function (state, error){
  if (state === Demo.Skylink.READY_STATE_CHANGE.ERROR) {
    for (var errorCode in Demo.Skylink.READY_STATE_CHANGE_ERROR) {
      if (Demo.Skylink.READY_STATE_CHANGE_ERROR[errorCode] ===
        error.errorCode) {
        alert('An error occurred parsing and retrieving server code.\n' +
          'Error was: ' + errorCode);
        break;
      }
    }
  }
  $('#channel_status').show();
});
//---------------------------------------------------
Demo.Skylink.on('peerLeft', function (peerId, peerInfo, isSelf){
  Demo.Methods.displayChatMessage('System', 'Peer ' + peerId + ' has left the room');
  Demo.Peers -= 1;
  $('#video' + peerId).remove();
  $('#user' + peerId).remove();
  delete Demo.Streams[peerId];
  var index = selectedPeers.indexOf(peerId);

  if (index > -1) {
    selectedPeers.splice(index, 1);
  }

  delete Demo.Stats[peerId];
  delete Demo.ShowStats[peerId];
});

Demo.Skylink.on('sessionDisconnect', function (peerId, peerInfo){
  Demo.Skylink.joinRoom();
});

//---------------------------------------------------
Demo.Skylink.on('handshakeProgress', function(state, peerId) {
  var stage = 0;
  switch (state) {
    case Demo.Skylink.HANDSHAKE_PROGRESS.WELCOME:
      stage = 1;
      break;
    case Demo.Skylink.HANDSHAKE_PROGRESS.OFFER:
      stage = 2;
      break;
    case Demo.Skylink.HANDSHAKE_PROGRESS.ANSWER:
      stage = 3;
      break;
  }
  for (var i = 0; i <= stage; i++) {
    $('#user' + peerId + ' .' + i).css('color', 'green');
  }
});
//---------------------------------------------------
Demo.Skylink.on('candidateGenerationState', function(state, peerId) {
  var color = 'orange';
  switch (state) {
    case Demo.Skylink.CANDIDATE_GENERATION_STATE.COMPLETED:
      color = 'green';
      break;
  }
  $('#user' + peerId + ' .4').css('color', color);
});
//---------------------------------------------------
Demo.Skylink.on('iceConnectionState', function(state, peerId) {
  var color = 'orange';
  switch (state) {
    case Demo.Skylink.ICE_CONNECTION_STATE.STARTING:
    case Demo.Skylink.ICE_CONNECTION_STATE.CLOSED:
    case Demo.Skylink.ICE_CONNECTION_STATE.FAILED:
      color = 'red';
      break;
    case Demo.Skylink.ICE_CONNECTION_STATE.CHECKING:
    case Demo.Skylink.ICE_CONNECTION_STATE.DISCONNECTED:
      color = 'orange';
      break;
    case Demo.Skylink.ICE_CONNECTION_STATE.CONNECTED:
    case Demo.Skylink.ICE_CONNECTION_STATE.COMPLETED:
      color = 'green';
      $('#video' + peerId + ' .connstats-wrapper').show();
      Demo.ShowStats[peerId] = true;
      break;
    default:
      console.error('ICE State:', state, peerId);
  }
  $('#user' + peerId + ' .5').css('color', color);

  if (state === Demo.Skylink.ICE_CONNECTION_STATE.CHECKING) {
    setTimeout(function() {
      if ($('#user' + peerId + ' .5').css('color') === 'orange') {
        $('#user' + peerId).remove();
      }
    }, 30000);
  }
});
//---------------------------------------------------
Demo.Skylink.on('peerConnectionState', function(state, peerId) {
  var color = 'red';
  switch (state) {
    case Demo.Skylink.PEER_CONNECTION_STATE.HAVE_LOCAL_OFFER:
    case Demo.Skylink.PEER_CONNECTION_STATE.HAVE_REMOTE_PRANSWER:
    case Demo.Skylink.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER:
    case Demo.Skylink.PEER_CONNECTION_STATE.HAVE_LOCAL_PRANSWER:
      color = 'orange';
      break;
    case Demo.Skylink.PEER_CONNECTION_STATE.CLOSED:
      color = 'red';
      break;
    case Demo.Skylink.PEER_CONNECTION_STATE.STABLE:
      color = 'green';
      break;
  }
  $('#user' + peerId + ' .6').css('color', color);
});
//---------------------------------------------------
Demo.Skylink.on('dataChannelState', function(state, peerId, error, channelName, channelType) {
  if (channelType !== Demo.Skylink.DATA_CHANNEL_TYPE.MESSAGING) {
    return;
  }

  var color = 'red';
  switch (state) {
    case Demo.Skylink.DATA_CHANNEL_STATE.ERROR:
      color = 'red';
      break;
    case Demo.Skylink.DATA_CHANNEL_STATE.CONNECTING:
      color = 'orange';
      break;
    case Demo.Skylink.DATA_CHANNEL_STATE.OPEN:
      color = 'green';
      break;
  }
  $('#user' + peerId + ' .7').css('color', color);
});
//---------------------------------------------------
Demo.Skylink.on('peerUpdated', function(peerId, peerInfo, isSelf) {
  if (isSelf) {
    $('#isAudioMuted').css('color',
      (peerInfo.mediaStatus.audioMuted) ? 'red' : 'green');
    $('#isVideoMuted').css('color',
      (peerInfo.mediaStatus.videoMuted) ? 'red' : 'green');
  } else {
    $('#user' + peerId + ' .video').css('color',
      (peerInfo.mediaStatus.videoMuted) ? 'red' : 'green');
    $('#user' + peerId + ' .audio').css('color',
      (peerInfo.mediaStatus.audioMuted) ? 'red' : 'green');
    $('#user' + peerId + ' .name').html(peerInfo.userData);
  }

  if ($('#video' + peerId).length > 0) {
    if (!peerInfo.settings.video && !peerInfo.settings.audio) {
      $('#video' + peerId + ' .video-obj').hide();
      if (Demo.Streams[peerId]) {
        delete Demo.Streams[peerId];
      }
      return;
    }

    if (peerInfo.settings.video && peerInfo.mediaStatus.videoMuted && Demo.Streams[peerId]) {
      attachMediaStream($('#video' + peerId)[0], Demo.Streams[peerId]);
    }
  }
});
//---------------------------------------------------
Demo.Skylink.on('roomLock', function(isLocked, peerId, peerInfo, isSelf) {
  $('#display_room_status').html((isLocked) ? 'Locked' : 'Not Locked');
});
//---------------------------------------------------
Demo.Skylink.on('channelOpen', function() {
  $('#channel').css('color', 'green');
  $('#channel').html('Active');
});
//---------------------------------------------------
Demo.Skylink.on('channelClose', function() {
  $('#leave_room_btn').hide();
  $('#channel').css('color', 'red');
  $('#channel').html('Closed');
});
//---------------------------------------------------
Demo.Skylink.on('channelMessage', function() {
  $('#channel').css('color', '00FF00');
  $('#channel').html('Connecting...');
  setTimeout(function() {
    $('#channel').css('color', 'green');
    $('#channel').html('Active');
  }, 1000);
});
//---------------------------------------------------
Demo.Skylink.on('channelError', function(error) {
  Demo.Methods.displayChatMessage('System', 'Channel Error:<br>' + (error.message || error));
});
//---------------------------------------------------
Demo.Skylink.on('recordingState', function(state, recordingId, url, error) {
  console.info('recordingState', state, recordingId, url, error);

  switch (state) {
    case Demo.Skylink.RECORDING_STATE.START:
      Demo.Methods.displayRecordingSessionHTML(recordingId);
      break;
    case Demo.Skylink.RECORDING_STATE.STOP:
      $('#recording_' + recordingId + '_state_icon').attr('class', 'glyphicon glyphicon-refresh');
      $('#recording_' + recordingId + '_state').html('STOPPED / PROCESSING VIDEO');
      $('#recording_' + recordingId + '_error').html('');
      break;
    case Demo.Skylink.RECORDING_STATE.LINK:
      $('#recording_' + recordingId + '_state_icon').attr('class', 'glyphicon glyphicon-ok');
      $('#recording_' + recordingId + '_state').html('COMPLETED');
      $('#recording_' + recordingId + '_btn').attr('href', url).show();
      $('#recording_' + recordingId + '_error').html('');
      break;
    case Demo.Skylink.RECORDING_STATE.ERROR:
      $('#recording_' + recordingId + '_state_icon').attr('class', 'glyphicon glyphicon-warning-sign');
      $('#recording_' + recordingId + '_state').html('ERROR');
      $('#recording_' + recordingId + '_error').html('Recording session error:<br>' + (error.message || error.toString()));
  }
});

Demo.Skylink.on('getConnectionStatusStateChange', function (state, peerId, stats, error) {
  if (state === Demo.Skylink.GET_CONNECTION_STATUS_STATE.RETRIEVE_SUCCESS) {
    var statsElm = $('#video' + peerId).find('.connstats');
    var formatBitrate = function(val) {
      if (val < 1000) {
        return val + ' bps';
      } else if (val < 1000000) {
        return (val / 1000).toFixed(2) + ' kbps';
      } else {
        return (val / 1000000).toFixed(2) + ' mbps';
      }
    };

    $(statsElm).find('.audio .upload').html(formatBitrate(stats.audio.sending.bytes) + ' - Packets (' +
      stats.audio.sending.packets + ' sent, ' + stats.audio.sending.packetsLost + ' lost)');
    $(statsElm).find('.audio .download').html(formatBitrate(stats.audio.receiving.bytes) + ' - Packets (' +
      stats.audio.receiving.packets + ' received, ' + stats.audio.receiving.packetsLost + ' lost)');
    $(statsElm).find('.video .upload').html(formatBitrate(stats.video.sending.bytes) + ' - Packets (' +
      stats.video.sending.packets + ' sent, ' + stats.video.sending.packetsLost + ' lost)');
    $(statsElm).find('.video .download').html(formatBitrate(stats.video.receiving.bytes) + ' - Packets (' +
      stats.video.receiving.packets + ' received, ' + stats.video.receiving.packetsLost + ' lost)');
    $(statsElm).find('.candidate .local').html(stats.selectedCandidate.local.ipAddress + ':' +
      stats.selectedCandidate.local.portNumber + ' - (transport: ' + stats.selectedCandidate.local.transport +
      ', type: ' + stats.selectedCandidate.local.candidateType + ')');
    $(statsElm).find('.candidate .remote').html(stats.selectedCandidate.remote.ipAddress + ':' +
      stats.selectedCandidate.remote.portNumber + ' - (transport: ' + stats.selectedCandidate.remote.transport +
      ', type: ' + stats.selectedCandidate.remote.candidateType + ')');
  }
});

//------------- join room ---------------------------
var displayName = 'name_' + 'user_' + Math.floor((Math.random() * 1000) + 1);

Demo.Skylink.init(config, function(error, success) {
  if (success) {
    Demo.Skylink.joinRoom({
      userData: displayName,
      audio: { stereo: true },
      video: true
    });
  }
});

/********************************************************
  DOM Events
*********************************************************/
$(document).ready(function() {
  //---------------------------------------------------
  $('#display_app_id').html(config.appKey || config.apiKey || 'Not Provided');
  //---------------------------------------------------
  $('#chat_input').keyup(function(e) {
    e.preventDefault();
    if (e.keyCode === 13) {
      if ($('#send_data_channel').prop('checked')) {
        if (selectedPeers.length > 0) {
          Demo.Skylink.sendP2PMessage($('#chat_input').val(), selectedPeers);
        } else {
          Demo.Skylink.sendP2PMessage($('#chat_input').val());
        }
      } else {
        if (selectedPeers.length > 0) {
          Demo.Skylink.sendMessage($('#chat_input').val(), selectedPeers);
        } else {
          Demo.Skylink.sendMessage($('#chat_input').val());
        }
      }
      $('#chat_input').val('');
    }
  });
  //---------------------------------------------------
  $('#file_input').change(function() {
    Demo.Files = $(this)[0].files;
  });
  //---------------------------------------------------
  $('#dataURL_input').change(function() {
    Demo.DataURL = $(this)[0].files;
  });
  //---------------------------------------------------
  $('#send_file_btn').click(function() {
    if (!Demo.Files) {
      alert('No files selected');
      return;
    } else {
      if (Demo.Files.length > 0) {
        $(Demo.Files)[0].disabled = true;
        console.log('Button temporarily disabled to prevent crash');
      }
    }
    for (var i = 0; i < Demo.Files.length; i++) {
      var file = Demo.Files[i];
      if (file.size <= Demo.FILE_SIZE_LIMIT) {
        if (selectedPeers.length > 0) {
          Demo.Skylink.sendBlobData(file, selectedPeers);
        } else {
          Demo.Skylink.sendBlobData(file);
        }
        $('#file_input').val('');
      } else {
        alert('File "' + file.name + '"" exceeded the limit of 200MB.\n' +
          'We only currently support files up to 200MB for this demo.');
      }
    }
    $('#send_file_btn')[0].disabled = false;
  });
  //---------------------------------------------------
  $('#send_dataURL_btn').click(function() {
    if (!Demo.DataURL) {
      alert('No files selected');
      return;
    } else {
      if (Demo.Files.length > 0) {
        $(Demo.Files)[0].disabled = true;
        console.log('Button temporarily disabled to prevent crash');
      }
    }

    for (var i = 0; i < Demo.DataURL.length; i++) {
      var file = Demo.DataURL[i];

      var fr = new FileReader();

      fr.onload = function() {
        if (file.size <= 1024 * 1024 * 2) {
          if (selectedPeers.length > 0) {
            Demo.Skylink.sendURLData(fr.result, selectedPeers);
          } else {
            Demo.Skylink.sendURLData(fr.result);
          }
          $('#dataURL_input').val('');
        } else {
          alert('File "' + file.name + '"" exceeded the limit of 2MB.\n' +
            'We only currently support files up to 2MB for this demo.');
        }
      };

      fr.readAsDataURL(file);
    }
    $('#send_dataURL_btn')[0].disabled = false;
  });
  //---------------------------------------------------
  $('#update_user_info_btn').click(function() {
    Demo.Skylink.setUserData($('#display_user_info').val());
  });
  //---------------------------------------------------
  $('#lock_btn').click(function() {
    Demo.Skylink.lockRoom();
  });
  //---------------------------------------------------
  $('#unlock_btn').click(function() {
    Demo.Skylink.unlockRoom();
  });
  //---------------------------------------------------
  $('#enable_audio_btn').click(function() {
    Demo.Skylink.enableAudio();
  });
  //---------------------------------------------------
  $('#disable_audio_btn').click(function() {
    Demo.Skylink.disableAudio();
  });
  //---------------------------------------------------
  $('#stop_stream_btn').click(function() {
    Demo.Skylink.stopStream();
  });
  //---------------------------------------------------
  $('#enable_video_btn').click(function() {
    Demo.Skylink.enableVideo();
  });
  //---------------------------------------------------
  $('#disable_video_btn').click(function() {
    Demo.Skylink.disableVideo();
  });
  //---------------------------------------------------
  $('#leave_room_btn').click(function() {
    Demo.Skylink.leaveRoom();
  });
  $('#restart_btn').click(function() {
    Demo.Skylink.refreshConnection();
  });
  $('#message_btn').click(function() {
    for (var i = 0; i < 20; i++) {
      Demo.Skylink.sendMessage('message' + i);
    }
  });
  $('#share_screen_btn').click(function () {
    Demo.Skylink.shareScreen();
  });
  $('#stop_screen_btn').click(function() {
    Demo.Skylink.stopScreen();
  });
  $('#start_recording_btn').click(function() {
    Demo.Skylink.startRecording();
  });
  $('#peer_video_list').on('click', '.toggle-connstats', function () {
    $(this).parent().find('.connstats').slideToggle();
    $(this).attr('toggled', $(this).attr('toggled') ? '' : 'true');
    $(this).html($(this).attr('toggled') ? 'Hide Stats' : 'Show Stats');

    var peerId = $(this).attr('data');

    if ($(this).attr('toggled')) {
      Demo.Stats[peerId] = true;
      var test = setInterval(function () {
        if (Demo.Stats[peerId]) {
          Demo.Skylink.getConnectionStatus(peerId);
        } else {
          clearInterval(test);
        }
      }, 1000);
    } else {
      Demo.Stats[peerId] = false;
    }
  });
  $('#stop_recording_btn').click(function() {
    Demo.Skylink.stopRecording();
    $('#peer_video_list').on('click', '.toggle-connstats', function() {
      $(this).parent().find('.connstats').slideToggle();
      $(this).attr('toggled', $(this).attr('toggled') ? '' : 'true');
      $(this).html($(this).attr('toggled') ? 'Hide Stats' : 'Show Stats');
    });

    window.selectTargetPeer = function(dom) {
      var peerId = $(dom).attr('target');
      var panelDom = $('#selected_users_panel');

      if (!dom.checked) {
        $('#' + peerId + '-selected-user').remove();

        var index = selectedPeers.indexOf(peerId);

        if (index > -1) {
          selectedPeers.splice(index, 1);
        }

        if ($(panelDom).find('.selected-users em').length === 0) {
          $(panelDom).find('.all').show();
        }
      } else {
        $(panelDom).find('.selected-users').append('<em id="' +
          peerId + '-selected-user">Peer ' + peerId + '</em>');
        $(panelDom).find('.all').show();
        selectedPeers.push(peerId);
      }
    };

    $('#clear-selected-users').click(function() {
      $('#selected_users_panel .selected-users').html('');
      $('.select-user').each(function() {
        $(this)[0].checked = false
      });
      $('#selected_users_panel .all').show();
      selectedPeers = [];
    });
  });
});
