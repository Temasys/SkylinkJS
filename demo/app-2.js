function blink(){
  $('#channel').css('color','00FF00');
  setTimeout(function(){
    $('#channel').css('color','green');
  },500);
}
//--------
function addPeer(peer){
  var newListEntry = '<tr id="user' + peer.id + '" class="badQuality">' +
    '<td>' + peer.displayName + '</td><td>';
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
  $('#user' + peer.id + ' .0').css('color','green');
}
//--------
function rmPeer(peerID){
  $('#user' + peerID).remove();
}
//--------
function displayMsg (nick, msg, isPvt, isFile) {
  var timestamp = new Date();
  var element = (isFile) ? '#file_log' : '#chat_log';
  var element_body = (isFile) ? '#file_body' : '#chat_body';
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
    scrollTop: $('#chat_body').get(0).scrollHeight
  }, 500);
}
//--------------------
// GUI to API
//--------------------
$(document).ready(function () {
  $('#start_date_time').val((new Date()).toISOString());
  //---------------------------------------------------
  $('#init_btn').submit(function(e){
    var hash = CryptoJS.HmacSHA1($('#room').val() +
      '_' + $('#duration').val() + '_' +
      $('#start_date_time').val(), $('#secret').val()
    );
    var credential = encodeURIComponent(hash.toString(CryptoJS.enc.Base64));
    t.init(
      $('#room_server').val(),
      $('#app_id').val(),
      $('#room').val(),
      $('#start_date_time').val(),
      $('#duration').val(),
      credential,
      $('#region').val()
    );
    $('#display_room_server').html($('#room_server').val());
    $('#display_app_id').html($('#app_id').val());
    $('#display_room').html($('#room').val());
    $('#display_start_date_time').html($('#start_date_time').val());
    $('#display_duration').html($('#duration').val());
    $('#display_secret').html($('#secret').val());
    $('#display_credential').html(credential);
    $('#credential_panel').slideUp();
    return false;
  });
  //---------------------------------------------------
  $('#get_user_media_btn').click(function(e){
    console.log(window.webrtcDetectedBrowser);
    t.getDefaultStream();
  });
  //---------------------------------------------------
  $('#join_room_btn').click(function(e){
    t.joinRoom();
  });
  //---------------------------------------------------
  $('#leave_room_btn').click(function(e){
    t.leaveRoom();
  });
  //---------------------------------------------------
  $('#chat_input').keyup(function(e) {
    e.preventDefault();
    if (e.keyCode == 13) {
      t.sendChatMsg( $('#chat_input').val() );
      $('#chat_input').val('');
    }
  });
  //---------------------------------------------------
  $('#file_input').change(function() {
    window.files = $(this)[0].files;
    console.log('send_file_btn[input] - Files selected:');
    console.dir($(this)[0].files);
  });
  //---------------------------------------------------
  $('#send_file_btn').click(function() {
    if(!window.files) {
      console.log('send_file_btn - No Files selected');
      return;
    } else {
      console.log('send_file_btn - Files to send:');
      console.info('Length: ' + window.files.length);
      console.dir(window.files);
      if(window.files.length > 0) {
        $('#send_file_btn')[0].disabled = true;
        console.log('send_file_btn - Button temporarily disabled to prevent crash');
      }
    }
    var FILE_SIZE_LIMIT = 1024 * 1024 * 200;
    for(var i=0; i < window.files.length; i++) {
      var file = window.files[i];
      if(file.size <= FILE_SIZE_LIMIT) {
        t.sendFile(file);
        $('#file_input').val('');
      } else {
        console.error(
          'send_file_btn - [' + file.name + '] exceeded limit of 200MB.\nFile size: ' +
          (file.size/(1024 * 1024)) + ' MB'
        );
        alert(
          'File [' + file.name + '] exceeded the limit of 200MB.\n' +
          'We only currently support files up to 200MB for this demo.'
        );
      }
    }
    $('#send_file_btn')[0].disabled = false;
  });
});
//--------------------
// API to GUI
//--------------------
// get the variables needed to connect to skyway
var t = new Skyway();
/************************************************
  - OLD VERSION -
var roomserver = 'http://54.251.99.180:8080/';
var apikey = 'apitest';
var room  = null;
var t = new Skyway();
t.init(roomserver, apikey, room);
**************************************************/
//--------
t.on('channelOpen', function () {
  $('#channel').css('color','green');
});
//--------
t.on('channelClose', function () {
  $('#join_room_btn' ).show();
  $('#leave_room_btn' ).hide();
  $('#channel').css('color','red');
});
//--------
t.on('channelMessage', blink);
//--------
t.on('channelError', function (error) {
  displayMsg('System', 'Channel Error:<br>' + error);
});
//--------
t.on('joinedRoom', function (roomID, userID){
  displayMsg('System', 'You\'ve joined the room');
  $('#display_user_id').html(userID);
  $('#join_room_btn').hide();
  $('#leave_room_btn').show();
  $('#presence_panel').show();
  $('#chat_input').removeAttr('disabled');
  // If not supportive of File, FileReader, Blob quit
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    $('#file_panel').show();
    $('#file_list_panel').show();
  }
});
//--------
t.on('startDataTransfer', function (itemID, senderID, filename, filesize, type, data){
  var isSender = type === 'upload';
  displayMsg(senderID,
    '<p><u><b>' + filename + '</b></u><br><em>' + filesize + ' Bytes</em></p>' +
    ((isSender) ? ('<table id="' + itemID + '_u" class="table">' +
      '<thead><tr><th colspan="2"><span class="glyphicon glyphicon-saved"></span> Upload Status</th></tr></thead>' +
      '<tbody></tbody></table>') : '<div class="progress progress-striped active">' +
      '<div id="' + itemID + '_' + ((isSender)?'u':'d') + '" class="progress-bar ' +
      ((isSender) ? 'progress-bar' : 'progress-bar-success') +
      '" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">' +
      '<span>Downloading...</span></div></div>') +
    '<p><a id="'  + itemID + '_' +
    ((isSender)?'u_btn':'d_btn') + '" class="btn btn-primary" ' +
    'href="' + ((data) ? data : '#') + '" style="display: ' + ((data) ? 'block' : 'none') +
    ';" download="' + filename + '">Download</a></p>'
  , false, true);
  displayMsg(senderID, ((isSender) ? 'I\'ve sent a File' : 'I\'ve sent you a File'), false);
});
//--------
t.on('dataTransfer', function (itemID, type, percent, peerID, data){
  var percentage = percent.toFixed() * 100;
  var isSender = type === 'upload';
  var element = '#' + itemID + '_' + ((isSender) ? 'u' : 'd');
  // Receiver
  if (!isSender) {
    console.info('User Received Percentage: ' + percentage + '%');
    $(element).attr('aria-valuenow', percentage);
    $(element).css('width', percentage + '%');
    $(element).find('span').html(
      ((isSender) ? 'Uploading ' : 'Downloading ') +
      (percentage).toFixed() + ' %'
    );
    if (percentage == 100) {
      $(element).parent().remove();
      $(element + '_btn').attr('href', data);
      $(element + '_btn').css('display', 'block');
    }
  // Sender
  } else {
    console.info('User Upload Percentage: ' + percentage + '%');
    if ($(element).find('.' + peerID).width() < 1) {
      $(element).append(
        '<tr><td>' + peerID + '</td><td class="' + peerID + '">' +
        percentage + '%</td></tr>'
      );
    } else {
      $(element).find('.' + peerID).html(percentage + '%');
    }
  }
});
//--------
t.on('dataTransferCompleted', function (itemID, peerID){
  displayMsg(peerID, 'Peer ' + peerID + ' has received your file ' + itemID);
  $('#' + itemID + '_u').find('.' + peerID).html('&#10003;');
});
//--------
t.on('chatMessage', function (msg, nick, isPvt) {
  displayMsg(nick, msg, isPvt);
});
//--------
t.on('peerJoined', function (peerID){
  displayMsg('System', 'Peer ' + peerID + ' joined the room');
  addPeer({ id: peerID , displayName: peerID });
});
//--------
var nbPeers = 0;
t.on('addPeerStream', function (peerID, stream){
  nbPeers += 1;
  if( nbPeers > 2 ){
    alert('We only support up to 2 streams in this demo');
    nbPeers -= 1;
    return;
  }
  var videoElmnt = $('#videoRemote1')[0];
  if (videoElmnt.src.substring(0,4) === 'blob') {
    videoElmnt = $('#videoRemote2')[0];
  }
  videoElmnt.peerID = peerID;
  attachMediaStream(videoElmnt, stream);
  displayMsg('System', 'Peer ' + peerID + '\'s stream has been added');
});
//--------
t.on('mediaAccessSuccess', function (stream){
  displayMsg('System', 'Local Webcam stream received');
  attachMediaStream( $('#local_video')[0], stream );
  $('#get_user_media_btn').hide();
});
//--------
t.on('readyStateChange', function (state){
  if(state === t.READY_STATE_CHANGE.COMPLETED) {
    $('#join_room_btn').show();
    $('#get_user_media_btn').show();
    return;
  } else if (state == t.READY_STATE_CHANGE.APIERROR) {
    displayMsg('System', 'App ID or Roomserver provided is invalid');
    alert('App ID or Roomserver that is provided is wrong');
    $('#credential_panel').slideDown();
  }
  $('#channel_status').show();
});
//--------
t.on('peerLeft', function (peerID){
  displayMsg('System', 'Peer ' + peerID + ' has left the room');
  nbPeers -= 1;
  $('video').each( function(){
    if(this.peerID == peerID){
      //this.poster  = '/default.png';
      this.src = '';
    }
  });
  rmPeer(peerID);
});
//--------
t.on('handshakeProgress', function (state, peerID) {
  var stage = 0;
  console.log('[' + peerID + '] handshakeProgress: ' + state);
  switch( state ){
    case t.HANDSHAKE_PROGRESS.WELCOME:
      stage = 1;
      break;
    case t.HANDSHAKE_PROGRESS.OFFER:
      stage = 2;
      break;
    case t.HANDSHAKE_PROGRESS.ANSWER:
      stage = 3;
      break;
  }
  for (var i=0; i<=stage; i++) {
    $('#user' + peerID + ' .' + i ).css('color', 'green');
  }
});
//--------
t.on('candidateGenerationState', function (state, peerID) {
  var color = 'orange';
  switch( state ){
    case t.CANDIDATE_GENERATION_STATE.DONE:
      color = 'green'; break;
  }
  $('#user' + peerID + ' .4' ).css('color', color);
});
//--------
t.on('iceConnectionState', function (state, peerID) {
  console.log('System: ' + peerID + ' - ' + state);
  var color = 'orange';
  switch(state){
    case t.ICE_CONNECTION_STATE.STARTING:
    case t.ICE_CONNECTION_STATE.CLOSED:
    case t.ICE_CONNECTION_STATE.FAILED:
      color = 'red';
      break;
    case t.ICE_CONNECTION_STATE.CHECKING:
    case t.ICE_CONNECTION_STATE.DISCONNECTED:
      color = 'orange';
      break;
    case t.ICE_CONNECTION_STATE.CONNECTED:
    case t.ICE_CONNECTION_STATE.COMPLETED:
      color = 'green';
      break;
  }
  $('#user' + peerID + ' .5' ).css('color', color);

  if (state === t.ICE_CONNECTION_STATE.CHECKING){
    setTimeout(function(){
      if ($('#user' + peerID + ' .5' ).css('color') === 'orange') {
        rmPeer(peerID);
      }
    }, 30000);
  }
});
//--------
t.on('peerConnectionState', function (state, peerID) {
  var color = 'red', hasOffer = false;
  switch(state){
    case t.PEER_CONNECTION_STATE.HAVE_LOCAL_OFFER:
    case t.PEER_CONNECTION_STATE.HAVE_REMOTE_PRANSWER:
    case t.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER:
    case t.PEER_CONNECTION_STATE.HAVE_LOCAL_PRANSWER:
      color = 'orange';
      hasOffer = true;
      break;
    case t.PEER_CONNECTION_STATE.CLOSED:
    case t.PEER_CONNECTION_STATE.STABLE:
      color = 'red';
      break;
    case t.PEER_CONNECTION_STATE.ESTABLISHED:
      color = 'green';
      break;
  }
  $('#user' + peerID + ' .6' ).css('color', color);
});
//--------
t.on('dataChannelState', function (state, peerID, initialDC) {
  if (initialDC) {
    var color = 'red';
    switch (state) {
      case t.DATA_CHANNEL_STATE.NEW:
      case t.DATA_CHANNEL_STATE.ERROR:
        color = 'red';
        break;
      case t.DATA_CHANNEL_STATE.LOADING:
        color = 'orange';
        break;
      case t.DATA_CHANNEL_STATE.OPEN:
        color = 'green';
        break;
    }
    $('#user' + peerID + ' .7' ).css('color', color);
  }
});