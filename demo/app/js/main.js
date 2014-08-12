/********************************************************
  API Settings
*********************************************************/
var Demo = Demo || {};
Demo.API = {
  apiKey: '5f874168-0079-46fc-ab9d-13931c2baa39',
  defaultRoom: 'default',
  room: 'test',
  files: [],
  FILE_SIZE_LIMIT: (1024 * 1024 * 200),
  peers: 0
};
Demo.Streams = {
  local: '',
  remote: []
};
Demo.Elements = {
  chatInput: '#chat_input',
  fileInput: '#file_input',
  updateUserInput: '#display_user_info',
  sendFileBtn: '#send_file_btn',
  updateUserBtn: '#update_user_info_btn',
  lockBtn: '#lock_btn',
  unlockBtn: '#unlock_btn',
  enableAudioBtn: '#enable_audio_btn',
  disableAudioBtn: '#disable_audio_btn',
  enableVideoBtn: '#enable_video_btn',
  disableVideoBtn: '#disable_video_btn',
  joinRoomBtn: '#join_room_btn',
  leaveRoomBtn: '#leave_room_btn',
  presencePanel: '#presence_panel',
  filePanel: '#file_panel',
  fileListPanel: '#file_list_panel',
  displayAppId: '#display_app_id',
  displayUserId: '#display_user_id',
  displayLockStatus: '#display_room_status',
  remoteVideo1: '#videoRemote1',
  remoteVideo2: '#videoRemote2',
  localVideo: '#local_video',
  channel: '#channel',
  channelStatus: '#channel_status',
  fileLog: '#file_log',
  fileBody: '#file_body',
  chatLog: '#chat_log',
  chatBody: '#chat_body'
};
Demo.API.displayMsg = function (nick, msg, isPvt, isFile) {
  var timestamp = new Date();
  var element = (isFile) ? Demo.Elements.fileLog : Demo.Elements.chatLog;
  var element_body = (isFile) ? Demo.Elements.fileBody : Demo.Elements.chatBody;
  $(element).append(
    '<div class="list-group-item active">' +
    '<p class="list-group-item-heading">' +
    '<b>' + nick + '</b>' +
    '<em title="' + timestamp.toString() + '">' + timestamp.getHours() +
    ':' + timestamp.getMinutes() + ':' + timestamp.getSeconds() +
    '</em></p>' +
    '<p class="list-group-item-text">' +
    (isPvt?'<i>[pvt msg] ':'') + msg + (isPvt?'</i>':'') +
    '</p></div>'
  );
  $(element_body).animate({
    scrollTop: $(Demo.Elements.chatBody).get(0).scrollHeight
  }, 500);
};
Demo.Skyway = new Skyway();
Demo.Skyway.init({
  apiKey: Demo.API.apiKey,
  defaultRoom: Demo.API.defaultRoom,
  room: Demo.API.room
});
/********************************************************
  Skyway Events
*********************************************************/
//---------------------------------------------------
Demo.Skyway.on('dataTransferState', function (state, transferId, peerId, transferInfo){
  transferInfo = transferInfo || {};
  var element = '#' + transferId;
  var name = transferInfo.name;
  var size = transferInfo.size;
  var senderPeerId = transferInfo.senderPeerId;
  var data = transferInfo.data;
  var percentage = transferInfo.percentage;

  switch (state) {
  case Demo.Skyway.DATA_TRANSFER_STATE.UPLOAD_STARTED :
    Demo.API.displayMsg(senderPeerId,
      '<p><u><b>' + name + '</b></u><br><em>' + size + ' Bytes</em></p>' +
      '<table id="' + transferId + '" class="table">' +
      '<thead><tr><th colspan="2"><span class="glyphicon glyphicon-saved">' +
      '</span> Uploaded Status</th></tr></thead>' +
      '<tbody></tbody></table>' +
      '<p><a id="'  + transferId + '_btn" class="btn btn-primary" ' +
      'href="' + data + '" style="display: block;" download="' + name +
      '">Download Uploaded File</a></p>',
      false, true);
    Demo.API.displayMsg(senderPeerId, 'I\'ve sent a File', false);
    break;
  case Demo.Skyway.DATA_TRANSFER_STATE.DOWNLOAD_STARTED :
    Demo.API.displayMsg(senderPeerId,
      '<p><u><b>' + name + '</b></u><br><em>' + size + ' Bytes</em></p>' +
      '<div class="progress progress-striped">' +
      '<div id="' + transferId + '" class="progress-bar ' +
      '" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"' +
      ' style="width: 0%">' +
      '<span>Downloading...</span></div></div>' +
      '<p><a id="'  + transferId + '_btn" class="btn btn-primary" ' +
      'href="#" style="display: none;" download="' + name + '">Download File</a></p>',
      false, true);
    Demo.API.displayMsg(senderPeerId, 'I\'ve sent you a File', false);
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
    Demo.API.displayMsg(peerId, 'Peer ' + peerId + ' has received your file "' + name + '"');
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
    alert('File for ' + transferInfo.type + ' failed to send. Reason: \n' +
      transferInfo.message);
  }
});
//---------------------------------------------------
Demo.Skyway.on('chatMessage', function (msg, peerId, isPvt) {
  Demo.API.displayMsg(peerId, msg, isPvt);
});
//---------------------------------------------------
Demo.Skyway.on('peerJoined', function (peerId, peerInfo, isSelf){
  console.info(peerInfo);
  if (isSelf) {
    $(Demo.Elements.displayUserId).html(peerId);
    $(Demo.Elements.joinRoom).hide();
    $(Demo.Elements.leaveRoomBtn).show();
    $(Demo.Elements.presencePanel).show();
    $(Demo.Elements.chatInput).removeAttr('disabled');
    // If not supportive of File, FileReader, Blob quit
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      $(Demo.Elements.filePanel).show();
      $(Demo.Elements.fileListPanel).show();
    }
  } else {
    Demo.API.displayMsg('System', 'Peer ' + peerId + ' joined the room');
    var newListEntry = '<tr id="user' + peerId + '" class="badQuality">' +
      '<td class="name">[' +
      ((peerInfo.mediaStatus.audioMuted) ? 'NA' : 'A') +
      '] ' + peerInfo.userData.displayName + '</td><td>';
    var titleList = [
      'Joined Room', 'Handshake: Welcome', 'Handshake: Offer',
      'Handshake: Answer', 'Candidate Generation state', 'ICE Connection state',
      'Peer Connection state', 'Data Channel Connection state'
    ];
    var glyphiconList = [
      'glyphicon-log-in', 'glyphicon-hand-right', 'glyphicon-hand-left',
      'glyphicon-thumbs-up', 'glyphicon-flash', 'glyphicon-magnet',
      'glyphicon-user', 'glyphicon-link'
    ];
    for( var i = 0; i < 8; i++) {
      newListEntry += '<span class="glyphicon ' + glyphiconList[i] + ' circle ' +
        i + '" title="' + titleList[i] + '"></span>&nbsp;&nbsp;&nbsp;';
    }
    newListEntry += '</td></tr>';
    $('#presence_list').append(newListEntry);
    $('#user' + peerId + ' .0').css('color','green');
  }
});
//---------------------------------------------------
Demo.Skyway.on('addPeerStream', function (peerId, stream){
  Demo.API.peers += 1;
  if( Demo.API.peers > 2 ){
    alert('We only support up to 2 streams in this demo');
    Demo.API.peers -= 1;
    return;
  }
  var videoElmnt = $(Demo.Elements.remoteVideo1)[0];
  if (videoElmnt.src.substring(0,4) === 'blob') {
    videoElmnt = $(Demo.Elements.remoteVideo2)[0];
  }
  videoElmnt.peerId = peerId;
  attachMediaStream(videoElmnt, stream);
  Demo.Streams.remote[peerId] = videoElmnt.src;
});
//---------------------------------------------------
Demo.Skyway.on('mediaAccessSuccess', function (stream){
  attachMediaStream( $(Demo.Elements.localVideo)[0], stream );
  Demo.Streams.local = $(Demo.Elements.localVideo)[0].src;
});
//---------------------------------------------------
Demo.Skyway.on('readyStateChange', function (state, error){
  console.info('State: ' + state);
  var statuses = ['Busy', 'Online', 'Away', 'Offline'];
  var username = 'user_' + Math.floor((Math.random() * 1000) + 1);
  var displayName = 'name_' + username;
  if(state === Demo.Skyway.READY_STATE_CHANGE.COMPLETED) {
    $(Demo.Elements.joinRoomBtn).show();
    Demo.Skyway.setUserData({
      displayName: displayName,
      username: username,
      email: username + '@demo.api.temasys.com.sg',
      metadata: {
        status: statuses[Math.floor((Math.random() * 3)) + 1],
        timeStamp: (new Date()).toISOString()
      }
    });
    Demo.Skyway.joinRoom({
      audio: { stereo: true },
      video: {
        res: Demo.Skyway.VIDEO_RESOLUTION.HD,
        frameRate: 50
      },
      bandwidth: {
        audio: 50,
        video: 256,
        data: 1638400
      }
    });
    $(Demo.Elements.updateUserInput).val(displayName);
    return;
  } else if (state === Demo.Skyway.READY_STATE_CHANGE.ERROR) {
    alert(error);
  }
  $(Demo.Elements.channelStatus).show();
});
//---------------------------------------------------
Demo.Skyway.on('peerLeft', function (peerId){
  Demo.API.displayMsg('System', 'Peer ' + peerId + ' has left the room');
  Demo.API.peers -= 1;
  $('video').each( function(){
    if(this.peerId === peerId){
      //this.poster  = '/default.png';
      this.src = '';
    }
  });
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
    case Demo.Skyway.CANDIDATE_GENERATION_STATE.DONE:
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
  var color = 'red', hasOffer = false;
  switch(state){
    case Demo.Skyway.PEER_CONNECTION_STATE.HAVE_LOCAL_OFFER:
    case Demo.Skyway.PEER_CONNECTION_STATE.HAVE_REMOTE_PRANSWER:
    case Demo.Skyway.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER:
    case Demo.Skyway.PEER_CONNECTION_STATE.HAVE_LOCAL_PRANSWER:
      color = 'orange';
      hasOffer = true;
      break;
    case Demo.Skyway.PEER_CONNECTION_STATE.CLOSED:
    case Demo.Skyway.PEER_CONNECTION_STATE.STABLE:
      color = 'red';
      break;
    case Demo.Skyway.PEER_CONNECTION_STATE.ESTABLISHED:
      color = 'green';
      break;
  }
  $('#user' + peerId + ' .6' ).css('color', color);
});
//---------------------------------------------------
Demo.Skyway.on('dataChannelState', function (state, peerId) {
  var color = 'red';
  switch (state) {
    case Demo.Skyway.DATA_CHANNEL_STATE.NEW:
    case Demo.Skyway.DATA_CHANNEL_STATE.ERROR:
      color = 'red';
      break;
    case Demo.Skyway.DATA_CHANNEL_STATE.LOADING:
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
    $(Demo.Elements.updateUserInput).val('[' +
      ((peerInfo.mediaStatus.audioMuted) ? 'NA' : 'A') + '] ' +
      peerInfo.userData.displayName);
    if (peerInfo.mediaStatus.videoMuted) {
      $(Demo.Elements.localVideo)[0].src = '';
    } else {
      $(Demo.Elements.localVideo)[0].src = Demo.Streams.local;
    }
  } else {
    $('#user' + peerId +' .name').html('[' + ((peerInfo.mediaStatus.audioMuted) ? 'NA' : 'A') +
      '] ' + peerInfo.userData.displayName);
    $('video').each( function(){
      if ($(this)[0].peerId === peerId) {
        if (peerInfo.mediaStatus.videoMuted) {
          $(this)[0].src = '';
        } else {
          $(this)[0].src = Demo.Streams.remote[peerId];
        }
      }
    });
  }
});
//---------------------------------------------------
Demo.Skyway.on('roomLock', function (status, isLocked, error) {
  if (!status) {
    alert(error);
  } else {
    $(Demo.Elements.displayLockStatus).html((isLocked) ? 'Locked' : 'Not Locked');
  }
});
//---------------------------------------------------
Demo.Skyway.on('channelOpen', function () {
  $(Demo.Elements.channel).css('color','green');
});
//---------------------------------------------------
Demo.Skyway.on('channelClose', function () {
  $(Demo.Elements.joinRoomBtn).show();
  $(Demo.Elements.leaveRoomBtn).hide();
  $(Demo.Elements.channel).css('color','red');
});
//---------------------------------------------------
Demo.Skyway.on('channelMessage', function (){
  $(Demo.Elements.channel).css('color','00FF00');
  setTimeout(function(){
    $(Demo.Elements.channel).css('color','green');
  },500);
});
//---------------------------------------------------
Demo.Skyway.on('channelError', function (error) {
  Demo.API.displayMsg('System', 'Channel Error:<br>' + error);
});
/********************************************************
  DOM Events
*********************************************************/
$(document).ready(function () {
  //---------------------------------------------------
  $(Demo.Elements.displayAppId).html(Demo.API.apiKey);
  //---------------------------------------------------
  $(Demo.Elements.chatInput).keyup(function(e) {
    e.preventDefault();
    if (e.keyCode === 13) {
      //Demo.Skyway.sendDataChannelChatMsg( $(Demo.Elements.chatInput).val() );
      Demo.Skyway.sendChatMsg( $(Demo.Elements.chatInput).val() );
      $(Demo.Elements.chatInput).val('');
    }
  });
  //---------------------------------------------------
  $(Demo.Elements.fileInput).change(function() {
    Demo.API.files = $(this)[0].files;
  });
  //---------------------------------------------------
  $(Demo.Elements.sendFileBtn).click(function() {
    if(!Demo.API.files) {
      alert('No Files selected');
      return;
    } else {
      if(Demo.API.files.length > 0) {
        $(Demo.API.files)[0].disabled = true;
        console.log('Button temporarily disabled to prevent crash');
      }
    }
    for(var i=0; i < Demo.API.files.length; i++) {
      var file = Demo.API.files[i];
      if(file.size <= Demo.API.FILE_SIZE_LIMIT) {
        Demo.Skyway.sendBlobData(file, {
          name : file.name,
          size : file.size
        });
        $(Demo.Elements.fileInput).val('');
      } else {
        alert('File "' + file.name + '"" exceeded the limit of 200MB.\n' +
          'We only currently support files up to 200MB for this demo.');
      }
    }
    $(Demo.Elements.sendFileBtn)[0].disabled = false;
  });
  //---------------------------------------------------
  $(Demo.Elements.updateUserBtn).click(function () {
    try {
      var displayName = $(Demo.Elements.updateUserInput).val();
      var userData = Demo.Skyway.getUserData();
      userData.userData.displayName = displayName;
      Demo.Skyway.setUserData(userData.userData);
    } catch (err) {
      alert('Invalid JSON provided');
    }
  });
  //---------------------------------------------------
  $(Demo.Elements.lockBtn).click(function () {
    Demo.Skyway.lockRoom();
  });
  //---------------------------------------------------
  $(Demo.Elements.unlockBtn).click(function () {
    Demo.Skyway.unlockRoom();
  });
  //---------------------------------------------------
  $(Demo.Elements.enableAudioBtn).click(function () {
    Demo.Skyway.enableAudio();
  });
  //---------------------------------------------------
  $(Demo.Elements.disableAudioBtn).click(function () {
    Demo.Skyway.disableAudio();
  });
  //---------------------------------------------------
  $(Demo.Elements.enableVideoBtn).click(function () {
    Demo.Skyway.enableVideo();
  });
  //---------------------------------------------------
  $(Demo.Elements.disableVideoBtn).click(function () {
    Demo.Skyway.disableVideo();
  });
});