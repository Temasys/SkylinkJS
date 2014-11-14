/********************************************************
  API Settings
*********************************************************/
var Demo = Demo || {};
Demo.FILE_SIZE_LIMIT = 1024 * 1024 * 200;
Demo.FilesPublic=[];
Demo.Files = {};
Demo.Streams = [];
Demo.Methods = {};
Demo.mainPrinter;

function Printer(canvas)
{
  var that = this;
  canvas.height = canvas.width *3/4; 
  that.printContext = canvas.getContext('2d');
  that.width = canvas.width;
  that.height = canvas.height;
  that.source;
  that.imageObj = new Image();

  that.imageObj.onload = function()
  {
    setInterval(that.print,50);
  };
  that.imageObj.src = 'img/no_profile.jpg';
  that.leave = function(elmt)
  {
    if(that.source === elmt)
    {
      that.source = null;
    }
  };
  that.changeSource = function(elmt)
  {
    if(elmt != undefined)
    {
      that.source = elmt;
    }
  };
  that.print = function()
  {
    var s = that.source || that.imageObj;
    that.printContext.drawImage(s,0,0,that.width,that.height);
  };
}

Demo.Methods.displayFileItemHTML = function (content)
{
  return '<p>' + content.name + '<small style="float:right;color:#aaa;margin-right:10px;">' + content.size + ' B</small></p>' +
    ((content.isUpload) ? ('<table id="' + content.transferId + '" class="table upload-table">' +
    '<thead><tr><th colspan="2"><span class="glyphicon glyphicon-saved">' +
    '</span> Uploaded Status</th></tr></thead>' +
    '<tbody></tbody></table>') : ('<div class="progress progress-striped">' +
    '<div id="' + content.transferId + '" class="progress-bar ' +
    '" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"' +
    ' style="width: 0%"><span>Downloading...</span></div></div>')) +
    '<p><a id="'  + content.transferId + '_btn" class="btn btn-default" ' +
    'href="' + content.data + '" style="display: ' + ((content.data.length > 1) ?
    'block' : 'none') + ';" download="' + content.name +
    '"><span class="glyphicon glyphicon-cloud-download"></span> <b>Download file</b></a></p>';
};

Demo.Methods.displayChatItemHTML = function (peerId, timestamp, content, isPrivate) {
  return '<div class="chat-item list-group-item active">' +
    '<p class="list-group-item-heading">' + '<b>' + peerId + '</b>' +
    '<em title="' + timestamp.toString() + '">' + timestamp.getHours() +
    ':' + timestamp.getMinutes() + ':' + timestamp.getSeconds() +
    '</em></p>' + '<p class="list-group-item-text">' +
    (isPrivate ? '<i>[Private] ' : '') + content +
    (isPrivate ? '</i>' : '') + '</p></div>';
};

Demo.Methods.displayChatMessage = function (peerId, content, isPrivate) {
  var timestamp = new Date();
  var isFile = typeof content === 'object';
  console.info("isFile?:",isFile);
  var element = (isFile) ? '#file_log' : '#chat_log';
  var element_body = (isFile) ? '#file_body' : '#chat_body';
  if (isFile) {
    content = Demo.Methods.displayFileItemHTML(content);
  }
  $(element).append(Demo.Methods.displayChatItemHTML(peerId,timestamp, content, isPrivate));
  $(element_body).animate({
    scrollTop: $('#chat_body').get(0).scrollHeight
  }, 500);
};

