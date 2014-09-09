/********************************************************
  API Settings
*********************************************************/
var Demo = Demo || {};
Demo.FILE_SIZE_LIMIT = 1024 * 1024 * 200;
Demo.Peers = 0;
Demo.Files = [];
Demo.Streams = [];
Demo.API.displayChatMessage = function (peerId, message, isFile) {
  var timestamp = new Date();
  var element = (isFile) ? '#file_log' : '#chat_log';
  var element_body = (isFile) ? '#file_body' : '#chat_body';
  $(element).append(
    '<div class="chat-item list-group-item active">' +
    '<p class="list-group-item-heading">' +
    '<b>' + peerId + '</b>' +
    '<em title="' + timestamp.toString() + '">' + timestamp.getHours() +
    ':' + timestamp.getMinutes() + ':' + timestamp.getSeconds() +
    '</em></p>' +
    '<p class="list-group-item-text">' +
    (message.isPrivate ? '<i>[pvt msg] ' : '') + message.content +
    (message.isPrivate ? '</i>' : '') +
    '</p></div>'
  );
  $(element_body).animate({
    scrollTop: $('#chat_body').get(0).scrollHeight
  }, 500);
};
Demo.Skyway = new Skyway();
Demo.Skyway.init({
  apiKey: Demo.API.apiKey,
  defaultRoom: Demo.API.defaultRoom || 'DEFAULT'
});
/********************************************************
  Skyway Events
*********************************************************/
//---------------------------------------------------
Demo.Skyway.on('dataTransferState', function (state, transferId, peerId, transferInfo, error){
  transferInfo = transferInfo || {};
  var element = '#' + transferId;
  var name = transferInfo.name;
  var size = transferInfo.size;
  var senderPeerId = transferInfo.senderPeerId;
  var data = transferInfo.data;
  if (data) {
    data = URL.createObjectURL(data);
  }
  var percentage = transferInfo.percentage;

  switch (state) {
  case Demo.Skyway.DATA_TRANSFER_STATE.UPLOAD_REQUEST :
    var result = confirm('Accept file "' + name + '" [size: ' + size + '] from ' + peerId + '?');
    Demo.Skyway.respondBlobRequest(peerId, result);
    break;
  case Demo.Skyway.DATA_TRANSFER_STATE.UPLOAD_STARTED :
    Demo.API.displayChatMessage(senderPeerId, {
      content: '<p><u><b>' + name + '</b></u><br><em>' + size + ' Bytes</em></p>' +
        '<table id="' + transferId + '" class="table">' +
        '<thead><tr><th colspan="2"><span class="glyphicon glyphicon-saved">' +
        '</span> Uploaded Status</th></tr></thead>' +
        '<tbody></tbody></table>' +
        '<p><a id="'  + transferId + '_btn" class="btn btn-default" ' +
        'href="' + data + '" style="display: block;" download="' + name +
        '">Download Uploaded File</a></p>'
      }, true);
    Demo.API.displayChatMessage(senderPeerId, 'I\'ve sent a File', false);
    break;
  case Demo.Skyway.DATA_TRANSFER_STATE.DOWNLOAD_STARTED :
    Demo.API.displayChatMessage(senderPeerId, {
      content: '<p><u><b>' + name + '</b></u><br><em>' + size + ' Bytes</em></p>' +
        '<div class="progress progress-striped">' +
        '<div id="' + transferId + '" class="progress-bar ' +
        '" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"' +
        ' style="width: 0%">' +
        '<span>Downloading...</span></div></div>' +
        '<p><a id="'  + transferId + '_btn" class="btn btn-default" ' +
        'href="#" style="display: none;" download="' + name + '">Download File</a></p>'
      }, true);
    Demo.API.displayChatMessage(senderPeerId, {
      content: 'I\'ve sent you a File'
    });
    break;
  case Demo.Skyway.DATA_TRANSFER_STATE.UPLOADING :
    if ($(element).find('.' + peerId).width() < 1) {
      $(element).append(
        '<tr><td>' + peerId + '</td><td class="' + peerId + '">' +
        percentage + '%</td></tr>');
    } else {
      $(element).find('.' + peerId).html(percentage + '%');
    }
    break;
  case Demo.Skyway.DATA_TRANSFER_STATE.DOWNLOADING :
    $(element).attr('aria-valuenow', percentage);
    $(element).css('width', percentage + '%');
    $(element).find('span').html(percentage + ' %');
    break;
  case Demo.Skyway.DATA_TRANSFER_STATE.UPLOAD_COMPLETED :
    Demo.API.displayChatMessage(peerId, {
      content: 'Peer ' + peerId + ' has received your file "' + name + '"'
    });
    $(element).find('.' + peerId).html('&#10003;');
    break;
  case Demo.Skyway.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED :
    // If completed, display download button
    $(element).parent().remove();
    $(element + '_btn').attr('href', data);
    $(element + '_btn').css('display', 'block');
    break;
  case Demo.Skyway.DATA_TRANSFER_STATE.REJECTED :
    alert('User "' + peerId + '" has rejected your file');
    break;
  case Demo.Skyway.DATA_TRANSFER_STATE.ERROR :
    alert('File for ' + error.transferType + ' failed to send. Reason: \n' +
      error.message);
  }
});
//---------------------------------------------------
Demo.Skyway.on('incomingMessage', function (message, peerId, peerInfo, isSelf) {
  if (message.isDataChannel) {
    message.content = message.content.header + ': ' + message.content.content;
  } else {
    message.content = message.content.content;
  }
  Demo.API.displayChatMessage((isSelf) ? 'You' :
    peerInfo.userData.displayName, message);
});
//---------------------------------------------------
Demo.Skyway.on('peerJoined', function (peerId, peerInfo, isSelf){
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
    Demo.API.displayChatMessage('System', {
      content: 'Peer ' + peerId + ' joined the room'
    });
    var newListEntry = '<tr id="user' + peerId + '" class="badQuality">' +
      '<td class="name">' + peerInfo.userData.displayName + '</td><td>';
    var titleList = [
      'Joined Room', 'Handshake: Welcome', 'Handshake: Offer',
      'Handshake: Answer', 'Candidate Generation state', 'ICE Connection state',
      'Peer Connection state', 'Data Channel Connection state',
      'MediaStream: Video', 'MediaStream: Audio'
    ];
    var glyphiconList = [
      'glyphicon-log-in', 'glyphicon-hand-right', 'glyphicon-hand-left',
      'glyphicon-thumbs-up', 'glyphicon-flash', 'glyphicon-magnet',
      'glyphicon-user', 'glyphicon-link', 'glyphicon-facetime-video video',
      'glyphicon-volume-up audio'
    ];
    for( var i = 0; i < 10; i++) {
      newListEntry += '<span class="glyphicon ' + glyphiconList[i] + ' circle ' +
        i + '" title="' + titleList[i] + '"></span>&nbsp;&nbsp;&nbsp;';
    }
    newListEntry += '</td></tr>';
    $('#presence_list').append(newListEntry);
    $('#user' + peerId + ' .0').css('color','green');
    $('#user' + peerId + ' .video').css('color',
      (peerInfo.mediaStatus.videoMuted) ? 'red' : 'green');
    $('#user' + peerId + ' .audio').css('color',
      (peerInfo.mediaStatus.audioMuted) ? 'red' : 'green');
  }
});
//---------------------------------------------------
Demo.Skyway.on('incomingStream', function (peerId, stream, isSelf){
  if (!isSelf) {
    Demo.Peers += 1;
  }
  var peerVideo = document.createElement('video');
  peerVideo.id = 'video' + peerId;
  peerVideo.className = 'col-md-6';
  peerVideo.autoplay = 'autoplay';
  $('#peer_video_list').append(peerVideo);
  attachMediaStream(peerVideo, stream);
  Demo.Streams[peerId] = peerVideo.src;
});
//---------------------------------------------------
Demo.Skyway.on('mediaAccessSuccess', function (stream){
  Demo.API.displayChatMessage('System', {
    content: 'Audio and video access is allowed.'
  });
});
//---------------------------------------------------
Demo.Skyway.on('mediaAccessError', function (stream){
  alert((typeof error === 'object') ? error.message :
    error);
  Demo.API.displayChatMessage('System', {
    content: 'Failed to join room as video and audio stream is required.'
  });
});
//---------------------------------------------------
Demo.Skyway.on('readyStateChange', function (state, error){
  var statuses = ['Busy', 'Online', 'Away', 'Offline'];
  var username = 'user_' + Math.floor((Math.random() * 1000) + 1);
  var displayName = 'name_' + username;
  if(state === Demo.Skyway.READY_STATE_CHANGE.COMPLETED) {
    Demo.Skyway.joinRoom({
      user: {
        displayName: displayName,
        username: username,
        email: username + '@demo.api.temasys.com.sg',
        metadata: {
          status: statuses[Math.floor((Math.random() * 3)) + 1],
          timeStamp: (new Date()).toISOString()
        }
      },
      audio: true,
      video: true
    });
    $('#display_user_info').val(displayName);
    return;
  } else if (state === Demo.Skyway.READY_STATE_CHANGE.ERROR) {
    for (var errorCode in Demo.Skyway.READY_STATE_CHANGE_ERROR) {
      if (Demo.Skyway.READY_STATE_CHANGE_ERROR[errorCode] ===
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
Demo.Skyway.on('peerLeft', function (peerId){
  Demo.API.displayChatMessage('System', {
    content: 'Peer ' + peerId + ' has left the room'
  });
  Demo.Peers -= 1;
  $('#video' + peerId).remove();
  $('#user' + peerId).remove();
});
//---------------------------------------------------
Demo.Skyway.on('handshakeProgress', function (state, peerId) {
  var stage = 0;
  console.log('[' + peerId + '] handshakeProgress: ' + state);
  switch( state ){
    case Demo.Skyway.HANDSHAKE_PROGRESS.WELCOME:
      stage = 1;
      break;
    case Demo.Skyway.HANDSHAKE_PROGRESS.OFFER:
      stage = 2;
      break;
    case Demo.Skyway.HANDSHAKE_PROGRESS.ANSWER:
      stage = 3;
      break;
  }
  for (var i=0; i<=stage; i++) {
    $('#user' + peerId + ' .' + i ).css('color', 'green');
  }
});
//---------------------------------------------------
Demo.Skyway.on('candidateGenerationState', function (state, peerId) {
  var color = 'orange';
  switch( state ){
    case Demo.Skyway.CANDIDATE_GENERATION_STATE.COMPLETED:
      color = 'green'; break;
  }
  $('#user' + peerId + ' .4' ).css('color', color);
});
//---------------------------------------------------
Demo.Skyway.on('iceConnectionState', function (state, peerId) {
  console.log('System: ' + peerId + ' - ' + state);
  var color = 'orange';
  switch(state){
    case Demo.Skyway.ICE_CONNECTION_STATE.STARTING:
    case Demo.Skyway.ICE_CONNECTION_STATE.CLOSED:
    case Demo.Skyway.ICE_CONNECTION_STATE.FAILED:
      color = 'red';
      break;
    case Demo.Skyway.ICE_CONNECTION_STATE.CHECKING:
    case Demo.Skyway.ICE_CONNECTION_STATE.DISCONNECTED:
      color = 'orange';
      break;
    case Demo.Skyway.ICE_CONNECTION_STATE.CONNECTED:
    case Demo.Skyway.ICE_CONNECTION_STATE.COMPLETED:
      color = 'green';
      break;
  }
  $('#user' + peerId + ' .5' ).css('color', color);

  if (state === Demo.Skyway.ICE_CONNECTION_STATE.CHECKING){
    setTimeout(function(){
      if ($('#user' + peerId + ' .5' ).css('color') === 'orange') {
        $('#user' + peerId).remove();
      }
    }, 30000);
  }
});
//---------------------------------------------------
Demo.Skyway.on('peerConnectionState', function (state, peerId) {
  var color = 'red';
  switch(state){
    case Demo.Skyway.PEER_CONNECTION_STATE.HAVE_LOCAL_OFFER:
    case Demo.Skyway.PEER_CONNECTION_STATE.HAVE_REMOTE_PRANSWER:
    case Demo.Skyway.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER:
    case Demo.Skyway.PEER_CONNECTION_STATE.HAVE_LOCAL_PRANSWER:
      color = 'orange';
      break;
    case Demo.Skyway.PEER_CONNECTION_STATE.CLOSED:
      color = 'red';
      break;
    case Demo.Skyway.PEER_CONNECTION_STATE.STABLE:
      color = 'green';
      break;
  }
  $('#user' + peerId + ' .6' ).css('color', color);
});
//---------------------------------------------------
Demo.Skyway.on('dataChannelState', function (state, peerId) {
  var color = 'red';
  switch (state) {
    case Demo.Skyway.DATA_CHANNEL_STATE.ERROR:
      color = 'red';
      break;
    case Demo.Skyway.DATA_CHANNEL_STATE.CONNECTING:
      color = 'orange';
      break;
    case Demo.Skyway.DATA_CHANNEL_STATE.OPEN:
      color = 'green';
      break;
  }
  $('#user' + peerId + ' .7' ).css('color', color);
});
//---------------------------------------------------
Demo.Skyway.on('peerUpdated', function (peerId, peerInfo, isSelf) {
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
    $('#user' + peerId + ' .name').html(peerInfo.userData.displayName);
  }
  if (peerInfo.mediaStatus.videoMuted) {
    $('#video' + peerId)[0].src = '';
  } else {
    $('#video' + peerId)[0].src = Demo.Streams[peerId];
  }
});
//---------------------------------------------------
Demo.Skyway.on('roomLock', function (isLocked, peerId, peerInfo, isSelf) {
  $('#display_room_status').html((isLocked) ? 'Locked' : 'Not Locked');
});
//---------------------------------------------------
Demo.Skyway.on('channelOpen', function () {
  $('#channel').css('color','green');
  $('#channel').html('Active');
});
//---------------------------------------------------
Demo.Skyway.on('channelClose', function () {
  $('#leave_room_btn').hide();
  $('#channel').css('color','red');
  $('#channel').html('Closed');
});
//---------------------------------------------------
Demo.Skyway.on('channelMessage', function (){
  $('#channel').css('color','00FF00');
  $('#channel').html('Connecting...');
  setTimeout(function () {
    $('#channel').css('color','green');
    $('#channel').html('Active');
  }, 1000);
});
//---------------------------------------------------
Demo.Skyway.on('channelError', function (error) {
  Demo.API.displayChatMessage('System', {
    content: 'Channel Error:<br>' + error
  });
});
//---------------------------------------------------
Demo.Skyway.on('mediaAccessError', function (error) {
  alert(error);
});
/********************************************************
  DOM Events
*********************************************************/
$(document).ready(function () {
  //---------------------------------------------------
  $('#display_app_id').html(Demo.API.apiKey);
  //---------------------------------------------------
  $('#chat_input').keyup(function(e) {
    e.preventDefault();
    if (e.keyCode === 13) {
      if ($('#send_data_channel').prop('checked')) {
        Demo.Skyway.sendP2PMessage({
          header: '[DC]',
          content: $('#chat_input').val()
        });
      } else {
        Demo.Skyway.sendMessage({
          content: $('#chat_input').val()
        });
      }
      $('#chat_input').val('');
    }
  });
  //---------------------------------------------------
  $('#file_input').change(function() {
    Demo.Files = $(this)[0].files;
  });
  //---------------------------------------------------
  $('#send_file_btn').click(function() {
    if(!Demo.Files) {
      alert('No Files selected');
      return;
    } else {
      if(Demo.Files.length > 0) {
        $(Demo.Files)[0].disabled = true;
        console.log('Button temporarily disabled to prevent crash');
      }
    }
    for(var i=0; i < Demo.Files.length; i++) {
      var file = Demo.Files[i];
      if(file.size <= Demo.FILE_SIZE_LIMIT) {
        Demo.Skyway.sendBlobData(file, {
          name : file.name,
          size : file.size
        });
        $('#file_input').val('');
      } else {
        alert('File "' + file.name + '"" exceeded the limit of 200MB.\n' +
          'We only currently support files up to 200MB for this demo.');
      }
    }
    $('#send_file_btn')[0].disabled = false;
  });
  //---------------------------------------------------
  $('#update_user_info_btn').click(function () {
    var displayName = $('#display_user_info').val();
    var userData = Demo.Skyway.getUserData();
    userData.displayName = displayName;
    Demo.Skyway.setUserData(userData);
  });
  //---------------------------------------------------
  $('#lock_btn').click(function () {
    Demo.Skyway.lockRoom();
  });
  //---------------------------------------------------
  $('#unlock_btn').click(function () {
    Demo.Skyway.unlockRoom();
  });
  //---------------------------------------------------
  $('#enable_audio_btn').click(function () {
    Demo.Skyway.enableAudio();
  });
  //---------------------------------------------------
  $('#disable_audio_btn').click(function () {
    Demo.Skyway.disableAudio();
  });
  //---------------------------------------------------
  $('#enable_video_btn').click(function () {
    Demo.Skyway.enableVideo();
  });
  //---------------------------------------------------
  $('#disable_video_btn').click(function () {
    Demo.Skyway.disableVideo();
  });
  //---------------------------------------------------
  $('#leave_room_btn').click(function () {
    Demo.Skyway.leaveRoom();
  });
});