var room = '';
var SkylinkDemo = new Skylink();

window.onload = function() {
  self = document.getElementById('self') || '';
  peer = document.getElementById('peer') || '';
  //myvideo = document.getElementById('myvideo') || '';
}

JOINED_NOT_CALLING = "User _peer joined room _room";
RECEIVING_CALL = "Ringing. _peer is calling";
IN_CALL = "In call with _peer";
MAKING_CALL = "Calling _peer";
UPDATE_NAME = "You are now identified as _name";
PEER_LEFT = "_peer left the room _room";
JOINING_ROOM = "Joining room _room";

SkylinkDemo.on('peerJoined', function(peerId, peerInfo, isSelf) {
  //return;
  addMessage(JOINED_NOT_CALLING, peerId, SkylinkDemo._room.id);

  if(isSelf) {
    return;
  }

  //Turns on video only when peer joins
  SkylinkDemo.enableVideo();

  if(!document.getElementById(peerId)) {
    var peervid = document.createElement('video');
    peervid.id = peerId;
    if (window.webrtcDetectedBrowser !== 'IE') {
      peervid.autoplay = true;
    }
    document.body.appendChild(peervid);
  }

});

SkylinkDemo.on('peerLeft', function(peerId, peerInfo, isSelf) {
  addMessage("Peer left: " + peerId);

  //return to own room;
  if(isSelf) {
    return;
  }

  vid = document.getElementById(peerId);
  if (!vid){
    console.log('Video '+peerId+' not found');
    return;
  }

  document.body.removeChild(vid);
  enter();
});

SkylinkDemo.on('incomingStream', function(peerId, stream, isSelf, peerInfo) {

  //Already attached on mediaAccessSuccess
  if(isSelf) {
    return;
  };

  var peervid = document.getElementById(peerId);
  attachMediaStream(peervid, stream);
});

//Create own video element and attach stream to it
SkylinkDemo.on('mediaAccessSuccess', function(stream) {
  if(!document.getElementById('myvideo')) {
    var myvid = document.createElement('video');
    myvid.id = 'myvideo';
    if (window.webrtcDetectedBrowser !== 'IE') {
      myvid.autoplay = true;
    }
    document.body.appendChild(myvid);
  }
  var myvid = document.getElementById('myvideo');
  attachMediaStream(myvid, stream);
});

SkylinkDemo.on('incomingMessage', function(message, peerId, peerInfo, isSelf) {
  if(message.content == 'stop') {
    //enter();
  }
});

SkylinkDemo.init(config);

function enter() {
  room = self.value;
  //Join own room. Audio/video disabled by default
  SkylinkDemo.joinRoom(room, {
    audio: false,
    video: false
  });
}

function call() {
  console.log("Called");
  //SkylinkDemo.leaveRoom();

  room = peer.value;

  //Join peer's room & send own video stream
  SkylinkDemo.joinRoom(room, {
    audio: false,
    video: true
  });
}

function stop() {
  console.log("Stopped");
  //Leave current room
  SkylinkDemo.leaveRoom();

  SkylinkDemo.sendMessage('stop');
}

function addMessage(message, peer, room, name) {
  console.log("Added message");
  var mapObj = {
    _peer: peer,
    _room: room,
    _name: name
  }

  message = message.replace(/_peer|_room|_name/gi, function(matched) {
    return mapObj[matched];
  });

  var status = document.getElementById('status');
  div = document.createElement('div');
  div.innerHTML = message;
  status.appendChild(div);
}

function setName() {
  console.log("Set name");
  SkylinkDemo.setUserData(self.value);
  addMessage(UPDATE_NAME, null, null, self.value);
}

function clean() {
  console.log("Cleaned");
  var status = document.getElementById('status');
  while(status.hasChildNodes()) {
    status.removeChild(status.firstChild);
  }
}

function enterAndUpdate() {
  console.log("Updated");
  enter();
  //setName();
}