/********************************************************
  Skylink Events
*********************************************************/
Demo.Skylink = new Skylink();
Demo.Skylink.setLogLevel(Demo.Skylink.LOG_LEVEL.WARN);
Demo.Skylink.init({
  apiKey: Demo.API.apiKey,
  defaultRoom: Demo.API.defaultRoom || 'DEFAULT'
});
//---------------------------------------------------
Demo.Skylink.on('dataTransferState', function (state, transferId, peerId, transferInfo, error)
{
  console.log("Data Transfer State:",state);
  transferInfo = transferInfo || {};
  switch (state) 
  {
  case Demo.Skylink.DATA_TRANSFER_STATE.UPLOAD_REQUEST :
    var result = confirm('Accept file "' + transferInfo.name +
      '" from ' + peerId + '?\n\n[size: ' + transferInfo.size + ']');
    Demo.Skylink.respondBlobRequest(peerId, result);
    break;
  case Demo.Skylink.DATA_TRANSFER_STATE.UPLOAD_STARTED :
    var displayName = Demo.Skylink.getUserData();
    transferInfo.transferId = transferId;
    transferInfo.isUpload = true;
    transferInfo.data = URL.createObjectURL(transferInfo.data);
    Demo.Methods.displayChatMessage(displayName, transferInfo);
    break;
  case Demo.Skylink.DATA_TRANSFER_STATE.DOWNLOAD_STARTED :
    var displayName = Demo.Skylink.getPeerInfo(transferInfo.senderPeerId).userData;
    transferInfo.transferId = transferId;
    transferInfo.data = '#';
    transferInfo.isUpload = false;
    Demo.Methods.displayChatMessage(displayName, transferInfo);
    break;
  case Demo.Skylink.DATA_TRANSFER_STATE.UPLOADING :
    var displayName = Demo.Skylink.getPeerInfo(peerId).userData;
    if ($('#' + transferId).find('.' + peerId).width() < 1) {
      $('#' + transferId).append('<tr><td>' + displayName +
        '</td><td class="' + peerId + '">' + transferInfo.percentage + '%</td></tr>');
    } else {
      $('#' + transferId).find('.' + peerId).html(transferInfo.percentage + '%');
    }
    break;
  case Demo.Skylink.DATA_TRANSFER_STATE.DOWNLOADING :
    $('#' + transferId).attr('aria-valuenow', transferInfo.percentage);
    $('#' + transferId).css('width', transferInfo.percentage + '%');
    $('#' + transferId).find('span').html(transferInfo.percentage + ' %');
    break;
  case Demo.Skylink.DATA_TRANSFER_STATE.UPLOAD_COMPLETED :
    var displayName = Demo.Skylink.getPeerInfo(peerId).userData;
    $('#' + transferId).find('.' + peerId).html('&#10003;');
    break;
  case Demo.Skylink.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED :
    // If completed, display download button
    var displayName = Demo.Skylink.getPeerInfo(peerId).userData;
    $('#' + transferId).parent().remove();
    $('#' + transferId + '_btn').attr('href', URL.createObjectURL(transferInfo.data));
    $('#' + transferId + '_btn').css('display', 'block');
    break;
  case Demo.Skylink.DATA_TRANSFER_STATE.REJECTED :
    break;
  case Demo.Skylink.DATA_TRANSFER_STATE.ERROR :
    alert(error.transferType + ' failed. Reason: \n' +
      error.message);
    $('#' + transferId).parent().removeClass('progress-bar-info');
    $('#' + transferId).parent().addClass('progress-bar-danger');
    break;
  case Demo.Skylink.DATA_TRANSFER_STATE.CANCEL :
    alert(error.transferType + ' canceled. Reason: \n' +
      error.message);
    $('#' + transferId).parent().removeClass('progress-bar-info');
    $('#' + transferId).parent().addClass('progress-bar-danger');
  }
});
//---------------------------------------------------
Demo.Skylink.on('incomingMessage', function (message, peerId, peerInfo, isSelf)
{
  Demo.Methods.displayChatMessage((isSelf) ? 'You' : peerInfo.userData,
    ((message.isDataChannel) ? '[Data]' : '') + message.content, message.isPrivate);
});

Demo.Skylink.on('peerJoined', function (peerId, peerInfo, isSelf)
{
  if (isSelf)
    $('#title_self').append(" ("+peerInfo.userData+")");
});
//---------------------------------------------------
Demo.Skylink.on('incomingStream', function (stream, peerId, peerInfo, isSelf)
{
  if (isSelf) {
    return;
  }
  $('#peers_list').append('<div id="user_'+peerId+'" class="col-md-4 user center">'+
        '<h3>'+peerInfo.userData+'</h3>'+
        '<div id="media_'+peerId+'">'+
          '<img id="picture_'+peerId+'" src="img/no_profile.jpg" alt="You" style="width:100%;">'+
        '</div>'+
        '<button id="focus_'+peerId+'" class="btn btn-default" title="Focus" type="button">'+
          '<span class="glyphicon glyphicon glyphicon-arrow-up"></span><b> Focus</b>'+
        '</button>'+
        '<form role="form">'+
          '<div class="checkbox">'+
            '<label>'+
              '<input id="send_data_channel_'+peerId+'" type="checkbox">'+
              '<b>Send private via Data Channel</b> <span class="glyphicon glyphicon-transfer"></span> </label>'+
          '</div>'+
        '</form>'+
        '<textarea id="chat_input_'+peerId+'" class="chat_input well" placeholder="Enter your private chat message here"></textarea>'+
        '<br>'+
        '<div id="file_panel">'+
          '<div class="input-group">'+
            '<input type="file" class="form-control" title="Select a file to upload" id="file_input_'+peerId+'">'+
            '<span class="input-group-btn">'+
              '<button id="send_file_'+peerId+'" class="btn btn-default" title="Upload file" type="button">'+
                '<span class="glyphicon glyphicon-cloud-upload"></span><b>Upload file</b>'+
              '</button> </span>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>');
    
  //---------------------------------------------------
  //Buttons
  $('#focus_'+peerId).click(function (){
    Demo.mainPrinter.changeSource(document.querySelector('#video_'+peerId));
  });
  $('#chat_input_'+peerId).keyup(function(e)
  {
    e.preventDefault();
    if (e.keyCode === 13)
    {
      if ($('#send_data_channel_'+peerId).prop('checked'))
      {
        Demo.Skylink.sendP2PMessage($('#chat_input_'+peerId).val(),peerId);
      } else {
        Demo.Skylink.sendMessage($('#chat_input_'+peerId).val(),peerId);
      }
      $('#chat_input_'+peerId).val('');
    }
  });
  $('#file_input_'+peerId).change(function()
  {
    console.log("Choose file");
    Demo.Files[peerId] = $(this)[0].files;
  });
  $('#send_file_'+peerId).click(function()
  {
    if(!Demo.Files[peerId])
    {
      alert('No files selected');
      return;
    } 
    else 
    {
      if(Demo.Files[peerId].length > 0)
        $(Demo.Files[peerId])[0].disabled = true;
    }
    for(var i=0; i < Demo.Files[peerId].length; i++)
    {
      var file = Demo.Files[peerId][i];
      if(file.size <= Demo.FILE_SIZE_LIMIT)
      {
        Demo.Skylink.sendBlobData(file,
          {
          name : file.name,
          size : file.size
        },peerId);
        $('#file_input_'+peerId).val('');
      } else
      {
        alert('File "' + file.name + '"" exceeded the limit of 200MB.\n' +
          'We only currently support files up to 200MB for this demo');
      }
    }
    $('#send_file_'+peerId)[0].disabled = false;
  });
  
  //Video
  var peerVideo = document.createElement('video');
  peerVideo.id = 'video_'+peerId;
  peerVideo.style.cssText = "width:100%;";
  peerVideo.autoplay = 'autoplay';
  $('#media_'+peerId).append(peerVideo);
  attachMediaStream(peerVideo, stream);
  $('#picture_'+peerId).remove();
  Demo.mainPrinter.changeSource(document.querySelector('#video_'+peerId));
});
//---------------------------------------------------
Demo.Skylink.on('mediaAccessSuccess', function (stream)
{
  var ownerVideo = document.createElement('video');
  ownerVideo.id = 'video_self';
  ownerVideo.style.cssText = "width:100%;";
  ownerVideo.autoplay = 'autoplay';
  $('#media_self').append(ownerVideo);
  attachMediaStream(ownerVideo, stream);
  $('#picture_self').remove();
  Demo.mainPrinter.changeSource(document.querySelector('#video_self'));
});


