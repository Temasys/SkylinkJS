SkywayDemo.on('peerJoined', function(peerId, peerInfo, isSelf) {
  var user = 'You';
  if(!isSelf) {
    user = peerInfo ? peerInfo.userData || peerId : peerId;
    var targetItem = document.createElement('option');
    targetItem.id = peerId + '_target';
    targetItem.value = peerId;
    targetItem.innerHTML = 'Send message to ' + peerInfo.userData + ' only';
    document.getElementById('target').appendChild(targetItem);
  }
  addMessage(user + ' joined the room', 'action');
});

SkywayDemo.on('peerLeft', function(peerId, peerInfo, isSelf) {
  var user = 'You';
  if(!isSelf) {
    var peerInfo = SkywayDemo.getPeerInfo(peerId);
    console.info(peerInfo);
    user = peerInfo ? peerInfo.userData || peerId : peerId;
    document.getElementById('target').removeChild(
    document.getElementById(peerId + '_target'));
  }
  addMessage(user + ' left the room', 'action');
});

SkywayDemo.on('dataTransferState', function (state, transferId, peerId, transferInfo, error) {
  var displayName = SkywayDemo.getPeerInfo(peerId).userData;

  switch (state) {
  case SkywayDemo.DATA_TRANSFER_STATE.UPLOAD_REQUEST :
    var result = confirm('Incoming transfer request!\n\nFile: ' + transferInfo.name +
      '\n\nSize: ' + transferInfo.size + '\n\nAccept?');
    SkywayDemo.respondBlobRequest(peerId, result);
    break;
  case SkywayDemo.DATA_TRANSFER_STATE.UPLOAD_STARTED :
    addMessage('You\'ve sent a file: ' + transferInfo.name);
    break;
  case SkywayDemo.DATA_TRANSFER_STATE.DOWNLOAD_STARTED :
    addFile(transferId, peerId, displayName, transferInfo, false);
    break;
  case SkywayDemo.DATA_TRANSFER_STATE.UPLOADING :
    var transferStatus = document.getElementById(peerId + '_' + transferId);
    if (transferStatus) {
      transferStatus.innerHTML = (transferInfo.percentage * 100);
      transferStatus.innerHTML += '%';
    } else {
      addFile(transferId, peerId, displayName, transferInfo, true);
    }
    break;
  case SkywayDemo.DATA_TRANSFER_STATE.DOWNLOADING :
    var transferStatus = document.getElementById(peerId + '_' + transferId);
    transferStatus.innerHTML = (transferInfo.percentage * 100);
    transferStatus.innerHTML += '%';
    break;
  case SkywayDemo.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED :
    var transferStatus = document.getElementById(peerId + '_' + transferId);
    transferStatus.innerHTML = 'Completed';
    var transferStatus = document.getElementById(transferId);
    transferStatus.href = URL.createObjectURL(transferInfo.data);
    transferStatus.style.display = 'block';
    break;
  case SkywayDemo.DATA_TRANSFER_STATE.UPLOAD_COMPLETED :
    var transferStatus = document.getElementById(peerId + '_' + transferId);
    transferStatus.innerHTML = 'Completed';
    break;
  case SkywayDemo.DATA_TRANSFER_STATE.REJECTED :
    alert(displayName + ' has rejected your request.\n\nFile: ' + transferInfo.name +
      '\n\nSize: ' + transferInfo.size);
    break;
  case SkywayDemo.DATA_TRANSFER_STATE.ERROR :
    addMessage(transferId + ' failed. Reason: \n' +
      error.message);
    var transferStatus = document.getElementById(peerId + '_' + transferId);
    transferStatus.innerHTML = 'Failed';
    break;
  case SkywayDemo.DATA_TRANSFER_STATE.CANCEL :
    addMessage(transferId + ' canceled. Reason: \n' +
      error.message);
    var transferStatus = document.getElementById(peerId + '_' + transferId);
    transferStatus.innerHTML = 'Canceled';
  }
});

SkywayDemo.setUserData('test' + Math.random());
SkywayDemo.joinRoom();

function sendFile() {
  var target = document.getElementById('target').value;
  var files = document.getElementById('file').files;
  SkywayDemo.sendBlobData(files[0], {
    name: files[0].name,
    size: files[0].size
  }, (target === 'group') ? null : target);
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