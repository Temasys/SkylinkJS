SkylinkDemo.on('peerJoined', function(peerId, peerInfo, isSelf) {
  var user = 'You';
  if(!isSelf) {
    user = peerId;//peerInfo ? peerInfo.userData || peerId : peerId;
    var targetItem = document.createElement('option');
    targetItem.id = peerId + '_target';
    targetItem.value = peerId;
    targetItem.innerHTML = 'Send message to ' + user + ' only';
    document.getElementById('target').appendChild(targetItem);
  }
  addMessage(user + ' joined the room', 'action');
});

SkylinkDemo.on('peerLeft', function(peerId, peerInfo, isSelf) {
  var user = 'You';
  if(!isSelf) {
    var peerInfo = SkylinkDemo.getPeerInfo(peerId);
    console.info(peerInfo);
    user = peerInfo ? peerInfo.userData || peerId : peerId;
    document.getElementById('target').removeChild(
    document.getElementById(peerId + '_target'));
  }
  addMessage(user + ' left the room', 'action');
});

SkylinkDemo.on('dataTransferState', function (state, transferId, peerId, transferInfo, error) {
  var displayName = SkylinkDemo.getPeerInfo(peerId).userData;

  switch (state) {
  case SkylinkDemo.DATA_TRANSFER_STATE.UPLOAD_REQUEST :
    var result = confirm('Incoming transfer request!\n\nFile: ' + transferInfo.name +
      '\n\nSize: ' + transferInfo.size + '\n\nAccept?');
    SkylinkDemo.respondBlobRequest(peerId, result);
    break;
  case SkylinkDemo.DATA_TRANSFER_STATE.UPLOAD_STARTED :
    addMessage('You\'ve sent a file: ' + transferInfo.name);
    break;
  case SkylinkDemo.DATA_TRANSFER_STATE.DOWNLOAD_STARTED :
    addFile(transferId, peerId, displayName, transferInfo, false);
    break;
  case SkylinkDemo.DATA_TRANSFER_STATE.UPLOADING :
    var transferStatus = document.getElementById(peerId + '_' + transferId);
    if (transferStatus) {
      transferStatus.innerHTML = (transferInfo.percentage * 100);
      transferStatus.innerHTML += '%';
    } else {
      addFile(transferId, peerId, displayName, transferInfo, true);
    }
    break;
  case SkylinkDemo.DATA_TRANSFER_STATE.DOWNLOADING :
    var transferStatus = document.getElementById(peerId + '_' + transferId);
    transferStatus.innerHTML = (transferInfo.percentage * 100);
    transferStatus.innerHTML += '%';
    break;
  case SkylinkDemo.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED :
    var transferStatus = document.getElementById(peerId + '_' + transferId);
    transferStatus.innerHTML = 'Completed';
    var transferStatus = document.getElementById(transferId);
    transferStatus.href = URL.createObjectURL(transferInfo.data);
    transferStatus.style.display = 'block';
    break;
  case SkylinkDemo.DATA_TRANSFER_STATE.UPLOAD_COMPLETED :
    var transferStatus = document.getElementById(peerId + '_' + transferId);
    transferStatus.innerHTML = 'Completed';
    break;
  case SkylinkDemo.DATA_TRANSFER_STATE.REJECTED :
    alert(displayName + ' has rejected your request.\n\nFile: ' + transferInfo.name +
      '\n\nSize: ' + transferInfo.size);
    break;
  case SkylinkDemo.DATA_TRANSFER_STATE.ERROR :
    addMessage(transferId + ' failed. Reason: \n' +
      error.message);
    var transferStatus = document.getElementById(peerId + '_' + transferId);
    transferStatus.innerHTML = 'Failed';
    break;
  case SkylinkDemo.DATA_TRANSFER_STATE.CANCEL :
    addMessage(transferId + ' canceled. Reason: \n' +
      error.message);
    var transferStatus = document.getElementById(peerId + '_' + transferId);
    transferStatus.innerHTML = 'Canceled';
  }
});

//SkylinkDemo.setUserData('test' + Math.random());
SkylinkDemo.joinRoom();

function sendFile() {
  var target = document.getElementById('target').value;
  //target = 'MCU';
  var files = document.getElementById('file').files;
  SkylinkDemo.sendBlobData(files[0], {
    name: files[0].name,
    size: files[0].size
  }, (target === 'group') ? null : target);
  console.log("Target is: "+target);
}

function addMessage(message, className) {
  var infobox = document.getElementById('infobox'),
  div = document.createElement('div');
  div.className = className;
  div.innerHTML = message;
  infobox.appendChild(div);
}

function addFile(transferId, peerId, displayName, transferInfo, isUpload) {
  var transfers = document.getElementById('transfers'),
  item = document.createElement('tr');
  item.innerHTML = '<td>' + transferId + '</td><td>' +
    ((isUpload) ? '&#8657;' : '&#8659;') + '</td>' +
    '<td>' + displayName + '</td><td>' + transferInfo.name +
    '</td><td><span id="' + peerId + '_' + transferId + '"></span>' +
    ((!isUpload) ? '<a id="' + transferId + '" href="#" download="' +
    transferInfo.name + '" style="display:none">Download</a>' : '') + '</td>';
  transfers.appendChild(item);
}