//---------------------------------------------------
Demo.Skylink.on('mediaAccessError', function (stream){
  alert((typeof error === 'object') ? error.message : error);
  Demo.Methods.displayChatMessage('System', 'Failed to join room as video and audio stream is required.');
});
//---------------------------------------------------
Demo.Skylink.on('readyStateChange', function (state, error){
  if(state === Demo.Skylink.READY_STATE_CHANGE.COMPLETED)
  {
    var displayName = 'User ' + Math.floor((Math.random() * 1000) + 1);
    Demo.Skylink.joinRoom({
      userData: displayName,
      audio: true,
      video: true
    });
  } else if (state === Demo.Skylink.READY_STATE_CHANGE.ERROR)
  {
    alert('An error occurred parsing and retrieving server code.\n' +
      'Error was: ' + errorCode);
  }
});
//---------------------------------------------------
Demo.Skylink.on('peerLeft', function (peerId)
{
  Demo.mainPrinter.leave(document.querySelector('#video_'+peerId));
  $('#user_'+peerId).remove();
});


//---------------------------------------------------
Demo.Skylink.on('channelError', function (error) {
  Demo.Methods.displayChatMessage('System', 'Channel Error:<br>' + (error.message || error));
});
//---------------------------------------------------
Demo.Skylink.on('mediaAccessError', function (error) {
  alert((error.message || error));
});
/********************************************************
  DOM Events
*********************************************************/
$(document).ready(function ()
{
  //Main Media setting
  Demo.mainPrinter = new Printer(document.getElementById('media_main'));
  $('#focus_self').click(function () {
    Demo.mainPrinter.changeSource(document.querySelector('#video_self'));
  });
  
  //---------------------------------------------------
  //Public Chat
  $('#chat_input_public').keyup(function(e)
  {
    e.preventDefault();
    if (e.keyCode === 13)
    {
      if ($('#send_data_channel_public').prop('checked'))
      {
        Demo.Skylink.sendP2PMessage($('#chat_input_public').val());
      } else {
        Demo.Skylink.sendMessage($('#chat_input_public').val());
      }
      $('#chat_input_public').val('');
    }
  });
  //---------------------------------------------------
  //Public File transfer
  $('#file_input_public').change(function() {
    Demo.FilesPublic = $(this)[0].files;
  });
  //---------------------------------------------------
  $('#send_file_public').click(function()
  {
    if(!Demo.FilesPublic)
    {
      alert('No files selected');
      return;
    } 
    else 
    {
      if(Demo.FilesPublic.length > 0)
        $(Demo.FilesPublic)[0].disabled = true;
    }
    for(var i=0; i < Demo.FilesPublic.length; i++)
    {
      var file = Demo.FilesPublic[i];
      if(file.size <= Demo.FILE_SIZE_LIMIT)
      {
        Demo.Skylink.sendBlobData(file,
          {
          name : file.name,
          size : file.size
        });
        $('#file_input_public').val('');
      } else
      {
        alert('File "' + file.name + '"" exceeded the limit of 200MB.\n' +
          'We only currently support files up to 200MB for this demo');
      }
    }
    $('#send_file_public')[0].disabled = false;
  });

});
